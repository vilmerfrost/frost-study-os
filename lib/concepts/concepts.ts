import type { YearDay } from "@/config/yearBrain";
import { yearBrain } from "@/config/yearBrain";

/**
 * ConceptNode represents a learnable concept/topic in the YearBrain curriculum.
 * Each concept has an ID, phase, dependencies, and metadata.
 */
export interface ConceptNode {
  id: string; // e.g. "linear_algebra.eigenvectors" or "probability.clt"
  phase: number; // from YearBrain phases (1-4)
  dependencies: string[]; // other concept IDs that should be mastered first
  title: string;
  description?: string;
  topicKey?: string; // links to YearBrain topicKey
}

/**
 * Maps YearBrain topics/focusAreas to ConceptNode IDs.
 * This creates a concept graph structure for tracking mastery.
 */
const conceptMap: Map<string, ConceptNode> = new Map();

// Initialize concept map from YearBrain modules
function initializeConceptMap() {
  if (conceptMap.size > 0) return; // Already initialized

  for (const module of yearBrain.modules) {
    // Create a main concept for each module
    const moduleConcept: ConceptNode = {
      id: module.topicKey,
      phase: module.phase,
      dependencies: [],
      title: module.title,
      description: module.description,
      topicKey: module.topicKey,
    };
    conceptMap.set(module.topicKey, moduleConcept);

    // Create sub-concepts for each daily outline item
    module.dailyOutline.forEach((outline, index) => {
      const subConceptId = `${module.topicKey}.${outline.toLowerCase().replace(/\s+/g, "_")}`;
      const subConcept: ConceptNode = {
        id: subConceptId,
        phase: module.phase,
        dependencies: index > 0 ? [`${module.topicKey}.${module.dailyOutline[index - 1].toLowerCase().replace(/\s+/g, "_")}`] : [module.topicKey],
        title: outline,
        description: `Part of ${module.title}`,
        topicKey: module.topicKey,
      };
      conceptMap.set(subConceptId, subConcept);
    });
  }
}

/**
 * Get a ConceptNode for a given YearDay.
 * Returns the main module concept or a specific sub-concept if focusArea matches.
 */
export function getConceptForYearDay(yearDay: YearDay): ConceptNode | null {
  initializeConceptMap();

  // Try to find a sub-concept matching the focusArea
  const focusAreaKey = yearDay.focusArea.toLowerCase().replace(/\s+/g, "_");
  const subConceptId = `${yearDay.topicKey}.${focusAreaKey}`;
  
  if (conceptMap.has(subConceptId)) {
    return conceptMap.get(subConceptId)!;
  }

  // Fall back to main module concept
  if (conceptMap.has(yearDay.topicKey)) {
    return conceptMap.get(yearDay.topicKey)!;
  }

  return null;
}

/**
 * Get a ConceptNode by its ID.
 */
export function getConceptById(id: string): ConceptNode | null {
  initializeConceptMap();
  return conceptMap.get(id) || null;
}

/**
 * Get all concepts for a given phase.
 */
export function getConceptsForPhase(phase: number): ConceptNode[] {
  initializeConceptMap();
  return Array.from(conceptMap.values()).filter((c) => c.phase === phase);
}

/**
 * Get all concepts for a given topicKey (module).
 */
export function getConceptsForTopic(topicKey: string): ConceptNode[] {
  initializeConceptMap();
  return Array.from(conceptMap.values()).filter((c) => c.topicKey === topicKey);
}

/**
 * Get all concepts (for debugging/admin purposes).
 */
export function getAllConcepts(): ConceptNode[] {
  initializeConceptMap();
  return Array.from(conceptMap.values());
}

