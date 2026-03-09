---
status: complete
phase: 01-workout-session
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md
started: 2026-03-09T00:00:00Z
updated: 2026-03-09T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Start workout from routines
expected: Go to /routines, tap a routine plan, tap Start on a day. A new session is created and you land on /workout/[sessionId] with that day's exercises listed.
result: pass

### 2. Collision — active session redirects
expected: With a session already active (incomplete), tap Start on any routine day. Instead of creating a duplicate, you land on the existing /workout/[existingSessionId].
result: pass

### 3. Workout page — exercises and set logging
expected: On /workout/[sessionId], all exercises for the day are visible. Each exercise shows its sets with weight and reps inputs you can fill in and mark complete.
result: pass

### 4. Previous session hints
expected: On /workout/[sessionId], if you've done this day before, previous session's weights/reps appear as placeholder hints in the set inputs.
result: pass

### 5. Rest timer after completing a set
expected: After marking a set as complete, a rest timer appears (countdown).
result: pass

### 6. Finish workout
expected: Tapping the Finish button marks the session as complete and redirects you to /history.
result: pass

### 7. Active session banner links to workout page
expected: While a session is active, the banner at the top links to /workout/[sessionId] — tapping it takes you directly to the session page.
result: pass

### 8. Banner hides on workout page
expected: On /workout/[sessionId], the active session banner does NOT appear (no double banner).
result: pass

### 9. Today redirects to active session
expected: Go to /today while a session is active. Instead of the today page, you are immediately redirected to /workout/[sessionId].
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
