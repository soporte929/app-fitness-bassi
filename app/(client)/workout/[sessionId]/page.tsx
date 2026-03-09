import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { finishWorkout } from '@/app/(client)/today/actions'
import { TodayExercisesProgress } from '@/components/client/today-exercises-progress'

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

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

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('id, client_id, day_id, started_at, completed')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()

  // Security check: session must belong to this client
  if (session.client_id !== client.id) notFound()

  // Session already finished — redirect to history
  if (session.completed) redirect('/history')

  const [exercisesResult, setLogsResult, dayResult, lastSessionResult] = await Promise.all([
    supabase
      .from('exercises')
      .select('id, name, muscle_group, target_sets, target_reps, target_rir, order_index')
      .eq('day_id', session.day_id)
      .order('order_index'),
    supabase
      .from('set_logs')
      .select('id, exercise_id, set_number, weight_kg, reps, rir, completed')
      .eq('session_id', session.id),
    supabase.from('workout_days').select('name').eq('id', session.day_id).single(),
    supabase
      .from('workout_sessions')
      .select('id')
      .eq('client_id', client.id)
      .eq('day_id', session.day_id)
      .eq('completed', true)
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const exercises = exercisesResult.data ?? []
  const setLogs = setLogsResult.data ?? []
  const dayName = dayResult.data?.name ?? 'Entrenamiento'

  const lastSetLogsResult = lastSessionResult.data
    ? await supabase
        .from('set_logs')
        .select('exercise_id, set_number, weight_kg, reps')
        .eq('session_id', lastSessionResult.data.id)
    : null
  const lastSetLogs = lastSetLogsResult?.data ?? []

  const exercisesWithSets = exercises.map((ex) => ({
    ...ex,
    set_logs: setLogs.filter((log) => log.exercise_id === ex.id),
  }))

  const finishAction = finishWorkout.bind(null, session.id)

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-32">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{dayName}</h1>
        </div>

        <TodayExercisesProgress
          exercises={exercisesWithSets}
          sessionId={session.id}
          sessionStartedAt={session.started_at}
          lastSetLogs={lastSetLogs}
        />

        {/* Finish button */}
        <div className="mt-6">
          <form action={finishAction}>
            <Button type="submit" className="w-full" size="lg">
              <CheckCircle2 className="w-5 h-5" />
              Finalizar entrenamiento
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
