import { Router } from 'express';
import { parseRawLogToDoc, type RawLog } from '../logger/parser';
import { LogModel } from '../models/Log';
import { analyzeLog } from '../services/logAnalysisService';
import { createQueue } from '../config/redis';

export const ingestRouter = Router();
const analyzeQueue = createQueue('analyze-log');

function auth(req: any): boolean {
  const token = process.env.INGEST_TOKEN;
  if (!token) return true;
  const hdr = req.headers.authorization ?? '';
  return hdr === `Bearer ${token}`;
}

ingestRouter.post('/raw', async (req, res) => {
  if (!auth(req)) return res.status(401).json({ error: 'unauthorized' });
  const body = Array.isArray(req.body) ? (req.body as RawLog[]) : ([req.body] as RawLog[]);
  const docs = body.map(parseRawLogToDoc);
  const created = await LogModel.insertMany(docs);
  // análise heurística imediata (tags/suggestion) + enfileira IA
  for (const log of created) {
    const a = analyzeLog(log.message);
    await LogModel.updateOne({ _id: log._id }, { $set: { tags: a.tags, suggestion: a.suggestion } });
    await analyzeQueue.add('analyze', { _id: String(log._id) }, { attempts: 2, removeOnComplete: true });
  }
  (req.app as any).get('io')?.emit('log-created', created[0]);
  res.status(201).json({ inserted: created.length });
});


