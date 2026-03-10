import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ArrowLeft, Users } from 'lucide-react'
import { PlanRoutinesManager } from './plan-routines-manager'
import { AssignClientDropdown } from './assign-client-dropdown'
import type { PlanPhase, PlanLevel } from '@/lib/supabase/types'

const phaseLabels: Record<PlanPhase, string> = {
  recomposition: 'Recomposición',
  deficit: 'Déficit',
  volume: 'Volumen',
  maintenance: 'Mantenimiento',
}

const levelLabels: Record<PlanLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

type AssignedRoutineRaw = {
  id: string
  workout_plan_id: string
  order_index: number
  workout_plans: { name: string; days_per_week: number } | null
}

type ClientPlanRaw = {
  client_id: string
  clients: {
    id: string
    profile: { full_name: string } | null
  } | null
}

type AllClientRaw = {
  id: string
  profile: { full_name: string } | null
  client_plans: { id: string; active: boolean }[]
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('plans')
    .select('id, name, description, phase, level, created_at')
    .eq('id', planId)
    .eq('trainer_id', user.id)
    .single()

  if (!plan) notFound()

  const [routinesRes, allTemplatesRes, clientPlansRes, allClientsRes] = await Promise.all([
    supabase
      .from('plan_routines')
      .select(
        'id, workout_plan_id, order_index, workout_plans!plan_routines_workout_plan_id_fkey(name, days_per_week)'
      )
      .eq('plan_id', planId)
      .order('order_index', { ascending: true }),
    supabase
      .from('workout_plans')
      .select('id, name, days_per_week')
      .eq('trainer_id', user.id)
      .eq('is_template', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_plans')
      .select(
        'client_id, clients!client_plans_client_id_fkey(id, profile:profiles!clients_profile_id_fkey(full_name))'
      )
      .eq('plan_id', planId)
      .eq('active', true),
    supabase
      .from('clients')
      .select('id, profile:profiles!clients_profile_id_fkey(full_name), client_plans!client_plans_client_id_fkey(id, active)')
      .eq('trainer_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false }),
  ])

  const rawRoutines = (routinesRes.data ?? []) as unknown as AssignedRoutineRaw[]
  const assignedRoutines = rawRoutines.map((r) => ({
    workout_plan_id: r.workout_plan_id,
    name: r.workout_plans?.name ?? 'Rutina',
    days_per_week: r.workout_plans?.days_per_week ?? 0,
    order_index: r.order_index,
  }))

  const assignedIds = new Set(assignedRoutines.map((r) => r.workout_plan_id))
  const availableTemplates = (allTemplatesRes.data ?? []).filter(
    (t) => !assignedIds.has(t.id)
  )

  const rawClientPlans = (clientPlansRes.data ?? []) as unknown as ClientPlanRaw[]
  const clientsWithPlan = rawClientPlans
    .map((cp) => {
      const profile = cp.clients?.profile as { full_name: string } | null
      return {
        id: cp.clients?.id ?? cp.client_id,
        name: profile?.full_name ?? 'Cliente',
      }
    })
    .filter((c) => c.id)

  const assignedClientIds = new Set(clientsWithPlan.map((c) => c.id))
  const allClients = (allClientsRes.data ?? []) as unknown as AllClientRaw[]
  const clientsForDropdown = allClients
    .filter((c) => !assignedClientIds.has(c.id))
    .map((c) => ({
      id: c.id,
      name: (c.profile as { full_name: string } | null)?.full_name ?? 'Cliente',
      hasActivePlan: (c.client_plans as { id: string; active: boolean }[]).some((p) => p.active),
    }))

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link
            href="/plans"
            className="w-9 h-9 rounded-xl bg-[#2a2a2a] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{plan.name}</h1>
              {plan.phase && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,127,163,0.15)] text-[#6b7fa3]">
                  {phaseLabels[plan.phase]}
                </span>
              )}
              {plan.level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,127,163,0.15)] text-[#6b7fa3]">
                  {levelLabels[plan.level]}
                </span>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{plan.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Routines section */}
          <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Rutinas del plan
            </p>
            <PlanRoutinesManager
              planId={planId}
              assignedRoutines={assignedRoutines}
              availableTemplates={availableTemplates}
            />
          </section>

          {/* Clients section */}
          <section className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--text-muted)]" />
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Clientes con este plan
                </p>
                {clientsWithPlan.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-[rgba(107,127,163,0.15)] text-[#6b7fa3]">
                    {clientsWithPlan.length}
                  </span>
                )}
              </div>
              <AssignClientDropdown planId={planId} clients={clientsForDropdown} />
            </div>

            {clientsWithPlan.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Ningún cliente tiene este plan asignado</p>
            ) : (
              <div className="space-y-1">
                {clientsWithPlan.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#6b7fa3]">{c.name[0]}</span>
                    </div>
                    <span className="text-sm text-[var(--text-primary)]">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  )
}
