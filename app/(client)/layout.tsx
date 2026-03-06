import { Suspense } from 'react'
import { ClientNav } from '@/components/client/nav'
import { RestTimer } from '@/components/client/rest-timer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ActiveSessionBanner } from '@/components/client/active-session-banner'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let activeSession: { id: string; started_at: string; day: { name: string } } | null = null
  let completedSets = 0
  let totalSets = 0

  if (user) {
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id, started_at, day_id')
      .eq('completed', false)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (session) {
      const [dayResult, setLogsResult] = await Promise.all([
        supabase
          .from('workout_days')
          .select('name')
          .eq('id', session.day_id)
          .single(),
        supabase
          .from('set_logs')
          .select('completed')
          .eq('session_id', session.id),
      ])

      const dayName = dayResult.data?.name ?? ''
      const setLogs = setLogsResult.data ?? []
      totalSets = setLogs.length
      completedSets = setLogs.filter((s) => s.completed).length

      activeSession = {
        id: session.id,
        started_at: session.started_at,
        day: { name: dayName },
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20">
        <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
      </main>
      <ClientNav />
      <RestTimer />
      <ActiveSessionBanner activeSession={activeSession} completedSets={completedSets} totalSets={totalSets} />
    </div>
  )
}
