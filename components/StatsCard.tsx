import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trendValue?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  trendValue,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {trend && (
        <p className={`text-xs mt-2 ${trendColors[trend]}`}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue} vs förra veckan
        </p>
      )}
    </div>
  );
}

