/**
 * 🔗 INTEGRAÇÕES SLACK/DISCORD - MOONLIGHT LOGGER
 * 
 * Envia notificações automáticas para Slack e Discord
 * sobre alertas, erros críticos e eventos importantes.
 */

class IntegrationManager {
  constructor() {
    this.integrations = new Map();
    this.webhooks = new Map();
    this.notificationQueue = [];
    this.isProcessing = false;
    
    this.platforms = {
      SLACK: 'slack',
      DISCORD: 'discord',
      TEAMS: 'teams',
      EMAIL: 'email'
    };
    
    this.notificationTypes = {
      ALERT: 'alert',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
      PERFORMANCE: 'performance',
      SYSTEM: 'system'
    };
  }

  /**
   * Configura uma nova integração
   */
  configureIntegration(platform, config) {
    const integrationId = `${platform}_${Date.now()}`;
    
    const integration = {
      id: integrationId,
      platform,
      config,
      enabled: true,
      createdAt: new Date(),
      lastUsed: null,
      stats: {
        totalNotifications: 0,
        successful: 0,
        failed: 0,
        lastError: null
      }
    };
    
    this.integrations.set(integrationId, integration);
    
    // Configura webhook se fornecido
    if (config.webhookUrl) {
      this.webhooks.set(integrationId, config.webhookUrl);
    }
    
    return integrationId;
  }

  /**
   * Envia notificação para uma integração específica
   */
  async sendNotification(integrationId, notification) {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.enabled) {
      throw new Error(`Integração ${integrationId} não encontrada ou desabilitada`);
    }
    
    try {
      let result;
      
      switch (integration.platform) {
        case this.platforms.SLACK:
          result = await this.sendToSlack(integration, notification);
          break;
        case this.platforms.DISCORD:
          result = await this.sendToDiscord(integration, notification);
          break;
        case this.platforms.TEAMS:
          result = await this.sendToTeams(integration, notification);
          break;
        case this.platforms.EMAIL:
          result = await this.sendEmail(integration, notification);
          break;
        default:
          throw new Error(`Plataforma não suportada: ${integration.platform}`);
      }
      
      // Atualiza estatísticas
      integration.stats.totalNotifications++;
      integration.stats.successful++;
      integration.lastUsed = new Date();
      
      return result;
      
    } catch (error) {
      // Atualiza estatísticas de erro
      integration.stats.totalNotifications++;
      integration.stats.failed++;
      integration.stats.lastError = {
        message: error.message,
        timestamp: new Date()
      };
      
      throw error;
    }
  }

  /**
   * Envia notificação para Slack
   */
  async sendToSlack(integration, notification) {
    const webhookUrl = this.webhooks.get(integration.id);
    if (!webhookUrl) {
      throw new Error('Webhook URL não configurada para Slack');
    }
    
    const slackMessage = this.formatSlackMessage(notification);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar para Slack: ${response.status} ${response.statusText}`);
    }
    
    return { success: true, platform: 'slack', messageId: Date.now() };
  }

  /**
   * Formata mensagem para Slack
   */
  formatSlackMessage(notification) {
    const color = this.getNotificationColor(notification.type);
    const emoji = this.getNotificationEmoji(notification.type);
    
    return {
      attachments: [{
        color,
        title: `${emoji} ${notification.title}`,
        text: notification.message,
        fields: this.formatSlackFields(notification),
        footer: 'Moonlight Logger',
        footer_icon: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/new-moon_1f311.png',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
  }

  /**
   * Formata campos para Slack
   */
  formatSlackFields(notification) {
    const fields = [];
    
    if (notification.source) {
      fields.push({
        title: 'Origem',
        value: notification.source,
        short: true
      });
    }
    
    if (notification.level) {
      fields.push({
        title: 'Nível',
        value: notification.level.toUpperCase(),
        short: true
      });
    }
    
    if (notification.timestamp) {
      fields.push({
        title: 'Timestamp',
        value: new Date(notification.timestamp).toLocaleString('pt-BR'),
        short: true
      });
    }
    
    if (notification.tags && notification.tags.length > 0) {
      fields.push({
        title: 'Tags',
        value: notification.tags.join(', '),
        short: true
      });
    }
    
    if (notification.data) {
      for (const [key, value] of Object.entries(notification.data)) {
        if (typeof value === 'string' && value.length < 100) {
          fields.push({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            value: value,
            short: true
          });
        }
      }
    }
    
    return fields;
  }

  /**
   * Envia notificação para Discord
   */
  async sendToDiscord(integration, notification) {
    const webhookUrl = this.webhooks.get(integration.id);
    if (!webhookUrl) {
      throw new Error('Webhook URL não configurada para Discord');
    }
    
    const discordMessage = this.formatDiscordMessage(notification);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordMessage)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar para Discord: ${response.status} ${response.statusText}`);
    }
    
    return { success: true, platform: 'discord', messageId: Date.now() };
  }

  /**
   * Formata mensagem para Discord
   */
  formatDiscordMessage(notification) {
    const color = this.getDiscordColor(notification.type);
    const emoji = this.getNotificationEmoji(notification.type);
    
    return {
      embeds: [{
        title: `${emoji} ${notification.title}`,
        description: notification.message,
        color,
        fields: this.formatDiscordFields(notification),
        footer: {
          text: 'Moonlight Logger'
        },
        timestamp: new Date(notification.timestamp || Date.now()).toISOString()
      }]
    };
  }

  /**
   * Formata campos para Discord
   */
  formatDiscordFields(notification) {
    const fields = [];
    
    if (notification.source) {
      fields.push({
        name: 'Origem',
        value: notification.source,
        inline: true
      });
    }
    
    if (notification.level) {
      fields.push({
        name: 'Nível',
        value: notification.level.toUpperCase(),
        inline: true
      });
    }
    
    if (notification.tags && notification.tags.length > 0) {
      fields.push({
        name: 'Tags',
        value: notification.tags.join(', '),
        inline: true
      });
    }
    
    if (notification.data) {
      for (const [key, value] of Object.entries(notification.data)) {
        if (typeof value === 'string' && value.length < 100) {
          fields.push({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: value,
            inline: true
          });
        }
      }
    }
    
    return fields;
  }

  /**
   * Envia notificação para Microsoft Teams
   */
  async sendToTeams(integration, notification) {
    const webhookUrl = this.webhooks.get(integration.id);
    if (!webhookUrl) {
      throw new Error('Webhook URL não configurada para Teams');
    }
    
    const teamsMessage = this.formatTeamsMessage(notification);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamsMessage)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao enviar para Teams: ${response.status} ${response.statusText}`);
    }
    
    return { success: true, platform: 'teams', messageId: Date.now() };
  }

  /**
   * Formata mensagem para Teams
   */
  formatTeamsMessage(notification) {
    const emoji = this.getNotificationEmoji(notification.type);
    
    return {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": this.getTeamsColor(notification.type),
      "title": `${emoji} ${notification.title}`,
      "text": notification.message,
      "sections": this.formatTeamsSections(notification)
    };
  }

  /**
   * Formata seções para Teams
   */
  formatTeamsSections(notification) {
    const sections = [];
    
    if (notification.source || notification.level || notification.tags) {
      const facts = [];
      
      if (notification.source) {
        facts.push({ name: 'Origem', value: notification.source });
      }
      
      if (notification.level) {
        facts.push({ name: 'Nível', value: notification.level.toUpperCase() });
      }
      
      if (notification.tags && notification.tags.length > 0) {
        facts.push({ name: 'Tags', value: notification.tags.join(', ') });
      }
      
      if (facts.length > 0) {
        sections.push({
          "activityTitle": "Detalhes",
          "facts": facts
        });
      }
    }
    
    return sections;
  }

  /**
   * Envia notificação por email
   */
  async sendEmail(integration, notification) {
    // Implementação básica - em produção, use uma biblioteca como nodemailer
    console.log('📧 Email enviado:', {
      to: integration.config.email,
      subject: notification.title,
      body: notification.message
    });
    
    return { success: true, platform: 'email', messageId: Date.now() };
  }

  /**
   * Obtém cor para notificação no Slack
   */
  getNotificationColor(type) {
    const colors = {
      [this.notificationTypes.ALERT]: '#ff6b6b',
      [this.notificationTypes.ERROR]: '#ee5a52',
      [this.notificationTypes.WARNING]: '#feca57',
      [this.notificationTypes.INFO]: '#48dbfb',
      [this.notificationTypes.PERFORMANCE]: '#ff9ff3',
      [this.notificationTypes.SYSTEM]: '#54a0ff'
    };
    
    return colors[type] || '#95a5a6';
  }

  /**
   * Obtém cor para notificação no Discord
   */
  getDiscordColor(type) {
    const colors = {
      [this.notificationTypes.ALERT]: 0xff6b6b,
      [this.notificationTypes.ERROR]: 0xee5a52,
      [this.notificationTypes.WARNING]: 0xfeca57,
      [this.notificationTypes.INFO]: 0x48dbfb,
      [this.notificationTypes.PERFORMANCE]: 0xff9ff3,
      [this.notificationTypes.SYSTEM]: 0x54a0ff
    };
    
    return colors[type] || 0x95a5a6;
  }

  /**
   * Obtém cor para notificação no Teams
   */
  getTeamsColor(type) {
    const colors = {
      [this.notificationTypes.ALERT]: '#ff6b6b',
      [this.notificationTypes.ERROR]: '#ee5a52',
      [this.notificationTypes.WARNING]: '#feca57',
      [this.notificationTypes.INFO]: '#48dbfb',
      [this.notificationTypes.PERFORMANCE]: '#ff9ff3',
      [this.notificationTypes.SYSTEM]: '#54a0ff'
    };
    
    return colors[type] || '#95a5a6';
  }

  /**
   * Obtém emoji para notificação
   */
  getNotificationEmoji(type) {
    const emojis = {
      [this.notificationTypes.ALERT]: '🚨',
      [this.notificationTypes.ERROR]: '❌',
      [this.notificationTypes.WARNING]: '⚠️',
      [this.notificationTypes.INFO]: 'ℹ️',
      [this.notificationTypes.PERFORMANCE]: '📊',
      [this.notificationTypes.SYSTEM]: '⚙️'
    };
    
    return emojis[type] || '📝';
  }

  /**
   * Envia notificação para todas as integrações habilitadas
   */
  async broadcastNotification(notification) {
    const results = [];
    
    for (const [integrationId, integration] of this.integrations) {
      if (integration.enabled) {
        try {
          const result = await this.sendNotification(integrationId, notification);
          results.push({ integrationId, success: true, result });
        } catch (error) {
          results.push({ integrationId, success: false, error: error.message });
        }
      }
    }
    
    return results;
  }

  /**
   * Adiciona notificação à fila para processamento assíncrono
   */
  queueNotification(notification, integrations = null) {
    this.notificationQueue.push({
      notification,
      integrations,
      timestamp: Date.now(),
      retries: 0
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Processa a fila de notificações
   */
  async processQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.notificationQueue.length > 0) {
      const queuedNotification = this.notificationQueue.shift();
      
      try {
        if (queuedNotification.integrations) {
          // Envia para integrações específicas
          for (const integrationId of queuedNotification.integrations) {
            await this.sendNotification(integrationId, queuedNotification.notification);
          }
        } else {
          // Broadcast para todas as integrações
          await this.broadcastNotification(queuedNotification.notification);
        }
      } catch (error) {
        // Recoloca na fila se ainda não excedeu o limite de tentativas
        if (queuedNotification.retries < 3) {
          queuedNotification.retries++;
          this.notificationQueue.push(queuedNotification);
        }
      }
      
      // Pequena pausa entre notificações
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }

  /**
   * Obtém estatísticas das integrações
   */
  getIntegrationStats() {
    const stats = {
      totalIntegrations: this.integrations.size,
      enabledIntegrations: 0,
      totalNotifications: 0,
      successfulNotifications: 0,
      failedNotifications: 0,
      platforms: {}
    };
    
    for (const integration of this.integrations.values()) {
      if (integration.enabled) {
        stats.enabledIntegrations++;
      }
      
      stats.totalNotifications += integration.stats.totalNotifications;
      stats.successfulNotifications += integration.stats.successful;
      stats.failedNotifications += integration.stats.failed;
      
      if (!stats.platforms[integration.platform]) {
        stats.platforms[integration.platform] = 0;
      }
      stats.platforms[integration.platform]++;
    }
    
    return stats;
  }

  /**
   * Testa uma integração
   */
  async testIntegration(integrationId) {
    const testNotification = {
      type: this.notificationTypes.INFO,
      title: '🧪 Teste de Integração',
      message: 'Esta é uma notificação de teste do Moonlight Logger.',
      source: 'test',
      level: 'info',
      tags: ['test', 'integration'],
      timestamp: new Date(),
      data: {
        testId: `test_${Date.now()}`,
        platform: 'moonlight-logger'
      }
    };
    
    return await this.sendNotification(integrationId, testNotification);
  }
}

module.exports = IntegrationManager;
