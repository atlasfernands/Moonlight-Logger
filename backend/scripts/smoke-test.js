#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ ${msg}`);
    process.exitCode = 1;
  }
}

const root = path.resolve(__dirname, '..');
const cfgPath = path.resolve(root, '..', 'config.json');

try {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  assert(typeof cfg.port === 'number', 'config.json deve conter "port" numérico');
  assert(cfg.features && typeof cfg.features.minimalProcessing === 'boolean', 'config.json deve conter features.minimalProcessing boolean');
} catch (e) {
  console.error('❌ Falha ao validar config.json:', e.message);
  process.exit(1);
}

const requiredFiles = [
  'src/config/app.ts',
  'src/config/redis.ts',
  'src/services/consoleCapture.ts',
  'src/services/logAnalysisService.ts',
  'src/routes/logs.ts'
];

for (const f of requiredFiles) {
  const full = path.join(root, f);
  assert(fs.existsSync(full), `Arquivo obrigatório ausente: ${f}`);
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('✅ Smoke tests passaram (config + arquivos principais).');
