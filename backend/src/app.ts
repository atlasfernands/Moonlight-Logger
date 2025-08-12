import express from 'express';
import cors from 'cors';
import logsRouter from './routes/logs';
import { statsRouter } from './routes/stats';
import { ingestRouter } from './routes/ingest';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/logs', logsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/ingest', ingestRouter);

  return app;
}

