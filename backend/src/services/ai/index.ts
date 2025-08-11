import { LogDocument } from '../../models/Log';
import { OpenAIProvider } from './providers/openai';
import { LocalAIProvider } from './providers/local';
import { MockAIProvider } from './providers/mock';

export interface AIInsight {
  classification: string;
  explanation: string;
  suggestion: string;
  confidence: number;
  provider: string;
}

export interface AIProvider {
  analyze(log: LogDocument): Promise<AIInsight>;
  isAvailable(): boolean;
}

export class AIService {
  private providers: AIProvider[] = [];
  private activeProvider: AIProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Ordem de prioridade: OpenAI > Local > Mock
    if (process.env.OPENAI_API_KEY) {
      this.providers.push(new OpenAIProvider());
    }
    
    // Local AI provider para análise baseada em regras
    this.providers.push(new LocalAIProvider());
    
    // Mock provider para desenvolvimento/testes
    this.providers.push(new MockAIProvider());

    // Seleciona o primeiro provider disponível
    this.activeProvider = this.providers.find(p => p.isAvailable()) || null;
  }

  async analyzeLog(log: LogDocument): Promise<AIInsight | null> {
    if (!this.activeProvider) {
      console.warn('Nenhum provider de IA disponível');
      return null;
    }

    try {
      const insight = await this.activeProvider.analyze(log);
      return {
        ...insight,
        provider: this.activeProvider.constructor.name,
        confidence: Math.min(insight.confidence, 1.0)
      };
    } catch (error) {
      console.error('Erro na análise de IA:', error);
      return null;
    }
  }

  async analyzeLogs(logs: LogDocument[]): Promise<Map<string, AIInsight>> {
    const insights = new Map<string, AIInsight>();
    
    for (const log of logs) {
      const insight = await this.analyzeLog(log);
      if (insight) {
        insights.set(log._id.toString(), insight);
      }
    }

    return insights;
  }

  getActiveProvider(): string {
    return this.activeProvider?.constructor.name || 'none';
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isAvailable())
      .map(p => p.constructor.name);
  }
}

export const aiService = new AIService();
