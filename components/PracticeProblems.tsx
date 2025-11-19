"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/FrostButton';
import { ContentCard } from '@/components/ui/ContentCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Problem {
  problem: string;
  solution: string;
}

export function PracticeProblems({
  topic,
  difficulty = 'medium',
}: {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}) {
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);

  const generateProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: 3 }),
      });
      const data = await res.json();
      setProblems(data.problems || []);
      setRevealed([]);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolution = (idx: number) => {
    setRevealed((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  return (
    <ContentCard title="Övningsuppgifter" subtitle={`${difficulty} nivå`}>
      <div className="space-y-4">
        {problems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">AI genererar anpassade övningsuppgifter för dig</p>
            <Button variant="primary" onClick={generateProblems} disabled={loading}>
              {loading ? '⏳ Genererar...' : '✨ Generera Uppgifter'}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {problems.map((problem, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Problem */}
                  <div className="p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#5B7CFF] to-[#B24BF3] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{problem.problem}</p>
                      </div>
                    </div>
                  </div>

                  {/* Solution Toggle */}
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => toggleSolution(idx)}
                      className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors text-left"
                    >
                      {revealed.includes(idx) ? '🙈 Dölj Lösning' : '👁️ Visa Lösning'}
                    </button>
                  </div>

                  {/* Solution */}
                  <AnimatePresence>
                    {revealed.includes(idx) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 bg-gray-50 p-4 overflow-hidden"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Lösning:</h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{problem.solution}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <Button variant="ghost" onClick={generateProblems} disabled={loading}>
              🔄 Generera Nya Uppgifter
            </Button>
          </>
        )}
      </div>
    </ContentCard>
  );
}

