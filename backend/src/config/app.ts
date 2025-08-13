import { readFileSync } from 'fs';
import { join } from 'path';

// Interface para configuração da aplicação
export interface AppConfig {
  port: number;
  frontendPort: number;
  logLevel: string;
  enableRealTime: boolean;
  autoStart: boolean;
  features: {
    errorTracking: boolean;
    performanceMonitoring: boolean;
    realTimeUpdates: boolean;
    aiAnalysis: boolean;
    offlineMode: boolean;
  };
  scaling: {
    threshold: number;
    autoScale: boolean;
    redisEnabled: boolean;
  };
  ui: {
    theme: string;
    refreshInterval: number;
    maxLogsDisplay: number;
  };
}

// Configuração padrão
const DEFAULT_CONFIG: AppConfig = {
  port: 3001,
  frontendPort: 3000,
  logLevel: 'info',
  enableRealTime: true,
  autoStart: true,
  features: {
    errorTracking: true,
    performanceMonitoring: true,
    realTimeUpdates: true,
    aiAnalysis: false,
    offlineMode: true
  },
  scaling: {
    threshold: 1000,
    autoScale: true,
    redisEnabled: false
  },
  ui: {
    theme: 'dark',
    refreshInterval: 5000,
    maxLogsDisplay: 1000
  }
};

// Função para carregar configuração
export function loadAppConfig(): AppConfig {
  try {
    // Tenta carregar do arquivo config.json
    const configPath = join(process.cwd(), '..', 'config.json');
    const configFile = readFileSync(configPath, 'utf8');
    const userConfig = JSON.parse(configFile);
    
    // Mescla com configuração padrão
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      features: {
        ...DEFAULT_CONFIG.features,
        ...userConfig.features
      },
      scaling: {
        ...DEFAULT_CONFIG.scaling,
        ...userConfig.scaling
      },
      ui: {
        ...DEFAULT_CONFIG.ui,
        ...userConfig.ui
      }
    };
  } catch (error) {
    console.log('📝 Usando configuração padrão (config.json não encontrado)');
    return DEFAULT_CONFIG;
  }
}

// Configuração carregada
export const appConfig = loadAppConfig();

// Função para obter configuração
export function getAppConfig(): AppConfig {
  return appConfig;
}

// Função para atualizar configuração
export function updateAppConfig(updates: Partial<AppConfig>): void {
  Object.assign(appConfig, updates);
  
  // Em uma aplicação real, você salvaria no arquivo
  console.log('⚙️  Configuração atualizada:', updates);
}

// Função para validar configuração
export function validateConfig(config: AppConfig): boolean {
  const errors: string[] = [];
  
  if (config.port < 1 || config.port > 65535) {
    errors.push('Porta deve estar entre 1 e 65535');
  }
  
  if (config.frontendPort < 1 || config.frontendPort > 65535) {
    errors.push('Porta do frontend deve estar entre 1 e 65535');
  }
  
  if (config.port === config.frontendPort) {
    errors.push('Backend e frontend não podem usar a mesma porta');
  }
  
  if (config.scaling.threshold < 1) {
    errors.push('Threshold de escalabilidade deve ser maior que 0');
  }
  
  if (config.ui.refreshInterval < 1000) {
    errors.push('Intervalo de atualização deve ser pelo menos 1000ms');
  }
  
  if (config.ui.maxLogsDisplay < 100) {
    errors.push('Máximo de logs deve ser pelo menos 100');
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros na configuração:');
    errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }
  
  return true;
}

// Função para obter configuração de ambiente
export function getEnvironmentConfig(): Partial<AppConfig> {
  const envConfig: Partial<AppConfig> = {};
  
  // Portas
  if (process.env.PORT) {
    envConfig.port = parseInt(process.env.PORT);
  }
  
  if (process.env.FRONTEND_PORT) {
    envConfig.frontendPort = parseInt(process.env.FRONTEND_PORT);
  }
  
  // Nível de log
  if (process.env.LOG_LEVEL) {
    envConfig.logLevel = process.env.LOG_LEVEL;
  }
  
  // Features
  if (process.env.ENABLE_REAL_TIME) {
    envConfig.enableRealTime = process.env.ENABLE_REAL_TIME === 'true';
  }
  
  if (process.env.AI_ANALYSIS) {
    envConfig.features = {
      ...appConfig.features,
      aiAnalysis: process.env.AI_ANALYSIS === 'true'
    };
  }
  
  if (process.env.OFFLINE_MODE) {
    envConfig.features = {
      ...appConfig.features,
      offlineMode: process.env.OFFLINE_MODE === 'true'
    };
  }
  
  // Redis
  if (process.env.REDIS_ENABLED) {
    envConfig.scaling = {
      ...appConfig.scaling,
      redisEnabled: process.env.REDIS_ENABLED === 'true'
    };
  }
  
  return envConfig;
}

// Função para obter configuração final (arquivo + ambiente)
export function getFinalConfig(): AppConfig {
  const envConfig = getEnvironmentConfig();
  
  // Mescla configurações
  const finalConfig = {
    ...appConfig,
    ...envConfig,
    features: {
      ...appConfig.features,
      ...envConfig.features
    },
    scaling: {
      ...appConfig.scaling,
      ...envConfig.scaling
    }
  };
  
  // Valida configuração final
  if (!validateConfig(finalConfig)) {
    console.warn('⚠️  Usando configuração padrão devido a erros de validação');
    return DEFAULT_CONFIG;
  }
  
  return finalConfig;
}

// Configuração final
export const finalConfig = getFinalConfig();

// Log da configuração carregada
console.log('⚙️  Configuração carregada:', {
  port: finalConfig.port,
  frontendPort: finalConfig.frontendPort,
  logLevel: finalConfig.logLevel,
  features: Object.keys(finalConfig.features).filter(key => finalConfig.features[key as keyof typeof finalConfig.features]),
  scaling: {
    threshold: finalConfig.scaling.threshold,
    autoScale: finalConfig.scaling.autoScale,
    redisEnabled: finalConfig.scaling.redisEnabled
  }
});
