import mongoose from 'mongoose';
import { env } from './env';

export const mongoStatus = {
  connected: false,
  lastError: undefined as undefined | string,
  connectionString: env.mongoUri,
  retryCount: 0,
  maxRetries: 5
};

function attachListeners() {
  mongoose.connection.on('connected', () => {
    mongoStatus.connected = true;
    mongoStatus.lastError = undefined;
    mongoStatus.retryCount = 0;
    console.log('✅ [mongo] Conectado com sucesso');
  });
  
  mongoose.connection.on('disconnected', () => {
    mongoStatus.connected = false;
    console.warn('⚠️ [mongo] Desconectado');
  });
  
  mongoose.connection.on('error', (error) => {
    mongoStatus.connected = false;
    mongoStatus.lastError = String(error?.message ?? error);
    console.error('❌ [mongo] Erro de conexão:', mongoStatus.lastError);
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [mongo] Reconectado');
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
      // Configurações otimizadas para desenvolvimento e produção
      const options = {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
        maxPoolSize: env.nodeEnv === 'production' ? 10 : 1,
        minPoolSize: env.nodeEnv === 'production' ? 2 : 0,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        w: 'majority' as any,
        readPreference: 'primaryPreferred' as const
      };

      await mongoose.connect(mongoUri, options);
      console.log('✅ [mongo] Conectado com sucesso');
      
      // Configurar timeouts após conexão
      mongoose.connection.db?.admin().ping();
      
    } catch (err) {
      mongoStatus.connected = false;
      mongoStatus.lastError = String((err as any)?.message ?? err);
      mongoStatus.retryCount++;
      
      console.warn(`❌ [mongo] Conexão falhou (tentativa ${mongoStatus.retryCount}/${mongoStatus.maxRetries}): ${mongoStatus.lastError}`);
      
      // Em desenvolvimento, não falha completamente após algumas tentativas
      if (env.nodeEnv === 'development' && mongoStatus.retryCount >= 3) {
        console.log('🔧 [mongo] Modo desenvolvimento: continuando sem MongoDB após 3 tentativas');
        console.log('💡 Para conectar MongoDB: docker run -d -p 27017:27017 mongo:latest');
        return;
      }
      
      // Em produção, continua tentando
      if (mongoStatus.retryCount < mongoStatus.maxRetries) {
        console.log(`🔄 [mongo] Tentando novamente em ${retryMs}ms...`);
        setTimeout(tryConnect, retryMs);
      } else {
        console.error('💥 [mongo] Máximo de tentativas atingido. Verifique a conexão.');
        if (env.nodeEnv === 'production') {
          process.exit(1);
        }
      }
    }
  };
  void tryConnect();
}

// Função para verificar se MongoDB está disponível
export async function checkMongoConnection(): Promise<boolean> {
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Função para reconectar manualmente
export async function reconnectMongo(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('ℹ️ [mongo] Já conectado');
      return;
    }
    
    console.log('🔄 [mongo] Tentando reconectar...');
    await mongoose.disconnect();
    mongoStatus.retryCount = 0;
    initMongoWithRetry();
  } catch (error) {
    console.error('❌ [mongo] Erro ao reconectar:', error);
  }
}

