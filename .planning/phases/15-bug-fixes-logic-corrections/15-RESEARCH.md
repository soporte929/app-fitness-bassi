# Phase 15: Bug Fixes & Logic Corrections - Research

**Researched:** 2026-03-10
**Domain:** UI/UX polish, business logic flow, state persistence, production bugs
**Confidence:** HIGH (all findings verified from direct codebase inspection)

---

## Summary

Phase 15 is a polish and correctness pass over the entire application after Phases 8-14. The requirements span three categories: production bugs (BUG-*), UX feature requests (FEAT-*), and business logic corrections (LOGIC-*). All bugs and logic issues have been confirmed by reading the actual source files — this is not speculative research.

The most critical items are BUG-06 (production "Application error" on client creation — already fixed in v3.0 using admin client, must verify it has not regressed) and LOGIC-01/LOGIC-02 (the trainer sidebar currently exposes both "Rutinas" and "Planes" sections, but the button "Asignar rutina" in client detail incorrectly assigns a `workout_plan` (a routine template) directly to a client rather than assigning a `plan` (from the `plans` table) — violating the documented business flow).

**Primary recommendation:** Address LOGIC-01/LOGIC-02 first as they affect every trainer interaction with clients. Then tackle production bugs (BUG-06, BUG-07, BUG-08), then UI fixes, then FEAT items in complexity order.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Current State (from code inspection) |
|----|-------------|-------------------------------------|
| BUG-01 | Food search input in `/nutrition-plans` loses focus between keystrokes | Needs verification — likely caused by re-render of parent on each keystroke |
| BUG-02 | `Adherencia por cliente` and `Progreso de peso` charts in `/dashboard` have wrong margins, content cut off | `AdherenceChart` has `bottom: 48` but labels are `angle={-35}` — may clip. `WeightTrendChart` has `bottom: 8` — Legend overlaps possible |
| BUG-03 | Form state in `/routines-templates/new` lost when switching steps (days and client selections) | `RoutineBuilder` uses a single `useState` object — state persists between steps. Needs reproduction to confirm if bug still exists |
| BUG-04 | Dropdown for assignment in client detail page has wrong margins, text cut off | `AssignRoutineButton` uses `absolute top-full left-0` — can clip at page edges on mobile |
| BUG-06 | Production "Application error" Digest 2112945886 on client creation | `createClientAction` in `app/(trainer)/clients/actions.ts` already uses `admin.from('clients').insert()` — must verify the admin client is correctly initialized in production (env var `SUPABASE_SERVICE_ROLE_KEY`) |
| BUG-07 | `/routines` does not load in trainer app in production | Route is `/routines-templates` (not `/routines`) — the trainer sidebar links to `/routines-templates`. Need to verify production 404 is not a route mismatch |
| BUG-08 | `/nutrition` does not load in trainer app in production | Trainer sidebar links to `/nutrition-plans` (not `/nutrition`). Same potential mismatch. Need to verify |
| FEAT-01 | `+` Registro Libre button in nutrition view must be inside the container, not floating outside | `AIFoodParserModal` is placed inline in nutrition/page.tsx but `FoodSearchModal` renders as a fixed FAB — this FAB is the floating element that needs to move inside the Registro Libre section border |
| FEAT-02 | Ability to pause an active workout session | `WorkoutSessionPage` only has "Finalizar" button. No pause mechanism exists. Requires adding paused state to `workout_sessions` table or local state |
| FEAT-03 | Dark/light mode toggle in client app | `ThemeToggle` component exists and works in trainer sidebar. Client layout (`app/(client)/layout.tsx`) has no ThemeToggle — header only shows logo |
| FEAT-04 | Fixed headers in client app (history, routines, etc.) when scrolling | Client layout header is `sticky top-0 z-30` — already sticky. Individual page headers may not be sticky. Needs page-by-page review |
| FEAT-05 | Change PWA icon (icon shown when app is added to home screen) | No `manifest.json` or `app/manifest.ts` exists in the project. No PWA icons found in `/public`. Currently uses `favicon.ico` only |
| FEAT-06 | Client profile: editable profile photo and personal data | `ProfilePage` shows data as read-only. No edit form exists. Needs Server Action + client form |
| LOGIC-01 | Flow: Rutinas → Planes → Asignación al cliente. Rutinas are never assigned directly | `AssignRoutineButton` in `clients/[id]/page.tsx` calls `clonePlanToClientAction` which clones a `workout_plan` (template) directly to a client — bypassing the `plans` table entirely. This violates LOGIC-02's documented flow |
| LOGIC-02 | Full plan flow: (1) Trainer creates Rutinas. (2) Trainer creates Planes with rutinas. (3) Trainer assigns a Plan (not rutina) to client with start date. (4) Client sees today's rutina from active plan. (5) Planes section supports CRUD. (6) Button "Asignar rutina" → "Asignar plan" | `clients/[id]/page.tsx` button says "Asignar rutina" (line 264). The `AssignRoutineButton` component bypasses `plans` table. The correct flow uses `plans` → `client_plans` (via `assignPlanToClientAction` in clients/actions.ts, which already exists) |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs needed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js | 16.1.6 | Framework | `params` is a Promise — always `await params` |
| Supabase JS | v2.98.0 | Database | Use explicit FK hints on all joins |
| Recharts | 3.7.0 | Charts | `formatter` must accept `value: number | undefined` |
| Lucide React | installed | Icons | Only icon source allowed |
| Tailwind CSS | installed | Styles | CSS vars `--bg-base`, `--accent`, etc. |

### Supporting
| Library | Purpose | Notes |
|---------|---------|-------|
| `@/lib/supabase/server` | Server Component queries | `await createClient()` |
| `@/lib/supabase/admin` | Admin operations bypassing RLS | `createAdminClient()` — needed for client INSERT |
| `useTransition` | Non-blocking server action calls | Already pattern in codebase |
| `useRef` | Input focus retention fix (BUG-01) | Standard React approach |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React `useRef` for focus | Controlled input with key | `useRef` is simpler and doesn't cause re-render loops |
| New `paused_at` column for FEAT-02 | Local state only | Local state is lost on refresh — column is more durable but requires SQL migration |

---

## Architecture Patterns

### Relevant Existing Patterns

**Server Action pattern (existing):**
```typescript
// app/(trainer)/clients/actions.ts
export async function createClientAction(...): Promise<{ success: boolean; id?: string; error?: string }> {
  const admin = createAdminClient()
  const { data: newClient, error: clientError } = await admin
    .from('clients')
    .insert({ ... })
  // ...
}
```
This pattern (admin client for INSERT) is already correct for BUG-06. Verify the admin client env var is set in Vercel.

**Dropdown absolute positioning (BUG-04 fix pattern):**
```tsx
// current — can clip at right edge
<div className="absolute top-full left-0 mt-2 z-50 min-w-[280px]">

// fix — use right-0 on small containers or add max-w + overflow guard
<div className="absolute top-full right-0 mt-2 z-50 min-w-[280px] max-w-[calc(100vw-2rem)]">
```

**ThemeToggle (exists in trainer sidebar, add to client):**
```tsx
// components/ui/theme-toggle.tsx — import and place in client layout header
import { ThemeToggle } from '@/components/ui/theme-toggle'
// In app/(client)/layout.tsx header:
<header className="sticky top-0 z-30 flex items-center justify-between px-4" ...>
  <Image src="/2.png" ... />
  <ThemeToggle />
</header>
```

**PWA manifest (FEAT-05 — Next.js App Router pattern):**
```typescript
// app/manifest.ts (new file)
import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fitness Bassi',
    short_name: 'Bassi',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#111111',
    background_color: '#111111',
    display: 'standalone',
    start_url: '/today',
  }
}
```
Requires PNG icons in `/public` (192x192 and 512x512). Existing `/public/Black and Yellow Square Fitness Logo.png` can be source material.

**LOGIC-01/02 fix — replace AssignRoutineButton with AssignPlanButton:**

The `AssignRoutineButton` in `clients/[id]/page.tsx` must be replaced with a component that fetches from `plans` (not `workout_plans`) and calls `assignPlanToClientAction` (which already exists in `clients/actions.ts`). The query to fetch plans for a trainer:
```typescript
const { data: plans } = await supabase
  .from('plans')
  .select('id, name, description, phase, level')
  .eq('trainer_id', user.id)
  .eq('active', true)
  .order('created_at', { ascending: false })
```

### Anti-Patterns to Avoid
- **Re-rendering parent on each keystroke (BUG-01):** If a food search input lives in a Server Component that re-fetches on state change, wrap the input in a dedicated Client Component with `useRef` to preserve focus.
- **Assigning workout_plans directly to clients (LOGIC-01):** `clonePlanToClientAction` bypasses the `plans` table. Must replace with `assignPlanToClientAction`.
- **Hardcoded margins in Recharts (BUG-02):** The `AdherenceChart` uses `margin={{ bottom: 48 }}` to accommodate angled labels but the `ResponsiveContainer` height is 220px — the bottom margin may clip bars. Increase container height or reduce angle.
- **`position: fixed` FAB that overlaps section content (FEAT-01):** The `FoodSearchModal` component likely renders a fixed FAB outside the "Registro Libre" section boundary. Solution is to move the trigger button inline as the `AIFoodParserModal` already does.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PWA manifest | Custom HTML `<link>` tags | `app/manifest.ts` (Next.js built-in) | Next.js 13+ App Router auto-serves manifest.json from this file |
| Theme persistence | Custom localStorage hook | Existing `ThemeProvider` + `ThemeToggle` components | Already implemented and working in trainer app |
| Admin Supabase client | New auth bypass | `createAdminClient()` in `lib/supabase/admin.ts` | Already exists, correctly uses service role key |
| Focus management for inputs | Custom event system | `useRef` + `inputRef.current?.focus()` | Standard pattern, already used in `RoutineBuilder` (`EditableDayName` component) |

---

## Common Pitfalls

### Pitfall 1: BUG-06 production regression
**What goes wrong:** Client creation throws "Application error" Digest 2112945886 in production.
**Why it happens:** `SUPABASE_SERVICE_ROLE_KEY` env var missing in Vercel deployment, causing `createAdminClient()` to fail or fall back to anon client.
**How to avoid:** Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables. The code in `actions.ts` is already correct (uses `admin.from('clients').insert()`).
**Warning signs:** Error only happens in production, not in development.

### Pitfall 2: BUG-07/BUG-08 route name confusion
**What goes wrong:** `/routines` 404 in production trainer app.
**Why it happens:** The actual route is `/routines-templates`. Somewhere in the codebase (or old navigation) a link to `/routines` may exist.
**How to avoid:** Search for all links to `/routines` and `/nutrition` in trainer context and verify they point to `/routines-templates` and `/nutrition-plans`.
**Warning signs:** Only in production; dev uses bypass and may not expose nav issues.

### Pitfall 3: LOGIC-01/02 — two competing "assignment" flows
**What goes wrong:** The codebase has two different assignment mechanisms:
  1. `AssignRoutineButton` → `clonePlanToClientAction` → clones a `workout_plan` template directly to client (old/wrong flow)
  2. `AssignClientDropdown` (in `/plans/[planId]/`) → `assignPlanToClient` → inserts into `client_plans` (correct flow)
**Why it happens:** Historical feature drift — Phase 3/v2 built the template clone mechanism before the `plans` table was added.
**How to avoid:** In `clients/[id]/page.tsx`, replace `AssignRoutineButton` entirely with a new `AssignPlanButton` that uses `plans` table + `assignPlanToClientAction`.
**Warning signs:** Client sees "Asignar rutina" label on a button that does something fundamentally different than what LOGIC-02 prescribes.

### Pitfall 4: Recharts angled XAxis labels clipping (BUG-02)
**What goes wrong:** `AdherenceChart` has `angle={-35}` on X-axis labels with `bottom: 48` margin. On narrow containers the bars and labels can overlap.
**Why it happens:** Recharts `angle` on XAxis ticks causes labels to extend beyond the SVG bounds if the bottom margin is insufficient.
**How to avoid:** Either increase container height to 260px, or reduce angle, or use `tick={{ fontSize: 9 }}` to fit more naturally.

### Pitfall 5: ThemeToggle in client layout missing (FEAT-03)
**What goes wrong:** Client app has no theme toggle.
**Root cause:** Client `layout.tsx` header only has the logo. The `ThemeProvider` is active globally (in root layout), and `ThemeToggle` already works — it just needs to be added to the client header.
**How to avoid:** Import `ThemeToggle` and add it to `app/(client)/layout.tsx` header. The toggle is already a `'use client'` component.

### Pitfall 6: Pause workout (FEAT-02) scope
**What goes wrong:** Implementing "pause" without a DB column creates UI-only state that's lost on refresh.
**Options:**
  - **Lightweight:** Local state in `TodayExercisesProgress` — pauses the timer visually but not persisted. Simplest to implement.
  - **Durable:** Add `paused_at TIMESTAMPTZ` column to `workout_sessions` and a Server Action to toggle it.
**Recommendation:** Use local state only (no SQL migration) since the workout session timer already runs client-side.

---

## Code Examples

### BUG-01 — Food search focus fix pattern
```tsx
// Wrap search input in its own Client Component so re-renders of parent don't unmount it
'use client'
import { useRef } from 'react'

export function FoodSearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <input
      ref={inputRef}
      type="search"
      onChange={(e) => onSearch(e.target.value)}
      // key must NOT change between keystrokes — don't pass a changing key prop
    />
  )
}
```

### BUG-02 — Adherence chart margin fix
```tsx
// In adherence-chart.tsx — increase height and adjust margin
<ResponsiveContainer width="100%" height={260}>
  <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 60 }}>
    <XAxis
      angle={-35}
      textAnchor="end"
      tick={{ fontSize: 10, fill: '#a0a0a0' }}
    />
```

### BUG-04 — Dropdown edge clip fix (AssignRoutineButton / future AssignPlanButton)
```tsx
// Change left-0 to right-0 when button is in a right-aligned flex container
<div className="absolute top-full right-0 mt-2 z-50 min-w-[280px] max-h-[70vh] overflow-y-auto ...">
```

### LOGIC-01/02 — AssignPlanButton (replacement for AssignRoutineButton)
```tsx
// New component: app/(trainer)/clients/[id]/assign-plan-button.tsx
// Fetches from 'plans' table; calls existing assignPlanToClientAction
type PlanOption = { id: string; name: string; phase: string | null }

export function AssignPlanButton({ clientId, plans }: { clientId: string; plans: PlanOption[] }) {
  // Same UI pattern as AssignRoutineButton but uses plans, not workout_plans templates
  // Calls: assignPlanToClientAction(planId, clientId) from clients/actions.ts
}
```

In `clients/[id]/page.tsx`, replace the templates query + `AssignRoutineButton` with:
```typescript
// Replace 'workout_plans' query with:
const { data: trainerPlans } = await supabase
  .from('plans')
  .select('id, name, description, phase, level')
  .eq('trainer_id', user.id)
  .eq('active', true)
  .order('created_at', { ascending: false })
```

### FEAT-03 — ThemeToggle in client layout
```tsx
// app/(client)/layout.tsx — add ThemeToggle to header
import { ThemeToggle } from '@/components/ui/theme-toggle'

<header className="sticky top-0 z-30 flex items-center justify-between px-4" ...>
  <Image src="/2.png" ... />
  <ThemeToggle />
</header>
```

### FEAT-05 — PWA manifest
```typescript
// app/manifest.ts (new file)
import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fitness Bassi',
    short_name: 'Bassi',
    description: 'Sistema profesional de entrenamiento personalizado',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    theme_color: '#111111',
    background_color: '#111111',
    display: 'standalone',
    start_url: '/today',
    scope: '/',
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `next-pwa` plugin for PWA | `app/manifest.ts` built-in (Next.js 13.3+) | No extra dependency needed |
| Manual localStorage theme | `ThemeProvider` with `useEffect` on mount | Already implemented in project |
| Direct workout_plan clone to client | Plans table → client_plans relationship | LOGIC-01/02 requires migrating to correct flow |

---

## Open Questions

1. **BUG-07/BUG-08 — exact production error**
   - What we know: Routes in code are `/routines-templates` and `/nutrition-plans` — these exist
   - What's unclear: Is the error a 404 (wrong link) or a runtime error (RLS/data issue)?
   - Recommendation: Check Vercel error logs for the specific error type before coding the fix

2. **BUG-03 — form state loss between steps in RoutineBuilder**
   - What we know: `RoutineBuilder` uses a single `useState` for all state, steps are tabs (not page navigations) — state should persist
   - What's unclear: Whether the bug still exists or was resolved as a side effect of Phase 6
   - Recommendation: Test manually before coding any fix; may be a non-issue

3. **FEAT-02 — pause scope**
   - What we know: No pause mechanism exists; timer runs client-side
   - What's unclear: Whether a DB column is required or local state suffices
   - Recommendation: Local state pause (no SQL migration) — covers the UX need without complexity

4. **FEAT-06 — profile photo storage**
   - What we know: `profiles` table has `avatar_url` column; no Supabase Storage bucket exists for avatars
   - What's unclear: Whether to implement storage bucket or just allow URL input
   - Recommendation: Allow URL input for simplicity (no new storage bucket); edit personal data (full_name) via Server Action

---

## Validation Architecture

No test infrastructure detected in the project. All validation is manual (visual + functional testing in browser). No Wave 0 gaps to address.

Phase gate: Manual QA of each bug fix in both client and trainer flows before marking complete.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading of all affected files
- `app/(trainer)/clients/[id]/assign-routine-button.tsx` — LOGIC-01/02 confirmed
- `app/(trainer)/clients/[id]/page.tsx` — confirmed "Asignar rutina" label and template fetch
- `app/(trainer)/clients/actions.ts` — BUG-06: admin client already used; `assignPlanToClientAction` exists
- `components/trainer/dashboard-charts/adherence-chart.tsx` — BUG-02: margin analysis
- `components/trainer/sidebar.tsx` — ThemeToggle already present
- `app/(client)/layout.tsx` — ThemeToggle absent from client header
- `app/layout.tsx` — no manifest.ts exists
- `public/` directory — no PWA icons present

### Secondary (MEDIUM confidence)
- Next.js App Router `MetadataRoute.Manifest` API — standard feature since Next.js 13.3

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all libraries already installed; no new dependencies
- Architecture: HIGH — all patterns confirmed from source code
- Pitfalls: HIGH — confirmed from direct file reading, not assumptions

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable codebase; only invalidated if more phases run before Phase 15)
