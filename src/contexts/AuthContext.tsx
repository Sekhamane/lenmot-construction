import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { rolePermissions } from '@/mocks/users';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (module: string) => boolean;
  refreshProfile: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { name?: string; phone?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const ensureBootstrapAdmin = useCallback(async (userId: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'Administrator');
    if (countError) {
      console.error('[Auth] Bootstrap admin count error:', countError.message);
      return;
    }
    if ((count ?? 0) > 0) return;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'Administrator', status: 'active' })
      .eq('id', userId);
    if (updateError) {
      console.error('[Auth] Bootstrap admin update error:', updateError.message);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (!isSupabaseConfigured) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await ensureBootstrapAdmin(session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, email, role, status, avatar, created_at')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: '',
              role: profile.role as UserRole,
              status: (profile.status as UserStatus) || 'pending',
              avatar: profile.avatar,
              createdAt: profile.created_at,
            });
          }
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ensureBootstrapAdmin]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) return { success: false, error: 'Backend not configured' };
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await ensureBootstrapAdmin(data.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, avatar, created_at')
          .eq('id', data.user.id)
          .single();
        if (profileError || !profile) return { success: false, error: 'Could not load user profile' };
        setCurrentUser({
          id: profile.id, name: profile.name, email: profile.email, phone: '',
          role: profile.role as UserRole, status: (profile.status as UserStatus) || 'pending',
          avatar: profile.avatar, createdAt: profile.created_at,
        });
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, [ensureBootstrapAdmin]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      if (!isSupabaseConfigured) return { success: false, error: 'Backend not configured' };
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ensureBootstrapAdmin(data.user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, email, role, status, avatar, created_at')
          .eq('id', data.user.id)
          .single();
        if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: '',
            role: profile.role as UserRole,
            status: (profile.status as UserStatus) || 'pending',
            avatar: profile.avatar,
            createdAt: profile.created_at,
          });
        } else {
          setCurrentUser({
            id: data.user.id,
            name,
            email,
            phone: '',
            role: 'Site Supervisor',
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        }
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }, [ensureBootstrapAdmin]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const hasPermission = useCallback((module: string) => {
    if (!currentUser || currentUser.status !== 'active') return false;
    return rolePermissions[currentUser.role]?.includes(module) ?? false;
  }, [currentUser]);

  const refreshProfile = useCallback(async () => {
    if (!currentUser || !isSupabaseConfigured) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, role, status, avatar, created_at')
      .eq('id', currentUser.id)
      .single();
    if (profile) {
      setCurrentUser({
        id: profile.id, name: profile.name, email: profile.email, phone: '',
        role: profile.role as UserRole, status: (profile.status as UserStatus) || 'pending',
        avatar: profile.avatar, createdAt: profile.created_at,
      });
    }
  }, [currentUser]);

  const fetchAllUsers = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, status, avatar, created_at')
      .order('created_at', { ascending: false });
    if (data && !error) {
      setAllUsers(data.map((p: any) => ({
        id: p.id, name: p.name, email: p.email, phone: '',
        role: p.role as UserRole, status: (p.status as UserStatus) || 'pending',
        avatar: p.avatar, createdAt: p.created_at,
      })));
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Backend not configured' };
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) return { success: false, error: error.message };
    await fetchAllUsers();
    return { success: true };
  }, [fetchAllUsers]);

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Backend not configured' };
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) return { success: false, error: error.message };
    await fetchAllUsers();
    return { success: true };
  }, [fetchAllUsers]);

  const updateProfile = useCallback(async (updates: { name?: string; phone?: string; avatar?: string }) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!isSupabaseConfigured) return { success: false, error: 'Backend not configured' };
    const { data: authData } = await supabase.auth.getUser();
    const authUserId = authData?.user?.id ?? currentUser.id;
    const updatesToSend = { ...updates };
    delete (updatesToSend as any).phone;
    const { error } = await supabase.from('profiles').update(updatesToSend).eq('id', authUserId);
    if (error) return { success: false, error: error.message };
    setCurrentUser({ ...currentUser, ...updates });
    return { success: true };
  }, [currentUser]);

  const isAuthenticated = currentUser !== null;

  const value = useMemo(() => ({
    currentUser, isLoading, isAuthenticated, allUsers,
    login, register, logout, hasPermission, refreshProfile,
    fetchAllUsers, updateUserRole, updateUserStatus, updateProfile,
  }), [
    currentUser, isLoading, isAuthenticated, allUsers,
    login, register, logout, hasPermission, refreshProfile,
    fetchAllUsers, updateUserRole, updateUserStatus, updateProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
