import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { ChevronLeft, UtensilsCrossed } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'
import { CreateDishForm } from './create-dish-form'

type SavedDish = Database['public']['Tables']['saved_dishes']['Row']
type Food = Database['public']['Tables']['foods']['Row']

export default async function DishesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rawDishes }, { data: rawFoods }] = await Promise.all([
    supabase
      .from('saved_dishes')
      .select('id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_at')
      .eq('trainer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('foods')
      .select('id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
      .order('name', { ascending: true }),
  ])

  const dishes = (rawDishes ?? []) as SavedDish[]
  const foods = (rawFoods ?? []) as Food[]

  return (
    <PageTransition>
      <div className="p-6 xl:p-8 w-full">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/nutrition-plans"
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Nutrición
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Platos Guardados
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">
              Combina alimentos para crear platos reutilizables en los planes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form to create a new dish */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Crear nuevo plato
            </p>
            <CreateDishForm foods={foods} trainerId={user.id} />
          </div>

          {/* Existing dishes list */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Mis platos ({dishes.length})
            </p>

            {dishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
                <UtensilsCrossed className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" />
                <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  Sin platos guardados
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Crea tu primer plato usando el formulario de la izquierda
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger">
                {dishes.map((dish, i) => (
                  <div
                    key={dish.id}
                    className="animate-fade-in bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[var(--text-primary)]">{dish.name}</h3>
                      <span className="text-sm font-bold text-[#F5C518]">
                        {Math.round(dish.kcal_per_100g)} kcal/100g
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
                      <span>
                        <span className="font-medium text-blue-400">{Math.round(dish.protein_per_100g)}g</span> Prot
                      </span>
                      <span>
                        <span className="font-medium text-green-400">{Math.round(dish.carbs_per_100g)}g</span> Carbs
                      </span>
                      <span>
                        <span className="font-medium text-red-400">{Math.round(dish.fat_per_100g)}g</span> Grasa
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
