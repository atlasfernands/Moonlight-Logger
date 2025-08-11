export interface AnalysisConfig {
  analysisMode: 'offline' | 'hybrid' | 'ai-only';
  aiProvider?: 'openai' | 'anthropic' | 'local';
  aiApiKey?: string;
  aiModel?: string;
  aiEndpoint?: string;
  heuristicRules: HeuristicRule[];
  enableRealTimeAnalysis: boolean;
  analysisCacheTTL: number; // segundos
}

export interface HeuristicRule {
  id: string;
  pattern: RegExp | string;
  level: 'info' | 'warn' | 'error' | 'debug';
  classification: string;
  explanation: string;
  suggestion: string;
  priority: number;
  tags: string[];
}

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  analysisMode: 'hybrid',
  heuristicRules: [
    {
      id: 'error-pattern',
      pattern: /(error|exception|failed|failure|crash)/i,
      level: 'error',
      classification: 'System Error',
      explanation: 'Detectado padrão de erro no log',
      suggestion: 'Verificar logs anteriores para contexto completo',
      priority: 1,
      tags: ['error', 'system']
    },
    {
      id: 'warning-pattern',
      pattern: /(warning|warn|deprecated|deprecation)/i,
      level: 'warn',
      classification: 'Warning',
      explanation: 'Detectado aviso ou deprecação',
      suggestion: 'Considerar atualização ou correção',
      priority: 2,
      tags: ['warning', 'deprecation']
    },
    {
      id: 'database-connection',
      pattern: /(database|db|connection|timeout|connection refused)/i,
      level: 'error',
      classification: 'Database Issue',
      explanation: 'Problema de conexão com banco de dados',
      suggestion: 'Verificar status do banco e configurações de conexão',
      priority: 1,
      tags: ['database', 'connection', 'error']
    },
    {
      id: 'api-timeout',
      pattern: /(timeout|request failed|api error|http error)/i,
      level: 'warn',
      classification: 'API Issue',
      explanation: 'Timeout ou erro em chamada de API',
      suggestion: 'Verificar conectividade e timeout da API',
      priority: 2,
      tags: ['api', 'timeout', 'network']
    },
    {
      id: 'memory-usage',
      pattern: /(memory|heap|out of memory|memory leak)/i,
      level: 'warn',
      classification: 'Memory Issue',
      explanation: 'Possível problema de uso de memória',
      suggestion: 'Monitorar uso de memória e verificar vazamentos',
      priority: 2,
      tags: ['memory', 'performance']
    }
  ],
  enableRealTimeAnalysis: true,
  analysisCacheTTL: 3600 // 1 hora
};

export function loadAnalysisConfig(): AnalysisConfig {
  try {
    // Tenta carregar de arquivo de configuração
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'config.json');
    
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...DEFAULT_ANALYSIS_CONFIG, ...configData };
    }
  } catch (error) {
    console.warn('Erro ao carregar config.json, usando configuração padrão:', error);
  }
  
  return DEFAULT_ANALYSIS_CONFIG;
}

export function validateAnalysisConfig(config: AnalysisConfig): string[] {
  const errors: string[] = [];
  
  if (!['offline', 'hybrid', 'ai-only'].includes(config.analysisMode)) {
    errors.push('analysisMode deve ser "offline", "hybrid" ou "ai-only"');
  }
  
  if (config.analysisMode !== 'offline') {
    if (!config.aiProvider) {
      errors.push('aiProvider é obrigatório quando analysisMode não é "offline"');
    }
    if (!config.aiApiKey && config.aiProvider !== 'local') {
      errors.push('aiApiKey é obrigatório para provedores externos de IA');
    }
  }
  
  if (config.analysisCacheTTL < 0) {
    errors.push('analysisCacheTTL deve ser maior ou igual a 0');
  }
  
  return errors;
}
