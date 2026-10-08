import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectEverine2000() {
  const { data, error } = await supabase
    .from('site_logs')
    .select('*')
    .eq('date', 'EVERINE_2000-01-01')
    .single();

  if (error) {
    console.error('Error fetching EVERINE_2000-01-01:', error);
    return;
  }

  console.log("=== EVERINE_2000-01-01 POPULATED COLUMNS ===");
  for (const col of Object.keys(data)) {
    const val = data[col];
    if (val !== null && val !== undefined) {
      if (Array.isArray(val)) {
        console.log(`Column [${col}]: Array length = ${val.length}`);
        if (val.length > 0) {
          console.log(`  Sample 1 [${col}]:`, JSON.stringify(val[0]).substring(0, 200));
        }
      } else if (typeof val === 'object') {
        console.log(`Column [${col}]: Object keys =`, Object.keys(val));
      } else {
        console.log(`Column [${col}]:`, val);
      }
    }
  }
}

inspectEverine2000();
