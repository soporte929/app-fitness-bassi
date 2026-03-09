'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { NUTRITION_TEMPLATES } from './templates'
import type { Database } from '@/lib/supabase/types'

type ActionResult = {
  success: boolean
  message?: string
  error?: string
}

type NutritionPlanMealSchema = {
  plan_id: string
  name: string
  kcal_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
  default_grams: number | null
  meal_time: string | null
  order_index: number
}

type CreateTemplateMealInput = {
  name: string
  kcal_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
  default_grams: number | null
  meal_time: string | null
  order_index: number
}

type CreateNutritionTemplateInput = {
  name: string
  kcal_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  meals: CreateTemplateMealInput[]
}

type NutritionPlanInsertCompat = Database['public']['Tables']['nutrition_plans']['Insert'] & {
  client_id: string | null
  is_template: boolean
}

async function assignTemplateToClient(params: {
  trainerId: string
  clientId: string
  clientName: string
  name: string
  kcal_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  meals: CreateTemplateMealInput[]
}): Promise<ActionResult> {
  const supabase = await createClient()

  const { error: disableError } = await supabase
    .from('nutrition_plans')
    .update({ active: false })
    .eq('client_id', params.clientId)
  if (disableError) {
    return { success: false, error: disableError.message }
  }

  const newPlanPayload = {
    client_id: params.clientId,
    trainer_id: params.trainerId,
    name: params.name,
    kcal_target: params.kcal_target,
    protein_target_g: params.protein_target_g,
    carbs_target_g: params.carbs_target_g,
    fat_target_g: params.fat_target_g,
    active: true,
    is_template: false,
  } as unknown as NutritionPlanInsertCompat

  const { data: newPlan, error: planError } = await supabase
    .from('nutrition_plans')
    .insert(newPlanPayload)
    .select('id')
    .single<{ id: string }>()
  if (planError || !newPlan) {
    return { success: false, error: planError?.message ?? 'No se pudo crear el plan' }
  }

  const mealsToInsert: NutritionPlanMealSchema[] = params.meals.map((meal, index) => ({
    plan_id: newPlan.id,
    name: meal.name,
    kcal_per_100g: meal.kcal_per_100g,
    protein_per_100g: meal.protein_per_100g,
    carbs_per_100g: meal.carbs_per_100g,
    fat_per_100g: meal.fat_per_100g,
    default_grams: meal.default_grams,
    meal_time: meal.meal_time,
    order_index: typeof meal.order_index === 'number' ? meal.order_index : index,
  }))

  if (mealsToInsert.length > 0) {
    const { error: mealsError } = await supabase
      .from('nutrition_plan_meals')
      .insert(mealsToInsert as unknown as Database['public']['Tables']['nutrition_plan_meals']['Insert'][])
    if (mealsError) return { success: false, error: mealsError.message }
  }

  revalidatePath('/nutrition-plans')
  return { success: true, message: `Plan asignado a ${params.clientName}` }
}

export async function assignNutritionTemplateAction(
  templateIndex: number,
  clientId: string,
  clientName: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const template = NUTRITION_TEMPLATES[templateIndex]
  if (!template) return { success: false, error: 'Template no encontrado' }

  return assignTemplateToClient({
    trainerId: user.id,
    clientId,
    clientName,
    name: template.name,
    kcal_target: template.kcal_target,
    protein_target_g: template.protein_target_g,
    carbs_target_g: template.carbs_target_g,
    fat_target_g: template.fat_target_g,
    meals: template.meals.map((meal, index) => ({
      name: meal.name,
      kcal_per_100g: meal.kcal_per_100g ?? null,
      protein_per_100g: meal.protein_per_100g ?? null,
      carbs_per_100g: meal.carbs_per_100g ?? null,
      fat_per_100g: meal.fat_per_100g ?? null,
      default_grams: meal.default_grams ?? null,
      meal_time: meal.meal_time ?? null,
      order_index: typeof meal.order_index === 'number' ? meal.order_index : index,
    })),
  })
}

export async function assignOwnNutritionTemplateAction(
  templatePlanId: string,
  clientId: string,
  clientName: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: templatePlan, error: templatePlanError } = await supabase
    .from('nutrition_plans')
    .select('id, name, trainer_id, kcal_target, protein_target_g, carbs_target_g, fat_target_g, is_template')
    .eq('id', templatePlanId)
    .eq('trainer_id', user.id)
    .single<{
      id: string
      name: string
      trainer_id: string
      kcal_target: number | null
      protein_target_g: number | null
      carbs_target_g: number | null
      fat_target_g: number | null
      is_template: boolean
    }>()

  if (templatePlanError || !templatePlan) {
    return { success: false, error: templatePlanError?.message ?? 'Template no encontrado' }
  }

  if (!templatePlan.is_template) {
    return { success: false, error: 'El plan seleccionado no es un template' }
  }

  const { data: rawMeals, error: mealsError } = await supabase
    .from('nutrition_plan_meals')
    .select(
      'name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_grams, meal_time, order_index'
    )
    .eq('plan_id', templatePlanId)
    .order('order_index', { ascending: true })
    .returns<
      Array<{
        name: string
        kcal_per_100g: number | null
        protein_per_100g: number | null
        carbs_per_100g: number | null
        fat_per_100g: number | null
        default_grams: number | null
        meal_time: string | null
        order_index: number
      }>
    >()

  if (mealsError) return { success: false, error: mealsError.message }

  return assignTemplateToClient({
    trainerId: user.id,
    clientId,
    clientName,
    name: templatePlan.name,
    kcal_target: templatePlan.kcal_target,
    protein_target_g: templatePlan.protein_target_g,
    carbs_target_g: templatePlan.carbs_target_g,
    fat_target_g: templatePlan.fat_target_g,
    meals: rawMeals ?? [],
  })
}

type MealSelectedItem = {
  id: string
  kind: 'food' | 'dish'
  name: string
  grams: number
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

type AssignNutritionPlanInput = {
  clientId: string
  startDate: string
  planName: string
  dietType: 'A' | 'B' | 'C'
  mealsCount: number
  kcalTarget: number
  proteinTargetG: number
  carbsTargetG: number
  fatTargetG: number
  mealItems?: MealSelectedItem[][][] // [mealIndex][optionIndex][itemIndex]
}

export async function assignNutritionPlanAction(
  input: AssignNutritionPlanInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  if (!input.clientId) return { success: false, error: 'Debes seleccionar un cliente' }
  if (!input.startDate) return { success: false, error: 'Debes indicar una fecha de inicio' }

  // Deactivate any existing active nutrition plan for this client
  await supabase
    .from('nutrition_plans')
    .update({ active: false })
    .eq('client_id', input.clientId)
    .eq('active', true)

  // Insert the new nutrition plan
  const planInsertPayload = {
    client_id: input.clientId,
    trainer_id: user.id,
    name: input.planName.trim() || 'Plan Sin Título',
    kcal_target: input.kcalTarget,
    protein_target_g: input.proteinTargetG,
    carbs_target_g: input.carbsTargetG,
    fat_target_g: input.fatTargetG,
    active: true,
    // Store start_date as created_at so it's visible in the DB
    created_at: new Date(input.startDate).toISOString(),
  }

  const { data: newPlan, error: planError } = await supabase
    .from('nutrition_plans')
    .insert(planInsertPayload)
    .select('id')
    .single<{ id: string }>()

  if (planError || !newPlan) {
    return { success: false, error: planError?.message ?? 'No se pudo crear el plan' }
  }

  // For structured (A) or options (B) diet types, insert real meal_plan_items
  if (input.dietType !== 'C') {
    type MealPlanItemInsert = Database['public']['Tables']['meal_plan_items']['Insert']
    const itemsToInsert: MealPlanItemInsert[] = []

    for (let mealIdx = 0; mealIdx < input.mealsCount; mealIdx++) {
      const mealNumber = mealIdx + 1
      const mealOptions = input.mealItems?.[mealIdx] ?? []

      if (input.dietType === 'A') {
        // Single option (no option_slot)
        const items = mealOptions[0] ?? []
        for (const item of items) {
          itemsToInsert.push({
            plan_id: newPlan.id,
            meal_number: mealNumber,
            food_id: item.kind === 'food' ? item.id : null,
            dish_id: item.kind === 'dish' ? item.id : null,
            option_slot: null,
            grams: item.grams,
          })
        }
      } else {
        // Diet type B: options A, B, C
        const optionLabels = ['A', 'B', 'C']
        for (let optIdx = 0; optIdx < mealOptions.length; optIdx++) {
          const items = mealOptions[optIdx] ?? []
          for (const item of items) {
            itemsToInsert.push({
              plan_id: newPlan.id,
              meal_number: mealNumber,
              food_id: item.kind === 'food' ? item.id : null,
              dish_id: item.kind === 'dish' ? item.id : null,
              option_slot: optionLabels[optIdx] ?? 'A',
              grams: item.grams,
            })
          }
        }
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('meal_plan_items')
        .insert(itemsToInsert)
      if (itemsError) return { success: false, error: itemsError.message }
    }
    // If no items were added to any meal slot, no rows are inserted — plan is valid without items
  }

  revalidatePath('/nutrition-plans')
  revalidatePath(`/clients/${input.clientId}`)
  redirect('/nutrition-plans')
}

export async function createNutritionTemplateAction(
  input: CreateNutritionTemplateInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  if (!input.name.trim()) return { success: false, error: 'El nombre de la plantilla es obligatorio' }

  const planPayload = {
    client_id: null,
    trainer_id: user.id,
    name: input.name.trim(),
    kcal_target: input.kcal_target,
    protein_target_g: input.protein_target_g,
    carbs_target_g: input.carbs_target_g,
    fat_target_g: input.fat_target_g,
    active: true,
    is_template: true,
  } as unknown as NutritionPlanInsertCompat

  const { data: newTemplate, error: templateError } = await supabase
    .from('nutrition_plans')
    .insert(planPayload)
    .select('id')
    .single<{ id: string }>()
  if (templateError || !newTemplate) {
    return { success: false, error: templateError?.message ?? 'No se pudo crear la plantilla' }
  }

  const mealsToInsert: NutritionPlanMealSchema[] = input.meals.map((meal, index) => ({
    plan_id: newTemplate.id,
    name: meal.name,
    kcal_per_100g: meal.kcal_per_100g,
    protein_per_100g: meal.protein_per_100g,
    carbs_per_100g: meal.carbs_per_100g,
    fat_per_100g: meal.fat_per_100g,
    default_grams: meal.default_grams,
    meal_time: meal.meal_time,
    order_index: typeof meal.order_index === 'number' ? meal.order_index : index,
  }))

  if (mealsToInsert.length > 0) {
    const { error: mealsError } = await supabase
      .from('nutrition_plan_meals')
      .insert(mealsToInsert as unknown as Database['public']['Tables']['nutrition_plan_meals']['Insert'][])
    if (mealsError) return { success: false, error: mealsError.message }
  }

  revalidatePath('/nutrition-plans')
  return { success: true, message: 'Plantilla creada correctamente' }
}
