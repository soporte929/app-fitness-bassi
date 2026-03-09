# Phase 1: Workout Session - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the dedicated `/workout/[sessionId]` page and wire all navigation to it. This includes:
- `app/(client)/routines/[planId]/actions.ts` — missing `startWorkoutSession(dayId)` action
- `app/(client)/workout/[sessionId]/page.tsx` — the dedicated active workout page
- Updating `app/(client)/today/page.tsx` to redirect to `/workout/[sessionId]` when session is active
- Updating `components/client/active-session-banner.tsx` to link to `/workout/[sessionId]` instead of `/today`

Session logging (ExerciseCard, saveSetLog, finishWorkout) and all history pages already work. This phase completes the routing and the dedicated page wrapper.

</domain>

<decisions>
## Implementation Decisions

### Back navigation
- No back button on the workout page — active workout is a focused, full-screen experience
- Users should not be able to accidentally navigate away mid-set
- No explicit "Abandon workout" button — users can leave via bottom nav; session stays in-progress and can be resumed via the active session banner

### Session collision
- If any incomplete session exists, redirect to `/workout/[existingSessionId]` — no second session can be started
- This applies across all days: "Día A" active → clicking "Start Día B" redirects to the Día A session
- Simple rule: one active session at a time; finish it before starting a new one
- The routines page already shows "Reanudar entreno" label when `hasActiveSession` is true — build on this

### Finish workout UX
- Tap "Finish Workout" → session marked complete → immediate redirect to `/history`
- No confirmation dialog, no summary screen — simple and fast
- `finishWorkout` server action already exists in `today/actions.ts` and redirects to `/history`

### today/ behavior after refactor
- When a session is active: `today/page.tsx` redirects to `/workout/[sessionId]`
- When no session: same empty state as now — "No tienes entreno programado para hoy" + link to /routines
- No changes to the bottom nav Today tab — the active session banner already communicates an active workout

</decisions>

<specifics>
## Specific Ideas

- The workout page should look and feel identical to the current today/page.tsx — same sticky progress header (TodayExercisesProgress), same ExerciseCard layout, same Finish button. The only difference is it works for any session by ID, not just today's.
- `saveSetLog` and `finishWorkout` from `today/actions.ts` can be reused directly on the workout page — no need to duplicate or move them.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/client/today-exercises-progress.tsx` — Full workout UI: sticky progress bar (X/Y exercises, elapsed timer, %, segmented bar), ExerciseCard list, drag-to-reorder. Receives `exercises`, `sessionId`, `sessionStartedAt`, `lastSetLogs` as props. **Reuse as-is.**
- `components/client/exercise-card.tsx` — Set logging with weight/reps/RIR inputs, mark complete, dispatches `startRestTimer` custom event after set completion. **Already works, no changes needed.**
- `components/client/rest-timer.tsx` — Listens to `startRestTimer` window event, shows countdown overlay. **Reuse as-is — include in workout page layout.**
- `components/client/active-session-banner.tsx` — Shows active session progress; currently `router.push('/today')` → needs to be updated to `router.push(\`/workout/\${activeSession.id}\`)`.
- `app/(client)/today/actions.ts` — `saveSetLog` and `finishWorkout` server actions. Both are already correct — import and use directly from the workout page or re-export.
- `app/(client)/today/page.tsx` — Full Server Component to reference as a template for the workout page data-fetching pattern.

### Established Patterns
- Server Component fetches session data by ID, passes to `TodayExercisesProgress` (Client Component)
- `params: Promise<{ sessionId: string }>` — Next.js 16 async params pattern
- FK hints required: `workout_days!workout_sessions_day_id_fkey` (already used in today/page.tsx)
- Auth check: `createClient()` → `getUser()` → if !user redirect('/login')
- Security check: verify `session.client_id === client.id` before rendering (same pattern as history/[sessionId])

### Integration Points
- `routines/[planId]/page.tsx` already imports `startWorkoutSession` from `./actions` — this file must be created
- `startWorkoutSession(dayId)` flow: check for existing incomplete session → if exists, redirect to it; if not, create new session (client_id + day_id + completed=false + started_at=now) → redirect to `/workout/[newId]`
- `today/page.tsx` session detection logic (lines 49-57) is what needs to become a redirect to `/workout/[sessionId]`
- `app/(client)/layout.tsx` — need to verify RestTimer is included in layout or add it to workout page directly

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-workout-session*
*Context gathered: 2026-03-09*
