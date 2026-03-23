import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

export default function EquipmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { addEquipment, updateEquipment, equipment, projects } = useAppData();

  const [name, setName] = useState('');
  const [type, setType] = useState<'Machinery' | 'Vehicle' | 'Tool'>('Tool');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [status, setStatus] = useState<'Available' | 'In Use' | 'Maintenance'>('Available');
  const [fuelUsage, setFuelUsage] = useState('');
  const [lastMaintenance, setLastMaintenance] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptMimeType, setReceiptMimeType] = useState('');

  useEffect(() => {
    if (editId) {
      const eq = equipment.find(e => e.id === editId);
      if (eq) {
        setName(eq.name); setType(eq.type); setPurchaseCost(String(eq.purchaseCost));
        setCurrentValue(String(eq.currentValue)); setAssignedProject(eq.assignedProject);
        setStatus(eq.status); setFuelUsage(String(eq.fuelUsagePerDay));
        setLastMaintenance(eq.lastMaintenance);
        setReceiptDataUrl(eq.receiptDataUrl || '');
        setReceiptFileName(eq.receiptFileName || '');
        setReceiptMimeType(eq.receiptMimeType || '');
      }
    }
  }, [editId, equipment]);

  const handleReceiptFile = (file: File | null) => {
    if (!file) {
      setReceiptDataUrl('');
      setReceiptFileName('');
      setReceiptMimeType('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setReceiptDataUrl(result);
      setReceiptFileName(file.name);
      setReceiptMimeType(file.type || 'application/octet-stream');
    };
    reader.onerror = () => toast.error('Failed to read receipt file');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    const data = {
      name: name.trim(), type, purchaseCost: parseFloat(purchaseCost) || 0,
      currentValue: parseFloat(currentValue) || 0, assignedProject,
      status, fuelUsagePerDay: parseFloat(fuelUsage) || 0, lastMaintenance,
      receiptDataUrl,
      receiptFileName,
      receiptMimeType,
    };
    if (editId) {
      updateEquipment(editId, data);
      toast.success('Equipment updated');
    } else {
      addEquipment(data);
      toast.success('Equipment added');
    }
    navigate('/more');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">{editId ? 'Edit' : 'Add'} Equipment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Equipment Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CAT Excavator" /></FormField>
        <FormField label="Type">
          <select value={type} onChange={e => setType(e.target.value as any)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {['Machinery', 'Vehicle', 'Tool'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Purchase Cost (LSL)"><Input type="number" value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} /></FormField>
          <FormField label="Current Value (LSL)"><Input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} /></FormField>
        </div>
        <FormField label="Assigned Project">
          <select value={assignedProject} onChange={e => setAssignedProject(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">— None —</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </FormField>
        {editId && (
          <FormField label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['Available', 'In Use', 'Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        )}
        <FormField label="Fuel Usage / Day (L)"><Input type="number" value={fuelUsage} onChange={e => setFuelUsage(e.target.value)} /></FormField>
        <FormField label="Last Maintenance"><Input type="date" value={lastMaintenance} onChange={e => setLastMaintenance(e.target.value)} /></FormField>
        <FormField label="Purchase Receipt (optional)">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={e => handleReceiptFile(e.target.files?.[0] || null)}
          />
          {receiptFileName && (
            <p className="text-xs text-muted-foreground mt-1">Attached: {receiptFileName}</p>
          )}
        </FormField>
        <Button type="submit" className="w-full">{editId ? 'Update' : 'Add'} Equipment</Button>
      </form>
    </div>
  );
}
