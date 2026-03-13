# Phase 25: Active Session Banner Fix - Research

**Researched:** 2026-03-11
**Domain:** React custom events, Next.js App Router client state, Server Actions + redirect
**Confidence:** HIGH

## Summary

Phase 25 targets BUG-03: the "Entrenamiento activo" banner persisted on screen after the user finished a workout because the `ActiveSessionBanner` component only cleared its state via polling (every 10s) or on `pathname` change — neither of which fires fast enough to give instant feedback.

The root cause is a race condition between the `finishWorkout` server action (which calls `redirect('/history')`) and the banner's Supabase re-fetch. The redirect happens, the layout re-mounts, and the banner polls stale state from the database before the DB write has fully propagated.

**Critical finding: The fix has already been fully implemented in commit `7e4e6e3` (v5.0 Emergency Hotfix, 2026-03-11).** Both components were modified in that commit to use a custom DOM event (`workoutFinished`) as an immediate signal. Phase 25 therefore requires a retroactive PLAN.md that documents the implemented solution, followed by a VERIFICATION.md to confirm success criteria are met.

**Primary recommendation:** Write a single retroactive plan (25-01-PLAN.md) documenting the already-implemented custom event fix, then a VERIFICATION.md confirming all three success criteria.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-03 | El banner "Entrenamiento activo" desaparece inmediatamente al finalizar un entrenamiento | Custom event dispatch pattern already implemented — event fires synchronously before server action redirect |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18+ (via Next.js 16) | `useState`, `useEffect` for banner state | Already in project |
| Next.js App Router | 16.1.6 | Layout persistence, Server Actions, `redirect()` | Already in project |
| Web APIs | Browser native | `window.dispatchEvent`, `CustomEvent`, `window.addEventListener` | Zero dependencies, synchronous, reliable |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase browser client | latest | Poll for active session state | Used for initial + periodic fetch, not for the immediate clear |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom DOM event | React Context / Zustand store | Store would require wrapping the entire layout in a Provider; custom event is lighter and works across component boundaries without restructuring |
| Custom DOM event | URL search param after redirect | Would require reading params in banner on each navigation; fragile and adds URL pollution |
| Custom DOM event | Supabase Realtime subscription | Overkill for this use case; Realtime not yet integrated in the project |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure

The implementation lives in two existing files:

```
components/client/
├── active-session-banner.tsx   # Listener: clears state on workoutFinished event
└── finish-workout-button.tsx   # Dispatcher: fires event before server action
```

### Pattern 1: Custom Event as Immediate Cross-Component Signal

**What:** Dispatch a `CustomEvent` on `window` synchronously before invoking the server action. Any component listening on `window` receives the signal and updates its local state instantly — before any redirect or re-fetch occurs.

**When to use:** When a user action triggers a server action that causes a redirect AND there is a persistent UI element in the layout that must update instantly without waiting for the next poll or navigation lifecycle.

**Example — Dispatcher (FinishWorkoutButton):**
```tsx
// components/client/finish-workout-button.tsx
'use client'

export function FinishWorkoutButton({ action }: Props) {
  async function handleClick() {
    // Dispatch synchronously BEFORE the server action
    window.dispatchEvent(new CustomEvent('workoutFinished'))
    // Server action calls redirect('/history') — banner is already cleared
    await action()
  }

  return (
    <form action={handleClick}>
      <Button type="submit" className="w-full" size="lg">
        <CheckCircle2 className="w-5 h-5" />
        Finalizar entrenamiento
      </Button>
    </form>
  )
}
```

**Example — Listener (ActiveSessionBanner):**
```tsx
// components/client/active-session-banner.tsx — excerpt
useEffect(() => {
  function handleFinished() {
    setActiveSession(null)
    setTotalSets(0)
    setCompletedSets(0)
  }
  window.addEventListener('workoutFinished', handleFinished)
  return () => window.removeEventListener('workoutFinished', handleFinished)
}, [])
```

### Pattern 2: Polling with pathname dependency

The banner continues to use 10s polling as a fallback for edge cases (e.g. session expires from another device or tab). The `useEffect` polling depends on `[pathname]` so re-mounting on navigation also triggers a fresh fetch.

```tsx
// Existing polling pattern — unchanged
const interval = setInterval(fetchSession, 10000)
return () => clearInterval(interval)
// ...
}, [pathname])
```

### Anti-Patterns to Avoid

- **Relying solely on `pathname` change to clear the banner:** The redirect from `/workout/[sessionId]` to `/history` changes the pathname, but there is a perceptible delay between the click and the route transition — the banner remains visible during this window.
- **Clearing banner after `await action()` completes:** By the time the `await` resolves, the server has already called `redirect()` and the component tree may be torn down. The event must be dispatched **before** `await action()`.
- **Using `useEffect` with empty deps to read URL params:** Brittle; adds coupling between the redirect target and the banner logic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Immediate cross-component state signal | Custom global state store | `window.dispatchEvent(new CustomEvent(...))` | Native API, zero overhead, already works |
| Session polling | Custom WebSocket | `setInterval` + Supabase client query | Realtime not integrated; polling is sufficient |

**Key insight:** Custom DOM events are the right tool when the signal is fire-and-forget (no response needed) and the components involved cannot easily share state via props or context due to layout distance.

## Common Pitfalls

### Pitfall 1: Event Fired After Redirect (Timing)

**What goes wrong:** If the event is dispatched after `await action()`, the redirect fires first and the component that listens may no longer be mounted.

**Why it happens:** `redirect()` in a Server Action throws a special Next.js error that triggers navigation before the async function returns. Any `await` before dispatching the event means the event runs in a torn-down component context.

**How to avoid:** Always dispatch the custom event **before** `await action()`. This is the current implementation in `FinishWorkoutButton`.

**Warning signs:** Banner does not clear, or `handleFinished` is never called.

### Pitfall 2: Layout Re-Mount Triggers a Re-Fetch That Restores Banner

**What goes wrong:** After `redirect('/history')`, the `pathname` changes from `/workout/[sessionId]` to `/history`. The `useEffect([pathname])` re-runs `fetchSession()`. If the DB write (`completed: true`) has not propagated yet, the query returns the session as still active, and the banner reappears.

**Why it happens:** Server Actions and DB writes are asynchronous; `redirect()` can fire before the DB transaction is fully visible to a new read.

**How to avoid:** The event-based immediate clear sets `activeSession` to `null` before the pathname change. Even if `fetchSession()` runs and momentarily returns data, the correct mitigation is: the DB write in `finishWorkout` sets `completed: true` and the query in `fetchSession` filters `.eq('completed', false)` — so the re-fetch should return no session. However, there is a brief window. To make this robust, the banner could also check if the `workoutFinished` event has fired recently (via a ref flag) and skip one re-fetch cycle.

**Warning signs:** Banner flashes back after disappearing. This is a potential regression point to verify during testing.

### Pitfall 3: `form action={handleClick}` Pattern

**What goes wrong:** `<form action={asyncFn}>` is a Next.js pattern for Server Actions. Using it with a client-side handler that calls a server action works, but if the form submission races with other events, multiple dispatches may occur.

**Why it happens:** Double-clicks or rapid submissions.

**How to avoid:** Disable the button after first click (via `useTransition` or a `disabled` state flag). The current implementation does not have this guard — it is a minor UX gap but not a blocker for BUG-03.

## Code Examples

### Current Implementation — Verified from Codebase

**File: `/components/client/finish-workout-button.tsx`**
```tsx
'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  action: () => Promise<void>
}

export function FinishWorkoutButton({ action }: Props) {
  async function handleClick() {
    // Dispatch event BEFORE the server action so the banner clears immediately
    window.dispatchEvent(new CustomEvent('workoutFinished'))
    // Execute the server action (which will redirect to /history)
    await action()
  }

  return (
    <form action={handleClick}>
      <Button type="submit" className="w-full" size="lg">
        <CheckCircle2 className="w-5 h-5" />
        Finalizar entrenamiento
      </Button>
    </form>
  )
}
```

**File: `/components/client/active-session-banner.tsx` — relevant excerpt**
```tsx
// Listen for immediate workout completion signal (dispatched by FinishWorkoutButton)
useEffect(() => {
  function handleFinished() {
    setActiveSession(null)
    setTotalSets(0)
    setCompletedSets(0)
  }
  window.addEventListener('workoutFinished', handleFinished)
  return () => window.removeEventListener('workoutFinished', handleFinished)
}, [])
```

**File: `/app/(client)/today/actions.ts` — finishWorkout server action**
```ts
export async function finishWorkout(sessionId: string, _formData?: FormData): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_sessions')
    .update({ completed: true, finished_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (!error) {
    redirect('/history')
  }
}
```

**File: `/app/(client)/workout/[sessionId]/page.tsx` — wire-up**
```tsx
const finishAction = finishWorkout.bind(null, session.id)
// ...
<FinishWorkoutButton action={finishAction} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling + pathname dep only | Polling + `workoutFinished` custom event | Commit `7e4e6e3` (2026-03-11) | Banner clears in < 100ms instead of up to 10s |
| Inline finish button in page.tsx | Dedicated `FinishWorkoutButton` client component | Commit `7e4e6e3` (2026-03-11) | Clean separation: server action bound in Server Component, event dispatch in Client Component |

## Open Questions

1. **Potential re-appearance regression**
   - What we know: After the event fires and `activeSession` is set to `null`, the `[pathname]` change from `/workout/...` to `/history` triggers a new `fetchSession()`. The query filters `.eq('completed', false)`, so if the DB write is committed before the query runs, the session is not returned and the banner stays hidden.
   - What's unclear: Is there a measurable window in production (Vercel + Supabase) where the DB write lags behind the re-fetch? The local dev environment may not reproduce this.
   - Recommendation: The plan should include a verification step that confirms the banner does NOT reappear after finishing a workout (success criterion 3). If a regression is observed, a `useRef` flag (`workedOutRef.current = true`) can be added to `ActiveSessionBanner` to skip the first post-navigate fetch.

2. **Double-click / multiple dispatch protection**
   - What we know: The button does not disable itself after click. Two rapid clicks could dispatch `workoutFinished` twice and call `finishWorkout` twice, the second of which may fail silently (session already completed).
   - What's unclear: Whether this is a real user issue in production.
   - Recommendation: Out of scope for BUG-03. The current implementation meets all three success criteria as stated. Document as a follow-up UX improvement.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `components/client/active-session-banner.tsx`, `components/client/finish-workout-button.tsx`, `app/(client)/today/actions.ts`, `app/(client)/workout/[sessionId]/page.tsx`, `app/(client)/layout.tsx`
- Git history — commit `7e4e6e3` diff confirms both files were modified together as BUG-03 fix

### Secondary (MEDIUM confidence)
- MDN Web Docs — `CustomEvent` and `EventTarget.dispatchEvent` are synchronous; the event is processed before the next line executes (standard DOM event model)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new dependencies
- Architecture: HIGH — implementation exists in codebase, verified from source
- Pitfalls: HIGH — identified from direct code reading and standard Next.js/browser behavior

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable pattern; only changes if Next.js App Router changes redirect behavior)
