'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { revalidatePath } from 'next/cache'

type NutritionMealLogInsert = Database['public']['Tables']['nutrition_meal_logs']['Insert']

export async function toggleMealLogAction(
  mealId: string,
  clientId: string,
  currentDate: string,
  currentlyCompleted: boolean
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const payload: NutritionMealLogInsert = {
    client_id: clientId,
    meal_id: mealId,
    logged_date: currentDate,
    completed: !currentlyCompleted,
  }

  const { error } = await supabase
    .from('nutrition_meal_logs')
    .upsert(payload, { onConflict: 'client_id,meal_id,logged_date' })

  if (error) throw new Error(error.message)

  revalidatePath('/nutrition')
}
