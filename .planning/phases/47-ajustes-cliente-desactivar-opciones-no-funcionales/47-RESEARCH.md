# Phase 47: Ajustes cliente — desactivar opciones no funcionales — Research

**Researched:** 2026-03-13
**Domain:** UI client — /profile page, settings menu items, non-functional routes
**Confidence:** HIGH

## Summary

La página `/profile` del cliente tiene una sección de ajustes (`settingsSections`) con items que no tienen funcionalidad implementada en v1. El objetivo es ocultar o deshabilitar visualmente esas opciones sin eliminar su código, para poder reactivarlas en versiones futuras.

El análisis del código revela exactamente cuáles items están operativos y cuáles no. La intervención es quirúrgica: solo afecta a `app/(client)/profile/page.tsx` en la configuración de `settingsSections`, y opcionalmente al enlace `/revisions` si la página existe pero está incompleta (la página existe y muestra datos reales, pero no permite crear revisiones — el trainer no tiene UI para crearlas en v1).

**Primary recommendation:** Añadir una propiedad `disabled?: boolean` al tipo `MenuItem` y renderizar los items deshabilitados con opacity reducida, sin `href`, y con un badge "Próximamente" en lugar de `ChevronRight`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| P47-01 | Opciones no funcionales en /profile están ocultas o deshabilitadas con indicador visual | Análisis del código de page.tsx — ver tabla de items más abajo |
| P47-02 | Las opciones no se eliminan del código — solo se ocultan/deshabilitan | Patrón `disabled` prop + comentario en código, igual que Phase 045 (ocultar-no-borrar) |
</phase_requirements>

## Inventario de opciones en /profile

### Items actuales en `settingsSections`

| Item | Sección | `href` | Funciona en v1 | Acción |
|------|---------|--------|----------------|--------|
| Datos personales | Cuenta | ninguno | NO — solo muestra el icono, no abre nada | Deshabilitar |
| Notificaciones | Cuenta | ninguno | NO — no hay sistema de notificaciones | Deshabilitar |
| Unidades de medida | Cuenta | ninguno | NO — no hay lógica de unidades | Deshabilitar |
| Mis revisiones | App | `/revisions` | PARCIAL — la página existe y lee datos, pero el trainer no tiene UI para crear revisiones en v1 | Deshabilitar (ver nota abajo) |
| Privacidad | App | ninguno | NO — sin funcionalidad | Deshabilitar |

**Nota sobre "Mis revisiones":** La ruta `/revisions` existe como página real con query a Supabase. Sin embargo, es un dead-end en v1: el trainer no puede crear revisiones desde su panel (está en `Out of Scope` en REQUIREMENTS.md: "Revisiones tab (client) — Deferred past v4.0"). Deshabilitar el enlace es lo correcto.

**Nota sobre "Datos personales":** El `EditProfileForm` dentro de la card de usuario YA funciona (editar nombre y avatar). El item "Datos personales" en el menú de settings es redundante y no hace nada. Deshabilitar.

### Lo que SÍ funciona en /profile (no tocar)

| Feature | Estado |
|---------|--------|
| `EditProfileForm` — editar nombre y foto | Funcional |
| `LogoutButton` | Funcional |
| Stats (racha, entrenos, adherencia) | Funcional |
| Info de fase y fecha de alta | Funcional |

## Standard Stack

No se requieren librerías nuevas. Todo se resuelve con Tailwind y el design system existente.

### Patrón de referencia: Phase 045 (ocultar-no-borrar)

Phase 045 estableció el patrón para este tipo de trabajo: conservar código, solo ocultar/deshabilitar UI. Se aplica el mismo principio aquí.

### Patrón disabled en design system

```tsx
// Indicador visual de "no disponible" — patrón establecido en el proyecto
// opacity-50 + cursor-default + badge "Próximamente"
<div className="flex items-center gap-3 px-5 min-h-[52px] opacity-50 cursor-default">
  <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
    <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
  </div>
  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
  <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full">
    Próximamente
  </span>
</div>
```

Alternativa más mínima (sin badge): solo `opacity-40` y sin `ChevronRight`. Más limpia visualmente.

## Architecture Patterns

### Cambio mínimo — solo en `settingsSections`

El cambio debe estar en `page.tsx` (Server Component). No requiere `'use client'`.

**Antes:**
```tsx
type MenuItem = {
  label: string
  icon: React.ElementType
  href?: string
}
```

**Después:**
```tsx
type MenuItem = {
  label: string
  icon: React.ElementType
  href?: string
  disabled?: boolean  // añadir esta propiedad
}
```

Y marcar todos los items no funcionales con `disabled: true`:
```tsx
const settingsSections: SettingsSection[] = [
  {
    title: "Cuenta",
    items: [
      { label: "Datos personales", icon: User, disabled: true },
      { label: "Notificaciones", icon: Bell, disabled: true },
      { label: "Unidades de medida", icon: Ruler, disabled: true },
    ],
  },
  {
    title: "App",
    items: [
      { label: "Mis revisiones", icon: ClipboardList, href: "/revisions", disabled: true },
      { label: "Privacidad", icon: Shield, disabled: true },
    ],
  },
]
```

### Render condicional para items disabled

En la lógica de render de cada item, añadir una rama para `item.disabled`:

```tsx
// Si disabled: nunca renderizar como Link, siempre como div no-interactivo
if (item.disabled) {
  return (
    <div key={item.label} className={`${rowClass} opacity-40`}>
      <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
      {/* Sin ChevronRight — indica visualmente que no es navegable */}
    </div>
  )
}
// Si no disabled: lógica actual (Link si href, div si no)
```

### Anti-Patterns a evitar

- **No eliminar items del array** — la fase pide explícitamente conservar el código para reactivar en versiones futuras.
- **No añadir `pointer-events-none` sin `opacity`** — el item seguiría viéndose igual, confundiendo al usuario.
- **No usar `display: none`** — ocultar completamente impide ver que la feature existe. El diseño correcto es visible-pero-deshabilitado.

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar |
|----------|-------------|-----------------|
| Badge "Próximamente" | Componente custom `ComingSoonBadge` | Span inline con clases Tailwind — demasiado simple para extraer |
| Estado disabled | Estado React/contexto | Propiedad estática en el array de datos — es data, no estado dinámico |

## Common Pitfalls

### Pitfall 1: Items disabled sin indicador visual claro
**Qué falla:** Aplicar solo `opacity-50` puede ser confuso — el usuario no sabe si es un error o una feature deshabilitada.
**Cómo evitar:** Elegir uno de los dos patrones:
  - Opción A (más clara): `opacity-40` sin ChevronRight — la ausencia del chevron indica no-navegable.
  - Opción B (más explícita): `opacity-50` + texto "Próximamente" donde iría el ChevronRight.

### Pitfall 2: Items con `href` + `disabled` que siguen siendo navegables
**Qué falla:** Si se mantiene `href` en el item pero solo se cambia el estilo, el Link sigue siendo navegable.
**Cómo evitar:** En el render, si `item.disabled === true`, renderizar SIEMPRE como `<div>`, ignorando `item.href`. El `href` se conserva en el array como dato para el futuro.

### Pitfall 3: TypeScript error por nueva propiedad en tipo
**Qué falla:** Añadir `disabled` al tipo `MenuItem` sin actualizar todos los items existentes puede causar errores si el tipo lo requiere.
**Cómo evitar:** Declarar como `disabled?: boolean` (opcional). Todos los items sin la propiedad son tratados como no-disabled.

## Code Examples

### Render completo actualizado (patrón recomendado — Opción A)

```tsx
// Source: análisis de app/(client)/profile/page.tsx existente
{section.items.map((item, i) => {
  const Icon = item.icon;
  const rowClass = `flex items-center gap-3 px-5 min-h-[52px] ${i < section.items.length - 1 ? "border-b border-[var(--border)]" : ""}`;

  if (item.disabled) {
    return (
      <div key={item.label} className={`${rowClass} opacity-40 cursor-default`}>
        <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
          {item.label}
        </span>
        {/* Sin ChevronRight intencional */}
      </div>
    );
  }

  const inner = (
    <>
      <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
        {item.label}
      </span>
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
    </>
  );

  return item.href ? (
    <Link key={item.label} href={item.href} className={rowClass}>
      {inner}
    </Link>
  ) : (
    <div key={item.label} className={rowClass}>
      {inner}
    </div>
  );
})}
```

## Alcance del cambio

**Solo un archivo:** `app/(client)/profile/page.tsx`
- Añadir `disabled?: boolean` a tipo `MenuItem`
- Marcar todos los items con `disabled: true`
- Actualizar lógica de render para items disabled

**No tocar:**
- `app/(client)/revisions/page.tsx` — se conserva sin cambios
- `components/client/nav.tsx` — el nav ya no incluye nutrición, el resto de tabs funcionan
- Ningún otro archivo

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No hay test framework configurado en el proyecto |
| Config file | ninguno detectado |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P47-01 | Items disabled visibles pero no navegables | manual | Verificación visual en /profile | N/A |
| P47-02 | Código de items conservado en array | code review | Leer page.tsx post-implementación | N/A |

### Wave 0 Gaps
No hay framework de tests en el proyecto. Verificación manual:
1. Abrir `/profile` como cliente
2. Confirmar que los 5 items del menú aparecen con opacity reducida y sin ChevronRight
3. Confirmar que el EditProfileForm sigue funcionando
4. Confirmar que LogoutButton sigue funcionando

## Open Questions

1. **¿Badge "Próximamente" o solo opacity?**
   - Lo que sabemos: el design system no tiene un componente `ComingSoonBadge`
   - Lo que es ambiguo: si el usuario prefiere feedback explícito (texto) o minimalista (solo opacity)
   - Recomendación: Opción A (solo opacity-40 sin ChevronRight) — más limpia y alineada con el estilo de la app. El planner puede ajustar si se prefiere texto.

2. **¿Debe "Mis revisiones" seguir mostrando la página si el usuario accede directamente a `/revisions`?**
   - Lo que sabemos: la ruta existe y muestra datos reales. Solo se deshabilita el enlace desde /profile.
   - Recomendación: No tocar la página de revisiones. Solo deshabilitar el enlace de acceso desde /profile.

## Sources

### Primary (HIGH confidence)
- Análisis directo de `app/(client)/profile/page.tsx` (lines 47-73, 219-249) — inventario completo de items
- `components/client/nav.tsx` — confirmación de que Nutrición ya no está en nav
- `.planning/REQUIREMENTS.md` — "Revisiones tab (client) — Deferred past v4.0 — Out of Scope"
- `STATE.md` — Phase 045 patrón ocultar-no-borrar como precedente

### Secondary (MEDIUM confidence)
- Convención de design system Tailwind: `opacity-40`/`opacity-50` como indicador estándar de estado disabled

## Metadata

**Confidence breakdown:**
- Inventario de items no funcionales: HIGH — análisis directo del código, sin ambigüedad
- Patrón de implementación: HIGH — es CSS/TypeScript estándar, sin dependencias externas
- Scope del cambio: HIGH — un solo archivo identificado

**Research date:** 2026-03-13
**Valid until:** Indefinido — el código no cambiará hasta que se implementen las features pendientes
