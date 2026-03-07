import { Suspense } from 'react'
import Image from 'next/image'
import { ClientNav } from '@/components/client/nav'
import { RestTimer } from '@/components/client/rest-timer'
import LoadingScreen from '@/components/ui/loading-screen'
import { ActiveSessionBanner } from '@/components/client/active-session-banner'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let activeSession: { id: string; started_at: string; day: { name: string } } | null = null
  let completedSets = 0
  let totalSets = 0

  if (user) {
    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()

    const { data: session } = clientRecord
      ? await supabase
          .from('workout_sessions')
          .select('id, started_at, day_id')
          .eq('client_id', clientRecord.id)
          .eq('completed', false)
          .gte('started_at', new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString())
          .lte('started_at', new Date(new Date().setUTCHours(23, 59, 59, 999)).toISOString())
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null }

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
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div
        className="relative mx-auto min-h-screen w-full max-w-[430px] md:shadow-2xl flex flex-col"
        style={{ background: '#191919' }}
      >
        <header
          className="sticky top-0 z-30 flex items-center px-4"
          style={{ height: '44px', background: '#191919', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Image
            src="/2.png"
            alt="Fitness Bassi"
            width={28}
            height={28}
            className="object-contain"
            style={{ mixBlendMode: 'screen' }}
          />
        </header>
        <main className="flex-1 pb-20">
          <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
        </main>
        <ClientNav />
        <RestTimer />
        <ActiveSessionBanner activeSession={activeSession} completedSets={completedSets} totalSets={totalSets} />
      </div>
    </div>
  )
}
