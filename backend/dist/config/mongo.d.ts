export declare const mongoStatus: {
    connected: boolean;
    lastError: undefined | string;
    connectionString: string;
    retryCount: number;
    maxRetries: number;
};
export declare function initMongoWithRetry(retryMs?: number): void;
export declare function checkMongoConnection(): Promise<boolean>;
export declare function reconnectMongo(): Promise<void>;
//# sourceMappingURL=mongo.d.ts.map