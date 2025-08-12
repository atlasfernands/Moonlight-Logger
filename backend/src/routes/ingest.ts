import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { parseRawLogToDoc, type RawLog } from '../logger/parser';
import { LogModel } from '../models/Log';
import { LogAnalysisService } from '../services/logAnalysisService';
import { createQueue } from '../config/redis';

export const ingestRouter = Router();
const analyzeQueue = createQueue('analyze-log');
const analysisService = new LogAnalysisService();

// Rate limit: 100 requests per 15 minutes por IP
const ingestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de autenticação
function auth(req: any): boolean {
  const token = process.env.INGEST_TOKEN;
  if (!token) return true; // Se não configurado, permite acesso
  
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const [scheme, providedToken] = authHeader.split(' ');
  return scheme === 'Bearer' && providedToken === token;
}

// Aplica rate-limit e autenticação
ingestRouter.use(ingestRateLimit);
ingestRouter.use((req, res, next) => {
  if (!auth(req)) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid INGEST_TOKEN required in Authorization header' 
    });
  }
  next();
});

ingestRouter.post('/raw', async (req, res) => {
  try {
    const body = Array.isArray(req.body) ? (req.body as RawLog[]) : ([req.body] as RawLog[]);
    
    if (body.length === 0) {
      return res.status(400).json({ error: 'Empty request body' });
    }
    
    if (body.length > 100) {
      return res.status(400).json({ error: 'Too many logs in single request (max: 100)' });
    }
    
    const docs = body.map(parseRawLogToDoc);
    const created = await LogModel.insertMany(docs);
    
    // Análise heurística imediata + enfileira para IA
    for (const log of created) {
      const analysis = await analysisService.analyzeLog(String(log._id), log.message, log.context || {});
      await LogModel.updateOne(
        { _id: log._id }, 
        { $set: { tags: analysis.tags, suggestion: analysis.suggestion } }
      );
      
      // Enfileira para análise de IA
      await analyzeQueue.add('analyze', { _id: String(log._id) }, { 
        attempts: 2, 
        removeOnComplete: true,
        delay: 1000 // Delay de 1s para não sobrecarregar
      });
    }
    
    // Emite evento Socket.IO
    (req.app as any).get('io')?.emit('log-created', created[0]);
    
    res.status(201).json({ 
      inserted: created.length,
      message: `Successfully ingested ${created.length} log(s)`
    });
    
  } catch (error) {
    console.error('Ingest error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process logs'
    });
  }
});

// Health check para ingestão
ingestRouter.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    auth: !!process.env.INGEST_TOKEN 
  });
});


