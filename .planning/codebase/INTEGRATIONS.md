# External Integrations

**Analysis Date:** 2025-03-10

## APIs & External Services

**Anthropic Claude (AI Nutrition Parser):**
- Service: Claude API via @anthropic-ai/sdk 0.78.0
- What it's used for: Parse food descriptions → extract macronutrient estimates
- Implementation: `app/(client)/nutrition/ai-actions.ts` (Server Action)
- Model: claude-sonnet-4-20250514
- Max tokens: 256
- Prompt: Spanish nutrition expert context; outputs normalized meal JSON
- Auth: `ANTHROPIC_API_KEY` environment variable (required only if AI features enabled)
- Response format: JSON with `{kcal, protein_g, carbs_g, fat_g, description}`
- Error handling: Returns `{success: false, error: string}` on failure
- Server-side only: Key never exposed to client

## Data Storage

**Primary Database - Supabase PostgreSQL:**
- Provider: Supabase (hmsebbkfcsaotdgoltnf.supabase.co)
- Type: PostgreSQL with PostgREST API
- Client SDKs:
  - Browser: `@supabase/ssr` with `@supabase/supabase-js` (createBrowserClient)
  - Server: `@supabase/ssr` with createServerClient (cookie-based sessions)
  - Admin: `@supabase/supabase-js` with service role key (RLS bypass)

**Auth:**
- Supabase Auth (built-in to Supabase instance)
- Session management: JWT tokens in cookies via middleware
- Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: https://hmsebbkfcsaotdgoltnf.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: JWT public key (safe for client)
  - SUPABASE_SERVICE_ROLE_KEY: Admin key (server-only)

**Key Tables (via types.ts):**
- `profiles` - User identity and role
- `clients` - Client profiles (height, weight, phase, goal, measurements)
- `workout_plans` - Training programs
- `workout_days` - Daily workout structure
- `workout_sessions` - Active/completed workout instances
- `exercises` - Exercise library (name, muscle group, target reps/sets)
- `set_logs` - Individual sets logged during workouts
- `nutrition_plans` - Meal plans by phase
- `nutrition_meals` - Individual meals
- `nutrition_meal_logs` - Logged meal consumption with grams tracked
- `weight_logs` - Weight measurements over time
- `measurements` - Body measurements (chest, waist, etc.)
- `alerts_config` - Alert rules and thresholds

**File Storage:**
- Not detected - no file uploads configured (potential future need: avatar_url, photos)

**Caching:**
- None detected - Supabase provides query-level caching
- Potential use: Redis for session caching (not implemented)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
- Implementation:
  - OAuth/Email magic links via Supabase console
  - JWT tokens stored in cookies
  - Session refresh handled by middleware

**Authorization:**
- Role-based access control (RBAC) via `profiles.role` column
- Middleware: `middleware.ts` enforces role-based route protection
  - Trainer routes: `/dashboard`, `/clients`, `/plans`, `/nutrition-plans`, `/routines-templates`
  - Client routes: `/today`, `/nutrition`, `/progress`, `/routines`, `/workout`, `/history`, `/profile`
- Development bypass: `NODE_ENV === 'development'` skips auth (remove before production)

**User Types:**
- `role: 'client'` - Fitness clients
- `role: 'trainer'` - Personal trainer (Bassi) managing clients

## Monitoring & Observability

**Error Tracking:**
- Not detected - no Sentry/DataDog configured

**Logging:**
- Console logging only (no structured logging library)
- Potential gaps: No error tracking, no performance monitoring in production

**Performance Monitoring:**
- Not detected

## CI/CD & Deployment

**Hosting:**
- Not deployed yet (development only)
- Recommended: Vercel (native Next.js support)
- Alternative: Docker container or self-hosted Node.js

**CI Pipeline:**
- Not detected - no GitHub Actions/GitLab CI configured

**Version Control:**
- Git repository present (.git/)
- Main branch: `main`

## Environment Configuration

**Required Environment Variables (Runtime):**
```
NEXT_PUBLIC_SUPABASE_URL=https://hmsebbkfcsaotdgoltnf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<jwt_service_role_key>
ANTHROPIC_API_KEY=<optional_claude_api_key>
NODE_ENV=development|production
```

**Optional Variables:**
- ANTHROPIC_API_KEY: If not set, nutrition AI parsing fails gracefully with error message

**Secrets Location:**
- `.env.local` - Local development (git-ignored)
- Production: Environment variables set in Vercel dashboard (or hosting platform)
- Never commit credentials to git

**Bypass in Development:**
- Middleware skips auth checks when `NODE_ENV === 'development'` for easy testing
- ⚠️ This must be removed before production deployment

## Webhooks & Callbacks

**Incoming Webhooks:**
- Not detected - no webhook endpoints implemented

**Outgoing Webhooks:**
- Not detected - no external service subscriptions

**Potential Future Integrations:**
- Supabase realtime: Available but not actively used yet
- Webhooks: Could subscribe to Supabase events (e.g., new workout sessions)

## API Surface

**No Public API:**
- App is direct browser ↔ Supabase integration
- No REST API layer (client calls PostgREST directly)
- No GraphQL
- Server Actions: Form mutations via `app/(trainer)/clients/actions.ts`, etc.

**Server Actions (form-like endpoints):**
- `app/(trainer)/clients/actions.ts`: CRUD for clients
- `app/(trainer)/plans/actions.ts`: Plan management
- `app/(trainer)/nutrition-plans/actions.ts`: Nutrition plan operations
- `app/(client)/nutrition/ai-actions.ts`: Claude nutrition parsing
- `app/(client)/today/actions.ts`: Workout logging (set_logs, session completion)
- `app/(client)/progress/actions.ts`: Weight/measurement logging

## Rate Limiting

**Supabase:**
- Default free tier rate limits (not explicitly configured)
- Potential concern: Heavy load on nutrition AI parsing

**Anthropic Claude:**
- API key-based rate limiting (depends on account plan)
- Calls from single action function: `app/(client)/nutrition/ai-actions.ts`

## Data Privacy & Compliance

**Supabase RLS (Row Level Security):**
- Partially implemented via service role bypass in admin operations
- Client and trainer can view own data via anon key
- Sensitive operations (e.g., admin client creation) use service role

**Audit Trail:**
- Not detected - no audit logging table
- Potential gap: No tracking of who modified client data and when

**Data Retention:**
- Not configured - all data retained indefinitely

---

*Integration audit: 2025-03-10*
