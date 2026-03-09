import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/ui/page-transition'
import { generateWeeklyShoppingListAction } from '../actions'

export default async function ShoppingListPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    let client: any = null
    try {
        const { data } = await supabase
            .from('clients')
            .select('id')
            .eq('profile_id', user.id)
            .maybeSingle()
        client = data
    } catch (error) {
        console.error('client fetch error:', error)
    }

    if (!client) {
        return <div>No se encontró la información del cliente.</div>
    }

    const { data: items, success } = await generateWeeklyShoppingListAction(client.id)

    if (!success || !items) {
        return (
            <div className="px-4 pt-6 pb-28 text-center text-[#a0a0a0]">
                No se pudo cargar la lista de la compra o no tienes un plan activo.
            </div>
        )
    }

    // Type alias
    type ItemType = { food_name: string; category: string; total_grams: number }
    const typedItems = items as ItemType[]

    // Group by category
    const grouped = typedItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, ItemType[]>)

    const categories = Object.keys(grouped).sort()

    const formatQuantity = (grams: number) => {
        if (grams >= 1000) {
            return `${(grams / 1000).toFixed(1)} kg`
        }
        return `${Math.round(grams)} g`
    }

    return (
        <PageTransition>
            <div className="px-4 pt-6 pb-28">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/nutrition"
                            className="w-10 h-10 rounded-full bg-[#212121] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#a0a0a0] hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[#e8e8e6] tracking-tight">Lista de la compra</h1>
                            <p className="text-sm text-[#a0a0a0] mt-0.5">Cantidades para 7 días</p>
                        </div>
                    </div>
                </div>

                {typedItems.length === 0 ? (
                    <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-8 text-center flex flex-col items-center justify-center mt-6">
                        <ShoppingBag className="w-8 h-8 text-[#a0a0a0] mb-3 opacity-50" />
                        <p className="text-sm text-[#a0a0a0] mb-1">Tu lista está vacía</p>
                        <p className="text-xs text-[#6b7fa3]">El plan no contiene alimentos básicos</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {categories.map(category => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-[#fb8500] uppercase tracking-wide mb-3 px-1">{category}</h3>
                                <div className="bg-[#212121] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden divide-y divide-[rgba(255,255,255,0.04)]">
                                    {grouped[category].map((item, i) => (
                                        <div key={i} className="px-4 py-3 flex justify-between items-center bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                            <p className="text-sm font-medium text-[#e8e8e6]">{item.food_name}</p>
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-[rgba(255,255,255,0.05)] text-[#a0a0a0] rounded-md backdrop-blur-sm">
                                                {formatQuantity(item.total_grams)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    )
}
