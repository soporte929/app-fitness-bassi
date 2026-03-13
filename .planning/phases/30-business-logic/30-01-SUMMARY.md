---
phase: 30
plan: 1
wave: 1
---

# Summary 30.1: Remove Direct Routine-to-Client Assignment Flows

## What Was Done

### Task 1: Remove AssignRoutineButton from client detail page
- **Deleted** `app/(trainer)/clients/[id]/assign-routine-button.tsx` — orphaned file (no longer imported in page.tsx)
- Client detail page already only used `AssignPlanButton` (correct flow)
- Zero code changes needed in page.tsx itself

### Task 2: Remove direct routine-to-client assignment from TemplateCard and related components
- **Deleted** `components/trainer/assign-template-modal.tsx`
- **Deleted** `components/trainer/assign-template-button.tsx`
- **Cleaned** `components/trainer/template-card.tsx`:
  - Removed `AssignTemplateModal` import
  - Removed `RoutineClientOption` import
  - Removed `clients` prop from Props type
  - Removed `assignOpen` state
  - Removed "Asignar a cliente" button
  - Removed `<AssignTemplateModal>` JSX block
- **Cleaned** `app/(trainer)/routines-templates/page.tsx`:
  - Removed `RoutineClientOption` import
  - Removed `RawClientRow` type
  - Removed `clients` Supabase query (performance win — one fewer DB call per page load)
  - Removed `clients` mapping logic
  - Removed `clients` prop from `<TemplateCard>` JSX
- **Cleaned** `app/(trainer)/routines-templates/[planId]/page.tsx`:
  - Removed `AssignTemplateButton` import
  - Removed `<AssignTemplateButton>` JSX (kept clients query for RoutineBuilder)
- **Removed** `clonePlanToClientAction` from `app/(trainer)/routines-templates/actions.ts` (~97 lines of dead code)
- **Kept** `validateClientOwnership` — still used by `createPlanAction` and `updatePlanAction`
- **Kept** `RoutineClientOption` type in `types.ts` — still used by `routine-builder.tsx`, `[planId]/page.tsx`, `new/page.tsx`

## Commits
1. `feat(phase-30): remove AssignRoutineButton from client detail`
2. `feat(phase-30): remove direct routine-to-client assignment from TemplateCard and related components`

## Impact
- **3 files deleted**, 4 files modified, ~335 lines removed
- No new TypeScript errors
- `/routines-templates` page now loads faster (1 fewer Supabase query)
