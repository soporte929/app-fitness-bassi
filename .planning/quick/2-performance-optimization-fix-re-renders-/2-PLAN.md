---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/client/exercise-card.tsx
  - app/(client)/history/loading.tsx
  - app/(client)/progress/loading.tsx
  - app/(trainer)/dashboard/loading.tsx
  - app/(trainer)/clients/loading.tsx
  - next.config.ts
autonomous: true
requirements: [PERF-01]
must_haves:
  truths:
    - "ExerciseCard no se re-renderiza cuando cambia el estado de otro ejercicio"
    - "Las rutas lentas muestran skeleton inmediato mientras cargan datos"
    - "Las imágenes se sirven en WebP/AVIF en navegadores que lo soportan"
  artifacts:
    - path: "components/client/exercise-card.tsx"
      provides: "ExerciseCard memoizado con React.memo"
      contains: "React.memo"
    - path: "app/(client)/history/loading.tsx"
      provides: "Loading boundary para historial"
    - path: "app/(client)/progress/loading.tsx"
      provides: "Loading boundary para progreso"
    - path: "app/(trainer)/dashboard/loading.tsx"
      provides: "Loading boundary para dashboard trainer"
    - path: "app/(trainer)/clients/loading.tsx"
      provides: "Loading boundary para lista de clientes"
    - path: "next.config.ts"
      provides: "Formatos de imagen optimizados"
      contains: "formats"
  key_links:
    - from: "TodayExercisesProgress"
      to: "ExerciseCard"
      via: "React.memo — evita re-render cuando onSetCountChange no cambia (ya es useCallback)"
    - from: "app/(client)/history/loading.tsx"
      to: "Suspense boundary del layout cliente"
      via: "Next.js streaming RSC"
---

<objective>
Corregir tres problemas de rendimiento concretos e identificados en el código:
1. ExerciseCard se re-renderiza en cada cambio de estado de cualquier ejercicio (N ejercicios × M sets = N re-renders innecesarios por cada tecla pulsada)
2. Ninguna ruta tiene loading.tsx — la pantalla queda en blanco hasta que el Server Component termina todas sus queries Supabase
3. next.config.ts vacío: las imágenes se sirven en PNG cuando WebP/AVIF ahorran 30-50% de bytes en mobile

Purpose: Mejorar respuesta táctil durante el workout (crítico en mobile) y reducir tiempo de pantalla en blanco en rutas lentas.
Output: ExerciseCard memoizado, 4 loading.tsx skeletons, next.config con image formats.
</objective>

<execution_context>
@/Users/jofreatanet/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jofreatanet/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Design system de referencia (de CLAUDE.md):
- Fondo card: bg-white / var(--bg-surface)
- Texto secundario: text-[#6e6e73] / var(--text-secondary)
- Bordes: border-[#e5e5ea] / var(--border)
- Skeleton: usar bg-[var(--bg-elevated)] con animate-pulse
- PageTransition: SIEMPRE en páginas, pero loading.tsx no es página — usar div simple

Archivos relevantes:
- components/client/exercise-card.tsx — componente a memoizar
- components/client/today-exercises-progress.tsx — padre que renderiza ExerciseCards
- app/(client)/layout.tsx — ya tiene Suspense wrapping children (loading.tsx activa el streaming)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Memoizar ExerciseCard con React.memo</name>
  <files>components/client/exercise-card.tsx</files>
  <action>
    Envolver el export de ExerciseCard con React.memo para evitar re-renders cuando el padre (TodayExercisesProgress) actualiza completionMap.

    Cambio exacto:
    - Importar React al inicio: `import React, { useEffect, useState, useTransition } from 'react'`
    - Cambiar `export function ExerciseCard(...)` por `export const ExerciseCard = React.memo(function ExerciseCard(...) { ... })`

    Por qué funciona: TodayExercisesProgress ya memoiza `handleSetCountChange` con `useCallback`. Las props `exercise` y `sessionId` son estables entre renders del padre (no se recrean). `lastSetLogs` viene del Server Component (array fijo). Con memo, solo re-renderiza el card cuyo exercise cambia.

    NO mover el tipo ExerciseWithSets ni LastSetLog — siguen siendo exports normales (no parte del memo).
    NO cambiar ninguna lógica interna.
  </action>
  <verify>
    <automated>cd "/Users/jofreatanet/Desktop/Fitness bassi/app-fitness-bassi" && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>ExerciseCard exportado como React.memo, sin errores TypeScript, sin cambios de comportamiento.</done>
</task>

<task type="auto">
  <name>Task 2: Añadir loading.tsx a rutas lentas</name>
  <files>
    app/(client)/history/loading.tsx,
    app/(client)/progress/loading.tsx,
    app/(trainer)/dashboard/loading.tsx,
    app/(trainer)/clients/loading.tsx
  </files>
  <action>
    Crear 4 archivos loading.tsx con skeletons acordes al contenido de cada ruta. Next.js los usa automáticamente como Suspense fallback para Server Components.

    IMPORTANTE: loading.tsx NO lleva 'use client' ni PageTransition. Solo retorna el skeleton.

    **app/(client)/history/loading.tsx** — lista de sessiones:
    ```tsx
    export default function HistoryLoading() {
      return (
        <div className="px-4 pt-6 pb-4 space-y-3">
          <div className="h-7 w-40 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 space-y-2">
              <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      )
    }
    ```

    **app/(client)/progress/loading.tsx** — gráficas y métricas:
    ```tsx
    export default function ProgressLoading() {
      return (
        <div className="px-4 pt-6 pb-4 space-y-4">
          <div className="h-7 w-36 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-2" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
                <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" />
                <div className="h-7 w-20 bg-[var(--bg-elevated)] rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="h-4 w-28 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
            <div className="h-40 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
          </div>
        </div>
      )
    }
    ```

    **app/(trainer)/dashboard/loading.tsx** — stats + charts:
    ```tsx
    export default function DashboardLoading() {
      return (
        <div className="px-6 py-6 space-y-4">
          <div className="h-8 w-48 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
                <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-[var(--bg-elevated)] rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
            <div className="h-48 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
          </div>
        </div>
      )
    }
    ```

    **app/(trainer)/clients/loading.tsx** — lista de clientes:
    ```tsx
    export default function ClientsLoading() {
      return (
        <div className="px-6 py-6 space-y-3">
          <div className="h-8 w-32 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-4" />
          <div className="h-10 bg-[var(--bg-elevated)] rounded-xl animate-pulse mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--bg-elevated)] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-[var(--bg-elevated)] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    ```
  </action>
  <verify>
    <automated>cd "/Users/jofreatanet/Desktop/Fitness bassi/app-fitness-bassi" && ls app/\(client\)/history/loading.tsx app/\(client\)/progress/loading.tsx app/\(trainer\)/dashboard/loading.tsx app/\(trainer\)/clients/loading.tsx && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>4 archivos loading.tsx creados. TypeScript sin errores. Next.js los activa automáticamente como Suspense fallback.</done>
</task>

<task type="auto">
  <name>Task 3: Configurar formatos de imagen WebP/AVIF en next.config.ts</name>
  <files>next.config.ts</files>
  <action>
    Actualizar next.config.ts para activar formatos modernos de imagen. Las imágenes actuales (`/2.png` en logo, sidebar) se servirán en WebP o AVIF automáticamente según soporte del navegador.

    Reemplazar el contenido vacío de next.config.ts con:
    ```typescript
    import type { NextConfig } from "next";

    const nextConfig: NextConfig = {
      images: {
        formats: ['image/avif', 'image/webp'],
      },
    };

    export default nextConfig;
    ```

    AVIF primero (mejor compresión), WebP como fallback. Los navegadores que no soporten ninguno reciben el PNG original (behavior actual, sin regresión).
    NO añadir remotePatterns — todas las imágenes son locales (/2.png).
  </action>
  <verify>
    <automated>cd "/Users/jofreatanet/Desktop/Fitness bassi/app-fitness-bassi" && npx tsc --noEmit 2>&1 | head -10</automated>
  </verify>
  <done>next.config.ts tiene `images.formats: ['image/avif', 'image/webp']`. TypeScript sin errores.</done>
</task>

</tasks>

<verification>
Tras las 3 tareas:
1. `npx tsc --noEmit` pasa sin errores
2. Los 4 archivos loading.tsx existen en sus rutas
3. `components/client/exercise-card.tsx` contiene `React.memo`
4. `next.config.ts` contiene `image/avif` y `image/webp`
</verification>

<success_criteria>
- ExerciseCard wrapeado en React.memo — evita N re-renders por cada input change durante workout
- 4 rutas lentas muestran skeleton inmediato en vez de pantalla en blanco
- Imágenes Next.js se sirven en WebP/AVIF automáticamente en mobile
- Sin errores TypeScript ni cambios de comportamiento
</success_criteria>

<output>
Tras completar, crear `.planning/quick/2-performance-optimization-fix-re-renders-/2-SUMMARY.md` con:
- Cambios realizados por tarea
- Archivos modificados/creados
- Resultado de `npx tsc --noEmit`
</output>
