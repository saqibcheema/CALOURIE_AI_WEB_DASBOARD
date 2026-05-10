---
wave: 2
depends_on:
  - 01-PLAN-Firestore-Admin-API
files_modified:
  - app/dashboard/page.tsx
autonomous: true
requirements:
  - ANLYT-01
---

# Plan 03 — Overview Page: Replace Mocks with Real Data

## Goal

Replace `MOCK_STATS` and `MOCK_TREND_DATA` constants in `app/dashboard/page.tsx` with a `useEffect` fetch to `/api/analytics`. Today's numbers feed the stat cards; the 7-day trend feeds the existing SparklineChart. Trend percentages are computed from real data.

---

## Tasks

### Task 3.1 — Rewrite `app/dashboard/page.tsx` with real data fetch

<read_first>
- `app/dashboard/page.tsx` — read the FULL current file; note all imports, MOCK_* constants, JSX structure, and SparklineChart usage; preserve all layout classNames exactly
- `components/StatCard.tsx` — props: title, value, icon, trend (ReactNode)
- `components/SparklineChart.tsx` — props: data (Array<{ value: number }>), color
- `lib/useAuthFetch.ts` — fetchWithAuth signature
- `app/dashboard/analytics/page.tsx` — reference the TrendPoint type and buildTrend helper already written there (replicate, do not import cross-page)
</read_first>

<action>
Replace the entire contents of `app/dashboard/page.tsx` with a client component that:

1. Adds `'use client'` directive at the top
2. Imports: `useCallback, useEffect, useState` from react; `IconSalad, IconEye, IconBarcode, IconDevices, IconTrendingUp, IconTrendingDown, IconAlertCircle` from @tabler/icons-react; `StatCard` from @/components/StatCard; `SparklineChart` from @/components/SparklineChart; `ConfigChangesTable` from @/components/ConfigChangesTable; `useAuthFetch` from @/lib/useAuthFetch
3. Defines the same `TrendPoint` / `AnalyticsData` types and `buildTrend` helper as the analytics page (inline — not shared)
4. Fetches from `/api/analytics` on mount using `useAuthFetch`
5. Shows `animate-pulse` skeletons while loading (4 card skeletons `h-[120px]` + 1 chart skeleton `h-[160px]` + ConfigChangesTable unchanged at bottom)
6. Shows error state (same `bg-red-50 border-red-200` pattern with Retry) on failure
7. On success: maps today's values to 4 StatCards with trend computed via `buildTrend(today.X, trend[0].X)`; maps `trend` array to `SparklineChart data` prop as `trend.map(p => ({ value: p.meals_logged }))`
8. Preserves `ConfigChangesTable` at the bottom unconditionally (not gated on loading/error)
9. Preserves ALL existing layout classNames exactly: `space-y-6 p-6 bg-slate-50 min-h-screen`, grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`, chart wrapper `bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] p-6`
10. Page header: h1 `Overview`, p `Welcome to the Calourie AI Admin Dashboard.` (unchanged copy)
11. SparklineChart section label: `7-Day Meal Log Trend` (unchanged)

The full replacement file:

```tsx
'use client';

import { useCallback, useEffect, useState, ReactNode } from 'react';
import {
  IconSalad,
  IconEye,
  IconBarcode,
  IconDevices,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertCircle,
} from '@tabler/icons-react';
import { StatCard } from '@/components/StatCard';
import { SparklineChart } from '@/components/SparklineChart';
import { ConfigChangesTable } from '@/components/ConfigChangesTable';
import { useAuthFetch } from '@/lib/useAuthFetch';

interface TrendPoint {
  date: string;
  day: string;
  meals_logged: number;
  vision_uses: number;
  barcode_scans: number;
  unique_devices: number;
}

interface AnalyticsData {
  today: TrendPoint;
  trend: TrendPoint[];
}

function buildTrend(today: number, sevenDaysAgo: number): ReactNode {
  if (sevenDaysAgo === 0) {
    return <span className="text-slate-400">No prior data</span>;
  }
  const pct = ((today - sevenDaysAgo) / sevenDaysAgo * 100).toFixed(1);
  const isUp = parseFloat(pct) >= 0;
  return (
    <>
      {isUp
        ? <IconTrendingUp size={14} className="text-emerald-500" />
        : <IconTrendingDown size={14} className="text-red-500" />}
      <span className={isUp ? 'text-emerald-500' : 'text-red-500'}>
        {isUp ? '+' : ''}{pct}%
      </span>{' '}
      vs last week
    </>
  );
}

export default function DashboardOverviewPage() {
  const { fetchWithAuth } = useAuthFetch();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500">Welcome to the Calourie AI Admin Dashboard.</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[120px] rounded-[10px] bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-[160px] rounded-[10px] bg-slate-200 animate-pulse" />
        </>
      ) : error || !data ? (
        <div className="rounded-[10px] bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <IconAlertCircle size={20} className="text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Failed to load analytics data</p>
            <p className="text-xs text-red-500 mt-0.5">Check your connection and try again</p>
          </div>
          <button onClick={fetchData} className="text-xs text-red-600 underline font-medium">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Meals Logged"
              value={data.today.meals_logged.toLocaleString()}
              icon={<IconSalad size={20} />}
              trend={buildTrend(data.today.meals_logged, data.trend[0].meals_logged)}
            />
            <StatCard
              title="AI Vision Uses"
              value={data.today.vision_uses.toLocaleString()}
              icon={<IconEye size={20} />}
              trend={buildTrend(data.today.vision_uses, data.trend[0].vision_uses)}
            />
            <StatCard
              title="Barcode Scans"
              value={data.today.barcode_scans.toLocaleString()}
              icon={<IconBarcode size={20} />}
              trend={buildTrend(data.today.barcode_scans, data.trend[0].barcode_scans)}
            />
            <StatCard
              title="Unique Devices"
              value={data.today.unique_devices.toLocaleString()}
              icon={<IconDevices size={20} />}
              trend={buildTrend(data.today.unique_devices, data.trend[0].unique_devices)}
            />
          </div>

          {/* Sparkline Chart */}
          <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">7-Day Meal Log Trend</h2>
              <span className="text-xs text-slate-400">Last 7 days</span>
            </div>
            <SparklineChart data={data.trend.map((p) => ({ value: p.meals_logged }))} />
          </div>
        </>
      )}

      {/* Config Changes Table — always visible */}
      <ConfigChangesTable />
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `app/dashboard/page.tsx` starts with `'use client'`
- File does NOT contain `MOCK_STATS` or `MOCK_TREND_DATA` (grep absence)
- File contains `fetchWithAuth('/api/analytics')`
- File contains `buildTrend(` function
- File contains `animate-pulse` (loading skeleton)
- File contains `ConfigChangesTable` import and usage
- File contains `SparklineChart` with `data={data.trend.map((p) => ({ value: p.meals_logged }))}`
- File does NOT contain `IconTrendingUp` from tabler without it being imported (grep: import line has both TrendingUp and TrendingDown)
- `npm run build` exits 0
</acceptance_criteria>

---

## Verification

```
must_haves:
  - Overview page fetches real data (no MOCK_* constants)
  - Stat cards show today's real values with trend %
  - SparklineChart wired to real meals_logged trend
  - Loading and error states preserved
  - ConfigChangesTable still present
  - Build succeeds
```
