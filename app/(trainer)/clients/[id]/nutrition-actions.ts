'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SaveNutritionPlanPayload = {
    clientId: string
    planId?: string
    kcalTarget: number
    proteinTarget: number
    carbsTarget: number
    fatTarget: number
    meals: Array<{
        id?: string
        name: string
        kcal: number
        protein_g: number
        carbs_g: number
        fat_g: number
        meal_time: string
    }>
}

export async function saveNutritionPlanAction(payload: SaveNutritionPlanPayload) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    let planId = payload.planId

    if (planId) {
        // Update existing plan
        const { error: planError } = await supabase.from('nutrition_plans' as any).update({
            kcal_target: payload.kcalTarget,
            protein_target_g: payload.proteinTarget,
            carbs_target_g: payload.carbsTarget,
            fat_target_g: payload.fatTarget,
        }).eq('id', planId).eq('trainer_id', user.id)

        if (planError) throw new Error('Error actualizando plan: ' + planError.message)

        // Delete all existing meals to recreate them easily
        await supabase.from('nutrition_plan_meals' as any).delete().eq('plan_id', planId)
    } else {
        // End active plans
        await supabase.from('nutrition_plans' as any).update({ active: false }).eq('client_id', payload.clientId)

        // Insert new plan
        const { data: newPlan, error: planError } = await supabase.from('nutrition_plans' as any).insert({
            client_id: payload.clientId,
            trainer_id: user.id,
            name: 'Plan nutricional',
            kcal_target: payload.kcalTarget,
            protein_target_g: payload.proteinTarget,
            carbs_target_g: payload.carbsTarget,
            fat_target_g: payload.fatTarget,
            active: true
        }).select('id').single()

        if (planError || !newPlan) throw new Error('Error creando plan: ' + planError?.message)
        planId = (newPlan as any).id as string
    }

    // Insert meals
    if (payload.meals.length > 0) {
        const mealsToInsert = payload.meals.map((meal, index) => ({
            plan_id: planId,
            name: meal.name,
            kcal_per_100g: meal.kcal,
            protein_per_100g: meal.protein_g,
            carbs_per_100g: meal.carbs_g,
            fat_per_100g: meal.fat_g,
            default_grams: 100,
            meal_time: meal.meal_time || null,
            order_index: index
        }))

        const { error: mealsError } = await supabase.from('nutrition_plan_meals' as any).insert(mealsToInsert)
        if (mealsError) throw new Error('Error insertando comidas: ' + mealsError.message)
    }

    revalidatePath(`/clients/${payload.clientId}`)
    return { success: true }
}
