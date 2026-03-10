---
phase: 15-bug-fixes-logic-corrections
plan: "01"
subsystem: ui
tags: [recharts, dropdown, input-focus, useRef]

# Dependency graph
requires:
  - phase: 14-trainer-completar
    provides: AdherenceChart, WeightTrendChart, AssignRoutineButton, MealSlot components
provides:
  - Recharts charts con height=260 y márgenes correctos (sin recortes de etiquetas ni leyenda)
  - AssignRoutineButton dropdown alineado a la derecha del viewport
  - FoodSearchInput sub-componente con useRef para preservar foco al escribir
affects: [dashboard-charts, nutrition-plan-create, client-detail]

# Tech tracking
tech-stack:
  added: []
  patterns: [useRef para preservar foco en inputs dentro de componentes con re-renders frecuentes]

key-files:
  created: []
  modified:
    - components/trainer/dashboard-charts/adherence-chart.tsx
    - components/trainer/dashboard-charts/weight-trend-chart.tsx
    - app/(trainer)/clients/[id]/assign-routine-button.tsx
    - app/(trainer)/clients/actions.ts
    - app/(trainer)/nutrition-plans/create/meal-slot.tsx

key-decisions:
  - "FoodSearchInput extraído como sub-componente con useRef — key estática garantiza que el nodo DOM del input se mantiene entre re-renders de FoodSearchSlot"
  - "BUG-06: createClientAction ya usaba admin client correctamente — solo se añade comentario PRODUCTION para visibilidad"
  - "BUG-07/08: sidebar ya tenía /routines-templates y /nutrition-plans correctos — sin cambio de código necesario"

patterns-established:
  - "useRef en inputs de búsqueda: cuando un input vive dentro de un componente que re-renderiza frecuentemente, extráelo en sub-componente con useRef para garantizar estabilidad del nodo DOM"
  - "Dropdowns posicionados con right-0 cuando el trigger está en el lado derecho del layout — evita desbordamiento del viewport"

requirements-completed: [BUG-01, BUG-02, BUG-04, BUG-06, BUG-07, BUG-08]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 15 Plan 01: Bug Fixes & Logic Corrections Summary

**Recharts charts con height 260 y márgenes ajustados, dropdown AssignRoutine alineado a la derecha, y FoodSearchInput con useRef para preservar foco en búsqueda de alimentos**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-10T11:39:41Z
- **Completed:** 2026-03-10T11:41:44Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- AdherenceChart y WeightTrendChart con height=260 y bottom margin ajustado — etiquetas anguladas y leyenda ya no se recortan
- AssignRoutineButton dropdown usa right-0 con max-w-[calc(100vw-2rem)] — no se desborda del viewport en móvil
- FoodSearchInput como sub-componente separado con useRef en meal-slot.tsx — el input de búsqueda mantiene foco entre keystrokes
- BUG-06 confirmado: createClientAction ya usaba admin client para INSERT en clients, añadido comentario PRODUCTION
- BUG-07/08 confirmados: sidebar tiene /routines-templates y /nutrition-plans correctos

## Task Commits

1. **Task 1: Corregir márgenes AdherenceChart y WeightTrendChart (BUG-02)** - `3601d11` (fix)
2. **Task 2: Corregir dropdown AssignRoutineButton + verificaciones (BUG-04, BUG-06, BUG-07, BUG-08)** - `ff4a89e` (fix)
3. **Task 3: FoodSearchInput con useRef en meal-slot.tsx (BUG-01)** - `dcfcc2a` (fix)

## Files Created/Modified
- `components/trainer/dashboard-charts/adherence-chart.tsx` - height 220→260, bottom margin 48→60, tick fontSize 10→9
- `components/trainer/dashboard-charts/weight-trend-chart.tsx` - height 220→260, bottom margin 8→28
- `app/(trainer)/clients/[id]/assign-routine-button.tsx` - left-0→right-0, añade max-w-[calc(100vw-2rem)]
- `app/(trainer)/clients/actions.ts` - añade comentario PRODUCTION sobre SUPABASE_SERVICE_ROLE_KEY
- `app/(trainer)/nutrition-plans/create/meal-slot.tsx` - nuevo sub-componente FoodSearchInput con useRef, añade useRef al import

## Decisions Made
- FoodSearchInput extraído con useRef como sub-componente estático (key no dinámica) — garantiza que React reutiliza el mismo nodo DOM del input entre re-renders, evitando pérdida de foco
- BUG-06 y BUG-07/08 no requerían cambios de lógica — solo verificación y comentario documental

## Deviations from Plan

None — plan ejecutado exactamente como especificado. Las verificaciones de BUG-06/07/08 confirmaron que el código ya era correcto.

## Issues Encountered
None.

## User Setup Required
None — no hay configuración externa requerida. SUPABASE_SERVICE_ROLE_KEY ya debe estar en Vercel (documentado en comentario de createClientAction).

## Next Phase Readiness
- Todos los bugs de producción críticos corregidos — dashboard funcional, búsqueda de alimentos operativa, dropdown sin desbordamiento
- Phase 15 puede continuar con los planes restantes (lógica de cálculos, etc.)

---
*Phase: 15-bug-fixes-logic-corrections*
*Completed: 2026-03-10*
