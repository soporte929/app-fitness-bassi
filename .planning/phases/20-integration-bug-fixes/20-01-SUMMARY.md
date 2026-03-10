---
phase: 20-integration-bug-fixes
plan: "01"
subsystem: nutrition-ai
tags: [bug-fix, ai, food-log, saved_dishes]
dependency_graph:
  requires: []
  provides: [logAIFoodEntryAction, AIFoodParserModal-dateStr]
  affects: [app/(client)/nutrition/page.tsx, components/client/nutrition/AIFoodParserModal.tsx, app/(client)/nutrition/actions.ts]
tech_stack:
  added: []
  patterns: [server-action-auth-verify-insert, saved_dishes-as-food-log-entry]
key_files:
  modified:
    - app/(client)/nutrition/actions.ts
    - components/client/nutrition/AIFoodParserModal.tsx
    - app/(client)/nutrition/page.tsx
decisions:
  - "logAIFoodEntryAction inserts saved_dishes with trainer_id=user.id (client's profile_id is valid FK) then food_log with grams=100 so macros match estimate exactly (factor=1)"
  - "AIFoodParserModal now accepts dateStr prop — page.tsx passes currentDateString computed server-side"
metrics:
  duration: "66s"
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_modified: 3
---

# Phase 20 Plan 01: AI Food Parser Bug Fix Summary

Fix the AI food parser writing to nutrition_logs (legacy table) instead of food_log, so client-confirmed macros appear in the day's progress bars.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Añadir logAIFoodEntryAction a actions.ts | fd2e80f | app/(client)/nutrition/actions.ts |
| 2 | Rewire AIFoodParserModal + pasar dateStr desde page.tsx | 3215580 | components/client/nutrition/AIFoodParserModal.tsx, app/(client)/nutrition/page.tsx |

## What Was Built

New Server Action `logAIFoodEntryAction(clientId, estimate, dateStr)` that:
1. Authenticates user and verifies client ownership
2. Inserts an entry into `saved_dishes` (trainer_id = user.id, macros per 100g = estimate values)
3. Inserts into `food_log` with grams=100 so the factor=1 and macros match the estimate exactly
4. Calls `revalidatePath('/nutrition')`

`AIFoodParserModal` rewired:
- Dropped import of `createNutritionFreeLogAction` (legacy nutrition_logs path)
- Added `dateStr: string` prop
- `handleSave` now builds a `MacroEstimate` object from the manual inputs and calls `logAIFoodEntryAction`
- Works for both confirm step (AI estimate present) and fallback step (manual entry)

`page.tsx` passes `dateStr={currentDateString}` to `AIFoodParserModal`.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `createNutritionFreeLogAction` no longer imported in AIFoodParserModal.tsx
- `logAIFoodEntryAction` present in modal import and handleSave call
- `dateStr={currentDateString}` present in page.tsx render
- `saved_dishes` insert present in logAIFoodEntryAction
- TypeScript: no errors in any of the three modified files

## Self-Check: PASSED
