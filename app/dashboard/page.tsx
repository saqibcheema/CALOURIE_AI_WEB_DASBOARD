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
