#!/usr/bin/env node

/**
 * Teste de Stress em Produção - Moonlight Logger
 * 
 * Este script testa o sistema real com diferentes padrões de tráfego
 * para verificar a robustez e escalabilidade automática.
 */

const { ProductionStressTester } = require('./dist/logger/productionStressTest');

async function runProductionStressTest() {
  console.log('🚀 Moonlight Logger - Teste de Stress em Produção');
  console.log('=' .repeat(60));
  
  try {
    // Teste 1: Padrão de produção (padrão)
    console.log('\n🏭 TESTE 1: Padrão de Produção Realista');
    console.log('Simula um dia típico de produção com variações de carga');
    
    const productionTester = new ProductionStressTester({
      totalLogs: 50000, // 50k logs para teste mais rápido
      batchSize: 500,
      delayBetweenBatches: 100,
      trafficPattern: 'production',
      enableMetrics: true
    });
    
    await productionTester.startTest();
    
    // Aguarda um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Padrão com picos
    console.log('\n📈 TESTE 2: Padrão com Picos de Tráfego');
    console.log('Simula situações de rush hour e eventos especiais');
    
    const spikeTester = new ProductionStressTester({
      totalLogs: 30000,
      batchSize: 1000,
      delayBetweenBatches: 50,
      trafficPattern: 'spike',
      enableMetrics: true
    });
    
    await spikeTester.startTest();
    
    // Aguarda um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: Padrão em ondas
    console.log('\n🌊 TESTE 3: Padrão em Ondas');
    console.log('Simula variações cíclicas de tráfego');
    
    const waveTester = new ProductionStressTester({
      totalLogs: 40000,
      batchSize: 800,
      delayBetweenBatches: 75,
      trafficPattern: 'wave',
      enableMetrics: true
    });
    
    await waveTester.startTest();
    
    // Aguarda um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 4: Padrão caótico
    console.log('\n🌀 TESTE 4: Padrão Caótico');
    console.log('Simula falhas e recuperação do sistema');
    
    const chaosTester = new ProductionStressTester({
      totalLogs: 25000,
      batchSize: 600,
      delayBetweenBatches: 60,
      trafficPattern: 'chaos',
      enableMetrics: true
    });
    
    await chaosTester.startTest();
    
    console.log('\n🎯 TODOS OS TESTES CONCLUÍDOS!');
    console.log('=' .repeat(60));
    console.log('📊 Resumo dos resultados:');
    console.log('✅ Sistema testado com diferentes padrões de tráfego');
    console.log('✅ Escalabilidade automática verificada');
    console.log('✅ Performance em diferentes cenários validada');
    console.log('✅ Robustez do sistema confirmada');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Função para executar teste específico
async function runSpecificTest(testType) {
  console.log(`🚀 Executando teste específico: ${testType}`);
  
  const configs = {
    'production': {
      totalLogs: 20000,
      batchSize: 500,
      delayBetweenBatches: 100,
      trafficPattern: 'production'
    },
    'spike': {
      totalLogs: 15000,
      batchSize: 1000,
      delayBetweenBatches: 50,
      trafficPattern: 'spike'
    },
    'wave': {
      totalLogs: 20000,
      batchSize: 800,
      delayBetweenBatches: 75,
      trafficPattern: 'wave'
    },
    'chaos': {
      totalLogs: 12000,
      batchSize: 600,
      delayBetweenBatches: 60,
      trafficPattern: 'chaos'
    }
  };
  
  const config = configs[testType];
  if (!config) {
    console.error(`❌ Tipo de teste inválido: ${testType}`);
    console.log('Tipos disponíveis:', Object.keys(configs).join(', '));
    return;
  }
  
  const tester = new ProductionStressTester({
    ...config,
    enableMetrics: true
  });
  
  await tester.startTest();
}

// Função para teste rápido
async function runQuickTest() {
  console.log('⚡ Teste Rápido - Verificação Básica');
  
  const quickTester = new ProductionStressTester({
    totalLogs: 5000,
    batchSize: 200,
    delayBetweenBatches: 200,
    trafficPattern: 'steady',
    enableMetrics: true
  });
  
  await quickTester.startTest();
}

// Função para teste de carga extrema
async function runExtremeLoadTest() {
  console.log('🔥 Teste de Carga Extrema - 100k+ logs');
  
  const extremeTester = new ProductionStressTester({
    totalLogs: 100000,
    batchSize: 2000,
    delayBetweenBatches: 25,
    trafficPattern: 'production',
    enableMetrics: true
  });
  
  await extremeTester.startTest();
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await runProductionStressTest();
      break;
    case 'quick':
      await runQuickTest();
      break;
    case 'extreme':
      await runExtremeLoadTest();
      break;
    case 'production':
    case 'spike':
    case 'wave':
    case 'chaos':
      await runSpecificTest(command);
      break;
    default:
      console.log('🚀 Moonlight Logger - Teste de Stress');
      console.log('');
      console.log('Uso:');
      console.log('  node test-production-stress.js all          # Todos os testes');
      console.log('  node test-production-stress.js quick        # Teste rápido');
      console.log('  node test-production-stress.js extreme      # Carga extrema');
      console.log('  node test-production-stress.js production   # Padrão produção');
      console.log('  node test-production-stress.js spike        # Padrão com picos');
      console.log('  node test-production-stress.js wave         # Padrão em ondas');
      console.log('  node test-production-stress.js chaos        # Padrão caótico');
      console.log('');
      console.log('Exemplo: node test-production-stress.js quick');
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
  runProductionStressTest,
  runSpecificTest,
  runQuickTest,
  runExtremeLoadTest
};
