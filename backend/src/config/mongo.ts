import mongoose from 'mongoose';
import { env } from './env';

export const mongoStatus = {
  connected: false,
  lastError: undefined as undefined | string,
};

function attachListeners() {
  mongoose.connection.on('connected', () => {
    mongoStatus.connected = true;
    mongoStatus.lastError = undefined;
    console.log('[mongo] conectado');
  });
  mongoose.connection.on('disconnected', () => {
    mongoStatus.connected = false;
    console.warn('[mongo] desconectado');
  });
  mongoose.connection.on('error', (error) => {
    mongoStatus.connected = false;
    mongoStatus.lastError = String(error?.message ?? error);
    console.error('[mongo] erro', error);
  });
}

let started = false;
export function initMongoWithRetry(retryMs: number = 5000): void {
  if (started) return;
  started = true;
  attachListeners();

  const mongoUri = env.mongoUri;
  const tryConnect = async () => {
    try {
      await mongoose.connect(mongoUri);
    } catch (err) {
      mongoStatus.connected = false;
      mongoStatus.lastError = String((err as any)?.message ?? err);
      console.warn(`[mongo] conexão falhou, tentando novamente em ${retryMs}ms`);
      setTimeout(tryConnect, retryMs);
    }
  };
  void tryConnect();
}

