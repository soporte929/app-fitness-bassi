'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

export type AdherenceDataPoint = {
  name: string
  adherence: number
}

function getBarColor(adherence: number): string {
  if (adherence >= 80) return '#16a34a'
  if (adherence >= 60) return '#d97706'
  return '#dc2626'
}

export function AdherenceChart({ data }: { data: AdherenceDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-[var(--text-muted)]">Sin datos de adherencia</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9b9b97' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#9b9b97' }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Adherencia']}
          contentStyle={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hover)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--text-secondary)', marginBottom: 2 }}
          cursor={{ fill: 'rgba(107,127,163,0.05)' }}
        />
        <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.adherence)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
