declare module '*.js' {
  const content: any;
  export = content;
}

declare module '../alerts.js' {
  export class IntelligentAlertSystem {
    thresholds: {
      errorSpike: number;
      warningFlood: number;
      criticalError: number;
    };
    alerts: any[];
    
    constructor();
    analyzeLog(log: any): void;
    isCriticalError(log: any): boolean;
    detectPattern(log: any): boolean;
    countRecentLogs(level: string, minutes: number): number;
    getRecentLogs(level: string, minutes: number): any[];
    createAlert(type: string, severity: string, message: string, details: any): void;
    getActiveAlerts(): any[];
    resolveAlert(id: string): void;
    getAlertStats(): any;
  }
}

declare module '../log-clustering.js' {
  export class LogClusteringSystem {
    similarityThreshold: number;
    maxClusterSize: number;
    autoCleanup: boolean;
    clusters: any[];
    
    constructor(config?: any);
    processLog(log: any): void;
    generateLogHash(log: any): string;
    normalizeMessage(message: string): string;
    simpleHash(str: string): string;
    calculateSimilarity(log1: any, log2: any): number;
    addToCluster(log: any, cluster: any): void;
    createNewCluster(log: any): void;
    extractMessagePattern(logs: any[]): string;
    extractPatterns(logs: any[]): string[];
    splitCluster(cluster: any): void;
    getClusterStats(): any;
    getClustersByCriteria(criteria: any): any[];
    cleanupOldClusters(): void;
  }
}

declare module '../trend-analysis.js' {
  export class TrendAnalysisSystem {
    constructor();
    analyzeTemporalTrends(logs: any[], timeRange: any): any;
    createTimeBuckets(startTime: Date, endTime: Date, interval: string): any[];
    analyzeLevelTrend(logs: any[], timeBuckets: any[]): any;
    analyzeVolumeTrend(logs: any[], timeBuckets: any[]): any;
    calculateTrend(values: number[]): any;
    calculateVolatility(values: number[]): number;
    detectSeasonality(logs: any[]): any;
    analyzeHourlyPattern(logs: any[]): any;
    classifyHourlyPattern(pattern: any): string;
    analyzeDailyPattern(logs: any[]): any;
    calculateWeekendEffect(logs: any[]): number;
    analyzeDayPeriods(logs: any[]): any;
    detectAnomalies(logs: any[], timeBuckets: any[]): any[];
    detectVolumeAnomaly(logs: any[], timeBuckets: any[]): any[];
    detectErrorAnomaly(logs: any[], timeBuckets: any[]): any[];
    generateForecasts(logs: any[], timeBuckets: any[]): any;
    forecastVolume(logs: any[], timeBuckets: any[]): any;
    forecastErrors(logs: any[], timeBuckets: any[]): any;
    predictPeaks(logs: any[], timeBuckets: any[]): any;
    findNextHour(pattern: any): Date;
    getTrendSummary(logs: any[], timeRange: any): any;
    generateInsights(logs: any[], timeRange: any): any[];
  }
}

declare module '../sentiment-analysis.js' {
  export class SentimentAnalysisSystem {
    constructor();
    initializeSentimentLexicon(): void;
    initializeEmotionPatterns(): void;
    analyzeSentiment(log: any): any;
    extractTextFromLog(log: any): string;
    tokenizeText(text: string): string[];
    calculateSentimentScore(tokens: string[]): number;
    categorizeSentiment(score: number): string;
    detectEmotion(tokens: string[]): any;
    analyzeContext(log: any): number;
    calculateFinalScore(baseScore: number, contextScore: number): number;
    generateSentimentInsights(log: any, sentiment: any): any[];
    calculateConfidence(sentiment: any): number;
    identifySentimentFactors(tokens: string[]): any[];
    getCategoryWeight(category: string): number;
    analyzeBatchSentiment(logs: any[]): any;
    calculateAggregateStats(sentiments: any[]): any;
    countOccurrences(items: any[]): any;
    identifySentimentTrends(sentiments: any[]): any;
    calculateTrendDirection(values: number[]): string;
    generateRecommendations(insights: any[]): string[];
  }
}

declare module '../integrations/slack-discord.js' {
  export class IntegrationManager {
    constructor();
    configureIntegration(platform: string, config: any): void;
    sendNotification(platform: string, message: any): Promise<boolean>;
    sendToSlack(message: any): Promise<boolean>;
    formatSlackMessage(message: any): any;
    formatSlackFields(fields: any[]): any[];
    sendToDiscord(message: any): Promise<boolean>;
    formatDiscordMessage(message: any): any;
    formatDiscordFields(fields: any[]): any[];
    sendToTeams(message: any): Promise<boolean>;
    formatTeamsMessage(message: any): any;
    formatTeamsSections(sections: any[]): any[];
    sendEmail(message: any): Promise<boolean>;
    getNotificationColor(level: string): string;
    getDiscordColor(level: string): number;
    getTeamsColor(level: string): string;
    getNotificationEmoji(level: string): string;
    broadcastNotification(message: any, platforms: string[]): Promise<any[]>;
    queueNotification(notification: any): void;
    processQueue(): void;
    getIntegrationStats(): any;
    testIntegration(platform: string): Promise<boolean>;
  }
}
