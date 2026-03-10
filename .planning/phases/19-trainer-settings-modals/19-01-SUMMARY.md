---
phase: 19-trainer-settings-modals
plan: "01"
subsystem: trainer-client-management
tags: [nutrition, modal, server-action, trainer]
dependency_graph:
  requires: []
  provides: [assign-nutrition-plan-modal, assignNutritionTemplateToClientAction]
  affects: [app/(trainer)/clients/[id]/page.tsx]
tech_stack:
  added: []
  patterns: [deactivate-then-insert, useTransition, router.refresh, as unknown cast]
key_files:
  created:
    - app/(trainer)/clients/[id]/assign-nutrition-plan-modal.tsx
  modified:
    - app/(trainer)/clients/[id]/nutrition-actions.ts
    - app/(trainer)/clients/[id]/page.tsx
decisions:
  - "`as unknown as NutritionTemplate[]` para castear resultado de query `as any` — el doble cast evita error TS2352 sin sacrificar type safety"
  - "useTransition en lugar de useState+loading — patrón consistente con otros modales del proyecto"
  - "router.refresh() en lugar de redirect() — refresca datos del Server Component sin navegar"
metrics:
  duration: "3m"
  completed_date: "2026-03-10"
  tasks_completed: 3
  files_changed: 3
---

# Phase 19 Plan 01: Assign Nutrition Plan Modal Summary

**One-liner:** Modal inline en /clients/[id] para asignar plantillas nutrition_plans al cliente via Server Action con clone de comidas.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Server Action assignNutritionTemplateToClientAction | e9db18e | nutrition-actions.ts |
| 2 | Client Component AssignNutritionPlanModal | 3408e23 | assign-nutrition-plan-modal.tsx |
| 3 | Actualizar page.tsx — fetch templates + render modal | 5574ce8 | page.tsx |

## What Was Built

- **`assignNutritionTemplateToClientAction`**: Server Action que verifica auth, fetcha la plantilla (is_template=true, trainer_id=user.id), desactiva planes activos del cliente (deactivate-then-insert), inserta nuevo plan con created_at=startDate, clona todas las comidas de la plantilla.
- **`NutritionTemplate` type**: Exportado desde nutrition-actions.ts para uso en page.tsx y el modal.
- **`AssignNutritionPlanModal`**: Client Component con botón trigger + overlay. Lista de templates seleccionables (borde azul si seleccionado), date picker nativo, empty state con link a /nutrition-plans si no hay templates, footer con botón "Asignar" (disabled si nada seleccionado o pending).
- **`page.tsx` actualizado**: Añadida query `is_template=true` al Promise.all, `AssignNutritionPlanModal` en el header junto a Revisiones y AssignPlanButton, `flex-wrap` en el div de botones.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Double cast `as unknown as NutritionTemplate[]`**
- **Found during:** Task 3
- **Issue:** TypeScript error TS2352 — el tipo `(SelectQueryError<...>)[]` no overlapa directamente con `NutritionTemplate[]` cuando se usa `from('nutrition_plans' as any)`
- **Fix:** Cambiar `as NutritionTemplate[]` por `as unknown as NutritionTemplate[]` — el doble cast es el patrón correcto para estos casos
- **Files modified:** app/(trainer)/clients/[id]/page.tsx

## Success Criteria Verification

- [x] `assign-nutrition-plan-modal.tsx` existe y exporta `AssignNutritionPlanModal`
- [x] `nutrition-actions.ts` exporta `assignNutritionTemplateToClientAction` (sin redirect, retorna `{ success: boolean }`)
- [x] `page.tsx` fetcha templates de nutrition_plans con `is_template=true` y pasa el array al modal
- [x] El botón "Asignar plan nutricional" aparece en el header del detalle del cliente
- [x] Sin errores de TypeScript en los tres archivos modificados (`npx tsc --noEmit` — 0 errores)
