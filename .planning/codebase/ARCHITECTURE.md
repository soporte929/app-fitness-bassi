# Architecture

**Analysis Date:** 2025-03-10

## Pattern Overview

**Overall:** Next.js 16 Server Components with Role-Based Routing

**Key Characteristics:**
- Server Components by default; `'use client'` only for interactive state![alt text](11.png)
- Role-based access control (trainer vs client) enforced in middleware
- Server Actions for all mutations (no form actions)
- Direct Supabase data fetching in Server Components
- Client-side state exclusively for form inputs, timers, and UI interactions
- Monolithic single-codebase with path-based role segregation

## Layers

**Authentication & Middleware:**
- Purpose: Route protection and role enforcement
- Location: `middleware.ts`
- Contains: Supabase client initialization, role checks, redirect logic
- Depends on: Supabase SSR, Next.js cookies
- Used by: All pages via Next.js middleware chain

**Server Data Access:**
- Purpose: Query and fetch data from Supabase
- Location: `lib/supabase/` (client.ts, server.ts, types.ts)
- Contains: Supabase client factories, TypeScript type definitions, admin operations
- Depends on: @supabase/supabase-js, @supabase/ssr
- Used by: All Server Components and Server Actions

**Server Actions:**
- Purpose: Mutate data server-side
- Location: `actions.ts` files co-located in each feature route
  - `app/(client)/today/actions.ts` — workout operations
  - `app/(trainer)/clients/actions.ts` — client management
  - `app/(client)/nutrition/actions.ts` — meal logging
- Contains: Type-safe mutation functions called directly from client components
- Depends on: createClient(), types from Database
- Used by: Client Components via direct import + function call

**Server Components (Pages & Layouts):**
- Purpose: Render initial HTML with live data
- Location: `app/(client)/` and `app/(trainer)/` page.tsx files
- Contains: Data fetching via Supabase, data aggregation, security checks, layout composition
- Depends on: createClient(), Database types, business logic functions
- Used by: Browser navigation, form submissions triggering Server Actions

**Client Components:**
- Purpose: Interactivity, form state, local UI state
- Location: Marked with `'use client'` — typically in `components/` directory
- Contains: Input handling, timers, modal state, expandable sections
- Depends on: React hooks, Server Actions, UI primitives
- Used by: Server Components as children, form submissions

**Business Logic:**
- Purpose: Computation independent of data source
- Location: `lib/` directory
  - `lib/alerts.ts` — Alert generation from client metrics
  - `lib/calculations/nutrition.ts` — Nutrition formulas (Cunningham, GET)
  - `lib/pr-detection.ts` — PR calculation from set logs
- Contains: Pure functions, no I/O
- Depends on: Types only
- Used by: Server Components during data aggregation

**UI Components:**
- Purpose: Reusable design system elements
- Location: `components/ui/`
- Contains: Card, Button, Badge, AlertBanner, StatCard, MiniChart, PageTransition
- Depends on: Tailwind CSS, Lucide React icons, clsx/tailwind-merge
- Used by: Both server and client components

## Data Flow

**Server Component → Client Component → Server Action:**

```
1. Server Component fetches data via createClient()
2. Applies business logic (alerts, PRs, calculations)
3. Passes immutable props to Client Component
4. Client Component handles user input (sets form state)
5. On submit, Client Component calls Server Action with explicit params
6. Server Action mutates Supabase, optionally revalidates paths
7. Server Component re-renders with updated data (ISR or redirect)
```

**Example: Workout Session**

```
WorkoutSessionPage (Server Component)
├─ Fetches: session, exercises, set_logs, lastSession
├─ Computes: prBestVolume per exercise, isPR flag
├─ Passes props: exercisesWithSets, finishAction (bound)
│
└─ TodayExercisesProgress (Client Component)
   ├─ Maps exercises → ExerciseCard
   │
   └─ ExerciseCard (Client Component)
      ├─ Local state: sets (weight, reps, rir, done)
      ├─ On set completion: saveSetLog() Server Action
      │  (upserts to set_logs table)
      │
      └─ On session finish: finishWorkout() Server Action
         (marks session.completed=true, redirects to /history)
```

**State Management:**

- **Server state:** All persistent data (clients, sessions, meals, weight logs)
- **Client state:** Form inputs, UI toggles, timers, expanded/collapsed sections
- **Shared state:** None — data flows downward only (props)

## Key Abstractions

**Supabase Client:**
- Purpose: Type-safe database access with automatic TypeScript inference
- Examples: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Pattern: Factory function `createClient()` returns typed Supabase instance

**Database Types:**
- Purpose: Single source of truth for table schemas
- Examples: `lib/supabase/types.ts`
- Pattern: `Database['public']['Tables']['table_name']['Row|Insert|Update']`
- Usage: Eliminates type redefinition; every action validates against this

**Server Actions:**
- Purpose: Isolated mutation handlers with built-in security
- Pattern: Marked with `'use server'` at file top
- Signature: `async function(params: Types): Promise<Result>`
- Called from: Client Components as regular function imports

**Role-Based Routes:**
- Purpose: Path-based access control
- Trainer routes: `/dashboard`, `/clients/*`, `/plans/*`, `/nutrition-plans/*`, `/exercises`
- Client routes: `/today`, `/workout/*`, `/routines/*`, `/history/*`, `/nutrition`, `/progress`
- Enforcement: Middleware redirects mismatched roles

**Layout Nesting:**
- Purpose: Shared UI structure per role
- `app/(client)/layout.tsx` → Bottom nav, rest timer, active session banner
- `app/(trainer)/layout.tsx` → Collapsible sidebar, mobile hamburger

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Global fonts, theme provider, metadata, HTML structure

**Client Layout:**
- Location: `app/(client)/layout.tsx`
- Triggers: Any path matching `/(client)/*`
- Responsibilities: Bottom navigation, rest timer context, suspense boundary

**Trainer Layout:**
- Location: `app/(trainer)/layout.tsx`
- Triggers: Any path matching `/(trainer)/*`
- Responsibilities: Collapsible sidebar, mobile responsive menu

**Auth Middleware:**
- Location: `middleware.ts`
- Triggers: All requests (early in Next.js chain)
- Responsibilities: Session validation, role-based redirect, cookie management

## Error Handling

**Strategy:** Early redirect + notFound() for missing resources

**Patterns:**

- **No auth:** `redirect('/login')`
- **Wrong role:** `redirect('/today')` or `redirect('/dashboard')`
- **Missing resource:** `notFound()` (404 page)
- **Security violation:** `notFound()` (e.g., accessing another user's session)
- **Server Action failure:** `throw new Error()` (optional error boundary)

## Cross-Cutting Concerns

**Authentication:**
- Middleware enforces session via Supabase cookies
- Server Actions check `supabase.auth.getUser()` before mutation
- Client lookup via `profile_id = user.id` for isolation

**Authorization:**
- Trainer routes check `profile?.role === 'trainer'` in middleware
- Client routes check `profile?.role === 'client'` in middleware
- Data queries filtered by `trainer_id = user.id` (trainers) or `profile_id = user.id` (clients)

**Validation:**
- Type safety via TypeScript and Database types
- Business logic validation in Server Actions (`if (!user) throw`)
- Supabase RLS policies (referenced in action comments)

**Logging:**
- No structured logging layer detected
- Production ready logging not implemented

**Caching:**
- Server Component default cache (ISR via revalidatePath)
- Manual cache clearing via `revalidatePath()` in Server Actions

---

*Architecture analysis: 2025-03-10*
