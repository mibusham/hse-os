import { createClient } from '@supabase/supabase-js';

// Dedicated Supabase credentials for HSE OS
const SUPABASE_URL = 'https://xdhihxiwvnfqlvstidpf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PJwThAcpH_JJe3ZXhaU_BA_7MpRAAUr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
