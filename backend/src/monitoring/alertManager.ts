import { EventEmitter } from 'events';
import { MetricsService } from './metrics';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: AlertCondition;
  threshold: number;
  duration: number; // segundos
  cooldown: number; // segundos
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'ne';
  threshold: number;
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  timeWindow?: number; // em segundos
}

export interface AlertAction {
  type: 'webhook' | 'email' | 'slack' | 'pagerduty' | 'console';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  name: string;
  description: string;
  severity: AlertRule['severity'];
  status: 'firing' | 'resolved';
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  resolvedAt?: Date;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface AlertManagerConfig {
  checkInterval: number; // segundos
  enableConsoleAlerts: boolean;
  enableWebhookAlerts: boolean;
  webhookUrl?: string;
  slackWebhookUrl?: string;
  emailConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    to: string[];
  };
}

export class AlertManager extends EventEmitter {
  private config: AlertManagerConfig;
  private metrics: MetricsService;
  private rules: AlertRule[] = [];
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private ruleEvaluations: Map<string, { value: number; timestamp: Date }[]> = new Map();

  constructor(metrics: MetricsService, config: Partial<AlertManagerConfig> = {}) {
    super();
    
    this.metrics = metrics;
    this.config = {
      checkInterval: 30,
      enableConsoleAlerts: true,
      enableWebhookAlerts: false,
      ...config
    };

    this.initializeDefaultRules();
    this.startMonitoring();
  }

  private initializeDefaultRules(): void {
    // Regras de performance
    this.addRule({
      id: 'high_latency',
      name: 'Latência Alta',
      description: 'Latência de processamento de logs acima do normal',
      severity: 'high',
      condition: {
        metric: 'log_processing_duration_seconds',
        operator: 'gt',
        threshold: 0.5,
        aggregation: 'avg',
        timeWindow: 300
      },
      threshold: 0.5,
      duration: 60,
      cooldown: 300,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'webhook', config: { url: this.config.webhookUrl }, enabled: !!this.config.webhookUrl }
      ]
    });

    // Regras de erro
    this.addRule({
      id: 'high_error_rate',
      name: 'Taxa de Erro Alta',
      description: 'Taxa de erros acima do normal',
      severity: 'critical',
      condition: {
        metric: 'logs_total',
        operator: 'gt',
        threshold: 0.1,
        aggregation: 'avg',
        timeWindow: 300
      },
      threshold: 0.1,
      duration: 30,
      cooldown: 600,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'slack', config: { webhook: this.config.slackWebhookUrl }, enabled: !!this.config.slackWebhookUrl }
      ]
    });

    // Regras de memória
    this.addRule({
      id: 'high_memory_usage',
      name: 'Uso de Memória Alto',
      description: 'Uso de memória acima de 80%',
      severity: 'medium',
      condition: {
        metric: 'memory_usage_bytes',
        operator: 'gt',
        threshold: 0.8,
        aggregation: 'avg',
        timeWindow: 60
      },
      threshold: 0.8,
      duration: 120,
      cooldown: 300,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true }
      ]
    });

    // Regras de fila
    this.addRule({
      id: 'queue_overflow',
      name: 'Fila de Logs Transbordando',
      description: 'Fila de logs com mais de 1000 itens',
      severity: 'high',
      condition: {
        metric: 'log_queue_size',
        operator: 'gt',
        threshold: 1000,
        aggregation: 'max',
        timeWindow: 60
      },
      threshold: 1000,
      duration: 30,
      cooldown: 180,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'webhook', config: { url: this.config.webhookUrl }, enabled: !!this.config.webhookUrl }
      ]
    });

    // Regras de workers
    this.addRule({
      id: 'worker_failure',
      name: 'Falha de Workers',
      description: 'Taxa de falha de workers acima de 5%',
      severity: 'high',
      condition: {
        metric: 'worker_tasks_total',
        operator: 'gt',
        threshold: 0.05,
        aggregation: 'avg',
        timeWindow: 300
      },
      threshold: 0.05,
      duration: 60,
      cooldown: 300,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true },
        { type: 'slack', config: { webhook: this.config.slackWebhookUrl }, enabled: !!this.config.slackWebhookUrl }
      ]
    });

    // Regras de cache
    this.addRule({
      id: 'cache_miss_rate',
      name: 'Taxa de Cache Miss Alta',
      description: 'Taxa de cache miss acima de 20%',
      severity: 'medium',
      condition: {
        metric: 'cache_misses_total',
        operator: 'gt',
        threshold: 0.2,
        aggregation: 'avg',
        timeWindow: 300
      },
      threshold: 0.2,
      duration: 120,
      cooldown: 300,
      enabled: true,
      actions: [
        { type: 'console', config: {}, enabled: true }
      ]
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.push(rule);
    this.ruleEvaluations.set(rule.id, []);
    console.log(`🔔 Regra de alerta adicionada: ${rule.name}`);
  }

  removeRule(ruleId: string): void {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.rules.splice(index, 1);
      this.ruleEvaluations.delete(ruleId);
      console.log(`🗑️ Regra de alerta removida: ${ruleId}`);
    }
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.evaluateRules();
    }, this.config.checkInterval * 1000);

    console.log(`🚀 Alert Manager iniciado - verificando a cada ${this.config.checkInterval}s`);
  }

  private async evaluateRules(): Promise<void> {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const shouldFire = await this.evaluateRule(rule);
        
        if (shouldFire) {
          await this.fireAlert(rule);
        } else {
          await this.resolveAlert(rule);
        }
      } catch (error) {
        console.error(`❌ Erro ao avaliar regra ${rule.id}:`, error);
      }
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    const evaluations = this.ruleEvaluations.get(rule.id) || [];
    const now = new Date();
    
    // Remove avaliações antigas
    const cutoff = new Date(now.getTime() - (rule.duration * 1000));
    const recentEvaluations = evaluations.filter(e => e.timestamp > cutoff);
    
    // Simula avaliação da métrica (em produção, isso viria do Prometheus)
    const currentValue = this.simulateMetricValue(rule.condition);
    
    // Adiciona nova avaliação
    recentEvaluations.push({ value: currentValue, timestamp: now });
    this.ruleEvaluations.set(rule.id, recentEvaluations);
    
    // Verifica se deve disparar alerta
    if (recentEvaluations.length >= Math.ceil(rule.duration / this.config.checkInterval)) {
      const aggregatedValue = this.aggregateValues(recentEvaluations, rule.condition.aggregation || 'avg');
      return this.compareValues(aggregatedValue, rule.condition.operator, rule.condition.threshold);
    }
    
    return false;
  }

  private simulateMetricValue(condition: AlertCondition): number {
    // Simula valores de métricas (em produção, isso viria do Prometheus)
    const baseValues = {
      'log_processing_duration_seconds': 0.1 + Math.random() * 0.4,
      'logs_total': 100 + Math.random() * 900,
      'memory_usage_bytes': 0.3 + Math.random() * 0.5,
      'log_queue_size': 50 + Math.random() * 200,
      'worker_tasks_total': 0.01 + Math.random() * 0.08,
      'cache_misses_total': 0.1 + Math.random() * 0.3
    };
    
    return baseValues[condition.metric as keyof typeof baseValues] || Math.random();
  }

  private aggregateValues(evaluations: { value: number; timestamp: Date }[], aggregation: string): number {
    const values = evaluations.map(e => e.value);
    
    switch (aggregation) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return values[values.length - 1] || 0;
    }
  }

  private compareValues(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case 'gt': return actual > expected;
      case 'gte': return actual >= expected;
      case 'lt': return actual < expected;
      case 'lte': return actual <= expected;
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      default: return false;
    }
  }

  private async fireAlert(rule: AlertRule): Promise<void> {
    const alertId = `${rule.id}_${Date.now()}`;
    
    // Verifica se já existe alerta ativo
    if (this.activeAlerts.has(rule.id)) {
      const existingAlert = this.activeAlerts.get(rule.id)!;
      
      // Verifica cooldown
      const timeSinceLastAlert = Date.now() - existingAlert.timestamp.getTime();
      if (timeSinceLastAlert < (rule.cooldown * 1000)) {
        return; // Ainda em cooldown
      }
    }
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      status: 'firing',
      value: this.simulateMetricValue(rule.condition),
      threshold: rule.threshold,
      message: `${rule.name}: ${rule.description}`,
      timestamp: new Date(),
      labels: {
        severity: rule.severity,
        rule: rule.id
      },
      annotations: {
        summary: rule.name,
        description: rule.description
      }
    };
    
    this.activeAlerts.set(rule.id, alert);
    this.alertHistory.push(alert);
    
    // Emite evento
    this.emit('alert-fired', alert);
    
    // Executa ações
    await this.executeActions(rule, alert);
    
    console.log(`🚨 ALERTA DISPARADO: ${rule.name} (${rule.severity})`);
  }

  private async resolveAlert(rule: AlertRule): Promise<void> {
    const activeAlert = this.activeAlerts.get(rule.id);
    if (!activeAlert) return;
    
    activeAlert.status = 'resolved';
    activeAlert.resolvedAt = new Date();
    
    // Emite evento
    this.emit('alert-resolved', activeAlert);
    
    console.log(`✅ ALERTA RESOLVIDO: ${rule.name}`);
  }

  private async executeActions(rule: AlertRule, alert: Alert): Promise<void> {
    for (const action of rule.actions) {
      if (!action.enabled) continue;
      
      try {
        switch (action.type) {
          case 'console':
            await this.executeConsoleAction(alert);
            break;
          case 'webhook':
            await this.executeWebhookAction(action.config, alert);
            break;
          case 'slack':
            await this.executeSlackAction(action.config, alert);
            break;
          case 'email':
            await this.executeEmailAction(action.config, alert);
            break;
        }
      } catch (error) {
        console.error(`❌ Erro ao executar ação ${action.type}:`, error);
      }
    }
  }

  private async executeConsoleAction(alert: Alert): Promise<void> {
    const emoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    
    console.log(`\n${emoji[alert.severity]} ALERTA: ${alert.name}`);
    console.log(`📊 Severidade: ${alert.severity.toUpperCase()}`);
    console.log(`📝 Descrição: ${alert.description}`);
    console.log(`📈 Valor: ${alert.value.toFixed(4)} (threshold: ${alert.threshold})`);
    console.log(`⏰ Timestamp: ${alert.timestamp.toISOString()}`);
    console.log('─'.repeat(80));
  }

  private async executeWebhookAction(config: Record<string, any>, alert: Alert): Promise<void> {
    if (!config.url) return;
    
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Moonlight-Logger-AlertManager/1.0'
        },
        body: JSON.stringify({
          alert: {
            id: alert.id,
            name: alert.name,
            description: alert.description,
            severity: alert.severity,
            status: alert.status,
            value: alert.value,
            threshold: alert.threshold,
            timestamp: alert.timestamp.toISOString(),
            labels: alert.labels,
            annotations: alert.annotations
          },
          source: 'moonlight-logger',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Webhook enviado para ${config.url}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar webhook:`, error);
    }
  }

  private async executeSlackAction(config: Record<string, any>, alert: Alert): Promise<void> {
    if (!config.webhook) return;
    
    try {
      const color = {
        low: '#36a64f',
        medium: '#ffcc00',
        high: '#ff8c00',
        critical: '#ff0000'
      };
      
      const response = await fetch(config.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attachments: [{
            color: color[alert.severity],
            title: `🚨 ${alert.name}`,
            text: alert.description,
            fields: [
              {
                title: 'Severidade',
                value: alert.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Valor',
                value: alert.value.toFixed(4),
                short: true
              },
              {
                title: 'Threshold',
                value: alert.threshold.toString(),
                short: true
              },
              {
                title: 'Timestamp',
                value: alert.timestamp.toISOString(),
                short: true
              }
            ],
            footer: 'Moonlight Logger Alert Manager',
            ts: Math.floor(alert.timestamp.getTime() / 1000)
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Slack webhook enviado`);
    } catch (error) {
      console.error(`❌ Erro ao enviar Slack webhook:`, error);
    }
  }

  private async executeEmailAction(config: Record<string, any>, alert: Alert): Promise<void> {
    // Implementação de email seria feita com nodemailer ou similar
    console.log(`📧 Email seria enviado para ${config.to?.join(', ')}`);
  }

  // Métodos públicos
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  getRules(): AlertRule[] {
    return [...this.rules];
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      console.log(`✏️ Regra atualizada: ${ruleId}`);
    }
  }

  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log('🛑 Alert Manager parado');
  }
}
