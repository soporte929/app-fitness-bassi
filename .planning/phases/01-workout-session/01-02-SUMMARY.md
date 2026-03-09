---
phase: 01-workout-session
plan: "02"
subsystem: client-workout
tags: [navigation, redirect, workout-session, active-session-banner]
dependency_graph:
  requires: [01-01]
  provides: [WORKOUT-06, WORKOUT-07]
  affects: [app/(client)/today/page.tsx, components/client/active-session-banner.tsx]
tech_stack:
  added: []
  patterns: [server-redirect, client-navigation, pathname-guard]
key_files:
  modified:
    - app/(client)/today/page.tsx
    - components/client/active-session-banner.tsx
decisions:
  - "today/page.tsx simplified to ~50 lines — all workout rendering removed as dead code after redirect"
  - "Banner hide guard uses pathname.startsWith('/workout') to cover all /workout/* sub-paths"
  - "Banner onClick uses activeSession.id directly — always available when banner renders"
metrics:
  duration: ~3m
  completed_date: "2026-03-09"
  tasks_completed: 2
  files_modified: 2
---

# Phase 1 Plan 2: Navigation Wiring — today/ redirect + banner link Summary

**One-liner:** Today page now redirects to /workout/[sessionId] when active session exists, and the active session banner links directly to /workout/[sessionId] and hides on all /workout/* routes.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Redirect today/ to active workout session + remove dead code | 6e7dc12 | app/(client)/today/page.tsx |
| 2 | Update active session banner to link to /workout/[sessionId] | 8c18639 | components/client/active-session-banner.tsx |

## What Was Built

### Task 1 — today/page.tsx redirect

Rewrote `app/(client)/today/page.tsx` from 167 lines to ~57 lines. The page now has exactly two code paths:

1. **Session active** → `redirect(\`/workout/${session.id}\`)` — server-side redirect, no rendering
2. **No session** → Empty state JSX with Dumbbell icon, "No tienes entreno programado" message, and link to /routines

Removed all dead code that became unreachable after the redirect:
- `calcStreak()` function
- `streakResult` fetch (removed `Promise.all` wrapper entirely — single `maybeSingle()` call)
- `streak`, `dateLabel` variables
- Flame "Racha X días" JSX block
- Entire workout rendering block (exercisesResult, setLogsResult, dayResult, lastSessionResult, exercisesWithSets, finishAction, TodayExercisesProgress, finish button form)
- Imports: `CheckCircle2`, `Flame`, `finishWorkout`, `TodayExercisesProgress`

### Task 2 — active-session-banner.tsx navigation

Two targeted changes only:

**Change 1 — Hide condition:**
```typescript
// Before:
if (!activeSession || pathname === '/today') return null
// After:
if (!activeSession || pathname === '/today' || pathname.startsWith('/workout')) return null
```
The `startsWith('/workout')` guard hides the banner on `/workout/[sessionId]` and any sub-paths, preventing a double-banner situation.

**Change 2 — onClick handler:**
```typescript
// Before:
onClick={() => router.push('/today')}
// After:
onClick={() => router.push(`/workout/${activeSession.id}`)}
```
Routes directly to the active session page instead of today/.

## Verification Results

- `npx tsc --noEmit`: 3 pre-existing errors in unrelated files (profile/page.tsx, trainer/clients/[id]/page.tsx) — zero new errors introduced
- `redirect(\`/workout/${session.id}\`)` present in today/page.tsx: PASS
- Removed imports (TodayExercisesProgress, finishWorkout, Flame, CheckCircle2) absent: PASS
- Banner onClick routes to `/workout/${activeSession.id}`: PASS
- Banner hide condition includes `pathname.startsWith('/workout')`: PASS

## Requirements Satisfied

- **WORKOUT-06**: Active session banner links to /workout/[sessionId] — DONE
- **WORKOUT-07**: /today redirects to /workout/[sessionId] when session active — DONE

## Full Workout Module Requirements (end-to-end)

| Req | Description | Plan |
|-----|-------------|------|
| WORKOUT-01 | Start from routines → /workout/[sessionId] | 01-01 |
| WORKOUT-02 | Exercises visible with previous weights | 01-01 |
| WORKOUT-03 | Set logging works | 01-01 (reuses ExerciseCard) |
| WORKOUT-04 | Rest timer appears after completing a set | 01-01 (RestTimer in layout) |
| WORKOUT-05 | Finish workout redirects to /history | 01-01 (reuses finishWorkout) |
| WORKOUT-06 | Active session banner links to /workout/[sessionId] | **01-02** |
| WORKOUT-07 | /today redirects to /workout/[sessionId] when session active | **01-02** |

## Deviations from Plan

None — plan executed exactly as written. Both changes were 2-line targeted edits to active-session-banner.tsx and a full rewrite of today/page.tsx per the cleanup checklist in the plan.

## Self-Check: PASSED

- [x] app/(client)/today/page.tsx exists and contains redirect to /workout/
- [x] components/client/active-session-banner.tsx contains router.push to /workout/
- [x] Commit 6e7dc12 exists (Task 1)
- [x] Commit 8c18639 exists (Task 2)
