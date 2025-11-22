"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import HistoryGraph from "@/components/HistoryGraph";
import SessionLogCard from "@/components/SessionLogCard";
import TopicMastery from "@/components/TopicMastery";
import SessionDetailModal from "@/components/SessionDetailModal";
import StatsCard from "@/components/StatsCard";
import { TrendingUp, Clock, CheckCircle, Zap } from "lucide-react";

// Mock data - in production, fetch from Supabase
const mockGraphData = [
  { date: "Nov 13", sessions: 2, hours: 3.5 },
  { date: "Nov 14", sessions: 1, hours: 1.5 },
  { date: "Nov 15", sessions: 3, hours: 4.0 },
  { date: "Nov 16", sessions: 2, hours: 2.5 },
  { date: "Nov 17", sessions: 1, hours: 2.0 },
  { date: "Nov 18", sessions: 2, hours: 3.0 },
  { date: "Nov 19", sessions: 3, hours: 5.0 },
];

const mockTopicData = [
  { topic: "Linear Algebra", mastery: 75, change: 5, sessions: 12 },
  { topic: "Calculus", mastery: 62, change: -2, sessions: 8 },
  { topic: "Python", mastery: 85, change: 3, sessions: 15 },
  { topic: "Probability", mastery: 45, change: 0, sessions: 6 },
];

const mockSessions = [
  {
    id: "1",
    topic: "Eigenvalues and Eigenvectors",
    created_at: new Date().toISOString(),
    time_block: 90,
    understanding_score: 4,
    completion_rate: 85,
    energy: 8,
    reflection: "Made good progress understanding geometric interpretation.",
  },
  {
    id: "2",
    topic: "Chain Rule Practice",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    time_block: 60,
    understanding_score: 3,
    completion_rate: 70,
    energy: 6,
  },
  {
    id: "3",
    topic: "Python Data Structures",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    time_block: 120,
    understanding_score: 5,
    completion_rate: 95,
    energy: 9,
    reflection: "Excellent session. Everything clicked.",
  },
];

export default function HistoryPage() {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [filter, setFilter] = useState<"week" | "month" | "all">("week");

  // Calculate stats
  const totalSessions = mockGraphData.reduce((sum, d) => sum + d.sessions, 0);
  const totalHours = mockGraphData.reduce((sum, d) => sum + d.hours, 0);
  const avgCompletion = mockSessions.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / mockSessions.length;
  const avgEnergy = mockSessions.reduce((sum, s) => sum + s.energy, 0) / mockSessions.length;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mission Log</h1>
            <p className="text-muted-foreground">Your learning journey analytics.</p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(["week", "month", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatsCard
            label="Total Sessions"
            value={totalSessions}
            icon={<TrendingUp className="h-5 w-5" />}
            trendValue="+12%"
            trend="up"
          />
          <StatsCard
            label="Hours Logged"
            value={`${totalHours.toFixed(1)}h`}
            icon={<Clock className="h-5 w-5" />}
            trendValue="+8%"
            trend="up"
          />
          <StatsCard
            label="Completion Rate"
            value={`${Math.round(avgCompletion)}%`}
            icon={<CheckCircle className="h-5 w-5" />}
            trendValue={avgCompletion >= 80 ? "+5%" : "-3%"}
            trend={avgCompletion >= 80 ? "up" : "down"}
          />
          <StatsCard
            label="Avg Energy"
            value={`${avgEnergy.toFixed(1)}/10`}
            icon={<Zap className="h-5 w-5" />}
          />
        </div>

        {/* Graph */}
        <HistoryGraph data={mockGraphData} type="line" />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic Mastery */}
          <TopicMastery topics={mockTopicData} />

          {/* Analyzer Insights */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Analyzer Insights</h3>
            <div className="space-y-3">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <h4 className="text-sm font-semibold text-green-500 mb-1">Strongest Topics</h4>
                <p className="text-sm">Python, Linear Algebra</p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                <h4 className="text-sm font-semibold text-yellow-500 mb-1">Recommended Focus</h4>
                <p className="text-sm">Probability - Low mastery, needs more practice</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <h4 className="text-sm font-semibold text-blue-500 mb-1">Study Pattern</h4>
                <p className="text-sm">Most productive in morning sessions (avg 8.2 energy)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          <div className="space-y-3">
            {mockSessions.map((session) => (
              <SessionLogCard
                key={session.id}
                session={session}
                onClick={() => setSelectedSession(session)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </AppShell>
  );
}
