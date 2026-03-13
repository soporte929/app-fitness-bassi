# Phase 20: Integration Bug Fixes - Research

**Researched:** 2026-03-10
**Domain:** Nutrition module integration — AI food logging, plan assignment cloning, legacy code cleanup
**Confidence:** HIGH (full source inspection — no ambiguity, all files read)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-03 | El cliente ve los macros estimados en un paso de confirmación antes de guardarlos en su diario | The confirm step in AIFoodParserModal exists but calls `createNutritionFreeLogAction` which writes to `nutrition_logs` — the wrong table. Fix: rewire `handleSave` to call `logFreeFoodAction` (food_log table). |
| CNUTR-01 | El cliente ve sus calorías diarias consumidas vs objetivo con barra de progreso | MacroProgressBars reads `consumed` from `getClientNutritionContextAction` — which already reads `food_log`. The bug is that AI logs land in `nutrition_logs`, not `food_log`, so they never show up in the progress bars. Fixing AI-03 unblocks CNUTR-01. |
| CNUTR-02 | El cliente ve barras de progreso para proteínas, grasas y carbohidratos del día | Same as CNUTR-01 — same root cause, same fix. |
| CNUTR-03 | El cliente ve la lista de comidas del día con alimentos, cantidades y macros por comida | ClientDailyMeals reads `plan.items` (meal_plan_items). The assign modal currently only clones `nutrition_plan_meals`, never `meal_plan_items`. Fix: add meal_plan_items clone step in `assignNutritionTemplateToClientAction`. |
| CNUTR-05 | El cliente puede registrar un alimento en su diario alimentario con cantidad en tiempo real | FoodSearchModal's `logFreeFoodAction` already writes to `food_log` correctly. AIFoodParserModal uses the wrong action. After fix, both entry points write to `food_log`. |
| V41-05 | Daily nutrition checklist interactive | Partially satisfied by Phase 18 (NutritionChecklist using nutrition_meal_logs). But the current page uses ClientDailyMeals (meal_plan_items-based), which requires the assign modal to clone meal_plan_items. Also: legacy files (NutritionFreeLogSheet, add-meal-fab.tsx, nutrition-checklist.tsx) need removal. |
| V41-06 | "Asignar plan nutricional" modal in client detail | Modal exists and assigns plan + clones nutrition_plan_meals. Bug: does NOT clone meal_plan_items. Client sees meal shells but no food items. Fix: clone meal_plan_items after nutrition_plan_meals. |
</phase_requirements>

---

## Summary

Phase 20 targets two integration breaks discovered during the v4.1 audit, plus dead code removal.

**Bug 1 — AI food parser writes to wrong table:** `AIFoodParserModal.tsx` calls `createNutritionFreeLogAction` from `free-log-actions.ts`, which inserts into `nutrition_logs` (the legacy table). The rest of the nutrition page (`getClientNutritionContextAction`, `MacroProgressBars`) reads exclusively from `food_log`. Result: AI-logged food never appears in the daily macro progress bars. The correct action already exists — `logFreeFoodAction` in `actions.ts` — which inserts a typed row into `food_log` with `food_id`/`dish_id`/`grams` pattern. The fix requires changing the AI modal's save path from free-text logging (via `nutrition_logs`) to a `food_id`-aware insert. Since the AI parser returns macros, not a food record, the fix must either: (a) create a `saved_dishes` or ad-hoc `foods` entry first, then call `logFreeFoodAction`, or (b) write a new `logAIFoodAction` that inserts directly into `food_log` with null `food_id`/`dish_id` but with direct macro fields — **however the `food_log` schema has NO direct macro columns; it only stores `grams` + FK to `foods` or `saved_dishes`.** This is the key architectural constraint: food_log is designed for FK-based lookups, not raw macro storage.

**Bug 2 — Plan assignment does not clone meal_plan_items:** `assignNutritionTemplateToClientAction` (in `nutrition-actions.ts`) clones `nutrition_plan_meals` rows but never clones `meal_plan_items` rows. `meal_plan_items` holds the actual food items (food_id, dish_id, grams, meal_number, option_slot) that `ClientDailyMeals` reads via `plan.items`. Result: after assignment, the client sees meal shells (from nutrition_plan_meals) but no food items inside them — `activeItems` array is always empty, so no macros display and the "Registrar comida" button is always disabled.

**Dead code removal:** Three legacy files — `NutritionFreeLogSheet.tsx`, `add-meal-fab.tsx`, `nutrition-checklist.tsx` — and two actions — `createNutritionLogAction`/`deleteNutritionLogAction` in `actions.ts` — are orphaned. None are imported by `page.tsx` or any other active file. Safe to delete.

**Primary recommendation:** Bug 1 requires a new `logAIFoodEntryAction` that creates a temporary `saved_dishes` entry (or uses an existing foods match) then logs via `food_log`. The simplest correct solution: insert the AI estimate as a row in `saved_dishes` (per-100g normalized if grams provided, else use 100g default), then call `food_log.insert` with `dish_id`. Bug 2 is a straightforward clone step addition.

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | v2.98.0 | DB reads/writes | Project standard |
| `next` | 16.1.6 | Server Actions, revalidatePath | Project standard |
| `@anthropic-ai/sdk` | installed | Claude API (already working) | Project standard |

**No new dependencies required for this phase.**

---

## Architecture Patterns

### Existing Data Flow (correct path — already works for FoodSearchModal)

```
User confirms food → logFreeFoodAction(clientId, itemId, type, grams, dateStr)
  → supabase.food_log.insert({ client_id, logged_date, meal_number: null, food_id, dish_id, grams })
  → revalidatePath('/nutrition')
  → page.tsx re-renders → getClientNutritionContextAction reads food_log
  → MacroProgressBars shows updated totals
```

### Broken Data Flow (AI modal — current state)

```
User confirms AI macros → createNutritionFreeLogAction(clientId, foodName, grams, calories, ...)
  → supabase.nutrition_logs.insert({ meal_name, kcal, protein_g, carbs_g, fat_g })  ← WRONG TABLE
  → revalidatePath('/nutrition')
  → page.tsx re-renders → getClientNutritionContextAction reads food_log only ← doesn't see it
  → MacroProgressBars unchanged ← BUG
```

### Fixed Data Flow (AI modal — target state)

```
User confirms AI macros → logAIFoodEntryAction(clientId, estimate, dateStr)
  → Insert saved_dishes row: { name: estimate.description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, trainer_id: null }
  → Insert food_log row: { client_id, logged_date: dateStr, dish_id: newDish.id, grams: 100, meal_number: null }
  → revalidatePath('/nutrition')
  → MacroProgressBars picks it up ← FIXED
```

**Why saved_dishes?** The `food_log` table has no direct macro columns — it can only reference a `food` or `dish` row for macro lookup. `saved_dishes` is the canonical table for trainer-created composite entries. An AI-estimated entry with a custom description fits as a dish.

**Alternative considered:** Write to `foods` table — not appropriate, `foods` is a shared library of ingredients (seeded, not per-user). `saved_dishes` is per-trainer but acceptable as a scratch entry for AI estimates.

### Existing Plan Assignment Flow (broken — template clone step)

```
assignNutritionTemplateToClientAction(templatePlanId, clientId, ...)
  1. Fetch template nutrition_plans row ✓
  2. Deactivate existing plans ✓
  3. Insert new nutrition_plans row → newPlanId ✓
  4. Clone nutrition_plan_meals rows (name, kcal_per_100g, etc.) ✓
  5. ← MISSING: Clone meal_plan_items rows (food_id, dish_id, grams, meal_number, option_slot)
  Result: ClientDailyMeals receives plan.items = [] → no food items shown
```

### Fixed Plan Assignment Flow (target state)

```
assignNutritionTemplateToClientAction(templatePlanId, clientId, ...)
  1–4. Same as above ✓
  5. Fetch meal_plan_items where plan_id = templatePlanId
  6. Insert cloned meal_plan_items where plan_id = newPlanId
  Result: ClientDailyMeals receives plan.items with foods → macros display correctly
```

### Recommended Project Structure (no new directories needed)

All changes are within existing files:
- `components/client/nutrition/AIFoodParserModal.tsx` — rewire `handleSave`
- `app/(client)/nutrition/actions.ts` — add `logAIFoodEntryAction` (new export)
- `app/(trainer)/clients/[id]/nutrition-actions.ts` — add meal_plan_items clone step
- DELETE: `app/(client)/nutrition/NutritionFreeLogSheet.tsx`
- DELETE: `app/(client)/nutrition/add-meal-fab.tsx`
- DELETE: `app/(client)/nutrition/nutrition-checklist.tsx`
- DELETE (or clean): `app/(client)/nutrition/free-log-actions.ts` (only used by deleted files)
- CLEAN: `app/(client)/nutrition/actions.ts` — remove `createNutritionLogAction` and `deleteNutritionLogAction` exports

### Anti-Patterns to Avoid

- **Don't add macro columns to food_log:** The schema defines `food_log` with FK references only. Adding raw macro columns would break the per-100g normalized architecture and require a Supabase migration.
- **Don't reuse `logFreeFoodAction` directly from AI modal:** That action requires an existing `food_id` or `dish_id`. The AI returns raw macros, not a DB record.
- **Don't write to `foods` table for AI estimates:** `foods` is a shared ingredient library. AI estimates are ephemeral user entries.
- **Don't delete `free-log-actions.ts` if `createNutritionFreeLogAction` is used elsewhere:** Verify no other imports exist before deletion (research confirms: only `NutritionFreeLogSheet.tsx` and `AIFoodParserModal.tsx` import it — both are targets for change).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Creating AI food record in DB | Custom food table or inline macro storage | `saved_dishes` insert + `food_log` FK | Consistent with existing per-100g normalization; food_log already supports dish_id |
| Cloning relational rows | Manual row-by-row copy with custom logic | Standard Supabase `.select()` then `.insert()` batch | Already the pattern used for `nutrition_plan_meals` clone in the same function |
| Type-safe inserts without `as any` | Type assertions | `Database['public']['Tables']['meal_plan_items']['Insert'][]` | Types are already defined in `lib/supabase/types.ts` |

---

## Common Pitfalls

### Pitfall 1: `saved_dishes` requires `trainer_id`
**What goes wrong:** `saved_dishes` may have a NOT NULL `trainer_id` FK. If the AI action is server-side with user auth, it needs the trainer's profile_id — but the client is the user, not the trainer.
**How to avoid:** Check `saved_dishes` schema in types.ts before inserting. If `trainer_id` is nullable, pass `null`. If NOT NULL, pass the client's `profile_id` (user.id from auth). The table likely accepts any profile as creator.
**Warning signs:** Supabase insert error with FK violation on `trainer_id`.

### Pitfall 2: `logAIFoodEntryAction` needs `dateStr` parameter
**What goes wrong:** `AIFoodParserModal` currently doesn't receive `dateStr`. The page passes `currentDateString` from the server component to other components. The modal will need it as a prop to log to the correct date.
**How to avoid:** Pass `dateStr` prop from `NutritionPage` to `AIFoodParserModal`. Update component signature.
**Warning signs:** All AI food entries logging to 1970-01-01 or today's UTC date instead of local date.

### Pitfall 3: `meal_plan_items` clone misses template-vs-client `plan_id`
**What goes wrong:** If the template `plan_id` and new `plan_id` are swapped in the clone query, existing client items get duplicated or wrong plan gets populated.
**How to avoid:** Explicitly use `templatePlanId` for the SELECT and `newPlanId` for the INSERT. Name variables clearly.
**Warning signs:** Client sees template items doubled, or template gets contaminated.

### Pitfall 4: Deleting `free-log-actions.ts` breaks `createNutritionFreeLogAction` import in AIFoodParserModal
**What goes wrong:** If `free-log-actions.ts` is deleted before `AIFoodParserModal.tsx` is updated, TypeScript build fails.
**How to avoid:** Update `AIFoodParserModal.tsx` first (or in the same commit). Execution order: fix AI modal → delete legacy files.
**Warning signs:** `Module not found: Can't resolve '@/app/(client)/nutrition/free-log-actions'`.

### Pitfall 5: `nutrition-checklist.tsx` uses `nutrition_meal_logs` (different table)
**What goes wrong:** `nutrition-checklist.tsx` uses `upsertMealLogAction` and `nutrition_meal_logs` — NOT `food_log`. It's a different, legacy tracking system. The current page does NOT use it (it was commented out in Phase 11 with a note to rebuild). Deleting it is safe.
**How to avoid:** Confirm `NutritionChecklist` is not imported anywhere before deletion. Research confirms: `page.tsx` imports `ClientDailyMeals` (from components/client/nutrition/), not `NutritionChecklist`.
**Warning signs:** If somehow `NutritionChecklist` is used, deletion causes build error.

---

## Code Examples

### Pattern 1: New logAIFoodEntryAction (target implementation)

```typescript
// In app/(client)/nutrition/actions.ts
// Source: inferred from existing logFreeFoodAction pattern in same file

export async function logAIFoodEntryAction(
  clientId: string,
  estimate: MacroEstimate, // from ai-actions.ts
  dateStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: ownClient } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .eq('id', clientId)
      .maybeSingle()
    if (!ownClient) return { success: false, error: 'Cliente no válido' }

    // Step 1: Create saved_dishes entry for the AI estimate
    // Per-100g normalization: estimate.kcal already represents the portion,
    // but we store as-is treating it as per-100g for simplicity.
    // Store with grams=100 in food_log so the math: kcal_per_100g * (grams/100) = kcal_per_100g * 1 = estimate value
    const { data: dish, error: dishError } = await supabase
      .from('saved_dishes')
      .insert({
        name: estimate.description,
        kcal_per_100g: estimate.kcal,
        protein_per_100g: estimate.protein_g,
        carbs_per_100g: estimate.carbs_g,
        fat_per_100g: estimate.fat_g,
        trainer_id: user.id, // client's profile_id
      })
      .select('id')
      .single()
    if (dishError || !dish) throw new Error(dishError?.message ?? 'Error creando dish')

    // Step 2: Log to food_log with grams=100 (factor=1 → macros match estimate exactly)
    const { error: logError } = await supabase.from('food_log').insert({
      client_id: ownClient.id,
      logged_date: dateStr,
      meal_number: null,
      food_id: null,
      dish_id: dish.id,
      grams: 100,
    })
    if (logError) throw logError

    revalidatePath('/nutrition')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}
```

### Pattern 2: meal_plan_items clone step (add to nutrition-actions.ts)

```typescript
// After existing nutrition_plan_meals clone block in assignNutritionTemplateToClientAction

// Clone meal_plan_items from template
const { data: templateItems } = await supabase
  .from('meal_plan_items')
  .select('meal_number, food_id, dish_id, option_slot, grams')
  .eq('plan_id', templatePlanId)

if (templateItems && templateItems.length > 0) {
  type MealPlanItemInsert = Database['public']['Tables']['meal_plan_items']['Insert']
  const itemsToInsert: MealPlanItemInsert[] = templateItems.map((item) => ({
    plan_id: newPlanId,
    meal_number: item.meal_number,
    food_id: item.food_id,
    dish_id: item.dish_id,
    option_slot: item.option_slot,
    grams: item.grams,
  }))

  const { error: itemsError } = await supabase
    .from('meal_plan_items')
    .insert(itemsToInsert)

  if (itemsError) {
    return { success: false, error: 'Error clonando items del plan: ' + itemsError.message }
  }
}
```

### Pattern 3: AIFoodParserModal handleSave rewire

```typescript
// In components/client/nutrition/AIFoodParserModal.tsx
// Change: import logAIFoodEntryAction instead of createNutritionFreeLogAction

import { logAIFoodEntryAction } from '@/app/(client)/nutrition/actions'
import type { MacroEstimate } from '@/app/(client)/nutrition/ai-actions'

// Add dateStr to props:
export function AIFoodParserModal({ clientId, dateStr }: { clientId: string; dateStr: string }) {
  // ...
  const handleSave = () => {
    startTransition(async () => {
      if (!estimate) return
      await logAIFoodEntryAction(clientId, estimate, dateStr)
      closeModal()
    })
  }
  // fallback step also needs updating for manual entry without estimate
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `nutrition_logs` table (meal_name, kcal, macros direct) | `food_log` table (FK to foods/saved_dishes, grams) | Phase 11 rebuild | AI modal was never updated to match the new table |
| `NutritionChecklist` (nutrition_meal_logs) | `ClientDailyMeals` (meal_plan_items + food_log) | Phase 11 rebuild | Legacy checklist files orphaned but not deleted |
| Manual clone of `nutrition_plan_meals` only | Should also clone `meal_plan_items` | Phase 19 added modal | Meals without items = broken client view |

**Deprecated/outdated:**
- `nutrition_logs` table: still exists in DB and types, but no active page reads from it. The AI modal accidentally writes to it.
- `NutritionFreeLogSheet.tsx` / `add-meal-fab.tsx`: replaced by `FoodSearchModal` + `AIFoodParserModal` in Phase 11/13. Never removed.
- `nutrition-checklist.tsx`: replaced by `ClientDailyMeals`. Left in place with a comment in Phase 11.
- `createNutritionLogAction` / `deleteNutritionLogAction` in `actions.ts`: write to `nutrition_logs`. Dead code — `deleteNutritionLogAction` has an empty body.

---

## Open Questions

1. **`saved_dishes.trainer_id` nullability**
   - What we know: `saved_dishes` has a `trainer_id` FK column based on type definitions
   - What's unclear: Whether `trainer_id` is nullable in the actual DB schema
   - Recommendation: Check `lib/supabase/types.ts` saved_dishes Insert type. If it accepts `string | null`, pass `null` for AI entries. If required, pass `user.id` (client's profile_id).

2. **`free-log-actions.ts` — delete or keep?**
   - What we know: Only `NutritionFreeLogSheet.tsx` and `AIFoodParserModal.tsx` import from it
   - What's unclear: Whether any planned future phase might reference it
   - Recommendation: Delete it along with `NutritionFreeLogSheet.tsx` and `add-meal-fab.tsx`. All three are legacy.

3. **Fallback step in AIFoodParserModal (no estimate, manual entry)**
   - What we know: The fallback step allows manual entry with a description string but no AI estimate — it also calls `createNutritionFreeLogAction`
   - What's unclear: How to handle this path after the rewire — there's no `estimate` object, just raw macro numbers typed by the user
   - Recommendation: For the fallback step, create a minimal `MacroEstimate`-shaped object from the manual inputs and call `logAIFoodEntryAction` with it. Or write a second action `logManualFoodEntryAction` with the same DB pattern.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` not enabled in this project.

---

## Sources

### Primary (HIGH confidence)
- Direct source inspection of all relevant files in this repo (current state, no assumptions)
  - `app/(client)/nutrition/actions.ts` — `getClientNutritionContextAction` reads `food_log`
  - `components/client/nutrition/AIFoodParserModal.tsx` — calls `createNutritionFreeLogAction` (wrong table)
  - `app/(client)/nutrition/free-log-actions.ts` — writes to `nutrition_logs`
  - `app/(trainer)/clients/[id]/nutrition-actions.ts` — `assignNutritionTemplateToClientAction` clones `nutrition_plan_meals` but not `meal_plan_items`
  - `lib/supabase/types.ts` — schema for `food_log`, `meal_plan_items`, `nutrition_logs`, `saved_dishes`
  - `components/client/nutrition/ClientDailyMeals.tsx` — reads `plan.items` (meal_plan_items)
  - `.planning/v4.1-MILESTONE-AUDIT.md` — confirms both integration gaps

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` Phase 20 description — confirms the two bugs are the intended scope

---

## Metadata

**Confidence breakdown:**
- Bug analysis: HIGH — read all relevant source files directly
- Fix patterns: HIGH — follow existing patterns in same files
- Dead code deletion: HIGH — confirmed no active imports for all three legacy files
- saved_dishes trainer_id constraint: MEDIUM — types.ts shows it exists but not null/required status fully confirmed

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable codebase — no fast-moving dependencies)
