import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

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

  useEffect(() => {
    fetch('http://localhost:4000/api/logs?limit=20')
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));

    const socket: Socket = io('http://localhost:4000', { transports: ['websocket'] });
    socket.on('connect', () => {
      console.log('[socket] conectado', socket.id);
    });
    socket.on('log-created', (item: LogItem) => {
      setLogs((prev) => [item, ...prev].slice(0, 50));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 sticky top-0 bg-neutral-950/80 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-semibold tracking-wide">
            Moonlight Logger
          </h1>
          <span className="text-xs text-neutral-400">Dark · Lunar vibes</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Últimos logs</h2>
            <div className="rounded-lg border border-neutral-800 overflow-hidden">
              {loading ? (
                <div className="p-6 text-neutral-400">Carregando...</div>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {logs.map((log) => (
                    <li key={log._id} className="p-4 hover:bg-neutral-900">
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className="px-2 py-0.5 rounded text-xs mr-2 border"
                            data-level={log.level}
                          >
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
                        <p className="mt-2 text-sm text-emerald-400">
                          Sugestão: {log.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-neutral-800 p-4">
              <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Ações rápidas</h3>
              <p className="text-sm text-neutral-300">Envie logs para o backend via API e veja aqui em tempo real.</p>
            </div>
            <div className="rounded-lg border border-neutral-800 p-4">
              <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Status</h3>
              <p className="text-sm text-neutral-300">Backend: http://localhost:4000</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
