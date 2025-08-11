import { AnalysisConfig, HeuristicRule, loadAnalysisConfig } from '../config/analysis';
import { LogModel } from '../models/Log';

export interface LogAnalysis {
  classification: string;
  explanation: string;
  suggestion: string;
  confidence: number;
  source: 'heuristic' | 'ai' | 'hybrid';
  tags: string[];
  processingTime: number;
}

export class LogAnalysisService {
  private config: AnalysisConfig;
  private aiProvider?: any;
  private analysisCache: Map<string, LogAnalysis> = new Map();

  constructor() {
    this.config = loadAnalysisConfig();
    this.initializeAIProvider();
  }

  private async initializeAIProvider() {
    if (this.config.analysisMode === 'offline') return;

    try {
      switch (this.config.aiProvider) {
        case 'openai':
          this.aiProvider = await this.setupOpenAI();
          break;
        case 'anthropic':
          this.aiProvider = await this.setupAnthropic();
          break;
        case 'local':
          this.aiProvider = await this.setupLocalAI();
          break;
        default:
          console.warn(`Provedor de IA não suportado: ${this.config.aiProvider}`);
      }
    } catch (error) {
      console.error('Erro ao inicializar provedor de IA:', error);
      console.warn('Falling back para modo offline');
      this.config.analysisMode = 'offline';
    }
  }

  private async setupOpenAI() {
    if (!this.config.aiApiKey) throw new Error('OpenAI API key não configurada');
    
    // Simulação - em produção usar OpenAI SDK
    return {
      analyze: async (message: string, context: any) => {
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

  private async setupAnthropic() {
    if (!this.config.aiApiKey) throw new Error('Anthropic API key não configurada');
    
    return {
      analyze: async (message: string, context: any) => {
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

  private async setupLocalAI() {
    // Simulação de IA local (poderia ser um modelo TensorFlow.js ou similar)
    return {
      analyze: async (message: string, context: any) => {
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

  public async analyzeLog(logId: string, message: string, context: any): Promise<LogAnalysis> {
    const startTime = Date.now();
    
    // Verifica cache primeiro
    const cacheKey = `${logId}_${message.substring(0, 100)}`;
    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - startTime < this.config.analysisCacheTTL * 1000) {
      return cached;
    }

    let analysis: LogAnalysis;

    try {
      switch (this.config.analysisMode) {
        case 'offline':
          analysis = await this.analyzeWithHeuristics(message, context);
          break;
        
        case 'ai-only':
          if (!this.aiProvider) {
            throw new Error('Provedor de IA não disponível');
          }
          analysis = await this.analyzeWithAI(message, context);
          break;
        
        case 'hybrid':
          analysis = await this.analyzeHybrid(message, context);
          break;
        
        default:
          throw new Error(`Modo de análise não suportado: ${this.config.analysisMode}`);
      }

      analysis.processingTime = Date.now() - startTime;
      
      // Atualiza cache
      this.analysisCache.set(cacheKey, analysis);
      
      // Atualiza o log no banco com a análise
      await this.updateLogWithAnalysis(logId, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('Erro na análise do log:', error);
      
      // Fallback para heurísticas em caso de erro
      analysis = await this.analyzeWithHeuristics(message, context);
      analysis.source = 'heuristic';
      analysis.processingTime = Date.now() - startTime;
      
      return analysis;
    }
  }

  private async analyzeWithHeuristics(message: string, context: any): Promise<LogAnalysis> {
    const matchedRules: HeuristicRule[] = [];
    
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

  private async analyzeWithAI(message: string, context: any): Promise<LogAnalysis> {
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

  private async analyzeHybrid(message: string, context: any): Promise<LogAnalysis> {
    // Primeiro tenta heurísticas (rápido)
    const heuristicResult = await this.analyzeWithHeuristics(message, context);
    
    // Se heurísticas têm baixa confiança, tenta IA
    if (heuristicResult.confidence < 0.6 && this.aiProvider) {
      try {
        const aiResult = await this.analyzeWithAI(message, context);
        
        // Combina resultados (heurísticas + IA)
        return {
          classification: aiResult.classification,
          explanation: `${heuristicResult.explanation} + ${aiResult.explanation}`,
          suggestion: aiResult.suggestion || heuristicResult.suggestion,
          confidence: Math.min(0.95, (heuristicResult.confidence + aiResult.confidence) / 2),
          source: 'hybrid',
          tags: [...new Set([...heuristicResult.tags, ...aiResult.tags])],
          processingTime: 0
        };
      } catch (error) {
        console.warn('IA falhou no modo híbrido, usando apenas heurísticas:', error);
      }
    }
    
    return heuristicResult;
  }

  private async updateLogWithAnalysis(logId: string, analysis: LogAnalysis): Promise<void> {
    try {
      await LogModel.findByIdAndUpdate(logId, {
        'ai.classification': analysis.classification,
        'ai.explanation': analysis.explanation,
        'ai.suggestion': analysis.suggestion,
        'ai.provider': analysis.source === 'ai' ? this.config.aiProvider : 'heuristic',
        tags: analysis.tags
      });
    } catch (error) {
      console.error('Erro ao atualizar log com análise:', error);
    }
  }

  public getConfig(): AnalysisConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeAIProvider();
  }

  public clearCache(): void {
    this.analysisCache.clear();
  }

  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.analysisCache.size,
      hitRate: 0.8 // Simulação - em produção calcular hit rate real
    };
  }
}

