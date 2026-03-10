---
phase: 19-trainer-settings-modals
plan: "02"
subsystem: trainer-settings
tags: [settings, sidebar, navigation, theme]
dependency_graph:
  requires: []
  provides: [trainer-settings-hub, settings-navigation]
  affects: [components/trainer/sidebar.tsx]
tech_stack:
  added: []
  patterns: [server-component-auth-pattern, css-vars, supabase-profiles-query]
key_files:
  created:
    - app/(trainer)/settings/page.tsx
  modified:
    - components/trainer/sidebar.tsx
decisions:
  - "Secciones Settings Hub: Cuenta (nombre, email, rol) y Apariencia (ThemeToggle) — cubre V41-07"
  - "Settings entry en sección Principal del sidebar (junto a Dashboard y Clientes) — acceso top-level"
  - "profile?.email ?? user.email — fallback al auth email si profiles.email es null"
metrics:
  duration: "2m"
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_changed: 2
---

# Phase 19 Plan 02: Trainer Settings Hub Summary

**One-liner:** Settings Hub con secciones Cuenta y Apariencia (ThemeToggle) leyendo nombre/email desde tabla profiles.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear Settings Hub page.tsx | a73a3f3 | app/(trainer)/settings/page.tsx |
| 2 | Añadir entrada Ajustes al sidebar | 1f903e2 | components/trainer/sidebar.tsx |

## What Was Built

### app/(trainer)/settings/page.tsx
Server Component nuevo en la ruta `/settings`. Fetcha el perfil del trainer desde la tabla `profiles` usando el `user.id` de Supabase Auth. Muestra dos secciones:
- **Cuenta**: nombre completo, email (con fallback a `user.email`), rol fijo "Entrenador"
- **Apariencia**: `ThemeToggle` existente para cambiar entre modo claro/oscuro

Envuelto en `<PageTransition>`, usa CSS vars (`--text-primary`, `--text-secondary`) en lugar de colores hardcodeados.

### components/trainer/sidebar.tsx
Añadida entrada `{ label: "Ajustes", href: "/settings", icon: Settings }` en la sección "Principal" del array `navigation`, después de "Clientes". Import de `Settings` añadido al destructuring de lucide-react.

## Deviations from Plan

None — plan executed exactly as written.

## Pre-existing Issues (out of scope)

- `app/(trainer)/clients/[id]/page.tsx` line 46: TS2493 — tuple index out of bounds (pre-existing, unrelated to this plan)

## Self-Check: PASSED

- app/(trainer)/settings/page.tsx: FOUND
- components/trainer/sidebar.tsx "Ajustes": 1 match FOUND
- Commits a73a3f3 and 1f903e2: FOUND
