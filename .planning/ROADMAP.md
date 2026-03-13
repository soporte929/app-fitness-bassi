# Roadmap: Fitness Bassi

## Milestones

- ✅ **v1.0 Workout Loop Completion** — Phase 1 (shipped 2026-03-09)
- ✅ **v2.0 Bassi v2** — Phases 2-3 (shipped 2026-03-09) | Phases 4-7 CANCELLED → deferred to v4.0
- ✅ **v3.0 Bassi v3 - Fixes & Polish** — Phases 4-7 (shipped 2026-03-09)
- 📋 **v4.0 Módulo Nutrición** — Phases 8-15 (planned 2026-03-09)
- 📋 **v4.1 Polish & Settings** — Phases 16-19 (planned 2026-03-10)
- 📋 **v4.2 Gap Closure** — Phases 20-23 (planned 2026-03-10)
- 🚨 **v5.0 Emergency Hotfix** — Phases 24-27 (planned 2026-03-11)
- 📋 **v5.1 Progress Fix & Performance** — Phases 28-29 (planned 2026-03-11)
- 📋 **v5.2 Trainer UX & Logic Fixes** — Phases 30-32 (planned 2026-03-11)
- 📋 **v5.3 Nutrition & Data Fixes** — Phases 33-37 (planned 2026-03-11)
- 📋 **v5.4 Trainer UX & Routine Logic (ampliado)** — Phases 38-43 (planned 2026-03-11)
- 📋 **v5.5 Bassi v1 Polish** — Phases 44-49 (planned 2026-03-13)

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
- [x] **Phase 10: Trainer Plan Meals + Assignment** — Assign finalized plans to clients with start date and saved dishes builder (completed 2026-03-09)
- [x] **Phase 10.1: Persist Plan Metadata** — Gap closure: persist diet_type, meals_count, and is_template to nutrition_plans so Phase 11 can reconstruct any plan's structure
- [ ] **Phase 11: Client Nutrition View** — Client sees daily calorie/macro progress bars, meal list with equivalents, food logging, and weekly shopping list
- [x] **Phase 12: Progress Logging** — Client registers body weight and measurements from /progress; target weight reference line on chart
- [x] **Phase 13: AI Nutrition Parsing** — Claude API food description → macro estimation with confirmation step and manual fallback (completed 2026-03-10)
- [x] **Phase 14: Trainer Completar** — Exercises library page, client history link, and dead sidebar links resolved (completed 2026-03-10)
- [x] **Phase 15: Bug Fixes & Logic Corrections** — UI/UX polish, form state persistence, chart margins, and flow logic corrections (Routine vs Plan assignment) (completed 2026-03-10)

</details>

<details open>
<summary>📋 v4.2 Gap Closure (Phases 20-23) — IN PROGRESS</summary>

- [x] **Phase 20: Integration Bug Fixes** — Fix AI food parser writing to wrong table (nutrition_logs→food_log) and Phase 19 modal not cloning meal_plan_items; remove dead code (completed 2026-03-10)
- [x] **Phase 21: Retroactive Verification — Phases 10, 10.1, 16, 17** — Create missing VERIFICATION.md for four implemented-but-unverified phases (completed 2026-03-10)
- [x] **Phase 22: Retroactive Verification — Phase 11** — Create VERIFICATION.md for Phase 11 after integration fixes from Phase 20 are in place (completed 2026-03-10)
- [ ] **Phase 23: CALC Audit + Traceability Cleanup** — Verify CALC-01-05 formulas exist, fix stale PROG checkboxes, add V41 requirements to traceability table

</details>

<details open>
<summary>📋 v4.1 Polish & Settings (Phases 16-19) — IN PROGRESS</summary>

- [x] **Phase 16: Branding & UI Corrections** — Sidebar trainer: "Fitness Bassi" en font Anton, gráficos dashboard: corregir problemas de márgenes. (completed 2026-03-10)
- [x] **Phase 17: Global Theme System** — ThemeToggle persistido y funcional (App Cliente y Trainer) usando next-themes, clases en :root y localStorage. (completed 2026-03-10)
- [x] **Phase 18: Client App Improvements** — Restaurar checklist de nutrición, foto de perfil desde galería a Supabase Storage y actualización de avatar_url. (completed 2026-03-10)
- [x] **Phase 19: Trainer Settings & Modals** — Detalle de Cliente: Cambiar botón a "Asignar plan nutricional" con Modal, Settings Hub: Nueva vista de Ajustes. (completed 2026-03-10)

</details>

<details open>
<summary>🚨 v5.0 Emergency Hotfix (Phases 24-27) — IN PROGRESS</summary>

- [x] **Phase 24: Middleware Prefix Fix** — 🔴 CRITICAL: Fix prefix collision in middleware causing /routines-templates and /nutrition-plans to redirect trainers to dashboard (BUG-01, BUG-02) (completed 2026-03-11)
- [x] **Phase 25: Active Session Banner Fix** — 🔴 CRITICAL: Fix "Entrenamiento activo" banner persisting after workout completion via event-based signal (BUG-03) (completed 2026-03-11)
- [ ] **Phase 26: Progress & Chart Fixes** — 🟡 IMPORTANT: Fix /progress metrics not showing + PhaseDistribution chart margin clipping (BUG-04, BUG-05) → **Superseded by Phase 28**
- [ ] **Phase 27: Performance Optimization** — 🟢 IMPROVEMENT: Parallelize queries, add DB indexes, reduce waterfall loading (BUG-06) → **Superseded by Phase 29**

</details>

<details open>
<summary>📋 v5.1 Progress Fix & Performance (Phases 28-29) — IN PROGRESS</summary>

- [x] **Phase 28: Progress Page Full Fix** — Deep fix of /progress: Supabase queries, RLS policies (client_measurements profile_id vs client_id), empty-array component guards, real test data verification (completed 2026-03-11)
- [x] **Phase 29: Performance Optimization** — Parallelize sequential queries with Promise.all, add unstable_cache, review missing Supabase indexes on frequently filtered columns (completed 2026-03-11)

</details>

<details open>
<summary>📋 v5.2 Trainer UX & Logic Fixes (Phases 30-32) — IN PROGRESS</summary>

- [x] **Phase 30: Business Logic** — 🔴 CRITICAL: Eliminate assigning routines to clients; enforce Routine → Plan → Client flow (completed 2026-03-11)
- [x] **Phase 31: UX & Forms** — 🟡 IMPORTANT: Remove "Plan para cliente" in routine templates, reorder form steps, update selector text (completed 2026-03-13)
- [ ] **Phase 32: Visual Fixes** — 🟢 IMPROVEMENT: Fix "Alertas activas" margin, correct Recharts tooltip contrast in dark mode

</details>

<details open>
<summary>📋 v5.3 Nutrition & Data Fixes (Phases 33-37) — NOT STARTED</summary>

- [x] **Phase 33: Supabase Schema Cache Fix** — 🔴 BUG CRÍTICO: La columna `diet_type` no existe en schema cache prod. (completed 2026-03-13)
- [ ] **Phase 34: Rediseño formulario de comida** — 🟡 FEAT: Dividir form de comida en plantilla en Bloques Datos e Ingredientes.
- [ ] **Phase 35: Datos demo reales** — 🟡 FEAT: Sustituir clientes mock por clientes demo representativos.
- [ ] **Phase 36: Ingredientes en app cliente** — 🟡 FEAT: Registro/visualización de comidas por ingredientes detallados.
- [ ] **Phase 37: Crear ejercicios** — 🟡 FEAT: Trainer puede crear ejercicios on the fly desde `/ejercicios`.

</details>

<details open>
<summary>📋 v5.4 Trainer UX & Routine Logic (ampliado) (Phases 38-43) — NOT STARTED</summary>

- [ ] **Phase 38: Lógica CRÍTICA Rutinas** — 🔴 CRÍTICO: Eliminar asignación directa; forzar flujo Rutina → Plan → Cliente.
- [x] **Phase 39: Formulario nueva rutina** — 🔴 CRÍTICO: Corregir pérdida de estado en wizard inter-pasos + bugs de modal y select.
- [ ] **Phase 40: UX formulario nueva rutina** — 🟡 UX: Limpieza UI, rename de plan, popup refactor.
- [ ] **Phase 41: Gestión de planes** — 🟡 FEAT: Quitar planes de cliente, elegir rutina de un plan activo en app.
- [ ] **Phase 42: Visual** — 🟢 VISUAL: Márgenes alertas activas, tooltip recharts de modo oscuro.
- [ ] **Phase 43: Stats y notificaciones en cliente** — 🟢 FEAT: % muscular en plan actual, resumen de rutinas, alertas.

</details>

<details open>
<summary>📋 v5.5 Bassi v1 Polish (Phases 44-49) — NOT STARTED</summary>

- [ ] **Phase 44: Modal "Añadir ejercicio" rediseño** — 🔴 CRÍTICO: Bottom sheet en móvil (max-w-[430px]), modal centrado en desktop. Sin overflow ni cortes. Cierre fiable.
- [ ] **Phase 45: Ocultar nutrición en trainer panel vista cliente** — 🔴 CRÍTICO: Eliminar toda referencia a nutrición en /clients/[id] y subrutas del trainer panel.
- [ ] **Phase 46: Lógica creación de cliente con Auth** — 🟡 IMPORTANTE: Trainer crea cliente → Supabase Auth crea el usuario → cliente recibe email automático para setear su password.
- [ ] **Phase 47: Ajustes cliente — desactivar opciones no funcionales** — 🟡 IMPORTANTE: En /profile del cliente, ocultar o desactivar todo lo que no funciona aún en v1.
- [ ] **Phase 48: Logo sidebar trainer — tipografía bold** — 🟢 VISUAL: Mejorar visualmente el logo/título del sidebar trainer con tipografía más bold/profesional.
- [ ] **Phase 49: Ajustes trainer — contenido mínimo v1** — 🟢 VISUAL: Definir e implementar qué mostrar en /settings del trainer para v1.

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
**Plans**: 3 plans
Plans:
- [ ] 10-01-PLAN.md — Nutrition Plan Assignment & Persistence
- [ ] 10-02-PLAN.md — Saved Dishes (Platos Guardados)
- [ ] 10-03-PLAN.md — Gap closure: wirear selecciones de MealSlot al action (food_id/grams reales en meal_plan_items)

### Phase 10.1: Persist Plan Metadata
**Goal**: Every saved `nutrition_plans` row contains `diet_type`, `meals_count`, and `is_template` so Phase 11 can reconstruct any plan's structure without guessing
**Depends on**: Phase 10 (nutrition_plans table and assignNutritionPlanAction must exist)
**Requirements**: TPLAN-03, TPLAN-06
**Success Criteria** (what must be TRUE):
  1. A `nutrition_plans` row saved from the trainer form has `diet_type` = 'A', 'B', or 'C' — queryable from any component without ambiguity
  2. A `nutrition_plans` row saved for diet type C has `meals_count` reflecting the trainer's selection — no data loss after save
  3. The TypeScript type for `nutrition_plans` includes `diet_type`, `meals_count`, and `is_template` — no `as unknown` casts needed
  4. The `nutrition-plans` listing page (`/nutrition-plans`) correctly filters templates vs. client-assigned plans using `is_template`
**Plans**: 1 plan
Plans:
- [x] 10.1-01-PLAN.md — SQL migration + TS types + persist diet_type/meals_count/is_template in actions

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
**Plans**: 4 plans
Plans:
- [ ] 11-01-PLAN.md — Client Dashboard Layout & Macro Progress Bars
- [ ] 11-02-PLAN.md — Client Meals List & Equivalent Swapping
- [ ] 11-03-PLAN.md — Free Food Logging & Diary
- [ ] 11-04-PLAN.md — Weekly Shopping List Generation

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
**Plans**: 2 plans
Plans:
- [ ] 13-01-PLAN.md — parseNutritionAction Server Action (Claude API integration)
- [ ] 13-02-PLAN.md — AIFoodParserModal Client Component (4-step state machine) + page.tsx integration

### Phase 14: Trainer Completar
**Goal**: The trainer has a working exercises library page, can navigate to any client's workout history, and the sidebar contains no broken navigation links
**Depends on**: Nothing (independent trainer-side completions)
**Requirements**: TRN-01, TRN-02, TRN-03
**Success Criteria** (what must be TRUE):
  1. The trainer can navigate to `/exercises` and see a list of all exercises in the database, with the ability to browse or filter by muscle group
  2. From a client's detail page, the trainer can click "Ver historial" and land on a view showing that client's completed workout sessions in chronological order
  3. All links in the trainer sidebar navigate to valid pages — no 404s or broken routes remain (links that are out of scope are removed or replaced with a clear placeholder)
**Plans**: TBD


### Phase 15: Bug Fixes & Logic Corrections
**Goal**: Resolve accumulated UI bugs, state persistence issues, and ensure business logic flow (Plans vs Routines) is strictly enforced across the application
**Depends on**: Phases 8-14 (should be done as a final polish step)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-06, BUG-07, BUG-08, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06, LOGIC-01, LOGIC-02
**Success Criteria** (what must be TRUE):
  1. BUG-01: The food search input in `/nutrition-plans` retains focus between keystrokes.
  2. BUG-02: `Adherencia por cliente` and `Progreso de peso` charts in `/dashboard` have correct margins and content is fully visible.
  3. BUG-03: Form state in `/routines-templates/new` persists when navigating between steps (days and client selections are not lost).
  4. BUG-04: The dropdown for assignment in the client detail page has correct margins and text is not cut off.
  5. BUG-06 (CRÍTICO): En producción, al crear un cliente aparece "Application error" Digest 2112945886. Ya se resolvió en v3.0 — puede haberse roto. Verificar que se usa admin (service role) y no supabase (anon) para INSERT en tabla clients.
  6. BUG-07: Solucionar que no carga `/routines` en app trainer en producción.
  7. BUG-08: Solucionar que no carga `/nutrition` en app trainer en producción.
  8. FEAT-01: Botón + de Registro Libre en la vista nutrición del cliente debe estar dentro del recuadro, no flotando fuera.
  9. FEAT-02: Poder pausar una rutina activa desde la app cliente.
  10. FEAT-03: Toggle dark/light mode en app cliente y trainer.
  11. FEAT-04: Headers fijos en app cliente (historial, rutinas, etc.) al hacer scroll.
  12. FEAT-05: Cambiar icono PWA de la app (el que aparece en el móvil al añadir a pantalla de inicio).
  13. FEAT-06: Perfil del cliente: foto de perfil y datos personales editables.
  14. LOGIC-01: El flujo correcto es Rutinas → Planes → Asignación al cliente. Nunca se asigna una rutina directamente. Revisar toda la UI y corregir cualquier flujo o botón que rompa esta lógica.
  15. LOGIC-02: Detalle del módulo Planes. Flujo completo validado: (1) Entrenador crea Rutinas. (2) Entrenador crea Planes semanales con rutinas. (3) Entrenador asigna un Plan (no rutina) al cliente con fecha inicio. (4) Cliente ve rutina del día según plan activo. (5) Sección Planes permite CRUD. (6) Botón "Asignar rutina" en detalle cliente se cambia a "Asignar plan".
**Plans**: 4 plans
Plans:
- [ ] 15-01-PLAN.md — Production bugs + chart margins + food search focus fix (BUG-01, 02, 04, 06, 07, 08)
- [ ] 15-02-PLAN.md — Business logic flow: replace AssignRoutineButton with AssignPlanButton (LOGIC-01, 02)
- [ ] 15-03-PLAN.md — UI polish: FAB inline, ThemeToggle client, PWA manifest (FEAT-01, 03, 04, 05)
- [ ] 15-04-PLAN.md — Pause timer, editable profile, verify RoutineBuilder state (BUG-03, FEAT-02, 06)


### Phase 16: Branding & UI Corrections
**Goal**: El branding del trainer está completo con el título correcto, y los gráficos del dashboard se muestran sin problemas de recortado ni *overflows*.
**Depends on**: None
**Requirements**: V41-01, V41-02
**Success Criteria** (what must be TRUE):
  1. En el sidebar del trainer (desktop y móvil), debajo de la imagen del logo aparece "FITNESS BASSI" usando la fuente Anton y el color #F5C518 o #6b7fa3.
  2. Las gráficas del dashboard (Adherencia, Progreso, etc.) tienen sus márgenes ajustados (`margin={{ top, right, bottom, left }}`) de forma que no se recortan en resoluciones estrechas.
**Plans**: 1 plan
Plans:
- [x] 16-01-PLAN.md — Branding del trainer (fuente Anton) & corrección de recortes en gráficas

### Phase 17: Global Theme System
**Goal**: Todo el sistema de interfaz soporta Dark/Light mode, persistiendo las preferencias del usuario mediante `next-themes`.
**Depends on**: None
**Requirements**: V41-03
**Success Criteria** (what must be TRUE):
  1. La app integra `ThemeProvider` de `next-themes` y usa la clase `dark` inyectada en el `<html>`.
  2. Existe un componente `ThemeToggle` funcional accesible por el cliente y por el entrenador.
  3. El modo seleccionado se persiste correctamente en localStorage sin provocar *hydration mismatches*.
  4. Ningún archivo .tsx contiene colores dark hardcodeados (#191919, #212121, #111111) — todo usa CSS vars.
**Plans**: 3 plans
Plans:
- [x] 17-01-PLAN.md — Migrar a next-themes: instalar, reemplazar ThemeProvider custom, rewire ThemeToggle (Wave 1)
- [x] 17-02-PLAN.md — Reemplazar colores hardcodeados en layouts, login y core components (Wave 2)
- [x] 17-03-PLAN.md — Reemplazar colores hardcodeados en módulos nutrición y trainer (Wave 2)

### Phase 18: Client App Improvements
**Goal**: El cliente puede subir su propia foto de perfil a Supabase Storage y el listado de nutrición diario interactivo vuelve a estar disponible.
**Depends on**: None
**Requirements**: V41-04, V41-05
**Success Criteria** (what must be TRUE):
  1. En el perfil del cliente, hay un trigger para subir foto interactuando con la cámara/galería nativa.
  2. La foto se almacena en un bucket de Supabase Storage (`avatars`) y la columna `avatar_url` en `profiles` se actualiza vía Server Action.
  3. En la vista de Nutrición de cliente (`/nutrition`), el usuario visualiza su lista de comidas del día.
  4. Cada ítem de comida funciona como un checkbox mostrando nombre, hora (si aplica), y resumen de macros (P, F, C) y gramos totales.
**Plans**: 2 plans
Plans:
- [ ] 18-01-PLAN.md — Subida de foto de perfil
- [ ] 18-02-PLAN.md — Checklist Nutricional Diario Interactivo

### Phase 19: Trainer Settings & Modals
**Goal**: El entrenador dispone de un hub central y la asignación de planes se simplifica usando un modal.
**Depends on**: None
**Requirements**: V41-06, V41-07
**Success Criteria** (what must be TRUE):
  1. En el detalle del cliente (`/clients/[id]`), el botón secundario es "Asignar plan nutricional".
  2. Al pulsar el botón, se abre un Dialog que lista plantillas de planes de nutrición y permite asignarlas eligiendo la fecha de inicio.
  3. Existe una nueva ruta de Ajustes (Settings Hub) para el entrenador con secciones para gestión de cuenta/UI.
**Plans**: 2 plans
Plans:
- [ ] 19-01-PLAN.md — Modal "Asignar plan nutricional" en detalle del cliente (V41-06)
- [ ] 19-02-PLAN.md — Settings Hub: nueva ruta /settings + entrada en sidebar (V41-07)


### Phase 20: Integration Bug Fixes
**Goal**: Los dos breaks de integración críticos están resueltos: el AI food parser escribe correctamente en food_log, y el modal de asignación de planes clona todos los meal_plan_items
**Depends on**: None (bug fixes independientes)
**Requirements**: AI-03, CNUTR-01, CNUTR-02, CNUTR-03, CNUTR-05, V41-05, V41-06
**Gap Closure**: Cierra gaps de integración detectados por audit
**Success Criteria** (what must be TRUE):
  1. Cuando el cliente usa el AI Food Parser y confirma los macros estimados, el alimento aparece en los totales diarios de calorías y macros (progress bars actualizados)
  2. Cuando el entrenador asigna un plan nutricional vía el modal "Asignar plan nutricional", el cliente ve las comidas con sus alimentos y cantidades en `/nutrition`
  3. Los archivos `NutritionFreeLogSheet.tsx`, `add-meal-fab.tsx`, `nutrition-checklist.tsx` (legacy) y las actions `createNutritionLogAction`/`deleteNutritionLogAction` están eliminados o archivados
**Plans**: 2 plans
Plans:
- [ ] 20-01-PLAN.md — Fix AI food parser: logAIFoodEntryAction (saved_dishes + food_log) + rewire AIFoodParserModal
- [ ] 20-02-PLAN.md — Clone meal_plan_items en assignNutritionTemplateToClientAction + eliminar legacy files

### Phase 21: Retroactive Verification — Phases 10, 10.1, 16, 17
**Goal**: Las cuatro fases implementadas pero no verificadas tienen VERIFICATION.md — el audit puede confirmar su estado sin bloqueos
**Depends on**: None
**Requirements**: TPLAN-03, TPLAN-06, TPLAN-07, TPLAN-08, V41-01, V41-02, V41-03
**Gap Closure**: Cierra bloqueadores de verificación detectados por audit
**Success Criteria** (what must be TRUE):
  1. `.planning/phases/10-trainer-plan-meals/VERIFICATION.md` existe y confirma TPLAN-07 y TPLAN-08
  2. `.planning/phases/10.1-persist-plan-metadata/VERIFICATION.md` existe y confirma TPLAN-03 y TPLAN-06
  3. `.planning/phases/16-branding-ui-corrections/VERIFICATION.md` existe y confirma V41-01 y V41-02
  4. `.planning/phases/17-global-theme-system/VERIFICATION.md` existe y confirma V41-03
**Plans**: TBD

### Phase 22: Retroactive Verification — Phase 11
**Goal**: Phase 11 tiene VERIFICATION.md válido que confirma CNUTR-01 a CNUTR-06, incluyendo el fix del Break 1 de integración
**Depends on**: Phase 20 (los fixes de integración deben estar aplicados antes de verificar)
**Requirements**: CNUTR-01, CNUTR-02, CNUTR-03, CNUTR-04, CNUTR-05, CNUTR-06
**Gap Closure**: Cierra bloqueador de verificación detectado por audit
**Success Criteria** (what must be TRUE):
  1. `.planning/phases/11-client-nutrition-view/VERIFICATION.md` existe y confirma CNUTR-01 a CNUTR-06
  2. La verificación incluye prueba de que el AI food parser (tras fix) contribuye a CNUTR-01 y CNUTR-02
**Plans**: TBD

### Phase 23: CALC Audit + Traceability Cleanup
**Goal**: Los requisitos CALC-01-05 están verificados contra el código real, los checkboxes stale de PROG están corregidos y todos los V41 requirements aparecen en la traceability table
**Depends on**: None
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, PROG-01, PROG-02, PROG-03
**Gap Closure**: Cierra gaps de documentación y traceabilidad detectados por audit
**Success Criteria** (what must be TRUE):
  1. `lib/calculations/nutrition.ts` contiene implementaciones verificadas de Katch-McArdle, Mifflin-St Jeor, TDEE y distribución de macros (CALC-01-05)
  2. REQUIREMENTS.md marca PROG-01, PROG-02 y PROG-03 como `[x]` (implementados por Phase 12, VERIFICATION.md ya lo confirma)
  3. REQUIREMENTS.md traceability table incluye V41-01 a V41-07 con sus fases asignadas
  4. Coverage count actualizado en REQUIREMENTS.md
**Plans**: 1 plan
Plans:
- [ ] 23-01-PLAN.md — Marcar CALC-01-05 como [x], añadir sección V41, corregir traceability V41-01/02/03


### Phase 24: Middleware Prefix Fix
**Goal**: El trainer puede navegar a /routines-templates y /nutrition-plans sin ser redirigido al dashboard
**Depends on**: None (hotfix independiente)
**Priority**: 🔴 CRITICAL — producción rota
**Bugs**: BUG-01, BUG-02
**Root Cause**: `isClientRoute` usa `pathname.startsWith("/routines")` y `pathname.startsWith("/nutrition")` que matchean también las rutas trainer `/routines-templates` y `/nutrition-plans`. Ambos booleans son `true` simultáneamente y el check `isClientRoute && role !== "client"` redirige al trainer a `/dashboard`.
**Success Criteria** (what must be TRUE):
  1. Un trainer autenticado puede navegar a `/routines-templates` y ver la página de plantillas de rutinas sin redirect
  2. Un trainer autenticado puede navegar a `/nutrition-plans` y ver la página de planes nutricionales sin redirect
  3. Un cliente autenticado puede navegar a `/routines` y `/nutrition` sin cambios de comportamiento
  4. Rutas de client `/routines/[planId]` y `/nutrition/shopping-list` siguen funcionando correctamente
**Plans**: 1 plan
Plans:
- [ ] 24-01-PLAN.md — Fix prefix collision in middleware isClientRoute checks

### Phase 25: Active Session Banner Fix
**Goal**: El banner "Entrenamiento activo" desaparece inmediatamente al finalizar un entrenamiento
**Depends on**: None (hotfix independiente)
**Priority**: 🔴 CRITICAL — UX rota
**Bug**: BUG-03
**Root Cause**: `ActiveSessionBanner` solo depende de polling cada 10s y `pathname` changes. No hay señal inmediata cuando `finishWorkout` completa la sesión. Race condition entre redirect y re-fetch.
**Success Criteria** (what must be TRUE):
  1. Al pulsar "Finalizar entrenamiento", el banner desaparece instantáneamente (< 1s)
  2. El banner sigue apareciendo correctamente cuando hay una sesión activa real
  3. El banner no reaparece después de finalizar (no regresión)
**Plans**: 1 plan
Plans:
- [ ] 25-01-PLAN.md — Custom event dispatch on finishWorkout + banner listener + immediate state clear

### Phase 26: Progress & Chart Fixes
**Goal**: /progress muestra las métricas correctamente y el gráfico de distribución por fase no recorta contenido
**Depends on**: None (hotfix independiente)
**Priority**: 🟡 IMPORTANT — funcionalidad rota
**Bugs**: BUG-04, BUG-05
**Root Cause BUG-04**: La query de `client_measurements` no maneja errores silenciosos; posible issue de RLS o datos vacíos sin feedback al usuario.
**Root Cause BUG-05**: `PhaseDistributionChart` tiene height fijo de 220px con Legend que se desborda. El wrapper `overflowX: hidden` recorta el contenido.
**Success Criteria** (what must be TRUE):
  1. En /progress, si hay datos de peso registrados, se muestran las gráficas correctamente
  2. En /progress, si hay errores de query, se muestran mensajes descriptivos (no página vacía silenciosa)
  3. El gráfico "Distribución por fase" en dashboard trainer muestra pie + leyenda completos sin recorte en todas las resoluciones
**Plans**: 1 plan
Plans:
- [ ] 26-01-PLAN.md — Error handling en progress queries + chart height/margin fix

### Phase 27: Performance Optimization
**Goal**: Reducir tiempo de carga en app trainer y cliente paralelizando queries y eliminando waterfalls
**Depends on**: Phases 24-26 (los fixes funcionales van primero)
**Priority**: 🟢 IMPROVEMENT
**Bug**: BUG-06
**Success Criteria** (what must be TRUE):
  1. Dashboard trainer paraleliza las 3 queries principales (clients, sessions, weightLogs) en un solo Promise.all
  2. Las páginas principales cargan en < 2s en producción (Vercel)
**Plans**: 1 plan
Plans:
- [ ] 27-01-PLAN.md — Parallelize queries + evaluate caching


### Phase 28: Progress Page Full Fix
**Goal**: La página /progress del cliente muestra correctamente todos los datos de peso, medidas y sesiones de entrenamiento, con manejo robusto de errores y compatible con datos reales en producción
**Depends on**: None (hotfix independiente, supersede Phase 26)
**Priority**: 🟡 IMPORTANT — funcionalidad rota en producción
**Supersedes**: v5.0 Phase 26 (BUG-04, BUG-05) — scope ampliado
**Test Client**: `client_id: 24646591-53ec-4d1a-b92a-08f00e8d365b`
**Success Criteria** (what must be TRUE):
  1. La query a `client_measurements` filtra correctamente por `client_id` (no por `profile_id`) y las RLS policies permiten al cliente autenticado leer sus propios registros
  2. Si `client_measurements` devuelve array vacío, la UI muestra un estado vacío descriptivo ("Sin registros de peso") en vez de ocultar silenciosamente las gráficas
  3. Si hay error en la query (RLS, tabla inexistente, etc.), se muestra un mensaje de error descriptivo visible al usuario
  4. Con el cliente de prueba (`24646591-53ec-4d1a-b92a-08f00e8d365b`), las gráficas de peso y medidas se renderizan correctamente con datos reales
  5. El componente `ProgressCharts` no falla ni muestra blank cuando recibe `weightLogs=[]` o `measurements=[]`
  6. El gráfico "Distribución por fase" en dashboard trainer muestra pie + leyenda completos sin recorte en todas las resoluciones
**Plans**: 2 plans
Plans:
- [ ] 28-01-PLAN.md — Error rendering visible en progress/page.tsx + PhaseDistributionChart fix
- [ ] 28-02-PLAN.md — RLS policy audit/fix en Supabase + seed datos de prueba + verificación visual

### Phase 29: Performance Optimization
**Goal**: Reducir tiempo de carga en páginas principales paralelizando queries secuenciales, añadiendo cache donde tenga sentido, y verificando índices DB en columnas frecuentemente filtradas
**Depends on**: Phase 28 (los fixes funcionales van primero)
**Priority**: 🟢 IMPROVEMENT
**Supersedes**: v5.0 Phase 27 (BUG-06) — scope ampliado
**Success Criteria** (what must be TRUE):
  1. Todas las queries secuenciales en Server Components están envueltas en `Promise.all` donde no tengan dependencia entre sí
  2. Las consultas más pesadas (dashboard trainer, today, progress) usan `unstable_cache` con revalidation tags apropiados
  3. Existen índices en Supabase para las columnas más frecuentemente filtradas: `client_measurements.client_id`, `workout_sessions.client_id`, `food_log.client_id`, `set_logs.session_id`
  4. Las páginas principales (dashboard, today, progress) cargan en < 2s en producción (Vercel)
  5. No hay regresiones funcionales tras la optimización
**Plans**: 3 plans
Plans:
- [ ] 29-01-PLAN.md — unstable_cache en dashboard trainer + revalidateTag en client actions
- [ ] 29-02-PLAN.md — unstable_cache en progress/page.tsx + revalidateTag en progress actions
- [ ] 29-03-PLAN.md — Índices DB en Supabase (4 columnas frecuentemente filtradas)

### Phase 30: Business Logic
**Goal**: Enforce strict business logic: Routine → Plan → Client. Routines are templates, not directly assignable.
**Depends on**: None
**Priority**: 🔴 CRITICAL
**Success Criteria** (what must be TRUE):
  1. All buttons/flows allowing direct assignment of a Routine to a Client are removed or redirected.
  2. All audited components and Server Actions handling assignments respect the Routine → Plan → Client loop.
**Status**: ✅ Complete
Plans:
- [x] 30-01-PLAN.md — Remove direct routine-to-client assignment flows (AssignRoutineButton, AssignTemplateModal, clonePlanToClientAction)

### Phase 31: UX & Forms
**Status**: ✅ Complete
**Goal**: Polish routine template forms and UX nomenclature to prevent confusion between global templates and client assignments.
**Depends on**: None
**Priority**: 🟡 IMPORTANT
**Success Criteria** (what must be TRUE):
  1. No "Plan para cliente" button exists in `/routines-templates/new`.
  2. Type selector text reads "Plantilla rutina" instead of "Template global".
  3. Form steps in new routine are ordered: 1. Info básica → 2. Ejercicios → 3. Días.
**Plans**: 1 plan
Plans:
- [x] 31-01-PLAN.md — Renombrar selector, eliminar botón "Plan para cliente", reordenar pasos

### Phase 32: Visual Fixes
**Goal**: Correct layout issues in trainer dashboard and chart visibility issues in dark mode.
**Depends on**: None
**Priority**: 🟢 IMPROVEMENT
**Success Criteria** (what must be TRUE):
  1. "Alertas activas" section in trainer dashboard has correct margins.
  2. All Recharts tooltips display correct contrast in dark mode by overriding `contentStyle` across the project.
**Plans**: TBD

### Phase 33: Supabase Schema Cache Fix (/nutrition-plans roto)
**Status**: ✅ Complete
**Goal**: Resolver el error `Could not find the 'diet_type' column of 'nutrition_plans' en schema cache` en el entorno de producción.
**Depends on**: None
**Priority**: 🔴 CRITICAL
**Success Criteria** (what must be TRUE):
  1. Verificar que la migración de Phase 10.1 se aplicó en el entorno de producción.
  2. Forzar reload de la caché de Supabase en producción.
  3. Carga correcta de `/nutrition-plans` y del modal "Crear plantilla" en producción.
**Plans**: 1 plan
Plans:
- [x] 33-01-PLAN.md — Verificar migración en prod, reload schema cache PostgREST, verificar /nutrition-plans

### Phase 34: Rediseño formulario de comida en plantilla nutricional
**Goal**: Separar visualmente y organizar los campos en el "Crear plantilla" para comidas.
**Depends on**: None
**Priority**: 🟡 FEAT
**Success Criteria** (what must be TRUE):
  1. El form presenta un Bloque 1 explícito para Datos generales (Título, Hora, Macros generales).
  2. El form presenta un Bloque 2 para Ingredientes (Ingrediente + Gramos por ingrediente expuestos explícitamente).
**Plans**: TBD

### Phase 35: Datos demo reales
**Goal**: Reemplazar clientes mock triviales por data realista en dashboard.
**Depends on**: None
**Priority**: 🟡 FEAT
**Success Criteria** (what must be TRUE):
  1. Los clientes mock actuales del dashboard trainer son eliminados.
  2. Se sustituyen por clientes demo listos: uno con plan activo, uno sin plan, uno con alertas activas y uno con historial real de entrenamientos.
**Plans**: TBD

### Phase 36: Lógica comida con ingredientes en app cliente
**Goal**: Migrar visualización de comida hacia un modelo detallado.
**Depends on**: Phase 34
**Priority**: 🟡 FEAT
**Success Criteria** (what must be TRUE):
  1. Al visualizar una comida desde el cliente, se expone el desglose en ingredientes y miligramos/gramos de cada uno.
  2. El registro de comida por parte del cliente permite hacerlo mediante cantidades detalladas de esos ingredientes, no solo con un subtotal de macros puro.
**Plans**: TBD

### Phase 37: Trainer Exercises - Crear Ejercicios
**Goal**: Permitir creación manual de un nuevo ejercicio orgánicamente desde panel global en `/ejercicios`.
**Depends on**: None
**Priority**: 🟡 FEAT
**Success Criteria** (what must be TRUE):
  1. Interfaz de `/ejercicios` (trainer) expone un botón "Crear ejercicio".
  2. Formulario habilita la inserción manual, y esto se refleja en el estado DB global.
**Plans**: TBD

### Phase 38: Lógica Crítica — Rutinas → Plan → Cliente
**Goal**: Limpiar ambigüedades e imponer el flujo estructural top-down (Planificación vs Ejercicio).
**Depends on**: None
**Priority**: 🔴 CRITICAL
**Success Criteria** (what must be TRUE):
  1. No existe ningún botón o componente en todo el trainer panel que ofrezca "Asignar Rutina directa" al cliente.
  2. Auditar todo componente que hace dispatch al backend relacionado con asignaciones. El flujo rígido debe ser Rutina → se asigna a Plan → se asigna Plan a Cliente.
**Plans**: 1 plan
Plans:
- [ ] 38-01-PLAN.md — Purgar mode=client de routines-templates, RoutineBuilder, types y actions

### Phase 39: Formulario nueva rutina — pérdida de datos
**Goal**: Evitar flush de inputs nativos en el formulario wizard/multi-steps de creación de rutina. Corregir modal de ejercicios y select de días.
**Depends on**: None
**Priority**: 🔴 CRITICAL
**Success Criteria** (what must be TRUE):
  1. Identificar la causa raíz en inter-mounts, persistiendo el field array y context root entre vistas.
  2. El form state sobrevive enteramente al avanzar o retroceder de info básica / ejercicios / días. Ningún drop.
  3. El modal "Añadir ejercicio" aparece centrado, muestra filtros completos, y se cierra correctamente.
  4. El select "Días por semana" mantiene su valor visible al navegar entre steps.
**Status**: ✅ Complete
**Plans**: 3 plans
Plans:
- [x] 39-01-PLAN.md — Change conditional rendering to CSS display
- [x] 39-02-PLAN.md — Fix modal "Añadir ejercicio": posición, filtros cortados, cierre
- [x] 39-03-PLAN.md — Fix Select "Días por semana" pierde valor al volver a Step 1

### Phase 40: UX Formulario Nueva Rutina
**Goal**: Limpiar overhead confuso y fallos de styling menores alrededor del template de rutinas.
**Depends on**: Phase 39
**Priority**: 🟡 UX
**Success Criteria** (what must be TRUE):
  1. El action "Plan para cliente" fue removido permanentemente en `/routines-templates`.
  2. El label viejo en dropdown de "Template global" renombrado exitosamente a "Plantilla rutina".
  3. Los pasos en wizard para creación son en orden secuencial estricto: (1) Info general, (2) Ejercicios, (3) Días.
  4. Fix absolute forms y rectificación visual correctiva de pop-up de ejercicios con alineamientos lógicos.
  5. Sumado un paso validatorio "Resumen/Confirmación" anterior a someter todo contra BD.
**Plans**: TBD

### Phase 41: Gestión de planes asignados al cliente
**Goal**: Dar control de baja del plan para que un cliente pueda tener periodos nulos o swaps.
**Depends on**: Phase 38
**Priority**: 🟡 FEAT
**Success Criteria** (what must be TRUE):
  1. Botón o trigger destructivo en tarjeta del cliente, permitiendo remover un plan que venía activo.
  2. Cliente end-user puede interactuar o conmutar rutinas a escoger expuestas por el plan semanal desde la interfaz cliente.
**Plans**: TBD

### Phase 42: Visual
**Goal**: Mejoras estéticas y erradicaciones puntuales gráficas del trainer y modo oscuro.
**Depends on**: None
**Priority**: 🟢 IMPROVEMENT
**Success Criteria** (what must be TRUE):
  1. Redondear flex boxes y gaps correctos en "Alertas activas", dashboard trainer y detalle de cliente para que no se apiñe al hacer viewport resize.
  2. Tooltip de gráficas Recharts pasa de desastroso en default a una variante que propaga bien el `contentStyle` Dark mode.
**Plans**: TBD

### Phase 43: App Cliente — Stats del plan & Notificaciones
**Goal**: Brindar resúmenes macroscópicos del effort y notificaciones que integren todo.
**Depends on**: None
**Priority**: 🟢 IMPROVEMENT
**Success Criteria** (what must be TRUE):
  1. Overview del plan a alto nivel expone desgloses porcentuales relativos al esfuerzo aportado por cada grupo muscular.
  2. Mostrar un resumen claro y tabulado de cada rutina que lo compone del plan.
  3. App cliente recibe y pinta notificaciones con listados de links a los eventos de asignaciones de plantilla con la debida verbosidad.
**Plans**: TBD

### Phase 44: Modal "Añadir ejercicio" rediseño
**Status**: ✅ Complete
**Goal**: Bottom sheet en móvil (max-w-[430px]), modal centrado en desktop. Sin overflow ni cortes. Cierre fiable.
**Depends on**: None
**Priority**: 🔴 CRÍTICO
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. En móvil (≤430px), el modal se presenta como bottom sheet sin overflow vertical ni horizontal.
  2. En desktop (>430px), el modal se presenta centrado en pantalla.
  3. Los filtros y contenido del modal no se cortan ni quedan ocultos.
  4. El botón/gesto de cierre funciona de forma fiable en ambos breakpoints.
**Plans**: 2 plans
Plans:
- [x] 44-01-PLAN.md — Breakpoint 430px, bottom sheet mobile, modal centrado desktop, cierre fiable (Escape, backdrop, X, selección)
- [x] 44-02-PLAN.md — Gap closure: Ajustar altura máxima (`max-h-[75dvh]`) en móvil para evitar corte de header en resoluciones pequeñas

### Phase 45: Ocultar nutrición en trainer panel vista cliente
**Goal**: Eliminar toda referencia a nutrición en /clients/[id] y subrutas del trainer panel.
**Depends on**: None
**Priority**: 🔴 CRÍTICO
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. En /clients/[id] no aparece ningún enlace, botón ni sección relacionada con nutrición.
  2. Las subrutas de nutrición dentro del trainer panel (vista cliente) no son accesibles ni visibles.
**Plans**: TBD

### Phase 46: Lógica creación de cliente con Auth
**Goal**: Trainer crea cliente → Supabase Auth crea el usuario → cliente recibe email automático para setear su password.
**Depends on**: None
**Priority**: 🟡 IMPORTANTE
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. Al crear un cliente desde el trainer panel, se crea un usuario en Supabase Auth.
  2. El cliente recibe automáticamente un email para establecer su contraseña.
  3. Una vez el cliente establece su password, puede hacer login en la app cliente.
**Plans**: TBD

### Phase 47: Ajustes cliente — desactivar opciones no funcionales
**Goal**: En /profile del cliente, ocultar o desactivar todo lo que no funciona aún en v1.
**Depends on**: None
**Priority**: 🟡 IMPORTANTE
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. Cualquier opción/botón en /profile que no tenga funcionalidad implementada en v1 está oculto o deshabilitado con indicador visual.
  2. No se eliminan las opciones del código, solo se ocultan/deshabilitan para poder reactivarlas en versiones futuras.
**Plans**: TBD

### Phase 48: Logo sidebar trainer — tipografía bold
**Goal**: Mejorar visualmente el logo/título del sidebar trainer con tipografía más bold/profesional.
**Depends on**: None
**Priority**: 🟢 VISUAL
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. El logo/título en el sidebar del trainer usa una tipografía más bold y profesional que la actual.
  2. El cambio es consistente en desktop y móvil.
**Plans**: TBD

### Phase 49: Ajustes trainer — contenido mínimo v1
**Goal**: Definir e implementar qué mostrar en /settings del trainer para v1.
**Depends on**: None
**Priority**: 🟢 VISUAL
**Milestone**: v5.5
**Success Criteria** (what must be TRUE):
  1. La página /settings del trainer muestra un contenido mínimo funcional para v1.
  2. Las secciones no implementadas están claramente marcadas como "próximamente" o equivalente.
**Plans**: TBD

## Progress

**v4.0 Execution Order:** 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15

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
| 10. Trainer Plan Meals + Assignment | 3/3 | Complete    | 2026-03-09 | - |
| 10.1. Persist Plan Metadata | v4.0 | 1/1 | Complete | 2026-03-09 |
| 11. Client Nutrition View | v4.0 | 0/4 | Planned | - |
| 12. Progress Logging | v4.0 | 2/2 | Complete | 2026-03-10 |
| 13. AI Nutrition Parsing | 2/2 | Complete    | 2026-03-10 | - |
| 14. Trainer Completar | 2/2 | Complete    | 2026-03-10 | - |
| 15. Bug Fixes & Logic Corrections | 4/4 | Complete   | 2026-03-10 | - |
| 16. Branding & UI Corrections | v4.1 | 1/1 | Complete | 2026-03-10 |
| 17. Global Theme System | v4.1 | 3/3 | Complete | 2026-03-10 |
| 18. Client App Improvements | 2/2 | Complete    | 2026-03-10 | - |
| 19. Trainer Settings & Modals | 2/2 | Complete    | 2026-03-10 | - |
| 20. Integration Bug Fixes | 2/2 | Complete    | 2026-03-10 | - |
| 21. Retroactive Verification (10, 10.1, 16, 17) | v4.2 | Complete    | 2026-03-10 | - |
| 22. Retroactive Verification (11) | v4.2 | 0/? | Not started | - |
| 23. CALC Audit + Traceability Cleanup | v4.2 | 0/? | Not started | - |
| 24. Middleware Prefix Fix | v5.0 | 1/1 | Complete | 2026-03-11 |
| 25. Active Session Banner Fix | 1/1 | Complete   | 2026-03-11 | - |
| 26. Progress & Chart Fixes | v5.0 | 0/1 | Superseded by P28 | - |
| 27. Performance Optimization | v5.0 | 0/1 | Superseded by P29 | - |
| 28. Progress Page Full Fix | 2/2 | Complete    | 2026-03-11 | - |
| 29. Performance Optimization | 3/3 | Complete| 2026-03-11 | - |
| 30. Business Logic | v5.2 | 1/1 | Complete | 2026-03-11 |
| 31. UX & Forms | v5.2 | 1/1 | Complete | 2026-03-13 |
| 32. Visual Fixes | v5.2 | 0/? | Not started | - |
| 33. Fix /nutrition-plans | v5.3 | 1/1 | Complete | 2026-03-13 |
| 34. Rediseño form comida | v5.3 | 0/? | Not started | - |
| 35. Datos demo reales | v5.3 | 0/? | Not started | - |
| 36. Ingredientes app cliente | v5.3 | 0/? | Not started | - |
| 37. Crear ejercicios | v5.3 | 0/? | Not started | - |
| 38. Lógica Rutinas → Plan | v5.4 | 1/1 | Complete | 2026-03-13 |
| 39. Form nueva rutina bugs | v5.4 | 3/3 | Complete | 2026-03-13 |
| 40. UX form nueva rutina | v5.4 | 0/? | Not started | - |
| 41. Gestión planes asignados | v5.4 | 0/? | Not started | - |
| 42. Visual Fixes | v5.4 | 0/? | Not started | - |
| 43. Stats & Notif. Cliente | v5.4 | 0/? | Not started | - |
| 44. Modal "Añadir ejercicio" rediseño | v5.5 | 2/2 | Complete | 2026-03-13 |
| 45. Ocultar nutrición trainer | v5.5 | 0/? | Not started | - |
| 46. Lógica creación cliente Auth | v5.5 | 0/? | Not started | - |
| 47. Ajustes cliente v1 | v5.5 | 0/? | Not started | - |
| 48. Logo sidebar tipografía | v5.5 | 0/? | Not started | - |
| 49. Ajustes trainer v1 | v5.5 | 0/? | Not started | - |
