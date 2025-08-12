const { parentPort, workerData } = require('worker_threads');
const { parseLogMessage } = require('../logger/parser');

class LogWorker {
  constructor() {
    this.workerId = workerData.workerId;
    this.setupMessageHandler();
  }

  setupMessageHandler() {
    parentPort.on('message', async (task) => {
      const startTime = Date.now();
      
      try {
        const result = await this.processTask(task);
        
        parentPort.postMessage({
          taskId: task.id,
          success: true,
          data: result,
          processingTime: Date.now() - startTime
        });
        
      } catch (error) {
        parentPort.postMessage({
          taskId: task.id,
          success: false,
          error: error.message,
          processingTime: Date.now() - startTime
        });
      }
    });
  }

  async processTask(task) {
    switch (task.type) {
      case 'log-analysis':
        return await this.analyzeLog(task.data);
      
      case 'log-parsing':
        return await this.parseLog(task.data.message);
      
      case 'log-storage':
        return await this.prepareLogForStorage(task.data);
      
      default:
        throw new Error(`Tipo de tarefa desconhecido: ${task.type}`);
    }
  }

  async analyzeLog(logData) {
    // Simula análise de IA/heurísticas
    const analysis = {
      classification: this.classifyLog(logData),
      explanation: this.generateExplanation(logData),
      suggestion: this.generateSuggestion(logData),
      confidence: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
      provider: 'worker-pool',
      tags: this.extractTags(logData)
    };

    // Simula latência de processamento
    await this.simulateProcessing();
    
    return analysis;
  }

  async parseLog(message) {
    // Usa o parser existente
    const parsed = parseLogMessage(message);
    
    // Simula latência de processamento
    await this.simulateProcessing();
    
    return parsed;
  }

  async prepareLogForStorage(logData) {
    // Prepara log para armazenamento no MongoDB
    const preparedLog = {
      ...logData,
      processedAt: new Date(),
      workerId: this.workerId,
      batchId: `batch_${Date.now()}`,
      metadata: {
        source: 'worker-pool',
        version: '2.0.0',
        processingFlags: this.generateProcessingFlags(logData)
      }
    };

    // Simula latência de processamento
    await this.simulateProcessing();
    
    return preparedLog;
  }

  classifyLog(logData) {
    const level = logData.level || 'info';
    const message = logData.message || '';
    
    if (level === 'error') {
      if (message.includes('database') || message.includes('db')) {
        return 'Database Error';
      } else if (message.includes('network') || message.includes('connection')) {
        return 'Network Error';
      } else if (message.includes('auth') || message.includes('permission')) {
        return 'Authentication Error';
      }
      return 'General Error';
    }
    
    if (level === 'warn') {
      if (message.includes('deprecated') || message.includes('deprecation')) {
        return 'Deprecation Warning';
      } else if (message.includes('performance') || message.includes('slow')) {
        return 'Performance Warning';
      }
      return 'General Warning';
    }
    
    return 'Information';
  }

  generateExplanation(logData) {
    const level = logData.level || 'info';
    const message = logData.message || '';
    
    if (level === 'error') {
      return `Erro detectado: ${message}. Este tipo de erro pode indicar problemas de infraestrutura ou bugs no código.`;
    }
    
    if (level === 'warn') {
      return `Aviso detectado: ${message}. Este aviso pode indicar problemas futuros se não for tratado.`;
    }
    
    return `Informação registrada: ${message}.`;
  }

  generateSuggestion(logData) {
    const level = logData.level || 'info';
    const message = logData.message || '';
    
    if (level === 'error') {
      if (message.includes('database')) {
        return 'Verifique a conectividade do banco de dados e as credenciais de acesso.';
      } else if (message.includes('network')) {
        return 'Verifique a conectividade de rede e firewall.';
      } else if (message.includes('auth')) {
        return 'Verifique tokens de autenticação e permissões.';
      }
      return 'Investigue o erro e implemente tratamento adequado.';
    }
    
    if (level === 'warn') {
      return 'Monitore este aviso e implemente correções preventivas.';
    }
    
    return 'Continue monitorando para padrões de comportamento.';
  }

  extractTags(logData) {
    const tags = ['worker-processed'];
    
    if (logData.level) tags.push(logData.level);
    if (logData.tags && Array.isArray(logData.tags)) {
      tags.push(...logData.tags);
    }
    
    // Extrai tags baseadas no conteúdo da mensagem
    const message = logData.message || '';
    if (message.includes('user')) tags.push('user-action');
    if (message.includes('database')) tags.push('database');
    if (message.includes('api')) tags.push('api');
    if (message.includes('auth')) tags.push('authentication');
    
    return [...new Set(tags)];
  }

  generateProcessingFlags(logData) {
    const flags = {
      hasContext: !!logData.context,
      hasTags: !!(logData.tags && logData.tags.length > 0),
      hasTimestamp: !!logData.timestamp,
      isStructured: typeof logData.message === 'object',
      priority: logData.priority || 'normal'
    };
    
    return flags;
  }

  async simulateProcessing() {
    // Simula tempo de processamento real (1-5ms)
    const processingTime = Math.random() * 4 + 1;
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }
}

// Inicializa o worker
new LogWorker();

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado no worker:', error);
  parentPort.postMessage({
    taskId: 'unknown',
    success: false,
    error: `Worker crash: ${error.message}`,
    processingTime: 0
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada no worker:', reason);
  parentPort.postMessage({
    taskId: 'unknown',
    success: false,
    error: `Unhandled rejection: ${reason}`,
    processingTime: 0
  });
});
