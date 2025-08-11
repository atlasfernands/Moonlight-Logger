import { LogDocument } from '../../../models/Log';
import { AIProvider, AIInsight } from '../index';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(log: LogDocument): Promise<AIInsight> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildPrompt(log);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em análise de logs de aplicação. 
              Analise o log fornecido e retorne uma resposta estruturada em JSON com:
              - classification: classificação do tipo de problema/evento
              - explanation: explicação técnica do que está acontecendo
              - suggestion: sugestão prática para resolver ou investigar
              - confidence: nível de confiança (0.0 a 1.0)
              
              Seja conciso mas técnico. Foque em problemas reais e soluções práticas.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da OpenAI API');
      }

      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const insight = JSON.parse(jsonMatch[0]);
      
      return {
        classification: insight.classification || 'Unknown',
        explanation: insight.explanation || 'Análise não disponível',
        suggestion: insight.suggestion || 'Verifique manualmente',
        confidence: Math.max(0, Math.min(1, insight.confidence || 0.5)),
        provider: 'OpenAI'
      };

    } catch (error) {
      console.error('Erro na análise OpenAI:', error);
      // Fallback para análise local
      return this.fallbackAnalysis(log);
    }
  }

  private buildPrompt(log: LogDocument): string {
    const context = {
      level: log.level,
      message: log.message,
      file: log.file,
      line: log.line,
      timestamp: log.timestamp,
      tags: log.tags,
      context: log.context
    };

    return `Analise este log de aplicação e forneça insights técnicos:

Log: ${JSON.stringify(context, null, 2)}

Responda apenas com JSON válido no formato:
{
  "classification": "tipo do problema/evento",
  "explanation": "explicação técnica",
  "suggestion": "sugestão prática",
  "confidence": 0.85
}`;
  }

  private fallbackAnalysis(log: LogDocument): AIInsight {
    // Análise básica baseada em padrões conhecidos
    const message = log.message.toLowerCase();
    
    if (message.includes('error') || message.includes('exception')) {
      return {
        classification: 'Runtime Error',
        explanation: 'Erro de execução detectado no log',
        suggestion: 'Verifique stack trace e contexto da aplicação',
        confidence: 0.6,
        provider: 'OpenAI (fallback)'
      };
    }
    
    if (message.includes('timeout') || message.includes('connection')) {
      return {
        classification: 'Network Issue',
        explanation: 'Problema de conectividade ou timeout',
        suggestion: 'Verifique conectividade de rede e configurações de timeout',
        confidence: 0.7,
        provider: 'OpenAI (fallback)'
      };
    }

    return {
      classification: 'General Log',
      explanation: 'Log informativo sem problemas aparentes',
      suggestion: 'Monitorar para padrões ou mudanças',
      confidence: 0.5,
      provider: 'OpenAI (fallback)'
    };
  }
}
