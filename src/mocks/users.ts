import { UserRole } from '@/types';

export const rolePermissions: Record<UserRole, string[]> = {
  'Administrator': ['dashboard', 'projects', 'finance', 'reports', 'loans', 'investors', 'employees', 'materials', 'equipment', 'settings', 'attendance', 'users'],
  'Accountant': ['dashboard', 'finance', 'reports', 'loans', 'investors'],
  'Project Manager': ['dashboard', 'projects', 'employees', 'materials', 'attendance'],
  'Site Supervisor': ['dashboard', 'projects', 'materials', 'employees', 'attendance'],
  'Inventory Officer': ['dashboard', 'materials', 'equipment'],
  'HR Officer': ['dashboard', 'employees', 'attendance'],
};

export const ALL_ROLES: UserRole[] = [
  'Administrator',
  'Accountant',
  'Project Manager',
  'Site Supervisor',
  'Inventory Officer',
  'HR Officer',
];
