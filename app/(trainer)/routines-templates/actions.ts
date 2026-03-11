'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { RoutinePlanInput } from './types'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer') return { supabase, trainerId: null as string | null }

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

  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      name: normalized.name,
      description: normalized.description,
      days_per_week: normalized.days_per_week,
      is_template: normalized.mode === 'template',
      trainer_id: trainerId,
      client_id: normalized.mode === 'client' ? normalized.client_id : null,
      active: true,
    })
    .select('id')
    .single()

  if (planError || !plan) {
    return { success: false, error: planError?.message ?? 'No se pudo crear el plan' }
  }

  for (const day of normalized.days) {
    const { data: dayRow, error: dayError } = await supabase
      .from('workout_days')
      .insert({ plan_id: plan.id, name: day.name, order_index: day.order_index })
      .select('id')
      .single()

    if (dayError || !dayRow) {
      return { success: false, error: dayError?.message ?? 'No se pudo crear el día' }
    }

    if (day.exercises.length > 0) {
      const { error: exError } = await supabase
        .from('exercises')
        .insert(
          day.exercises.map((ex, i) => ({
            day_id: dayRow.id,
            name: ex.name,
            muscle_group: ex.muscle_group,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
            target_rir: ex.target_rir,
            notes: ex.notes,
            order_index: i,
          }))
        )

      if (exError) return { success: false, error: exError.message }
    }
  }

  revalidateRoutinePaths(normalized.client_id, plan.id)
  redirect('/routines-templates')
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

  const { error: updateError } = await supabase
    .from('workout_plans')
    .update({
      name: normalized.name,
      description: normalized.description,
      days_per_week: normalized.days_per_week,
    })
    .eq('id', planId)
    .eq('trainer_id', trainerId)

  if (updateError) return { success: false, error: updateError.message }

  if (replaceStructure) {
    const { error: deleteError } = await supabase
      .from('workout_days')
      .delete()
      .eq('plan_id', planId)

    if (deleteError) return { success: false, error: deleteError.message }

    for (const day of normalized.days) {
      const { data: dayRow, error: dayError } = await supabase
        .from('workout_days')
        .insert({ plan_id: planId, name: day.name, order_index: day.order_index })
        .select('id')
        .single()

      if (dayError || !dayRow) {
        return { success: false, error: dayError?.message ?? 'No se pudo actualizar el día' }
      }

      if (day.exercises.length > 0) {
        const { error: exError } = await supabase
          .from('exercises')
          .insert(
            day.exercises.map((ex, i) => ({
              day_id: dayRow.id,
              name: ex.name,
              muscle_group: ex.muscle_group,
              target_sets: ex.target_sets,
              target_reps: ex.target_reps,
              target_rir: ex.target_rir,
              notes: ex.notes,
              order_index: i,
            }))
          )

        if (exError) return { success: false, error: exError.message }
      }
    }
  }

  revalidateRoutinePaths(plan.client_id, planId)
  redirect('/routines-templates')
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


