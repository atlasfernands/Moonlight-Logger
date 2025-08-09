import mongoose from 'mongoose';
import { env } from './env';

export async function connectToMongo(): Promise<void> {
  const mongoUri = env.mongoUri;
  await mongoose.connect(mongoUri);
  mongoose.connection.on('connected', () => {
    console.log('[mongo] conectado');
  });
  mongoose.connection.on('error', (error) => {
    console.error('[mongo] erro', error);
  });
}

