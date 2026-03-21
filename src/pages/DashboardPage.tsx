import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Receipt, FolderOpen, Users, Package, Truck } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { formatCurrency, formatCurrencyFull, formatDate } from '@/utils/format';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { projects, transactions, employees, materials, equipment, getFinancialSummary, getProjectBudgetUsed } = useAppData();
  const summary = useMemo(() => getFinancialSummary(), [getFinancialSummary]);
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'Active'), [projects]);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const lowStockItems = useMemo(() => materials.filter(m => m.quantity <= m.minStock), [materials]);

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold font-display">{initials}</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-bold text-foreground font-display">{currentUser?.name || 'User'}</h1>
          <span className="text-xs text-primary">{currentUser?.role}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={TrendingUp} />
        <MetricCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} />
        <MetricCard title="Net Profit" value={formatCurrency(summary.netProfit)} icon={DollarSign} trend={{ value: `${summary.totalRevenue > 0 ? ((summary.netProfit / summary.totalRevenue) * 100).toFixed(1) : 0}%`, positive: summary.netProfit >= 0 }} />
        <MetricCard title="Contract Value" value={formatCurrency(summary.totalContractValue)} icon={Receipt} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="metric-card flex items-center gap-3 cursor-pointer" onClick={() => navigate('/projects')}>
          <FolderOpen className="w-5 h-5 text-info" />
          <div>
            <p className="text-lg font-bold text-foreground">{activeProjects.length}</p>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </div>
        </div>
        <div className="metric-card flex items-center gap-3 cursor-pointer" onClick={() => navigate('/more')}>
          <Users className="w-5 h-5 text-success" />
          <div>
            <p className="text-lg font-bold text-foreground">{employees.filter(e => e.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Employees</p>
          </div>
        </div>
        <div className="metric-card flex items-center gap-3">
          <Package className="w-5 h-5 text-warning" />
          <div>
            <p className="text-lg font-bold text-foreground">{materials.length}</p>
            <p className="text-xs text-muted-foreground">Materials</p>
          </div>
        </div>
        <div className="metric-card flex items-center gap-3">
          <Truck className="w-5 h-5 text-chart-purple" />
          <div>
            <p className="text-lg font-bold text-foreground">{equipment.length}</p>
            <p className="text-xs text-muted-foreground">Equipment</p>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <SectionHeader title="Active Projects" subtitle={`${activeProjects.length} in progress`} />
      <div className="space-y-3 mb-6">
        {activeProjects.map(project => {
          const budgetUsed = getProjectBudgetUsed(project.id);
          return (
            <div key={project.id} className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.siteLocation}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Progress: {project.completionPercent}%</span>
                <span>Budget: {formatCurrency(budgetUsed)} / {formatCurrency(project.contractValue)}</span>
              </div>
              <ProgressBar progress={project.completionPercent} />
            </div>
          );
        })}
        {activeProjects.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No active projects</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <SectionHeader title="Recent Transactions" />
      <div className="space-y-2 mb-6">
        {recentTransactions.map(tx => (
          <div key={tx.id} className="glass-card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.date)} • {tx.projectName}</p>
            </div>
            <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <>
          <SectionHeader title="Low Stock Alerts" subtitle={`${lowStockItems.length} items below minimum`} />
          <div className="space-y-2">
            {lowStockItems.map(m => (
              <div key={m.id} className="glass-card p-3 flex items-center justify-between border-warning/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-warning">{m.quantity} {m.unit}</p>
                  <p className="text-xs text-muted-foreground">Min: {m.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
