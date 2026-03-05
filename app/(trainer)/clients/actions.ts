'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActivityLevel, Phase, Goal } from '@/lib/supabase/types'

export async function updateClientAction(
  clientId: string,
  data: {
    weight_kg: number
    body_fat_pct: number | null
    phase: Phase
    goal: Goal
    activity_level: ActivityLevel
    daily_steps: number
    notes: string | null
  }
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/clients')
}

export async function createClientAction(data: {
  email: string
  full_name: string
  phase: Phase
  goal: Goal
  weight_kg: number
  body_fat_pct: number | null
  activity_level: ActivityLevel
  daily_steps: number
  target_weight_kg: number | null
  joined_date: string
  notes: string | null
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verificar email único en profiles
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle()

  if (existing) return { success: false, error: 'Ya existe un cliente con ese email' }

  // 1. Crear usuario en auth.users primero (admin client bypass RLS)
  const admin = createAdminClient()
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: crypto.randomUUID(), // temporal — cliente puede hacer reset password
    email_confirm: true,
  })
  if (authError) return { success: false, error: authError.message }

  const profileId = authData.user.id

  // 2. Upsert profile con el ID real de auth.users
  // (upsert por si hay trigger que ya lo creó automáticamente)
  const { error: profileError } = await admin.from('profiles').upsert({
    id: profileId,
    email: data.email,
    full_name: data.full_name,
    role: 'client' as const,
    avatar_url: null,
  })

  if (profileError) {
    // Rollback: borrar el usuario de auth para no dejar datos huérfanos
    await admin.auth.admin.deleteUser(profileId)
    return { success: false, error: profileError.message }
  }

  // Crear registro de cliente
  const { data: newClient, error: clientError } = await supabase
    .from('clients')
    .insert({
      profile_id: profileId,
      trainer_id: user.id,
      phase: data.phase,
      goal: data.goal,
      weight_kg: data.weight_kg,
      body_fat_pct: data.body_fat_pct,
      activity_level: data.activity_level,
      daily_steps: data.daily_steps,
      target_weight_kg: data.target_weight_kg,
      joined_date: data.joined_date,
      notes: data.notes,
      active: true,
    })
    .select('id')
    .single()

  if (clientError) {
    // Rollback: borrar usuario de auth y profile huérfano
    await admin.auth.admin.deleteUser(profileId)
    return { success: false, error: clientError.message }
  }

  revalidatePath('/clients')
  return { success: true, id: newClient.id }
}

export async function deleteClientAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Seguridad: verificar que el cliente pertenece al trainer
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!client) return { success: false, error: 'Cliente no encontrado' }

  const { error } = await supabase
    .from('clients')
    .update({ active: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/clients')
  return { success: true }
}
