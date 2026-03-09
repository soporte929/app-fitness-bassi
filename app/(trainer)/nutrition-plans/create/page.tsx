import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { CreatePlanForm } from './create-plan-form'
import type { Database } from '@/lib/supabase/types'

export const metadata = {
    title: 'Nuevo Plan Nutricional | Fitness Bassi',
}

type ClientOption = {
    id: string
    name: string
}

type Food = Database['public']['Tables']['foods']['Row']
type SavedDish = Database['public']['Tables']['saved_dishes']['Row']

export default async function CreatePlanPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: rawClients }, { data: rawFoods }, { data: rawDishes }] = await Promise.all([
        supabase
            .from('clients')
            .select('id, profile:profiles!clients_profile_id_fkey(full_name)')
            .eq('trainer_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: false }),
        supabase
            .from('foods')
            .select('id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
            .order('name', { ascending: true }),
        supabase
            .from('saved_dishes')
            .select('id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, created_at')
            .eq('trainer_id', user.id)
            .order('created_at', { ascending: false }),
    ])

    const clients: ClientOption[] = ((rawClients ?? []) as unknown as Array<{
        id: string
        profile: { full_name: string } | null
    }>).map((c) => ({
        id: c.id,
        name: c.profile?.full_name ?? 'Sin nombre',
    }))

    const foods = (rawFoods ?? []) as Food[]
    const dishes = (rawDishes ?? []) as SavedDish[]

    return (
        <PageTransition>
            <div className="p-6 xl:p-8 w-full max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/nutrition-plans"
                        className="p-2 -ml-2 hover:bg-[var(--bg-elevated)] rounded-full transition-colors text-[var(--accent)]"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            Crear Plan
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                            Calculadora en tiempo real
                        </p>
                    </div>
                </div>

                <CreatePlanForm clients={clients} foods={foods} dishes={dishes} />
            </div>
        </PageTransition>
    )
}
