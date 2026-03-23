import React, { useMemo, useCallback } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppData } from '@/contexts/AppDataContext';
import { formatCurrency, formatCurrencyFull } from '@/utils/format';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { projects, transactions, getFinancialSummary, getProjectBudgetUsed, getIncomeStatement } = useAppData();
  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);
  const incomeStatement = useMemo(() => getIncomeStatement(), [getIncomeStatement]);
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'Active'), [projects]);

  const getReportRows = useCallback((): { headers: string[]; rows: Array<Array<string | number>> } => {
    const rows: Array<Array<string | number>> = [
      ['Income Statement', 'Contract Revenue', incomeStatement.contractRevenue],
      ['Income Statement', 'Other Income', incomeStatement.otherIncome],
      ['Income Statement', 'Total Revenue', incomeStatement.totalRevenue],
      ['Income Statement', 'Cost of Construction', incomeStatement.totalCostOfConstruction],
      ['Income Statement', 'Overheads', incomeStatement.overheadExpense],
      ['Income Statement', 'Net Profit', incomeStatement.netProfit],
      ['Financial Summary', 'Total Revenue', summary.totalRevenue],
      ['Financial Summary', 'Total Expenses', summary.totalExpenses],
      ['Financial Summary', 'Receivables', summary.totalReceivables],
      ['Financial Summary', 'Payables', summary.totalPayables],
    ];

    activeProjects.forEach(p => {
      const budgetUsed = getProjectBudgetUsed(p.id);
      const profit = p.contractValue - budgetUsed;
      const margin = p.contractValue > 0 ? (profit / p.contractValue) * 100 : 0;
      rows.push(['Project Profitability', `${p.name} - Contract`, p.contractValue]);
      rows.push(['Project Profitability', `${p.name} - Cost`, budgetUsed]);
      rows.push(['Project Profitability', `${p.name} - Margin %`, margin.toFixed(1)]);
    });

    return { headers: ['Section', 'Metric', 'Value'], rows };
  }, [activeProjects, getProjectBudgetUsed, incomeStatement, summary]);

  const exportReportsCSV = useCallback(() => {
    const { headers, rows } = getReportRows();
    if (rows.length === 0) { toast.error('No report data to export'); return; }
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reports exported as CSV');
  }, [getReportRows]);

  const exportReportsPDF = useCallback(() => {
    const { headers, rows } = getReportRows();
    if (rows.length === 0) { toast.error('No report data to export'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow popups'); return; }
    const tableHead = headers.map(h => `<th>${h}</th>`).join('');
    const tableRows = rows.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Reports Export</title>
      <style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px;margin-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>Reports Export</h1><table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
    toast.success('Reports PDF opened');
  }, [getReportRows]);

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-display">Reports</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportReportsCSV} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={exportReportsPDF} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Income Statement */}
      <SectionHeader title="Income Statement" subtitle="Current period" />
      <div className="glass-card p-4 mb-6 space-y-3">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Contract Revenue</span><span className="text-foreground font-medium">{formatCurrencyFull(incomeStatement.contractRevenue)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Other Income</span><span className="text-foreground font-medium">{formatCurrencyFull(incomeStatement.otherIncome)}</span></div>
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span className="text-foreground">Total Revenue</span><span className="text-success">{formatCurrencyFull(incomeStatement.totalRevenue)}</span></div>
        <div className="border-t border-border pt-2 space-y-2">
          {[
            ['Materials', incomeStatement.materialsExpense],
            ['Labour', incomeStatement.labourExpense],
            ['Equipment', incomeStatement.equipmentExpense],
            ['Subcontractors', incomeStatement.subcontractorExpense],
            ['Transport', incomeStatement.transportExpense],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="text-destructive">{formatCurrencyFull(val as number)}</span></div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span className="text-foreground">Cost of Construction</span><span className="text-destructive">{formatCurrencyFull(incomeStatement.totalCostOfConstruction)}</span></div>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2"><span className="text-foreground">Gross Profit</span><span className={incomeStatement.grossProfit >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrencyFull(incomeStatement.grossProfit)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overheads</span><span className="text-destructive">{formatCurrencyFull(incomeStatement.overheadExpense)}</span></div>
        <div className="flex justify-between text-base font-bold border-t-2 border-primary/30 pt-2"><span className="text-foreground">Net Profit</span><span className={incomeStatement.netProfit >= 0 ? 'text-success' : 'text-destructive'}>{formatCurrencyFull(incomeStatement.netProfit)}</span></div>
      </div>

      {/* Project Profitability */}
      <SectionHeader title="Project Profitability" subtitle="Active projects" />
      <div className="space-y-3 mb-6">
        {activeProjects.map(p => {
          const budgetUsed = getProjectBudgetUsed(p.id);
          const profit = p.contractValue - budgetUsed;
          const margin = p.contractValue > 0 ? (profit / p.contractValue) * 100 : 0;
          return (
            <div key={p.id} className="glass-card p-4">
              <h3 className="font-semibold text-foreground mb-2">{p.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div><span className="text-muted-foreground">Contract</span><br/><span className="text-foreground font-medium">{formatCurrency(p.contractValue)}</span></div>
                <div><span className="text-muted-foreground">Cost</span><br/><span className="text-destructive font-medium">{formatCurrency(budgetUsed)}</span></div>
                <div><span className="text-muted-foreground">Margin</span><br/><span className={`font-medium ${margin >= 0 ? 'text-success' : 'text-destructive'}`}>{margin.toFixed(1)}%</span></div>
              </div>
              <ProgressBar progress={p.completionPercent} />
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <SectionHeader title="Financial Summary" />
      <div className="glass-card p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Total Revenue</span><br/><span className="text-success font-bold">{formatCurrency(summary.totalRevenue)}</span></div>
          <div><span className="text-muted-foreground">Total Expenses</span><br/><span className="text-destructive font-bold">{formatCurrency(summary.totalExpenses)}</span></div>
          <div><span className="text-muted-foreground">Receivables</span><br/><span className="text-info font-bold">{formatCurrency(summary.totalReceivables)}</span></div>
          <div><span className="text-muted-foreground">Payables</span><br/><span className="text-warning font-bold">{formatCurrency(summary.totalPayables)}</span></div>
        </div>
      </div>
    </div>
  );
}
