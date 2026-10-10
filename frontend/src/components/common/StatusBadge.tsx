import React from 'react';

interface StatusBadgeProps {
  type?: 'risk' | 'priority' | 'status' | 'tier' | 'category' | 'default';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type = 'default', value, className = '' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';

  const valLower = value.toLowerCase();

  if (type === 'risk' || valLower === 'at risk' || valLower === 'critical') {
    if (valLower.includes('risk') || valLower === 'critical') {
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  } else if (type === 'priority') {
    if (valLower === 'critical') colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    else if (valLower === 'high') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    else if (valLower === 'medium') colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    else colorClass = 'bg-slate-50 text-slate-600 border-slate-200';
  } else if (type === 'status') {
    if (valLower === 'completed') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (valLower === 'in progress') colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
    else if (valLower === 'blocked') colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    else if (valLower === 'pending approval') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    else colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (type === 'tier') {
    if (valLower.includes('top')) colorClass = 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
    else if (valLower.includes('middle')) colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    else colorClass = 'bg-orange-50 text-orange-700 border-orange-200 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {value}
    </span>
  );
};
