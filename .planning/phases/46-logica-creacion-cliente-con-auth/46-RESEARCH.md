# Phase 46: Lógica creación de cliente con Auth - Research

**Researched:** 2026-03-13
**Domain:** Supabase Auth Admin API — invitación de usuarios con email de confirmación
**Confidence:** HIGH

## Summary

Al revisar el código existente, `createClientAction` en `app/(trainer)/clients/actions.ts` ya implementa la creación de usuario en Supabase Auth (`admin.auth.admin.createUser`) con `email_confirm: true`. El usuario se crea con una contraseña aleatoria vía `crypto.randomUUID()`, lo que significa que el cliente no recibe un email de invitación para establecer su contraseña — simplemente tiene una cuenta con password desconocida.

El objetivo real de Phase 46 es cambiar ese comportamiento: en lugar de crear el usuario con password temporal y `email_confirm: true`, usar el flujo de **invitación** de Supabase (`admin.auth.admin.inviteUserByEmail`) para que el cliente reciba automáticamente un email de Supabase con enlace para establecer su propia contraseña.

La lógica de base (admin client, upsert de profile, insert en clients, rollback en error) ya está completa y funciona. Solo necesita modificarse la llamada de creación del usuario Auth.

**Primary recommendation:** Reemplazar `admin.auth.admin.createUser(...)` por `admin.auth.admin.inviteUserByEmail(email, { data: { full_name } })` en `createClientAction`. El resto del flujo (upsert profile, insert client, rollback) se mantiene igual con ajustes menores.

## Estado actual del código (CRÍTICO)

### Lo que ya existe y funciona
| Archivo | Estado | Notas |
|---------|--------|-------|
| `lib/supabase/admin.ts` | Completo | `createAdminClient()` con service role — listo para admin API |
| `app/(trainer)/clients/actions.ts` | Parcial | `createClientAction` ya crea auth user pero sin invitación |
| `components/trainer/create-client-modal.tsx` | Completo | Modal con formulario completo — NO necesita cambios |

### Comportamiento actual vs deseado
| Aspecto | Actual | Deseado |
|---------|--------|---------|
| Creación Auth | `createUser({ email, password: crypto.randomUUID(), email_confirm: true })` | `inviteUserByEmail(email, { data: { full_name } })` |
| Email al cliente | No se envía ningún email de bienvenida | Supabase envía email con enlace "Set password" |
| Cliente puede hacer login | No (contraseña desconocida) | Sí, tras hacer clic en el enlace del email |
| Rollback en error | Ya implementado | Mantener igual |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | v2.x (ya instalado) | Admin Auth API | SDK oficial — admin.auth.admin namespace |
| `lib/supabase/admin.ts` | Ya en proyecto | Service role client | Bypass RLS para operaciones admin |

### No se necesitan nuevas dependencias
Este cambio es puramente de lógica server-side. No se añade ninguna librería.

## Architecture Patterns

### Patrón: inviteUserByEmail

```typescript
// Source: Supabase Auth Admin API
const admin = createAdminClient()

// ANTES (comportamiento actual — NO envía email invitación):
const { data: authData, error: authError } = await admin.auth.admin.createUser({
  email: data.email,
  password: crypto.randomUUID(),
  email_confirm: true,
})

// DESPUÉS (comportamiento deseado — envía email para setear password):
const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
  data.email,
  {
    data: {
      full_name: data.full_name,
    },
  }
)
```

El `data` opcional en `inviteUserByEmail` se almacena en `auth.users.raw_user_meta_data`. Puede usarse en un trigger de BD para pre-rellenar `profiles.full_name`.

### Diferencia de respuesta entre createUser e inviteUserByEmail

`inviteUserByEmail` devuelve `{ data: { user: User }, error: AuthError | null }` — misma forma que `createUser`. El `profileId = authData.user.id` funciona igual.

### Flujo completo actualizado

```typescript
// 1. Invitar usuario (envía email automático)
const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
  data.email,
  { data: { full_name: data.full_name } }
)
if (authError) return { success: false, error: authError.message }

const profileId = authData.user.id

// 2. Upsert profile (sin cambios)
const { error: profileError } = await admin.from('profiles').upsert({
  id: profileId,
  email: data.email,
  full_name: data.full_name,
  role: 'client' as const,
  avatar_url: null,
})
if (profileError) {
  await admin.auth.admin.deleteUser(profileId)
  return { success: false, error: profileError.message }
}

// 3. Insert client (sin cambios)
// ... mismo código existente ...
```

### Anti-Patterns to Avoid
- **No usar `generateLink` + envío manual:** Supabase `inviteUserByEmail` ya gestiona el email. No reimplementar envío manual de emails.
- **No crear con password temporal:** `createUser` con password `crypto.randomUUID()` deja al cliente sin acceso real. Usar `inviteUserByEmail` en su lugar.
- **No exponer el admin client al browser:** `createAdminClient()` solo en Server Actions. Ya está correcto.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Envío de email de invitación | Sistema de email propio, nodemailer, Resend | `admin.auth.admin.inviteUserByEmail` | Supabase gestiona templates, tokens, expiración |
| Reset de password manual | Generar tokens propios | `admin.auth.admin.inviteUserByEmail` | El enlace de invitación funciona como "set password" first-time |
| Verificación de email | Confirmar manualmente en BD | Flujo nativo Supabase | Supabase maneja la verificación al hacer clic en el enlace |

**Key insight:** Supabase Auth tiene un flujo de invitación nativo. El cliente recibirá un email con un enlace temporal (por defecto expira en 24h, configurable en Supabase dashboard). Al hacer clic, se le lleva a la app para establecer su contraseña.

## Common Pitfalls

### Pitfall 1: Redirect URL del email de invitación
**What goes wrong:** El enlace del email de invitación redirige a la URL configurada en Supabase Auth → Email Templates → Invite user. Si no está configurada correctamente, el enlace lleva a la URL de producción aunque se esté en local.
**Why it happens:** Supabase usa `SITE_URL` o la URL configurada en el dashboard, no la URL del request.
**How to avoid:** Verificar en Supabase Dashboard → Authentication → URL Configuration que `Site URL` apunta a la URL correcta (producción: URL de Vercel). Para desarrollo, añadir `http://localhost:3000` a las `Redirect URLs` permitidas.
**Warning signs:** El cliente recibe el email pero el enlace lleva a una URL incorrecta o da error 404.

### Pitfall 2: El upsert de profile puede fallar si hay trigger automático
**What goes wrong:** Supabase puede tener un trigger `on_auth_user_created` que inserta automáticamente en `profiles`. El upsert posterior puede tener conflicto si el trigger ya insertó un row con datos parciales.
**Why it happens:** Trigger se ejecuta síncronamente en la BD al crear el usuario.
**How to avoid:** El `upsert` actual (ya en el código) es correcto — si el trigger creó el row, lo sobreescribe con datos completos. No cambiar esto.
**Warning signs:** Error de constraint en `profiles.upsert` — si ocurre, verificar si hay trigger en Supabase.

### Pitfall 3: inviteUserByEmail falla si el email ya tiene cuenta Auth
**What goes wrong:** Si el email ya existe en `auth.users`, `inviteUserByEmail` devuelve error "User already registered".
**Why it happens:** Supabase no permite crear dos usuarios con el mismo email.
**How to avoid:** La verificación existente en `createClientAction` busca en `profiles`, no en `auth.users`. Debe mantenerse (o complementarse con la verificación en profiles como está).
**Warning signs:** `authError.message` contiene "User already registered" — el mensaje de error que se devuelve al modal es suficiente.

### Pitfall 4: Configuración del template de email en Supabase
**What goes wrong:** El email que recibe el cliente usa el template por defecto de Supabase (en inglés, genérico).
**Why it happens:** No se ha personalizado en Supabase Dashboard → Authentication → Email Templates → Invite user.
**How to avoid:** Personalizar el template en el dashboard de Supabase si Bassi quiere un email branded. No es bloqueante para que el flujo funcione.
**Warning signs:** El cliente recibe email en inglés sin branding de Fitness Bassi.

## Code Examples

### createClientAction modificada (solo la parte Auth cambia)

```typescript
// Source: app/(trainer)/clients/actions.ts — modificación mínima

// ANTES:
const { data: authData, error: authError } = await admin.auth.admin.createUser({
  email: data.email,
  password: crypto.randomUUID(),
  email_confirm: true,
})

// DESPUÉS:
const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
  data.email,
  {
    data: {
      full_name: data.full_name,
    },
  }
)
```

El resto del código de `createClientAction` (verificación de email existente, upsert de profile, insert de client, rollback en error) NO cambia.

### Verificación de configuración de redirect URL (Supabase Dashboard)

En Supabase Dashboard → Authentication → URL Configuration:
- `Site URL`: URL de producción (Vercel)
- `Redirect URLs`: añadir `http://localhost:3000/**` para desarrollo

El enlace del email redirige a `[SITE_URL]/auth/callback?token=...` por defecto. Verificar que la app maneja este callback correctamente.

### Callback de Auth en Next.js (verificar si existe)

```typescript
// app/auth/callback/route.ts — puede necesitar existir
// Si no existe, Supabase SSR lo necesita para completar el intercambio de token
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/today`)
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `createUser` con password temporal | `inviteUserByEmail` | Cliente recibe email real y puede establecer su password |
| Sin email al cliente | Email automático de Supabase | No requiere configuración de servidor SMTP propio |

## Open Questions

1. **¿Existe `app/auth/callback/route.ts`?**
   - What we know: El middleware maneja auth, pero el callback post-invitación puede necesitar una route específica.
   - What's unclear: Si Supabase SSR maneja el callback automáticamente vía middleware o necesita route explícita.
   - Recommendation: Verificar si existe en el proyecto. Si no, añadirlo como parte de la fase.

2. **¿Personalizar template de email?**
   - What we know: Supabase tiene template editor en el dashboard.
   - What's unclear: Si Bassi quiere email branded o el genérico es suficiente.
   - Recommendation: El genérico es suficiente para v1. Dejar como mejora futura.

3. **¿Expiración del enlace de invitación?**
   - What we know: Por defecto 24h (configurable en Supabase dashboard).
   - What's unclear: Si Bassi quiere más tiempo (clientes pueden tardar en revisar email).
   - Recommendation: Verificar en Supabase Dashboard → Auth → Settings → Email OTP Expiry. Ajustar si necesario (recomendado: 7 días para invitaciones).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework detectado en el proyecto |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req | Behavior | Test Type | Automated Command | File Exists? |
|-----|----------|-----------|-------------------|-------------|
| SC-1 | Crear cliente crea usuario en Auth | manual-only | Verificar en Supabase Dashboard → Auth → Users | N/A |
| SC-2 | Cliente recibe email para establecer password | manual-only | Verificar en bandeja de entrada del email de prueba | N/A |
| SC-3 | Cliente puede hacer login tras establecer password | manual-only | Navegar a login con las credenciales establecidas | N/A |

### Wave 0 Gaps
Ninguno — no hay infraestructura de tests en el proyecto. Las verificaciones son manuales.

## Sources

### Primary (HIGH confidence)
- Código fuente: `app/(trainer)/clients/actions.ts` — implementación actual de `createClientAction`
- Código fuente: `lib/supabase/admin.ts` — `createAdminClient()` con service role
- Código fuente: `components/trainer/create-client-modal.tsx` — modal de creación completo

### Secondary (MEDIUM confidence)
- Supabase Auth Admin API docs — `inviteUserByEmail` vs `createUser` behavioral difference
- CLAUDE.md: "Para operaciones admin: usar service role, nunca anon key"
- STATE.md: "Admin service role client for INSERT/UPDATE (no RLS INSERT policy for clients table)"

### Tertiary (LOW confidence)
- Comportamiento exacto del callback de invitación en el contexto de esta app específica — requiere verificar `app/auth/callback/route.ts`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `createAdminClient` ya existe y funciona, solo cambia la llamada Auth
- Architecture: HIGH — la mayor parte del código no cambia; cambio mínimo y localizado
- Pitfalls: MEDIUM — redirect URL y auth callback son específicos del entorno Supabase de Bassi

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (API Admin de Supabase es estable)
