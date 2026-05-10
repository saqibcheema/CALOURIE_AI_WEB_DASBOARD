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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/StatCard';
import { useAuthFetch } from '@/lib/useAuthFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

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

type MetricKey = 'meals_logged' | 'vision_uses' | 'barcode_scans' | 'unique_devices';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'meals_logged',   label: 'Meals Logged'   },
  { key: 'vision_uses',    label: 'AI Vision'       },
  { key: 'barcode_scans',  label: 'Barcode Scans'   },
  { key: 'unique_devices', label: 'Unique Devices'  },
];

// ─── Trend helper ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { fetchWithAuth } = useAuthFetch();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('meals_logged');

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

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col gap-1">
          <div className="h-7 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-56 bg-slate-200 animate-pulse rounded mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-[10px] bg-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-[340px] rounded-[10px] bg-slate-200 animate-pulse" />
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        </div>
        <div className="rounded-[10px] bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <IconAlertCircle size={20} className="text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Failed to load analytics data</p>
            <p className="text-xs text-red-500 mt-0.5">Check your connection and try again</p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-red-600 underline font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { today, trend } = data;
  const sevenDaysAgo = trend[0];

  const statCards = [
    {
      title: 'Total Meals Logged',
      value: today.meals_logged.toLocaleString(),
      icon: <IconSalad size={20} />,
      trend: buildTrend(today.meals_logged, sevenDaysAgo.meals_logged),
    },
    {
      title: 'AI Vision Uses',
      value: today.vision_uses.toLocaleString(),
      icon: <IconEye size={20} />,
      trend: buildTrend(today.vision_uses, sevenDaysAgo.vision_uses),
    },
    {
      title: 'Barcode Scans',
      value: today.barcode_scans.toLocaleString(),
      icon: <IconBarcode size={20} />,
      trend: buildTrend(today.barcode_scans, sevenDaysAgo.barcode_scans),
    },
    {
      title: 'Unique Devices',
      value: today.unique_devices.toLocaleString(),
      icon: <IconDevices size={20} />,
      trend: buildTrend(today.unique_devices, sevenDaysAgo.unique_devices),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500">App usage over the last 7 days</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Bar Chart Card */}
      <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">7-Day Trend</h2>
          <span className="text-xs text-slate-400">Last 7 days</span>
        </div>

        {/* Metric Tabs */}
        <div className="flex gap-1 mb-6">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={
                activeMetric === m.key
                  ? 'px-3 py-1 rounded-[7px] text-sm font-medium text-arctic-600 bg-arctic-50'
                  : 'px-3 py-1 rounded-[7px] text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors'
              }
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
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
              <Bar dataKey={activeMetric} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
