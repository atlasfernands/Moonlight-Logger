import mongoose, { Document, Schema } from 'mongoose';

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

const LogSchema = new Schema<LogDocument>({
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    index: 'text'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  context: {
    origin: {
      type: String,
      required: true,
      index: true
    },
    pid: {
      type: Number,
      required: true
    },
    file: String,
    line: Number,
    column: Number,
    stack: String,
    // Campo flexível para outros contextos
    additional: Schema.Types.Mixed
  },
  ai: {
    classification: String,
    explanation: String,
    suggestion: String,
    provider: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    processingTime: Number
  }
}, {
  timestamps: true,
  // Índices compostos para performance
  indexes: [
    // Índice composto para filtros comuns
    { level: 1, timestamp: -1 },
    // Índice parcial para logs com origem de arquivo
    { 'context.file': 1 },
    // Índice para busca por tags
    { tags: 1 },
    // Índice para análise de IA
    { 'ai.provider': 1, 'ai.confidence': -1 }
  ]
});

// Middleware para normalizar dados antes de salvar
LogSchema.pre('save', function(next) {
  // Garante que tags sejam únicas
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }
  
  // Normaliza timestamp
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  
  next();
});

// Método estático para buscar logs com filtros avançados
LogSchema.statics.findWithFilters = function(filters: {
  level?: string;
  tags?: string[];
  q?: string;
  from?: Date;
  to?: Date;
  hasSource?: boolean;
  page?: number;
  limit?: number;
}) {
  const query: any = {};
  
  if (filters.level) {
    query.level = filters.level;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  if (filters.q) {
    query.$text = { $search: filters.q };
  }
  
  if (filters.from || filters.to) {
    query.timestamp = {};
    if (filters.from) query.timestamp.$gte = filters.from;
    if (filters.to) query.timestamp.$lte = filters.to;
  }
  
  if (filters.hasSource) {
    query['context.file'] = { $exists: true, $ne: null };
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

// Método para estatísticas agregadas
LogSchema.statics.getStats = function(filters: {
  from?: Date;
  to?: Date;
  level?: string;
}) {
  const matchStage: any = {};
  
  if (filters.from || filters.to) {
    matchStage.timestamp = {};
    if (filters.from) matchStage.timestamp.$gte = filters.from;
    if (filters.to) matchStage.timestamp.$lte = filters.to;
  }
  
  if (filters.level) {
    matchStage.level = filters.level;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$ai.confidence' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

export const LogModel = mongoose.model<LogDocument>('Log', LogSchema);

