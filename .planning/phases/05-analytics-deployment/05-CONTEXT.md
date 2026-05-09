# Phase 5: Analytics + Deployment — Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Two deliverables:

1. **Analytics data layer** — `GET /api/analytics` route queries Firestore `app_analytics` collection (last 7 days of daily aggregate documents), returns structured JSON for the dashboard.

2. **Two pages updated with real data:**
   - `/dashboard` (Overview) — replace mock stat cards with today's real Firestore numbers
   - `/dashboard/analytics` (new) — 4 stat cards (today's totals) + full labeled bar chart (7-day trend, switchable metric)

3. **Firebase App Hosting deployment** — `apphosting.yaml` config, GitHub repo connected, all 6 pages verified on live URL, Remote Config publish tested from live dashboard.

No new shared infrastructure. All API calls use existing `useAuthFetch`. Bar chart uses existing Recharts installation.
</domain>

<decisions>
## Implementation Decisions

### Firestore Data Schema
- **D-01:** Collection: `app_analytics`
- **D-02:** Document ID format: `YYYY-MM-DD` (e.g. `2026-05-10`)
- **D-03:** Document fields: `meals_logged` (number), `vision_uses` (number), `barcode_scans` (number), `unique_devices` (number)
- **D-04:** API route reads the last 7 calendar days by doc ID range — no timestamp fields needed
- **D-05:** If a day has no document (no app usage that day), API zero-fills that day's values

### API Route
- **D-06:** `GET /api/analytics` — protected with Firebase Auth Bearer token (same pattern as `/api/remote-config/get`)
- **D-07:** Response shape:
  ```json
  {
    "today": { "meals_logged": 210, "vision_uses": 45, "barcode_scans": 32, "unique_devices": 18 },
    "trend": [
      { "date": "2026-05-04", "day": "Sun", "meals_logged": 120, "vision_uses": 30, "barcode_scans": 22, "unique_devices": 10 },
      ...7 days total
    ]
  }
  ```
- **D-08:** Firestore region: `asia-south1` — must pass `{ preferRest: true }` or set `databaseURL`; `firebase-admin.ts` needs `admin.firestore()` export added

### Overview Page Update
- **D-09:** `/dashboard/page.tsx` — replace `MOCK_STATS` with a `useEffect` fetch to `/api/analytics`; show today's 4 values in the existing `StatCard` grid
- **D-10:** Keep existing trend arrows on Overview — compute % change vs 7 days ago using the trend array returned by the API
- **D-11:** Existing `SparklineChart` on Overview — wire to `trend[].meals_logged` (real data replaces `MOCK_TREND_DATA`)

### Analytics Page
- **D-12:** New file: `app/dashboard/analytics/page.tsx`
- **D-13:** Same 4 stat cards as Overview (today's totals) + a section below with the 7-day bar chart
- **D-14:** Bar chart style: full labeled `BarChart` from Recharts (~250px tall), X axis = day abbreviations (`Mon`, `Tue`...), Y axis visible, bars colored `arctic-500` (`#0ea5e9`)
- **D-15:** Metric selector: tabs (not dropdown) above the chart — 4 tabs: "Meals Logged" / "AI Vision" / "Barcode Scans" / "Unique Devices"; selected tab changes which field is visualized
- **D-16:** Both pages share the same `/api/analytics` fetch — no duplicate Firestore queries

### Deployment — Firebase App Hosting
- **D-17:** Use **Firebase App Hosting** (not classic Firebase Hosting) — supports Next.js App Router + API routes natively via Cloud Run
- **D-18:** Requires Blaze (pay-as-you-go) plan — user has confirmed GitHub repo exists
- **D-19:** Config file: `apphosting.yaml` in project root — declares env vars (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- **D-20:** Deploy flow: Firebase console → App Hosting → connect GitHub repo → auto-deploy on push to main
- **D-21:** `firebase.json` — update to add App Hosting backend config (or leave minimal; App Hosting doesn't strictly need `firebase.json` for hosting section)
- **D-22:** Verify checklist: all 6 pages load, publish a Remote Config value, check Firebase console to confirm value updated

### Agent's Discretion
- Exact Recharts `BarChart` margin/padding values
- Whether to show a tooltip on bar chart hover (recommended: yes, Recharts `<Tooltip />`)
- Loading skeleton height for bar chart area
- Whether Overview page re-fetches on window focus or only on mount
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Reusable Infrastructure
- `lib/firebase-admin.ts` — Firebase Admin init; **must add** `export const db = admin.firestore()` with region config
- `lib/useAuthFetch.ts` — client-side authenticated fetch hook; use for all `/api/analytics` calls
- `app/api/remote-config/get/route.ts` — reference pattern for authenticated API route with Admin SDK
- `contexts/UnsavedChangesContext.tsx` — already wired; no changes needed for analytics

### Existing UI Components (reuse, don't recreate)
- `components/StatCard.tsx` — accepts `title`, `value`, `icon`, `trend`; used by both pages
- `components/SparklineChart.tsx` — Recharts LineChart wrapper; already in Overview; wire to real data
- `app/dashboard/page.tsx` — replace MOCK_STATS and MOCK_TREND_DATA with real API data

### Design Tokens
- `tailwind.config.ts` — `arctic-500` = `#0ea5e9` for bar chart color; `rounded-card` = 10px for chart container

### Requirements (Phase 5)
- ANLYT-01, ANLYT-02, ANLYT-03 — `.planning/REQUIREMENTS.md` lines 84–86
- DEPLOY-01, DEPLOY-02, DEPLOY-03 — `.planning/REQUIREMENTS.md` lines 99–101

### Deployment Docs
- Firebase App Hosting: https://firebase.google.com/docs/app-hosting — `apphosting.yaml` schema, GitHub integration steps
- No external specs — all decisions captured above
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatCard` component: drop-in for both Overview and Analytics page stat cards
- `SparklineChart`: already in Overview — wire `data` prop to `trend[].meals_logged` from API
- Recharts `BarChart`: same library as SparklineChart — no new install needed; import `BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer` from `recharts`
- `useAuthFetch` hook: drop-in for `/api/analytics` fetch (same pattern as every other page)

### Established Patterns
- Pages fetch on mount via `useEffect` → `fetchWithAuth('/api/analytics')` → parse JSON
- Loading: `animate-pulse` skeleton cards (match existing pages)
- Error: red `bg-red-50 border-red-200` banner with Retry button
- API routes: import `firebase-admin.ts`, verify Bearer token via `adminAuth.verifyIdToken()`, return JSON

### Integration Points
- `firebase-admin.ts` needs one new export: `export const db = admin.firestore()`
- `app/api/analytics/route.ts`: new file — query `db.collection('app_analytics')`, filter last 7 days by doc ID
- `app/dashboard/analytics/page.tsx`: new file — tabs + BarChart + StatCards
- `app/dashboard/page.tsx`: replace static mocks with real fetch
</code_context>

<specifics>
## Specific Ideas

- Bar chart metric tabs: render as a small tab strip above the chart (similar to how AI Models page uses provider tabs) — active tab highlighted in `arctic-500`, inactive in `slate-400`
- The `today` field in API response is just `trend[trend.length - 1]` — no need for a separate Firestore query; compute it server-side from the 7-day fetch
- Trend % on Overview stat cards: `((today - sevenDaysAgo) / sevenDaysAgo * 100).toFixed(1)` — show with `IconTrendingUp` (green) or `IconTrendingDown` (red)
</specifics>

<deferred>
## Deferred Ideas

- **Real-time analytics (WebSocket/onSnapshot)**: Live Firestore listeners — out of scope per PROJECT.md (no real-time sync, single admin, manual refresh sufficient)
- **Export analytics as CSV**: Admin downloads 7-day data — v2 scope (AUDIT-03 area)
- **Per-feature-flag analytics**: How many users hit a disabled flag — out of scope, not in Firestore schema
- **Longer time ranges (30-day, 90-day)**: Only 7 days required — future enhancement

None — discussion stayed within phase scope.
</deferred>

---
*Phase: 05-analytics-deployment*
*Context gathered: 2026-05-10*
