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
  is_template: boolean
  client_id: string | null
  client: {
    id: string
    profile: {
      full_name: string
    } | null
  } | null
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
        `id, name, description, days_per_week, is_template, client_id,
        client:clients!workout_plans_client_id_fkey (
          id,
          profile:profiles!clients_profile_id_fkey (full_name)
        ),
        workout_days (
          exercises (id)
        )`
      )
      .eq('trainer_id', user.id)
      .eq('active', true)
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
      is_template: plan.is_template,
      client_id: plan.client_id,
      client_name: plan.client?.profile?.full_name ?? null,
      total_exercises: totalExercises,
    }
  })

  const templates = plans.filter((plan) => plan.is_template)
  const assignedPlans = plans.filter((plan) => !plan.is_template)

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Rutinas
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">
              Librería de templates y planes asignados
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Link href="/routines-templates/new?mode=template" className="w-full sm:w-auto">
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4" /> Nuevo template
              </Button>
            </Link>
            <Link href="/routines-templates/new?mode=client" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full">
                <Plus className="w-4 h-4" /> Plan para cliente
              </Button>
            </Link>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Templates globales</h2>
            <span className="text-xs text-[var(--text-secondary)]">{templates.length} templates</span>
          </div>

          {templates.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">Sin templates todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
              {templates.map((plan, index) => (
                <div key={plan.id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                  <TemplateCard plan={plan} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Planes asignados</h2>
            <span className="text-xs text-[var(--text-secondary)]">{assignedPlans.length} planes</span>
          </div>

          {assignedPlans.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">Aún no has asignado planes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
              {assignedPlans.map((plan, index) => (
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
