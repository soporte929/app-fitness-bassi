---
phase: 10-trainer-plan-meals
verified: 2026-03-10T00:00:00Z
status: gaps_found
score: 1/2 must-haves verified
re_verification: false
gaps:
  - truth: "The trainer can create a saved dish by combining multiple foods with quantities, see the summed macro total, name the dish, and save it for reuse in future plans"
    status: partial
    reason: "The dish builder exists and saves macros correctly, but saved_dishes stores only the aggregated per-100g macros — not the individual ingredient breakdown. The dish is reusable as a macro-opaque blob, but the trainer cannot see or edit which foods composed it after saving. TPLAN-08 requires dishes to be reusable in future plans — this works — but the success criterion states the trainer 'combines multiple foods with quantities' implying the ingredient list should be visible. Post-save ingredient transparency is missing."
    artifacts:
      - path: "app/(trainer)/nutrition-plans/dishes/page.tsx"
        issue: "Existing dishes list shows name and per-100g macros only — no ingredient breakdown visible. The saved_dishes table has no ingredients column; ingredients are discarded after the weighted average is computed."
    missing:
      - "Either store ingredients in a separate saved_dish_ingredients table (full fidelity) or document that the design intentionally stores only the aggregated macro blob (scope decision needed)"
---

# Phase 10: Trainer Plan Meals + Assignment — Verification Report

**Phase Goal:** The trainer can finalize a plan by assigning it to a specific client with a start date, and can save reusable composite dishes to simplify future plan creation
**Verified:** 2026-03-10
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Requirements Coverage

| Requirement | Phase Traceability | Description | Status | Evidence |
|-------------|-------------------|-------------|--------|----------|
| TPLAN-07 | Phase 10 (SUMMARY: 10-03) | El entrenador puede asignar el plan a un cliente con fecha de inicio | SATISFIED | `assignNutritionPlanAction` in `nutrition-plans/actions.ts` inserts a `nutrition_plans` row with `client_id`, `active: true`, and `created_at` set to the chosen `startDate`; client selector and date input present in `CreatePlanForm` |
| TPLAN-08 | Phase 10 (ROADMAP) | El entrenador puede crear y guardar platos compuestos (`saved_dishes`) con suma de macros | PARTIAL | Dish builder exists and persists to `saved_dishes` with correct summed macros; however, the per-ingredient breakdown is not stored — only the aggregated per-100g values. Post-save ingredient visibility is absent. |

**Note on traceability discrepancy:** REQUIREMENTS.md traceability table maps TPLAN-07 and TPLAN-08 to Phase 21. The ROADMAP.md Phase 10 detail explicitly lists these as the requirements for this phase, and the 10-03-SUMMARY.md marks TPLAN-07 as completed here. Phase 21 is a retroactive verification phase. The implementation for both requirements lives in Phase 10 code.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Trainer selects client + start date, saves plan; client immediately has active nutrition plan | VERIFIED | `assignNutritionPlanAction` deactivates previous plans, inserts new plan with `client_id`, `active: true`, `created_at = startDate`, and inserts `meal_plan_items` rows. `CreatePlanForm` wires client dropdown and date input to action call. |
| 2 | Trainer combines foods with quantities, sees summed macro total, names dish, saves for reuse | PARTIAL | Form wiring, live macro calculation, name input, and `saveDishAction` insert all work. Saved dishes appear in the food search within MealSlot. Gap: ingredient list is not persisted — only the macro aggregate. After save, the dish cannot be inspected or edited ingredient-by-ingredient. |

**Score:** 1/2 truths verified

---

### Required Artifacts

| Artifact | Role | Exists | Substantive | Wired | Status |
|----------|------|--------|-------------|-------|--------|
| `app/(trainer)/nutrition-plans/create/create-plan-form.tsx` | Client selector, start date, macro form, save button | Yes | Yes (402 lines, full form) | Yes (calls `assignNutritionPlanAction`) | VERIFIED |
| `app/(trainer)/nutrition-plans/create/meal-slot.tsx` | Food/dish search per meal, Diet A/B options, onChange callbacks | Yes | Yes (322 lines) | Yes (wired to `CreatePlanForm` via `onMealChange`) | VERIFIED |
| `app/(trainer)/nutrition-plans/actions.ts` | `assignNutritionPlanAction` — inserts `nutrition_plans` + `meal_plan_items` | Yes | Yes (354 lines, real DB inserts) | Yes (called from `CreatePlanForm.handleSavePlan`) | VERIFIED |
| `app/(trainer)/nutrition-plans/dishes/create-dish-form.tsx` | Ingredient search, grams input, live macro tally, save button | Yes | Yes (269 lines, full implementation) | Yes (calls `saveDishAction`) | VERIFIED |
| `app/(trainer)/nutrition-plans/dishes/actions.ts` | `saveDishAction` — inserts into `saved_dishes` | Yes | Yes (40 lines, real insert) | Yes (called from `CreateDishForm`) | VERIFIED |
| `app/(trainer)/nutrition-plans/dishes/page.tsx` | Dishes list + form host | Yes | Yes (Server Component, real Supabase query) | Yes (renders `CreateDishForm` + dish list) | VERIFIED |
| `app/(trainer)/nutrition-plans/create/page.tsx` | Server Component loading clients, foods, dishes | Yes | Yes (real queries for all 3 entities) | Yes (passes props to `CreatePlanForm`) | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CreatePlanForm` client dropdown | `nutrition_plans.client_id` | `assignNutritionPlanAction({ clientId })` | WIRED | `clientId` state from Select → passed in action payload |
| `CreatePlanForm` date input | `nutrition_plans.created_at` | `assignNutritionPlanAction({ startDate })` stored as `created_at` | WIRED | `startDate` passed; note: no dedicated `start_date` column exists — stored as `created_at` |
| `MealSlot.onMealChange` | `meal_plan_items` rows | `mealItems[][][]` → `assignNutritionPlanAction` → `meal_plan_items.insert` | WIRED | State-lifting chain confirmed across 3 commits (cfead7e, a10ed1a, 99ec276) |
| `FoodSearchSlot.onChange` | `MealSlot.slotItems` | functional setState with `onChange?.(next)` callback | WIRED | Pattern confirmed in meal-slot.tsx lines 133-139, 144-148, 152-156 |
| `CreateDishForm` ingredients | `saved_dishes` row | `calcMacros(ingredients)` → `saveDishAction(payload)` | WIRED | Ingredients summed, per-100g stored; ingredients themselves not persisted |
| `saved_dishes` | `MealSlot` food search | `create/page.tsx` queries `saved_dishes` → `CreatePlanForm.dishes` prop → `MealSlot.dishes` | WIRED | Dishes available in food search alongside foods |
| Plan save | Client plan activation | `.update({ active: false }).eq('client_id')` before insert | WIRED | Previous plans deactivated in `assignNutritionPlanAction` lines 267-273 |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `clients/[id]/nutrition-actions.ts` | 33, 43, 46, 49, 79 | `from('nutrition_plans' as any)` — bypasses TypeScript types | Warning | Type safety suppressed; changes to nutrition_plans schema won't surface as TS errors |
| `nutrition-plans/actions.ts` | 87 | `as unknown as NutritionPlanInsertCompat` | Warning | Type cast to work around `client_id` not matching Insert type; functional but fragile |

No blocker anti-patterns. No TODO/FIXME/placeholder stubs found in implementation files.

---

### Human Verification Required

#### 1. Client plan activation end-to-end

**Test:** As trainer, fill the Create Plan form at `/nutrition-plans/create`, select a client, set a start date, choose diet type A with 3 meals, add foods to at least one meal slot, click "Guardar Plan".
**Expected:** Trainer is redirected to `/nutrition-plans`. The client can navigate to `/nutrition` and see the assigned plan with the correct calorie target. The `nutrition_plans` table in Supabase has `active: true` for the new row and `active: false` for any previous row for that client.
**Why human:** Cannot verify DB state or client view rendering without running the app.

#### 2. Saved dish appearing in meal slot search

**Test:** Create a saved dish at `/nutrition-plans/dishes`. Then go to `/nutrition-plans/create`, select diet type A, and search for the dish name in a meal slot.
**Expected:** The saved dish appears in the dropdown with a chef hat icon. Adding it registers its macros in the slot tally.
**Why human:** Requires live interaction; search filter is client-side and only triggers on input.

#### 3. Saved dish post-save ingredient transparency

**Test:** Create a dish "Pollo con Arroz" using 150g pollo + 80g arroz at `/nutrition-plans/dishes`. After saving, inspect the dish card in the "Mis platos" list.
**Expected (current behavior):** Only name and per-100g macros are shown — no ingredient list.
**Why human:** Verify whether this is an accepted limitation or a regression. The success criterion says "combining multiple foods with quantities" — whether ingredient persistence is required is a scope judgment call.

---

### Gaps Summary

**Truth 1 (TPLAN-07 — Plan Assignment)** is fully verified. The trainer can select a client from a dropdown, set a start date, configure macros, add foods to meal slots, and save. The server action creates an active `nutrition_plans` row linked to the client and inserts real `meal_plan_items` rows. Previous plans are deactivated before the new one is inserted. The full state-lifting chain (FoodSearchSlot → MealSlot → CreatePlanForm → assignNutritionPlanAction) is wired across three git commits.

**Truth 2 (TPLAN-08 — Saved Dishes)** is partially verified. The dish builder works: multi-food search, per-ingredient gram input, live macro tally, named dish, and save to `saved_dishes` all function correctly. The saved dish appears in meal slot food search for reuse in future plans — the core reusability goal is met.

The gap is that the `saved_dishes` table stores only the aggregated per-100g macro values, not the individual ingredients. After a dish is saved, neither the trainer UI nor the database retains which foods at what quantities composed it. This is a design limitation: the ingredient list is an in-memory construct that is discarded after the weighted average is computed. Whether this satisfies "save it for reuse in future plans" depends on interpretation — the dish macro blob is reusable, but the composition is lost.

This is flagged as `partial` rather than `failed` because the primary reusability goal (use the dish in a plan's meal slot) is achieved. The missing piece is post-save ingredient inspection.

---

_Verified: 2026-03-10_
_Verifier: Claude (gsd-verifier)_
