import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Truck, User, Settings, LogOut, Plus, Trash2, Pencil, ChevronRight, Search } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

type MoreSection = 'menu' | 'employees' | 'materials' | 'equipment';

export default function MorePage() {
  const navigate = useNavigate();
  const { currentUser, hasPermission, logout } = useAuth();
  const { employees, materials, equipment, deleteEmployee, deleteMaterial, deleteEquipment } = useAppData();
  const [activeSection, setActiveSection] = useState<MoreSection>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.assignedProject.toLowerCase().includes(q));
    }
    if (filterStatus === 'active') list = list.filter(e => e.isActive);
    else if (filterStatus === 'inactive') list = list.filter(e => !e.isActive);
    return list;
  }, [employees, searchQuery, filterStatus]);

  const filteredMaterials = useMemo(() => {
    let list = materials;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.location.toLowerCase().includes(q));
    }
    if (filterStatus === 'low') list = list.filter(m => m.quantity <= m.minStock);
    return list;
  }, [materials, searchQuery, filterStatus]);

  const filteredEquipment = useMemo(() => {
    let list = equipment;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.assignedProject.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') list = list.filter(e => e.status === filterStatus);
    return list;
  }, [equipment, searchQuery, filterStatus]);

  const resetFilters = () => { setSearchQuery(''); setFilterStatus('all'); };

  if (activeSection === 'menu') {
    return (
      <div className="content-area pb-24 md:pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground font-display mb-6">More</h1>
        <div className="space-y-2">
          <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div><p className="font-medium text-foreground">My Profile</p><p className="text-xs text-muted-foreground">{currentUser?.email}</p></div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          {hasPermission('users') && (
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30" onClick={() => navigate('/admin-users')}>
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-chart-purple" />
                <div><p className="font-medium text-foreground">User Management</p><p className="text-xs text-muted-foreground">Manage roles & access</p></div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {hasPermission('employees') && (
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30" onClick={() => { resetFilters(); setActiveSection('employees'); }}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-success" />
                <div><p className="font-medium text-foreground">Employees</p><p className="text-xs text-muted-foreground">{employees.length} registered</p></div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {hasPermission('materials') && (
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30" onClick={() => { resetFilters(); setActiveSection('materials'); }}>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-warning" />
                <div><p className="font-medium text-foreground">Materials</p><p className="text-xs text-muted-foreground">{materials.length} items</p></div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {hasPermission('equipment') && (
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30" onClick={() => { resetFilters(); setActiveSection('equipment'); }}>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-info" />
                <div><p className="font-medium text-foreground">Equipment</p><p className="text-xs text-muted-foreground">{equipment.length} items</p></div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:border-destructive/30 mt-4" onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-destructive" />
            <p className="font-medium text-destructive">Sign Out</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => setActiveSection('menu')} className="text-sm text-primary mb-4">← Back to menu</button>

      {activeSection === 'employees' && (
        <>
          <SectionHeader title="Employees" action={<button onClick={() => navigate('/employee-form')} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>} />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search name, role, project..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-36">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.role} • {emp.contractType} • {formatCurrency(emp.dailyRate)}/day</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={emp.isActive ? 'active' : 'suspended'} />
                  <button onClick={() => navigate(`/employee-form?id=${emp.id}`)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { deleteEmployee(emp.id); toast.success('Employee deleted'); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {filteredEmployees.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No employees match your search</p>}
          </div>
        </>
      )}

      {activeSection === 'materials' && (
        <>
          <SectionHeader title="Materials" action={<button onClick={() => navigate('/material-form')} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>} />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search name, category, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-36">
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredMaterials.map(mat => (
              <div key={mat.id} className={`glass-card p-3 flex items-center justify-between ${mat.quantity <= mat.minStock ? 'border-warning/30' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{mat.name}</p>
                  <p className="text-xs text-muted-foreground">{mat.category} • {mat.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${mat.quantity <= mat.minStock ? 'text-warning' : 'text-foreground'}`}>{mat.quantity} {mat.unit}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(mat.unitCost)}/unit</p>
                  </div>
                  <button onClick={() => navigate(`/material-form?id=${mat.id}`)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { deleteMaterial(mat.id); toast.success('Material deleted'); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {filteredMaterials.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No materials match your search</p>}
          </div>
        </>
      )}

      {activeSection === 'equipment' && (
        <>
          <SectionHeader title="Equipment" action={<button onClick={() => navigate('/equipment-form')} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>} />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search name, type, project..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-40">
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredEquipment.map(eq => (
              <div key={eq.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{eq.name}</p>
                  <p className="text-xs text-muted-foreground">{eq.type} • {eq.assignedProject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={eq.status} />
                  <button onClick={() => navigate(`/equipment-form?id=${eq.id}`)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { deleteEquipment(eq.id); toast.success('Equipment deleted'); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {filteredEquipment.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No equipment matches your search</p>}
          </div>
        </>
      )}
    </div>
  );
}
