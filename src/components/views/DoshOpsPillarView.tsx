import React, { useState, useEffect } from 'react';
import { 
  FileCheck, CheckCircle2, 
  Clock, AlertTriangle, Plus, 
  Layers, HardHat, Trash2, XCircle, RefreshCw, Calendar, Save, Check
} from 'lucide-react';
import type { ProjectIdentity, PTWRecord, InspectionRecord, ManHoursLog } from '../../types/core';
import { ProjectService } from '../../services/projectService';

export const DoshOpsPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'PTW' | 'INSPECTIONS' | 'MANHOURS'>('PTW');

  // 1. PTW State & Persistence
  const [ptwList, setPtwList] = useState<PTWRecord[]>(() => {
    return ProjectService.loadData<PTWRecord[]>('ptw_list', []);
  });

  // 2. Statutory 7-Day Inspection State & Persistence
  const [inspectionList, setInspectionList] = useState<InspectionRecord[]>(() => {
    return ProjectService.loadData<InspectionRecord[]>('inspections_list', []);
  });

  // 3. Manhours Calculations & Logs
  const [workerCount, setWorkerCount] = useState<number>(35);
  const [workDays, setWorkDays] = useState<number>(26);
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [monthName, setMonthName] = useState<string>('October 2026');
  const [manHoursLogs, setManHoursLogs] = useState<ManHoursLog[]>(() => {
    return ProjectService.loadData<ManHoursLog[]>('manhours_logs', []);
  });

  const totalMonthlyManHours = workerCount * workDays * hoursPerDay;
  const cumulativeHours = manHoursLogs.reduce((acc, curr) => acc + curr.totalMonthlyManHours, 0) + totalMonthlyManHours;

  // Modals State
  const [showNewPtwModal, setShowNewPtwModal] = useState(false);
  const [newActivity, setNewActivity] = useState<PTWRecord['activityType']>('WORKING_AT_HEIGHT');
  const [newSubcon, setNewSubcon] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newValidHours, setNewValidHours] = useState('19:00');

  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [newInspItem, setNewInspItem] = useState<InspectionRecord['itemType']>('SCAFFOLDING_FRAME');
  const [newInspTag, setNewInspTag] = useState('');
  const [newInspLocation, setNewInspLocation] = useState('');
  const [newInspInspector, setNewInspInspector] = useState('Ir. Razak (Green Book)');
  const [newInspStatus, setNewInspStatus] = useState<'SAFE_GREEN_TAG' | 'REJECT_RED_TAG'>('SAFE_GREEN_TAG');
  const [newInspRemarks, setNewInspRemarks] = useState('');

  // Sync back on changes
  useEffect(() => {
    ProjectService.saveData('ptw_list', ptwList, project?.id);
  }, [ptwList, project?.id]);

  useEffect(() => {
    ProjectService.saveData('inspections_list', inspectionList, project?.id);
  }, [inspectionList, project?.id]);

  useEffect(() => {
    ProjectService.saveData('manhours_logs', manHoursLogs, project?.id);
  }, [manHoursLogs, project?.id]);

  // PTW Handlers
  const handleCreatePTW = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcon || !newLocation) return;
    const today = new Date().toISOString().split('T')[0];
    const newRecord: PTWRecord = {
      id: `ptw-${Date.now()}`,
      ptwNo: `PTW-2026-${newActivity.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      activityType: newActivity,
      locationZone: newLocation,
      subcontractor: newSubcon.toUpperCase(),
      startDate: today,
      validUntil: `${newValidHours} Today`,
      status: 'ACTIVE',
      authorizedBy: 'SHO / SSS Digital Endorsement',
      riskPrecautions: [
        'HIRADC communicated in toolbox briefing',
        '100% Mandatory PPE enforcement (Hard hat, safety harness & boots)',
        'Work area demarcated with safety barrier tape'
      ],
      createdAt: new Date().toISOString()
    };
    setPtwList([newRecord, ...ptwList]);
    setShowNewPtwModal(false);
    setNewSubcon('');
    setNewLocation('');
  };

  const handleUpdatePtwStatus = (id: string, newStatus: PTWRecord['status']) => {
    setPtwList(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleDeletePtw = (id: string) => {
    setPtwList(prev => prev.filter(p => p.id !== id));
  };

  // Inspection Handlers
  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspTag || !newInspLocation) return;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + 7);
    const nextDueStr = nextDue.toISOString().split('T')[0];

    const newRecord: InspectionRecord = {
      id: `insp-${Date.now()}`,
      itemType: newInspItem,
      tagNo: newInspTag.toUpperCase(),
      location: newInspLocation,
      inspectorName: newInspInspector,
      lastInspectionDate: todayStr,
      nextDueDate: nextDueStr,
      status: newInspStatus,
      remarks: newInspRemarks || 'Physical inspection satisfactory in accordance with DOSH / statutory guidelines.'
    };
    setInspectionList([newRecord, ...inspectionList]);
    setShowInspectionModal(false);
    setNewInspTag('');
    setNewInspLocation('');
    setNewInspRemarks('');
  };

  const handleToggleTagStatus = (id: string) => {
    setInspectionList(prev => prev.map(item => {
      if (item.id === id) {
        const toggled: InspectionRecord['status'] = item.status === 'SAFE_GREEN_TAG' ? 'REJECT_RED_TAG' : 'SAFE_GREEN_TAG';
        return { ...item, status: toggled };
      }
      return item;
    }));
  };

  const handleDeleteInspection = (id: string) => {
    setInspectionList(prev => prev.filter(i => i.id !== id));
  };

  // Manhours Log Handlers
  const handleSaveManHours = () => {
    const newLog: ManHoursLog = {
      id: `mh-${Date.now()}`,
      monthYear: monthName,
      workerCount,
      workDays,
      hoursPerDay,
      totalMonthlyManHours,
      cumulativeManHours: cumulativeHours,
      ltiCount: 0
    };
    setManHoursLogs([newLog, ...manHoursLogs.filter(l => l.monthYear !== monthName)]);
    alert(`Safe Man-Hours log for ${monthName} successfully recorded (${totalMonthlyManHours.toLocaleString()} hrs)!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1.5">
              <HardHat size={12} /> Statutory Pillar 1
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">DOSH Statutory &amp; Site Ops</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Risk Control &amp; Statutory Compliance (OSHA 1994 / CDM 2024)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            High-risk Permit to Work (PTW) management, 7-day cyclical scaffold inspections, roof truss structural integrity, and cumulative safe man-hours ledger (A × B × C = D).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'PTW' && (
            <button
              type="button"
              onClick={() => setShowNewPtwModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>Issue New PTW</span>
            </button>
          )}

          {activeTab === 'INSPECTIONS' && (
            <button
              type="button"
              onClick={() => setShowInspectionModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>+ Record Inspection Tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'PTW', label: 'Permit To Work (PTW)', count: ptwList.length, icon: FileCheck },
          { id: 'INSPECTIONS', label: '7-Day Inspection (OSHA 2022)', count: inspectionList.length, icon: Layers },
          { id: 'MANHOURS', label: 'Safe Man-Hours (A×B×C=D)', count: manHoursLogs.length, icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
                isActive 
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-800 text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERMIT TO WORK (PTW) */}
      {activeTab === 'PTW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active PTWs Today</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{ptwList.filter(p => p.status === 'ACTIVE').length}</p>
              <span className="text-[10px] text-slate-500">Valid on-site authorizations</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Permits Closed / Expired</span>
              <p className="text-2xl font-black text-slate-400 mt-1">{ptwList.filter(p => p.status === 'CLOSED' || p.status === 'EXPIRED').length}</p>
              <span className="text-[10px] text-slate-500">Completed or revoked</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Authorized Endorser (SHO / SSS)</span>
              <p className="text-sm font-bold text-white mt-1.5 truncate">Ir. Razak (Green Book)</p>
              <span className="text-[10px] text-slate-500">Section 29 OSHA 1994 Compliance</span>
            </div>
          </div>

          {/* PTW Data List */}
          <div className="space-y-3">
            {ptwList.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <FileCheck size={36} className="text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Active Permits To Work (PTW) At This Time</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All high-risk site works require valid authorization. Click <strong>"Issue New PTW"</strong> above to initiate a site work permit application.
                </p>
              </div>
            ) : (
              ptwList.map(ptw => (
                <div 
                  key={ptw.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                        {ptw.ptwNo}
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {ptw.activityType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        ptw.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ptw.status === 'CLOSED'
                          ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {ptw.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Valid: {ptw.validUntil}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Site Location:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{ptw.locationZone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subcontractor:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{ptw.subcontractor}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Mandatory Control Measures:</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ptw.riskPrecautions.map((pre, idx) => (
                        <span key={idx} className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          {pre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {ptw.status === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdatePtwStatus(ptw.id, 'CLOSED')}
                            className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Check size={12} /> Close Permit (Work Done)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdatePtwStatus(ptw.id, 'EXPIRED')}
                            className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <XCircle size={12} /> Revoke / Stop Work
                          </button>
                        </>
                      )}
                      {ptw.status !== 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => handleUpdatePtwStatus(ptw.id, 'ACTIVE')}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <RefreshCw size={12} /> Reactivate Permit
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePtw(ptw.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Permit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INSPECTIONS 7-DAY CYCLE */}
      {activeTab === 'INSPECTIONS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">7-Day Scaffolding &amp; Structural Inspection (OSHA 1994 Amendment 2022)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Must be inspected by a Designated Person / Competent Scaffolder at least once every 7 days or after adverse weather.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInspectionModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus size={14} /> + Record Inspection Tag
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspectionList.length === 0 ? (
              <div className="col-span-full bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Layers size={36} className="text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No 7-Day Inspection Tags Recorded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No scaffolding or machinery inspection tags logged yet. Click <strong>"+ Record Inspection Tag"</strong> above to register weekly tags.
                </p>
              </div>
            ) : (
              inspectionList.map(insp => (
                <div key={insp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      {insp.tagNo}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleTagStatus(insp.id)}
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                        insp.status === 'SAFE_GREEN_TAG' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse hover:bg-rose-500/20'
                      }`}
                      title="Click to toggle tag status"
                    >
                      {insp.status === 'SAFE_GREEN_TAG' ? 'GREEN TAG (SAFE)' : 'RED TAG (STOP WORK)'}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{insp.itemType.replace(/_/g, ' ')}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{insp.location}</p>
                    {insp.remarks && (
                      <p className="text-[10px] text-slate-500 italic mt-1">{insp.remarks}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Last Inspection:</span>
                      <span className="font-mono text-slate-300">{insp.lastInspectionDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Due Date (7 Days):</span>
                      <span className={`font-mono font-bold ${insp.status === 'REJECT_RED_TAG' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {insp.nextDueDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Inspector:</span>
                      <span className="text-slate-300 font-medium truncate max-w-[140px]">{insp.inspectorName}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500">Click tag to switch status</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteInspection(insp.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAFE MAN-HOURS CALCULATOR & LOGS */}
      {activeTab === 'MANHOURS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                DOSH Statutory Formula: Safe Man-Hours Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Official monthly DOSH calculation: <strong>A (Workers) × B (Days/Month) × C (Hours/Day) = D (Total Man-Hours)</strong>.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleSaveManHours}
              className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Save size={16} />
              <span>Save Current Month Log</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl items-center">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Month &amp; Year
              </label>
              <input 
                type="text" 
                value={monthName}
                onChange={e => setMonthName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                A. Number of Workers (Avg/Day)
              </label>
              <input 
                type="number" 
                value={workerCount}
                onChange={e => setWorkerCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                B. Working Days (Days/Mo)
              </label>
              <input 
                type="number" 
                value={workDays}
                onChange={e => setWorkDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                C. Daily Hours (Hours/Day)
              </label>
              <input 
                type="number" 
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white font-mono"
              />
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                D. Monthly Man-Hours
              </span>
              <p className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
                {totalMonthlyManHours.toLocaleString()}
              </p>
              <span className="text-[9px] text-slate-400 font-bold">Safe Working Hours</span>
            </div>
          </div>

          {/* Historical Man-Hours Log Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-emerald-400" /> Cumulative Safe Man-Hours Ledger
            </h4>

            {manHoursLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                No monthly records saved yet. Click "Save Current Month Log" above to record current month statistics.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Avg Workers (A)</th>
                      <th className="p-3">Days (B)</th>
                      <th className="p-3">Hours/Day (C)</th>
                      <th className="p-3 text-right">Monthly Hours (D)</th>
                      <th className="p-3 text-center">LTI</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {manHoursLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{log.monthYear}</td>
                        <td className="p-3 text-slate-300">{log.workerCount}</td>
                        <td className="p-3 text-slate-300">{log.workDays}</td>
                        <td className="p-3 text-slate-300">{log.hoursPerDay}h</td>
                        <td className="p-3 text-right font-black text-emerald-400">{log.totalMonthlyManHours.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            0 ZERO
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setManHoursLogs(prev => prev.filter(l => l.id !== log.id))}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ISSUE NEW PTW */}
      {showNewPtwModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-rose-400" /> Issue New Permit To Work (PTW)
              </h3>
              <button 
                onClick={() => setShowNewPtwModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePTW} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">High-Risk Activity Type *</label>
                <select 
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400"
                >
                  <option value="WORKING_AT_HEIGHT">WORKING AT HEIGHT (Working at Height / Roof Truss)</option>
                  <option value="HOT_WORK">HOT WORK (Welding / Oxy-Cutting)</option>
                  <option value="EXCAVATION">EXCAVATION (Trenching / Deep Drainage)</option>
                  <option value="LIFTING">HEAVY LIFTING (Precast Concrete / Mobile Crane)</option>
                  <option value="CONFINED_SPACE">CONFINED SPACE (Confined Space / Sewer Manhole)</option>
                  <option value="ELECTRICAL">ELECTRICAL (High Voltage Distribution Board)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subcontractor Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. MAJU JAYA CONSTRUCTION SDN BHD"
                  value={newSubcon}
                  onChange={e => setNewSubcon(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400 uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Specific Site Location (Lot / Zone) *</label>
                <input 
                  type="text"
                  placeholder="e.g. Unit 21 - 35, Phase 2A (Roof Truss Installation)"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Valid Until (Time) *</label>
                <input 
                  type="text"
                  placeholder="e.g. 19:00"
                  value={newValidHours}
                  onChange={e => setNewValidHours(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPtwModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-rose-400 hover:bg-rose-300 uppercase tracking-wider shadow-lg shadow-rose-400/20"
                >
                  Authorize &amp; Endorse PTW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NEW 7-DAY INSPECTION TAG */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers size={18} className="text-amber-400" /> Record New 7-Day Inspection Tag
              </h3>
              <button 
                onClick={() => setShowInspectionModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Item / Structure Inspected *</label>
                <select 
                  value={newInspItem}
                  onChange={e => setNewInspItem(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                >
                  <option value="SCAFFOLDING_FRAME">TUBULAR FRAME SCAFFOLDING (External Access Scaffolding)</option>
                  <option value="MOBILE_CRANE_BACKHOE">MOBILE CRANE / BACKHOE (Heavy Plant &amp; Machinery)</option>
                  <option value="ELECTRICAL_DB">ELECTRICAL DB &amp; ELCB (Site Distribution Board)</option>
                  <option value="ROOF_SAFETY_LINE">ROOF SAFETY LINE &amp; ANCHOR (Roof Lifeline &amp; Anchorage)</option>
                  <option value="SILT_TRAP_ESCP">SILT TRAP &amp; EARTH DRAIN (Sedimentation Basin &amp; Earth Drain)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tag No. / Serial Code *</label>
                <input 
                  type="text"
                  placeholder="e.g. SCAF-TAG-01, MC-KOBELCO-04"
                  value={newInspTag}
                  onChange={e => setNewInspTag(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400 uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Site Location *</label>
                <input 
                  type="text"
                  placeholder="e.g. Block B, Phase 2 (Terrace House Lots 12-18)"
                  value={newInspLocation}
                  onChange={e => setNewInspLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tag Status *</label>
                  <select 
                    value={newInspStatus}
                    onChange={e => setNewInspStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  >
                    <option value="SAFE_GREEN_TAG">GREEN TAG (Passed / Safe to Use)</option>
                    <option value="REJECT_RED_TAG">RED TAG (Failed / Do Not Use)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Competent Inspector Name *</label>
                  <input 
                    type="text"
                    value={newInspInspector}
                    onChange={e => setNewInspInspector(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inspection Remarks</label>
                <input 
                  type="text"
                  placeholder="e.g. Complete cross-bracing, sound base plates, no physical defects"
                  value={newInspRemarks}
                  onChange={e => setNewInspRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 uppercase tracking-wider shadow-lg shadow-amber-400/20"
                >
                  Save Inspection Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoshOpsPillarView;
