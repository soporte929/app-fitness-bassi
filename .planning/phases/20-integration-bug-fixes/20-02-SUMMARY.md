---
phase: 20-integration-bug-fixes
plan: 02
subsystem: nutrition
tags: [supabase, server-actions, meal_plan_items, nutrition-plans, dead-code-removal]

# Dependency graph
requires:
  - phase: 10-meal-assignment
    provides: assignNutritionTemplateToClientAction that clones nutrition_plan_meals
  - phase: 13-ai-nutrition-parsing
    provides: AI food parser actions and legacy free-log files
provides:
  - assignNutritionTemplateToClientAction now clones meal_plan_items (foods/dishes per meal)
  - Clean nutrition actions.ts without dead code
  - 4 legacy files removed from nutrition module
affects:
  - client nutrition page (now receives cloned items when plan is assigned)

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - app/(trainer)/clients/[id]/nutrition-actions.ts
    - app/(client)/nutrition/actions.ts
  deleted:
    - app/(client)/nutrition/free-log-actions.ts
    - app/(client)/nutrition/NutritionFreeLogSheet.tsx
    - app/(client)/nutrition/add-meal-fab.tsx
    - app/(client)/nutrition/nutrition-checklist.tsx
    - app/(client)/nutrition/tmp_actions_check.ts

key-decisions:
  - "SELECT from meal_plan_items uses templatePlanId (source), INSERT uses newPlanId (destination) — direction explicit to avoid clone confusion"
  - "Legacy files only imported each other (self-contained island) so safe to delete without disconnecting callers"

patterns-established: []

requirements-completed:
  - CNUTR-03
  - V41-05
  - V41-06

# Metrics
duration: 10min
completed: 2026-03-10
---

# Phase 20 Plan 02: Nutrition Clone Fix & Legacy Cleanup Summary

**meal_plan_items now cloned when assigning nutrition template to client, plus 5 legacy files and 2 dead server actions removed**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-10T22:00:00Z
- **Completed:** 2026-03-10T22:10:00Z
- **Tasks:** 2
- **Files modified:** 2 modified, 5 deleted

## Accomplishments
- assignNutritionTemplateToClientAction now inserts meal_plan_items for the new plan cloned from the template, so the client sees actual foods and quantities in /nutrition
- Removed 4 legacy files (NutritionFreeLogSheet, add-meal-fab, free-log-actions, nutrition-checklist) that formed a dead-code island with no external callers
- Removed CreateNutritionLogInput type, createNutritionLogAction, deleteNutritionLogAction (empty body) from actions.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Clone meal_plan_items in assignNutritionTemplateToClientAction** - `e679170` (feat)
2. **Task 2: Remove legacy files and dead code from actions.ts** - `5e7f4a7` (chore)

## Files Created/Modified
- `app/(trainer)/clients/[id]/nutrition-actions.ts` - Added meal_plan_items clone block after nutrition_plan_meals clone
- `app/(client)/nutrition/actions.ts` - Removed CreateNutritionLogInput type + createNutritionLogAction + deleteNutritionLogAction

## Decisions Made
- Used `templatePlanId` explicitly named in SELECT and `newPlanId` in map — matching the existing pattern for meals clone in the same function for consistency and clarity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CNUTR-03 resolved: client will see meal items after plan assignment
- V41-05 and V41-06 closed
- Phase 20 complete (2/2 plans done)

---
*Phase: 20-integration-bug-fixes*
*Completed: 2026-03-10*
