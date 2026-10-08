import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectCdm() {
  const { data } = await supabase
    .from('site_logs')
    .select('*')
    .eq('date', 'EVERINE_CDM_PROJECTS')
    .single();

  console.log("EVERINE_CDM_PROJECTS:", JSON.stringify(data, null, 2));
}

inspectCdm();
