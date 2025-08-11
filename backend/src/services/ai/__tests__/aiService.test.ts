import { AIService } from '../index';
import { MockAIProvider } from '../providers/mock';
import { LocalAIProvider } from '../providers/local';
import { LogDocument } from '../../models/Log';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    // Limpa as variáveis de ambiente para testes
    delete process.env.OPENAI_API_KEY;
    aiService = new AIService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with available providers', () => {
      const providers = aiService.getAvailableProviders();
      expect(providers).toContain('LocalAIProvider');
      expect(providers).toContain('MockAIProvider');
    });

    it('should select LocalAIProvider as active when OpenAI is not available', () => {
      const activeProvider = aiService.getActiveProvider();
      expect(activeProvider).toBe('LocalAIProvider');
    });

    it('should select OpenAI when API key is available', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const newAiService = new AIService();
      const activeProvider = newAiService.getActiveProvider();
      expect(activeProvider).toBe('OpenAIProvider');
    });
  });

  describe('log analysis', () => {
    const mockLog: LogDocument = {
      _id: 'test-id',
      level: 'error',
      message: 'Database connection failed: timeout',
      timestamp: new Date(),
      context: { userId: 'user123' },
      tags: ['database'],
      file: 'database.js',
      line: 42,
    } as LogDocument;

    it('should analyze log and return insight', async () => {
      const insight = await aiService.analyzeLog(mockLog);
      
      expect(insight).toBeDefined();
      expect(insight?.classification).toBeDefined();
      expect(insight?.explanation).toBeDefined();
      expect(insight?.suggestion).toBeDefined();
      expect(insight?.confidence).toBeGreaterThan(0);
      expect(insight?.provider).toBe('LocalAIProvider');
    });

    it('should handle multiple logs analysis', async () => {
      const logs = [mockLog, { ...mockLog, _id: 'test-id-2' }];
      const insights = await aiService.analyzeLogs(logs);
      
      expect(insights.size).toBe(2);
      expect(insights.get('test-id')).toBeDefined();
      expect(insights.get('test-id-2')).toBeDefined();
    });

    it('should return null when no provider is available', async () => {
      // Força situação sem providers disponíveis
      const emptyService = new AIService();
      (emptyService as any).activeProvider = null;
      
      const insight = await emptyService.analyzeLog(mockLog);
      expect(insight).toBeNull();
    });
  });

  describe('provider selection', () => {
    it('should prioritize OpenAI over LocalAI when available', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const newAiService = new AIService();
      const providers = newAiService.getAvailableProviders();
      
      expect(providers[0]).toBe('OpenAIProvider');
      expect(providers[1]).toBe('LocalAIProvider');
    });

    it('should fallback to LocalAI when OpenAI fails', async () => {
      process.env.OPENAI_API_KEY = 'invalid-key';
      const newAiService = new AIService();
      
      // Força erro no OpenAI
      const mockOpenAIProvider = {
        analyze: jest.fn().mockRejectedValue(new Error('API Error')),
        isAvailable: jest.fn().mockReturnValue(true),
      };
      
      (newAiService as any).activeProvider = mockOpenAIProvider;
      
      const mockLog: LogDocument = {
        _id: 'test-id',
        level: 'error',
        message: 'Test error',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await newAiService.analyzeLog(mockLog);
      expect(insight).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      const mockProvider = {
        analyze: jest.fn().mockRejectedValue(new Error('Provider Error')),
        isAvailable: jest.fn().mockReturnValue(true),
      };
      
      (aiService as any).activeProvider = mockProvider;
      
      const mockLog: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'Test message',
        timestamp: new Date(),
      } as LogDocument;

      const insight = await aiService.analyzeLog(mockLog);
      expect(insight).toBeNull();
    });

    it('should log errors when analysis fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockProvider = {
        analyze: jest.fn().mockRejectedValue(new Error('Test Error')),
        isAvailable: jest.fn().mockReturnValue(true),
      };
      
      (aiService as any).activeProvider = mockProvider;
      
      const mockLog: LogDocument = {
        _id: 'test-id',
        level: 'info',
        message: 'Test message',
        timestamp: new Date(),
      } as LogDocument;

      await aiService.analyzeLog(mockLog);
      
      expect(consoleSpy).toHaveBeenCalledWith('Erro na análise de IA:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
