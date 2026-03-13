import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { TemplateCard, type RoutineTemplateCardItem } from '@/components/trainer/template-card'

type RawPlanRow = {
  id: string
  name: string
  description: string | null
  days_per_week: number

  workout_days: Array<{
    exercises: Array<{ id: string }> | null
  }> | null
}



export default async function RoutinesTemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: rawPlans }] = await Promise.all([
    supabase
      .from('workout_plans')
      .select(
        `id, name, description, days_per_week,
        workout_days (
          exercises (id)
        )`
      )
      .eq('trainer_id', user.id)
      .eq('active', true)
      .eq('is_template', true)
      .order('created_at', { ascending: false }),
  ])


  const plans: RoutineTemplateCardItem[] = ((rawPlans ?? []) as unknown as RawPlanRow[]).map((plan) => {
    const totalExercises = (plan.workout_days ?? []).reduce((acc, day) => {
      return acc + (day.exercises?.length ?? 0)
    }, 0)

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      days_per_week: plan.days_per_week,

      total_exercises: totalExercises,
    }
  })



  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Rutinas
            </h1>
              Librería de templates globales de rutinas
          </div>

            <Link href="/routines-templates/new" className="w-full sm:w-auto">
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4" /> Nuevo template
              </Button>
            </Link>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Templates globales</h2>
            <span className="text-xs text-[var(--text-secondary)]">{plans.length} templates</span>
          </div>

          {plans.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">Sin templates todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
              {plans.map((plan, index) => (
                <div key={plan.id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <TemplateCard plan={plan} />
                </div>
              ))}
            </div>
          )}
        </section>


      </div>
    </PageTransition>
  )
}
