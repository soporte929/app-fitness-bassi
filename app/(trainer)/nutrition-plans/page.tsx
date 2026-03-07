import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { UtensilsCrossed, ChevronRight } from 'lucide-react'
import { TemplatesList, type ClientOption } from './templates-list'
import { TrainerTemplatesList, type TrainerTemplateItem } from './trainer-templates-list'
import { CreateTemplateModal } from './create-template-modal'

type ClientRow = {
  id: string
  profile: { full_name: string } | null
  nutrition_plans: Array<{ id: string; kcal_target: number | null }> | null
}

type RawTrainerTemplateRow = {
  id: string
  name: string
  kcal_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  nutrition_plan_meals:
    | Array<{
        plan_id: string
      }>
    | null
}

export default async function NutritionPlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawClients } = await supabase
    .from('clients')
    .select(
      `id,
      profile:profiles!clients_profile_id_fkey(full_name),
      nutrition_plans(id, kcal_target)`
    )
    .eq('trainer_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  const { data: rawTrainerTemplates } = await supabase
    .from('nutrition_plans')
    .select(
      `id, name, kcal_target, protein_target_g, carbs_target_g, fat_target_g,
      nutrition_plan_meals!left(plan_id)`
    )
    .eq('trainer_id', user.id)
    .eq('is_template', true)
    .order('created_at', { ascending: false })
    .returns<RawTrainerTemplateRow[]>()

  const clients = ((rawClients ?? []) as unknown as ClientRow[]).map((c) => {
    const activePlan = c.nutrition_plans?.[0] ?? null
    return {
      id: c.id,
      name: (c.profile as { full_name: string } | null)?.full_name ?? 'Cliente',
      hasPlan: activePlan !== null,
      kcalTarget: activePlan?.kcal_target ?? null,
    }
  })
  const clientOptions: ClientOption[] = clients.map((client) => ({ id: client.id, name: client.name }))

  const trainerTemplates: TrainerTemplateItem[] = (rawTrainerTemplates ?? []).map((template) => ({
    id: template.id,
    name: template.name,
    kcalTarget: template.kcal_target,
    proteinTarget: template.protein_target_g,
    carbsTarget: template.carbs_target_g,
    fatTarget: template.fat_target_g,
    mealsCount: template.nutrition_plan_meals?.length ?? 0,
  }))

  const withPlan = clients.filter((c) => c.hasPlan).length

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Nutrición
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">
              {clients.length} clientes · {withPlan} con plan activo
            </p>
          </div>
          <CreateTemplateModal />
        </div>

        <section className="mb-8">
          <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mb-3">
            Plantillas predefinidas
          </p>
          <TemplatesList clients={clientOptions} />
        </section>

        <section className="mb-8">
          <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mb-3">
            Mis plantillas
          </p>
          <TrainerTemplatesList clients={clientOptions} templates={trainerTemplates} />
        </section>

        <section>
          <p className="text-xs font-medium text-[#6b7fa3] tracking-wide uppercase mb-3">
            Tus clientes
          </p>

          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" />
              <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Sin clientes</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Añade clientes para gestionar sus planes nutricionales
              </p>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
              {clients.map((client, i) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors"
                  style={{
                    borderBottom:
                      i < clients.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {client.name[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {client.name}
                      </p>
                      {client.hasPlan && client.kcalTarget != null && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {client.kcalTarget} kcal objetivo
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={
                        client.hasPlan
                          ? {
                            background: 'rgba(48,209,88,0.12)',
                            color: '#30d158',
                          }
                          : {
                            background: 'rgba(255,255,255,0.06)',
                            color: '#a0a0a0',
                          }
                      }
                    >
                      {client.hasPlan ? 'Con plan' : 'Sin plan'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  )
}
