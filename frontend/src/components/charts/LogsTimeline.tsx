import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export type TimelinePoint = { time: string; info?: number; warn?: number; error?: number; debug?: number };
type Props = { data: TimelinePoint[] };

export function LogsTimeline({ data }: Props) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="time" stroke="#aaa" />
          <YAxis stroke="#aaa" allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#151515', border: '1px solid #1f1f1f' }} />
          <Legend />
          <Line type="monotone" dataKey="info" stroke="#00AEEF" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="warn" stroke="#FFC107" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="error" stroke="#EF4444" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="debug" stroke="#8A2BE2" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

