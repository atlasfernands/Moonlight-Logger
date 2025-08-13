/**
 * 📈 ANÁLISE DE TENDÊNCIAS TEMPORAIS - MOONLIGHT LOGGER
 * 
 * Analisa padrões temporais nos logs para identificar tendências,
 * sazonalidade e fornecer insights preditivos.
 */

class TrendAnalysisSystem {
  constructor() {
    this.timeWindows = {
      HOUR: 60 * 60 * 1000,      // 1 hora
      DAY: 24 * 60 * 60 * 1000,  // 1 dia
      WEEK: 7 * 24 * 60 * 60 * 1000, // 1 semana
      MONTH: 30 * 24 * 60 * 60 * 1000 // 1 mês
    };
    
    this.trends = new Map();
    this.seasonality = new Map();
    this.predictions = new Map();
    
    this.analysisTypes = {
      VOLUME_TREND: 'volume_trend',
      ERROR_TREND: 'error_trend',
      PERFORMANCE_TREND: 'performance_trend',
      SEASONALITY: 'seasonality',
      ANOMALY_DETECTION: 'anomaly_detection',
      FORECASTING: 'forecasting'
    };
  }

  /**
   * Analisa tendências temporais dos logs
   */
  analyzeTemporalTrends(logs, timeRange = 'day') {
    const window = this.timeWindows[timeRange.toUpperCase()] || this.timeWindows.DAY;
    const now = Date.now();
    const cutoff = now - window;
    
    // Filtra logs do período
    const recentLogs = logs.filter(log => log.timestamp >= cutoff);
    
    // Agrupa por intervalos de tempo
    const timeBuckets = this.createTimeBuckets(recentLogs, window);
    
    // Analisa tendências por nível
    const trends = {};
    for (const level of ['info', 'warn', 'error']) {
      trends[level] = this.analyzeLevelTrend(timeBuckets, level);
    }
    
    // Analisa tendência geral de volume
    trends.volume = this.analyzeVolumeTrend(timeBuckets);
    
    // Detecta sazonalidade
    const seasonality = this.detectSeasonality(timeBuckets);
    
    // Identifica anomalias
    const anomalies = this.detectAnomalies(timeBuckets, trends);
    
    // Gera previsões
    const predictions = this.generateForecasts(trends, seasonality);
    
    return {
      trends,
      seasonality,
      anomalies,
      predictions,
      timeRange,
      analysisTimestamp: now
    };
  }

  /**
   * Cria buckets de tempo para análise
   */
  createTimeBuckets(logs, windowSize) {
    const buckets = new Map();
    const bucketCount = Math.ceil(windowSize / (60 * 1000)); // 1 minuto por bucket
    
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = Date.now() - (i * 60 * 1000);
      const bucketEnd = bucketStart + (60 * 1000);
      
      buckets.set(bucketStart, {
        start: bucketStart,
        end: bucketEnd,
        logs: [],
        counts: { info: 0, warn: 0, error: 0 },
        total: 0
      });
    }
    
    // Distribui logs pelos buckets
    for (const log of logs) {
      const bucketStart = Math.floor(log.timestamp / (60 * 1000)) * (60 * 1000);
      const bucket = buckets.get(bucketStart);
      
      if (bucket) {
        bucket.logs.push(log);
        bucket.counts[log.level]++;
        bucket.total++;
      }
    }
    
    return Array.from(buckets.values()).reverse(); // Mais recente primeiro
  }

  /**
   * Analisa tendência de um nível específico
   */
  analyzeLevelTrend(timeBuckets, level) {
    const values = timeBuckets.map(bucket => bucket.counts[level]);
    const trend = this.calculateTrend(values);
    
    return {
      level,
      values,
      trend: trend.direction,
      slope: trend.slope,
      confidence: trend.confidence,
      change: trend.change,
      volatility: this.calculateVolatility(values)
    };
  }

  /**
   * Analisa tendência de volume geral
   */
  analyzeVolumeTrend(timeBuckets) {
    const values = timeBuckets.map(bucket => bucket.total);
    const trend = this.calculateTrend(values);
    
    return {
      values,
      trend: trend.direction,
      slope: trend.slope,
      confidence: trend.confidence,
      change: trend.change,
      volatility: this.calculateVolatility(values),
      peak: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length
    };
  }

  /**
   * Calcula direção e força da tendência
   */
  calculateTrend(values) {
    if (values.length < 2) {
      return { direction: 'stable', slope: 0, confidence: 0, change: 0 };
    }
    
    // Calcula regressão linear simples
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + (b * y[i]), 0);
    const sumXX = x.reduce((a, b) => a + (b * b), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calcula R² para confiança
    const yMean = sumY / n;
    const ssRes = y.reduce((a, b, i) => a + Math.pow(b - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    
    // Determina direção da tendência
    let direction = 'stable';
    if (Math.abs(slope) > 0.1) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }
    
    // Calcula mudança percentual
    const change = values.length > 0 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;
    
    return {
      direction,
      slope,
      confidence: rSquared,
      change: Math.round(change * 100) / 100
    };
  }

  /**
   * Calcula volatilidade dos valores
   */
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Detecta padrões sazonais
   */
  detectSeasonality(timeBuckets) {
    const patterns = {};
    
    // Análise por hora do dia
    patterns.hourly = this.analyzeHourlyPattern(timeBuckets);
    
    // Análise por dia da semana
    patterns.daily = this.analyzeDailyPattern(timeBuckets);
    
    // Análise por período do dia
    patterns.periods = this.analyzeDayPeriods(timeBuckets);
    
    return patterns;
  }

  /**
   * Analisa padrão por hora
   */
  analyzeHourlyPattern(timeBuckets) {
    const hourlyCounts = new Array(24).fill(0);
    const hourlyErrors = new Array(24).fill(0);
    
    for (const bucket of timeBuckets) {
      const hour = new Date(bucket.start).getHours();
      hourlyCounts[hour] += bucket.total;
      hourlyErrors[hour] += bucket.counts.error;
    }
    
    // Identifica picos e vales
    const maxHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
    const minHour = hourlyCounts.indexOf(Math.min(...hourlyCounts));
    const maxErrorHour = hourlyErrors.indexOf(Math.max(...hourlyErrors));
    
    return {
      counts: hourlyCounts,
      errors: hourlyErrors,
      peakHour: maxHour,
      lowHour: minHour,
      errorPeakHour: maxErrorHour,
      pattern: this.classifyHourlyPattern(hourlyCounts)
    };
  }

  /**
   * Classifica padrão horário
   */
  classifyHourlyPattern(hourlyCounts) {
    const total = hourlyCounts.reduce((a, b) => a + b, 0);
    const average = total / 24;
    
    // Calcula desvio padrão
    const variance = hourlyCounts.reduce((a, b) => a + Math.pow(b - average, 2), 0) / 24;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < average * 0.2) return 'stable';
    if (stdDev < average * 0.5) return 'moderate_variation';
    if (stdDev < average * 0.8) return 'high_variation';
    return 'extreme_variation';
  }

  /**
   * Analisa padrão por dia da semana
   */
  analyzeDailyPattern(timeBuckets) {
    const dailyCounts = new Array(7).fill(0);
    const dailyErrors = new Array(7).fill(0);
    
    for (const bucket of timeBuckets) {
      const day = new Date(bucket.start).getDay();
      dailyCounts[day] += bucket.total;
      dailyErrors[day] += bucket.counts.error;
    }
    
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const maxDay = dayNames[dailyCounts.indexOf(Math.max(...dailyCounts))];
    const minDay = dayNames[dailyCounts.indexOf(Math.min(...dailyCounts))];
    
    return {
      counts: dailyCounts,
      errors: dailyErrors,
      peakDay: maxDay,
      lowDay: minDay,
      weekendEffect: this.calculateWeekendEffect(dailyCounts)
    };
  }

  /**
   * Calcula efeito do fim de semana
   */
  calculateWeekendEffect(dailyCounts) {
    const weekday = (dailyCounts[1] + dailyCounts[2] + dailyCounts[3] + dailyCounts[4] + dailyCounts[5]) / 5;
    const weekend = (dailyCounts[0] + dailyCounts[6]) / 2;
    
    if (weekday === 0) return 0;
    
    return Math.round(((weekend - weekday) / weekday) * 100);
  }

  /**
   * Analisa períodos do dia
   */
  analyzeDayPeriods(timeBuckets) {
    const periods = {
      morning: { start: 6, end: 12, count: 0, errors: 0 },
      afternoon: { start: 12, end: 18, count: 0, errors: 0 },
      evening: { start: 18, end: 22, count: 0, errors: 0 },
      night: { start: 22, end: 6, count: 0, errors: 0 }
    };
    
    for (const bucket of timeBuckets) {
      const hour = new Date(bucket.start).getHours();
      
      for (const [period, config] of Object.entries(periods)) {
        if (period === 'night') {
          if (hour >= config.start || hour < config.end) {
            config.count += bucket.total;
            config.errors += bucket.counts.error;
          }
        } else {
          if (hour >= config.start && hour < config.end) {
            config.count += bucket.total;
            config.errors += bucket.counts.error;
          }
        }
      }
    }
    
    return periods;
  }

  /**
   * Detecta anomalias nos dados
   */
  detectAnomalies(timeBuckets, trends) {
    const anomalies = [];
    
    for (const bucket of timeBuckets) {
      // Anomalia de volume
      const volumeAnomaly = this.detectVolumeAnomaly(bucket, trends.volume);
      if (volumeAnomaly) {
        anomalies.push(volumeAnomaly);
      }
      
      // Anomalia de erros
      const errorAnomaly = this.detectErrorAnomaly(bucket, trends.error);
      if (errorAnomaly) {
        anomalies.push(errorAnomaly);
      }
    }
    
    return anomalies;
  }

  /**
   * Detecta anomalia de volume
   */
  detectVolumeAnomaly(bucket, volumeTrend) {
    const threshold = volumeTrend.average * 2; // 2x a média
    const zScore = Math.abs((bucket.total - volumeTrend.average) / volumeTrend.volatility);
    
    if (bucket.total > threshold && zScore > 2) {
      return {
        type: 'volume_spike',
        timestamp: bucket.start,
        value: bucket.total,
        threshold,
        zScore: Math.round(zScore * 100) / 100,
        severity: zScore > 3 ? 'high' : 'medium'
      };
    }
    
    return null;
  }

  /**
   * Detecta anomalia de erros
   */
  detectErrorAnomaly(bucket, errorTrend) {
    if (errorTrend.values.length === 0) return null;
    
    const errorRate = bucket.counts.error / Math.max(bucket.total, 1);
    const avgErrorRate = errorTrend.values.reduce((a, b) => a + b, 0) / errorTrend.values.length;
    const threshold = avgErrorRate * 3; // 3x a taxa média de erro
    
    if (errorRate > threshold) {
      return {
        type: 'error_spike',
        timestamp: bucket.start,
        errorRate: Math.round(errorRate * 1000) / 1000,
        threshold: Math.round(threshold * 1000) / 1000,
        severity: errorRate > threshold * 2 ? 'high' : 'medium'
      };
    }
    
    return null;
  }

  /**
   * Gera previsões baseadas nas tendências
   */
  generateForecasts(trends, seasonality) {
    const forecasts = {};
    
    // Previsão de volume para próximas 24 horas
    forecasts.volume24h = this.forecastVolume(trends.volume, 24);
    
    // Previsão de erros para próximas 24 horas
    forecasts.errors24h = this.forecastErrors(trends.error, 24);
    
    // Previsão de picos baseada na sazonalidade
    forecasts.peakPrediction = this.predictPeaks(seasonality);
    
    return forecasts;
  }

  /**
   * Previsão de volume
   */
  forecastVolume(volumeTrend, hours) {
    const currentValue = volumeTrend.values[volumeTrend.values.length - 1] || 0;
    const predictedChange = volumeTrend.slope * hours;
    const predictedValue = Math.max(0, currentValue + predictedChange);
    
    return {
      current: currentValue,
      predicted: Math.round(predictedValue),
      change: Math.round(predictedChange),
      confidence: volumeTrend.confidence,
      trend: volumeTrend.trend
    };
  }

  /**
   * Previsão de erros
   */
  forecastErrors(errorTrend, hours) {
    const currentValue = errorTrend.values[errorTrend.values.length - 1] || 0;
    const predictedChange = errorTrend.slope * hours;
    const predictedValue = Math.max(0, currentValue + predictedChange);
    
    return {
      current: currentValue,
      predicted: Math.round(predictedValue),
      change: Math.round(predictedChange),
      confidence: errorTrend.confidence,
      trend: errorTrend.trend
    };
  }

  /**
   * Prediz próximos picos baseado na sazonalidade
   */
  predictPeaks(seasonality) {
    const predictions = [];
    
    if (seasonality.hourly && seasonality.hourly.peakHour !== undefined) {
      const now = new Date();
      const currentHour = now.getHours();
      const nextPeak = this.findNextHour(currentHour, seasonality.hourly.peakHour);
      
      predictions.push({
        type: 'hourly_peak',
        nextOccurrence: nextPeak,
        confidence: 'high',
        reason: `Pico horário típico às ${seasonality.hourly.peakHour}:00`
      });
    }
    
    return predictions;
  }

  /**
   * Encontra próxima ocorrência de uma hora específica
   */
  findNextHour(currentHour, targetHour) {
    let nextHour = targetHour;
    let daysAhead = 0;
    
    if (nextHour <= currentHour) {
      nextHour += 24;
      daysAhead = 1;
    }
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysAhead);
    nextDate.setHours(nextHour, 0, 0, 0);
    
    return nextDate;
  }

  /**
   * Obtém resumo das tendências
   */
  getTrendSummary() {
    return {
      totalTrends: this.trends.size,
      activeAnalysis: Array.from(this.trends.keys()),
      lastUpdate: new Date(),
      insights: this.generateInsights()
    };
  }

  /**
   * Gera insights baseados nas tendências
   */
  generateInsights() {
    const insights = [];
    
    // Aqui você pode implementar lógica para gerar insights
    // baseados nos dados coletados
    
    return insights;
  }
}

module.exports = TrendAnalysisSystem;
