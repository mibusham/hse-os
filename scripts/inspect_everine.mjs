import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectEverine() {
  console.log("=== Checking site_logs for EVERINE ===");
  const { data: logs, error: errLogs } = await supabase
    .from('site_logs')
    .select('date')
    .ilike('date', '%EVERINE%');
  
  if (errLogs) console.error("Error logs:", errLogs);
  else console.log("site_logs EVERINE keys count:", logs.length, logs.map(l => l.date));

  console.log("\n=== Checking site_logs_everen ===");
  const { data: everen, error: errEveren } = await supabase
    .from('site_logs_everen')
    .select('date');

  if (errEveren) console.error("Error everen:", errEveren);
  else console.log("site_logs_everen count:", everen?.length, everen?.map(l => l.date));
}

inspectEverine();
