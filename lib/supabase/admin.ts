import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Supabase admin client — usa service role key para bypass RLS.
 * Solo usar en Server Actions. NUNCA exponer al cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL es requerida')
  }

  // MOCK: Fallback a anon key en desarrollo si no hay service role key
  if (!key && process.env.NODE_ENV === "development") {
    console.warn("WARN: SUPABASE_SERVICE_ROLE_KEY no encontrada. Usando NEXT_PUBLIC_SUPABASE_ANON_KEY como fallback (algunas consultas podrían fallar por RLS).");
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  if (!key) {
    throw new Error(
      'Faltan variables de entorno: SUPABASE_SERVICE_ROLE_KEY es requerida'
    )
  }


  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
