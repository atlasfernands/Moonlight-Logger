type Props = {
  label: string;
  value: string | number;
  highlight?: 'primary' | 'secondary';
};

export function StatCard({ label, value, highlight = 'primary' }: Props) {
  const color = highlight === 'primary' ? 'text-moon-primary' : 'text-moon-secondary';
  return (
    <div className="glass-card p-4">
      <div className="text-neutral-300 text-sm">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}


