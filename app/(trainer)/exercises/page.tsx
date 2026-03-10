import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { ExercisesFilter } from '@/components/trainer/exercises-filter'
import type { Database } from '@/lib/supabase/types'

type Exercise = Database['public']['Tables']['exercises']['Row']

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, muscle_group, target_sets, target_reps, target_rir, notes')
    .order('muscle_group', { ascending: true })
    .order('name', { ascending: true })

  const allExercises = (exercises ?? []) as Pick<Exercise, 'id' | 'name' | 'muscle_group' | 'target_sets' | 'target_reps' | 'target_rir' | 'notes'>[]

  // Derivar grupos únicos de la data retornada (no hardcodear)
  const muscleGroups = Array.from(
    new Set(allExercises.map(e => e.muscle_group).filter((g): g is string => Boolean(g)))
  ).sort()

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Ejercicios
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {allExercises.length} {allExercises.length === 1 ? 'ejercicio' : 'ejercicios'}
          </p>
        </div>
        <ExercisesFilter exercises={allExercises} muscleGroups={muscleGroups} />
      </div>
    </PageTransition>
  )
}
