# Design System
## AK Fitness — Personal Fitness Tracking Dashboard

**Version:** 1.0
**Date:** January 31, 2026

---

## 1. Design Principles

1. **Data-first**: Every pixel should serve the data. Minimize decorative elements.
2. **Scannable**: Key metrics visible within 2 seconds of page load. Traffic light colors for instant status.
3. **Dark-native**: Dark mode is the primary theme (gym/evening use). Light mode as fallback.
4. **Mobile-ready**: Quick-add weight entry optimized for one-handed morning use.
5. **Consistent**: Same chart styles, card patterns, and spacing across all domains.

---

## 2. Color System

### Base Palette (CSS Variables)

```css
:root {
  /* Background layers (light mode) */
  --background: 0 0% 100%;         /* #FFFFFF - page background */
  --foreground: 240 10% 3.9%;      /* #09090B - primary text */
  --card: 0 0% 100%;               /* #FFFFFF - card background */
  --card-foreground: 240 10% 3.9%;
  --muted: 240 4.8% 95.9%;         /* #F4F4F5 - muted backgrounds */
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;          /* #E4E4E7 - borders */
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;

  /* Primary: Deep blue */
  --primary: 221 83% 53%;          /* #3B82F6 - buttons, links, active states */
  --primary-foreground: 0 0% 100%;

  /* Secondary: Subtle gray */
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;

  /* Accent: Indigo tint */
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;

  /* Destructive: Red */
  --destructive: 0 84% 60%;        /* #EF4444 */
  --destructive-foreground: 0 0% 100%;
}

.dark {
  --background: 240 10% 3.9%;      /* #09090B */
  --foreground: 0 0% 98%;          /* #FAFAFA */
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;         /* #27272A */
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;

  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 98%;
}
```

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--status-green` | `#22C55E` | `#4ADE80` | Recovery green, on-track, PRs |
| `--status-yellow` | `#EAB308` | `#FACC15` | Recovery yellow, warning, behind |
| `--status-red` | `#EF4444` | `#F87171` | Recovery red, danger, failing |
| `--chart-blue` | `#3B82F6` | `#60A5FA` | Primary chart series |
| `--chart-purple` | `#8B5CF6` | `#A78BFA` | Secondary chart series |
| `--chart-cyan` | `#06B6D4` | `#22D3EE` | Tertiary chart series |
| `--chart-orange` | `#F97316` | `#FB923C` | Highlight / 4th series |
| `--chart-pink` | `#EC4899` | `#F472B6` | 5th chart series |

### Traffic Light Colors

Used for recovery status throughout the app:

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Green | `bg-emerald-500/10` | `text-emerald-500` | CheckCircle |
| Yellow | `bg-yellow-500/10` | `text-yellow-500` | AlertTriangle |
| Red | `bg-red-500/10` | `text-red-500` | XCircle |

---

## 3. Typography

### Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```

- **Inter**: Primary font — clean, highly legible at small sizes (ideal for data-dense dashboards)
- **JetBrains Mono**: Numeric data, code blocks, metric values

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 12px | 400 | 16px | Labels, captions, chart axis |
| `text-sm` | 14px | 400/500 | 20px | Secondary text, table cells |
| `text-base` | 16px | 400 | 24px | Body text, form inputs |
| `text-lg` | 18px | 500 | 28px | Card titles, section headers |
| `text-xl` | 20px | 600 | 28px | Page section titles |
| `text-2xl` | 24px | 700 | 32px | Page titles |
| `text-3xl` | 30px | 700 | 36px | Dashboard hero metrics |
| `text-4xl` | 36px | 800 | 40px | Large metric display (1RM, weight) |

### Metric Display Convention

- Large metric values use `font-mono font-bold` for alignment
- Units displayed in `text-muted-foreground text-sm` beside the value
- Trend arrows: `↑` green, `↓` red, `→` muted

---

## 4. Spacing & Layout

### Spacing Scale

Base unit: **4px** (Tailwind default)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` / `p-1` | 4px | Tight icon padding |
| `gap-2` / `p-2` | 8px | Inline element spacing |
| `gap-3` / `p-3` | 12px | Compact card padding |
| `gap-4` / `p-4` | 16px | Standard card padding, grid gaps |
| `gap-6` / `p-6` | 24px | Section padding, card content |
| `gap-8` | 32px | Page section spacing |

### Layout Grid

```
Desktop (≥1024px):
┌─────────┬──────────────────────────────────────┐
│ Sidebar │           Main Content               │
│  (256px)│  ┌──────────────────────────────────┐ │
│         │  │  Header (breadcrumb + actions)   │ │
│  Fixed  │  ├──────────────────────────────────┤ │
│         │  │                                  │ │
│         │  │  Content area (max-w-7xl mx-auto)│ │
│         │  │                                  │ │
│         │  │  Grid: 1-4 columns responsive    │ │
│         │  │                                  │ │
│         │  └──────────────────────────────────┘ │
└─────────┴──────────────────────────────────────┘

Tablet (768-1023px):
┌──────────────────────────────────────┐
│  Header (hamburger + title + actions)│
├──────────────────────────────────────┤
│                                      │
│  Content area (full width, px-4)     │
│  Grid: 1-2 columns                  │
│                                      │
└──────────────────────────────────────┘
+ Slide-over sidebar on hamburger tap

Mobile (<768px):
┌──────────────────────────────────────┐
│  Header (hamburger + title)          │
├──────────────────────────────────────┤
│                                      │
│  Content area (full width, px-4)     │
│  Grid: 1 column                      │
│                                      │
├──────────────────────────────────────┤
│  Bottom nav (5 icons)                │
└──────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Value | Layout |
|-----------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet — switch to 2-col grid, hide bottom nav |
| `lg` | 1024px | Desktop — show sidebar |
| `xl` | 1280px | Wide desktop — wider cards |
| `2xl` | 1536px | Ultra-wide — max content width |

---

## 5. Component Patterns

### Card

The primary content container. All dashboard sections use cards.

```
┌─────────────────────────────────┐
│  Title              Action btn  │  ← CardHeader (p-6 pb-2)
│  Description                    │
├─────────────────────────────────┤
│                                 │  ← CardContent (p-6 pt-0)
│  [content / chart / form]       │
│                                 │
└─────────────────────────────────┘

Classes: rounded-xl border bg-card shadow-sm
```

### Status Card (Dashboard)

```
┌──────────────────────────┐
│  🏋️ Strength        ↗   │  ← Icon + domain name + trend
│                          │
│  105 kg                  │  ← Hero metric (font-mono text-3xl)
│  Bench 1RM               │  ← Metric label (text-muted-foreground)
│                          │
│  ▁▂▃▅▇ (sparkline)       │  ← 30-day trend sparkline
│  +3.2% this month        │  ← Change indicator
└──────────────────────────┘
```

### Traffic Light Card

```
┌──────────────────────────┐
│  ● Recovery Status       │
│                          │
│     🟢 GREEN             │  ← Large colored indicator
│   "Train as planned"     │  ← Recommendation text
│                          │
│  HRV: 72ms  RHR: 54bpm  │  ← Supporting metrics
│  Sleep: 7h 42m           │
└──────────────────────────┘
```

### Progress Bar

```
Target: Body Fat 18%
┌──────────────────────────────────────┐
│ ████████████████░░░░░░░░ 67%        │  ← bg-primary rounded-full
└──────────────────────────────────────┘
Current: 20.1%    Target: 18%

Colors by status:
  On track (>90% pace): bg-emerald-500
  Slightly behind (70-90%): bg-yellow-500
  Behind (<70%): bg-red-500
```

### Benchmark Card (Functional Fitness)

```
┌──────────────────────────┐
│  Dead Hang               │
│                          │
│  85s / 120s              │  ← Current / Target
│  ████████░░░░ 71%        │  ← Progress bar
│                          │
│  PR: 85s (Jan 15)        │  ← Personal record
│  Last test: Jan 15       │  ← Last tested date
│  ↑ +10s from previous    │  ← Trend
└──────────────────────────┘
```

---

## 6. Chart Guidelines

### General Rules

- Dark background charts: use semi-transparent fills (`opacity: 0.1` for area fills)
- Axis labels: `text-xs text-muted-foreground`
- Grid lines: `stroke: var(--border)` with `strokeDasharray: "3 3"`
- Tooltip: Dark bg, rounded, shadow, showing exact values
- Legend: Below chart, horizontal, `text-sm`
- Responsive: Charts fill container width, min-height 200px on mobile

### Chart Color Assignment

| Series Position | Color Token | Hex (dark) |
|----------------|-------------|------------|
| Primary | `--chart-blue` | `#60A5FA` |
| Secondary | `--chart-purple` | `#A78BFA` |
| Tertiary | `--chart-cyan` | `#22D3EE` |
| 4th | `--chart-orange` | `#FB923C` |
| 5th | `--chart-pink` | `#F472B6` |
| Reference line | `--muted-foreground` | dashed |
| Target line | `--status-green` | dashed |

### Chart Types by Use Case

| Chart | Component | Used In |
|-------|-----------|---------|
| Line (time series) | `<LineChart>` | Weight, HRV, RHR, 1RM progression, VO2 max |
| Line + Area | `<AreaChart>` | Rolling averages (fill under line) |
| Bar (grouped) | `<BarChart>` | Weekly volume by muscle group |
| Stacked Bar | `<BarChart>` | Sleep stages, HR zone distribution |
| Radar / Spider | `<RadarChart>` | Functional fitness vs Attia targets |
| Progress Ring | Custom SVG | Dashboard status cards, target completion |
| Sparkline | `<LineChart>` (minimal) | Inline mini-trends in status cards |

### Sparkline Spec

- No axes, no labels, no grid
- Height: 32px, stroke width: 1.5px
- Color: `--chart-blue` (neutral) or `--status-green`/`--status-red` (directional)
- 30 data points (last 30 days)

### Radar Chart Spec (Functional Fitness)

- 12 axes (one per Attia benchmark)
- Two series: Current (filled, semi-transparent blue) and Target (dashed outline, green)
- Scale: 0-100% (normalized against target)
- Labels positioned outside the chart

---

## 7. Navigation

### Sidebar Items

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Dashboard | `/` |
| Dumbbell | Strength | `/strength` |
| Heart | Cardio | `/cardio` |
| Moon | Recovery | `/recovery` |
| Scale | Body | `/body` |
| Target | Functional | `/functional` |
| Flag | Targets | `/targets` |
| ClipboardList | Reviews | `/reviews` |
| BookOpen | Plan | `/plan` |
| Settings | Settings | `/settings` |

### Mobile Bottom Nav (5 items)

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Home | `/` |
| Dumbbell | Strength | `/strength` |
| Moon | Recovery | `/recovery` |
| Target | Functional | `/functional` |
| Menu | More | Opens sheet with full nav |

---

## 8. Form Patterns

### Input Fields

- Use shadcn/ui `<Input>` with `<Label>` above
- Numeric inputs: `type="number"` with `step` attribute
- Date inputs: `type="date"` with date-fns formatting
- Select inputs: shadcn/ui `<Select>` for dropdowns
- Validation: Zod schemas, errors shown below input in `text-sm text-destructive`

### Quick-Add Widget

Floating action or inline card on dashboard:

```
┌──────────────────────────────────────┐
│  Quick Add                           │
│                                      │
│  [Weight: _____ kg]  [Save]          │
│                                      │
│  [Energy: 1-5 ●●●●○] [Mood: 1-5]   │
│  [Soreness: 1-5]     [Stress: 1-5]  │
│  [VO2 Max: _____ mL/kg/min] [Save]  │
└──────────────────────────────────────┘
```

### Rating Input (1-5 scale)

Interactive circle selector:
- 5 circles in a row, filled up to selected value
- Colors: 1-2 red, 3 yellow, 4-5 green
- Click to select, shows numeric value

---

## 9. Loading & Empty States

### Loading Skeleton

- Use `animate-pulse` on `bg-muted rounded` blocks
- Match the exact layout of the content being loaded
- Cards: full skeleton with title bar + content blocks
- Charts: rectangle skeleton at chart dimensions
- Tables: row skeletons with alternating widths

### Empty States

Centered in the card content area:

```
┌──────────────────────────────────┐
│                                  │
│        [Illustration/Icon]       │
│                                  │
│     No workouts synced yet       │  ← text-lg font-medium
│   Connect Hevy in Settings to    │  ← text-muted-foreground
│     start tracking strength      │
│                                  │
│     [Go to Settings →]           │  ← Primary button
│                                  │
└──────────────────────────────────┘
```

---

## 10. Animation & Transitions

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | None (instant via App Router) | — |
| Sidebar open/close | `transition-transform` slide | 200ms |
| Cards appearing | `animate-in fade-in` | 150ms |
| Progress bars | Width transition on mount | 500ms ease-out |
| Traffic light change | Color + scale pulse | 300ms |
| Toast notifications | Slide in from bottom-right | 200ms |
| Chart data update | Recharts built-in animation | 300ms |
| PR celebration | Scale bounce + confetti burst | 600ms |

---

## 11. Dark Mode Implementation

- CSS variables switch via `.dark` class on `<html>`
- Detected from `prefers-color-scheme` on first load
- Manual toggle stored in `localStorage`
- Tailwind `dark:` variants for any overrides
- Charts adapt via CSS variable references

```tsx
// Theme toggle stores preference
const toggleTheme = () => {
  const next = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', next);
};
```

---

## 12. Accessibility

- All interactive elements have visible focus rings (`ring-2 ring-ring ring-offset-2`)
- Color is never the sole indicator — always paired with icon or text
- Traffic light: color + icon (CheckCircle, AlertTriangle, XCircle) + text label
- Chart tooltips accessible via keyboard (Recharts `accessibilityLayer`)
- Form labels associated with inputs via `htmlFor`
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text
- Skip-to-content link on dashboard layout
