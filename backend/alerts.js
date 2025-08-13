/**
 * 🚨 SISTEMA DE ALERTAS INTELIGENTES - MOONLIGHT LOGGER
 * 
 * Detecta padrões nos logs e envia alertas automáticos
 * para problemas críticos e tendências preocupantes.
 */

class IntelligentAlertSystem {
  constructor() {
    this.alerts = [];
    this.patterns = new Map();
    this.thresholds = {
      errorSpike: 5,        // 5+ erros em 1 minuto
      warningFlood: 20,     // 20+ warnings em 1 minuto
      criticalError: 1,     // 1+ erro crítico
      performanceDrop: 0.8, // 80% queda na performance
      memoryLeak: 0.9      // 90% uso de memória
    };
    
    this.alertTypes = {
      ERROR_SPIKE: 'error_spike',
      WARNING_FLOOD: 'warning_flood',
      CRITICAL_ERROR: 'critical_error',
      PERFORMANCE_ISSUE: 'performance_issue',
      MEMORY_LEAK: 'memory_leak',
      PATTERN_DETECTED: 'pattern_detected',
      TREND_ALERT: 'trend_alert'
    };
  }

  /**
   * Analisa um novo log e verifica se deve gerar alertas
   */
  analyzeLog(log) {
    const alerts = [];
    
    // Verifica pico de erros
    if (log.level === 'error') {
      const errorCount = this.countRecentLogs('error', 60000); // 1 minuto
      if (errorCount >= this.thresholds.errorSpike) {
        alerts.push(this.createAlert(
          this.alertTypes.ERROR_SPIKE,
          `🚨 Pico de erros detectado: ${errorCount} erros em 1 minuto`,
          'high',
          {
            errorCount,
            timeWindow: '1 minuto',
            threshold: this.thresholds.errorSpike,
            recentErrors: this.getRecentLogs('error', 60000)
          }
        ));
      }
    }

    // Verifica flood de warnings
    if (log.level === 'warn') {
      const warningCount = this.countRecentLogs('warn', 60000);
      if (warningCount >= this.thresholds.warningFlood) {
        alerts.push(this.createAlert(
          this.alertTypes.WARNING_FLOOD,
          `⚠️ Flood de warnings: ${warningCount} warnings em 1 minuto`,
          'medium',
          {
            warningCount,
            timeWindow: '1 minuto',
            threshold: this.thresholds.warningFlood,
            recentWarnings: this.getRecentLogs('warn', 60000)
          }
        ));
      }
    }

    // Verifica erros críticos
    if (log.level === 'error' && this.isCriticalError(log)) {
      alerts.push(this.createAlert(
        this.alertTypes.CRITICAL_ERROR,
        `💥 Erro crítico detectado: ${log.message}`,
        'critical',
        {
          message: log.message,
          source: log.context?.source,
          stackTrace: log.context?.stackTrace,
          timestamp: log.timestamp
        }
      ));
    }

    // Detecta padrões
    const pattern = this.detectPattern(log);
    if (pattern) {
      alerts.push(this.createAlert(
        this.alertTypes.PATTERN_DETECTED,
        `🔍 Padrão detectado: ${pattern.description}`,
        'medium',
        {
          pattern: pattern.name,
          description: pattern.description,
          occurrences: pattern.occurrences,
          confidence: pattern.confidence
        }
      ));
    }

    // Adiciona os alertas à lista
    this.alerts.push(...alerts);
    
    return alerts;
  }

  /**
   * Verifica se um erro é crítico
   */
  isCriticalError(log) {
    const criticalKeywords = [
      'database', 'connection', 'timeout', 'memory', 'crash',
      'fatal', 'critical', 'emergency', 'panic', 'corruption'
    ];
    
    const message = log.message.toLowerCase();
    const tags = (log.tags || []).map(tag => tag.toLowerCase());
    
    return criticalKeywords.some(keyword => 
      message.includes(keyword) || tags.includes(keyword)
    );
  }

  /**
   * Detecta padrões nos logs
   */
  detectPattern(log) {
    const key = `${log.level}:${log.context?.source || 'unknown'}`;
    
    if (!this.patterns.has(key)) {
      this.patterns.set(key, {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        messages: new Set()
      });
    }
    
    const pattern = this.patterns.get(key);
    pattern.count++;
    pattern.lastSeen = Date.now();
    pattern.messages.add(log.message);
    
    // Detecta padrões baseados em frequência e similaridade
    const timeWindow = 300000; // 5 minutos
    const frequency = pattern.count / ((Date.now() - pattern.firstSeen) / timeWindow);
    
    if (frequency > 2 && pattern.messages.size < 3) {
      return {
        name: key,
        description: `Muitos logs similares de ${log.context?.source || 'origem desconhecida'}`,
        occurrences: pattern.count,
        confidence: Math.min(frequency / 5, 1.0)
      };
    }
    
    return null;
  }

  /**
   * Conta logs recentes por tipo
   */
  countRecentLogs(level, timeWindow) {
    const cutoff = Date.now() - timeWindow;
    return this.alerts.filter(alert => 
      alert.timestamp > cutoff && 
      alert.data?.recentErrors?.some(log => log.level === level)
    ).length;
  }

  /**
   * Obtém logs recentes por tipo
   */
  getRecentLogs(level, timeWindow) {
    const cutoff = Date.now() - timeWindow;
    // Esta função seria implementada com acesso aos logs armazenados
    return [];
  }

  /**
   * Cria um alerta estruturado
   */
  createAlert(type, message, severity, data) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      severity,
      timestamp: new Date(),
      data,
      acknowledged: false,
      resolved: false
    };
    
    return alert;
  }

  /**
   * Obtém todos os alertas ativos
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Marca um alerta como resolvido
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Obtém estatísticas dos alertas
   */
  getAlertStats() {
    const total = this.alerts.length;
    const active = this.getActiveAlerts().length;
    const critical = this.alerts.filter(a => a.severity === 'critical').length;
    const high = this.alerts.filter(a => a.severity === 'high').length;
    const medium = this.alerts.filter(a => a.severity === 'medium').length;
    
    return {
      total,
      active,
      critical,
      high,
      medium,
      resolved: total - active
    };
  }
}

module.exports = IntelligentAlertSystem;
