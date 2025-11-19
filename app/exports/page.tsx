"use client";

import { useMemo } from "react";
import Link from "next/link";

const MOCK_EXPORTS = [
  {
    id: "exp-001",
    title: "Dag 112 – Linear Algebra for ML",
    type: "Markdown",
    size: "14 KB",
    createdAt: "2025-01-12 08:45",
  },
  {
    id: "exp-002",
    title: "Week Plan – Phase 2 Warmup",
    type: "PDF",
    size: "210 KB",
    createdAt: "2025-01-10 21:02",
  },
  {
    id: "exp-003",
    title: "Reflection stack – vecka 02",
    type: "Markdown",
    size: "9 KB",
    createdAt: "2025-01-05 19:11",
  },
];

export default function ExportsPage() {
  const totalSize = useMemo(() => {
    return MOCK_EXPORTS.reduce((acc, item) => {
      const value = parseFloat(item.size);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
  }, []);

  return (
    <main className="space-y-6 pb-24">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e172a] via-[#111827] to-[#05060b] p-6 shadow-[0_25px_60px_rgba(15,23,42,0.6)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Exports & handovers</p>
            <h1 className="text-2xl font-semibold text-white">Arkiverade planer & reflexioner</h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Här samlar du allt du exporterat från sessioner: markdown-checklistor, veckoplaner, reflektionsloggar.
              Perfekt när du ska dela med future Vilmer eller en accountability partner.
            </p>
          </div>
          <Link
            href="/session"
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20"
          >
            Exportera nytt från session →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Totalt</p>
            <p className="text-2xl font-semibold text-white">{MOCK_EXPORTS.length} filer</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Utrymme</p>
            <p className="text-2xl font-semibold text-white">{totalSize.toFixed(0)} KB</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Senast</p>
            <p className="text-lg font-medium text-white">{MOCK_EXPORTS[0].createdAt}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Dina exports</h2>
          <span className="text-xs text-slate-500">manuell import snart™</span>
        </div>
        <div className="space-y-3">
          {MOCK_EXPORTS.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
            >
              <div className="flex-1">
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-xs text-slate-400">
                  {item.type} • {item.size} • {item.createdAt}
                </p>
              </div>
              <button className="rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:border-sky-400">
                Ladda ner
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Snabb-länkar</h2>
          <span className="text-xs text-slate-500">kopiera & dela</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/notes"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:border-sky-400"
          >
            Future Vilmer-noter →
          </Link>
          <Link
            href="/history"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:border-sky-400"
          >
            History & analytics →
          </Link>
          <Link
            href="/coach"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:border-sky-400"
          >
            Coach view →
          </Link>
        </div>
      </section>
    </main>
  );
}


