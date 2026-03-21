import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

export default function InvestorFormPage() {
  const navigate = useNavigate();
  const { addInvestor } = useAppData();

  const [name, setName] = useState('');
  const [capitalInvested, setCapitalInvested] = useState('');
  const [equityPercent, setEquityPercent] = useState('');
  const [returnsPaid, setReturnsPaid] = useState('0');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !capitalInvested) { toast.error('Name and capital required'); return; }
    addInvestor({
      name: name.trim(), capitalInvested: parseFloat(capitalInvested) || 0,
      equityPercent: parseFloat(equityPercent) || 0, returnsPaid: parseFloat(returnsPaid) || 0, joinDate,
    });
    toast.success('Investor added');
    navigate('/finance');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">Add Investor</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <FormField label="Investor Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></FormField>
        <FormField label="Capital Invested (LSL)"><Input type="number" value={capitalInvested} onChange={e => setCapitalInvested(e.target.value)} /></FormField>
        <FormField label="Equity %"><Input type="number" step="0.1" value={equityPercent} onChange={e => setEquityPercent(e.target.value)} /></FormField>
        <FormField label="Returns Paid (LSL)"><Input type="number" value={returnsPaid} onChange={e => setReturnsPaid(e.target.value)} /></FormField>
        <FormField label="Join Date"><Input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} /></FormField>
        <Button type="submit" className="w-full">Add Investor</Button>
      </form>
    </div>
  );
}
