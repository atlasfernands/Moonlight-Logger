"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
exports.createQueue = createQueue;
exports.createWorker = createWorker;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redisConnection = new ioredis_1.default(env_1.env.redisUrl);
function createQueue(name) {
    return new bullmq_1.Queue(name, { connection: exports.redisConnection });
}
function createWorker(name, processor) {
    return new bullmq_1.Worker(name, processor, { connection: exports.redisConnection });
}
//# sourceMappingURL=redis.js.map