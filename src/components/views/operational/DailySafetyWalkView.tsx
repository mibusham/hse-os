import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, Plus, Trash2, Edit3, CheckCircle2, 
  AlertTriangle, Sparkles, Loader2,
  Calendar, MapPin, Building2, Send, Search,
  Check
} from 'lucide-react';
import type { ProjectIdentity, SafetyFindingRecord, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';
import { analyzeSafetyFinding } from '../../../services/geminiService';
import { resizeImage } from '../../../utils/imageHelpers';

interface DailySafetyWalkViewProps {
  project?: ProjectIdentity;
}

export const DailySafetyWalkView: React.FC<DailySafetyWalkViewProps> = ({ project }) => {
  const [findings, setFindings] = useState<SafetyFindingRecord[]>(() => {
    return ProjectService.loadData<SafetyFindingRecord[]>('safety_findings_list', []);
  });

  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || 'GENERAL SITE');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SafetyFindingRecord['category']>('Unsafe Condition');
  const [severity, setSeverity] = useState<SafetyFindingRecord['severity']>('Medium');
  const [status, setStatus] = useState<SafetyFindingRecord['status']>('OPEN');
  const [actionTaken, setActionTaken] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [reportedBy] = useState('Safety Officer (SHO)');
  const [aiMitigation, setAiMitigation] = useState('');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('safety_findings_list', findings, project?.id);
  }, [findings, project?.id]);

  // AI Hazard Analysis
  const handleRunAiAnalysis = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzingAi(true);
    try {
      const result = await analyzeSafetyFinding(text);
      if (result) {
        setAiMitigation(result.mitigation);
        if (result.riskLevel === 'High') setSeverity('High');
        else if (result.riskLevel === 'Low') setSeverity('Low');
        else setSeverity('Medium');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file, 1024, 0.8);
      setPhotoUrl(base64);
    } catch (err) {
      alert('Failed to upload photo');
    }
  };

  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      alert('Please fill in observation description and location.');
      return;
    }

    const payload: SafetyFindingRecord = {
      id: editingId || `finding-${Date.now()}`,
      date,
      location: location.trim(),
      subcontractor,
      description: description.trim(),
      category,
      severity,
      photoUrl: photoUrl || undefined,
      status,
      actionTaken: actionTaken.trim() || undefined,
      aiMitigation: aiMitigation.trim() || undefined,
      reportedBy: reportedBy.trim()
    };

    if (editingId) {
      setFindings(prev => prev.map(f => f.id === editingId ? payload : f));
    } else {
      setFindings(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setSubcontractor(subcontractors[0]?.name || 'GENERAL SITE');
    setDescription('');
    setCategory('Unsafe Condition');
    setSeverity('Medium');
    setStatus('OPEN');
    setActionTaken('');
    setPhotoUrl(null);
    setAiMitigation('');
  };

  const handleOpenEdit = (f: SafetyFindingRecord) => {
    setEditingId(f.id);
    setDate(f.date);
    setLocation(f.location);
    setSubcontractor(f.subcontractor);
    setDescription(f.description);
    setCategory(f.category);
    setSeverity(f.severity);
    setStatus(f.status);
    setActionTaken(f.actionTaken || '');
    setPhotoUrl(f.photoUrl || null);
    setAiMitigation(f.aiMitigation || '');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this site finding log?')) {
      setFindings(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleQuickStatus = (id: string, newStatus: SafetyFindingRecord['status']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const handleWhatsAppShare = (f: SafetyFindingRecord) => {
    const text = `🚨 *HSE SITE OBSERVATION ALERT*\n` +
      `📅 Date: ${f.date}\n` +
      `📍 Location: ${f.location}\n` +
      `🏢 Subcontractor: ${f.subcontractor}\n` +
      `⚠️ Category: ${f.category} (${f.severity} Risk)\n` +
      `📝 Finding: ${f.description}\n` +
      `💡 Required Mitigation: ${f.aiMitigation || f.actionTaken || 'Immediate Rectification Required'}\n` +
      `Status: ${f.status}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = useMemo(() => {
    return findings.filter(f => {
      const matchSearch = f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.subcontractor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
      const matchStatus = filterStatus === 'ALL' || f.status === filterStatus;
      return matchSearch && matchSeverity && matchStatus;
    });
  }, [findings, searchTerm, filterSeverity, filterStatus]);

  const openCount = findings.filter(f => f.status === 'OPEN').length;
  const criticalCount = findings.filter(f => f.severity === 'Critical' || f.severity === 'High').length;
  const rectifiedCount = findings.filter(f => f.status === 'RECTIFIED' || f.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Daily Safety Walk &amp; Hazard Findings
              </h2>
              <p className="text-xs text-slate-400">
                Unsafe Acts &amp; Conditions, Photo Evidence Log, Gemini AI Mitigation Strategy
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Log New Finding</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Open Hazards</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{openCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">High / Critical Risks</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{criticalCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Rectified &amp; Closed</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{rectifiedCount}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search findings by description, location, or subcontractor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="RECTIFIED">Rectified</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Findings Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase">Site Condition Normal</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No active safety walk hazard findings recorded. Keep up the high safety standards!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(f => (
            <div 
              key={f.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative group hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        f.severity === 'Critical' || f.severity === 'High' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                          : f.severity === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {f.severity} Risk
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {f.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Calendar size={12} className="text-slate-500" />
                      <span>{f.date}</span>
                      <span>•</span>
                      <MapPin size={12} className="text-slate-500" />
                      <span className="text-slate-200 font-bold">{f.location}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    f.status === 'OPEN' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                      : f.status === 'RECTIFIED'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {f.status}
                  </span>
                </div>

                {/* Subcontractor */}
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 size={13} className="text-cyan-400" />
                  <span>Subcontractor: {f.subcontractor}</span>
                </div>

                {/* Description & Photo */}
                <div className="flex gap-4">
                  {f.photoUrl && (
                    <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      <img src={f.photoUrl} alt="Finding" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-white font-medium leading-relaxed">
                      {f.description}
                    </p>
                    {f.aiMitigation && (
                      <div className="bg-blue-950/40 border border-blue-500/20 p-2.5 rounded-xl text-[11px] text-blue-300 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[10px] text-cyan-400 uppercase tracking-wider">
                          <Sparkles size={11} /> AI Mitigation Recommendation
                        </span>
                        <p>{f.aiMitigation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {f.status === 'OPEN' && (
                    <button
                      onClick={() => handleQuickStatus(f.id, 'RECTIFIED')}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Mark Rectified
                    </button>
                  )}
                  {f.status === 'RECTIFIED' && (
                    <button
                      onClick={() => handleQuickStatus(f.id, 'CLOSED')}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Close Finding
                    </button>
                  )}
                  <button
                    onClick={() => handleWhatsAppShare(f)}
                    className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-xs transition-all flex items-center gap-1"
                    title="Send instant WhatsApp alert to subcon"
                  >
                    <Send size={12} />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
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

      {/* Modal: Create / Edit Finding */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Site Hazard Finding' : 'Log Daily Safety Walk Finding'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFinding} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date *</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location Zone *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Block A Level 5"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor</label>
                  <select
                    value={subcontractor}
                    onChange={e => setSubcontractor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="GENERAL SITE">GENERAL SITE / MAIN CON</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Finding Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  >
                    <option value="Unsafe Condition">Unsafe Condition</option>
                    <option value="Unsafe Act">Unsafe Act</option>
                    <option value="Environmental">Environmental Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observation Description *</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Workers at perimeter scaffolding without safety harness hooked to lifeline."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* AI Trigger */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={isAnalyzingAi || !description.trim()}
                  onClick={() => handleRunAiAnalysis(description)}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all"
                >
                  {isAnalyzingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>Generate AI Mitigation &amp; Risk Rating</span>
                </button>
              </div>

              {aiMitigation && (
                <div className="bg-blue-950/40 border border-blue-500/20 p-2.5 rounded-xl text-[11px] text-blue-300">
                  <span className="font-bold text-[10px] text-cyan-400 block mb-0.5">AI Recommended Action:</span>
                  <p>{aiMitigation}</p>
                </div>
              )}

              {/* Risk Level & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Severity / Risk Level</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="OPEN">Open (Requires Action)</option>
                    <option value="RECTIFIED">Rectified</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Camera size={14} className="text-amber-400" />
                    <span>{photoUrl ? 'Change Photo' : 'Snap / Upload Photo Evidence'}</span>
                  </button>
                  {photoUrl && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check size={12} /> Photo Attached
                    </span>
                  )}
                </div>
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
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Finding
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailySafetyWalkView;
