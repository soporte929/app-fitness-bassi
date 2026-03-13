---
phase: 08-database-foundation-formulas
plan: "03"
subsystem: database
tags: [supabase, seed, foods, nutrition, typescript]

# Dependency graph
requires:
  - phase: 08-01
    provides: "foods table with RLS + TypeScript types (FoodInsert)"
provides:
  - "scripts/seed-foods.ts — script idempotente que pobla los 13 alimentos base en foods"
  - "Tabla foods pre-cargada con proteínas, carbohidratos y grasas para Phases 9 y 11"
affects:
  - "09-trainer-plan-creator"
  - "11-client-nutrition-view"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scripts standalone usan createClient de @supabase/supabase-js directamente (no el helper SSR)"
    - "Seed scripts cargan env vars via --env-file=.env.local (Node >= 20)"
    - "upsert con onConflict: 'name' para idempotencia — seguro de re-ejecutar"

key-files:
  created:
    - scripts/seed-foods.ts
  modified: []

key-decisions:
  - "Script usa service role key (bypass RLS) — necesario porque RLS no permite INSERT anónimo en foods"
  - "onConflict: 'name' elegido como clave natural de idempotencia (name tiene UNIQUE constraint en DB)"
  - "Node 20+ --env-file=.env.local en lugar de dotenv — evita nueva dependencia, Node 24 disponible"
  - "Script standalone importa @supabase/supabase-js directamente, no el helper /lib/supabase/server"

patterns-established:
  - "Seed scripts en scripts/ con ruta relativa a ../lib/supabase/types"
  - "Ejecución: npx --node-options='--env-file=.env.local' tsx scripts/<script>.ts"

requirements-completed:
  - INFRA-02

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 8 Plan 03: Seed Foods Summary

**Script idempotente `scripts/seed-foods.ts` que pobla los 13 alimentos base (proteinas, carbohidratos, grasas) en Supabase via upsert con service role key**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-09T16:28:00Z
- **Completed:** 2026-03-09T16:33:43Z
- **Tasks:** 1/1 (+ checkpoint human-verify pendiente)
- **Files modified:** 1

## Accomplishments

- Script TypeScript standalone `scripts/seed-foods.ts` con los 13 alimentos y sus macros por 100g
- Upsert idempotente con `onConflict: 'name'` — re-ejecución segura sin duplicados
- Carga de `.env.local` via `--env-file` de Node 20+ sin dependencias adicionales
- TypeScript type-safe usando `FoodInsert` de `lib/supabase/types.ts`

## Task Commits

1. **Task 1: Crear scripts/seed-foods.ts con los 13 alimentos base** - `7f11f80` (feat)

## Files Created/Modified

- `scripts/seed-foods.ts` — Script standalone que upserta 13 alimentos en la tabla foods con macros por 100g (BEDCA/FoodData Central)

## Decisions Made

- Service role key para bypass de RLS en foods (sin INSERT policy pública)
- `onConflict: 'name'` como clave de idempotencia (name es UNIQUE en la tabla)
- Node 20+ `--env-file=.env.local` en vez de instalar dotenv
- Import directo de `@supabase/supabase-js` (no el wrapper SSR del proyecto) para contexto standalone

## Deviations from Plan

None - plan ejecutado exactamente como especificado.

## Issues Encountered

None.

## User Setup Required

Para ejecutar el seed (paso manual requerido tras este plan):

```bash
npx --node-options="--env-file=.env.local" tsx scripts/seed-foods.ts
```

Verificar que el output muestre "Done. 13 rows upserted." con los 13 nombres.
Segunda ejecución no debe duplicar filas (upsert idempotente).

## Next Phase Readiness

- `foods` table tiene los 13 alimentos base disponibles para Supabase queries
- Phase 9 (Trainer Plan Creator) puede listar alimentos con `supabase.from('foods').select(...)`
- Phase 11 (Client Nutrition View) puede mostrar macros de cada alimento
- Script re-ejecutable si se añaden más alimentos en el futuro

---
*Phase: 08-database-foundation-formulas*
*Completed: 2026-03-09*
