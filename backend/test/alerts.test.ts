const IntelligentAlertSystem = require('../alerts.js');

describe('IntelligentAlertSystem', () => {
  let alertSystem: any;

  beforeEach(() => {
    alertSystem = new IntelligentAlertSystem();
  });

  describe('Constructor', () => {
    test('should initialize with default thresholds', () => {
      expect(alertSystem.thresholds.errorSpike).toBe(5);
      expect(alertSystem.thresholds.warningFlood).toBe(20);
      expect(alertSystem.thresholds.criticalError).toBe(1);
    });

    test('should initialize with empty alerts array', () => {
      expect(alertSystem.alerts).toEqual([]);
    });
  });

  describe('analyzeLog', () => {
    test('should detect error spike', () => {
      // Simula 6 logs de erro em sequência (acima do threshold de 5)
      for (let i = 0; i < 6; i++) {
        const log = {
          level: 'error',
          message: `Error ${i}`,
          timestamp: new Date(),
          context: { file: 'test.js', line: i }
        };
        alertSystem.analyzeLog(log);
      }

      const activeAlerts = alertSystem.getActiveAlerts();
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].type).toBe('error_spike');
      expect(activeAlerts[0].severity).toBe('high');
    });

    test('should detect warning flood', () => {
      // Simula 21 logs de warning (acima do threshold de 20)
      for (let i = 0; i < 21; i++) {
        const log = {
          level: 'warn',
          message: `Warning ${i}`,
          timestamp: new Date(),
          context: { file: 'test.js', line: i }
        };
        alertSystem.analyzeLog(log);
      }

      const activeAlerts = alertSystem.getActiveAlerts();
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].type).toBe('warning_flood');
      expect(activeAlerts[0].severity).toBe('medium');
    });

    test('should detect critical error', () => {
      const criticalLog = {
        level: 'error',
        message: 'FATAL: Database connection failed',
        timestamp: new Date(),
        context: { file: 'database.js', line: 1 },
        tags: ['critical', 'database']
      };

      alertSystem.analyzeLog(criticalLog);
      const activeAlerts = alertSystem.getActiveAlerts();
      
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].type).toBe('critical_error');
      expect(activeAlerts[0].severity).toBe('critical');
    });

    test('should detect pattern in logs', () => {
      const logs = [
        { level: 'error', message: 'Connection timeout', timestamp: new Date() },
        { level: 'error', message: 'Connection timeout', timestamp: new Date() },
        { level: 'error', message: 'Connection timeout', timestamp: new Date() }
      ];

      logs.forEach(log => alertSystem.analyzeLog(log));
      
      const activeAlerts = alertSystem.getActiveAlerts();
      expect(activeAlerts.some((alert: any) => alert.type === 'pattern_detected')).toBe(true);
    });
  });

  describe('isCriticalError', () => {
    test('should identify critical errors by message content', () => {
      const criticalMessages = [
        'FATAL: System crash',
        'CRITICAL: Memory overflow',
        'EMERGENCY: Service unavailable',
        'Database connection failed',
        'Authentication service down'
      ];

      criticalMessages.forEach(message => {
        const log = { level: 'error', message, timestamp: new Date() };
        expect(alertSystem.isCriticalError(log)).toBe(true);
      });
    });

    test('should identify critical errors by tags', () => {
      const log = {
        level: 'error',
        message: 'Some error',
        timestamp: new Date(),
        tags: ['critical', 'security']
      };

      expect(alertSystem.isCriticalError(log)).toBe(true);
    });

    test('should not identify non-critical errors', () => {
      const log = {
        level: 'error',
        message: 'User not found',
        timestamp: new Date()
      };

      expect(alertSystem.isCriticalError(log)).toBe(false);
    });
  });

  describe('Alert Management', () => {
    test('should resolve alerts', () => {
      // Cria um alerta
      const log = {
        level: 'error',
        message: 'Test error',
        timestamp: new Date()
      };
      alertSystem.analyzeLog(log);

      const alerts = alertSystem.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      // Resolve o alerta
      alertSystem.resolveAlert(alerts[0].id);
      const resolvedAlerts = alertSystem.getActiveAlerts();
      expect(resolvedAlerts.length).toBe(0);
    });

    test('should get alert statistics', () => {
      const logs = [
        { level: 'error', message: 'Error 1', timestamp: new Date() },
        { level: 'warn', message: 'Warning 1', timestamp: new Date() },
        { level: 'error', message: 'Error 2', timestamp: new Date() }
      ];

      logs.forEach(log => alertSystem.analyzeLog(log));

      const stats = alertSystem.getAlertStats();
      expect(stats.totalAlerts).toBeGreaterThan(0);
      expect(stats.activeAlerts).toBeGreaterThan(0);
      expect(stats.alertTypes).toBeDefined();
    });
  });

  describe('Threshold Configuration', () => {
    test('should allow custom threshold configuration', () => {
      const customThresholds = {
        errorSpike: 3,
        warningFlood: 15,
        criticalError: 1
      };

      alertSystem.thresholds = customThresholds;
      
      expect(alertSystem.thresholds.errorSpike).toBe(3);
      expect(alertSystem.thresholds.warningFlood).toBe(15);
    });

    test('should detect error spike with custom threshold', () => {
      alertSystem.thresholds.errorSpike = 3;

      // Simula 4 logs de erro (acima do threshold customizado)
      for (let i = 0; i < 4; i++) {
        const log = {
          level: 'error',
          message: `Error ${i}`,
          timestamp: new Date()
        };
        alertSystem.analyzeLog(log);
      }

      const activeAlerts = alertSystem.getActiveAlerts();
      expect(activeAlerts.some((alert: any) => alert.type === 'error_spike')).toBe(true);
    });
  });
});
