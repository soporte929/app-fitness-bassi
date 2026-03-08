'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PlanPhase, PlanLevel } from '@/lib/supabase/types'

export async function createPlan(data: {
  name: string
  description: string | null
  phase: PlanPhase | null
  level: PlanLevel | null
}): Promise<{ id: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: newPlan, error } = await supabase
    .from('plans')
    .insert({ trainer_id: user.id, ...data })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/plans')
  return { id: newPlan.id }
}

export async function deletePlan(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('plans')
    .update({ active: false })
    .eq('id', planId)
    .eq('trainer_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/plans')
  return { success: true }
}

export async function addRoutineToPlan(
  planId: string,
  workoutPlanId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('plan_routines')
    .select('order_index')
    .eq('plan_id', planId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextIndex = (existing?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('plan_routines')
    .insert({ plan_id: planId, workout_plan_id: workoutPlanId, order_index: nextIndex })

  if (error) return { success: false, error: error.message }
  revalidatePath(`/plans/${planId}`)
  return { success: true }
}

export async function removeRoutineFromPlan(
  planId: string,
  workoutPlanId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('plan_routines')
    .delete()
    .eq('plan_id', planId)
    .eq('workout_plan_id', workoutPlanId)

  if (error) return { success: false, error: error.message }
  revalidatePath(`/plans/${planId}`)
  return { success: true }
}

export async function assignPlanToClient(
  planId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_plans')
    .upsert({ client_id: clientId, plan_id: planId, active: true })

  if (error) return { success: false, error: error.message }
  revalidatePath(`/plans/${planId}`)
  revalidatePath('/clients')
  return { success: true }
}
