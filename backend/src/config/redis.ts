import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env';
import { finalConfig } from './app';

// Configuração híbrida: offline-first com escalabilidade automática
let redisConnection: IORedis | null = null;
let redisStatus = {
  connected: false,
  lastError: undefined as string | undefined,
  retryCount: 0,
  maxRetries: 3,
  isOfflineMode: false,
  lastRetryTime: 0,
  // Novos campos para controle inteligente
  isAutoScaled: false,
  dataVolume: 0,
  thresholdForScaling: 1000, // Escala quando passar de 1000 logs
  lastScaleCheck: 0
};

if (!finalConfig.scaling.redisEnabled) {
  redisStatus.isOfflineMode = true;
}

// Controle de reconexão para evitar loops infinitos
let reconnectTimeout: NodeJS.Timeout | null = null;
let isReconnecting = false;

// Sistema de cache local para modo offline
const localCache = new Map<string, any>();
const localQueue = new Map<string, any[]>();
const localWorkers = new Map<string, Function>();

function createRedisConnection(): IORedis | null {
  try {
    if (!finalConfig.scaling.redisEnabled) {
      console.log('🔧 [redis] Redis desativado pela configuração');
      return null;
    }

    // Se já estiver em modo offline, não tenta conectar
    if (redisStatus.isOfflineMode) {
      console.log('🔧 [redis] Modo offline ativo - não tentando conectar');
      return null;
    }

    // Configurações baseadas no artigo Redis - Keys para evitar loops infinitos
    const connection = new IORedis(env.redisUrl, {
      // Desabilita COMPLETAMENTE reconexão automática
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
      enableReadyCheck: true,
      retryDelayOnFailover: 0,
      maxRetriesPerRequest: 0,
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
      
      // Em desenvolvimento, entra em modo offline após algumas tentativas
      if (env.nodeEnv === 'development' && redisStatus.retryCount >= redisStatus.maxRetries) {
        if (!redisStatus.isOfflineMode) {
          redisStatus.isOfflineMode = true;
          console.log('🔧 [redis] Modo offline ativado - parando tentativas de reconexão');
          console.log('💡 Para conectar Redis: docker run -d -p 6379:6379 redis:alpine');
          
          // Força desconexão para parar tentativas automáticas
          try {
            connection.disconnect();
          } catch (e) {
            // Ignora erros de desconexão
          }
        }
        return;
      }
      
      // Tenta reconectar apenas se não estiver em modo offline
      if (!redisStatus.isOfflineMode && !isReconnecting) {
        scheduleReconnect();
      }
    });

    connection.on('connect', () => {
      redisStatus.connected = true;
      redisStatus.lastError = undefined;
      redisStatus.retryCount = 0;
      redisStatus.isOfflineMode = false;
      isReconnecting = false;
      console.log('✅ [redis] Conectado com sucesso');
    });

    connection.on('ready', () => {
      console.log('🚀 [redis] Pronto para operações');
    });

    connection.on('close', () => {
      redisStatus.connected = false;
      console.warn('⚠️ [redis] Conexão fechada');
      
      // Não tenta reconectar automaticamente se estiver em modo offline
      if (!redisStatus.isOfflineMode && !isReconnecting) {
        scheduleReconnect();
      }
    });

    connection.on('reconnecting', () => {
      if (!isReconnecting) {
        isReconnecting = true;
        console.log('🔄 [redis] Reconectando...');
      }
    });

    return connection;
  } catch (error) {
    console.warn('[redis] Falha ao inicializar Redis:', error);
    if (env.nodeEnv === 'development') {
      console.log('🔧 [redis] Modo desenvolvimento: continuando sem Redis');
    }
    return null;
  }
}

// Função para agendar reconexão com controle inteligente
function scheduleReconnect(): void {
  if (isReconnecting || redisStatus.isOfflineMode) {
    return;
  }

  redisStatus.retryCount++;
  const now = Date.now();
  
  // Evita tentativas muito frequentes
  if (now - redisStatus.lastRetryTime < 2000) {
    return;
  }
  
  redisStatus.lastRetryTime = now;
  
  if (redisStatus.retryCount > redisStatus.maxRetries) {
    if (env.nodeEnv === 'development') {
      redisStatus.isOfflineMode = true;
      console.log('🔧 [redis] Modo offline ativado após máximo de tentativas');
      console.log('💡 Para conectar Redis: docker run -d -p 6379:6379 redis:alpine');
      
      // Força desconexão da conexão atual
      if (redisConnection) {
        try {
          redisConnection.disconnect();
          redisConnection = null;
        } catch (e) {
          // Ignora erros de desconexão
        }
      }
    } else {
      console.error('💥 [redis] Máximo de tentativas de reconexão atingido');
    }
    return;
  }

  const delay = Math.min(1000 * Math.pow(2, redisStatus.retryCount - 1), 10000); // Backoff exponencial
  
  console.log(`🔄 [redis] Tentativa ${redisStatus.retryCount}/${redisStatus.maxRetries} em ${delay}ms`);
  
  reconnectTimeout = setTimeout(() => {
    if (!redisStatus.isOfflineMode) {
      try {
        redisConnection = createRedisConnection();
      } catch (error) {
        console.error('❌ [redis] Falha ao reconectar:', error);
      }
    }
  }, delay);
}

// Função para verificar se precisa escalar baseado no volume de dados
function shouldScaleUp(): boolean {
  if (!finalConfig.scaling.redisEnabled || !finalConfig.scaling.autoScale) {
    return false;
  }

  const now = Date.now();
  
  // Verifica a cada 5 minutos
  if (now - redisStatus.lastScaleCheck < 300000) {
    return redisStatus.isAutoScaled;
  }
  
  redisStatus.lastScaleCheck = now;
  
  // Se o volume de dados é alto, ativa escalabilidade
  if (redisStatus.dataVolume > redisStatus.thresholdForScaling && !redisStatus.isAutoScaled) {
    console.log(`📊 [redis] Volume de dados alto (${redisStatus.dataVolume}), ativando escalabilidade`);
    redisStatus.isAutoScaled = true;
    return true;
  }
  
  // Se o volume baixou, desativa escalabilidade
  if (redisStatus.dataVolume < redisStatus.thresholdForScaling / 2 && redisStatus.isAutoScaled) {
    console.log(`📊 [redis] Volume de dados baixo (${redisStatus.dataVolume}), desativando escalabilidade`);
    redisStatus.isAutoScaled = false;
    return false;
  }
  
  return redisStatus.isAutoScaled;
}

// Função para registrar volume de dados
export function recordDataVolume(volume: number): void {
  if (!finalConfig.scaling.redisEnabled) {
    return;
  }

  redisStatus.dataVolume = volume;
  
  // Se precisa escalar e tem Redis disponível, tenta conectar
  if (shouldScaleUp() && !redisStatus.connected && !redisStatus.isOfflineMode) {
    console.log('🚀 [redis] Tentando conectar para escalabilidade automática...');
    redisConnection = createRedisConnection();
  }
}

// Inicializa conexão apenas se não estiver em modo offline
if (!redisStatus.isOfflineMode && finalConfig.scaling.redisEnabled) {
  redisConnection = createRedisConnection();
}

export { redisConnection, redisStatus };

// Implementação de fallback para desenvolvimento sem Redis
class HybridQueue<T = any> {
  private name: string;
  private jobs: T[] = [];
  private useRedis: boolean;

  constructor(name: string) {
    this.name = name;
    this.useRedis = shouldScaleUp() && redisStatus.connected;
    
    if (this.useRedis) {
      console.log(`🚀 [redis] Fila ${name} usando Redis para escalabilidade`);
    } else {
      console.log(`🔧 [local] Fila ${name} usando armazenamento local`);
    }
  }

  async add(name: string, data: any) {
    const job = { id: Date.now(), name, data, timestamp: new Date() };
    
    if (this.useRedis && redisConnection) {
      try {
        // Tenta usar Redis se disponível
        const queue = new Queue(this.name, { 
          connection: redisConnection as unknown as any,
          defaultJobOptions: {
            removeOnComplete: 10 as any,
            removeOnFail: 5 as any,
            attempts: 3
          }
        });
        await queue.add(name, data);
        await queue.close();
        return job;
      } catch (error: any) {
        console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
        this.useRedis = false;
      }
    }
    
    // Fallback para local
    this.jobs.push(job as T);
    console.log(`🔧 [local] Job adicionado à fila ${this.name}:`, name);
    return job;
  }

  async getJob(id: string | number) {
    if (this.useRedis && redisConnection) {
      try {
        const queue = new Queue(this.name, { 
          connection: redisConnection as unknown as any 
        });
        const job = await queue.getJob(id as string);
        await queue.close();
        return job;
      } catch (error: any) {
        console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
        this.useRedis = false;
      }
    }
    
    return this.jobs.find(job => (job as any).id === id) || null;
  }

  async getJobs() {
    if (this.useRedis && redisConnection) {
      try {
        const queue = new Queue(this.name, { 
          connection: redisConnection as unknown as any 
        });
        const jobs = await queue.getJobs();
        await queue.close();
        return jobs;
      } catch (error: any) {
        console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
        this.useRedis = false;
      }
    }
    
    return this.jobs;
  }

  async clean() {
    if (this.useRedis && redisConnection) {
      try {
        const queue = new Queue(this.name, { 
          connection: redisConnection as unknown as any 
        });
        await queue.clean(0, 'active' as any);
        await queue.clean(0, 'wait' as any);
        await queue.clean(0, 'delayed' as any);
        await queue.clean(0, 'failed' as any);
        await queue.clean(0, 'completed' as any);
        await queue.close();
        console.log(`🚀 [redis] Fila ${this.name} limpa no Redis`);
        return;
      } catch (error: any) {
        console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
        this.useRedis = false;
      }
    }
    
    this.jobs = [];
    console.log(`🔧 [local] Fila ${this.name} limpa localmente`);
  }
}

class HybridWorker<T = any> {
  private name: string;
  private processor: (job: any) => Promise<void>;
  private useRedis: boolean;

  constructor(name: string, processor: (job: any) => Promise<void>) {
    this.name = name;
    this.processor = processor;
    this.useRedis = shouldScaleUp() && redisStatus.connected;
    
    if (this.useRedis) {
      console.log(`🚀 [redis] Worker ${name} usando Redis para escalabilidade`);
    } else {
      console.log(`🔧 [local] Worker ${name} usando processamento local`);
    }
  }

  async process() {
    if (this.useRedis && redisConnection) {
      try {
        const worker = new Worker(this.name, this.processor, { 
          connection: redisConnection as unknown as any,
          concurrency: 2
        });
        
        worker.on('completed', (job: any) => {
          if (job?.id) {
            console.log(`🚀 [redis] Job ${job.id} processado com sucesso`);
          }
        });
        
        worker.on('failed', (job: any, err: any) => {
          if (job?.id) {
            console.error(`🚀 [redis] Job ${job.id} falhou:`, err?.message || 'Erro desconhecido');
          }
        });
        
        console.log(`🚀 [redis] Worker ${this.name} processando com Redis`);
        return worker;
      } catch (error: any) {
        console.warn(`⚠️ [redis] Fallback para local: ${error?.message || 'Erro desconhecido'}`);
        this.useRedis = false;
      }
    }
    
    console.log(`🔧 [local] Worker ${this.name} processando localmente`);
    return null;
  }

  async close() {
    if (this.useRedis) {
      console.log(`🚀 [redis] Worker ${this.name} fechado no Redis`);
    } else {
      console.log(`🔧 [local] Worker ${this.name} fechado localmente`);
    }
  }
}

export function createQueue(name: string): Queue | HybridQueue {
  try {
    // Se estiver em modo offline ou sem conexão, usa híbrido
    if (redisStatus.isOfflineMode || !redisConnection) {
      console.log(`🔧 [local] Criando fila ${name} em modo offline`);
      return new HybridQueue(name);
    }
    
    if (!redisStatus.connected) {
      console.warn(`⚠️ [local] Criando fila ${name} sem conexão Redis`);
      return new HybridQueue(name);
    }
    
    // Verifica se precisa escalar
    if (shouldScaleUp()) {
      console.log(`🚀 [redis] Criando fila ${name} com escalabilidade automática`);
      return new HybridQueue(name);
    }
    
    // Modo local para volumes baixos
    console.log(`🔧 [local] Criando fila ${name} em modo local (volume baixo)`);
    return new HybridQueue(name);
    
  } catch (error) {
    console.warn(`❌ [redis] Falha ao criar fila ${name}:`, error);
    return new HybridQueue(name);
  }
}

export function createWorker<T = unknown>(
  name: string,
  processor: (job: import('bullmq').Job<T>) => Promise<void>
): Worker<T> | HybridWorker<T> {
  try {
    // Se estiver em modo offline ou sem conexão, usa híbrido
    if (redisStatus.isOfflineMode || !redisConnection) {
      console.log(`🔧 [local] Criando worker ${name} em modo offline`);
      return new HybridWorker(name, processor as any);
    }
    
    if (!redisStatus.connected) {
      console.warn(`⚠️ [local] Criando worker ${name} sem conexão Redis`);
      return new HybridWorker(name, processor as any);
    }
    
    // Verifica se precisa escalar
    if (shouldScaleUp()) {
      console.log(`🚀 [redis] Criando worker ${name} com escalabilidade automática`);
      return new HybridWorker(name, processor as any);
    }
    
    // Modo local para volumes baixos
    console.log(`🔧 [local] Criando worker ${name} em modo local (volume baixo)`);
    return new HybridWorker(name, processor as any);
    
  } catch (error) {
    console.warn(`❌ [redis] Falha ao criar worker ${name}:`, error);
    return new HybridWorker(name, processor as any);
  }
}

// Função para verificar status do Redis
export function getRedisStatus() {
  return {
    ...redisStatus,
    readyState: redisConnection?.status || 'disconnected',
    canReconnect: !redisStatus.isOfflineMode && redisStatus.retryCount < redisStatus.maxRetries,
    scalingMode: shouldScaleUp() ? 'auto' : 'manual',
    dataVolume: redisStatus.dataVolume,
    threshold: redisStatus.thresholdForScaling
  };
}

// Função para reconectar Redis manualmente
export async function reconnectRedis(): Promise<void> {
  try {
    if (redisConnection?.status === 'ready') {
      console.log('ℹ️ [redis] Já conectado');
      return;
    }
    
    if (redisStatus.isOfflineMode) {
      console.log('🔧 [redis] Saindo do modo offline...');
      redisStatus.isOfflineMode = false;
      redisStatus.retryCount = 0;
    }
    
    // Limpa timeout de reconexão se existir
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    console.log('🔄 [redis] Tentando reconectar manualmente...');
    
    // Desconecta conexão atual se existir
    if (redisConnection) {
      try {
        await redisConnection.disconnect();
      } catch (e) {
        // Ignora erros de desconexão
      }
    }
    
    redisConnection = createRedisConnection();
  } catch (error) {
    console.error('❌ [redis] Erro ao reconectar:', error);
  }
}

// Função para forçar modo offline
export function forceOfflineMode(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  redisStatus.isOfflineMode = true;
  redisStatus.retryCount = redisStatus.maxRetries;
  isReconnecting = false;
  
  // Força desconexão da conexão atual
  if (redisConnection) {
    try {
      redisConnection.disconnect();
      redisConnection = null;
    } catch (e) {
      // Ignora erros de desconexão
    }
  }
  
  console.log('🔧 [redis] Modo offline forçado');
}

// Função para resetar status e tentar reconectar
export function resetRedisStatus(): void {
  redisStatus.retryCount = 0;
  redisStatus.isOfflineMode = false;
  redisStatus.lastError = undefined;
  isReconnecting = false;
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  console.log('🔄 [redis] Status resetado, tentando reconectar...');
  
  // Cria nova conexão
  redisConnection = createRedisConnection();
}

// Função para configurar threshold de escalabilidade
export function setScalingThreshold(threshold: number): void {
  redisStatus.thresholdForScaling = threshold;
  console.log(`⚙️ [redis] Threshold de escalabilidade definido para ${threshold}`);
}

// Função para forçar modo de escalabilidade
export function forceScalingMode(enable: boolean): void {
  redisStatus.isAutoScaled = enable;
  console.log(`⚙️ [redis] Modo de escalabilidade ${enable ? 'ativado' : 'desativado'} manualmente`);
}
