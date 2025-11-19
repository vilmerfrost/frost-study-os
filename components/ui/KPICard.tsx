"use client";

import { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
}

export function KPICard({ label, value, change, changeType = 'neutral', icon }: KPICardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-600">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

