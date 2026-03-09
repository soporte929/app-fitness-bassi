import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { Dumbbell } from 'lucide-react'

export default async function TodayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!client) redirect('/login')

  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()
  const todayEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  ).toISOString()

  const sessionResult = await supabase
    .from('workout_sessions')
    .select('id, day_id, started_at')
    .eq('client_id', client.id)
    .eq('completed', false)
    .gte('started_at', todayStart)
    .lte('started_at', todayEnd)
    .maybeSingle()

  const session = sessionResult.data

  if (session) {
    redirect(`/workout/${session.id}`)
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Dumbbell className="w-16 h-16 text-[var(--text-muted)] mb-4" />
        <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
          No tienes entreno programado para hoy
        </p>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Empieza una rutina cuando quieras</p>
        <Link href="/routines">
          <Button>Ver mis rutinas</Button>
        </Link>
      </div>
    </PageTransition>
  )
}
