# Coding Conventions

**Analysis Date:** 2025-03-10

## Naming Patterns

**Files:**
- Kebab-case for files: `exercise-card.tsx`, `create-client-modal.tsx`, `nutrition-actions.ts`
- Page routes use parentheses for grouping: `(client)`, `(trainer)`, `(auth)`
- Dynamic routes use brackets: `[id]`, `[planId]`, `[sessionId]`

**Functions:**
- camelCase for all functions: `saveSetLog()`, `calculateNutrition()`, `computeAlerts()`
- Server Actions marked with `'use server'` directive
- Action functions follow pattern: `{resource}Action()` e.g., `updateClientAction()`, `createClientAction()`, `deleteClientAction()`
- Getter/calculator functions: `calculate*()`, `compute*()` e.g., `calculateNutrition()`, `computeAlerts()`

**Variables:**
- camelCase for local variables: `sessionId`, `weightKg`, `statusFilter`, `myLastLogs`
- SQL column names use snake_case (from database): `weight_kg`, `body_fat_pct`, `started_at`
- State variables in components: `useState()` values follow camelCase: `sets`, `expanded`, `savingIdx`
- Constants use UPPERCASE: `ACTIVITY_FACTORS`, `ACTIVITY_LABELS`, `statusLabels`

**Types:**
- PascalCase for types and interfaces: `ExerciseWithSets`, `ClientItem`, `SetState`, `NutritionInput`, `NutritionResult`
- Type prefixes for database rows: `ExerciseRow`, `SetLogRow`, `ClientItem` (for UI props)
- Supabase types imported from `@/lib/supabase/types`: `type { Database } from '@/lib/supabase/types'`

**Components:**
- PascalCase for React components: `ExerciseCard`, `ClientsList`, `EditClientPanel`, `PageTransition`
- UI components: `Button`, `Card`, `StatusBadge`, `AlertBanner`, `StatCard`, `MiniChart`
- Modal/Dialog components: `*Modal`, `*Dialog` suffixes

**CSS Classes:**
- Tailwind utility-first with CSS variables for colors
- CSS custom properties: `var(--text-primary)`, `var(--bg-surface)`, `var(--accent)`, `var(--success)`, `var(--warning)`, `var(--danger)`
- Class strings stored in constants: `const inputClass = '...'` for reusable patterns

## Code Style

**Formatting:**
- ESLint config: `eslint.config.mjs` with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run linting: `npm run lint`
- No explicit Prettier configuration; ESLint handles formatting
- 2-space indentation (standard Next.js)

**Linting:**
- ESLint 9.x with strict TypeScript checking enabled
- All imports must use `@/` path aliases, never relative paths
- Unused imports removed automatically by linter

## Import Organization

**Order:**
1. React and Next.js imports: `import { useState } from 'react'`, `import { redirect } from 'next/navigation'`
2. Next.js components: `import Link from 'next/link'`, `import Image from 'next/image'`
3. External libraries: `import { cn } from 'clsx'`, `import { Check } from 'lucide-react'`
4. Absolute path imports (with `@/`): `import { createClient } from '@/lib/supabase/server'`
5. Type imports: `import type { Database } from '@/lib/supabase/types'`

**Path Aliases:**
- All imports use `@/` prefix: `@/lib`, `@/components`, `@/app`
- Configured in `tsconfig.json`: `"@/*": ["./*"]`
- Never use relative imports like `../../../`

**Barrel Files:**
- Used in `components/ui/` for re-exporting: `export { Button } from './button'`
- Simplifies imports: `import { Button, Card } from '@/components/ui'` instead of individual files

## Error Handling

**Patterns:**
- Server Actions return typed objects: `{ success: boolean; error?: string }` or `{ success: boolean; id?: string; error?: string }`
- Redirect on success using `redirect('/path')` from `next/navigation`
- Check user authentication: `if (!user) redirect('/login')`
- Use `notFound()` for missing resources: `if (!rawClient) notFound()`
- Throw errors with descriptive messages in Server Actions: `throw new Error('No autenticado')`
- Database errors checked via `.error` property: `if (error) throw new Error(error.message)`

**Rollback Pattern (in createClientAction):**
```typescript
// If profile creation fails, rollback auth user
if (profileError) {
  await admin.auth.admin.deleteUser(profileId)
  return { success: false, error: profileError.message }
}
```

**Optional Field Handling:**
- Use `?.` optional chaining: `data?.phone`, `profile?.role`
- Use nullish coalescing: `bodyFatPct ?? 0`, `sessions.data ?? []`
- Type casting for ambiguous FK joins: `const profile = rawClient.profile as { full_name: string; email: string } | null`

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- Minimal logging in production code
- Comments for complex logic instead of verbose logging
- No console.log in committed code (linted by ESLint)
- Use TypeScript error types for diagnostics

## Comments

**When to Comment:**
- Complex calculation logic: `// Fat-Free Mass`, `// Bonus por pasos (cada 1000 pasos sobre 5000 base = ~50 kcal)`
- Non-obvious algorithmic choices: `// Usamos la media como recomendada`
- Important constraints: `// PRODUCTION: requires SUPABASE_SERVICE_ROLE_KEY env var in Vercel`
- RLS/Security notes: `// NOTE: Ensure this RLS policy exists in Supabase SQL Editor:`
- Rollback logic: `// Rollback: borrar usuario de auth y profile huérfano`

**JSDoc/TSDoc:**
- Function signatures include parameter types via TypeScript
- Complex types documented inline: `type ExerciseWithSets = Pick<...> & { set_logs: [...]; isPR?: boolean }`
- No JSDoc comments; rely on TypeScript inference

**Comment Style:**
- Use `//` for single-line comments (not `/* */`)
- Comment explains WHY, not WHAT (code shows WHAT)
- Comments in Spanish for business logic domain (nutrition, training, phases)
- Comments in English for technical implementation details

## Function Design

**Size:** Functions typically 20–50 lines; complex business logic extracted to helpers

**Parameters:**
- Prefer object parameters for multiple arguments (destructuring):
  ```typescript
  export async function saveSetLog({
    sessionId,
    exerciseId,
    setNumber,
    weightKg,
    reps,
    rir,
    completed = true,
  }: {
    sessionId: string
    exerciseId: string
    setNumber: number
    weightKg: number
    reps: number
    rir: number
    completed?: boolean
  }): Promise<{ success: boolean }>
  ```
- Typed parameters always; no `any`

**Return Values:**
- Async Server Actions return `Promise<void>` (redirect on success) or `Promise<{ success, error?, id? }>`
- Calculation functions return typed objects: `Promise<NutritionResult>`, `Promise<{ success: boolean }>`
- Use `satisfies` keyword for type-safe literals: `satisfies SetLogInsert`

**Async/Await:**
- All async operations use `async/await`, not `.then()` chains
- Server Actions marked `'use server'` and `async`
- Client Components use `useTransition()` hook for async mutations: `const [isPending, startTransition] = useTransition()`

## Module Design

**Exports:**
- Named exports for functions and components: `export function calculateNutrition() { ... }`
- Default export for page components: `export default function TodayPage() { ... }`
- Type exports: `export type NutritionInput = { ... }`

**File Organization:**
- Actions in `actions.ts` alongside route (e.g., `app/(trainer)/clients/actions.ts`)
- Utilities in `lib/`: calculations, formatting, types
- UI components in `components/`: buttons, cards, modals
- Type definitions: `lib/supabase/types.ts` for database types

## Server vs Client Components

**Default: Server Components** - Fetch data at build/request time

```typescript
// ✅ CORRECT — Server Component
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>...</div>
}
```

**Client Components: `'use client'` only for interactive state**

```typescript
// ✅ CORRECT — Client Component only for interactivity
'use client'
const [sets, setSets] = useState<SetState[]>()
const [isPending, startTransition] = useTransition()
const handleComplete = (i: number) => { ... }
```

**Pattern: Server Component fetches → Client Component renders + interacts**
- `app/(client)/today/page.tsx` (Server) → `components/client/exercise-card.tsx` (Client)
- Data passed as props; Client Component never fetches

## Type Safety

**TypeScript Configuration:**
- `strict: true` in `tsconfig.json`
- `noEmit: true` — type checking only, no code generation
- No `any` types; use `unknown` with type guards if needed

**Database Types:**
- Import from `@/lib/supabase/types`: `import type { Database } from '@/lib/supabase/types'`
- Extract row types: `type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']`
- Extract insert types: `type SetLogInsert = Database['public']['Tables']['set_logs']['Insert']`

**Supabase Query Pattern:**
```typescript
const { data: client } = await supabase
  .from('clients')
  .select('id, weight_kg, phase')
  .eq('profile_id', user.id)
  .single()
  // .error property contains error if any
```

---

*Convention analysis: 2025-03-10*
