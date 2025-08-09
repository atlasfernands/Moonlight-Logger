import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
export declare const redisConnection: IORedis;
export declare function createQueue(name: string): Queue;
export declare function createWorker<T = unknown>(name: string, processor: (job: import('bullmq').Job<T>) => Promise<void>): Worker<T>;
//# sourceMappingURL=redis.d.ts.map