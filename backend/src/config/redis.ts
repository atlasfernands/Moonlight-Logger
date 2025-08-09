import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env';

export const redisConnection = new IORedis(env.redisUrl);

export function createQueue(name: string): Queue {
  return new Queue(name, { connection: redisConnection as unknown as any });
}

export function createWorker<T = unknown>(
  name: string,
  processor: (job: import('bullmq').Job<T>) => Promise<void>
): Worker<T> {
  return new Worker<T>(name, processor, { connection: redisConnection as unknown as any });
}

