# Requirements: Fitness Bassi

**Defined:** 2026-03-09
**Core Value:** El loop de entrenamiento funciona de extremo a extremo — si esto falla, nada más importa.

## v2 Requirements (completed)

### Bugs & Technical Quality

- [x] **BUG-01**: "Reanudar entreno" button redirects to the existing active session instead of starting a new one
- [x] **BUG-02**: `revisions`, `revision_measurements`, `revision_photos` tables are fully typed in `lib/supabase/types.ts` (no more `supabase as any`)
- [x] **BUG-03**: Nutrition macro targets for clients without an active nutrition plan use a correct calculated formula (not zeros/placeholders)

### History & Personal Records

- [x] **HIST-01**: Client can see a chronological feed of all their completed workout sessions at `/history`
- [x] **HIST-02**: Client can tap a past session and see full detail — day name, duration, total volume, all sets per exercise
- [x] **PR-01**: During a workout, app detects when a logged set beats the client's all-time best weight×reps for that exercise and shows a PR badge
- [x] **PR-02**: History feed cards indicate which sessions contain at least one PR

## v3 Requirements

Requirements para milestone v3.0 — Bassi v3 Fixes & Polish.

### Login

- [x] **LOGIN-01**: El glow del logo en login es estático y fijo (sin animación en bucle)
- [x] **LOGIN-02**: Los márgenes entre el logo y el subtítulo "tu entrenador de bolsillo" son correctos
- [x] **LOGIN-03**: El botón "Entrar como entrenador" (demo) está eliminado del login

### Trainer UI

- [x] **TRNUI-01**: El sidebar del trainer carga el logo (/2.png) correctamente en todas las páginas del trainer
- [x] **TRNUI-02**: El toggle dark/light mode (icono luna) del dashboard funciona
- [x] **TRNUI-03**: Los KPIs del dashboard tienen márgenes correctos
- [x] **TRNUI-04**: Las alertas del dashboard tienen márgenes correctos
- [x] **TRNUI-05**: El logo en la barra superior izquierda del trainer usa el icono correcto

### Client Management

- [x] **CLNT-01**: El error de producción al crear un cliente (Digest 2112945886) está resuelto
- [x] **CLNT-02**: Todo código de debug está eliminado de la sección de clientes
- [x] **CLNT-03**: La fórmula de % grasa corporal en el formulario de cliente es correcta
- [x] **CLNT-04**: Las notas del trainer aparecen al final del formulario de creación de cliente
- [x] **CLNT-05**: Los campos son compatibles al pasar el cliente a objetivos
- [x] **CLNT-06**: Los campos legacy están eliminados del formulario de cliente

### Routines

- [ ] **ROUT-01**: La sección de rutinas del trainer es accesible sin errores

### Plans

- [ ] **PLAN-01**: El trainer ve un resumen de rutinas dentro del plan (vista genérica)
- [ ] **PLAN-02**: El trainer puede acceder a las rutinas individuales dentro del plan
- [ ] **PLAN-03**: La vista de historial del plan de un cliente es funcional
- [ ] **PLAN-04**: La vista de entrenamiento individual del plan de un cliente es correcta

### Nutrition

- [ ] **NUTR-01**: La sección de nutrición del cliente es accesible y funcional

### TypeScript

- [x] **TS-01**: Los errores de TypeScript pre-existentes en `profile/page.tsx` están resueltos
- [x] **TS-02**: Los errores de TypeScript pre-existentes en `clients/[id]/page.tsx` están resueltos

## v4 Requirements (deferred)

### Progress Logging

- **PROG-01**: Client can log their current weight from the `/progress` page
- **PROG-02**: Client's target weight is shown as a reference line on the weight chart
- **PROG-03**: Client can log body measurements (waist, hip, chest, arm, thigh) from the `/progress` page

### Revisiones

- **REV-01**: Client can access their revisiones from the bottom nav
- **REV-02**: Client can see all their revisiones with date, metrics, trainer feedback, and photos

### AI Nutrition

- **AI-01**: Client can tap a button and type a free-text food description
- **AI-02**: App calls Claude API server-side and returns estimated macros
- **AI-03**: Client sees the parsed macros in a confirmation step before saving
- **AI-04**: If Claude cannot parse the food, client sees a fallback for manual entry

### Trainer — Completar

- **TRN-01**: Trainer can browse and manage the exercise library from `/exercises`
- **TRN-02**: "Ver historial" button in client detail navigates to that client's session history
- **TRN-03**: Dead sidebar links (`/reports`, `/settings`) are removed or implemented

## Out of Scope

| Feature | Reason |
|---------|--------|
| Offline workout support | Too complex; requires IndexedDB |
| Push notifications | Infrastructure not set up |
| Real-time sync | Supabase Realtime not yet integrated |
| Mobile native app | Web-first approach |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 2 | Complete |
| BUG-02 | Phase 2 | Complete |
| BUG-03 | Phase 2 | Complete |
| HIST-01 | Phase 3 | Complete |
| HIST-02 | Phase 3 | Complete |
| PR-01 | Phase 3 | Complete |
| PR-02 | Phase 3 | Complete |
| LOGIN-01 | Phase 4 | Complete |
| LOGIN-02 | Phase 4 | Complete |
| LOGIN-03 | Phase 4 | Complete |
| TRNUI-01 | Phase 4 | Complete |
| TRNUI-02 | Phase 4 | Complete |
| TRNUI-03 | Phase 4 | Complete |
| TRNUI-04 | Phase 4 | Complete |
| TRNUI-05 | Phase 4 | Complete |
| CLNT-01 | Phase 5 | Complete |
| CLNT-02 | Phase 5 | Complete |
| CLNT-03 | Phase 5 | Complete |
| CLNT-04 | Phase 5 | Complete |
| CLNT-05 | Phase 5 | Complete |
| CLNT-06 | Phase 5 | Complete |
| ROUT-01 | Phase 6 | Pending |
| PLAN-01 | Phase 6 | Pending |
| PLAN-02 | Phase 6 | Pending |
| PLAN-03 | Phase 6 | Pending |
| PLAN-04 | Phase 6 | Pending |
| NUTR-01 | Phase 6 | Pending |
| TS-01 | Phase 7 | Complete |
| TS-02 | Phase 7 | Complete |

**Coverage:**
- v3 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after v3.0 milestone definition*
