# Phase 5: Analytics + Deployment — Research

**Date:** 2026-05-10
**Phase:** 05 — Analytics + Deployment
**Requirements:** ANLYT-01, ANLYT-02, ANLYT-03, DEPLOY-01, DEPLOY-02, DEPLOY-03

---

## RESEARCH COMPLETE

---

## 1. Codebase Audit

### 1.1 Existing API Route Pattern

`app/api/remote-config/get/route.ts` establishes the canonical pattern for all API routes:

```ts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Extract Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '...' }, { status: 401 });
  }
  const token = authHeader.split('Bearer ')[1];
  // 2. Verify with Admin SDK
  await adminAuth.verifyIdToken(token);
  // 3. Do work
  // 4. Return NextResponse.json(...)
}
```

`/api/analytics/route.ts` MUST follow this exact pattern. Same 4-step structure, same error handling branches (401 for auth errors, 500 for others).

### 1.2 Firebase Admin SDK State

`lib/firebase-admin.ts` currently exports:
```ts
export const adminAuth = admin.auth();
export const remoteConfig = admin.remoteConfig();
```

**Missing:** `export const db = admin.firestore()` — must be added. The Admin SDK initializes with the project ID already set (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`), so Firestore connects to the project's default database automatically. No region setting required in code — region is fixed when the Firestore database was created in Firebase Console (asia-south1).

### 1.3 Environment Variables Required

From `lib/firebase-client.ts` and `lib/firebase-admin.ts`:

| Variable | Side | Type |
|----------|------|------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | client + server | plain |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | client | plain |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | client | plain |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | client | plain |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | plain |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | plain |
| `FIREBASE_CLIENT_EMAIL` | server only | secret |
| `FIREBASE_PRIVATE_KEY` | server only | secret |

No `.env.local` file exists in the project root — the user has environment variables set through another mechanism (likely OS environment or IDE). For deployment, all must be declared in `apphosting.yaml`.

### 1.4 Next.js Config

`next.config.mjs` is empty (`const nextConfig = {}`). No changes needed for Firebase App Hosting deployment. App Hosting handles the Next.js build process internally.

### 1.5 All 6 Pages (for DEPLOY-02)

The dashboard has exactly 6 pages requiring verification on the live URL:
1. `/dashboard` — Overview
2. `/dashboard/analytics` — **new (Phase 5)**
3. `/dashboard/api-keys`
4. `/dashboard/ai-models`
5. `/dashboard/feature-flags`
6. `/dashboard/maintenance`

---

## 2. Firestore Admin SDK — Analytics Query

### 2.1 Adding Firestore Export

```ts
// lib/firebase-admin.ts — add after existing exports
export const db = admin.firestore();
```

No additional initialization needed. `firebase-admin` v12 auto-detects the Firestore database from the project credentials already provided.

### 2.2 Date Range Strategy

For the last 7 calendar days, generate date strings client-side:

```ts
function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]); // 'YYYY-MM-DD'
  }
  return dates; // oldest first, today last
}
```

### 2.3 Fetch Strategy: Parallel Individual Doc Gets (Recommended)

**Why not a range query?** Querying by document ID range (`orderBy(FieldPath.documentId()).startAt(...).endAt(...)`) requires a composite index if combined with other filters, and adds index-creation overhead. Since we always need exactly 7 specific docs, parallel `get()` calls are simpler, faster, and more predictable.

```ts
import { db, adminAuth } from '@/lib/firebase-admin';

const dates = getLast7Dates(); // ['2026-05-04', ..., '2026-05-10']
const refs = dates.map(date => db.collection('app_analytics').doc(date));
const snaps = await Promise.all(refs.map(ref => ref.get()));

const trend = snaps.map((snap, i) => {
  const data = snap.exists ? snap.data()! : {};
  const date = dates[i];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[new Date(date + 'T00:00:00').getDay()];
  return {
    date,
    day: dayName,
    meals_logged: (data.meals_logged as number) ?? 0,
    vision_uses: (data.vision_uses as number) ?? 0,
    barcode_scans: (data.barcode_scans as number) ?? 0,
    unique_devices: (data.unique_devices as number) ?? 0,
  };
});

const today = trend[trend.length - 1]; // last element is today
return NextResponse.json({ today, trend });
```

**Zero-fill:** When a doc doesn't exist (`!snap.exists`), all fields default to `0`. No conditional handling needed downstream.

**Firestore reads cost:** 7 reads per request. Firestore free tier = 50K reads/day. Negligible for a single-admin dashboard.

---

## 3. Analytics API Route — Full Pattern

```ts
// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const dates = getLast7Dates();
    const refs = dates.map(d => db.collection('app_analytics').doc(d));
    const snaps = await Promise.all(refs.map(r => r.get()));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const trend = snaps.map((snap, i) => {
      const data = snap.exists ? snap.data()! : {};
      return {
        date: dates[i],
        day: dayNames[new Date(dates[i] + 'T00:00:00').getDay()],
        meals_logged: (data.meals_logged as number) ?? 0,
        vision_uses: (data.vision_uses as number) ?? 0,
        barcode_scans: (data.barcode_scans as number) ?? 0,
        unique_devices: (data.unique_devices as number) ?? 0,
      };
    });

    return NextResponse.json({ today: trend[trend.length - 1], trend });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('ID token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
```

---

## 4. Recharts BarChart Integration

### 4.1 Import (same file must have `'use client'`)

```ts
'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
```

`recharts@2.15.4` already installed. No new dependency.

### 4.2 Controlled Metric State

```ts
type MetricKey = 'meals_logged' | 'vision_uses' | 'barcode_scans' | 'unique_devices';
const [activeMetric, setActiveMetric] = useState<MetricKey>('meals_logged');
```

Tab click → `setActiveMetric('vision_uses')` → `<Bar dataKey={activeMetric}>` re-renders. No loading state needed — it's a pure React re-render with existing in-memory data.

### 4.3 Bar Radius

Recharts `<Bar>` `radius` prop accepts `[topLeft, topRight, bottomRight, bottomLeft]`:
```tsx
<Bar dataKey={activeMetric} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
```

### 4.4 Tooltip Formatting

```tsx
<Tooltip
  contentStyle={{
    borderRadius: '7px',
    border: '1px solid #e2e8f0',
    fontSize: 12,
    boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
  }}
  cursor={{ fill: '#f0f9ff' }}
  formatter={(value: number) => [value.toLocaleString(), '']}
/>
```

---

## 5. Trend Percentage Calculation

```ts
function calcTrend(today: number, sevenDaysAgo: number): string | null {
  if (sevenDaysAgo === 0) return null; // avoid division by zero
  const pct = ((today - sevenDaysAgo) / sevenDaysAgo * 100).toFixed(1);
  return pct;
}
```

`sevenDaysAgo` = `trend[0][metric]` (oldest day in the 7-day window).
`today` = `trend[6][metric]`.

Display:
- positive pct → `IconTrendingUp` (emerald-500) + `+{pct}%`
- negative pct → `IconTrendingDown` (red-500) + `{pct}%`
- `null` → `"No prior data"` (slate-400, no icon)

---

## 6. Firebase App Hosting Deployment

### 6.1 What Firebase App Hosting Is

Firebase App Hosting (distinct from classic Firebase Hosting) is a Cloud Run-backed platform that natively supports Next.js 14 App Router including:
- Server Components
- API Routes (`app/api/*`)
- Dynamic rendering
- Edge/Node runtime
- Environment variable injection at build and runtime

**Requires:** Blaze (pay-as-you-go) plan. Free tier included: 360K vCPU-seconds/month, 180K GiB-seconds/month, 10 concurrent requests default.

### 6.2 `apphosting.yaml` Schema

Must be in the project root:

```yaml
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0

env:
  # Public vars — exposed at BUILD and RUNTIME (needed for Next.js NEXT_PUBLIC_ prefix)
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    availability:
      - BUILD
      - RUNTIME

  # Secret vars — use Firebase Secret Manager, only RUNTIME
  - variable: FIREBASE_CLIENT_EMAIL
    secret: firebase-client-email
    availability:
      - RUNTIME
  - variable: FIREBASE_PRIVATE_KEY
    secret: firebase-private-key
    availability:
      - RUNTIME
```

**Critical:** `NEXT_PUBLIC_*` vars must have `BUILD` availability or they will be `undefined` in the client bundle.

### 6.3 Firebase Secret Manager Setup (for FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)

Before first deployment:
```bash
# In Firebase Console → App Hosting → Secrets, or via CLI:
firebase apphosting:secrets:set firebase-client-email
firebase apphosting:secrets:set firebase-private-key
```

### 6.4 Plain Variable Values

`NEXT_PUBLIC_*` variable values are set in Firebase Console → App Hosting → Backend → Environment variables section (not in `apphosting.yaml` values — the yaml just declares them, values are set in the console).

### 6.5 Deployment Flow

1. Push code to GitHub (main branch)
2. Firebase App Hosting auto-detects the push and triggers a build
3. Build runs `npm run build` in a Cloud Run environment
4. On success, traffic is switched to the new revision

Manual deploy also available via Firebase CLI:
```bash
firebase apphosting:backends:create  # first time only
firebase deploy --only apphosting   # or via GitHub auto-deploy
```

### 6.6 `firebase.json` — No Changes Needed

Firebase App Hosting does NOT use the `hosting` section of `firebase.json`. The current minimal `firebase.json` is sufficient. Do not add a `hosting` key.

---

## 7. Analytics Type Definitions

```ts
// Shared type for API response
export interface AnalyticsTrendPoint {
  date: string;   // 'YYYY-MM-DD'
  day: string;    // 'Mon', 'Tue', etc.
  meals_logged: number;
  vision_uses: number;
  barcode_scans: number;
  unique_devices: number;
}

export interface AnalyticsResponse {
  today: AnalyticsTrendPoint;
  trend: AnalyticsTrendPoint[]; // length = 7, oldest first
}
```

Define in `lib/analytics.ts` or inline in the page component (inline preferred for simplicity since it's only used in one place).

---

## 8. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `FIREBASE_PRIVATE_KEY` has `\n` in env var (common Firebase gotcha) | HIGH | Already handled in `firebase-admin.ts`: `privateKey.replace(/\\n/g, '\n')` |
| `app_analytics` collection doesn't exist yet | MEDIUM | Zero-fill strategy handles missing docs gracefully — API returns zeros |
| `NEXT_PUBLIC_*` vars undefined in deployed client bundle | MEDIUM | Must set `availability: [BUILD, RUNTIME]` in apphosting.yaml |
| Date calculation returns wrong day on server (UTC vs local) | MEDIUM | Use `d.toISOString().split('T')[0]` — server always in UTC; Android should write UTC-based date IDs |
| Firebase Secret Manager secrets not created before first deploy | MEDIUM | Document as pre-deployment step in plan |
| `recharts` server component issue | LOW | Analytics page is `'use client'` — BarChart renders client-side only |

---

## 9. Validation Architecture

### Unit-Verifiable Items
- `lib/firebase-admin.ts` exports `db` (grep: `export const db`)
- `app/api/analytics/route.ts` exists (file exists check)
- `app/api/analytics/route.ts` has `export const dynamic = 'force-dynamic'` (grep)
- `apphosting.yaml` exists at project root (file exists check)
- `apphosting.yaml` contains all 8 env vars (grep each variable name)
- `app/dashboard/analytics/page.tsx` exists (file exists check)
- `dashboard/page.tsx` no longer contains `MOCK_STATS` or `MOCK_TREND_DATA` (grep absence)

### Integration-Verifiable Items
- `npm run build` exits 0 (no TypeScript errors)
- API route responds correctly (manual curl or browser network tab)
- Analytics page renders stat cards and bar chart with loaded data
- Metric tabs switch chart dataKey correctly

### Deployment-Verifiable Items
- `apphosting.yaml` present before GitHub push
- All 6 page routes return 200 on live URL
- Remote Config publish from live URL updates Firebase (check Firebase Console)
