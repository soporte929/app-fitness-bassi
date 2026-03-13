# Phase 28: Progress Page Full Fix - Research

**Researched:** 2026-03-11
**Domain:** Supabase RLS + Next.js Server Components + Recharts empty-state handling
**Confidence:** HIGH

---

## Summary

La página `/progress` del cliente tiene dos problemas raíz independientes: (1) la tabla `client_measurements` puede tener una RLS policy que filtra por `profile_id` cuando la query ya usa `client_id` correctamente — o bien la tabla está vacía para el cliente de prueba; (2) el componente `PhaseDistributionChart` en el dashboard del trainer recorta la leyenda porque el `overflowX: hidden` del wrapper del `ResponsiveContainer` comprime el contenido a 280px de alto pero la leyenda se queda fuera del área visible en resoluciones estrechas.

El código de `progress/page.tsx` ya usa `.eq('client_id', client.id)` correctamente — el filtro de query NO es el problema del código de aplicación. El problema es o bien (a) la RLS policy en Supabase prod que rechaza la lectura silenciosamente devolviendo array vacío, o (b) que simplemente no hay datos de `client_measurements` para el cliente de prueba. El `ProgressCharts` component ya tiene `EmptyChart` guards robustos para todos los charts — el componente no crashea con arrays vacíos, simplemente muestra mensajes vacíos.

**Primary recommendation:** Auditar y corregir la RLS policy de `client_measurements` en Supabase prod para que permita `SELECT` al cliente autenticado cuyo `client_id` coincide. Añadir error rendering visible en `progress/page.tsx` (actualmente solo hay `console.error`). Corregir el chart de `PhaseDistributionChart` aumentando la height y quitando el `overflowX: hidden` del wrapper.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROG-01 | El cliente puede registrar su peso actual desde la página `/progress` | Ya implementado en Phase 12. Modals + actions.ts existen. |
| PROG-02 | El peso objetivo del cliente aparece como línea de referencia en la gráfica de peso | Ya implementado. `ReferenceLine` presente en ProgressCharts. |
| PROG-03 | El cliente puede registrar medidas corporales desde `/progress` | Ya implementado en Phase 12. LogMeasurementsModal existe. |
| BUG-04 | /progress no muestra métricas (queries silenciosas sin feedback) | Causa: RLS policy o datos vacíos sin error visible al usuario. |
| BUG-05 | PhaseDistributionChart recorta leyenda | Causa: overflowX:hidden + height insuficiente para pie + leyenda. |
</phase_requirements>

---

## Standard Stack

### Core (ya en uso — no cambiar)
| Library | Version | Purpose | Notas |
|---------|---------|---------|-------|
| `@supabase/supabase-js` | v2.98.0 | Queries + RLS | Ya instalado |
| `recharts` | v3.7.0 | Charts | Ya instalado, patrón formatter con `| undefined` |
| `next` | 16.1.6 | Server Components, `params` como Promise | Ya instalado |

### No añadir librerías nuevas
Esta fase es puramente corrección de bugs — no se necesitan dependencias adicionales.

---

## Architecture Patterns

### Patrón 1: Error handling visible en Server Components (actualmente ausente)

**Problema actual en `progress/page.tsx`:**
```tsx
// ACTUAL — solo console.error, usuario no ve nada
if (measurementsResult.error) {
  console.error('Measurements query error:', measurementsResult.error)
}
```

**Patrón correcto — propagar el error a UI:**
```tsx
// CORRECTO — renderizar error visible cuando hay fallo de query
if (measurementsResult.error) {
  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-4">Progreso</h1>
        <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4">
          <p className="text-sm text-[var(--danger)]">
            Error cargando datos de progreso. Código: {measurementsResult.error.code}
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
```

### Patrón 2: RLS Policy para client_measurements

**Estructura correcta de la RLS policy (en Supabase SQL Editor):**

```sql
-- Policy: clientes leen sus propios registros vía clients.profile_id
CREATE POLICY "Clients can read own measurements"
ON client_measurements
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  )
);
```

La tabla `client_measurements` tiene FK `client_id → clients.id`. El cliente autenticado tiene `auth.uid() = profiles.id = clients.profile_id`. El join indirecto es necesario porque el campo de la tabla es `client_id` (UUID del registro en `clients`), no `profile_id` (UUID del auth user).

**Verificar RLS policies existentes:**
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'client_measurements';
```

### Patrón 3: PhaseDistributionChart — fix de recorte

**Problema actual:**
```tsx
// ACTUAL — overflowX:hidden + height fija 280px insuficiente con leyenda
<div style={{ width: '100%', overflowX: 'hidden' }}>
  <ResponsiveContainer width="100%" height={280}>
    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
```

**Corrección:**
- Eliminar `overflowX: 'hidden'` del wrapper — es lo que corta la leyenda
- Aumentar height a 320px (o usar altura adaptativa) para que pie + leyenda quepan
- La leyenda de Recharts con `verticalAlign="bottom"` necesita aprox. 40-50px adicionales

```tsx
// CORRECTO
<div style={{ width: '100%' }}>
  <ResponsiveContainer width="100%" height={320}>
    <PieChart margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
```

### Anti-Patterns a Evitar

- **No mover la query a `client_measurements` a `profile_id`**: El campo de la tabla es `client_id`. La query ya es correcta. El fix es en RLS, no en la query.
- **No usar `createAdminClient` en Server Components de lectura**: El `logClientMeasurementAction` usa admin para INSERT (correcto, bypassa RLS). Para SELECT en `progress/page.tsx`, usar el `createClient` anon con cookies — si RLS está bien configurado, funciona. El admin client para SELECT ocultaría problemas de RLS.
- **No asumir que `ProgressCharts` crashea**: El componente ya tiene guards `EmptyChart` para todos los charts. El problema es upstream (datos vacíos o error no visible).

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|---------|-------------|-----------------|---------|
| Error boundary en Server Component | Custom error component complejo | Inline return con JSX simple | Server Components no soportan error boundaries React; el early return es el patrón |
| Verificar RLS | Script de test custom | Supabase Dashboard → Table Editor → RLS policies | Verificación directa en prod |
| Recharts responsive wrapping | Custom resize observer | `ResponsiveContainer` de recharts | Ya en uso, solo ajustar dimensiones |

---

## Common Pitfalls

### Pitfall 1: RLS devuelve array vacío silenciosamente
**Qué pasa:** Supabase con RLS activa + policy incorrecta devuelve `{ data: [], error: null }` — no hay error, solo datos vacíos. Esto es el comportamiento estándar de PostgREST con RLS.
**Por qué pasa:** La policy puede filtrar por `profile_id` directamente (incorrecto para esta tabla) en vez de hacer el join indirecto `client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())`.
**Cómo evitar:** Verificar en Supabase Dashboard con el cliente de prueba (id: `24646591-53ec-4d1a-b92a-08f00e8d365b`) que la query devuelve datos.
**Señales de alerta:** `data: []` sin `error` en respuesta de Supabase.

### Pitfall 2: `overflowX: hidden` recortando leyendas Recharts
**Qué pasa:** `ResponsiveContainer` calcula dimensiones basadas en el padre. Si el padre tiene `overflowX: hidden`, la leyenda posicionada con `verticalAlign="bottom"` puede quedar fuera del `viewBox` del SVG o ser recortada.
**Por qué pasa:** Recharts Legend se renderiza dentro del SVG. Con altura insuficiente, parte del contenido queda fuera del bounding box.
**Cómo evitar:** No poner `overflowX: hidden` en el wrapper directo del `ResponsiveContainer`. Dar suficiente altura (al menos pie + 50px para leyenda).

### Pitfall 3: `ProgressCharts` con `weightLogs=[]` — comportamiento actual
**Qué pasa actualmente:** Con arrays vacíos, `ProgressCharts` muestra correctamente los `EmptyChart` placeholders para cada gráfica. No hay crash. El componente es defensivo.
**Conclusión:** NO es necesario modificar `ProgressCharts` para el caso de arrays vacíos. El componente ya maneja este caso.

### Pitfall 4: Diferencia entre `client_measurements` y `measurements`
**Qué pasa:** Hay DOS tablas relacionadas con medidas en el schema:
- `measurements` — tabla legacy (sin `weight_kg`, sin `notes`, sin `created_at`)
- `client_measurements` — tabla nueva creada en Phase 8, con `weight_kg`, `body_fat_pct`, `notes`, `created_at`

`progress/page.tsx` usa correctamente `client_measurements`. `logClientMeasurementAction` también inserta en `client_measurements`. No hay confusión de tabla en el código.

---

## Code Examples

### Verificar RLS policy actual (ejecutar en Supabase SQL Editor)
```sql
-- Ver policies actuales de client_measurements
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'client_measurements'
ORDER BY cmd;

-- Verificar datos del cliente de prueba directamente
SELECT * FROM client_measurements
WHERE client_id = '24646591-53ec-4d1a-b92a-08f00e8d365b'
LIMIT 5;
```

### SQL para crear/corregir la RLS policy
```sql
-- Eliminar policy incorrecta si existe
DROP POLICY IF EXISTS "Clients can read own measurements" ON client_measurements;
DROP POLICY IF EXISTS "clients_read_own" ON client_measurements;

-- Crear policy correcta
CREATE POLICY "clients_select_own_measurements"
ON client_measurements
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE profile_id = auth.uid()
  )
);

-- Policy para INSERT (si no existe — usamos admin client en actions.ts)
-- No necesaria porque logClientMeasurementAction usa createAdminClient
```

### Error rendering en progress/page.tsx (patrón a aplicar)
```tsx
// Source: proyecto propio — patrón establecido en nutrition/page.tsx
const [measurementsResult, sessionsResult] = await Promise.all([...])

// Mostrar error visible si hay fallo
if (measurementsResult.error || sessionsResult.error) {
  const errorMsg = measurementsResult.error?.message ?? sessionsResult.error?.message
  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-5">Progreso</h1>
        <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-4 text-center">
          <p className="text-sm font-medium text-[var(--danger)] mb-1">Error cargando datos</p>
          <p className="text-xs text-[var(--text-secondary)]">{errorMsg}</p>
        </div>
      </div>
    </PageTransition>
  )
}
```

### PhaseDistributionChart fix (patrón de ajuste)
```tsx
// Antes
<div style={{ width: '100%', overflowX: 'hidden' }}>
  <ResponsiveContainer width="100%" height={280}>

// Después
<div style={{ width: '100%' }}>
  <ResponsiveContainer width="100%" height={320}>
    <PieChart margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
```

---

## State of the Art

| Old Approach | Current Approach | Impacto en esta fase |
|--------------|------------------|---------------------|
| Error solo en `console.error` | Error visible en UI + console | Cambio necesario en `progress/page.tsx` |
| `overflowX: hidden` en wrapper chart | Sin overflow hidden en charts | Fix en `PhaseDistributionChart` |

---

## Open Questions

1. **RLS policy actual en producción**
   - Qué sabemos: El código usa `.eq('client_id', client.id)` correctamente
   - Qué no sabemos: Qué policies existen en Supabase prod para `client_measurements`
   - Recomendación: El planner debe incluir un paso de verificación SQL antes del fix, y el fix debe ser condicional (solo crear policy si no existe la correcta)

2. **Datos del cliente de prueba**
   - Qué sabemos: `client_id: 24646591-53ec-4d1a-b92a-08f00e8d365b`
   - Qué no sabemos: Si hay datos en `client_measurements` para este cliente en prod
   - Recomendación: El plan debe incluir seed de datos de prueba para este cliente si la tabla está vacía

3. **INSERT RLS policy para client_measurements**
   - Qué sabemos: `logClientMeasurementAction` usa `createAdminClient` (bypassa RLS)
   - Qué no sabemos: Si hay policy de INSERT o si el admin client es necesario
   - Impacto: Ninguno — el admin client para INSERT es correcto y no cambia

---

## Scope Exact

Esta fase cubre exactamente dos componentes y una corrección de infraestructura:

| Archivo | Cambio | Success Criteria |
|---------|--------|-----------------|
| `app/(client)/progress/page.tsx` | Añadir error rendering visible cuando `measurementsResult.error` o `sessionsResult.error` | SC-2, SC-3 |
| `components/trainer/dashboard-charts/phase-distribution-chart.tsx` | Quitar `overflowX: hidden`, aumentar height a 320px | SC-6 |
| Supabase prod — RLS `client_measurements` | Crear/corregir policy SELECT para clientes autenticados | SC-1, SC-4 |

**`ProgressCharts` component NO necesita cambios** — ya tiene empty state guards robustos para todos los arrays. SC-5 ya está satisfecho por el código actual.

---

## Sources

### Primary (HIGH confidence)
- Código fuente leído directamente: `app/(client)/progress/page.tsx`
- Código fuente leído directamente: `components/client/progress-charts.tsx`
- Código fuente leído directamente: `components/trainer/dashboard-charts/phase-distribution-chart.tsx`
- Código fuente leído directamente: `app/(client)/progress/actions.ts`
- Código fuente leído directamente: `lib/supabase/types.ts` — esquema de `client_measurements`

### Secondary (MEDIUM confidence)
- Supabase RLS behavior: array vacío sin error cuando policy rechaza — comportamiento documentado de PostgREST
- Recharts Legend clipping: comportamiento conocido cuando height insuficiente con `verticalAlign="bottom"`

---

## Metadata

**Confidence breakdown:**
- Análisis del código existente: HIGH — leído directamente
- RLS policy actual en prod: LOW — no se puede verificar desde aquí, requiere acceso a Supabase Dashboard
- Comportamiento de Recharts con height: HIGH — observable en el código actual y comportamiento documentado

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (estable — no hay dependencies en fast-moving libraries)
