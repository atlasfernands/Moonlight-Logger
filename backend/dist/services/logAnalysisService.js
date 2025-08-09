"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLog = analyzeLog;
const lodash_1 = __importDefault(require("lodash"));
function analyzeLog(message) {
    const tags = [];
    let suggestion;
    const lower = message.toLowerCase();
    if (lower.includes('timeout')) {
        tags.push('network', 'timeout');
        suggestion = 'Verifique latência do serviço externo e aumente timeouts.';
    }
    if (lower.includes('mongodb') || lower.includes('mongoose')) {
        tags.push('database', 'mongodb');
    }
    if (lower.includes('redis')) {
        tags.push('cache', 'redis');
    }
    if (lower.includes('unauthorized') || lower.includes('401')) {
        tags.push('auth');
        suggestion = suggestion ?? 'Cheque tokens/headers de autenticação.';
    }
    if (lodash_1.default.isEmpty(tags))
        tags.push('general');
    return { tags: lodash_1.default.uniq(tags), suggestion };
}
//# sourceMappingURL=logAnalysisService.js.map