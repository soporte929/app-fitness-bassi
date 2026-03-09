# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Workout Loop Completion

**Shipped:** 2026-03-09
**Phases:** 1 | **Plans:** 2 | **Sessions:** 1

### What Was Built

- `startWorkoutSession` server action: global collision check (no date window), pre-populates set_logs, redirects to `/workout/[sessionId]`
- Dedicated `/workout/[sessionId]` page: Server Component with auth + ownership security check, parallel data fetch, previous-session weight hints, finish flow reusing existing action
- `today/page.tsx` rewrite from 167→57 lines: server-side redirect to active session, clean empty state otherwise
- Active session banner: links to `/workout/[sessionId]`, hides on all `/workout/*` routes

### What Worked

- **Reuse over rebuild**: `finishWorkout`, `TodayExercisesProgress`, `RestTimer`, and `ExerciseCard` all pre-existed — the workout page was mostly wiring, not new logic. Zero duplication.
- **Focused scope**: Phase had exactly 2 plans with clear deliverables. No scope creep, no deviations from plan.
- **Security-first pattern**: `session.client_id !== client.id → notFound()` baked in from the start — not an afterthought.
- **Parallel data fetch**: `Promise.all([exercises, setLogs, lastSession])` pattern clean and performant.
- **UAT + Verification loop**: 10/10 verification truths, 9/9 UAT tests — caught nothing because the plan was executed precisely.

### What Was Inefficient

- **Plan checker rework (pre-execution)**: The plan checker flagged issues that required one round of plan revision before execution started. Adds overhead but improves execution quality.
- **CLI accomplishment extraction**: `gsd-tools milestone complete` returned empty accomplishments because SUMMARY.md YAML frontmatter format wasn't parseable by the CLI. Had to fill manually.

### Patterns Established

- `params` as `Promise<{ id: string }>` with `await params` — required by Next.js 16 (documented in memory)
- Global (dateless) collision check: `.eq('completed', false).maybeSingle()` — prevents duplicate sessions regardless of day/date
- `pathname.startsWith('/workout')` hide guard — covers dynamic routes like `/workout/[sessionId]` without listing every possible path
- Server-side redirect pattern: check for active session in page.tsx, `redirect()` immediately — no rendering, no flash

### Key Lessons

1. **Reuse existing actions across routes** — `finishWorkout` from `today/actions.ts` was imported directly into `/workout/[sessionId]/page.tsx`. Avoids duplication and keeps a single source of truth for mutation logic.
2. **Remove dead code immediately** — when `today/page.tsx` gained the redirect, all workout-rendering code became unreachable. Removing it in the same plan kept the file clean and reviewable.
3. **Date-scoped collision checks cause edge cases** — a "today only" check breaks when a session spans midnight. Global check (just `completed = false`) is simpler and more correct.
4. **Banner hide conditions should use `startsWith`** — single `/workout` check would miss `/workout/abc123`. Always cover dynamic sub-paths.

### Cost Observations

- Model mix: ~80% sonnet, ~20% haiku (agents)
- Sessions: 1 session (2026-03-09, ~1 hour)
- Notable: Small, focused scope (1 phase, 2 plans) executed in a single session with zero deviations

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 1 | First milestone — baseline |

### Cumulative Quality

| Milestone | Tests | UAT | Zero-New-TS-Errors |
|-----------|-------|-----|-------------------|
| v1.0 | 10/10 verified | 9/9 passed | ✓ |

### Top Lessons (Verified Across Milestones)

1. Reuse existing Server Actions across routes — avoids duplication and keeps mutation logic in one place
2. Remove dead code in the same plan that makes it unreachable — keeps files reviewable
