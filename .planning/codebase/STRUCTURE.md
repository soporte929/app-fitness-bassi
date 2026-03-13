# Codebase Structure

**Analysis Date:** 2025-03-10

## Directory Layout

```
app-fitness-bassi/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (fonts, theme, metadata)
│   ├── page.tsx                 # Root redirect
│   ├── (auth)/                  # Auth routes (public)
│   │   └── login/page.tsx
│   ├── (client)/                # Client-only routes (protected)
│   │   ├── layout.tsx           # Client layout (nav, timer, banners)
│   │   ├── today/
│   │   │   ├── page.tsx         # Today's workout redirect
│   │   │   └── actions.ts       # saveSetLog, finishWorkout
│   │   ├── workout/[sessionId]/
│   │   │   └── page.tsx         # Active session UI
│   │   ├── routines/
│   │   │   ├── page.tsx         # List user's plans
│   │   │   └── [planId]/page.tsx # Plan detail with start button
│   │   ├── history/
│   │   │   ├── page.tsx         # Past sessions feed
│   │   │   └── [sessionId]/page.tsx # Session detail
│   │   ├── nutrition/
│   │   │   ├── page.tsx         # Daily meal checklist
│   │   │   ├── actions.ts       # upsertMealLogAction
│   │   │   ├── shopping-list/page.tsx
│   │   │   └── [other]
│   │   ├── progress/
│   │   │   ├── page.tsx         # Weight/measurement charts
│   │   │   └── actions.ts       # Log weight/measurements
│   │   ├── profile/
│   │   │   ├── page.tsx         # User profile, logout
│   │   │   └── actions.ts       # Profile updates
│   │   └── revisions/page.tsx   # Trainer feedback
│   └── (trainer)/               # Trainer-only routes (protected)
│       ├── layout.tsx           # Trainer layout (sidebar)
│       ├── dashboard/page.tsx   # Overview, charts, alerts
│       ├── clients/
│       │   ├── page.tsx         # Searchable client list
│       │   ├── clients-list.tsx # Client Component
│       │   ├── actions.ts       # CRUD client data
│       │   └── [id]/
│       │       ├── page.tsx     # Client detail tabs
│       │       ├── edit-panel.tsx # Client editing
│       │       ├── history/page.tsx # Client's sessions
│       │       ├── revisions/
│       │       │   ├── page.tsx # Feedback list
│       │       │   ├── new/page.tsx # Create feedback
│       │       │   └── actions.ts
│       │       └── nutrition-actions.ts
│       ├── plans/
│       │   ├── page.tsx         # List workout plans
│       │   ├── new/page.tsx     # Create plan form
│       │   ├── actions.ts       # Plan CRUD
│       │   └── [planId]/
│       │       ├── page.tsx     # Plan detail with routines
│       │       └── plan-routines-manager.tsx
│       ├── routines-templates/
│       │   ├── page.tsx         # List routine templates
│       │   ├── new/page.tsx     # Create routine
│       │   ├── actions.ts       # Routine CRUD
│       │   └── [planId]/page.tsx # Routine detail
│       ├── nutrition-plans/
│       │   ├── page.tsx         # List meal plans
│       │   ├── new/page.tsx     # Create new plan
│       │   ├── create/page.tsx  # Plan builder
│       │   ├── actions.ts       # Plan CRUD
│       │   ├── dishes/
│       │   │   ├── page.tsx     # Dish library
│       │   │   └── actions.ts
│       │   └── templates.ts     # Reusable meal templates
│       └── exercises/page.tsx   # Exercise library
│
├── components/                   # Reusable React components
│   ├── ui/                       # Design system (Card, Button, Badge, etc.)
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── alert-banner.tsx
│   │   ├── stat-card.tsx
│   │   ├── mini-chart.tsx
│   │   ├── page-transition.tsx
│   │   ├── loading-screen.tsx
│   │   ├── select.tsx
│   │   └── theme-toggle.tsx
│   ├── client/                   # Client-role components
│   │   ├── nav.tsx              # Bottom navigation
│   │   ├── sidebar.tsx          # (unused?)
│   │   ├── exercise-card.tsx    # Set/rep input card (interactive)
│   │   ├── session-detail.tsx
│   │   ├── session-history-card.tsx
│   │   ├── rest-timer.tsx       # Global rest timer (interactive)
│   │   ├── active-session-banner.tsx # Current session indicator
│   │   ├── today-exercises-progress.tsx
│   │   ├── plan-day-card.tsx
│   │   ├── history-filters.tsx
│   │   ├── progress-charts.tsx  # Weight/measurement trend charts
│   │   ├── progress/
│   │   │   ├── LogWeightModal.tsx
│   │   │   └── LogMeasurementsModal.tsx
│   │   └── nutrition/
│   │       ├── ClientDailyMeals.tsx
│   │       ├── MacroProgressBars.tsx
│   │       ├── AIFoodParserModal.tsx
│   │       ├── FoodSearchModal.tsx
│   │       └── NutritionFreeLogSheet.tsx
│   ├── trainer/                  # Trainer-role components
│   │   ├── sidebar.tsx          # Collapsible navigation
│   │   ├── template-card.tsx
│   │   ├── create-client-modal.tsx
│   │   ├── delete-client-dialog.tsx
│   │   ├── dashboard-charts/
│   │   │   ├── adherence-chart.tsx
│   │   │   ├── weight-trend-chart.tsx
│   │   │   └── phase-distribution-chart.tsx
│   │   └── [other feature components]
│   └── providers/
│       └── theme-provider.tsx   # Dark/light theme context
│
├── lib/                          # Utilities and business logic
│   ├── supabase/
│   │   ├── types.ts             # Generated Database type definitions
│   │   ├── server.ts            # Server-side Supabase client factory
│   │   ├── client.ts            # Browser-side Supabase client factory
│   │   └── admin.ts             # Admin-level operations
│   ├── calculations/
│   │   └── nutrition.ts         # Cunningham, Tinsley, GET formulas
│   ├── alerts.ts                # Alert computation from metrics
│   ├── pr-detection.ts          # Personal record calculation
│   ├── utils.ts                 # cn() helper
│   └── [other utilities]
│
├── middleware.ts                 # Request-level auth enforcement
│
├── public/                       # Static assets
│   ├── 2.png                    # Brand logo
│   └── [icons, images]
│
├── supabase/                     # Schema & migrations
│   └── migrations/              # SQL migration files
│
├── .planning/                    # Documentation (this file)
│   ├── codebase/               # Architecture analysis
│   ├── phases/                 # Feature implementation phases
│   └── migrations/             # Database changes
│
├── package.json                 # Dependencies (React 19, Next 16, Supabase, Recharts)
├── tsconfig.json               # TypeScript config (strict, @/* path alias)
├── next.config.ts              # Next.js config
└── CLAUDE.md                   # Development guidelines

```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router pages and layouts
- Contains: Page.tsx Server Components, route groupings, layout nesting
- Key files: `(client)/layout.tsx`, `(trainer)/layout.tsx`, `middleware.ts`

**`components/ui/`:**
- Purpose: Reusable design system elements
- Contains: Card, Button, Badge, AlertBanner, StatCard, MiniChart, PageTransition, LoadingScreen
- Pattern: All use Tailwind CSS with CSS variables for theming

**`components/client/`:**
- Purpose: Client-role interactive components
- Contains: ExerciseCard, SessionDetail, RestTimer, ProgressCharts, NutritionChecklist
- Pattern: All marked `'use client'`; receive data as props from Server Components

**`components/trainer/`:**
- Purpose: Trainer-role views and modals
- Contains: TrainerSidebar, DashboardCharts, ClientModals, TemplateCards
- Pattern: All marked `'use client'`; interactive state management

**`lib/supabase/`:**
- Purpose: Database connectivity and type safety
- Contains: Client factories (server.ts, client.ts), type definitions (types.ts)
- Pattern: `createClient()` async function returns typed `Database` instance

**`lib/calculations/`:**
- Purpose: Pure business logic
- Contains: Nutrition formulas (Cunningham BMR, GET calorie calc)
- Pattern: No side effects, export functions like `calculateBMR()`, `calculateGET()`

**`.planning/codebase/`:**
- Purpose: Architecture & structure documentation
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — Root HTML structure, fonts, theme provider
- `middleware.ts` — Auth enforcement on every request
- `app/(client)/layout.tsx` — Client navigation layout
- `app/(trainer)/layout.tsx` — Trainer sidebar layout

**Configuration:**
- `tsconfig.json` — TypeScript strict mode, path aliases (@/*)
- `next.config.ts` — Next.js build config
- `package.json` — Dependencies and scripts

**Core Logic:**
- `lib/supabase/server.ts` — Server-side DB client creation
- `lib/supabase/types.ts` — TypeScript Database type definitions
- `lib/alerts.ts` — Alert generation logic for dashboard
- `lib/calculations/nutrition.ts` — Nutrition calculation formulas

**Testing:**
- Not detected — no test files found in repo

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Server Component by default)
- Layouts: `layout.tsx`
- Actions: `actions.ts` (co-located with page)
- Components: PascalCase (`ExerciseCard.tsx`)
- Utilities: camelCase (`createClient.ts`)
- Types: camelCase (`types.ts`)

**Directories:**
- Feature routes: kebab-case (`workout-sessions/`, `nutrition-plans/`)
- UI components: lowercase (`ui/`, `client/`, `trainer/`)
- Dynamic routes: `[id]`, `[sessionId]` (square brackets)
- Route groups: `(client)`, `(trainer)`, `(auth)` (parentheses, not in URL)

**TypeScript:**
- Types imported from `lib/supabase/types.ts` (never redefined)
- Database types: `Database['public']['Tables']['table_name']['Row|Insert|Update']`
- Component props: Inline `interface ComponentProps { ... }`

## Where to Add New Code

**New Feature (e.g., new trainer module):**
- Page: `app/(trainer)/new-feature/page.tsx` (Server Component)
- Actions: `app/(trainer)/new-feature/actions.ts` (Server Actions)
- Components: `components/trainer/new-feature/` (Client Components as needed)
- Types: Extend `lib/supabase/types.ts` if adding DB tables
- Tests: Co-locate with components (not currently used)

**New Component/Module:**
- Implementation: `components/[ui|client|trainer]/ComponentName.tsx`
- Props: Inline interface at top of file
- Imports: Use `@/` alias (`import { cn } from '@/lib/utils'`)
- Styling: Use Tailwind CSS with CSS variables (`text-[var(--text-primary)]`)

**Utilities/Helpers:**
- Shared calculations: `lib/calculations/` (e.g., `nutrition.ts`)
- Shared alerts: `lib/alerts.ts`
- PR detection: `lib/pr-detection.ts`
- Styling helpers: `lib/utils.ts` (cn() function)

**Server Actions:**
- Location: `actions.ts` in the feature's route directory
- Pattern: `'use server'` at file top, then list all actions
- Signature: `async function name(params: Types): Promise<Result>`
- Called from: Client Components via direct import
- Example: `import { saveSetLog } from '@/app/(client)/today/actions'`

## Special Directories

**`.planning/`:**
- Purpose: Architecture and phase documentation
- Generated: Yes (GSD outputs)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, phases/, migrations/

**`.next/`:**
- Purpose: Next.js build cache
- Generated: Yes
- Committed: No (.gitignore)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`public/`:**
- Purpose: Static assets served as-is
- Contains: `2.png` (brand logo), favicon (if any)
- Pattern: Import via `/public/filename` in HTML or use `Image` component

**`supabase/migrations/`:**
- Purpose: Database schema changes
- Pattern: SQL files with timestamps in filename
- Example: `20250310_add_nutrition_columns.sql`

---

*Structure analysis: 2025-03-10*
