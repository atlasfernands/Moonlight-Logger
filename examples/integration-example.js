/**
 * 🌙 EXEMPLO DE INTEGRAÇÃO - MOONLIGHT LOGGER
 * 
 * Este arquivo mostra como integrar facilmente o Moonlight Logger
 * em seus projetos JavaScript/Node.js.
 */

// ========================================
// 🚀 INTEGRAÇÃO SIMPLES (RECOMENDADO)
// ========================================

// 1. Função para enviar logs para o Moonlight Logger
async function sendToMoonlightLogger(level, message, context = {}) {
  try {
    const response = await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        timestamp: new Date(),
        tags: context.tags || [],
        context: {
          source: context.source || 'my-project',
          pid: process.pid,
          origin: 'integration-example',
          ...context
        }
      })
    });
    
    if (response.ok) {
      console.log(`✅ Log enviado para Moonlight Logger: ${message}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar log:', error.message);
  }
}

// 2. Substitua console.log por nossa função
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
  // Mantém o console original
  originalConsoleLog.apply(console, args);
  
  // Envia para o Moonlight Logger
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  sendToMoonlightLogger('info', message, {
    source: 'console-override',
    tags: ['console', 'info']
  });
};

console.warn = function(...args) {
  originalConsoleWarn.apply(console, args);
  
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  sendToMoonlightLogger('warn', message, {
    source: 'console-override',
    tags: ['console', 'warning']
  });
};

console.error = function(...args) {
  originalConsoleError.apply(console, args);
  
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  sendToMoonlightLogger('error', message, {
    source: 'console-override',
    tags: ['console', 'error', 'critical']
  });
};

// ========================================
// 🎯 EXEMPLOS DE USO
// ========================================

// Simula uma aplicação real
async function simulateUserLogin() {
  try {
    console.log('🔐 Tentativa de login do usuário...');
    
    // Simula validação
    const user = { id: 123, email: 'user@example.com' };
    console.log('✅ Usuário validado:', user);
    
    // Simula erro de banco
    throw new Error('Database connection failed');
    
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    
    // Log adicional com contexto
    sendToMoonlightLogger('error', 'Falha na autenticação', {
      source: 'auth-service',
      tags: ['auth', 'login', 'database'],
      userId: 123,
      errorCode: 'AUTH_001',
      stackTrace: error.stack
    });
  }
}

// Simula monitoramento de performance
function monitorPerformance() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  console.log('📊 Métricas de performance:', {
    memory: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    cpu: `${(cpuUsage.user / 1000).toFixed(2)}ms`
  });
  
  // Log específico para performance
  sendToMoonlightLogger('info', 'Métricas de performance coletadas', {
    source: 'performance-monitor',
    tags: ['performance', 'metrics'],
    metrics: {
      memory: memoryUsage,
      cpu: cpuUsage,
      timestamp: new Date().toISOString()
    }
  });
}

// ========================================
// 🚨 CAPTURA DE ERROS NÃO TRATADOS
// ========================================

// Captura erros não tratados
process.on('uncaughtException', (error) => {
  console.error('💥 Erro não tratado:', error);
  
  sendToMoonlightLogger('error', 'Erro não tratado detectado', {
    source: 'uncaught-exception',
    tags: ['critical', 'uncaught', 'system'],
    errorCode: 'UNCAUGHT_001',
    stackTrace: error.stack,
    processInfo: {
      pid: process.pid,
      version: process.version,
      platform: process.platform
    }
  });
  
  // Em produção, você pode querer encerrar o processo
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promise rejeitada não tratada:', reason);
  
  sendToMoonlightLogger('error', 'Promise rejeitada não tratada', {
    source: 'unhandled-rejection',
    tags: ['critical', 'promise', 'async'],
    errorCode: 'UNHANDLED_001',
    reason: reason?.message || String(reason),
    promiseInfo: {
      pid: process.pid,
      timestamp: new Date().toISOString()
    }
  });
});

// ========================================
// 🔧 FUNÇÕES UTILITÁRIAS
// ========================================

// Função para log estruturado
function logStructured(level, message, data = {}) {
  const logData = {
    level,
    message,
    timestamp: new Date(),
    tags: data.tags || [],
    context: {
      source: data.source || 'structured-log',
      pid: process.pid,
      origin: 'integration-example',
      ...data
    }
  };
  
  // Envia para o Moonlight Logger
  sendToMoonlightLogger(level, message, logData.context);
  
  // Também loga no console
  console[level] || console.log(`[${level.toUpperCase()}] ${message}`, data);
}

// Função para log de transação
function logTransaction(action, userId, details = {}) {
  logStructured('info', `Transação: ${action}`, {
    source: 'transaction-logger',
    tags: ['transaction', action],
    userId,
    action,
    details,
    transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
}

// ========================================
// 🧪 TESTE DA INTEGRAÇÃO
// ========================================

async function testIntegration() {
  console.log('🧪 Testando integração com Moonlight Logger...');
  
  // Teste de logs normais
  console.log('📝 Este é um log de informação');
  console.warn('⚠️  Este é um aviso');
  console.error('❌ Este é um erro');
  
  // Teste de log estruturado
  logStructured('info', 'Usuário criado com sucesso', {
    source: 'user-service',
    tags: ['user', 'creation'],
    userId: 456,
    email: 'newuser@example.com'
  });
  
  // Teste de transação
  logTransaction('purchase', 789, {
    amount: 99.99,
    product: 'Premium Plan',
    paymentMethod: 'credit-card'
  });
  
  // Teste de performance
  monitorPerformance();
  
  // Teste de erro
  try {
    throw new Error('Erro simulado para teste');
  } catch (error) {
    console.error('❌ Erro capturado:', error.message);
  }
  
  console.log('✅ Teste de integração concluído!');
  console.log('🌐 Verifique o dashboard em: http://localhost:3000');
}

// ========================================
// 🚀 INICIALIZAÇÃO
// ========================================

// Verifica se o Moonlight Logger está rodando
async function checkMoonlightLogger() {
  try {
    const response = await fetch('http://localhost:3001/api/logs');
    if (response.ok) {
      console.log('✅ Moonlight Logger está rodando!');
      return true;
    }
  } catch (error) {
    console.warn('⚠️  Moonlight Logger não está rodando');
    console.log('💡 Execute: start-logger.bat');
    return false;
  }
}

// Inicia o teste se o logger estiver rodando
async function main() {
  const isRunning = await checkMoonlightLogger();
  
  if (isRunning) {
    // Aguarda um pouco para estabilizar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Executa o teste
    await testIntegration();
  } else {
    console.log('🔄 Execute o Moonlight Logger primeiro e rode novamente');
  }
}

// Executa se for o arquivo principal
if (require.main === module) {
  main().catch(console.error);
}

// Exporta as funções para uso em outros módulos
module.exports = {
  sendToMoonlightLogger,
  logStructured,
  logTransaction,
  monitorPerformance,
  checkMoonlightLogger
};
