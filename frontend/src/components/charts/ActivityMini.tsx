import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

type Props = { data: Array<{ t: string; v: number }>; actions?: React.ReactNode };

export function ActivityMini({ data, actions }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-neutral-300 text-sm">Activity</div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="w-full h-[120px]">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#00AEEF" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ background: '#151515', border: '1px solid #1f1f1f' }} />
            <Area type="monotone" dataKey="v" stroke="#8A2BE2" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


