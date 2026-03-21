import { Transaction, Loan, Investor } from '@/types';

export const mockTransactions: Transaction[] = [
  { id: 't1', date: '2026-03-01', description: 'Cement delivery - 500 bags', amount: 125000, type: 'expense', category: 'Materials', projectId: 'p1', projectName: 'Riverside Plaza Complex', approvedBy: 'James Mokoena' },
  { id: 't2', date: '2026-03-01', description: 'Stage payment received - Structure', amount: 1350000, type: 'income', category: 'Billing', projectId: 'p1', projectName: 'Riverside Plaza Complex', approvedBy: 'Director' },
  { id: 't3', date: '2026-02-28', description: 'Weekly labour wages', amount: 85000, type: 'expense', category: 'Labour', projectId: 'p1', projectName: 'Riverside Plaza Complex', approvedBy: 'James Mokoena' },
  { id: 't4', date: '2026-02-28', description: 'Steel reinforcement bars', amount: 210000, type: 'expense', category: 'Materials', projectId: 'p3', projectName: 'Sunset Mall Extension', approvedBy: 'James Mokoena' },
  { id: 't5', date: '2026-02-27', description: 'Excavator rental', amount: 45000, type: 'expense', category: 'Equipment', projectId: 'p2', projectName: 'Green Acres Housing', approvedBy: 'Sarah Ndlovu' },
  { id: 't6', date: '2026-02-27', description: 'Foundation payment received', amount: 560000, type: 'income', category: 'Billing', projectId: 'p2', projectName: 'Green Acres Housing', approvedBy: 'Director' },
  { id: 't7', date: '2026-02-26', description: 'Plumbing subcontractor invoice', amount: 78000, type: 'expense', category: 'Subcontractors', projectId: 'p3', projectName: 'Sunset Mall Extension', approvedBy: 'James Mokoena' },
  { id: 't8', date: '2026-02-25', description: 'Site transport - materials', amount: 15000, type: 'expense', category: 'Transport', projectId: 'p1', projectName: 'Riverside Plaza Complex', approvedBy: 'James Mokoena' },
  { id: 't9', date: '2026-02-25', description: 'Electrical wiring supply', amount: 62000, type: 'expense', category: 'Materials', projectId: 'p2', projectName: 'Green Acres Housing', approvedBy: 'Sarah Ndlovu' },
  { id: 't10', date: '2026-02-24', description: 'Office overhead - utilities', amount: 8500, type: 'expense', category: 'Overheads', projectId: 'p1', projectName: 'Riverside Plaza Complex', approvedBy: 'Director' },
  { id: 't11', date: '2026-02-24', description: 'Heritage final payment received', amount: 190000, type: 'income', category: 'Billing', projectId: 'p5', projectName: 'Heritage Office Renovation', approvedBy: 'Director' },
  { id: 't12', date: '2026-02-23', description: 'Timber supply for formwork', amount: 34000, type: 'expense', category: 'Materials', projectId: 'p3', projectName: 'Sunset Mall Extension', approvedBy: 'James Mokoena' },
];

export const mockLoans: Loan[] = [
  { id: 'l1', lender: 'First National Bank', amount: 2000000, interestRate: 11.5, outstanding: 1650000, purpose: 'Equipment Purchase', linkedProject: 'General', startDate: '2024-06-01', endDate: '2027-06-01', monthlyRepayment: 65000 },
  { id: 'l2', lender: 'Standard Bank', amount: 1500000, interestRate: 10.75, outstanding: 1200000, purpose: 'Project Financing', linkedProject: 'Sunset Mall Extension', startDate: '2025-01-15', endDate: '2027-01-15', monthlyRepayment: 72000 },
];

export const mockInvestors: Investor[] = [
  { id: 'inv1', name: 'David Lenmot', capitalInvested: 5000000, equityPercent: 60, returnsPaid: 850000, joinDate: '2020-01-01' },
  { id: 'inv2', name: 'Thandi Khumalo', capitalInvested: 2500000, equityPercent: 30, returnsPaid: 425000, joinDate: '2021-06-01' },
  { id: 'inv3', name: 'Chris van Wyk', capitalInvested: 833333, equityPercent: 10, returnsPaid: 142000, joinDate: '2023-01-01' },
];

export const monthlyRevenue = [
  { month: 'Sep', revenue: 620000, expenses: 480000 },
  { month: 'Oct', revenue: 890000, expenses: 710000 },
  { month: 'Nov', revenue: 750000, expenses: 620000 },
  { month: 'Dec', revenue: 480000, expenses: 390000 },
  { month: 'Jan', revenue: 1100000, expenses: 850000 },
  { month: 'Feb', revenue: 1350000, expenses: 980000 },
];
