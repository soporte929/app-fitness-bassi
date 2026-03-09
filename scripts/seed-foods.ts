/**
 * Seed script: inserta los 13 alimentos base en la tabla `foods`.
 * Idempotente — usa upsert con onConflict: 'name', seguro de ejecutar múltiples veces.
 *
 * Uso (requiere Node >= 20 para --env-file):
 *   npx --node-options="--env-file=.env.local" tsx scripts/seed-foods.ts
 *
 * O pasando las vars manualmente:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-foods.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Error: Faltan variables de entorno.\n' +
    'Ejecuta con:\n' +
    '  npx --node-options="--env-file=.env.local" tsx scripts/seed-foods.ts\n' +
    'O bien:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-foods.ts'
  )
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceKey)

type FoodInsert = Database['public']['Tables']['foods']['Insert']

// 13 alimentos base — valores por 100g (fuente: BEDCA / FoodData Central)
const foods: FoodInsert[] = [
  // --- Proteínas ---
  {
    name: 'Pollo (pechuga)',
    category: 'proteína',
    kcal_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
  },
  {
    name: 'Huevos',
    category: 'proteína',
    kcal_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
  },
  {
    name: 'Atún (lata)',
    category: 'proteína',
    kcal_per_100g: 132,
    protein_per_100g: 29,
    carbs_per_100g: 0,
    fat_per_100g: 1.0,
  },
  {
    name: 'Ternera (magra)',
    category: 'proteína',
    kcal_per_100g: 143,
    protein_per_100g: 26,
    carbs_per_100g: 0,
    fat_per_100g: 4.0,
  },
  {
    name: 'Salmón',
    category: 'proteína',
    kcal_per_100g: 208,
    protein_per_100g: 20,
    carbs_per_100g: 0,
    fat_per_100g: 13,
  },
  // --- Carbohidratos ---
  {
    name: 'Arroz (cocido)',
    category: 'carbohidrato',
    kcal_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28,
    fat_per_100g: 0.3,
  },
  {
    name: 'Pasta (cocida)',
    category: 'carbohidrato',
    kcal_per_100g: 131,
    protein_per_100g: 5,
    carbs_per_100g: 25,
    fat_per_100g: 1.1,
  },
  {
    name: 'Patata (cocida)',
    category: 'carbohidrato',
    kcal_per_100g: 87,
    protein_per_100g: 2,
    carbs_per_100g: 20,
    fat_per_100g: 0.1,
  },
  {
    name: 'Avena',
    category: 'carbohidrato',
    kcal_per_100g: 389,
    protein_per_100g: 17,
    carbs_per_100g: 66,
    fat_per_100g: 7,
  },
  {
    name: 'Pan integral',
    category: 'carbohidrato',
    kcal_per_100g: 247,
    protein_per_100g: 9,
    carbs_per_100g: 41,
    fat_per_100g: 3.5,
  },
  // --- Grasas ---
  {
    name: 'Aceite de oliva',
    category: 'grasa',
    kcal_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 100,
  },
  {
    name: 'Aguacate',
    category: 'grasa',
    kcal_per_100g: 160,
    protein_per_100g: 2,
    carbs_per_100g: 9,
    fat_per_100g: 15,
  },
  {
    name: 'Frutos secos',
    category: 'grasa',
    kcal_per_100g: 607,
    protein_per_100g: 20,
    carbs_per_100g: 13,
    fat_per_100g: 54,
  },
]

async function seedFoods(): Promise<void> {
  console.log(`Seeding ${foods.length} foods...`)

  const { data, error } = await supabase
    .from('foods')
    .upsert(foods, { onConflict: 'name', ignoreDuplicates: false })
    .select('id, name')

  if (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }

  console.log(`Done. ${data?.length ?? 0} rows upserted.`)
  data?.forEach(f => console.log(` - ${f.name}`))
}

seedFoods()
