import { LocalAIProvider } from '../local';
import { LogDocument } from '../../../models/Log';

describe('LocalAIProvider', () => {
  let provider: LocalAIProvider;

  beforeEach(() => {
    provider = new LocalAIProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('availability', () => {
    it('should always be available', () => {
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe('pattern-based analysis', () => {
    it('should classify null reference errors', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Cannot read property \'name\' of undefined',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Null Reference Error');
      expect(insight.explanation).toContain('Tentativa de acessar propriedade');
      expect(insight.suggestion).toContain('Verifique se a variável está inicializada');
      expect(insight.confidence).toBe(0.9);
      expect(insight.provider).toBe('LocalAI');
    });

    it('should classify database connection errors', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'MongoDB connection timeout after 30 seconds',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Database Connection Issue');
      expect(insight.explanation).toContain('Problema de conectividade');
      expect(insight.suggestion).toContain('Verifique status do banco');
      expect(insight.confidence).toBe(0.85);
    });

    it('should classify network errors', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'ECONNREFUSED: Connection refused to external service',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Network Connectivity Problem');
      expect(insight.explanation).toContain('Falha na comunicação de rede');
      expect(insight.suggestion).toContain('Verifique conectividade');
      expect(insight.confidence).toBe(0.8);
    });

    it('should classify authentication errors', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Unauthorized: Invalid JWT token',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Authentication/Authorization Failure');
      expect(insight.explanation).toContain('Falha na autenticação');
      expect(insight.suggestion).toContain('Verifique tokens');
      expect(insight.confidence).toBe(0.9);
    });
  });

  describe('heuristic-based analysis', () => {
    it('should analyze error level logs with high confidence', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Something went wrong in the application',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Error Event');
      expect(insight.explanation).toContain('Evento de erro registrado');
      expect(insight.suggestion).toContain('Investigar causa raiz');
      expect(insight.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should analyze warning level logs with medium confidence', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'warn',
        message: 'High memory usage detected',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Warning Event');
      expect(insight.explanation).toContain('Aviso que pode indicar problema futuro');
      expect(insight.suggestion).toContain('Monitorar e investigar');
      expect(insight.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should analyze debug level logs with lower confidence', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'debug',
        message: 'Debug information for development',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Debug Information');
      expect(insight.explanation).toContain('Informação de debug para desenvolvimento');
      expect(insight.suggestion).toContain('Verificar se necessário em produção');
      expect(insight.confidence).toBeLessThan(0.5);
    });

    it('should include file and line information when available', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Error in user service',
        timestamp: new Date(),
        file: 'userService.js',
        line: 123,
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.explanation).toContain('userService.js:123');
      expect(insight.confidence).toBeGreaterThan(0.8);
    });

    it('should include tags information when available', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'User login successful',
        timestamp: new Date(),
        tags: ['auth', 'user'],
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.explanation).toContain('auth, user');
      expect(insight.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('message content analysis', () => {
    it('should classify application lifecycle events', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'Application started successfully',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Application Lifecycle');
      expect(insight.explanation).toContain('Evento relacionado ao ciclo de vida');
      expect(insight.suggestion).toContain('Verificar se inicialização está correta');
      expect(insight.confidence).toBe(0.7);
    });

    it('should classify process completion events', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'Data processing finished',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('Process Completion');
      expect(insight.explanation).toContain('Processo ou operação concluída');
      expect(insight.suggestion).toContain('Verificar se conclusão foi bem-sucedida');
      expect(insight.confidence).toBe(0.6);
    });

    it('should classify user activity events', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'User logged in from IP 192.168.1.1',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.classification).toBe('User Activity');
      expect(insight.explanation).toContain('Atividade relacionada ao usuário');
      expect(insight.suggestion).toContain('Monitorar padrões de uso e segurança');
      expect(insight.confidence).toBe(0.65);
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence based on multiple factors', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Database connection failed: timeout after 30 seconds',
        timestamp: new Date(),
        file: 'database.js',
        line: 42,
        tags: ['database', 'timeout'],
        context: { userId: 'user123' },
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      // Base confidence for error level: 0.8
      // + file and line: 0.1
      // + tags: 0.05
      // + long message: 0.02
      // Expected: 0.97
      expect(insight.confidence).toBeGreaterThan(0.9);
    });

    it('should cap confidence at 1.0', async () => {
      const log: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'A very long error message that exceeds normal length and contains detailed information about what went wrong in the system',
        timestamp: new Date(),
        file: 'veryLongFileName.js',
        line: 999,
        tags: ['error', 'system', 'critical', 'failure'],
        context: { userId: 'admin', sessionId: 'sess123', requestId: 'req456' },
      } as LogDocument;

      const insight = await provider.analyze(log);
      
      expect(insight.confidence).toBeLessThanOrEqual(1.0);
    });
  });
});
