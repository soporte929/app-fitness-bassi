---
phase: 45
slug: ocultar-nutricion-en-trainer-panel-vista-cliente
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 45 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (tsc) + Next.js build |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 45-01-01 | 01 | 1 | P45-SC1 | compile | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 45-01-02 | 01 | 1 | P45-SC2 | manual | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — this phase is purely subtractive (removing code), so TypeScript compilation serves as the automated check.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Nutrición no visible en /clients/[id] | P45-SC1 | UI visual check | Abrir /clients/[id], verificar: no aparece botón "Asignar plan nutricional", no aparece card "Plan nutricional" en sidebar |
| Subrutas de nutrición no accesibles | P45-SC2 | No existen subrutas, ya cumplido por diseño | Confirmar que /clients/[id]/nutrition-* no retorna rutas accesibles |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
