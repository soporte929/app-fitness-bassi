---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Bassi v2
status: planning
last_updated: "2026-03-09T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09 after v2.0 milestone started)

**Core value:** The workout tracking loop must work end-to-end — start session, log sets, finish, review in history.
**Current focus:** Planning milestone v2.0 — Bassi v2

## Current Position

Phase: —
Status: Defining requirements for v2.0
Last activity: 2026-03-09 — Milestone v2.0 started

## Performance Metrics

**v1.0 Velocity:**
- Plans completed: 2
- Average duration: ~2.5m per plan
- Total execution time: ~5m

## Accumulated Context

### Architecture Patterns (established)
- Server Components by default; `'use client'` only for interactive state
- Server Actions in `actions.ts` alongside route; called directly with typed params
- All Supabase joins use explicit FK hints to avoid ambiguous FK failures
- `params` is a Promise in Next.js 16: always `params: Promise<{ id: string }>` with `await params`
- Global (dateless) collision check for session uniqueness: `.eq('completed', false).maybeSingle()`
- `pathname.startsWith('/route')` for hide guards on dynamic sub-paths
- Dark design system: CSS vars `--bg-base`, `--bg-surface`, `--bg-elevated`, `--accent`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`

### Known Gotchas
- `revisions`, `revision_measurements`, `revision_photos` tables missing from types.ts — workaround with `(supabase as any)` — MUST FIX in v2
- `nutrition_plans` / `nutrition_plan_meals` types incomplete in types.ts (use `as any` workaround)
- Dev auth bypass active in middleware.ts (`NODE_ENV === 'development'`) — remove before production
- Recharts formatter: `(value: number | undefined, name: string | undefined)` to avoid type errors
- Column ambiguity in `.eq()`: if parent + child both have same column, remove from child select
- Pre-existing TypeScript errors (3): `profile/page.tsx` + `clients/[id]/page.tsx` — pre-date v1.0
- "Reanudar entreno" bug: `routines/[planId]/page.tsx` shows "Reanudar entreno" text but still calls `startWorkoutSession` creating a new session — must redirect to existing session instead

### Useful Files
- `lib/supabase/types.ts` — all Database types (1200+ lines)
- `components/client/rest-timer.tsx` — listens to `startRestTimer` custom event
- `components/client/exercise-card.tsx` — set logging (weight, reps, RIR, mark complete), has `isPR` prop wired but never set
- `components/client/today-exercises-progress.tsx` — wraps ExerciseCards for a session
- `components/client/active-session-banner.tsx` — session polling, links to /workout/[sessionId]
- `app/(client)/today/actions.ts` — `saveSetLog` and `finishWorkout` (reusable across routes)
- `app/(client)/workout/[sessionId]/page.tsx` — active workout session page (v1.0 built)
- `app/(client)/routines/[planId]/actions.ts` — `startWorkoutSession` (global collision check)
- `app/(client)/history/page.tsx` — history feed (partially implemented)
- `app/(client)/history/[sessionId]/page.tsx` — session detail (partially implemented)
- `app/(client)/revisions/page.tsx` — client revisions (uses `supabase as any`)
- `app/(trainer)/clients/[id]/revisions/page.tsx` — trainer revisions (uses `supabase as any`)
- `app/(client)/nutrition/NutritionFreeLogSheet.tsx` — free log bottom sheet (UI done, no AI yet)
- `components/trainer/sidebar.tsx` — has dead links: /exercises, /reports, /settings

### Blockers/Concerns
- revisions tables not in types.ts — all revision pages use `supabase as any`
- No PR detection logic exists — `isPR` prop in ExerciseCard is never set to true

## Decisions

All key decisions documented in PROJECT.md Key Decisions table.

## Pending Todos

(none)

## Session Continuity

Last session: 2026-03-09
Stopped at: v2.0 milestone started — requirements defined, spawning roadmapper
Resume file: None
