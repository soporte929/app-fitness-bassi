'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { revalidatePath } from 'next/cache'

type NutritionMealLogInsert = Database['public']['Tables']['nutrition_meal_logs']['Insert']

type ActionResult = { success: boolean; message: string; error?: string }

export async function upsertMealLogAction(
  mealId: string,
  clientId: string,
  currentDate: string,
  completed: boolean,
  grams: number
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autenticado', error: 'No autenticado' }

  const payload: NutritionMealLogInsert = {
    client_id: clientId,
    meal_id: mealId,
    logged_date: currentDate,
    completed,
    grams,
  }

  const { error } = await supabase
    .from('nutrition_meal_logs')
    .upsert(payload, { onConflict: 'client_id,meal_id,logged_date' })

  if (error) return { success: false, message: error.message, error: error.message }

  revalidatePath('/nutrition')
  return { success: true, message: 'Guardado' }
}
