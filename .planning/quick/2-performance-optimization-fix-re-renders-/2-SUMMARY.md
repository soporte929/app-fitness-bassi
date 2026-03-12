---
phase: quick-2
plan: "01"
subsystem: performance
tags: [react-memo, loading-skeleton, next-image, streaming]
key-decisions:
  - "React.memo en ExerciseCard: solo re-renderiza el card cuyo exercise cambia, no todos"
  - "loading.tsx sin 'use client' ni PageTransition — solo skeleton div puro"
  - "AVIF antes que WebP en formats array — mejor compresion, fallback automatico"
key-files:
  modified:
    - components/client/exercise-card.tsx
    - next.config.ts
  created:
    - app/(client)/history/loading.tsx
    - app/(client)/progress/loading.tsx
    - app/(trainer)/dashboard/loading.tsx
    - app/(trainer)/clients/loading.tsx
metrics:
  duration: "~8 minutos"
  completed_date: "2026-03-12"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 2
---

# Quick Task 2: Performance Optimization — Fix Re-renders Summary

**One-liner:** ExerciseCard memoizado con React.memo, 4 skeletons de carga via loading.tsx, e imagenes Next.js configuradas para servir AVIF/WebP automaticamente.

## Tasks Completados

### Task 1: Memoizar ExerciseCard con React.memo
**Commit:** ef184bd

**Cambios:**
- `import { useEffect, ... }` → `import React, { useEffect, ... }` (import React explícito)
- `export function ExerciseCard(...)` → `export const ExerciseCard = React.memo(function ExerciseCard(...))`
- Cierre con `})` en lugar de `}`

**Por qué funciona:** TodayExercisesProgress ya memoiza `handleSetCountChange` con `useCallback`. Las props `exercise`, `sessionId`, `lastSetLogs` son estables entre renders del padre. Con memo, solo re-renderiza el card cuyo exercise cambia — elimina N re-renders innecesarios por cada tecla pulsada durante el workout.

**Archivo:** `components/client/exercise-card.tsx`

---

### Task 2: Añadir loading.tsx a rutas lentas
**Commit:** 5020c5a

**4 archivos creados:**

| Archivo | Skeleton content |
|---------|-----------------|
| `app/(client)/history/loading.tsx` | Titulo + 5 cards con 2 lineas de texto |
| `app/(client)/progress/loading.tsx` | Titulo + grid 2x2 stat cards + chart area |
| `app/(trainer)/dashboard/loading.tsx` | Titulo + grid 4 stat cards + chart area |
| `app/(trainer)/clients/loading.tsx` | Titulo + search bar + 6 client rows con avatar |

**Patron usado:** `bg-[var(--bg-elevated)] animate-pulse` — consistente con design system. Sin `'use client'`, sin `PageTransition` (loading.tsx no es pagina, es Suspense fallback).

**Efecto:** Next.js activa automaticamente estos archivos como Suspense fallback para Server Components que hacen queries Supabase. El usuario ve skeleton inmediato en vez de pantalla en blanco.

---

### Task 3: Configurar formatos de imagen WebP/AVIF en next.config.ts
**Commit:** 9810669

**Cambio:**
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
},
```

**Efecto:** Las imagenes servidas via `<Image>` de Next.js (e.g. `/2.png` en logo y sidebar) se sirven en AVIF para navegadores que lo soportan (Chrome, Firefox), WebP como fallback (Safari), y PNG original si el navegador no soporta ninguno. Ahorro estimado 30-50% de bytes en mobile.

---

## Verificacion Final

```
npx tsc --noEmit → 0 errores
React.memo en components/client/exercise-card.tsx → confirmado
image/avif en next.config.ts → confirmado
4 loading.tsx en sus rutas → confirmado
```

## Deviations from Plan

None — plan ejecutado exactamente como escrito.

## Self-Check: PASSED

- [x] `components/client/exercise-card.tsx` contiene `React.memo`
- [x] `next.config.ts` contiene `image/avif` y `image/webp`
- [x] 4 archivos loading.tsx existen en sus rutas
- [x] `npx tsc --noEmit` sin errores
- [x] Commits ef184bd, 5020c5a, 9810669 existen en git log
