import { z } from "zod";

const BlockMixSchema = z.object({
  notebooklm: z.number().min(0).max(1),
  theory: z.number().min(0).max(1),
  exercises: z.number().min(0).max(1),
  summary: z.number().min(0).max(1),
});

const DayTasksSchema = z.object({
  notebooklm: z.array(z.string()).optional(),
  theory: z.array(z.string()).optional(),
  exercises: z.array(z.string()).optional(),
  summary: z.array(z.string()).optional(),
});

export const DeepDiveDaySchema = z.object({
  day: z.number().int().min(1),
  name: z.string(),
  subtopics: z.array(z.string()),
  why: z.string(),
  defaultBlockMix: BlockMixSchema,
  tasks: DayTasksSchema,
});

export const DeepDiveConfigSchema = z.object({
  phase: z.number().int(),
  days: z.array(DeepDiveDaySchema).min(1),
});

export type DeepDiveDayConfig = z.infer<typeof DeepDiveDaySchema>;
export type DeepDiveConfig = z.infer<typeof DeepDiveConfigSchema>;

export const deepDiveConfigs: Record<string, DeepDiveConfig> = {
  linear_algebra_for_ml: DeepDiveConfigSchema.parse({
    phase: 1,
    days: [
      {
        day: 1,
        name: "Vectors & Dot Products",
        subtopics: ["vectors", "dot product", "cosine similarity"],
        why: "Grund för embeddings, likhet, attention.",
        defaultBlockMix: {
          notebooklm: 0.2,
          theory: 0.4,
          exercises: 0.3,
          summary: 0.1,
        },
        tasks: {
          notebooklm: [
            "Öppna NotebookLM-pack Phase1_LA_Pack eller Phase1_ML_Intro_Pack.",
            "Lyssna på en kort overview om vektorer & dotprodukter.",
          ],
          theory: [
            "Se en video (t.ex. 3Blue1Brown) om dot product.",
            "Skriv 2–3 meningar med din egen förklaring av dot product som 'alignment/projektion'.",
          ],
          exercises: [
            "Implementera my_dot(a, b) utan NumPy.",
            "Skapa 2–3 'embedding'-vektorer och jämför deras dot products.",
            "Implementera cosine_similarity(a, b) och testa på dina embeddings.",
          ],
          summary: [
            "Skriv 3 bullets: viktigaste insikt, vad som var svårt, vad du ska göra nästa gång.",
          ],
        },
      },
      {
        day: 2,
        name: "Matrix Multiplication & Neural Layers",
        subtopics: ["matrix multiply", "shapes", "y = Wx + b"],
        why: "Varje neural network-layer är en matrisoperation.",
        defaultBlockMix: {
          notebooklm: 0.15,
          theory: 0.35,
          exercises: 0.4,
          summary: 0.1,
        },
        tasks: {
          notebooklm: [
            "Öppna Phase1_LA_Pack och fråga efter en sammanfattning av matris-multiplikation.",
            "Skriv ner 1–2 frågor du har om shapes eller y = Wx + b.",
          ],
          theory: [
            "Läs/lyssna om (m, n) @ (n, p) -> (m, p) och varför ordningen spelar roll.",
            "Rita ett enkelt lager: input x, weights W, bias b, output y.",
          ],
          exercises: [
            "Implementera y = W @ x + b i Python med NumPy (t.ex. W 3x5, x 5x1, b 3x1).",
            "Gör medvetet fel shapes (t.ex. 3x4 @ 5x1) och läs felmeddelandet.",
            "Implementera en 2-layer forward pass med ReLU: h = ReLU(W1 @ x + b1), y = W2 @ h + b2.",
          ],
          summary: [
            "Beskriv i 2–3 meningar vad matrix multiplication gör i ett NN-lager.",
            "Notera ett shape-fel du stötte på och vad du lärde dig av det.",
          ],
        },
      },
      {
        day: 3,
        name: "Norms & Regularization",
        subtopics: ["L2 norm", "Frobenius norm", "L2 regularization", "gradient clipping"],
        why: "Normer styr stabilitet, överfitting och gradient-beteende.",
        defaultBlockMix: {
          notebooklm: 0.15,
          theory: 0.3,
          exercises: 0.45,
          summary: 0.1,
        },
        tasks: {
          notebooklm: [
            "Fråga NotebookLM: 'Förklara L2-norm och Frobenius-norm med intuition, inte bara formler.'",
            "Plocka ut 1 mening som känns mest 'aha'.",
          ],
          theory: [
            "Läs/lyssna om L2-norm som 'avstånd' och varför stora vikter kan leda till överfitting.",
            "Läs kort om vad gradient clipping är och varför det behövs.",
          ],
          exercises: [
            "Implementera l2_norm(v) från scratch och jämför med np.linalg.norm(v, 2).",
            "Implementera frobenius_norm(W) för en matris och jämför med np.linalg.norm(W, 'fro').",
            "Skriv pseudo-kod för loss = mse_loss + 0.01 * frobenius_norm(W).",
            "Implementera enkel gradient clipping på fejk-gradient: om norm > max_norm → skala ner.",
          ],
          summary: [
            "Skriv 2–3 meningar om hur normer hänger ihop med stabilitet i träning.",
            "Notera om något med gradient clipping kändes förvirrande.",
          ],
        },
      },
      {
        day: 4,
        name: "Rank, Determinant & Matrix Debugging",
        subtopics: ["rank", "determinant", "singular matrix", "LinAlgError"],
        why: "För att förstå när system saknar unik lösning och varför inversion failar.",
        defaultBlockMix: {
          notebooklm: 0.15,
          theory: 0.35,
          exercises: 0.35,
          summary: 0.15,
        },
        tasks: {
          notebooklm: [
            "Fråga NotebookLM: 'Förklara rank och determinant på gymnasienivå, med exempel.'",
            "Skriv ner 1 exempel på 'full rank' vs 'rank-deficient'.",
          ],
          theory: [
            "Läs om vad det betyder att en matris är 'singular' och varför det gör inversion omöjlig.",
            "Koppla determinant = 0 till 'volymen kollapsar' i någon dimension.",
          ],
          exercises: [
            "Skapa A = [[1, 2], [2, 4]] och B = [[1, 2], [3, 4]] i NumPy.",
            "Beräkna np.linalg.matrix_rank(A) och np.linalg.matrix_rank(B).",
            "Beräkna np.linalg.det(A) och np.linalg.det(B).",
            "Försök np.linalg.inv(A) och np.linalg.inv(B) och observera vad som händer.",
          ],
          summary: [
            "Förklara med egna ord vad 'rank-deficient' betyder och varför det kan ge problem i ML.",
            "Skriv ett exempel på ett felmeddelande (LinAlgError) du skulle förstå bättre nu.",
          ],
        },
      },
      {
        day: 5,
        name: "Eigenvalues/Eigenvectors & PCA Intuition",
        subtopics: ["eigenvalues", "eigenvectors", "PCA (high-level)"],
        why: "Ger intuition för huvudriktningar i data och hur PCA fungerar.",
        defaultBlockMix: {
          notebooklm: 0.2,
          theory: 0.4,
          exercises: 0.3,
          summary: 0.1,
        },
        tasks: {
          notebooklm: [
            "Be NotebookLM: 'Ge en high-level förklaring av eigenvalues/eigenvectors och hur PCA använder dem.'",
            "Skriv ner 1 mening om Av = λv som känns rimlig.",
          ],
          theory: [
            "Se en video eller läs en artikel om eigenvectors där fokus är geometri, inte bara formler.",
            "Läs kort om PCA: covariance matrix → eigenvectors = 'principal directions'.",
          ],
          exercises: [
            "Skapa A = [[2, 1], [1, 2]] i NumPy.",
            "Kör vals, vecs = np.linalg.eig(A) och skriv ut resultaten.",
            "Ta en eigenvektor v och checka att A @ v ≈ λ * v.",
            "Fundera: hur skulle man använda detta för att hitta 'viktigaste riktningar' i data?",
          ],
          summary: [
            "Skriv 2–3 meningar om vad eigenvectors/eigenvalues intuitivt betyder.",
            "Beskriv väldigt kort hur PCA använder dem.",
          ],
        },
      },
      {
        day: 6,
        name: "Flex: SVD or Review",
        subtopics: ["SVD (basic idea)", "review days 1–3"],
        why: "Antingen preview av SVD eller förstärkning av den viktigaste grunden.",
        defaultBlockMix: {
          notebooklm: 0.2,
          theory: 0.3,
          exercises: 0.3,
          summary: 0.2,
        },
        tasks: {
          notebooklm: [
            "Välj: antingen overview om SVD, eller repetition av vectors/matmul/norms i NotebookLM.",
          ],
          theory: [
            "Om SVD: läs en enkel förklaring av A = U Σ V^T.",
            "Om review: läs dina egna anteckningar från dag 1–3 och markera där du fortfarande är osäker.",
          ],
          exercises: [
            "Om SVD: använd np.linalg.svd på en liten matris och se hur U, S, V^T ser ut.",
            "Om review: kör igenom 1–2 övningar från dag 1–3 (dot, matmul, norm) och se om det sitter.",
          ],
          summary: [
            "Skriv 3 bullets: vad känns starkast nu, vad känns fortfarande svagt, och vad nästa deep dive borde vara.",
          ],
        },
      },
    ],
  }),
};

export type DeepDiveConfigs = typeof deepDiveConfigs;

