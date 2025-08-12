import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env';

// Configuração mais robusta para desenvolvimento e produção
let redisConnection: IORedis;
let redisStatus = {
  connected: false,
  lastError: undefined as string | undefined,
  retryCount: 0,
  maxRetries: 3
};

function createRedisConnection(): IORedis {
  try {
    const connection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      // Configurações específicas para produção
      ...(env.nodeEnv === 'production' && {
        maxRetriesPerRequest: 5,
        connectTimeout: 10000,
        commandTimeout: 10000,
        retryDelayOnFailover: 200
      })
    });

    connection.on('error', (error) => {
      redisStatus.connected = false;
      redisStatus.lastError = error.message;
      console.warn('⚠️ [redis] Erro de conexão:', error.message);
      
      if (env.nodeEnv === 'development') {
        console.log('🔧 [redis] Modo desenvolvimento: continuando sem Redis');
        console.log('💡 Para conectar Redis: docker run -d -p 6379:6379 redis:alpine');
      }
    });

    connection.on('connect', () => {
      redisStatus.connected = true;
      redisStatus.lastError = undefined;
      redisStatus.retryCount = 0;
      console.log('✅ [redis] Conectado com sucesso');
    });

    connection.on('ready', () => {
      console.log('🚀 [redis] Pronto para operações');
    });

    connection.on('close', () => {
      redisStatus.connected = false;
      console.warn('⚠️ [redis] Conexão fechada');
    });

    connection.on('reconnecting', () => {
      console.log('🔄 [redis] Reconectando...');
    });

    return connection;
  } catch (error) {
    console.warn('[redis] Falha ao inicializar Redis:', error);
    if (env.nodeEnv === 'development') {
      console.log('🔧 [redis] Modo desenvolvimento: continuando sem Redis');
    }
    // Retorna uma conexão mock para desenvolvimento
    return {} as any;
  }
}

redisConnection = createRedisConnection();

export { redisConnection, redisStatus };

export function createQueue(name: string): Queue {
  try {
    if (!redisStatus.connected) {
      console.warn(`⚠️ [redis] Criando fila ${name} sem conexão Redis`);
    }
    
    return new Queue(name, { 
      connection: redisConnection as unknown as any,
      defaultJobOptions: {
        removeOnComplete: 10 as any,
        removeOnFail: 5 as any,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });
  } catch (error) {
    console.warn(`❌ [redis] Falha ao criar fila ${name}:`, error);
    // Retorna uma fila mock para desenvolvimento
    return new Queue(name, { 
      connection: {} as any,
      defaultJobOptions: {
        removeOnComplete: 10 as any,
        removeOnFail: 5 as any,
        attempts: 1
      }
    });
  }
}

export function createWorker<T = unknown>(
  name: string,
  processor: (job: import('bullmq').Job<T>) => Promise<void>
): Worker<T> {
  try {
    if (!redisStatus.connected) {
      console.warn(`⚠️ [redis] Criando worker ${name} sem conexão Redis`);
    }
    
    return new Worker<T>(name, processor, { 
      connection: redisConnection as unknown as any,
      concurrency: env.nodeEnv === 'production' ? 5 : 2,
      removeOnComplete: 10 as any,
      removeOnFail: 5 as any
    });
  } catch (error) {
    console.warn(`❌ [redis] Falha ao criar worker ${name}:`, error);
    // Retorna um worker mock para desenvolvimento
    return new Worker<T>(name, processor, { 
      connection: {} as any,
      concurrency: 1
    });
  }
}

// Função para verificar status do Redis
export function getRedisStatus() {
  return {
    ...redisStatus,
    readyState: redisConnection?.status || 'disconnected'
  };
}

// Função para reconectar Redis
export async function reconnectRedis(): Promise<void> {
  try {
    if (redisConnection?.status === 'ready') {
      console.log('ℹ️ [redis] Já conectado');
      return;
    }
    
    console.log('🔄 [redis] Tentando reconectar...');
    await redisConnection?.disconnect();
    redisConnection = createRedisConnection();
  } catch (error) {
    console.error('❌ [redis] Erro ao reconectar:', error);
  }
}

