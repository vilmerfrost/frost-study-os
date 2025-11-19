import { z } from "zod";

export const PhaseConfigSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  description: z.string(),
  targetHours: z.number().positive(),
  recommendedDeepDiveDays: z.number().int().nonnegative(),
  keyTopics: z.array(z.string()),
});

export type PhaseConfig = z.infer<typeof PhaseConfigSchema>;

export const phasesConfig: PhaseConfig[] = PhaseConfigSchema.array().parse([
  {
    id: 1,
    label: "Phase 1 – Foundations",
    description: "Linear Algebra, sannolikhet, klassisk ML. Fokus på core-math.",
    targetHours: 60,
    recommendedDeepDiveDays: 6,
    keyTopics: ["linear_algebra_for_ml", "probability", "classic_ml"],
  },
  {
    id: 2,
    label: "Phase 2 – Deep Learning",
    description: "Bygga och träna neurala nät, CNN/RNN basics.",
    targetHours: 80,
    recommendedDeepDiveDays: 8,
    keyTopics: ["deep_learning", "cnn", "rnn"],
  },
  {
    id: 3,
    label: "Phase 3 – LLMs / RAG / Agents",
    description: "LLM finetuning, retrieval, agents och systemdesign.",
    targetHours: 90,
    recommendedDeepDiveDays: 10,
    keyTopics: ["llm_core", "rag", "agents"],
  },
  {
    id: 4,
    label: "Phase 4 – Specialization",
    description: "Eget showcase-projekt, specialisering och shipping.",
    targetHours: 100,
    recommendedDeepDiveDays: 6,
    keyTopics: ["specialization_project", "ship_it"],
  },
]);

