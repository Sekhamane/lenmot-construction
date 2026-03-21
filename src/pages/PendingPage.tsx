import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function PendingPage() {
  const { currentUser, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshProfile();
    if (currentUser?.status === 'active') navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-warning" />
        </div>
        <h1 className="text-xl font-bold text-foreground font-display mb-2">Account Pending</h1>
        <p className="text-muted-foreground text-sm mb-6">Your account is awaiting administrator approval. You'll be able to access the system once your account has been activated.</p>
        <div className="space-y-3">
          <button onClick={handleRefresh} className="btn-primary w-full">Check Status</button>
          <button onClick={handleLogout} className="btn-secondary w-full">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
