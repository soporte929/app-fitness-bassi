# Roadmap: Fitness Bassi

## Overview

Milestone v1.0 completes the workout tracking loop by building the dedicated workout session page — the missing piece that turns a scattered set of existing components into a coherent, end-to-end training experience. The client can start a session from a routine, log every set with a rest timer, finish, and the app correctly routes them at every step of the journey.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Workout Session** - Dedicated `/workout/[sessionId]` page with full set logging, rest timer, finish flow, and correct routing from Today and the active session banner

## Phase Details

### Phase 1: Workout Session
**Goal**: Client has a working, dedicated workout session page where they can log all sets, see a rest timer, finish the session, and the app routes them there from every relevant entry point
**Depends on**: Nothing (first phase)
**Requirements**: WORKOUT-01, WORKOUT-02, WORKOUT-03, WORKOUT-04, WORKOUT-05, WORKOUT-06, WORKOUT-07
**Success Criteria** (what must be TRUE):
  1. Client taps "Start" on a routine plan day and lands on `/workout/[sessionId]` with all exercises for that day visible
  2. Client sees previous session's weights as hints on each set input, and can log weight, reps, and RIR per set then mark it complete
  3. A rest timer appears automatically after marking a set complete, counts down, and dismisses without interrupting the workout flow
  4. Client taps "Finish Workout" and the session is marked complete in Supabase, then the client is redirected to history
  5. Navigating to `/today` while a session is active redirects to `/workout/[sessionId]`, and the active session banner links to that page instead of `/today`
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Workout Session | 0/TBD | Not started | - |
