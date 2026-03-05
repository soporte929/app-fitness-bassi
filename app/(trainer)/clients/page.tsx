import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { NewClientButton } from '@/components/trainer/new-client-button'
import { ClientsListUI } from './clients-list'
import type { ClientItem } from './clients-list'

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all clients for this trainer
  const { data: rawClients } = await supabase
    .from('clients')
    .select(
      `id, phase, goal, weight_kg, joined_date,
      profile:profiles!clients_profile_id_fkey (full_name, email)`
    )
    .eq('trainer_id', user.id)
    .eq('active', true)
    .order('joined_date', { ascending: false })

  const clients = rawClients ?? []

  // Fetch recent sessions (last 30 days) for all clients
  const clientIds = clients.map((c) => c.id)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions } =
    clientIds.length > 0
      ? await supabase
        .from('workout_sessions')
        .select('client_id, started_at, completed')
        .in('client_id', clientIds)
        .gte('started_at', thirtyDaysAgo.toISOString())
      : { data: [] as { client_id: string; started_at: string; completed: boolean }[] }

  const allSessions = sessions ?? []
  const now = new Date()

  const phaseLabel = (phase: string) =>
    ({ deficit: 'Déficit', maintenance: 'Mantenimiento', surplus: 'Superávit' }[phase] ?? phase)

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

    const profile = c.profile as { full_name: string; email: string } | null

    return {
      id: c.id,
      name: profile?.full_name ?? 'Sin nombre',
      phase: phaseLabel(c.phase),
      status,
      adherence,
      lastWorkout,
      weightKg: c.weight_kg,
      alert,
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
          </div>
          <NewClientButton />
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin clientes</p>
            <p className="text-sm text-[var(--text-secondary)]">Añade tu primer cliente para comenzar</p>
          </div>
        ) : (
          <ClientsListUI clients={clientsWithStats} />
        )}
      </div>
    </PageTransition>
  )
}
