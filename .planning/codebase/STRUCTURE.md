# Codebase Structure

**Analysis Date:** 2025-03-09

## Directory Layout

```
app-fitness-bassi/
├── app/                           # Next.js App Router routes
│   ├── (auth)/                    # Public auth group
│   │   └── login/page.tsx         # Login page
│   ├── (client)/                  # Client-only protected routes
│   │   ├── layout.tsx             # Client layout (mobile container, nav)
│   │   ├── today/                 # Today's workout session
│   │   │   ├── page.tsx           # Server Component
│   │   │   └── actions.ts         # saveSetLog, finishWorkout
│   │   ├── routines/              # List of assigned workout plans
│   │   │   ├── page.tsx           # Server Component
│   │   │   └── [planId]/
│   │   │       └── page.tsx       # View single routine + start session
│   │   ├── history/               # Workout history feed
│   │   │   ├── page.tsx           # Server Component
│   │   │   └── [sessionId]/       # Session detail view
│   │   ├── nutrition/             # Nutrition tracking
│   │   │   ├── page.tsx           # Server Component
│   │   │   ├── nutrition-checklist.tsx  # Client Component (interactive)
│   │   │   └── nutrition-actions.ts    # upsertMealLogAction
│   │   ├── progress/              # Progress charts (weight, measurements)
│   │   │   └── page.tsx           # Server Component
│   │   ├── profile/               # User profile + logout
│   │   │   ├── page.tsx           # Server Component
│   │   │   └── logout-button.tsx  # Client Component
│   │   └── revisions/             # Client revision history (planned)
│   ├── (trainer)/                 # Trainer-only protected routes
│   │   ├── layout.tsx             # Trainer layout (sidebar + responsive)
│   │   ├── dashboard/page.tsx     # Overview + alerts + charts
│   │   ├── clients/               # Client management
│   │   │   ├── page.tsx           # List all clients
│   │   │   ├── clients-list.tsx   # Client Component (search/filter)
│   │   │   ├── actions.ts         # updateClientAction, createClientAction, deleteClientAction
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Client detail page
│   │   │       ├── edit-panel.tsx # Client Component (edit profile, dirty state)
│   │   │       ├── nutrition-actions.ts  # Client-specific nutrition updates
│   │   │       └── revisions/
│   │   │           ├── page.tsx   # View plan change history
│   │   │           └── new/page.tsx  # Create new plan revision
│   │   ├── plans/                 # Workout plan templates (CRUD)
│   │   │   ├── page.tsx           # List plans
│   │   │   ├── actions.ts         # Plan mutations
│   │   │   ├── new/page.tsx       # Create plan
│   │   │   └── [planId]/page.tsx  # Edit plan
│   │   ├── routines-templates/    # Workout routine templates
│   │   │   ├── page.tsx           # List routines
│   │   │   ├── actions.ts         # Routine mutations
│   │   │   ├── new/page.tsx       # Create routine + routine builder
│   │   │   └── [planId]/page.tsx  # Edit routine
│   │   └── nutrition-plans/       # Nutrition plan templates
│   │       ├── page.tsx           # List nutrition plans
│   │       └── actions.ts         # Nutrition plan mutations
│   ├── page.tsx                   # Root redirect (to /login or /today or /dashboard)
│   └── layout.tsx                 # Root layout (theme, fonts, providers)
├── components/                    # Reusable React components
│   ├── ui/                        # Design system primitives
│   │   ├── card.tsx               # Card container
│   │   ├── button.tsx             # Button (variants: default, ghost)
│   │   ├── badge.tsx              # StatusBadge (colors: green, yellow, red)
│   │   ├── alert-banner.tsx       # Alert display
│   │   ├── stat-card.tsx          # Stat display (number + label)
│   │   ├── mini-chart.tsx         # Small chart component (Recharts wrapper)
│   │   ├── page-transition.tsx    # Animation wrapper
│   │   ├── loading-screen.tsx     # Loading spinner
│   │   ├── select.tsx             # Dropdown select (Radix UI)
│   │   ├── custom-select.tsx      # Custom select variant
│   │   └── theme-toggle.tsx       # Dark/light mode switch
│   ├── client/                    # Client-specific interactive components
│   │   ├── nav.tsx                # Bottom navigation (today, routines, history, nutrition, progress, profile)
│   │   ├── sidebar.tsx            # Client sidebar (if used)
│   │   ├── exercise-card.tsx      # Expandable exercise card (sets, weight, reps inputs)
│   │   ├── today-exercises-progress.tsx  # Exercise list for today
│   │   ├── rest-timer.tsx         # Rest timer between sets (Client Component)
│   │   ├── active-session-banner.tsx    # Banner showing active session
│   │   ├── plan-day-card.tsx      # Workout day card in routines list
│   │   ├── session-history-card.tsx    # Past session card
│   │   ├── session-detail.tsx     # Full session view with metrics
│   │   ├── history-filters.tsx    # Filter by date, muscle group
│   │   └── progress-charts.tsx    # Multiple charts (weight, measurements, volume)
│   ├── trainer/                   # Trainer-specific interactive components
│   │   ├── sidebar.tsx            # Left sidebar nav (dashboard, clients, plans, nutrition, routines)
│   │   ├── new-client-button.tsx  # Open create client modal
│   │   ├── create-client-modal.tsx        # Form to create client
│   │   ├── delete-client-dialog.tsx       # Confirmation dialog
│   │   ├── assign-plan-dropdown.tsx       # Dropdown to assign plan to client
│   │   ├── assign-template-button.tsx     # Button to open assign modal
│   │   ├── assign-template-modal.tsx      # Modal to assign template
│   │   ├── exercise-picker.tsx            # Modal to add exercises to routine
│   │   ├── routine-builder.tsx            # Full routine CRUD interface
│   │   ├── template-card.tsx              # Routine template card
│   │   └── dashboard-charts/
│   │       ├── adherence-chart.tsx        # Bar chart (workouts per client)
│   │       ├── weight-trend-chart.tsx     # Line chart (weight over 30 days)
│   │       └── phase-distribution-chart.tsx  # Pie chart (clients by phase)
│   └── providers/                 # Context/providers
│       └── theme-provider.tsx     # Next.js theme provider
├── lib/                           # Utility libraries
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client factory
│   │   ├── server.ts              # Server Supabase client factory (with cookies)
│   │   └── types.ts               # Database-generated types (1200+ lines)
│   ├── calculations/
│   │   └── nutrition.ts           # Macro formulas (Cunningham, Tinsley, GET)
│   ├── utils.ts                   # `cn()` for Tailwind merging
│   ├── alerts.ts                  # Alert computation logic (trainer-facing)
│   └── .DS_Store                  # (macOS metadata, should be .gitignored)
├── public/                        # Static assets
│   └── 2.png                      # App logo
├── supabase/                      # Supabase migrations + schema
│   └── schema.sql                 # Database schema (or migration files)
├── middleware.ts                  # Role-based routing + auth enforcement
├── app.config.ts (or next.config.js)   # Next.js configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── CLAUDE.md                      # Project instructions (READ THIS FIRST)
└── .planning/codebase/            # GSD documentation
    ├── ARCHITECTURE.md            # Architecture patterns
    ├── STRUCTURE.md               # (This file)
    └── (CONVENTIONS.md, TESTING.md, CONCERNS.md — when generated)
```

## Directory Purposes

**`app/`:**
- Purpose: All Next.js routes (pages, layouts, Server Actions)
- Key pattern: Route groups `(client)` and `(trainer)` enforce role-based access
- Contains: Pages (Server Components), Server Actions, layouts
- Key files: `middleware.ts` sits at project root, protects all routes

**`app/(auth)/`:**
- Purpose: Public authentication routes
- Contains: Login page (Supabase Auth integration)

**`app/(client)/`:**
- Purpose: All client-facing routes (workout, nutrition, progress, profile)
- Protected by middleware: only users with `role: 'client'` can access
- Layout: Mobile-first (`max-width: 430px`), bottom navigation

**`app/(trainer)/`:**
- Purpose: All trainer-facing routes (dashboard, client management, plan creation)
- Protected by middleware: only users with `role: 'trainer'` can access
- Layout: Desktop-first with collapsible sidebar (256px on md+)

**`components/ui/`:**
- Purpose: Design system primitives (reusable, role-agnostic)
- Naming: PascalCase, e.g., `Card`, `Button`, `StatusBadge`
- All use Tailwind + CSS variables for theming

**`components/client/`:**
- Purpose: Client-specific interactive components
- Examples: `ExerciseCard` (set input), `RestTimer` (countdown), `ProgressCharts` (data viz)
- All Client Components (with `'use client'`) except page-level Server Components

**`components/trainer/`:**
- Purpose: Trainer-specific interactive components
- Examples: `CreateClientModal`, `RoutineBuilder`, `AssignPlanDropdown`
- Dashboard charts in subfolder: `dashboard-charts/`

**`lib/supabase/`:**
- Purpose: Supabase client initialization and type definitions
- Files:
  - `client.ts`: Browser-side Supabase (SSR)
  - `server.ts`: Server-side Supabase (with cookie handling)
  - `types.ts`: Full Database type schema (auto-generated from Supabase, 1200+ lines)

**`lib/calculations/`:**
- Purpose: Business logic for nutrition + fitness calculations
- Example: `nutrition.ts` contains Cunningham BMR formula, Tinsley TDEE, macros

**`middleware.ts`:**
- Purpose: Global request interceptor (auth + role-based routing)
- Checks: User session, role, route match
- Redirects: Unauthenticated → /login, wrong role → /today or /dashboard
- Dev bypass: Skips all auth if `NODE_ENV === 'development'`

**`supabase/`:**
- Purpose: Database schema, migrations, RLS policies
- May contain: SQL files for schema changes or initial setup

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Root page (redirects based on auth + role)
- `app/(auth)/login/page.tsx`: Login page
- `app/(client)/today/page.tsx`: Client dashboard (active workout)
- `app/(trainer)/dashboard/page.tsx`: Trainer dashboard (client overview)

**Configuration:**
- `middleware.ts`: Auth + role routing
- `tailwind.config.ts`: Tailwind config (colors, spacing)
- `tsconfig.json`: TypeScript strict mode
- `package.json`: Dependencies (Next.js, Supabase, Recharts, Lucide, etc.)

**Core Logic:**
- `lib/supabase/server.ts`: Server-side Supabase client (used in every page)
- `lib/supabase/types.ts`: All database types (1200+ lines)
- `lib/alerts.ts`: Trainer alert computation (adherence, weight, frequency)
- `lib/calculations/nutrition.ts`: Macro formulas

**Testing:**
- No dedicated `tests/` folder yet
- Tests would go in co-located `{route}.test.ts` files (Jest/Vitest)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (required by Next.js)
- Layouts: `layout.tsx` (required by Next.js)
- Actions: `actions.ts` (Server Actions, kebab-case filename)
- Components: `PascalCase.tsx` (e.g., `ExerciseCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `utils.ts`, `alerts.ts`)
- Types: Defined inline or in `types.ts` files (no separate `*.types.ts`)

**Directories:**
- Route groups: kebab-case with parentheses, e.g., `(client)`, `(trainer)`, `(auth)`
- Feature folders: kebab-case, e.g., `dashboard-charts/`, `nutrition-plans/`
- Domains: plural, e.g., `clients/`, `routines/`, `plans/`

**Exports:**
- Pages: `export default async function Page() { ... }`
- Server Actions: `export async function actionName(params) { ... }`
- Components: `export default function ComponentName() { ... }`
- Utilities: `export function functionName() { ... }`

## Where to Add New Code

**New Client Feature (e.g., workout history search):**
- Primary code: `app/(client)/history/[sessionId]/page.tsx` (Server Component to fetch session)
- Interactive part: `components/client/session-detail.tsx` (Client Component with filters)
- Actions: `app/(client)/history/actions.ts` (if mutations needed)
- Tests: `app/(client)/history/__tests__/page.test.ts`

**New Trainer Feature (e.g., bulk client export):**
- Primary code: `app/(trainer)/clients/page.tsx` (Server Component lists clients)
- Interactive part: `components/trainer/bulk-export-button.tsx` (Client Component)
- Actions: `app/(trainer)/clients/actions.ts` (export server action)
- Tests: `components/trainer/__tests__/bulk-export-button.test.ts`

**New Calculation (e.g., body recomposition formula):**
- Add to: `lib/calculations/nutrition.ts` or create `lib/calculations/recomposition.ts`
- Export: Named function, e.g., `export function calcRecomposition(...) { ... }`
- Use: Import in Server Components that need it

**New UI Component (e.g., progress circle):**
- Add to: `components/ui/progress-circle.tsx`
- Pattern: No state, receive all data as props
- Use: Import in feature components

**New Role-Specific Component (e.g., trainer coaching note editor):**
- Add to: `components/trainer/coaching-notes-editor.tsx`
- Pattern: `'use client'`, call Server Action for save
- Use: Import in trainer-only routes

## Special Directories

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (run `npm install`)
- Committed: No (in `.gitignore`)

**`.next/`:**
- Purpose: Build artifacts (compiled pages, serverless functions)
- Generated: Yes (run `npm run build`)
- Committed: No (in `.gitignore`)

**`.git/`:**
- Purpose: Git version control metadata
- Generated: Yes (run `git init`)
- Committed: N/A (system folder)

**`.planning/codebase/`:**
- Purpose: GSD documentation (auto-generated)
- Generated: Yes (run `/gsd:map-codebase`)
- Committed: Yes (reference docs for future phases)

---

*Structure analysis: 2025-03-09*
