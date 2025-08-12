import { LogDocument } from '../../../models/Log';
import { AIProvider, AIInsight } from '../index';

export class LocalAIProvider implements AIProvider {
  private patterns: Map<string, RegExp> = new Map();
  private classifications: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeClassifications();
  }

  isAvailable(): boolean {
    return true; // Sempre disponível
  }

  async analyze(log: LogDocument): Promise<AIInsight> {
    const analysis = this.analyzeByPatterns(log);
    
    if (analysis) {
      return analysis;
    }

    // Análise baseada em heurísticas
    return this.analyzeByHeuristics(log);
  }

  private initializePatterns() {
    // Padrões de erro comuns
    this.patterns.set('null_reference', /null|undefined|Cannot read property|TypeError/gi);
    this.patterns.set('database_error', /database|mongodb|postgresql|mysql|connection|timeout/gi);
    this.patterns.set('network_error', /network|connection|timeout|ECONNREFUSED|ENOTFOUND/gi);
    this.patterns.set('auth_error', /unauthorized|forbidden|401|403|authentication|jwt/gi);
    this.patterns.set('validation_error', /validation|invalid|required|missing/gi);
    this.patterns.set('memory_error', /memory|heap|out of memory|ENOMEM/gi);
    this.patterns.set('file_error', /file|path|ENOENT|permission|access/gi);
    this.patterns.set('api_error', /api|http|status|500|502|503|504/gi);
  }

  private initializeClassifications() {
    this.classifications.set('null_reference', {
      classification: 'Null Reference Error',
      explanation: 'Tentativa de acessar propriedade de objeto nulo ou indefinido',
      suggestion: 'Verifique se a variável está inicializada antes de usar',
      confidence: 0.9
    });

    this.classifications.set('database_error', {
      classification: 'Database Connection Issue',
      explanation: 'Problema de conectividade ou operação no banco de dados',
      suggestion: 'Verifique status do banco, credenciais e configurações de conexão',
      confidence: 0.85
    });

    this.classifications.set('network_error', {
      classification: 'Network Connectivity Problem',
      explanation: 'Falha na comunicação de rede ou timeout de conexão',
      suggestion: 'Verifique conectividade, firewall e configurações de timeout',
      confidence: 0.8
    });

    this.classifications.set('auth_error', {
      classification: 'Authentication/Authorization Failure',
      explanation: 'Falha na autenticação ou autorização do usuário',
      suggestion: 'Verifique tokens, permissões e configurações de segurança',
      confidence: 0.9
    });

    this.classifications.set('validation_error', {
      classification: 'Data Validation Error',
      explanation: 'Dados inválidos ou campos obrigatórios ausentes',
      suggestion: 'Verifique formato e completude dos dados de entrada',
      confidence: 0.8
    });

    this.classifications.set('memory_error', {
      classification: 'Memory Management Issue',
      explanation: 'Problema relacionado ao uso de memória da aplicação',
      suggestion: 'Verifique vazamentos de memória e otimizações de código',
      confidence: 0.7
    });

    this.classifications.set('file_error', {
      classification: 'File System Error',
      explanation: 'Problema de acesso ou operação em arquivos',
      suggestion: 'Verifique permissões, caminhos e existência dos arquivos',
      confidence: 0.8
    });

    this.classifications.set('api_error', {
      classification: 'API/HTTP Error',
      explanation: 'Erro na comunicação com API externa ou serviço HTTP',
      suggestion: 'Verifique status do serviço externo e configurações de API',
      confidence: 0.75
    });
  }

  private analyzeByPatterns(log: LogDocument): AIInsight | null {
    const message = log.message.toLowerCase();
    const context = log.context ? JSON.stringify(log.context).toLowerCase() : '';
    const fullText = `${message} ${context}`;

    for (const [key, pattern] of this.patterns) {
      if (pattern.test(fullText)) {
        const classification = this.classifications.get(key);
        if (classification) {
          return {
            ...classification,
            provider: 'LocalAI'
          };
        }
      }
    }

    return null;
  }

  private analyzeByHeuristics(log: LogDocument): AIInsight {
    const message = log.message.toLowerCase();
    let confidence = 0.5;
    let classification = 'General Log';
    let explanation = 'Log informativo sem problemas aparentes';
    let suggestion = 'Monitorar para padrões ou mudanças';

    // Análise baseada no nível do log
    if (log.level === 'error') {
      confidence = 0.8;
      classification = 'Error Event';
      explanation = 'Evento de erro registrado na aplicação';
      suggestion = 'Investigar causa raiz e implementar tratamento adequado';
    } else if (log.level === 'warn') {
      confidence = 0.6;
      classification = 'Warning Event';
      explanation = 'Aviso que pode indicar problema futuro';
      suggestion = 'Monitorar e investigar se persistir';
    } else if (log.level === 'debug') {
      confidence = 0.4;
      classification = 'Debug Information';
      explanation = 'Informação de debug para desenvolvimento';
      suggestion = 'Verificar se necessário em produção';
    }

    // Análise baseada no contexto
    if ((log as any).file && (log as any).line) {
      explanation += ` - Localizado em ${(log as any).file}:${(log as any).line}`;
      confidence += 0.1;
    }

    if (log.tags && log.tags.length > 0) {
      explanation += ` - Tags: ${log.tags.join(', ')}`;
      confidence += 0.05;
    }

    // Análise baseada no conteúdo da mensagem
    if (message.includes('start') || message.includes('initialized')) {
      classification = 'Application Lifecycle';
      explanation = 'Evento relacionado ao ciclo de vida da aplicação';
      suggestion = 'Verificar se inicialização está correta';
      confidence = 0.7;
    } else if (message.includes('end') || message.includes('finished')) {
      classification = 'Process Completion';
      explanation = 'Processo ou operação concluída';
      suggestion = 'Verificar se conclusão foi bem-sucedida';
      confidence = 0.6;
    } else if (message.includes('user') || message.includes('login')) {
      classification = 'User Activity';
      explanation = 'Atividade relacionada ao usuário';
      suggestion = 'Monitorar padrões de uso e segurança';
      confidence = 0.65;
    }

    return {
      classification,
      explanation,
      suggestion,
      confidence: Math.min(confidence, 1.0),
      provider: 'LocalAI'
    };
  }
}
