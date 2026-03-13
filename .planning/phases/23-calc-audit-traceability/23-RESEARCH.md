# Phase 23: CALC Audit + Traceability Cleanup - Research

**Researched:** 2026-03-11
**Domain:** Documentation audit, formula verification, requirements traceability
**Confidence:** HIGH

## Summary

Phase 23 is a pure documentation and traceability cleanup phase — no new code to write. The work is: (1) audit `lib/calculations/nutrition.ts` against CALC-01-05 requirements to mark the checkboxes, (2) verify PROG-01-03 checkboxes (already `[x]` in current REQUIREMENTS.md — see below), and (3) ensure V41-01-07 are correctly represented in REQUIREMENTS.md with descriptions and status.

The critical finding from direct inspection of the codebase is that REQUIREMENTS.md is already partially updated from a 2026-03-10 edit. PROG-01-03 are already marked `[x]`. V41-01-07 already appear in the traceability table. However, CALC-01-05 are still `[ ]` despite the functions existing and matching the specs. Phase 23's job is to close these remaining gaps.

The secondary finding is that V41-01-07 appear **only** in the traceability table — they have no named requirement definitions in REQUIREMENTS.md. The phase success criterion says the traceability table must include them with phases assigned (already done), but the V41 requirement descriptions themselves are only in ROADMAP.md Phase sections and `v4.1-MILESTONE-AUDIT.md`. The planner must decide whether to add a V41 requirements section or just confirm the traceability rows are correct.

**Primary recommendation:** This is a 3-task documentation phase. Task 1: verify `lib/calculations/nutrition.ts` formula by formula against CALC-01-05 specs and mark checkboxes. Task 2: confirm PROG-01-03 state (already done, just verify). Task 3: add V41 requirement descriptions to REQUIREMENTS.md and update coverage count.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALC-01 | El sistema calcula TMB con Katch-McArdle (`370 + 21.6×FFM`) cuando hay % grasa disponible | `calculateTMB()` in `lib/calculations/nutrition.ts` line 147-157: `if (input.fatPercent !== undefined) { const ffm = input.weightKg * (1 - input.fatPercent / 100); return Math.round(370 + 21.6 * ffm); }` — MATCHES SPEC exactly |
| CALC-02 | El sistema calcula TMB con Mifflin-St Jeor cuando no hay % grasa | `calculateTMB()` else branch lines 153-157: `10 * weightKg + 6.25 * heightCm - 5 * age` with +5 male / -161 female — MATCHES standard Mifflin-St Jeor |
| CALC-03 | El sistema calcula TDEE = TMB × factor actividad (1.2 / 1.375 / 1.55 / 1.725 / 1.9) | `calculateTDEE()` line 164: `Math.round(tmb * ACTIVITY_FACTORS[activityLevel])`. `ACTIVITY_FACTORS` at lines 13-19: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very_active=1.9 — MATCHES all 5 multipliers |
| CALC-04 | El sistema calcula calorías objetivo: déficit ×0.85, mantenimiento ×1.0, volumen ×1.075 | `calculateTargetCalories()` line 182: `Math.round(tdee * GOAL_FACTORS[phase])`. `GOAL_FACTORS` lines 169-174: deficit=0.85, maintenance=1.0, recomposition=1.0, volume=1.075 — MATCHES all three values |
| CALC-05 | El sistema distribuye macros según fase (proteínas por peso: déficit 2.2g/kg, recomposición 2.0g/kg, volumen 1.8g/kg; grasas: déficit 0.8g/kg, recomposición 0.9g/kg, volumen 1.0g/kg; carbos del resto) | `calculateMacros()` lines 208-225. `PROTEIN_FACTORS`: deficit=2.2, recomposition=2.0, volume=1.8. `FAT_FACTORS`: deficit=0.8, recomposition=0.9, volume=1.0. Carbos = (targetCalories - proteinKcal - fatKcal) / 4 — MATCHES all per-phase values |
| PROG-01 | El cliente puede registrar su peso actual desde la página `/progress` | Already marked `[x]` in REQUIREMENTS.md line 45. Phase 12 VERIFICATION.md PASS: `LogWeightModal` calling server action verified |
| PROG-02 | El peso objetivo del cliente aparece como línea de referencia en la gráfica de peso | Already marked `[x]` in REQUIREMENTS.md line 46. Phase 12 VERIFICATION.md PASS: `ReferenceLine` from recharts verified |
| PROG-03 | El cliente puede registrar medidas corporales (cintura, cadera, pecho, brazo, muslo) desde `/progress` | Already marked `[x]` in REQUIREMENTS.md line 47. Phase 12 VERIFICATION.md PASS: `LogMeasurementsModal.tsx` verified |
</phase_requirements>

## Standard Stack

No new libraries needed. This phase touches only markdown files and TypeScript source for read-only audit.

### Core
| Tool | Purpose | Why |
|------|---------|-----|
| Read tool / Grep | Inspect `lib/calculations/nutrition.ts` formula implementations | Source of truth for CALC-01-05 |
| REQUIREMENTS.md editor | Update `[ ]` to `[x]` for CALC-01-05, add V41 descriptions | Phase output |

### No Installation Needed
This phase has zero npm installs — it is documentation-only.

## Architecture Patterns

### Pattern 1: Formula Audit → Checkbox Update
**What:** Read each CALC requirement spec, cross-reference with the actual function in `lib/calculations/nutrition.ts`, confirm match, then update `[ ]` to `[x]` in REQUIREMENTS.md.
**When to use:** All CALC-01-05 tasks.

The formula file has two sections:
- Lines 1-119: Original Cunningham/Tinsley formulas (legacy `calculateNutrition()` — NOT relevant to CALC-01-05)
- Lines 121-226: v4.0 functions — `calculateTMB()`, `calculateTDEE()`, `calculateTargetCalories()`, `calculateMacros()` — THESE are the CALC-01-05 implementations

### Pattern 2: V41 Requirement Documentation
**What:** V41-01-07 requirements exist in ROADMAP.md Phase sections and `v4.1-MILESTONE-AUDIT.md` but are NOT listed as named requirements in REQUIREMENTS.md. They appear only in the traceability table.
**Decision for planner:** Add a "v4.1 Requirements (V41)" section to REQUIREMENTS.md with checkbox definitions, OR just confirm traceability rows are sufficient.

The `v4.1-MILESTONE-AUDIT.md` defines them explicitly:
| ID | Description |
|----|-------------|
| V41-01 | "FITNESS BASSI" in Anton font in trainer sidebar |
| V41-02 | Dashboard chart margins fixed (no clipping) |
| V41-03 | next-themes ThemeProvider, ThemeToggle for client + trainer |
| V41-04 | Profile photo upload to Supabase Storage |
| V41-05 | Daily nutrition checklist interactive |
| V41-06 | "Asignar plan nutricional" modal in client detail |
| V41-07 | Settings Hub /settings + sidebar entry |

### Pattern 3: Coverage Count Update
Current coverage block in REQUIREMENTS.md (line 155-158):
```
- v4 requirements: 31 total (v4.0) + 7 total (v4.1) = 38 total
- Mapped to phases: 38/38 (100%)
- Unmapped: 0
```
After marking CALC-01-05 as `[x]`, the count of completed requirements increases. If V41 descriptions are added as named requirements, the total count remains 38 (they're already counted). The `Last updated` timestamp on line 162 must also be refreshed.

### Anti-Patterns to Avoid
- **Do not re-examine formulas using stale training knowledge.** The code speaks for itself — read `lib/calculations/nutrition.ts` directly and compare to the requirement spec strings in REQUIREMENTS.md. Do not rely on memory of what "Katch-McArdle" should be.
- **Do not mark CALC-01-05 as `[x]` without quoting the actual code.** The VERIFICATION.md (or PLAN SUMMARY) should include the exact line references.
- **Do not change the PROG-01-03 checkboxes** — they are already `[x]` in the current file (confirmed at lines 45-47). The phase description said "fix stale checkboxes" but the 2026-03-10 edit already fixed them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Verifying formula correctness | Custom test harness | Read the source file directly, compare coefficient values to requirement spec |
| Updating checkboxes | Script/automation | Manual Edit tool — only 5 lines to change |

## Common Pitfalls

### Pitfall 1: Confusing the two formula sets in nutrition.ts
**What goes wrong:** The file has TWO formula implementations. Lines 52-117 implement the legacy Cunningham/Tinsley approach for `calculateNutrition()`. Lines 147-226 implement the v4.0 functions (`calculateTMB`, `calculateTDEE`, `calculateTargetCalories`, `calculateMacros`). CALC-01-05 map ONLY to the v4.0 section.
**Why it happens:** Reading the file from the top, the Cunningham/Tinsley functions come first and use different coefficients.
**How to avoid:** Start reading at line 121 (the `// Módulo v4.0` comment).
**Warning signs:** If audit finds "370 + 21.6" but also sees "500 + 22" — the second is legacy Cunningham, not relevant to CALC-01.

### Pitfall 2: Assuming PROG-01-03 checkboxes are stale
**What goes wrong:** Phase description says "fix stale PROG checkboxes" but the 2026-03-10 edit already corrected them. Applying a fix to already-correct state wastes time or introduces noise.
**How to avoid:** Check REQUIREMENTS.md lines 45-47 first. All three show `[x]`. Verify only — do not re-edit.

### Pitfall 3: Treating V41 rows as missing from traceability
**What goes wrong:** The phase success criterion says "traceability table includes V41-01 to V41-07" but they ARE already there (lines 146-152). The actual gap is that V41 requirements have no named definitions in the requirements body.
**How to avoid:** Read REQUIREMENTS.md completely before planning. The traceability table work is already done — the gap is the requirement descriptions section.

### Pitfall 4: Forgetting the coverage count and last-updated timestamp
**What goes wrong:** CALC-01-05 get marked `[x]` but the "Coverage" block and `Last updated` line are not refreshed, leaving stale metadata.
**How to avoid:** Make updating lines 154-162 a mandatory final step in the plan.

## Code Examples

### CALC-01 Implementation (verified from source)
```typescript
// lib/calculations/nutrition.ts, lines 147-157
export function calculateTMB(input: TMBInput): number {
  if (input.fatPercent !== undefined) {
    // Katch-McArdle: 370 + 21.6 × FFM
    const ffm = input.weightKg * (1 - input.fatPercent / 100);
    return Math.round(370 + 21.6 * ffm);
  } else {
    // Mifflin-St Jeor
    const { weightKg, heightCm = 170, age = 30, sex = "male" } = input;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }
}
```

### CALC-03 Implementation (verified from source)
```typescript
// lib/calculations/nutrition.ts, lines 13-19 + 164-166
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(tmb: number, activityLevel: ActivityLevel): number {
  return Math.round(tmb * ACTIVITY_FACTORS[activityLevel]);
}
```

### CALC-04 Implementation (verified from source)
```typescript
// lib/calculations/nutrition.ts, lines 169-184
const GOAL_FACTORS: Record<NutritionPhase, number> = {
  deficit: 0.85,
  maintenance: 1.0,
  recomposition: 1.0,
  volume: 1.075,
};

export function calculateTargetCalories(tdee: number, phase: NutritionPhase): number {
  return Math.round(tdee * GOAL_FACTORS[phase]);
}
```

### CALC-05 Implementation (verified from source)
```typescript
// lib/calculations/nutrition.ts, lines 187-225
const PROTEIN_FACTORS: Record<NutritionPhase, number> = {
  deficit: 2.2, recomposition: 2.0, volume: 1.8, maintenance: 2.0,
};
const FAT_FACTORS: Record<NutritionPhase, number> = {
  deficit: 0.8, recomposition: 0.9, volume: 1.0, maintenance: 0.9,
};

export function calculateMacros(
  weightKg: number, phase: NutritionPhase, targetCalories: number
): MacrosResult {
  const proteinG = Math.round(PROTEIN_FACTORS[phase] * weightKg);
  const fatG = Math.round(FAT_FACTORS[phase] * weightKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);
  return { protein: { g: proteinG, kcal: proteinKcal }, fat: { g: fatG, kcal: fatKcal }, carbs: { g: carbsG, kcal: carbsKcal } };
}
```

## Audit Findings Summary

| Requirement | Code Location | Match? | Action Needed |
|-------------|--------------|--------|---------------|
| CALC-01 (Katch-McArdle: 370 + 21.6×FFM) | `calculateTMB()` line 149-151 | YES | Mark `[x]` |
| CALC-02 (Mifflin-St Jeor fallback) | `calculateTMB()` line 153-157 | YES | Mark `[x]` |
| CALC-03 (TDEE = TMB × 1.2/1.375/1.55/1.725/1.9) | `calculateTDEE()` + `ACTIVITY_FACTORS` | YES | Mark `[x]` |
| CALC-04 (target kcal: ×0.85/×1.0/×1.075) | `calculateTargetCalories()` + `GOAL_FACTORS` | YES | Mark `[x]` |
| CALC-05 (macros per phase, correct g/kg) | `calculateMacros()` + `PROTEIN_FACTORS`/`FAT_FACTORS` | YES | Mark `[x]` |
| PROG-01 | Phase 12 VERIFICATION.md PASS | YES | Already `[x]` — no action |
| PROG-02 | Phase 12 VERIFICATION.md PASS | YES | Already `[x]` — no action |
| PROG-03 | Phase 12 VERIFICATION.md PASS | YES | Already `[x]` — no action |

**CALC-01 coefficient discrepancy to note:** The REQUIREMENTS.md spec says `370 + 21.6×FFM`. The code has `370 + 21.6 * ffm`. These match. The legacy `calculateNutrition()` uses Cunningham `500 + 22 * ffm` — different formula, different function, NOT what CALC-01 refers to.

## Plan Structure Recommendation

This phase needs exactly 2 plans (or 1 consolidated plan):

**Option A — Single plan (recommended):**
- Wave 1: Audit `lib/calculations/nutrition.ts` CALC-01-05 → mark checkboxes `[x]`
- Wave 2: Add V41 requirement definitions to REQUIREMENTS.md body section + update coverage count

**Option B — Two plans:**
- Plan 23-01: CALC-01-05 checkbox update (code audit + REQUIREMENTS.md edit)
- Plan 23-02: V41 definitions + coverage count + `Last updated` refresh

Either structure works. Option A is faster (one commit, minimal coordination).

## Open Questions

1. **Should V41 requirements get a named definitions section in REQUIREMENTS.md?**
   - What we know: They exist in traceability table but have no `- [x] **V41-01**: ...` definition lines in the body
   - What's unclear: Phase success criterion only says "traceability table includes V41-01 to V41-07 with their phases" — already done. Adding definitions is extra.
   - Recommendation: Add a brief "v4.1 Requirements (V41)" section with `[x]` definitions since V41-01-03 show "Pending" in traceability (Phase 21 completed them) — updating those statuses to "Complete" and adding descriptions improves audit integrity

2. **V41-01-03 status in traceability is "Pending" — should it change to "Complete"?**
   - What we know: Phase 21 (Retroactive Verification for phases 10, 10.1, 16, 17) is marked Complete in ROADMAP.md (committed 2026-03-10). Phase 16 covers V41-01/02, Phase 17 covers V41-03.
   - Recommendation: Update V41-01, V41-02, V41-03 traceability status to "Complete" in REQUIREMENTS.md as part of this phase.

## Sources

### Primary (HIGH confidence)
- Direct read of `/lib/calculations/nutrition.ts` (226 lines) — formula coefficients confirmed line-by-line
- Direct read of `.planning/REQUIREMENTS.md` — current checkbox state confirmed
- Direct read of `.planning/phases/12-progress-logging/12-VERIFICATION.md` — PROG-01-03 PASS confirmed
- `.planning/v4.1-MILESTONE-AUDIT.md` — V41-01-07 definitions and status

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` Phase 23 success criteria — defines what this phase must produce
- `.planning/STATE.md` — confirms Phase 12 complete and PROG requirements implemented

## Metadata

**Confidence breakdown:**
- Formula audit (CALC-01-05): HIGH — code read directly, coefficients verified
- PROG checkbox state: HIGH — REQUIREMENTS.md and VERIFICATION.md both read directly
- V41 traceability state: HIGH — REQUIREMENTS.md and AUDIT.md both read directly
- Plan structure: HIGH — pure documentation phase, no ambiguous technical decisions

**Research date:** 2026-03-11
**Valid until:** This research does not expire — it describes static file contents.
