import { Schema, model } from 'mongoose';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogDocument {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  tags?: string[];
  suggestion?: string;
}

const LogSchema = new Schema<LogDocument>(
  {
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
    context: { type: Object },
    tags: [{ type: String }],
    suggestion: { type: String },
  },
  { versionKey: false }
);

export const LogModel = model<LogDocument>('Log', LogSchema);

