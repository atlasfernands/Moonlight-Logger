import { useState } from 'react';

type Props = { onCreated?: () => void };

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export function NewLogModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState<LogLevel>('info');

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('http://localhost:4000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level, tags: ['manual'] }),
      });
      setOpen(false);
      setMessage('');
      onCreated?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Novo log
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-4 space-y-3">
            <h3 className="text-sm uppercase tracking-widest text-neutral-300">Criar log manual</h3>
            <label className="text-sm text-neutral-300 flex flex-col gap-1">
              <span>Nível</span>
              <select className="bg-black/30 border border-moon-border rounded px-2 py-1" value={level} onChange={(e) => setLevel(e.target.value as LogLevel)}>
                <option value="info">info</option>
                <option value="warn">warn</option>
                <option value="error">error</option>
                <option value="debug">debug</option>
              </select>
            </label>
            <label className="text-sm text-neutral-300 flex flex-col gap-1">
              <span>Mensagem</span>
              <textarea className="bg-black/30 border border-moon-border rounded px-2 py-1 min-h-24" value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" disabled={sending} onClick={() => setOpen(false)}>Cancelar</button>
              <button type="button" className="btn-primary" disabled={sending || !message.trim()} onClick={submit}>{sending ? 'Enviando...' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
