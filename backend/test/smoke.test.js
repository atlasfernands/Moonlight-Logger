const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const IntelligentAlertSystem = require('../alerts.js');

test('alert system creates critical alert for critical error patterns', () => {
  const system = new IntelligentAlertSystem();
  const log = {
    level: 'error',
    message: 'CRITICAL: Database connection refused',
    timestamp: new Date()
  };

  const alerts = system.analyzeLog(log);
  assert.ok(Array.isArray(alerts));
  assert.ok(alerts.some((a) => a.type === 'critical_error'));
});

test('alert system resolves alerts correctly', () => {
  const system = new IntelligentAlertSystem();
  system.analyzeLog({
    level: 'error',
    message: 'fatal exception in payment service',
    timestamp: new Date()
  });

  const activeBefore = system.getActiveAlerts();
  assert.ok(activeBefore.length >= 1);

  for (const alert of activeBefore) {
    system.resolveAlert(alert.id);
  }

  assert.equal(system.getActiveAlerts().length, 0);
});

test('root config keeps coreMode toggle available', () => {
  const configPath = path.resolve(__dirname, '../../config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  const cfg = JSON.parse(raw);

  assert.equal(typeof cfg.coreMode, 'boolean');
});
