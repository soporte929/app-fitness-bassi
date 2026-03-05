'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type PhaseDataPoint = {
  phase: string
  count: number
  label: string
}

const PHASE_COLORS: Record<string, string> = {
  deficit: '#dc2626',
  maintenance: '#d97706',
  surplus: '#16a34a',
}

type Props = {
  data: PhaseDataPoint[]
  total: number
}

export function PhaseDistributionChart({ data, total }: Props) {
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-[var(--text-muted)]">Sin clientes</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="count"
          nameKey="label"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={PHASE_COLORS[entry.phase] ?? '#5a5a56'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [
            `${value ?? 0} clientes (${Math.round(((value ?? 0) / total) * 100)}%)`,
            name ?? '',
          ]}
          contentStyle={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hover)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          formatter={(value: string) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
