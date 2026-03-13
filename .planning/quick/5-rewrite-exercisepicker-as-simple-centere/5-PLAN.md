---
title: "Rewrite ExercisePicker as simple centered modal for all viewports"
type: quick
---

## Tasks

### Task 1: Rewrite ExercisePicker modal layout

**File:** `components/trainer/exercise-picker.tsx`

**Action:** Replace bottom-sheet logic with simple centered modal:

- Outer container: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40` (only when open, else `pointer-events-none`)
- Inner modal: `w-full max-w-md max-h-[80vh] rounded-xl flex flex-col min-h-0 bg-[var(--bg-surface)] border border-[var(--border)] shadow-2xl`
- Remove: `items-end`, `rounded-t-xl`, drag handle div, `translate-y-full`, `safe-area-inset`, `min-[431px]:*` breakpoint classes, `scale-*` classes
- Keep: header (title + X), search bar, muscle filter chips (overflow-x-auto), scrollable exercise list (flex-1 overflow-y-auto)
- Keep: backdrop click closes, X button closes, Escape key closes, exercise selection closes
- Keep: all props, LIBRARY data, filter logic unchanged

**Verify:** No breakpoint classes remain; modal centers on all viewports.
