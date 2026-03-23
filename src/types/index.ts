export type ProjectStatus = 'Planned' | 'Active' | 'Suspended' | 'Completed';
export type UserRole = 'Administrator' | 'Accountant' | 'Project Manager' | 'Site Supervisor' | 'Inventory Officer' | 'HR Officer';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type TransactionType = 'income' | 'expense';
export type MaterialCategory = 'Cement' | 'Steel' | 'Sand' | 'Gravel' | 'Timber' | 'Roofing' | 'Electrical' | 'Plumbing' | 'Paint' | 'Other';
export type EmployeeType = 'Skilled' | 'Unskilled';
export type PayFrequency = 'Daily' | 'Weekly' | 'Monthly';
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type JournalRefType = 'transaction' | 'loan' | 'equipment' | 'investor' | 'billing' | 'material' | 'attendance';
export type AttendanceStatus = 'checked_in' | 'checked_out' | 'absent';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  contractValue: number;
  startDate: string;
  expectedCompletion: string;
  projectManager: string;
  supervisor: string;
  siteLocation: string;
  status: ProjectStatus;
  completionPercent: number;
  billingStages: BillingStageItem[];
}

export interface BillingStageItem {
  id: string;
  stageName: string;
  amount: number;
  invoiced: boolean;
  paid: boolean;
  dueDate: string;
  retentionPercent: number;
}

export interface Employee {
  id: string;
  name: string;
  idNumber: string;
  contractType: 'Permanent' | 'Contract' | 'Casual';
  classification: EmployeeType;
  assignedProject: string;
  payFrequency: PayFrequency;
  dailyRate: number;
  role: string;
  phone: string;
  startDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: AttendanceStatus;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  quantity: number;
  unitCost: number;
  location: string;
  minStock: number;
  lastRestocked: string;
  linkedProject: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  receiptMimeType?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'Machinery' | 'Vehicle' | 'Tool';
  purchaseCost: number;
  currentValue: number;
  assignedProject: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  fuelUsagePerDay: number;
  lastMaintenance: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  receiptMimeType?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  projectId: string;
  projectName: string;
  approvedBy: string;
  receiptDataUrl?: string;
  receiptFileName?: string;
  receiptMimeType?: string;
}

export interface Loan {
  id: string;
  lender: string;
  amount: number;
  interestRate: number;
  outstanding: number;
  purpose: string;
  linkedProject: string;
  startDate: string;
  endDate: string;
  monthlyRepayment: number;
}

export interface Investor {
  id: string;
  name: string;
  capitalInvested: number;
  equityPercent: number;
  returnsPaid: number;
  joinDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt?: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  referenceType: JournalRefType;
  lines: JournalLine[];
  postedBy: string;
  createdAt: string;
}

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalReceivables: number;
  totalPayables: number;
  cashBalance: number;
  totalContractValue: number;
  activeProjects: number;
}

export interface ProjectCosts {
  materials: number;
  labour: number;
  equipment: number;
  subcontractors: number;
  transport: number;
  overheads: number;
}

export interface IncomeStatementData {
  contractRevenue: number;
  otherIncome: number;
  totalRevenue: number;
  materialsExpense: number;
  labourExpense: number;
  equipmentExpense: number;
  subcontractorExpense: number;
  transportExpense: number;
  totalCostOfConstruction: number;
  grossProfit: number;
  overheadExpense: number;
  totalOperatingExpenses: number;
  operatingProfit: number;
  netProfit: number;
}

export interface BalanceSheetData {
  asOfDate: string;
  assets: {
    cashAndBank: number;
    accountsReceivable: number;
    inventoryMaterials: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    loansPayable: number;
    totalLiabilities: number;
  };
  equity: {
    ownersEquity: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface MonthlyAttendanceSummary {
  employeeId: string;
  employeeName: string;
  projectName: string;
  month: string;
  daysPresent: number;
  daysAbsent: number;
  totalHours: number;
  avgHoursPerDay: number;
}
