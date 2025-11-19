export default function NotesPage() {
  const prompts = [
    "Vad klickade mest idag?",
    "Vilken del av passet kändes shaky och behöver en review?",
    "Vad vill future Vilmer att du fångar upp innan du loggar ut?",
  ];

  return (
    <main className="space-y-8 pb-24">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-6 shadow-xl text-white">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Notes & logs</p>
        <h1 className="text-3xl font-semibold mt-2">Samla signaler åt framtida Vilmer</h1>
        <p className="text-sm text-slate-300 mt-2">
          Här kan du stapla reflektioner, experiment-idéer och micro-wins. All text är bara för dig –
          inga produktfeatures, inget community. Bara hjärnan som viskar till framtiden.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {prompts.map((prompt) => (
          <div
            key={prompt}
            className="rounded-3xl border border-white/5 bg-slate-900/70 backdrop-blur p-4 space-y-3 shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prompt</p>
            <p className="text-sm text-white">{prompt}</p>
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 outline-none min-h-[120px]"
              placeholder="Skriv fritt. Det här stannar här inne."
            />
          </div>
        ))}
      </section>
    </main>
  );
}

