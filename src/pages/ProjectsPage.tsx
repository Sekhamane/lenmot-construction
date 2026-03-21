import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppData } from '@/contexts/AppDataContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { ProjectStatus } from '@/types';

const FILTERS: (ProjectStatus | 'All')[] = ['All', 'Active', 'Planned', 'Completed', 'Suspended'];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, getProjectBudgetUsed } = useAppData();
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'All'>('All');

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter(p => p.status === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display">Projects</h1>
        <button onClick={() => navigate('/project-form')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`filter-chip whitespace-nowrap ${activeFilter === filter ? 'filter-chip-active' : 'filter-chip-inactive'}`}>
            {filter}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {filteredProjects.map(project => {
          const budgetUsed = getProjectBudgetUsed(project.id);
          const remaining = project.contractValue - budgetUsed;
          return (
            <div key={project.id} className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.clientName}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.siteLocation}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.expectedCompletion)}</span>
              </div>
              <ProgressBar progress={project.completionPercent} />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">{project.completionPercent}% complete</span>
                <span className="text-foreground font-medium">{formatCurrency(project.contractValue)}</span>
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Used: {formatCurrency(budgetUsed)}</span>
                <span className={remaining >= 0 ? 'text-success' : 'text-destructive'}>Remaining: {formatCurrency(remaining)}</span>
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
