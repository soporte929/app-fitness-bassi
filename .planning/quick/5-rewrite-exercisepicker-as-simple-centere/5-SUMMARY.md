# Quick Task 5 Summary: Rewrite ExercisePicker as simple centered modal for all viewports

**Date:** 2026-03-13
**Status:** Complete

## What was done

Rewrote `components/trainer/exercise-picker.tsx` replacing the bottom-sheet/responsive hybrid with a simple centered modal.

## Changes

**`components/trainer/exercise-picker.tsx`**
- Removed: `items-end`, `rounded-t-xl`, drag handle div, `translate-y-full`, `safe-area-inset-bottom`, all `min-[431px]:*` breakpoint classes, `scale-*` transition classes
- Outer container: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40` — rendered only when `open` is true (replaced transition with conditional render)
- Inner modal: `w-full max-w-md max-h-[80vh] rounded-xl flex flex-col min-h-0 bg-[var(--bg-surface)] border border-[var(--border)] shadow-2xl`
- All close triggers preserved: backdrop click, X button, Escape key, exercise selection
- Props, LIBRARY data, and filter logic unchanged
