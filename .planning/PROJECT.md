# Fitness Bassi

## What This Is

Fitness Bassi is a personal training platform built for a trainer named Bassi and his clients. Clients track workouts (active sessions with set logging and rest timer, history, nutrition) and view progress. The trainer monitors all clients via a dashboard, manages workout plans, routine templates, and nutrition plans.

## Core Value

The workout tracking loop must work end-to-end: client starts a session, logs every set, finishes, and can review it in history — if this breaks, nothing else matters.

## Requirements

### Validated

<!-- Shipped and confirmed valuable across milestone v0 (existing codebase). -->

- ✓ Role-based auth + middleware — trainer vs client routing enforced
- ✓ Client: Today page — shows active session (Server Component, real Supabase data)
- ✓ Client: Set logging — saveSetLog Server Action with upsert on conflict
- ✓ Client: Finish workout — finishWorkout marks session complete, sets finished_at
- ✓ Client: Routines list — client sees assigned workout plans
- ✓ Client: Routine detail + Start Session — client can browse and begin a plan day
- ✓ Client: Nutrition checklist — meal logging with grams input + macro calc
- ✓ Client: Progress charts — weight and body measurement charts
- ✓ Client: Profile page — client sees their stats and can log out
- ✓ Trainer: Dashboard — adherence, weight trend, phase distribution charts + alerts
- ✓ Trainer: Client management — list, create, edit, delete clients with full profiles
- ✓ Trainer: Plans management — create/edit workout plan templates
- ✓ Trainer: Routine templates builder — full CRUD with exercise picker
- ✓ Trainer: Nutrition plans — create/assign nutrition plans to clients
- ✓ Design system — Card, Button, StatusBadge, AlertBanner, StatCard, MiniChart, PageTransition

<!-- Shipped in v1.0 — Workout Loop Completion -->

- ✓ Client: Dedicated workout session page — `/workout/[sessionId]` with set logging, rest timer, finish flow — v1.0
- ✓ Client: Active session routing — `/today` redirects to active session; banner links to `/workout/[sessionId]` — v1.0
- ✓ Client: Collision prevention — global (dateless) duplicate session check on session start — v1.0

### Active

<!-- Next milestone — history + PR detection -->

- [ ] Client can see their full workout history (sessions feed at `/history`)
- [ ] Client can drill into a past session and see all logged sets
- [ ] App flags when a set is a new personal record (best weight × reps for that exercise)
- [ ] History feed highlights sessions where PRs were set

### Out of Scope

- Personal Records UI (PRs) — deferred to v1.1; need more session data first
- Volume/frequency stats — deferred to v1.1
- Offline workout support — too complex; requires IndexedDB
- Trainer-side workout session viewing — trainer can see client data in client detail page
- Push notifications — not in scope
- Real-time sync (trainer watching session live) — Supabase Realtime not yet integrated

## Context

- Next.js 16.1.6 App Router, React 19, TypeScript strict, Tailwind CSS v4
- Supabase + @supabase/ssr for auth and all data access
- Server Components by default; 'use client' only for interactive state (timers, inputs, forms)
- Pattern: pages fetch data server-side, pass to client components as props
- ~15,585 LOC TypeScript/TSX (post-v1.0)
- v1.0 shipped: `/workout/[sessionId]` page, navigation wiring, startWorkoutSession action
- Pre-existing TypeScript errors (3): `profile/page.tsx` (href prop) + `clients/[id]/page.tsx` (Phase type) — pre-date v1.0
- Dev auth bypass active in middleware.ts (NODE_ENV === 'development') — remove before production

## Constraints

- **Tech stack**: Next.js + Supabase only — no new heavy libraries without discussion
- **Design system**: Only the established color palette and component library
- **Icons**: Lucide React exclusively
- **No hardcoding**: All data must come from Supabase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Server Components by default | Keeps data fetching centralized, no client-side fetches | ✓ Good |
| Explicit FK hints on all joins | Avoids PostgREST ambiguous FK failures | ✓ Good |
| ExerciseCard handles set state locally | Interactive, needs immediate feedback | ✓ Good |
| Server Actions for all mutations | No API routes needed, co-located with route | ✓ Good |
| Global collision check (no date window) | Finds any active session from any day/date — prevents duplicates | ✓ Good |
| Collision redirect to /workout/[existing.id] | User lands on existing session, not confused by /today | ✓ Good |
| No back button on /workout/[sessionId] | Focused workout experience — prevents accidental session abandonment | ✓ Good |
| Reuse finishWorkout from today/actions.ts | No duplication — single source of truth for session completion | ✓ Good |
| today/page.tsx simplified to ~57 lines | All workout rendering removed as dead code after redirect added | ✓ Good |
| Banner hide guard uses pathname.startsWith('/workout') | Covers all /workout/* sub-paths, prevents double-banner | ✓ Good |

---
*Last updated: 2026-03-09 after v1.0 milestone — Workout Loop Completion shipped*
