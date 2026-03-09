# Roadmap: Fitness Bassi

## Milestones

- ✅ **v1.0 Workout Loop Completion** — Phase 1 (shipped 2026-03-09)
- ✅ **v2.0 Bassi v2** — Phases 2-3 (shipped 2026-03-09) | Phases 4-7 CANCELLED → deferred to v4.0
- 🚧 **v3.0 Bassi v3 - Fixes & Polish** — Phases 4-7 (in progress)
- 📋 **v4.0** — Progress logging, revisiones, AI nutrition, trainer completar (planned)

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

### 🚧 v3.0 Bassi v3 - Fixes & Polish (In Progress)

**Milestone Goal:** Resolver todos los bugs de producción, polish de UI y fiabilidad en login, trainer dashboard, gestión de clientes, rutinas, planes y nutrición — además de eliminar errores de TypeScript pre-existentes.

- [x] **Phase 4: Login & Trainer UI Polish** — Visual fixes for login page and trainer dashboard sidebar/KPIs/alerts/logos (completed 2026-03-09)
- [ ] **Phase 5: Client Management Fixes** — Resolve production error on client creation and fix all form bugs/legacy fields
- [ ] **Phase 6: Navigation & Plans** — Restore access to trainer routines, plan summaries, and client nutrition section
- [ ] **Phase 7: TypeScript Cleanup** — Eliminate pre-existing TS errors in profile and client detail pages

## Phase Details

### Phase 2: Bug Fixes & Type Safety
**Goal**: The app has no known regressions — the "Reanudar entreno" flow routes correctly, revisions tables are fully typed, and clients without a nutrition plan see accurate macro targets
**Depends on**: Phase 1 (v1.0 complete)
**Requirements**: BUG-01, BUG-02, BUG-03
**Success Criteria** (what must be TRUE):
  1. Tapping "Reanudar entreno" on a routine with an active session opens the existing session instead of creating a duplicate
  2. All code that previously used `supabase as any` for revisions tables compiles with strict TypeScript types
  3. A client with no assigned nutrition plan sees their calculated macro targets (not zeros or placeholder values) on the nutrition page
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Add revisions table types to lib/supabase/types.ts and remove all `supabase as any` casts (BUG-02)
- [x] 02-02-PLAN.md — Fix global session check for "Reanudar entreno" and always-show calculated macro targets (BUG-01, BUG-03)

### Phase 3: History & Personal Records
**Goal**: Clients can review their entire workout history and see when they hit personal records, both live during a session and as badges on past history cards
**Depends on**: Phase 2
**Requirements**: HIST-01, HIST-02, PR-01, PR-02
**Success Criteria** (what must be TRUE):
  1. Client visits `/history` and sees a chronological list of all their completed workout sessions
  2. Client taps a history card and sees the full session detail — day name, duration, total volume, and all sets per exercise
  3. During an active workout, a PR badge appears next to a set when the logged weight×reps beats the client's all-time best for that exercise
  4. History feed cards visually indicate which sessions contained at least one personal record
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Build /history feed with session cards and PR badges (HIST-01, HIST-02, PR-02)
- [x] 03-02-PLAN.md — Add real-time PR detection during active workout session (PR-01)

### Phase 4: Login & Trainer UI Polish
**Goal**: The login page and trainer interface have no visual defects — correct logo, static glow, proper margins, working dark/light toggle, and no demo button
**Depends on**: Phase 3
**Requirements**: LOGIN-01, LOGIN-02, LOGIN-03, TRNUI-01, TRNUI-02, TRNUI-03, TRNUI-04, TRNUI-05
**Success Criteria** (what must be TRUE):
  1. The login page logo displays a static yellow glow (no looping animation), with correct spacing between the logo and the "tu entrenador de bolsillo" subtitle, and the "Entrar como entrenador" demo button is absent
  2. The trainer sidebar loads the `/2.png` logo correctly on every trainer page without a broken image
  3. The dark/light mode toggle on the trainer dashboard responds to user clicks and visibly switches the interface theme
  4. The trainer dashboard KPI cards and alert banners have correct margins and are not clipped or overlapping
  5. The top bar icon on trainer pages displays the correct icon
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Remove float loop from login logo and fix sidebar logo path (LOGIN-01, TRNUI-01)
- [ ] 04-02-PLAN.md — Fix ThemeProvider initialization sync on mount (TRNUI-02)
- [ ] 04-03-PLAN.md — Visual verification checkpoint for all Phase 4 requirements (LOGIN-02, LOGIN-03, TRNUI-03, TRNUI-04, TRNUI-05)

### Phase 5: Client Management Fixes
**Goal**: Creating and editing clients works without production errors, the form is clean with correct field order and valid body fat formula, and all legacy/debug code is gone
**Depends on**: Phase 4
**Requirements**: CLNT-01, CLNT-02, CLNT-03, CLNT-04, CLNT-05, CLNT-06
**Success Criteria** (what must be TRUE):
  1. Trainer can create a new client without triggering the Digest 2112945886 production error
  2. No debug console.log or debug UI is visible in the clients section
  3. The body fat percentage field in the client form uses the correct calculation formula and displays accurate values
  4. Trainer notes field appears at the bottom of the client creation form (after all other fields)
  5. Transitioning a client to an objective preserves all field values without compatibility errors
  6. Legacy fields no longer appear in the client form
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — Fix admin client INSERT for createClientAction and remove debug code (CLNT-01, CLNT-02)
- [ ] 05-02-PLAN.md — Remove legacy Compatibilidad section and fix trainer notes field order in forms (CLNT-03, CLNT-04, CLNT-05, CLNT-06)
- [ ] 05-03-PLAN.md — Visual verification checkpoint for all Phase 5 requirements (CLNT-01 through CLNT-06)

### Phase 6: Navigation & Plans
**Goal**: The trainer can access the routines section and navigate plan details without errors; the client can reach the nutrition section and see plan history and individual workout views
**Depends on**: Phase 4
**Requirements**: ROUT-01, PLAN-01, PLAN-02, PLAN-03, PLAN-04, NUTR-01
**Success Criteria** (what must be TRUE):
  1. Trainer can navigate to the routines section and see the routines list without any runtime error
  2. Trainer can open a plan and see a summary of all routines included in that plan
  3. Trainer can click into an individual routine within a plan and view its full content
  4. Client can view the history tab of a plan and see a functional, populated history list
  5. Client can open an individual workout entry within the plan history and see the full workout detail
  6. Client can navigate to the nutrition section and interact with their meal checklist without errors
**Plans**: TBD

### Phase 7: TypeScript Cleanup
**Goal**: The codebase compiles cleanly — no pre-existing TypeScript errors remain in the profile or client detail pages
**Depends on**: Phase 6
**Requirements**: TS-01, TS-02
**Success Criteria** (what must be TRUE):
  1. `app/(client)/profile/page.tsx` compiles with zero TypeScript errors (href union type resolved)
  2. `app/(trainer)/clients/[id]/page.tsx` compiles with zero TypeScript errors (Phase type resolved)
**Plans**: TBD

## Progress

**Execution Order:** 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Workout Session | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Bug Fixes & Type Safety | v2.0 | 2/2 | Complete | 2026-03-09 |
| 3. History & Personal Records | v2.0 | 2/2 | Complete | 2026-03-09 |
| 4. Login & Trainer UI Polish | 3/3 | Complete   | 2026-03-09 | - |
| 5. Client Management Fixes | v3.0 | 0/3 | Not started | - |
| 6. Navigation & Plans | v3.0 | 0/TBD | Not started | - |
| 7. TypeScript Cleanup | v3.0 | 0/TBD | Not started | - |
