const LogClusteringSystem = require('../log-clustering.js');

describe('LogClusteringSystem', () => {
  let clusteringSystem: any;

  beforeEach(() => {
    clusteringSystem = new LogClusteringSystem();
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      expect(clusteringSystem.similarityThreshold).toBe(0.7);
      expect(clusteringSystem.maxClusterSize).toBe(100);
      expect(clusteringSystem.autoCleanup).toBe(true);
      expect(clusteringSystem.clusters).toEqual([]);
    });

    test('should allow custom configuration', () => {
      const customConfig = {
        similarityThreshold: 0.8,
        maxClusterSize: 50,
        autoCleanup: false
      };

      clusteringSystem = new LogClusteringSystem(customConfig);
      
      expect(clusteringSystem.similarityThreshold).toBe(0.8);
      expect(clusteringSystem.maxClusterSize).toBe(50);
      expect(clusteringSystem.autoCleanup).toBe(false);
    });
  });

  describe('processLog', () => {
    test('should create new cluster for first log', () => {
      const log = {
        level: 'error',
        message: 'Database connection failed',
        timestamp: new Date(),
        context: { file: 'database.js', line: 10 }
      };

      clusteringSystem.processLog(log);
      
      expect(clusteringSystem.clusters).toHaveLength(1);
      expect(clusteringSystem.clusters[0].logs).toHaveLength(1);
      expect(clusteringSystem.clusters[0].pattern).toBe('Database connection failed');
    });

    test('should add similar logs to existing cluster', () => {
      const similarLogs = [
        { level: 'error', message: 'Database connection failed', timestamp: new Date() },
        { level: 'error', message: 'Database connection failed', timestamp: new Date() },
        { level: 'error', message: 'Database connection failed', timestamp: new Date() }
      ];

      similarLogs.forEach(log => clusteringSystem.processLog(log));
      
      expect(clusteringSystem.clusters).toHaveLength(1);
      expect(clusteringSystem.clusters[0].logs).toHaveLength(3);
      expect(clusteringSystem.clusters[0].count).toBe(3);
    });

    test('should create separate clusters for different messages', () => {
      const differentLogs = [
        { level: 'error', message: 'Database connection failed', timestamp: new Date() },
        { level: 'error', message: 'User authentication failed', timestamp: new Date() },
        { level: 'warn', message: 'Cache miss', timestamp: new Date() }
      ];

      differentLogs.forEach(log => clusteringSystem.processLog(log));
      
      expect(clusteringSystem.clusters).toHaveLength(3);
      expect(clusteringSystem.clusters[0].pattern).toBe('Database connection failed');
      expect(clusteringSystem.clusters[1].pattern).toBe('User authentication failed');
      expect(clusteringSystem.clusters[2].pattern).toBe('Cache miss');
    });
  });

  describe('calculateSimilarity', () => {
    test('should calculate high similarity for identical messages', () => {
      const log1 = { message: 'Database connection failed' };
      const log2 = { message: 'Database connection failed' };

      const similarity = clusteringSystem.calculateSimilarity(log1, log2);
      expect(similarity).toBe(1.0);
    });

    test('should calculate similarity for similar messages', () => {
      const log1 = { message: 'Database connection failed' };
      const log2 = { message: 'Database connection timeout' };

      const similarity = clusteringSystem.calculateSimilarity(log1, log2);
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });

    test('should calculate low similarity for different messages', () => {
      const log1 = { message: 'Database connection failed' };
      const log2 = { message: 'User login successful' };

      const similarity = clusteringSystem.calculateSimilarity(log1, log2);
      expect(similarity).toBeLessThan(0.5);
    });

    test('should consider context in similarity calculation', () => {
      const log1 = {
        message: 'Connection failed',
        context: { file: 'database.js', line: 10 }
      };
      const log2 = {
        message: 'Connection failed',
        context: { file: 'database.js', line: 15 }
      };

      const similarity = clusteringSystem.calculateSimilarity(log1, log2);
      expect(similarity).toBeGreaterThan(0.8);
    });
  });

  describe('Cluster Management', () => {
    test('should split large clusters', () => {
      clusteringSystem.maxClusterSize = 3;

      // Adiciona 5 logs similares
      for (let i = 0; i < 5; i++) {
        const log = {
          level: 'error',
          message: `Database connection failed ${i}`,
          timestamp: new Date()
        };
        clusteringSystem.processLog(log);
      }

      // Verifica se o cluster foi dividido
      expect(clusteringSystem.clusters.length).toBeGreaterThan(1);
    });

    test('should get cluster statistics', () => {
      const logs = [
        { level: 'error', message: 'Error 1', timestamp: new Date() },
        { level: 'error', message: 'Error 2', timestamp: new Date() },
        { level: 'warn', message: 'Warning 1', timestamp: new Date() }
      ];

      logs.forEach(log => clusteringSystem.processLog(log));

      const stats = clusteringSystem.getClusterStats();
      expect(stats.totalClusters).toBeGreaterThan(0);
      expect(stats.totalLogs).toBe(3);
      expect(stats.averageClusterSize).toBeGreaterThan(0);
    });

    test('should find clusters by criteria', () => {
      const logs = [
        { level: 'error', message: 'Database error', timestamp: new Date(), tags: ['db'] },
        { level: 'warn', message: 'Cache warning', timestamp: new Date(), tags: ['cache'] },
        { level: 'error', message: 'API error', timestamp: new Date(), tags: ['api'] }
      ];

      logs.forEach(log => clusteringSystem.processLog(log));

      const dbClusters = clusteringSystem.getClustersByCriteria({ level: 'error', tags: ['db'] });
      expect(dbClusters.length).toBeGreaterThan(0);
      expect(dbClusters[0].pattern).toBe('Database error');
    });
  });

  describe('Pattern Extraction', () => {
    test('should extract message patterns', () => {
      const logs = [
        { message: 'Database connection failed at 10:30' },
        { message: 'Database connection failed at 11:45' },
        { message: 'Database connection failed at 14:20' }
      ];

      const pattern = clusteringSystem.extractMessagePattern(logs);
      expect(pattern).toBe('Database connection failed at *');
    });

    test('should handle logs with no common pattern', () => {
      const logs = [
        { message: 'Database connection failed' },
        { message: 'User authentication failed' },
        { message: 'Cache miss' }
      ];

      const pattern = clusteringSystem.extractMessagePattern(logs);
      expect(pattern).toBe('*');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup old clusters when enabled', () => {
      clusteringSystem.autoCleanup = true;
      clusteringSystem.cleanupInterval = 1000; // 1 segundo

      const oldLog = {
        level: 'error',
        message: 'Old error',
        timestamp: new Date(Date.now() - 2000) // 2 segundos atrás
      };

      clusteringSystem.processLog(oldLog);
      
      // Simula passagem do tempo
      setTimeout(() => {
        clusteringSystem.cleanupOldClusters();
        expect(clusteringSystem.clusters).toHaveLength(0);
      }, 1500);
    });

    test('should not cleanup when disabled', () => {
      clusteringSystem.autoCleanup = false;

      const oldLog = {
        level: 'error',
        message: 'Old error',
        timestamp: new Date(Date.now() - 2000)
      };

      clusteringSystem.processLog(oldLog);
      clusteringSystem.cleanupOldClusters();
      
      expect(clusteringSystem.clusters).toHaveLength(1);
    });
  });
});
