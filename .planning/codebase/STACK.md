# Technology Stack

**Analysis Date:** 2025-03-10

## Languages

**Primary:**
- TypeScript 5.x - Strict mode enabled across entire codebase
- JavaScript (JSX/TSX) - React component rendering with React 19.2.3

## Runtime

**Environment:**
- Node.js 24.13.1 (tested; v20+ required)
- npm 11.8.0 (package manager)

**Next.js:**
- Version: 16.1.6
- App Router with Server Components (default pattern)
- SSR enabled, ISR capable

## Frameworks & Libraries

**Core Web Framework:**
- Next.js 16.1.6 - Full-stack React framework with built-in routing, SSR, and API support

**UI & Rendering:**
- React 19.2.3 - Modern React with concurrent features
- React DOM 19.2.3 - DOM rendering

**Component Libraries:**
- Lucide React 0.577.0 - Icon library (exclusive icon source; used throughout UI)
- class-variance-authority 0.7.1 - Component variant system for UI components
- clsx 2.1.1 - Conditional CSS class management
- tailwind-merge 3.5.0 - Tailwind utility merging (avoid style conflicts)

**Data Visualization:**
- Recharts 3.7.0 - Charting library for dashboards
  - Used for: `LineChart` (weight trends), `BarChart` (adherence), `PieChart` (phase distribution)
  - Location: `components/trainer/dashboard-charts/`

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
  - PostCSS 4 plugin (via @tailwindcss/postcss) - CSS processing

**Database & APIs:**
- @supabase/supabase-js 2.98.0 - Supabase JavaScript SDK (browser client)
- @supabase/ssr 0.9.0 - Server-side auth/session management for Next.js
  - Used in: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `middleware.ts`

**AI Integration:**
- @anthropic-ai/sdk 0.78.0 - Claude API client
  - Used in: `app/(client)/nutrition/ai-actions.ts`
  - Model: claude-sonnet-4-20250514
  - Server-side only (never exposed to client)

## Build & Dev Tools

**Linting & Code Quality:**
- ESLint 9 - JavaScript/TypeScript linting
- eslint-config-next 16.1.6 - Next.js ESLint rules with Tailwind and TypeScript support
  - Config: `eslint.config.mjs` (flat config format)

**Type Checking:**
- TypeScript 5.x compiler
  - Target: ES2017
  - Module: esnext
  - Strict: true
  - Path alias: `@/*` (maps to project root)

**Build Configuration:**
- next.config.ts - Next.js configuration (minimal/empty)
- tsconfig.json - TypeScript configuration with Next.js plugin
- postcss.config.mjs - PostCSS plugins for Tailwind
- .next/ - Build output directory (gitignored)

## Configuration Files

**Environment:**
- `.env.local` - Contains secrets (present; not committed)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - ANTHROPIC_API_KEY (optional; required for AI features)

**Git:**
- `.gitignore` - Excludes node_modules, .next, .env files

## Platform Requirements

**Development:**
- Node.js v20 or higher (tested v24.13.1)
- npm v11+ or compatible package manager
- macOS/Linux/Windows compatible

**Production/Deployment:**
- Vercel (recommended for Next.js)
- Environment variables must include:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - ANTHROPIC_API_KEY (optional for AI nutrition features)

**Browser Support:**
- Modern browsers (ES2017 target)
- Mobile-responsive design via Tailwind

## Project Scripts

```bash
npm run dev       # Development server on :3000
npm run build     # Production build to .next/
npm start         # Run production build
npm run lint      # ESLint check (no fix)
```

## Architecture Notes

**Server/Client Separation:**
- Server Components by default (no 'use client' unless interactive state needed)
- Server Actions in `actions.ts` files for mutations
- Middleware handles auth at request level

**Database Access:**
- Browser clients: `lib/supabase/client.ts` with anon key
- Server-side: `lib/supabase/server.ts` with cookie-based session
- Admin operations: `lib/supabase/admin.ts` with service role key (RLS bypass)

**API Integration:**
- Supabase: PostgREST real-time database queries
- Anthropic Claude: Server Actions only (async nutrition parsing)
- No traditional REST/GraphQL API layer (Direct Supabase client calls)

---

*Stack analysis: 2025-03-10*
