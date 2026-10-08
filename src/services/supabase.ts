import { createClient } from '@supabase/supabase-js';

// Dedicated Supabase credentials for HSE OS (Connected to production site_logs)
const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
