import { useEffect, useState } from 'react';

type Props = {
  onApply: (filters: { level?: string; tag?: string; q?: string; from?: string; to?: string; hasSource?: boolean }) => void;
  values?: { level?: string; tag?: string; q?: string; from?: string; to?: string; hasSource?: boolean };
  onClear?: () => void;
};

export function Filters({ onApply, values, onClear }: Props) {
  const [level, setLevel] = useState<string>(values?.level ?? '');
  const [tag, setTag] = useState<string>(values?.tag ?? '');
  const [q, setQ] = useState<string>(values?.q ?? '');
  const [from, setFrom] = useState<string>(values?.from ?? '');
  const [to, setTo] = useState<string>(values?.to ?? '');
  const [hasSource, setHasSource] = useState<boolean>(Boolean(values?.hasSource));

  // Sincroniza com valores externos (ex.: clique nos chips de nível)
  useEffect(() => {
    if (!values) return;
    setLevel(values.level ?? '');
    setTag(values.tag ?? '');
    setQ(values.q ?? '');
    setFrom(values.from ?? '');
    setTo(values.to ?? '');
    setHasSource(Boolean(values.hasSource));
  }, [values?.level, values?.tag, values?.q, values?.from, values?.to]);

  return (
    <form
      className="glass-card p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({ level: level || undefined, tag: tag || undefined, q: q || undefined, from: from || undefined, to: to || undefined, hasSource: hasSource || undefined });
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
      <label className="text-sm text-neutral-300 flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          checked={hasSource}
          onChange={(e) => setHasSource(e.target.checked)}
          className="h-4 w-4 accent-moon-primary"
        />
        <span>Somente com origem de arquivo</span>
      </label>
      <div className="md:col-span-1 flex items-end gap-2">
        {onClear && (
          <button
            type="button"
            className="btn-secondary w-24"
            onClick={() => {
              setLevel(''); setTag(''); setQ(''); setFrom(''); setTo(''); setHasSource(false); onClear?.();
            }}
          >
            Limpar
          </button>
        )}
        <button className="btn-primary w-full" type="submit">Aplicar</button>
      </div>
    </form>
  );
}

