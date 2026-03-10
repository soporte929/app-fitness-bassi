---
phase: 13-ai-nutrition-parsing
plan: "02"
subsystem: nutrition-ui
tags: [ai, modal, client-component, nutrition]
dependency_graph:
  requires:
    - 13-01  # parseNutritionAction + MacroEstimate
  provides:
    - AIFoodParserModal component
    - AI flow entry point in nutrition page
  affects:
    - app/(client)/nutrition/page.tsx
tech_stack:
  added: []
  patterns:
    - 4-step modal state machine (input | loading | confirm | fallback)
    - useTransition for async Server Action calls
    - Inline trigger button (not FAB) to avoid z-index conflicts
key_files:
  created:
    - components/client/nutrition/AIFoodParserModal.tsx
  modified:
    - app/(client)/nutrition/page.tsx
decisions:
  - AIFoodParserModal renders its own inline trigger button — not a FAB — so it doesn't conflict with FoodSearchModal's fixed FAB at bottom-right
  - step set to 'loading' BEFORE startTransition to ensure spinner renders immediately without waiting for React's transition batching
  - z-[90] for AI modal overlay (one level above FoodSearchModal's z-[80]) so both can coexist
  - fallback step keeps description state as foodName fallback when no estimate.description is available
metrics:
  duration: "~2m"
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 13 Plan 02: AI Nutrition Parser UI Summary

**One-liner:** 4-step AI modal (input → loading → confirm → fallback) wired into nutrition page Registro libre header with inline trigger button and z-[90] overlay above existing FoodSearchModal.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build AIFoodParserModal Client Component | 175bd93 | components/client/nutrition/AIFoodParserModal.tsx |
| 2 | Wire AIFoodParserModal into nutrition/page.tsx | 4ac7627 | app/(client)/nutrition/page.tsx |

## What Was Built

### AIFoodParserModal (`components/client/nutrition/AIFoodParserModal.tsx`)

Full 4-step `'use client'` modal component:

- **input step:** Textarea for food description + "Analizar" button. Inline validation before calling `parseNutritionAction`.
- **loading step:** Non-interactive spinner (`Loader2 animate-spin`) with "Claude está analizando..." text. Step set to `'loading'` before `startTransition` so the spinner appears immediately.
- **confirm step:** Pre-filled editable numeric inputs (Kcal, Proteina, Carbos, Grasa) from `MacroEstimate`. Shows `estimate.description` as subtitle. "Atrás" returns to input; "Guardar" calls `createNutritionFreeLogAction`.
- **fallback step:** Empty editable inputs + name field pre-filled with original description. Shows `errorMsg` in a red-tinted banner. "Atrás" returns to input; "Guardar" calls `createNutritionFreeLogAction`.

Trigger button is a small inline button (not fixed, not a FAB) with `Sparkles` icon — designed to sit in the "Registro libre" section header.

### nutrition/page.tsx update

- Imported `AIFoodParserModal` from `@/components/client/nutrition/AIFoodParserModal`
- Rendered `<AIFoodParserModal clientId={client.id} />` inside the "Registro libre" section header flex container
- `FoodSearchModal` (FAB) left untouched
- Page remains a Server Component (no `'use client'` added)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `components/client/nutrition/AIFoodParserModal.tsx` — exists and compiles
- [x] `app/(client)/nutrition/page.tsx` — imports and renders AIFoodParserModal
- [x] `npx tsc --noEmit` — zero errors
- [x] FoodSearchModal still present and untouched
- [x] No fixed positioning on AIFoodParserModal trigger button
- [x] Modal overlay z-index is z-[90]
- [x] Commits 175bd93 and 4ac7627 exist
