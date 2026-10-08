import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectRow() {
  const { data, error } = await supabase
    .from('site_logs')
    .select('*')
    .eq('date', 'EVERINE_2026-10-08')
    .single();

  if (error) {
    console.error('Error fetching today:', error);
    // Let's try finding the latest
    const { data: latest } = await supabase
      .from('site_logs')
      .select('date')
      .ilike('date', 'EVERINE_%')
      .order('date', { ascending: false })
      .limit(10);
    console.log('Latest 10 keys:', latest);
  } else {
    console.log('Keys in row:', Object.keys(data));
    for (const key of Object.keys(data)) {
      if (data[key] !== null) {
        console.log(`Column ${key}:`, typeof data[key], Array.isArray(data[key]) ? `Array length ${data[key].length}` : (typeof data[key] === 'object' ? Object.keys(data[key]) : data[key]));
      }
    }
  }

  // Also check non-date rows like MASTER_MUSTER, etc.
  const { data: special } = await supabase
    .from('site_logs')
    .select('date')
    .ilike('date', 'EVERINE_%')
    .not('date', 'match', '^EVERINE_\\d{4}-\\d{2}-\\d{2}$');
  
  console.log('Special keys:', special?.map(s => s.date));
}

inspectRow();
