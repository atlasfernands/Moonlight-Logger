import Redis from 'ioredis';
import { EventEmitter } from 'events';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  enableOfflineQueue: boolean;
  lazyConnect: boolean;
  connectTimeout: number;
  commandTimeout: number;
  keepAlive: number;
  tls: boolean;
  maxMemoryPolicy: string;
  maxMemoryBytes: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: string;
  connected: boolean;
  lastError?: string;
}

export class CacheService extends EventEmitter {
  private redis!: Redis;
  private config: CacheConfig;
  private stats: CacheStats;
  private isConnected: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      host: 'localhost',
      port: 6379,
      db: 0,
      keyPrefix: 'moonlight:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 30000,
      tls: false,
      maxMemoryPolicy: 'allkeys-lru',
      maxMemoryBytes: 100 * 1024 * 1024, // 100MB
      ...config
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      memory: '0',
      connected: false
    };
    
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      const redisOptions: any = {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        enableOfflineQueue: this.config.enableOfflineQueue,
        lazyConnect: this.config.lazyConnect,
        connectTimeout: this.config.connectTimeout,
        commandTimeout: this.config.commandTimeout,
        keepAlive: this.config.keepAlive
      };

      if (this.config.password) {
        redisOptions.password = this.config.password;
      }

      if (this.config.tls) {
        redisOptions.tls = {};
      }

      this.redis = new Redis(redisOptions);
      
      this.setupEventHandlers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao inicializar Redis:', errorMessage);
      this.emit('error', error);
    }
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      this.stats.connected = true;
      this.emit('connected');
      console.log('✅ Conectado ao Redis');
    });

    this.redis.on('ready', () => {
      this.emit('ready');
      console.log('🚀 Redis pronto para uso');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      this.stats.connected = false;
      this.stats.lastError = error.message;
      this.emit('error', error);
      console.error('❌ Erro no Redis:', error.message);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      this.stats.connected = false;
      this.emit('disconnected');
      console.log('🔌 Conexão Redis fechada');
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...');
    });
  }

  private async configureRedis(): Promise<void> {
    try {
      // Configura políticas de memória
      await this.redis.config('SET', 'maxmemory-policy', this.config.maxMemoryPolicy);
      await this.redis.config('SET', 'maxmemory', this.config.maxMemoryBytes.toString());
      
      console.log('⚙️ Redis configurado com otimizações');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Não foi possível configurar Redis:', errorMessage);
    }
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
      await this.configureRedis();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Falha ao conectar ao Redis:', errorMessage);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao desconectar Redis:', errorMessage);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao buscar cache:', errorMessage);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao definir cache:', errorMessage);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao deletar cache:', errorMessage);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao verificar existência:', errorMessage);
      return false;
    }
  }

  async setWithSmartTTL(key: string, value: any, type: 'log' | 'analysis' | 'stats' | 'config'): Promise<void> {
    const ttlMap = {
      log: 3600,        // 1 hora para logs
      analysis: 7200,   // 2 horas para análises
      stats: 1800,      // 30 minutos para estatísticas
      config: 86400     // 24 horas para configurações
    };
    
    await this.set(key, value, ttlMap[type]);
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao buscar cache em lote:', errorMessage);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setex(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });
      
      await pipeline.exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao definir cache em lote:', errorMessage);
    }
  }

  async setWithTags(key: string, value: any, tags: string[], ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      
      // Armazena tags para invalidação posterior
      const tagKey = `${key}:tags`;
      await this.redis.sadd(tagKey, ...tags);
      
      if (ttl) {
        await this.redis.expire(tagKey, ttl);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao definir cache com tags:', errorMessage);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const pattern = `*:tags`;
      const keys = await this.redis.keys(pattern);
      
      for (const key of keys) {
        const tags = await this.redis.smembers(key);
        if (tags.includes(tag)) {
          const actualKey = key.replace(':tags', '');
          await this.redis.del(actualKey);
          await this.redis.del(key);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao invalidar cache por tag:', errorMessage);
    }
  }

  async incrementCounter(key: string, increment: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, increment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao incrementar contador:', errorMessage);
      return 0;
    }
  }

  async getCounter(key: string): Promise<number> {
    try {
      const value = await this.redis.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao buscar contador:', errorMessage);
      return 0;
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Limpeza automática de chaves expiradas
      const keys = await this.redis.keys('*');
      let cleaned = 0;
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -2) { // Chave expirada
          await this.redis.del(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Limpeza automática: ${cleaned} chaves removidas`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro na limpeza automática:', errorMessage);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      
      if (memoryMatch && memoryMatch[1]) {
        this.stats.memory = memoryMatch[1];
      }
      
      const keys = await this.redis.dbsize();
      this.stats.keys = keys;
      
      return { ...this.stats };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Erro ao buscar estatísticas:', errorMessage);
      return { ...this.stats };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return this.isConnected;
    } catch {
      return false;
    }
  }

  // Métodos de conveniência para tipos específicos
  async cacheLog(logId: string, logData: any): Promise<void> {
    await this.setWithSmartTTL(`log:${logId}`, logData, 'log');
  }

  async cacheAnalysis(logId: string, analysis: any): Promise<void> {
    await this.setWithSmartTTL(`analysis:${logId}`, analysis, 'analysis');
  }

  async cacheStats(statsKey: string, statsData: any): Promise<void> {
    await this.setWithSmartTTL(`stats:${statsKey}`, statsData, 'stats');
  }

  get isReady(): boolean {
    return this.isConnected;
  }
}
