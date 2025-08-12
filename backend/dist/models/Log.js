"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LogSchema = new mongoose_1.Schema({
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
            type: String
            // Removido index: true para evitar duplicação
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
        additional: mongoose_1.Schema.Types.Mixed
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
    timestamps: true
});
// Índices compostos para performance (otimizados)
LogSchema.index({ level: 1, timestamp: -1 }); // Índice composto para filtros comuns
LogSchema.index({ 'context.file': 1 }); // Índice parcial para logs com origem
LogSchema.index({ tags: 1 }); // Índice para busca por tags
LogSchema.index({ 'ai.provider': 1, 'ai.confidence': -1 }); // Índice para análise de IA
LogSchema.index({ createdAt: -1 }); // Índice para ordenação por criação
// Middleware para normalizar dados antes de salvar
LogSchema.pre('save', function (next) {
    // Garante que tags sejam únicas
    if (this.tags) {
        this.tags = [...new Set(this.tags)];
    }
    // Garante que timestamp seja definido
    if (!this.timestamp) {
        this.timestamp = new Date();
    }
    next();
});
// Método estático para buscar logs com filtros avançados
LogSchema.statics.findWithFilters = function (filters) {
    const query = {};
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
        if (filters.from)
            query.timestamp.$gte = filters.from;
        if (filters.to)
            query.timestamp.$lte = filters.to;
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
LogSchema.statics.getStats = function (filters) {
    const matchStage = {};
    if (filters.from || filters.to) {
        matchStage.timestamp = {};
        if (filters.from)
            matchStage.timestamp.$gte = filters.from;
        if (filters.to)
            matchStage.timestamp.$lte = filters.to;
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
exports.LogModel = mongoose_1.default.model('Log', LogSchema);
//# sourceMappingURL=Log.js.map