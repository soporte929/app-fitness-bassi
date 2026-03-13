---
phase: 14-trainer-completar
plan: "01"
subsystem: trainer
tags: [exercises, sidebar, navigation, filter]
dependency_graph:
  requires: []
  provides: [exercises-page, exercises-filter, clean-sidebar]
  affects: [components/trainer/sidebar.tsx]
tech_stack:
  added: []
  patterns: [Server Component + Client Component filter, local state filtering]
key_files:
  created:
    - app/(trainer)/exercises/page.tsx
    - components/trainer/exercises-filter.tsx
  modified:
    - components/trainer/sidebar.tsx
decisions:
  - RLS en tabla exercises filtra automáticamente por trainer_id via day_id → workout_days → workout_plans — no hace falta filtro manual
  - muscleGroups derivados de la data retornada, no hardcodeados
metrics:
  duration: 100s
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_changed: 3
---

# Phase 14 Plan 01: Exercises Library + Sidebar Cleanup Summary

**One-liner:** Página /exercises del trainer con filtro local por grupo muscular y sidebar sin links muertos (/reports, /settings).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear exercises/page.tsx + exercises-filter.tsx | 03e9a55 | app/(trainer)/exercises/page.tsx, components/trainer/exercises-filter.tsx |
| 2 | Limpiar sidebar — eliminar /reports y /settings | cc66cb9 | components/trainer/sidebar.tsx |

## What Was Built

### app/(trainer)/exercises/page.tsx
Server Component que:
- Autentica con `supabase.auth.getUser()` y redirige a /login si no hay sesión
- Consulta tabla `exercises` con columnas específicas (sin SELECT *): `id, name, muscle_group, target_sets, target_reps, target_rir, notes`
- Ordena por `muscle_group` ASC y luego por `name` ASC
- Deriva `muscleGroups` únicos del resultado (no hardcodeados)
- Pasa datos como props a `ExercisesFilter`
- Envuelto en `<PageTransition>`

### components/trainer/exercises-filter.tsx
Client Component que:
- Recibe `exercises` y `muscleGroups` como props desde el Server Component
- Usa `useState<string | null>` para rastrear el grupo seleccionado
- Filtra localmente (sin queries Supabase en cliente)
- Muestra chips de filtro interactivos (Todos + un chip por grupo muscular)
- Lista los ejercicios filtrados en Cards con nombre, grupo, sets × reps, RIR y notas
- Empty states: sin ejercicios globales vs sin ejercicios en el grupo seleccionado
- Animaciones stagger con `animate-fade-in` y `animationDelay`

### components/trainer/sidebar.tsx
Limpieza del array `navigation`:
- Eliminada entrada `{ label: "Informes", href: "/reports", icon: FileText }` de sección Herramientas
- Eliminada sección entera `"Sistema"` con `{ label: "Ajustes", href: "/settings" }`
- Eliminados imports `FileText` y `Settings` de lucide-react
- Link `/exercises` permanece intacto

## Verification Results

```
npx tsc --noEmit → sin errores
grep reports|settings|FileText|Settings sidebar.tsx → OK: dead links removed
exercises/page.tsx → exists
exercises-filter.tsx → exists
```

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check

- [x] app/(trainer)/exercises/page.tsx created
- [x] components/trainer/exercises-filter.tsx created
- [x] components/trainer/sidebar.tsx modified (reports/settings removed)
- [x] TypeScript compiles without errors
- [x] Task 1 commit: 03e9a55
- [x] Task 2 commit: cc66cb9
