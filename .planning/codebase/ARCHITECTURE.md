# Architecture

**Analysis Date:** 2025-03-09

## Pattern Overview

**Overall:** Next.js 16 App Router with role-based Server Components + Server Actions + Supabase

**Key Characteristics:**
- Server Components by default; `'use client'` only for interactive state (forms, timers, real-time updates)
- Server Actions (`actions.ts`) for all mutations (workout logs, client updates, plan changes)
- Role-based routing enforcement via middleware (`trainer` vs `client`)
- Supabase PostgREST for all data access with explicit FK hints on ambiguous joins
- Design System: fixed color palette + reusable UI components + Lucide icons only

## Layers

**Middleware Layer:**
- Purpose: Enforce authentication, role-based access control, redirect unauthenticated users
- Location: `middleware.ts`
- Contains: Auth check, role routing, public/protected path matchers
- Depends on: `@supabase/ssr`, Next.js navigation
- Used by: All routes (runs before page loads)
- **Dev bypass active** — `NODE_ENV === 'development'` skips all auth checks (remove before production)

**Route Layer (Pages):**
- Purpose: Server Components that fetch data and render UI
- Locations: `app/(client)/`, `app/(trainer)/`, `app/(auth)/login`
- Contains: Async data fetching, zero hardcoding, `PageTransition` wrapper
- Depends on: Server Supabase client, Server Actions
- Pattern: Each route calls `createClient()`, gets auth user, redirects if needed, fetches typed data, passes to components

**Action Layer:**
- Purpose: Server-side mutations (upsert/update/delete)
- Locations: `{route}/actions.ts` files (e.g., `app/(client)/today/actions.ts`, `app/(trainer)/clients/actions.ts`)
- Contains: `'use server'` functions with explicit typed parameters
- Used by: Client components via direct function calls + form actions
- Pattern: `async function name(params: TypedParams, _formData?: FormData): Promise<ReturnType>`

**Component Layer:**
- **Server Components** (e.g., `TodayPage`, `ClientsPage`): Fetch data, assemble page
- **Client Components** (e.g., `ExerciseCard`, `CreateClientModal`): Interactive state (inputs, timers, modals, filters)
- Location: `components/{client|trainer}/` for role-specific; `components/ui/` for shared
- Dependency: Client components receive all data as props; fetch nothing directly

**Data Layer:**
- **Supabase clients**: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)
- **Type definitions**: `lib/supabase/types.ts` — Database-generated types (1200+ lines)
- **Utilities**: `lib/utils.ts` (`cn()`), `lib/alerts.ts` (alert computation), `lib/calculations/nutrition.ts` (macro formulas)

## Data Flow

**Client Reading Own Data (e.g., Today Page):**

1. Server Component `today/page.tsx` calls `createClient()`
2. Gets authenticated user from Supabase Auth
3. Fetches client record with explicit FK hint: `.select('...').eq('profile_id', user.id).single()`
4. In parallel: fetches today's session + all completed sessions (for streak calc)
5. If session exists: fetches workout_day → exercises → set_logs for that session
6. Passes assembled data to Client Component `ExerciseCard` + `TodayExercisesProgress`
7. User submits set (weight, reps, RIR) → Client Component calls Server Action `saveSetLog()`
8. Server Action upserts to `set_logs` with `onConflict: 'session_id,exercise_id,set_number'`
9. User clicks "Finish" → form action calls `finishWorkout(sessionId)`
10. Server Action updates session `completed: true, finished_at: now` → redirects to `/history`

**Trainer Reading Client Data (e.g., Clients List):**

1. Server Component `clients/page.tsx` calls `createClient()`
2. Gets authenticated trainer user
3. Fetches all `clients` where `trainer_id = user.id` with nested selects:
   - Profile (full_name, email)
   - Active client_plans with nested plan (id, name)
4. Passes client list to Client Component `ClientsListUI` (handles search/filter state)
5. User clicks "Edit" → pops `EditPanel` (Client Component with dirty state tracking)
6. User changes field (e.g., phase) → calls Server Action `updateClientAction(clientId, updates)`
7. Server Action updates `clients` table → returns success
8. Client Component refetches page data via Server-side revalidation (if available)

**Data Consistency:**
- All writes go through Server Actions
- Client Components never mutate state directly
- Form data passed as parameters, not FormData parsing
- Supabase RLS policies enforce row-level access (trainer can only see their own clients)

## Key Abstractions

**Server Component Pattern:**
- Purpose: Centralize data fetching and async logic
- Examples: `app/(client)/today/page.tsx`, `app/(trainer)/dashboard/page.tsx`, `app/(trainer)/clients/page.tsx`
- Pattern: `export default async function Page() { const supabase = await createClient(); ... }`

**Client Component + Server Action Pattern:**
- Purpose: Handle interactive forms/buttons while keeping mutations server-side
- Examples: `ExerciseCard` calls `saveSetLog()`, `EditPanel` calls `updateClientAction()`
- Pattern: Client component has state (`useState`), calls async Server Action, receives result

**FK Hint Pattern (Critical for Ambiguous Joins):**
- Purpose: Tell PostgREST which foreign key to use when table A has multiple FK to table B
- Example: `clients` has both `profile_id` and `trainer_id` → both point to `profiles`
  - Correct: `.select('profile:profiles!clients_profile_id_fkey (full_name, email)')`
  - Wrong: `.select('profile:profiles (full_name, email)')` → may return empty or wrong row
- Used in: `today/page.tsx`, `clients/page.tsx`, `dashboard/page.tsx`

**Design System Component:**
- Purpose: Reusable styled UI primitives
- Examples: `Card`, `Button`, `StatusBadge`, `AlertBanner`, `StatCard`, `MiniChart`
- Pattern: Tailwind + CSS variables (e.g., `bg-[var(--bg-surface)]`, `text-[var(--text-primary)]`)
- All components in `components/ui/`, imported and composed in feature pages

**Alert Computation:**
- Purpose: Centralize trainer-facing alert logic (adherence, weight trends, workout frequency)
- Location: `lib/alerts.ts` → `computeAlerts(ClientAlertInput): Alert[]`
- Used in: `dashboard/page.tsx` to populate alerts shown to trainer
- Levels: `critical` (red), `warning` (yellow), `info` (blue)

## Entry Points

**Auth Entry (Public):**
- Location: `app/(auth)/login/page.tsx`
- Triggers: Unauthenticated user navigates to any protected route
- Responsibilities: Redirect to Supabase-hosted login or inline form (implementation varies)

**Client Entry (Protected):**
- Location: `app/(client)/today/page.tsx`
- Triggers: Authenticated user with `role: 'client'` navigates to `/today`
- Responsibilities: Show active workout session OR empty state + "Start routine" button
- Middleware ensures non-clients cannot reach this route

**Trainer Entry (Protected):**
- Location: `app/(trainer)/dashboard/page.tsx`
- Triggers: Authenticated user with `role: 'trainer'` navigates to `/dashboard`
- Responsibilities: Show client overview (adherence, weight trends, phase distribution), alerts for each client
- Middleware ensures non-trainers cannot reach this route

**Layout Roots:**
- `app/(client)/layout.tsx`: Mobile-first container (max-width 430px), bottom nav, header, Suspense fallback
- `app/(trainer)/layout.tsx`: Collapsible sidebar (64px on md+), responsive hamburger menu on mobile, main content area
- `app/layout.tsx`: Root theme provider, font setup, global styles

## Error Handling

**Strategy:** Minimal explicit error boundaries; rely on middleware + async/await

**Patterns:**
- Page redirects if user not found: `if (!user) redirect('/login')`
- Fetch errors logged to console (dev only): `console.error('QUERY_ERROR:', error)`
- Supabase errors returned as `{ success: false }` from Server Actions
- Missing data → empty state UI (e.g., "No workout scheduled for today")
- Form submission failures: Client Component shows toast or inline error (not yet centralized)

## Cross-Cutting Concerns

**Logging:**
- Client-side: `console.log()` only (removed in production builds)
- Server-side: Anthropic Claude API calls logged implicitly (planned for future integrations)

**Validation:**
- Form inputs validated in Client Components (UI-level only)
- Supabase constraints enforce database-level validation (NOT NULL, UNIQUE, FK, RLS)
- No explicit validation middleware; assume client honest

**Authentication:**
- All pages start with `const user = supabase.auth.getUser()`
- Middleware redirects unauthenticated to `/login` (bypass in dev)
- Role check happens in middleware AND in Server Components (belt-and-suspenders)
- RLS policies in Supabase (e.g., clients can see own sessions only) are not enforced on client side, only via middleware

**State Management:**
- Client-level: `useState` in Client Components (exercise input state, modal open/close, timers)
- Page-level: None (Server Components, no shared state container)
- Cross-page: Route params (`/routines/[planId]`), search params (pagination, filters)

---

*Architecture analysis: 2025-03-09*
