import { Router } from 'express';
import { LogModel } from '../models/Log';
import { getAnalysisService } from '../services/consoleCapture';

const router = Router();

// POST /api/logs - Criar novo log
router.post('/', async (req, res) => {
  try {
    const { level, message, tags, context } = req.body;
    
    if (!level || !message) {
      return res.status(400).json({ 
        error: 'level e message são obrigatórios' 
      });
    }

    const logData = {
      level,
      message,
      timestamp: new Date(),
      tags: tags || [],
      context: {
        origin: context?.origin || 'api',
        pid: context?.pid || process.pid,
        ...(context?.file && { file: context.file }),
        ...(context?.line && { line: context.line }),
        ...(context?.column && { column: context.column }),
        ...(context?.stack && { stack: context.stack })
      }
    };

    const log = new LogModel(logData);
    await log.save();

    // Análise automática em background
    const analysisService = getAnalysisService();
    if (analysisService) {
      setImmediate(async () => {
        try {
          await analysisService.analyzeLog(log._id.toString(), message, logData.context);
        } catch (error) {
          console.error('Erro na análise automática:', error);
        }
      });
    }

    res.status(201).json(log);
  } catch (error) {
    console.error('Erro ao criar log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/logs - Listar logs com filtros
router.get('/', async (req, res) => {
  try {
    const {
      level,
      tags,
      q,
      from,
      to,
      hasSource,
      page = 1,
      limit = 50
    } = req.query;

    const filters: any = {};
    
    if (level) filters.level = level;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (q) filters.q = q;
    if (from) filters.from = new Date(from as string);
    if (to) filters.to = new Date(to as string);
    if (hasSource === 'true') filters.hasSource = true;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    // Usa o método estático do modelo para filtros avançados
    const logs = await LogModel.findWithFilters({
      ...filters,
      page: pageNum,
      limit: limitNum
    });

    // Conta total para paginação
    const totalQuery: any = {};
    if (level) totalQuery.level = level;
    if (tags && tags.length > 0) totalQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (q) totalQuery.$text = { $search: q };
    if (from || to) {
      totalQuery.timestamp = {};
      if (from) totalQuery.timestamp.$gte = new Date(from as string);
      if (to) totalQuery.timestamp.$lte = new Date(to as string);
    }
    if (hasSource === 'true') totalQuery['context.file'] = { $exists: true, $ne: null };

    const total = await LogModel.countDocuments(totalQuery);
    const pages = Math.ceil(total / limitNum);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/logs/stats - Estatísticas dos logs
router.get('/stats', async (req, res) => {
  try {
    const { from, to, level } = req.query;
    
    const filters: any = {};
    if (from) filters.from = new Date(from as string);
    if (to) filters.to = new Date(to as string);
    if (level) filters.level = level;

    // Usa o método estático para estatísticas
    const stats = await LogModel.getStats(filters);
    
    // Calcula totais
    const totalLogs = stats.reduce((sum, stat) => sum + stat.count, 0);
    const byLevel = stats.map(stat => ({
      level: stat._id,
      count: stat.count,
      percentage: totalLogs > 0 ? (stat.count / totalLogs) * 100 : 0,
      avgConfidence: stat.avgConfidence || 0
    }));

    // Timeline dos últimos 24h
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const timeline = await LogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: yesterday }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            level: '$level'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.hour',
          levels: {
            $push: {
              level: '$_id.level',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total: totalLogs,
      byLevel,
      timeline: timeline.map(hour => ({
        time: hour._id,
        info: hour.levels.find(l => l.level === 'info')?.count || 0,
        warn: hour.levels.find(l => l.level === 'warn')?.count || 0,
        error: hour.levels.find(l => l.level === 'error')?.count || 0,
        debug: hour.levels.find(l => l.level === 'debug')?.count || 0
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/logs/:id/analyze - Reanalisar log específico
router.post('/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const log = await LogModel.findById(id);
    
    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    const analysisService = getAnalysisService();
    if (!analysisService) {
      return res.status(503).json({ error: 'Serviço de análise não disponível' });
    }

    const analysis = await analysisService.analyzeLog(
      id,
      log.message,
      log.context
    );

    res.json({ analysis });
  } catch (error) {
    console.error('Erro ao reanalisar log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/logs/:id - Buscar log específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = await LogModel.findById(id);
    
    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json(log);
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/logs/:id - Deletar log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LogModel.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json({ message: 'Log deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

