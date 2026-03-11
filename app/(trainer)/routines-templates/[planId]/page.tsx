import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { RoutineBuilder } from '@/components/trainer/routine-builder'
import type { RoutineBuilderInitial, RoutineClientOption } from '../types'

type PlanParams = {
  planId: string
}

type RawClientRow = {
  id: string
  profile: {
    full_name: string
  } | null
}

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
    id: string
    name: string
    order_index: number
    exercises: Array<{
      id: string
      name: string
      muscle_group: string
      target_sets: number
      target_reps: string
      target_rir: number
      order_index: number
      notes: string | null
    }> | null
  }> | null
}

export default async function RoutineTemplateDetailPage({
  params,
}: {
  params: Promise<PlanParams>
}) {
  const { planId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: rawPlan }, { data: rawClients }] = await Promise.all([
    supabase
      .from('workout_plans')
      .select(
        `id, name, description, days_per_week, is_template, client_id,
        client:clients!workout_plans_client_id_fkey (
          id,
          profile:profiles!clients_profile_id_fkey(full_name)
        ),
        workout_days (
          id, name, order_index,
          exercises (
            id, name, muscle_group, target_sets, target_reps, target_rir, order_index, notes
          )
        )`
      )
      .eq('id', planId)
      .eq('trainer_id', user.id)
      .maybeSingle(),
    supabase
      .from('clients')
      .select('id, profile:profiles!clients_profile_id_fkey(full_name)')
      .eq('trainer_id', user.id)
      .eq('active', true)
      .order('joined_date', { ascending: false }),
  ])

  if (!rawPlan) notFound()

  const clients: RoutineClientOption[] = ((rawClients ?? []) as unknown as RawClientRow[]).map((client) => ({
    id: client.id,
    name: client.profile?.full_name ?? 'Sin nombre',
  }))

  const plan = rawPlan as unknown as RawPlanRow

  const sortedDays = [...(plan.workout_days ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((day) => ({
      ...day,
      exercises: [...(day.exercises ?? [])].sort((a, b) => a.order_index - b.order_index),
    }))

  const initial: RoutineBuilderInitial = {
    name: plan.name,
    description: plan.description ?? '',
    days_per_week: plan.days_per_week,
    mode: plan.is_template ? 'template' : 'client',
    client_id: plan.client_id,
    days: sortedDays.map((day) => ({
      name: day.name,
      exercises: day.exercises.map((exercise) => ({
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        target_sets: exercise.target_sets,
        target_reps: exercise.target_reps,
        target_rir: exercise.target_rir,
        notes: exercise.notes,
      })),
    })),
  }

  const dayIds = sortedDays.map((day) => day.id)

  const { data: sessionCheck } =
    !plan.is_template && dayIds.length > 0
      ? await supabase.from('workout_sessions').select('id').in('day_id', dayIds).limit(1)
      : { data: [] as { id: string }[] }

  const structureLocked = !plan.is_template && (sessionCheck?.length ?? 0) > 0

  const subtitle = plan.is_template
    ? 'Template global'
    : `Asignado a ${plan.client?.profile?.full_name ?? 'cliente'}`

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/routines-templates"
              className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-overlay)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{plan.name}</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
            </div>
          </div>


        </div>

        <RoutineBuilder
          clients={clients}
          initial={initial}
          planId={plan.id}
          structureLocked={structureLocked}
        />
      </div>
    </PageTransition>
  )
}
