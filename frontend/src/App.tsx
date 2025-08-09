import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Card } from './components/ui/Card';
import { Suspense, lazy } from 'react';
const LogsByLevel = lazy(() => import('./components/charts/LogsByLevel').then(m => ({ default: m.LogsByLevel })));
const LogsTimeline = lazy(() => import('./components/charts/LogsTimeline').then(m => ({ default: m.LogsTimeline })));
import type { TimelinePoint } from './components/charts/LogsTimeline';

type LogItem = {
  _id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  tags?: string[];
  suggestion?: string;
};

function App() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/logs?limit=20')
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .catch(() => setError('Não foi possível conectar ao backend (porta 4000).'))
      .finally(() => setLoading(false));

    const socket: Socket = io('http://localhost:4000', { transports: ['websocket'], autoConnect: true, reconnection: true });
    socket.on('connect', () => {
      setError(null);
    });
    socket.on('connect_error', () => {
      setError('Socket desconectado. Tentando reconectar...');
    });
    socket.on('log-created', (item: LogItem) => {
      setLogs((prev) => [item, ...prev].slice(0, 50));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const byLevel = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of logs) map[l.level] = (map[l.level] ?? 0) + 1;
    return Object.entries(map).map(([level, count]) => ({ level, count }));
  }, [logs]);

  const timeline: TimelinePoint[] = useMemo(() => {
    // agrega por minuto
    const buckets: Record<string, TimelinePoint> = {};
    for (const l of logs) {
      const t = new Date(l.timestamp);
      const key = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { time: key, info: 0, warn: 0, error: 0, debug: 0 };
      const bucket = buckets[key]!;
      if (l.level === 'info') bucket.info = (bucket.info ?? 0) + 1;
      else if (l.level === 'warn') bucket.warn = (bucket.warn ?? 0) + 1;
      else if (l.level === 'error') bucket.error = (bucket.error ?? 0) + 1;
      else if (l.level === 'debug') bucket.debug = (bucket.debug ?? 0) + 1;
    }
    return Object.values(buckets).sort((a, b) => (a.time < b.time ? -1 : 1));
  }, [logs]);

  return (
    <div className="min-h-screen text-neutral-100" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: 'var(--moon-bg)' }}>
      <Header />
      <div className="max-w-6xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 px-4 py-6 space-y-6">
          {error && (
            <div role="status" aria-live="polite" className="glass-card border border-amber-600/40">
              <div className="p-3 text-amber-300 text-sm">{error} Verifique se MongoDB e Redis estão rodando. O app tenta reconectar automaticamente.</div>
            </div>
          )}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title="Últimos logs" className="lg:col-span-2">
              {loading ? (
                <div className="p-6 text-neutral-400">Carregando...</div>
              ) : (
                <ul className="divide-y divide-moon-border/80">
                  {logs.map((log) => (
                    <li key={log._id} className="p-4 hover:bg-white/5">
                      <div className="flex items-start justify-between">
      <div>
                          <span className="px-2 py-0.5 rounded text-xs mr-2 border glow-border" data-level={log.level}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-neutral-200">{log.message}</span>
                        </div>
                        <time className="text-xs text-neutral-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </time>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {log.tags?.map((t) => (
                          <span key={t} className="text-xs text-neutral-400">#{t}</span>
                        ))}
                      </div>
                      {log.suggestion && (
                        <p className="mt-2 text-sm text-emerald-400">Sugestão: {log.suggestion}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Logs por nível">
              <Suspense fallback={<div className="p-4 text-neutral-400">Carregando gráfico...</div>}>
                <LogsByLevel data={byLevel} />
              </Suspense>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title="Timeline de logs" className="lg:col-span-3">
              <Suspense fallback={<div className="p-4 text-neutral-400">Carregando gráfico...</div>}>
                <LogsTimeline data={timeline} />
              </Suspense>
            </Card>
          </section>
        </main>
      </div>
      </div>
  );
}

export default App;
