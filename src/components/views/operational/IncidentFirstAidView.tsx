import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, 
  Trash2, Edit3, HeartPulse, CheckCircle2
} from 'lucide-react';
import type { ProjectIdentity, IncidentRecord, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';

interface IncidentFirstAidViewProps {
  project?: ProjectIdentity;
}

export const IncidentFirstAidView: React.FC<IncidentFirstAidViewProps> = ({ project }) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => {
    return ProjectService.loadData<IncidentRecord[]>('incidents_firstaid_list', []);
  });

  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30');
  const [location, setLocation] = useState('');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || 'MAIN CONTRACTOR');
  const [incidentType, setIncidentType] = useState<IncidentRecord['incidentType']>('First Aid');
  const [injuredPersonName, setInjuredPersonName] = useState('');
  const [injuryNature, setInjuryNature] = useState('');
  const [briefDescription, setBriefDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [doshReportable, setDoshReportable] = useState(false);
  const [status, setStatus] = useState<IncidentRecord['status']>('CLOSED');

  // Persistence
  useEffect(() => {
    ProjectService.saveData('incidents_firstaid_list', incidents, project?.id);
  }, [incidents, project?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefDescription.trim() || !location.trim()) {
      alert('Please fill in description and location.');
      return;
    }

    const payload: IncidentRecord = {
      id: editingId || `incident-${Date.now()}`,
      referenceNo: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      date,
      time,
      location: location.trim(),
      subcontractor,
      incidentType,
      injuredPersonName: injuredPersonName.trim() || undefined,
      injuryNature: injuryNature.trim() || undefined,
      briefDescription: briefDescription.trim(),
      immediateAction: immediateAction.trim(),
      doshReportable,
      status
    };

    if (editingId) {
      setIncidents(prev => prev.map(i => i.id === editingId ? payload : i));
    } else {
      setIncidents(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:30');
    setLocation('');
    setSubcontractor(subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setIncidentType('First Aid');
    setInjuredPersonName('');
    setInjuryNature('');
    setBriefDescription('');
    setImmediateAction('');
    setDoshReportable(false);
    setStatus('CLOSED');
  };

  const handleOpenEdit = (i: IncidentRecord) => {
    setEditingId(i.id);
    setDate(i.date);
    setTime(i.time);
    setLocation(i.location);
    setSubcontractor(i.subcontractor);
    setIncidentType(i.incidentType);
    setInjuredPersonName(i.injuredPersonName || '');
    setInjuryNature(i.injuryNature || '');
    setBriefDescription(i.briefDescription);
    setImmediateAction(i.immediateAction);
    setDoshReportable(i.doshReportable);
    setStatus(i.status);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete incident log?')) {
      setIncidents(prev => prev.filter(i => i.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return incidents.filter(i => {
      const matchSearch = i.briefDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.subcontractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.injuredPersonName && i.injuredPersonName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'ALL' || i.incidentType === filterType;
      return matchSearch && matchType;
    });
  }, [incidents, searchTerm, filterType]);

  const ltiCount = incidents.filter(i => i.incidentType === 'Lost Time Injury (LTI)' || i.incidentType === 'Fatality').length;
  const firstAidCount = incidents.filter(i => i.incidentType === 'First Aid').length;
  const nearMissCount = incidents.filter(i => i.incidentType === 'Near Miss').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HeartPulse size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Incident, Injury &amp; First Aid Register
              </h2>
              <p className="text-xs text-slate-400">
                Near Miss Reporting, Minor Treatment Log, DOSH JKKP 6/7/8 Statutory Triggers
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Log New Incident</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Logged Cases</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{incidents.length}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">First Aid Cases</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{firstAidCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Near Misses (No Injury)</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{nearMissCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Lost Time Injuries (LTI)</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{ltiCount}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by worker, injury, location, or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-400"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Incident Types</option>
          <option value="First Aid">First Aid</option>
          <option value="Near Miss">Near Miss</option>
          <option value="Medical Treatment">Medical Treatment</option>
          <option value="Lost Time Injury (LTI)">Lost Time Injury (LTI)</option>
          <option value="Dangerous Occurrence">Dangerous Occurrence</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase">Zero Incidents Logged</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Safe site working conditions maintained. No accidents or injuries reported.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(i => (
            <div 
              key={i.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-rose-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border inline-block ${
                      i.incidentType === 'Lost Time Injury (LTI)' || i.incidentType === 'Fatality'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : i.incidentType === 'Medical Treatment'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {i.incidentType}
                    </span>
                    <h3 className="text-sm font-black text-white font-mono mt-1">
                      {i.referenceNo || 'INCIDENT CASE'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {i.date} at {i.time} • <span className="text-slate-200 font-bold">{i.location}</span>
                    </p>
                  </div>

                  {i.doshReportable && (
                    <span className="text-[9px] font-black px-2 py-1 rounded-md bg-rose-500 text-white tracking-widest uppercase animate-pulse">
                      DOSH JKKP 6
                    </span>
                  )}
                </div>

                {i.injuredPersonName && (
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Injured Person:</span>
                      <span className="font-bold text-white">{i.injuredPersonName} ({i.subcontractor})</span>
                    </div>
                    {i.injuryNature && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nature of Injury:</span>
                        <span className="font-bold text-rose-400">{i.injuryNature}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Brief Description:</span>
                  <p className="text-xs text-white font-medium">{i.briefDescription}</p>
                </div>

                {i.immediateAction && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Immediate Action Taken:</span>
                    <p className="text-xs text-slate-300">{i.immediateAction}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-500">
                  Status: {i.status}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(i)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Incident Report' : 'Log Site Incident / First Aid'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date *</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Time</label>
                  <input 
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Incident Type *</label>
                  <select
                    value={incidentType}
                    onChange={e => setIncidentType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400"
                  >
                    <option value="First Aid">First Aid (Minor)</option>
                    <option value="Near Miss">Near Miss (No Injury)</option>
                    <option value="Medical Treatment">Medical Treatment</option>
                    <option value="Lost Time Injury (LTI)">Lost Time Injury (&gt;4 Days MC)</option>
                    <option value="Dangerous Occurrence">Dangerous Occurrence</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location Zone *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Scaffolding Level 4"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Injured Person Name</label>
                  <input 
                    type="text"
                    placeholder="Leave empty if Near Miss"
                    value={injuredPersonName}
                    onChange={e => setInjuredPersonName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor</label>
                  <select
                    value={subcontractor}
                    onChange={e => setSubcontractor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="MAIN CONTRACTOR">MAIN CONTRACTOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nature of Injury</label>
                <input 
                  type="text"
                  placeholder="e.g. Minor finger abrasion / sprained ankle"
                  value={injuryNature}
                  onChange={e => setInjuryNature(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Incident Description *</label>
                <textarea 
                  rows={2}
                  value={briefDescription}
                  onChange={e => setBriefDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Immediate Action / Treatment *</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Cleaned with antiseptic, sterile dressing applied by first aider."
                  value={immediateAction}
                  onChange={e => setImmediateAction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-rose-950/20 rounded-xl border border-rose-500/20">
                <input 
                  type="checkbox"
                  id="doshReport"
                  checked={doshReportable}
                  onChange={e => setDoshReportable(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500"
                />
                <label htmlFor="doshReport" className="text-xs font-bold text-rose-300">
                  DOSH / JKKP Statutory Reportable (NADOPOD JKKP 6/7/8)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Incident
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default IncidentFirstAidView;
