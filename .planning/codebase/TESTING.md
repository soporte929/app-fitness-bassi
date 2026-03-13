# Testing Patterns

**Analysis Date:** 2025-03-10

## Test Framework

**Runner:**
- No test runner currently configured (Jest, Vitest, or similar not installed)
- No test files in codebase (only dev dependencies via ESLint)

**Assertion Library:**
- Not detected — no testing framework in use

**Run Commands:**
```bash
npm run lint              # ESLint — type checking and code style
npm run build             # Next.js build — catches TS errors
npm run dev               # Development server with hot reload
```

## Test File Organization

**Location:**
- No test files currently exist in application code
- No `__tests__` directories or `.test.ts`/`.spec.ts` files created yet

**Recommended Pattern for Future:**
- Co-located tests: `src/utils/calculation.ts` → `src/utils/calculation.test.ts`
- Or: `src/__tests__/calculation.test.ts`
- Page tests: `app/(client)/today/page.test.tsx`
- Action tests: `app/(client)/today/actions.test.ts`

**Naming:**
- Use `.test.ts` suffix (not `.spec.ts`)

**Structure:**
```
lib/
├── calculations/
│   ├── nutrition.ts
│   └── nutrition.test.ts          # Would test calculateNutrition()
├── alerts.ts
└── alerts.test.ts                 # Would test computeAlerts()

components/
├── client/
│   ├── exercise-card.tsx
│   └── exercise-card.test.tsx     # Would test component + interactions

app/
├── (client)/
│   ├── today/
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── actions.test.ts        # Would test Server Actions
```

## Testing Strategy

**Current State:** Manual testing only
- ESLint catches type errors and style violations
- TypeScript strict mode (`strict: true`) prevents entire categories of bugs
- Next.js build validates all pages render without errors

**Priority Areas for Future Tests:**

### Unit Tests (should be added first)

**Calculations (`lib/calculations/nutrition.ts`):**
```typescript
// Would test: calculateNutrition()
// Inputs: weight_kg, body_fat_pct, activity_level, goal
// Expected: correct FFM, TMB, GET, macro ratios

describe('calculateNutrition', () => {
  it('should calculate FFM correctly', () => {
    const result = calculateNutrition({
      weightKg: 80,
      bodyFatPct: 20,
      activityLevel: 'moderate',
      goal: 'maintenance'
    })
    expect(result.ffm).toBe(64) // 80 * (1 - 0.20)
  })

  it('should apply goal adjustments', () => {
    // deficit: -400 kcal
    // surplus: +300 kcal
    // maintenance: 0
  })
})
```

**Alerts (`lib/alerts.ts`):**
```typescript
// Would test: computeAlerts()
// Inputs: client data, session history, nutrition logs
// Expected: correct alerts based on thresholds
```

### Integration Tests (Server Actions)

**Actions (`app/(client)/today/actions.ts`):**
```typescript
// Would test: saveSetLog()
// - Correctly upserts to database
// - Handles duplicate key conflicts
// - Returns success/failure

// Would test: finishWorkout()
// - Updates completed status
// - Sets finished_at timestamp
// - Redirects to /history on success
```

**Actions (`app/(trainer)/clients/actions.ts`):**
```typescript
// Would test: updateClientAction()
// - Security: only trainer can update own clients
// - Data validation: weight_kg, body_fat_pct in valid ranges
// - Cache invalidation: revalidatePath called

// Would test: createClientAction()
// - Auth user creation flow
// - Rollback on profile/client insert failure
// - Error messages returned to caller

// Would test: deleteClientAction()
// - Sets active = false (soft delete)
// - Security: trainer_id check
```

### Component Tests (interactive)

**ExerciseCard (`components/client/exercise-card.tsx`):**
```typescript
// Would test:
// - Renders all target sets
// - Weight/reps inputs accept user input
// - Toggling "done" calls saveSetLog with correct params
// - PR badge shows when volume exceeds prBestVolume
// - Set completion triggers custom event for rest timer
```

### E2E Tests (not currently used)

- Recommended: Playwright or Cypress for full user flows
- Example: "Trainer creates client → Assigns plan → Client completes workout"

## Mocking Strategy

**Framework:** Would use Jest/Vitest with mocking utilities

**What to Mock:**
- Supabase client: Mock `createClient()`, `.from()`, `.select()`, `.update()`, `.insert()`
- Next.js functions: Mock `redirect()`, `notFound()`, `revalidatePath()`
- External APIs: Anthropic SDK for plan generation (when used)

**What NOT to Mock:**
- Business logic in `lib/calculations/nutrition.ts` — test directly
- Type utilities — test actual types
- Component rendering — test real component (use Testing Library)

**Mock Pattern Example:**
```typescript
// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } }
      })
    },
    from: jest.fn((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'client-1', weight_kg: 80 }
      })
    }))
  }))
}))
```

## Fixtures and Factories

**Test Data:**
```typescript
// Would create: __fixtures__/test-data.ts

export const mockClient = {
  id: 'client-1',
  profile_id: 'profile-1',
  trainer_id: 'trainer-1',
  weight_kg: 80,
  body_fat_pct: 20,
  phase: 'deficit' as const,
  goal: 'deficit' as const,
  age: 30,
  height_cm: 180,
  lifestyle: 'moderate' as const,
  training_days: 4 as const,
  activity_level: 'moderate' as const,
  daily_steps: 8000,
  joined_date: '2024-01-01'
}

export const mockExercise = {
  id: 'ex-1',
  name: 'Barbell Squat',
  muscle_group: 'Legs',
  target_sets: 3,
  target_reps: 8,
  target_rir: 2,
  order_index: 1
}
```

**Location:**
- `__fixtures__/test-data.ts` or `__mocks__/data.ts`
- Import in test files as needed

## Coverage

**Requirements:** Not enforced; no coverage targets

**When added, recommended targets:**
- `lib/calculations/nutrition.ts`: 95%+ (critical business logic)
- `lib/alerts.ts`: 90%+ (alert logic)
- Server Actions: 85%+ (key integration points)
- Components: 70%+ (UI rendering, less critical)

**View Coverage (when test suite added):**
```bash
npm test -- --coverage
```

## Test Types by Module

### Unit Tests

**Calculations:**
- `lib/calculations/nutrition.ts` — `calculateNutrition()`
  - Test FFM calculation
  - Test TMB (Cunningham vs Tinsley)
  - Test macro ratios
  - Test goal adjustments (deficit, maintenance, surplus)
  - Test step bonus calculations
  - Edge cases: 0% body fat, extreme weights, activity levels

**Alerts:**
- `lib/alerts.ts` — `computeAlerts()`
  - Test threshold-based alerts
  - Test status color logic (green, yellow, red)
  - Test missing data handling

### Integration Tests

**Server Actions (`app/(client)/today/actions.ts`):**
```typescript
describe('saveSetLog', () => {
  it('upserts set log correctly', async () => {
    const result = await saveSetLog({
      sessionId: 'session-1',
      exerciseId: 'ex-1',
      setNumber: 1,
      weightKg: 100,
      reps: 8,
      rir: 2,
      completed: true
    })
    expect(result.success).toBe(true)
  })

  it('handles upsert conflict on duplicate key', async () => {
    // Insert twice with same (session_id, exercise_id, set_number)
    // Should update, not error
  })
})

describe('finishWorkout', () => {
  it('marks session as completed and sets finished_at', async () => {
    // Mock: supabase.from('workout_sessions').update()
    // Verify: completed=true, finished_at set
    // Verify: redirect('/history') called
  })
})
```

**Server Actions (`app/(trainer)/clients/actions.ts`):**
```typescript
describe('updateClientAction', () => {
  it('only allows trainer to update own clients', async () => {
    // Security test: non-owning trainer should get 403
    // Verify: RLS policy or app-level check works
  })

  it('revalidates cache on update', async () => {
    // Mock: revalidatePath()
    // Verify: called with correct paths
  })
})

describe('createClientAction', () => {
  it('creates auth user, profile, and client record', async () => {
    // Verify 3-step flow: auth.createUser → profile.upsert → client.insert
  })

  it('rolls back auth user if profile fails', async () => {
    // Mock profile error
    // Verify: admin.auth.admin.deleteUser called
  })

  it('validates unique email', async () => {
    // Insert client with email X
    // Try to insert another with same email
    // Should return error: "Ya existe..."
  })
})
```

### Component Tests (React Testing Library)

**ExerciseCard (`components/client/exercise-card.tsx`):**
```typescript
describe('ExerciseCard', () => {
  it('renders all target sets', () => {
    const exercise = {
      id: 'ex-1',
      name: 'Squat',
      muscle_group: 'Legs',
      target_sets: 3,
      target_reps: 8,
      target_rir: 2,
      set_logs: []
    }
    const { getByText } = render(
      <ExerciseCard exercise={exercise} sessionId="session-1" />
    )
    expect(getByText(/3 sets/)).toBeInTheDocument()
  })

  it('calls saveSetLog on set toggle', async () => {
    const mockSaveSetLog = jest.fn().mockResolvedValue({ success: true })
    // ... render with mocked saveSetLog
    const checkboxes = screen.getAllByRole('button', { name: /✓/ })
    await userEvent.click(checkboxes[0])
    expect(mockSaveSetLog).toHaveBeenCalledWith({
      sessionId: 'session-1',
      exerciseId: 'ex-1',
      setNumber: 1,
      weightKg: expect.any(Number),
      reps: expect.any(Number),
      rir: expect.any(Number),
      completed: true
    })
  })

  it('shows PR badge when prBestVolume exceeded', () => {
    const exercise = {
      ...baseExercise,
      prBestVolume: 200, // 50kg × 4 reps
      set_logs: [{ set_number: 1, weight_kg: 55, reps: 4 }] // 220 kg
    }
    const { getByText } = render(
      <ExerciseCard exercise={exercise} sessionId="session-1" />
    )
    expect(getByText(/PR/)).toBeInTheDocument()
  })
})
```

## Known Testing Gaps

**Untested Areas (High Priority):**
1. **Supabase queries** — No integration tests for actual Supabase calls
   - Risk: Silent failures if schema changes
   - Solution: Add integration test suite against test Supabase instance

2. **Authentication flow** — Middleware role-based routing not tested
   - Risk: Trainer can access client routes or vice versa
   - Solution: E2E tests for auth state transitions

3. **Nutrition calculations** — Complex logic untested
   - Risk: Incorrect macro recommendations
   - Solution: Unit tests with edge cases (0% fat, extreme weights)

4. **Alert thresholds** — computeAlerts() not tested
   - Risk: Alerts fail to trigger at correct thresholds
   - Solution: Unit tests for each alert condition

5. **Error handling** — Rollback logic in createClientAction not tested
   - Risk: Orphaned auth users if profile insert fails
   - Solution: Integration tests for failure scenarios

## Setting Up Tests (Recommended)

**Install test framework:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest
# Or: npm install --save-dev vitest @testing-library/react
```

**Create `jest.config.js`:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

*Testing analysis: 2025-03-10*
