import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/moonlightlogger',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  
  // AI Service Configuration - Pipeline Híbrido
  aiProvider: process.env.AI_PROVIDER ?? 'offline', // offline, hybrid, ai-only
  aiEnabled: process.env.AI_ENABLED === 'true' && process.env.AI_PROVIDER !== 'offline',
  
  // Logging Configuration
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

export const isProduction = env.nodeEnv === 'production';
export const isDevelopment = env.nodeEnv === 'development';
export const isTest = env.nodeEnv === 'test';

