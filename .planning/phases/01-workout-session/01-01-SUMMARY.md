---
phase: 01-workout-session
plan: 01
subsystem: workout
tags: [server-action, server-component, supabase, routing, workout-session]
dependency_graph:
  requires: []
  provides:
    - startWorkoutSession server action (global collision check, redirects to /workout/[id])
    - /workout/[sessionId] page (dedicated active workout session UI)
  affects:
    - app/(client)/routines/[planId]/page.tsx (uses startWorkoutSession via form action)
    - app/(client)/today/actions.ts (finishWorkout reused by workout page)
tech_stack:
  added: []
  patterns:
    - Server Component with async params (Next.js 16 Promise<params> pattern)
    - Global session collision check (no date window)
    - Security check: session.client_id !== client.id → notFound()
    - Parallel data fetch with Promise.all
    - Reuse of existing Server Actions (no duplication)
key_files:
  created:
    - app/(client)/workout/[sessionId]/page.tsx
  modified:
    - app/(client)/routines/[planId]/actions.ts
decisions:
  - "Global collision check (no date window): one active session at a time across all days"
  - "Redirect on collision to /workout/[existing.id] — not /today"
  - "No back button on workout page — focused experience per CONTEXT.md"
  - "Reuse finishWorkout from today/actions.ts — no duplication"
  - "Error fallback on session create failure goes to /routines (not /today)"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
requirements_satisfied:
  - WORKOUT-01
  - WORKOUT-02
  - WORKOUT-03
  - WORKOUT-04
  - WORKOUT-05
---

# Phase 1 Plan 01: Workout Session Entry Point Summary

**One-liner:** Global-scoped startWorkoutSession action with /workout/[sessionId] dedicated page reusing TodayExercisesProgress and finishWorkout

## What Was Built

### Task 1: Rewrite startWorkoutSession server action
**Commit:** a582fee

Rewrote `app/(client)/routines/[planId]/actions.ts` to fix all 5 broken behaviors:

1. **Signature fix:** Added `_formData?: FormData` parameter — required for `form action={boundAction}` via `.bind(null, dayId)`
2. **Collision scope fix:** Replaced today-scoped `.gte()/.lte()` date window with global `eq('completed', false)` check — finds any active session from any day, any date
3. **Collision redirect fix:** Now goes to `/workout/${existing.id}` instead of `/today`
4. **Success redirect fix:** Now goes to `/workout/${session.id}` instead of `/today`
5. **Error fallback fix:** Session create failure now redirects to `/routines` (not `/today`)

Set_logs pre-population block was preserved — ExerciseCard upserts against these rows.

### Task 2: Build /workout/[sessionId] page
**Commit:** b286974

Created `app/(client)/workout/[sessionId]/page.tsx` as a pure Server Component:

- **Auth pattern:** createClient → getUser → redirect('/login') if no user → fetch client by profile_id
- **Security:** Fetches session, verifies `session.client_id === client.id` (→ `notFound()` if mismatch)
- **Completed guard:** If `session.completed` is true → redirect('/history')
- **Data fetch:** Parallel Promise.all for exercises, set_logs, day name, last session
- **Last session hints:** Fetches set_logs from previous completed session for same day_id (weight/reps hints in ExerciseCard)
- **Component reuse:** `TodayExercisesProgress` for set logging UI, `finishWorkout` from today/actions.ts
- **Design:** CSS vars only (no raw hex), PageTransition wrapper, no back button (focused experience)

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | a582fee | feat(01-01): rewrite startWorkoutSession server action |
| 2 | b286974 | feat(01-01): build dedicated /workout/[sessionId] page |

## Deviations from Plan

None — plan executed exactly as written.

The 3 TypeScript errors present in the project (`profile/page.tsx` and `clients/[id]/page.tsx`) are pre-existing and unrelated to this plan's changes. They were present before execution began and are documented below for reference.

## Deferred Items

Pre-existing TypeScript errors (out of scope):
- `app/(client)/profile/page.tsx` lines 191-192: Property 'href' does not exist on union type
- `app/(trainer)/clients/[id]/page.tsx` line 172: 'recomposition' not assignable to Phase type

## Success Criteria Verification

- [x] routines/[planId]/page.tsx compiles without errors (startWorkoutSession exists with correct signature)
- [x] Tapping Start on a routine day creates a session and redirects to /workout/[sessionId]
- [x] If an incomplete session already exists (from any day, any date), Start redirects to that session
- [x] /workout/[sessionId] renders all exercises for the day with set logging UI (TodayExercisesProgress)
- [x] Previous session weights show as hints on each set input (lastSetLogs passed to TodayExercisesProgress)
- [x] Completing a set triggers the rest timer (RestTimer already in layout — no extra work needed)
- [x] Finish button redirects to /history and marks session complete in Supabase (finishWorkout action)
- [x] TypeScript strict mode: zero new errors (verified by full npx tsc --noEmit)

## Self-Check: PASSED

- FOUND: app/(client)/workout/[sessionId]/page.tsx
- FOUND: app/(client)/routines/[planId]/actions.ts
- FOUND: .planning/phases/01-workout-session/01-01-SUMMARY.md
- FOUND commit: a582fee (Task 1)
- FOUND commit: b286974 (Task 2)
