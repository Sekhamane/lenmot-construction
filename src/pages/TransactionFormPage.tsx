import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionType } from '@/types';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = ['Materials', 'Labour', 'Equipment', 'Subcontractors', 'Transport', 'Overheads', 'Other'];
const INCOME_CATEGORIES = ['Billing', 'Other Income'];

export default function TransactionFormPage() {
  const navigate = useNavigate();
  const { addTransaction, projects } = useAppData();
  const { currentUser } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Materials');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptMimeType, setReceiptMimeType] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedProject = projects.find(p => p.id === projectId);

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
    if (!description.trim() || !amount) { toast.error('Description and amount required'); return; }
    addTransaction({
      date, description: description.trim(), amount: parseFloat(amount) || 0,
      type, category, projectId, projectName: selectedProject?.name || '',
      approvedBy: currentUser?.name || '',
      receiptDataUrl,
      receiptFileName,
      receiptMimeType,
    });
    toast.success('Transaction added');
    navigate('/finance');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">Add Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Type">
          <div className="flex gap-2">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(t === 'expense' ? 'Materials' : 'Billing'); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium capitalize ${type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Description"><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Cement delivery" /></FormField>
        <FormField label="Amount (LSL)"><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></FormField>
        <FormField label="Category">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></FormField>
        <FormField label="Project">
          <select value={projectId} onChange={e => setProjectId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">— No project —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
        <FormField label="Receipt / Invoice (optional)">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={e => handleReceiptFile(e.target.files?.[0] || null)}
          />
          {receiptFileName && (
            <p className="text-xs text-muted-foreground mt-1">Attached: {receiptFileName}</p>
          )}
        </FormField>
        <Button type="submit" className="w-full">Save Transaction</Button>
      </form>
    </div>
  );
}
