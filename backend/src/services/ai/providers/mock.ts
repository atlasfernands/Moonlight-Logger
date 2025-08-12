import { LogDocument } from '../../../models/Log';
import { AIProvider, AIInsight } from '../index';

export class MockAIProvider implements AIProvider {
  private mockInsights: AIInsight[] = [
    {
      classification: 'Database Connection Issue',
      explanation: 'Falha na conexão com o banco de dados MongoDB',
      suggestion: 'Verifique se o MongoDB está rodando e as credenciais estão corretas',
      confidence: 0.95,
      provider: 'MockAI'
    },
    {
      classification: 'Network Timeout',
      explanation: 'Timeout na requisição HTTP para serviço externo',
      suggestion: 'Aumente o timeout ou verifique a conectividade de rede',
      confidence: 0.88,
      provider: 'MockAI'
    },
    {
      classification: 'Authentication Failure',
      explanation: 'Token JWT inválido ou expirado',
      suggestion: 'Renove o token de autenticação ou verifique as permissões',
      confidence: 0.92,
      provider: 'MockAI'
    },
    {
      classification: 'Memory Leak Detected',
      explanation: 'Uso crescente de memória detectado ao longo do tempo',
      suggestion: 'Investigue vazamentos de memória no código ou dependências',
      confidence: 0.78,
      provider: 'MockAI'
    },
    {
      classification: 'API Rate Limit Exceeded',
      explanation: 'Limite de requisições por minuto foi excedido',
      suggestion: 'Implemente retry com backoff exponencial ou aumente o limite',
      confidence: 0.85,
      provider: 'MockAI'
    },
    {
      classification: 'File Permission Error',
      explanation: 'Sem permissão para acessar arquivo ou diretório',
      suggestion: 'Verifique as permissões do usuário da aplicação',
      confidence: 0.90,
      provider: 'MockAI'
    },
    {
      classification: 'Validation Error',
      explanation: 'Dados de entrada não passaram na validação',
      suggestion: 'Verifique o formato e completude dos dados enviados',
      confidence: 0.82,
      provider: 'MockAI'
    },
    {
      classification: 'Service Unavailable',
      explanation: 'Serviço externo retornou status 503',
      suggestion: 'Verifique o status do serviço e implemente fallback',
      confidence: 0.87,
      provider: 'MockAI'
    }
  ];

  isAvailable(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }

  async analyze(log: LogDocument): Promise<AIInsight> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Seleciona insight baseado no nível e conteúdo do log
    let selectedInsight: AIInsight | null = null;

    if (log.level === 'error') {
      // Para erros, seleciona insights de erro
      const errorInsights = this.mockInsights.filter(i =>
        i.classification.includes('Error') ||
        i.classification.includes('Issue')
      );
      if (errorInsights.length > 0) {
        selectedInsight = errorInsights[Math.floor(Math.random() * errorInsights.length)]!;
      }
    } else if (log.level === 'warn') {
      // Para warnings, seleciona insights de atenção
      const warningInsights = this.mockInsights.filter(i =>
        i.classification.includes('Warning') ||
        i.classification.includes('Memory')
      );
      if (warningInsights.length > 0) {
        selectedInsight = warningInsights[Math.floor(Math.random() * warningInsights.length)]!;
      }
    } else {
      // Para info/debug, seleciona aleatoriamente
      selectedInsight = this.mockInsights[Math.floor(Math.random() * this.mockInsights.length)]!;
    }

    if (!selectedInsight) {
      // Fallback para insight padrão
      selectedInsight = this.mockInsights[0]!;
    }

    // Personaliza o insight baseado no contexto do log
    const personalizedInsight: AIInsight = {
      ...selectedInsight,
      explanation: this.personalizeExplanation(selectedInsight.explanation, log),
      suggestion: this.personalizeSuggestion(selectedInsight.suggestion, log),
      confidence: this.adjustConfidence(selectedInsight.confidence, log)
    };

    return personalizedInsight;
  }

  private personalizeExplanation(explanation: string, log: LogDocument): string {
    let personalized = explanation;

    if ((log as any).file) {
      personalized = personalized.replace('serviço', `serviço em ${(log as any).file}`);
    }

    if (log.message.toLowerCase().includes('mongodb')) {
      personalized = personalized.replace('serviço externo', 'MongoDB');
    } else if (log.message.toLowerCase().includes('redis')) {
      personalized = personalized.replace('serviço externo', 'Redis');
    }

    if ((log as any).file && (log as any).line) {
      explanation += ` - Localizado em ${(log as any).file}:${(log as any).line}`;
    }

    return personalized;
  }

  private personalizeSuggestion(suggestion: string, log: LogDocument): string {
    let personalized = suggestion;

    if (log.context && log.context.userId) {
      personalized = `Para o usuário ${log.context.userId}: ${personalized}`;
    }

    if (log.tags && log.tags.includes('production')) {
      personalized += ' (Prioridade alta - ambiente de produção)';
    }

    return personalized;
  }

  private adjustConfidence(baseConfidence: number, log: LogDocument): number {
    let adjusted = baseConfidence;

    // Ajusta baseado no nível do log
    if (log.level === 'error') {
      adjusted += 0.1;
    } else if (log.level === 'debug') {
      adjusted -= 0.1;
    }

    // Ajusta baseado no contexto
    if ((log as any).file && (log as any).line) {
      adjusted += 0.05;
    }

    if (log.tags && log.tags.length > 0) {
      adjusted += 0.03;
    }

    // Ajusta baseado na mensagem
    if (log.message.length > 100) {
      adjusted += 0.02; // Mensagens mais detalhadas
    }

    return Math.max(0.1, Math.min(1.0, adjusted));
  }

  // Método para testes - retorna insights específicos
  getMockInsights(): AIInsight[] {
    return [...this.mockInsights];
  }

  // Método para testes - adiciona insight customizado
  addMockInsight(insight: AIInsight): void {
    this.mockInsights.push(insight);
  }
}
