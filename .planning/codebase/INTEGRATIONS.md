# External Integrations

**Analysis Date:** 2025-02-20

## APIs & External Services

**Anthropic Claude API:**
- Service: Anthropic Claude (LLM)
- What it's used for: AI-driven features planned (questionnaire analysis, progress insights, training plan generation)
- SDK/Client: `@anthropic-ai/sdk` v0.78.0
- Model: `claude-sonnet-4-20250514`
- Auth: `ANTHROPIC_API_KEY` (server-side only via Server Actions or Route Handlers `/app/api/`)
- Status: SDK installed, not yet integrated into active endpoints
- Call pattern: Server Actions only (never client-side)

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Provider: Supabase (managed PostgreSQL with PostgREST API)
  - Connection: Via `@supabase/supabase-js` and `@supabase/ssr`
  - Auth Method: Row Level Security (RLS) policies
  - Browser Client: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
  - Server/Admin Client: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - ORM/Client: @supabase/supabase-js (query builder, no ORM abstraction)

**File Storage:**
- Supabase Storage - Part of Supabase platform
  - Used for: Avatar uploads, media storage (if implemented)
  - Accessed via: supabase.storage bucket operations

**Caching:**
- None implemented - Future candidate for Redis/Memcached

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: Email/password authentication via `supabase.auth.*` methods
  - Session Storage: HTTP-only cookies managed by `@supabase/ssr` adapter
  - Roles: User profile contains `role` field (trainer/client) for role-based access control

**Role-Based Access Control:**
- Middleware: `middleware.ts` enforces route protection
  - Trainer routes: `/dashboard`, `/clients`, `/routines-templates`, `/exercises`, `/reports`, `/settings`
  - Client routes: `/today`, `/nutrition`, `/progress`, `/audit`, `/profile`, `/routines`, `/workout`
  - Bypass active in development mode (NODE_ENV === 'development') — must be disabled for production

## Monitoring & Observability

**Error Tracking:**
- None configured - Candidates: Sentry, LogRocket, Datadog

**Logs:**
- Browser console (development only via Next.js dev server)
- Server console (CloudFlare Workers / Vercel deployment logs)
- No centralized logging infrastructure

## CI/CD & Deployment

**Hosting:**
- Vercel (implied standard Next.js target)
  - Supports environment variables via Vercel dashboard
  - Automatic deployments from Git branches
  - Alternative: Any Node.js host (AWS, Railway, Render, etc.)

**CI Pipeline:**
- None configured - GitHub Actions is a common Next.js pattern

## Environment Configuration

**Required env vars (browser-safe):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

**Required env vars (server-side secrets):**
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin/service key (bypass RLS)
- `ANTHROPIC_API_KEY` - Claude API authentication

**Secrets location:**
- `.env.local` - Local development (NOT committed to git)
- Vercel/Deployment dashboard - Production secrets
- File: `.env*` is in `.gitignore` (verified by presence of env patterns)

## Webhooks & Callbacks

**Incoming:**
- Supabase real-time subscriptions (via `@supabase/supabase-js`)
  - Not yet implemented; candidates: workout session updates, client data changes

**Outgoing:**
- None configured - Candidates: Supabase webhooks for external integrations, Slack notifications

## Database Schema

**Core Tables:**
- `profiles` - User profiles (extends Supabase Auth)
- `clients` - Client data (trainer-to-client relationship)
- `workout_plans`, `workout_days`, `exercises` - Training structure
- `workout_sessions`, `set_logs` - Workout tracking
- `weight_logs`, `measurements` - Body metrics
- `nutrition_meal_logs` - Nutrition tracking

**Schema Location:** `supabase/schema.sql`

**Type Generation:** `lib/supabase/types.ts` auto-generated from database schema

## Query Patterns

**Browser Client (RLS-protected):**
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data } = await supabase
  .from('workouts')
  .select('id, name')
  .eq('client_id', clientId)
```

**Server Client (session-aware cookies):**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Admin Client (bypass RLS - Server Actions only):**
```typescript
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
// Full access, service role key required
```

## Data Synchronization

**Real-time Subscriptions:**
- Available via `supabase.channel()` API
- Not yet implemented; potential uses: live workout session updates, live client metric tracking

---

*Integration audit: 2025-02-20*
