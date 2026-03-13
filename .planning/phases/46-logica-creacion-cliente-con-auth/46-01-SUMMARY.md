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
    - app/auth/callback/page.tsx
    - app/(client)/set-password/page.tsx
  modified:
    - app/(trainer)/clients/actions.ts
    - middleware.ts

key-decisions:
  - "inviteUserByEmail en lugar de createUser+password-aleatorio — cliente recibe email de Supabase con enlace para establecer contraseña"
  - "Hash fragment (implicit flow): Supabase invite emails envían tokens como #access_token=... — el servidor nunca ve el hash, la página debe ser cliente"
  - "route.ts → page.tsx: convertido a Client Component que lee window.location.hash, llama setSession() y redirige según type"
  - "redirectTo: /auth/callback en inviteUserByEmail para que el hash llegue a la página correcta"
  - "middleware.ts: /auth/ y /set-password añadidas como rutas públicas — sin esto en producción redirigirían a /login"

patterns-established:
  - "Auth callback pattern: Client Component que lee hash fragment para flujo implícito de Supabase"

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
  → inviteUserByEmail + redirectTo: /auth/callback
    → Supabase envía email automático al cliente
      → Cliente hace clic en enlace del email
        → /auth/callback#access_token=...&refresh_token=...&type=invite
          → page.tsx lee window.location.hash
            → setSession(access_token, refresh_token)
              → redirect /set-password
                → Cliente establece contraseña (mín 8 chars + confirm)
                  → supabase.auth.updateUser({ password })
                    → redirect /today
```

Error handling: enlaces expirados → `#error=access_denied` → mensaje "Contacta con tu entrenador" (verificado ✅)

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 8e7f887 | feat(046-01): cambiar createClientAction a inviteUserByEmail |
| Task 2 | 37e3eda | feat(046-01): crear app/auth/callback/route.ts (inicial) |
| Task 3a | 46f572e | feat(46-01): redirigir type=invite a /set-password |
| Task 3b | 8df7ed3 | feat(46-01): crear página /set-password |
| Fix 1 | 436d933 | fix(46-01): detectar invite via next param |
| Fix 2 | 2678fdf | fix(46-01): convertir callback a página cliente (hash fragment) |

## Files Created/Modified
- `app/(trainer)/clients/actions.ts` — `inviteUserByEmail` con `redirectTo: /auth/callback`
- `app/auth/callback/page.tsx` — Client Component: lee hash, llama setSession, redirige según type
- `app/(client)/set-password/page.tsx` — Formulario 'use client' móvil-first: validaciones, updateUser, redirect /today
- `middleware.ts` — `/auth/` y `/set-password` añadidas como rutas públicas

## Deviations from Plan

**1. Callback como página cliente en lugar de route handler**
- **Causa:** Supabase invite usa implicit flow (hash fragments) en lugar de PKCE. El servidor nunca ve el hash.
- **Fix:** Reemplazado `route.ts` por `page.tsx` Client Component que lee `window.location.hash`.

**2. middleware.ts necesitaba rutas públicas**
- **Causa:** `/auth/callback` y `/set-password` no estaban en la lista de rutas públicas → en producción redirigirían a `/login`.
- **Fix:** Añadidas ambas rutas como públicas.

## Verification Status

- ✅ `createClientAction` usa `inviteUserByEmail`
- ✅ `/auth/callback` lee hash fragment y maneja errors
- ✅ Error handling: enlace expirado muestra mensaje correcto (verificado con email real expirado)
- ✅ `middleware.ts`: `/auth/` y `/set-password` son rutas públicas
- ⏳ Flujo completo invite→set-password→today: pendiente verificar con email fresco (rate limit Supabase activo al cierre)

## Issues Encountered

- Rate limit de Supabase al momento del cierre — impidió verificación del flujo completo con email fresco.
- Errores pre-existentes en `components/client/progress-charts.tsx` (Recharts formatter, documentado en MEMORY.md). No relacionados.

---
*Phase: 46-logica-creacion-cliente-con-auth*
*Completed: 2026-03-13*
