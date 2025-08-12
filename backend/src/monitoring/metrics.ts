import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export interface MetricsConfig {
  prefix: string;
  labels: Record<string, string>;
  enableDefaultMetrics: boolean;
}

export class MetricsService {
  private config: MetricsConfig;
  public logsTotal!: Counter<string>;
  public logsByLevel!: Counter<string>;
  public logsBySource!: Counter<string>;
  public logProcessingDuration!: Histogram<string>;
  public logQueueSize!: Gauge<string>;
  public cacheHits!: Counter<string>;
  public cacheMisses!: Counter<string>;
  public cacheHitRatio!: Gauge<string>;
  public workerTasksTotal!: Counter<string>;
  public workerQueueSize!: Gauge<string>;
  public workerProcessingDuration!: Histogram<string>;
  public databaseOperations!: Counter<string>;
  public databaseLatency!: Histogram<string>;
  public analysisTotal!: Counter<string>;
  public analysisDuration!: Histogram<string>;
  public analysisConfidence!: Gauge<string>;
  public systemMemoryUsage!: Gauge<string>;
  public systemCpuUsage!: Gauge<string>;
  public systemUptime!: Gauge<string>;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = {
      prefix: 'moonlight_logger',
      labels: {},
      enableDefaultMetrics: true,
      ...config
    };

    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    const labelNames = ['environment', 'service', 'version'];

    // Métricas de logs
    this.logsTotal = new Counter({
      name: `${this.config.prefix}_logs_total`,
      help: 'Total de logs processados',
      labelNames: [...labelNames, 'level', 'source']
    });

    this.logsByLevel = new Counter({
      name: `${this.config.prefix}_logs_by_level_total`,
      help: 'Total de logs por nível',
      labelNames: [...labelNames, 'level']
    });

    this.logsBySource = new Counter({
      name: `${this.config.prefix}_logs_by_source_total`,
      help: 'Total de logs por fonte',
      labelNames: [...labelNames, 'source']
    });

    this.logProcessingDuration = new Histogram({
      name: `${this.config.prefix}_log_processing_duration_seconds`,
      help: 'Duração do processamento de logs',
      labelNames: [...labelNames, 'level'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
    });

    this.logQueueSize = new Gauge({
      name: `${this.config.prefix}_log_queue_size`,
      help: 'Tamanho atual da fila de logs',
      labelNames: [...labelNames]
    });

    // Métricas de cache
    this.cacheHits = new Counter({
      name: `${this.config.prefix}_cache_hits_total`,
      help: 'Total de hits no cache',
      labelNames: [...labelNames, 'type']
    });

    this.cacheMisses = new Counter({
      name: `${this.config.prefix}_cache_misses_total`,
      help: 'Total de misses no cache',
      labelNames: [...labelNames, 'type']
    });

    this.cacheHitRatio = new Gauge({
      name: `${this.config.prefix}_cache_hit_ratio`,
      help: 'Taxa de hit do cache (0-1)',
      labelNames: [...labelNames]
    });

    // Métricas de workers
    this.workerTasksTotal = new Counter({
      name: `${this.config.prefix}_worker_tasks_total`,
      help: 'Total de tasks processadas por workers',
      labelNames: [...labelNames, 'priority', 'type']
    });

    this.workerQueueSize = new Gauge({
      name: `${this.config.prefix}_worker_queue_size`,
      help: 'Tamanho atual da fila de workers',
      labelNames: [...labelNames]
    });

    this.workerProcessingDuration = new Histogram({
      name: `${this.config.prefix}_worker_processing_duration_seconds`,
      help: 'Duração do processamento por workers',
      labelNames: [...labelNames, 'type'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
    });

    // Métricas de banco de dados
    this.databaseOperations = new Counter({
      name: `${this.config.prefix}_database_operations_total`,
      help: 'Total de operações no banco de dados',
      labelNames: [...labelNames, 'operation', 'collection']
    });

    this.databaseLatency = new Histogram({
      name: `${this.config.prefix}_database_latency_seconds`,
      help: 'Latência das operações de banco de dados',
      labelNames: [...labelNames, 'operation'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
    });

    // Métricas de análise
    this.analysisTotal = new Counter({
      name: `${this.config.prefix}_analysis_total`,
      help: 'Total de análises realizadas',
      labelNames: [...labelNames, 'provider', 'type']
    });

    this.analysisDuration = new Histogram({
      name: `${this.config.prefix}_analysis_duration_seconds`,
      help: 'Duração das análises',
      labelNames: [...labelNames, 'provider'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
    });

    this.analysisConfidence = new Gauge({
      name: `${this.config.prefix}_analysis_confidence`,
      help: 'Confiança média das análises (0-1)',
      labelNames: [...labelNames, 'provider']
    });

    // Métricas do sistema
    this.systemMemoryUsage = new Gauge({
      name: `${this.config.prefix}_system_memory_usage_bytes`,
      help: 'Uso de memória do sistema',
      labelNames: [...labelNames]
    });

    this.systemCpuUsage = new Gauge({
      name: `${this.config.prefix}_system_cpu_usage_percent`,
      help: 'Uso de CPU do sistema',
      labelNames: [...labelNames]
    });

    this.systemUptime = new Gauge({
      name: `${this.config.prefix}_system_uptime_seconds`,
      help: 'Tempo de atividade do sistema',
      labelNames: [...labelNames]
    });

    // Registra métricas padrão do Node.js
    if (this.config.enableDefaultMetrics) {
      collectDefaultMetrics({ register });
    }

    // Registra todas as métricas
    register.registerMetric(this.logsTotal);
    register.registerMetric(this.logsByLevel);
    register.registerMetric(this.logsBySource);
    register.registerMetric(this.logProcessingDuration);
    register.registerMetric(this.logQueueSize);
    register.registerMetric(this.cacheHits);
    register.registerMetric(this.cacheMisses);
    register.registerMetric(this.cacheHitRatio);
    register.registerMetric(this.workerTasksTotal);
    register.registerMetric(this.workerQueueSize);
    register.registerMetric(this.workerProcessingDuration);
    register.registerMetric(this.databaseOperations);
    register.registerMetric(this.databaseLatency);
    register.registerMetric(this.analysisTotal);
    register.registerMetric(this.analysisDuration);
    register.registerMetric(this.analysisConfidence);
    register.registerMetric(this.systemMemoryUsage);
    register.registerMetric(this.systemCpuUsage);
    register.registerMetric(this.systemUptime);
  }

  // Métodos para registrar métricas de logs
  recordLog(level: string, source: string, processingTime: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    
    this.logsTotal.inc({ ...baseLabels, level, source });
    this.logsByLevel.inc({ ...baseLabels, level });
    this.logsBySource.inc({ ...baseLabels, source });
    this.logProcessingDuration.observe({ ...baseLabels, level }, processingTime / 1000);
  }

  setLogQueueSize(size: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    this.logQueueSize.set({ ...baseLabels }, size);
  }

  // Métodos para registrar métricas de cache
  async recordCacheHit(type: string, labels: Record<string, string> = {}): Promise<void> {
    const baseLabels = this.getBaseLabels(labels);
    this.cacheHits.inc({ ...baseLabels, type });
    await this.updateCacheHitRatio();
  }

  async recordCacheMiss(type: string, labels: Record<string, string> = {}): Promise<void> {
    const baseLabels = this.getBaseLabels(labels);
    this.cacheMisses.inc({ ...baseLabels, type });
    await this.updateCacheHitRatio();
  }

  private async updateCacheHitRatio(): Promise<void> {
    try {
      const hits = await this.cacheHits.get();
      const misses = await this.cacheMisses.get();
      const total = (hits.values[0]?.value || 0) + (misses.values[0]?.value || 0);
      
      if (total > 0) {
        const hitRatio = (hits.values[0]?.value || 0) / total;
        this.cacheHitRatio.set({}, hitRatio);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar hit ratio do cache:', error);
    }
  }

  // Métodos para registrar métricas de workers
  recordWorkerTask(priority: string, type: string, processingTime: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    
    this.workerTasksTotal.inc({ ...baseLabels, priority, type });
    this.workerProcessingDuration.observe({ ...baseLabels, type }, processingTime / 1000);
  }

  setWorkerQueueSize(size: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    this.workerQueueSize.set({ ...baseLabels }, size);
  }

  // Métodos para registrar métricas de banco de dados
  recordDatabaseOperation(operation: string, collection: string, latency: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    
    this.databaseOperations.inc({ ...baseLabels, operation, collection });
    this.databaseLatency.observe({ ...baseLabels, operation }, latency / 1000);
  }

  // Métodos para registrar métricas de análise
  recordAnalysis(provider: string, type: string, duration: number, confidence: number, labels: Record<string, string> = {}): void {
    const baseLabels = this.getBaseLabels(labels);
    
    this.analysisTotal.inc({ ...baseLabels, provider, type });
    this.analysisDuration.observe({ ...baseLabels, provider }, duration / 1000);
    this.analysisConfidence.set({ ...baseLabels, provider }, confidence);
  }

  // Métodos para métricas do sistema
  updateSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    this.systemMemoryUsage.set({}, memUsage.heapUsed);
    this.systemCpuUsage.set({}, (cpuUsage.user + cpuUsage.system) / 1000000);
    this.systemUptime.set({}, uptime);
  }

  // Métodos utilitários
  createCustomCounter(name: string, help: string, labelNames: string[] = []): Counter<string> {
    const baseLabels = Object.keys(this.getBaseLabels());
    return new Counter({
      name: `${this.config.prefix}_${name}`,
      help,
      labelNames: [...baseLabels, ...labelNames]
    });
  }

  private getBaseLabels(customLabels: Record<string, string> = {}): Record<string, string> {
    return {
      environment: process.env.NODE_ENV || 'development',
      service: 'moonlight-logger',
      version: process.env.npm_package_version || '1.0.0',
      ...this.config.labels,
      ...customLabels
    };
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  async getMetricsAsJSON(): Promise<Record<string, any>> {
    return await register.getMetricsAsJSON();
  }

  clearMetrics(): void {
    register.clear();
  }

  removeMetric(name: string): void {
    register.removeSingleMetric(name);
  }
}
