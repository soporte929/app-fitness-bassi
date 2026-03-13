---
phase: 31
slug: ux-forms
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework detectado — verificación manual |
| **Config file** | none |
| **Quick run command** | Manual: navegar a `/routines-templates/new` en browser |
| **Full suite command** | Manual: revisar los 3 success criteria |
| **Estimated runtime** | ~2 minutos (inspección visual) |

---

## Sampling Rate

- **After every task commit:** Navegar a `/routines-templates/new` y verificar el criterio correspondiente
- **After every plan wave:** Verificar los 3 success criteria en secuencia
- **Before `/gsd:verify-work`:** Full suite debe estar verde (los 3 SC confirmados visualmente)
- **Max feedback latency:** ~120 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | SC-2: texto "Plantilla rutina" | smoke | Manual: Step 1 del form | ✅ | ⬜ pending |
| 31-01-02 | 01 | 1 | SC-1: sin botón "Plan para cliente" | smoke | Manual: Step 1 del form | ✅ | ⬜ pending |
| 31-01-03 | 01 | 1 | SC-3: orden pasos Info→Ejercicios→Días | smoke | Manual: navegar pasos con Siguiente | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

*No se requiere crear infraestructura de tests — cambios son puramente de texto y reordenamiento JSX.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No "Plan para cliente" button visible | SC-1 | No hay framework de tests E2E | Abrir `/routines-templates/new`, ir a Step 1, confirmar que solo existe el botón "Plantilla rutina" |
| Texto "Plantilla rutina" en selector | SC-2 | No hay framework de tests E2E | Abrir `/routines-templates/new`, ir a Step 1, verificar texto del selector de tipo |
| Pasos en orden Info→Ejercicios→Días | SC-3 | No hay framework de tests E2E | Abrir `/routines-templates/new`, hacer click en Siguiente varias veces y verificar el orden de las tabs y contenido |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
