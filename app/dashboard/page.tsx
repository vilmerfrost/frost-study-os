"use client";

import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/ContentCard';
import { KPICard } from '@/components/ui/KPICard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/FrostButton';
import { PhaseProgressRing } from '@/components/PhaseProgressRing';
import { CurrentWeekBreakdown } from '@/components/CurrentWeekBreakdown';
import ConceptGraphMini from '@/components/ConceptGraphMini';
import EnergyHeatmap from '@/components/EnergyHeatmap';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activePhase, setActivePhase] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Get active phase
      const phaseRes = await fetch('/api/phases/active');
      if (phaseRes.ok) {
        const { phase } = await phaseRes.json();
        if (phase) {
          setActivePhase(phase);
          // Calculate current week (simplified)
          const weeksSinceStart = Math.floor(
            (Date.now() - new Date(phase.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          setCurrentWeek(Math.min(weeksSinceStart + 1, phase.duration_weeks));
        }
      }

      // Load weekly stats
      const res = await fetch('/api/today/weekly-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Kontrollpanel</h1>
          <p className="text-gray-600 mt-1">Välkommen tillbaka!</p>
        </div>
        <ContentCard title="Welcome to Study OS">
          <p className="text-gray-600 mb-4">Upload your YearBrain to get started.</p>
          <Button variant="primary" onClick={() => window.location.href = '/settings'}>
            Go to Settings
          </Button>
        </ContentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kontrollpanel</h1>
          <p className="text-gray-600 mt-1">
            {activePhase.name} · Vecka {currentWeek}/{activePhase.duration_weeks}
          </p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/today'}>
          🚀 Dagens Plan
        </Button>
      </div>

      {/* Phase Progress */}
      <div className="grid grid-cols-3 gap-6">
        <PhaseProgressRing phase={activePhase} currentWeek={currentWeek} />
        <ContentCard className="col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Timeline</h3>
          <ProgressBar progress={Math.round((currentWeek / activePhase.duration_weeks) * 100)} label="Progress" />
        </ContentCard>
      </div>

      {/* Current Week */}
      <CurrentWeekBreakdown phase={activePhase} currentWeek={currentWeek} />

      {/* Dashboard Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConceptGraphMini phase={activePhase.phase_number || 1} />
        <EnergyHeatmap days={30} />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total Timmar"
          value={stats ? `${Math.round((stats.minutes / 60) * 10) / 10}h` : "0h"}
          change="+5%"
          changeType="positive"
        />
        <KPICard
          label="Aktiva Projekt"
          value="2"
        />
        <KPICard
          label="Phase Progress"
          value="67%"
          change="Phase 1"
          changeType="neutral"
        />
        <KPICard
          label="Current Streak"
          value="14 days"
          change="🔥"
          changeType="positive"
        />
      </div>

      {/* AI Summary Card */}
      <ContentCard
        title="AI-sammanfattning"
        subtitle="Genererad för 2 minuter sedan"
        action={<button className="text-sm text-blue-600 hover:text-blue-700">Dölj</button>}
      >
        <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7CFF] to-[#B24BF3] flex items-center justify-center flex-shrink-0">
            🧠
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">
              Du är på dag 47/365 i Phase 1. Denna vecka har du loggat {stats ? `${Math.round((stats.minutes / 60) * 10) / 10}h` : '0h'} deep work.
              Din förståelse för <strong>Linear Algebra</strong> har ökat från 67% till 89%. Rekommendation: Fokusera på eigenvector-geometri innan du går vidare till SVD.
            </p>
          </div>
        </div>
      </ContentCard>

      {/* Projects Grid */}
      <ContentCard
        title="Projekt"
        action={<Button variant="ghost" size="sm">Se alla</Button>}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Project Card 1 */}
          <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Phase 1: Foundations</h3>
                <p className="text-sm text-gray-600">Linear Algebra & Probability</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Aktiv
              </span>
            </div>
            <ProgressBar progress={67} label="Progress" height="sm" />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>9.0h rapporterade</span>
              <span>•</span>
              <span>30h budget</span>
            </div>
          </div>

          {/* Project Card 2 */}
          <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">ML Foundry</h3>
                <p className="text-sm text-gray-600">Visualization Tools</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                In Progress
              </span>
            </div>
            <ProgressBar progress={42} label="Development" height="sm" />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>12.5h logged</span>
              <span>•</span>
              <span>Target: Week 50</span>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Dashboard Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConceptGraphMini phase={1} />
        <EnergyHeatmap days={30} />
      </div>
    </div>
  );
}

