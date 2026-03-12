---
phase: quick-1
plan: 1
subsystem: navigation
tags: [navigation, middleware, nutrition, client-ux]
dependency_graph:
  requires: []
  provides: [nutrition-hidden-from-nav, nutrition-route-blocked]
  affects: [components/client/nav.tsx, components/client/sidebar.tsx, middleware.ts]
tech_stack:
  added: []
  patterns: [middleware-redirect, nav-tab-removal]
key_files:
  modified:
    - components/client/nav.tsx
    - components/client/sidebar.tsx
    - middleware.ts
decisions:
  - Bloque redirect explícito en middleware antes de isClientRoute — más robusto que simplemente omitir la ruta de isClientRoute (que solo eliminaría la protección de rol, no el acceso)
  - /nutrition-plans en isTrainerRoute no modificado — verificado intacto
metrics:
  duration: "~5 minutos"
  completed: "2026-03-12T22:32:36Z"
  tasks_completed: 2
  files_modified: 3
---

# Quick 1 Plan 1: Hide Nutrition Feature from Navigation Summary

Ocultar la feature de nutrición de la navegación cliente y bloquear el acceso directo por URL, manteniendo el código en `app/(client)/nutrition/` intacto.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Eliminar Nutrición de nav y sidebar | 10be34e | components/client/nav.tsx, components/client/sidebar.tsx |
| 2 | Bloquear acceso directo a /nutrition en middleware | 760d3cc | middleware.ts |

## Changes Made

### Task 1 — Nav y Sidebar

**`components/client/nav.tsx`:**
- Eliminada entrada `{ label: "Nutrición", href: "/nutrition", icon: UtensilsCrossed }` del array `tabs`
- Eliminado `UtensilsCrossed` del import de lucide-react
- Barra inferior ahora muestra: Hoy, Historial, Rutinas, Progreso, Perfil (5 tabs)

**`components/client/sidebar.tsx`:**
- Eliminada entrada `{ label: "Nutrición", href: "/nutrition", icon: Apple }` del array `tabs`
- Eliminado `Apple` del import de lucide-react
- Sidebar ahora muestra: Hoy, Progreso, Auditoría

### Task 2 — Middleware

**`middleware.ts`:**
- Añadido bloque redirect explícito antes de `isClientRoute`:
  ```typescript
  if (pathname === "/nutrition" || pathname.startsWith("/nutrition/")) {
    return NextResponse.redirect(new URL("/today", request.url));
  }
  ```
- Eliminadas condiciones `/nutrition` de `isClientRoute` (líneas redundantes tras el redirect)
- `/nutrition-plans` en `isTrainerRoute` permanece intacto

## Verification

- `components/client/nav.tsx`: sin entrada href="/nutrition", sin import UtensilsCrossed ✓
- `components/client/sidebar.tsx`: sin entrada href="/nutrition", sin import Apple ✓
- `middleware.ts`: bloque redirect para /nutrition antes de isClientRoute; /nutrition-plans intacto en isTrainerRoute ✓
- `app/(client)/nutrition/`: directorio sin modificaciones ✓

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito.

## Self-Check: PASSED

- `components/client/nav.tsx`: modificado correctamente (commit 10be34e)
- `components/client/sidebar.tsx`: modificado correctamente (commit 10be34e)
- `middleware.ts`: modificado correctamente (commit 760d3cc)
- `app/(client)/nutrition/`: intacto, no modificado
