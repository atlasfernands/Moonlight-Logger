import { createWorker } from '../config/redis';
import { LogModel } from '../models/Log';
import { selectProvider } from '../services/ai/providers';

createWorker<{ _id: string }>('analyze-log', async (job) => {
  const log = await LogModel.findById(job.data._id);
  if (!log) return;
  const provider = selectProvider(process.env.AI_PROVIDER);
  const ai = await provider.analyze(log);
  await LogModel.updateOne({ _id: log._id }, { $set: { ai: { ...ai, at: new Date() } } });
});


