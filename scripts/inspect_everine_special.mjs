import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSpecial() {
  const { data: rows } = await supabase
    .from('site_logs')
    .select('*')
    .ilike('date', 'EVERINE_%');

  const nonDates = rows.filter(r => !r.date.match(/EVERINE_\d{4}-\d{2}-\d{2}/) && !r.date.match(/MANPOWER_TODAY/));
  console.log(`Found ${nonDates.length} non-daily rows for Everine:`);
  
  for (const r of nonDates) {
    const populatedCols = Object.keys(r).filter(k => r[k] !== null && k !== 'date');
    console.log(`- ${r.date}: populated cols = ${populatedCols.join(', ')}`);
    if (r.date.includes('MUSTER') || r.date.includes('WORKER') || r.date.includes('GLOBAL') || r.date.includes('HIRARC') || r.date.includes('CDM')) {
      for (const col of populatedCols) {
        const val = r[col];
        console.log(`   [${col}]: ${Array.isArray(val) ? `Array(${val.length})` : typeof val}`);
        if (Array.isArray(val) && val.length > 0) {
          console.log(`     Sample 1:`, JSON.stringify(val[0]).substring(0, 150));
        }
      }
    }
  }

  // Also let's check if there is an EVERINE_MASTER_MUSTER or similar
  const muster = rows.find(r => r.date.toUpperCase().includes('MUSTER'));
  console.log('Muster found:', muster?.date);
}

inspectSpecial();
