#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const jestBin = path.resolve(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'jest.cmd' : 'jest');

if (fs.existsSync(jestBin)) {
  const result = spawnSync(jestBin, process.argv.slice(2), { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

console.warn('⚠️ Jest não encontrado. Executando smoke tests para validação mínima.');
const smoke = spawnSync('node', [path.resolve(__dirname, 'smoke-test.js')], { stdio: 'inherit' });
process.exit(smoke.status ?? 1);
