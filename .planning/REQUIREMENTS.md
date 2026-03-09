# Requirements: Fitness Bassi

**Defined:** 2026-03-09
**Core Value:** The workout tracking loop must work end-to-end — start session, log sets, finish, review in history.

## v2 Requirements

Requirements for milestone v2.0 — Bassi v2. Each maps to roadmap phases.

### Bugs & Technical Quality

- [ ] **BUG-01**: "Reanudar entreno" button redirects to the existing active session instead of starting a new one
- [x] **BUG-02**: `revisions`, `revision_measurements`, `revision_photos` tables are fully typed in `lib/supabase/types.ts` (no more `supabase as any`)
- [ ] **BUG-03**: Nutrition macro targets for clients without an active nutrition plan use a correct calculated formula (not zeros/placeholders)

### History & Personal Records

- [ ] **HIST-01**: Client can see a chronological feed of all their completed workout sessions at `/history`
- [ ] **HIST-02**: Client can tap a past session and see full detail — day name, duration, total volume, all sets per exercise
- [ ] **PR-01**: During a workout, app detects when a logged set beats the client's all-time best weight×reps for that exercise and shows a PR badge
- [ ] **PR-02**: History feed cards indicate which sessions contain at least one PR

### Progress Logging

- [ ] **PROG-01**: Client can log their current weight from the `/progress` page
- [ ] **PROG-02**: Client's target weight is shown as a reference line on the weight chart
- [ ] **PROG-03**: Client can log body measurements (waist, hip, chest, arm, thigh) from the `/progress` page

### Revisiones (Client)

- [ ] **REV-01**: Client can access their revisiones from the bottom nav
- [ ] **REV-02**: Client can see all their revisiones with date, metrics, trainer feedback, and photos

### AI Nutrition

- [ ] **AI-01**: Client can tap a button and type a free-text food description ("200g arroz con pollo")
- [ ] **AI-02**: App calls Claude API server-side and returns estimated macros (kcal, protein, carbs, fat) for that food description
- [ ] **AI-03**: Client sees the parsed macros in a confirmation step before saving
- [ ] **AI-04**: If Claude cannot parse the food, client sees a clear fallback that allows manual macro entry

### Trainer — Completar

- [ ] **TRN-01**: Trainer can browse and manage the exercise library from a dedicated `/exercises` page
- [ ] **TRN-02**: "Ver historial" button in client detail page navigates to that client's session history
- [ ] **TRN-03**: Dead sidebar links (`/reports`, `/settings`) are removed from the trainer nav

## v3 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Reporting & Analytics

- **RPT-01**: Trainer can view aggregate adherence trends across all clients
- **RPT-02**: Trainer can export a client's progress data as PDF/CSV

### Social & Notifications

- **NOTF-01**: Client receives push notification when trainer leaves feedback on a revision
- **NOTF-02**: Client receives reminder notification when it's time to train

### Advanced Features

- **ADV-01**: Offline workout support (IndexedDB)
- **ADV-02**: Real-time sync — trainer can watch a session live via Supabase Realtime
- **ADV-03**: Volume and frequency stats dashboard for client

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline workout support | Too complex; requires IndexedDB — deferred to v3 |
| Push notifications | Infrastructure not set up; deferred to v3 |
| Real-time sync | Supabase Realtime not yet integrated |
| Mobile native app | Web-first approach |
| OAuth login | Email/password sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 2 | Pending |
| BUG-02 | Phase 2 | Complete |
| BUG-03 | Phase 2 | Pending |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| PR-01 | Phase 3 | Pending |
| PR-02 | Phase 3 | Pending |
| PROG-01 | Phase 4 | Pending |
| PROG-02 | Phase 4 | Pending |
| PROG-03 | Phase 4 | Pending |
| REV-01 | Phase 5 | Pending |
| REV-02 | Phase 5 | Pending |
| AI-01 | Phase 6 | Pending |
| AI-02 | Phase 6 | Pending |
| AI-03 | Phase 6 | Pending |
| AI-04 | Phase 6 | Pending |
| TRN-01 | Phase 7 | Pending |
| TRN-02 | Phase 5 | Pending |
| TRN-03 | Phase 5 | Pending |

**Coverage:**
- v2 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 — traceability mapped after roadmap creation*
