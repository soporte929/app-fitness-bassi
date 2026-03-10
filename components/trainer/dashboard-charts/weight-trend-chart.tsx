'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type WeightTrendPoint = {
  date: string
  [clientName: string]: number | string
}

const LINE_COLORS = ['#6b7fa3', '#8b9bb5', '#4a5e7a']

type Props = {
  data: WeightTrendPoint[]
  clientNames: string[]
}

export function WeightTrendChart({ data, clientNames }: Props) {
  if (data.length === 0 || clientNames.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] lg:h-[260px]">
        <p className="text-sm text-[var(--text-muted)]">Sin registros de peso</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a0a0a0' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#9b9b97' }} tickFormatter={(v: number) => `${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hover)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
            formatter={(value: number | undefined, name: string | undefined) => [`${value ?? '—'} kg`, name ?? '']}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }}
            formatter={(value: string) => value}
          />
          {clientNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
