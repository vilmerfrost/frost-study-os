"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface EnergyHeatmapProps {
  userId?: string; // Optional - will show placeholder if not provided
  days?: number;
}

/**
 * Energy & Focus heatmap showing session quality and energy levels over time.
 * Displays a 30-day grid with color-coded cells.
 */
export default function EnergyHeatmap({ userId, days = 30 }: EnergyHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Array<{ date: string; energy: number; quality: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHeatmap() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch heatmap data from API route (since we can't use supabaseServer in client components)
        const res = await fetch(`/api/sessions/heatmap?userId=${userId}&days=${days}`);
        if (!res.ok) {
          throw new Error("Failed to fetch heatmap data");
        }
        const { heatmap } = await res.json();

        setHeatmapData(heatmap);
      } catch (error) {
        console.error("Error loading heatmap:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHeatmap();
  }, [userId, days]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600">Laddar heatmap...</p>
      </div>
    );
  }

  // Generate grid for last 30 days
  const grid = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const data = heatmapData.find((d) => d.date === dateStr);
    const intensity = data ? (data.energy + data.quality) / 2 : 0;

    grid.push({
      date: dateStr,
      intensity,
      hasSession: !!data,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Energy & Focus ({days} dagar)</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200" />
            <span>Ingen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <span>Låg</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Hög</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
        {grid.map((cell, idx) => {
          const bgColor = cell.hasSession
            ? cell.intensity >= 4
              ? "bg-green-500"
              : cell.intensity >= 2.5
              ? "bg-yellow-400"
              : "bg-orange-400"
            : "bg-gray-200";

          return (
            <motion.div
              key={cell.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.01 }}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              className={`w-3 h-3 rounded ${bgColor} cursor-pointer group relative`}
              title={`${cell.date}: ${cell.hasSession ? `Energy ${cell.intensity.toFixed(1)}` : "Ingen session"}`}
            />
          );
        })}
      </div>
    </div>
  );
}

