import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

export default function LoanFormPage() {
  const navigate = useNavigate();
  const { addLoan, projects } = useAppData();

  const [lender, setLender] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [linkedProject, setLinkedProject] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [monthlyRepayment, setMonthlyRepayment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lender.trim() || !amount) { toast.error('Lender and amount required'); return; }
    const amt = parseFloat(amount) || 0;
    addLoan({
      lender: lender.trim(), amount: amt, interestRate: parseFloat(interestRate) || 0,
      outstanding: amt, purpose: purpose.trim(), linkedProject, startDate, endDate,
      monthlyRepayment: parseFloat(monthlyRepayment) || 0,
    });
    toast.success('Loan added');
    navigate('/finance');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">Add Loan</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Lender"><Input value={lender} onChange={e => setLender(e.target.value)} placeholder="Bank or lender name" /></FormField>
        <FormField label="Loan Amount (LSL)"><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Interest Rate (%)"><Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} /></FormField>
          <FormField label="Monthly Repayment"><Input type="number" value={monthlyRepayment} onChange={e => setMonthlyRepayment(e.target.value)} /></FormField>
        </div>
        <FormField label="Purpose"><Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Equipment purchase" /></FormField>
        <FormField label="Linked Project">
          <select value={linkedProject} onChange={e => setLinkedProject(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">— None —</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></FormField>
          <FormField label="End Date"><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></FormField>
        </div>
        <Button type="submit" className="w-full">Add Loan</Button>
      </form>
    </div>
  );
}
