"use client";

import { useEffect, useState } from 'react';
import { CheckpointCard } from '@/components/CheckpointCard';
import { ContentCard } from '@/components/ui/ContentCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CheckpointsPage() {
  const [activePhase, setActivePhase] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckpoints();
  }, []);

  const loadCheckpoints = async () => {
    try {
      const phaseRes = await fetch('/api/phases/active');
      if (phaseRes.ok) {
        const { phase } = await phaseRes.json();
        if (phase) {
          setActivePhase(phase);
          const weeksSinceStart = Math.floor(
            (Date.now() - new Date(phase.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          setCurrentWeek(Math.min(weeksSinceStart + 1, phase.duration_weeks));
        }
      }
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activePhase) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkpoints</h1>
          <p className="text-gray-600 mt-1">Phase milestones & readiness tracking</p>
        </div>
        <ContentCard>
          <p className="text-gray-600 text-center py-8">Ingen aktiv phase. Upload YearBrain för att komma igång.</p>
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Checkpoints</h1>
        <p className="text-gray-600 mt-1">
          {activePhase.name} · Vecka {currentWeek}/{activePhase.duration_weeks}
        </p>
      </div>

      <CheckpointCard phaseId={activePhase.id} currentWeek={currentWeek} />
    </div>
  );
}

