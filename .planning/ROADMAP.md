# Roadmap: Fitness Bassi

## Milestones

- ✅ **v1.0 Workout Loop Completion** — Phase 1 (shipped 2026-03-09)
- 🚧 **v2.0 Bassi v2** — Phases 2-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 Workout Loop Completion (Phase 1) — SHIPPED 2026-03-09</summary>

- [x] Phase 1: Workout Session (2/2 plans) — completed 2026-03-09

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v2.0 Bassi v2 (In Progress)

**Milestone Goal:** Fix critical bugs, complete the client experience (history, PRs, progress logging, revisiones), add AI nutrition parsing, and close all dead trainer links.

- [ ] **Phase 2: Bug Fixes & Type Safety** — Eliminate the "Reanudar" bug, fully type the revisions tables, and fix nutrition macro calculations
- [ ] **Phase 3: History & Personal Records** — Complete the workout history feed and surface PR detection during sessions and in history
- [ ] **Phase 4: Progress Logging** — Let clients log weight and body measurements from the progress page with chart reference line
- [ ] **Phase 5: Revisiones & Trainer Cleanup** — Add revisiones to client nav, fix trainer sidebar dead links, and wire trainer's "Ver historial" button
- [ ] **Phase 6: AI Nutrition Parsing** — Claude API endpoint turns free-text food descriptions into macro estimates with client confirmation step
- [ ] **Phase 7: Trainer Exercises Page** — Dedicated `/exercises` page for browsing and managing the exercise library

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
- [ ] 02-01-PLAN.md — Add revisions table types to lib/supabase/types.ts and remove all `supabase as any` casts (BUG-02)
- [ ] 02-02-PLAN.md — Fix global session check for "Reanudar entreno" and always-show calculated macro targets (BUG-01, BUG-03)

### Phase 3: History & Personal Records
**Goal**: Clients can review their entire workout history and see when they hit personal records, both live during a session and as badges on past history cards
**Depends on**: Phase 2
**Requirements**: HIST-01, HIST-02, PR-01, PR-02
**Success Criteria** (what must be TRUE):
  1. Client visits `/history` and sees a chronological list of all their completed workout sessions
  2. Client taps a history card and sees the full session detail — day name, duration, total volume, and all sets per exercise
  3. During an active workout, a PR badge appears next to a set when the logged weight×reps beats the client's all-time best for that exercise
  4. History feed cards visually indicate which sessions contained at least one personal record
**Plans**: TBD

### Phase 4: Progress Logging
**Goal**: Clients can actively update their body metrics from the progress page, and their target weight appears as a visual reference on the weight chart
**Depends on**: Phase 2
**Requirements**: PROG-01, PROG-02, PROG-03
**Success Criteria** (what must be TRUE):
  1. Client can enter and save their current weight from the `/progress` page, and the new entry appears immediately on the chart
  2. The weight chart displays a horizontal reference line showing the client's target weight
  3. Client can log body measurements (waist, hip, chest, arm, thigh) from the `/progress` page and see them reflected in the measurements section
**Plans**: TBD

### Phase 5: Revisiones & Trainer Cleanup
**Goal**: The client app navigation is complete (revisiones accessible from bottom nav), and the trainer interface has no dead links or missing navigation
**Depends on**: Phase 2
**Requirements**: REV-01, REV-02, TRN-02, TRN-03
**Success Criteria** (what must be TRUE):
  1. Client can tap a revisiones entry in the bottom nav and land on a page listing all their revisiones with date, metrics, trainer feedback, and photos
  2. Trainer clicks "Ver historial" on a client detail page and navigates to that client's session history
  3. The trainer sidebar no longer shows `/reports` or `/settings` links (dead links removed or replaced with working pages)
**Plans**: TBD

### Phase 6: AI Nutrition Parsing
**Goal**: Clients can describe food in plain Spanish and get macro estimates from Claude, with a confirmation step before anything is saved
**Depends on**: Phase 2
**Requirements**: AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):
  1. Client taps a button on the nutrition page, types a free-text food description (e.g., "200g arroz con pollo"), and submits it
  2. The app calls Claude API server-side and returns estimated macros (kcal, protein, carbs, fat) for the description
  3. Client sees the parsed macros in a confirmation step and can accept or cancel before anything is saved to the database
  4. When Claude cannot parse the food, client sees a clear fallback that allows manual macro entry instead
**Plans**: TBD

### Phase 7: Trainer Exercises Page
**Goal**: The trainer has a dedicated page to browse and manage the exercise library
**Depends on**: Phase 5
**Requirements**: TRN-01
**Success Criteria** (what must be TRUE):
  1. Trainer can navigate to `/exercises` from the sidebar and see the full exercise library
  2. Trainer can manage exercises (add, edit) from this page without leaving the trainer interface
**Plans**: TBD

## Progress

**Execution Order:** 2 → 3 → 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Workout Session | v1.0 | 2/2 | Complete | 2026-03-09 |
| 2. Bug Fixes & Type Safety | 1/2 | In Progress|  | - |
| 3. History & Personal Records | v2.0 | 0/TBD | Not started | - |
| 4. Progress Logging | v2.0 | 0/TBD | Not started | - |
| 5. Revisiones & Trainer Cleanup | v2.0 | 0/TBD | Not started | - |
| 6. AI Nutrition Parsing | v2.0 | 0/TBD | Not started | - |
| 7. Trainer Exercises Page | v2.0 | 0/TBD | Not started | - |
