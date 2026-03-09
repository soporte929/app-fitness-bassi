# Technology Stack

**Analysis Date:** 2025-02-20

## Languages

**Primary:**
- TypeScript 5 - Entire codebase, strict mode enabled
- JavaScript/JSX - React components with `.tsx` extension

**Secondary:**
- SQL - Database migrations and schema definition (Supabase)
- CSS/Tailwind - Styling via Tailwind CSS v4

## Runtime

**Environment:**
- Node.js - Runtime for Next.js application (version specified in `.nvmrc` or package.json engines)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` (presence assumed, uses npm)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
  - App Router enabled (routes in `app/` directory)
  - Server Components as default pattern
  - Server Actions for mutations

**UI Framework:**
- React 19.2.3 - Component library and state management
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind Merge 3.5.0 - Utility class conflict resolution
- Class Variance Authority 0.7.1 - Component variant library for `components/ui/`

**Icons:**
- Lucide React 0.577.0 - Icon library, exclusively used (no other icon systems)

**Charts:**
- Recharts 3.7.0 - React charting library
  - Used in: `components/trainer/dashboard-charts/`
  - Charts: BarChart, LineChart, PieChart

**Utilities:**
- clsx 2.1.1 - Conditional class name utility (alternative to cn() wrapper)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.98.0 - Supabase client library
  - Admin operations: service role key
  - Browser operations: anon public key with RLS
  - Version constraint: Requires `Relationships: []` field on all table types

- @supabase/ssr 0.9.0 - Supabase Server-Side Rendering adapter
  - Handles cookie-based session management
  - Used in `lib/supabase/server.ts` and middleware

- @anthropic-ai/sdk 0.78.0 - Anthropic Claude API client
  - Model: claude-sonnet-4-20250514 (from CLAUDE.md)
  - Not yet integrated into active endpoints
  - Reserved for: questionnaire analysis, progress insights, plan generation

**Infrastructure:**
- next (see Frameworks above) - Includes: TypeScript, ESLint, PostCSS

## Configuration

**Environment:**
- `.env.local` - Contains Supabase and service credentials
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon public key (public)
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only, secret)
  - `ANTHROPIC_API_KEY` - Claude API key (server-side only, secret)

**Build:**
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript compiler options
  - Target: ES2017
  - Strict mode: enabled
  - Path aliases: `@/*` → project root
- `postcss.config.mjs` - PostCSS config with Tailwind CSS v4
- `eslint.config.mjs` - ESLint configuration
  - Extends: next/core-web-vitals, next/typescript
  - Format: Flat config (ESLint v9+)

## Platform Requirements

**Development:**
- Node.js 18+ (recommended)
- npm 9+ (or equivalent)
- Supabase project with database schema migrated (`supabase/schema.sql`)

**Production:**
- Deployment target: Vercel (standard Next.js target)
  - Alternative: Any Node.js-compatible hosting (AWS, Railway, etc.)
- Database: Supabase PostgreSQL instance
- API: Anthropic Claude (via @anthropic-ai/sdk)

## Build & Development Scripts

```bash
npm run dev     # Start development server (http://localhost:3000)
npm run build   # Production build
npm start       # Production server
npm run lint    # Run ESLint checks
```

## Performance Notes

- TypeScript strict mode enforces type safety across codebase
- Recharts v3.7.0 has known formatter parameter type issue (accepts `| undefined`)
- Supabase types auto-generated from database schema via `lib/supabase/types.ts`

---

*Stack analysis: 2025-02-20*
