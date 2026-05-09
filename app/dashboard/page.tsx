import {
  IconSalad,
  IconEye,
  IconBarcode,
  IconDevices,
  IconTrendingUp,
} from '@tabler/icons-react';
import { StatCard } from '@/components/StatCard';
import { SparklineChart } from '@/components/SparklineChart';
import { ConfigChangesTable } from '@/components/ConfigChangesTable';

// Mock 7-day trend data
const MOCK_TREND_DATA = [
  { value: 120 },
  { value: 145 },
  { value: 132 },
  { value: 178 },
  { value: 160 },
  { value: 195 },
  { value: 210 },
];

const MOCK_STATS = [
  {
    title: 'Total Meals Logged',
    value: '12,847',
    icon: <IconSalad size={20} />,
    trend: <><IconTrendingUp size={14} className="text-emerald-500" /><span className="text-emerald-500">+8.2%</span> vs last week</>,
  },
  {
    title: 'AI Vision Uses',
    value: '4,231',
    icon: <IconEye size={20} />,
    trend: <><IconTrendingUp size={14} className="text-emerald-500" /><span className="text-emerald-500">+12.5%</span> vs last week</>,
  },
  {
    title: 'Barcode Scans',
    value: '3,562',
    icon: <IconBarcode size={20} />,
    trend: <><IconTrendingUp size={14} className="text-emerald-500" /><span className="text-emerald-500">+5.1%</span> vs last week</>,
  },
  {
    title: 'Unique Devices',
    value: '1,094',
    icon: <IconDevices size={20} />,
    trend: <><IconTrendingUp size={14} className="text-emerald-500" /><span className="text-emerald-500">+2.3%</span> vs last week</>,
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500">Welcome to the Calourie AI Admin Dashboard.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Sparkline Chart Section */}
      <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">7-Day Meal Log Trend</h2>
          <span className="text-xs text-slate-400">Last 7 days</span>
        </div>
        <SparklineChart data={MOCK_TREND_DATA} />
      </div>

      {/* Config Changes Table */}
      <ConfigChangesTable />
    </div>
  );
}
