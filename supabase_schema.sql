-- ==============================================================================
-- HSE OS (HEALTH, SAFETY & ENVIRONMENT OPERATING SYSTEM)
-- Dedicated Cloud Database Schema for Supabase
-- Target Project URL: https://xdhihxiwvnfqlvstidpf.supabase.co
-- ==============================================================================

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.hse_os_projects (
    id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    project_code TEXT,
    location TEXT,
    project_scope TEXT NOT NULL,
    client_name TEXT NOT NULL,
    main_con_name TEXT NOT NULL,
    contract_value NUMERIC DEFAULT 0,
    start_date DATE,
    target_completion_date DATE,
    estimated_person_days INTEGER DEFAULT 0,
    has_deep_excavation BOOLEAN DEFAULT false,
    basement_levels INTEGER DEFAULT 0,
    tower_storeys INTEGER DEFAULT 1,
    is_reg8_notifiable BOOLEAN DEFAULT false,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Statutory Advisories & Action Radar Table
CREATE TABLE IF NOT EXISTS public.hse_os_advisories (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.hse_os_projects(id) ON DELETE CASCADE,
    pillar TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    statutory_reference TEXT,
    suggested_action TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Public Policies for App Access
ALTER TABLE public.hse_os_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_os_advisories ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read on hse_os_projects" 
ON public.hse_os_projects FOR SELECT USING (true);

-- Allow insert/update access
CREATE POLICY "Allow public insert/update on hse_os_projects" 
ON public.hse_os_projects FOR ALL USING (true) WITH CHECK (true);

-- Allow read access for advisories
CREATE POLICY "Allow public read on hse_os_advisories" 
ON public.hse_os_advisories FOR SELECT USING (true);

-- Allow insert/update access for advisories
CREATE POLICY "Allow public insert/update on hse_os_advisories" 
ON public.hse_os_advisories FOR ALL USING (true) WITH CHECK (true);
