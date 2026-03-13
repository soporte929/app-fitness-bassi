---
phase: 47
slug: ajustes-cliente-desactivar-opciones-no-funcionales
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 47 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No hay framework de tests configurado en el proyecto |
| **Config file** | ninguno |
| **Quick run command** | N/A — verificación manual |
| **Full suite command** | N/A — verificación manual |
| **Estimated runtime** | ~2 minutos (manual) |

---

## Sampling Rate

- **After every task commit:** Verificar en navegador que /profile muestra items disabled correctamente
- **After every plan wave:** Verificar que EditProfileForm y LogoutButton siguen funcionando
- **Before `/gsd:verify-work`:** Confirmación visual completa de los 5 items deshabilitados
- **Max feedback latency:** ~2 minutos (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 47-01-01 | 01 | 1 | P47-01 | manual | N/A | ✅ | ⬜ pending |
| 47-01-02 | 01 | 1 | P47-02 | manual | N/A | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

*No hay framework de tests — verificación manual. No se requieren stubs ni fixtures.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Items disabled visibles con opacity reducida y sin ChevronRight | P47-01 | No hay test framework; es validación visual | Abrir /profile como cliente, confirmar que "Datos personales", "Notificaciones", "Unidades de medida", "Mis revisiones" y "Privacidad" aparecen con opacity-40 y sin flecha |
| Items no navegables (no son Links) | P47-01 | Validación de comportamiento de click | Intentar hacer click en los 5 items — no deben navegar a ninguna ruta |
| Código de items conservado en el array | P47-02 | Code review — no es testeable en runtime | Revisar page.tsx: los 5 items siguen en settingsSections con disabled: true |
| EditProfileForm sigue funcionando | P47-01 | Regresión funcional | Editar nombre en el formulario, confirmar que guarda sin errores |
| LogoutButton sigue funcionando | P47-01 | Regresión funcional | Hacer click en Cerrar sesión, confirmar que redirige a /login |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
