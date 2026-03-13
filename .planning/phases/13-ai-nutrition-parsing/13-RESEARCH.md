# Phase 13: AI Nutrition Parsing - Research

**Researched:** 2026-03-10
**Domain:** Claude API integration, Server Actions, multi-step modal UX, food_log persistence
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-01 | El cliente puede abrir un modal y escribir una descripción libre de un alimento | Existing bottom-sheet pattern (FoodSearchModal/NutritionFreeLogSheet) is the direct model to extend |
| AI-02 | La app llama a Claude API server-side y devuelve macros estimados (proteína, grasa, carbos, calorías) | @anthropic-ai/sdk v0.78.0 installed; Server Action pattern confirmed; JSON extraction from text block |
| AI-03 | El cliente ve los macros estimados en un paso de confirmación antes de guardar | Multi-step state within a single 'use client' component; confirm step renders pre-filled editable values |
| AI-04 | Si Claude no puede interpretar, el cliente ve un fallback para entrada manual de macros | Error/fallback branch in same modal state machine; reuses NutritionFreeLogSheet fields pattern |
</phase_requirements>

---

## Summary

Phase 13 adds an AI-powered food parser to the nutrition page. The client types a free-form Spanish description (e.g. "un plato de lentejas con chorizo") and the app asks Claude to estimate the macro breakdown. The result passes through a confirmation step; if Claude fails or produces an unparseable response the client sees a manual-entry fallback.

The project already has the entire food logging stack: `food_log` table, `logFreeFoodAction`, `FoodSearchModal` (existing sliding-drawer pattern), and `@anthropic-ai/sdk v0.78.0` installed. Phase 13 adds one new Server Action that calls Claude and one new Client Component (a multi-step modal) that surfaces the flow. No new libraries, no new DB tables, and no new API routes are needed.

**Primary recommendation:** Implement `parseNutritionAction` as a Server Action in `app/(client)/nutrition/actions.ts`, returning a typed result `{ success: true, data: MacroEstimate } | { success: false, error: string }`. The Client Component manages a 3-step state machine: `input → loading → confirm/fallback`. On confirm, call the existing `logFreeFoodAction` or insert directly via a new `logAIParsedFoodAction`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | 0.78.0 (installed) | Claude API client | Already a project dependency per CLAUDE.md |
| Next.js Server Actions | 16.1.6 | Server-side Claude call, prevents API key exposure | Project pattern for all mutations |
| `food_log` table | — | Persist AI-estimated macros | Phase 11 infrastructure; already typed in `lib/supabase/types.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useTransition` (React) | 19.2.3 | Non-blocking Server Action calls from Client Component | Already used in FoodSearchModal, NutritionFreeLogSheet |
| Lucide React | ^0.577.0 | Icons (Loader2, Sparkles, X, ChevronLeft) | Project standard — no other icon libs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Action | Route Handler `/api/parse-nutrition` | Both work; Server Actions are the established project pattern, simpler for typed results |
| JSON mode via prompt | `client.messages.parse()` + Zod | `parse()` is cleaner but adds Zod dependency; prompt-based JSON extraction is sufficient and zero-dep |

**Installation:** No new packages needed — `@anthropic-ai/sdk` is already installed.

---

## Architecture Patterns

### Recommended File Structure

```
app/(client)/nutrition/
├── actions.ts                  ← ADD parseNutritionAction + logAIParsedFoodAction here
└── (existing files unchanged)

components/client/nutrition/
├── FoodSearchModal.tsx          ← Existing (unchanged)
├── AIFoodParserModal.tsx        ← NEW — 3-step modal ('use client')
├── MacroProgressBars.tsx        ← Existing
└── ClientDailyMeals.tsx         ← Existing

app/(client)/nutrition/page.tsx  ← Add <AIFoodParserModal clientId dateStr /> alongside <FoodSearchModal />
```

### Pattern 1: Server Action for Claude API call

**What:** A `'use server'` function that instantiates `Anthropic`, calls `messages.create()` with a structured prompt, extracts JSON from the text block, and validates the shape before returning.

**When to use:** Anytime Claude API must be called. API key stays server-side only.

```typescript
// Source: @anthropic-ai/sdk v0.78.0 README + CLAUDE.md model spec
'use server'
import Anthropic from '@anthropic-ai/sdk'

export type MacroEstimate = {
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  description: string   // normalized name Claude outputs, e.g. "Lentejas con chorizo (1 plato ~350g)"
}

export async function parseNutritionAction(
  rawDescription: string
): Promise<{ success: true; data: MacroEstimate } | { success: false; error: string }> {
  if (!rawDescription.trim()) return { success: false, error: 'Descripción vacía' }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',   // per CLAUDE.md
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Eres un nutricionista experto. El usuario describe un alimento o comida en español.
Estima los macronutrientes totales (no por 100g, sino de la porción descrita).
Responde SOLO con un JSON válido, sin texto adicional, con esta estructura exacta:
{
  "kcal": <número entero>,
  "protein_g": <número decimal con 1 decimal>,
  "carbs_g": <número decimal con 1 decimal>,
  "fat_g": <número decimal con 1 decimal>,
  "description": "<nombre normalizado de la comida en español>"
}
Si no puedes estimar porque la descripción es ininteligible, responde: {"error": "no_parse"}

Descripción del usuario: "${rawDescription.trim()}"`,
        },
      ],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'Sin respuesta de texto de Claude' }
    }

    // Strip markdown code fences if present
    const raw = textBlock.text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(raw)

    if (parsed.error === 'no_parse') {
      return { success: false, error: 'Claude no pudo interpretar la descripción' }
    }

    const estimate: MacroEstimate = {
      kcal: Math.round(Number(parsed.kcal) || 0),
      protein_g: Number((Number(parsed.protein_g) || 0).toFixed(1)),
      carbs_g: Number((Number(parsed.carbs_g) || 0).toFixed(1)),
      fat_g: Number((Number(parsed.fat_g) || 0).toFixed(1)),
      description: String(parsed.description || rawDescription),
    }

    return { success: true, data: estimate }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
```

### Pattern 2: Multi-step modal state machine (Client Component)

**What:** A single `'use client'` component manages 4 possible states: `idle | loading | confirm | fallback`. No router navigation — all state lives in `useState`. The component receives `clientId` and `dateStr` as props from the Server Component parent.

**When to use:** Multi-step flows where no URL change is needed and all state is ephemeral.

```typescript
// Source: project patterns from FoodSearchModal.tsx + NutritionFreeLogSheet.tsx
type Step = 'input' | 'loading' | 'confirm' | 'fallback'

// State shape
const [step, setStep] = useState<Step>('input')
const [description, setDescription] = useState('')
const [estimate, setEstimate] = useState<MacroEstimate | null>(null)

// Editable override fields shown in 'confirm' step — pre-filled from estimate
const [overrides, setOverrides] = useState({ kcal: '', protein_g: '', carbs_g: '', fat_g: '' })
```

**Step transitions:**
```
[input]  → submit → [loading] → success → [confirm]
                              → error   → [fallback]
[confirm] → "Atrás" → [input]
[confirm] → "Guardar" → call logAIParsedFoodAction → close
[fallback] → "Guardar" → call logAIParsedFoodAction → close
[fallback] → "Atrás" → [input]
```

### Pattern 3: logAIParsedFoodAction — inserting AI macros into food_log

**What:** The existing `food_log` table stores `food_id | dish_id` with `grams`. It does NOT have free-text macro columns. For AI-parsed foods, we need to insert into `nutrition_logs` (legacy free-text table that already supports `meal_name`, `kcal`, `protein_g`, `carbs_g`, `fat_g`).

**Critical finding:** Two food logging paths exist in this project:

| Path | Table | When Used |
|------|-------|-----------|
| `logFreeFoodAction` | `food_log` | Food from database (has `food_id` or `dish_id`) |
| `createNutritionFreeLogAction` | `nutrition_logs` | Free text entry with manual macros |

AI-parsed food has no `food_id` — it is a described dish. Therefore it must go into `nutrition_logs` using the same path as `NutritionFreeLogSheet`. The `logAIParsedFoodAction` is effectively identical to `createNutritionFreeLogAction` and **can reuse it directly** rather than creating a new action.

```typescript
// Reuse existing action from free-log-actions.ts
import { createNutritionFreeLogAction } from './free-log-actions'

// In confirm/save handler:
await createNutritionFreeLogAction({
  clientId,
  foodName: estimate.description,
  grams: null,         // unknown grams for described portion
  calories: estimate.kcal,
  proteinG: estimate.protein_g,
  carbsG: estimate.carbs_g,
  fatG: estimate.fat_g,
})
```

### Anti-Patterns to Avoid

- **Calling Claude from a `'use client'` component directly:** Exposes the API key. Always use Server Actions.
- **Using `fetch()` inside a Client Component to call `/api/parse-nutrition`:** Unnecessary — Server Actions achieve the same with better TypeScript types.
- **Storing raw API response without JSON parsing guard:** Claude may wrap JSON in markdown fences (` ```json ... ``` `) — strip them before `JSON.parse`.
- **Creating a new DB table for AI food logs:** The existing `nutrition_logs` table already stores free-text macros. No migration needed.
- **Using streaming for this use case:** A single structured JSON response is small (< 100 tokens). Non-streaming is simpler and correct.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON extraction from Claude text | Custom regex parser | Strip code fences, then `JSON.parse()` | Claude reliably produces valid JSON when prompted correctly; over-engineering adds fragility |
| Fallback UI | New component | Reuse `NutritionFreeLogSheet` field structure | Same fields (kcal, protein, carbs, fat), same styling conventions |
| Food log insertion | New DB table | `nutrition_logs` via `createNutritionFreeLogAction` | Already implemented, typed, and tested in Phase 11 |
| Loading state | Custom spinner | `<Loader2 className="animate-spin" />` from Lucide | Project standard |

**Key insight:** This phase is primarily UX wiring. The heavy infrastructure (Claude SDK, food_log/nutrition_logs tables, bottom-sheet modal pattern, Server Action template) all exist. The value is in the multi-step state machine and the prompt quality.

---

## Common Pitfalls

### Pitfall 1: Claude wraps JSON in markdown code fences

**What goes wrong:** Response text is ` ```json\n{...}\n``` ` — `JSON.parse()` throws.
**Why it happens:** Claude sometimes adds code fences even when instructed not to.
**How to avoid:** Always strip before parsing:
```typescript
const raw = text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
```
**Warning signs:** `SyntaxError: Unexpected token` in the Server Action catch block.

### Pitfall 2: Numeric fields returned as strings by Claude

**What goes wrong:** `parsed.kcal` is `"350"` (string) not `350` (number). TypeScript types lie because we cast.
**Why it happens:** JSON stringification inconsistency in LLM outputs.
**How to avoid:** Always coerce with `Number(parsed.kcal)` and round/fix explicitly.

### Pitfall 3: `useTransition` and async Server Actions

**What goes wrong:** Developer uses `await serverAction()` outside `startTransition` — blocks render.
**Why it happens:** Common mistake when adapting existing code.
**How to avoid:** Always wrap Server Action calls in `startTransition`:
```typescript
startTransition(async () => {
  const result = await parseNutritionAction(description)
  // update state
})
```
This is the exact pattern used in `FoodSearchModal.tsx` and `NutritionFreeLogSheet.tsx`.

### Pitfall 4: Missing ANTHROPIC_API_KEY in environment

**What goes wrong:** `Anthropic()` constructor throws at runtime in production.
**Why it happens:** Key not set in Vercel environment variables (only in local `.env.local`).
**How to avoid:** Return a meaningful `{ success: false, error: 'Servicio no disponible' }` in the catch block. Add a validation guard at the top of the action:
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  return { success: false, error: 'Servicio de IA no configurado' }
}
```

### Pitfall 5: AI modal conflicts with existing FoodSearchModal FAB

**What goes wrong:** Two `position: fixed` FABs (+ icons) at the same screen position conflict visually.
**Why it happens:** Both `FoodSearchModal` and the new AI modal could render a FAB at `bottom: 80, right: 16`.
**How to avoid:** The AI modal entry point should be inside the nutrition page content as an inline button, NOT a floating FAB. Or offset the FABs (e.g. AI modal FAB at `bottom: 144`). The existing `FoodSearchModal` FAB owns `bottom: 80, right: 16`.

### Pitfall 6: Long Claude response time blocks UX

**What goes wrong:** Claude takes 3-8 seconds; user sees frozen UI if loading state isn't shown immediately.
**Why it happens:** LLM latency is real.
**How to avoid:** Set `step = 'loading'` BEFORE calling `startTransition` so the UI updates first; show a spinner with "Claude está analizando..." message.

---

## Code Examples

### Full Server Action (verified pattern)

```typescript
// Source: @anthropic-ai/sdk v0.78.0 README + established project Server Action conventions
'use server'
import Anthropic from '@anthropic-ai/sdk'

export type MacroEstimate = {
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  description: string
}

export async function parseNutritionAction(
  rawDescription: string
): Promise<{ success: true; data: MacroEstimate } | { success: false; error: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'Servicio de IA no configurado' }
  }
  if (!rawDescription.trim()) {
    return { success: false, error: 'Descripción vacía' }
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Eres un nutricionista experto. Estima los macronutrientes totales de la porción descrita.
Responde SOLO con JSON válido sin texto adicional:
{"kcal":<int>,"protein_g":<float>,"carbs_g":<float>,"fat_g":<float>,"description":"<nombre en español>"}
Si no puedes estimar, responde: {"error":"no_parse"}

Descripción: "${rawDescription.trim()}"`,
      }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'Respuesta vacía de Claude' }
    }

    const raw = textBlock.text.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(raw)

    if (parsed.error === 'no_parse') {
      return { success: false, error: 'No se pudo interpretar la descripción' }
    }

    return {
      success: true,
      data: {
        kcal: Math.round(Number(parsed.kcal) || 0),
        protein_g: Number((Number(parsed.protein_g) || 0).toFixed(1)),
        carbs_g: Number((Number(parsed.carbs_g) || 0).toFixed(1)),
        fat_g: Number((Number(parsed.fat_g) || 0).toFixed(1)),
        description: String(parsed.description || rawDescription),
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, error: msg }
  }
}
```

### Modal state machine skeleton

```typescript
// Source: adapted from FoodSearchModal.tsx and NutritionFreeLogSheet.tsx patterns
'use client'
import { useState, useTransition } from 'react'
import { parseNutritionAction, type MacroEstimate } from '@/app/(client)/nutrition/actions'
import { createNutritionFreeLogAction } from '@/app/(client)/nutrition/free-log-actions'

type Step = 'input' | 'loading' | 'confirm' | 'fallback'

export function AIFoodParserModal({ clientId }: { clientId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [description, setDescription] = useState('')
  const [estimate, setEstimate] = useState<MacroEstimate | null>(null)
  const [manualKcal, setManualKcal] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFat, setManualFat] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAnalyze = () => {
    setStep('loading')
    startTransition(async () => {
      const result = await parseNutritionAction(description)
      if (result.success) {
        setEstimate(result.data)
        // Pre-fill manual fields for the confirm step (editable)
        setManualKcal(String(result.data.kcal))
        setManualProtein(String(result.data.protein_g))
        setManualCarbs(String(result.data.carbs_g))
        setManualFat(String(result.data.fat_g))
        setStep('confirm')
      } else {
        setStep('fallback')
      }
    })
  }

  const handleSave = (fromFallback = false) => {
    startTransition(async () => {
      await createNutritionFreeLogAction({
        clientId,
        foodName: estimate?.description || description,
        grams: null,
        calories: Number(manualKcal) || 0,
        proteinG: Number(manualProtein) || null,
        carbsG: Number(manualCarbs) || null,
        fatG: Number(manualFat) || null,
      })
      closeModal()
    })
  }

  const closeModal = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep('input')
      setDescription('')
      setEstimate(null)
    }, 300)
  }

  // Render bottom sheet with step-specific content
  // ...
}
```

### Nutrition page integration point

```typescript
// Source: app/(client)/nutrition/page.tsx (existing file)
// Add alongside the existing <FoodSearchModal /> at the bottom of the JSX
<FoodSearchModal clientId={client.id} dateStr={currentDateString} />
<AIFoodParserModal clientId={client.id} />
```

**Entry point placement:** An inline "Analizar con IA" button inside the "Registro libre" section header (not a second FAB) avoids the FAB conflict pitfall.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `completions` endpoint | `messages.create()` | SDK v0.x → 1.x (done) | Project uses messages API — correct |
| Streaming for structured data | Non-streaming + JSON parse | — | Non-streaming is simpler for small responses |
| Route Handlers for AI | Server Actions | Next.js 14+ | Project has no `/app/api/` directory — Server Actions are the established pattern |

**Deprecated/outdated:**
- `.completions` API: project uses `messages.create()` — correct, no change needed.
- Streaming for JSON: overkill for <256 token responses; non-streaming is the right choice here.

---

## Open Questions

1. **Entry point for AI modal**
   - What we know: `FoodSearchModal` already occupies the FAB at `bottom: 80, right: 16`.
   - What's unclear: Whether the planner wants a second FAB, an inline button, or a tab inside `FoodSearchModal`.
   - Recommendation: Inline "Analizar con IA" button in the "Registro libre" section header (avoids FAB conflict, clear UX).

2. **Model version**
   - What we know: CLAUDE.md specifies `claude-sonnet-4-20250514`. SDK version 0.78.0 supports this.
   - What's unclear: Whether this model ID is still valid in production at time of execution.
   - Recommendation: Use `claude-sonnet-4-20250514` as specified in CLAUDE.md. If deprecated, SDK will log a warning.

3. **ANTHROPIC_API_KEY presence**
   - What we know: No `.env.local` or `.env` found in project root — key is presumably set in Vercel environment or the dev machine's shell.
   - What's unclear: Whether the key is already configured for local dev.
   - Recommendation: Add a guard in the action; document that `ANTHROPIC_API_KEY` must be in `.env.local` for local dev.

---

## Sources

### Primary (HIGH confidence)
- `@anthropic-ai/sdk v0.78.0` (installed in `node_modules/`) — instantiation, `messages.create()`, `content[].text` extraction
- `app/(client)/nutrition/actions.ts` (project file) — `logFreeFoodAction`, `searchFoodsAction`, existing Server Action shape
- `app/(client)/nutrition/free-log-actions.ts` (project file) — `createNutritionFreeLogAction`, exact reuse target
- `components/client/nutrition/FoodSearchModal.tsx` (project file) — bottom-sheet pattern, `useTransition` usage, FAB position
- `app/(client)/nutrition/NutritionFreeLogSheet.tsx` (project file) — fallback UI fields, form pattern
- `lib/supabase/types.ts` (project file) — `food_log` Row/Insert, `nutrition_logs` Row/Insert
- `CLAUDE.md` (project instructions) — model name `claude-sonnet-4-20250514`, Server Action conventions, no `any`, `@/` imports

### Secondary (MEDIUM confidence)
- `node_modules/@anthropic-ai/sdk/README.md` — usage examples verified against installed version
- `node_modules/@anthropic-ai/sdk/src/resources/messages/messages.ts` — `create()` signature, non-streaming return type

### Tertiary (LOW confidence)
- Claude API JSON mode reliability: based on general Claude model knowledge; prompt used is prescriptive and includes `no_parse` escape hatch to handle failures.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, no new deps
- Architecture: HIGH — directly derived from existing project patterns (FoodSearchModal, NutritionFreeLogSheet, Server Actions)
- Pitfalls: HIGH — code fence stripping and numeric coercion verified from SDK source; FAB conflict visible in existing component code
- Claude prompt quality: MEDIUM — JSON prompting is reliable but LLM behavior is probabilistic; `no_parse` fallback handles edge cases

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable stack; Anthropic model deprecations are the main risk)
