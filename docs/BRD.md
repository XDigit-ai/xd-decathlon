# Business Requirements Document (BRD)
## AK Fitness — Personal Fitness Tracking Dashboard

**Version:** 1.0
**Date:** January 31, 2026
**Owner:** AK

---

## 1. Project Overview

### 1.1 Purpose

Build a personal fitness tracking web application that aggregates data from multiple sources (Hevy, Whoop, manual entry) into a single dashboard. The app tracks progress against defined targets across five fitness domains: body composition, strength, cardiovascular fitness, recovery, and functional fitness (Peter Attia's Centenarian Decathlon benchmarks).

### 1.2 User Profile

- **Age:** 42-year-old male
- **Current body fat:** 24% (target: 18%)
- **Lean mass:** Below average (building)
- **Resting HR:** 56 bpm
- **HRV baseline:** 65 ms RMSSD
- **VO2 Max:** ~41-43 mL/kg/min (Whoop: 45, Apple Watch: 39.1)
- **Training schedule:** 4 strength sessions + 2 cardio sessions per week
- **Tracking tools:** Hevy (Pro) for strength, Apple Watch + Whoop for cardio/recovery

### 1.3 Business Goals

1. **Centralize all fitness data** into one dashboard instead of checking 3+ apps
2. **Track progress against SMART goals** across all fitness domains
3. **Automate data collection** from Hevy and Whoop via API integrations
4. **Provide actionable insights** — traffic light recovery system, plateau detection, PR tracking
5. **Support structured review cadence** — weekly, monthly, and quarterly assessments
6. **Track longevity benchmarks** — Peter Attia's functional fitness standards

---

## 2. Functional Requirements

### FR-1: Dashboard (Home)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Display today's recovery status as a traffic light (green/yellow/red) with recommendation text | Must |
| FR-1.2 | Show progress bars for all active targets with current vs goal values | Must |
| FR-1.3 | Display this week's training snapshot: sessions completed/planned, weight trend, avg HRV, avg sleep | Must |
| FR-1.4 | List recent workouts (last 7 days) with title, date, volume, and PR badges | Must |
| FR-1.5 | Show domain status cards for Body, Strength, Cardio, Recovery, Functional with key metric + sparkline | Must |
| FR-1.6 | Provide a "Quick Add" widget for fast manual entry of weight, wellness ratings, and VO2 max | Must |
| FR-1.7 | Show upcoming review reminder (e.g., "Weekly review due Sunday") | Should |

### FR-2: Strength Tracking (Hevy Integration)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Auto-sync workouts from Hevy via webhook and cron job (every 4 hours) | Must |
| FR-2.2 | Display estimated 1RM progression chart for key lifts: Squat, Bench Press, Deadlift, OHP, Barbell Row | Must |
| FR-2.3 | Calculate estimated 1RM using Epley formula from working sets (1-12 reps, excluding warmup/failure sets) | Must |
| FR-2.4 | Track and display personal records with celebration indicator | Must |
| FR-2.5 | Show weekly volume (sets) per muscle group as bar chart | Must |
| FR-2.6 | Display RPE trends over time to detect overreaching | Should |
| FR-2.7 | Individual exercise detail page with full set history, 1RM trend, volume trend | Should |
| FR-2.8 | Store raw Hevy API response as JSONB for data preservation | Must |
| FR-2.9 | Support Hevy webhook registration from settings page | Must |

### FR-3: Cardiovascular & VO2 Max

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Display VO2 Max trend chart with data points from Whoop, Apple Watch (manual), and Cooper test (manual) as separate color-coded series | Must |
| FR-3.2 | Track HIIT sessions (Norwegian 4x4): per-interval HR data, compliance % against 151-169 bpm target zone | Must |
| FR-3.3 | Track Zone 2 sessions: duration, avg HR, % time in 129-141 bpm zone | Must |
| FR-3.4 | Show HR zone distribution from Whoop workout data as stacked horizontal bar | Should |
| FR-3.5 | Display heart rate zone reference table with user's calculated zones (RHR 56, Max HR 178) | Must |

### FR-4: Recovery (Whoop Integration)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Auto-sync recovery, sleep, strain, and workout data from Whoop via webhook and cron (every 2 hours) | Must |
| FR-4.2 | Display today's recovery score (0-100%) with traffic light | Must |
| FR-4.3 | Show HRV trend with 7-day moving average, 30-day moving average, and baseline (65 ms) reference line | Must |
| FR-4.4 | Show resting heart rate trend with baseline (56 bpm) reference | Must |
| FR-4.5 | Display sleep chart: stacked bars for sleep stages per night, total duration line overlay | Must |
| FR-4.6 | Implement traffic light system: Green (HRV >95% of 30d avg), Yellow (90-95%), Red (<90%) | Must |
| FR-4.7 | Handle Whoop OAuth 2.0 flow with token encryption (AES-256-GCM) and auto-refresh | Must |
| FR-4.8 | Validate Whoop webhook signatures using HMAC-SHA256 | Must |

### FR-5: Body Composition

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Manual daily weight entry with automatic 7-day and 30-day rolling average calculation | Must |
| FR-5.2 | Weight chart: daily data points, 7d rolling avg line, 30d rolling avg line, target weight dashed line | Must |
| FR-5.3 | Body fat % trend chart with DEXA results as highlighted anchor points and 18% target line | Must |
| FR-5.4 | Bi-weekly body measurements form: waist, hips, chest, arms L/R, thighs L/R | Must |
| FR-5.5 | Quarterly DEXA scan results entry: total body fat %, fat mass, lean mass, bone density, visceral fat | Must |
| FR-5.6 | Progress photo upload and gallery with front/side/back views and compare mode (side-by-side dates) | Should |
| FR-5.7 | Waist-to-hip ratio auto-calculation | Should |

### FR-6: Functional Fitness (Peter Attia Benchmarks)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Track all Centenarian Decathlon benchmarks with manual entry: dead hang, farmer's walk, plank, wall sit, pull-ups, balance (eyes open/closed, L/R), floor get-up, deadlift reps, grip strength L/R, 1-mile run | Must |
| FR-6.2 | Display benchmark targets alongside current values with progress percentage | Must |
| FR-6.3 | Radar/spider chart showing current vs target across all functional tests | Must |
| FR-6.4 | Progress table: each test with current value, Attia target, % complete, last tested date, trend arrow | Must |
| FR-6.5 | PR detection for functional tests (new personal best) | Should |
| FR-6.6 | Monthly test reminder on dashboard | Should |

**Benchmark targets (42-year-old male):**

| Test | Target | Unit |
|------|--------|------|
| Dead Hang | 120 | seconds |
| Farmer's Walk (BW total, 50% each hand) | 120 | seconds |
| Plank (perfect form) | 60 | seconds |
| Wall Sit (90°) | 120 | seconds |
| Pull-Ups (strict) | 10 | reps |
| Single-Leg Balance, Eyes Open | 60 | seconds per side |
| Single-Leg Balance, Eyes Closed | 12 | seconds per side |
| Floor Get-Up | ≤1 arm | pass/fail |
| Deadlift | BW x 10 | reps at bodyweight |
| Grip Strength | 55 | kg per hand |
| 1-Mile Run | 7:30 | minutes |
| VO2 Max | 50 | mL/kg/min |

### FR-7: Targets & Goals

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Create SMART goals per domain with baseline, 3-month, 6-month, and 12-month targets | Must |
| FR-7.2 | Visual progress tracking: progress bars, percentage complete, on-track/behind/ahead status | Must |
| FR-7.3 | Target timeline chart: baseline → current → projected trajectory → target milestones | Should |
| FR-7.4 | Auto-update current values from integrated data sources | Must |
| FR-7.5 | Pre-seed targets from the training plan (body fat 24→18%, VO2 max ~42→50, lift targets, etc.) | Must |

### FR-8: Reviews

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8.1 | Weekly review form (every Sunday): auto-populated body/training/cardio/recovery data + manual fields for RPE trend, nutrition, wins, challenges, focus | Must |
| FR-8.2 | Monthly review form (first weekend of month): strength progress table, cardiovascular progress, stability check, program assessment, action items | Must |
| FR-8.3 | Quarterly review form: DEXA, Cooper test, strength testing, FMS, photos, blood work checklists, goal status, next quarter plan | Should |
| FR-8.4 | Auto-populate review fields by querying all integrated data for the review period | Must |
| FR-8.5 | Draft support — save incomplete reviews and return later | Must |
| FR-8.6 | Review archive with searchable history | Should |

### FR-9: Training Plan Reference

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-9.1 | Display the current weekly training schedule (Mon-Sun) | Must |
| FR-9.2 | Show workout details for each day (exercises, sets, reps, RIR targets) | Must |
| FR-9.3 | Heart rate zone reference table with user's zones | Must |
| FR-9.4 | Nutrition targets reference (calories, protein, macros) | Should |
| FR-9.5 | Progressive overload strategy and deload protocol reference | Should |

### FR-10: Settings & Integrations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | Hevy API key input with test connection and sync-now button | Must |
| FR-10.2 | Whoop OAuth connect/disconnect with connection status and sync controls | Must |
| FR-10.3 | Last sync timestamp and status display for each integration | Must |
| FR-10.4 | Webhook registration toggle for Hevy | Must |
| FR-10.5 | User profile settings: display name, height, weight unit preference, distance unit | Should |

---

## 3. Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | **Performance:** Dashboard loads in <2 seconds on desktop, <3 seconds on mobile | Must |
| NFR-2 | **Security:** All API tokens encrypted at rest (AES-256-GCM). Whoop webhook signatures validated. | Must |
| NFR-3 | **Availability:** Deployed on Vercel with automatic scaling. Cron jobs for data sync redundancy. | Must |
| NFR-4 | **Responsive:** Fully usable on mobile devices (primary use case: quick-add weight in the morning) | Must |
| NFR-5 | **Data integrity:** Raw API responses stored as JSONB. Sync logs for audit trail. | Must |
| NFR-6 | **Dark mode:** Support system-preference and manual toggle | Should |
| NFR-7 | **Offline tolerance:** App degrades gracefully when integrations fail. Manual entry always works. | Should |
| NFR-8 | **Privacy:** Single-user app with Supabase RLS. No data shared. Photos stored in private Supabase Storage bucket. | Must |

---

## 4. User Stories

### Dashboard
- **US-1:** As the user, I want to see my overall fitness status at a glance when I open the app, so I know where I stand today.
- **US-2:** As the user, I want to see today's recovery traffic light so I can decide how hard to train.
- **US-3:** As the user, I want to quickly log my morning weight without navigating deep into the app.

### Strength
- **US-4:** As the user, I want my Hevy workouts to sync automatically so I don't have to manually re-enter data.
- **US-5:** As the user, I want to see my estimated 1RM progression for key lifts over time to track strength gains.
- **US-6:** As the user, I want to be notified when I hit a new personal record.

### Recovery
- **US-7:** As the user, I want my Whoop recovery data to sync automatically and show me a clear green/yellow/red indicator.
- **US-8:** As the user, I want to see my HRV trend compared to my baseline so I can detect overtraining early.
- **US-9:** As the user, I want to see my sleep quality trends to optimize recovery.

### Body Composition
- **US-10:** As the user, I want to track my weight daily and see the 7-day rolling average to filter out noise.
- **US-11:** As the user, I want to compare progress photos side-by-side to visually track body recomposition.

### Functional Fitness
- **US-12:** As the user, I want to test and track my dead hang, farmer's walk, plank, and other functional benchmarks monthly.
- **US-13:** As the user, I want to see a radar chart comparing my current functional fitness to Attia's targets so I know where to focus.

### Reviews
- **US-14:** As the user, I want the weekly review form pre-filled with my actual data so I only need to add subjective ratings.
- **US-15:** As the user, I want a quarterly deep review that prompts me to get DEXA, Cooper test, and reassess all goals.

### Targets
- **US-16:** As the user, I want to set goals with 3/6/12 month milestones and see whether I'm on track, behind, or ahead.

---

## 5. Acceptance Criteria

### AC-1: Data Sync
- Hevy workouts appear in the app within 5 minutes of completion (webhook) or 4 hours (cron)
- Whoop recovery/sleep data appears within 5 minutes (webhook) or 2 hours (cron)
- Sync failures are logged and visible in settings. App continues functioning with stale data.

### AC-2: Calculations
- Estimated 1RM matches manual Epley calculation within 0.1 kg
- Rolling weight averages correctly handle missing days
- Traffic light status matches HRV/baseline ratio rules exactly

### AC-3: Manual Entry
- All manual entries (weight, measurements, functional tests, wellness) persist correctly and appear in relevant charts/tables
- Quick-add weight entry takes <10 seconds from dashboard

### AC-4: Reviews
- Weekly review auto-populated fields match manual spot-check of underlying data
- Draft reviews persist and can be resumed

### AC-5: Integrations
- Whoop OAuth flow completes successfully and tokens auto-refresh
- Hevy API key validation confirms connection before saving
- Webhook signatures are validated; invalid payloads are rejected with 401

---

## 6. Out of Scope (v1)

- Multi-user support
- Apple Health direct integration (manual entry for Apple Watch data)
- Native mobile app (responsive web only)
- AI-powered coaching or auto-generated workout plans
- Nutrition tracking / food logging (calorie/protein tracked in reviews only)
- Social features or sharing
- Strava / Garmin / other wearable integrations
