import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { ProjectStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_OPTIONS: ProjectStatus[] = ['Planned', 'Active', 'Suspended', 'Completed'];

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { addProject, employees } = useAppData();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planned');
  const [completionPercent, setCompletionPercent] = useState('0');

  const supervisorCandidates = employees.filter(e => e.isActive && (e.role.toLowerCase().includes('supervisor') || e.role.toLowerCase().includes('foreman') || true));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) {
      toast.error('Project name and client are required');
      return;
    }
    if (!supervisor.trim()) {
      toast.error('Supervisor is required for every project');
      return;
    }
    addProject({
      name: name.trim(),
      clientName: clientName.trim(),
      contractValue: parseFloat(contractValue) || 0,
      startDate,
      expectedCompletion,
      projectManager: projectManager.trim(),
      supervisor: supervisor.trim(),
      siteLocation: siteLocation.trim(),
      status,
      completionPercent: parseInt(completionPercent) || 0,
      billingStages: [],
    });
    toast.success('Project created');
    navigate('/projects');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Project Name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maseru Office Complex" />
        </FormField>
        <FormField label="Client Name">
          <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" />
        </FormField>
        <FormField label="Contract Value (LSL)">
          <Input type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="0" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="Expected Completion">
            <Input type="date" value={expectedCompletion} onChange={e => setExpectedCompletion(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Project Manager">
          <Input value={projectManager} onChange={e => setProjectManager(e.target.value)} placeholder="Manager name" />
        </FormField>
        <FormField label="Site Supervisor *">
          <select value={supervisor} onChange={e => setSupervisor(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">— Select Supervisor —</option>
            {supervisorCandidates.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
          </select>
        </FormField>
        <FormField label="Site Location">
          <Input value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="Location" />
        </FormField>
        <FormField label="Status">
          <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Completion %">
          <Input type="number" min="0" max="100" value={completionPercent} onChange={e => setCompletionPercent(e.target.value)} />
        </FormField>
        <Button type="submit" className="w-full">Create Project</Button>
      </form>
    </div>
  );
}
