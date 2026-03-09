# Requirements: Fitness Bassi

**Defined:** 2026-03-09
**Core Value:** El loop de entrenamiento funciona de extremo a extremo — si esto falla, nada más importa.

## v4 Requirements

Requirements para milestone v4.0 — Módulo Nutrición.

### Infraestructura BD (INFRA)

- [x] **INFRA-01**: Las tablas `foods`, `food_equivalences`, `saved_dishes`, `meal_plan_items`, `food_log` y `client_measurements` existen en Supabase con types completos en `lib/supabase/types.ts`
- [ ] **INFRA-02**: La tabla `foods` contiene seed inicial con 13 alimentos base (pollo, huevos, atún, ternera, salmón, arroz, pasta, patata, avena, pan, aceite oliva, aguacate, frutos secos)

### Cálculo Nutricional (CALC)

- [ ] **CALC-01**: El sistema calcula TMB con Katch-McArdle (`370 + 21.6×FFM`) cuando hay % grasa disponible
- [ ] **CALC-02**: El sistema calcula TMB con Mifflin-St Jeor cuando no hay % grasa
- [ ] **CALC-03**: El sistema calcula TDEE = TMB × factor actividad (1.2 / 1.375 / 1.55 / 1.725 / 1.9)
- [ ] **CALC-04**: El sistema calcula calorías objetivo: déficit ×0.85, mantenimiento ×1.0, volumen ×1.075
- [ ] **CALC-05**: El sistema distribuye macros según fase (proteínas por peso: déficit 2.2g/kg, recomposición 2.0g/kg, volumen 1.8g/kg; grasas: déficit 0.8g/kg, recomposición 0.9g/kg, volumen 1.0g/kg; carbos del resto)

### Panel Entrenador — Planes Nutricionales (TPLAN)

- [ ] **TPLAN-01**: El entrenador puede crear un plan nutricional con formulario (peso, altura, edad, sexo, %grasa opcional, actividad, objetivo)
- [ ] **TPLAN-02**: Los cálculos TMB → TDEE → calorías → macros se actualizan en tiempo real al rellenar el formulario
- [ ] **TPLAN-03**: El entrenador puede elegir tipo de dieta: A (Estructurada), B (Opciones A/B/C), C (Flexible)
- [ ] **TPLAN-04**: En dieta tipo A, las comidas se generan automáticamente con porciones calculadas por macros (3, 4 o 5 comidas)
- [ ] **TPLAN-05**: En dieta tipo B, cada comida tiene 2-3 alternativas equivalentes configurables
- [ ] **TPLAN-06**: En dieta tipo C, el plan solo muestra los macros diarios objetivo sin comidas fijas
- [ ] **TPLAN-07**: El entrenador puede asignar el plan a un cliente con fecha de inicio
- [ ] **TPLAN-08**: El entrenador puede crear y guardar platos compuestos (`saved_dishes`) con suma de macros

### Vista Cliente — Nutrición (CNUTR)

- [ ] **CNUTR-01**: El cliente ve sus calorías diarias consumidas vs objetivo con barra de progreso
- [ ] **CNUTR-02**: El cliente ve barras de progreso para proteínas, grasas y carbohidratos del día
- [ ] **CNUTR-03**: El cliente ve la lista de comidas del día con alimentos, cantidades y macros por comida
- [ ] **CNUTR-04**: El cliente puede seleccionar una alternativa equivalente para cada alimento (planes tipo B)
- [ ] **CNUTR-05**: El cliente puede registrar un alimento en su diario alimentario con cantidad en tiempo real
- [ ] **CNUTR-06**: El cliente puede ver una lista de la compra semanal generada automáticamente desde su plan

### Progress Logging (PROG)

- [ ] **PROG-01**: El cliente puede registrar su peso actual desde la página `/progress`
- [ ] **PROG-02**: El peso objetivo del cliente aparece como línea de referencia en la gráfica de peso
- [ ] **PROG-03**: El cliente puede registrar medidas corporales (cintura, cadera, pecho, brazo, muslo) desde `/progress`

### AI Nutrition — Claude API (AI)

- [ ] **AI-01**: El cliente puede abrir un modal y escribir una descripción libre de un alimento
- [ ] **AI-02**: La app llama a Claude API server-side y devuelve los macros estimados del alimento descrito
- [ ] **AI-03**: El cliente ve los macros estimados en un paso de confirmación antes de guardarlos en su diario
- [ ] **AI-04**: Si Claude no puede interpretar el alimento, el cliente ve un fallback para entrada manual de macros

### Trainer — Completar (TRN)

- [ ] **TRN-01**: El entrenador puede navegar y gestionar la librería de ejercicios desde `/exercises`
- [ ] **TRN-02**: El botón "Ver historial" en el detalle de un cliente navega al historial de sesiones de ese cliente
- [ ] **TRN-03**: Los links muertos del sidebar del trainer (`/reports`, `/settings`) están eliminados o redirigidos

## Completed Requirements

### v2 — Bug Fixes & History

- [x] **BUG-01**: "Reanudar entreno" redirige a la sesión activa existente (no crea duplicado)
- [x] **BUG-02**: Tablas `revisions`, `revision_measurements`, `revision_photos` tipadas en `lib/supabase/types.ts`
- [x] **BUG-03**: Macro targets calculados correctamente para clientes sin plan de nutrición asignado
- [x] **HIST-01**: Cliente ve feed cronológico de sesiones completadas en `/history`
- [x] **HIST-02**: Cliente puede ver detalle completo de una sesión pasada
- [x] **PR-01**: Durante sesión, la app detecta PR (mejor peso×reps histórico) y muestra badge
- [x] **PR-02**: Cards del historial indican qué sesiones contienen al menos un PR

### v3 — Fixes & Polish

- [x] **LOGIN-01**: Glow del logo en login es estático (sin animación en bucle)
- [x] **LOGIN-02**: Márgenes entre logo y subtítulo correctos
- [x] **LOGIN-03**: Botón "Entrar como entrenador" (demo) eliminado
- [x] **TRNUI-01**: Sidebar del trainer carga logo (/2.png) correctamente
- [x] **TRNUI-02**: Toggle dark/light mode funciona
- [x] **TRNUI-03**: KPIs del dashboard con márgenes correctos
- [x] **TRNUI-04**: Alertas del dashboard con márgenes correctos
- [x] **TRNUI-05**: Logo en barra superior del trainer es el icono correcto
- [x] **CLNT-01**: Error de producción al crear cliente (Digest 2112945886) resuelto
- [x] **CLNT-02**: Código de debug eliminado de la sección de clientes
- [x] **CLNT-03**: Fórmula % grasa corporal correcta en formulario de cliente
- [x] **CLNT-04**: Notas del trainer al final del formulario de creación
- [x] **CLNT-05**: Campos compatibles al pasar cliente a objetivos
- [x] **CLNT-06**: Campos legacy eliminados del formulario
- [x] **ROUT-01**: Sección rutinas del trainer accesible sin errores
- [x] **PLAN-01**: Resumen de rutinas visible dentro del plan
- [x] **PLAN-02**: Acceso a rutinas individuales dentro del plan
- [x] **PLAN-03**: Vista historial del plan cliente funcional
- [x] **PLAN-04**: Vista entrenamiento individual del plan cliente correcta
- [x] **NUTR-01**: Sección nutrición del cliente accesible y funcional
- [x] **TS-01**: Errores TS pre-existentes en `profile/page.tsx` resueltos
- [x] **TS-02**: Errores TS pre-existentes en `clients/[id]/page.tsx` resueltos

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline workout support | Too complex; requires IndexedDB |
| Push notifications | Infrastructure not set up — deferred |
| Real-time sync (trainer watching session live) | Supabase Realtime not yet integrated |
| Mobile native app | Web-first approach |
| Revisiones tab (client) | Deferred past v4.0 — complex media upload |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 8 | Complete |
| INFRA-02 | Phase 8 | Pending |
| CALC-01 | Phase 8 | Pending |
| CALC-02 | Phase 8 | Pending |
| CALC-03 | Phase 8 | Pending |
| CALC-04 | Phase 8 | Pending |
| CALC-05 | Phase 8 | Pending |
| TPLAN-01 | Phase 9 | Pending |
| TPLAN-02 | Phase 9 | Pending |
| TPLAN-03 | Phase 9 | Pending |
| TPLAN-04 | Phase 9 | Pending |
| TPLAN-05 | Phase 9 | Pending |
| TPLAN-06 | Phase 9 | Pending |
| TPLAN-07 | Phase 10 | Pending |
| TPLAN-08 | Phase 10 | Pending |
| CNUTR-01 | Phase 11 | Pending |
| CNUTR-02 | Phase 11 | Pending |
| CNUTR-03 | Phase 11 | Pending |
| CNUTR-04 | Phase 11 | Pending |
| CNUTR-05 | Phase 11 | Pending |
| CNUTR-06 | Phase 11 | Pending |
| PROG-01 | Phase 12 | Pending |
| PROG-02 | Phase 12 | Pending |
| PROG-03 | Phase 12 | Pending |
| AI-01 | Phase 13 | Pending |
| AI-02 | Phase 13 | Pending |
| AI-03 | Phase 13 | Pending |
| AI-04 | Phase 13 | Pending |
| TRN-01 | Phase 14 | Pending |
| TRN-02 | Phase 14 | Pending |
| TRN-03 | Phase 14 | Pending |

**Coverage:**
- v4 requirements: 31 total
- Mapped to phases: 31/31 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 — Traceability complete after v4.0 roadmap creation*
