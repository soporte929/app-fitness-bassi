---
phase: quick-4
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - components/trainer/exercise-picker.tsx
autonomous: true
requirements:
  - QUICK-4-modal-centrado
must_haves:
  truths:
    - "En mobile (≤430px) el modal aparece como bottom sheet pegado al borde inferior"
    - "En tablet y desktop (>430px) el modal aparece centrado en pantalla"
    - "No hay recortes del header ni del contenido en ningún breakpoint"
  artifacts:
    - path: "components/trainer/exercise-picker.tsx"
      provides: "Modal con comportamiento bottom-sheet en mobile y centrado en tablet/desktop"
  key_links:
    - from: "contenedor externo (fixed inset-0)"
      to: "modal interior"
      via: "flex alignment: items-end mobile, items-center justify-center desktop"
      pattern: "items-end min-\\[431px\\]:items-center"
---

<objective>
Corregir el modal ExercisePicker para que sea un bottom sheet solo en mobile (≤430px) y un modal centrado en tablet y desktop (>430px).

Purpose: El modal actualmente puede no centrarse correctamente en viewports >430px debido a conflictos de clases Tailwind v4 o padding insuficiente.
Output: Modal que se centra correctamente en pantalla en tablet/desktop y se muestra como bottom sheet en mobile.
</objective>

<execution_context>
@/Users/jofreatanet/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jofreatanet/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@components/trainer/exercise-picker.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Corregir clases del contenedor externo e interior del modal</name>
  <files>components/trainer/exercise-picker.tsx</files>
  <action>
Reemplazar las clases del contenedor externo (div con `fixed inset-0 z-50`) y del modal interior para garantizar el comportamiento correcto en todos los breakpoints.

**Contenedor externo** (backdrop + flex alignment):
```tsx
className={cn(
  'fixed inset-0 z-50 flex',
  'items-end justify-center',                            // mobile: bottom sheet
  'min-[431px]:items-center min-[431px]:justify-center', // tablet+: centrado
  'min-[431px]:p-4',                                     // padding en tablet+
  'transition-colors duration-200',
  open ? 'pointer-events-auto bg-black/40' : 'pointer-events-none bg-transparent'
)}
```

**Modal interior** (contenedor blanco):
```tsx
className={cn(
  // Ancho: full en mobile, max-w-md en tablet+
  'w-full min-[431px]:max-w-md',
  // Altura: 75dvh siempre para no recortar header
  'max-h-[75dvh]',
  // Bordes redondeados: solo arriba en mobile, todos lados en tablet+
  'rounded-t-xl min-[431px]:rounded-xl',
  // Estilo base
  'bg-[var(--bg-surface)] border border-[var(--border)]',
  'shadow-2xl flex flex-col min-h-0',
  // Safe area en mobile
  'pb-[env(safe-area-inset-bottom,0px)] min-[431px]:pb-0',
  // Transición
  'transition-all duration-300 ease-out',
  open
    ? 'translate-y-0 min-[431px]:scale-100 opacity-100'
    : 'translate-y-full min-[431px]:translate-y-0 opacity-0 min-[431px]:scale-95'
)}
```

La clave es que el contenedor externo NO tenga `p-0` explícito en mobile (ya es 0 por defecto) y SÍ tenga `min-[431px]:p-4` para dar espacio al modal centrado en tablet/desktop. Sin `p-4` en tablet, el modal ocupa todo el ancho y puede aparecer pegado a los bordes en lugar de centrado visualmente.

Mantener el resto del JSX sin cambios (handle, header, search, chips, lista).
  </action>
  <verify>
    <automated>cd "/Users/jofreatanet/Desktop/Fitness bassi/app-fitness-bassi" && npx tsc --noEmit --project tsconfig.json 2>&1 | grep -E "exercise-picker" || echo "No TypeScript errors in exercise-picker"</automated>
  </verify>
  <done>
    - En mobile (≤430px): modal ocupa ancho completo, pegado al borde inferior, esquinas superiores redondeadas
    - En tablet/desktop (>430px): modal centrado en pantalla con max-w-md, esquinas todas redondeadas, padding de 16px respecto a los bordes
    - max-h-[75dvh] aplicado en todos los breakpoints sin recortes
  </done>
</task>

</tasks>

<verification>
Abrir la página de creación/edición de rutinas en el trainer y hacer clic en "Añadir ejercicio":
1. En mobile (Chrome DevTools ≤430px): el modal debe aparecer desde abajo como bottom sheet
2. En tablet (768px) y desktop (1280px+): el modal debe aparecer centrado en pantalla con sombra y fondo oscuro alrededor
3. El header de la app NO debe quedar oculto o recortado por el modal en ningún breakpoint
</verification>

<success_criteria>
- Modal centrado visualmente en tablet y desktop (no pegado a ningún borde)
- Bottom sheet funcional en mobile con handle visible
- max-h-[75dvh] respetado sin recortes en todos los breakpoints
- Sin errores de TypeScript
</success_criteria>

<output>
Después de completar, crear `.planning/quick/4-fix-exercise-picker-modal-centrado-en-ta/4-SUMMARY.md`
</output>
