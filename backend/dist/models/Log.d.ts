import mongoose, { Document } from 'mongoose';
export interface LogDocument extends Document {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: Date;
    tags: string[];
    context: {
        origin: string;
        pid: number;
        file?: string;
        line?: number;
        column?: number;
        stack?: string;
        [key: string]: any;
    };
    ai?: {
        classification?: string;
        explanation?: string;
        suggestion?: string;
        provider?: string;
        confidence?: number;
        processingTime?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const LogModel: mongoose.Model<LogDocument, {}, {}, {}, mongoose.Document<unknown, {}, LogDocument, {}, {}> & LogDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Log.d.ts.map