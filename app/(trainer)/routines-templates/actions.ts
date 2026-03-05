'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { daysToJson, type RoutinePlanInput } from './types'

function normalizeOptionalText(value: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeInput(input: RoutinePlanInput): RoutinePlanInput {
  return {
    ...input,
    name: input.name.trim(),
    description: normalizeOptionalText(input.description),
    client_id: input.mode === 'client' ? input.client_id : null,
    days: input.days.map((day, dayIndex) => ({
      ...day,
      name: day.name.trim(),
      order_index: dayIndex,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        target_reps: exercise.target_reps.trim(),
        notes: normalizeOptionalText(exercise.notes),
        target_sets: Number(exercise.target_sets),
        target_rir: Number(exercise.target_rir),
      })),
    })),
  }
}

function validateInput(input: RoutinePlanInput, allowMetadataOnly: boolean): string | null {
  if (input.name.length === 0) return 'El nombre del plan es obligatorio'
  if (input.days_per_week < 1 || input.days_per_week > 7) return 'Días por semana debe estar entre 1 y 7'

  if (input.mode === 'client' && !input.client_id) return 'Debes seleccionar un cliente'

  if (allowMetadataOnly) return null

  if (input.days.length !== input.days_per_week) {
    return 'El número de días debe coincidir con días por semana'
  }

  if (input.days.length === 0) return 'Debes configurar al menos un día'

  for (const day of input.days) {
    if (day.name.length === 0) return 'Todos los días deben tener nombre'

    for (const exercise of day.exercises) {
      if (exercise.name.length === 0) return 'Todos los ejercicios deben tener nombre'
      if (exercise.target_reps.length === 0) return 'Todos los ejercicios deben tener repeticiones objetivo'
      if (exercise.target_sets < 1) return 'Las series objetivo deben ser mayor o igual a 1'
      if (exercise.target_rir < 0 || exercise.target_rir > 5) return 'El RIR objetivo debe estar entre 0 y 5'
    }
  }

  return null
}

async function getAuthenticatedTrainerId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, trainerId: null as string | null }
  return { supabase, trainerId: user.id }
}

async function validateClientOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  trainerId: string,
  clientId: string
): Promise<boolean> {
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('trainer_id', trainerId)
    .eq('active', true)
    .maybeSingle()

  return Boolean(client)
}

function revalidateRoutinePaths(clientId: string | null, planId: string): void {
  revalidatePath('/routines-templates')
  revalidatePath(`/routines-templates/${planId}`)
  revalidatePath('/clients')

  if (clientId) {
    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/routines')
  }
}

export async function createPlanAction(
  input: RoutinePlanInput
): Promise<{ success: boolean; planId?: string; error?: string }> {
  const { supabase, trainerId } = await getAuthenticatedTrainerId()
  if (!trainerId) return { success: false, error: 'No autenticado' }

  const normalized = normalizeInput(input)
  const validationError = validateInput(normalized, false)
  if (validationError) return { success: false, error: validationError }

  if (normalized.mode === 'client' && normalized.client_id) {
    const isOwnedClient = await validateClientOwnership(supabase, trainerId, normalized.client_id)
    if (!isOwnedClient) return { success: false, error: 'Cliente no válido para este entrenador' }
  }

  const { data, error } = await supabase.rpc('create_workout_plan_with_structure', {
    p_trainer_id: trainerId,
    p_name: normalized.name,
    p_description: normalized.description,
    p_days_per_week: normalized.days_per_week,
    p_is_template: normalized.mode === 'template',
    p_client_id: normalized.mode === 'client' ? normalized.client_id : null,
    p_days: daysToJson(normalized.days),
  })

  if (error || !data) {
    return { success: false, error: error?.message ?? 'No se pudo crear el plan' }
  }

  const planId = data
  revalidateRoutinePaths(normalized.client_id, planId)

  return { success: true, planId }
}

export async function updatePlanAction(
  planId: string,
  input: RoutinePlanInput
): Promise<{ success: boolean; error?: string }> {
  const { supabase, trainerId } = await getAuthenticatedTrainerId()
  if (!trainerId) return { success: false, error: 'No autenticado' }

  const { data: plan } = await supabase
    .from('workout_plans')
    .select('id, trainer_id, is_template, client_id')
    .eq('id', planId)
    .eq('trainer_id', trainerId)
    .maybeSingle()

  if (!plan) return { success: false, error: 'Plan no encontrado' }

  const normalized = normalizeInput(input)
  const replaceStructure = normalized.replace_structure !== false
  const validationError = validateInput(normalized, !replaceStructure)
  if (validationError) return { success: false, error: validationError }

  const expectedMode = plan.is_template ? 'template' : 'client'
  if (normalized.mode !== expectedMode) {
    return { success: false, error: 'No se puede cambiar el tipo del plan' }
  }

  if (expectedMode === 'template' && normalized.client_id !== null) {
    return { success: false, error: 'Un template no puede tener cliente asignado' }
  }

  if (expectedMode === 'client') {
    if (!plan.client_id) return { success: false, error: 'Plan de cliente inválido' }
    if (normalized.client_id !== plan.client_id) {
      return { success: false, error: 'No se puede cambiar el cliente asignado en edición' }
    }

    const isOwnedClient = await validateClientOwnership(supabase, trainerId, plan.client_id)
    if (!isOwnedClient) return { success: false, error: 'Cliente no válido para este entrenador' }
  }

  const { error } = await supabase.rpc('update_workout_plan_with_structure', {
    p_plan_id: planId,
    p_trainer_id: trainerId,
    p_name: normalized.name,
    p_description: normalized.description,
    p_days_per_week: normalized.days_per_week,
    p_is_template: plan.is_template,
    p_client_id: plan.client_id,
    p_days: daysToJson(normalized.days),
    p_replace_structure: replaceStructure,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateRoutinePaths(plan.client_id, planId)
  return { success: true }
}

export async function deletePlanAction(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, trainerId } = await getAuthenticatedTrainerId()
  if (!trainerId) return { success: false, error: 'No autenticado' }

  const { data: plan } = await supabase
    .from('workout_plans')
    .select('id, client_id')
    .eq('id', planId)
    .eq('trainer_id', trainerId)
    .maybeSingle()

  if (!plan) return { success: false, error: 'Plan no encontrado' }

  const { error } = await supabase
    .from('workout_plans')
    .update({ active: false })
    .eq('id', planId)
    .eq('trainer_id', trainerId)

  if (error) return { success: false, error: error.message }

  revalidateRoutinePaths(plan.client_id, planId)
  return { success: true }
}

export async function clonePlanToClientAction(
  planId: string,
  clientId: string
): Promise<{ success: boolean; newPlanId?: string; error?: string }> {
  const { supabase, trainerId } = await getAuthenticatedTrainerId()
  if (!trainerId) return { success: false, error: 'No autenticado' }

  const isOwnedClient = await validateClientOwnership(supabase, trainerId, clientId)
  if (!isOwnedClient) return { success: false, error: 'Cliente no válido para este entrenador' }

  const { data, error } = await supabase.rpc('clone_workout_plan_to_client', {
    p_plan_id: planId,
    p_trainer_id: trainerId,
    p_client_id: clientId,
  })

  if (error || !data) {
    return { success: false, error: error?.message ?? 'No se pudo asignar el template' }
  }

  revalidateRoutinePaths(clientId, data)
  return { success: true, newPlanId: data }
}
