import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saving, setSaving] = useState(false);

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaving(false);
    if (result.success) toast.success('Profile updated');
    else toast.error(result.error || 'Failed to update');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="content-area pb-24 md:pb-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-primary mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <h1 className="text-2xl font-bold text-foreground font-display mb-6">My Profile</h1>

      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3 relative">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary font-display">{initials}</span>
          )}
        </div>
        <p className="text-lg font-bold text-foreground">{currentUser.name}</p>
        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-primary">{currentUser.role}</span>
          <StatusBadge status={currentUser.status} />
        </div>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <FormField label="Name"><Input value={name} onChange={e => setName(e.target.value)} /></FormField>
        <FormField label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+266..." /></FormField>
        <FormField label="Email"><Input value={currentUser.email} disabled className="opacity-50" /></FormField>
        <FormField label="Role"><Input value={currentUser.role} disabled className="opacity-50" /></FormField>

        <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Changes'}</Button>
        <Button variant="destructive" onClick={handleLogout} className="w-full">Sign Out</Button>
      </div>
    </div>
  );
}
