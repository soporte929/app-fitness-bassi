---
phase: 29-performance-optimization
plan: 02
subsystem: ui
tags: [next.js, supabase, cache, unstable_cache, revalidateTag, progress]

# Dependency graph
requires:
  - phase: 28-progress-page-full-fix
    provides: Working progress page with RLS and queries fixed
provides:
  - unstable_cache wrapping measurements + sessions queries in /progress with 30s TTL and tag client-progress
  - revalidateTag('client-progress') in logClientMeasurementAction invalidating cache on new data
affects: [progress, client-measurements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - unstable_cache with createAdminClient (no cookie dependency) for data cache
    - revalidateTag second arg passes empty CacheLifeConfig {} — required by Next.js 16 type signature

key-files:
  created: []
  modified:
    - app/(client)/progress/page.tsx
    - app/(client)/progress/actions.ts

key-decisions:
  - "revalidateTag requires 2nd arg {} in Next.js 16 type signature — same pattern as Phase 29-01 (trainer-dashboard)"
  - "Auth and clients query remain uncached in ProgressPage — only heavy historical data queries are cached"

patterns-established:
  - "unstable_cache keyed per clientId with tag client-progress — invalidated by revalidateTag on mutation"

requirements-completed:
  - PERF-02
  - PERF-05

# Metrics
duration: 5min
completed: 2026-03-11
---

# Phase 29 Plan 02: unstable_cache on /progress + revalidateTag on measurement log

**Progress page queries (client_measurements + workout_sessions) wrapped in unstable_cache with 30s TTL, invalidated via revalidateTag on logClientMeasurementAction**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-11T13:30:00Z
- **Completed:** 2026-03-11T13:35:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Extracted `client_measurements` and `workout_sessions` queries into `getClientProgressData()` cached function
- Auth and `clients` query remain uncached (always fresh for security)
- `logClientMeasurementAction` now calls `revalidateTag('client-progress', {})` to immediately invalidate stale cache when client logs new data

## Task Commits

Each task was committed atomically:

1. **Task 1: Extraer queries de progress en getClientProgressData con unstable_cache** - `a0d43ed` (feat)
2. **Task 2: Añadir revalidateTag en logClientMeasurementAction** - `fd7f480` (feat)

## Files Created/Modified
- `app/(client)/progress/page.tsx` - Added `unstable_cache` + `createAdminClient` imports; extracted heavy queries into `getClientProgressData()` outside component with TTL 30s and tag `client-progress`
- `app/(client)/progress/actions.ts` - Added `revalidateTag` import; calls `revalidateTag('client-progress', {})` after `revalidatePath('/progress')`

## Decisions Made
- `revalidateTag` requires a second argument `{}` (empty CacheLifeConfig) in Next.js 16 — same pattern established in Phase 29-01. Without it, TypeScript errors with "Expected 2 arguments, but got 1".
- Auth query (`supabase.auth.getUser()`) and `clients` table query stay uncached — lightweight, and must always be fresh for correct auth/authz.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] revalidateTag called with 1 arg — Next.js 16 requires 2**
- **Found during:** Task 2 (Añadir revalidateTag en logClientMeasurementAction)
- **Issue:** `revalidateTag("client-progress")` fails TypeScript: "Expected 2 arguments, but got 1"
- **Fix:** Added empty CacheLifeConfig as second arg: `revalidateTag("client-progress", {})`
- **Files modified:** app/(client)/progress/actions.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** fd7f480 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — same type as Phase 29-01)
**Impact on plan:** Fix was necessary for compilation. No scope creep.

## Issues Encountered
None beyond the revalidateTag arity issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 29-02 complete. /progress page now caches heavy historical queries for 30s.
- Ready to continue with Phase 30 (eliminar asignación directa Rutina→Cliente).

---
*Phase: 29-performance-optimization*
*Completed: 2026-03-11*
