import express from 'express';
import cors from 'cors';
import { logsRouter } from './routes/logs';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/logs', logsRouter);

  return app;
}

