"use client";

import { motion } from "framer-motion";
import { getConceptsForPhase } from "@/lib/concepts/concepts";
import { useEffect, useState } from "react";

interface ConceptGraphMiniProps {
  phase: number;
  userId?: string; // Optional - will show placeholder if not provided
}

/**
 * Mini visualization of concept mastery for a given phase.
 * Shows a row of concepts with color-coded mastery scores (0-100).
 */
export default function ConceptGraphMini({ phase, userId }: ConceptGraphMiniProps) {
  const [masteryData, setMasteryData] = useState<Array<{ conceptId: string; mastery: number; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMastery() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const concepts = getConceptsForPhase(phase);

        // Fetch mastery from API route (since we can't use supabaseServer in client components)
        const res = await fetch(`/api/concepts/mastery?userId=${userId}&phase=${phase}`);
        if (!res.ok) {
          throw new Error("Failed to fetch mastery");
        }
        const { mastery } = await res.json();

        const masteryMap = new Map(mastery.map((m: any) => [m.concept_id, m.mastery_score]));

        const data = concepts.slice(0, 8).map((concept) => ({
          conceptId: concept.id,
          mastery: (masteryMap.get(concept.id) as number) ?? 0,
          title: concept.title,
        }));

        setMasteryData(data);
      } catch (error) {
        console.error("Error loading concept mastery:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMastery();
  }, [phase, userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600">Laddar concept mastery...</p>
      </div>
    );
  }

  if (masteryData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600">Ingen mastery data ännu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Concept Mastery - Phase {phase}</h3>
        <span className="text-xs text-gray-500">{masteryData.length} concepts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {masteryData.map((item) => {
          const color = item.mastery >= 75 ? "bg-green-500" : item.mastery >= 50 ? "bg-yellow-500" : "bg-red-500";
          return (
            <motion.div
              key={item.conceptId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div
                className={`h-8 px-3 rounded-lg ${color} flex items-center justify-center cursor-pointer transition-all`}
                style={{ opacity: Math.max(0.3, item.mastery / 100) }}
              >
                <span className="text-xs font-medium text-white">{item.mastery}%</span>
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 border border-gray-300 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-lg">
                  {item.title}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

