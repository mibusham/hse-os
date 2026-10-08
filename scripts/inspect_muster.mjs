import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectMuster() {
  const { data, error } = await supabase
    .from('site_logs')
    .select('*')
    .eq('date', 'EVERINE_MASTER_MUSTER')
    .single();

  if (error) {
    console.error('Error fetching muster:', error);
  } else {
    for (const key of Object.keys(data)) {
      if (data[key] !== null) {
        const val = data[key];
        console.log(`Col ${key}:`, Array.isArray(val) ? `Array length ${val.length}` : typeof val);
        if (Array.isArray(val) && val.length > 0) {
          console.log('Sample item:', JSON.stringify(val[0], null, 2).substring(0, 500));
        }
      }
    }
  }
}

inspectMuster();
