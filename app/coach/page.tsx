"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { summarizeYearDay } from "@/lib/yearBrain/helpers";

const COACH_PROMPTS = [
  "Vilmer, vad är det tydligaste målet för dagens block?",
  "Vilken micro-succé vill du kunna berätta för future Vilmer ikväll?",
  "Vad behöver du för energi innan du sätter igång (musik, vatten, andning)?",
];

const MICRO_COACHING = [
  { title: "Energikontroll", tip: "Blocka 2 min före start för att skriva ner dagens fokusrad." },
  { title: "Reflektion", tip: "Skriv 1 rad till future Vilmer direkt efter passet." },
  { title: "Momentum", tip: "Skicka planens första steg till någon (eller DM dig själv) för accountability." },
];

export default function CoachPage() {
  const [yearDayIndex] = useLocalStorage<number>("vilmer-year-day-index", 1);
  const summary = summarizeYearDay(yearDayIndex);
  const yearDay = summary?.yearDay;
  const module = summary?.module;
  const phase = summary?.phase;

  return (
    <main className="space-y-6 pb-24">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2a1f55] via-[#0f172a] to-[#05060b] p-6 shadow-[0_30px_70px_rgba(76,29,149,0.4)]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sky-500/20 blur-[150px]" />
        </div>
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-widest">
              Årsdag {yearDay?.dayIndex ?? yearDayIndex}/365
            </span>
            {phase && (
              <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-widest text-amber-200">
                Phase {phase.id} – {phase.name}
              </span>
            )}
            {module && (
              <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs text-sky-100">
                {module.title}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              Coach Mode – vad behöver du just nu, Vilmer?
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Din YearBrain säger att dagens fokus är{" "}
              <span className="text-white font-semibold">{yearDay?.title ?? "ett fokuserat block"}</span>.
              Jag ger dig en snabb briefing och små triggers så du kommer in i rätt mindset direkt.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {COACH_PROMPTS.map((prompt) => (
              <div
                key={prompt}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                {prompt}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/session"
              className="rounded-2xl bg-gradient-to-r from-sky-500 via-fuchsia-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30"
            >
              Till dagens session →
            </Link>
            <Link
              href="/notes"
              className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Öppna Future Vilmer-noter
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Mini-coaching block</h2>
            <span className="text-xs text-slate-500">1% bättre</span>
          </div>
          <div className="space-y-3">
            {MICRO_COACHING.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-slate-400">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Fokuslogg</h2>
            <span className="text-xs text-slate-500">kort & konkret</span>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-500">Energin just nu</span>
              <textarea
                className="min-h-[80px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-fuchsia-400 transition"
                placeholder="Beskriv din energi på 2 meningar. Vad hjälper / stjäl?"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-500">Löfte till future Vilmer</span>
              <textarea
                className="min-h-[80px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-sky-400 transition"
                placeholder="Skriv ett kort DM till dig själv i kväll. Vad ska vara klart / känt?"
              />
            </label>
            <p className="text-[11px] text-slate-500">
              (Reflektionerna sparas än så länge bara lokalt. Du kan kopiera dem till Notes-sidan.)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}


