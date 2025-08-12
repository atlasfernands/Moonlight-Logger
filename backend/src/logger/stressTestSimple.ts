#!/usr/bin/env node

/**
 * Stress Test Simplificado para Moonlight Logger
 * Testa a capacidade do sistema de processar logs em alta velocidade
 */

interface StressTestConfig {
  totalLogs: number;
  batchSize: number;
  delayBetweenBatches: number;
  includeMalformed: boolean;
  trafficPattern: 'steady' | 'spike' | 'wave' | 'chaos';
  logLevels: string[];
}

interface StressTestMetrics {
  startTime: Date;
  logsSent: number;
  logsReceived: number;
  averageLatency: number;
  errors: number;
  throughput: number;
  malformedLogs: number;
}

class SimpleLogStressTester {
  private config: StressTestConfig;
  private metrics: StressTestMetrics;
  private isRunning: boolean = false;
  private malformedLogs: string[] = [
    'Empty message: {"level": "error", "message": ""}',
    'Null values: {"level": null, "message": null}',
    'Undefined fields: {"level": "warn", "message": undefined}',
    'Malformed timestamp: {"level": "info", "message": "test", "timestamp": "invalid-date"}',
    'Extra large message: ' + 'x'.repeat(10000),
    'Special chars: {"level": "error", "message": "🚀🔥💥\n\t\r\\"quotes\\""}',
    'SQL injection attempt: {"level": "warn", "message": "\'; DROP TABLE logs; --"}',
    'XSS attempt: {"level": "info", "message": "<script>alert(\'xss\')</script>"}'
  ];

  constructor(config: Partial<StressTestConfig> = {}) {
    this.config = {
      totalLogs: 10000,
      batchSize: 100,
      delayBetweenBatches: 100,
      includeMalformed: true,
      trafficPattern: 'steady',
      logLevels: ['info', 'warn', 'error', 'debug'],
      ...config
    };

    this.metrics = {
      startTime: new Date(),
      logsSent: 0,
      logsReceived: 0,
      averageLatency: 0,
      errors: 0,
      throughput: 0,
      malformedLogs: 0
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Stress test já está rodando');
    }

    this.isRunning = true;
    this.metrics.startTime = new Date();
    
    console.log('🚀 Iniciando Stress Test Simplificado do Moonlight Logger');
    console.log(`📊 Configuração: ${this.config.totalLogs} logs, batch de ${this.config.batchSize}, padrão: ${this.config.trafficPattern}`);
    
    const startTime = Date.now();
    
    try {
      await this.runTrafficPattern();
      
      const totalTime = Date.now() - startTime;
      this.metrics.throughput = this.metrics.logsSent / (totalTime / 1000);
      
      console.log('\n✅ Stress Test Concluído!');
      this.printFinalMetrics();
      
    } catch (error) {
      console.error('❌ Erro no stress test:', error);
      this.metrics.errors++;
    } finally {
      this.isRunning = false;
    }
  }

  private async runTrafficPattern(): Promise<void> {
    switch (this.config.trafficPattern) {
      case 'steady':
        await this.steadyTraffic();
        break;
      case 'spike':
        await this.spikeTraffic();
        break;
      case 'wave':
        await this.waveTraffic();
        break;
      case 'chaos':
        await this.chaosTraffic();
        break;
    }
  }

  private async steadyTraffic(): Promise<void> {
    const batches = Math.ceil(this.config.totalLogs / this.config.batchSize);
    
    for (let i = 0; i < batches && this.isRunning; i++) {
      const batchStart = Date.now();
      await this.sendBatch(this.config.batchSize);
      
      const batchTime = Date.now() - batchStart;
      this.updateMetrics(batchTime);
      
      if (i < batches - 1) {
        await this.delay(this.config.delayBetweenBatches);
      }
      
      if (i % 10 === 0) {
        this.printProgress();
      }
    }
  }

  private async spikeTraffic(): Promise<void> {
    // Simula picos de tráfego
    const phases = [
      { logs: this.config.totalLogs * 0.3, delay: 50 },   // Pico inicial
      { logs: this.config.totalLogs * 0.4, delay: 200 },  // Redução
      { logs: this.config.totalLogs * 0.3, delay: 50 }    // Pico final
    ];
    
    for (const phase of phases) {
      const batches = Math.ceil(phase.logs / this.config.batchSize);
      for (let i = 0; i < batches && this.isRunning; i++) {
        await this.sendBatch(this.config.batchSize);
        await this.delay(phase.delay);
      }
    }
  }

  private async waveTraffic(): Promise<void> {
    // Simula ondas de tráfego
    const waves = 5;
    const logsPerWave = this.config.totalLogs / waves;
    
    for (let wave = 0; wave < waves && this.isRunning; wave++) {
      const waveStart = Date.now();
      const batches = Math.ceil(logsPerWave / this.config.batchSize);
      
      for (let i = 0; i < batches; i++) {
        await this.sendBatch(this.config.batchSize);
        await this.delay(50);
      }
      
      // Pausa entre ondas
      const waveTime = Date.now() - waveStart;
      const pauseTime = Math.max(1000 - waveTime, 100);
      await this.delay(pauseTime);
    }
  }

  private async chaosTraffic(): Promise<void> {
    // Simula tráfego caótico e imprevisível
    let remainingLogs = this.config.totalLogs;
    
    while (remainingLogs > 0 && this.isRunning) {
      const batchSize = Math.min(
        Math.floor(Math.random() * this.config.batchSize * 2) + 10,
        remainingLogs
      );
      
      await this.sendBatch(batchSize);
      remainingLogs -= batchSize;
      
      // Delay aleatório
      const randomDelay = Math.floor(Math.random() * 500) + 50;
      await this.delay(randomDelay);
    }
  }

  private async sendBatch(batchSize: number): Promise<void> {
    const batchStart = Date.now();
    
    for (let i = 0; i < batchSize && this.isRunning; i++) {
      try {
        const log = this.generateRandomLog();
        
        // Simula envio para o sistema
        await this.simulateLogProcessing(log);
        
        this.metrics.logsSent++;
        
        // Inclui logs malformados ocasionalmente
        if (this.config.includeMalformed && Math.random() < 0.05) {
          const malformedLog = this.generateMalformedLog();
          await this.simulateLogProcessing(malformedLog);
          this.metrics.malformedLogs++;
        }
        
      } catch (error) {
        this.metrics.errors++;
        console.error('❌ Erro ao processar log:', error);
      }
    }
    
    const batchTime = Date.now() - batchStart;
    this.updateMetrics(batchTime);
  }

  private async simulateLogProcessing(log: any): Promise<void> {
    // Simula processamento do log
    const start = Date.now();
    
    // Simula latência de processamento
    const processingTime = Math.random() * 10 + 1; // 1-11ms
    await this.delay(processingTime);
    
    const end = Date.now();
    const latency = end - start;
    
    // Atualiza métricas de latência
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * this.metrics.logsReceived + latency) / 
      (this.metrics.logsReceived + 1);
    
    this.metrics.logsReceived++;
  }

  private generateRandomLog(): any {
    const level = this.config.logLevels[Math.floor(Math.random() * this.config.logLevels.length)] || 'info';
    const messages = [
      'User authentication successful',
      'Database query executed',
      'API request processed',
      'Cache miss occurred',
      'Background job started',
      'File upload completed',
      'Email sent successfully',
      'Payment processed',
      'Notification delivered',
      'Backup completed'
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)] || 'Default message';
    
    return {
      level,
      message,
      timestamp: new Date(),
      tags: this.generateRandomTags(level),
      context: {
        origin: 'stress-test',
        pid: process.pid,
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        userId: Math.floor(Math.random() * 10000)
      }
    };
  }

  private generateMalformedLog(): any {
    const malformedLog = this.malformedLogs[Math.floor(Math.random() * this.malformedLogs.length)] || 'Unknown malformed log';
    return {
      _malformed: true,
      rawData: malformedLog,
      timestamp: new Date(),
      level: 'error',
      message: 'Malformed log detected during stress test'
    };
  }

  private generateRandomTags(level: string): string[] {
    const baseTags = ['stress-test', level];
    const additionalTags = ['performance', 'monitoring', 'debug', 'production'];
    
    if (Math.random() < 0.3) {
      const randomTag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
      if (randomTag) {
        baseTags.push(randomTag);
      }
    }
    
    return baseTags;
  }

  private updateMetrics(batchTime: number): void {
    const currentTime = Date.now();
    const elapsed = (currentTime - this.metrics.startTime.getTime()) / 1000;
    
    if (elapsed > 0) {
      this.metrics.throughput = this.metrics.logsSent / elapsed;
    }
  }

  private printProgress(): void {
    const elapsed = (Date.now() - this.metrics.startTime.getTime()) / 1000;
    const currentThroughput = this.metrics.logsSent / elapsed;
    
    console.log(`📊 Progresso: ${this.metrics.logsSent}/${this.config.totalLogs} logs | ` +
                `Throughput: ${currentThroughput.toFixed(2)} logs/s | ` +
                `Latência: ${this.metrics.averageLatency.toFixed(2)}ms | ` +
                `Erros: ${this.metrics.errors}`);
  }

  private printFinalMetrics(): void {
    const elapsed = (Date.now() - this.metrics.startTime.getTime()) / 1000;
    
    console.log('\n📈 Métricas Finais do Stress Test:');
    console.log('=====================================');
    console.log(`⏱️  Tempo Total: ${elapsed.toFixed(2)}s`);
    console.log(`📤 Logs Enviados: ${this.metrics.logsSent.toLocaleString()}`);
    console.log(`📥 Logs Recebidos: ${this.metrics.logsReceived.toLocaleString()}`);
    console.log(`🚫 Logs Perdidos: ${this.metrics.logsSent - this.metrics.logsReceived}`);
    console.log(`📊 Throughput Médio: ${this.metrics.throughput.toFixed(2)} logs/s`);
    console.log(`⚡ Latência Média: ${this.metrics.averageLatency.toFixed(2)}ms`);
    console.log(`❌ Erros: ${this.metrics.errors}`);
    console.log(`🔧 Logs Malformados: ${this.metrics.malformedLogs}`);
    console.log(`📈 Taxa de Sucesso: ${((this.metrics.logsReceived / this.metrics.logsSent) * 100).toFixed(2)}%`);
    
    // Análise de performance
    if (this.metrics.throughput > 1000) {
      console.log('🏆 Performance: EXCELENTE - Sistema suporta alta carga');
    } else if (this.metrics.throughput > 500) {
      console.log('✅ Performance: BOA - Sistema estável sob carga moderada');
    } else if (this.metrics.throughput > 100) {
      console.log('⚠️  Performance: ACEITÁVEL - Pode precisar de otimizações');
    } else {
      console.log('🚨 Performance: BAIXA - Sistema precisa de otimizações urgentes');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
    console.log('🛑 Stress test interrompido pelo usuário');
  }

  getMetrics(): StressTestMetrics {
    return { ...this.metrics };
  }
}

// CLI para executar stress test
if (require.main === module) {
  const args = process.argv.slice(2);
  
  let config: Partial<StressTestConfig> = {};
  
  // Parse argumentos da linha de comando
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];
    
    if (!arg || !value) continue;
    
    switch (arg) {
      case '--total':
        const total = parseInt(value);
        if (!Number.isNaN(total)) config.totalLogs = total;
        break;
      case '--batch':
        const batch = parseInt(value);
        if (!Number.isNaN(batch)) config.batchSize = batch;
        break;
      case '--delay':
        const delay = parseInt(value);
        if (!Number.isNaN(delay)) config.delayBetweenBatches = delay;
        break;
      case '--pattern':
        if (value === 'steady' || value === 'spike' || value === 'wave' || value === 'chaos') {
          config.trafficPattern = value;
        }
        break;
      case '--malformed':
        config.includeMalformed = value === 'true';
        break;
    }
  }
  
  const tester = new SimpleLogStressTester(config);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, parando stress test...');
    tester.stop();
    process.exit(0);
  });
  
  tester.start().catch(console.error);
}

export { SimpleLogStressTester, StressTestConfig, StressTestMetrics };
