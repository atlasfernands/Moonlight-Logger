import { useState } from 'react';

type Props = {
  onApply: (filters: { level?: string; tag?: string; q?: string; from?: string; to?: string }) => void;
};

export function Filters({ onApply }: Props) {
  const [level, setLevel] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  return (
    <form
      className="glass-card p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({ level: level || undefined, tag: tag || undefined, q: q || undefined, from: from || undefined, to: to || undefined });
      }}
      aria-label="Filtros de logs"
    >
      <label className="text-sm text-neutral-300 flex flex-col">
        <span>Nível</span>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-black/30 border border-moon-border rounded px-2 py-1">
          <option value="">Todos</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
          <option value="debug">debug</option>
        </select>
      </label>
      <label className="text-sm text-neutral-300 flex flex-col">
        <span>Tag</span>
        <input value={tag} onChange={(e) => setTag(e.target.value)} className="bg-black/30 border border-moon-border rounded px-2 py-1" placeholder="#tag" />
      </label>
      <label className="text-sm text-neutral-300 flex flex-col md:col-span-2">
        <span>Busca</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} className="bg-black/30 border border-moon-border rounded px-2 py-1" placeholder="texto..." />
      </label>
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <label className="text-sm text-neutral-300 flex flex-col">
          <span>De</span>
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-black/30 border border-moon-border rounded px-2 py-1" />
        </label>
        <label className="text-sm text-neutral-300 flex flex-col">
          <span>Até</span>
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="bg-black/30 border border-moon-border rounded px-2 py-1" />
        </label>
      </div>
      <div className="md:col-span-1 flex items-end">
        <button className="btn-primary w-full" type="submit">Aplicar</button>
      </div>
    </form>
  );
}

