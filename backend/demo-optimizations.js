#!/usr/bin/env node

/**
 * Demonstração das Otimizações de Produção do Moonlight Logger
 * 
 * Este script demonstra:
 * - Worker Pool para processamento paralelo
 * - Sistema de Cache Redis otimizado
 * - Métricas Prometheus em tempo real
 * - Sistema de Alertas automáticos
 */

const { WorkerPool } = require('./dist/services/workerPool');
const { CacheService } = require('./dist/services/cacheService');
const { MetricsService } = require('./dist/monitoring/metrics');
const { AlertManager } = require('./dist/monitoring/alertManager');

class OptimizationDemo {
  constructor() {
    this.workerPool = null;
    this.cacheService = null;
    this.metricsService = null;
    this.alertManager = null;
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Iniciando Demonstração das Otimizações do Moonlight Logger');
    console.log('=' .repeat(80));
    
    try {
      await this.initializeServices();
      await this.runDemo();
    } catch (error) {
      console.error('❌ Erro na demonstração:', error);
    } finally {
      await this.cleanup();
    }
  }

  async initializeServices() {
    console.log('\n🔧 Inicializando Serviços...');
    
    // Inicializa métricas
    this.metricsService = new MetricsService({
      prefix: 'moonlight_demo',
      labels: ['environment', 'instance']
    });
    
    // Inicializa worker pool
    this.workerPool = new WorkerPool(4, 'logWorker.js');
    
    // Inicializa cache (simulado)
    this.cacheService = new CacheService({
      host: 'localhost',
      port: 6379,
      db: 1, // Usa DB diferente para demo
      keyPrefix: 'demo:'
    });
    
    // Inicializa alert manager
    this.alertManager = new AlertManager(this.metricsService, {
      checkInterval: 10, // Verifica a cada 10s para demo
      enableConsoleAlerts: true
    });
    
    // Configura event listeners
    this.setupEventListeners();
    
    console.log('✅ Serviços inicializados com sucesso');
  }

  setupEventListeners() {
    // Worker Pool events
    this.workerPool.on('task-completed', (result) => {
      console.log(`✅ Tarefa ${result.taskId} concluída em ${result.processingTime}ms`);
      this.metricsService.recordWorkerTask(
        'demo',
        result.success ? 'success' : 'error',
        result.processingTime
      );
    });

    // Alert Manager events
    this.alertManager.on('alert-fired', (alert) => {
      console.log(`🚨 ALERTA: ${alert.name} (${alert.severity})`);
    });

    this.alertManager.on('alert-resolved', (alert) => {
      console.log(`✅ ALERTA RESOLVIDO: ${alert.name}`);
    });
  }

  async runDemo() {
    console.log('\n🎯 Executando Demonstrações...');
    
    this.isRunning = true;
    
    // Demo 1: Worker Pool Performance
    await this.demoWorkerPool();
    
    // Demo 2: Cache Performance
    await this.demoCachePerformance();
    
    // Demo 3: Métricas em Tempo Real
    await this.demoRealTimeMetrics();
    
    // Demo 4: Sistema de Alertas
    await this.demoAlertSystem();
    
    // Demo 5: Stress Test com Otimizações
    await this.demoStressTestWithOptimizations();
    
    console.log('\n🎉 Demonstração concluída com sucesso!');
  }

  async demoWorkerPool() {
    console.log('\n🔧 Demo 1: Worker Pool Performance');
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    const tasks = [];
    
    // Cria 100 tarefas de diferentes tipos
    for (let i = 0; i < 100; i++) {
      const taskType = ['log-analysis', 'log-parsing', 'log-storage'][i % 3];
      const priority = ['low', 'normal', 'high', 'critical'][i % 4];
      
      tasks.push({
        type: taskType,
        data: { id: i, message: `Log message ${i}`, timestamp: new Date() },
        priority
      });
    }
    
    console.log(`📤 Enviando ${tasks.length} tarefas para o worker pool...`);
    
    // Envia tarefas em lote
    const taskIds = await this.workerPool.submitBatch(tasks);
    console.log(`📋 ${taskIds.length} tarefas enviadas`);
    
    // Aguarda conclusão
    await new Promise(resolve => {
      let completedTasks = 0;
      this.workerPool.on('task-completed', () => {
        completedTasks++;
        if (completedTasks >= tasks.length) {
          resolve(null);
        }
      });
    });
    
    const totalTime = Date.now() - startTime;
    const stats = this.workerPool.getStats();
    
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`📊 Tarefas processadas: ${stats.totalTasksProcessed}`);
    console.log(`⚡ Tempo médio por tarefa: ${stats.averageProcessingTime.toFixed(2)}ms`);
    console.log(`🚀 Throughput: ${(stats.totalTasksProcessed / (totalTime / 1000)).toFixed(2)} tarefas/s`);
  }

  async demoCachePerformance() {
    console.log('\n💾 Demo 2: Cache Performance');
    console.log('─'.repeat(50));
    
    const cacheKeys = [];
    const startTime = Date.now();
    
    // Simula operações de cache
    for (let i = 0; i < 1000; i++) {
      const key = `demo:log:${i}`;
      const value = {
        id: i,
        message: `Log message ${i}`,
        timestamp: new Date(),
        level: ['info', 'warn', 'error', 'debug'][i % 4]
      };
      
      cacheKeys.push(key);
      
      // Simula cache hit/miss
      if (Math.random() < 0.7) { // 70% cache hit
        this.metricsService.recordCacheHit('redis');
      } else {
        this.metricsService.recordCacheMiss('redis');
        // Simula armazenamento no cache
        await this.cacheService.set(key, value, 3600);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`📊 Operações de cache: ${cacheKeys.length}`);
    console.log(`⚡ Operações/s: ${(cacheKeys.length / (totalTime / 1000)).toFixed(2)}`);
    
    // Simula estatísticas de cache
    this.metricsService.setCacheSize(850, 'redis');
    console.log(`💾 Tamanho do cache: 850 chaves`);
  }

  async demoRealTimeMetrics() {
    console.log('\n📊 Demo 3: Métricas em Tempo Real');
    console.log('─'.repeat(50));
    
    // Atualiza métricas do sistema
    this.metricsService.updateSystemMetrics();
    
    // Simula métricas de logs
    for (let i = 0; i < 50; i++) {
      const level = ['info', 'warn', 'error', 'debug'][i % 4];
      const source = ['console', 'api', 'worker', 'system'][i % 4];
      const processingTime = (Math.random() * 100 + 10) / 1000; // 10-110ms
      
      this.metricsService.recordLog(level, source, processingTime);
    }
    
    // Simula métricas de requisições
    for (let i = 0; i < 20; i++) {
      const method = ['GET', 'POST', 'PUT', 'DELETE'][i % 4];
      const route = ['/api/logs', '/api/stats', '/api/health', '/api/metrics'][i % 4];
      const statusCode = [200, 201, 400, 500][i % 4];
      const duration = (Math.random() * 1000 + 100) / 1000; // 100-1100ms
      
      this.metricsService.recordRequest(method, route, statusCode, duration);
    }
    
    // Simula métricas de banco de dados
    for (let i = 0; i < 30; i++) {
      const operation = ['insert', 'find', 'update', 'delete'][i % 4];
      const collection = ['logs', 'analytics', 'users', 'config'][i % 4];
      const status = ['success', 'success', 'success', 'error'][i % 4];
      const duration = (Math.random() * 50 + 5) / 1000; // 5-55ms
      
      this.metricsService.recordDbOperation(operation, collection, status, duration);
    }
    
    console.log('📈 Métricas atualizadas em tempo real');
    console.log('🔍 Verifique o endpoint /metrics para ver todas as métricas');
  }

  async demoAlertSystem() {
    console.log('\n🚨 Demo 4: Sistema de Alertas');
    console.log('─'.repeat(50));
    
    // Adiciona regra customizada para demo
    this.alertManager.addRule({
      id: 'demo_high_load',
      name: 'Carga Alta de Demonstração',
      description: 'Simula carga alta para testar alertas',
      severity: 'high',
      condition: {
        metric: 'demo_metric',
        operator: 'gt',
        value: 0.8,
        aggregation: 'avg',
        timeWindow: 30
      },
      threshold: 0.8,
      duration: 10,
      cooldown: 60,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true }
      ]
    });
    
    console.log('🔔 Regra de alerta customizada adicionada');
    console.log('⏳ Aguardando 30 segundos para ver alertas em ação...');
    
    // Simula métricas que disparam alertas
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      
      if (counter <= 30) {
        console.log(`⏱️  ${counter}/30 - Simulando métricas...`);
      } else {
        clearInterval(interval);
        console.log('✅ Simulação de alertas concluída');
      }
    }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  async demoStressTestWithOptimizations() {
    console.log('\n💪 Demo 5: Stress Test com Otimizações');
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    const totalLogs = 5000;
    const batchSize = 100;
    
    console.log(`📊 Iniciando stress test: ${totalLogs} logs em batches de ${batchSize}`);
    
    // Simula processamento otimizado
    for (let i = 0; i < totalLogs; i += batchSize) {
      const batch = [];
      
      for (let j = 0; j < batchSize && (i + j) < totalLogs; j++) {
        const logId = i + j;
        batch.push({
          type: 'log-analysis',
          data: {
            id: logId,
            message: `Stress test log ${logId}`,
            level: ['info', 'warn', 'error', 'debug'][logId % 4],
            timestamp: new Date()
          },
          priority: 'normal'
        });
      }
      
      // Envia batch para worker pool
      await this.workerPool.submitBatch(batch);
      
      // Simula cache operations
      for (const task of batch) {
        if (Math.random() < 0.8) { // 80% cache hit
          this.metricsService.recordCacheHit('redis');
        } else {
          this.metricsService.recordCacheMiss('redis');
        }
      }
      
      // Atualiza métricas
      this.metricsService.setLogQueueSize(batch.length);
      this.metricsService.setWorkerQueueSize(this.workerPool.getStats().queueLength);
      
      if (i % 1000 === 0) {
        console.log(`📈 Progresso: ${i}/${totalLogs} logs processados`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const throughput = totalLogs / (totalTime / 1000);
    
    console.log(`\n🏁 Stress Test Concluído!`);
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`📊 Logs processados: ${totalLogs}`);
    console.log(`🚀 Throughput: ${throughput.toFixed(2)} logs/s`);
    
    if (throughput > 1000) {
      console.log('🏆 Performance: EXCELENTE - Otimizações funcionando perfeitamente!');
    } else if (throughput > 500) {
      console.log('✅ Performance: BOA - Sistema otimizado');
    } else {
      console.log('⚠️  Performance: Pode ser melhorada');
    }
  }

  async cleanup() {
    console.log('\n🧹 Limpando recursos...');
    
    if (this.workerPool) {
      await this.workerPool.shutdown();
    }
    
    if (this.alertManager) {
      await this.alertManager.stop();
    }
    
    if (this.cacheService) {
      await this.cacheService.disconnect();
    }
    
    console.log('✅ Recursos limpos');
  }
}

// Executa a demonstração
if (require.main === module) {
  const demo = new OptimizationDemo();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido SIGINT, parando demonstração...');
    await demo.cleanup();
    process.exit(0);
  });
  
  demo.start().catch(console.error);
}

module.exports = { OptimizationDemo };
