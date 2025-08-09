/*
  Gerador de falsos logs para teste de captura/armazenamento/exibição.
  Uso:
    node src/logger/fakeLogs.js --url=http://localhost:4000 --rate=3 --burst=0

  Parâmetros:
    --url   URL base do backend (default: http://localhost:4000)
    --rate  eventos por segundo (default: 2, mínimo 1, máximo 50)
    --burst quantidade de eventos extras a cada 10s (default: 5)
*/

// CommonJS (o pacote backend é type: commonjs)
const URL_DEFAULT = 'http://localhost:4000';

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((kv) => {
      const [k, v] = kv.split('=');
      return [k.replace(/^--/, ''), v ?? ''];
    })
  );
  return {
    url: args.url || URL_DEFAULT,
    rate: Math.min(Math.max(Number(args.rate || 2), 1), 50),
    burst: Math.max(Number(args.burst || 5), 0),
  };
}

const messages = {
  info: [
    'User logged in successfully',
    'Cache warmed for /home',
    'Background job finished',
    'Feature flag loaded',
  ],
  warn: [
    'Slow response from payments API (1200ms)',
    'Disk usage above 80%',
    'Retrying connection to Redis',
    'JWT about to expire',
  ],
  error: [
    'Timeout connecting to MongoDB',
    'Unhandled exception in /orders route',
    'Failed to send email: 401 Unauthorized',
    'Payment gateway returned 502 Bad Gateway',
  ],
  debug: [
    'SQL: select * from users where id = ?',
    'Job payload: {"attempt":2}',
    'Cache miss for key user:123',
    'Session validated in 3ms',
  ],
};

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLevel() {
  const roll = Math.random();
  if (roll < 0.6) return 'info';
  if (roll < 0.8) return 'warn';
  if (roll < 0.95) return 'error';
  return 'debug';
}

async function postLog(url, level, message) {
  try {
    await fetch(`${url}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message }),
    });
  } catch (err) {
    // sem throw para não interromper gerador
    console.error('[fakeLogs] falha ao enviar log', err?.message || err);
  }
}

async function main() {
  const { url, rate, burst } = parseArgs();
  console.log(`[fakeLogs] Enviando para ${url} | rate=${rate}/s | burst=${burst}/10s`);

  // loop de taxa fixa (rate/s)
  setInterval(() => {
    const level = randomLevel();
    const message = randomOf(messages[level]);
    void postLog(url, level, message);
  }, Math.round(1000 / rate));

  // bursts ocasionais
  if (burst > 0) {
    setInterval(() => {
      for (let i = 0; i < burst; i++) {
        const level = randomLevel();
        const message = randomOf(messages[level]);
        void postLog(url, level, message + ' [burst]');
      }
    }, 10_000);
  }
}

main().catch((e) => {
  console.error('[fakeLogs] erro fatal', e);
  process.exit(1);
});


