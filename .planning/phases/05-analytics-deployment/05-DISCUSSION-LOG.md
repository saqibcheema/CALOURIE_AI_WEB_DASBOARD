# Phase 5: Analytics + Deployment — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 05-analytics-deployment
**Areas discussed:** Firestore data shape, Analytics vs Overview page, Bar chart design, Deployment strategy

---

## Firestore Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Daily aggregate documents | One doc per day (ID = YYYY-MM-DD), fields: meals_logged, vision_uses, barcode_scans, unique_devices | ✓ |
| Per-event documents | One doc per event with timestamp, API aggregates them | |
| Not set up yet | Define schema now, Android writes later | |

**User's choice:** Daily aggregate documents
**Notes:** None — straightforward choice.

### Field Names Sub-question

| Option | Description | Selected |
|--------|-------------|----------|
| Use mock data names | meals_logged, vision_uses, barcode_scans, unique_devices — matches existing dashboard/page.tsx mocks | ✓ |
| Different names | Custom field names from Android app | |

**User's choice:** Use mock data names (meals_logged, vision_uses, barcode_scans, unique_devices)

---

## Analytics vs Overview Page

| Option | Description | Selected |
|--------|-------------|----------|
| Replace Overview mocks with real data | Wire /dashboard/page.tsx to fetch from /api/analytics | |
| Build separate /dashboard/analytics page | New page at /dashboard/analytics, keep Overview separate | ✓ |
| Both — replace Overview AND add analytics page | Overview gets today's real numbers, Analytics shows 7-day chart | |

**User's choice:** Separate /dashboard/analytics page

### Overview mocks sub-question

| Option | Description | Selected |
|--------|-------------|----------|
| Leave Overview mocks as-is | Overview keeps hardcoded mock numbers | |
| Replace Overview mocks with today's real data too | Overview fetches today's Firestore doc, Analytics shows 7-day history | ✓ |

**User's choice:** Replace Overview mocks with real data too
**Notes:** Both pages are real. Overview = today's snapshot. Analytics = 7-day history + chart.

---

## Bar Chart Design

| Option | Description | Selected |
|--------|-------------|----------|
| Full labeled bar chart | ~250px tall, day-of-week X axis, arctic-500 bars | ✓ |
| Compact grouped bars | 4 colored bars per day (all metrics side-by-side) | |

**User's choice:** Full labeled bar chart

### Metric selector sub-question

| Option | Description | Selected |
|--------|-------------|----------|
| Meals Logged only | Single metric, simpler | |
| Switchable metric | Tabs/dropdown to switch between all 4 metrics | ✓ |

**User's choice:** Switchable metric (tabs above the chart)

---

## Deployment Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Firebase App Hosting | Cloud Run-backed, full Next.js support, Blaze plan required | ✓ |
| Vercel | Free, zero-config for Next.js, Firebase remains for backend | |
| Firebase Hosting + static export | Breaks API routes — not recommended | |

**User's choice:** Firebase App Hosting

### GitHub repo sub-question

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, I have a GitHub repo | App Hosting connects to it for auto-deploy | ✓ |
| No GitHub repo yet | Set one up in Phase 5 | |

**User's choice:** Yes, GitHub repo exists

---

## Claude's Discretion

- Recharts BarChart margin/padding values
- Tooltip on bar chart hover (recommended: yes)
- Loading skeleton height for bar chart area
- Whether Overview re-fetches on window focus or only on mount

## Deferred Ideas

- Real-time analytics (Firestore onSnapshot) — out of scope per PROJECT.md
- Export analytics as CSV — v2 scope
- Per-feature-flag analytics — not in Firestore schema
- Longer time ranges (30-day, 90-day) — future enhancement
