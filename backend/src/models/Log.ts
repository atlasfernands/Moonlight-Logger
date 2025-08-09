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

// Índices para melhorar filtros/consultas
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ tags: 1 });
// Index esparso apenas quando existir contexto com arquivo
LogSchema.index({ 'context.file': 1 }, { partialFilterExpression: { 'context.file': { $exists: true } } });
// Busca textual opcional por mensagem
LogSchema.index({ message: 'text' });

export const LogModel = model<LogDocument>('Log', LogSchema);

