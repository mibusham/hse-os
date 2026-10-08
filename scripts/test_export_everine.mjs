import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xhuyehfiebcmoolfkumz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXllaGZpZWJjbW9vbGZrdW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzgxNjEsImV4cCI6MjA3OTExNDE2MX0.DVy_g-cQTjc-pLjD348sd4JtYNKdN-2lx9A23DXUkO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testExportEverine() {
  console.log("Fetching EVERINE_GLOBAL...");
  const { data: globalData } = await supabase.from('site_logs').select('*').eq('date', 'EVERINE_GLOBAL').single();

  console.log("Fetching EVERINE_2000-01-01...");
  const { data: base2000 } = await supabase.from('site_logs').select('*').eq('date', 'EVERINE_2000-01-01').single();

  console.log("Fetching EVERINE_CDM_PROJECTS...");
  const { data: cdmData } = await supabase.from('site_logs').select('*').eq('date', 'EVERINE_CDM_PROJECTS').single();

  console.log("Fetching latest 30 Manpower logs...");
  const { data: manpowerRows } = await supabase
    .from('site_logs')
    .select('date, manpower')
    .ilike('date', 'EVERINE_MANPOWER_TODAY_%')
    .order('date', { ascending: false })
    .limit(30);

  console.log({
    workersCount: base2000?.induction?.length || 0,
    ptwCount: base2000?.ptw_tracker?.length || 0,
    feCount: base2000?.fire_extinguisher?.length || 0,
    feInspectionsCount: base2000?.fe_inspection_history?.length || 0,
    incidentsCount: base2000?.incidents?.length || 0,
    firstaidCount: base2000?.firstaid_records?.length || 0,
    vectorCount: base2000?.vector_control?.length || 0,
    subconsCount: base2000?.staff_subcon?.subcons?.length || 0,
    trainingCount: base2000?.training_schedule?.length || 0,
    alertsCount: base2000?.alert_history?.length || 0,
    machineryCount: globalData?.machinery?.length || 0,
    scaffoldsCount: globalData?.active_scaffolds?.length || 0,
    rainGaugeCount: globalData?.raingauge?.length || 0,
    envMaintCount: globalData?.env_maintenance?.length || 0,
    hptToolsCount: globalData?.hpt_tools?.length || 0,
    liftingPlansCount: globalData?.lifting_plan?.length || 0,
    filesCount: globalData?.files?.length || 0,
    wasteBinsCount: globalData?.waste_bins?.length || 0,
    waste3rCount: globalData?.waste_3r_logs?.length || 0,
    manpowerDaysCount: manpowerRows?.length || 0,
    cdmProjectsCount: cdmData?.cdm_projects?.length || 0
  });
}

testExportEverine();
