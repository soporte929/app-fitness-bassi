import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { NewClientButton } from '@/components/trainer/new-client-button'
import { ClientsListUI } from './clients-list'
import type { ClientItem, TemplateItem } from './clients-list'
import type { Phase, Goal } from '@/lib/supabase/types'

type RawClientWithPlans = {
  id: string
  phase: Phase
  goal: Goal
  weight_kg: number
  joined_date: string
  profile: { full_name: string; email: string } | null
  client_plans: Array<{
    active: boolean
    plan: { id: string; name: string } | null
  }> | null
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all clients + their workout plans in one query
  const { data: rawClients, error: clientsError } = await supabase
    .from('clients')
    .select(
      `id, phase, goal, weight_kg, joined_date,
      profile:profiles!clients_profile_id_fkey (full_name, email),
      client_plans!client_plans_client_id_fkey (active, plan:plans!client_plans_plan_id_fkey (id, name))`
    )
    .eq('trainer_id', user.id)
    .eq('active', true)
    .order('joined_date', { ascending: false })
  if (clientsError) console.error('CLIENTS ERROR:', clientsError)

  const clients = (rawClients ?? []) as unknown as RawClientWithPlans[]

  // Fetch trainer's plans for the "Asignar plan" popover
  const { data: rawTemplates, error: templatesError } = await supabase
    .from('plans')
    .select('id, name')
    .eq('trainer_id', user.id)
    .eq('active', true)
    .order('name', { ascending: true })
  if (templatesError) console.error('TEMPLATES ERROR:', templatesError)

  const templates: TemplateItem[] = (rawTemplates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
  }))

  // Fetch recent sessions (last 30 days) for all clients
  const clientIds = clients.map((c) => c.id)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions, error: sessionsError } =
    clientIds.length > 0
      ? await supabase
        .from('workout_sessions')
        .select('client_id, started_at, completed')
        .in('client_id', clientIds)
        .gte('started_at', thirtyDaysAgo.toISOString())
      : { data: [] as { client_id: string; started_at: string; completed: boolean }[], error: null }
  if (sessionsError) console.error('SESSIONS ERROR:', sessionsError)

  const allSessions = sessions ?? []
  const now = new Date()

  const phaseLabel = (phase: string) =>
  ({
    deficit: 'Déficit calórico',
    maintenance: 'Mantenimiento',
    surplus: 'Volumen',
  }[phase] ?? phase)

  const clientsWithStats: ClientItem[] = clients.map((c) => {
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

    let status: 'green' | 'yellow' | 'red' = 'green'
    if (adherence < 50 || daysSinceLast >= 7) status = 'red'
    else if (adherence < 70 || daysSinceLast >= 4) status = 'yellow'

    let lastWorkout = 'Sin registros'
    if (lastSession) {
      if (daysSinceLast === 0) lastWorkout = 'Hoy'
      else if (daysSinceLast === 1) lastWorkout = 'Ayer'
      else lastWorkout = `Hace ${daysSinceLast} días`
    }

    const alert =
      status === 'red'
        ? daysSinceLast >= 7
          ? 'Sin entrenar 7+ días'
          : 'Adherencia muy baja'
        : status === 'yellow'
          ? daysSinceLast >= 4
            ? `Sin entrenar ${daysSinceLast} días`
            : 'Adherencia baja'
          : null

    const activeClientPlan = (c.client_plans ?? []).find((cp) => cp.active)
    const activePlanName = (activeClientPlan?.plan as { id: string; name: string } | null)?.name ?? null

    return {
      id: c.id,
      name: c.profile?.full_name ?? 'Sin nombre',
      phase: phaseLabel(c.phase),
      goal: c.goal,
      status,
      adherence,
      lastWorkout,
      weightKg: c.weight_kg,
      alert,
      activePlanName,
    }
  })

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Clientes
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">{clients.length} clientes activos</p>
            {clientsError && <p className="text-red-500 text-xs mt-1">DEBUG clients: {clientsError.message}</p>}
            {templatesError && <p className="text-red-500 text-xs mt-1">DEBUG templates: {templatesError.message}</p>}
            {sessionsError && <p className="text-red-500 text-xs mt-1">DEBUG sessions: {sessionsError.message}</p>}
            <p className="text-yellow-400 text-xs mt-1">DEBUG: rawClients={rawClients === null ? 'NULL' : `array(${rawClients?.length})`} user.id={user.id}</p>
          </div>
          <NewClientButton />
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin clientes</p>
            <p className="text-sm text-[var(--text-secondary)]">Añade tu primer cliente para comenzar</p>
          </div>
        ) : (
          <ClientsListUI clients={clientsWithStats} templates={templates} />
        )}
      </div>
    </PageTransition>
  )
}
