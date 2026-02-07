import type { ReactNode } from 'react';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogItem = {
  _id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  tags?: string[];
  suggestion?: string;
  source?: string;
  ai?: { classification?: string; explanation?: string; suggestion?: string; provider?: string };
};

type Props = {
  items: LogItem[];
  activeLevel?: LogLevel;
  onFilterLevel?: (level?: LogLevel) => void;
};

const levelClass: Record<LogLevel, string> = {
  info: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  warn: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  error: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  debug: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
};

function levelChip(level: LogLevel, activeLevel?: LogLevel, onFilterLevel?: (level?: LogLevel) => void): ReactNode {
  const active = activeLevel === level;
  return (
    <button
      type="button"
      onClick={() => onFilterLevel?.(active ? undefined : level)}
      className={`text-xs px-2 py-0.5 rounded border transition ${levelClass[level]} ${active ? 'ring-1 ring-white/50' : 'opacity-80 hover:opacity-100'}`}
      aria-label={`Filtrar nível ${level}`}
    >
      {level}
    </button>
  );
}

export function RecentLogsTable({ items, activeLevel, onFilterLevel }: Props) {
  if (!items.length) {
    return <div className="p-4 text-sm text-neutral-400">Sem logs recentes para os filtros selecionados.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-400 border-b border-moon-border/60">
            <th className="py-2 pr-3">Nível</th>
            <th className="py-2 pr-3">Mensagem</th>
            <th className="py-2 pr-3">IA</th>
            <th className="py-2 pr-3">Data</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b border-moon-border/30 align-top">
              <td className="py-2 pr-3">{levelChip(item.level, activeLevel, onFilterLevel)}</td>
              <td className="py-2 pr-3">
                <div className="text-neutral-200">{item.message}</div>
                {!!item.tags?.length && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={`${item._id}-${tag}`} className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-moon-border text-neutral-300">#{tag}</span>
                    ))}
                  </div>
                )}
              </td>
              <td className="py-2 pr-3 text-neutral-300">
                <div>{item.ai?.classification ?? '—'}</div>
                <div className="text-xs text-neutral-500">{item.ai?.provider ?? 'heurística'}</div>
              </td>
              <td className="py-2 pr-3 text-neutral-400 whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
