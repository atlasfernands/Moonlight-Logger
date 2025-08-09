import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

type Props = { data: Array<{ level: string; count: number }> };

export function LogsByLevel({ data }: Props) {
  const palette: Record<string, string> = {
    info: '#00AEEF',
    warn: '#FFC107',
    error: '#EF4444',
    debug: '#8A2BE2',
  };
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="level" stroke="#aaa" />
          <YAxis stroke="#aaa" allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#151515', border: '1px solid #1f1f1f' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d, idx) => (
              <Cell key={`cell-${idx}`} fill={palette[d.level] ?? '#00AEEF'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

