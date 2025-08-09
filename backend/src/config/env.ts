import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/moonlightlogger',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
};

export const isProduction = env.nodeEnv === 'production';

