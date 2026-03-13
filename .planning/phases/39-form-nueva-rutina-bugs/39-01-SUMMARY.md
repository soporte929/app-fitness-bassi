# Plan 39.1: Fix state drops in RoutineBuilder wizard

## Completed Tasks
1. **Change conditional rendering to CSS display**: 
   - Modified `components/trainer/routine-builder.tsx` to stop unmounting step contents on step change.
   - Wrapped Step 1 in `<div className={currentStep === 1 ? 'space-y-4 block' : 'hidden'}>`.
   - Wrapped Step 2 in `<div className={currentStep === 2 && !structureLocked ? 'space-y-4 block' : 'hidden'}>`.
   - Wrapped Step 3 in `<div className={currentStep === 3 && !structureLocked ? 'space-y-4 block' : 'hidden'}>`.
   - Removed conditional `{currentStep === X && (...) }` rendering which unmounted components.

## Verification
- Modified `.tsx` is structurally sound. Type checker showed some external issues, but `routine-builder.tsx` has no syntax or typing errors.
- DOM states (like `expanded` in `ExerciseRow` or active cursors in inputs) are safely preserved when users navigate back and forth between Info básica, Ejercicios, and Días.
