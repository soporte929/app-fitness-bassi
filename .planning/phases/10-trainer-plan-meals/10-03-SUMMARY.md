---
phase: 10-trainer-plan-meals
plan: "03"
subsystem: ui
tags: [react, state-lifting, supabase, nutrition, meal-plan]

# Dependency graph
requires:
  - phase: 10-02
    provides: FoodSearchSlot and MealSlot components with local-only state
provides:
  - SelectedItem exported from meal-slot.tsx
  - FoodSearchSlot with onChange prop notifying parent on every mutation
  - MealSlot with onMealChange prop propagating aggregated options to CreatePlanForm
  - CreatePlanForm collecting mealItems[][][] and passing to assignNutritionPlanAction
  - assignNutritionPlanAction inserting real food_id/dish_id/grams rows in meal_plan_items
affects:
  - phase-11-client-nutrition (reads meal_plan_items rows created here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "State lifting: FoodSearchSlot -> MealSlot -> CreatePlanForm via onChange callbacks"
    - "Functional setState with side-effect: setItems(prev => { const next = ...; onChange?.(next); return next })"
    - "Server action receives typed mealItems[][][] payload; no 'use client' import needed — local type mirrors client type"

key-files:
  created: []
  modified:
    - app/(trainer)/nutrition-plans/create/meal-slot.tsx
    - app/(trainer)/nutrition-plans/create/create-plan-form.tsx
    - app/(trainer)/nutrition-plans/actions.ts

key-decisions:
  - "MealSelectedItem defined locally in actions.ts (server file) mirroring SelectedItem from client component — cannot import 'use client' types in server actions"
  - "mealItems is optional (mealItems?) in AssignNutritionPlanInput — plans without food selections are valid"
  - "No empty rows inserted when trainer adds no food to a meal slot — only real items generate DB rows"
  - "option_slot mapping: optIdx 0 -> 'A', 1 -> 'B', 2 -> 'C' using optionLabels array with fallback 'A'"

patterns-established:
  - "Functional setState side-effect: use setX(prev => { const next = transform(prev); notify(next); return next }) to avoid stale closures in callbacks"
  - "Diet A: MealSlot passes [items] (array of one array) to onMealChange — consistent shape with Diet B"
  - "Diet B: slotItemsB[optIdx] updated by index, full next array passed to onMealChange each time"

requirements-completed:
  - TPLAN-07

# Metrics
duration: 15min
completed: 2026-03-09
---

# Phase 10 Plan 03: Wire MealSlot Selections to Server Summary

**State lifting from FoodSearchSlot through MealSlot to CreatePlanForm, then real food_id/dish_id/grams persisted in meal_plan_items via assignNutritionPlanAction**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-09T17:30:00Z
- **Completed:** 2026-03-09T17:45:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- `SelectedItem` is now a named export from `meal-slot.tsx` — importable by other modules
- `FoodSearchSlot` notifies parent on every add/updateGrams/removeItem via `onChange` prop using functional setState to avoid stale closure issues
- `MealSlot` aggregates per-option selections into `SelectedItem[][]` and propagates to `CreatePlanForm` via `onMealChange`
- `CreatePlanForm` tracks `mealItems[][][]` with useEffect reset on diet type / meals count change
- `assignNutritionPlanAction` inserts real rows in `meal_plan_items`: `food_id` or `dish_id` (never both), correct `grams`, `option_slot` for diet B

## Task Commits

1. **Task 1: Callbacks en FoodSearchSlot y MealSlot** - `cfead7e` (feat)
2. **Task 2: mealItems state en CreatePlanForm** - `a10ed1a` (feat)
3. **Task 3: INSERT real en meal_plan_items** - `99ec276` (feat)

## Files Created/Modified

- `app/(trainer)/nutrition-plans/create/meal-slot.tsx` — Export SelectedItem; FoodSearchSlot onChange prop with functional setState; MealSlot onMealChange prop + slotItemsA/slotItemsB state
- `app/(trainer)/nutrition-plans/create/create-plan-form.tsx` — Import SelectedItem; mealItems[][][] state; handleMealChange; useEffect reset; onMealChange prop to MealSlot; mealItems in action payload
- `app/(trainer)/nutrition-plans/actions.ts` — MealSelectedItem local type; mealItems optional field in AssignNutritionPlanInput; replaced placeholder INSERT with real item iteration per meal/option

## Decisions Made

- `MealSelectedItem` defined locally in `actions.ts` to avoid importing from a `'use client'` module into a server action file
- `mealItems` is optional (`?`) — existing plans created without food selections remain valid
- Empty meal slots generate zero DB rows — no placeholder/null rows polluting the table
- `option_slot` mapping uses `optionLabels[optIdx] ?? 'A'` as safety fallback

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `meal_plan_items` now contains real `food_id`/`dish_id`/`grams` data when trainer adds foods to meal slots
- Phase 11 (Client Nutrition View) can query `meal_plan_items` and find meaningful food/dish references
- Plans with no foods added still create a valid `nutrition_plans` row — Phase 11 handles empty plans gracefully

---
*Phase: 10-trainer-plan-meals*
*Completed: 2026-03-09*
