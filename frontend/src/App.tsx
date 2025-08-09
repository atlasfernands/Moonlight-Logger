import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Card } from './components/ui/Card';
import { Filters } from './components/ui/Filters';
import { Pagination } from './components/ui/Pagination';
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
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<{ level?: string; tag?: string; q?: string; from?: string; to?: string }>({});

  useEffect(() => {
    const params = new URLSearchParams({ limit: '20', page: String(page), paginate: 'true', ...Object.fromEntries(Object.entries(filters).filter(([,v]) => !!v)) });
    fetch(`http://localhost:4000/api/logs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
          setPages(1);
        } else {
          setLogs(data.items ?? []);
          setPages(data.pageInfo?.pages ?? 1);
        }
      })
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
  }, [page, filters]);

  const [byLevel, setByLevel] = useState<{ level: string; count: number }[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([,v]) => !!v)) });
    fetch(`http://localhost:4000/api/stats/logs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const counts = data.countsByLevel ?? {};
        setByLevel([
          { level: 'info', count: counts.info ?? 0 },
          { level: 'warn', count: counts.warn ?? 0 },
          { level: 'error', count: counts.error ?? 0 },
          { level: 'debug', count: counts.debug ?? 0 },
        ]);
        setTimeline((data.timeline ?? []).map((t: any) => ({
          time: new Date(t.time).toLocaleTimeString(),
          info: t.info,
          warn: t.warn,
          error: t.error,
          debug: t.debug,
        })));
      })
      .catch(() => void 0);
  }, [filters]);

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
            <div className="lg:col-span-3">
              <Filters onApply={(f) => { setPage(1); setFilters(f); }} />
            </div>
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
              <div className="mt-3">
                <Pagination page={page} pages={pages} onChange={setPage} />
              </div>
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
