"use client";

import { useState, useEffect } from 'react';
import { YearBrainUpload } from '@/components/YearBrainUpload';
import { ContentCard } from '@/components/ui/ContentCard';
import { Button } from '@/components/ui/FrostButton';
import { motion } from 'framer-motion';

interface Phase {
  id: string;
  phase_number: number;
  name: string;
  description: string;
  start_month: number;
  end_month: number;
  duration_weeks: number;
  flagship_project: string | null;
  status: string;
  progress_percentage: number;
  modules?: Array<{
    id: string;
    name: string;
    description: string;
    order_index: number;
    topics?: Array<{
      id: string;
      name: string;
      difficulty: string;
    }>;
  }>;
  checkpoints?: Array<{
    id: string;
    name: string;
    week_number: number;
  }>;
}

export default function SettingsPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading phases...');
      const res = await fetch('/api/phases/list');
      console.log('📥 Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Failed to load phases:', errorData);
        throw new Error(errorData.error || 'Failed to load phases');
      }
      
      const data = await res.json();
      console.log('📦 Received data:', data);
      console.log(`✅ Loaded ${data.phases?.length || 0} phases`);
      
      setPhases(data.phases || []);
    } catch (err: any) {
      console.error('❌ Error loading phases:', err);
      setError(err.message || 'Failed to load phases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhases();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1D29] mb-2">Settings</h1>
        <p className="text-[#6B7280]">Manage your YearBrain curriculum</p>
      </div>

      <YearBrainUpload onSuccess={loadPhases} />

      <ContentCard title="Synced Phases" subtitle={`${phases.length} phases loaded`}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : phases.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">
            No phases found. Upload a YearBrain file to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {phases.map((phase) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[#1A1D29]">
                      Phase {phase.phase_number}: {phase.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Månad {phase.start_month}–{phase.end_month} · {phase.duration_weeks} veckor
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    phase.status === 'active' ? 'bg-green-100 text-green-800' :
                    phase.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                
                {phase.flagship_project && (
                  <p className="text-sm text-[#6B7280] mb-2">
                    🚀 Flagship: {phase.flagship_project}
                  </p>
                )}

                <div className="mt-3 space-y-2">
                  <div className="text-sm text-[#6B7280]">
                    <strong>{phase.modules?.length || 0}</strong> modules
                    {' · '}
                    <strong>
                      {phase.modules?.reduce((sum, m) => sum + (m.topics?.length || 0), 0) || 0}
                    </strong> topics
                    {' · '}
                    <strong>{phase.checkpoints?.length || 0}</strong> checkpoints
                  </div>
                  
                  {phase.modules && phase.modules.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-[#5B7CFF] cursor-pointer hover:underline">
                        View modules
                      </summary>
                      <div className="mt-2 ml-4 space-y-2">
                        {phase.modules.map((module) => (
                          <div key={module.id} className="text-sm">
                            <div className="font-medium text-[#1A1D29]">
                              {module.order_index}. {module.name}
                            </div>
                            {module.topics && module.topics.length > 0 && (
                              <div className="ml-4 text-xs text-[#6B7280] mt-1">
                                {module.topics.length} topics
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
