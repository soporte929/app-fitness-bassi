---
phase: 29-performance-optimization
plan: "01"
subsystem: trainer-dashboard
tags: [performance, caching, unstable_cache, revalidateTag, next-cache]
dependency_graph:
  requires: []
  provides: [cached-trainer-dashboard, cache-invalidation-on-mutations]
  affects: [app/(trainer)/dashboard/page.tsx, app/(trainer)/clients/actions.ts]
tech_stack:
  added: [unstable_cache from next/cache, revalidateTag from next/cache]
  patterns: [server-side data caching, tag-based cache invalidation]
key_files:
  created: []
  modified:
    - app/(trainer)/dashboard/page.tsx
    - app/(trainer)/clients/actions.ts
decisions:
  - "unstable_cache wraps all 3 Supabase queries (clients, sessions, weight_logs) in a single cached function getTrainerDashboardData with TTL 60s and tag trainer-dashboard"
  - "createAdminClient used inside unstable_cache (no cookie dependency — safe for server-side cache)"
  - "revalidateTag second argument passes {} (empty CacheLifeConfig) — required by Next.js 16 type signature"
  - "clientIds re-derived from allClients in component body after extracting queries to cached function"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-11"
  tasks_completed: 3
  files_modified: 2
---

# Phase 29 Plan 01: Performance Optimization — unstable_cache Dashboard Summary

Dashboard del trainer envuelto en unstable_cache (TTL 60s, tag trainer-dashboard) usando createAdminClient, con revalidateTag en las 4 mutations de clientes para invalidación inmediata al mutar datos.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Auditar queries secuenciales en today/dashboard/progress | (no code change) | Auditoría solo — sin modificaciones |
| 2 | Extraer queries del dashboard en getTrainerDashboardData con unstable_cache | 3fbba66 | app/(trainer)/dashboard/page.tsx |
| 3 | Añadir revalidateTag en las 3 mutations de clients/actions.ts | c1e8c93 | app/(trainer)/clients/actions.ts |

## Audit Findings (Task 1)

- **`dashboard/page.tsx`**: clients query secuencial justificada (necesita clientIds). sessions + weight_logs ya en Promise.all. Correcto.
- **`today/page.tsx`**: clients → workout_sessions secuencial justificado (segunda query necesita client.id). Correcto.
- **`progress/page.tsx`**: clients query justificada. measurements + sessions en Promise.all. Correcto.
- **Conclusión**: No se encontraron casos de queries secuenciales injustificadas (PERF-01 satisfecho).

## Key Changes

### dashboard/page.tsx
- Importa `unstable_cache` desde `next/cache` y `createAdminClient` desde `@/lib/supabase/admin`
- `getTrainerDashboardData` definida fuera del componente, envuelta con `unstable_cache`
- TTL: 60 segundos. Tag: `'trainer-dashboard'`
- Usa `createAdminClient()` dentro del cache (no depende de cookies del request)
- Early return con arrays vacíos cuando el trainer no tiene clientes
- El componente `TrainerDashboard` mantiene `supabase.auth.getUser()` sin cachear (auth siempre fresco)
- `clientIds` se re-deriva de `allClients` dentro del componente body

### clients/actions.ts
- Importa `revalidateTag` junto con `revalidatePath` desde `next/cache`
- Las 4 mutations (`updateClientAction`, `createClientAction`, `assignPlanToClientAction`, `deleteClientAction`) llaman `revalidateTag('trainer-dashboard', {})` tras sus `revalidatePath`
- Second arg `{}` requerido por el tipo `CacheLifeConfig` de Next.js 16

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] revalidateTag en Next.js 16 requiere 2 argumentos**
- **Found during:** Task 3
- **Issue:** El tipo de `revalidateTag` en Next.js 16 tiene firma `(tag: string, profile: string | CacheLifeConfig)` — 2 argumentos obligatorios, no 1 como en versiones anteriores. TypeScript error TS2554.
- **Fix:** Se pasa `{}` como segundo argumento (CacheLifeConfig vacío — invalidación sin perfil específico).
- **Files modified:** app/(trainer)/clients/actions.ts
- **Commit:** c1e8c93

**2. [Rule 1 - Bug] clientIds no disponible en componente tras extracción a función cacheada**
- **Found during:** Task 2
- **Issue:** Al mover las queries a `getTrainerDashboardData`, la variable `clientIds` (derivada de `rawClients`) dejó de existir en el componente, causando error TS2304.
- **Fix:** Se re-deriva `clientIds` del `allClients` retornado por la función cacheada: `const clientIds = allClients.map((c) => c.id)`
- **Files modified:** app/(trainer)/dashboard/page.tsx
- **Commit:** 3fbba66

## Self-Check: PASSED

- app/(trainer)/dashboard/page.tsx — FOUND
- app/(trainer)/clients/actions.ts — FOUND
- Commit 3fbba66 — FOUND
- Commit c1e8c93 — FOUND
