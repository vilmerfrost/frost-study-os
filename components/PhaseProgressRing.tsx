"use client";

import { ContentCard } from '@/components/ui/ContentCard';

export function PhaseProgressRing({ phase, currentWeek }: { phase: any; currentWeek: number }) {
  const progress = Math.round((currentWeek / phase.duration_weeks) * 100);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <ContentCard>
      <div className="flex flex-col items-center p-6">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90" width="192" height="192" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#E5E9F0"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B7CFF" />
                <stop offset="100%" stopColor="#B24BF3" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">{progress}%</span>
            <span className="text-sm text-gray-600 mt-1">Complete</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h3 className="font-semibold text-gray-900">{phase.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Vecka {currentWeek} av {phase.duration_weeks}
          </p>
        </div>
      </div>
    </ContentCard>
  );
}

