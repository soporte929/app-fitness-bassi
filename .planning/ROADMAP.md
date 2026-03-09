# Roadmap: Fitness Bassi

## Milestones

- ✅ **v1.0 Workout Loop Completion** — Phase 1 (shipped 2026-03-09)
- ✅ **v2.0 Bassi v2** — Phases 2-3 (shipped 2026-03-09) | Phases 4-7 CANCELLED → deferred to v4.0
- ✅ **v3.0 Bassi v3 - Fixes & Polish** — Phases 4-7 (shipped 2026-03-09)
- 📋 **v4.0 Módulo Nutrición** — Phases 8-14 (planned 2026-03-09)

## Phases

<details>
<summary>✅ v1.0 Workout Loop Completion (Phase 1) — SHIPPED 2026-03-09</summary>

- [x] **Phase 1: Workout Session** — Complete end-to-end workout session with set logging, rest timer, and collision-safe session start

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v2.0 Bassi v2 (Phases 2-3) — SHIPPED 2026-03-09</summary>

- [x] **Phase 2: Bug Fixes & Type Safety** — Eliminate the "Reanudar" duplicate bug, fully type revisions tables, fix macro calculations (completed 2026-03-09)
- [x] **Phase 3: History & Personal Records** — Workout history feed + PR detection during sessions and in history cards (completed 2026-03-09)

**Deferred to v4.0 (never executed under v2.0):**
- Phase 4 (Progress Logging) → v4.0
- Phase 5 (Revisiones & Trainer Cleanup) → v4.0
- Phase 6 (AI Nutrition Parsing) → v4.0
- Phase 7 (Trainer Exercises Page) → v4.0

</details>

<details>
<summary>✅ v3.0 Bassi v3 - Fixes & Polish (Phases 4-7) — SHIPPED 2026-03-09</summary>

**Milestone Goal:** Resolver todos los bugs de producción, polish de UI y fiabilidad en login, trainer dashboard, gestión de clientes, rutinas, planes y nutrición — además de eliminar errores de TypeScript pre-existentes.

- [x] **Phase 4: Login & Trainer UI Polish** — Visual fixes for login page and trainer dashboard sidebar/KPIs/alerts/logos (completed 2026-03-09)
- [x] **Phase 5: Client Management Fixes** — Resolve production error on client creation and fix all form bugs/legacy fields (completed 2026-03-09)
- [x] **Phase 6: Navigation & Plans** — Restore access to trainer routines, plan summaries, and client nutrition section (completed 2026-03-09)
- [x] **Phase 7: TypeScript Cleanup** — Eliminate pre-existing TS errors in profile and client detail pages (completed 2026-03-09)

**Archive:** `.planning/milestones/v3.0-SUMMARY.md`

</details>

<details open>
<summary>📋 v4.0 Módulo Nutrición (Phases 8-14) — IN PROGRESS</summary>

- [x] **Phase 8: Database Foundation + Formulas** — New nutrition tables in Supabase with full TypeScript types, seed data, and all calculation formulas (Katch-McArdle, Mifflin, TDEE, macros) (completed 2026-03-09)
- [ ] **Phase 9: Trainer Plan Creator** — Trainer form with real-time calculation preview and support for diet types A, B, and C
- [ ] **Phase 10: Trainer Plan Meals + Assignment** — Assign finalized plans to clients with start date and saved dishes builder
- [ ] **Phase 11: Client Nutrition View** — Client sees daily calorie/macro progress bars, meal list with equivalents, food logging, and weekly shopping list
- [ ] **Phase 12: Progress Logging** — Client registers body weight and measurements from /progress; target weight reference line on chart
- [ ] **Phase 13: AI Nutrition Parsing** — Claude API food description → macro estimation with confirmation step and manual fallback
- [ ] **Phase 14: Trainer Completar** — Exercises library page, client history link, and dead sidebar links resolved

</details>


## Phase Details

### Phase 8: Database Foundation + Formulas
**Goal**: The nutrition calculation engine and all required database tables exist and are typed — all subsequent phases can build on this foundation without workarounds
**Depends on**: Nothing (first phase of v4.0)
**Requirements**: INFRA-01, INFRA-02, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05
**Success Criteria** (what must be TRUE):
  1. A developer can import `foods`, `food_equivalences`, `saved_dishes`, `meal_plan_items`, `food_log`, and `client_measurements` from `lib/supabase/types.ts` and get full TypeScript type safety with no `as any` workarounds
  2. The `foods` table contains the 13 seed foods (pollo, huevos, atún, ternera, salmón, arroz, pasta, patata, avena, pan, aceite oliva, aguacate, frutos secos) queryable from any component
  3. Calling `calculateTMB({ weight, fatPercent })` returns the Katch-McArdle result; calling it without `fatPercent` returns the Mifflin-St Jeor result
  4. Calling `calculateTDEE(tmb, activityLevel)` returns the correct TDEE for all five activity multipliers (1.2 / 1.375 / 1.55 / 1.725 / 1.9)
  5. Calling `calculateMacros({ weight, phase, targetCalories })` returns protein, fat, and carb grams matching the per-phase formula (déficit 2.2g/kg protein, etc.)
**Plans**: 3 plans
Plans:
- [ ] 08-01-PLAN.md — SQL migration (6 tablas) + TypeScript types en lib/supabase/types.ts
- [ ] 08-02-PLAN.md — Formulas de calculo nutricional (Katch-McArdle, Mifflin, TDEE, macros)
- [ ] 08-03-PLAN.md — Seed script para 13 alimentos base en tabla foods

### Phase 9: Trainer Plan Creator
**Goal**: The trainer can fill a nutrition plan form and instantly see the full calorie and macro breakdown update in real time, then select the diet type that determines how the client will interact with the plan
**Depends on**: Phase 8 (formulas and types must exist)
**Requirements**: TPLAN-01, TPLAN-02, TPLAN-03, TPLAN-04, TPLAN-05, TPLAN-06
**Success Criteria** (what must be TRUE):
  1. The trainer sees a form with fields for weight, height, age, sex, body fat percentage (optional), activity level, and goal — all fields are accessible and labeled
  2. As the trainer fills in or changes any field, the TMB, TDEE, target calories, and macro grams update instantly on screen without a page reload
  3. The trainer can select one of three diet types: A (Estructurada), B (Opciones A/B/C), or C (Flexible)
  4. When diet type A is selected and meals count is chosen (3, 4, or 5), the trainer sees auto-generated meal slots with macro targets distributed across each meal
  5. When diet type B is selected, each meal slot shows fields for 2-3 alternative food options per meal
  6. When diet type C is selected, the form shows only the daily macro targets with no meal breakdown
**Plans**: TBD

### Phase 10: Trainer Plan Meals + Assignment
**Goal**: The trainer can finalize a plan by assigning it to a specific client with a start date, and can save reusable composite dishes to simplify future plan creation
**Depends on**: Phase 9 (plan form must exist)
**Requirements**: TPLAN-07, TPLAN-08
**Success Criteria** (what must be TRUE):
  1. The trainer can select a client from a list and set a start date, then save the nutrition plan — the client immediately has an active nutrition plan associated to their account
  2. The trainer can create a saved dish by combining multiple foods with quantities, see the summed macro total, name the dish, and save it for reuse in future plans
**Plans**: 2 plans
Plans:
- [ ] 10-01-PLAN.md — Nutrition Plan Assignment & Persistence
- [ ] 10-02-PLAN.md — Saved Dishes (Platos Guardados)

### Phase 11: Client Nutrition View
**Goal**: The client has a complete daily nutrition dashboard where they can track their macros, see their planned meals, swap equivalents, log food, and get a weekly shopping list
**Depends on**: Phase 10 (client must have an assigned plan)
**Requirements**: CNUTR-01, CNUTR-02, CNUTR-03, CNUTR-04, CNUTR-05, CNUTR-06
**Success Criteria** (what must be TRUE):
  1. The client sees a progress bar showing calories consumed vs. daily target, with a number and percentage visible
  2. The client sees three separate progress bars for protein, fat, and carbohydrate grams consumed vs. target for the current day
  3. The client sees each planned meal for the day with the food name, quantity, and macro breakdown listed per meal
  4. For plans with type B, the client can tap an "Equivalente" button on any food and select an alternative — the macro bars update to reflect the swap
  5. The client can open a food logging flow, enter a food and quantity, and see the macros added to the day's totals in real time
  6. The client can navigate to a shopping list view that shows all foods needed for the current week derived automatically from their plan
**Plans**: TBD

### Phase 12: Progress Logging
**Goal**: The client can record their current body weight and measurements directly from the progress page, and see their target weight as a reference on the chart
**Depends on**: Phase 8 (client_measurements table must exist)
**Requirements**: PROG-01, PROG-02, PROG-03
**Success Criteria** (what must be TRUE):
  1. The client can tap a "Registrar peso" action on the /progress page, enter their current weight, and see the new data point appear on the weight chart
  2. The weight chart on /progress shows a horizontal reference line at the client's target weight so they can visually track distance to goal
  3. The client can open a measurements form on /progress, enter values for cintura, cadera, pecho, brazo, and muslo, and the measurements are saved and reflected in the progress view
**Plans**: TBD

### Phase 13: AI Nutrition Parsing
**Goal**: The client can describe any food in plain language and receive an estimated macro breakdown from Claude API, then confirm or manually correct before logging
**Depends on**: Phase 11 (food log infrastructure must exist), Phase 8 (formulas context)
**Requirements**: AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):
  1. The client can open a modal and type a free-form food description (e.g. "un plato de lentejas con chorizo") and submit it
  2. The app sends the description server-side to Claude API and returns estimated protein, fat, carb, and calorie values — the client sees the result without leaving the page
  3. The client sees the estimated macros in a confirmation step before the food is logged — they can accept or go back to edit the description
  4. If Claude cannot parse the description or returns an error, the client sees a fallback form where they can manually enter the macro values and proceed to log
**Plans**: TBD

### Phase 14: Trainer Completar
**Goal**: The trainer has a working exercises library page, can navigate to any client's workout history, and the sidebar contains no broken navigation links
**Depends on**: Nothing (independent trainer-side completions)
**Requirements**: TRN-01, TRN-02, TRN-03
**Success Criteria** (what must be TRUE):
  1. The trainer can navigate to `/exercises` and see a list of all exercises in the database, with the ability to browse or filter by muscle group
  2. From a client's detail page, the trainer can click "Ver historial" and land on a view showing that client's completed workout sessions in chronological order
  3. All links in the trainer sidebar navigate to valid pages — no 404s or broken routes remain (links that are out of scope are removed or replaced with a clear placeholder)
**Plans**: TBD


## Progress

**v4.0 Execution Order:** 8 → 9 → 10 → 11 → 12 → 13 → 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Workout Session | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Bug Fixes & Type Safety | v2.0 | 2/2 | Complete | 2026-03-09 |
| 3. History & Personal Records | v2.0 | 2/2 | Complete | 2026-03-09 |
| 4. Login & Trainer UI Polish | v3.0 | 3/3 | Complete | 2026-03-09 |
| 5. Client Management Fixes | v3.0 | 3/3 | Complete | 2026-03-09 |
| 6. Navigation & Plans | v3.0 | 3/3 | Complete | 2026-03-09 |
| 7. TypeScript Cleanup | v3.0 | 1/1 | Complete | 2026-03-09 |
| 8. Database Foundation + Formulas | 3/3 | Complete   | 2026-03-09 | - |
| 9. Trainer Plan Creator | v4.0 | 0/? | Not started | - |
| 10. Trainer Plan Meals + Assignment | 1/2 | In Progress|  | - |
| 11. Client Nutrition View | v4.0 | 0/? | Not started | - |
| 12. Progress Logging | v4.0 | 0/? | Not started | - |
| 13. AI Nutrition Parsing | v4.0 | 0/? | Not started | - |
| 14. Trainer Completar | v4.0 | 0/? | Not started | - |
