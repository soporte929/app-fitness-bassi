---
phase: quick-4
plan: 4
subsystem: trainer/exercise-picker
tags: [modal, bottom-sheet, responsive, tailwind]
dependency_graph:
  requires: []
  provides: [modal-centrado-tablet-desktop]
  affects: [components/trainer/exercise-picker.tsx]
tech_stack:
  added: []
  patterns: [min-[431px] breakpoint, items-end/items-center split, safe-area-inset]
key_files:
  created: []
  modified:
    - components/trainer/exercise-picker.tsx
decisions:
  - Separar justify-center y items alignment en clases mobile vs min-[431px] para evitar conflictos Tailwind v4
  - Añadir min-[431px]:p-4 al contenedor externo para dar espacio visual al modal centrado en tablet/desktop
  - Añadir min-[431px]:pb-0 para limpiar safe-area-inset en viewports mayores a 430px
metrics:
  duration: "~2min"
  completed: "2026-03-13T10:52:37Z"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 4: Fix ExercisePicker Modal Centrado en Tablet/Desktop Summary

**One-liner:** Separadas clases de alineación mobile/tablet en el ExercisePicker para bottom-sheet en mobile y modal centrado en tablet/desktop con p-4 de espacio lateral.

## What Was Done

Corregidas las clases Tailwind del componente `ExercisePicker` para garantizar el comportamiento correcto según breakpoint:

- **Mobile (≤430px):** bottom sheet pegado al borde inferior, esquinas superiores redondeadas, safe-area-inset-bottom activo
- **Tablet/Desktop (>430px):** modal centrado en pantalla con `max-w-md`, esquinas todas redondeadas, `p-4` de padding lateral, `pb-0` para limpiar safe-area

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Corregir clases del contenedor externo e interior del modal | 0f3a626 |

## Key Changes

**Contenedor externo** — separadas las clases de alineación por breakpoint:
```tsx
'fixed inset-0 z-50 flex',
'items-end justify-center',                              // mobile: bottom sheet
'min-[431px]:items-center min-[431px]:justify-center',  // tablet+: centrado
'min-[431px]:p-4',                                      // padding lateral en tablet+
```

**Modal interior** — añadido `min-[431px]:pb-0`:
```tsx
'pb-[env(safe-area-inset-bottom,0px)] min-[431px]:pb-0',
```

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- File modified: `components/trainer/exercise-picker.tsx` — FOUND
- Commit 0f3a626 — FOUND
- TypeScript check: No errors in exercise-picker
