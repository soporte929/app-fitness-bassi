# Requirements: Fitness Bassi

**Defined:** 2026-03-09
**Core Value:** The workout tracking loop must work end-to-end — start session, log sets, finish, review in history.

## v1 Requirements

Requirements for milestone v1.0. Each maps to roadmap phases.

### Workout Session

- [ ] **WORKOUT-01**: User can start a workout session from a routine plan day — creates session and redirects to `/workout/[sessionId]`
- [ ] **WORKOUT-02**: User sees all exercises for the day on the workout page, with set targets and previous session's weights as hints
- [ ] **WORKOUT-03**: User can log sets (weight, reps, RIR) and mark them complete within the workout page
- [ ] **WORKOUT-04**: A rest timer appears automatically after completing a set
- [ ] **WORKOUT-05**: User can finish the workout from the workout page (session marked complete, redirects to history)
- [ ] **WORKOUT-06**: Active session banner links to `/workout/[sessionId]` instead of `/today`
- [ ] **WORKOUT-07**: `today/page.tsx` redirects to `/workout/[sessionId]` when an active session exists (making the dedicated page the canonical workout URL)

## v2 Requirements

Deferred to future milestone.

### Personal Records

- **PR-01**: App flags when a set is a new personal record (best weight × reps for that exercise)
- **PR-02**: History feed highlights sessions where PRs were set

### Volume + Frequency

- **VOL-01**: Weekly volume chart on progress page
- **VOL-02**: Workouts per week trend chart

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline workout support | Requires IndexedDB, too complex for v1.0 |
| Push notifications | Not in scope — no notification infrastructure |
| Real-time sync (trainer watching session live) | Supabase Realtime not yet integrated |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| WORKOUT-01 | Phase 1 — Workout Session | Pending |
| WORKOUT-02 | Phase 1 — Workout Session | Pending |
| WORKOUT-03 | Phase 1 — Workout Session | Pending |
| WORKOUT-04 | Phase 1 — Workout Session | Pending |
| WORKOUT-05 | Phase 1 — Workout Session | Pending |
| WORKOUT-06 | Phase 1 — Workout Session | Pending |
| WORKOUT-07 | Phase 1 — Workout Session | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 — Roadmap created, traceability confirmed*
