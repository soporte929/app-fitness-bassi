'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

type SavedDishInsert = Database['public']['Tables']['saved_dishes']['Insert']

interface SaveDishPayload {
  trainerId: string
  name: string
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

export async function saveDishAction(
  payload: SaveDishPayload
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const insert: SavedDishInsert = {
    trainer_id: payload.trainerId,
    name: payload.name,
    kcal_per_100g: payload.kcal_per_100g,
    protein_per_100g: payload.protein_per_100g,
    carbs_per_100g: payload.carbs_per_100g,
    fat_per_100g: payload.fat_per_100g,
  }

  const { error } = await supabase.from('saved_dishes').insert(insert)

  if (error) {
    return { error: `Error al guardar el plato: ${error.message}` }
  }

  revalidatePath('/nutrition-plans/dishes')
  return { error: null }
}
