"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDevelopment = exports.isProduction = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
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
exports.isProduction = exports.env.nodeEnv === 'production';
exports.isDevelopment = exports.env.nodeEnv === 'development';
exports.isTest = exports.env.nodeEnv === 'test';
//# sourceMappingURL=env.js.map