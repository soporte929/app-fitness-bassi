# Phase 29: Performance Optimization - Research

**Researched:** 2026-03-11
**Domain:** Next.js 16 Server Component caching, Supabase query parallelization, PostgreSQL indexing
**Confidence:** HIGH

## Summary

Esta fase es quirúrgica: hay tres páginas objetivo (dashboard trainer, today, progress) y tres vectores de optimización (Promise.all, unstable_cache, índices DB). El análisis del código real revela que la mayoría de páginas ya usan Promise.all correctamente, pero hay una oportunidad concreta en `today/page.tsx` (dos queries secuenciales donde la segunda depende de la primera — no paralelizable sin refactor) y en el dashboard (la query de clients es necesariamente previa a sessions+weights, que ya está paralelizada).

El vector de mayor impacto real es `unstable_cache`: actualmente **cero** páginas la usan. Las tres páginas objetivo hacen queries pesadas en cada request que son buenas candidatas para cache con TTL corto y revalidación por tag cuando el usuario muta datos. Esto es especialmente valioso en el dashboard del trainer, que agrega datos de múltiples clientes.

El vector de índices DB es directo: son 4 columnas, todos son `CREATE INDEX IF NOT EXISTS` sin riesgo. Supabase los crea en background y los añade al schema sin downtime.

**Primary recommendation:** Aplicar `unstable_cache` al dashboard del trainer y a progress/page.tsx; añadir los 4 índices en Supabase; en today/page.tsx la dependencia entre queries es real (necesitas `client.id` para buscar la sesión) y no es paralelizable sin cambiar la arquitectura.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/cache` (unstable_cache) | Next.js 16.1.6 | Memoiza resultados de async functions con TTL y tags | API oficial de Next.js App Router para caching de Server Components |
| `next/cache` (revalidateTag) | Next.js 16.1.6 | Invalida entradas de cache por tag desde Server Actions | Patrón establecido — ya en uso en varios actions.ts del proyecto |
| `Promise.all` | JS nativo | Paraleliza queries independientes | Ya en uso en dashboard, progress, workout — patrón establecido |

### No nuevas dependencias
Esta fase no requiere instalar ningún paquete nuevo. Todo lo necesario ya está en Next.js 16 y el proyecto.

## Architecture Patterns

### Análisis de queries por página

#### `app/(trainer)/dashboard/page.tsx` — MAYOR IMPACTO
```
1. supabase.auth.getUser()                     [sequential — necesario primero]
2. supabase.from('clients').select(...)        [sequential — necesita user.id]
3. Promise.all([sessions, weight_logs])        [YA paralelizado — correcto]
```
**Oportunidad:** Envolver las queries 2+3 en `unstable_cache`. El dashboard agrega datos de todos los clientes (potencialmente 10-50 queries en una) y se renderiza frecuentemente. Con cache de 60s y tag `dashboard-{trainerId}`, cada trainer solo paga el coste de Supabase una vez por minuto.

**Revalidar cuando:** `revalidateTag(`dashboard-${trainerId}`)` en actions de clients (updateClientAction, createClientAction, deleteClientAction) — que ya llaman `revalidatePath`, añadir `revalidateTag` es mínimo.

#### `app/(client)/progress/page.tsx` — IMPACTO MEDIO-ALTO
```
1. supabase.auth.getUser()                     [sequential — necesario]
2. supabase.from('clients').select(...)        [sequential — necesita user.id]
3. Promise.all([measurements, sessions])       [YA paralelizado — correcto]
```
**Oportunidad:** Las queries 2+3 son candidatas a `unstable_cache`. Los datos de progreso cambian poco (el cliente registra peso/medidas ocasionalmente). Cache de 30s con tag `progress-{clientId}`.

**Revalidar cuando:** `revalidateTag(`progress-${clientId}`)` en `app/(client)/progress/actions.ts` tras insertar mediciones o peso.

#### `app/(client)/today/page.tsx` — BAJO IMPACTO (dependencia real)
```
1. supabase.auth.getUser()                     [sequential — necesario]
2. supabase.from('clients').select('id')       [sequential — necesita user.id]
3. supabase.from('workout_sessions').select()  [sequential — DEPENDE de client.id]
```
**Conclusión:** Las queries 2 y 3 tienen dependencia real (necesita `client.id`). No son paralelizables sin refactor mayor. La query es ligera (`.maybeSingle()` con índice en `client_id`). El índice en `workout_sessions.client_id` la acelera directamente. **No aplicar unstable_cache aquí** — esta página siempre redirige si hay sesión activa, por lo que cachear podría hacer que un usuario no sea redirigido a su sesión en curso.

### Pattern 1: unstable_cache con revalidación por tag
**What:** Envuelve la función de fetching en `unstable_cache`. El resultado se almacena en el Data Cache de Next.js hasta que expire o sea invalidado.
**When to use:** Datos que cambian por mutación explícita (no polling), fetched en Server Components, sin estado de usuario sensible (o con key por usuario).

```typescript
// Source: Next.js 16 official docs — unstable_cache
import { unstable_cache } from 'next/cache'

// Patrón: función de cache keyed por trainer ID
const getDashboardData = unstable_cache(
  async (trainerId: string) => {
    const supabase = await createClient()
    // queries aquí
    return { clients, sessions, weightLogs }
  },
  ['dashboard-data'],          // cache key base
  {
    revalidate: 60,            // TTL en segundos
    tags: ['dashboard'],       // tag para invalidación manual
  }
)

// En el Server Component:
export default async function TrainerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getDashboardData(user.id)
  // render con data
}
```

**IMPORTANTE:** `unstable_cache` no puede usar el cliente Supabase SSR directamente dentro de la función cacheada en algunos contextos porque el cliente SSR lee cookies de la request actual. La solución es pasar el `trainerId` (o `clientId`) como argumento y crear un cliente service-role dentro, O usar el cliente browser-side con JWT explícito, O aceptar que la función se ejecuta en el contexto de request y confiar en que Next.js la cachea correctamente después de la primera ejecución.

**Alternativa más segura para este proyecto (SSR + RLS):** Cachear solo el resultado procesado pasando datos primitivos (IDs) como clave de cache. Ver Anti-Patterns.

### Pattern 2: revalidateTag en Server Actions (ya en uso parcialmente)
```typescript
// Source: código existente en app/(trainer)/clients/actions.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateClientAction(clientId: string, data: Partial<ClientUpdate>) {
  // ... mutación
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/clients')
  revalidateTag(`dashboard-${trainerId}`)  // AÑADIR esto
}
```

### Pattern 3: Promise.all ya establecido — validar cobertura completa
El patrón correcto ya está en uso. Solo verificar que ninguna página nueva tenga queries secuenciales no justificadas.

```typescript
// Source: app/(client)/progress/page.tsx (ya correcto)
const [measurementsResult, sessionsResult] = await Promise.all([
  supabase.from('client_measurements').select(...).eq('client_id', client.id),
  supabase.from('workout_sessions').select(...).eq('client_id', client.id),
])
```

### Pattern 4: Índices PostgreSQL en Supabase
```sql
-- Source: PostgreSQL docs — CREATE INDEX CONCURRENTLY
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_measurements_client_id
  ON client_measurements (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_client_id
  ON workout_sessions (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_client_id
  ON food_log (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_set_logs_session_id
  ON set_logs (session_id);
```

**`CONCURRENTLY`:** Permite que PostgreSQL cree el índice sin bloquear writes. Obligatorio en producción. En Supabase free tier puede tardar segundos a minutos dependiendo del volumen de datos. `IF NOT EXISTS` hace el script idempotente (seguro de re-ejecutar).

### Anti-Patterns to Avoid

- **unstable_cache con createClient() SSR dentro de la función cacheada:** El cliente SSR de Supabase usa cookies de la request HTTP actual. Si `unstable_cache` reutiliza la función cacheada en un request diferente, puede usar las cookies del request original. Solución: usar service role client dentro de la función cacheada (el proyecto ya tiene este patrón en actions.ts) o pasar el JWT como argumento.

- **Cachear la sesión activa del usuario en today/page.tsx:** Esta página siempre redirige si hay una sesión activa. Cachear ese resultado podría causar que un usuario no sea redirigido a su sesión en curso si la cache no está invalidada. No cachear esta página.

- **revalidateTag sin revalidatePath:** Asegurarse de que cuando se añade `revalidateTag` no se elimina `revalidatePath`. Son complementarios. El `revalidatePath` actualiza el router cache del browser; `revalidateTag` invalida el Data Cache del servidor.

- **Crear índices sin CONCURRENTLY en producción:** Un `CREATE INDEX` sin `CONCURRENTLY` bloquea writes en la tabla mientras se construye. Con `CONCURRENTLY`, no hay bloqueo.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Memoización de queries | Custom in-memory Map en módulo | `unstable_cache` de Next.js | Next.js gestiona invalidación, TTL, y distribución en edge. Custom cache no sobrevive deploys ni scale horizontal. |
| Invalidación por evento | Polling o WebSocket custom | `revalidateTag` en Server Actions | Ya integrado con el Data Cache de Next.js. Zero boilerplate extra. |
| Índices DB | Código aplicación para reducir queries | `CREATE INDEX` en PostgreSQL | El índice es la solución correcta — la base de datos lo usa automáticamente. |
| Paralelización de queries | Ejecutar en loops | `Promise.all` | Patrón ya establecido en el proyecto. |

## Common Pitfalls

### Pitfall 1: unstable_cache + Supabase SSR client (cookies context leak)
**What goes wrong:** La función pasada a `unstable_cache` captura el cliente Supabase SSR que lee cookies del request HTTP. En el segundo request, Next.js reutiliza el resultado cacheado pero si el cache miss ocurre en un contexto diferente, el cliente puede leer cookies incorrectas.
**Why it happens:** El cliente SSR de Supabase (`createClient` del servidor) está diseñado para ser instanciado por request, no cacheado entre requests.
**How to avoid:** Dos opciones:
  1. Pasar `userId`/`trainerId` como argumento a la función cacheada y usar el admin/service-role client dentro (no depende de cookies).
  2. Cachear solo datos que no dependen de RLS por usuario (datos públicos).
  3. Aceptar el riesgo si el cache key incluye el userId — Next.js crea una entrada separada por key, por lo que cada usuario tiene su propia cache entry.
**Warning signs:** Usuarios ven datos de otro usuario. En este proyecto con RLS estricto, esto debería fallar en PostgreSQL antes de llegar al cliente, pero es un vector de bugs difíciles de debuggear.

### Pitfall 2: Tags demasiado genéricos o demasiado granulares
**What goes wrong:** Tag `'dashboard'` invalidado por cualquier acción de cualquier trainer (sobre-invalidación). O tag `'dashboard-client-123-session-456'` que nunca se invalida porque la key no coincide exactamente.
**How to avoid:** Usar tags con el ID del recurso propietario: `dashboard-${trainerId}`, `progress-${clientId}`. Documentar en cada action qué tags invalida.

### Pitfall 3: Olvidar revalidateTag en acciones nuevas
**What goes wrong:** Se añade cache pero una nueva action.ts muta datos sin invalidar el tag correspondiente. La página muestra datos obsoletos.
**How to avoid:** Documentar en RESEARCH/PLAN qué acciones deben invalidar qué tags. Crear una convención: cuando una action muta datos de una tabla, buscar todos los tags que dependen de esa tabla.

### Pitfall 4: Índices duplicados o mal nombrados
**What goes wrong:** PostgreSQL ya tiene un índice implícito en columnas con FK o en columnas de PK. Crear un índice duplicado desperdicia espacio y ralentiza writes.
**How to avoid:** Verificar índices existentes antes de crearlos: `SELECT indexname, tablename, indexdef FROM pg_indexes WHERE tablename IN ('client_measurements', 'workout_sessions', 'food_log', 'set_logs');` en Supabase SQL Editor.

### Pitfall 5: Medir sin baseline
**What goes wrong:** Aplicar optimizaciones y no saber si mejoraron algo.
**How to avoid:** Medir tiempo de carga antes y después. En Vercel: Analytics > Web Vitals > TTFB. En desarrollo: `console.time()` en Server Component o Network tab en DevTools.

## Code Examples

### Verificar índices existentes antes de crear
```sql
-- Source: PostgreSQL docs — pg_indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('client_measurements', 'workout_sessions', 'food_log', 'set_logs')
ORDER BY tablename, indexname;
```

### unstable_cache para dashboard del trainer (patrón seguro)
```typescript
// Source: Next.js 16.1.6 docs — Data Fetching / Caching
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin' // service role

const getTrainerDashboardData = unstable_cache(
  async (trainerId: string, thirtyDaysAgo: string) => {
    const supabase = createAdminClient()

    const { data: rawClients } = await supabase
      .from('clients')
      .select(`id, phase, weight_kg, profile:profiles!clients_profile_id_fkey (full_name)`)
      .eq('trainer_id', trainerId)
      .eq('active', true)

    const clientIds = (rawClients ?? []).map((c) => c.id)
    if (clientIds.length === 0) return { clients: [], sessions: [], weightLogs: [] }

    const [{ data: sessions }, { data: weightLogs }] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('client_id, started_at, completed')
        .in('client_id', clientIds)
        .gte('started_at', thirtyDaysAgo),
      supabase
        .from('weight_logs')
        .select('client_id, weight_kg, logged_at')
        .in('client_id', clientIds)
        .gte('logged_at', thirtyDaysAgo)
        .order('logged_at', { ascending: true }),
    ])

    return { clients: rawClients ?? [], sessions: sessions ?? [], weightLogs: weightLogs ?? [] }
  },
  ['trainer-dashboard'],
  { revalidate: 60, tags: ['trainer-dashboard'] }  // tag genérico — invalidar por trainerId desde action
)
```

**Nota sobre el tag:** Como `unstable_cache` crea una key separada para cada combinación de argumentos, la entrada del cache para el trainer A es diferente de la del trainer B. El tag `'trainer-dashboard'` invalida TODAS las entradas de todos los trainers si se usa en `revalidateTag`. Para invalidación selectiva por trainer, usar `revalidateTag(`dashboard-${trainerId}`)` — pero entonces ese tag debe estar en el array `tags` también.

### revalidateTag en Server Actions
```typescript
// Source: Next.js 16.1.6 docs — Server Actions and Mutations
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateClientAction(clientId: string, data: ...) {
  // ... mutación Supabase

  // Invalidar paths (ya existente)
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/clients')

  // Invalidar cache del dashboard del trainer
  // trainerId debe obtenerse del contexto de auth aquí
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) revalidateTag(`dashboard-${user.id}`)
}
```

### SQL: crear los 4 índices
```sql
-- Source: PostgreSQL docs — Indexes
-- Ejecutar en Supabase Dashboard > SQL Editor

-- Verificar primero
SELECT tablename, indexname FROM pg_indexes
WHERE tablename IN ('client_measurements', 'workout_sessions', 'food_log', 'set_logs')
ORDER BY tablename;

-- Crear índices (CONCURRENTLY = sin downtime)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_measurements_client_id
  ON public.client_measurements (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_client_id
  ON public.workout_sessions (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_client_id
  ON public.food_log (client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_set_logs_session_id
  ON public.set_logs (session_id);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticProps` / `getServerSideProps` | Server Components + `unstable_cache` | Next.js 13+ App Router | Cache más granular, sin page-level wrapper |
| `cache()` de React | `unstable_cache` de Next.js para cross-request | Next.js 14+ | `cache()` de React solo dura un request. `unstable_cache` persiste entre requests |
| `revalidatePath` únicamente | `revalidateTag` + `revalidatePath` juntos | Next.js 14+ | Tags permiten invalidación cruzada sin conocer la URL exacta |

**Deprecated/outdated:**
- `getServerSideProps`: No aplica en App Router. No usar.
- `fetch` con `{ cache: 'no-store' }` para deshabilitar cache en Supabase queries: No necesario, el cliente de Supabase no usa `fetch` internamente de la misma manera. `unstable_cache` es el mecanismo correcto.

## Open Questions

1. **Service role client disponible en lib/supabase/**
   - What we know: El proyecto usa admin client en algunos actions (phases anteriores lo mencionan). Hay `lib/supabase/client.ts` y `lib/supabase/server.ts`.
   - What's unclear: Si existe `lib/supabase/admin.ts` con service role. Si no existe, hay que crearlo o usar el patrón alternativo (pasar userId como arg y dejar que RLS filtre, aceptando que el cache no sea por usuario).
   - Recommendation: El planner debe verificar si existe `lib/supabase/admin.ts`. Si no existe, crear el archivo como parte del Wave 0 de esta fase. Alternativamente, usar `createClient()` del servidor dentro de `unstable_cache` con userId como key — Next.js crea entries separadas por argumento, por lo que no hay leak entre usuarios, y RLS sigue activo.

2. **Vercel Analytics / medición baseline**
   - What we know: El objetivo es < 2s en producción en Vercel.
   - What's unclear: Si Vercel Analytics está configurado en el proyecto. Sin baseline, no se puede confirmar el criterio de éxito SC-04.
   - Recommendation: Antes de optimizar, medir TTFB de las 3 páginas con Network tab en DevTools en producción (si ya está deployed) o establecer que el criterio se verifica con build local `next build && next start` midiendo con Lighthouse.

## Validation Architecture

> Skipped — `workflow.nyquist_validation` not configured (config.json not found). No test infrastructure detected.

## Análisis de impacto por página

### Dashboard trainer (`/dashboard`)
- **Queries actuales:** auth.getUser → clients (secuencial, necesario) → Promise.all[sessions, weight_logs] (ya paralelo)
- **Problema:** Sin cache. Cada visita hace 3 round-trips a Supabase.
- **Fix:** `unstable_cache` para clients + sessions + weight_logs con TTL 60s, tag `dashboard-${user.id}`.
- **Revalidar en:** updateClientAction, createClientAction, deleteClientAction.
- **Impacto esperado:** Reducción ~60-80% en tiempo de carga en visitas recurrentes.

### Progress page (`/progress`)
- **Queries actuales:** auth.getUser → clients → Promise.all[measurements, sessions]
- **Problema:** Sin cache. Las queries de measurements y sessions son potencialmente grandes (todos los registros históricos).
- **Fix:** `unstable_cache` para measurements + sessions con TTL 30s, tag `progress-${client.id}`.
- **Revalidar en:** `app/(client)/progress/actions.ts` tras insertar mediciones/peso.
- **Impacto esperado:** Reducción ~50-70% en tiempo de carga tras primera visita.

### Today page (`/today`)
- **Queries actuales:** auth.getUser → clients → sessions (secuencial por dependencia real)
- **Problema:** Las queries son ligeras (single row cada una). El índice en `workout_sessions.client_id` acelera la query de sesión.
- **Fix:** Solo índice DB. No cachear (razón: siempre puede redirigir a sesión activa — cache obsoleta sería un bug funcional).
- **Impacto esperado:** Reducción ~20-30% en tiempo de query con el índice.

## Sources

### Primary (HIGH confidence)
- Código fuente del proyecto: `app/(trainer)/dashboard/page.tsx`, `app/(client)/progress/page.tsx`, `app/(client)/today/page.tsx` — análisis directo de queries
- Next.js 16.1.6 en `package.json` — versión confirmada
- `revalidatePath` ya en uso en `app/(trainer)/clients/actions.ts` — patrón establecido

### Secondary (MEDIUM confidence)
- Next.js docs (unstable_cache, revalidateTag): API documentada en Next.js 13-16, estable en la práctica aunque marcada como "unstable" en el nombre
- PostgreSQL docs (CREATE INDEX CONCURRENTLY IF NOT EXISTS): comportamiento estándar, verificable

### Tertiary (LOW confidence)
- Estimaciones de impacto (60-80% mejora): basadas en patrones generales de caching, no medidas reales. Requieren validación con Lighthouse/Vercel Analytics en producción.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todo en Next.js 16 y PostgreSQL, sin dependencias nuevas
- Architecture: HIGH — análisis del código real, no supuestos
- Pitfalls: HIGH — derivados del código existente y de la naturaleza de unstable_cache + Supabase SSR
- Impact estimates: LOW — sin baseline medido

**Research date:** 2026-03-11
**Valid until:** 2026-06-11 (estable — Next.js App Router y PostgreSQL índices no cambian rápido)
