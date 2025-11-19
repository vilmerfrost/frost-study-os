type PhaseId = 1 | 2 | 3 | 4;

export type YearModule = {
  id: string;
  phase: PhaseId;
  title: string;
  shortTitle: string;
  description: string;
  estimatedWeeks: number;
  topicKey: string;
  llmContext: string;
  dailyOutline: string[];
};

export type YearDayType = "deep_dive" | "integration" | "rest";

export type YearDay = {
  dayIndex: number;
  phase: PhaseId;
  moduleId: string;
  weekIndex: number;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  type: YearDayType;
  title: string;
  goals: string[];
  focusArea: string;
  llmHint: string;
  topicKey: string;
};

export type YearBrain = {
  phases: {
    id: PhaseId;
    name: string;
    description: string;
  }[];
  modules: YearModule[];
  days: YearDay[];
};

const phases: YearBrain["phases"] = [
  { id: 1, name: "Phase 1 – Foundations", description: "Math, Python, thinking systems." },
  { id: 2, name: "Phase 2 – Core ML & DL", description: "Classic ML och deep learning fundamentals." },
  { id: 3, name: "Phase 3 – Systems & Agents", description: "LLMs, RAG, agent-arkitektur." },
  { id: 4, name: "Phase 4 – Ship & Scale", description: "Infra, evals, Frost-produkter." },
];

const modules: YearModule[] = [
  {
    id: "p1_linear_algebra",
    phase: 1,
    title: "Linear Algebra for ML",
    shortTitle: "LinAlg",
    description: "Vectors, matrices, eigen intuition kopplat till embeddings/attention.",
    estimatedWeeks: 4,
    topicKey: "linear_algebra_for_ml",
    llmContext: `
Vilmer bygger grunden i linjär algebra för ML: vektorer, matriser, normer, eigenvärden/eigenvektorer och SVD.
Fokus: intuition + koppling till embeddings, PCA, attention.
`,
    dailyOutline: [
      "Conceptual overview & why LA matters for ML",
      "Vectors, dot products, norms",
      "Matrix multiplication & transformation intuition",
      "Rank, span, dimension",
      "Eigenvalues/eigenvectors",
      "SVD & link to modern ML",
    ],
  },
  {
    id: "p1_python_systems",
    phase: 1,
    title: "Python Systems Thinking",
    shortTitle: "Py Systems",
    description: "Bygga robusta verktyg i Python: typer, moduler, CLI, automation.",
    estimatedWeeks: 3,
    topicKey: "python_systems",
    llmContext: `
Fokus: använda Python som verktyg för att bygga bots/automations.
Typer, strukturer, modulärt tänk, CLI, loggning, testing.
`,
    dailyOutline: [
      "Project scaffolding & toolchain",
      "Typing & dataklasser",
      "CLI + automation patterns",
      "Testing & logging discipline",
      "Packaging + distributions",
    ],
  },
  {
    id: "p1_probability",
    phase: 1,
    title: "Probability & Intuition",
    shortTitle: "Prob",
    description: "Sannolikhet, Bayes, statistisk intuition för ML.",
    estimatedWeeks: 3,
    topicKey: "probability_for_ml",
    llmContext: `
Sannolikhet, Bayes, slumpvariabler, expectation, variance, distributions.
`,
    dailyOutline: [
      "Random variables & intuition",
      "Expectation, variance, intuition",
      "Bayes rule scenarios",
      "Common distributions",
      "Connecting prob -> ML uncertainty",
    ],
  },
  {
    id: "p2_classic_ml",
    phase: 2,
    title: "Classic ML Toolkit",
    shortTitle: "Classic ML",
    description: "Regression, classification, feature pipelines.",
    estimatedWeeks: 4,
    topicKey: "classic_ml_toolkit",
    llmContext: `
Arbeta med regression, classification, feature engineering, cross-validation, regularization.
`,
    dailyOutline: [
      "Regression intuition & loss",
      "Classification & decision boundaries",
      "Feature engineering practice",
      "Model evaluation & CV",
      "Regularization stories",
      "Shipping a tiny ML pipeline",
    ],
  },
  {
    id: "p2_deep_learning_core",
    phase: 2,
    title: "Deep Learning Core",
    shortTitle: "DL Core",
    description: "NN-byggstenar, forward/backward pass, optimering.",
    estimatedWeeks: 5,
    topicKey: "deep_learning_core",
    llmContext: `
Neurala nät grunder: layers, activation, loss, backprop, optimering, CNN/RNN basics.
`,
    dailyOutline: [
      "Neural nets high-level, why they work",
      "Forward pass & activations",
      "Backprop math intuition",
      "Optimizers & training stability",
      "CNN primer: conv intuition",
      "Sequence models intro",
    ],
  },
  {
    id: "p2_tooling",
    phase: 2,
    title: "ML Tooling & Experiment Systems",
    shortTitle: "Tooling",
    description: "Weights & Biases, Hydra, config-driven experiment.",
    estimatedWeeks: 2,
    topicKey: "ml_tooling",
    llmContext: `
Bygg experiment pipelines, config-driven flows, logging, reproducibility.
`,
    dailyOutline: [
      "Experiment tracking setup",
      "Config-driven training runs",
      "Automation & reporting",
      "Evaluation dashboards",
    ],
  },
  {
    id: "p3_llm_core",
    phase: 3,
    title: "LLM Core Systems",
    shortTitle: "LLM Core",
    description: "Prompting, finetuning, evals.",
    estimatedWeeks: 4,
    topicKey: "llm_core_systems",
    llmContext: `
Jobba med open-source LLMs, prompting, finetuning pipelines, evals, säkerhet.
`,
    dailyOutline: [
      "Prompt eval frameworks",
      "Finetuning pipeline basics",
      "Guardrails & safety",
      "Eval harness design",
      "Deployment checklists",
    ],
  },
  {
    id: "p3_rag_agents",
    phase: 3,
    title: "RAG & Agent Architecture",
    shortTitle: "RAG + Agents",
    description: "Retriever design, tool use, multi-agent flöden.",
    estimatedWeeks: 5,
    topicKey: "rag_agent_architecture",
    llmContext: `
Designa retrieval-system, multi-agent pipelines, tool use, memory, planning.
`,
    dailyOutline: [
      "Retriever fundamentals",
      "Chunking & embeddings",
      "Tool use patterns",
      "Planning & control loops",
      "Debugging agent chains",
      "Shipping small agent service",
    ],
  },
  {
    id: "p3_infra_eval",
    phase: 3,
    title: "LLM Infra & Eval",
    shortTitle: "Infra/Eval",
    description: "Serving, monitoring, eval loops.",
    estimatedWeeks: 3,
    topicKey: "llm_infra_eval",
    llmContext: `
Bygga infra för att köra LLM-system: serving, logging, eval loops, alerts.
`,
    dailyOutline: [
      "Serving stack design",
      "Telemetry & logging",
      "Eval loop automation",
      "Cost/perf tracking",
      "Continuous improvement rituals",
    ],
  },
  {
    id: "p4_product_systems",
    phase: 4,
    title: "Product Systems & Frost Stack",
    shortTitle: "Frost Systems",
    description: "Byggja interna Frost-agent, workflows.",
    estimatedWeeks: 8,
    topicKey: "frost_systems",
    llmContext: `
Skapa Frost Solutions agent-system: kundflöden, automation, integrations, evals, dashboards.
`,
    dailyOutline: [
      "Map Frost user journeys",
      "Design system boundaries",
      "Implement core workflows",
      "Integrate eval loops",
      "Polish & dogfood",
      "Ship incremental improvements",
    ],
  },
  {
    id: "p4_showcase",
    phase: 4,
    title: "Showcase & Storytelling",
    shortTitle: "Showcase",
    description: "Dokumentera, skapa demos, shipping.",
    estimatedWeeks: 4,
    topicKey: "showcase_storytelling",
    llmContext: `
Gör demos, dokumentation, pitch deck, storytelling kring Frost-agenten.
`,
    dailyOutline: [
      "Narrative & framing",
      "Building high-signal demos",
      "Docs + README polish",
      "Pitch practice",
      "Launch + follow up plan",
    ],
  },
];

function buildYearDays(sourceModules: YearModule[]): YearDay[] {
  const days: YearDay[] = [];
  let dayIndex = 1;
  let weekIndex = 1;

  for (const module of sourceModules) {
    const totalDays = module.estimatedWeeks * 7;
    for (let i = 0; i < totalDays && dayIndex <= 365; i++) {
      const dayOfWeek = (((dayIndex - 1) % 7) + 1) as YearDay["dayOfWeek"];
      const isRestWeek = weekIndex % 4 === 0 && dayOfWeek === 7;
      let type: YearDayType = "deep_dive";
      if (dayOfWeek === 7) type = "integration";
      if (isRestWeek) type = "rest";

      const outlineIndex =
        type === "deep_dive" ? i % module.dailyOutline.length : 0;
      const focus =
        type === "deep_dive"
          ? module.dailyOutline[outlineIndex]
          : type === "integration"
          ? "Integration & reflection"
          : "Recovery & light input";

      const goals =
        type === "deep_dive"
          ? [`Fördjupa dig i ${module.dailyOutline[outlineIndex]}`]
          : type === "integration"
          ? ["Sammanfatta veckan", "Identifiera gaps och frågor"]
          : ["Återhämtning", "Lätt reflektion"];

      days.push({
        dayIndex,
        phase: module.phase,
        moduleId: module.id,
        weekIndex,
        dayOfWeek,
        type,
        title:
          type === "deep_dive"
            ? `P${module.phase}W${weekIndex}D${dayOfWeek} – ${module.dailyOutline[outlineIndex]}`
            : type === "integration"
            ? `P${module.phase}W${weekIndex} – Integration`
            : `P${module.phase}W${weekIndex} – Recovery`,
        goals,
        focusArea: focus,
        llmHint:
          type === "deep_dive"
            ? `Deep dive in module "${module.title}" focusing on ${module.dailyOutline[outlineIndex]}.`
            : type === "integration"
            ? `Integration day for module "${module.title}". Help Vilmer synthesize lessons from this week.`
            : `Rest day. Offer light, optional activities connected to ${module.shortTitle}.`,
        topicKey: module.topicKey,
      });

      dayIndex++;
      if (dayOfWeek === 7) {
        weekIndex++;
      }
      if (dayIndex > 365) break;
    }
    if (dayIndex > 365) break;
  }

  return days;
}

export const yearBrain: YearBrain = {
  phases,
  modules,
  days: buildYearDays(modules),
};

export type { PhaseId };

