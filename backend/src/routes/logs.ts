import { Router } from 'express';
import { LogModel, type LogLevel } from '../models/Log';
import { mongoStatus } from '../config/mongo';
import { analyzeLog } from '../services/logAnalysisService';

export const logsRouter = Router();

logsRouter.post('/', async (req, res) => {
  const { level = 'info', message, context } = req.body ?? {};
  if (!message) return res.status(400).json({ error: 'message é obrigatório' });
  const normalizedLevel = String(level).toLowerCase() as LogLevel;
  const validLevels: LogLevel[] = ['info', 'warn', 'error', 'debug'];
  if (!validLevels.includes(normalizedLevel)) {
    return res.status(400).json({ error: 'level inválido' });
  }
  const analysis = analyzeLog(String(message));
  const created = await LogModel.create({
    level: normalizedLevel,
    message,
    context,
    tags: analysis.tags,
    suggestion: analysis.suggestion,
  });
  try {
    const io = (req.app as any).get('io') as import('socket.io').Server | undefined;
    io?.emit('log-created', created);
  } catch {}
  res.status(201).json(created);
});

logsRouter.get('/', async (req, res) => {
  if (!mongoStatus.connected) return res.status(503).json({ error: 'mongo_offline' });
  const { level, tag, q, limit = '50', page = '1', from, to, paginate } = req.query as Record<string, string>;
  const query: Record<string, any> = {};
  if (level) query.level = level;
  if (tag) query.tags = tag;
  if (q) query.message = { $regex: q, $options: 'i' };
  if (from || to) {
    query.timestamp = {} as any;
    if (from) (query.timestamp as any).$gte = new Date(from);
    if (to) (query.timestamp as any).$lte = new Date(to);
  }

  const limitNumber = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const pageNumber = Math.max(Number(page) || 1, 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [items, total] = await Promise.all([
    LogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNumber),
    LogModel.countDocuments(query),
  ]);

  if (String(paginate).toLowerCase() === 'true') {
    const pages = Math.max(Math.ceil(total / limitNumber), 1);
    return res.json({ items, pageInfo: { total, page: pageNumber, pages, limit: limitNumber } });
  }
  res.json(items);
});

