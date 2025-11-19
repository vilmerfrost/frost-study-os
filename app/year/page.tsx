import { yearBrain } from "@/config/yearBrain";

export default function YearPage() {
  return (
    <main className="space-y-8 pb-24">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#170f2d] via-slate-900 to-[#050509] p-6 md:p-8 shadow-[0_25px_60px_rgba(88,28,135,0.35)] text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-violet-300/80">Year Brain</p>
        <h1 className="text-3xl font-semibold mt-3">12 månader installerad i hjärnan</h1>
        <p className="text-sm text-slate-200 mt-4 max-w-3xl">
          Allt här inne är en serie beslut du redan har gjort. Du kan när som helst hoppa mellan
          faser, men planen är utlagd dag för dag. Låt framtida Vilmer glida fram på den här rälsen.
        </p>
      </section>

      <section className="space-y-6">
        {yearBrain.phases.map((phase) => {
          const modules = yearBrain.modules.filter((m) => m.phase === phase.id);
          return (
            <div key={phase.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    Phase {phase.id}
                  </p>
                  <h2 className="text-xl font-semibold text-white">{phase.name}</h2>
                </div>
                <span className="text-[11px] text-slate-400">{phase.description}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {modules.map((module) => (
                  <article
                    key={module.id}
                    className="rounded-3xl border border-white/5 bg-slate-950/60 backdrop-blur-xl p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-3 py-1 rounded-full border border-white/10 text-white">
                        {module.shortTitle}
                      </span>
                      <span>{module.estimatedWeeks} veckor</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                    <p className="text-sm text-slate-300">{module.description}</p>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">
                        Dagstema
                      </p>
                      <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                        {module.dailyOutline.slice(0, 4).map((outline) => (
                          <li key={outline}>{outline}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

