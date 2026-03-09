# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** The workout tracking loop must work end-to-end — start session, log sets, finish, review in history.
**Current focus:** Milestone v1.0 — Workout Loop Completion

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-09 — Milestone v1.0 started

## Accumulated Context

### Architecture Patterns (established)
- Server Components by default; `'use client'` only for interactive state
- Server Actions in `actions.ts` alongside route; called directly with typed params
- All Supabase joins use explicit FK hints to avoid ambiguous FK failures
- `params` is a Promise in Next.js 16: always `params: Promise<{ id: string }>` with `await params`

### Known Gotchas
- `nutrition_plans` / `nutrition_plan_meals` types incomplete in types.ts (use `as any` workaround)
- Dev auth bypass active in middleware.ts (`NODE_ENV === 'development'`)
- Recharts formatter: `(value: number | undefined, name: string | undefined)` to avoid type errors
- Column ambiguity in `.eq()`: if parent + child both have same column, remove from child select

### Useful Files
- `lib/supabase/types.ts` — all Database types (1200+ lines)
- `lib/alerts.ts` — trainer alert computation
- `lib/calculations/nutrition.ts` — macro formulas
- `components/client/rest-timer.tsx` — rest timer already built
- `components/client/exercise-card.tsx` — set logging already built
- `components/client/session-history-card.tsx` — history card already exists (may be stub)
- `components/client/session-detail.tsx` — session detail already exists (may be stub)

## Pending Todos

(none — starting fresh milestone)
