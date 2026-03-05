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
  finished_at: string
  set_logs: {
    weight_kg: number
    reps: number
    exercise: { id: string; name: string } | null
  }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODS = [
  { label: '30 días', days: 30 },
  { label: '60 días', days: 60 },
  { label: '90 días', days: 90 },
  { label: '180 días', days: 180 },
] as const

type PeriodDays = (typeof PERIODS)[number]['days']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cutoff(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
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
}

export function ProgressCharts({ weightLogs, measurements, sessions, targetWeightKg }: Props) {
  const [period, setPeriod] = useState<PeriodDays>(90)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')

  const since = useMemo(() => cutoff(period), [period])

  // Chart 1 — Weight
  const weightData = useMemo(
    () =>
      weightLogs
        .filter((w) => new Date(w.logged_at) >= since)
        .map((w) => ({ date: fmtDate(w.logged_at), value: w.weight_kg })),
    [weightLogs, since]
  )

  // Chart 3 — Body fat (from weight_logs.body_fat_pct)
  const bodyFatData = useMemo(
    () =>
      weightLogs
        .filter((w) => new Date(w.logged_at) >= since && w.body_fat_pct !== null)
        .map((w) => ({ date: fmtDate(w.logged_at), value: w.body_fat_pct as number })),
    [weightLogs, since]
  )

  // Chart 2 — Volume per session
  const volumeData = useMemo(
    () =>
      sessions
        .filter((s) => new Date(s.finished_at) >= since)
        .map((s) => ({
          date: fmtDate(s.finished_at),
          volume: s.set_logs.reduce((sum, l) => sum + l.weight_kg * l.reps, 0),
        })),
    [sessions, since]
  )

  // Chart 4 — RM per exercise
  const exerciseList = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of sessions) {
      for (const l of s.set_logs) {
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
    const byDate = new Map<string, number>()
    for (const s of sessions) {
      if (new Date(s.finished_at) < since) continue
      const key = fmtDate(s.finished_at)
      for (const l of s.set_logs) {
        if (l.exercise?.id !== activeExerciseId) continue
        const rm = epleyRM(l.weight_kg, l.reps)
        if (rm > (byDate.get(key) ?? 0)) byDate.set(key, rm)
      }
    }
    return Array.from(byDate.entries()).map(([date, rm]) => ({ date, rm }))
  }, [sessions, activeExerciseId, since])

  // Summary stats
  const latestWeight = weightLogs.at(-1)?.weight_kg ?? null
  const latestBf = [...weightLogs].reverse().find((w) => w.body_fat_pct !== null)?.body_fat_pct ?? null
  const latestWaist = measurements.at(-1)?.waist_cm ?? null
  const sessionCount = sessions.filter((s) => new Date(s.finished_at) >= since).length

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
      <div className="flex bg-[var(--bg-elevated)] rounded-lg p-0.5 gap-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-medium transition-all',
              period === p.days ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-secondary)]'
            )}
          >
            {p.label}
          </button>
        ))}
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

      {/* Chart 2 — Volumen por sesión */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Volumen por sesión</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Suma (peso × reps) por entrenamiento</p>
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
