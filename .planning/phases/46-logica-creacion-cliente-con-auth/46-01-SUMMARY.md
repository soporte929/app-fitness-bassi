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
    - app/(client)/set-password/page.tsx
  modified:
    - app/(trainer)/clients/actions.ts
    - app/auth/callback/route.ts

key-decisions:
  - "inviteUserByEmail en lugar de createUser+password-aleatorio — cliente recibe email de Supabase con enlace para establecer contraseña"
  - "origin dinámico en callback/route.ts (new URL(request.url).origin) — funciona tanto en local como en producción sin hardcodear URLs"
  - "type=invite detectado en callback para redirigir a /set-password — separa flujo invitación del flujo login normal"
  - "supabase.auth.updateUser en set-password/page.tsx — client-side, sesión ya establecida por exchangeCodeForSession en callback"

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

**inviteUserByEmail + callback con detección type=invite + página /set-password: flujo de invitación Supabase completo de extremo a extremo**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-03-13
- **Tasks:** 4 (2 auto originales + 2 auto adicionales por gap detectado)
- **Files modified:** 3

## Accomplishments
- `createClientAction` ahora usa `inviteUserByEmail` — Supabase envía email automático al cliente con enlace para establecer contraseña
- `app/auth/callback/route.ts` creado — intercambia el code token del email por sesión activa
- Callback modificado para detectar `type=invite` y redirigir a `/set-password` en lugar de `/today`
- `app/(client)/set-password/page.tsx` creado — formulario móvil-first para establecer contraseña post-invitación
- Flujo completo: trainer invita → email → callback → /set-password → /today

## Complete Invite Flow

```
Trainer crea cliente
  → inviteUserByEmail (Supabase envía email automático)
    → Cliente hace clic en enlace
      → /auth/callback?code=...&type=invite
        → exchangeCodeForSession(code)
          → redirect /set-password
            → Cliente establece contraseña (mín 8 chars + confirm)
              → supabase.auth.updateUser({ password })
                → redirect /today
```

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 8e7f887 | feat(046-01): cambiar createClientAction a inviteUserByEmail |
| Task 2 | 37e3eda | feat(046-01): crear app/auth/callback/route.ts |
| Task 3a | 46f572e | feat(46-01): redirigir type=invite a /set-password en auth callback |
| Task 3b | 8df7ed3 | feat(46-01): crear página /set-password para flujo de invitación |

## Files Created/Modified
- `app/(trainer)/clients/actions.ts` — Reemplazado `createUser` + password aleatorio por `inviteUserByEmail` con data `{ full_name }`
- `app/auth/callback/route.ts` — Route Handler GET: exchangeCodeForSession + detección type=invite → /set-password vs /today
- `app/(client)/set-password/page.tsx` — Formulario 'use client' móvil-first: validaciones, updateUser, redirect /today

## Decisions Made
- `inviteUserByEmail` en lugar de `createUser`+password aleatorio: el flujo previo dejaba al cliente sin acceso real. La invitación envía email automático y permite establecer su propia contraseña.
- `origin` dinámico extraído de `new URL(request.url)`: funciona en local y producción sin hardcodear URLs.
- `type=invite` detectado en callback: separa el flujo de invitación (→ /set-password) del flujo de login normal (→ /today).
- `supabase.auth.updateUser` client-side en set-password: la sesión ya está establecida por `exchangeCodeForSession` en el callback previo.

## Deviations from Plan

### Auto-added Missing Functionality

**1. [Rule 2 - Gap detectado en checkpoint] Página /set-password + detección type=invite**
- **Found during:** Checkpoint Task 3 (human-verify)
- **Issue:** Callback redirigía a /today directamente pero cliente no tenía contraseña establecida. Faltaba página para el paso intermedio.
- **Fix:** Modificado callback para detectar type=invite; creada página /set-password con formulario.
- **Files modified:** app/auth/callback/route.ts (modificado), app/(client)/set-password/page.tsx (creado)
- **Commits:** 46f572e, 8df7ed3

## Issues Encountered

- Errores pre-existentes en `components/client/progress-charts.tsx` (Recharts formatter type mismatch, documentado en MEMORY.md). No relacionados con este plan. Los archivos de este plan no tienen errores TypeScript.

---
*Phase: 46-logica-creacion-cliente-con-auth*
*Completed: 2026-03-13*
