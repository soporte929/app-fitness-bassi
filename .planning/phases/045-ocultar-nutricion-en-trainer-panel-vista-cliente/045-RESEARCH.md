# Phase 45: Ocultar nutrición en trainer panel vista cliente - Research

**Researched:** 2026-03-13
**Domain:** Next.js UI — eliminación de secciones y componentes en página existente
**Confidence:** HIGH

## Summary

La fase consiste exclusivamente en eliminar toda la UI y lógica relacionada con nutrición del flujo `/clients/[id]` en el panel del entrenador. No hay nueva funcionalidad que crear. El trabajo es de substracción: quitar imports, JSX, queries y ficheros que no deberían aparecer ahí.

La página principal `app/(trainer)/clients/[id]/page.tsx` ya fue auditada. Contiene una columna lateral de "Plan nutricional" (con `EditNutritionPlanModal` y datos renderizados), un botón "Asignar plan nutricional" en el header (`AssignNutritionPlanModal`), y dos queries Supabase a `nutrition_plans` y `nutrition_plan_meals` dentro del `Promise.all`. Hay además dos ficheros dedicados a nutrición en el mismo directorio: `assign-nutrition-plan-modal.tsx`, `edit-nutrition-plan-modal.tsx` y `nutrition-actions.ts`.

El contexto histórico es relevante: Quick Task 1 (commit 987969d) ocultó nutrición de la navegación del cliente y Quick Task 3 (commit 588afa7) ocultó el item de sidebar `/nutrition-plans` del trainer. Esta phase completa el trabajo para la vista de detalle de cliente.

**Primary recommendation:** Editar `page.tsx` en cuatro puntos (imports, queries, variable declarations, JSX) y tratar los ficheros de nutrición como muertos en código pero conservarlos físicamente (no borrar — el código está vivo en Supabase).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| P45-SC1 | En /clients/[id] no aparece ningún enlace, botón ni sección relacionada con nutrición | Auditado: 4 puntos en page.tsx + 1 componente en header |
| P45-SC2 | Las subrutas de nutrición dentro del trainer panel (vista cliente) no son accesibles ni visibles | No existen subrutas de nutrición bajo /clients/[id]/; los ficheros modal son lazy-loaded desde page.tsx, basta con quitarlos de page.tsx |

</phase_requirements>

## Standard Stack

### Core
| Elemento | Versión | Propósito | Por qué estándar |
|----------|---------|-----------|-----------------|
| Next.js Server Components | 16.1.6 | La página es un Server Component async — las ediciones van en el fichero `.tsx` del servidor | Patrón establecido en el proyecto |
| TypeScript strict | — | Sin `any`, tipos de `lib/supabase/types.ts` | Regla del proyecto |

No se necesitan librerías nuevas. Esta fase no instala nada.

## Architecture Patterns

### Mapa completo de referencias a nutrición en /clients/[id]/

**Fichero principal: `app/(trainer)/clients/[id]/page.tsx`**

| Línea(s) | Tipo | Qué eliminar |
|----------|------|-------------|
| 14 | Import | `import { EditNutritionPlanModal } from './edit-nutrition-plan-modal'` |
| 16 | Import | `import { AssignNutritionPlanModal } from './assign-nutrition-plan-modal'` |
| 17 | Import | `import type { NutritionTemplate } from './nutrition-actions'` |
| 18 | Import (parcial) | `Flame` de lucide-react (solo se usa en el card de nutrición) |
| 46–96 | Query | `activeNutritionPlanRaw` y `nutritionTemplatesRes` dentro del `Promise.all` |
| 110–116 | Variables | `nutritionTemplates`, `activeNutritionPlanData`, `activeNutritionPlan` |
| 256–261 | JSX (header) | `<AssignNutritionPlanModal .../>` en el bloque de botones del header |
| 437–514 | JSX (sidebar) | Toda la columna lateral `<div className="xl:w-72 ...">` con el Card de "Plan nutricional" |

**Nota sobre la columna lateral:** El Card de "Plan activo" (entreno, líneas 515–542) está **dentro de la misma columna** `xl:w-72`. Hay que conservar esa columna y solo eliminar el Card de nutrición, manteniendo el Card de "Plan activo".

**Ficheros auxiliares (solo importados desde page.tsx):**
- `assign-nutrition-plan-modal.tsx` — sin uso tras editar page.tsx
- `edit-nutrition-plan-modal.tsx` — sin uso tras editar page.tsx
- `nutrition-actions.ts` — sin uso desde page.tsx tras editar; las acciones server no tienen efecto si no se llaman

**Decision recomendada:** Conservar los tres ficheros auxiliares tal cual. No borrarlos. Razones:
1. El código de Supabase (server actions) no causa daño si no se importa
2. Evita riesgo de romper algo si en el futuro hay otro punto de entrada
3. El patrón del proyecto para Quick Task 1 y 3 fue ocultar, no borrar

### Patrón de edición recomendado

```tsx
// ANTES — línea 256 aprox.
<AssignNutritionPlanModal
  clientId={rawClient.id}
  clientName={clientName}
  templates={nutritionTemplates}
/>

// DESPUÉS — eliminar completamente esas líneas
```

```tsx
// ANTES — columna lateral completa
<div className="xl:w-72 space-y-4 flex-shrink-0">
  <Card> {/* Plan nutricional */} </Card>
  <Card> {/* Plan activo */} </Card>
</div>

// DESPUÉS — columna lateral sin card de nutrición
<div className="xl:w-72 space-y-4 flex-shrink-0">
  <Card> {/* Plan activo — conservar íntegro */} </Card>
</div>
```

```typescript
// ANTES — Promise.all con 7 elementos
const [weightLogsRes, measurementsRes, sessionsRes, activePlanRes, plansRes, activeNutritionPlanRaw, nutritionTemplatesRes] = await Promise.all([
  // ...5 queries existentes...
  supabase.from('nutrition_plans' as any).select('...').eq('client_id', id).eq('active', true).maybeSingle(),
  supabase.from('nutrition_plans' as any).select('...').eq('trainer_id', user.id).eq('is_template', true)...
])

// DESPUÉS — Promise.all con 5 elementos (sin las dos últimas queries)
const [weightLogsRes, measurementsRes, sessionsRes, activePlanRes, plansRes] = await Promise.all([
  // ...5 queries sin cambios...
])
```

### Anti-Patterns a Evitar

- **Dejar imports huérfanos:** Si se elimina el JSX pero se deja el import de `AssignNutritionPlanModal`, TypeScript en strict mode puede no quejarse pero genera dead code. Limpiar siempre.
- **Eliminar el Card "Plan activo" por accidente:** El Card de plan de entrenamiento está anidado en la misma `div` que el de nutrición. Revisar cuidadosamente los límites del JSX.
- **Dejar `Flame` en imports si solo se usaba en el card de nutrición:** Verificar que el ícono no se use en otra parte de la página antes de eliminarlo del import de lucide-react.

## Don't Hand-Roll

| Problema | No construir | Usar en cambio | Por qué |
|----------|-------------|----------------|---------|
| Gestión de rutas protegidas | Middleware custom de nutrición | Simplemente no renderizar el JSX | No hay ruta `/clients/[id]/nutrition` — los modales son client components cargados desde page.tsx |

## Common Pitfalls

### Pitfall 1: Romper el destructuring del Promise.all
**Qué falla:** Al reducir de 7 a 5 elementos en el `Promise.all`, si el destructuring no se actualiza en sincronía, TypeScript asigna los valores incorrectamente (plansRes toma el valor de activeNutritionPlanRaw).
**Por qué ocurre:** El destructuring es posicional.
**Cómo evitarlo:** Eliminar exactamente los dos últimos elementos del array de promesas Y los dos últimos nombres en el destructuring en la misma edición.
**Señales de alerta:** Variables `plansRes` con tipo `{ data: null | NutritionPlan }` en lugar de `{ data: PlanOption[] }`.

### Pitfall 2: Variables referenciadas después de eliminar
**Qué falla:** Si se elimina `activeNutritionPlan` de las variables pero queda alguna referencia en JSX (especialmente en la parte del `EditNutritionPlanModal` en el header), TypeScript lo detectará como error de compilación.
**Cómo evitarlo:** Buscar todas las ocurrencias de `activeNutritionPlan`, `nutritionTemplates`, `AssignNutritionPlanModal`, `EditNutritionPlanModal`, `Flame` antes de guardar.

### Pitfall 3: Columna lateral xl:w-72 desaparece entera
**Qué falla:** Si se elimina toda la div de columna lateral en lugar de solo el card de nutrición, el "Plan activo" (entrenamiento) también desaparece de la vista.
**Cómo evitarlo:** El Card de "Plan activo" ocupa líneas 515–542. Conservarlo dentro de la columna.

### Pitfall 4: calculateNutrition() sigue siendo necesario
**Qué falla:** La función `calculateNutrition` de `@/lib/calculations/nutrition` se importa en page.tsx y se usa para calcular `nutrition.ffm` que se muestra en el StatCard "Masa libre grasa" (línea 299). Esta importación y uso NO son nutrición en el sentido de "plan nutricional" — son datos de composición corporal del cliente.
**Cómo evitarlo:** Conservar `calculateNutrition` y su uso. Solo eliminar referencias a `nutrition_plans`, `AssignNutritionPlanModal`, `EditNutritionPlanModal` y el card lateral de nutrición.

## Code Examples

### Verificación rápida post-edición (búsqueda en el fichero editado)

Tras aplicar los cambios, ninguna de estas cadenas debe aparecer en `page.tsx`:

```
AssignNutritionPlanModal
EditNutritionPlanModal
NutritionTemplate
nutrition-actions
activeNutritionPlan
nutritionTemplates
activeNutritionPlanRaw
nutritionTemplatesRes
nutrition_plans
nutrition_plan_meals
Flame
UtensilsCrossed
```

Excepción aceptable: si `calculateNutrition` se mantiene (correcto), el import de `@/lib/calculations/nutrition` debe permanecer.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Sin framework de tests automatizados detectado en el proyecto |
| Config file | none |
| Quick run command | Inspección visual en navegador: `npm run dev` → navegar a `/clients/[id]` |
| Full suite command | `npm run build` para verificar 0 errores TypeScript |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P45-SC1 | No aparece botón "Asignar plan nutricional" ni card "Plan nutricional" en /clients/[id] | smoke | `npm run build` (0 TS errors) + inspección visual | ✅ page.tsx existe |
| P45-SC2 | No hay subrutas de nutrición accesibles | manual | Navegar a /clients/[id] y verificar ausencia de enlaces de nutrición | ✅ no existen subrutas bajo /clients/[id]/nutrition/ |

### Sampling Rate
- **Por commit:** `npm run build` — 0 errores de compilación
- **Gate de fase:** Build limpio + inspección visual confirmando ausencia de UI de nutrición

### Wave 0 Gaps
Ninguno — no se necesitan tests nuevos, infraestructura nueva ni fixtures.

## Sources

### Primary (HIGH confidence)
- Lectura directa de `app/(trainer)/clients/[id]/page.tsx` — inventario completo de referencias a nutrición
- Lectura directa de `assign-nutrition-plan-modal.tsx`, `edit-nutrition-plan-modal.tsx`, `nutrition-actions.ts`
- `.planning/STATE.md` — historial de Quick Tasks 1 y 3 que establecen el patrón "ocultar, no borrar"

### Secondary (MEDIUM confidence)
- `REQUIREMENTS.md` — confirmación de que no hay req ID específico para phase 45 en la tabla de trazabilidad (phase 45 es nueva, no mapea a req existente)

## Metadata

**Confidence breakdown:**
- Inventario de cambios necesarios: HIGH — lectura directa del fichero
- Riesgo de efectos colaterales: HIGH confianza (bajo riesgo) — cambios son puramente sustractivos
- Ausencia de subrutas de nutrición: HIGH — `ls` del directorio confirma solo `history/` y `revisions/` como subrutas

**Research date:** 2026-03-13
**Valid until:** Indefinido — page.tsx es estable, no hay trabajo activo en ese fichero
