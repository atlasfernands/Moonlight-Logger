#!/usr/bin/env node

/**
 * Teste de Stress Offline - Moonlight Logger
 * 
 * Este script testa o sistema funcionando completamente offline
 * para verificar a robustez sem dependências externas.
 */

const { recordDataVolume, getRedisStatus, setScalingThreshold } = require('./dist/config/redis');

// Simula o sistema de logs funcionando offline
class OfflineLogSimulator {
  constructor() {
    this.logs = [];
    this.metrics = {
      startTime: Date.now(),
      totalLogs: 0,
      successfulLogs: 0,
      failedLogs: 0,
      averageLatency: 0,
      throughput: 0,
      memoryUsage: process.memoryUsage(),
      scalingEvents: 0,
      redisTransitions: 0
    };
    this.isRunning = false;
    this.intervalId = null;
  }

  async startOfflineTest() {
    console.log('🔧 Moonlight Logger - Teste de Stress Offline');
    console.log('=' .repeat(60));
    console.log('🎯 Testando sistema funcionando completamente offline');
    console.log('📊 Sem MongoDB, sem Redis - apenas processamento local');
    
    this.isRunning = true;
    this.metrics.startTime = Date.now();
    
    // Configura threshold baixo para testar escalabilidade
    setScalingThreshold(1000);
    
    // Inicia monitoramento em tempo real
    this.startRealTimeMonitoring();
    
    try {
      await this.simulateOfflineLogging();
    } catch (error) {
      console.error('❌ Erro durante teste offline:', error);
    } finally {
      await this.finishTest();
    }
  }

  async simulateOfflineLogging() {
    console.log('\n🏭 Simulando sistema de logs offline...');
    
    // Fase 1: Carga baixa (início do dia)
    console.log('🌅 Fase 1: Carga baixa (0-10s)');
    await this.generateOfflineLogs(1000, 100, 100);
    
    // Fase 2: Carga crescente (horário comercial)
    console.log('📈 Fase 2: Carga crescente (10-30s)');
    await this.generateOfflineLogs(5000, 500, 50);
    
    // Fase 3: Pico de tráfego (rush hour)
    console.log('🔥 Fase 3: Pico de tráfego (30-50s)');
    await this.generateOfflineLogs(20000, 2000, 20);
    
    // Fase 4: Carga sustentada (horário pico)
    console.log('⚡ Fase 4: Carga sustentada (50-80s)');
    await this.generateOfflineLogs(30000, 3000, 10);
    
    // Fase 5: Decaimento (fim do dia)
    console.log('🌆 Fase 5: Decaimento (80-100s)');
    await this.generateOfflineLogs(10000, 1000, 50);
  }

  async generateOfflineLogs(totalLogs, batchSize, delayMs) {
    const batches = Math.ceil(totalLogs / batchSize);
    
    for (let i = 0; i < batches && this.isRunning; i++) {
      const batchStart = Date.now();
      const currentBatchSize = Math.min(batchSize, totalLogs - (i * batchSize));
      
      try {
        await this.processOfflineBatch(currentBatchSize);
        this.metrics.successfulLogs += currentBatchSize;
        
        const batchLatency = Date.now() - batchStart;
        this.updateMetrics(currentBatchSize, batchLatency);
        
        // Registra volume para escalabilidade automática
        recordDataVolume(this.metrics.totalLogs);
        
        // Verifica mudanças de status
        this.checkScalingEvents();
        
        if (delayMs > 0) {
          await this.sleep(delayMs);
        }
      } catch (error) {
        console.error(`❌ Erro no batch ${i}:`, error);
        this.metrics.failedLogs += currentBatchSize;
      }
    }
  }

  async processOfflineBatch(batchSize) {
    const logs = [];
    
    for (let i = 0; i < batchSize; i++) {
      const logData = this.generateRealisticLog();
      logs.push(logData);
    }

    // Simula processamento offline (sem salvar no banco)
    await this.simulateOfflineProcessing(logs);
    this.metrics.totalLogs += batchSize;
  }

  generateRealisticLog() {
    const levels = ['info', 'warn', 'error', 'debug'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    const templates = [
      'User {userId} performed {action} on {resource}',
      'API request to {endpoint} completed in {duration}ms',
      'Database query {queryId} executed successfully',
      'Cache miss for key {cacheKey}, fetching from database',
      'Background job {jobId} started processing',
      'External service {service} responded in {latency}ms',
      'File upload {filename} completed, size: {size} bytes',
      'Authentication attempt for user {username}',
      'Payment processing for order {orderId}',
      'Email notification sent to {recipient}'
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const message = this.interpolateTemplate(template);
    
    return {
      level,
      message,
      timestamp: new Date(),
      tags: this.generateTags(level),
      context: this.generateContext(level)
    };
  }

  interpolateTemplate(template) {
    const variables = {
      userId: Math.floor(Math.random() * 10000),
      action: ['create', 'read', 'update', 'delete'][Math.floor(Math.random() * 4)],
      resource: ['user', 'order', 'product', 'payment'][Math.floor(Math.random() * 4)],
      endpoint: ['/api/users', '/api/orders', '/api/products', '/api/payments'][Math.floor(Math.random() * 4)],
      duration: Math.floor(Math.random() * 1000),
      queryId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cacheKey: `cache_${Math.random().toString(36).substr(2, 9)}`,
      jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      service: ['payment-gateway', 'email-service', 'sms-service', 'analytics'][Math.floor(Math.random() * 4)],
      latency: Math.floor(Math.random() * 500),
      filename: `file_${Math.random().toString(36).substr(2, 9)}.${['pdf', 'jpg', 'doc', 'zip'][Math.floor(Math.random() * 4)]}`,
      size: Math.floor(Math.random() * 10000000),
      username: `user_${Math.random().toString(36).substr(2, 9)}`,
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipient: `user${Math.floor(Math.random() * 1000)}@example.com`
    };

    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key]?.toString() || match);
  }

  generateTags(level) {
    const baseTags = ['offline', 'stress-test'];
    const levelTags = [`level-${level}`];
    
    if (level === 'error') {
      levelTags.push('critical', 'alert');
    } else if (level === 'warn') {
      levelTags.push('attention');
    }
    
    return [...baseTags, ...levelTags];
  }

  generateContext(level) {
    const context = {
      source: 'offline-stress-test',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
      userId: Math.floor(Math.random() * 10000),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'OfflineLogSimulator/1.0',
      // Campos obrigatórios do schema
      pid: process.pid,
      origin: 'offline-stress-test'
    };

    if (level === 'error') {
      context.errorCode = `ERR_${Math.floor(Math.random() * 1000)}`;
      context.stackTrace = this.generateMockStackTrace();
    }

    return context;
  }

  generateMockStackTrace() {
    return `Error: Simulated offline error
    at OfflineLogSimulator.generateMockStackTrace (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})
    at OfflineLogSimulator.generateContext (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})
    at OfflineLogSimulator.generateRealisticLog (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})`;
  }

  async simulateOfflineProcessing(logs) {
    // Simula processamento local (sem banco de dados)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula análise de logs offline
        logs.forEach(log => {
          if (log.level === 'error') {
            log.analysis = {
              classification: 'Error detected',
              explanation: 'Simulated error analysis',
              suggestion: 'Check system logs',
              confidence: 0.9
            };
          }
        });
        
        // Armazena em memória local (simulando cache)
        this.logs.push(...logs);
        
        // Limita o tamanho do cache para não estourar memória
        if (this.logs.length > 100000) {
          this.logs = this.logs.slice(-50000);
        }
        
        resolve();
      }, Math.random() * 10); // Simula latência de processamento
    });
  }

  updateMetrics(logsProcessed, latency) {
    const currentTime = Date.now();
    const elapsed = currentTime - this.metrics.startTime;
    
    // Atualiza throughput
    this.metrics.throughput = (this.metrics.totalLogs / (elapsed / 1000));
    
    // Atualiza latência média
    const totalLatency = this.metrics.averageLatency * (this.metrics.totalLogs - logsProcessed) + latency;
    this.metrics.averageLatency = totalLatency / this.metrics.totalLogs;
  }

  checkScalingEvents() {
    const status = getRedisStatus();
    const previousScaling = this.metrics.scalingEvents;
    
    if (status.scalingMode === 'auto' && !status.isOfflineMode) {
      this.metrics.scalingEvents++;
      if (this.metrics.scalingEvents > previousScaling) {
        console.log(`🚀 [SCALING] Sistema escalou para Redis! Volume: ${status.dataVolume}`);
        this.metrics.redisTransitions++;
      }
    }
  }

  startRealTimeMonitoring() {
    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;
      
      const status = getRedisStatus();
      const memory = process.memoryUsage();
      
      console.log(`📊 [OFFLINE MONITORING] Logs: ${this.metrics.totalLogs} | Throughput: ${this.metrics.throughput.toFixed(2)}/s | Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB | Redis: ${status.connected ? '✅' : '❌'} | Scaling: ${status.scalingMode} | Cache: ${this.logs.length}`);
    }, 5000); // A cada 5 segundos
  }

  async finishTest() {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.metrics.endTime = Date.now();
    const totalDuration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    
    console.log('\n🎯 Teste offline concluído!');
    console.log('📊 Métricas finais:');
    console.log(`   ⏱️  Duração total: ${totalDuration.toFixed(2)}s`);
    console.log(`   📝 Logs processados: ${this.metrics.totalLogs}`);
    console.log(`   ✅ Sucessos: ${this.metrics.successfulLogs}`);
    console.log(`   ❌ Falhas: ${this.metrics.failedLogs}`);
    console.log(`   🚀 Throughput médio: ${this.metrics.throughput.toFixed(2)} logs/s`);
    console.log(`   ⚡ Latência média: ${this.metrics.averageLatency.toFixed(2)}ms`);
    console.log(`   🔄 Eventos de escalabilidade: ${this.metrics.scalingEvents}`);
    console.log(`   🚀 Transições para Redis: ${this.metrics.redisTransitions}`);
    console.log(`   💾 Logs em cache: ${this.logs.length}`);
    
    // Salva métricas para análise posterior
    await this.saveTestMetrics();
  }

  async saveTestMetrics() {
    try {
      const metricsData = {
        ...this.metrics,
        timestamp: new Date().toISOString(),
        offlineMode: true,
        cacheSize: this.logs.length
      };
      
      console.log('💾 Métricas offline salvas para análise posterior');
      console.log('📁 Dados disponíveis em:', JSON.stringify(metricsData, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar métricas:', error);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stopTest() {
    if (this.isRunning) {
      console.log('🛑 Parando teste offline...');
      this.isRunning = false;
      await this.finishTest();
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getLogs() {
    return [...this.logs];
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'offline':
      console.log('🔧 Executando teste offline completo...');
      const offlineTester = new OfflineLogSimulator();
      await offlineTester.startOfflineTest();
      break;
    case 'quick':
      console.log('⚡ Teste offline rápido...');
      const quickTester = new OfflineLogSimulator();
      // Configuração para teste rápido
      quickTester.generateOfflineLogs = async (totalLogs, batchSize, delayMs) => {
        const batches = Math.ceil(totalLogs / batchSize);
        for (let i = 0; i < Math.min(batches, 5) && quickTester.isRunning; i++) {
          await quickTester.processOfflineBatch(batchSize);
          quickTester.metrics.successfulLogs += batchSize;
          await quickTester.sleep(delayMs);
        }
      };
      await quickTester.startOfflineTest();
      break;
    default:
      console.log('🔧 Moonlight Logger - Teste de Stress Offline');
      console.log('');
      console.log('Uso:');
      console.log('  node test-offline-stress.js offline    # Teste offline completo');
      console.log('  node test-offline-stress.js quick      # Teste offline rápido');
      console.log('');
      console.log('Exemplo: node test-offline-stress.js quick');
      break;
  }
}

// Executa o programa
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  OfflineLogSimulator
};
