# Phase 31: UX & Forms - Research

**Researched:** 2026-03-13
**Domain:** React client component — RoutineBuilder form UX, text labels
**Confidence:** HIGH

## Summary

Phase 31 es una fase de pulido de texto y reordenamiento de pasos en el formulario de creación de rutinas. Los tres criterios de éxito son cambios quirúrgicos sobre un único componente (`components/trainer/routine-builder.tsx`) y su página contenedora (`app/(trainer)/routines-templates/new/page.tsx`). No se requieren nuevas tablas, migraciones, ni librerías.

El estado actual del código ha sido inspeccionado directamente. Los tres problemas a resolver están confirmados en el código fuente:

1. El botón "Plan para cliente" (mode `'client'`) existe en el selector de tipo dentro del Step 1 de `RoutineBuilder` (línea 800).
2. El texto del botón "Template global" (línea 786) debe renombrarse a "Plantilla rutina".
3. Los pasos actuales son `1. Info básica → 2. Días → 3. Ejercicios` (líneas 697-699); el orden requerido es `1. Info básica → 2. Ejercicios → 3. Días`.

**Primary recommendation:** Editar únicamente `components/trainer/routine-builder.tsx`. Todos los cambios son de texto o reordenamiento de bloques JSX dentro del componente existente. No tocar otras capas.

---

## Standard Stack

### Core (ya instalado, no instalar nada)
| Elemento | Versión | Propósito |
|----------|---------|-----------|
| React `'use client'` | 19 (Next 16) | `RoutineBuilder` ya es Client Component — toda la lógica de UI está aquí |
| `useState` / `useTransition` | built-in | Gestión de pasos y estado de formulario |
| `cn()` | `@/lib/utils` | Clases condicionales en botones de step y tipo |

No se añade ninguna dependencia.

---

## Architecture Patterns

### Estructura relevante del componente

```
RoutineBuilder (components/trainer/routine-builder.tsx)
├── Header / step nav          ← stepButton(1,'1. Info básica'), stepButton(2,'2. Días'), stepButton(3,'3. Ejercicios')
├── Step 1 content             ← Nombre, Descripción, Días/semana, Tipo (Template global / Plan para cliente), Cliente select
├── Step 2 content             ← Lista de días con reordenamiento
└── Step 3 content             ← Tabs de días + ExerciseRow por día
```

Los bloques de contenido de cada step están en `currentStep === 1 / 2 / 3` dentro del `<div className="px-6 py-5 space-y-4">`.

El botón "Save" está vinculado al Step 3 (`currentStep === 3`). Después del reordenamiento pasará al Step 3 (Días), que seguirá siendo el paso final donde se guarda.

### Patrón de reordenamiento de steps

El componente usa un estado `currentStep: 1 | 2 | 3` con navegación Anterior/Siguiente. Para reordenar de `1-Info → 2-Días → 3-Ejercicios` a `1-Info → 2-Ejercicios → 3-Días`:

- Los `stepButton` en el header pasan a: `stepButton(1, '1. Info básica')`, `stepButton(2, '2. Ejercicios')`, `stepButton(3, '3. Días')`
- El bloque JSX actualmente bajo `currentStep === 2` (Días) pasa a renderizarse bajo `currentStep === 3`
- El bloque JSX actualmente bajo `currentStep === 3` (Ejercicios) pasa a renderizarse bajo `currentStep === 2`
- El botón "Guardar rutina" (actualmente en el bloque de Ejercicios / Step 3) se mueve al bloque de Días (nuevo Step 3)
- El guard `structureLocked && step !== 1` en `setStep` aplica igual — no cambia
- La condición `disabled={currentStep === 3 || pending || (structureLocked && currentStep === 1)}` en el botón Siguiente sigue siendo correcta ya que el último step sigue siendo 3

### Anti-Patterns a evitar

- **No cambiar la lógica de `structureLocked`**: Solo afecta navegación y renderizado condicional, funciona igual con cualquier orden de steps.
- **No cambiar el selector de mode en la página**: La página `new/page.tsx` recibe `mode` via `searchParams.mode`. El botón "Plan para cliente" que hay que eliminar es el del Step 1 del RoutineBuilder, no el enlace de la página de listado (`routines-templates/page.tsx`). Ese enlace en la página de listado queda fuera del scope de esta phase.
- **No mover el save button al footer**: El botón "Guardar rutina" debe seguir dentro del contenido del último step (Step 3 = Días tras el reorden), no en el footer de navegación.

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar |
|----------|-------------|-----------------|
| Re-render al cambiar pasos | Custom state sync | El `useState(currentStep)` existente ya funciona |
| Validación de formulario | Schema validation library | La función `validateBeforeSubmit()` ya cubre los casos necesarios |

---

## Common Pitfalls

### Pitfall 1: El selector de Tipo tiene dos botones — eliminar solo uno
**Qué puede salir mal:** Eliminar el contenedor del selector de tipo completo (ambos botones) en lugar de solo el botón "Plan para cliente".
**Cómo evitar:** Mantener el botón "Template global" (renombrado a "Plantilla rutina") y la función `setMode`. Solo eliminar el segundo `<button>` que llama `setMode('client')`.
**Consecuencia de hacerlo mal:** El selector de tipo desaparece, el modo queda hardcoded a `'template'`, y `RoutineMode = 'client'` quedaría sin uso en UI aunque los tipos siguen siendo válidos.

### Pitfall 2: El bloque de Días tiene guard `!structureLocked`
**Qué puede salir mal:** Al mover el bloque de Días al Step 3, olvidar la condición `currentStep === 3 && !structureLocked` — mostrando el step cuando la estructura está bloqueada.
**Cómo evitar:** La condición del nuevo Step 3 (Días) debe ser `{currentStep === 3 && !structureLocked && (…)}` igual que la condición actual `currentStep === 2`.

### Pitfall 3: El botón "Guardar rutina" está dentro del bloque de Ejercicios
**Qué puede salir mal:** Olvidar mover el `<div className="pt-2 border-t …">` que contiene el botón de guardar junto con el bloque de Ejercicios al nuevo Step 2.
**Cómo evitar:** El botón de guardar debe ir con el bloque de Días (nuevo Step 3), no con el bloque de Ejercicios (nuevo Step 2). Verificar que el save sigue apareciendo en el último paso.

### Pitfall 4: Client selector condicional
**Qué puede salir mal:** El selector de `Cliente` (`state.mode === 'client'`) quedará visible si el trainer navega a `/routines-templates/new?mode=client`. Tras eliminar el botón del tipo, el modo `'client'` solo puede venir vía searchParams. Esto es correcto y no debe eliminarse.
**Cómo evitar:** Mantener el bloque `{state.mode === 'client' && (<Select …>)}` intacto. Si en el futuro Phase 30 eliminó la posibilidad de asignar rutinas directamente, en esta phase solo se elimina el botón en el formulario, no el flujo completo.

---

## Code Examples

### Cambio 1: Renombrar label y eliminar botón "Plan para cliente"

Ubicación: `components/trainer/routine-builder.tsx`, líneas 773–833 (Step 1, sección Tipo).

Estado actual (líneas 783–800):
```tsx
// Template global button — KEEP, rename text only
<button type="button" onClick={() => setMode('template')} ...>
  Template global          {/* ← cambiar a: Plantilla rutina */}
</button>
// Plan para cliente button — REMOVE entirely
<button type="button" onClick={() => setMode('client')} ...>
  Plan para cliente
</button>
```

Estado objetivo:
```tsx
<button type="button" onClick={() => setMode('template')} ...>
  Plantilla rutina
</button>
{/* segundo botón eliminado */}
```

El contenedor `<div className="grid grid-cols-2 gap-2">` pasará a tener un solo hijo. Cambiar a `<div className="grid grid-cols-1 gap-2">` o simplemente eliminar el grid ya que hay un único botón.

### Cambio 2: Reordenar step labels

Ubicación: líneas 696–699.

```tsx
// Antes:
{stepButton(1, '1. Info básica')}
{stepButton(2, '2. Días')}
{stepButton(3, '3. Ejercicios')}

// Después:
{stepButton(1, '1. Info básica')}
{stepButton(2, '2. Ejercicios')}
{stepButton(3, '3. Días')}
```

### Cambio 3: Intercambiar bloques de contenido Step 2 y Step 3

El bloque bajo `{currentStep === 2 && !structureLocked && (…)}` (Días) pasa a `currentStep === 3`.
El bloque bajo `{currentStep === 3 && !structureLocked && (…)}` (Ejercicios + Save) pasa a `currentStep === 2`.

Resultado lógico:
```tsx
{/* STEP 2 — Ejercicios (antes era Step 3) */}
{currentStep === 2 && !structureLocked && (
  <div className="space-y-4">
    {/* … day tabs, ExerciseRow list … */}
    {/* Save button NO va aquí */}
  </div>
)}

{/* STEP 3 — Días (antes era Step 2) */}
{currentStep === 3 && !structureLocked && (
  <>
    {/* … días list … */}
    {/* Save button VA aquí, al final */}
    <div className="pt-2 border-t border-[var(--border)]">
      <button … onClick={save}>Guardar rutina</button>
    </div>
  </>
)}
```

---

## State of the Art

| Antes | Ahora (objetivo Phase 31) | Impacto |
|-------|--------------------------|---------|
| Tipo "Template global" | Tipo "Plantilla rutina" | Terminología más clara en español |
| Botón "Plan para cliente" visible en form | Eliminado del form | Elimina confusión con el flujo de negocio correcto (Phase 30) |
| Pasos: Info → Días → Ejercicios | Info → Ejercicios → Días | Flujo más natural: primero se piensan los ejercicios, luego se agrupan en días |

---

## Open Questions

Ninguna. Los tres cambios están totalmente determinados por inspección directa del código fuente. No hay ambigüedad.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework detectado en el proyecto |
| Config file | none |
| Quick run command | Manual: navegar a `/routines-templates/new` |
| Full suite command | Manual: revisar los 3 success criteria |

### Phase Requirements → Test Map
| Criterio | Comportamiento | Tipo | Verificación |
|----------|---------------|------|-------------|
| SC-1 | No existe botón "Plan para cliente" en `/routines-templates/new` | smoke | Manual — inspección visual del Step 1 |
| SC-2 | Selector tipo muestra "Plantilla rutina" no "Template global" | smoke | Manual — inspección visual del Step 1 |
| SC-3 | Pasos en orden: 1. Info básica → 2. Ejercicios → 3. Días | smoke | Manual — navegar con Siguiente/Anterior |

### Wave 0 Gaps
None — no hay infraestructura de tests que crear. Los cambios son puramente de texto y reordenamiento JSX.

---

## Sources

### Primary (HIGH confidence)
- Inspección directa de `components/trainer/routine-builder.tsx` (lectura en esta sesión)
- Inspección directa de `app/(trainer)/routines-templates/new/page.tsx` (lectura en esta sesión)
- Inspección directa de `app/(trainer)/routines-templates/types.ts` (lectura en esta sesión)

### No se requieren fuentes externas
Esta phase no involucra nuevas librerías ni patrones externos. Todos los hallazgos son de inspección de código fuente local.

---

## Metadata

**Confidence breakdown:**
- Localización de cambios: HIGH — código inspeccionado directamente
- Impacto de reordenamiento: HIGH — lógica de `currentStep` es simple y autocontenida
- Riesgos: HIGH — pitfalls documentados con base en la estructura real del componente

**Research date:** 2026-03-13
**Valid until:** Sin caducidad — cambios en archivos estáticos del repositorio
