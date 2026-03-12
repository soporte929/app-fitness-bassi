---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-11T22:52:51.000Z"
progress:
  total_phases: 19
  completed_phases: 13
  total_plans: 32
  completed_plans: 32
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09 after v4.0 milestone started)

**Core value:** El loop de entrenamiento funciona de extremo a extremo — si esto falla, nada más importa.
**Current focus:** 🚨 v5.0 Emergency Hotfix — Production bugs

## Current Position
- **Milestone**: v5.2 Trainer UX & Logic Fixes
- **Phase**: 30 (completed)
- **Task**: All tasks complete
- **Status**: Verified
- **Last activity**: 2026-03-12 - Completed quick task 1: Hide nutrition feature from navigation and routes (keep code intact)

## Next Steps
1. `/plan 31` — Plan Phase 31 (UX & Forms) 🟡 IMPORTANT

## Progress Bar

```text
v4.1 Progress: [████████████████████████████████████] 100% (4/4 phases)
Phase 16: [x] Branding & UI Corrections
Phase 17: [x] Global Theme System
Phase 18: [x] Client App Improvements
Phase 19: [x] Trainer Settings & Modals
```

## Performance Metrics

**v1.0 Velocity:**
- Plans completed: 2
- Average duration: ~2.5m per plan
- Total execution time: ~5m

**v2.0 Velocity:**
- Plans completed: 3 (phases 2-3 + 2 quick tasks)
- Average duration: ~35min per plan
- Total execution time: ~35min per plan

**v3.0 Velocity:**
- Plans completed: 10 (phases 4-7)
- Average duration: ~20min per plan

## Accumulated Context

### Architecture Patterns (established)
- Server Components by default; `'use client'` only for interactive state
- Server Actions in `actions.ts` alongside route; called directly with typed params
- All Supabase joins use explicit FK hints to avoid ambiguous FK failures
- `params` is a Promise in Next.js 16: always `params: Promise<{ id: string }>` with `await params`
- Global (dateless) collision check for session uniqueness: `.eq('completed', false).maybeSingle()`
- Dark design system: CSS vars `--bg-base`, `--bg-surface`, `--bg-elevated`, `--accent`
- Admin service role client for INSERT/UPDATE (no RLS INSERT policy for clients table)

### Known Gotchas
- Dev auth bypass active in middleware.ts (`NODE_ENV === 'development'`) — remove before production
- Recharts formatter: `(value: number | undefined, name: string | undefined)` to avoid type errors
- Column ambiguity in `.eq()`: remove duplicate-named column from child select
- FK hints required on all embedded joins — PostgREST picks wrong direction otherwise
- 6 new nutrition tables added to types.ts (08-01): foods, food_equivalences, saved_dishes, meal_plan_items, food_log, client_measurements — full type safety, no `as any` needed
- `Views` and `Functions` must be `{ [_ in never]: never }` NOT `Record<string, never>` in types.ts

### Useful Files
- `lib/supabase/types.ts` — all Database types (1200+ lines)
- `lib/calculations/nutrition.ts` — existing Cunningham/Tinsley/GET formulas (to be extended in Phase 8)
- `lib/pr-detection.ts` — computePRBestsByClient, detectSessionPRs
- `app/(client)/today/actions.ts` — `saveSetLog` and `finishWorkout` (reusable)
- `app/(client)/history/page.tsx` — COMPLETE with real Supabase data + PR badges
- `app/(client)/nutrition/page.tsx` — existing nutrition checklist (to be expanded in Phase 11)
- `app/(client)/progress/page.tsx` — existing progress page (to be extended in Phase 12)

### v4.0 Nutrition Specs
- nutrition-specs.md contains full DB schema, formulas, and UX flows for the nutrition module
- Formulas: Katch-McArdle (con %grasa), Mifflin-St Jeor (sin %grasa), TDEE, macros por fase
- Diet types: A=Estructurada (auto-generated meals), B=Opciones A/B/C (equivalents), C=Flexible (macros only)
- DB tables to create: foods, food_equivalences, saved_dishes, meal_plan_items, food_log, client_measurements
- Seed: 13 alimentos base (pollo, huevos, atún, ternera, salmón, arroz, pasta, patata, avena, pan, aceite oliva, aguacate, frutos secos)

### Phase 8 Context (Wave 1 complete)
- DB migration executed: foods, food_equivalences, saved_dishes, meal_plan_items, food_log, client_measurements — all live in Supabase with RLS
- TypeScript types added for all 6 tables in `lib/supabase/types.ts` — full type safety, no `as any`
- `lib/calculations/nutrition.ts` extended with Katch-McArdle, Mifflin-St Jeor, TDEE, macros (08-02)
- Wave 2 (08-03): seed script created (`scripts/seed-foods.ts`) — 13 alimentos, upsert idempotente — COMPLETE

## Pending Todos

(none — roadmap just created)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Hide nutrition feature from navigation and routes (keep code intact) | 2026-03-12 | 987969d | [1-hide-nutrition-feature-from-navigation-a](./quick/1-hide-nutrition-feature-from-navigation-a/) |

## Decisions

All key decisions documented in PROJECT.md Key Decisions table.
- [Phase 02-bug-fixes-type-safety]: Derive page types from Database Row types rather than redeclaring manually
- [02-02 BUG-01]: Global session check (no date bounds) matches actions.ts collision guard
- [02-02 BUG-03]: calculateNutrition() replaces hardcoded getKcalByPhase/buildTargets
- [Phase 03-01]: detectSessionPRs compares current session vs prior sessions
- [Phase 04-login-trainer-ui-polish]: Usar /2.png en sidebar del trainer
- [Phase 04-login-trainer-ui-polish]: useEffect de mount en ThemeProvider sincroniza con localStorage
- [Phase 05-client-management-fixes]: Use admin client (service role key) for clients INSERT — no RLS INSERT policy in production
- [Phase 05-client-management-fixes]: activity_level hardcoded to 'moderate' default in create modal
- [v4.0 roadmap]: Phase 10 (Meals + Assignment) kept separate from Phase 9 (Plan Creator) — assignment requires plan ID from Phase 9, natural delivery boundary
- [v4.0 roadmap]: Phase 14 (Trainer Completar) has no dependency on Phase 13 (AI) — can execute in parallel or at end
- [Phase 08-01]: client_measurements is a new standalone table separate from revision_measurements — canonical daily-log for Phase 12 progress tracking
- [Phase 08-01]: food_log uses single table with nullable food_id/dish_id FK columns + CHECK constraint (exactly one non-null) — avoids join complexity in Phase 11
- [Phase 08-03]: Script seed usa service role key para bypass RLS; onConflict: 'name' como clave idempotente; Node 20+ --env-file en vez de dotenv
- [Phase 10]: start_date stored as created_at in nutrition_plans (no dedicated column in schema)
- [Phase 10]: Server component parent fetches clients, passes to 'use client' form as props — avoids client-side Supabase fetch
- [Phase 10]: Deactivate existing active plans before inserting new one (deactivate-then-insert pattern)
- [Phase 10-02]: saved_dishes stored as per-100g macros normalized from ingredient weights — consistent with foods schema so MealSlot treats dishes exactly like foods
- [Phase 10-02]: FoodSearchSlot is a local-state-only component — no server action at authoring time, DB insert happens when plan is saved
- [Phase 10-03]: MealSelectedItem defined locally in actions.ts — cannot import 'use client' types in server actions
- [Phase 10-03]: mealItems optional in AssignNutritionPlanInput — plans without food selections are valid; no empty rows inserted
- [Phase 13-ai-nutrition-parsing]: AI Server Action in separate ai-actions.ts file — keeps Claude API logic isolated from Supabase mutations
- [Phase 13-ai-nutrition-parsing]: max_tokens: 256 for Claude macro estimate — sufficient for JSON response without waste
- [Phase 13-02]: AIFoodParserModal uses inline trigger button (not FAB) to avoid z-index conflict with FoodSearchModal's fixed FAB; overlay at z-[90]
- [Phase 13-02]: step set to 'loading' before startTransition — ensures spinner renders immediately without React batching delay
- [Phase 14-trainer-completar]: RLS en exercises filtra automáticamente por trainer_id via day_id → workout_plans — no se requiere filtro manual en la query
- [Phase 14-02]: Reuse client HistoryFilters/SessionHistoryCard for trainer history view — identical SessionData shape, no duplication
- [Phase 14-02]: notFound() on trainer_id mismatch (not redirect) — consistent with existing clients/[id]/page.tsx pattern
- [Phase 15-01]: FoodSearchInput extraído con useRef como sub-componente estático (key no dinámica) — garantiza estabilidad del nodo DOM del input entre re-renders de FoodSearchSlot
- [Phase 15-01]: BUG-06/07/08 no requerían cambios de lógica — createClientAction ya usaba admin client, sidebar ya tenía rutas correctas
- [Phase 15-02]: AssignPlanButton reemplaza AssignRoutineButton — usa tabla plans + assignPlanToClientAction (client_plans), no clona workout_plan templates
- [Phase 15-02]: PlanOption type definido localmente en page.tsx — subset de tabla plans para uso puntual, no tipo global
- [Phase 15-03]: FoodSearchModal trigger?: React.ReactNode — FAB como fallback para compatibilidad con otros usos
- [Phase 15-03]: MetadataRoute.Manifest purpose separado en entries individuales ('any' / 'maskable') — string combinado no válido en TypeScript
- [Phase 15-04]: full_name.trim() || undefined (no null) — profiles.Update es Partial<Insert> donde full_name es string | undefined
- [Phase 15-04]: BUG-03 verificado como inexistente — RoutineBuilder ya mantiene estado entre steps sin cambios
- [Phase 18-01]: upload path avatars/<userId>/<timestamp>.<ext> — namespaced by user, unique by timestamp, no collisions
- [Phase 18-01]: userId passed as prop from server page component to EditProfileForm — avoids client-side auth fetch
- [Phase 18]: checkedItems keyed by item.id (UUID) — stable across option slot toggles, no index drift
- [Phase 18]: Log all items if none checked, only checked items if at least one is checked — preserves one-tap default flow
- [Phase 19-02]: Settings Hub secciones Cuenta y Apariencia — cubre V41-07; entry en sección Principal del sidebar junto a Dashboard y Clientes
- [Phase 19-02]: profile?.email ?? user.email fallback — garantiza email visible aunque profiles.email sea null
- [Phase 20-01]: logAIFoodEntryAction inserts saved_dishes with trainer_id=user.id then food_log with grams=100 so macros match estimate exactly (factor=1)
- [Phase 20-02]: SELECT meal_plan_items uses templatePlanId (source) and INSERT uses newPlanId (destination) — direction explicit to avoid clone confusion
- [Phase 25-active-session-banner-fix]: BUG-03: CustomEvent workoutFinished dispatched before await action() — banner clears synchronously before server navigation to /history
- [Phase 28-progress-page-full-fix]: Single combined early return for both query errors in progress/page.tsx — avoids partial render with one data set missing
- [Phase 28-progress-page-full-fix]: Remove overflowX:hidden from PhaseDistributionChart wrapper + height 320px — sole cause of legend clipping
- [Phase 28-progress-page-full-fix]: RLS policy on client_measurements uses indirect join via clients table (client_id IN SELECT id FROM clients WHERE profile_id = auth.uid()) — clients is the bridge between auth.uid() and measurements
- [Phase 29-01]: unstable_cache wraps all 3 Supabase dashboard queries (clients/sessions/weight_logs) with TTL 60s and tag trainer-dashboard, using createAdminClient (no cookie dependency)
- [Phase 29-01]: revalidateTag second arg passes empty CacheLifeConfig {} — required by Next.js 16 type signature for cache invalidation
- [Phase 29-performance-optimization]: revalidateTag requires 2nd arg {} in Next.js 16 — same pattern as Phase 29-01 (trainer-dashboard)
- [Phase 30-business-logic]: Direct routine-to-client assignment files deleted (assign-routine-button, assign-template-modal, assign-template-button); clonePlanToClientAction removed; TemplateCard no longer has "Asignar a cliente" button; routines-templates page no longer queries clients (perf win)
