type Props = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);
  return (
    <nav className="flex items-center gap-2" aria-label="Paginação">
      <button
        className="btn-secondary"
        onClick={() => onChange(prev)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        ◀
      </button>
      <span className="text-sm text-neutral-400">Página {page} de {pages}</span>
      <button
        className="btn-secondary"
        onClick={() => onChange(next)}
        disabled={page === pages}
        aria-label="Próxima página"
      >
        ▶
      </button>
    </nav>
  );
}

