'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type CreateNutritionLogInput = {
  clientId: string
  mealName: string
  kcal: number | string | null
  proteinG: number | string | null
  carbsG: number | string | null
  fatG: number | string | null
}

export async function createNutritionLogAction(
  input: CreateNutritionLogInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }

  const { data: ownClient } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .eq('id', input.clientId)
    .maybeSingle()

  if (!ownClient) return { success: false, error: 'Cliente no válido' }

  const { error } = await supabase.from('nutrition_logs').insert({
    client_id: ownClient.id,
    meal_name: input.mealName,
    kcal: parseInt(input.kcal as string) || 0,
    protein_g: parseFloat(input.proteinG as string) || 0,
    carbs_g: parseFloat(input.carbsG as string) || 0,
    fat_g: parseFloat(input.fatG as string) || 0,
    logged_at: new Date().toISOString(),
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/nutrition')
  return { success: true }
}

export async function deleteNutritionLogAction(logId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: ownClient } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!ownClient) return

}

export type ClientNutritionContextResult = {
  activePlan: (Database['public']['Tables']['nutrition_plans']['Row'] & {
    meals: Database['public']['Tables']['nutrition_plan_meals']['Row'][]
    items: (Database['public']['Tables']['meal_plan_items']['Row'] & {
      food: Database['public']['Tables']['foods']['Row'] | null
      dish: Database['public']['Tables']['saved_dishes']['Row'] | null
    })[]
  }) | null
  consumed: {
    kcal: number
    protein: number
    carbs: number
    fat: number
  }
  logs: any[] // We can type this better later if needed
}

export async function getClientNutritionContextAction(
  clientId: string,
  dateStr: string
): Promise<{ success: boolean; data?: ClientNutritionContextResult; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: activePlan, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*, meals:nutrition_plan_meals(*), items:meal_plan_items(*, food:foods(*), dish:saved_dishes(*))')
      .eq('client_id', clientId)
      .eq('active', true)
      .maybeSingle()

    if (planError) {
      return { success: false, error: 'Failed to fetch active plan' }
    }

    const { data: logs, error: logsError } = await supabase
      .from('food_log')
      .select(`
        *,
        food:foods(id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g),
        dish:saved_dishes(id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
      `)
      .eq('client_id', clientId)
      .eq('logged_date', dateStr)

    if (logsError) {
      return { success: false, error: 'Failed to fetch food logs' }
    }

    let consumed = { kcal: 0, protein: 0, carbs: 0, fat: 0 }

    for (const log of logs || []) {
      const source = log.food || log.dish
      if (source) {
        // Handle array or single object from supabase join
        const macroSource = Array.isArray(source) ? source[0] : source
        if (macroSource) {
          const factor = log.grams / 100
          consumed.kcal += (macroSource.kcal_per_100g || 0) * factor
          consumed.protein += (macroSource.protein_per_100g || 0) * factor
          consumed.carbs += (macroSource.carbs_per_100g || 0) * factor
          consumed.fat += (macroSource.fat_per_100g || 0) * factor
        }
      }
    }

    consumed = {
      kcal: Math.round(consumed.kcal),
      protein: Number(consumed.protein.toFixed(1)),
      carbs: Number(consumed.carbs.toFixed(1)),
      fat: Number(consumed.fat.toFixed(1))
    }

    return {
      success: true,
      data: {
        activePlan,
        consumed,
        logs: logs || []
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export async function logPlannedMealAction(
  clientId: string,
  dateStr: string,
  mealNumber: number,
  itemsToLog: Array<{ foodId: string | null; dishId: string | null; grams: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: ownClient } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .eq('id', clientId)
      .maybeSingle()

    if (!ownClient) return { success: false, error: 'Cliente no válido' }

    const inserts = itemsToLog.map(item => ({
      client_id: ownClient.id,
      logged_date: dateStr,
      meal_number: mealNumber,
      food_id: item.foodId,
      dish_id: item.dishId,
      grams: item.grams
    }))

    if (inserts.length > 0) {
      const { error } = await supabase.from('food_log').insert(inserts)
      if (error) throw error
    }

    revalidatePath('/nutrition')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export async function searchFoodsAction(query: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado', data: [] }

    // Search both foods and saved_dishes
    const searchTerm = `%${query}%`

    const [foodsRes, dishesRes] = await Promise.all([
      supabase.from('foods').select('*').ilike('name', searchTerm).limit(10),
      supabase.from('saved_dishes').select('*').ilike('name', searchTerm).limit(10)
    ])

    // Combine and mark type
    const foods = (foodsRes.data || []).map(f => ({ ...f, type: 'food' as const }))
    const dishes = (dishesRes.data || []).map(d => ({ ...d, type: 'dish' as const }))

    const sorted = [...foods, ...dishes].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 15)
    return { success: true, data: sorted }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error', data: [] }
  }
}

export async function logFreeFoodAction(
  clientId: string,
  itemId: string,
  type: 'food' | 'dish',
  grams: number,
  dateStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: ownClient } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .eq('id', clientId)
      .maybeSingle()

    if (!ownClient) return { success: false, error: 'Cliente no válido' }

    const { error } = await supabase.from('food_log').insert({
      client_id: ownClient.id,
      logged_date: dateStr,
      meal_number: null, // Specific to free logs, not tied to a planned meal index
      food_id: type === 'food' ? itemId : null,
      dish_id: type === 'dish' ? itemId : null,
      grams
    })

    if (error) throw error

    revalidatePath('/nutrition')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export async function generateWeeklyShoppingListAction(clientId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Fetch active plan with its items and the related food/dish
    const { data: activePlan, error: planError } = await supabase
      .from('nutrition_plans')
      .select('id, items:meal_plan_items(grams, option_slot, food:foods(id, name, category), dish:saved_dishes(id, name))')
      .eq('client_id', clientId)
      .eq('active', true)
      .maybeSingle()

    if (planError || !activePlan) {
      return { success: false, error: 'No hay plan activo disponible' }
    }

    // Group items by food_id or dish_id (filtering only option A or null for Type A compatibility)
    // Actually, for a single set of meals, type B might have options A, B, C. Defaulting to 'A' means we build shopping list for option A.
    // If option_slot is null, we count it.

    type ShoppingListItem = {
      food_name: string
      category: string
      total_grams: number
    }

    const aggregates: Record<string, ShoppingListItem> = {}

    // Type of items:
    const mealItems = activePlan.items as any[]

    mealItems.forEach(item => {
      const isDefaultOption = !item.option_slot || item.option_slot === 'A'
      if (!isDefaultOption) return

      const source = item.food || item.dish
      if (!source) return

      const key = `${source.id}-${item.food ? 'food' : 'dish'}`

      const category = item.food ? (source.category || 'Otros') : 'Platos/Preparados'

      if (!aggregates[key]) {
        aggregates[key] = {
          food_name: source.name,
          category,
          total_grams: 0
        }
      }

      // Add the daily amount multiplied by 7 for the week
      aggregates[key].total_grams += (item.grams * 7)
    })

    const list = Object.values(aggregates)

    // Sort primarily by category, then by name
    list.sort((a, b) => {
      if (a.category < b.category) return -1
      if (a.category > b.category) return 1
      return a.food_name.localeCompare(b.food_name)
    })

    return { success: true, data: list }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

