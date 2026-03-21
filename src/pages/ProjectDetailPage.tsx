import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrencyFull, formatDate } from '@/utils/format';
import { ProjectStatus } from '@/types';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { projects, transactions, employees, updateProject, deleteProject, addBillingStage, updateBillingStage, deleteBillingStage, getProjectCosts } = useAppData();

  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  const projectTransactions = useMemo(() => transactions.filter(t => t.projectId === id), [transactions, id]);
  const projectEmployees = useMemo(() => employees.filter(e => e.assignedProject === project?.name), [employees, project]);
  const costs = useMemo(() => id ? getProjectCosts(id) : null, [id, getProjectCosts]);

  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<ProjectStatus>('Planned');
  const [editCompletion, setEditCompletion] = useState('0');
  const [editSupervisor, setEditSupervisor] = useState('');

  const [showStageForm, setShowStageForm] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageAmount, setStageAmount] = useState('');
  const [stageDueDate, setStageDueDate] = useState('');
  const [stageRetention, setStageRetention] = useState('5');

  if (!project) {
    return (
      <div className="content-area animate-fade-in">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-sm text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditStatus(project.status);
    setEditCompletion(String(project.completionPercent));
    setEditSupervisor(project.supervisor || '');
    setEditing(true);
  };

  const handleSaveEdit = () => {
    updateProject(project.id, { status: editStatus, completionPercent: parseInt(editCompletion) || 0, supervisor: editSupervisor.trim() });
    setEditing(false);
    toast.success('Project updated');
  };

  const handleDelete = () => {
    deleteProject(project.id);
    toast.success('Project deleted');
    navigate('/projects');
  };

  const handleAddStage = () => {
    if (!stageName.trim() || !stageAmount) return;
    addBillingStage(project.id, {
      stageName: stageName.trim(),
      amount: parseFloat(stageAmount) || 0,
      invoiced: false, paid: false,
      dueDate: stageDueDate,
      retentionPercent: parseFloat(stageRetention) || 5,
    });
    setStageName(''); setStageAmount(''); setStageDueDate(''); setStageRetention('5');
    setShowStageForm(false);
    toast.success('Billing stage added');
  };

  const totalBilled = project.billingStages.reduce((s, b) => s + (b.invoiced ? b.amount : 0), 0);
  const totalPaid = project.billingStages.reduce((s, b) => s + (b.paid ? b.amount : 0), 0);

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-sm text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.clientName} • {project.siteLocation}</p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <StatusBadge status={project.status} />
              {hasPermission('projects') && (
                <button onClick={handleStartEdit} className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
              )}
            </>
          ) : (
            <>
              <button onClick={handleSaveEdit} className="text-success"><Check className="w-5 h-5" /></button>
              <button onClick={() => setEditing(false)} className="text-destructive"><X className="w-5 h-5" /></button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="glass-card p-4 mb-6 space-y-3">
          <FormField label="Status">
            <select value={editStatus} onChange={e => setEditStatus(e.target.value as ProjectStatus)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {(['Planned', 'Active', 'Suspended', 'Completed'] as ProjectStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Completion %">
            <Input type="number" min="0" max="100" value={editCompletion} onChange={e => setEditCompletion(e.target.value)} />
          </FormField>
          <FormField label="Supervisor">
            <select value={editSupervisor} onChange={e => setEditSupervisor(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">— Select —</option>
              {employees.filter(e => e.isActive).map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
            </select>
          </FormField>
        </div>
      ) : (
        <>
          <ProgressBar progress={project.completionPercent} />
          <p className="text-xs text-muted-foreground mt-1 mb-4">{project.completionPercent}% complete</p>
        </>
      )}

      {/* Key Info */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground">Contract</p>
          <p className="text-sm font-bold text-foreground">{formatCurrencyFull(project.contractValue)}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground">Manager</p>
          <p className="text-sm font-medium text-foreground">{project.projectManager || '—'}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground">Supervisor</p>
          <p className="text-sm font-medium text-foreground">{project.supervisor || '—'}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground">Start</p>
          <p className="text-sm text-foreground">{formatDate(project.startDate)}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="text-sm text-foreground">{formatDate(project.expectedCompletion)}</p>
        </div>
      </div>

      {/* Costs */}
      {costs && (
        <>
          <SectionHeader title="Cost Breakdown" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {Object.entries(costs).map(([k, v]) => (
              <div key={k} className="glass-card p-3">
                <p className="text-xs text-muted-foreground capitalize">{k}</p>
                <p className="text-sm font-medium text-foreground">{formatCurrencyFull(v)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Billing Stages */}
      <SectionHeader title="Billing Stages" subtitle={`Invoiced: ${formatCurrencyFull(totalBilled)} | Paid: ${formatCurrencyFull(totalPaid)}`}
        action={hasPermission('projects') ? (
          <button onClick={() => setShowStageForm(!showStageForm)} className="btn-primary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Stage
          </button>
        ) : undefined}
      />

      {showStageForm && (
        <div className="glass-card p-4 mb-4 space-y-3">
          <FormField label="Stage Name"><Input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="e.g. Foundation" /></FormField>
          <FormField label="Amount (LSL)"><Input type="number" value={stageAmount} onChange={e => setStageAmount(e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Due Date"><Input type="date" value={stageDueDate} onChange={e => setStageDueDate(e.target.value)} /></FormField>
            <FormField label="Retention %"><Input type="number" value={stageRetention} onChange={e => setStageRetention(e.target.value)} /></FormField>
          </div>
          <Button onClick={handleAddStage} className="w-full">Add Stage</Button>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {project.billingStages.map(stage => (
          <div key={stage.id} className="glass-card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{stage.stageName}</p>
              <p className="text-xs text-muted-foreground">{formatCurrencyFull(stage.amount)} • Due: {formatDate(stage.dueDate)} • Ret: {stage.retentionPercent}%</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateBillingStage(project.id, stage.id, { invoiced: !stage.invoiced })}
                className={`text-xs px-2 py-1 rounded ${stage.invoiced ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {stage.invoiced ? 'Invoiced' : 'Invoice'}
              </button>
              <button onClick={() => updateBillingStage(project.id, stage.id, { paid: !stage.paid })}
                className={`text-xs px-2 py-1 rounded ${stage.paid ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>
                {stage.paid ? 'Paid' : 'Pay'}
              </button>
              <button onClick={() => { deleteBillingStage(project.id, stage.id); toast.success('Stage deleted'); }}
                className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {project.billingStages.length === 0 && <p className="text-sm text-muted-foreground">No billing stages</p>}
      </div>

      {/* Team */}
      <SectionHeader title="Team" subtitle={`${projectEmployees.length} assigned`} />
      <div className="space-y-2 mb-6">
        {projectEmployees.map(emp => (
          <div key={emp.id} className="glass-card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{emp.name}</p>
              <p className="text-xs text-muted-foreground">{emp.role} • {emp.classification}</p>
            </div>
            <p className="text-sm text-foreground">{formatCurrencyFull(emp.dailyRate)}/day</p>
          </div>
        ))}
        {projectEmployees.length === 0 && <p className="text-sm text-muted-foreground">No employees assigned</p>}
      </div>

      {/* Transactions */}
      <SectionHeader title="Transactions" subtitle={`${projectTransactions.length} records`} />
      <div className="space-y-2 mb-6">
        {projectTransactions.slice(0, 10).map(tx => (
          <div key={tx.id} className="glass-card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.date)} • {tx.category}</p>
            </div>
            <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
            </span>
          </div>
        ))}
      </div>

      {hasPermission('projects') && (
        <Button variant="destructive" onClick={handleDelete} className="w-full">Delete Project</Button>
      )}
    </div>
  );
}
