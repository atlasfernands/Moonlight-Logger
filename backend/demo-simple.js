#!/usr/bin/env node

/**
 * Demonstração Simplificada das Otimizações de Produção
 * Simula as melhorias implementadas no Moonlight Logger
 */

class SimpleOptimizationDemo {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      logsProcessed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      workerTasks: 0,
      alerts: 0,
      avgProcessingTime: 0
    };
    
    this.performanceHistory = [];
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Iniciando Demonstração das Otimizações de Produção');
    console.log('=' .repeat(60));
    
    this.isRunning = true;
    
    try {
      await this.runDemo();
    } catch (error) {
      console.error('❌ Erro na demonstração:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async runDemo() {
    console.log('\n📊 1. Demonstração do Worker Pool');
    await this.demoWorkerPool();
    
    console.log('\n💾 2. Demonstração do Cache Otimizado');
    await this.demoCachePerformance();
    
    console.log('\n📈 3. Demonstração de Métricas em Tempo Real');
    await this.demoRealTimeMetrics();
    
    console.log('\n🚨 4. Demonstração do Sistema de Alertas');
    await this.demoAlertSystem();
    
    console.log('\n🔥 5. Teste de Stress com Otimizações');
    await this.demoStressTestWithOptimizations();
    
    console.log('\n✅ Demonstração Concluída!');
    this.showFinalResults();
  }

  async demoWorkerPool() {
    console.log('   Simulando processamento paralelo com workers...');
    
    const startTime = Date.now();
    const totalTasks = 1000;
    const batchSize = 50;
    
    for (let i = 0; i < totalTasks; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, totalTasks - i) }, (_, index) => ({
        id: i + index,
        type: 'log-analysis',
        priority: Math.random() > 0.8 ? 'high' : 'normal',
        data: `Log entry ${i + index}`
      }));
      
      // Simula processamento paralelo
      await this.processBatch(batch);
      this.metrics.workerTasks += batch.length;
      
      // Pequena pausa para simular processamento real
      await this.sleep(10);
    }
    
    const duration = Date.now() - startTime;
    const throughput = Math.round((totalTasks / duration) * 1000);
    
    console.log(`   ✅ Processados ${totalTasks} tasks em ${duration}ms`);
    console.log(`   📊 Throughput: ${throughput} tasks/segundo`);
    console.log(`   🎯 Prioridades: ${Math.round(totalTasks * 0.2)} high, ${Math.round(totalTasks * 0.8)} normal`);
  }

  async demoCachePerformance() {
    console.log('   Simulando cache Redis otimizado...');
    
    const cacheSize = 10000;
    const accessPatterns = ['sequential', 'random', 'hot-spot'];
    
    for (const pattern of accessPatterns) {
      console.log(`   🔄 Padrão: ${pattern}`);
      
      const startTime = Date.now();
      let hits = 0;
      let misses = 0;
      
      for (let i = 0; i < 1000; i++) {
        let key;
        switch (pattern) {
          case 'sequential':
            key = i % cacheSize;
            break;
          case 'random':
            key = Math.floor(Math.random() * cacheSize);
            break;
          case 'hot-spot':
            key = Math.floor(Math.random() * (cacheSize * 0.1)); // 10% hot keys
            break;
        }
        
        if (Math.random() > 0.3) { // 70% cache hit rate
          hits++;
          this.metrics.cacheHits++;
        } else {
          misses++;
          this.metrics.cacheMisses++;
        }
      }
      
      const duration = Date.now() - startTime;
      const hitRate = Math.round((hits / (hits + misses)) * 100);
      
      console.log(`      📊 Hit Rate: ${hitRate}% (${hits}/${hits + misses})`);
      console.log(`      ⚡ Tempo: ${duration}ms para 1000 acessos`);
    }
    
    console.log(`   💾 Cache Stats: ${this.metrics.cacheHits} hits, ${this.metrics.cacheMisses} misses`);
  }

  async demoRealTimeMetrics() {
    console.log('   Simulando métricas Prometheus em tempo real...');
    
    const metrics = [
      { name: 'logs_total', type: 'counter', value: 0 },
      { name: 'processing_duration_seconds', type: 'histogram', value: 0 },
      { name: 'cache_hit_ratio', type: 'gauge', value: 0 },
      { name: 'worker_queue_size', type: 'gauge', value: 0 },
      { name: 'memory_usage_bytes', type: 'gauge', value: 0 }
    ];
    
    console.log('   📊 Coletando métricas por 5 segundos...');
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Simula variação das métricas
      metrics.forEach(metric => {
        switch (metric.type) {
          case 'counter':
            metric.value += Math.floor(Math.random() * 100);
            break;
          case 'histogram':
            metric.value = Math.random() * 2; // 0-2 segundos
            break;
          case 'gauge':
            metric.value = Math.random() * 1000;
            break;
        }
      });
      
      // Calcula hit ratio
      const totalCache = this.metrics.cacheHits + this.metrics.cacheMisses;
      const hitRatio = totalCache > 0 ? (this.metrics.cacheHits / totalCache) * 100 : 0;
      
      console.log(`   ⏱️  ${elapsed.toFixed(1)}s - Logs: ${metrics[0].value}, Cache: ${hitRatio.toFixed(1)}%, Workers: ${Math.floor(metrics[3].value)}`);
      
      if (elapsed >= 5) {
        clearInterval(interval);
        console.log('   ✅ Coleta de métricas concluída');
      }
    }, 1000);
    
    await this.sleep(5500);
  }

  async demoAlertSystem() {
    console.log('   Simulando sistema de alertas automáticos...');
    
    const alertRules = [
      { name: 'High Latency', threshold: 1000, unit: 'ms', severity: 'warning' },
      { name: 'High Error Rate', threshold: 5, unit: '%', severity: 'critical' },
      { name: 'Memory Usage', threshold: 80, unit: '%', severity: 'warning' },
      { name: 'Cache Miss Rate', threshold: 30, unit: '%', severity: 'info' }
    ];
    
    console.log('   🚨 Monitorando métricas por 3 segundos...');
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Simula violações de regras
      alertRules.forEach(rule => {
        if (Math.random() > 0.7) { // 30% chance de violação
          const currentValue = Math.random() * (rule.threshold * 1.5);
          if (currentValue > rule.threshold) {
            this.metrics.alerts++;
            console.log(`      🚨 ALERTA: ${rule.name} - ${currentValue.toFixed(1)}${rule.unit} > ${rule.threshold}${rule.unit} [${rule.severity.toUpperCase()}]`);
          }
        }
      });
      
      if (elapsed >= 3) {
        clearInterval(interval);
        console.log(`   ✅ Sistema de alertas: ${this.metrics.alerts} alertas disparados`);
      }
    }, 500);
    
    await this.sleep(3500);
  }

  async demoStressTestWithOptimizations() {
    console.log('   Executando teste de stress com otimizações...');
    
    const testConfigs = [
      { name: 'Steady Load', logs: 5000, batchSize: 100, delay: 50 },
      { name: 'Spike Load', logs: 2000, batchSize: 200, delay: 10 },
      { name: 'Wave Load', logs: 3000, batchSize: 150, delay: 30 },
      { name: 'Chaos Load', logs: 1000, batchSize: 50, delay: 5 }
    ];
    
    for (const config of testConfigs) {
      console.log(`   🔥 ${config.name}: ${config.logs} logs, batch ${config.batchSize}`);
      
      const startTime = Date.now();
      let processed = 0;
      
      for (let i = 0; i < config.logs; i += config.batchSize) {
        const batch = Math.min(config.batchSize, config.logs - i);
        
        // Simula processamento otimizado
        await this.processBatch(Array.from({ length: batch }, (_, index) => ({
          id: processed + index,
          type: 'stress-test',
          priority: 'normal',
          data: `Stress log ${processed + index}`
        })));
        
        processed += batch;
        this.metrics.logsProcessed += batch;
        
        // Simula delay entre batches
        await this.sleep(config.delay);
      }
      
      const duration = Date.now() - startTime;
      const throughput = Math.round((config.logs / duration) * 1000);
      
      console.log(`      ✅ ${config.logs} logs em ${duration}ms (${throughput}/s)`);
      
      // Simula métricas de performance
      this.performanceHistory.push({
        test: config.name,
        logs: config.logs,
        duration,
        throughput
      });
    }
    
    console.log('   🎯 Teste de stress concluído com otimizações');
  }

  async processBatch(batch) {
    // Simula processamento paralelo
    const promises = batch.map(async (task) => {
      const startTime = Date.now();
      
      // Simula trabalho real
      await this.sleep(Math.random() * 10);
      
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);
      
      return { taskId: task.id, processingTime };
    });
    
    await Promise.all(promises);
  }

  updateAverageProcessingTime(newTime) {
    this.metrics.avgProcessingTime = 
      (this.metrics.avgProcessingTime + newTime) / 2;
  }

  showFinalResults() {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADOS FINAIS DA DEMONSTRAÇÃO');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Tempo Total: ${totalDuration}ms`);
    console.log(`📝 Logs Processados: ${this.metrics.logsProcessed.toLocaleString()}`);
    console.log(`⚙️  Tasks de Workers: ${this.metrics.workerTasks.toLocaleString()}`);
    console.log(`💾 Cache Hits: ${this.metrics.cacheHits.toLocaleString()}`);
    console.log(`❌ Cache Misses: ${this.metrics.cacheMisses.toLocaleString()}`);
    console.log(`🚨 Alertas: ${this.metrics.alerts}`);
    console.log(`⚡ Tempo Médio de Processamento: ${this.metrics.avgProcessingTime.toFixed(2)}ms`);
    
    if (this.performanceHistory.length > 0) {
      console.log('\n🔥 Performance por Teste:');
      this.performanceHistory.forEach(test => {
        console.log(`   ${test.test}: ${test.throughput} logs/s`);
      });
    }
    
    // Calcula melhorias simuladas
    const estimatedImprovement = Math.round(
      (this.metrics.logsProcessed / totalDuration) * 1000
    );
    
    console.log(`\n🚀 Estimativa de Melhoria: ${estimatedImprovement} logs/segundo`);
    console.log('💡 As otimizações implementadas incluem:');
    console.log('   • Worker Pool para processamento paralelo');
    console.log('   • Cache Redis otimizado com TTL inteligente');
    console.log('   • Métricas Prometheus em tempo real');
    console.log('   • Sistema de alertas automáticos');
    console.log('   • Processamento em lotes otimizado');
  }

  async cleanup() {
    this.isRunning = false;
    console.log('\n🧹 Limpeza concluída');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executa a demonstração
if (require.main === module) {
  const demo = new SimpleOptimizationDemo();
  
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Interrompendo demonstração...');
    await demo.cleanup();
    process.exit(0);
  });
  
  demo.start().catch(console.error);
}

module.exports = { SimpleOptimizationDemo };
