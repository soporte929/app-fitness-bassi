---
phase: 46-logica-creacion-cliente-con-auth
plan: 01
subsystem: auth
tags: [supabase, invite, auth, email, next-js, route-handler]

# Dependency graph
requires: []
provides:
  - createClientAction usa inviteUserByEmail para enviar email de invitación automático
  - app/auth/callback/route.ts intercambia token de invitación y redirige a /today
affects: [clients-management, auth-flow, onboarding]

# Tech tracking
tech-stack:
  added: []
  patterns: [inviteUserByEmail pattern for client onboarding, auth callback route handler]

key-files:
  created:
    - app/auth/callback/route.ts
  modified:
    - app/(trainer)/clients/actions.ts

key-decisions:
  - "inviteUserByEmail en lugar de createUser+password-aleatorio — cliente recibe email de Supabase con enlace para establecer contraseña"
  - "origin dinámico en callback/route.ts (new URL(request.url).origin) — funciona tanto en local como en producción sin hardcodear URLs"
  - "Sin manejo de error explícito en callback — si exchange falla, /today sin sesión y middleware redirige a /login"

patterns-established:
  - "Auth callback pattern: GET handler con exchangeCodeForSession + redirect a destino de la app"

requirements-completed:
  - SC-1
  - SC-2
  - SC-3

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 46 Plan 01: Lógica creación cliente con Auth Summary

**inviteUserByEmail en createClientAction + GET callback route para flujo de invitación Supabase completo de extremo a extremo**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T12:50:31Z
- **Completed:** 2026-03-13T12:58:00Z
- **Tasks:** 2 (auto) + 1 (checkpoint:human-verify pendiente)
- **Files modified:** 2

## Accomplishments
- `createClientAction` ahora usa `inviteUserByEmail` — Supabase envía email automático al cliente con enlace para establecer contraseña
- `app/auth/callback/route.ts` creado — intercambia el code token del email por sesión activa y redirige a `/today`
- El flujo previo (createUser + password temporal) ya no existe; no quedan datos huérfanos si el email falla

## Task Commits

Cada task fue commiteado atómicamente:

1. **Task 1: Cambiar createClientAction a inviteUserByEmail** - `8e7f887` (feat)
2. **Task 2: Crear app/auth/callback/route.ts** - `37e3eda` (feat)

## Files Created/Modified
- `app/(trainer)/clients/actions.ts` - Reemplazado `createUser` + password aleatorio por `inviteUserByEmail` con data `{ full_name }`
- `app/auth/callback/route.ts` - Nuevo Route Handler GET: exchangeCodeForSession + redirect a `${origin}/today`

## Decisions Made
- `inviteUserByEmail` en lugar de `createUser`+password aleatorio: el flujo previo dejaba al cliente sin acceso real (no sabía la contraseña temporal). La invitación envía email automático de Supabase y le permite establecer su propia contraseña.
- `origin` dinámico extraído de `new URL(request.url)`: funciona en local (`localhost:3000`) y producción sin hardcodear ninguna URL.
- Sin manejo de error en callback: si `exchangeCodeForSession` falla, el usuario llega a `/today` sin sesión y el middleware lo redirige a `/login` — comportamiento correcto.

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito.

## Issues Encountered

- Build de Next.js falla por errores pre-existentes en `components/client/progress-charts.tsx` (Recharts formatter type mismatch, documentado en MEMORY.md). No relacionado con este plan. Los archivos modificados en este plan (actions.ts, route.ts) no tienen errores TypeScript.

## User Setup Required

None - no se requiere configuración de servicios externos. Supabase ya está configurado con `SUPABASE_SERVICE_ROLE_KEY` en Vercel.

**Nota:** Para que los emails de invitación lleguen en producción, Supabase debe tener SMTP configurado o usar el proveedor de email por defecto. En entorno de desarrollo, los emails se pueden ver en el Supabase Dashboard -> Authentication -> Users (estado "Invited").

## Next Phase Readiness
- Flujo de invitación completo y listo para verificación manual
- Falta verificación end-to-end (checkpoint:human-verify, Task 3) — el trainer crea un cliente, el cliente recibe email y tras clic llega a /today

---
*Phase: 46-logica-creacion-cliente-con-auth*
*Completed: 2026-03-13*
