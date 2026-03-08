'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp, Minus, Scale, Dumbbell, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// ─── Types ───────────────────────────────────────────────────────────────────

export type WeightLog = {
  weight_kg: number
  body_fat_pct: number | null
  logged_at: string
}

export type Measurement = {
  waist_cm: number | null
  hip_cm: number | null
  chest_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  measured_at: string
}

export type SessionForProgress = {
  id: string
  started_at: string
  finished_at: string | null
  completed: boolean
  set_logs: {
    weight_kg: number
    reps: number
    exercise: { id: string; name: string } | null
  }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODS = [
  { label: 'Hoy', days: 0 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '6 meses', days: 180 },
] as const

type PeriodDays = (typeof PERIODS)[number]['days']
type GroupingMode = 'day' | 'week' | 'month' | 'biweek'

const GROUPING_CONFIG: Record<PeriodDays, { mode: GroupingMode; label: string }> = {
  0: { mode: 'day', label: 'Datos por hora' },
  7: { mode: 'day', label: 'Datos por día' },
  30: { mode: 'day', label: 'Datos por día' },
  180: { mode: 'week', label: 'Datos por semana' },
}

const VOLUME_SUBTITLE: Record<GroupingMode, string> = {
  day: 'Suma (peso × reps) por entrenamiento',
  week: 'Volumen total por semana',
  month: 'Volumen total por mes',
  biweek: 'Volumen total por quincena',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cutoff(days: number, nowIso: string): Date {
  const now = new Date(nowIso)
  const start = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()
  ))
  start.setUTCDate(start.getUTCDate() - days)
  return start
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function epleyRM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

function rangeDelta(arr: number[]): number {
  if (arr.length < 2) return 0
  return Math.round((arr[arr.length - 1] - arr[0]) * 10) / 10
}

function getBucketKey(iso: string, mode: GroupingMode): string {
  const d = new Date(iso)
  if (mode === 'day') {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
  if (mode === 'week') {
    const day = d.getDay() // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day // offset to Monday
    const monday = new Date(d)
    monday.setDate(d.getDate() + diff)
    return monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
  if (mode === 'month') {
    return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  }
  // biweek: 1-15 / 16-end
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const half = d.getDate() <= 15 ? '1-15' : `16-${lastDay}`
  return `${half} ${d.toLocaleDateString('es-ES', { month: 'short' })}`
}

function groupByBucket(
  entries: { iso: string; value: number }[],
  mode: GroupingMode,
  reduce: 'mean' | 'sum' | 'max',
): { date: string; value: number }[] {
  if (mode === 'day') {
    return entries.map((e) => ({ date: fmtDate(e.iso), value: e.value }))
  }
  const buckets = new Map<string, { sortIso: string; values: number[] }>()
  for (const e of entries) {
    const key = getBucketKey(e.iso, mode)
    const existing = buckets.get(key)
    if (existing) {
      existing.values.push(e.value)
    } else {
      buckets.set(key, { sortIso: e.iso, values: [e.value] })
    }
  }
  return Array.from(buckets.entries())
    .sort(([, a], [, b]) => a.sortIso.localeCompare(b.sortIso))
    .map(([key, { values }]) => {
      let value: number
      if (reduce === 'mean') {
        value = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
      } else if (reduce === 'sum') {
        value = values.reduce((s, v) => s + v, 0)
      } else {
        value = Math.max(...values)
      }
      return { date: key, value }
    })
}

// ─── DeltaBadge ──────────────────────────────────────────────────────────────

function DeltaBadge({
  value,
  unit,
  lowerIsBetter = true,
}: {
  value: number
  unit: string
  lowerIsBetter?: boolean
}) {
  const good = lowerIsBetter ? value < 0 : value > 0
  const neutral = value === 0
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
        neutral
          ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          : good
            ? 'bg-[var(--success)]/10 text-[var(--success)]'
            : 'bg-[var(--danger)]/10 text-[var(--danger)]'
      )}
    >
      {neutral ? (
        <Minus className="w-3 h-3" />
      ) : good ? (
        <TrendingDown className="w-3 h-3" />
      ) : (
        <TrendingUp className="w-3 h-3" />
      )}
      {value > 0 ? '+' : ''}
      {value.toFixed(1)} {unit}
    </span>
  )
}

// ─── EmptyChart ───────────────────────────────────────────────────────────────

function EmptyChart({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="h-[140px] flex flex-col items-center justify-center gap-2">
      {icon}
      <p className="text-xs text-[var(--text-secondary)] text-center">{message}</p>
    </div>
  )
}

// ─── Shared Recharts config ───────────────────────────────────────────────────

const xAxis = {
  tick: { fontSize: 10, fill: 'var(--text-secondary)' },
  axisLine: false as const,
  tickLine: false as const,
  interval: 'preserveStartEnd' as const,
}

const yAxis = {
  tick: { fontSize: 10, fill: 'var(--text-secondary)' },
  axisLine: false as const,
  tickLine: false as const,
  width: 38,
  domain: ['auto', 'auto'] as ['auto', 'auto'],
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-hover)',
    borderRadius: 12,
    color: 'var(--text-primary)'
  },
  labelStyle: { color: 'var(--text-secondary)', fontSize: 11 },
  itemStyle: { color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 },
}

const chartMargin = { top: 4, right: 4, left: -14, bottom: 0 }

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  weightLogs: WeightLog[]
  measurements: Measurement[]
  sessions: SessionForProgress[]
  targetWeightKg: number | null
  nowIso: string
}

export function ProgressCharts({ weightLogs, measurements, sessions, targetWeightKg, nowIso }: Props) {
  console.log('RAW SESSIONS:', JSON.stringify(sessions?.slice(0,2).map((s: any) => ({
    id: s.id,
    set_logs_count: s.set_logs?.length,
    first_3_sets: s.set_logs?.slice(0,3).map((l: any) => ({
      weight_kg: l.weight_kg,
      weight_type: typeof l.weight_kg,
      reps: l.reps,
      reps_type: typeof l.reps,
      completed: l.completed
    }))
  })), null, 2))
  const [period, setPeriod] = useState<PeriodDays>(7)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')

  const since = useMemo(() => cutoff(period, nowIso), [period, nowIso])
  const { mode: groupingMode } = GROUPING_CONFIG[period]

  // Chart 1 — Weight (mean per bucket)
  const weightData = useMemo(() => {
    const entries = weightLogs
      .filter((w) => new Date(w.logged_at) >= since)
      .map((w) => ({ iso: w.logged_at, value: w.weight_kg }))
    return groupByBucket(entries, groupingMode, 'mean')
  }, [weightLogs, since, groupingMode])

  // Chart 3 — Body fat (mean per bucket)
  const bodyFatData = useMemo(() => {
    const entries = weightLogs
      .filter((w) => new Date(w.logged_at) >= since && w.body_fat_pct !== null)
      .map((w) => ({ iso: w.logged_at, value: w.body_fat_pct as number }))
    return groupByBucket(entries, groupingMode, 'mean')
  }, [weightLogs, since, groupingMode])

  // Chart 2 — Volume (sum per bucket)
  const volumeData = useMemo(() => {
    const entries = sessions
      .filter((s) => new Date(s.finished_at ?? s.started_at) >= since)
      .map((s) => ({
        iso: s.finished_at ?? s.started_at,
        value: ((s.set_logs ?? []) as any[])
          .filter((l) => Number(l.weight_kg) > 0 && Number(l.reps) > 0)
          .reduce((sum: number, l) => sum + Number(l.weight_kg) * Number(l.reps), 0),
      }))
    const grouped = groupByBucket(entries, groupingMode, 'sum')
    const result = grouped.map((d) => ({ date: d.date, volume: d.value }))
    return result
  }, [sessions, since, groupingMode])

  // Chart 4 — RM per exercise (max per bucket)
  const exerciseList = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of sessions) {
      for (const l of (s.set_logs ?? [])) {
        if (l.exercise && !map.has(l.exercise.id)) {
          map.set(l.exercise.id, l.exercise.name)
        }
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [sessions])

  const activeExerciseId = selectedExerciseId || exerciseList[0]?.id || ''

  const rmData = useMemo(() => {
    if (!activeExerciseId) return []
    const perSession: { iso: string; value: number }[] = []
    for (const s of sessions) {
      if (new Date(s.finished_at ?? s.started_at) < since) continue
      let maxRm = 0
      for (const l of (s.set_logs ?? [])) {
        if (l.exercise?.id !== activeExerciseId) continue
        const rm = epleyRM(parseFloat(String(l.weight_kg)), l.reps)
        if (rm > maxRm) maxRm = rm
      }
      if (maxRm > 0) perSession.push({ iso: s.finished_at ?? s.started_at, value: maxRm })
    }
    const grouped = groupByBucket(perSession, groupingMode, 'max')
    return grouped.map((d) => ({ date: d.date, rm: d.value }))
  }, [sessions, activeExerciseId, since, groupingMode])

  // Summary stats
  const latestWeight = weightLogs.at(-1)?.weight_kg ?? null
  const latestBf = [...weightLogs].reverse().find((w) => w.body_fat_pct !== null)?.body_fat_pct ?? null
  const latestWaist = measurements.at(-1)?.waist_cm ?? null
  const sessionCount = sessions.filter((s) => new Date(s.finished_at ?? s.started_at) >= since).length

  const wDelta = rangeDelta(weightData.map((d) => d.value))
  const bfDelta = rangeDelta(bodyFatData.map((d) => d.value))
  const waistDelta = rangeDelta(
    measurements
      .filter((m) => new Date(m.measured_at) >= since && m.waist_cm !== null)
      .map((m) => m.waist_cm as number)
  )

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="space-y-1.5">
        <div className="flex bg-[var(--bg-elevated)] rounded-lg p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              className={cn(
                'flex-1 py-1.5 rounded-md text-xs font-medium transition-all',
                period === p.days
                  ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]'
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Peso actual', value: latestWeight, unit: 'kg', delta: wDelta, lower: true },
          { label: '% Grasa', value: latestBf, unit: '%', delta: bfDelta, lower: true },
          { label: 'Cintura', value: latestWaist, unit: 'cm', delta: waistDelta, lower: true },
          { label: 'Sesiones', value: sessionCount, unit: '', delta: 0, lower: false },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Card>
              <CardContent className="py-4 px-4">
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                    {stat.value ?? '—'}
                  </span>
                  {stat.unit && <span className="text-sm text-[var(--text-secondary)]">{stat.unit}</span>}
                </div>
                {stat.delta !== 0 && (
                  <DeltaBadge value={stat.delta} unit={stat.unit} lowerIsBetter={stat.lower} />
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Chart 1 — Peso corporal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Peso corporal</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Evolución en kg</p>
            </div>
            {wDelta !== 0 && <DeltaBadge value={wDelta} unit="kg" lowerIsBetter />}
          </div>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          {weightData.length < 2 ? (
            <EmptyChart
              icon={<Scale className="w-8 h-8 text-[var(--text-muted)]" />}
              message="Registra al menos 2 pesos para ver la gráfica"
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weightData} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" {...xAxis} />
                  <YAxis {...yAxis} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number | undefined) => [`${value ?? 0} kg`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {targetWeightKg && (
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                  Objetivo: {targetWeightKg} kg
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Chart 2 — Volumen de entrenamiento */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Volumen de entrenamiento</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{VOLUME_SUBTITLE[groupingMode]}</p>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          {volumeData.length === 0 ? (
            <EmptyChart
              icon={<Dumbbell className="w-8 h-8 text-[var(--text-muted)]" />}
              message="Sin sesiones completadas en este período"
            />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={volumeData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" {...xAxis} />
                <YAxis {...yAxis} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number | undefined) => [
                    `${(value ?? 0).toLocaleString('es-ES')} kg`,
                    '',
                  ]}
                />
                <Bar dataKey="volume" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart 3 — % Grasa corporal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">% Grasa corporal</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Registrado con cada peso</p>
            </div>
            {bfDelta !== 0 && <DeltaBadge value={bfDelta} unit="%" lowerIsBetter />}
          </div>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          {bodyFatData.length < 2 ? (
            <EmptyChart
              icon={<Activity className="w-8 h-8 text-[var(--text-muted)]" />}
              message="Sin datos suficientes — añade % grasa al registrar tu peso"
            />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={bodyFatData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" {...xAxis} />
                <YAxis {...yAxis} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number | undefined) => [`${value ?? 0}%`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--warning)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--warning)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart 4 — RM estimado */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">RM estimado</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Epley: peso × (1 + reps/30)</p>
            </div>
            {exerciseList.length > 0 && (
              <select
                value={activeExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 max-w-[150px]"
              >
                {exerciseList.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3 pb-4 px-4">
          {exerciseList.length === 0 || rmData.length < 2 ? (
            <EmptyChart
              icon={<TrendingUp className="w-8 h-8 text-[var(--text-muted)]" />}
              message="Necesitas al menos 2 sesiones con el mismo ejercicio"
            />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={rmData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" {...xAxis} />
                <YAxis {...yAxis} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number | undefined) => [`${value ?? 0} kg`, 'RM est.']}
                />
                <Line
                  type="monotone"
                  dataKey="rm"
                  stroke="var(--danger)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--danger)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
