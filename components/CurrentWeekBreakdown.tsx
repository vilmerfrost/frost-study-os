"use client";

import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/ui/ContentCard';
import { Button } from '@/components/ui/FrostButton';

export function CurrentWeekBreakdown({ phase, currentWeek }: { phase: any; currentWeek: number }) {
  const [weekTopics, setWeekTopics] = useState<any[]>([]);

  useEffect(() => {
    loadWeekTopics();
  }, [currentWeek, phase]);

  const loadWeekTopics = () => {
    // Get modules active this week
    const activeModules = (phase.modules || []).filter(
      (m: any) => currentWeek >= m.week_start && currentWeek <= m.week_end
    );

    // Get topics from active modules
    const topics = activeModules.flatMap((m: any) =>
      (m.topics || []).map((t: any) => ({ ...t, moduleName: m.name }))
    );

    setWeekTopics(topics);
  };

  return (
    <ContentCard title={`📚 Vecka ${currentWeek} Focus`} subtitle={`${weekTopics.length} topics denna vecka`}>
      <div className="space-y-3">
        {weekTopics.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">Inga topics denna vecka</p>
        ) : (
          weekTopics.map((topic: any, idx: number) => (
            <div
              key={topic.id || idx}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex-shrink-0">
                {topic.mastery_score === 0 ? '⏳' : topic.mastery_score > 80 ? '✅' : '🟡'}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{topic.name}</h4>
                <p className="text-sm text-gray-600">{topic.moduleName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {topic.difficulty || 'intermediate'}
                  </span>
                  <span className="text-xs text-gray-500">Mastery: {topic.mastery_score || 0}%</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => window.location.href = `/session?topic=${topic.id}`}>
                Start Session →
              </Button>
            </div>
          ))
        )}
      </div>
    </ContentCard>
  );
}

