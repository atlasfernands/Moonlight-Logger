#!/usr/bin/env node

/**
 * Simulador de Logs de Erro - Moonlight Logger
 * 
 * Este script simula logs de erro em tempo real para testar
 * se o frontend está capturando e exibindo os erros nos gráficos.
 */

const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3001';
const ERROR_INTERVAL = 2000; // 2 segundos entre erros
const SIMULATION_DURATION = 60000; // 1 minuto de simulação

// Tipos de erro para simular
const errorTypes = [
  {
    level: 'error',
    message: 'Database connection failed: Connection timeout after 30 seconds',
    tags: ['database', 'connection', 'timeout', 'critical'],
    context: {
      source: 'database-service',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'DB_CONN_001',
      stackTrace: `Error: Connection timeout
    at DatabaseService.connect (database.js:45:12)
    at async Server.startup (server.js:23:8)
    at process.startup (main.js:15:4)`
    }
  },
  {
    level: 'error',
    message: 'API rate limit exceeded: Too many requests from IP 192.168.1.100',
    tags: ['api', 'rate-limit', 'security', 'throttling'],
    context: {
      source: 'api-gateway',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'API_RATE_001',
      stackTrace: `Error: Rate limit exceeded
    at RateLimiter.checkLimit (rateLimiter.js:67:23)
    at async APIMiddleware.validate (middleware.js:34:12)
    at async Router.handle (router.js:89:7)`
    }
  },
  {
    level: 'error',
    message: 'File upload failed: Invalid file format detected',
    tags: ['file-upload', 'validation', 'security', 'malware'],
    context: {
      source: 'file-service',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'FILE_VAL_001',
      stackTrace: `Error: Invalid file format
    at FileValidator.validate (validator.js:123:45)
    at async FileService.processUpload (fileService.js:78:9)
    at async UploadController.handle (controller.js:56:3)`
    }
  },
  {
    level: 'error',
    message: 'Payment processing failed: Insufficient funds in account',
    tags: ['payment', 'finance', 'insufficient-funds', 'critical'],
    context: {
      source: 'payment-service',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'PAY_INSUF_001',
      stackTrace: `Error: Insufficient funds
    at PaymentProcessor.process (processor.js:234:67)
    at async PaymentController.authorize (controller.js:89:12)
    at async OrderService.finalize (orderService.js:156:7)`
    }
  },
  {
    level: 'error',
    message: 'Authentication failed: Invalid JWT token provided',
    tags: ['auth', 'jwt', 'security', 'unauthorized'],
    context: {
      source: 'auth-service',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'AUTH_JWT_001',
      stackTrace: `Error: Invalid JWT token
    at JWTValidator.validate (validator.js:89:34)
    at async AuthMiddleware.authenticate (middleware.js:45:8)
    at async ProtectedRoute.handle (route.js:67:4)`
    }
  },
  {
    level: 'error',
    message: 'Memory leak detected: Heap usage exceeded 90% threshold',
    tags: ['memory', 'performance', 'leak', 'critical'],
    context: {
      source: 'memory-monitor',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'MEM_LEAK_001',
      stackTrace: `Error: Memory usage critical
    at MemoryMonitor.checkUsage (monitor.js:156:23)
    at async SystemHealth.check (health.js:78:9)
    at async BackgroundTask.run (task.js:45:3)`
    }
  },
  {
    level: 'error',
    message: 'Network timeout: Request to external service failed after 30s',
    tags: ['network', 'timeout', 'external-service', 'critical'],
    context: {
      source: 'network-service',
      pid: process.pid,
      origin: 'error-simulation',
      errorCode: 'NET_TIMEOUT_001',
      stackTrace: `Error: Network timeout
    at NetworkService.request (network.js:89:12)
    at async ExternalAPIClient.call (client.js:67:8)
    at async ServiceOrchestrator.execute (orchestrator.js:123:4)`
    }
  }
];

// Função para simular um log de erro
async function simulateErrorLog() {
  try {
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    // Adiciona variação ao erro
    const timestamp = new Date();
    const logData = {
      ...errorType,
      timestamp,
      message: `${errorType.message} [${timestamp.toISOString()}]`,
      context: {
        ...errorType.context,
        timestamp: timestamp.toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
        userId: Math.floor(Math.random() * 10000),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'ErrorSimulator/1.0'
      }
    };

    // Envia o log para a API
    const response = await axios.post(`${API_BASE_URL}/api/logs`, logData);
    
    if (response.status === 201) {
      console.log(`✅ Erro simulado enviado: ${logData.message}`);
      console.log(`   📊 Tags: ${logData.tags.join(', ')}`);
      console.log(`   🔍 Código: ${logData.context.errorCode}`);
      console.log(`   📍 Origem: ${logData.context.source}`);
      console.log(`   ⏰ Timestamp: ${timestamp.toLocaleTimeString()}`);
      console.log('   ' + '─'.repeat(80));
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao simular log:`, error.message);
    return false;
  }
}

// Função para simular um erro único
async function simulateSingleError() {
  console.log('⚡ Simulando erro único...');
  console.log('🎯 Verifique o frontend para ver se o erro aparece!');
  console.log('=' .repeat(80));
  
  const success = await simulateErrorLog();
  
  if (success) {
    console.log('\n🎯 Erro único enviado com sucesso!');
    console.log('💡 Verifique o frontend em: http://localhost:3000');
    console.log('📊 O erro deve aparecer nos gráficos em tempo real');
  } else {
    console.log('\n❌ Falha ao enviar erro único');
  }
}

// Função para simular logs de erro em sequência
async function simulateErrorSequence() {
  console.log('🚨 Iniciando simulação de logs de erro...');
  console.log('🎯 Verifique o frontend para ver se os erros aparecem nos gráficos!');
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  
  const intervalId = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= SIMULATION_DURATION) {
      clearInterval(intervalId);
      console.log('\n🎯 Simulação concluída!');
      console.log(`📊 Resumo: ${successCount} sucessos, ${errorCount} falhas`);
      console.log(`⏱️  Duração: ${(elapsed / 1000).toFixed(1)}s`);
      return;
    }
    
    const success = await simulateErrorLog();
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    console.log(`📈 Progresso: ${successCount + errorCount} logs enviados | Tempo restante: ${((SIMULATION_DURATION - elapsed) / 1000).toFixed(1)}s`);
  }, ERROR_INTERVAL);
  
  // Primeiro erro imediato
  await simulateErrorLog();
}

// Função para simular pico de erros (muitos erros de uma vez)
async function simulateErrorSpike() {
  console.log('🔥 Simulando pico de erros...');
  console.log('⚠️  Enviando 10 erros simultaneamente...');
  console.log('🎯 Verifique o frontend para ver o pico nos gráficos!');
  console.log('=' .repeat(80));
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(simulateErrorLog());
    await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay entre cada
  }
  
  const results = await Promise.all(promises);
  const successCount = results.filter(Boolean).length;
  
  console.log(`🎯 Pico de erros concluído: ${successCount}/10 enviados com sucesso`);
  console.log('💡 Verifique o frontend para ver o pico nos gráficos!');
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    // Verifica se o servidor está rodando
    await axios.get(`${API_BASE_URL}/api/logs`);
    console.log('✅ Servidor backend está rodando!');
  } catch (error) {
    console.error('❌ Servidor backend não está rodando!');
    console.log('💡 Execute primeiro: start-logger.bat');
    process.exit(1);
  }
  
  switch (command) {
    case 'single':
      await simulateSingleError();
      break;
    case 'spike':
      await simulateErrorSpike();
      break;
    case 'continuous':
      await simulateErrorSequence();
      break;
    default:
      console.log('🚨 Simulador de Logs de Erro - Moonlight Logger');
      console.log('');
      console.log('Uso:');
      console.log('  node simulate-errors.js single       # Erro único (teste rápido)');
      console.log('  node simulate-errors.js spike        # Pico de erros (10 simultâneos)');
      console.log('  node simulate-errors.js continuous   # Simulação contínua (1 min)');
      console.log('');
      console.log('Exemplo: node simulate-errors.js single');
      console.log('');
      console.log('🎯 Verifique o frontend para ver se os erros aparecem nos gráficos!');
      console.log('💡 Acesse: http://localhost:3000');
      break;
  }
}

// Executa o programa
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  simulateErrorLog,
  simulateSingleError,
  simulateErrorSequence,
  simulateErrorSpike
};
