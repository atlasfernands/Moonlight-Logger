/**
 * 😊 ANÁLISE DE SENTIMENTO DOS LOGS - MOONLIGHT LOGGER
 * 
 * Analisa o tom emocional dos logs para identificar padrões
 * de humor, estresse e saúde geral do sistema.
 */

class SentimentAnalysisSystem {
  constructor() {
    this.sentimentLexicon = this.initializeSentimentLexicon();
    this.emotionPatterns = this.initializeEmotionPatterns();
    this.contextWeights = {
      error: 2.0,      // Erros têm peso maior
      warning: 1.5,    // Warnings têm peso médio
      info: 1.0,       // Info tem peso normal
      debug: 0.5       // Debug tem peso menor
    };
    
    this.sentimentCategories = {
      VERY_NEGATIVE: 'very_negative',
      NEGATIVE: 'negative',
      NEUTRAL: 'neutral',
      POSITIVE: 'positive',
      VERY_POSITIVE: 'very_positive'
    };
    
    this.emotionTypes = {
      ANGER: 'anger',
      FEAR: 'fear',
      SADNESS: 'sadness',
      JOY: 'joy',
      SURPRISE: 'surprise',
      DISGUST: 'disgust',
      NEUTRAL: 'neutral'
    };
  }

  /**
   * Inicializa o léxico de sentimento
   */
  initializeSentimentLexicon() {
    return {
      // Palavras muito negativas (peso: -2)
      very_negative: [
        'crash', 'fatal', 'critical', 'emergency', 'panic', 'corruption',
        'destroyed', 'broken', 'failed', 'dead', 'killed', 'terminated',
        'disaster', 'catastrophe', 'apocalypse', 'doom', 'hell', 'nightmare'
      ],
      
      // Palavras negativas (peso: -1)
      negative: [
        'error', 'warning', 'fail', 'broken', 'invalid', 'rejected',
        'denied', 'blocked', 'stopped', 'slow', 'timeout', 'overload',
        'memory', 'leak', 'corrupt', 'damaged', 'unstable', 'unreliable'
      ],
      
      // Palavras neutras (peso: 0)
      neutral: [
        'info', 'debug', 'trace', 'log', 'message', 'data', 'process',
        'start', 'stop', 'init', 'config', 'setting', 'parameter'
      ],
      
      // Palavras positivas (peso: 1)
      positive: [
        'success', 'ok', 'good', 'working', 'healthy', 'stable',
        'fast', 'efficient', 'optimized', 'improved', 'fixed', 'resolved',
        'connected', 'authenticated', 'authorized', 'validated'
      ],
      
      // Palavras muito positivas (peso: 2)
      very_positive: [
        'excellent', 'perfect', 'amazing', 'outstanding', 'brilliant',
        'fantastic', 'wonderful', 'splendid', 'magnificent', 'superb',
        'optimal', 'peak', 'best', 'champion', 'victory', 'triumph'
      ]
    };
  }

  /**
   * Inicializa padrões de emoção
   */
  initializeEmotionPatterns() {
    return {
      [this.emotionTypes.ANGER]: {
        keywords: ['fuck', 'shit', 'damn', 'hell', 'angry', 'furious', 'rage'],
        emoji: '😠',
        intensity: 0.8
      },
      
      [this.emotionTypes.FEAR]: {
        keywords: ['scared', 'afraid', 'panic', 'terrified', 'horror', 'dread'],
        emoji: '😨',
        intensity: 0.7
      },
      
      [this.emotionTypes.SADNESS]: {
        keywords: ['sad', 'depressed', 'miserable', 'hopeless', 'despair', 'grief'],
        emoji: '😢',
        intensity: 0.6
      },
      
      [this.emotionTypes.JOY]: {
        keywords: ['happy', 'joy', 'excited', 'thrilled', 'delighted', 'ecstatic'],
        emoji: '😊',
        intensity: 0.7
      },
      
      [this.emotionTypes.SURPRISE]: {
        keywords: ['wow', 'amazing', 'incredible', 'unbelievable', 'shocking'],
        emoji: '😲',
        intensity: 0.5
      },
      
      [this.emotionTypes.DISGUST]: {
        keywords: ['disgusting', 'revolting', 'nasty', 'vile', 'repulsive'],
        emoji: '🤢',
        intensity: 0.6
      }
    };
  }

  /**
   * Analisa o sentimento de um log
   */
  analyzeSentiment(log) {
    const text = this.extractTextFromLog(log);
    const words = this.tokenizeText(text);
    
    // Análise de sentimento básica
    const sentimentScore = this.calculateSentimentScore(words, log.level);
    const sentimentCategory = this.categorizeSentiment(sentimentScore);
    
    // Análise de emoção
    const emotion = this.detectEmotion(words);
    
    // Análise de contexto
    const contextScore = this.analyzeContext(log);
    
    // Score final ponderado
    const finalScore = this.calculateFinalScore(sentimentScore, contextScore, log.level);
    
    // Insights baseados no sentimento
    const insights = this.generateSentimentInsights(sentimentScore, emotion, log);
    
    return {
      text,
      words,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      sentimentCategory,
      emotion,
      contextScore: Math.round(contextScore * 100) / 100,
      finalScore: Math.round(finalScore * 100) / 100,
      insights,
      analysis: {
        timestamp: new Date(),
        confidence: this.calculateConfidence(words, log),
        factors: this.identifySentimentFactors(words, log)
      }
    };
  }

  /**
   * Extrai texto do log para análise
   */
  extractTextFromLog(log) {
    let text = '';
    
    // Mensagem principal
    if (log.message) {
      text += log.message + ' ';
    }
    
    // Tags
    if (log.tags && log.tags.length > 0) {
      text += log.tags.join(' ') + ' ';
    }
    
    // Contexto
    if (log.context) {
      if (log.context.source) text += log.context.source + ' ';
      if (log.context.errorCode) text += log.context.errorCode + ' ';
      if (log.context.stackTrace) text += log.context.stackTrace + ' ';
    }
    
    return text.trim().toLowerCase();
  }

  /**
   * Tokeniza o texto em palavras
   */
  tokenizeText(text) {
    return text
      .replace(/[^\w\s]/g, ' ')  // Remove pontuação
      .split(/\s+/)              // Divide por espaços
      .filter(word => word.length > 2)  // Filtra palavras muito curtas
      .map(word => word.toLowerCase());  // Converte para minúsculas
  }

  /**
   * Calcula score de sentimento baseado nas palavras
   */
  calculateSentimentScore(words, logLevel) {
    let totalScore = 0;
    let wordCount = 0;
    
    for (const word of words) {
      let wordScore = 0;
      
      // Verifica cada categoria de sentimento
      if (this.sentimentLexicon.very_negative.includes(word)) {
        wordScore = -2;
      } else if (this.sentimentLexicon.negative.includes(word)) {
        wordScore = -1;
      } else if (this.sentimentLexicon.positive.includes(word)) {
        wordScore = 1;
      } else if (this.sentimentLexicon.very_positive.includes(word)) {
        wordScore = 2;
      }
      
      // Aplica peso do nível do log
      const levelWeight = this.contextWeights[logLevel] || 1.0;
      totalScore += wordScore * levelWeight;
      wordCount++;
    }
    
    // Normaliza o score
    return wordCount > 0 ? totalScore / wordCount : 0;
  }

  /**
   * Categoriza o sentimento baseado no score
   */
  categorizeSentiment(score) {
    if (score <= -1.5) return this.sentimentCategories.VERY_NEGATIVE;
    if (score <= -0.5) return this.sentimentCategories.NEGATIVE;
    if (score <= 0.5) return this.sentimentCategories.NEUTRAL;
    if (score <= 1.5) return this.sentimentCategories.POSITIVE;
    return this.sentimentCategories.VERY_POSITIVE;
  }

  /**
   * Detecta emoção baseada nas palavras
   */
  detectEmotion(words) {
    const emotionScores = {};
    
    // Inicializa scores
    for (const emotionType of Object.values(this.emotionTypes)) {
      emotionScores[emotionType] = 0;
    }
    
    // Calcula scores para cada emoção
    for (const word of words) {
      for (const [emotionType, pattern] of Object.entries(this.emotionPatterns)) {
        if (pattern.keywords.includes(word)) {
          emotionScores[emotionType] += pattern.intensity;
        }
      }
    }
    
    // Encontra a emoção dominante
    let dominantEmotion = this.emotionTypes.NEUTRAL;
    let maxScore = 0;
    
    for (const [emotionType, score] of Object.entries(emotionScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotionType;
      }
    }
    
    return {
      type: dominantEmotion,
      score: maxScore,
      emoji: this.emotionPatterns[dominantEmotion]?.emoji || '😐',
      allScores: emotionScores
    };
  }

  /**
   * Analisa contexto do log para ajustar sentimento
   */
  analyzeContext(log) {
    let contextScore = 0;
    
    // Nível do log
    if (log.level === 'error') contextScore -= 0.5;
    else if (log.level === 'warn') contextScore -= 0.2;
    else if (log.level === 'info') contextScore += 0.1;
    
    // Tags específicas
    if (log.tags) {
      for (const tag of log.tags) {
        const lowerTag = tag.toLowerCase();
        if (lowerTag.includes('success') || lowerTag.includes('ok')) contextScore += 0.3;
        if (lowerTag.includes('fail') || lowerTag.includes('error')) contextScore -= 0.3;
        if (lowerTag.includes('critical') || lowerTag.includes('fatal')) contextScore -= 0.8;
      }
    }
    
    // Contexto específico
    if (log.context) {
      if (log.context.errorCode) contextScore -= 0.2;
      if (log.context.stackTrace) contextScore -= 0.3;
      if (log.context.source && log.context.source.includes('test')) contextScore += 0.1;
    }
    
    return Math.max(-1, Math.min(1, contextScore));
  }

  /**
   * Calcula score final ponderado
   */
  calculateFinalScore(sentimentScore, contextScore, logLevel) {
    const levelWeight = this.contextWeights[logLevel] || 1.0;
    
    // Combina sentimento (70%) com contexto (30%)
    const weightedSentiment = sentimentScore * 0.7;
    const weightedContext = contextScore * 0.3;
    
    return (weightedSentiment + weightedContext) * levelWeight;
  }

  /**
   * Gera insights baseados no sentimento
   */
  generateSentimentInsights(sentimentScore, emotion, log) {
    const insights = [];
    
    // Insights baseados no score
    if (sentimentScore < -1.0) {
      insights.push({
        type: 'warning',
        message: '🚨 Sentimento muito negativo detectado',
        suggestion: 'Verifique se há problemas críticos no sistema'
      });
    } else if (sentimentScore < -0.5) {
      insights.push({
        type: 'info',
        message: '⚠️ Sentimento negativo detectado',
        suggestion: 'Monitore para identificar tendências preocupantes'
      });
    } else if (sentimentScore > 1.0) {
      insights.push({
        type: 'positive',
        message: '😊 Sentimento muito positivo detectado',
        suggestion: 'Sistema parece estar funcionando bem'
      });
    }
    
    // Insights baseados na emoção
    if (emotion.type === this.emotionTypes.ANGER) {
      insights.push({
        type: 'warning',
        message: '😠 Padrão de raiva detectado',
        suggestion: 'Verifique se há frustrações recorrentes no sistema'
      });
    } else if (emotion.type === this.emotionTypes.FEAR) {
      insights.push({
        type: 'warning',
        message: '😨 Padrão de medo detectado',
        suggestion: 'Identifique e resolva problemas que causam ansiedade'
      });
    }
    
    // Insights baseados no nível do log
    if (log.level === 'error' && sentimentScore < -0.5) {
      insights.push({
        type: 'critical',
        message: '💥 Erro com sentimento negativo crítico',
        suggestion: 'Priorize a resolução deste problema'
      });
    }
    
    return insights;
  }

  /**
   * Calcula confiança da análise
   */
  calculateConfidence(words, log) {
    let confidence = 0.5; // Base
    
    // Mais palavras = mais confiança
    if (words.length > 10) confidence += 0.2;
    else if (words.length > 5) confidence += 0.1;
    
    // Logs com contexto têm mais confiança
    if (log.context && Object.keys(log.context).length > 0) confidence += 0.1;
    
    // Tags específicas aumentam confiança
    if (log.tags && log.tags.length > 0) confidence += 0.1;
    
    // Logs de erro têm confiança variável
    if (log.level === 'error') {
      if (log.context?.stackTrace) confidence += 0.1;
      else confidence -= 0.1;
    }
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Identifica fatores que influenciaram o sentimento
   */
  identifySentimentFactors(words, log) {
    const factors = [];
    
    // Palavras-chave encontradas
    const foundKeywords = [];
    for (const category of Object.keys(this.sentimentLexicon)) {
      for (const word of words) {
        if (this.sentimentLexicon[category].includes(word)) {
          foundKeywords.push({ word, category, weight: this.getCategoryWeight(category) });
        }
      }
    }
    
    if (foundKeywords.length > 0) {
      factors.push({
        type: 'keywords',
        description: 'Palavras-chave de sentimento encontradas',
        details: foundKeywords
      });
    }
    
    // Fatores de contexto
    if (log.level) {
      factors.push({
        type: 'level',
        description: `Nível do log: ${log.level}`,
        weight: this.contextWeights[log.level] || 1.0
      });
    }
    
    // Tags influenciadoras
    if (log.tags) {
      const influentialTags = log.tags.filter(tag => 
        tag.toLowerCase().includes('success') || 
        tag.toLowerCase().includes('fail') ||
        tag.toLowerCase().includes('error')
      );
      
      if (influentialTags.length > 0) {
        factors.push({
          type: 'tags',
          description: 'Tags que influenciaram o sentimento',
          details: influentialTags
        });
      }
    }
    
    return factors;
  }

  /**
   * Obtém peso de uma categoria de sentimento
   */
  getCategoryWeight(category) {
    const weights = {
      very_negative: -2,
      negative: -1,
      neutral: 0,
      positive: 1,
      very_positive: 2
    };
    
    return weights[category] || 0;
  }

  /**
   * Analisa sentimento de múltiplos logs
   */
  analyzeBatchSentiment(logs) {
    const results = logs.map(log => this.analyzeSentiment(log));
    
    // Calcula estatísticas agregadas
    const stats = this.calculateAggregateStats(results);
    
    // Identifica tendências
    const trends = this.identifySentimentTrends(results);
    
    return {
      individualResults: results,
      aggregateStats: stats,
      trends,
      recommendations: this.generateRecommendations(stats, trends)
    };
  }

  /**
   * Calcula estatísticas agregadas
   */
  calculateAggregateStats(results) {
    const scores = results.map(r => r.finalScore);
    const categories = results.map(r => r.sentimentCategory);
    const emotions = results.map(r => r.emotion.type);
    
    return {
      totalLogs: results.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      scoreDistribution: this.countOccurrences(scores),
      categoryDistribution: this.countOccurrences(categories),
      emotionDistribution: this.countOccurrences(emotions),
      confidence: results.reduce((a, b) => a + b.analysis.confidence, 0) / results.length
    };
  }

  /**
   * Conta ocorrências de valores
   */
  countOccurrences(values) {
    const counts = {};
    for (const value of values) {
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }

  /**
   * Identifica tendências de sentimento
   */
  identifySentimentTrends(results) {
    // Agrupa por timestamp (assumindo que estão ordenados)
    const timeGroups = {};
    
    for (const result of results) {
      const hour = new Date(result.analysis.timestamp).getHours();
      if (!timeGroups[hour]) timeGroups[hour] = [];
      timeGroups[hour].push(result);
    }
    
    // Calcula tendência por hora
    const hourlyTrends = {};
    for (const [hour, groupResults] of Object.entries(timeGroups)) {
      const scores = groupResults.map(r => r.finalScore);
      hourlyTrends[hour] = {
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
        trend: this.calculateTrendDirection(scores)
      };
    }
    
    return {
      hourlyTrends,
      overallTrend: this.calculateTrendDirection(results.map(r => r.finalScore))
    };
  }

  /**
   * Calcula direção da tendência
   */
  calculateTrendDirection(scores) {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    
    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  }

  /**
   * Gera recomendações baseadas nas estatísticas
   */
  generateRecommendations(stats, trends) {
    const recommendations = [];
    
    if (stats.averageScore < -0.5) {
      recommendations.push({
        priority: 'high',
        message: '🚨 Sentimento geral do sistema está negativo',
        action: 'Investigue problemas recorrentes e implemente melhorias'
      });
    }
    
    if (trends.overallTrend === 'declining') {
      recommendations.push({
        priority: 'medium',
        message: '📉 Sentimento do sistema está piorando',
        action: 'Monitore tendências e identifique causas raiz'
      });
    }
    
    if (stats.confidence < 0.6) {
      recommendations.push({
        priority: 'low',
        message: '🤔 Análise de sentimento com baixa confiança',
        action: 'Colete mais dados para melhorar a precisão'
      });
    }
    
    return recommendations;
  }
}

module.exports = SentimentAnalysisSystem;
