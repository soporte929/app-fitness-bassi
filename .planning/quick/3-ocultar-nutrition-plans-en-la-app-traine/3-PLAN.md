---
phase: quick-3
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - components/trainer/sidebar.tsx
autonomous: true
requirements: [QUICK-3]

must_haves:
  truths:
    - "El enlace 'Nutrición' no aparece en el sidebar del trainer"
    - "El código de nutrition-plans permanece intacto (solo oculto en nav)"
  artifacts:
    - path: "components/trainer/sidebar.tsx"
      provides: "Sidebar sin item Nutrición en sección Herramientas"
  key_links:
    - from: "components/trainer/sidebar.tsx"
      to: "navigation array"
      via: "eliminar item con href '/nutrition-plans'"
      pattern: "nutrition-plans"
---

<objective>
Ocultar el item "Nutrición" del sidebar del trainer, igual que está oculto en la nav del cliente.

Purpose: La feature nutrition-plans del trainer está pendiente de implementar. Ocultarla de la navegación evita que aparezca como opción rota.
Output: Sidebar del trainer sin el enlace a /nutrition-plans. El código de la ruta permanece intacto.
</objective>

<execution_context>
@/Users/jofreatanet/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jofreatanet/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Referencia: el cliente oculta "Nutrición" simplemente no incluyéndola en el array `tabs` de `components/client/nav.tsx`. El mismo patrón aplica aquí.

Estado actual del array `navigation` en `components/trainer/sidebar.tsx`:
```typescript
const navigation = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clientes", href: "/clients", icon: Users },
      { label: "Ajustes", href: "/settings", icon: Settings },
    ],
  },
  {
    section: "Herramientas",
    items: [
      { label: "Rutinas", href: "/routines-templates", icon: ClipboardList },
      { label: "Planes", href: "/plans", icon: Layers },
      { label: "Nutrición", href: "/nutrition-plans", icon: UtensilsCrossed }, // ← ELIMINAR
      { label: "Ejercicios", href: "/exercises", icon: Dumbbell },
    ],
  },
];
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Eliminar item Nutrición del sidebar del trainer</name>
  <files>components/trainer/sidebar.tsx</files>
  <action>
En `components/trainer/sidebar.tsx`, eliminar el item de Nutrición del array `navigation`:
- Eliminar la línea: `{ label: "Nutrición", href: "/nutrition-plans", icon: UtensilsCrossed },`
- Eliminar el import de `UtensilsCrossed` de lucide-react (ya no se usa)
- NO tocar nada más — ni el código de la ruta, ni el middleware, ni ningún otro archivo
  </action>
  <verify>
    <automated>grep -n "nutrition-plans\|UtensilsCrossed" /Users/jofreatanet/Desktop/Fitness\ bassi/app-fitness-bassi/components/trainer/sidebar.tsx && echo "FAIL: item todavía presente" || echo "OK: item eliminado"</automated>
  </verify>
  <done>"Nutrición" no aparece en el sidebar del trainer. El import de UtensilsCrossed está eliminado. La ruta /nutrition-plans sigue existiendo en el filesystem.</done>
</task>

</tasks>

<verification>
Verificar visualmente que el sidebar del trainer muestra: Dashboard, Clientes, Ajustes, Rutinas, Planes, Ejercicios — sin Nutrición.
</verification>

<success_criteria>
El link a /nutrition-plans no aparece en el sidebar del trainer. Sin errores de TypeScript (import no usado eliminado). El código de la feature sigue intacto.
</success_criteria>

<output>
After completion, create `.planning/quick/3-ocultar-nutrition-plans-en-la-app-traine/3-SUMMARY.md`
</output>
