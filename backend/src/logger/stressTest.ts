import { LogModel } from '../models/Log';
import { parseLogMessage } from './parser';

interface StressTestConfig {
  totalLogs: number;
  batchSize: number;
  delayBetweenBatches: number;
  includeMalformed: boolean;
  trafficPattern: 'steady' | 'spike' | 'wave' | 'chaos';
  logLevels: Array<'info' | 'warn' | 'error' | 'debug'>;
}

interface StressTestMetrics {
  startTime: Date;
  logsSent: number;
  logsReceived: number;
  averageLatency: number;
  errors: number;
  throughput: number; // logs/second
  malformedLogs: number;
}

class LogStressTester {
  private config: StressTestConfig;
  private metrics: StressTestMetrics;
  private isRunning: boolean = false;
  private malformedLogs: string[] = [
    'Invalid JSON: {"level": "info", "message": "test}',
    'Missing level: {"message": "test message"}',
    'Empty message: {"level": "error", "message": ""}',
    'Null values: {"level": null, "message": null}',
    'Undefined fields: {"level": "warn", "message": undefined}',
    'Malformed timestamp: {"level": "info", "message": "test", "timestamp": "invalid-date"}',
    'Extra large message: ' + 'x'.repeat(10000),
    'Special chars: {"level": "error", "message": "🚀🔥💥\n\t\r\\"quotes\\""}',
    'SQL injection attempt: {"level": "warn", "message": "'; DROP TABLE logs; --"}',
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
    
    console.log('🚀 Iniciando Stress Test do Moonlight Logger');
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
    }
  }

  private async spikeTraffic(): Promise<void> {
    // Simula picos de tráfego
    const phases = [
      { logs: this.config.totalLogs * 0.3, delay: 50 },   // Pico inicial
      { logs: this.config.totalLogs * 0.4, delay: 200 },  // Redução
      { logs: this.config.totalLogs * 0.2, delay: 100 },  // Pico final
      { logs: this.config.totalLogs * 0.1, delay: 500 }   // Redução final
    ];

    for (const phase of phases) {
      const batches = Math.ceil(phase.logs / this.config.batchSize);
      
      for (let i = 0; i < batches && this.isRunning; i++) {
        const batchStart = Date.now();
        await this.sendBatch(this.config.batchSize);
        
        const batchTime = Date.now() - batchStart;
        this.updateMetrics(batchTime);
        
        if (i < batches - 1) {
          await this.delay(phase.delay);
        }
      }
    }
  }

  private async waveTraffic(): Promise<void> {
    // Simula ondas de tráfego
    const waves = 5;
    const logsPerWave = this.config.totalLogs / waves;
    
    for (let wave = 0; wave < waves && this.isRunning; wave++) {
      const waveStart = Date.now();
      const waveDelay = 50 + (wave * 20); // Aumenta delay a cada onda
      
      const batches = Math.ceil(logsPerWave / this.config.batchSize);
      
      for (let i = 0; i < batches && this.isRunning; i++) {
        const batchStart = Date.now();
        await this.sendBatch(this.config.batchSize);
        
        const batchTime = Date.now() - batchStart;
        this.updateMetrics(batchTime);
        
        if (i < batches - 1) {
          await this.delay(waveDelay);
        }
      }
      
      // Pausa entre ondas
      if (wave < waves - 1) {
        await this.delay(1000);
      }
    }
  }

  private async chaosTraffic(): Promise<void> {
    // Simula tráfego caótico e imprevisível
    let remainingLogs = this.config.totalLogs;
    
    while (remainingLogs > 0 && this.isRunning) {
      const batchSize = Math.min(
        this.config.batchSize,
        Math.floor(Math.random() * 200) + 50 // 50-250 logs por batch
      );
      
      const delay = Math.floor(Math.random() * 500) + 50; // 50-550ms
      
      const batchStart = Date.now();
      await this.sendBatch(batchSize);
      
      const batchTime = Date.now() - batchStart;
      this.updateMetrics(batchTime);
      
      remainingLogs -= batchSize;
      
      if (remainingLogs > 0) {
        await this.delay(delay);
      }
    }
  }

  private async sendBatch(batchSize: number): Promise<void> {
    const logs = [];
    
    for (let i = 0; i < batchSize; i++) {
      const log = this.generateRandomLog();
      logs.push(log);
    }
    
    // Adiciona logs malformados se configurado
    if (this.config.includeMalformed && Math.random() < 0.05) {
      const malformedLog = this.generateMalformedLog();
      logs.push(malformedLog);
      this.metrics.malformedLogs++;
    }
    
    try {
      const startTime = Date.now();
      
      // Envia logs em paralelo para simular carga real
      const promises = logs.map(log => this.sendLog(log));
      await Promise.allSettled(promises);
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      this.metrics.logsSent += logs.length;
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (this.metrics.logsSent - logs.length) + latency) / this.metrics.logsSent;
      
      // Log de progresso
      if (this.metrics.logsSent % 1000 === 0) {
        this.printProgress();
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar batch:', error);
      this.metrics.errors++;
    }
  }

  private async sendLog(logData: any): Promise<void> {
    try {
      const log = new LogModel(logData);
      await log.save();
      this.metrics.logsReceived++;
    } catch (error) {
      // Logs malformados podem falhar - isso é esperado
      if (logData._malformed) {
        // Log esperado para logs malformados
        return;
      }
      
      console.error('❌ Erro ao salvar log:', error);
      this.metrics.errors++;
    }
  }

  private generateRandomLog(): any {
    const level = this.config.logLevels[Math.floor(Math.random() * this.config.logLevels.length)];
    const messages = [
      'User authentication successful',
      'Database connection established',
      'API request processed',
      'Cache miss occurred',
      'Background job completed',
      'File upload successful',
      'Email sent successfully',
      'Payment processed',
      'Notification delivered',
      'Backup completed'
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    const parsed = parseLogMessage(message);
    
    return {
      level,
      message,
      timestamp: new Date(),
      tags: this.generateRandomTags(level),
      context: {
        origin: 'stress-test',
        pid: process.pid,
        ...(parsed.file && { file: parsed.file }),
        ...(parsed.line && { line: parsed.line }),
        ...(parsed.column && { column: parsed.column })
      }
    };
  }

  private generateMalformedLog(): any {
    const malformedLog = this.malformedLogs[Math.floor(Math.random() * this.malformedLogs.length)];
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
      baseTags.push(additionalTags[Math.floor(Math.random() * additionalTags.length)]);
    }
    
    return baseTags;
  }

  private updateMetrics(batchTime: number): void {
    // Atualiza métricas em tempo real
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
    switch (args[i]) {
      case '--total':
        config.totalLogs = parseInt(args[i + 1]);
        break;
      case '--batch':
        config.batchSize = parseInt(args[i + 1]);
        break;
      case '--delay':
        config.delayBetweenBatches = parseInt(args[i + 1]);
        break;
      case '--pattern':
        config.trafficPattern = args[i + 1] as any;
        break;
      case '--malformed':
        config.includeMalformed = args[i + 1] === 'true';
        break;
    }
  }
  
  const tester = new LogStressTester(config);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, parando stress test...');
    tester.stop();
    process.exit(0);
  });
  
  tester.start().catch(console.error);
}

export { LogStressTester, StressTestConfig, StressTestMetrics };
