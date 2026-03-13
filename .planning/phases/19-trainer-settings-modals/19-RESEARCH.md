# Phase 19: Trainer Settings & Modals — Research

**Researched:** 2026-03-10
**Domain:** Next.js App Router — Trainer UI, Dialog/Modal patterns, Supabase nutrition templates, Settings Hub
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| V41-06 | En el detalle del cliente (`/clients/[id]`), existe un botón "Asignar plan nutricional" que abre un Dialog listando plantillas y permite elegir fecha de inicio | Covered by Dialog pattern + assignOwnNutritionTemplateAction already exists in `/nutrition-plans/actions.ts`; new Server Action needed that accepts `startDate` |
| V41-07 | Existe una nueva ruta de Ajustes (Settings Hub) para el entrenador con secciones para gestión de cuenta/UI | Covered by new route `app/(trainer)/settings/page.tsx` + sidebar link addition |
</phase_requirements>

---

## Summary

Phase 19 has two independent deliverables: (1) replace or augment the existing "Asignar plan" button in `/clients/[id]` with an "Asignar plan nutricional" button that opens a proper Dialog listing `nutrition_plans` templates (where `is_template = true`) and captures a start date before assigning; (2) create a new `/settings` route for the trainer that serves as a hub for account and UI preferences.

The nutrition plan assignment modal already has most of its infrastructure in place. `assignOwnNutritionTemplateAction` in `/nutrition-plans/actions.ts` already clones a template into a client-assigned plan. What is missing is (a) a trigger on the client detail page, (b) fetching trainer templates from the server page and passing them as props, and (c) a date picker input before confirming the assignment. The existing `EditNutritionPlanModal` pattern (fixed overlay + scroll container) is the correct UI shape to replicate.

The Settings Hub is a brand-new Server Component page at `app/(trainer)/settings/page.tsx`. It needs a sidebar navigation entry (`/settings`, icon `Settings` from Lucide). Based on the success criteria "secciones para gestión de cuenta/UI", the minimum viable content is: profile/account section (trainer name, email) and UI preferences section (dark/light mode toggle, already implemented via `ThemeToggle`). No new backend logic required for v4.1 scope.

**Primary recommendation:** Build two focused plans — Plan 1: `AssignNutritionPlanModal` on client detail page; Plan 2: Settings Hub page + sidebar entry.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 | Server Components, routing | Project standard |
| `@supabase/ssr` | existing | Server-side Supabase client | Project standard — `createClient()` from `lib/supabase/server` |
| Lucide React | existing | Icons exclusively | Project constraint from CLAUDE.md |
| Tailwind CSS (CSS vars) | existing | Styling via `var(--*)` tokens | Project standard post Phase 17 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useTransition` (React) | built-in | Non-blocking Server Action calls | Assign button to avoid full-page freeze |
| `useRouter` + `router.refresh()` | Next.js built-in | Optimistic update after Server Action | After successful plan assignment |
| `revalidatePath` | Next.js built-in | Invalidate server cache | In Server Actions after mutations |

### No new dependencies needed

All required functionality is achievable with the existing stack. No `npm install` required.

---

## Architecture Patterns

### Recommended File Structure

```
app/(trainer)/clients/[id]/
├── page.tsx                          # server — fetch templates + pass as props (MODIFY)
├── assign-nutrition-plan-modal.tsx   # 'use client' — new Dialog component
├── nutrition-actions.ts              # server actions (MODIFY — add assignFromTemplateAction)
├── assign-plan-button.tsx            # existing workout plan button (UNCHANGED)
├── edit-nutrition-plan-modal.tsx     # existing modal (UNCHANGED)
└── edit-panel.tsx                    # existing (UNCHANGED)

app/(trainer)/settings/
└── page.tsx                          # server — Settings Hub

components/trainer/
└── sidebar.tsx                       # 'use client' — add Settings link (MODIFY)
```

### Pattern 1: Server Page Fetches Templates, Passes to Client Modal

**What:** `page.tsx` (Server Component) fetches all `nutrition_plans` where `is_template = true` and `trainer_id = user.id`. Passes the array as props to the new `AssignNutritionPlanModal` Client Component.

**When to use:** Any time a client modal needs data that exists at page-load time — avoids client-side Supabase fetch.

**Example:**
```typescript
// In page.tsx (server) — add to existing Promise.all
const nutritionTemplatesRes = await supabase
  .from('nutrition_plans')
  .select('id, name, kcal_target, protein_target_g, carbs_target_g, fat_target_g, meals_count, diet_type')
  .eq('trainer_id', user.id)
  .eq('is_template', true)
  .order('created_at', { ascending: false })

type NutritionTemplate = {
  id: string
  name: string
  kcal_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  meals_count: number | null
  diet_type: 'A' | 'B' | 'C' | null
}
const nutritionTemplates = (nutritionTemplatesRes.data ?? []) as NutritionTemplate[]
```

### Pattern 2: Client Modal With Date Picker + Server Action

**What:** `AssignNutritionPlanModal` is a `'use client'` component with: (a) list of templates, (b) date input for start date, (c) calls a new Server Action that wraps `assignOwnNutritionTemplateAction` but also stores `created_at = startDate`.

**Pattern from existing code:** See `edit-nutrition-plan-modal.tsx` — fixed overlay div with `z-50`, scroll container, sticky header with close button. Replicate this shape exactly.

**Example structure:**
```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assignNutritionTemplateToClientAction } from './nutrition-actions'

type NutritionTemplate = { id: string; name: string; kcal_target: number | null; /* ... */ }

export function AssignNutritionPlanModal({
  clientId,
  clientName,
  templates,
}: {
  clientId: string
  clientName: string
  templates: NutritionTemplate[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleAssign() {
    if (!selectedTemplateId) return
    setError(null)
    startTransition(async () => {
      const result = await assignNutritionTemplateToClientAction(selectedTemplateId, clientId, clientName, startDate)
      if (!result.success) { setError(result.error ?? 'Error'); return }
      router.refresh()
      setOpen(false)
    })
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Asignar plan nutricional
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* sticky header, list of templates, date input, confirm button */}
          </div>
        </div>
      )}
    </>
  )
}
```

### Pattern 3: New Server Action for Template Assignment with Start Date

**What:** Add `assignNutritionTemplateToClientAction` to `nutrition-actions.ts` in the client detail route. It reuses the `assignOwnNutritionTemplateAction` logic from `/nutrition-plans/actions.ts` but passes `startDate` as `created_at`.

```typescript
// In app/(trainer)/clients/[id]/nutrition-actions.ts
export async function assignNutritionTemplateToClientAction(
  templatePlanId: string,
  clientId: string,
  clientName: string,
  startDate: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Verify auth
  // 2. Fetch template plan + meals from nutrition_plans where is_template=true
  // 3. Deactivate existing active plans for clientId
  // 4. Insert new nutrition_plans row with created_at = startDate, is_template=false
  // 5. Clone meals into nutrition_plan_meals
  // 6. revalidatePath(`/clients/${clientId}`)
  // 7. return { success: true }
}
```

**CRITICAL NOTE:** Do NOT call `redirect()` inside this action — the existing `assignNutritionPlanAction` redirects to `/nutrition-plans` which is wrong for this modal use-case. Return `{ success: boolean }` and let the component call `router.refresh()`.

### Pattern 4: Settings Hub as Minimal Server Component

**What:** `app/(trainer)/settings/page.tsx` is a Server Component that reads the trainer's profile and renders static sections for account info and UI controls.

```typescript
// app/(trainer)/settings/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageTransition } from '@/components/ui/page-transition'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-6">Ajustes</h1>
        {/* Section: Cuenta */}
        {/* Section: Apariencia — ThemeToggle already works */}
      </div>
    </PageTransition>
  )
}
```

### Pattern 5: Adding Sidebar Entry

**What:** In `components/trainer/sidebar.tsx`, add a "Ajustes" item to the navigation array. Use the `Settings` icon from Lucide.

```typescript
import { Settings } from 'lucide-react'

// In navigation array, new section or appended to "Principal":
{ label: "Ajustes", href: "/settings", icon: Settings }
```

**Placement:** Add as a third item in the "Principal" section, or create a new "Sistema" section. The sidebar currently has "Principal" (Dashboard, Clientes) and "Herramientas" (Rutinas, Planes, Nutrición, Ejercicios). Settings fits best in "Principal" or as its own section.

### Anti-Patterns to Avoid

- **Using `redirect()` inside a Server Action called from a modal:** Causes navigation away, closing the modal unexpectedly. Return `{ success: boolean; error?: string }` instead and handle navigation in the component.
- **Client-side Supabase fetch for template list:** Templates should be fetched in the Server Component parent page and passed as props — avoids hydration mismatch and unnecessary client bundle.
- **Using `as any` for nutrition_plans:** The type `Database['public']['Tables']['nutrition_plans']['Row']` is fully typed. Use it directly. `nutrition_plan_meals` is also fully typed.
- **Forgetting `revalidatePath` after assignment:** The client detail page won't reflect the new active plan until the cache is invalidated.
- **Hardcoded colors:** Phase 17 established CSS vars (`var(--bg-surface)`, `var(--text-primary)`, etc.). All new UI must use CSS vars exclusively.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal/Dialog overlay | Custom portal/teleport logic | Custom fixed overlay `div` (already in project — see `edit-nutrition-plan-modal.tsx`) | Project already uses this pattern consistently; no dependency on `@radix-ui/react-dialog` |
| Date input | Custom date picker component | Native `<input type="date">` styled with Tailwind | No calendar dependency needed; native date input works cross-platform on trainer desktop |
| Template duplication logic | Custom copy logic | `assignOwnNutritionTemplateAction` logic from `/nutrition-plans/actions.ts` | Already handles deactivate-then-insert + meals clone |

**Key insight:** The hardest part of this phase is NOT the UI — it's correctly wiring the existing `assignOwnNutritionTemplateAction` to work without `redirect()`. Extract the core logic into a shared helper or duplicate it in the new action file.

---

## Common Pitfalls

### Pitfall 1: redirect() inside modal Server Action
**What goes wrong:** `assignNutritionPlanAction` in `/nutrition-plans/actions.ts` calls `redirect('/nutrition-plans')`. If the new action is derived from it (copy-paste), it will redirect the trainer away from the client detail page mid-modal.
**Why it happens:** The original action was designed for a full-page form flow, not a modal.
**How to avoid:** Write `assignNutritionTemplateToClientAction` from scratch (or copy without the `redirect` line). Return `{ success: true }` and let the Client Component call `router.refresh()`.
**Warning signs:** After clicking "Asignar", user is navigated to `/nutrition-plans` instead of staying on client detail.

### Pitfall 2: `is_template = null` vs `false`
**What goes wrong:** Querying `.eq('is_template', true)` will miss rows where `is_template` is `null` (not just `false`). But the bigger issue is when a plan assigned to a client accidentally gets `is_template = null` instead of `false`.
**Why it happens:** The `nutrition_plans` Insert type has `is_template?: boolean | null`. If omitted, defaults to `null`, not `false`.
**How to avoid:** Always explicitly set `is_template: false` when inserting a client-assigned plan. When querying templates, `.eq('is_template', true)` is correct (it excludes `null` rows via strict equality).
**Warning signs:** Template list is empty despite templates existing; or assigned plans appear in template list.

### Pitfall 3: `params` is a Promise
**What goes wrong:** Accessing `params.id` instead of `(await params).id` causes a runtime error in Next.js 16.1.6.
**Why it happens:** Established project gotcha — params is async in this Next.js version.
**How to avoid:** Already handled in existing `page.tsx`. No change needed here; just don't break it when modifying `page.tsx`.
**Warning signs:** TypeScript error on params access; runtime crash.

### Pitfall 4: FK hints on nutrition plan joins
**What goes wrong:** Querying `nutrition_plan_meals(...)` without explicit FK hint may fail if PostgREST can't determine direction.
**Why it happens:** PostgREST picks wrong FK direction without hints.
**How to avoid:** Use `nutrition_plan_meals!nutrition_plan_meals_plan_id_fkey(...)` when embedding. Check existing `page.tsx` in `/nutrition-plans` for the correct FK hint names used.
**Warning signs:** Empty arrays where meals should be populated; PostgREST ambiguous FK error.

### Pitfall 5: Settings page — hardcoded trainer name "Bassi"
**What goes wrong:** The sidebar user section has `<p>Bassi</p>` hardcoded. The Settings page should show the real trainer name from `profiles`.
**Why it happens:** Quick implementation without auth context in sidebar.
**How to avoid:** In `settings/page.tsx`, query `profiles` table and display `profile.full_name`. This is read-only display for v4.1; editing trainer account data is out of scope.
**Warning signs:** Settings page shows wrong/empty name.

---

## Code Examples

### Querying nutrition plan templates in Server Component

```typescript
// Source: established project pattern — types.ts + server.ts
import type { Database } from '@/lib/supabase/types'

type NutritionTemplate = Pick<
  Database['public']['Tables']['nutrition_plans']['Row'],
  'id' | 'name' | 'kcal_target' | 'protein_target_g' | 'carbs_target_g' | 'fat_target_g' | 'meals_count' | 'diet_type'
>

const { data: nutritionTemplates } = await supabase
  .from('nutrition_plans')
  .select('id, name, kcal_target, protein_target_g, carbs_target_g, fat_target_g, meals_count, diet_type')
  .eq('trainer_id', user.id)
  .eq('is_template', true)
  .order('created_at', { ascending: false })
  .returns<NutritionTemplate[]>()
```

### Date input with today's default (no dependency)

```tsx
// Native date input — no library needed
<input
  type="date"
  value={startDate}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => setStartDate(e.target.value)}
  className="flex h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
/>
```

### Server Action — assign template to client with start date

```typescript
// Source: derived from assignOwnNutritionTemplateAction in /nutrition-plans/actions.ts
// Key difference: no redirect(), accepts startDate, revalidates client detail path
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/types'

export async function assignNutritionTemplateToClientAction(
  templatePlanId: string,
  clientId: string,
  clientName: string,
  startDate: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // 1. Fetch template
  const { data: template, error: tErr } = await supabase
    .from('nutrition_plans')
    .select('id, name, trainer_id, kcal_target, protein_target_g, carbs_target_g, fat_target_g, diet_type, meals_count')
    .eq('id', templatePlanId)
    .eq('trainer_id', user.id)
    .eq('is_template', true)
    .single()
  if (tErr || !template) return { success: false, error: 'Plantilla no encontrada' }

  // 2. Deactivate existing plans for client
  await supabase.from('nutrition_plans').update({ active: false }).eq('client_id', clientId)

  // 3. Insert new plan with startDate as created_at
  const { data: newPlan, error: pErr } = await supabase
    .from('nutrition_plans')
    .insert({
      client_id: clientId,
      trainer_id: user.id,
      name: template.name,
      kcal_target: template.kcal_target,
      protein_target_g: template.protein_target_g,
      carbs_target_g: template.carbs_target_g,
      fat_target_g: template.fat_target_g,
      diet_type: template.diet_type,
      meals_count: template.meals_count,
      active: true,
      is_template: false,
      created_at: new Date(startDate).toISOString(),
    })
    .select('id')
    .single<{ id: string }>()
  if (pErr || !newPlan) return { success: false, error: pErr?.message ?? 'Error al crear plan' }

  // 4. Clone meals
  const { data: meals } = await supabase
    .from('nutrition_plan_meals')
    .select('name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_grams, meal_time, order_index')
    .eq('plan_id', templatePlanId)
    .order('order_index', { ascending: true })

  if (meals && meals.length > 0) {
    await supabase.from('nutrition_plan_meals').insert(
      meals.map(m => ({ ...m, plan_id: newPlan.id }))
    )
  }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}
```

### Adding Settings to sidebar navigation

```typescript
// In components/trainer/sidebar.tsx — modify navigation array
import { Settings, LayoutDashboard, Users, /* ... */ } from 'lucide-react'

const navigation = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clientes", href: "/clients", icon: Users },
      { label: "Ajustes", href: "/settings", icon: Settings },
    ],
  },
  // "Herramientas" section unchanged
]
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Inline dropdown `AssignPlanButton` (workout plans) | Full Dialog modal overlay | Better UX for complex assignments with date picker |
| No settings route | `/settings` hub | Central place for trainer account/UI prefs |
| `ThemeToggle` only accessible from sidebar bottom | Also accessible in `/settings` | Discoverable preference management |

**Deprecated/outdated:**
- The existing `assign-routine-button.tsx` pattern (dropdown, not dialog): acceptable for simple one-click assignment, but Phase 19 requires a dialog with a date picker — don't use dropdown for nutrition plan assignment.

---

## Open Questions

1. **What should Settings Hub contain beyond account info and ThemeToggle?**
   - What we know: Success criteria says "secciones para gestión de cuenta/UI"
   - What's unclear: Whether "cuenta" means read-only display or editable profile fields
   - Recommendation: Read-only display (name, email from profiles) + ThemeToggle. Editing trainer profile is out of scope for v4.1 given success criteria wording. If trainer name edit is needed, it follows the same pattern as Phase 18 client profile edit.

2. **Should the "Asignar plan nutricional" button replace or supplement the existing "Asignar plan" (workout) button?**
   - What we know: Success criteria says "el botón secundario es 'Asignar plan nutricional'" — implies the secondary action button in the header becomes this new button
   - What's unclear: Whether "Asignar plan" (workout plans) should remain or be moved
   - Recommendation: Keep both buttons. The existing "Asignar plan" (workout) stays as-is. Add "Asignar plan nutricional" as a new secondary button next to it. The header currently has `Revisiones` + `AssignPlanButton` — add the nutrition button between them or replace the workout button if the success criteria strictly says "el botón secundario".

3. **If no templates exist, what does the modal show?**
   - What we know: Empty state pattern is established — see `assign-plan-button.tsx` empty state
   - Recommendation: Show an empty state message with a link to `/nutrition-plans` to create templates first.

---

## Sources

### Primary (HIGH confidence)
- `/app/(trainer)/clients/[id]/page.tsx` — existing client detail page, all current queries and components
- `/app/(trainer)/clients/[id]/nutrition-actions.ts` — existing `saveNutritionPlanAction`
- `/app/(trainer)/nutrition-plans/actions.ts` — `assignOwnNutritionTemplateAction`, `assignNutritionPlanAction`
- `/lib/supabase/types.ts` — `nutrition_plans` Row type (id, name, is_template, diet_type, meals_count, etc.)
- `/components/trainer/sidebar.tsx` — existing navigation structure to modify
- `/app/(trainer)/clients/[id]/edit-nutrition-plan-modal.tsx` — modal overlay pattern to replicate

### Secondary (MEDIUM confidence)
- Phase decisions in STATE.md: `[Phase 10]: start_date stored as created_at in nutrition_plans` — confirms `created_at` approach for start date
- Phase decisions in STATE.md: `[Phase 10]: Deactivate existing active plans before inserting new one` — deactivate-then-insert pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all patterns verified in existing code
- Architecture: HIGH — both deliverables have direct analogues in existing codebase
- Pitfalls: HIGH — `redirect()` in Server Actions and `is_template` nullable are verified from existing code inspection

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable patterns, 30-day window)
