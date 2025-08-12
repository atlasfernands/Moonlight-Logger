"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Log_1 = require("../models/Log");
const consoleCapture_1 = require("../services/consoleCapture");
const router = (0, express_1.Router)();
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
        const log = new Log_1.LogModel(logData);
        await log.save();
        // Análise automática em background
        const analysisService = (0, consoleCapture_1.getAnalysisService)();
        if (analysisService) {
            setImmediate(async () => {
                try {
                    const logId = log._id?.toString() || String(log._id);
                    await analysisService.analyzeLog(logId, message, logData.context);
                }
                catch (error) {
                    console.error('Erro na análise automática:', error);
                }
            });
        }
        res.status(201).json(log);
    }
    catch (error) {
        console.error('Erro ao criar log:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// GET /api/logs - Listar logs com filtros
router.get('/', async (req, res) => {
    try {
        const { level, tags, q, from, to, hasSource, page = 1, limit = 50 } = req.query;
        const filters = {};
        if (level)
            filters.level = level;
        if (tags)
            filters.tags = Array.isArray(tags) ? tags : [tags];
        if (q)
            filters.q = q;
        if (from)
            filters.from = new Date(from);
        if (to)
            filters.to = new Date(to);
        if (hasSource === 'true')
            filters.hasSource = true;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        // Construir query de filtros
        const query = {};
        if (level)
            query.level = level;
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            if (tagsArray.length > 0) {
                query.tags = { $in: tagsArray };
            }
        }
        if (q)
            query.$text = { $search: q };
        if (from || to) {
            query.timestamp = {};
            if (from)
                query.timestamp.$gte = new Date(from);
            if (to)
                query.timestamp.$lte = new Date(to);
        }
        if (hasSource === 'true')
            query['context.file'] = { $exists: true, $ne: null };
        // Buscar logs com paginação
        const logs = await Log_1.LogModel.find(query)
            .sort({ timestamp: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        // Conta total para paginação
        const total = await Log_1.LogModel.countDocuments(query);
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
    }
    catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// GET /api/logs/stats - Estatísticas dos logs
router.get('/stats', async (req, res) => {
    try {
        const { from, to, level } = req.query;
        const filters = {};
        if (from)
            filters.from = new Date(from);
        if (to)
            filters.to = new Date(to);
        if (level)
            filters.level = level;
        // Construir query para estatísticas
        const query = {};
        if (from || to) {
            query.timestamp = {};
            if (from)
                query.timestamp.$gte = new Date(from);
            if (to)
                query.timestamp.$lte = new Date(to);
        }
        if (level)
            query.level = level;
        // Agregação para estatísticas por nível
        const stats = await Log_1.LogModel.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$ai.confidence' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        // Calcula totais
        const totalLogs = stats.reduce((sum, stat) => sum + stat.count, 0);
        const byLevel = stats.map((stat) => ({
            level: stat._id,
            count: stat.count,
            percentage: totalLogs > 0 ? (stat.count / totalLogs) * 100 : 0,
            avgConfidence: stat.avgConfidence || 0
        }));
        // Timeline dos últimos 24h
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const timeline = await Log_1.LogModel.aggregate([
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
            timeline: timeline.map((hour) => ({
                time: hour._id,
                info: hour.levels.find((l) => l.level === 'info')?.count || 0,
                warn: hour.levels.find((l) => l.level === 'warn')?.count || 0,
                error: hour.levels.find((l) => l.level === 'error')?.count || 0,
                debug: hour.levels.find((l) => l.level === 'debug')?.count || 0
            }))
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// POST /api/logs/:id/analyze - Reanalisar log específico
router.post('/:id/analyze', async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log_1.LogModel.findById(id);
        if (!log) {
            return res.status(404).json({ error: 'Log não encontrado' });
        }
        const analysisService = (0, consoleCapture_1.getAnalysisService)();
        if (!analysisService) {
            return res.status(503).json({ error: 'Serviço de análise não disponível' });
        }
        const analysis = await analysisService.analyzeLog(id, log.message, log.context);
        res.json({ analysis });
    }
    catch (error) {
        console.error('Erro ao reanalisar log:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// GET /api/logs/:id - Buscar log específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const log = await Log_1.LogModel.findById(id);
        if (!log) {
            return res.status(404).json({ error: 'Log não encontrado' });
        }
        res.json(log);
    }
    catch (error) {
        console.error('Erro ao buscar log:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// DELETE /api/logs/:id - Deletar log
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Log_1.LogModel.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: 'Log não encontrado' });
        }
        res.json({ message: 'Log deletado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar log:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=logs.js.map