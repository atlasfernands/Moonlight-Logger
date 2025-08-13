/**
 * 🚀 DEMONSTRAÇÃO DAS NOVAS FUNCIONALIDADES - MOONLIGHT LOGGER
 * 
 * Este script demonstra todas as funcionalidades avançadas implementadas:
 * - Alertas Inteligentes
 * - Clustering de Logs
 * - Análise de Tendências Temporais
 * - Integração com Slack/Discord
 * - Análise de Sentimento
 */

const IntelligentAlertSystem = require('./backend/alerts');
const LogClusteringSystem = require('./backend/log-clustering');
const TrendAnalysisSystem = require('./backend/trend-analysis');
const IntegrationManager = require('./backend/integrations/slack-discord');
const SentimentAnalysisSystem = require('./backend/sentiment-analysis');

class AdvancedFeaturesDemo {
  constructor() {
    this.alertSystem = new IntelligentAlertSystem();
    this.clusteringSystem = new LogClusteringSystem();
    this.trendSystem = new TrendAnalysisSystem();
    this.integrationManager = new IntegrationManager();
    this.sentimentSystem = new SentimentAnalysisSystem();
    
    this.demoLogs = [];
    this.demoStartTime = Date.now();
  }

  /**
   * Executa a demonstração completa
   */
  async runDemo() {
    console.log('🌙 MOONLIGHT LOGGER - DEMONSTRAÇÃO DAS FUNCIONALIDADES AVANÇADAS');
    console.log('=' .repeat(70));
    
    try {
      // 1. Configura integrações
      await this.setupIntegrations();
      
      // 2. Gera logs de demonstração
      await this.generateDemoLogs();
      
      // 3. Demonstra sistema de alertas
      await this.demonstrateAlerts();
      
      // 4. Demonstra clustering de logs
      await this.demonstrateClustering();
      
      // 5. Demonstra análise de tendências
      await this.demonstrateTrends();
      
      // 6. Demonstra análise de sentimento
      await this.demonstrateSentiment();
      
      // 7. Demonstra integrações
      await this.demonstrateIntegrations();
      
      // 8. Mostra dashboard consolidado
      this.showConsolidatedDashboard();
      
    } catch (error) {
      console.error('❌ Erro na demonstração:', error.message);
    }
  }

  /**
   * Configura integrações para demonstração
   */
  async setupIntegrations() {
    console.log('\n🔗 CONFIGURANDO INTEGRAÇÕES...');
    
    // Slack (simulado)
    const slackId = this.integrationManager.configureIntegration('slack', {
      webhookUrl: 'https://hooks.slack.com/services/demo/webhook',
      channels: ['#alerts', '#errors'],
      notificationLevels: ['error', 'warning', 'alert']
    });
    
    // Discord (simulado)
    const discordId = this.integrationManager.configureIntegration('discord', {
      webhookUrl: 'https://discord.com/api/webhooks/demo',
      channels: ['#alerts', '#errors'],
      notificationLevels: ['error', 'warning', 'alert']
    });
    
    console.log(`✅ Slack configurado: ${slackId}`);
    console.log(`✅ Discord configurado: ${discordId}`);
    
    this.integrationIds = { slack: slackId, discord: discordId };
  }

  /**
   * Gera logs de demonstração variados
   */
  async generateDemoLogs() {
    console.log('\n📝 GERANDO LOGS DE DEMONSTRAÇÃO...');
    
    const logTemplates = [
      // Logs de sucesso
      { level: 'info', message: 'Usuário autenticado com sucesso', tags: ['auth', 'success'], source: 'auth-service' },
      { level: 'info', message: 'Transação processada com sucesso', tags: ['payment', 'success'], source: 'payment-service' },
      { level: 'info', message: 'Cache atualizado com sucesso', tags: ['cache', 'success'], source: 'cache-service' },
      
      // Logs de warning
      { level: 'warn', message: 'Performance degradada detectada', tags: ['performance', 'warning'], source: 'monitor-service' },
      { level: 'warn', message: 'Conexão de banco lenta', tags: ['database', 'warning'], source: 'db-service' },
      { level: 'warn', message: 'Muitas requisições simultâneas', tags: ['load', 'warning'], source: 'api-gateway' },
      
      // Logs de erro
      { level: 'error', message: 'Falha na conexão com banco de dados', tags: ['database', 'error', 'critical'], source: 'db-service' },
      { level: 'error', message: 'Timeout na autenticação', tags: ['auth', 'error', 'timeout'], source: 'auth-service' },
      { level: 'error', message: 'Memória insuficiente', tags: ['system', 'error', 'memory'], source: 'system-monitor' },
      { level: 'error', message: 'Erro crítico no processamento', tags: ['processing', 'error', 'fatal'], source: 'worker-service' },
      
      // Logs com padrões repetitivos
      { level: 'warn', message: 'Rate limit excedido para IP 192.168.1.100', tags: ['security', 'rate-limit'], source: 'security-service' },
      { level: 'warn', message: 'Rate limit excedido para IP 192.168.1.101', tags: ['security', 'rate-limit'], source: 'security-service' },
      { level: 'warn', message: 'Rate limit excedido para IP 192.168.1.102', tags: ['security', 'rate-limit'], source: 'security-service' },
      
      // Logs de performance
      { level: 'info', message: 'Response time: 150ms', tags: ['performance', 'metrics'], source: 'api-service' },
      { level: 'info', message: 'Response time: 180ms', tags: ['performance', 'metrics'], source: 'api-service' },
      { level: 'info', message: 'Response time: 220ms', tags: ['performance', 'metrics'], source: 'api-service' },
      
      // Logs com sentimento
      { level: 'error', message: 'Sistema completamente quebrado e inutilizável', tags: ['system', 'critical'], source: 'main-service' },
      { level: 'info', message: 'Sistema funcionando perfeitamente e de forma otimizada', tags: ['system', 'status'], source: 'main-service' },
      { level: 'warn', message: 'Algo está estranho e não consigo identificar o problema', tags: ['system', 'mystery'], source: 'debug-service' }
    ];
    
    // Gera logs com timestamps distribuídos
    for (let i = 0; i < logTemplates.length; i++) {
      const template = logTemplates[i];
      const timestamp = new Date(this.demoStartTime + (i * 30000)); // 30 segundos entre logs
      
      const log = {
        id: `demo_log_${i + 1}`,
        level: template.level,
        message: template.message,
        tags: template.tags,
        context: {
          source: template.source,
          pid: Math.floor(Math.random() * 1000) + 1000,
          origin: 'demo-script'
        },
        timestamp: timestamp
      };
      
      this.demoLogs.push(log);
      
      // Simula processamento em tempo real
      await this.processLogInRealTime(log);
      
      // Pequena pausa para simular logs chegando
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ ${this.demoLogs.length} logs de demonstração gerados`);
  }

  /**
   * Processa um log em tempo real
   */
  async processLogInRealTime(log) {
    // Sistema de alertas
    const alerts = this.alertSystem.analyzeLog(log);
    
    // Clustering
    const clusteringResult = this.clusteringSystem.processLog(log);
    
    // Análise de sentimento
    const sentimentResult = this.sentimentSystem.analyzeSentiment(log);
    
    // Se há alertas, envia notificações
    if (alerts.length > 0) {
      for (const alert of alerts) {
        await this.sendAlertNotification(alert, log);
      }
    }
    
    return { alerts, clusteringResult, sentimentResult };
  }

  /**
   * Demonstra o sistema de alertas
   */
  async demonstrateAlerts() {
    console.log('\n🚨 DEMONSTRANDO SISTEMA DE ALERTAS INTELIGENTES...');
    
    const activeAlerts = this.alertSystem.getActiveAlerts();
    const alertStats = this.alertSystem.getAlertStats();
    
    console.log(`📊 Estatísticas dos Alertas:`);
    console.log(`   - Total: ${alertStats.total}`);
    console.log(`   - Ativos: ${alertStats.active}`);
    console.log(`   - Críticos: ${alertStats.critical}`);
    console.log(`   - Altos: ${alertStats.high}`);
    console.log(`   - Médios: ${alertStats.medium}`);
    
    if (activeAlerts.length > 0) {
      console.log('\n🚨 Alertas Ativos:');
      for (const alert of activeAlerts.slice(0, 3)) { // Mostra apenas os 3 primeiros
        console.log(`   ${alert.severity.toUpperCase()}: ${alert.message}`);
        console.log(`     Tipo: ${alert.type}`);
        console.log(`     Timestamp: ${alert.timestamp.toLocaleString('pt-BR')}`);
      }
    }
    
    // Simula resolução de alguns alertas
    if (activeAlerts.length > 0) {
      const alertToResolve = activeAlerts[0];
      this.alertSystem.resolveAlert(alertToResolve.id);
      console.log(`✅ Alerta resolvido: ${alertToResolve.message}`);
    }
  }

  /**
   * Demonstra o sistema de clustering
   */
  async demonstrateClustering() {
    console.log('\n🔍 DEMONSTRANDO CLUSTERING DE LOGS...');
    
    const clusterStats = this.clusteringSystem.getClusterStats();
    
    console.log(`📊 Estatísticas dos Clusters:`);
    console.log(`   - Total de clusters: ${clusterStats.totalClusters}`);
    console.log(`   - Total de logs: ${clusterStats.totalLogs}`);
    console.log(`   - Tamanho médio: ${clusterStats.averageClusterSize}`);
    console.log(`   - Maior cluster: ${clusterStats.largestCluster}`);
    console.log(`   - Menor cluster: ${clusterStats.smallestCluster}`);
    
    // Mostra alguns clusters específicos
    const clustersByLevel = this.clusteringSystem.getClustersByCriteria({ minSize: 2 });
    
    if (clustersByLevel.length > 0) {
      console.log('\n🔍 Clusters por Critérios:');
      for (const cluster of clustersByLevel.slice(0, 3)) {
        console.log(`   Cluster ${cluster.id}:`);
        console.log(`     - Origem: ${cluster.metadata.source}`);
        console.log(`     - Nível: ${cluster.metadata.level}`);
        console.log(`     - Tamanho: ${cluster.logs.length}`);
        console.log(`     - Padrão: ${cluster.metadata.messagePattern}`);
      }
    }
    
    // Limpa clusters antigos
    const cleanedCount = this.clusteringSystem.cleanupOldClusters(1000); // 1 segundo para demo
    if (cleanedCount > 0) {
      console.log(`🧹 ${cleanedCount} clusters antigos limpos`);
    }
  }

  /**
   * Demonstra a análise de tendências
   */
  async demonstrateTrends() {
    console.log('\n📈 DEMONSTRANDO ANÁLISE DE TENDÊNCIAS TEMPORAIS...');
    
    const trendAnalysis = this.trendSystem.analyzeTemporalTrends(this.demoLogs, 'hour');
    
    console.log(`📊 Análise de Tendências (Última Hora):`);
    console.log(`   - Logs analisados: ${trendAnalysis.trends.volume.values.length}`);
    
    // Tendências por nível
    for (const [level, trend] of Object.entries(trendAnalysis.trends)) {
      if (level !== 'volume' && trend.level) {
        console.log(`   - ${level.toUpperCase()}: ${trend.trend} (${trend.change}%)`);
      }
    }
    
    // Tendência geral
    const volumeTrend = trendAnalysis.trends.volume;
    console.log(`   - Volume geral: ${volumeTrend.trend} (${volumeTrend.change}%)`);
    console.log(`   - Pico: ${volumeTrend.peak}`);
    console.log(`   - Média: ${Math.round(volumeTrend.average * 100) / 100}`);
    
    // Sazonalidade
    if (trendAnalysis.seasonality.hourly) {
      const hourly = trendAnalysis.seasonality.hourly;
      console.log(`\n🕐 Padrões Sazonais:`);
      console.log(`   - Pico horário: ${hourly.peakHour}:00`);
      console.log(`   - Vale horário: ${hourly.lowHour}:00`);
      console.log(`   - Padrão: ${hourly.pattern}`);
    }
    
    // Anomalias
    if (trendAnalysis.anomalies.length > 0) {
      console.log(`\n🚨 Anomalias Detectadas: ${trendAnalysis.anomalies.length}`);
      for (const anomaly of trendAnalysis.anomalies.slice(0, 2)) {
        console.log(`   - ${anomaly.type}: ${anomaly.severity} (Z-Score: ${anomaly.zScore})`);
      }
    }
    
    // Previsões
    if (trendAnalysis.predictions.volume24h) {
      const forecast = trendAnalysis.predictions.volume24h;
      console.log(`\n🔮 Previsões (24h):`);
      console.log(`   - Volume atual: ${forecast.current}`);
      console.log(`   - Volume previsto: ${forecast.predicted}`);
      console.log(`   - Mudança esperada: ${forecast.change}`);
      console.log(`   - Confiança: ${Math.round(forecast.confidence * 100)}%`);
    }
  }

  /**
   * Demonstra a análise de sentimento
   */
  async demonstrateSentiment() {
    console.log('\n😊 DEMONSTRANDO ANÁLISE DE SENTIMENTO...');
    
    const sentimentAnalysis = this.sentimentSystem.analyzeBatchSentiment(this.demoLogs);
    
    console.log(`📊 Análise de Sentimento:`);
    console.log(`   - Total de logs analisados: ${sentimentAnalysis.aggregateStats.totalLogs}`);
    console.log(`   - Score médio: ${Math.round(sentimentAnalysis.aggregateStats.averageScore * 100) / 100}`);
    console.log(`   - Confiança média: ${Math.round(sentimentAnalysis.aggregateStats.confidence * 100)}%`);
    
    // Distribuição de categorias
    console.log(`\n📊 Distribuição de Sentimentos:`);
    for (const [category, count] of Object.entries(sentimentAnalysis.aggregateStats.categoryDistribution)) {
      const percentage = Math.round((count / sentimentAnalysis.aggregateStats.totalLogs) * 100);
      console.log(`   - ${category}: ${count} (${percentage}%)`);
    }
    
    // Distribuição de emoções
    console.log(`\n😊 Distribuição de Emoções:`);
    for (const [emotion, count] of Object.entries(sentimentAnalysis.aggregateStats.emotionDistribution)) {
      const percentage = Math.round((count / sentimentAnalysis.aggregateStats.totalLogs) * 100);
      console.log(`   - ${emotion}: ${count} (${percentage}%)`);
    }
    
    // Tendências
    console.log(`\n📈 Tendências de Sentimento:`);
    console.log(`   - Tendência geral: ${sentimentAnalysis.trends.overallTrend}`);
    
    // Recomendações
    if (sentimentAnalysis.recommendations.length > 0) {
      console.log(`\n💡 Recomendações:`);
      for (const rec of sentimentAnalysis.recommendations) {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.message}`);
        console.log(`     Ação: ${rec.action}`);
      }
    }
    
    // Mostra alguns exemplos individuais
    console.log(`\n🔍 Exemplos de Análise Individual:`);
    const examples = sentimentAnalysis.individualResults.slice(0, 3);
    for (const example of examples) {
      console.log(`   "${example.text.substring(0, 50)}..."`);
      console.log(`     Sentimento: ${example.sentimentCategory} (${example.finalScore})`);
      console.log(`     Emoção: ${example.emotion.emoji} ${example.emotion.type}`);
      console.log(`     Confiança: ${Math.round(example.analysis.confidence * 100)}%`);
    }
  }

  /**
   * Demonstra as integrações
   */
  async demonstrateIntegrations() {
    console.log('\n🔗 DEMONSTRANDO INTEGRAÇÕES...');
    
    const integrationStats = this.integrationManager.getIntegrationStats();
    
    console.log(`📊 Estatísticas das Integrações:`);
    console.log(`   - Total: ${integrationStats.totalIntegrations}`);
    console.log(`   - Habilitadas: ${integrationStats.enabledIntegrations}`);
    console.log(`   - Notificações enviadas: ${integrationStats.totalNotifications}`);
    console.log(`   - Sucessos: ${integrationStats.successfulNotifications}`);
    console.log(`   - Falhas: ${integrationStats.failedNotifications}`);
    
    // Testa uma integração
    try {
      console.log(`\n🧪 Testando integração Slack...`);
      const testResult = await this.integrationManager.testIntegration(this.integrationIds.slack);
      console.log(`✅ Teste Slack bem-sucedido: ${testResult.messageId}`);
    } catch (error) {
      console.log(`⚠️ Teste Slack falhou (esperado em demo): ${error.message}`);
    }
    
    // Mostra plataformas suportadas
    console.log(`\n🌐 Plataformas Suportadas:`);
    for (const [platform, count] of Object.entries(integrationStats.platforms)) {
      console.log(`   - ${platform}: ${count} integração(ões)`);
    }
  }

  /**
   * Envia notificação de alerta
   */
  async sendAlertNotification(alert, originalLog) {
    const notification = {
      type: 'alert',
      title: alert.message,
      message: `Alerta detectado no sistema: ${alert.message}`,
      source: originalLog.context?.source || 'unknown',
      level: originalLog.level,
      tags: originalLog.tags || [],
      timestamp: alert.timestamp,
      data: alert.data
    };
    
    try {
      // Envia para todas as integrações habilitadas
      await this.integrationManager.broadcastNotification(notification);
    } catch (error) {
      // Em demo, pode falhar se as URLs não forem válidas
      console.log(`⚠️ Notificação não enviada (demo): ${error.message}`);
    }
  }

  /**
   * Mostra dashboard consolidado
   */
  showConsolidatedDashboard() {
    console.log('\n🎯 DASHBOARD CONSOLIDADO - MOONLIGHT LOGGER');
    console.log('=' .repeat(70));
    
    // Resumo dos sistemas
    const alertStats = this.alertSystem.getAlertStats();
    const clusterStats = this.clusteringSystem.getClusterStats();
    const trendSummary = this.trendSystem.getTrendSummary();
    const integrationStats = this.integrationManager.getIntegrationStats();
    
    console.log(`🚨 SISTEMA DE ALERTAS:`);
    console.log(`   - Alertas ativos: ${alertStats.active}`);
    console.log(`   - Alertas críticos: ${alertStats.critical}`);
    console.log(`   - Total resolvidos: ${alertStats.resolved}`);
    
    console.log(`\n🔍 CLUSTERING DE LOGS:`);
    console.log(`   - Clusters ativos: ${clusterStats.totalClusters}`);
    console.log(`   - Logs agrupados: ${clusterStats.totalLogs}`);
    console.log(`   - Eficiência: ${Math.round((clusterStats.totalLogs / Math.max(this.demoLogs.length, 1)) * 100)}%`);
    
    console.log(`\n📈 ANÁLISE DE TENDÊNCIAS:`);
    console.log(`   - Análises ativas: ${trendSummary.totalTrends}`);
    console.log(`   - Última atualização: ${trendSummary.lastUpdate.toLocaleString('pt-BR')}`);
    
    console.log(`\n🔗 INTEGRAÇÕES:`);
    console.log(`   - Plataformas: ${Object.keys(integrationStats.platforms).join(', ')}`);
    console.log(`   - Taxa de sucesso: ${Math.round((integrationStats.successfulNotifications / Math.max(integrationStats.totalNotifications, 1)) * 100)}%`);
    
    console.log(`\n😊 ANÁLISE DE SENTIMENTO:`);
    const sentimentAnalysis = this.sentimentSystem.analyzeBatchSentiment(this.demoLogs);
    console.log(`   - Score médio: ${Math.round(sentimentAnalysis.aggregateStats.averageScore * 100) / 100}`);
    console.log(`   - Tendência: ${sentimentAnalysis.trends.overallTrend}`);
    
    console.log(`\n🎉 DEMONSTRAÇÃO CONCLUÍDA!`);
    console.log(`   - Total de funcionalidades testadas: 5`);
    console.log(`   - Logs processados: ${this.demoLogs.length}`);
    console.log(`   - Tempo de execução: ${Math.round((Date.now() - this.demoStartTime) / 1000)}s`);
    
    console.log(`\n💡 PRÓXIMOS PASSOS:`);
    console.log(`   1. Configure suas próprias integrações no config.json`);
    console.log(`   2. Ajuste os thresholds dos alertas conforme sua necessidade`);
    console.log(`   3. Personalize as configurações de clustering e tendências`);
    console.log(`   4. Teste com seus próprios logs em produção`);
    
    console.log(`\n🌙 O Moonlight Logger está pronto para uso avançado!`);
  }
}

// Executa a demonstração se for chamado diretamente
if (require.main === module) {
  const demo = new AdvancedFeaturesDemo();
  demo.runDemo().catch(console.error);
}

module.exports = AdvancedFeaturesDemo;
