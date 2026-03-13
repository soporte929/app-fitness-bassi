# Research: Phase 16 Branding & UI Corrections

## 1. Branding Trainer
1.  **Fuente Anton:** La aplicación ya utiliza `next/font/google` para cargar Geist en `app/layout.tsx`. Debemos importar `Anton` desde `@next/font/google` o equivalente y exponerlo como una variable CSS `--font-anton`.
2.  **Modificación del Sidebar:** El componente reside en `components/trainer/sidebar.tsx`. Actualmente renderiza el logo (`/2.png`) dependiendo de `(!isMobile || !collapsed)`. Debemos inyectar un elemento texto `FITNESS BASSI` bajo la imagen usando la clase asociada a la nueva variable `font-anton` y el color `#F5C518`.
   - Se debe mantener la responsividad de forma que no desestabilice el header del sidebar móvil.

## 2. Ajuste de Gráficas en el Dashboard
1.  **AdherenceChart:** `components/trainer/dashboard-charts/adherence-chart.tsx`
    - Margen actual: `margin={{ top: 8, right: 8, left: -16, bottom: 60 }}`
    - El `left: -16` está causando que se recorte el eje Y en móviles. Lo cambiaremos a `left: 0`.
2.  **WeightTrendChart:** `components/trainer/dashboard-charts/weight-trend-chart.tsx`
    - Margen actual: `margin={{ top: 8, right: 8, left: -16, bottom: 28 }}`
    - Similarmente se debe corregir el valor negativo que recorta los labels.
3.  **PhaseDistributionChart:** `components/trainer/dashboard-charts/phase-distribution-chart.tsx`
    - No usa la propiedad `margin` en un gráfico de matriz normal, usa atributos `cx`, `cy` en `<Pie>`, por lo que las consideraciones de recorte no aplican, o se ajustarán mínimamente (`outerRadius={80}` en móviles si hiciera falta). No parece el problema principal.

Conclusión: Las tareas son directas. Podemos planificar todo el hito en un único plan.
