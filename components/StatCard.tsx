import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: ReactNode;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="text-arctic-500">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      {trend && (
        <div className="text-xs text-slate-500 flex items-center gap-1">{trend}</div>
      )}
    </div>
  );
}
