"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicSelectorProps {
  onSelect: (topicId: string) => void;
  currentPhase: number;
  currentWeek: number;
}

export function TopicSelector({ onSelect, currentPhase, currentWeek }: TopicSelectorProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [filter, setFilter] = useState<'this-week' | 'phase' | 'all'>('this-week');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  useEffect(() => {
    loadTopics();
  }, [filter, currentPhase, currentWeek]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/topics/list?filter=${filter}&phase=${currentPhase}&week=${currentWeek}`
      );
      if (res.ok) {
        const { topics } = await res.json();
        setTopics(topics || []);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (topic: any) => {
    setSelectedTopic(topic);
    onSelect(topic.id);
    setIsOpen(false);
  };

  const getMasteryIcon = (score: number, isLocked: boolean) => {
    if (isLocked) return '🔒';
    if (score === 0) return '⏳';
    if (score > 80) return '✅';
    return '🟡';
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedTopic ? (
            <>
              <span>{getMasteryIcon(selectedTopic.mastery_score || 0, selectedTopic.is_locked || false)}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedTopic.name}</p>
                <p className="text-sm text-gray-600">{selectedTopic.module?.name || ''}</p>
              </div>
            </>
          ) : (
            <span className="text-gray-600">Välj topic...</span>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 p-2 gap-1">
              <button
                onClick={() => setFilter('this-week')}
                className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                  filter === 'this-week'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Denna Vecka
              </button>
              <button
                onClick={() => setFilter('phase')}
                className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                  filter === 'phase'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Phase {currentPhase}
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Alla
              </button>
            </div>

            {/* Topics List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-4 text-center text-gray-600">Loading...</div>
              ) : topics.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No topics found</div>
              ) : (
                <div className="p-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleSelect(topic)}
                      disabled={topic.is_locked}
                      className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                        topic.is_locked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {getMasteryIcon(topic.mastery_score || 0, topic.is_locked || false)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{topic.name}</p>
                          <p className="text-sm text-gray-600">{topic.module?.name || ''}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                              {topic.difficulty || 'intermediate'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Mastery: {topic.mastery_score || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

