import {
  Project, BillingStageItem, Transaction, Employee, Material,
  Equipment, Loan, Investor, JournalEntry, JournalLine, AttendanceRecord,
} from '@/types';

export function projectToRow(p: Partial<Project> & { id?: string }) {
  return {
    ...(p.id ? { id: p.id } : {}),
    name: p.name,
    client_name: p.clientName,
    contract_value: p.contractValue,
    start_date: p.startDate || null,
    expected_completion: p.expectedCompletion || null,
    project_manager: p.projectManager || null,
    supervisor: p.supervisor || null,
    site_location: p.siteLocation || null,
    status: p.status,
    completion_percent: p.completionPercent,
  };
}

export function rowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name || '',
    clientName: row.client_name || '',
    contractValue: Number(row.contract_value) || 0,
    startDate: row.start_date || '',
    expectedCompletion: row.expected_completion || '',
    projectManager: row.project_manager || '',
    supervisor: row.supervisor || '',
    siteLocation: row.site_location || '',
    status: row.status || 'Planned',
    completionPercent: Number(row.completion_percent) || 0,
    billingStages: (row.billing_stages || []).map(rowToBillingStage),
  };
}

export function billingStageToRow(bs: Partial<BillingStageItem> & { id?: string }, projectId: string) {
  return {
    ...(bs.id ? { id: bs.id } : {}),
    project_id: projectId,
    stage_name: bs.stageName,
    amount: bs.amount,
    invoiced: bs.invoiced,
    paid: bs.paid,
    due_date: bs.dueDate || null,
    retention_percent: bs.retentionPercent,
  };
}

export function rowToBillingStage(row: any): BillingStageItem {
  return {
    id: row.id,
    stageName: row.stage_name || '',
    amount: Number(row.amount) || 0,
    invoiced: !!row.invoiced,
    paid: !!row.paid,
    dueDate: row.due_date || '',
    retentionPercent: Number(row.retention_percent) || 0,
  };
}

export function transactionToRow(tx: Partial<Transaction> & { id?: string }) {
  return {
    ...(tx.id ? { id: tx.id } : {}),
    date: tx.date || null,
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    project_id: tx.projectId || null,
    project_name: tx.projectName || null,
    approved_by: tx.approvedBy || null,
  };
}

export function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    date: row.date || '',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    type: row.type || 'expense',
    category: row.category || '',
    projectId: row.project_id || '',
    projectName: row.project_name || '',
    approvedBy: row.approved_by || '',
  };
}

export function employeeToRow(emp: Partial<Employee> & { id?: string }) {
  return {
    ...(emp.id ? { id: emp.id } : {}),
    name: emp.name,
    id_number: emp.idNumber || null,
    contract_type: emp.contractType,
    classification: emp.classification,
    assigned_project: emp.assignedProject || null,
    pay_frequency: emp.payFrequency,
    daily_rate: emp.dailyRate,
    role: emp.role || null,
    phone: emp.phone || null,
    start_date: emp.startDate || null,
    is_active: emp.isActive,
  };
}

export function rowToEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name || '',
    idNumber: row.id_number || '',
    contractType: row.contract_type || 'Casual',
    classification: row.classification || 'Unskilled',
    assignedProject: row.assigned_project || '',
    payFrequency: row.pay_frequency || 'Daily',
    dailyRate: Number(row.daily_rate) || 0,
    role: row.role || '',
    phone: row.phone || '',
    startDate: row.start_date || '',
    isActive: row.is_active !== false,
  };
}

export function attendanceToRow(att: Partial<AttendanceRecord> & { id?: string }) {
  return {
    ...(att.id ? { id: att.id } : {}),
    employee_id: att.employeeId,
    employee_name: att.employeeName,
    project_id: att.projectId || null,
    project_name: att.projectName || null,
    date: att.date,
    check_in: att.checkIn || null,
    check_out: att.checkOut || null,
    hours_worked: att.hoursWorked,
    status: att.status,
    notes: att.notes || null,
    recorded_by: att.recordedBy || null,
  };
}

export function rowToAttendance(row: any): AttendanceRecord {
  return {
    id: row.id,
    employeeId: row.employee_id || '',
    employeeName: row.employee_name || '',
    projectId: row.project_id || '',
    projectName: row.project_name || '',
    date: row.date || '',
    checkIn: row.check_in || '',
    checkOut: row.check_out || '',
    hoursWorked: Number(row.hours_worked) || 0,
    status: row.status || 'checked_in',
    notes: row.notes || '',
    recordedBy: row.recorded_by || '',
    createdAt: row.created_at || '',
  };
}

export function materialToRow(mat: Partial<Material> & { id?: string }) {
  return {
    ...(mat.id ? { id: mat.id } : {}),
    name: mat.name,
    category: mat.category,
    unit: mat.unit,
    quantity: mat.quantity,
    unit_cost: mat.unitCost,
    location: mat.location || null,
    min_stock: mat.minStock,
    last_restocked: mat.lastRestocked || null,
    linked_project: mat.linkedProject || null,
  };
}

export function rowToMaterial(row: any): Material {
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || 'Other',
    unit: row.unit || 'pcs',
    quantity: Number(row.quantity) || 0,
    unitCost: Number(row.unit_cost) || 0,
    location: row.location || '',
    minStock: Number(row.min_stock) || 0,
    lastRestocked: row.last_restocked || '',
    linkedProject: row.linked_project || '',
  };
}

export function equipmentToRow(eq: Partial<Equipment> & { id?: string }) {
  return {
    ...(eq.id ? { id: eq.id } : {}),
    name: eq.name,
    type: eq.type,
    purchase_cost: eq.purchaseCost,
    current_value: eq.currentValue,
    assigned_project: eq.assignedProject || null,
    status: eq.status,
    fuel_usage_per_day: eq.fuelUsagePerDay,
    last_maintenance: eq.lastMaintenance || null,
  };
}

export function rowToEquipment(row: any): Equipment {
  return {
    id: row.id,
    name: row.name || '',
    type: row.type || 'Tool',
    purchaseCost: Number(row.purchase_cost) || 0,
    currentValue: Number(row.current_value) || 0,
    assignedProject: row.assigned_project || '',
    status: row.status || 'Available',
    fuelUsagePerDay: Number(row.fuel_usage_per_day) || 0,
    lastMaintenance: row.last_maintenance || '',
  };
}

export function loanToRow(loan: Partial<Loan> & { id?: string }) {
  return {
    ...(loan.id ? { id: loan.id } : {}),
    lender: loan.lender,
    amount: loan.amount,
    interest_rate: loan.interestRate,
    outstanding: loan.outstanding,
    purpose: loan.purpose || null,
    linked_project: loan.linkedProject || null,
    start_date: loan.startDate || null,
    end_date: loan.endDate || null,
    monthly_repayment: loan.monthlyRepayment,
  };
}

export function rowToLoan(row: any): Loan {
  return {
    id: row.id,
    lender: row.lender || '',
    amount: Number(row.amount) || 0,
    interestRate: Number(row.interest_rate) || 0,
    outstanding: Number(row.outstanding) || 0,
    purpose: row.purpose || '',
    linkedProject: row.linked_project || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    monthlyRepayment: Number(row.monthly_repayment) || 0,
  };
}

export function investorToRow(inv: Partial<Investor> & { id?: string }) {
  return {
    ...(inv.id ? { id: inv.id } : {}),
    name: inv.name,
    capital_invested: inv.capitalInvested,
    equity_percent: inv.equityPercent,
    returns_paid: inv.returnsPaid,
    join_date: inv.joinDate || null,
  };
}

export function rowToInvestor(row: any): Investor {
  return {
    id: row.id,
    name: row.name || '',
    capitalInvested: Number(row.capital_invested) || 0,
    equityPercent: Number(row.equity_percent) || 0,
    returnsPaid: Number(row.returns_paid) || 0,
    joinDate: row.join_date || '',
  };
}

export function journalEntryToRow(je: Partial<JournalEntry> & { id?: string }) {
  return {
    ...(je.id ? { id: je.id } : {}),
    date: je.date,
    description: je.description,
    reference: je.reference || null,
    reference_type: je.referenceType,
    posted_by: je.postedBy || null,
  };
}

export function journalLineToRow(line: JournalLine, journalEntryId: string) {
  return {
    journal_entry_id: journalEntryId,
    account_code: line.accountCode,
    account_name: line.accountName,
    debit: line.debit,
    credit: line.credit,
  };
}

export function rowToJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date || '',
    description: row.description || '',
    reference: row.reference || '',
    referenceType: row.reference_type || 'transaction',
    lines: (row.journal_lines || []).map((l: any) => ({
      accountCode: l.account_code || '',
      accountName: l.account_name || '',
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    })),
    postedBy: row.posted_by || '',
    createdAt: row.created_at || '',
  };
}
