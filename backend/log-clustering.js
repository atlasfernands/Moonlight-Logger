/**
 * 🔍 SISTEMA DE CLUSTERING DE LOGS - MOONLIGHT LOGGER
 * 
 * Agrupa logs similares automaticamente para reduzir ruído
 * e melhorar a organização e análise dos dados.
 */

class LogClusteringSystem {
  constructor() {
    this.clusters = new Map();
    this.similarityThreshold = 0.7;
    this.maxClusterSize = 100;
    this.clusteringAlgorithms = {
      SIMILARITY: 'similarity',
      PATTERN: 'pattern',
      CONTEXT: 'context',
      TIME_BASED: 'time_based'
    };
  }

  /**
   * Processa um novo log e tenta agrupá-lo em um cluster existente
   */
  processLog(log) {
    const logHash = this.generateLogHash(log);
    
    // Tenta encontrar um cluster existente
    let bestCluster = null;
    let bestSimilarity = 0;
    
    for (const [clusterId, cluster] of this.clusters) {
      const similarity = this.calculateSimilarity(log, cluster.representative);
      
      if (similarity > bestSimilarity && similarity >= this.similarityThreshold) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    }
    
    if (bestCluster) {
      // Adiciona ao cluster existente
      this.addToCluster(bestCluster, log, bestSimilarity);
      return {
        action: 'clustered',
        clusterId: bestCluster.id,
        similarity: bestSimilarity,
        clusterSize: bestCluster.logs.length
      };
    } else {
      // Cria um novo cluster
      const newCluster = this.createNewCluster(log);
      this.clusters.set(newCluster.id, newCluster);
      
      return {
        action: 'new_cluster',
        clusterId: newCluster.id,
        similarity: 1.0,
        clusterSize: 1
      };
    }
  }

  /**
   * Gera um hash único para o log
   */
  generateLogHash(log) {
    const key = `${log.level}:${log.context?.source || 'unknown'}:${this.normalizeMessage(log.message)}`;
    return this.simpleHash(key);
  }

  /**
   * Normaliza a mensagem para comparação
   */
  normalizeMessage(message) {
    return message
      .toLowerCase()
      .replace(/\d+/g, 'N')           // Substitui números por N
      .replace(/[a-f0-9]{8,}/g, 'H')  // Substitui hashes por H
      .replace(/['"]/g, '')           // Remove aspas
      .trim();
  }

  /**
   * Hash simples para identificação
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calcula similaridade entre dois logs
   */
  calculateSimilarity(log1, log2) {
    let similarity = 0;
    let totalWeight = 0;
    
    // Similaridade da mensagem (peso: 0.5)
    const messageSimilarity = this.calculateMessageSimilarity(log1.message, log2.message);
    similarity += messageSimilarity * 0.5;
    totalWeight += 0.5;
    
    // Similaridade do contexto (peso: 0.3)
    const contextSimilarity = this.calculateContextSimilarity(log1.context, log2.context);
    similarity += contextSimilarity * 0.3;
    totalWeight += 0.3;
    
    // Similaridade das tags (peso: 0.2)
    const tagsSimilarity = this.calculateTagsSimilarity(log1.tags, log2.tags);
    similarity += tagsSimilarity * 0.2;
    totalWeight += 0.2;
    
    return similarity / totalWeight;
  }

  /**
   * Calcula similaridade entre mensagens
   */
  calculateMessageSimilarity(msg1, msg2) {
    if (!msg1 || !msg2) return 0;
    
    const normalized1 = this.normalizeMessage(msg1);
    const normalized2 = this.normalizeMessage(msg2);
    
    if (normalized1 === normalized2) return 1.0;
    
    // Calcula similaridade baseada em palavras comuns
    const words1 = new Set(normalized1.split(/\s+/));
    const words2 = new Set(normalized2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calcula similaridade entre contextos
   */
  calculateContextSimilarity(ctx1, ctx2) {
    if (!ctx1 || !ctx2) return 0;
    
    let matches = 0;
    let total = 0;
    
    // Compara campos comuns
    const fields = ['source', 'pid', 'origin'];
    for (const field of fields) {
      if (ctx1[field] !== undefined && ctx2[field] !== undefined) {
        total++;
        if (ctx1[field] === ctx2[field]) {
          matches++;
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  }

  /**
   * Calcula similaridade entre tags
   */
  calculateTagsSimilarity(tags1, tags2) {
    if (!tags1 || !tags2) return 0;
    if (tags1.length === 0 && tags2.length === 0) return 1.0;
    
    const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
    const set2 = new Set(tags2.map(tag => tag.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Adiciona um log a um cluster existente
   */
  addToCluster(cluster, log, similarity) {
    cluster.logs.push({
      ...log,
      addedAt: new Date(),
      similarity
    });
    
    // Atualiza estatísticas do cluster
    cluster.stats.totalLogs++;
    cluster.stats.lastUpdated = new Date();
    cluster.stats.averageSimilarity = 
      (cluster.stats.averageSimilarity * (cluster.stats.totalLogs - 1) + similarity) / cluster.stats.totalLogs;
    
    // Verifica se precisa dividir o cluster
    if (cluster.logs.length > this.maxClusterSize) {
      this.splitCluster(cluster);
    }
  }

  /**
   * Cria um novo cluster
   */
  createNewCluster(log) {
    const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: clusterId,
      representative: log,
      logs: [{
        ...log,
        addedAt: new Date(),
        similarity: 1.0
      }],
      createdAt: new Date(),
      lastUpdated: new Date(),
      stats: {
        totalLogs: 1,
        averageSimilarity: 1.0,
        patterns: this.extractPatterns(log)
      },
      metadata: {
        level: log.level,
        source: log.context?.source || 'unknown',
        tags: log.tags || [],
        messagePattern: this.extractMessagePattern(log.message)
      }
    };
  }

  /**
   * Extrai padrões da mensagem
   */
  extractMessagePattern(message) {
    if (!message) return '';
    
    return message
      .replace(/\d+/g, '{number}')
      .replace(/[a-f0-9]{8,}/g, '{hash}')
      .replace(/['"]/g, '')
      .trim();
  }

  /**
   * Extrai padrões do log
   */
  extractPatterns(log) {
    const patterns = [];
    
    // Padrão de timestamp
    if (log.timestamp) {
      const hour = new Date(log.timestamp).getHours();
      patterns.push(`hour_${hour}`);
    }
    
    // Padrão de nível
    patterns.push(`level_${log.level}`);
    
    // Padrão de origem
    if (log.context?.source) {
      patterns.push(`source_${log.context.source}`);
    }
    
    return patterns;
  }

  /**
   * Divide um cluster muito grande
   */
  splitCluster(cluster) {
    // Implementação básica: divide por similaridade
    const highSimilarity = cluster.logs.filter(log => log.similarity > 0.9);
    const mediumSimilarity = cluster.logs.filter(log => log.similarity > 0.7);
    
    if (highSimilarity.length > 0) {
      // Cria novo cluster com logs de alta similaridade
      const newCluster = this.createNewCluster(highSimilarity[0].representative);
      newCluster.logs = highSimilarity;
      newCluster.stats.totalLogs = highSimilarity.length;
      
      this.clusters.set(newCluster.id, newCluster);
    }
    
    // Mantém apenas logs de similaridade média no cluster original
    cluster.logs = mediumSimilarity;
    cluster.stats.totalLogs = mediumSimilarity.length;
  }

  /**
   * Obtém estatísticas dos clusters
   */
  getClusterStats() {
    const totalClusters = this.clusters.size;
    let totalLogs = 0;
    let averageClusterSize = 0;
    
    for (const cluster of this.clusters.values()) {
      totalLogs += cluster.logs.length;
    }
    
    if (totalClusters > 0) {
      averageClusterSize = totalLogs / totalClusters;
    }
    
    return {
      totalClusters,
      totalLogs,
      averageClusterSize: Math.round(averageClusterSize * 100) / 100,
      largestCluster: Math.max(...Array.from(this.clusters.values()).map(c => c.logs.length)),
      smallestCluster: Math.min(...Array.from(this.clusters.values()).map(c => c.logs.length))
    };
  }

  /**
   * Obtém clusters por critérios
   */
  getClustersByCriteria(criteria = {}) {
    let filteredClusters = Array.from(this.clusters.values());
    
    if (criteria.level) {
      filteredClusters = filteredClusters.filter(c => c.metadata.level === criteria.level);
    }
    
    if (criteria.source) {
      filteredClusters = filteredClusters.filter(c => c.metadata.source === criteria.source);
    }
    
    if (criteria.minSize) {
      filteredClusters = filteredClusters.filter(c => c.logs.length >= criteria.minSize);
    }
    
    if (criteria.maxSize) {
      filteredClusters = filteredClusters.filter(c => c.logs.length <= criteria.maxSize);
    }
    
    return filteredClusters.sort((a, b) => b.logs.length - a.logs.length);
  }

  /**
   * Limpa clusters antigos
   */
  cleanupOldClusters(maxAge = 24 * 60 * 60 * 1000) { // 24 horas
    const cutoff = Date.now() - maxAge;
    const toDelete = [];
    
    for (const [clusterId, cluster] of this.clusters) {
      if (cluster.lastUpdated < cutoff && cluster.logs.length < 5) {
        toDelete.push(clusterId);
      }
    }
    
    for (const clusterId of toDelete) {
      this.clusters.delete(clusterId);
    }
    
    return toDelete.length;
  }
}

module.exports = LogClusteringSystem;
