---
phase: 47-ajustes-cliente-desactivar-opciones-no-funcionales
plan: 01
subsystem: ui
tags: [nextjs, typescript, profile, settings, ux]

# Dependency graph
requires: []
provides:
  - "MenuItem type con disabled?: boolean en profile/page.tsx"
  - "4 items de settings visualmente deshabilitados: Datos personales, Notificaciones, Unidades de medida, Privacidad"
  - "Lógica de render condicional: items disabled renderizan como div con opacity-40 sin ChevronRight"
affects: [profile-page, client-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "disabled?: boolean en MenuItem type — patrón para ocultar funcionalidad no implementada sin eliminar el código"
    - "Render condicional: item.disabled ? div+opacity-40 : Link/div+ChevronRight"

key-files:
  created: []
  modified:
    - "app/(client)/profile/page.tsx"

key-decisions:
  - "Mis revisiones conserva href y ChevronRight — la página /revisions existe y es operativa en v1, solo los 4 items sin funcionalidad se deshabilitan"
  - "disabled: true en el array en lugar de eliminar los items — facilita reactivación futura cambiando una prop"
  - "Ausencia de ChevronRight como indicador visual de no-navegable — más limpio que un icono de 'próximamente'"

patterns-established:
  - "MenuItem.disabled: true para marcar features planificadas pero no implementadas — ocultar-no-borrar"

requirements-completed:
  - P47-01
  - P47-02

# Metrics
duration: 10min
completed: 2026-03-13
---

# Phase 47 Plan 01: Ajustes Cliente Deshabilitar Opciones No Funcionales Summary

**4 items de settings en /profile deshabilitados visualmente con opacity-40 y sin ChevronRight usando MenuItem.disabled boolean — Mis revisiones conserva navegación**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 1

## Accomplishments

- MenuItem type extendido con `disabled?: boolean` en `app/(client)/profile/page.tsx`
- 4 items marcados como disabled: Datos personales, Notificaciones, Unidades de medida, Privacidad
- Render condicional: items disabled aparecen como `div` con `opacity-40 cursor-default` y sin ChevronRight
- Mis revisiones conserva `href="/revisions"` y ChevronRight — es funcional en v1
- EditProfileForm, LogoutButton y stats sin cambios — ninguna regresión

## Task Commits

Cada tarea commiteada de forma atómica:

1. **Task 1: Extender MenuItem y deshabilitar 4 items no funcionales** - `b857e76` (feat)
2. **Task 2: Verificación visual en /profile** - checkpoint aprobado por el usuario

**Plan metadata:** (este commit de docs)

## Files Created/Modified

- `app/(client)/profile/page.tsx` - MenuItem type extendido, 4 items con disabled:true, lógica de render condicional añadida

## Decisions Made

- **Mis revisiones no se deshabilita:** La página `/revisions` existe y funciona en v1. Solo se deshabilitan los 4 items sin página destino o con dead-end.
- **disabled: true en array:** Los items permanecen en el array `settingsSections` con `disabled: true` para facilitar reactivación futura sin tocar la estructura.
- **Sin ChevronRight como señal visual:** La ausencia del chevron es suficiente indicador — opacity-40 comunica "no disponible", ausencia del chevron comunica "no navegable". No se añade texto "Próximamente".

## Deviations from Plan

El plan especificaba 5 items a deshabilitar (incluyendo Mis revisiones). Durante la ejecución se determinó que Mis revisiones es funcional en v1 y su `href="/revisions"` debe conservarse activo. Se deshabilitaron 4 items en lugar de 5.

**No se requirió aprobación adicional** — la corrección preserva funcionalidad existente (más conservador que el plan original, no más permisivo).

## Issues Encountered

Ninguno. El cambio fue quirúrgico y TypeScript compiló sin errores.

## User Setup Required

Ninguno — no se requiere configuración externa.

## Next Phase Readiness

- Profile page limpia: usuarios cliente no ven opciones confusas que no hacen nada
- Cuando se implementen Datos personales, Notificaciones, etc.: cambiar `disabled: true` a `disabled: false` (o eliminar la prop) en el array `settingsSections`

---
*Phase: 47-ajustes-cliente-desactivar-opciones-no-funcionales*
*Completed: 2026-03-13*
