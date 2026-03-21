import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, UserCheck, UserX } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, UserStatus } from '@/types';
import { toast } from 'sonner';

const ROLES: UserRole[] = ['Administrator', 'Accountant', 'Project Manager', 'Site Supervisor', 'Inventory Officer', 'HR Officer'];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { allUsers, fetchAllUsers, updateUserRole, updateUserStatus, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers().finally(() => setLoading(false));
  }, [fetchAllUsers]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const result = await updateUserRole(userId, role);
    if (result.success) toast.success('Role updated');
    else toast.error(result.error || 'Failed');
  };

  const handleStatusToggle = async (userId: string, current: UserStatus) => {
    const newStatus: UserStatus = current === 'active' ? 'suspended' : 'active';
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) toast.success(`User ${newStatus}`);
    else toast.error(result.error || 'Failed');
  };

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-2">User Management</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage user roles and access</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {allUsers.map(user => (
            <div key={user.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <StatusBadge status={user.status} />
              </div>

              <div className="flex items-center gap-3">
                <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                  disabled={user.id === currentUser?.id}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {user.id !== currentUser?.id && (
                  <button onClick={() => handleStatusToggle(user.id, user.status)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium ${
                      user.status === 'active' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-success/10 text-success hover:bg-success/20'
                    }`}>
                    {user.status === 'active' ? <><UserX className="w-3 h-3" /> Suspend</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                  </button>
                )}
              </div>
            </div>
          ))}
          {allUsers.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
