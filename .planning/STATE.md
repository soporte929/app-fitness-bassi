---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Módulo Nutrición
status: Defining requirements
stopped_at: Milestone v4.0 started
last_updated: "2026-03-09T00:00:00.000Z"
last_activity: 2026-03-09 — Milestone v4.0 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09 after v4.0 milestone started)

**Core value:** El loop de entrenamiento funciona de extremo a extremo — si esto falla, nada más importa.
**Current focus:** Not started (defining requirements)

## Current Position
- **Phase**: Not started
- **Plan**: —
- **Status**: Defining requirements
- **Last activity**: 2026-03-09 — Milestone v4.0 started

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
- Existing nutrition tables: `nutrition_plans`, `nutrition_plan_meals` have incomplete types — workaround with `as any`; will be superseded by v4.0 INFRA work

### Useful Files
- `lib/supabase/types.ts` — all Database types (1200+ lines)
- `lib/calculations/nutrition.ts` — existing Cunningham/Tinsley/GET formulas (to be extended)
- `lib/pr-detection.ts` — computePRBestsByClient, detectSessionPRs
- `app/(client)/today/actions.ts` — `saveSetLog` and `finishWorkout` (reusable)
- `app/(client)/history/page.tsx` — COMPLETE with real Supabase data + PR badges
- `app/(client)/nutrition/page.tsx` — existing nutrition checklist (to be expanded in v4.0)
- `app/(client)/progress/page.tsx` — existing progress page (to be extended with logging in v4.0)

### v4.0 Nutrition Specs
- nutrition-specs.md contains full DB schema, formulas, and UX flows for the nutrition module
- Formulas: Katch-McArdle (con %grasa), Mifflin-St Jeor (sin %grasa), TDEE, macros por fase
- Diet types: A=Estructurada (auto-generated meals), B=Opciones A/B/C (equivalents), C=Flexible (macros only)
- Starting phase: Phase 8 (v3.0 ended at Phase 7)

## Pending Todos

(none)

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
