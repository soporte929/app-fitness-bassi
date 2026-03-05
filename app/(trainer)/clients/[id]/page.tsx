import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { MiniChart } from '@/components/ui/mini-chart'
import { AlertBanner } from '@/components/ui/alert-banner'
import { PageTransition } from '@/components/ui/page-transition'
import { calculateNutrition } from '@/lib/calculations/nutrition'
import { computeAlerts } from '@/lib/alerts'
import { EditClientPanel } from './edit-panel'
import { ArrowLeft, Flame, ChevronRight } from 'lucide-react'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Client + profile — security: only own clients via trainer_id
  const { data: rawClient } = await supabase
    .from('clients')
    .select(
      `id, phase, goal, weight_kg, body_fat_pct, activity_level, daily_steps, joined_date, notes,
      profile:profiles!clients_profile_id_fkey (full_name, email)`
    )
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!rawClient) notFound()

  // Parallel data fetches
  const [weightLogsRes, measurementsRes, sessionsRes, activePlanRes] = await Promise.all([
    supabase
      .from('weight_logs')
      .select('weight_kg, logged_at')
      .eq('client_id', id)
      .order('logged_at', { ascending: true })
      .limit(12),
    supabase
      .from('measurements')
      .select('waist_cm, measured_at')
      .eq('client_id', id)
      .order('measured_at', { ascending: true })
      .limit(12),
    supabase
      .from('workout_sessions')
      .select(
        'id, started_at, completed, workout_day:workout_days!workout_sessions_day_id_fkey (name)'
      )
      .eq('client_id', id)
      .order('started_at', { ascending: false })
      .limit(20),
    supabase
      .from('workout_plans')
      .select('id, name, days_per_week, active')
      .eq('client_id', id)
      .eq('active', true)
      .maybeSingle(),
  ])

  const weightLogs = weightLogsRes.data ?? []
  const measurements = measurementsRes.data ?? []
  const sessions = sessionsRes.data ?? []
  const activePlan = activePlanRes.data

  const now = new Date()

  // Adherence
  const completedSessions = sessions.filter((s) => s.completed)
  const adherencePct =
    sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0

  // Days since last workout
  const lastSession = sessions[0]
  const daysSinceLastWorkout = lastSession
    ? Math.floor(
      (now.getTime() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    : 999

  // Weight delta (first vs last log)
  const weightDeltaKg =
    weightLogs.length >= 2
      ? weightLogs[weightLogs.length - 1].weight_kg - weightLogs[0].weight_kg
      : 0

  // Waist delta
  const waistLogs = measurements.filter((m) => m.waist_cm != null)
  const waistDeltaCm =
    waistLogs.length >= 2
      ? (waistLogs[waistLogs.length - 1].waist_cm ?? 0) - (waistLogs[0].waist_cm ?? 0)
      : 0

  // This week sessions
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const weeklyWorkoutsCompleted = sessions.filter(
    (s) => s.completed && new Date(s.started_at) >= startOfWeek
  ).length

  // Status badge
  let status: 'green' | 'yellow' | 'red' = 'green'
  if (adherencePct < 50 || daysSinceLastWorkout >= 7) status = 'red'
  else if (adherencePct < 70 || daysSinceLastWorkout >= 4) status = 'yellow'

  const alerts = computeAlerts({
    adherencePct,
    daysSinceLastWorkout,
    weightDeltaKg,
    waistDeltaCm,
    phase: rawClient.phase,
    weeklyWorkoutsCompleted,
    weeklyWorkoutsTarget: activePlan?.days_per_week ?? 3,
  })

  const nutrition = calculateNutrition({
    weightKg: rawClient.weight_kg,
    bodyFatPct: rawClient.body_fat_pct ?? 20,
    activityLevel: rawClient.activity_level,
    dailySteps: rawClient.daily_steps,
    goal: rawClient.goal,
  })

  const profile = rawClient.profile as { full_name: string; email: string } | null
  const clientName = profile?.full_name ?? 'Cliente'

  const phaseLabel =
    { deficit: 'Déficit', maintenance: 'Mantenimiento', surplus: 'Superávit' }[rawClient.phase] ??
    rawClient.phase

  const joinedLabel = new Date(rawClient.joined_date).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  // Chart data
  const weightHistory = weightLogs.map((w) => ({
    date: new Date(w.logged_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    value: w.weight_kg,
  }))

  const waistHistory = waistLogs.map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    value: m.waist_cm!,
  }))

  const recentWorkouts = sessions.slice(0, 6).map((s) => {
    const day = s.workout_day as { name: string } | null
    return {
      date: new Date(s.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      dayName: day?.name ?? 'Día',
      completed: s.completed,
    }
  })

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-overlay)] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--accent)] font-bold">{clientName[0]}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  {clientName}
                </h1>
                <StatusBadge
                  status={status}
                  label={
                    status === 'green' ? 'Correcto' : status === 'yellow' ? 'Revisar' : 'Intervención'
                  }
                />
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                {phaseLabel} · Desde {joinedLabel}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm">
              Editar plan
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 ? (
          <div className="space-y-2 mb-5">
            {alerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[var(--success)]/8 border border-[var(--success)]/20 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-[var(--success)] font-medium">
              Todo en orden — el cliente progresa bien
            </span>
          </div>
        )}

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Columna principal */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Peso actual"
                value={rawClient.weight_kg}
                unit="kg"
                trend={weightDeltaKg <= 0 ? 'down' : 'up'}
                trendValue={`${weightDeltaKg > 0 ? '+' : ''}${weightDeltaKg.toFixed(1)} kg`}
              />
              <StatCard
                label="% Grasa"
                value={rawClient.body_fat_pct ?? '—'}
                unit={rawClient.body_fat_pct != null ? '%' : ''}
                sub="estimado"
              />
              <StatCard label="Masa libre grasa" value={nutrition.ffm} unit="kg" sub="FFM" />
              <StatCard
                label="Adherencia"
                value={`${adherencePct}%`}
                trend="up"
                trendValue="últimas 4 sem."
              />
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Peso</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Historial</p>
                    </div>
                    {weightHistory.length >= 2 && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${weightDeltaKg <= 0
                            ? 'text-[var(--success)] bg-[var(--success)]/10'
                            : 'text-[var(--danger)] bg-[var(--danger)]/10'
                          }`}
                      >
                        {weightDeltaKg > 0 ? '+' : ''}
                        {weightDeltaKg.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  {weightHistory.length >= 2 ? (
                    <MiniChart data={weightHistory} color="var(--accent)" unit=" kg" />
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin registros de peso</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Cintura</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Historial</p>
                    </div>
                    {waistHistory.length >= 2 && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${waistDeltaCm <= 0
                            ? 'text-[var(--success)] bg-[var(--success)]/10'
                            : 'text-[var(--danger)] bg-[var(--danger)]/10'
                          }`}
                      >
                        {waistDeltaCm > 0 ? '+' : ''}
                        {waistDeltaCm.toFixed(1)} cm
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  {waistHistory.length >= 2 ? (
                    <MiniChart data={waistHistory} color="var(--warning)" unit=" cm" />
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin registros de cintura</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Últimos entrenamientos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Últimos entrenamientos</p>
                  <Button variant="ghost" size="sm">
                    Ver historial <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentWorkouts.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-6">
                    Sin entrenamientos registrados
                  </p>
                ) : (
                  recentWorkouts.map((w, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-5 py-3.5 ${i < recentWorkouts.length - 1 ? 'border-b border-[var(--border)]' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${w.completed ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'
                            }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{w.dayName}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {w.completed ? 'Completado' : 'No terminado'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{w.date}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Edit panel */}
            <EditClientPanel
              clientId={rawClient.id}
              clientName={clientName}
              initial={{
                weight_kg: rawClient.weight_kg,
                body_fat_pct: rawClient.body_fat_pct,
                phase: rawClient.phase,
                goal: rawClient.goal,
                activity_level: rawClient.activity_level,
                daily_steps: rawClient.daily_steps,
                notes: rawClient.notes,
              }}
            />
          </div>

          {/* Columna lateral — nutrición */}
          <div className="xl:w-72 space-y-4 flex-shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--warning)]" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Plan nutricional</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-1">
                  <p className="text-4xl font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-geist-mono)]">
                    {nutrition.targetCalories}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">kcal objetivo</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      label: 'Proteína',
                      g: nutrition.macros.protein.g,
                      pct: nutrition.macros.protein.pct,
                      color: 'var(--accent)',
                    },
                    {
                      label: 'Carbohidratos',
                      g: nutrition.macros.carbs.g,
                      pct: nutrition.macros.carbs.pct,
                      color: 'var(--success)',
                    },
                    {
                      label: 'Grasa',
                      g: nutrition.macros.fat.g,
                      pct: nutrition.macros.fat.pct,
                      color: 'var(--warning)',
                    },
                  ].map((macro) => (
                    <div key={macro.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[var(--text-secondary)]">{macro.label}</span>
                        <span className="text-xs font-medium text-[var(--text-primary)]">{macro.g}g</span>
                      </div>
                      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${macro.pct}%`, backgroundColor: macro.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] pt-3 space-y-1.5">
                  {[
                    { label: 'TMB (Cunningham)', value: `${nutrition.tmb_cunningham} kcal` },
                    { label: 'TMB (Tinsley)', value: `${nutrition.tmb_tinsley} kcal` },
                    { label: 'GET total', value: `${nutrition.get} kcal` },
                    { label: 'Bonus pasos', value: `+${nutrition.stepsBonus} kcal`, green: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">{row.label}</span>
                      <span
                        className={`text-xs font-medium ${row.green ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'
                          }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan activo */}
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Plan activo</p>
                {activePlan ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {activePlan.name}
                      </span>
                      <span className="text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                        {activePlan.days_per_week} días/sem
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {weeklyWorkoutsCompleted}/{activePlan.days_per_week} entrenamientos esta semana
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Sin plan activo</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
