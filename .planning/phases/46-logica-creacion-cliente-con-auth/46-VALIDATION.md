---
phase: 46
slug: logica-creacion-cliente-con-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 46 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — comportamiento Auth es manual-only (Supabase email flow) |
| **Config file** | none |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx next build` |
| **Estimated runtime** | ~30 seconds (TypeScript check) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 46-01-01 | 01 | 1 | SC-1: Auth user creado con inviteUserByEmail | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 46-01-02 | 01 | 1 | SC-2: Email automático enviado | manual | — | N/A | ⬜ pending |
| 46-01-03 | 01 | 1 | SC-3: Callback route para completar login | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/auth/callback/route.ts` — crear archivo antes de typecheck (referenciado en redirect URL)

*Nota: el framework de tests existente (TypeScript) ya cubre el type-check. Solo se necesita crear el archivo de callback.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cliente recibe email de invitación | SC-2 | Requiere Supabase email service y cuenta real | 1. Crear cliente desde trainer panel. 2. Verificar inbox del email introducido. 3. Comprobar enlace "Set password" en el email. |
| Cliente puede hacer login tras clic en enlace | SC-3 | Requiere flujo completo de browser + Supabase Auth | 1. Abrir enlace del email. 2. Establecer password. 3. Verificar redirect a /today. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
