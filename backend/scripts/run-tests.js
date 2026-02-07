#!/usr/bin/env node
const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  return r.status ?? 1;
}

const smokePath = path.join(__dirname, '..', 'test', 'smoke.test.js');
const smokeStatus = run(process.execPath, ['--test', smokePath]);
if (smokeStatus !== 0) process.exit(smokeStatus);

const jestBin = path.join(__dirname, '..', 'node_modules', '.bin', 'jest');
if (!existsSync(jestBin)) {
  console.log('ℹ️ Jest não encontrado localmente; executado apenas smoke test.');
  process.exit(0);
}

console.log('🧪 Jest detectado; executando suíte completa...');
process.exit(run(jestBin, ['--runInBand']));
