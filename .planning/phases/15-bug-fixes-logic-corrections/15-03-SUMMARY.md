---
phase: 15-bug-fixes-logic-corrections
plan: "03"
subsystem: ui
tags: [pwa, manifest, theme-toggle, client-layout, food-search, nutrition]

# Dependency graph
requires:
  - phase: 15-02
    provides: correcciones de lógica del mismo ciclo
  - phase: 11-client-nutrition-view
    provides: FoodSearchModal, nutrition/page.tsx
  - phase: 13-ai-nutrition-parsing
    provides: AIFoodParserModal, FoodSearchModal FAB baseline
provides:
  - ThemeToggle en header del layout cliente
  - FoodSearchModal con prop trigger (inline, no FAB)
  - PWA manifest — /manifest.json servido por Next.js
  - iconos PWA icon-192.png e icon-512.png en /public
affects: [client layout, nutrition page, PWA install experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FoodSearchModal acepta prop trigger?: React.ReactNode — FAB como fallback para compatibilidad"
    - "MetadataRoute.Manifest con entries separadas por purpose (any / maskable) — string combinado no acepta TypeScript"
    - "Iconos PWA generados desde logo existente con sips (macOS) — sin librerías de procesamiento"

key-files:
  created:
    - app/manifest.ts
    - public/icon-192.png
    - public/icon-512.png
  modified:
    - app/(client)/layout.tsx
    - components/client/nutrition/FoodSearchModal.tsx
    - app/(client)/nutrition/page.tsx

key-decisions:
  - "FoodSearchModal mantiene FAB como fallback cuando no se pasa trigger — evita breaking change en otros usos"
  - "purpose: 'any maskable' separado en entradas individuales — MetadataRoute.Manifest no acepta string combinado"
  - "Iconos generados con sips desde logo 1250x1250 — no instalar librería de imágenes"

patterns-established:
  - "Componentes con trigger?: React.ReactNode — patrón para convertir FABs a triggers inline sin romper compatibilidad"

requirements-completed: [FEAT-01, FEAT-03, FEAT-04, FEAT-05]

# Metrics
duration: 6min
completed: 2026-03-10
---

# Phase 15 Plan 03: Client UI Polish + PWA Manifest Summary

**ThemeToggle en layout cliente, FoodSearchModal FAB → trigger inline en Registro Libre, y PWA manifest con iconos generados desde logo**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T11:30:00Z
- **Completed:** 2026-03-10T11:36:00Z
- **Tasks:** 3
- **Files modified:** 6 (3 creados, 3 modificados)

## Accomplishments

- ThemeToggle importado y renderizado a la derecha del logo en el header sticky del layout cliente
- FoodSearchModal refactorizado con prop `trigger?: React.ReactNode`; en nutrition/page.tsx el modal se renderiza dentro de la sección Registro Libre con botón circular inline — FAB flotante eliminado de la vista
- app/manifest.ts creado — Next.js sirve /manifest.json automáticamente; iconos 192×192 y 512×512 generados con sips desde el logo existente

## Task Commits

1. **Task 1: ThemeToggle en layout cliente** - `1adae3f` (feat)
2. **Task 2: FoodSearchModal trigger inline** - `3bb3cd5` (feat)
3. **Task 3: PWA manifest + iconos** - `88bd029` (feat)

## Files Created/Modified

- `app/(client)/layout.tsx` — `justify-between` añadido al header; ThemeToggle importado y renderizado a la derecha
- `components/client/nutrition/FoodSearchModal.tsx` — prop `trigger?: React.ReactNode` añadida; div onClick envuelve trigger; FAB como fallback
- `app/(client)/nutrition/page.tsx` — FoodSearchModal movido dentro de sección Registro Libre con botón circular inline; eliminado del final del JSX
- `app/manifest.ts` — PWA manifest: name "Fitness Bassi", start_url "/today", theme_color "#111111", icons 192/512
- `public/icon-192.png` — generado con sips desde logo 1250×1250
- `public/icon-512.png` — generado con sips desde logo 1250×1250

## Decisions Made

- `purpose: 'any maskable'` separado en dos entradas individuales — TypeScript de MetadataRoute.Manifest no acepta string combinado
- FoodSearchModal mantiene el FAB como fallback (prop trigger opcional) — compatibilidad con otros usos del componente
- Iconos generados con sips (macOS built-in) en lugar de instalar sharp/jimp

## Deviations from Plan

### Auto-fixed Issues

**1. MetadataRoute.Manifest — purpose string combinado no válido**
- **Found during:** Task 3 (PWA manifest)
- **Issue:** `purpose: 'any maskable'` no es un valor válido en TypeScript para MetadataRoute.Manifest
- **Fix:** Dos entradas separadas en el array `icons` — una con `purpose: 'any'` y otra con `purpose: 'maskable'`
- **Files modified:** app/manifest.ts
- **Verification:** Build TypeScript sin errores
- **Committed in:** 88bd029 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (TypeScript type constraint)
**Impact on plan:** Corrección necesaria para validez del tipo. Sin scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FEAT-01/03/04/05 completados — polish de UX cliente aplicado
- PWA instalable en dispositivos móviles con identidad visual correcta
- Listo para Phase 15 Plan 04 (profile edit + timer pause)

---
*Phase: 15-bug-fixes-logic-corrections*
*Completed: 2026-03-10*
