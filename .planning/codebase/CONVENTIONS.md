# Coding Conventions

**Analysis Date:** 2025-03-09

## Naming Patterns

**Files:**
- Components: PascalCase, e.g., `ExerciseCard.tsx`, `ClientsListUI.tsx`
- Pages: kebab-case with `/` for routes, e.g., `page.tsx` in `app/(client)/today/`
- Actions/utilities: kebab-case, e.g., `nutrition-checklist.tsx`, `actions.ts`
- Directories: kebab-case, e.g., `routines-templates`, `nutrition-plans`

**Functions:**
- All functions use camelCase: `calcStreak()`, `updateSet()`, `saveSetLog()`, `objectiveToGoal()`
- Server actions explicitly marked with `'use server'` directive at file top
- Action functions suffix with `Action` for exported server actions: `updateClientAction()`, `createClientAction()`, `deleteClientAction()`, `assignPlanToClientAction()`

**Variables:**
- State: camelCase, e.g., `sets`, `expanded`, `isPending`, `savingIdx`, `statusFilter`
- Constants: UPPER_SNAKE_CASE for module-level constants
  - Example: `ACTIVITY_FACTORS`, `ACTIVITY_LABELS`, `PHASE_LABELS`, `statusLabels`, `statusDotColor`
- Type/interface names: PascalCase, e.g., `SetState`, `ExerciseWithSets`, `ClientNutritionData`
- Database rows: append `Row` suffix, e.g., `ExerciseRow`, `SetLogRow`, `NutritionPlanRow`

**Types:**
- Extracted union types named explicitly, e.g., `type Phase = "recomposition" | "deficit" | "volume" | "maintenance" | "surplus"`
- Imported from `lib/supabase/types.ts` — never redefine
- Always extract types from Database generic at file scope when needed
  - Example: `type Phase = Database['public']['Tables']['clients']['Row']['phase']`

## Code Style

**Formatting:**
- ESLint config: `eslint.config.mjs` with `eslint-config-next` (core-web-vitals + typescript)
- No explicit Prettier config — using Next.js defaults
- **Line width:** Not enforced; observed code uses natural breaks (~80-120 chars)
- **Indentation:** 2 spaces

**Linting:**
- ESLint v9 with Next.js rules enabled
- Run: `npm run lint`
- Config file: `/eslint.config.mjs`
- No TypeScript errors allowed; `strict: true` in `tsconfig.json`

## Import Organization

**Order:**
1. React/Next.js core imports (`import { ... } from 'react'`, `from 'next/...'`)
2. External packages (e.g., `lucide-react`, `@supabase/...`)
3. Internal lib imports (e.g., `@/lib/supabase/...`, `@/lib/utils`)
4. Component imports (e.g., `@/components/...`)
5. Type-only imports (e.g., `import type { Database } from '@/lib/supabase/types'`)

**Example from `app/(client)/today/page.tsx`:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageTransition } from '@/components/ui/page-transition'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Flame, Dumbbell } from 'lucide-react'
import { finishWorkout } from './actions'
import { TodayExercisesProgress } from '@/components/client/today-exercises-progress'
```

**Path Aliases:**
- Root alias: `@/` → project root
- Used consistently across all files
- Never use relative imports (`../..`) in imports

## Error Handling

**Patterns:**
- Server Actions throw `Error` with descriptive message on auth failure: `throw new Error('No autenticado')`
- Client-facing actions return `{ success: boolean; error?: string }` tuple
  - Example from `createClientAction()`: `return { success: false, error: 'Ya existe un cliente con ese email' }`
- Supabase errors passed through directly: `if (error) throw new Error(error.message)`
- No silent failures; always propagate or explicitly handle
- Redirect on auth failure: `if (!user) redirect('/login')`
- Redirect after successful mutation (from `finishWorkout`): `if (!error) { redirect('/history') }`

**Patterns in async flows:**
```typescript
const { error } = await supabase.from(...).update(...)
if (error) throw new Error(error.message)
```

## Logging

**Framework:** `console` (global browser API)
- No custom logger in use
- Previous code notes that all `console.log` debug statements have been removed (see git history)
- Only use console for development diagnostics, not in production code

**Patterns:**
- Avoid logging in pages/components unless essential for debugging
- If needed, use: `console.error()` for errors, `console.log()` for debug

## Comments

**When to Comment:**
- Comment security-critical patterns: `// Seguridad: verificar que el cliente pertenece al trainer`
- Comment about rollback patterns: `// Rollback: borrar el usuario de auth para no dejar datos huérfanos`
- Comment about RLS policies and constraints: `// NOTE: Ensure this RLS policy exists in Supabase SQL Editor:`
- Don't comment obvious code; use clear naming instead

**JSDoc/TSDoc:**
- Not consistently used in this codebase
- Where used, follows simple pattern: `/** Cálculos nutricionales según el Método Bassi */`
- Recommended for public utility functions like `calculateNutrition()` but not enforced

## Function Design

**Size:**
- Small functions preferred; utility functions 5-20 lines
- Page components typically 50-100 lines (server component with async queries)
- Client components range 100-300+ lines (e.g., `ExerciseCard` is 304 lines with state management)

**Parameters:**
- Prefer object destructuring for multiple parameters
  - Example: `function saveSetLog({ sessionId, exerciseId, setNumber, ... })`
  - Reduces positional argument errors
- Server action signatures use object params when 2+ args: `updateClientAction(clientId: string, data: { ... })`
- Single simple params can be positional: `finishWorkout(sessionId: string, ...)`

**Return Values:**
- Async server actions return `Promise<void>` when redirecting, or `Promise<{ success: boolean; ... }>` when needing feedback
- Synchronous functions return values directly (not wrapped in Promise)
- Utility functions like `calcStreak()` return simple types (`number`)

## Module Design

**Exports:**
- Named exports standard for components: `export function ExerciseCard({ ... })`
- Default exports for page components: `export default async function TodayPage()`
- Type exports: `export type ExerciseWithSets = ...`

**Barrel Files:**
- Not used extensively; imports are direct from source files
- Example of direct import: `from '@/components/client/exercise-card'` not `from '@/components/client'`

**Component Props:**
- Props typed inline with `ComponentProps` pattern or explicit interface
  - Example from `ExerciseCard`:
    ```typescript
    export function ExerciseCard({
      exercise,
      sessionId,
      lastSetLogs = [],
      onSetCountChange,
    }: {
      exercise: ExerciseWithSets
      sessionId: string
      lastSetLogs?: LastSetLog[]
      onSetCountChange?: (exerciseId: string, completedSets: number) => void
    })
    ```

## Server vs Client Components

**Server Components (default):**
- All pages are server components unless they need interactive state
- Query data in server component, pass to client children as props
- Pattern: `export default async function PageName() { ... const data = await query; return <ClientComponent data={data} /> }`
- Example: `app/(client)/today/page.tsx` is server component, calls `TodayExercisesProgress` client component

**Client Components (`'use client'`):**
- Only for interactive state: form inputs, toggles, timers
- Must include `'use client'` directive at top of file
- Examples: `ExerciseCard`, `ClientsListUI`, `EditPanel` (all interactive state management)
- Receive data as props from server parents

**Server Actions:**
- In `actions.ts` files alongside routes
- Always mark `'use server'` at top of file
- Called directly from client components (not form submission only)
- Examples: `saveSetLog()`, `finishWorkout()`, `updateClientAction()`

## TypeScript Patterns

**Strict Mode:** Enabled (`"strict": true` in tsconfig.json)
- No `any` types allowed
- Explicit type annotations required for function parameters
- Null/undefined checked explicitly

**Type Extraction Pattern:**
```typescript
import type { Database } from '@/lib/supabase/types'

// Extract specific row type
type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']

// Extract subset of columns with Pick
type ClientNutritionData = Pick<
  Database['public']['Tables']['clients']['Row'],
  'id' | 'weight_kg' | 'phase' | 'objective'
>
```

**Utility Types:**
- `Partial<>` for optional updates
- `Pick<>` for column subsets
- `Record<>` for lookup objects (e.g., `Record<Phase, string>`)

## Database Query Patterns

**Never use `SELECT *`:**
- Always specify columns explicitly
- Example: `.select('id, name, muscle_group, target_sets, target_reps, target_rir, order_index')`

**Foreign Key Hints (Critical):**
- When joining ambiguous relations, use explicit FK hint syntax
- Example: `profile:profiles!clients_profile_id_fkey (full_name, email)`
- Without hints, PostgREST may pick wrong FK direction and return empty arrays
- Example: `set_logs!set_logs_session_id_fkey (...)` not just `set_logs (...)`

**Casting for TypeScript:**
- After joins, explicitly cast if TypeScript doesn't infer
  - Example: `const profile = rawClient.profile as { full_name: string; email: string } | null`

**Query Chaining:**
- Use method chaining for readability: `.eq()`, `.order()`, `.limit()`
- Example:
  ```typescript
  const { data } = await supabase
    .from('clients')
    .select('id, phase, goal')
    .eq('trainer_id', user.id)
    .order('joined_date', { ascending: false })
  ```

---

*Convention analysis: 2025-03-09*
