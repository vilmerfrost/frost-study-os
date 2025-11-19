// app/history/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import StatsCard from "@/components/StatsCard";
import {
  calculatePhaseProgress,
  calculateDeepDiveProgress,
  type SessionSummary,
} from "@/lib/analytics/progress";

export default async function HistoryPage() {
  const { data, error } = await supabaseServer
    .from("study_sessions")
    .select(
      "id, created_at, topic, phase, energy, time_block, deep_dive_topic, deep_dive_day, understanding_score, completion_rate"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(error);
  }

  const sessions = data || [];

  const sessionSummaries: SessionSummary[] = sessions.map((s) => ({
    phase: s.phase,
    time_block: s.time_block,
    deep_dive_topic: s.deep_dive_topic,
    deep_dive_day: s.deep_dive_day,
  }));

  const phaseProgress = calculatePhaseProgress(sessionSummaries);
  const deepDiveProgress = calculateDeepDiveProgress(sessionSummaries);

  const understandingSessions = sessions.filter((s) => s.understanding_score != null);
  const avgUnderstanding =
    understandingSessions.length > 0
      ? Math.round(
          (understandingSessions.reduce((sum, s) => sum + (s.understanding_score || 0), 0) /
            understandingSessions.length) *
            10
        ) / 10
      : 0;

  const topicTotals = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.topic] = (acc[s.topic] || 0) + (s.time_block || 0);
    return acc;
  }, {});
  const topTopics = Object.entries(topicTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const weakTopics = Object.entries(
    sessions.reduce<Record<string, { total: number; count: number }>>((acc, s) => {
      if (s.understanding_score == null) return acc;
      if (!acc[s.topic]) acc[s.topic] = { total: 0, count: 0 };
      acc[s.topic].total += s.understanding_score;
      acc[s.topic].count += 1;
      return acc;
    }, {})
  )
    .map(([topic, stats]) => ({
      topic,
      average: stats.total / stats.count,
      sessions: stats.count,
    }))
    .filter((t) => t.sessions >= 2)
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  const weeklyChart = Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - idx));
    const label = day.toLocaleDateString("sv-SE", { weekday: "short" });
    const minutes = sessions
      .filter((s) => {
        const date = new Date(s.created_at);
        return date.toDateString() === day.toDateString();
      })
      .reduce((sum, s) => sum + (s.time_block || 0), 0);
    return { label, minutes };
  });

  const insights: string[] = [];
  if (avgUnderstanding && avgUnderstanding < 3) {
    insights.push("Understanding är låg – prioritera review och reflektion.");
  }
  if (weeklyChart[6]?.minutes < 60) {
    insights.push("Idag är nästan tom – planera ett kort pass för att hålla streaken.");
  }
  if (weakTopics.length) {
    insights.push(`Svaga topics: ${weakTopics.map((t) => t.topic).join(", ")}`);
  }

  // Calculate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.time_block || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgEnergy =
    sessions.length > 0
      ? Math.round((sessions.reduce((sum, s) => sum + (s.energy || 0), 0) / sessions.length) * 10) / 10
      : 0;
  const thisWeek = sessions.filter((s) => {
    const date = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  });
  const thisWeekMinutes = thisWeek.reduce((sum, s) => sum + (s.time_block || 0), 0);
  const thisWeekHours = Math.round((thisWeekMinutes / 60) * 10) / 10;

  const missionSummary = `Du loggade ${thisWeekHours}h senaste 7 dagarna, snittenergi ${avgEnergy}/5. ${
    topTopics[0] ? `Mest tid på ${topTopics[0][0]}.` : ""
  } ${
    weakTopics.length ? `Kom ihåg att ge ${weakTopics.map((t) => t.topic).join(", ")} lite extra review.` : ""
  }`;

  return (
    <main className="space-y-8 pb-24">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#110f1f] via-[#1a1233] to-[#05050a] p-6 md:p-8 shadow-[0_30px_60px_rgba(59,7,110,0.4)] text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-violet-300/80">Mission logg</p>
            <h1 className="text-3xl font-semibold mt-2">Historik & signaler</h1>
            <p className="text-sm text-slate-200 mt-3 max-w-2xl">{missionSummary}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-100">
            <p>Totalt {totalHours}h loggade pass</p>
            <p className="text-slate-400 text-xs">Håll streaken vid liv, future Vilmer räknar med dig.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">📈 Phase-progress</h2>
            <span className="text-xs text-slate-400">Mot 12-månadersmålet</span>
          </div>
          <div className="space-y-3">
            {phaseProgress.map((phase) => (
              <div key={phase.phaseId} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-100">{phase.label}</span>
                  <span>
                    {phase.currentHours}/{phase.targetHours}h
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 transition-all"
                    style={{ width: `${phase.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Rek. deep dive-dagar: {phase.recommendedDeepDiveDays}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">🔥 Deep dive stack</h2>
            <span className="text-xs text-slate-400">Årsdagar i modul</span>
          </div>
          {deepDiveProgress.length === 0 ? (
            <p className="text-sm text-slate-500">Inga deep dives ännu.</p>
          ) : (
            <div className="space-y-3">
              {deepDiveProgress.map((dd) => (
                <div key={dd.topic} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{dd.topic}</span>
                    <span>
                      Dag {dd.completedDays}/{dd.totalDays}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-sky-500 transition-all"
                      style={{ width: `${dd.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          label="Total studietid"
          value={`${totalHours}h`}
          icon="⏱️"
        />
        <StatsCard
          label="Antal sessioner"
          value={sessions.length}
          icon="📚"
        />
        <StatsCard
          label="Denna vecka"
          value={`${thisWeekHours}h`}
          icon="🔥"
        />
        <StatsCard
          label="Genomsnittlig energi"
          value={`${avgEnergy}/5`}
          icon="⚡"
        />
      <StatsCard
        label="Avg understanding"
        value={avgUnderstanding ? `${avgUnderstanding}/5` : "–"}
        icon="🧠"
      />
      </div>
      {/* Weekly chart */}
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">📅 Veckodiagram</h2>
          <span className="text-xs text-slate-400">Minuter per dag</span>
        </div>
        <div className="flex items-end gap-2">
          {weeklyChart.map((day) => (
            <div key={day.label} className="flex-1 text-center">
              <div className="h-24 bg-slate-800/40 rounded-lg flex items-end justify-center">
                <div
                  className="w-3/4 rounded-t-lg bg-gradient-to-t from-sky-500 to-blue-500"
                  style={{ height: `${Math.min(100, (day.minutes / 120) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] mt-1 text-slate-500">{day.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold mb-2">🏔 Mest tid</h2>
            {topTopics.length === 0 ? (
              <p className="text-xs text-slate-500">Inga data ännu.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {topTopics.map(([topic, minutes]) => (
                  <li key={topic} className="flex items-center justify-between">
                    <span>{topic}</span>
                    <span className="text-slate-400">{Math.round((minutes as number) / 60 * 10) / 10}h</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold mb-2">🛠 Weak topics</h2>
            {weakTopics.length === 0 ? (
              <p className="text-xs text-slate-500">Inga svaga topics loggade.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {weakTopics.map((topic) => (
                  <li key={topic.topic} className="flex items-center justify-between">
                    <span>{topic.topic}</span>
                    <span className="text-slate-400">{topic.average.toFixed(1)}/5</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">🧠 Insights</h2>
          <span className="text-xs text-slate-500">Mini-analys</span>
        </div>
        {insights.length === 0 ? (
          <p className="text-xs text-slate-500">Allt ser stabilt ut – fortsätt så!</p>
        ) : (
          <ul className="space-y-2 text-xs text-slate-300">
            {insights.map((insight) => (
              <li key={insight} className="flex items-center gap-2">
                <span>•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sessions List */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Senaste sessioner</h2>
        {sessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-400">Inga sessions ännu.</p>
            <p className="text-xs text-slate-500 mt-1">
              Generera din första plan för att komma igång!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-4 hover:border-slate-700/50 transition-all shadow-md"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {s.topic}
                      </p>
                      <span className="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                        Phase {s.phase}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                      <span>⏱ {s.time_block} min</span>
                      <span>•</span>
                      <span>⚡ Energi {s.energy}/5</span>
                    </div>
                    {s.deep_dive_topic && (
                      <p className="text-xs text-slate-400 mt-2">
                        🔥 Deep dive: {s.deep_dive_topic} (dag {s.deep_dive_day})
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
