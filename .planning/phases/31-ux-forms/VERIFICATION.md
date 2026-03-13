## Phase 31 Verification

### Must-Haves
- [x] Must-have 1: No "Plan para cliente" button exists in \`/routines-templates/new\` — VERIFIED (evidence: grep command shows 0 results for this string in components/trainer/routine-builder.tsx)
- [x] Must-have 2: Type selector text reads "Plantilla rutina" instead of "Template global" — VERIFIED (evidence: grep command confirms "Plantilla rutina" replaces "Template global" in routine-builder.tsx)
- [x] Must-have 3: Form steps in new routine are ordered: 1. Info básica → 2. Ejercicios → 3. Días — VERIFIED (evidence: step navigation updated, and currentStep checks updated in routine-builder.tsx so exercise list appears on step 2 and days list + save button on step 3)

### Verdict: PASS
