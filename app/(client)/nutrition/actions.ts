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
  activePlan: Database['public']['Tables']['nutrition_plans']['Row'] | null
  consumed: {
    kcal: number
    protein: number
    carbs: number
    fat: number
  }
}

export async function getClientNutritionContextAction(
  clientId: string,
  dateStr: string
): Promise<{ success: boolean; data?: ClientNutritionContextResult; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: activePlan, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*')
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
        food:foods(kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g),
        dish:saved_dishes(kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
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
        consumed
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}
