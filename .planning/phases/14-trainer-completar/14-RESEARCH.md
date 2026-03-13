# Phase 14: Trainer Completar — Research

**Researched:** 2026-03-10
**Domain:** Next.js App Router, Supabase, trainer-side UI completions
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRN-01 | El entrenador puede navegar y gestionar la librería de ejercicios desde `/exercises` | La tabla `exercises` existe en DB. Los ejercicios NO son una librería global — están vinculados a `workout_days` (FK: `day_id`). La query cross-plan requiere join vía `workout_days → workout_plans`. El trainer puede ver los ejercicios de todos sus planes. |
| TRN-02 | El botón "Ver historial" en el detalle de un cliente navega al historial de sesiones de ese cliente | El botón existe en `app/(trainer)/clients/[id]/page.tsx` (línea 377) pero es un `<Button>` sin `href`. Hay que crear `app/(trainer)/clients/[id]/history/page.tsx` y convertir el botón en un `<Link>`. La query es idéntica a la de `app/(client)/history/page.tsx` pero filtrada por `client_id` en vez de `profile_id`. |
| TRN-03 | Los links muertos del sidebar del trainer están eliminados o redirigidos | `components/trainer/sidebar.tsx` tiene dos links rotos: `/reports` (FileText) y `/settings` (Settings). Ninguna de estas rutas existe. La solución más simple es eliminarlos del array `navigation`. |
</phase_requirements>

---

## Summary

Phase 14 cubre tres tareas de completado del lado trainer. Son independientes entre sí y de baja/media complejidad:

1. **TRN-01 — Exercises Library (`/exercises`):** No existe la página. La tabla `exercises` existe y está tipada, pero sus filas apuntan a `workout_days` (no son ejercicios "globales"). La página mostrará los ejercicios de todos los planes del trainer (templates + clientes), agrupados o filtrables por `muscle_group`. Es una página de solo lectura — **no se gestionan** (no hay CRUD requerido en el criterio de éxito: solo "browse or filter"). Requiere crear `app/(trainer)/exercises/page.tsx`.

2. **TRN-02 — Client History page (`/clients/[id]/history`):** El botón "Ver historial" ya existe en el detalle del cliente pero no tiene `href`. El historial del cliente sigue el mismo patrón que `app/(client)/history/page.tsx` pero el trainer accede via `client_id` directamente (sin necesidad de resolver `profile_id → client_id`). La `workout_sessions` query ya incluye un campo de seguridad (`trainer_id` en la tabla `clients` verifica propiedad). Requiere crear `app/(trainer)/clients/[id]/history/page.tsx` y convertir el `<Button>` a `<Link>`.

3. **TRN-03 — Sidebar cleanup:** Eliminar o comentar las entradas `/reports` y `/settings` del array `navigation` en `components/trainer/sidebar.tsx`. No hay páginas creadas para estas rutas. La opción más limpia es eliminarlas del array.

Ninguna de las tres tareas requiere migración SQL, nuevos tipos, ni nuevas dependencias.

---

## Standard Stack

No hay nuevas dependencias necesarias. Todo sigue patrones ya establecidos:

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `createClient` de `@/lib/supabase/server` | — | Fetch server-side data | Patrón establecido en todas las páginas Server Component |
| `Link` de `next/link` | 16.1.6 | Navegación declarativa | Estándar del proyecto |
| `PageTransition` | local | Envolver contenido de página | Obligatorio per CLAUDE.md |
| Lucide React | ^0.577.0 | Iconos | Estándar del proyecto |
| `Card`, `Badge`, `Button` | local `components/ui/` | UI components | Design system establecido |

**Installation:** No se requiere nada nuevo.

---

## Architecture Patterns

### TRN-01: Exercises Library page

**Ruta:** `app/(trainer)/exercises/page.tsx`

El sidebar ya tiene el link `/exercises` con ícono `Dumbbell`. La ruta cae dentro del grupo `(trainer)` por las reglas de middleware, por lo que la autenticación está cubierta.

**Query Supabase:**
```typescript
// exercises están ligados a workout_days → workout_plans → trainer_id
// Necesitamos FK hints para evitar la dirección de FK ambigua
const { data: rawExercises } = await supabase
  .from('exercises')
  .select(`
    id, name, muscle_group, target_sets, target_reps, target_rir, notes,
    workout_day:workout_days!exercises_day_id_fkey (
      id, name,
      workout_plan:workout_plans!workout_days_plan_id_fkey (
        id, name, trainer_id, is_template
      )
    )
  `)
  // No hay FK directa de exercises → trainer_id
  // Filtrar post-query comparando workout_plan.trainer_id === user.id
```

**Problema:** No hay FK directa `exercises → trainer_id`. La tabla `exercises` solo tiene `day_id`. Para filtrar por trainer, necesitamos:

Opción A — Join en query con filtrado post:
```typescript
// Después de fetch, filter:
const ownExercises = rawExercises?.filter(ex => {
  const plan = ex.workout_day?.workout_plan
  return plan?.trainer_id === user.id && plan?.active !== false
})
```

Opción B — Query directa con join anidado y `.eq()` no funciona sobre nested joins en supabase-js. Pero el RLS ya hace el trabajo: la política `exercises_access` limita lo que el trainer ve por `wp.trainer_id = auth.uid()`. Por lo tanto, la query retornará solo ejercicios de este trainer sin necesidad de filtrar manualmente. **Esta es la opción correcta** — el RLS ya protege la query.

```typescript
// RLS guarantee: exercises policy says:
// day_id IN (SELECT wd.id FROM workout_days wd
//             JOIN workout_plans wp ON wp.id = wd.plan_id
//             WHERE wp.trainer_id = auth.uid() ...)
// → Solo retorna ejercicios del trainer autenticado
const { data: rawExercises } = await supabase
  .from('exercises')
  .select(
    'id, name, muscle_group, target_sets, target_reps, target_rir, notes, order_index, day_id'
  )
  .order('muscle_group', { ascending: true })
  .order('name', { ascending: true })
```

**Agrupación:** Agrupar por `muscle_group` en el Server Component después de la query.

**Filtro por muscle_group:** El criterio de éxito dice "browse or filter by muscle group". Un filtro simple de lado cliente (Client Component con `useState` para el muscle_group seleccionado) es suficiente. El Server Component renderiza todos los ejercicios y pasa el array a un Client Component con la lógica de filtro.

**Unique muscle groups:** Derivar de la data retornada — no hardcodear.

**Limitación conocida:** Los ejercicios no son una librería global independiente — cada ejercicio está en un `day_id`. La UI puede mostrar de qué plan proviene cada ejercicio (útil para el trainer). Sin embargo, el criterio de éxito solo pide browse/filter por muscle group — el plan name es informativo.

**Tipo a usar:**
```typescript
import type { Database } from '@/lib/supabase/types'
type Exercise = Database['public']['Tables']['exercises']['Row']
```

### TRN-02: Trainer Client History page

**Ruta:** `app/(trainer)/clients/[id]/history/page.tsx`

**Cambio en client detail:** Convertir el `<Button>` de "Ver historial" en un `<Link>` que apunta a `/clients/${id}/history`.

La página es casi idéntica a `app/(client)/history/page.tsx` con estas diferencias clave:

| Diferencia | Cliente | Trainer |
|-----------|---------|---------|
| Auth lookup | `clients` via `profile_id = user.id` | `clients` via `id = param` + `trainer_id = user.id` (seguridad) |
| Ruta | `/history` | `/clients/[id]/history` |
| Back button | Nav bottom | Link `ArrowLeft` a `/clients/${id}` |
| PR detection | Sí (ya implementado) | Opcional — puede omitirse para simplicidad |

**Security check:**
```typescript
const { data: client } = await supabase
  .from('clients')
  .select('id, profile:profiles!clients_profile_id_fkey (full_name)')
  .eq('id', id)               // param
  .eq('trainer_id', user.id)  // security: only own clients
  .single()

if (!client) notFound()
```

**Reutilización de componentes:**
- `app/(client)/history/page.tsx` usa `HistoryFilters` y `SessionHistoryCard` de `components/client/`. Estos componentes son agnósticos del rol — reciben `sessions: SessionData[]` como props. Se pueden reutilizar directamente en la página del trainer.
- NO hay que duplicar la lógica de formato de duración — se puede copiar/extraer.

**Consideración de PR detection:** La función `detectSessionPRs` está en `lib/pr-detection.ts` y acepta `(supabase, clientId, sessionId, exerciseIds[])`. Funciona con cualquier `clientId` sin depender del rol. Se puede reutilizar.

**Query sessions** (idéntica a client history pero filtrando por `client_id` directamente):
```typescript
const { data: rawSessions } = await supabase
  .from('workout_sessions')
  .select(`
    id, started_at, finished_at,
    workout_day:workout_days!workout_sessions_day_id_fkey (name),
    set_logs (
      weight_kg, reps, completed,
      exercises (id, muscle_group)
    )
  `)
  .eq('client_id', client.id)
  .eq('completed', true)
  .order('finished_at', { ascending: false })
```

**FK hints requeridos:** El join `workout_day` DEBE usar FK hint `!workout_sessions_day_id_fkey` — confirmado por el patrón en `clients/[id]/page.tsx` línea 61 y en `history/page.tsx` línea 60.

**params es Promise:** `params: Promise<{ id: string }>` con `const { id } = await params` — confirmado por MEMORY.md.

### TRN-03: Sidebar cleanup

**Archivo:** `components/trainer/sidebar.tsx`

**Problema:** El array `navigation` en líneas 24-46 incluye:
- `/reports` con ícono `FileText` — ruta no existe
- `/settings` con ícono `Settings` — ruta no existe

**Solución:** Eliminar ambas entradas del array `navigation`. El import de `FileText` y `Settings` también debe eliminarse (o TypeScript/linting advertirá).

```typescript
// ANTES (líneas 38-40):
{ label: "Ejercicios", href: "/exercises", icon: Dumbbell },
{ label: "Informes", href: "/reports", icon: FileText },
// FIN de sección Herramientas
{
  section: "Sistema",
  items: [{ label: "Ajustes", href: "/settings", icon: Settings }],
},

// DESPUÉS:
{ label: "Ejercicios", href: "/exercises", icon: Dumbbell },
// FIN de sección Herramientas — Sin sección "Sistema"
```

**Impacto:** Al eliminar la sección "Sistema" completa (si solo contiene "Ajustes"), la sección desaparece del sidebar. Si se quiere mantener la sección para futuros items, se puede dejar con un array vacío, pero es más limpio eliminarla.

**Imports a eliminar:** `FileText`, `Settings` de `lucide-react`.

---

## Discovery Level

**TRN-01:** Level 0 — puro trabajo interno. La tabla existe, el RLS cubre la seguridad, el patrón de Server Component con filter Client Component es establecido.

**TRN-02:** Level 0 — réplica casi exacta de `history/page.tsx` con client_id distinto. Todos los componentes reutilizables ya existen.

**TRN-03:** Level 0 — eliminación de entradas de array + imports.

---

## Plan Breakdown

La fase cabe en **2 planes** (para no superar 3 tareas por plan):

### Plan 14-01: Exercises Library + Sidebar Cleanup (Wave 1)
- Task 1: `app/(trainer)/exercises/page.tsx` — página de librería de ejercicios con filtro por muscle_group
- Task 2: `components/trainer/sidebar.tsx` — eliminar /reports y /settings

*Estos dos son independientes entre sí y no tocan los mismos archivos.*

### Plan 14-02: Trainer Client History (Wave 1, parallel con 14-01)
- Task 1: `app/(trainer)/clients/[id]/history/page.tsx` — nueva página Server Component con sessions del cliente
- Task 2: `app/(trainer)/clients/[id]/page.tsx` — convertir `<Button>` "Ver historial" a `<Link>`

*14-01 y 14-02 son paralelos — no comparten archivos.*

---

## Anti-Patterns to Avoid

- **No usar `SELECT *`** — especificar siempre columnas exactas (regla de CLAUDE.md).
- **No fetchear en `'use client'`** — el filtro de muscle_group debe ser state local sobre datos ya cargados en Server Component, no una nueva query client-side.
- **No duplicar `formatDuration()`** — extraer a una utilidad compartida o copiar la función directamente en la página del trainer (ambas páginas son Server Components que no pueden compartir via import cross-route-group fácilmente).
- **No olvidar FK hint en `workout_sessions → workout_days`** — sin `!workout_sessions_day_id_fkey` PostgREST puede fallar o retornar null.
- **No hacer redirect a `/login` cuando notFound es correcto** — si el trainer busca un cliente que no le pertenece, usar `notFound()` (404), no `redirect('/login')`.
- **No dejar imports sin usar** — al eliminar FileText y Settings del sidebar, eliminar también sus imports.

---

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `app/(trainer)/exercises/page.tsx` | CREATE | Server Component; lista de ejercicios con filtro client |
| `components/trainer/exercises-filter.tsx` | CREATE | Client Component con `useState` para filtro muscle_group |
| `app/(trainer)/clients/[id]/history/page.tsx` | CREATE | Server Component; réplica de history/page.tsx adaptado |
| `app/(trainer)/clients/[id]/page.tsx` | MODIFY | Convertir `<Button>` a `<Link href={/clients/${id}/history}>` |
| `components/trainer/sidebar.tsx` | MODIFY | Eliminar `/reports` y `/settings` del array navigation |

**Total: 3 archivos nuevos, 2 modificaciones.**

---

## Key Queries

### Para exercises/page.tsx
```typescript
// Aprovecha RLS: solo retorna ejercicios accesibles por el trainer autenticado
const { data: exercises } = await supabase
  .from('exercises')
  .select('id, name, muscle_group, target_sets, target_reps, target_rir, notes')
  .order('muscle_group', { ascending: true })
  .order('name', { ascending: true })
```

### Para clients/[id]/history/page.tsx
```typescript
// Verificar propiedad del cliente
const { data: client } = await supabase
  .from('clients')
  .select('id, profile:profiles!clients_profile_id_fkey (full_name)')
  .eq('id', clientId)
  .eq('trainer_id', user.id)
  .single()

// Fetch sessions completadas
const { data: rawSessions } = await supabase
  .from('workout_sessions')
  .select(`
    id, started_at, finished_at,
    workout_day:workout_days!workout_sessions_day_id_fkey (name),
    set_logs (
      weight_kg, reps, completed,
      exercises (id, muscle_group)
    )
  `)
  .eq('client_id', client.id)
  .eq('completed', true)
  .order('finished_at', { ascending: false })
```

---

## Common Pitfalls

### Pitfall 1: exercises table no tiene trainer_id
El RLS policy en `exercises` filtra vía `day_id → workout_days → workout_plans → trainer_id = auth.uid()`. La query directa a `exercises` retornará solo los del trainer autenticado. No hace falta filtrar manualmente después.

### Pitfall 2: Ver historial button sin href
En `clients/[id]/page.tsx` línea 377, el botón es `<Button variant="ghost" size="sm">` sin `href`. Para convertirlo en link, reemplazar por `<Link href={...} className="...">` con las clases del variant ghost/sm, o envolver en `<Link>`.

### Pitfall 3: HistoryFilters es 'use client' — compatible con trainer page
`HistoryFilters` recibe `sessions: SessionData[]` como prop. La página trainer es Server Component y puede pasarle los datos. Sin embargo, el import path `@/components/client/history-filters` funcionará igual desde una ruta trainer — no hay restricción de importación por grupo de ruta.

### Pitfall 4: muscle_group es string libre, no enum
No existe un enum de muscle_groups en la DB. Los valores posibles son los que el trainer introdujo al crear los ejercicios (ej. "Pecho", "Espalda", "Piernas", etc.). El filtro debe derivar los grupos únicos del array de ejercicios retornado, no de un enum hardcodeado.

---

## Sources

### Primary (HIGH confidence)
- `app/(trainer)/clients/[id]/page.tsx` — botón "Ver historial" en línea 377; security pattern `.eq('trainer_id', user.id)`
- `app/(client)/history/page.tsx` — query pattern, `HistoryFilters` import, `detectSessionPRs` usage
- `components/trainer/sidebar.tsx` — líneas 24-46 con `/reports` y `/settings` rotos
- `lib/supabase/types.ts` líneas 224-256 — `exercises` Row type, confirma FK `exercises_day_id_fkey`
- `supabase/schema.sql` líneas 207-215 — RLS policy `exercises_access` confirma filtrado por `trainer_id` via joins
- `MEMORY.md` — `params: Promise<{ id: string }>` con `await params`; FK hints obligatorios; security pattern for clients

### Secondary (MEDIUM confidence)
- `app/(client)/history/[sessionId]/page.tsx` — SessionDetail component reutilizable si se quiere drill-down en la historia del trainer (no requerido por criterios de éxito de esta fase)
- `components/client/` — `HistoryFilters`, `SessionHistoryCard` son reutilizables desde trainer pages

---

## Metadata

**Confidence breakdown:**
- Exercises library: HIGH — tabla existente, RLS cubre seguridad, filtro client-side sobre SSR data es patrón establecido
- Client history: HIGH — réplica directa de history/page.tsx con ajuste de query; todos los componentes reutilizables existen
- Sidebar cleanup: HIGH — eliminación de dos entradas de array; sin riesgo

**Research date:** 2026-03-10
**Valid until:** 2026-06-10 (stack estable; sin dependencias externas nuevas)
