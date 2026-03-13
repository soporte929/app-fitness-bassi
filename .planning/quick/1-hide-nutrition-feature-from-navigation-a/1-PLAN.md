---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - components/client/nav.tsx
  - components/client/sidebar.tsx
  - middleware.ts
autonomous: true
requirements: [QUICK-1]
must_haves:
  truths:
    - "El tab Nutrición no aparece en la barra de navegación inferior del cliente"
    - "El enlace Nutrición no aparece en el sidebar del cliente"
    - "Navegar a /nutrition redirige al cliente fuera de esa ruta (no carga la página)"
    - "El código de nutrition sigue intacto en app/(client)/nutrition/"
  artifacts:
    - path: "components/client/nav.tsx"
      provides: "Barra de navegación inferior sin entrada Nutrición"
    - path: "components/client/sidebar.tsx"
      provides: "Sidebar sin entrada Nutrición"
    - path: "middleware.ts"
      provides: "Redirige /nutrition a /today para clientes"
  key_links:
    - from: "components/client/nav.tsx"
      to: "tabs array"
      via: "eliminar entrada Nutrición del array"
    - from: "middleware.ts"
      to: "isClientRoute"
      via: "eliminar /nutrition del listado de rutas cliente válidas"
---

<objective>
Ocultar la feature de nutrición de la navegación y bloquear el acceso directo a /nutrition, sin eliminar el código existente.

Purpose: La feature de nutrición no está lista para mostrarse a los clientes. Debe ser invisible en la UI y no accesible por URL directa.
Output: Nav, sidebar y middleware actualizados. El código en app/(client)/nutrition/ permanece intacto.
</objective>

<execution_context>
@/Users/jofreatanet/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jofreatanet/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Eliminar Nutrición de la navegación del cliente</name>
  <files>components/client/nav.tsx, components/client/sidebar.tsx</files>
  <action>
    En `components/client/nav.tsx`:
    - Eliminar la entrada `{ label: "Nutrición", href: "/nutrition", icon: UtensilsCrossed }` del array `tabs`
    - Eliminar `UtensilsCrossed` del import de lucide-react (evitar unused import)

    En `components/client/sidebar.tsx`:
    - Eliminar la entrada `{ label: "Nutrición", href: "/nutrition", icon: Apple }` del array `tabs`
    - Eliminar `Apple` del import de lucide-react (evitar unused import)

    NO eliminar ningún otro archivo. NO modificar nada en app/(client)/nutrition/.
  </action>
  <verify>
    Abrir la app como cliente. La barra de navegación inferior debe mostrar: Hoy, Historial, Rutinas, Progreso, Perfil (sin Nutrición). El sidebar (si aplica) tampoco debe mostrar Nutrición.
  </verify>
  <done>El tab Nutrición no aparece en ninguna barra de navegación del cliente.</done>
</task>

<task type="auto">
  <name>Task 2: Bloquear acceso directo a /nutrition en middleware</name>
  <files>middleware.ts</files>
  <action>
    En `middleware.ts`, dentro de la definición de `isClientRoute`, eliminar estas dos condiciones:
    ```
    pathname === "/nutrition" || pathname.startsWith("/nutrition/") ||
    ```

    Al eliminarlas, /nutrition deja de ser una ruta cliente reconocida. Cuando un cliente autenticado navega a /nutrition, el middleware no lo reconoce como ruta cliente ni como ruta trainer, así que cae al `return supabaseResponse` final — la página carga pero sin protección de rol. Para forzar el redirect, añadir un bloque explícito ANTES de la definición de `isClientRoute`:

    ```typescript
    // Nutrición deshabilitada — redirigir a /today
    if (pathname === "/nutrition" || pathname.startsWith("/nutrition/")) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
    ```

    Colocar este bloque en la línea 82, justo después del bloque `if (isTrainerRoute) { ... }` y antes de `const isClientRoute = ...`.

    IMPORTANTE: No tocar la línea 71 (`pathname.startsWith("/nutrition-plans")`) que pertenece a `isTrainerRoute` — esa ruta del trainer debe seguir funcionando.
  </action>
  <verify>
    Navegar directamente a /nutrition como cliente → debe redirigir a /today.
    Navegar a /nutrition-plans como trainer → debe seguir funcionando (no afectado).
  </verify>
  <done>Acceder a /nutrition como cliente redirige inmediatamente a /today. El código en app/(client)/nutrition/ permanece intacto.</done>
</task>

</tasks>

<verification>
- `components/client/nav.tsx`: array `tabs` sin entrada href="/nutrition", sin import UtensilsCrossed
- `components/client/sidebar.tsx`: array `tabs` sin entrada href="/nutrition", sin import Apple
- `middleware.ts`: bloque redirect para /nutrition antes de `isClientRoute`; la línea `/nutrition-plans` en `isTrainerRoute` intacta
- El directorio `app/(client)/nutrition/` sigue existiendo sin cambios
</verification>

<success_criteria>
- Cliente autenticado no ve "Nutrición" en ninguna barra de navegación
- Navegar a /nutrition redirige a /today
- /nutrition-plans (trainer) sigue funcionando
- Cero archivos eliminados en app/(client)/nutrition/
</success_criteria>

<output>
Después de completar, crear `.planning/quick/1-hide-nutrition-feature-from-navigation-a/1-SUMMARY.md`
</output>
