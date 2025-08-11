// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/moonlightlogger_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.ENABLE_AI_ANALYSIS = 'true';
process.env.AI_PROVIDER = 'mock';

// Mock do console para evitar logs durante testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout padrão para testes
jest.setTimeout(10000);

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpa todos os timers após cada teste
afterEach(() => {
  jest.clearAllTimers();
});
