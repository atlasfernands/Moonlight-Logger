"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/moonlightlogger',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
};
exports.isProduction = exports.env.nodeEnv === 'production';
//# sourceMappingURL=env.js.map