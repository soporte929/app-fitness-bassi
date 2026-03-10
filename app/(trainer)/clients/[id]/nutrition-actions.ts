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

export type NutritionTemplate = {
    id: string
    name: string | null
    kcal_target: number | null
    protein_target_g: number | null
    carbs_target_g: number | null
    fat_target_g: number | null
    meals_count: number | null
    diet_type: string | null
}

export async function assignNutritionTemplateToClientAction(
    templatePlanId: string,
    clientId: string,
    clientName: string,
    startDate: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Fetch the template plan — verify it belongs to the trainer and is a template
    const { data: template, error: templateError } = await supabase
        .from('nutrition_plans' as any)
        .select('id, name, trainer_id, kcal_target, protein_target_g, carbs_target_g, fat_target_g, diet_type, meals_count')
        .eq('id', templatePlanId)
        .eq('trainer_id', user.id)
        .eq('is_template', true)
        .single()

    if (templateError || !template) {
        return { success: false, error: 'Plantilla no encontrada' }
    }

    const tmpl = template as any

    // Deactivate existing active plans for the client
    await supabase
        .from('nutrition_plans' as any)
        .update({ active: false })
        .eq('client_id', clientId)

    // Insert new plan from template
    const { data: newPlan, error: insertError } = await supabase
        .from('nutrition_plans' as any)
        .insert({
            client_id: clientId,
            trainer_id: user.id,
            name: tmpl.name,
            kcal_target: tmpl.kcal_target,
            protein_target_g: tmpl.protein_target_g,
            carbs_target_g: tmpl.carbs_target_g,
            fat_target_g: tmpl.fat_target_g,
            diet_type: tmpl.diet_type,
            meals_count: tmpl.meals_count,
            is_template: false,
            active: true,
            created_at: new Date(startDate).toISOString(),
        })
        .select('id')
        .single()

    if (insertError || !newPlan) {
        return { success: false, error: 'Error creando plan: ' + (insertError?.message ?? 'unknown') }
    }

    const newPlanId = (newPlan as any).id as string

    // Clone meals from template
    const { data: templateMeals } = await supabase
        .from('nutrition_plan_meals' as any)
        .select('name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_grams, meal_time, order_index')
        .eq('plan_id', templatePlanId)
        .order('order_index', { ascending: true })

    if (templateMeals && (templateMeals as any[]).length > 0) {
        const mealsToInsert = (templateMeals as any[]).map((meal) => ({
            plan_id: newPlanId,
            name: meal.name,
            kcal_per_100g: meal.kcal_per_100g,
            protein_per_100g: meal.protein_per_100g,
            carbs_per_100g: meal.carbs_per_100g,
            fat_per_100g: meal.fat_per_100g,
            default_grams: meal.default_grams,
            meal_time: meal.meal_time,
            order_index: meal.order_index,
        }))

        const { error: mealsError } = await supabase
            .from('nutrition_plan_meals' as any)
            .insert(mealsToInsert)

        if (mealsError) {
            return { success: false, error: 'Error clonando comidas: ' + mealsError.message }
        }
    }

    revalidatePath(`/clients/${clientId}`)
    return { success: true }
}
