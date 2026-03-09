# Testing Patterns

**Analysis Date:** 2025-03-09

## Test Framework

**Status:** No testing framework installed or configured

**Observation:**
- `package.json` contains no test runner (Jest, Vitest, etc.)
- No test configuration files present (jest.config.*, vitest.config.*)
- No test files exist in application source (only in node_modules/)
- ESLint is configured but no testing libraries are installed

**Run Commands:**
```bash
npm run lint              # Run ESLint (type checking via TypeScript)
npm run build             # Build to verify no TS errors
npm run dev               # Development server
```

## Test File Organization

**Location:** Not applicable — no tests exist yet

**Recommended Pattern (for future implementation):**
- Place tests co-located with source files
- Naming: `[filename].test.ts` or `[filename].spec.ts`
- Example: `app/(client)/today/actions.test.ts` alongside `app/(client)/today/actions.ts`

**Directory Structure for Tests:**
```
app/
├── (client)/
│   ├── today/
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── actions.test.ts          # Tests for server actions
│   └── ...
lib/
├── calculations/
│   ├── nutrition.ts
│   └── nutrition.test.ts            # Tests for utility functions
└── ...
```

## Testing Strategy (Recommended)

Since no test framework exists yet, here's the recommended approach:

**Unit Tests Should Cover:**
- Server Actions: `saveSetLog()`, `finishWorkout()`, `updateClientAction()`, `createClientAction()`, `deleteClientAction()`
- Utility functions: `calculateNutrition()`, `calcStreak()`, `phaseToGoal()`, `objectiveToGoal()`
- Data transformation helpers (column filtering, type casting)

**Integration Tests Should Cover:**
- Server Components with Supabase queries (e.g., `app/(client)/today/page.tsx`, `app/(trainer)/clients/page.tsx`)
- Client Components with state management (e.g., `ExerciseCard`, `ClientsListUI`)
- Server Action + Database interactions (FK relationships, RLS policies)

**E2E Tests Should Cover:**
- Complete workout flow: start session → add sets → finish workout → redirect
- Client creation flow: create user → create profile → create client record
- Role-based routing (trainer/client access control via middleware)

## Current Code Patterns (for reference)

### Server Action Pattern (already testable):
```typescript
// app/(client)/today/actions.ts
export async function saveSetLog({
  sessionId,
  exerciseId,
  setNumber,
  weightKg,
  reps,
  rir,
  completed = true,
}: {
  sessionId: string
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rir: number
  completed?: boolean
}): Promise<{ success: boolean }>
```

**What to test:**
- Successful upsert returns `{ success: true }`
- Handles missing session gracefully
- Validates numeric inputs
- Conflicts properly handled with `onConflict` clause

### Utility Function Pattern (already testable):
```typescript
// app/(client)/today/page.tsx
function calcStreak(sessions: { started_at: string }[]): number {
  if (sessions.length === 0) return 0
  const dates = new Set(sessions.map((s) => s.started_at.substring(0, 10)))
  // ... logic to count consecutive days
  return streak
}
```

**What to test:**
- Empty array returns 0
- Single session returns 1
- Consecutive days counted correctly
- Gap in dates breaks streak

### Client Component State Pattern (testable with React Testing Library):
```typescript
// components/client/exercise-card.tsx
export function ExerciseCard({
  exercise,
  sessionId,
  lastSetLogs = [],
  onSetCountChange,
}: { ... })
```

**What to test:**
- Initial sets populated from `exercise.set_logs`
- Weight/reps/rir inputs update state
- Completing a set marks it as done
- `onSetCountChange` callback fires when `completedSets` changes
- Re-saving completed sets triggers `saveSetLog()`

## Recommended Testing Setup (Future)

**1. Install Testing Dependencies:**
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev msw                    # For mocking Supabase
```

**2. Create vitest config:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**3. Create test setup file:**
```typescript
// tests/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})
```

**4. Add to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Example Test Patterns (Template)

### Server Action Test:
```typescript
// app/(client)/today/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveSetLog } from './actions'
import * as supabaseServer from '@/lib/supabase/server'

describe('saveSetLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upsert a set log with valid params', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        upsert: mockUpsert,
      }),
    } as any)

    const result = await saveSetLog({
      sessionId: 'session-1',
      exerciseId: 'ex-1',
      setNumber: 1,
      weightKg: 50,
      reps: 10,
      rir: 2,
    })

    expect(result.success).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: 'session-1',
        weight_kg: 50,
        reps: 10,
      }),
      expect.any(Object)
    )
  })

  it('should return success: false on database error', async () => {
    const mockError = new Error('Database error')
    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    } as any)

    const result = await saveSetLog({
      sessionId: 'session-1',
      exerciseId: 'ex-1',
      setNumber: 1,
      weightKg: 50,
      reps: 10,
      rir: 2,
    })

    expect(result.success).toBe(false)
  })
})
```

### Utility Function Test:
```typescript
// lib/calculations/nutrition.test.ts
import { describe, it, expect } from 'vitest'
import { calculateNutrition } from './nutrition'

describe('calculateNutrition', () => {
  it('should calculate correct macros for deficit goal', () => {
    const result = calculateNutrition({
      weightKg: 80,
      bodyFatPct: 25,
      activityLevel: 'moderate',
      dailySteps: 7000,
      goal: 'deficit',
    })

    expect(result.targetCalories).toBeLessThan(result.get)
    expect(result.macros.protein.g).toBeGreaterThan(0)
    expect(result.macros.fat.g).toBeGreaterThan(0)
    expect(result.macros.carbs.g).toBeGreaterThan(0)
  })

  it('should add steps bonus for steps > 5000', () => {
    const result1 = calculateNutrition({
      weightKg: 80,
      bodyFatPct: 25,
      activityLevel: 'sedentary',
      dailySteps: 5000,
      goal: 'maintenance',
    })

    const result2 = calculateNutrition({
      weightKg: 80,
      bodyFatPct: 25,
      activityLevel: 'sedentary',
      dailySteps: 8000,
      goal: 'maintenance',
    })

    expect(result2.stepsBonus).toBeGreaterThan(result1.stepsBonus)
  })
})
```

### Client Component Test (with MSW):
```typescript
// components/client/exercise-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExerciseCard } from './exercise-card'
import type { ExerciseWithSets } from './exercise-card'

describe('ExerciseCard', () => {
  const mockExercise: ExerciseWithSets = {
    id: 'ex-1',
    name: 'Bench Press',
    muscle_group: 'Chest',
    target_sets: 3,
    target_reps: 10,
    target_rir: 2,
    set_logs: [],
  }

  it('should render exercise name and muscle group', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        sessionId="session-1"
      />
    )

    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText(/Chest/)).toBeInTheDocument()
  })

  it('should show correct number of set rows', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        sessionId="session-1"
      />
    )

    // Should have 3 rows for 3 target sets
    const setNumbers = screen.getAllByRole('textbox', { hidden: true })
    expect(setNumbers.length).toBe(9) // 3 sets × 3 inputs (weight, reps, rir)
  })

  it('should call onSetCountChange when sets completed', async () => {
    const onSetCountChange = vi.fn()
    render(
      <ExerciseCard
        exercise={mockExercise}
        sessionId="session-1"
        onSetCountChange={onSetCountChange}
      />
    )

    // Simulate completing first set
    const completeButtons = screen.getAllByRole('button')
    fireEvent.click(completeButtons[0])

    await waitFor(() => {
      expect(onSetCountChange).toHaveBeenCalledWith('ex-1', 1)
    })
  })
})
```

## Mocking Patterns

**Supabase Client (Server Actions):**
```typescript
import * as supabaseServer from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// In test:
vi.mocked(supabaseServer.createClient).mockResolvedValue({
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    }),
  }),
} as any)
```

**Next.js Navigation:**
```typescript
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))
```

## Coverage Goals (Recommended)

- **Statements:** 80%+ for critical paths (server actions, calculations)
- **Branches:** 70%+ (especially error handling)
- **Functions:** 85%+ (all exported functions should have at least one test)
- **Lines:** 80%+

**Critical areas to prioritize:**
1. `app/*/actions.ts` — All server actions (100% coverage)
2. `lib/calculations/nutrition.ts` — Utility functions (90%+ coverage)
3. `lib/alerts.ts` — Alert logic (100% coverage)
4. `components/client/exercise-card.tsx` — Complex state management (80%+)
5. `middleware.ts` — Role-based routing (100% coverage)

---

*Testing analysis: 2025-03-09*
