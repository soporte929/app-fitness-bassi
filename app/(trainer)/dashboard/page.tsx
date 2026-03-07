import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertBanner } from '@/components/ui/alert-banner'
import { PageTransition } from '@/components/ui/page-transition'
import { computeAlerts, type ClientAlertInput } from '@/lib/alerts'
import { AdherenceChart } from '@/components/trainer/dashboard-charts/adherence-chart'
import { WeightTrendChart, type WeightTrendPoint } from '@/components/trainer/dashboard-charts/weight-trend-chart'
import { PhaseDistributionChart } from '@/components/trainer/dashboard-charts/phase-distribution-chart'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Video,
  ArrowRight,
} from 'lucide-react'

function getClientAlert(alertInput: ClientAlertInput): string | null {
  const alerts = computeAlerts(alertInput)
  return alerts.length > 0 ? alerts[0].message : null
}

export default async function TrainerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // 1. Clients activos del trainer
  const { data: rawClients } = await supabase
    .from('clients')
    .select(
      `id, phase, weight_kg,
      profile:profiles!clients_profile_id_fkey (full_name)`
    )
    .eq('trainer_id', user.id)
    .eq('active', true)

  const allClients = rawClients ?? []
  const clientIds = allClients.map((c) => c.id)

  // 2. Sessions últimos 30 días
  const { data: sessions } =
    clientIds.length > 0
      ? await supabase
        .from('workout_sessions')
        .select('client_id, started_at, completed')
        .in('client_id', clientIds)
        .gte('started_at', thirtyDaysAgo.toISOString())
      : { data: [] as { client_id: string; started_at: string; completed: boolean }[] }

  // 3. Weight logs últimos 30 días
  const { data: weightLogs } =
    clientIds.length > 0
      ? await supabase
        .from('weight_logs')
        .select('client_id, weight_kg, logged_at')
        .in('client_id', clientIds)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: true })
      : { data: [] as { client_id: string; weight_kg: number; logged_at: string }[] }

  const allSessions = sessions ?? []
  const allWeightLogs = weightLogs ?? []
  const now = new Date()

  // Compute per-client stats
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const clientStats = allClients.map((c) => {
    const profile = c.profile as { full_name: string } | null
    const name = profile?.full_name ?? 'Sin nombre'

    const clientSessions = allSessions.filter((s) => s.client_id === c.id)
    const sorted = [...clientSessions].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    )
    const lastSession = sorted[0]
    const daysSinceLast = lastSession
      ? Math.floor(
        (now.getTime() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      : 999

    const completed = clientSessions.filter((s) => s.completed).length
    const adherence =
      clientSessions.length > 0 ? Math.round((completed / clientSessions.length) * 100) : 0

    const weeklyCompleted = clientSessions.filter(
      (s) => s.completed && new Date(s.started_at) >= startOfWeek
    ).length

    let status: 'green' | 'yellow' | 'red' = 'green'
    if (adherence < 50 || daysSinceLast >= 7) status = 'red'
    else if (adherence < 70 || daysSinceLast >= 4) status = 'yellow'

    let lastWorkout = 'Sin registros'
    if (lastSession) {
      if (daysSinceLast === 0) lastWorkout = 'Hoy'
      else if (daysSinceLast === 1) lastWorkout = 'Ayer'
      else lastWorkout = `Hace ${daysSinceLast} días`
    }

    const alertInput: ClientAlertInput = {
      adherencePct: adherence,
      daysSinceLastWorkout: daysSinceLast,
      weightDeltaKg: 0,
      waistDeltaCm: 0,
      phase: c.phase === 'deficit' ? 'deficit' : c.phase === 'surplus' ? 'surplus' : 'maintenance',
      weeklyWorkoutsCompleted: weeklyCompleted,
      weeklyWorkoutsTarget: 3,
    }

    return {
      id: c.id,
      name,
      phase: c.phase,
      phaseLabel:
        ({
          deficit: 'Déficit calórico',
          maintenance: 'Mantenimiento',
          surplus: 'Volumen',
        } as Record<string, string>)[c.phase] ??
        c.phase,
      status,
      adherence,
      lastWorkout,
      alertInput,
    }
  })

  // Stats summary
  const allAlerts = clientStats.flatMap((c) => computeAlerts(c.alertInput).map((a) => ({ ...a, clientId: c.id, clientName: c.name })))
  const criticalCount = allAlerts.filter((a) => a.level === 'critical').length
  const goodCount = clientStats.filter((c) => c.status === 'green').length

  const stats = [
    { label: 'Clientes activos', value: String(allClients.length), icon: Users, color: 'var(--accent)' },
    { label: 'Alertas activas', value: String(criticalCount), icon: AlertTriangle, color: 'var(--danger)' },
    { label: 'Auditorías pendientes', value: '—', icon: Video, color: 'var(--warning)' },
    { label: 'Progresando bien', value: String(goodCount), icon: TrendingUp, color: 'var(--success)' },
  ]

  // Adherence chart data (top 8 sorted by adherence DESC)
  const adherenceData = [...clientStats]
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 8)
    .map((c) => ({ name: c.name.split(' ')[0], adherence: c.adherence }))

  // Phase distribution
  const phaseCounts = { deficit: 0, maintenance: 0, surplus: 0 }
  for (const c of allClients) {
    if (c.phase in phaseCounts) phaseCounts[c.phase as keyof typeof phaseCounts]++
  }
  const phaseData = [
    { phase: 'deficit', count: phaseCounts.deficit, label: 'Déficit' },
    { phase: 'maintenance', count: phaseCounts.maintenance, label: 'Mantenimiento' },
    { phase: 'surplus', count: phaseCounts.surplus, label: 'Volumen' },
  ].filter((d) => d.count > 0)

  // Weight trend chart — top 3 clients by absolute weight change, last 30 days
  const clientWeightDelta = clientIds
    .map((id) => {
      const logs = allWeightLogs.filter((w) => w.client_id === id).sort(
        (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
      )
      if (logs.length < 2) return null
      const delta = Math.abs(logs[logs.length - 1].weight_kg - logs[0].weight_kg)
      const name = clientStats.find((c) => c.id === id)?.name ?? id
      return { id, name, delta, logs }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)

  // Build date-keyed weight trend data
  const weightTrendClientNames = clientWeightDelta.map((c) => c.name.split(' ')[0])
  const weightTrendData: WeightTrendPoint[] = []

  if (clientWeightDelta.length > 0) {
    const allDates = new Set<string>()
    for (const c of clientWeightDelta) {
      for (const log of c.logs) {
        const d = new Date(log.logged_at).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        })
        allDates.add(d)
      }
    }
    const sortedDates = [...allDates]

    for (const date of sortedDates) {
      const point: WeightTrendPoint = { date }
      for (const c of clientWeightDelta) {
        const shortName = c.name.split(' ')[0]
        const match = c.logs.find(
          (log) =>
            new Date(log.logged_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            }) === date
        )
        if (match) point[shortName] = match.weight_kg
      }
      weightTrendData.push(point)
    }
  }

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">{todayLabel}</p>
          </div>
          <Link href="/clients">
            <Button size="md">Ver clientes</Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 stagger">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="card-hover animate-fade-in">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[var(--text-secondary)] text-xs font-medium mb-1 truncate">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)]">{stat.value}</p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Adherencia por cliente</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Top 8 últimos 30 días</p>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <AdherenceChart data={adherenceData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Progreso de peso</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Últimos 30 días</p>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <WeightTrendChart data={weightTrendData} clientNames={weightTrendClientNames} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Distribución por fase</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{allClients.length} clientes activos</p>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <PhaseDistributionChart data={phaseData} total={allClients.length} />
            </CardContent>
          </Card>
        </div>

        {/* Alertas activas */}
        {allAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Alertas activas</h2>
            {allAlerts.map((alert) => (
              <Link key={`${alert.clientId}-${alert.id}`} href={`/clients/${alert.clientId}`}>
                <AlertBanner
                  alert={{ ...alert, message: `${alert.clientName} — ${alert.message}` }}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Clients table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Clientes</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Estado en tiempo real</p>
              </div>
              <Link href="/clients">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto md:overflow-visible">
            {clientStats.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">Sin clientes activos</p>
            ) : (
              <>
                <table className="hidden md:table w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Cliente', 'Fase', 'Estado', 'Último entreno', 'Adherencia', 'Alerta', ''].map(
                        (col) => (
                          <th
                            key={col}
                            className="text-left px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {clientStats.map((client, i) => (
                      <tr
                        key={client.id}
                        className={`hover:bg-[var(--bg-elevated)] animate-fade-in ${i < clientStats.length - 1 ? 'border-b border-[var(--border)]' : ''
                          }`}
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {client.name[0]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">{client.name}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-[var(--text-secondary)]">{client.phaseLabel}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={client.status}
                            label={
                              client.status === 'green'
                                ? 'Correcto'
                                : client.status === 'yellow'
                                  ? 'Revisar'
                                  : 'Intervención'
                            }
                          />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-[var(--text-secondary)]">{client.lastWorkout}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${client.adherence}%`,
                                  backgroundColor:
                                    client.adherence >= 80
                                      ? 'var(--success)'
                                      : client.adherence >= 60
                                        ? 'var(--warning)'
                                        : 'var(--danger)',
                                }}
                              />
                            </div>
                            <span className="text-sm text-[var(--text-secondary)]">{client.adherence}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          {getClientAlert(client.alertInput) ? (
                            <span className="text-xs text-[var(--danger)] line-clamp-1">
                              {getClientAlert(client.alertInput)}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Link href={`/clients/${client.id}`}>
                            <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-[var(--border)]">
                  {clientStats.map((client, i) => (
                    <div key={client.id} className="p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <Link href={`/clients/${client.id}`} className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{client.name[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{client.name}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{client.phaseLabel}</p>
                          </div>
                        </Link>
                        <StatusBadge
                          status={client.status}
                          label={
                            client.status === 'green'
                              ? 'Correcto'
                              : client.status === 'yellow'
                                ? 'Revisar'
                                : 'Intervención'
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--text-muted)]">Último entreno</span>
                          <span className="text-xs font-medium text-[var(--text-secondary)]">{client.lastWorkout}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Adherencia</span>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <div className="w-20 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${client.adherence}%`,
                                  backgroundColor:
                                    client.adherence >= 80
                                      ? 'var(--success)'
                                      : client.adherence >= 60
                                        ? 'var(--warning)'
                                        : 'var(--danger)',
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">{client.adherence}%</span>
                          </div>
                        </div>
                        {getClientAlert(client.alertInput) && (
                          <div className="mt-1">
                            <span className="text-xs text-[var(--danger)]">{getClientAlert(client.alertInput)}</span>
                          </div>
                        )}
                        <div className="mt-2 pt-3 border-t border-[var(--border)]">
                          <Link href={`/clients/${client.id}`}>
                            <Button variant="secondary" size="sm" className="w-full">
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
