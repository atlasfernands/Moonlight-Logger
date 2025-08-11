import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Card } from './components/ui/Card';
import { Filters } from './components/ui/Filters';
import { Pagination } from './components/ui/Pagination';
import { StatCard } from './components/ui/StatCard';
import { RecentLogsTable } from './components/logs/RecentLogsTable';
import { ActivityMini } from './components/charts/ActivityMini';
import { NewLogModal } from './components/logs/NewLogModal';
import { Settings } from './components/pages/Settings';
import { About } from './components/pages/About';
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
  file?: string;
  line?: number;
  column?: number;
  source?: string;
  ai?: { classification?: string; explanation?: string; suggestion?: string; provider?: string };
};

type Page = 'dashboard' | 'settings' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<{ level?: string; tag?: string; q?: string; from?: string; to?: string; hasSource?: boolean }>({});

  useEffect(() => {
    const queryObj: Record<string, string> = { limit: '20', page: String(page), paginate: 'true' };
    for (const [k, v] of Object.entries(filters)) {
      if (v === undefined || v === '' || v === false) continue;
      queryObj[k] = String(v);
    }
    const params = new URLSearchParams(queryObj);
    fetch(`http://localhost:4000/api/logs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
          setPages(1);
          setTotalCount(data.length);
        } else {
          setLogs(data.items ?? []);
          setPages(data.pageInfo?.pages ?? 1);
          setTotalCount(data.pageInfo?.total ?? 0);
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
    const qs: Record<string, string> = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v === undefined || v === '' || v === false) continue;
      qs[k] = String(v);
    }
    const params = new URLSearchParams(qs);
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            {error && (
              <div role="status" aria-live="polite" className="glass-card border border-amber-600/40">
                <div className="p-3 text-amber-300 text-sm">{error} Verifique se MongoDB e Redis estão rodando. O app tenta reconectar automaticamente.</div>
              </div>
            )}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <Filters
                  values={filters}
                  onApply={(f) => { setPage(1); setFilters(f); }}
                  onClear={() => { setPage(1); setFilters({}); }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:col-span-3">
                <StatCard label="Total Logs" value={totalCount} />
                <StatCard label="Errors" value={byLevel.find(b => b.level==='error')?.count ?? 0} highlight="secondary" />
                <StatCard label="Warnings" value={byLevel.find(b => b.level==='warn')?.count ?? 0} highlight="secondary" />
                <ActivityMini
                  data={timeline.map(t => ({ t: t.time, v: (t.info ?? 0)+(t.warn ?? 0)+(t.error ?? 0)+(t.debug ?? 0) }))}
                  actions={<NewLogModal onCreated={() => setPage(1)} />}
                />
              </div>

              <Card title="Últimos logs" className="lg:col-span-2">
                {loading ? (
                  <div className="p-6 text-neutral-400">Carregando...</div>
                ) : (
                  <RecentLogsTable
                    items={logs.slice(0, 10)}
                    activeLevel={filters.level as any}
                    onFilterLevel={(lvl) => { setPage(1); setFilters(s => ({ ...s, level: lvl } as any)); }}
                  />
                )}
                <div className="mt-3">
                  <Pagination page={page} pages={pages} onChange={setPage} />
                </div>
              </Card>

              <div>
                <Card title="Logs por nível">
                  <Suspense fallback={<div className="p-4 text-neutral-400">Carregando gráfico...</div>}>
                    <LogsByLevel data={byLevel} />
                  </Suspense>
                </Card>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="Timeline de logs" className="lg:col-span-3">
                <Suspense fallback={<div className="p-4 text-neutral-400">Carregando gráfico...</div>}>
                  <LogsTimeline data={timeline} />
                </Suspense>
              </Card>
            </section>
          </>
        );
      
      case 'settings':
        return <Settings />;
      
      case 'about':
        return <About />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-neutral-100 dashboard-bg dashboard-font">
      <Header currentPage={currentPage} onPageChange={(page: Page) => setCurrentPage(page)} />
      <div className="max-w-6xl mx-auto flex">
        {currentPage === 'dashboard' && <Sidebar />}
        <main className="flex-1 px-4 py-6 space-y-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
