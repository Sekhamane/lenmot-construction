import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus, Trash2, Landmark, Users, CreditCard } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatCurrencyFull, formatDate } from '@/utils/format';
import { toast } from 'sonner';

type FinanceTab = 'transactions' | 'loans' | 'investors';

export default function FinancePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { transactions, loans, investors, getFinancialSummary, deleteTransaction, deleteLoan, deleteInvestor } = useAppData();
  const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display">Finance</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard title="Revenue" value={formatCurrency(summary.totalRevenue)} icon={TrendingUp} />
        <MetricCard title="Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} />
        <MetricCard title="Receivables" value={formatCurrency(summary.totalReceivables)} icon={CreditCard} />
        <MetricCard title="Loans Outstanding" value={formatCurrency(summary.totalPayables)} icon={Landmark} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {(['transactions', 'loans', 'investors'] as FinanceTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`filter-chip whitespace-nowrap capitalize ${activeTab === tab ? 'filter-chip-active' : 'filter-chip-inactive'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <>
          <SectionHeader title="Transactions" action={
            hasPermission('finance') ? (
              <button onClick={() => navigate('/transaction-form')} className="btn-primary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            ) : undefined
          } />
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(tx.date)} • {tx.category} • {tx.projectName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
                  </span>
                  {hasPermission('finance') && (
                    <button onClick={() => { deleteTransaction(tx.id); toast.success('Transaction deleted'); }} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'loans' && (
        <>
          <SectionHeader title="Loans" action={
            hasPermission('loans') ? (
              <button onClick={() => navigate('/loan-form')} className="btn-primary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            ) : undefined
          } />
          <div className="space-y-3">
            {loans.map(loan => (
              <div key={loan.id} className="glass-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{loan.lender}</h3>
                    <p className="text-xs text-muted-foreground">{loan.purpose}</p>
                  </div>
                  <button onClick={() => { deleteLoan(loan.id); toast.success('Loan deleted'); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Amount:</span> <span className="text-foreground font-medium">{formatCurrencyFull(loan.amount)}</span></div>
                  <div><span className="text-muted-foreground">Outstanding:</span> <span className="text-warning font-medium">{formatCurrencyFull(loan.outstanding)}</span></div>
                  <div><span className="text-muted-foreground">Rate:</span> <span className="text-foreground">{loan.interestRate}%</span></div>
                  <div><span className="text-muted-foreground">Monthly:</span> <span className="text-foreground">{formatCurrencyFull(loan.monthlyRepayment)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'investors' && (
        <>
          <SectionHeader title="Investors" action={
            hasPermission('investors') ? (
              <button onClick={() => navigate('/investor-form')} className="btn-primary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            ) : undefined
          } />
          <div className="space-y-3">
            {investors.map(inv => (
              <div key={inv.id} className="glass-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{inv.name}</h3>
                    <p className="text-xs text-muted-foreground">Joined: {formatDate(inv.joinDate)}</p>
                  </div>
                  <button onClick={() => { deleteInvestor(inv.id); toast.success('Investor deleted'); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Capital:</span><br/><span className="text-foreground font-medium">{formatCurrency(inv.capitalInvested)}</span></div>
                  <div><span className="text-muted-foreground">Equity:</span><br/><span className="text-primary font-medium">{inv.equityPercent}%</span></div>
                  <div><span className="text-muted-foreground">Returns:</span><br/><span className="text-success font-medium">{formatCurrency(inv.returnsPaid)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
