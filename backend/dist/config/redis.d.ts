import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
declare let redisConnection: IORedis | null;
declare let redisStatus: {
    connected: boolean;
    lastError: string | undefined;
    retryCount: number;
    maxRetries: number;
    isOfflineMode: boolean;
    lastRetryTime: number;
    isAutoScaled: boolean;
    dataVolume: number;
    thresholdForScaling: number;
    lastScaleCheck: number;
};
export declare function recordDataVolume(volume: number): void;
export { redisConnection, redisStatus };
declare class HybridQueue<T = any> {
    private name;
    private jobs;
    private useRedis;
    constructor(name: string);
    add(name: string, data: any): Promise<{
        id: number;
        name: string;
        data: any;
        timestamp: Date;
    }>;
    getJob(id: string | number): Promise<any>;
    getJobs(): Promise<any[]>;
    clean(): Promise<void>;
}
declare class HybridWorker<T = any> {
    private name;
    private processor;
    private useRedis;
    constructor(name: string, processor: (job: any) => Promise<void>);
    process(): Promise<Worker<any, void, string> | null>;
    close(): Promise<void>;
}
export declare function createQueue(name: string): Queue | HybridQueue;
export declare function createWorker<T = unknown>(name: string, processor: (job: import('bullmq').Job<T>) => Promise<void>): Worker<T> | HybridWorker<T>;
export declare function getRedisStatus(): {
    readyState: string;
    canReconnect: boolean;
    scalingMode: string;
    dataVolume: number;
    threshold: number;
    connected: boolean;
    lastError: string | undefined;
    retryCount: number;
    maxRetries: number;
    isOfflineMode: boolean;
    lastRetryTime: number;
    isAutoScaled: boolean;
    thresholdForScaling: number;
    lastScaleCheck: number;
};
export declare function reconnectRedis(): Promise<void>;
export declare function forceOfflineMode(): void;
export declare function resetRedisStatus(): void;
export declare function setScalingThreshold(threshold: number): void;
export declare function forceScalingMode(enable: boolean): void;
//# sourceMappingURL=redis.d.ts.map