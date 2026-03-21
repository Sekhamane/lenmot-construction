
-- ============================================================
-- LENMOT CONSTRUCTION FIS - COMPLETE DATABASE SCHEMA
-- ============================================================

-- 1. Utility: update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Site Supervisor',
  status TEXT NOT NULL DEFAULT 'pending',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Administrator'));
CREATE POLICY "Allow insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    'Site Supervisor',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. PROJECTS TABLE
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY DEFAULT ('p_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  contract_value NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  expected_completion DATE,
  project_manager TEXT,
  supervisor TEXT,
  site_location TEXT,
  status TEXT NOT NULL DEFAULT 'Planned',
  completion_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. BILLING STAGES TABLE
CREATE TABLE public.billing_stages (
  id TEXT PRIMARY KEY DEFAULT ('bs_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  invoiced BOOLEAN NOT NULL DEFAULT false,
  paid BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  retention_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage billing_stages" ON public.billing_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY DEFAULT ('t_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  date DATE,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'expense',
  category TEXT NOT NULL DEFAULT '',
  project_id TEXT,
  project_name TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. EMPLOYEES TABLE
CREATE TABLE public.employees (
  id TEXT PRIMARY KEY DEFAULT ('e_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  name TEXT NOT NULL DEFAULT '',
  id_number TEXT,
  contract_type TEXT NOT NULL DEFAULT 'Casual',
  classification TEXT NOT NULL DEFAULT 'Unskilled',
  assigned_project TEXT,
  pay_frequency TEXT NOT NULL DEFAULT 'Daily',
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  role TEXT,
  phone TEXT,
  start_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. MATERIALS TABLE
CREATE TABLE public.materials (
  id TEXT PRIMARY KEY DEFAULT ('m_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  unit TEXT NOT NULL DEFAULT 'pcs',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  last_restocked DATE,
  linked_project TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage materials" ON public.materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. EQUIPMENT TABLE
CREATE TABLE public.equipment (
  id TEXT PRIMARY KEY DEFAULT ('eq_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Tool',
  purchase_cost NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  assigned_project TEXT,
  status TEXT NOT NULL DEFAULT 'Available',
  fuel_usage_per_day NUMERIC NOT NULL DEFAULT 0,
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage equipment" ON public.equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. LOANS TABLE
CREATE TABLE public.loans (
  id TEXT PRIMARY KEY DEFAULT ('l_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  lender TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  outstanding NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  linked_project TEXT,
  start_date DATE,
  end_date DATE,
  monthly_repayment NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage loans" ON public.loans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. INVESTORS TABLE
CREATE TABLE public.investors (
  id TEXT PRIMARY KEY DEFAULT ('inv_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  name TEXT NOT NULL DEFAULT '',
  capital_invested NUMERIC NOT NULL DEFAULT 0,
  equity_percent NUMERIC NOT NULL DEFAULT 0,
  returns_paid NUMERIC NOT NULL DEFAULT 0,
  join_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage investors" ON public.investors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON public.investors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. JOURNAL ENTRIES TABLE
CREATE TABLE public.journal_entries (
  id TEXT PRIMARY KEY DEFAULT ('je_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  reference TEXT,
  reference_type TEXT NOT NULL DEFAULT 'transaction',
  posted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage journal_entries" ON public.journal_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. JOURNAL LINES TABLE
CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id TEXT NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL DEFAULT '',
  debit NUMERIC NOT NULL DEFAULT 0,
  credit NUMERIC NOT NULL DEFAULT 0
);
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage journal_lines" ON public.journal_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 13. ATTENDANCE RECORDS TABLE
CREATE TABLE public.attendance_records (
  id TEXT PRIMARY KEY DEFAULT ('att_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9)),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL DEFAULT '',
  project_id TEXT,
  project_name TEXT,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  hours_worked NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'checked_in',
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage attendance_records" ON public.attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
