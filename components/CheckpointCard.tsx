"use client";

import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/ui/ContentCard';
import { Button } from '@/components/ui/FrostButton';
import { motion } from 'framer-motion';

export function CheckpointCard({ phaseId, currentWeek }: { phaseId: string; currentWeek: number }) {
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckpoints();
  }, [phaseId]);

  const loadCheckpoints = async () => {
    try {
      const res = await fetch(`/api/checkpoints/list?phaseId=${phaseId}`);
      if (res.ok) {
        const { checkpoints } = await res.json();
        setCheckpoints(checkpoints || []);
      }
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return '✅ Ready';
    if (score >= 60) return '🟡 Almost Ready';
    return '🔴 Not Ready';
  };

  const upcomingCheckpoint = checkpoints.find((c) => c.week_number >= currentWeek && !c.is_passed);

  if (loading) {
    return <ContentCard>Loading checkpoints...</ContentCard>;
  }

  if (!upcomingCheckpoint) {
    return null;
  }

  const daysUntil = (upcomingCheckpoint.week_number - currentWeek) * 7;

  return (
    <ContentCard>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">🎯 Upcoming Checkpoint</h3>
            <p className="text-sm text-gray-600">
              Week {upcomingCheckpoint.week_number} · {daysUntil} days
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full border font-semibold text-sm ${getReadinessColor(
              upcomingCheckpoint.readiness_score
            )}`}
          >
            {getReadinessLabel(upcomingCheckpoint.readiness_score)}
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-2">{upcomingCheckpoint.name}</h4>
        <p className="text-gray-700 mb-4">{upcomingCheckpoint.description}</p>

        {/* Criteria */}
        {upcomingCheckpoint.criteria && Array.isArray(upcomingCheckpoint.criteria) && upcomingCheckpoint.criteria.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Success Criteria:</h5>
            <ul className="space-y-2">
              {upcomingCheckpoint.criteria.map((criterion: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600">•</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Readiness Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Readiness Score</span>
            <span className="text-sm font-semibold text-gray-900">{upcomingCheckpoint.readiness_score}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${upcomingCheckpoint.readiness_score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#5B7CFF] to-[#B24BF3]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="primary" size="sm">
            Start Practice Test
          </Button>
          <Button variant="ghost" size="sm">
            Review Topics
          </Button>
        </div>
      </div>
    </ContentCard>
  );
}

