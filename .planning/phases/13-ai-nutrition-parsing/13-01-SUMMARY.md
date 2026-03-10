---
phase: 13-ai-nutrition-parsing
plan: 01
subsystem: api
tags: [anthropic, claude-api, server-actions, nutrition, typescript]

# Dependency graph
requires:
  - phase: 11-client-nutrition-view
    provides: nutrition module structure and free-log-actions.ts interface
provides:
  - parseNutritionAction Server Action that calls Claude API and returns typed MacroEstimate
  - MacroEstimate type exported for consumption by Plan 13-02
affects: [13-02-ai-nutrition-ui, Phase 14]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AI Server Action isolation: Claude API logic in dedicated ai-actions.ts separate from DB actions.ts"
    - "Claude response coercion: always Number() + toFixed(1) on numeric fields — Claude may return strings"
    - "Code fence stripping before JSON.parse: .replace(/^```json?\\s*/i, '').replace(/\\s*```$/, '')"
    - "no_parse signal: Claude returns {error:'no_parse'} when input is unintelligible — guard before field access"

key-files:
  created:
    - app/(client)/nutrition/ai-actions.ts
  modified: []

key-decisions:
  - "AI Server Action in separate ai-actions.ts file — keeps Claude API logic isolated from Supabase mutations in actions.ts"
  - "max_tokens: 256 — sufficient for JSON macro estimate response, avoids unnecessary token spend"
  - "Record<string, unknown> for parsed JSON — avoids any, strict TypeScript with runtime coercion"

patterns-established:
  - "AI guard order: check ANTHROPIC_API_KEY before trimming input (env check first, then input validation)"
  - "Numeric coercion: Math.round for kcal, Number(n.toFixed(1)) for protein/carbs/fat"

requirements-completed:
  - AI-01
  - AI-02

# Metrics
duration: 5min
completed: 2026-03-10
---

# Phase 13 Plan 01: AI Nutrition Parsing — Server Action Summary

**`parseNutritionAction` Server Action calling Claude Sonnet via @anthropic-ai/sdk, returning typed MacroEstimate with 4 error guards and numeric coercion**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-10T10:22:52Z
- **Completed:** 2026-03-10T10:27:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `ai-actions.ts` with `'use server'` directive — ANTHROPIC_API_KEY stays server-side only
- Exported `MacroEstimate` type with typed numeric fields consumed by Plan 13-02
- All 4 error guards implemented: missing API key, empty input, empty Claude response, no_parse signal
- Markdown code fence stripping before JSON.parse handles Claude's tendency to wrap JSON in ```json blocks
- All numeric fields coerced via Number() + toFixed(1) — Claude sometimes returns strings like "350"
- Zero TypeScript errors across full project compile

## Task Commits

Each task was committed atomically:

1. **Task 1: Create parseNutritionAction Server Action** - `c62f958` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/(client)/nutrition/ai-actions.ts` — Server Action exporting MacroEstimate type and parseNutritionAction function

## Decisions Made
- Placed Claude API logic in `ai-actions.ts` separate from `actions.ts` (Supabase mutations) — clean separation of concerns, easy to find and modify independently
- Used `Record<string, unknown>` for parsed JSON instead of `any` — strict TypeScript with runtime coercion for each field
- max_tokens: 256 — JSON macro response is ~100-150 chars; 256 covers it without waste

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
- `ANTHROPIC_API_KEY` must be set in `.env.local` (and production environment variables)
- Without this key, `parseNutritionAction` returns `{ success: false, error: 'Servicio de IA no configurado' }` gracefully

## Next Phase Readiness
- Plan 13-02 can import `MacroEstimate` and `parseNutritionAction` from `app/(client)/nutrition/ai-actions.ts`
- All error paths handled and typed — UI can safely pattern-match on `result.success`
- No blockers

## Self-Check: PASSED

- `app/(client)/nutrition/ai-actions.ts` — FOUND
- Commit `c62f958` — FOUND

---
*Phase: 13-ai-nutrition-parsing*
*Completed: 2026-03-10*
