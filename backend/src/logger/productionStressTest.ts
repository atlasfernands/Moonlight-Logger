import { recordDataVolume, getRedisStatus, setScalingThreshold } from '../config/redis';
import { LogModel } from '../models/Log';
import { LogAnalysisService } from '../services/logAnalysisService';

interface StressTestConfig {
  totalLogs: number;
  batchSize: number;
  delayBetweenBatches: number;
  includeMalformed: boolean;
  trafficPattern: 'steady' | 'spike' | 'wave' | 'chaos' | 'production';
  logLevels: ('info' | 'warn' | 'error' | 'debug')[];
  concurrentUsers: number;
  testDuration: number; // em segundos
  enableMetrics: boolean;
}

interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  totalLogs: number;
  successfulLogs: number;
  failedLogs: number;
  averageLatency: number;
  throughput: number; // logs por segundo
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  scalingEvents: number;
  redisTransitions: number;
}

export class ProductionStressTester {
  private config: StressTestConfig;
  private metrics: PerformanceMetrics;
  private analysisService: LogAnalysisService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: Partial<StressTestConfig> = {}) {
    this.config = {
      totalLogs: 100000, // 100k logs por padrão
      batchSize: 1000,
      delayBetweenBatches: 50,
      includeMalformed: true,
      trafficPattern: 'production',
      logLevels: ['info', 'warn', 'error', 'debug'],
      concurrentUsers: 10,
      testDuration: 300, // 5 minutos
      enableMetrics: true,
      ...config
    };

    this.analysisService = new LogAnalysisService();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    const startTime = process.hrtime.bigint();
    return {
      startTime: Number(startTime),
      endTime: 0,
      totalLogs: 0,
      successfulLogs: 0,
      failedLogs: 0,
      averageLatency: 0,
      throughput: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      scalingEvents: 0,
      redisTransitions: 0
    };
  }

  async startTest(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Teste já está em execução');
      return;
    }

    console.log('🚀 Iniciando teste de stress de produção...');
    console.log(`📊 Configuração: ${JSON.stringify(this.config, null, 2)}`);
    
    this.isRunning = true;
    this.metrics = this.initializeMetrics();
    
    // Configura threshold baixo para testar escalabilidade
    setScalingThreshold(1000);
    
    // Inicia monitoramento em tempo real
    if (this.config.enableMetrics) {
      this.startRealTimeMonitoring();
    }

    try {
      await this.executeTrafficPattern();
    } catch (error) {
      console.error('❌ Erro durante teste:', error);
    } finally {
      await this.finishTest();
    }
  }

  private async executeTrafficPattern(): Promise<void> {
    const { trafficPattern } = this.config;
    
    switch (trafficPattern) {
      case 'production':
        await this.productionTrafficPattern();
        break;
      case 'steady':
        await this.steadyTrafficPattern();
        break;
      case 'spike':
        await this.spikeTrafficPattern();
        break;
      case 'wave':
        await this.waveTrafficPattern();
        break;
      case 'chaos':
        await this.chaosTrafficPattern();
        break;
    }
  }

  private async productionTrafficPattern(): Promise<void> {
    console.log('🏭 Simulando padrão de tráfego de produção...');
    
    // Fase 1: Carga baixa (início do dia)
    console.log('🌅 Fase 1: Carga baixa (0-30s)');
    await this.generateLogs(1000, 100, 100);
    
    // Fase 2: Carga crescente (horário comercial)
    console.log('📈 Fase 2: Carga crescente (30-90s)');
    await this.generateLogs(5000, 500, 50);
    
    // Fase 3: Pico de tráfego (rush hour)
    console.log('🔥 Fase 3: Pico de tráfego (90-150s)');
    await this.generateLogs(20000, 2000, 20);
    
    // Fase 4: Carga sustentada (horário pico)
    console.log('⚡ Fase 4: Carga sustentada (150-240s)');
    await this.generateLogs(30000, 3000, 10);
    
    // Fase 5: Decaimento (fim do dia)
    console.log('🌆 Fase 5: Decaimento (240-300s)');
    await this.generateLogs(10000, 1000, 50);
  }

  private async steadyTrafficPattern(): Promise<void> {
    console.log('📊 Padrão de tráfego estável...');
    await this.generateLogs(50000, 1000, 100);
  }

  private async spikeTrafficPattern(): Promise<void> {
    console.log('📈 Padrão de tráfego com picos...');
    
    // Carga baixa
    await this.generateLogs(10000, 500, 200);
    
    // SPIKE!
    await this.generateLogs(30000, 3000, 10);
    
    // Volta ao normal
    await this.generateLogs(10000, 500, 200);
  }

  private async waveTrafficPattern(): Promise<void> {
    console.log('🌊 Padrão de tráfego em ondas...');
    
    for (let wave = 0; wave < 3; wave++) {
      console.log(`🌊 Onda ${wave + 1}/3`);
      
      // Cresce
      await this.generateLogs(10000, 1000, 50);
      
      // Pico
      await this.generateLogs(20000, 2000, 20);
      
      // Decai
      await this.generateLogs(10000, 1000, 100);
      
      // Pausa entre ondas
      await this.sleep(10000);
    }
  }

  private async chaosTrafficPattern(): Promise<void> {
    console.log('🌀 Padrão caótico - simulando falhas e recuperação...');
    
    // Carga normal
    await this.generateLogs(10000, 1000, 100);
    
    // Simula falha de serviço
    console.log('💥 Simulando falha de serviço...');
    await this.sleep(5000);
    
    // Recuperação com pico
    await this.generateLogs(40000, 4000, 5);
    
    // Estabilização
    await this.generateLogs(10000, 1000, 100);
  }

  public async generateLogs(
    totalLogs: number, 
    batchSize: number, 
    delayMs: number
  ): Promise<void> {
    const batches = Math.ceil(totalLogs / batchSize);
    
    for (let i = 0; i < batches && this.isRunning; i++) {
      const batchStart = Date.now();
      const currentBatchSize = Math.min(batchSize, totalLogs - (i * batchSize));
      
      try {
        await this.processBatch(currentBatchSize);
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

  private async processBatch(batchSize: number): Promise<void> {
    const logs = [];
    
    for (let i = 0; i < batchSize; i++) {
      const logData = this.generateRealisticLog();
      logs.push(logData);
    }

    // Processa em paralelo para simular carga real
    const chunks = this.chunkArray(logs, 100);
    const promises = chunks.map(chunk => this.saveLogs(chunk));
    
    await Promise.all(promises);
    this.metrics.totalLogs += batchSize;
  }

  private generateRealisticLog(): any {
    const levels = this.config.logLevels;
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    if (!level) {
      return this.generateFallbackLog('info');
    }
    
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
    if (!template) return this.generateFallbackLog(level);
    
    const message = this.interpolateTemplate(template);
    
    return {
      level,
      message,
      timestamp: new Date(),
      tags: this.generateTags(level),
      context: this.generateContext(level)
    };
  }

  private generateFallbackLog(level: string): any {
    return {
      level,
      message: `Fallback log message for level ${level}`,
      timestamp: new Date(),
      tags: ['production', 'stress-test', `level-${level}`],
      context: {
        source: 'production-stress-test',
        timestamp: new Date().toISOString()
      }
    };
  }

  private interpolateTemplate(template: string): string {
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

    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key as keyof typeof variables]?.toString() || match);
  }

  private generateTags(level: string): string[] {
    const baseTags = ['production', 'stress-test'];
    const levelTags = [`level-${level}`];
    
    if (level === 'error') {
      levelTags.push('critical', 'alert');
    } else if (level === 'warn') {
      levelTags.push('attention');
    }
    
    return [...baseTags, ...levelTags];
  }

  private generateContext(level: string): any {
    const context: any = {
      source: 'production-stress-test',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
      userId: Math.floor(Math.random() * 10000),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'ProductionStressTester/1.0',
      // Campos obrigatórios do schema
      pid: process.pid,
      origin: 'stress-test'
    };

    if (level === 'error') {
      context.errorCode = `ERR_${Math.floor(Math.random() * 1000)}`;
      context.stackTrace = this.generateMockStackTrace();
    }

    return context;
  }

  private generateMockStackTrace(): string {
    return `Error: Simulated production error
    at ProductionStressTester.generateMockStackTrace (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})
    at ProductionStressTester.generateContext (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})
    at ProductionStressTester.generateRealisticLog (${__filename}:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 100)})`;
  }

  private async saveLogs(logs: any[]): Promise<void> {
    try {
      await LogModel.insertMany(logs);
    } catch (error) {
      console.error('❌ Erro ao salvar logs:', error);
      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private updateMetrics(logsProcessed: number, latency: number): void {
    const currentTime = Date.now();
    const elapsed = currentTime - this.metrics.startTime;
    
    // Atualiza throughput
    this.metrics.throughput = (this.metrics.totalLogs / (elapsed / 1000));
    
    // Atualiza latência média
    const totalLatency = this.metrics.averageLatency * (this.metrics.totalLogs - logsProcessed) + latency;
    this.metrics.averageLatency = totalLatency / this.metrics.totalLogs;
  }

  private checkScalingEvents(): void {
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

  private startRealTimeMonitoring(): void {
    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;
      
      const status = getRedisStatus();
      const memory = process.memoryUsage();
      
      console.log(`📊 [MONITORING] Logs: ${this.metrics.totalLogs} | Throughput: ${this.metrics.throughput.toFixed(2)}/s | Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB | Redis: ${status.connected ? '✅' : '❌'} | Scaling: ${status.scalingMode}`);
    }, 5000); // A cada 5 segundos
  }

  private async finishTest(): Promise<void> {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.metrics.endTime = Date.now();
    const totalDuration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    
    console.log('\n🎯 Teste de stress concluído!');
    console.log('📊 Métricas finais:');
    console.log(`   ⏱️  Duração total: ${totalDuration.toFixed(2)}s`);
    console.log(`   📝 Logs processados: ${this.metrics.totalLogs}`);
    console.log(`   ✅ Sucessos: ${this.metrics.successfulLogs}`);
    console.log(`   ❌ Falhas: ${this.metrics.failedLogs}`);
    console.log(`   🚀 Throughput médio: ${this.metrics.throughput.toFixed(2)} logs/s`);
    console.log(`   ⚡ Latência média: ${this.metrics.averageLatency.toFixed(2)}ms`);
    console.log(`   🔄 Eventos de escalabilidade: ${this.metrics.scalingEvents}`);
    console.log(`   🚀 Transições para Redis: ${this.metrics.redisTransitions}`);
    
    // Salva métricas para análise posterior
    await this.saveTestMetrics();
  }

  private async saveTestMetrics(): Promise<void> {
    try {
      // Aqui você pode salvar as métricas em um arquivo ou banco de dados
      const metricsData = {
        ...this.metrics,
        config: this.config,
        timestamp: new Date().toISOString()
      };
      
      console.log('💾 Métricas salvas para análise posterior');
      console.log('📁 Dados disponíveis em:', JSON.stringify(metricsData, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar métricas:', error);
    }
  }

  public async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stopTest(): Promise<void> {
    if (this.isRunning) {
      console.log('🛑 Parando teste de stress...');
      this.isRunning = false;
      await this.finishTest();
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
