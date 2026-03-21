import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { EmployeeType, PayFrequency } from '@/types';
import { toast } from 'sonner';

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { addEmployee, updateEmployee, employees, projects } = useAppData();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [contractType, setContractType] = useState<'Permanent' | 'Contract' | 'Casual'>('Casual');
  const [classification, setClassification] = useState<EmployeeType>('Unskilled');
  const [assignedProject, setAssignedProject] = useState('');
  const [payFrequency, setPayFrequency] = useState<PayFrequency>('Daily');
  const [dailyRate, setDailyRate] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editId) {
      const emp = employees.find(e => e.id === editId);
      if (emp) {
        setName(emp.name); setIdNumber(emp.idNumber); setContractType(emp.contractType);
        setClassification(emp.classification); setAssignedProject(emp.assignedProject);
        setPayFrequency(emp.payFrequency); setDailyRate(String(emp.dailyRate));
        setRole(emp.role); setPhone(emp.phone); setStartDate(emp.startDate); setIsActive(emp.isActive);
      }
    }
  }, [editId, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    const data = {
      name: name.trim(), idNumber: idNumber.trim(), contractType, classification,
      assignedProject, payFrequency, dailyRate: parseFloat(dailyRate) || 0,
      role: role.trim(), phone: phone.trim(), startDate, isActive,
    };
    if (editId) {
      updateEmployee(editId, data);
      toast.success('Employee updated');
    } else {
      addEmployee(data);
      toast.success('Employee added');
    }
    navigate('/more');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">{editId ? 'Edit' : 'Add'} Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Full Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Employee name" /></FormField>
        <FormField label="ID Number"><Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="National ID" /></FormField>
        <FormField label="Role"><Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Foreman" /></FormField>
        <FormField label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+266..." /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contract Type">
            <select value={contractType} onChange={e => setContractType(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['Permanent', 'Contract', 'Casual'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Classification">
            <select value={classification} onChange={e => setClassification(e.target.value as EmployeeType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['Skilled', 'Unskilled'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Assigned Project">
          <select value={assignedProject} onChange={e => setAssignedProject(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">— None —</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Pay Frequency">
            <select value={payFrequency} onChange={e => setPayFrequency(e.target.value as PayFrequency)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['Daily', 'Weekly', 'Monthly'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Daily Rate (LSL)">
            <Input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} placeholder="0" />
          </FormField>
        </div>
        <FormField label="Start Date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></FormField>
        {editId && (
          <FormField label="Status">
            <select value={isActive ? 'active' : 'inactive'} onChange={e => setIsActive(e.target.value === 'active')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        )}
        <Button type="submit" className="w-full">{editId ? 'Update' : 'Add'} Employee</Button>
      </form>
    </div>
  );
}
