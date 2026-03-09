# Fitness Bassi

## What This Is

Fitness Bassi is a personal training platform built for a trainer named Bassi and his clients. Clients track workouts (active sessions, history, nutrition) and view progress. The trainer monitors all clients via a dashboard, manages workout plans, routine templates, and nutrition plans.

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

### Active

<!-- Current milestone v1.0: Workout Loop Completion -->

- [ ] Client can view and interact with an active workout session on a dedicated page
- [ ] Client sees a rest timer automatically after completing a set
- [ ] Client can see their full workout history (sessions feed)
- [ ] Client can drill into a past session and see all logged sets

### Out of Scope

- Personal Records (PRs) detection — deferred to v1.1; need more session data first
- Volume/frequency stats — deferred to v1.1
- Offline workout support — too complex for v1.0; requires IndexedDB
- Trainer-side workout session viewing — trainer can see client data in client detail page
- Push notifications — not in scope

## Context

- Next.js 16.1.6 App Router, React 19, TypeScript strict, Tailwind CSS v4
- Supabase + @supabase/ssr for auth and all data access
- Server Components by default; 'use client' only for interactive state (timers, inputs, forms)
- Pattern: pages fetch data server-side, pass to client components as props
- ExerciseCard and RestTimer components already exist in components/client/
- history/ route and session-history-card.tsx, session-detail.tsx already partially exist (state TBD — likely stubs)
- Dev auth bypass active in middleware.ts (NODE_ENV === 'development')

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

---
*Last updated: 2026-03-09 — Milestone v1.0 started*
