---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Bassi v3 - Fixes & Polish
status: Roadmap ready — plan Phase 4 to start execution
stopped_at: Completed 05-client-management-fixes 05-01-PLAN.md
last_updated: "2026-03-09T12:59:17.204Z"
last_activity: 2026-03-09 — Roadmap created for v3.0
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 10
  completed_plans: 9
  percent: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09 after v3.0 milestone started)

**Core value:** El loop de entrenamiento funciona de extremo a extremo — si esto falla, nada más importa.
**Current focus:** Defining requirements for v3.0

## Current Position

Phase: 4 of 7 (Login & Trainer UI Polish) — NOT STARTED
Plan: —
Status: Roadmap ready — plan Phase 4 to start execution
Last activity: 2026-03-09 — Roadmap created for v3.0

Progress: [░░░░░░░░░░] 0%  (0/4 v3 phases)

## Performance Metrics

**v1.0 Velocity:**
- Plans completed: 2
- Average duration: ~2.5m per plan
- Total execution time: ~5m

**v2.0 Velocity:**
- Plans completed: 3 (phases 2-3 + 2 quick tasks)
- Average duration: ~35min per plan
- Total execution time: ~35min per plan

## Accumulated Context

### Architecture Patterns (established)
- Server Components by default; `'use client'` only for interactive state
- Server Actions in `actions.ts` alongside route; called directly with typed params
- All Supabase joins use explicit FK hints to avoid ambiguous FK failures
- `params` is a Promise in Next.js 16: always `params: Promise<{ id: string }>` with `await params`
- Global (dateless) collision check for session uniqueness: `.eq('completed', false).maybeSingle()`
- Dark design system: CSS vars `--bg-base`, `--bg-surface`, `--bg-elevated`, `--accent`

### Known Gotchas
- Dev auth bypass active in middleware.ts (`NODE_ENV === 'development'`) — remove before production
- Recharts formatter: `(value: number | undefined, name: string | undefined)` to avoid type errors
- Column ambiguity in `.eq()`: remove duplicate-named column from child select
- Pre-existing TS errors in profile/page.tsx (href union) and clients/[id]/page.tsx (Phase type) — target TS-01, TS-02 in Phase 7

### Useful Files
- `lib/supabase/types.ts` — all Database types (1200+ lines)
- `lib/pr-detection.ts` — computePRBestsByClient, detectSessionPRs
- `app/(client)/today/actions.ts` — `saveSetLog` and `finishWorkout` (reusable)
- `app/(client)/history/page.tsx` — COMPLETE with real Supabase data + PR badges
- `app/(client)/history/[sessionId]/page.tsx` — COMPLETE with set detail + PR badges
- `app/(client)/nutrition/page.tsx` — COMPLETE (acceso a verificar — NUTR-01)
- `components/trainer/sidebar.tsx` — sidebar del trainer (logo issue — TRNUI-01)
- `app/(trainer)/dashboard/page.tsx` — dashboard trainer (margins, logo — TRNUI-03/04/05)
- `app/(trainer)/clients/` — create client error (CLNT-01)

### Blockers/Concerns
- Error de producción CLNT-01 (Digest 2112945886) — CRÍTICO, investigar en Phase 5

## Decisions

All key decisions documented in PROJECT.md Key Decisions table.
- [Phase 02-bug-fixes-type-safety]: Derive page types from Database Row types rather than redeclaring manually
- [02-02 BUG-01]: Global session check (no date bounds) matches actions.ts collision guard
- [02-02 BUG-03]: calculateNutrition() replaces hardcoded getKcalByPhase/buildTargets
- [Phase 03-01]: detectSessionPRs compares current session vs prior sessions
- [Phase 03-01]: Promise.all in history/page.tsx runs detectSessionPRs per session in parallel
- [Phase 03-02]: prBestVolume passed as numeric threshold from server; isPR derived client-side
- [Phase 04-login-trainer-ui-polish]: Usar /2.png en sidebar del trainer — el archivo con underscores no existe en /public
- [Phase 04-login-trainer-ui-polish]: Eliminar logoPhase state completamente — animation fija como string literal es suficiente
- [Phase 04-login-trainer-ui-polish]: useEffect de mount en ThemeProvider lee localStorage directamente para sincronizar estado React con DOM tras hidratación del script inline de layout.tsx
- [Phase 04-login-trainer-ui-polish]: Todos los requisitos de Phase 4 verificados visualmente por el humano — aprobados sin issues adicionales
- [Phase 05-client-management-fixes]: Use admin client (service role key) for clients INSERT in createClientAction — no INSERT RLS policy exists, regular user client fails in production with Digest 2112945886

## Pending Todos

(none)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix visual changes in login and dashboard pages | 2026-03-09 | 3a01770 | [1-fix-visual-changes-in-login-and-dashboar](./quick/1-fix-visual-changes-in-login-and-dashboar/) |
| 2 | Glow amarillo del logo en login — fijo y estático | 2026-03-09 | c86f4d2 | [2-el-glow-amarillo-del-logo-en-login-tiene](./quick/2-el-glow-amarillo-del-logo-en-login-tiene/) |
| Phase 04-login-trainer-ui-polish P04-01 | 1 | 2 tasks | 2 files |
| Phase 04-login-trainer-ui-polish P02 | 5 | 1 tasks | 1 files |
| Phase 04-login-trainer-ui-polish P03 | 0 | 1 tasks | 0 files |
| Phase 05-client-management-fixes P01 | 4 | 2 tasks | 2 files |

## Session Continuity

Last session: 2026-03-09T12:59:17.201Z
Stopped at: Completed 05-client-management-fixes 05-01-PLAN.md
Resume file: None
