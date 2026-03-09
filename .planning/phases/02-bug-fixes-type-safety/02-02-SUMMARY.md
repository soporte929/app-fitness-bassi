---
phase: 02-bug-fixes-type-safety
plan: "02"
subsystem: ui
tags: [next.js, supabase, nutrition, workout, server-components]

# Dependency graph
requires: []
provides:
  - Global (dateless) active-session check in routines/[planId]/page.tsx — resumes correctly from any day
  - Direct Link to /workout/{id} when active session exists — eliminates server action round-trip on resume
  - calculateNutrition() used as fallback macro targets in nutrition/page.tsx — Cunningham/Tinsley based
  - Macro cards always rendered in nutrition — no more empty placeholder for clients without a plan
affects: [03-workout-loop, 06-ai-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Session collision check: global .eq('completed', false).maybeSingle() without date filters — matches actions.ts"
    - "Resume link pattern: <Link href=/workout/{id}> when activeSession truthy, form submit when null"
    - "Calculated macro fallback: calculateNutrition() with body_fat_pct ?? 20 fallback, always returns MacroTargets"

key-files:
  created: []
  modified:
    - app/(client)/routines/[planId]/page.tsx
    - app/(client)/nutrition/page.tsx

key-decisions:
  - "Use global session check (no date bounds) to match the collision check in actions.ts — prevents label mismatch for multi-day sessions"
  - "Capture activeSession.id in page query so Link can navigate directly without server action round-trip"
  - "calculateNutrition() replaces hardcoded getKcalByPhase/buildTargets — body_fat_pct defaults to 20% when unknown"
  - "targets: MacroTargets is never null — fallbackTargets always used when no activePlan assigned"

patterns-established:
  - "Session resume: read session ID in page, pass via Link href — skip server action for read-only navigation"
  - "Macro targets: always computed via calculateNutrition(), plan values override if trainer assigned one"

requirements-completed: [BUG-01, BUG-03]

# Metrics
duration: 8min
completed: 2026-03-09
---

# Phase 2 Plan 02: Bug Fixes (BUG-01 + BUG-03) Summary

**Global active-session check in routines page and always-visible calculated macro targets in nutrition via Cunningham/Tinsley formulas**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-09T03:50:52Z
- **Completed:** 2026-03-09T03:59:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Fixed BUG-01: routines/[planId]/page.tsx now uses global dateless session check matching actions.ts collision check — sessions started on previous days are correctly detected
- Fixed BUG-01 (bonus): when active session exists, page renders direct `<Link href="/workout/{id}">Reanudar entreno</Link>` instead of a form submit — eliminates server action round-trip and wrong button label
- Fixed BUG-03: nutrition/page.tsx replaces hardcoded `getKcalByPhase()` / `buildTargets()` with `calculateNutrition()` from Cunningham/Tinsley formulas — clients without a nutrition plan now see real computed macro targets

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix global active-session check in routines/[planId]/page.tsx (BUG-01)** - `ad42c3b` (fix)
2. **Task 2: Always show calculated macro targets in nutrition/page.tsx (BUG-03)** - `6fa2e2b` (fix)

**Plan metadata:** `(docs commit follows)`

## Files Created/Modified

- `app/(client)/routines/[planId]/page.tsx` - Removed today-scoped gte/lte date filters; captures activeSession.id; renders Link for resume, form for start
- `app/(client)/nutrition/page.tsx` - Added calculateNutrition import; expanded ClientNutritionData Pick; removed hardcoded helpers; targets never null; cards always rendered; "Objetivos estimados" note shown when no plan

## Decisions Made

- Use global session check without date bounds to exactly match the collision guard in `startWorkoutSession` action — ensures label always matches what the action will do
- Capture `activeSession.id` in the page-level query so resume navigates directly via `<Link>` without a server action round-trip
- `calculateNutrition()` uses `body_fat_pct ?? 20` (20% fallback) when unknown — conservative but realistic default that gives sensible macro splits via FFM calculation
- `targets` typed as `MacroTargets` (never null) — when no `activePlan`, falls back to calculated targets so all four macro cards always render

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compiles clean for both modified files. Pre-existing errors in `profile/page.tsx` and `clients/[id]/page.tsx` are out of scope (documented in earlier phase context).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BUG-01 and BUG-03 are closed
- routines/[planId]/page.tsx is ready for Phase 3 workout loop (session resume flow is correct)
- nutrition/page.tsx macro targets are now reliable for both plan-assigned and unassigned clients
- Remaining pre-existing errors in profile and trainer/clients pages should be addressed in a future plan

## Self-Check: PASSED

- FOUND: app/(client)/routines/[planId]/page.tsx (modified)
- FOUND: app/(client)/nutrition/page.tsx (modified)
- FOUND: .planning/phases/02-bug-fixes-type-safety/02-02-SUMMARY.md (created)
- FOUND: ad42c3b (Task 1 commit — BUG-01 fix)
- FOUND: 6fa2e2b (Task 2 commit — BUG-03 fix)
- TypeScript: zero errors in modified files; only pre-existing errors in out-of-scope files

---
*Phase: 02-bug-fixes-type-safety*
*Completed: 2026-03-09*
