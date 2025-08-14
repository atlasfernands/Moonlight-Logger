import { config } from 'dotenv';

// Carrega variáveis de ambiente para testes
config({ path: '.env.test' });

// Mock global para testes
global.console = {
  ...console,
  // Suprime logs durante testes
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Configurações globais de teste
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.MONGODB_URI = 'mongodb://localhost:27017/moonlight-test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Timeout padrão para testes
jest.setTimeout(10000);

// Limpa mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpa todos os mocks após todos os testes
afterAll(() => {
  jest.restoreAllMocks();
});
