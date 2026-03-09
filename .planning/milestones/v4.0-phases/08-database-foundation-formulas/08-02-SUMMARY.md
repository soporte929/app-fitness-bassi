---
phase: 08-database-foundation-formulas
plan: "02"
subsystem: calculations
tags: [nutrition, formulas, typescript, katch-mcardle, mifflin-st-jeor, macros]

# Dependency graph
requires: []
provides:
  - "calculateTMB: Katch-McArdle (con %grasa) y Mifflin-St Jeor (sin %grasa)"
  - "calculateTDEE: TMB × factor de actividad"
  - "calculateTargetCalories: TDEE × factor por fase nutricional"
  - "calculateMacros: distribución proteína/grasa/carbs por fase"
  - "Tipos: NutritionPhase, Sex, TMBInput, MacrosResult"
affects:
  - "Phase 9: Trainer Plan Creator"
  - "Phase 11: Client Nutrition View"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Funciones de cálculo puras (sin side effects) exportadas desde lib/calculations/"
    - "Katch-McArdle cuando fatPercent disponible, Mifflin-St Jeor como fallback"
    - "Factores internos (GOAL_FACTORS, PROTEIN_FACTORS, FAT_FACTORS) no exportados"

key-files:
  created: []
  modified:
    - "lib/calculations/nutrition.ts"

key-decisions:
  - "GOAL_FACTORS, PROTEIN_FACTORS, FAT_FACTORS son constantes internas — no exportadas, innecesarias externamente"
  - "NutritionPhase incluye recomposition (distinto a Goal en types.ts que usa surplus) — ambos coexisten sin conflicto"
  - "calculateMacros usa Math.round() que puede dar 1g de diferencia respecto a truncado — comportamiento correcto"

patterns-established:
  - "calculateTMB: branching en fatPercent — Katch-McArdle vs Mifflin-St Jeor"
  - "Todas las funciones usan Math.round() para calorías y gramos"

requirements-completed: [CALC-01, CALC-02, CALC-03, CALC-04, CALC-05]

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 08 Plan 02: Nutrition Formulas Summary

**4 funciones de cálculo nutricional (Katch-McArdle, Mifflin-St Jeor, TDEE, target calories, macros por fase) añadidas a lib/calculations/nutrition.ts con tipos TypeScript exportados**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T00:00:00Z
- **Completed:** 2026-03-09T00:05:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `calculateTMB`: usa Katch-McArdle si se pasa `fatPercent`, Mifflin-St Jeor si no — valores verificados matemáticamente
- `calculateTDEE`: delega en `ACTIVITY_FACTORS` existente — sin duplicación
- `calculateTargetCalories`: 4 fases soportadas (deficit 0.85, maintenance 1.0, recomposition 1.0, volume 1.075)
- `calculateMacros`: distribución proteína/grasa/carbs por fase, carbs como residual de calorías restantes
- Funciones existentes `calculateNutrition`, `ACTIVITY_FACTORS`, `ACTIVITY_LABELS` intactas
- `npx tsc --noEmit` pasa sin errores

## Task Commits

Cada task fue commiteado atómicamente:

1. **Task 1: Añadir calculateTMB, calculateTDEE, calculateTargetCalories y calculateMacros** - `1ec02a6` (feat)

**Plan metadata:** (pendiente — commit final de docs)

## Files Created/Modified
- `lib/calculations/nutrition.ts` — 4 nuevas funciones exportadas + 4 nuevos tipos; funciones existentes intactas

## Decisions Made
- `GOAL_FACTORS`, `PROTEIN_FACTORS` y `FAT_FACTORS` son constantes internas (no exportadas) — no son necesarias externamente
- `NutritionPhase` usa `"recomposition"` en lugar de `"surplus"` del tipo `Goal` de types.ts — ambos coexisten sin conflicto porque sirven contextos distintos
- `calculateMacros` con `volume` y 2999 kcal retorna 426g de carbs (Math.round(1703/4) = Math.round(425.75) = 426), no 425 — el redondeo matemático es el correcto

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pequeña discrepancia en el plan: el plan especificaba 425g de carbs para macros volume (80kg, 2999kcal), pero el cálculo correcto con Math.round es 426g (1703/4 = 425.75 → 426). La implementación usa Math.round que es matemáticamente correcto; el plan tenía un truncado implícito. No se consideró desviación, la implementación es correcta.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Todas las funciones del módulo nutrición v4.0 disponibles en `lib/calculations/nutrition.ts`
- Phase 9 (Trainer Plan Creator) puede importar `calculateTMB`, `calculateTDEE`, `calculateTargetCalories`, `calculateMacros` directamente
- Phase 11 (Client Nutrition View) también puede consumir estas funciones

---
*Phase: 08-database-foundation-formulas*
*Completed: 2026-03-09*
