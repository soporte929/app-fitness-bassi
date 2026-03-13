# Codebase Concerns

**Analysis Date:** 2026-03-11

## Tech Debt

**Monolithic UI components:**
- Issue: Large, multi-responsibility components combine data shaping, state management, and rendering.
- Files: `components/trainer/routine-builder.tsx`, `components/client/progress-charts.tsx`, `app/(trainer)/nutrition-plans/create/create-plan-form.tsx`, `app/(trainer)/dashboard/page.tsx`
- Impact: Harder refactors, higher regression risk, and slower iteration on UI behavior.
- Fix approach: Split into smaller components + hooks, extract pure helpers, and add focused tests for extracted logic.

**Weak typing around data boundaries:**
- Issue: Frequent `any`/`as any` usage around Supabase responses and UI state.
- Files: `app/(client)/nutrition/actions.ts`, `app/(trainer)/clients/[id]/nutrition-actions.ts`, `app/(trainer)/clients/[id]/page.tsx`, `components/client/nutrition/FoodSearchModal.tsx`
- Impact: Runtime data shape mismatches slip past compile-time checks and are hard to refactor safely.
- Fix approach: Replace `any` with `Database`-derived types or DTOs and normalize response shapes at module boundaries.

## Known Bugs

**No explicit bug markers found:**
- Symptoms: Not detected (no TODO/FIXME/HACK/XXX markers).
- Files: `app/`, `components/`, `lib/`
- Trigger: Not detected.
- Workaround: Not applicable.

## Security Considerations

**Missing ownership check in server action:**
- Risk: `getClientNutritionContextAction` accepts `clientId` without validating the authenticated user or ownership.
- Files: `app/(client)/nutrition/actions.ts`
- Current mitigation: None in this action; relies on caller context and RLS.
- Recommendations: Enforce `auth.getUser()` and validate `clients.profile_id` or trainer ownership before querying.

**Development auth bypass risk:**
- Risk: Middleware bypasses auth when `NODE_ENV === "development"`.
- Files: `middleware.ts`
- Current mitigation: Intended for local development.
- Recommendations: Guard deployments to avoid `NODE_ENV=development` in production and document the requirement.

## Performance Bottlenecks

**Sequential inserts across multiple tables:**
- Problem: Plan creation/cloning loops issue multiple round trips, which grows with days/exercises.
- Files: `app/(trainer)/routines-templates/actions.ts`, `app/(trainer)/clients/[id]/nutrition-actions.ts`
- Cause: Per-day insert + per-day exercise insert instead of batched RPC/transaction.
- Improvement path: Use bulk insert per table or a Supabase RPC to write the full graph in one transaction.

**Unindexed wildcard search:**
- Problem: Food search uses leading-wildcard `ilike`, which forces full scans as data grows.
- Files: `app/(client)/nutrition/actions.ts`
- Cause: `%${query}%` pattern on `foods.name` / `saved_dishes.name`.
- Improvement path: Add trigram index or switch to prefix search (`${query}%`) with proper indexing.

## Fragile Areas

**Manual route protection list:**
- Files: `middleware.ts`
- Why fragile: New routes must be added manually; missing a prefix can expose pages to the wrong role.
- Safe modification: Update `isTrainerRoute` / `isClientRoute` whenever new route groups are added.
- Test coverage: No automated coverage.

**Highly stateful routine builder:**
- Files: `components/trainer/routine-builder.tsx`
- Why fragile: Dense state transitions and derived data within a single file make changes risky.
- Safe modification: Extract reducers/hooks and add unit tests for state transitions.
- Test coverage: No automated coverage.

## Scaling Limits

**Client-side aggregation for charts:**
- Current capacity: Depends on session/log volume; processing happens in the browser.
- Limit: Large histories can slow UI updates and chart rendering.
- Scaling path: Pre-aggregate on the server and paginate/stream reduced datasets.
- Files: `components/client/progress-charts.tsx`

## Dependencies at Risk

**Not detected:**
- Risk: Not detected.
- Impact: Not applicable.
- Migration plan: Not applicable.
- Files: `package.json`

## Missing Critical Features

**Not detected:**
- Problem: Not detected.
- Blocks: Not applicable.
- Files: `README.md`

## Test Coverage Gaps

**Application code lacks tests:**
- What's not tested: UI components, server actions, and data logic.
- Files: `app/`, `components/`, `lib/`
- Risk: Regressions in auth, plan creation, and nutrition logic can ship undetected.
- Priority: High.

---

*Concerns audit: 2026-03-11*
