import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { Plus, Layers } from 'lucide-react'
import { DeletePlanButton } from './delete-plan-button'
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

export default async function PlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPlans } = await supabase
    .from('plans')
    .select(`
      id, name, description, phase, level, created_at, active,
      plan_routines(count),
      client_plans(
        client:clients(
          id,
          profile:profiles!clients_profile_id_fkey(full_name)
        )
      )
    `)
    .eq('trainer_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  const plans = (rawPlans ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    phase: p.phase as PlanPhase,
    level: p.level as PlanLevel,
    routines_count: p.plan_routines?.[0]?.count ?? 0,
    client_plans: p.client_plans ?? []
  }))

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[#e8e8e6] tracking-tight">
              Planes
            </h1>
            <p className="text-[#a0a0a0] text-sm mt-0.5">{plans.length} planes creados</p>
          </div>
          <Link
            href="/plans/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6b7fa3] text-white text-sm font-medium hover:bg-[#7d90b5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo plan
          </Link>
        </div>

        {/* Grid */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="w-10 h-10 text-[#a0a0a0] mb-3 opacity-40" />
            <p className="text-base font-semibold text-[#e8e8e6] mb-1">Sin planes</p>
            <p className="text-sm text-[#a0a0a0]">
              Crea tu primer plan para comenzar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 flex flex-col animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Name + badges */}
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#e8e8e6] mb-2">{plan.name}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
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
                    <p className="text-xs text-[#a0a0a0] mb-3 line-clamp-2">{plan.description}</p>
                  )}
                  <p className="text-xs text-[#a0a0a0]">
                    {plan.routines_count} {plan.routines_count === 1 ? 'rutina' : 'rutinas'}
                  </p>
                </div>

                {/* Clientes asignados */}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {plan.client_plans.length === 0 ? (
                    <p className="text-xs" style={{ color: '#a0a0a0' }}>Sin clientes asignados</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {plan.client_plans.slice(0, 3).map((cp: any) => (
                        <span
                          key={cp.client.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(107,127,163,0.12)',
                            color: '#6b7fa3',
                            border: '1px solid rgba(107,127,163,0.2)',
                          }}
                        >
                          {cp.client.profile?.full_name ?? 'Cliente'}
                        </span>
                      ))}
                      {plan.client_plans.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#a0a0a0' }}>
                          +{plan.client_plans.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <DeletePlanButton planId={plan.id} />
                  <Link
                    href={`/plans/${plan.id}`}
                    className="text-sm px-4 py-2 rounded-xl bg-[rgba(107,127,163,0.15)] text-[#6b7fa3] hover:bg-[rgba(107,127,163,0.25)] transition-colors font-medium"
                  >
                    Ver plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
