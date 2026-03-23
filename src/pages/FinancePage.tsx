import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus, Trash2, Landmark, CreditCard, Download } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatCurrencyFull, formatDate } from '@/utils/format';
import { toast } from 'sonner';

type FinanceTab = 'transactions' | 'loans' | 'investors';
type AccountingBookTab = 'income-statement' | 'balance-sheet' | 'trial-balance';

export default function FinancePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const {
    transactions,
    loans,
    investors,
    getFinancialSummary,
    getIncomeStatement,
    getBalanceSheet,
    getTrialBalance,
    deleteTransaction,
    deleteLoan,
    deleteInvestor,
  } = useAppData();
  const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
  const [activeBookTab, setActiveBookTab] = useState<AccountingBookTab>('income-statement');
  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);
  const incomeStatement = useMemo(() => getIncomeStatement(), [getIncomeStatement]);
  const balanceSheet = useMemo(() => getBalanceSheet(), [getBalanceSheet]);
  const trialBalance = useMemo(() => getTrialBalance(), [getTrialBalance]);

  const getBookRows = useCallback((): { headers: string[]; rows: Array<Array<string | number>>; title: string } => {
    if (activeBookTab === 'income-statement') {
      return {
        title: 'Income Statement',
        headers: ['Item', 'Amount'],
        rows: [
          ['Contract Revenue', incomeStatement.contractRevenue],
          ['Other Income', incomeStatement.otherIncome],
          ['Total Revenue', incomeStatement.totalRevenue],
          ['Cost of Construction', incomeStatement.totalCostOfConstruction],
          ['Overheads', incomeStatement.overheadExpense],
          ['Net Profit', incomeStatement.netProfit],
        ],
      };
    }
    if (activeBookTab === 'balance-sheet') {
      return {
        title: `Balance Sheet (${balanceSheet.asOfDate})`,
        headers: ['Section', 'Item', 'Amount'],
        rows: [
          ['Assets', 'Cash & Bank', balanceSheet.assets.cashAndBank],
          ['Assets', 'Accounts Receivable', balanceSheet.assets.accountsReceivable],
          ['Assets', 'Inventory / Materials', balanceSheet.assets.inventoryMaterials],
          ['Assets', 'Fixed Assets', balanceSheet.assets.fixedAssets],
          ['Assets', 'Total Assets', balanceSheet.assets.totalAssets],
          ['Liabilities', 'Accounts Payable', balanceSheet.liabilities.accountsPayable],
          ['Liabilities', 'Loans Payable', balanceSheet.liabilities.loansPayable],
          ['Liabilities', 'Total Liabilities', balanceSheet.liabilities.totalLiabilities],
          ['Equity', "Owner's Equity", balanceSheet.equity.ownersEquity],
          ['Equity', 'Retained Earnings', balanceSheet.equity.retainedEarnings],
          ['Equity', 'Total Equity', balanceSheet.equity.totalEquity],
          ['Totals', 'Total Liabilities + Equity', balanceSheet.totalLiabilitiesAndEquity],
        ],
      };
    }
    return {
      title: 'Trial Balance',
      headers: ['Account Code', 'Account Name', 'Debit', 'Credit', 'Balance'],
      rows: trialBalance.map(acc => [acc.accountCode, acc.accountName, acc.debitTotal, acc.creditTotal, acc.balance]),
    };
  }, [activeBookTab, incomeStatement, balanceSheet, trialBalance]);

  const exportBookCSV = useCallback(() => {
    const { headers, rows, title } = getBookRows();
    if (rows.length === 0) { toast.error('No data to export'); return; }
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Accounting book exported as CSV');
  }, [getBookRows]);

  const exportBookPDF = useCallback(() => {
    const { headers, rows, title } = getBookRows();
    if (rows.length === 0) { toast.error('No data to export'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow popups'); return; }
    const tableHead = headers.map(h => `<th>${h}</th>`).join('');
    const tableRows = rows.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px;margin-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>${title}</h1><table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
    toast.success('Accounting book PDF opened');
  }, [getBookRows]);

  if (!hasPermission('finance')) {
    return (
      <div className="content-area pb-24 md:pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground font-display mb-4">Finance</h1>
        <p className="text-sm text-muted-foreground">You do not have permission to view financial records.</p>
      </div>
    );
  }

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

      <SectionHeader title="Accounting Books" subtitle="Auto-posted from income and expense activity" action={
        <div className="flex items-center gap-2">
          <button onClick={exportBookCSV} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={exportBookPDF} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      } />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {(['income-statement', 'balance-sheet', 'trial-balance'] as AccountingBookTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveBookTab(tab)}
            className={`filter-chip whitespace-nowrap capitalize ${activeBookTab === tab ? 'filter-chip-active' : 'filter-chip-inactive'}`}>
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeBookTab === 'income-statement' && (
        <div className="glass-card p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Contract Revenue</span><span className="text-foreground font-medium">{formatCurrencyFull(incomeStatement.contractRevenue)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Other Income</span><span className="text-foreground font-medium">{formatCurrencyFull(incomeStatement.otherIncome)}</span></div>
          <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span className="text-foreground">Total Revenue</span><span className="text-success">{formatCurrencyFull(incomeStatement.totalRevenue)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cost of Construction</span><span className="text-destructive">{formatCurrencyFull(incomeStatement.totalCostOfConstruction)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overheads</span><span className="text-destructive">{formatCurrencyFull(incomeStatement.overheadExpense)}</span></div>
          <div className="flex justify-between text-base font-bold border-t-2 border-primary/30 pt-2"><span className="text-foreground">Net Profit</span><span className={incomeStatement.netProfit >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrencyFull(incomeStatement.netProfit)}</span></div>
        </div>
      )}

      {activeBookTab === 'balance-sheet' && (
        <div className="glass-card p-4 mb-6 space-y-3">
          <p className="text-xs text-muted-foreground">As of {balanceSheet.asOfDate}</p>
          <div className="border-t border-border pt-2">
            <p className="text-sm font-semibold text-foreground mb-2">Assets</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Cash & Bank</span><span>{formatCurrencyFull(balanceSheet.assets.cashAndBank)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accounts Receivable</span><span>{formatCurrencyFull(balanceSheet.assets.accountsReceivable)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Inventory / Materials</span><span>{formatCurrencyFull(balanceSheet.assets.inventoryMaterials)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fixed Assets</span><span>{formatCurrencyFull(balanceSheet.assets.fixedAssets)}</span></div>
              <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Total Assets</span><span>{formatCurrencyFull(balanceSheet.assets.totalAssets)}</span></div>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <p className="text-sm font-semibold text-foreground mb-2">Liabilities & Equity</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Accounts Payable</span><span>{formatCurrencyFull(balanceSheet.liabilities.accountsPayable)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loans Payable</span><span>{formatCurrencyFull(balanceSheet.liabilities.loansPayable)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Owner's Equity</span><span>{formatCurrencyFull(balanceSheet.equity.ownersEquity)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Retained Earnings</span><span>{formatCurrencyFull(balanceSheet.equity.retainedEarnings)}</span></div>
              <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Total Liabilities + Equity</span><span>{formatCurrencyFull(balanceSheet.totalLiabilitiesAndEquity)}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeBookTab === 'trial-balance' && (
        <div className="glass-card p-4 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Account</th>
                  <th className="text-right py-2">Debit</th>
                  <th className="text-right py-2">Credit</th>
                  <th className="text-right py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.map(acc => (
                  <tr key={acc.accountCode} className="border-b border-border/50">
                    <td className="py-2">{acc.accountCode} - {acc.accountName}</td>
                    <td className="py-2 text-right">{formatCurrencyFull(acc.debitTotal)}</td>
                    <td className="py-2 text-right">{formatCurrencyFull(acc.creditTotal)}</td>
                    <td className="py-2 text-right">{formatCurrencyFull(acc.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  {tx.receiptDataUrl && (
                    <a href={tx.receiptDataUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      View receipt{tx.receiptFileName ? ` (${tx.receiptFileName})` : ''}
                    </a>
                  )}
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
