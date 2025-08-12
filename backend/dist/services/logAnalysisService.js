"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAnalysisService = void 0;
const analysis_1 = require("../config/analysis");
const Log_1 = require("../models/Log");
const env_1 = require("../config/env");
class LogAnalysisService {
    constructor() {
        this.analysisCache = new Map();
        this.config = (0, analysis_1.loadAnalysisConfig)();
        this.initializeAIProvider();
    }
    async initializeAIProvider() {
        // Pipeline Híbrido: IA só é inicializada se não estiver em modo offline
        if (env_1.env.aiProvider === 'offline') {
            console.log('🔍 Modo offline: apenas análise heurística ativa');
            return;
        }
        try {
            switch (this.config.aiProvider) {
                case 'openai':
                    this.aiProvider = await this.setupOpenAI();
                    console.log('🤖 Provedor OpenAI inicializado');
                    break;
                case 'anthropic':
                    this.aiProvider = await this.setupAnthropic();
                    console.log('🤖 Provedor Anthropic inicializado');
                    break;
                case 'local':
                    this.aiProvider = await this.setupLocalAI();
                    console.log('🤖 Provedor Local inicializado');
                    break;
                default:
                    console.warn(`Provedor de IA não suportado: ${this.config.aiProvider}`);
            }
        }
        catch (error) {
            console.error('Erro ao inicializar provedor de IA:', error);
            console.warn('🔄 Fallback para modo offline (heurísticas)');
            // Não altera a configuração, apenas desabilita a IA para esta instância
        }
    }
    async setupOpenAI() {
        if (!this.config.aiApiKey)
            throw new Error('OpenAI API key não configurada');
        // Simulação - em produção usar OpenAI SDK
        return {
            analyze: async (message, context) => {
                // Simulação de análise OpenAI
                await new Promise(resolve => setTimeout(resolve, 100));
                return {
                    classification: 'AI Analysis',
                    explanation: 'Análise baseada em IA OpenAI',
                    suggestion: 'Sugestão personalizada da IA',
                    confidence: 0.85,
                    tags: ['ai', 'openai']
                };
            }
        };
    }
    async setupAnthropic() {
        if (!this.config.aiApiKey)
            throw new Error('Anthropic API key não configurada');
        return {
            analyze: async (message, context) => {
                await new Promise(resolve => setTimeout(resolve, 150));
                return {
                    classification: 'AI Analysis',
                    explanation: 'Análise baseada em IA Anthropic',
                    suggestion: 'Sugestão personalizada da IA',
                    confidence: 0.88,
                    tags: ['ai', 'anthropic']
                };
            }
        };
    }
    async setupLocalAI() {
        // Simulação de IA local (poderia ser um modelo TensorFlow.js ou similar)
        return {
            analyze: async (message, context) => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return {
                    classification: 'Local AI Analysis',
                    explanation: 'Análise baseada em modelo local',
                    suggestion: 'Sugestão do modelo local',
                    confidence: 0.75,
                    tags: ['ai', 'local']
                };
            }
        };
    }
    async analyzeLog(logId, message, context) {
        const startTime = Date.now();
        // Verifica cache primeiro
        const cacheKey = `${logId}_${message.substring(0, 100)}`;
        const cached = this.analysisCache.get(cacheKey);
        if (cached && Date.now() - startTime < this.config.analysisCacheTTL * 1000) {
            return cached;
        }
        let analysis;
        try {
            // Pipeline Híbrido: Heurísticas sempre rodam, IA é condicional
            if (env_1.env.aiProvider === 'offline') {
                // Modo offline: apenas heurísticas
                analysis = await this.analyzeWithHeuristics(message, context);
            }
            else if (env_1.env.aiProvider === 'ai-only') {
                // Modo IA apenas: requer provedor disponível
                if (!this.aiProvider) {
                    throw new Error('Provedor de IA não disponível para modo ai-only');
                }
                analysis = await this.analyzeWithAI(message, context);
            }
            else if (env_1.env.aiProvider === 'hybrid') {
                // Modo híbrido: combina heurísticas + IA
                analysis = await this.analyzeHybrid(message, context);
            }
            else {
                // Fallback para offline se configuração inválida
                console.warn(`Configuração AI_PROVIDER inválida: ${env_1.env.aiProvider}, usando modo offline`);
                analysis = await this.analyzeWithHeuristics(message, context);
            }
            analysis.processingTime = Date.now() - startTime;
            // Atualiza cache
            this.analysisCache.set(cacheKey, analysis);
            // Atualiza o log no banco com a análise
            await this.updateLogWithAnalysis(logId, analysis);
            return analysis;
        }
        catch (error) {
            console.error('Erro na análise do log:', error);
            // Fallback para heurísticas em caso de erro
            analysis = await this.analyzeWithHeuristics(message, context);
            analysis.source = 'heuristic';
            analysis.processingTime = Date.now() - startTime;
            return analysis;
        }
    }
    async analyzeWithHeuristics(message, context) {
        const matchedRules = [];
        // Aplica todas as regras heurísticas
        for (const rule of this.config.heuristicRules) {
            const pattern = typeof rule.pattern === 'string'
                ? new RegExp(rule.pattern, 'i')
                : rule.pattern;
            if (pattern.test(message)) {
                matchedRules.push(rule);
            }
        }
        if (matchedRules.length === 0) {
            return {
                classification: 'Unclassified',
                explanation: 'Log não corresponde a padrões conhecidos',
                suggestion: 'Revisar manualmente se necessário',
                confidence: 0.3,
                source: 'heuristic',
                tags: ['unclassified'],
                processingTime: 0
            };
        }
        // Ordena por prioridade e pega a melhor regra
        matchedRules.sort((a, b) => a.priority - b.priority);
        const bestRule = matchedRules[0];
        if (!bestRule) {
            return {
                classification: 'Unclassified',
                explanation: 'Nenhuma regra heurística correspondeu ao log',
                suggestion: 'Revisar manualmente se necessário',
                confidence: 0.3,
                source: 'heuristic',
                tags: ['unclassified'],
                processingTime: 0
            };
        }
        return {
            classification: bestRule.classification,
            explanation: bestRule.explanation,
            suggestion: bestRule.suggestion,
            confidence: 0.7 + (matchedRules.length * 0.1), // Mais regras = mais confiança
            source: 'heuristic',
            tags: bestRule.tags,
            processingTime: 0
        };
    }
    async analyzeWithAI(message, context) {
        if (!this.aiProvider) {
            throw new Error('Provedor de IA não disponível');
        }
        const aiResult = await this.aiProvider.analyze(message, context);
        return {
            ...aiResult,
            source: 'ai',
            processingTime: 0
        };
    }
    async analyzeHybrid(message, context) {
        // Pipeline Híbrido: Heurísticas sempre rodam primeiro
        const heuristicResult = await this.analyzeWithHeuristics(message, context);
        // IA é acionada condicionalmente baseada na confiança das heurísticas
        if (heuristicResult.confidence < 0.7 && this.aiProvider) {
            try {
                console.log('🤖 Modo híbrido: acionando IA para melhorar análise');
                const aiResult = await this.analyzeWithAI(message, context);
                // Combina resultados (heurísticas + IA) com pesos inteligentes
                const combinedConfidence = Math.min(0.95, (heuristicResult.confidence * 0.4) + (aiResult.confidence * 0.6));
                return {
                    classification: aiResult.classification || heuristicResult.classification,
                    explanation: `Heurísticas: ${heuristicResult.explanation} | IA: ${aiResult.explanation}`,
                    suggestion: aiResult.suggestion || heuristicResult.suggestion,
                    confidence: combinedConfidence,
                    source: 'hybrid',
                    tags: [...new Set([...heuristicResult.tags, ...aiResult.tags])],
                    processingTime: 0
                };
            }
            catch (error) {
                console.warn('🔄 IA falhou no modo híbrido, usando apenas heurísticas:', error);
                // Fallback gracioso para heurísticas
                return {
                    ...heuristicResult,
                    source: 'heuristic',
                    tags: [...heuristicResult.tags, 'ai-fallback']
                };
            }
        }
        // Se heurísticas têm alta confiança, retorna direto
        return {
            ...heuristicResult,
            source: 'heuristic',
            tags: [...heuristicResult.tags, 'high-confidence']
        };
    }
    async updateLogWithAnalysis(logId, analysis) {
        try {
            await Log_1.LogModel.findByIdAndUpdate(logId, {
                'ai.classification': analysis.classification,
                'ai.explanation': analysis.explanation,
                'ai.suggestion': analysis.suggestion,
                'ai.provider': analysis.source === 'ai' ? this.config.aiProvider : 'heuristic',
                tags: analysis.tags
            });
        }
        catch (error) {
            console.error('Erro ao atualizar log com análise:', error);
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.initializeAIProvider();
    }
    clearCache() {
        this.analysisCache.clear();
    }
    getCacheStats() {
        return {
            size: this.analysisCache.size,
            hitRate: 0.8 // Simulação - em produção calcular hit rate real
        };
    }
}
exports.LogAnalysisService = LogAnalysisService;
//# sourceMappingURL=logAnalysisService.js.map