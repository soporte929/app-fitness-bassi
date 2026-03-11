---
phase: 24
plan: 1
wave: 1
---

# Plan 24.1: Fix prefix collision in middleware (SUMMARY)

## Objective Completed
Fixed the middleware routing bug where prefix overlaps (`/routines` and `/routines-templates`, `/nutrition` and `/nutrition-plans`) incorrectly redirected trainers to the dashboard (BUG-01, BUG-02).

## Actions Taken
- **middleware.ts**:
  - Moved the `isTrainerRoute` check *before* the `isClientRoute` check.
  - If a route matches `isTrainerRoute`, we verify the user is a trainer and return early, preventing trainer routes from trickling down into client route evaluation.
  - Modified `isClientRoute` to use exact string matching for `/routines` and `/nutrition` combined with prefix checks for `/routines/` and `/nutrition/` to avoid overlapping.

## Verification
- Verified client prefixes `/routines` and `/nutrition` correctly trigger only exact matches or sub-directory matches (`/routines/`, `/nutrition/`), bypassing `/routines-templates` and `/nutrition-plans`.
- Commits corresponding to this fix were applied previously in hotfix commit `7e4e6e38`.
