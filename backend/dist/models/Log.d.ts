export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export interface LogDocument {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    tags?: string[];
    suggestion?: string;
    file?: string;
    line?: number;
    column?: number;
    source?: string;
    ai?: {
        classification?: string;
        explanation?: string;
        suggestion?: string;
        provider?: string;
        score?: number;
        at?: Date;
    };
}
export declare const LogModel: import("mongoose").Model<LogDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, LogDocument, {}, {}> & LogDocument & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Log.d.ts.map