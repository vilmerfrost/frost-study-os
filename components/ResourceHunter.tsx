"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/FrostButton';
import { ContentCard } from '@/components/ui/ContentCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Resource {
  type: string;
  title: string;
  url: string;
  thumbnail: string;
  channel?: string;
  relevanceScore: number;
}

export function ResourceHunter({ topic, masteryLevel = 50 }: { topic: string; masteryLevel?: number }) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, masteryLevel }),
      });
      const data = await res.json();
      setResources(data.resources || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToNotebookLM = (resource: Resource) => {
    // Open NotebookLM with pre-filled URL
    window.open(`https://notebooklm.google.com?source=${encodeURIComponent(resource.url)}`, '_blank');
  };

  return (
    <ContentCard>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Lärresurser</h3>
            <p className="text-sm text-gray-600">AI-kurerade för {topic}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Söker...
              </>
            ) : (
              '🔍 Hitta Resurser'
            )}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {resources.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">Inga resurser hittades</p>
              ) : (
                resources.map((resource, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                  >
                    {/* Thumbnail */}
                    {resource.thumbnail && (
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-32 h-20 object-cover rounded flex-shrink-0"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {resource.title}
                      </h4>
                      {resource.channel && (
                        <p className="text-sm text-gray-600 mb-2">{resource.channel}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          YouTube
                        </span>
                        <span className="text-xs text-gray-500">
                          Relevans: {resource.relevanceScore}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Öppna →
                      </a>
                      <button
                        onClick={() => addToNotebookLM(resource)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + NotebookLM
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContentCard>
  );
}

