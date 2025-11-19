"use client";

import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/ui/ContentCard';
import { Button } from '@/components/ui/FrostButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects/list');
      if (res.ok) {
        const { projects } = await res.json();
        setProjects(projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: number) => {
    const badges: Record<number, { text: string; color: string }> = {
      1: { text: 'TIER 1', color: 'bg-red-100 text-red-700' },
      2: { text: 'TIER 2', color: 'bg-yellow-100 text-yellow-700' },
      3: { text: 'TIER 3', color: 'bg-blue-100 text-blue-700' },
    };
    return badges[tier] || badges[3];
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      conceptual: { text: 'Conceptual', color: 'bg-gray-100 text-gray-700' },
      active: { text: 'Active', color: 'bg-green-100 text-green-700' },
      shipped: { text: 'Shipped', color: 'bg-blue-100 text-blue-700' },
      maintenance: { text: 'Maintenance', color: 'bg-purple-100 text-purple-700' },
    };
    return badges[status] || badges.conceptual;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Your flagship builds & side projects</p>
        </div>
        <Button variant="primary">+ Nytt Projekt</Button>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <ContentCard>
            <p className="text-gray-600 text-center py-8">Inga projekt ännu. Upload YearBrain för att se flagship projects.</p>
          </ContentCard>
        ) : (
          projects.map((project) => {
            const tierBadge = getTierBadge(project.tier);
            const statusBadge = getStatusBadge(project.status);
            const completedMilestones = project.milestones?.filter((m: any) => m.is_completed).length || 0;
            const totalMilestones = project.milestones?.length || 0;

            return (
              <ContentCard key={project.id}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${tierBadge.color}`}>
                          {tierBadge.text}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-gray-600">{project.description}</p>
                      {project.phase && (
                        <p className="text-sm text-gray-500 mt-1">
                          {project.phase.name} · Phase {project.phase.phase_number} Flagship
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <ProgressBar progress={project.progress_percentage || 0} label="Overall Progress" height="md" />
                  </div>

                  {/* Milestones */}
                  {totalMilestones > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Milestones ({completedMilestones}/{totalMilestones})
                      </h4>
                      <div className="space-y-2">
                        {project.milestones.slice(0, 3).map((milestone: any) => (
                          <div key={milestone.id} className="flex items-center gap-3 text-sm">
                            <span>{milestone.is_completed ? '✅' : '⏳'}</span>
                            <span
                              className={
                                milestone.is_completed ? 'text-gray-500 line-through' : 'text-gray-700'
                              }
                            >
                              {milestone.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    {project.last_activity && (
                      <span>Last activity: {new Date(project.last_activity).toLocaleDateString('sv-SE')}</span>
                    )}
                    {project.target_completion_date && (
                      <span>Target: {new Date(project.target_completion_date).toLocaleDateString('sv-SE')}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button variant="primary" size="sm">
                      Start Session
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                    {project.github_repo && (
                      <a
                        href={project.github_repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        GitHub →
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Live Demo →
                      </a>
                    )}
                  </div>
                </div>
              </ContentCard>
            );
          })
        )}
      </div>
    </div>
  );
}

