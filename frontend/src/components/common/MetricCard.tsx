import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  accentColor?: string;
  badge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  badge,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {badge && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
            {badge}
          </span>
        )}
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-brand-700">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-navy-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : trendDirection === 'down'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subValue && (
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subValue}</p>
      )}
    </div>
  );
};
