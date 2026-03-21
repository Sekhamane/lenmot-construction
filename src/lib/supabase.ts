import { createClient } from '@supabase/supabase-js';

// Lovable Cloud (Supabase) connection
// To use your own Supabase project, replace these values:
const SUPABASE_URL = 'https://hamzvaqrjlfeoxszmizx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbXp2YXFyamxmZW94c3ptaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzAxNDQsImV4cCI6MjA4OTU0NjE0NH0.09Uxe9tE5Da9HVJ5K8SkBuda0c7ETrGW24ONWnKRhF8';

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

console.log('[Supabase] Configured:', isSupabaseConfigured);
