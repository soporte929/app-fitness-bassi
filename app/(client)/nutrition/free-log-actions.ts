'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type ActionResult = {
  success: boolean
  message: string
  error?: string
}

type CreateNutritionFreeLogInput = {
  clientId: string
  foodName: string
  grams: number | null
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
}

type NutritionLogLegacyInsert = Database['public']['Tables']['nutrition_logs']['Insert']

function isSchemaMismatch(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('schema cache') ||
    normalized.includes('column') ||
    normalized.includes('not found') ||
    normalized.includes('does not exist')
  )
}

function sanitizeNumber(value: number | null): number | null {
  if (value == null || Number.isNaN(value)) return null
  if (value < 0) return null
  return value
}

export async function createNutritionFreeLogAction(
  input: CreateNutritionFreeLogInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      message: 'No se pudo guardar el registro',
      error: 'No autenticado',
    }
  }

  if (!input.foodName.trim()) {
    return {
      success: false,
      message: 'No se pudo guardar el registro',
      error: 'El nombre de la comida es obligatorio',
    }
  }

  const { data: ownClient } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .eq('id', input.clientId)
    .maybeSingle<{ id: string }>()

  if (!ownClient) {
    return {
      success: false,
      message: 'No se pudo guardar el registro',
      error: 'Cliente no válido',
    }
  }

  const grams = sanitizeNumber(input.grams)
  const calories = sanitizeNumber(input.calories)
  const proteinG = sanitizeNumber(input.proteinG)
  const carbsG = sanitizeNumber(input.carbsG)
  const fatG = sanitizeNumber(input.fatG)
  const todayDate = new Date().toISOString().split('T')[0]

  const modernPayload = {
    client_id: ownClient.id,
    logged_at: todayDate,
    food_name: input.foodName.trim(),
    grams,
    calories: calories == null ? 0 : Math.round(calories),
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  } as Record<string, unknown>

  const { error: modernError } = await supabase
    .from('nutrition_logs')
    .insert(modernPayload as never)

  if (!modernError) {
    revalidatePath('/nutrition')
    return {
      success: true,
      message: 'Comida registrada correctamente',
    }
  }

  if (!isSchemaMismatch(modernError.message)) {
    return {
      success: false,
      message: 'No se pudo guardar el registro',
      error: modernError.message,
    }
  }

  const legacyPayload: NutritionLogLegacyInsert = {
    client_id: ownClient.id,
    logged_at: todayDate,
    meal_name: input.foodName.trim(),
    kcal: calories == null ? 0 : Math.round(calories),
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  }

  const { error: legacyError } = await supabase.from('nutrition_logs').insert(legacyPayload)
  if (legacyError) {
    return {
      success: false,
      message: 'No se pudo guardar el registro',
      error: legacyError.message,
    }
  }

  revalidatePath('/nutrition')
  return {
    success: true,
    message: 'Comida registrada correctamente',
  }
}
