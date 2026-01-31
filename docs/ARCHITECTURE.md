# Architecture Document
## AK Fitness — Personal Fitness Tracking Dashboard

**Version:** 1.0
**Date:** January 31, 2026

---

## 1. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16 | App Router, React Server Components, API routes |
| **Runtime** | React | 19 | UI rendering with Server Components |
| **Language** | TypeScript | 5.x | Type safety across the stack |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS with CSS-first configuration |
| **Database** | Supabase (PostgreSQL) | — | Hosted Postgres with Auth, Storage, Realtime |
| **Auth** | Supabase Auth | — | Email/password, single-user |
| **Charts** | Recharts | 2.x | Line, bar, radar, progress ring charts |
| **Icons** | Lucide React | — | Consistent icon set |
| **Validation** | Zod | 3.x | Runtime schema validation for forms and API payloads |
| **Dates** | date-fns | 4.x | Date manipulation and formatting |
| **Hosting** | Vercel | — | Deployment, serverless functions, cron jobs |
| **Storage** | Supabase Storage | — | Progress photos (private bucket) |

### UI Component Strategy

- **shadcn/ui** pattern: Copy-paste component primitives into `src/components/ui/`
- Built on **Radix UI** for accessibility
- Styled with **class-variance-authority (CVA)** for variant management
- **clsx** + **tailwind-merge** for conditional class composition

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Vercel Edge                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Cron Jobs │  │  Middleware   │  │   Next.js App Router     │  │
│  │ (hevy/   │  │ (session     │  │  ┌──────┐  ┌──────────┐  │  │
│  │  whoop)  │  │  refresh)    │  │  │ RSC  │  │ Client   │  │  │
│  └────┬─────┘  └──────┬───────┘  │  │Pages │  │Components│  │  │
│       │               │          │  └──┬───┘  └────┬─────┘  │  │
│       │               │          │     │           │         │  │
│       │          ┌────┴──────────┴─────┴───────────┴──┐      │  │
│       │          │        API Route Handlers           │      │  │
│       │          │  (webhooks, sync, metrics, auth)    │      │  │
│       │          └────────────────┬────────────────────┘      │  │
│       │                          │                            │  │
└───────┼──────────────────────────┼────────────────────────────┘
        │                          │
        │         ┌────────────────┼──────────────────┐
        │         │            Supabase               │
        │         │  ┌──────┐ ┌──────┐ ┌───────────┐  │
        │         │  │ Auth │ │  DB  │ │  Storage  │  │
        │         │  └──────┘ │(RLS) │ │ (photos)  │  │
        │         │           └──────┘ └───────────┘  │
        │         │           ┌──────────────────┐    │
        │         │           │  Realtime (live   │   │
        │         │           │  dashboard subs)  │   │
        │         └───────────┴──────────────────┘────┘
        │
   ┌────┴────────────────────────────┐
   │       External APIs             │
   │  ┌─────────┐   ┌────────────┐  │
   │  │ Hevy v1 │   │ Whoop v1   │  │
   │  │ (REST + │   │ (OAuth +   │  │
   │  │ Webhook)│   │  Webhook)  │  │
   │  └─────────┘   └────────────┘  │
   └─────────────────────────────────┘
```

---

## 3. Data Flow

### 3.1 Hevy Sync Flow

```
Hevy App → Workout Completed
    │
    ├─→ Webhook POST /api/webhooks/hevy
    │     ├─ Verify API key header
    │     ├─ Parse workout payload
    │     ├─ Transform → hevy_workouts, hevy_workout_exercises, hevy_sets
    │     ├─ Compute estimated 1RM (Epley) for each exercise
    │     ├─ Check for personal records → personal_records
    │     ├─ Aggregate weekly volume → weekly_volume
    │     └─ Log to sync_logs
    │
    └─→ Cron (every 4 hours): GET /api/sync/hevy
          ├─ Verify CRON_SECRET header
          ├─ Fetch GET /workouts (paginated, since last sync)
          ├─ Same transform + compute pipeline
          └─ Update sync_logs with timestamp
```

### 3.2 Whoop Sync Flow

```
Whoop → New recovery/sleep/workout data
    │
    ├─→ Webhook POST /api/webhooks/whoop
    │     ├─ Validate HMAC-SHA256 signature (timestamp + body)
    │     ├─ Route by event type (recovery, sleep, workout, cycle)
    │     ├─ Fetch full data from Whoop API (webhook is notification-only)
    │     ├─ Transform → whoop_recovery/sleep/workouts/cycles
    │     ├─ Calculate traffic light status
    │     └─ Log to sync_logs
    │
    └─→ Cron (every 2 hours): GET /api/sync/whoop
          ├─ Verify CRON_SECRET header
          ├─ Auto-refresh OAuth token if expired
          ├─ Fetch recovery, sleep, workout, cycle data (cursor pagination)
          ├─ Same transform + upsert pipeline
          └─ Update sync_logs
```

### 3.3 Manual Entry Flow

```
User → Dashboard Quick Add / Form Page
    │
    ├─ Client component form with Zod validation
    ├─ POST /api/metrics/{body|functional|manual}
    ├─ Server-side Zod validation
    ├─ Insert into appropriate table
    ├─ Check for PRs (functional tests)
    └─ Return success → toast notification
```

### 3.4 Whoop OAuth Flow

```
User → Settings → "Connect Whoop"
    │
    ├─ GET /api/auth/whoop → redirect to Whoop authorization URL
    │     (scopes: read:recovery, read:sleep, read:workout, read:cycles, offline)
    │
    ├─ User authorizes → redirect to /api/auth/whoop/callback
    │     ├─ Exchange code for access_token + refresh_token
    │     ├─ Encrypt tokens with AES-256-GCM
    │     ├─ Store in integration_tokens table
    │     └─ Redirect to /settings with success
    │
    └─ Token refresh (automatic on 401):
          ├─ Decrypt refresh_token
          ├─ POST to Whoop token endpoint
          ├─ Encrypt new tokens
          └─ Update integration_tokens
```

---

## 4. Project Structure

```
ak-workout/
├── next.config.ts              # Next.js 16 config
├── tailwind.config.ts          # Tailwind CSS 4 config
├── vercel.json                 # Cron job definitions
├── middleware.ts                # Supabase session refresh
├── supabase/
│   └── migrations/             # Sequential SQL migrations
│       ├── 001_profiles.sql
│       ├── 002_targets.sql
│       ├── 003_body_composition.sql
│       ├── 004_hevy_workouts.sql
│       ├── 005_hevy_analytics.sql
│       ├── 006_whoop_data.sql
│       ├── 007_integration_tokens.sql
│       ├── 008_functional_tests.sql
│       ├── 009_reviews.sql
│       ├── 010_daily_wellness.sql
│       └── 011_sync_logs.sql
└── src/
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # Root layout (fonts, providers)
    │   ├── globals.css         # Tailwind directives + CSS variables
    │   ├── (auth)/             # Auth route group
    │   ├── (dashboard)/        # Dashboard route group with shared layout
    │   └── api/                # API route handlers
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives
    │   ├── layout/             # Sidebar, header, mobile-nav
    │   ├── charts/             # Reusable chart components
    │   ├── dashboard/          # Dashboard-specific components
    │   ├── strength/           # Strength page components
    │   ├── cardio/             # Cardio page components
    │   ├── recovery/           # Recovery page components
    │   ├── body/               # Body composition components
    │   ├── functional/         # Functional fitness components
    │   ├── reviews/            # Review form components
    │   └── targets/            # Target tracking components
    ├── lib/
    │   ├── supabase/           # Supabase client utilities
    │   ├── hevy/               # Hevy API client + transforms
    │   ├── whoop/              # Whoop OAuth + API client + transforms
    │   ├── calculations/       # 1RM, volume, rolling avg, recovery
    │   └── utils/              # Date, format, constants helpers
    ├── hooks/                  # React hooks for data fetching
    └── types/                  # TypeScript type definitions
```

---

## 5. Rendering Strategy

| Route | Rendering | Reason |
|-------|-----------|--------|
| `/` (dashboard) | Server Component + Client islands | Fetch data server-side, interactive charts client-side |
| `/strength`, `/cardio`, etc. | Server Component + Client charts | Data fetched server-side, charts are client components |
| `/strength/[exerciseId]` | Dynamic Server Component | Exercise-specific data loaded on demand |
| `/settings` | Client Component | Form interactions, OAuth flow |
| `/api/*` | Route Handlers | Serverless API endpoints |
| `(auth)/login` | Server Component | Simple auth form |

### Server Components (default)
- Fetch data directly from Supabase using server client
- No client-side JavaScript for static content
- Pass serializable data to client chart components

### Client Components (`"use client"`)
- Interactive charts (Recharts requires client rendering)
- Forms with state management
- Real-time subscriptions (Supabase Realtime)
- Quick-add widgets with optimistic updates

---

## 6. Database Architecture

### Row-Level Security

All tables enforce single-user access via RLS:

```sql
CREATE POLICY "Users can only access own data"
  ON public.<table_name>
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Key Relationships

```
auth.users (Supabase managed)
    │
    ├── profiles (1:1)
    ├── targets (1:many)
    ├── daily_weight (1:many)
    ├── body_measurements (1:many)
    ├── dexa_scans (1:many)
    ├── hevy_workouts (1:many)
    │     └── hevy_workout_exercises (1:many)
    │           └── hevy_sets (1:many)
    ├── estimated_1rm (1:many)
    ├── weekly_volume (1:many)
    ├── personal_records (1:many)
    ├── whoop_recovery (1:many)
    ├── whoop_sleep (1:many)
    ├── whoop_workouts (1:many)
    ├── whoop_cycles (1:many)
    ├── integration_tokens (1:many, per provider)
    ├── functional_tests (1:many)
    ├── reviews (1:many)
    ├── daily_wellness (1:many)
    ├── sync_logs (1:many)
    └── hr_zones (1:1)
```

### Data Preservation

- Raw Hevy API responses stored as `raw_data JSONB` on `hevy_workouts`
- Computed fields (1RM, weekly volume, PRs) are derived and can be recomputed
- Whoop tokens encrypted with AES-256-GCM before storage

---

## 7. Integration Architecture

### Hevy API

| Detail | Value |
|--------|-------|
| Base URL | `https://api.hevyapp.com/v1/` |
| Auth | `api-key` header |
| Rate Limits | Standard (respect 429 with exponential backoff) |
| Pagination | `page` + `pageSize` (max 10) |
| Webhook Events | `workout.created`, `workout.updated`, `workout.deleted` |
| Data Format | JSON |

**Key endpoints:**
- `GET /workouts` — paginated workout list
- `GET /workouts/{id}` — single workout with exercises and sets
- `GET /exercise_templates` — exercise definitions
- `POST /webhooks` — register webhook URL

### Whoop API v2

| Detail | Value |
|--------|-------|
| Base URL | `https://api.prod.whoop.com/developer/v1/` |
| Auth | OAuth 2.0 (Bearer token) |
| Token Expiry | ~1 hour |
| Refresh | `offline` scope required |
| Pagination | Cursor-based (`nextToken`) |
| Webhook Validation | HMAC-SHA256 of `timestamp + body` using client secret |

**Key endpoints:**
- `GET /activity/recovery` — recovery scores with HRV, RHR
- `GET /activity/sleep` — sleep stages and duration
- `GET /activity/workout` — cardio workouts with HR zones
- `GET /activity/cycle` — physiological cycles (strain)
- `GET /user/profile/basic` — user profile

### Token Security

```
Encryption: AES-256-GCM
Key: ENCRYPTION_KEY env var (32-byte hex)
Storage: integration_tokens table
Fields: encrypted_access_token, encrypted_refresh_token, iv, auth_tag
Auto-refresh: On 401 response, decrypt refresh token, exchange, re-encrypt
```

---

## 8. Calculation Engine

### Estimated 1RM (Epley Formula)

```
1RM = weight × (1 + reps / 30)
```

- Applied to working sets only (1-12 reps, excluding warmup and failure sets)
- Best estimated 1RM per exercise per workout stored in `estimated_1rm`
- PR detection: compare against `personal_records` table

### Traffic Light System

```
30-day HRV average = rolling_avg(hrv, 30 days)

Green:  today_hrv > 0.95 × avg_30d  →  "Train as planned"
Yellow: today_hrv between 0.90-0.95 × avg_30d  →  "Reduce volume/intensity"
Red:    today_hrv < 0.90 × avg_30d  →  "Active recovery only"
```

### Rolling Averages

- 7-day and 30-day rolling averages for weight, HRV, RHR
- Missing days are skipped (not interpolated)
- Minimum 3 data points required for 7-day, 7 for 30-day

### HR Zones (Karvonen Method)

```
HRR = Max HR - RHR = 178 - 56 = 122
Zone N = RHR + (HRR × low%) to RHR + (HRR × high%)

Zone 1 (Recovery):  56 + 122×0.50 = 117  to  56 + 122×0.60 = 129
Zone 2 (Aerobic):   129  to  56 + 122×0.70 = 141
Zone 3 (Tempo):     141  to  56 + 122×0.80 = 154
Zone 4 (Threshold): 154  to  56 + 122×0.90 = 166
Zone 5 (Max):       166  to  178
```

---

## 9. Security

### Authentication
- Supabase Auth with email/password
- Single-user application
- Session managed via Supabase SSR middleware (cookie-based)
- Session refresh on every request via middleware

### API Security
- All API routes validate Supabase session (except webhooks)
- Webhook routes validate their specific auth:
  - Hevy: API key header verification
  - Whoop: HMAC-SHA256 signature validation
- Cron routes verify `CRON_SECRET` from `Authorization: Bearer` header

### Data Security
- Row-Level Security on all tables (user_id = auth.uid())
- OAuth tokens encrypted at rest (AES-256-GCM)
- Progress photos in private Supabase Storage bucket (authenticated access only)
- No sensitive data in URL parameters
- Environment variables for all secrets (never in code)

---

## 10. Deployment

### Vercel Configuration

```json
{
  "crons": [
    { "path": "/api/sync/hevy", "schedule": "0 */4 * * *" },
    { "path": "/api/sync/whoop", "schedule": "0 */2 * * *" }
  ]
}
```

### Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (RLS enforced) | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (bypasses RLS) | Server only |
| `HEVY_API_KEY` | Hevy API authentication | Server only |
| `WHOOP_CLIENT_ID` | Whoop OAuth client ID | Server only |
| `WHOOP_CLIENT_SECRET` | Whoop OAuth client secret | Server only |
| `NEXT_PUBLIC_WHOOP_REDIRECT_URI` | Whoop OAuth callback URL | Client + Server |
| `ENCRYPTION_KEY` | AES-256-GCM key for token encryption | Server only |
| `CRON_SECRET` | Vercel cron job authentication | Server only |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Client + Server |

### Build & Deploy

- **Build command:** `next build`
- **Output:** Standalone serverless functions + static assets
- **Node.js version:** 20.x
- **Region:** Auto (Vercel edge network)
- **Cron jobs:** Managed by Vercel (Pro plan recommended for custom schedules)
