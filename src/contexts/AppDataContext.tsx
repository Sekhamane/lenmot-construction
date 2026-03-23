import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Project, Transaction, Employee, Material, Equipment,
  Loan, Investor, BillingStageItem, FinancialSummary, ProjectCosts,
  JournalEntry, JournalLine, AccountBalance, AccountType,
  AttendanceRecord, IncomeStatementData, MonthlyAttendanceSummary, BalanceSheetData,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  projectToRow, rowToProject, billingStageToRow,
  transactionToRow, rowToTransaction, employeeToRow, rowToEmployee,
  materialToRow, rowToMaterial, equipmentToRow, rowToEquipment,
  loanToRow, rowToLoan, investorToRow, rowToInvestor,
  journalEntryToRow, journalLineToRow, rowToJournalEntry,
  attendanceToRow, rowToAttendance,
} from '@/lib/supabase-mappers';

const CHART_OF_ACCOUNTS: { code: string; name: string; type: AccountType }[] = [
  { code: '1000', name: 'Cash & Bank', type: 'Asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset' },
  { code: '1200', name: 'Inventory / Materials', type: 'Asset' },
  { code: '1500', name: 'Fixed Assets', type: 'Asset' },
  { code: '2000', name: 'Accounts Payable', type: 'Liability' },
  { code: '2100', name: 'Loans Payable', type: 'Liability' },
  { code: '3000', name: "Owner's Equity", type: 'Equity' },
  { code: '3100', name: 'Retained Earnings', type: 'Equity' },
  { code: '4000', name: 'Contract Revenue', type: 'Revenue' },
  { code: '4100', name: 'Other Income', type: 'Revenue' },
  { code: '5000', name: 'Materials Expense', type: 'Expense' },
  { code: '5100', name: 'Labour Expense', type: 'Expense' },
  { code: '5200', name: 'Equipment Expense', type: 'Expense' },
  { code: '5300', name: 'Subcontractor Expense', type: 'Expense' },
  { code: '5400', name: 'Transport Expense', type: 'Expense' },
  { code: '5500', name: 'Overhead Expense', type: 'Expense' },
];

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getExpenseAccount(category: string): { code: string; name: string } {
  const cat = category.toLowerCase();
  if (cat === 'materials') return { code: '5000', name: 'Materials Expense' };
  if (cat === 'labour') return { code: '5100', name: 'Labour Expense' };
  if (cat === 'equipment') return { code: '5200', name: 'Equipment Expense' };
  if (cat === 'subcontractors') return { code: '5300', name: 'Subcontractor Expense' };
  if (cat === 'transport') return { code: '5400', name: 'Transport Expense' };
  return { code: '5500', name: 'Overhead Expense' };
}

function sbInsert(table: string, row: any) {
  if (!isSupabaseConfigured) return;
  void supabase.from(table).insert(row).then(({ error }) => {
    if (error) console.error(`[Supabase] Insert ${table} error:`, error.message);
  });
}

function sbUpdate(table: string, id: string, row: any) {
  if (!isSupabaseConfigured) return;
  void supabase.from(table).update(row).eq('id', id).then(({ error }) => {
    if (error) console.error(`[Supabase] Update ${table} error:`, error.message);
  });
}

function sbDelete(table: string, id: string) {
  if (!isSupabaseConfigured) return;
  void supabase.from(table).delete().eq('id', id).then(({ error }) => {
    if (error) console.error(`[Supabase] Delete ${table} error:`, error.message);
  });
}

interface AppDataState {
  isLoaded: boolean;
  projects: Project[];
  transactions: Transaction[];
  employees: Employee[];
  materials: Material[];
  equipment: Equipment[];
  loans: Loan[];
  investors: Investor[];
  journalEntries: JournalEntry[];
  attendance: AttendanceRecord[];
  addProject: (p: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addBillingStage: (projectId: string, stage: Omit<BillingStageItem, 'id'>) => void;
  updateBillingStage: (projectId: string, stageId: string, updates: Partial<BillingStageItem>) => void;
  deleteBillingStage: (projectId: string, stageId: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;
  addMaterial: (mat: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addEquipment: (eq: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addInvestor: (inv: Omit<Investor, 'id'>) => void;
  updateInvestor: (id: string, updates: Partial<Investor>) => void;
  deleteInvestor: (id: string) => void;
  postJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;
  checkInEmployee: (employeeId: string, employeeName: string, projectId: string, projectName: string, recordedBy: string) => AttendanceRecord;
  checkOutEmployee: (attendanceId: string) => void;
  markAbsent: (employeeId: string, employeeName: string, projectId: string, projectName: string, recordedBy: string) => void;
  updateAttendanceNotes: (attendanceId: string, notes: string) => void;
  deleteAttendance: (id: string) => void;
  getTodayAttendance: (dateStr?: string) => AttendanceRecord[];
  getEmployeeTodayRecord: (employeeId: string, dateStr?: string) => AttendanceRecord | undefined;
  getMonthlyAttendanceSummary: (month?: string) => MonthlyAttendanceSummary[];
  getProjectBudgetUsed: (projectId: string) => number;
  getProjectCosts: (projectId: string) => ProjectCosts;
  getFinancialSummary: () => FinancialSummary;
  getIncomeStatement: () => IncomeStatementData;
  getBalanceSheet: () => BalanceSheetData;
  getTrialBalance: () => AccountBalance[];
  getLedgerByAccount: (accountCode: string) => JournalEntry[];
}

const AppDataContext = createContext<AppDataState | null>(null);

const APP_DATA_STORAGE_KEY = 'lenmot.appData.v1';

type CachedAppData = {
  projects: Project[];
  transactions: Transaction[];
  employees: Employee[];
  materials: Material[];
  equipment: Equipment[];
  loans: Loan[];
  investors: Investor[];
  journalEntries: JournalEntry[];
  attendance: AttendanceRecord[];
};

function readCachedData(): CachedAppData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(APP_DATA_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedAppData;
  } catch (err) {
    console.error('[AppData] Failed to read cache:', err);
    return null;
  }
}

function mergeReceiptFields<T extends { id: string }>(
  baseItems: T[],
  cachedItems: T[] | undefined,
): T[] {
  if (!cachedItems || cachedItems.length === 0) return baseItems;
  const cachedById = new Map(cachedItems.map(item => [item.id, item]));
  return baseItems.map(item => {
    const cached = cachedById.get(item.id) as Record<string, unknown> | undefined;
    if (!cached) return item;
    const itemWithReceipt = item as T & {
      receiptDataUrl?: string;
      receiptFileName?: string;
      receiptMimeType?: string;
    };
    return {
      ...item,
      receiptDataUrl: (cached.receiptDataUrl as string | undefined) || itemWithReceipt.receiptDataUrl,
      receiptFileName: (cached.receiptFileName as string | undefined) || itemWithReceipt.receiptFileName,
      receiptMimeType: (cached.receiptMimeType as string | undefined) || itemWithReceipt.receiptMimeType,
    } as T;
  });
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const cached = readCachedData();
        if (cached) {
          setProjects(cached.projects || []);
          setTransactions(cached.transactions || []);
          setEmployees(cached.employees || []);
          setMaterials(cached.materials || []);
          setEquipment(cached.equipment || []);
          setLoans(cached.loans || []);
          setInvestors(cached.investors || []);
          setJournalEntries(cached.journalEntries || []);
          setAttendance(cached.attendance || []);
        }

        if (isSupabaseConfigured) {
          const [pRes, tRes, eRes, mRes, eqRes, lRes, invRes, jeRes, attRes] = await Promise.all([
            supabase.from('projects').select('*, billing_stages(*)'),
            supabase.from('transactions').select('*').order('created_at', { ascending: false }),
            supabase.from('employees').select('*'),
            supabase.from('materials').select('*'),
            supabase.from('equipment').select('*'),
            supabase.from('loans').select('*'),
            supabase.from('investors').select('*'),
            supabase.from('journal_entries').select('*, journal_lines(*)').order('created_at', { ascending: false }),
            supabase.from('attendance_records').select('*').order('date', { ascending: false }),
          ]);

          if (pRes.error) console.error('[AppData] Load projects error:', pRes.error.message);
          if (tRes.error) console.error('[AppData] Load transactions error:', tRes.error.message);
          if (eRes.error) console.error('[AppData] Load employees error:', eRes.error.message);
          if (mRes.error) console.error('[AppData] Load materials error:', mRes.error.message);
          if (eqRes.error) console.error('[AppData] Load equipment error:', eqRes.error.message);
          if (lRes.error) console.error('[AppData] Load loans error:', lRes.error.message);
          if (invRes.error) console.error('[AppData] Load investors error:', invRes.error.message);
          if (jeRes.error) console.error('[AppData] Load journal entries error:', jeRes.error.message);
          if (attRes.error) console.error('[AppData] Load attendance error:', attRes.error.message);

          if (!pRes.error && pRes.data) setProjects(pRes.data.map(rowToProject));
          if (!tRes.error && tRes.data) setTransactions(mergeReceiptFields(tRes.data.map(rowToTransaction), cached?.transactions));
          if (!eRes.error && eRes.data) setEmployees(eRes.data.map(rowToEmployee));
          if (!mRes.error && mRes.data) setMaterials(mergeReceiptFields(mRes.data.map(rowToMaterial), cached?.materials));
          if (!eqRes.error && eqRes.data) setEquipment(mergeReceiptFields(eqRes.data.map(rowToEquipment), cached?.equipment));
          if (!lRes.error && lRes.data) setLoans(lRes.data.map(rowToLoan));
          if (!invRes.error && invRes.data) setInvestors(invRes.data.map(rowToInvestor));
          if (!jeRes.error && jeRes.data) setJournalEntries(jeRes.data.map(rowToJournalEntry));
          if (!attRes.error && attRes.data) setAttendance(attRes.data.map(rowToAttendance));
        }
      } catch (err) {
        console.error('[AppData] Load error:', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      const snapshot: CachedAppData = {
        projects,
        transactions,
        employees,
        materials,
        equipment,
        loans,
        investors,
        journalEntries,
        attendance,
      };
      window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.error('[AppData] Failed to save cache:', err);
    }
  }, [isLoaded, projects, transactions, employees, materials, equipment, loans, investors, journalEntries, attendance]);

  const postJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: genId('je') };
    setJournalEntries(prev => [newEntry, ...prev]);
    if (isSupabaseConfigured) {
      void (async () => {
        try {
          const row = journalEntryToRow({ ...newEntry });
          const { data, error } = await supabase.from('journal_entries').insert(row).select().single();
          if (error) return;
          const entryId = data.id;
          const lineRows = newEntry.lines.map(l => journalLineToRow(l, entryId));
          if (lineRows.length > 0) await supabase.from('journal_lines').insert(lineRows);
        } catch (err) {
          console.error('[Supabase] JE post error:', err);
        }
      })();
    }
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    sbDelete('journal_entries', id);
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>): Project => {
    const newProject: Project = { ...project, id: genId('p') };
    setProjects(prev => [...prev, newProject]);
    const { billingStages: _bs, ...rest } = newProject;
    sbInsert('projects', projectToRow(rest));
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const { billingStages: _bs, ...rest } = updates as any;
    if (Object.keys(rest).length > 0) sbUpdate('projects', id, projectToRow(rest));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    sbDelete('projects', id);
  }, []);

  const addBillingStage = useCallback((projectId: string, stage: Omit<BillingStageItem, 'id'>) => {
    const newStage: BillingStageItem = { ...stage, id: genId('bs') };
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, billingStages: [...p.billingStages, newStage] } : p
    ));
    sbInsert('billing_stages', billingStageToRow(newStage, projectId));
    const today = new Date().toISOString().split('T')[0];
    if (newStage.invoiced) {
      postJournalEntry({
        date: today, description: `Invoice: ${newStage.stageName}`, reference: newStage.id,
        referenceType: 'billing', postedBy: 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1100', accountName: 'Accounts Receivable', debit: newStage.amount, credit: 0 },
          { accountCode: '4000', accountName: 'Contract Revenue', debit: 0, credit: newStage.amount },
        ],
      });
    }
    if (newStage.paid) {
      postJournalEntry({
        date: today, description: `Payment received: ${newStage.stageName}`, reference: newStage.id,
        referenceType: 'billing', postedBy: 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1000', accountName: 'Cash & Bank', debit: newStage.amount, credit: 0 },
          { accountCode: '1100', accountName: 'Accounts Receivable', debit: 0, credit: newStage.amount },
        ],
      });
    }
  }, [postJournalEntry]);

  const updateBillingStage = useCallback((projectId: string, stageId: string, updates: Partial<BillingStageItem>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, billingStages: p.billingStages.map(s => s.id === stageId ? { ...s, ...updates } : s) } : p
    ));
    if (isSupabaseConfigured) {
      const row: any = {};
      if (updates.stageName !== undefined) row.stage_name = updates.stageName;
      if (updates.amount !== undefined) row.amount = updates.amount;
      if (updates.invoiced !== undefined) row.invoiced = updates.invoiced;
      if (updates.paid !== undefined) row.paid = updates.paid;
      if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
      if (updates.retentionPercent !== undefined) row.retention_percent = updates.retentionPercent;
      sbUpdate('billing_stages', stageId, row);
    }
  }, []);

  const deleteBillingStage = useCallback((projectId: string, stageId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, billingStages: p.billingStages.filter(s => s.id !== stageId) } : p
    ));
    sbDelete('billing_stages', stageId);
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: genId('t') };
    setTransactions(prev => [newTx, ...prev]);
    sbInsert('transactions', transactionToRow(newTx));
    const entryDate = tx.date || new Date().toISOString().split('T')[0];
    if (tx.type === 'income') {
      const revenueAcc = tx.category.toLowerCase() === 'billing' ? { code: '4000', name: 'Contract Revenue' } : { code: '4100', name: 'Other Income' };
      postJournalEntry({
        date: entryDate, description: tx.description, reference: newTx.id,
        referenceType: 'transaction', postedBy: tx.approvedBy || 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1000', accountName: 'Cash & Bank', debit: tx.amount, credit: 0 },
          { accountCode: revenueAcc.code, accountName: revenueAcc.name, debit: 0, credit: tx.amount },
        ],
      });
    } else {
      const expAcc = getExpenseAccount(tx.category);
      postJournalEntry({
        date: entryDate, description: tx.description, reference: newTx.id,
        referenceType: 'transaction', postedBy: tx.approvedBy || 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: expAcc.code, accountName: expAcc.name, debit: tx.amount, credit: 0 },
          { accountCode: '1000', accountName: 'Cash & Bank', debit: 0, credit: tx.amount },
        ],
      });
    }
  }, [postJournalEntry]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (isSupabaseConfigured) sbUpdate('transactions', id, transactionToRow(updates as any));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    sbDelete('transactions', id);
  }, []);

  const addEmployee = useCallback(async (emp: Omit<Employee, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newEmp: Employee = { ...emp, id: genId('e') };
    setEmployees(prev => [...prev, newEmp]);
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('employees').insert(employeeToRow(newEmp));
    if (error) {
      setEmployees(prev => prev.filter(e => e.id !== newEmp.id));
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>): Promise<{ success: boolean; error?: string }> => {
    const original = employees.find(e => e.id === id);
    if (!original) return { success: false, error: 'Employee not found' };
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('employees').update(employeeToRow(updates)).eq('id', id);
    if (error) {
      setEmployees(prev => prev.map(e => e.id === id ? original : e));
      return { success: false, error: error.message };
    }
    return { success: true };
  }, [employees]);

  const deleteEmployee = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    const removed = employees.find(e => e.id === id);
    if (!removed) return { success: false, error: 'Employee not found' };
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      setEmployees(prev => [...prev, removed]);
      return { success: false, error: error.message };
    }
    return { success: true };
  }, [employees]);

  const addMaterial = useCallback((mat: Omit<Material, 'id'>) => {
    const newMat: Material = { ...mat, id: genId('m') };
    setMaterials(prev => [...prev, newMat]);
    sbInsert('materials', materialToRow(newMat));
    const totalValue = newMat.quantity * newMat.unitCost;
    if (totalValue > 0) {
      postJournalEntry({
        date: new Date().toISOString().split('T')[0],
        description: `Material purchase: ${newMat.name} (${newMat.quantity} ${newMat.unit})`,
        reference: newMat.id, referenceType: 'material', postedBy: 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1200', accountName: 'Inventory / Materials', debit: totalValue, credit: 0 },
          { accountCode: '1000', accountName: 'Cash & Bank', debit: 0, credit: totalValue },
        ],
      });
    }
  }, [postJournalEntry]);

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (isSupabaseConfigured) sbUpdate('materials', id, materialToRow(updates as any));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    sbDelete('materials', id);
  }, []);

  const addEquipment = useCallback((eq: Omit<Equipment, 'id'>) => {
    const newEq: Equipment = { ...eq, id: genId('eq') };
    setEquipment(prev => [...prev, newEq]);
    sbInsert('equipment', equipmentToRow(newEq));
    if (newEq.purchaseCost > 0) {
      postJournalEntry({
        date: new Date().toISOString().split('T')[0],
        description: `Asset acquisition: ${newEq.name} (${newEq.type})`,
        reference: newEq.id, referenceType: 'equipment', postedBy: 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1500', accountName: 'Fixed Assets', debit: newEq.purchaseCost, credit: 0 },
          { accountCode: '1000', accountName: 'Cash & Bank', debit: 0, credit: newEq.purchaseCost },
        ],
      });
    }
  }, [postJournalEntry]);

  const updateEquipment = useCallback((id: string, updates: Partial<Equipment>) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (isSupabaseConfigured) sbUpdate('equipment', id, equipmentToRow(updates as any));
  }, []);

  const deleteEquipment = useCallback((id: string) => {
    setEquipment(prev => prev.filter(e => e.id !== id));
    sbDelete('equipment', id);
  }, []);

  const addLoan = useCallback((loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loan, id: genId('l') };
    setLoans(prev => [...prev, newLoan]);
    sbInsert('loans', loanToRow(newLoan));
    postJournalEntry({
      date: newLoan.startDate || new Date().toISOString().split('T')[0],
      description: `Loan received: ${newLoan.lender} – ${newLoan.purpose}`,
      reference: newLoan.id, referenceType: 'loan', postedBy: 'System', createdAt: new Date().toISOString(),
      lines: [
        { accountCode: '1000', accountName: 'Cash & Bank', debit: newLoan.amount, credit: 0 },
        { accountCode: '2100', accountName: 'Loans Payable', debit: 0, credit: newLoan.amount },
      ],
    });
  }, [postJournalEntry]);

  const updateLoan = useCallback((id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (isSupabaseConfigured) sbUpdate('loans', id, loanToRow(updates as any));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    sbDelete('loans', id);
  }, []);

  const addInvestor = useCallback((inv: Omit<Investor, 'id'>) => {
    const newInv: Investor = { ...inv, id: genId('inv') };
    setInvestors(prev => [...prev, newInv]);
    sbInsert('investors', investorToRow(newInv));
    if (newInv.capitalInvested > 0) {
      postJournalEntry({
        date: newInv.joinDate || new Date().toISOString().split('T')[0],
        description: `Investor capital: ${newInv.name} (${newInv.equityPercent}% equity)`,
        reference: newInv.id, referenceType: 'investor', postedBy: 'System', createdAt: new Date().toISOString(),
        lines: [
          { accountCode: '1000', accountName: 'Cash & Bank', debit: newInv.capitalInvested, credit: 0 },
          { accountCode: '3000', accountName: "Owner's Equity", debit: 0, credit: newInv.capitalInvested },
        ],
      });
    }
  }, [postJournalEntry]);

  const updateInvestor = useCallback((id: string, updates: Partial<Investor>) => {
    setInvestors(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    if (isSupabaseConfigured) sbUpdate('investors', id, investorToRow(updates as any));
  }, []);

  const deleteInvestor = useCallback((id: string) => {
    setInvestors(prev => prev.filter(i => i.id !== id));
    sbDelete('investors', id);
  }, []);

  const checkInEmployee = useCallback((employeeId: string, employeeName: string, projectId: string, projectName: string, recordedBy: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      id: genId('att'), employeeId, employeeName, projectId, projectName,
      date: today, checkIn: now, checkOut: '', hoursWorked: 0,
      status: 'checked_in', notes: '', recordedBy, createdAt: now,
    };
    setAttendance(prev => [newRecord, ...prev]);
    sbInsert('attendance_records', attendanceToRow(newRecord));
    return newRecord;
  }, []);

  const checkOutEmployee = useCallback((attendanceId: string) => {
    const now = new Date().toISOString();
    setAttendance(prev => prev.map(a => {
      if (a.id === attendanceId && a.status === 'checked_in') {
        const hours = Math.max(0, (new Date(now).getTime() - new Date(a.checkIn).getTime()) / (1000 * 60 * 60));
        return { ...a, checkOut: now, hoursWorked: Math.round(hours * 100) / 100, status: 'checked_out' as const };
      }
      return a;
    }));
    if (isSupabaseConfigured) {
      const record = attendance.find(a => a.id === attendanceId);
      if (record) {
        const hours = Math.round(Math.max(0, (new Date(now).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60)) * 100) / 100;
        sbUpdate('attendance_records', attendanceId, { check_out: now, hours_worked: hours, status: 'checked_out' });
      }
    }
  }, [attendance]);

  const markAbsent = useCallback((employeeId: string, employeeName: string, projectId: string, projectName: string, recordedBy: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      id: genId('att'), employeeId, employeeName, projectId, projectName,
      date: today, checkIn: '', checkOut: '', hoursWorked: 0,
      status: 'absent', notes: '', recordedBy, createdAt: now,
    };
    setAttendance(prev => [newRecord, ...prev]);
    sbInsert('attendance_records', attendanceToRow(newRecord));
  }, []);

  const updateAttendanceNotes = useCallback((attendanceId: string, notes: string) => {
    setAttendance(prev => prev.map(a => a.id === attendanceId ? { ...a, notes } : a));
    sbUpdate('attendance_records', attendanceId, { notes });
  }, []);

  const deleteAttendance = useCallback((id: string) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
    sbDelete('attendance_records', id);
  }, []);

  const getTodayAttendance = useCallback((dateStr?: string): AttendanceRecord[] => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.date === today);
  }, [attendance]);

  const getEmployeeTodayRecord = useCallback((employeeId: string, dateStr?: string): AttendanceRecord | undefined => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    return attendance.find(a => a.employeeId === employeeId && a.date === today);
  }, [attendance]);

  const getMonthlyAttendanceSummary = useCallback((month?: string): MonthlyAttendanceSummary[] => {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const monthRecords = attendance.filter(a => a.date.startsWith(targetMonth));
    const summaryMap: Record<string, MonthlyAttendanceSummary> = {};
    monthRecords.forEach(record => {
      const key = record.employeeId;
      if (!summaryMap[key]) {
        summaryMap[key] = { employeeId: record.employeeId, employeeName: record.employeeName, projectName: record.projectName, month: targetMonth, daysPresent: 0, daysAbsent: 0, totalHours: 0, avgHoursPerDay: 0 };
      }
      if (record.status === 'absent') summaryMap[key].daysAbsent++;
      else { summaryMap[key].daysPresent++; summaryMap[key].totalHours += record.hoursWorked; }
    });
    Object.values(summaryMap).forEach(s => {
      s.totalHours = Math.round(s.totalHours * 100) / 100;
      s.avgHoursPerDay = s.daysPresent > 0 ? Math.round((s.totalHours / s.daysPresent) * 100) / 100 : 0;
    });
    return Object.values(summaryMap).sort((a, b) => b.totalHours - a.totalHours);
  }, [attendance]);

  const getProjectBudgetUsed = useCallback((projectId: string): number => {
    return transactions.filter(t => t.projectId === projectId && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getProjectCosts = useCallback((projectId: string): ProjectCosts => {
    const expenses = transactions.filter(t => t.projectId === projectId && t.type === 'expense');
    const costs: ProjectCosts = { materials: 0, labour: 0, equipment: 0, subcontractors: 0, transport: 0, overheads: 0 };
    expenses.forEach(t => {
      const cat = t.category.toLowerCase();
      if (cat === 'materials') costs.materials += t.amount;
      else if (cat === 'labour') costs.labour += t.amount;
      else if (cat === 'equipment') costs.equipment += t.amount;
      else if (cat === 'subcontractors') costs.subcontractors += t.amount;
      else if (cat === 'transport') costs.transport += t.amount;
      else costs.overheads += t.amount;
    });
    return costs;
  }, [transactions]);

  const getFinancialSummary = useCallback((): FinancialSummary => {
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalContractValue = projects.reduce((s, p) => s + p.contractValue, 0);
    const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
    const totalReceivables = projects.reduce((s, p) => s + p.billingStages.filter(b => b.invoiced && !b.paid).reduce((ss, b) => ss + b.amount, 0), 0);
    const totalPayables = loans.reduce((s, l) => s + l.outstanding, 0);
    return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, totalReceivables, totalPayables, cashBalance: totalRevenue - totalExpenses, totalContractValue, activeProjects: activeProjectsCount };
  }, [transactions, projects, loans]);

  const getIncomeStatement = useCallback((): IncomeStatementData => {
    const balances: Record<string, number> = {};
    CHART_OF_ACCOUNTS.forEach(acc => { balances[acc.code] = 0; });
    journalEntries.forEach(entry => {
      entry.lines.forEach((line: JournalLine) => {
        if (balances[line.accountCode] !== undefined) {
          const acct = CHART_OF_ACCOUNTS.find(a => a.code === line.accountCode);
          if (acct?.type === 'Revenue') balances[line.accountCode] += (line.credit - line.debit);
          else if (acct?.type === 'Expense') balances[line.accountCode] += (line.debit - line.credit);
        }
      });
    });
    const gb = (code: string) => balances[code] || 0;
    const contractRevenue = gb('4000');
    const otherIncome = gb('4100');
    const totalRevenue = contractRevenue + otherIncome;
    const materialsExpense = gb('5000');
    const labourExpense = gb('5100');
    const equipmentExpense = gb('5200');
    const subcontractorExpense = gb('5300');
    const transportExpense = gb('5400');
    const totalCostOfConstruction = materialsExpense + labourExpense + equipmentExpense + subcontractorExpense + transportExpense;
    const grossProfit = totalRevenue - totalCostOfConstruction;
    const overheadExpense = gb('5500');
    return { contractRevenue, otherIncome, totalRevenue, materialsExpense, labourExpense, equipmentExpense, subcontractorExpense, transportExpense, totalCostOfConstruction, grossProfit, overheadExpense, totalOperatingExpenses: overheadExpense, operatingProfit: grossProfit - overheadExpense, netProfit: grossProfit - overheadExpense };
  }, [journalEntries]);

  const getBalanceSheet = useCallback((): BalanceSheetData => {
    const balances: Record<string, AccountBalance> = {};
    CHART_OF_ACCOUNTS.forEach(acc => {
      balances[acc.code] = {
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debitTotal: 0,
        creditTotal: 0,
        balance: 0,
      };
    });
    journalEntries.forEach(entry => {
      entry.lines.forEach((line: JournalLine) => {
        if (balances[line.accountCode]) {
          balances[line.accountCode].debitTotal += line.debit;
          balances[line.accountCode].creditTotal += line.credit;
        }
      });
    });
    Object.values(balances).forEach(acc => {
      acc.balance = (acc.accountType === 'Asset' || acc.accountType === 'Expense')
        ? acc.debitTotal - acc.creditTotal
        : acc.creditTotal - acc.debitTotal;
    });
    const accBalance = (code: string) => balances[code]?.balance || 0;
    const incomeStatement = getIncomeStatement();

    const assets = {
      cashAndBank: accBalance('1000'),
      accountsReceivable: accBalance('1100'),
      inventoryMaterials: accBalance('1200'),
      fixedAssets: accBalance('1500'),
      totalAssets: 0,
    };
    assets.totalAssets = assets.cashAndBank + assets.accountsReceivable + assets.inventoryMaterials + assets.fixedAssets;

    const liabilities = {
      accountsPayable: accBalance('2000'),
      loansPayable: accBalance('2100'),
      totalLiabilities: 0,
    };
    liabilities.totalLiabilities = liabilities.accountsPayable + liabilities.loansPayable;

    const equity = {
      ownersEquity: accBalance('3000'),
      retainedEarnings: accBalance('3100') + incomeStatement.netProfit,
      totalEquity: 0,
    };
    equity.totalEquity = equity.ownersEquity + equity.retainedEarnings;

    return {
      asOfDate: new Date().toISOString().split('T')[0],
      assets,
      liabilities,
      equity,
      totalLiabilitiesAndEquity: liabilities.totalLiabilities + equity.totalEquity,
    };
  }, [getIncomeStatement, journalEntries]);

  const getTrialBalance = useCallback((): AccountBalance[] => {
    const balances: Record<string, AccountBalance> = {};
    CHART_OF_ACCOUNTS.forEach(acc => {
      balances[acc.code] = { accountCode: acc.code, accountName: acc.name, accountType: acc.type, debitTotal: 0, creditTotal: 0, balance: 0 };
    });
    journalEntries.forEach(entry => {
      entry.lines.forEach((line: JournalLine) => {
        if (balances[line.accountCode]) {
          balances[line.accountCode].debitTotal += line.debit;
          balances[line.accountCode].creditTotal += line.credit;
        }
      });
    });
    Object.values(balances).forEach(acc => {
      acc.balance = (acc.accountType === 'Asset' || acc.accountType === 'Expense')
        ? acc.debitTotal - acc.creditTotal
        : acc.creditTotal - acc.debitTotal;
    });
    return Object.values(balances).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }, [journalEntries]);

  const getLedgerByAccount = useCallback((accountCode: string): JournalEntry[] => {
    return journalEntries.filter(e => e.lines.some((l: JournalLine) => l.accountCode === accountCode));
  }, [journalEntries]);

  const value = useMemo(() => ({
    isLoaded, projects, transactions, employees, materials, equipment, loans, investors, journalEntries, attendance,
    addProject, updateProject, deleteProject,
    addBillingStage, updateBillingStage, deleteBillingStage,
    addTransaction, updateTransaction, deleteTransaction,
    addEmployee, updateEmployee, deleteEmployee,
    addMaterial, updateMaterial, deleteMaterial,
    addEquipment, updateEquipment, deleteEquipment,
    addLoan, updateLoan, deleteLoan,
    addInvestor, updateInvestor, deleteInvestor,
    postJournalEntry, deleteJournalEntry,
    checkInEmployee, checkOutEmployee, markAbsent, updateAttendanceNotes, deleteAttendance,
    getTodayAttendance, getEmployeeTodayRecord, getMonthlyAttendanceSummary,
    getProjectBudgetUsed, getProjectCosts, getFinancialSummary, getIncomeStatement, getBalanceSheet, getTrialBalance, getLedgerByAccount,
  }), [
    isLoaded, projects, transactions, employees, materials, equipment, loans, investors, journalEntries, attendance,
    addProject, updateProject, deleteProject,
    addBillingStage, updateBillingStage, deleteBillingStage,
    addTransaction, updateTransaction, deleteTransaction,
    addEmployee, updateEmployee, deleteEmployee,
    addMaterial, updateMaterial, deleteMaterial,
    addEquipment, updateEquipment, deleteEquipment,
    addLoan, updateLoan, deleteLoan,
    addInvestor, updateInvestor, deleteInvestor,
    postJournalEntry, deleteJournalEntry,
    checkInEmployee, checkOutEmployee, markAbsent, updateAttendanceNotes, deleteAttendance,
    getTodayAttendance, getEmployeeTodayRecord, getMonthlyAttendanceSummary,
    getProjectBudgetUsed, getProjectCosts, getFinancialSummary, getIncomeStatement, getBalanceSheet, getTrialBalance, getLedgerByAccount,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataState {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}
