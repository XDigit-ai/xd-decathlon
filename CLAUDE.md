# Decathlon — Claude Code Guidelines

## Project Overview

Personal fitness tracking dashboard built with Next.js 16, Supabase, and Tailwind CSS 4. Aggregates data from Hevy (strength), Whoop (recovery/cardio), and manual entry. Tracks progress against Peter Attia's Centenarian Decathlon benchmarks.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling:** Tailwind CSS 4 (CSS-first config via `@theme inline`)
- **Charts:** Recharts
- **Language:** TypeScript (strict)

## Supabase Connection

### API Key Types

Supabase uses two categories of API keys:

**Low-privilege keys (safe for client-side):**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Legacy JWT-based anon key. Used in browser clients and Server Components. All requests go through Row Level Security (RLS). This key does NOT mean "anonymous user" — authenticated users use this key too; Supabase Auth determines *who* the user is.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Newer `sb_publishable_*` format. Same privilege level as anon key. Cannot be used in `Authorization: Bearer` headers.

**Elevated-privilege keys (server-side only, NEVER expose to browser):**
- `SUPABASE_SERVICE_ROLE_KEY` — Legacy JWT-based service role key. Bypasses RLS entirely. Used in cron jobs, webhooks, admin operations, and data migrations.
- Secret keys (`sb_secret_*`) — Newer format, same elevated access. Backend-only.

### How Keys Are Used in This Project

| Client | File | Key Used | Context |
|--------|------|----------|---------|
| Browser client | `src/lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Components, hooks |
| Server client | `src/lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Server Components, Route Handlers (respects RLS) |
| Admin client | `src/lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Cron sync, webhooks, admin ops (bypasses RLS) |
| Middleware | `middleware.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Session refresh on every request |

### Security Rules

- RLS is enabled on ALL tables. Every table has `auth.uid() = user_id` policies.
- Never import `admin.ts` in Client Components or expose the service role key.
- The anon key is safe to commit to client bundles — security comes from RLS policies, not key secrecy.
- Secret/service role keys must only exist in `.env.local` (gitignored) or Vercel environment variables.
- When compromised, rotate keys immediately in Supabase Dashboard > Settings > API.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/        # Login page
│   ├── (dashboard)/          # All dashboard pages (layout with sidebar)
│   └── api/                  # Route handlers (webhooks, sync, metrics, etc.)
├── components/
│   ├── ui/                   # shadcn/ui primitives (button, card, input, etc.)
│   ├── layout/               # sidebar, header, mobile-nav
│   └── dashboard/            # status-card, recovery-status, quick-add, etc.
├── hooks/                    # React hooks (use-metrics, use-targets, etc.)
├── lib/
│   ├── supabase/             # Client factories (client.ts, server.ts, admin.ts)
│   ├── calculations/         # 1RM, volume, rolling avg, recovery, progress
│   └── utils/                # date, format, constants, cn
├── types/                    # TypeScript types (database, hevy, whoop, metrics, etc.)
supabase/
└── migrations/               # 11 SQL migration files
```

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npx tsc --noEmit     # Type check without emitting
```

## Conventions

- Server Components by default; add `'use client'` only when needed (hooks, interactivity)
- Supabase server client is async: `const supabase = await createClient()`
- Use `cn()` from `@/lib/utils/cn` for conditional Tailwind classes
- Component files use kebab-case (`status-card.tsx`), exports use PascalCase (`StatusCard`)
- API routes follow RESTful patterns with `NextRequest`/`NextResponse`
- All database tables require `user_id` foreign key and RLS policies
