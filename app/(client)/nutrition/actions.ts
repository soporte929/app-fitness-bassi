'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  await supabase.from('nutrition_logs').delete().eq('id', logId).eq('client_id', ownClient.id)
  revalidatePath('/nutrition')
}
