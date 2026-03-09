# Codebase Concerns

**Analysis Date:** 2026-03-09

## Tech Debt

**Type Safety Escapes (`as any` and `as unknown` casts):**
- Issue: Widespread use of type casts bypassing TypeScript's type system, reducing safety guarantees. Nutrition plans, revisions, and client data endpoints use `as any` and `as unknown` casts.
- Files:
  - `app/(trainer)/clients/[id]/nutrition-actions.ts` (5 instances: lines 33, 43, 46, 49, 61)
  - `app/(trainer)/clients/[id]/revisions/actions.ts` (2 instances: lines 17, 61)
  - `app/(trainer)/clients/page.tsx` (line 42)
  - `app/(trainer)/plans/[planId]/page.tsx` (3 instances)
  - `app/(trainer)/nutrition-plans/actions.ts` (4 instances)
  - `components/client/progress-charts.tsx` (line 269)
- Impact: Errors in nutrition plan creation, revision handling, and client data queries are not caught at compile time. Runtime failures in critical user-facing features (meal logging, client metrics, workout tracking).
- Fix approach: Generate proper TypeScript types for nutrition_plans and nutrition_plan_meals tables in `lib/supabase/types.ts`. Use explicit type annotations instead of casts. Validate response shape before casting if schema is incomplete.

**Missing Error Handling in Critical Paths:**
- Issue: Only 20 try-catch blocks across entire codebase (app + lib + components). Many Server Actions and queries lack error boundaries, especially in nutrition and workout modules.
- Files:
  - `app/(trainer)/nutrition-plans/templates-list.tsx` (line 36: bare `console.error`)
  - `app/(trainer)/nutrition-plans/trainer-templates-list.tsx` (line 51: bare `console.error`)
  - `app/(client)/nutrition/page.tsx` (lines 102, 154: console.error without user feedback)
  - Multiple Server Actions call `throw new Error()` without try-catch in callers
- Impact: Silent failures in UI. Users won't know if their nutrition plan save failed. Nutrition checklist state becomes inconsistent with database.
- Fix approach: Wrap all nutrition actions in try-catch. Return error objects from Server Actions instead of throwing. Display error toasts/alerts in UI components before state updates. Add circuit breaker pattern for repeated failures.

**Unsafe Number Parsing:**
- Issue: Multiple uses of `parseInt()`, `parseFloat()`, and `Number()` without validation. Exercise card uses `parseFloat(updatedSet.weight) || 0` which treats NaN as 0 silently.
- Files:
  - `components/client/exercise-card.tsx` (lines 95-97, 125-127, 148-150: parseFloat/parseInt with || 0 fallback)
  - `app/(trainer)/clients/[id]/revisions/actions.ts` (line 49: parseFloat without validation)
  - `app/(trainer)/clients/[id]/edit-nutrition-plan-modal.tsx` (lines 67-76: parseInt/parseFloat with || 0)
- Impact: Invalid weight/reps values silently convert to 0, breaking workout tracking accuracy. User enters "abc" for weight, system saves 0 without notification.
- Fix approach: Create robust parsing helpers that return `null` on failure and validate before use. Require explicit isNaN checks. Display validation errors to users before submission.

---

## Known Bugs

**Debug Output in Production Code:**
- Symptoms: Four DEBUG console.error and console.log statements visible in trainer clients page at lines 40, 51, 71, 148-151 of `app/(trainer)/clients/page.tsx`. These output raw query error objects and data states to console.
- Files: `app/(trainer)/clients/page.tsx` (lines 40, 51, 71, 148-151)
- Trigger: Page loads or data fetch fails
- Workaround: Open DevTools console to see actual error messages if queries fail
- Fix: Remove all DEBUG statements. Replace with proper error logging service.

**Development Bypass Always Active in Middleware:**
- Symptoms: All role-based access control is bypassed in development mode. A logged-out user can access trainer routes by setting NODE_ENV=development or running `npm run dev`.
- Files: `middleware.ts` (lines 6-8)
- Trigger: `NODE_ENV === 'development'` condition is true during local dev (always)
- Workaround: Manually check middleware.ts to verify NODE_ENV condition before testing auth
- Impact: Security misconfiguration will be missed in testing. If built with NODE_ENV=development, entire auth system is disabled.
- Fix: Remove bypass. Add explicit dev auth token or use test user fixture instead. Log warning if bypass is ever re-added.

**Nutrition Plan Schema Mismatch:**
- Symptoms: Nutrition plan table references use `as any` casts (lines 33, 43, 46, 49, 78 in `nutrition-actions.ts`), indicating schema is either incomplete in types.ts or queries don't match actual columns.
- Files: `app/(trainer)/clients/[id]/nutrition-actions.ts`
- Trigger: Creating or updating a nutrition plan
- Impact: Type checking doesn't catch column name errors. Queries silently fail or insert wrong data. Client-side nutrition tracking breaks.
- Fix: Update `lib/supabase/types.ts` with full nutrition_plans and nutrition_plan_meals schema. Remove all `as any` casts from nutrition actions.

---

## Security Considerations

**Environment Variable Access:**
- Risk: `middleware.ts` and Supabase client files access `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role key is stored in `.env.local` (not in version control, but sensitive).
- Files: `middleware.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`, `lib/supabase/server.ts`
- Current mitigation: `.env.local` is in `.gitignore`. Public keys are prefixed `NEXT_PUBLIC_` (correct pattern).
- Recommendations:
  1. Verify `.env.local` is in `.gitignore` (confirmed)
  2. Ensure SUPABASE_SERVICE_ROLE_KEY is NEVER used in browser code (verified: only in `lib/supabase/admin.ts` which is server-only)
  3. Add runtime check in admin.ts to throw if called from browser context
  4. Rotate service role key regularly after developer access changes

**Weak Input Validation in Forms:**
- Risk: Edit panel (`app/(trainer)/clients/[id]/edit-panel.tsx`), nutrition modal (`edit-nutrition-plan-modal.tsx`), and routine builder use string inputs that are parsed to numbers without sanitization.
- Files:
  - `app/(trainer)/clients/[id]/edit-panel.tsx` (lines 84-118: validation happens after parsing)
  - `app/(trainer)/nutrition-plans/create-template-modal.tsx` (lines 28-32: toOptionalNumber checks but doesn't bound)
- Current mitigation: Age validated 16-80, height 140-250cm, but no maximum on weight, calories, or macro targets
- Recommendations:
  1. Add range validation: weight 30-250kg, calories 500-5000, macros 0-500g per macro
  2. Validate before parsing, not after
  3. Show validation errors per-field in UI before submission

**Implicit Type Safety in Client Data Joins:**
- Risk: FK hints like `profile:profiles!clients_profile_id_fkey` and joins assume FK structure is correct. If schema changes, queries silently return empty/null relations without compile-time warning.
- Files: Multiple queries in `app/(trainer)/clients/page.tsx`, `app/(trainer)/clients/[id]/page.tsx`
- Current mitigation: Explicit FK hints reduce ambiguity, but no validation of FK existence
- Recommendations:
  1. Add Supabase RLS policy validation in tests
  2. Add schema snapshot test that verifies expected tables/columns exist
  3. Document all FK hints and why they're needed

---

## Performance Bottlenecks

**Large Client Component (1023 lines):**
- Problem: `components/trainer/routine-builder.tsx` is 1023 lines. Single component handles local state, form validation, UI rendering, exercise picker, and API interactions.
- Files: `components/trainer/routine-builder.tsx`
- Cause: Complex nested state management for days/exercises/sets with no separation of concerns. Multiple useState hooks managing related state.
- Improvement path:
  1. Extract exercise picker into separate component (already done: `ExercisePicker` imported)
  2. Create `DayBuilder` subcomponent to isolate day-level state
  3. Extract form state management into custom hook (`useRoutineForm`)
  4. Split validation logic into separate module
  5. Memoize expensive calculations (muscleGroup options, initial state building)

**Client List Search Without Debounce:**
- Problem: `app/(trainer)/clients/clients-list.tsx` (274 lines) filters 50+ clients on every keystroke with no debounce.
- Files: `app/(trainer)/clients/clients-list.tsx`
- Cause: Immediate `useMemo` on search query without debounce. Re-renders list for every character typed.
- Improvement path: Add 300ms debounce to search input using useEffect + setTimeout. Memoize filtered list with useMemo keyed to debounced query.

**Progress Charts with Full Session History:**
- Problem: `components/client/progress-charts.tsx` (552 lines) loads and processes potentially 100+ workout sessions client-side for charting.
- Files: `components/client/progress-charts.tsx`
- Cause: No pagination on sessions query. All historical data parsed and grouped in JavaScript for chart rendering.
- Improvement path:
  1. Limit sessions query to max 50-100 most recent sessions
  2. Add server-side aggregation for volume/weight trending
  3. Implement chart data caching (useMemo keyed to period)
  4. Lazy-load data when period changes instead of pre-computing all periods

---

## Fragile Areas

**Nutrition Plan State Synchronization:**
- Files: `app/(client)/nutrition/nutrition-checklist.tsx` + `app/(client)/nutrition/page.tsx` + `app/(trainer)/clients/[id]/edit-nutrition-plan-modal.tsx`
- Why fragile: Three separate surfaces manage nutrition plan state (trainer creates/edits, client logs meals, trainer revises). No central source of truth. Checklist maintains local `completedMap` and `gramsMap` state that must sync back via `upsertMealLogAction`.
- Safe modification: Add logging to verify upsert success before clearing local state. Add optimistic update pattern with rollback on error. Document flow in comments.
- Test coverage: No E2E tests visible for meal logging → trainer revision → client re-logging flow.

**Exercise Card Set Logging Edge Cases:**
- Files: `components/client/exercise-card.tsx` (303 lines)
- Why fragile: Complex state machine for set completion (can mark set as done, which marks all prior undone sets, can unmark which unmarksall subsequent done sets). Lines 113-158 implement this logic with Promise.all() for parallel saves and state updates. Race conditions possible if network is slow: UI state may update before saves complete.
- Safe modification: Use transitions properly (already using useTransition). Add error toast on any individual saveSetLog failure. Validate set count before allowing completion.
- Test coverage: No unit tests for set completion state transitions visible.

**Routine Builder Local ID Generation:**
- Files: `components/trainer/routine-builder.tsx` (lines 59-62: makeLocalId function)
- Why fragile: Uses `crypto.randomUUID()` with fallback to timestamp + Math.random(). Fallback may collide on fast successive calls. These IDs are used to track exercises/days during form editing but never persisted (replaced with server IDs after save).
- Safe modification: Ensure fallback is only used in truly offline environments. Add comment explaining lifecycle of local_id vs server id. Consider using incrementing counter as backup.
- Test coverage: No visible tests for ID collision or form state preservation.

**Client Details Page Query Complexity:**
- Files: `app/(trainer)/clients/[id]/page.tsx` (550 lines)
- Why fragile: Fetches 7 concurrent queries with `Promise.all()` (line 44). If any single query fails, page shows partial data without clear indication which query failed. No retry logic. Type casting with `as unknown` masks missing fields.
- Safe modification: Use `allSettled()` instead of `all()` to handle partial failures gracefully. Show error badges per query section. Add per-section loading states.
- Test coverage: No error boundary visible. No tests for partial failure scenarios.

---

## Scaling Limits

**Single Trainer with Large Client Base:**
- Current capacity: Clients list loads all active clients + 30 days of sessions in single query. With 100+ clients, this becomes expensive.
- Limit: Likely breaks at 200-300 clients with connection timeout
- Scaling path:
  1. Implement pagination on clients list (25 per page)
  2. Load sessions as lazy scroll/infinite scroll
  3. Cache adherence calculations server-side (computed column or view)
  4. Add trainer-level RLS policy ensuring queries only return own clients (already done, but no indexed columns)

**Concurrent Session Logging:**
- Current capacity: Exercise card allows simultaneous set saves via `Promise.all()`. If user rapidly clicks set completion buttons, 5+ concurrent saveSetLog calls flood server.
- Limit: Supabase RLS will rate-limit at ~100 req/sec per user
- Scaling path:
  1. Add local request queue instead of Promise.all() for set saves
  2. Batch nearby saves (e.g., wait 500ms then save all pending)
  3. Show saving indicator to discourage rapid clicking

**Real-time Updates Not Implemented:**
- Current capacity: All data is loaded once at page render. If trainer edits client phase while client is viewing workout, client sees stale data until page refresh.
- Limit: Multi-user concurrent editing is not supported
- Scaling path: Implement Supabase Realtime subscriptions on critical tables (clients, workout_sessions, nutrition_plans). Refresh UI when data changes server-side.

---

## Dependencies at Risk

**Outdated/Implicit Type Definitions:**
- Risk: `nutrition_plans` and `nutrition_plan_meals` tables require `as any` casts throughout codebase, indicating types are incomplete or missing in `lib/supabase/types.ts`.
- Impact: Adding new fields to these tables will break queries without warning. Existing code has no way to discover schema changes.
- Migration plan: Regenerate types from Supabase schema using `npx supabase gen types typescript`. Verify all nutrition tables are included and complete.

**Next.js Version 16.1.6 — Recent Major Release:**
- Risk: Still on major version 16 (released Jan 2025). May contain unfixed bugs in concurrent features, streaming, or middleware.
- Impact: Potential breaking changes in patch versions. Server Component behavior may change.
- Mitigation: Monitor Next.js releases. Test thoroughly before upgrading beyond 16.x. Pin dependencies in package.json.

**Recharts 3.7.0 — Pre-Type Safety:**
- Risk: Progress charts receive `value: number | undefined` in formatter callbacks but Recharts types don't explicitly allow `undefined` in all contexts.
- Impact: Type errors may appear in future Recharts versions if formatter signature changes.
- Mitigation: Already handled in code (lines 269+ of `progress-charts.tsx` cast set_logs as any[]). Consider upgrading when Recharts 4.x ships with stricter types.

---

## Missing Critical Features

**Error Boundaries and Fallback UI:**
- Problem: No React error boundaries visible in app. If a component crashes, entire page goes blank.
- Blocks: Production reliability. Users can't recover from component errors without page reload.
- Workaround: Manual page refresh
- Priority: High (user experience)
- Implementation: Add error.tsx boundary files to all route groups. Display fallback UI with error details and retry button.

**Loading State and Suspense Boundaries:**
- Problem: Server Components load all data before rendering. Large queries (e.g., routine builder loading all exercises) block page render until complete.
- Blocks: Progressive enhancement. Page feels slow even with fast network.
- Workaround: None (page is blocked)
- Priority: Medium (performance)
- Implementation: Add Suspense boundaries. Use React.lazy() for heavy components.

**Offline Support:**
- Problem: All data is fetched from Supabase on demand. If network drops, user loses all functionality mid-workout.
- Blocks: Users on poor network/metro can't complete workouts.
- Workaround: None visible
- Priority: Low (nice-to-have, but impacts reliability)
- Implementation: Add IndexedDB cache for session data. Sync when reconnected.

---

## Test Coverage Gaps

**Nutrition Plan CRUD Untested:**
- What's not tested: Creating, updating, and deleting nutrition plans. Meal logging and macro recalculation. Trainer revision workflow.
- Files:
  - `app/(trainer)/clients/[id]/nutrition-actions.ts`
  - `app/(trainer)/nutrition-plans/actions.ts`
  - `app/(client)/nutrition/page.tsx`
  - `app/(trainer)/clients/[id]/edit-nutrition-plan-modal.tsx`
- Risk: Silent failures in nutrition plan creation (see Tech Debt: type casts). Changes to nutrition logic break unnoticed. Trainer can't debug why plans aren't saving.
- Priority: High (critical user-facing feature)

**Workout Session Completion State Machine Untested:**
- What's not tested: Set completion edge cases (mark done, unmark, re-mark). Set data validation (empty weight). Concurrent set saves.
- Files: `components/client/exercise-card.tsx` (lines 106-164)
- Risk: Complex logic with promise chains and state updates. Easy to introduce race conditions or lose set data.
- Priority: High (data integrity)

**Routine Builder Form State Untested:**
- What's not tested: Adding/removing days and exercises. Reordering exercises. Saving partial plans. Validation error messages.
- Files: `components/trainer/routine-builder.tsx`
- Risk: Form state can become inconsistent (e.g., 3 days per week but 2 day objects). Validation may not catch all errors.
- Priority: Medium (form reliability)

**Client Details Page Query Resilience Untested:**
- What's not tested: Handling partial query failures (one of 7 queries fails). Missing relations (null plan or nutrition plan). Type casting edge cases.
- Files: `app/(trainer)/clients/[id]/page.tsx`
- Risk: Page may crash if query response doesn't match expected shape due to type casts.
- Priority: Medium (user-facing stability)

**RLS Policy Coverage Untested:**
- What's not tested: Trainer can't access other trainer's clients. Clients can't see other clients' plans. Service role bypasses work correctly.
- Files: `middleware.ts` (auth), all data queries
- Risk: Security misconfiguration undetected. Trainer accidentally leaks client data. Service role key misuse.
- Priority: Critical (security)

---

## Summary of Quick Fixes

| Issue | Files | Severity | Effort |
|-------|-------|----------|--------|
| Remove debug console statements | `clients/page.tsx` | High | < 5 min |
| Remove dev bypass from middleware | `middleware.ts` | High | 10 min |
| Add error handling to nutrition actions | `nutrition-actions.ts` | High | 2 hours |
| Complete nutrition table types | `lib/supabase/types.ts` | High | 1 hour |
| Add input validation helper | `lib/` | Medium | 30 min |
| Break up routine-builder component | `routine-builder.tsx` | Medium | 4 hours |
| Add error boundary to routes | `app/` | Medium | 2 hours |
| Add test suite for exercise card | `components/client/` | Medium | 3 hours |

---

*Concerns audit: 2026-03-09*
