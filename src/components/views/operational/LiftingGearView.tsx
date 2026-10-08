import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Anchor, Plus, Search, 
  Edit3, Trash2, Camera
} from 'lucide-react';
import type { ProjectIdentity, LiftingGearRecord, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';
import { resizeImage } from '../../../utils/imageHelpers';

interface LiftingGearViewProps {
  project?: ProjectIdentity;
}

const GEAR_TYPES = [
  'Webbing Sling',
  'Wire Rope Sling',
  'Chain Sling',
  'Shackle & Bow Clamp',
  'Chain Block / Lever Hoist',
  'Beam Clamp & Trolley',
  'Lifting Eyebolt',
  'Other Rigging Accessory'
];

const COLOR_CODES = [
  { id: 'GREEN', label: 'Green Tag (Quarter 1)', color: 'bg-emerald-500 text-slate-950 border-emerald-400' },
  { id: 'BLUE', label: 'Blue Tag (Quarter 2)', color: 'bg-blue-500 text-white border-blue-400' },
  { id: 'YELLOW', label: 'Yellow Tag (Quarter 3)', color: 'bg-amber-400 text-slate-950 border-amber-300' },
  { id: 'RED', label: 'Red Tag (Quarter 4)', color: 'bg-rose-500 text-white border-rose-400' }
];

export const LiftingGearView: React.FC<LiftingGearViewProps> = ({ project }) => {
  const [gearList, setGearList] = useState<LiftingGearRecord[]>(() => {
    return ProjectService.loadData<LiftingGearRecord[]>('lifting_gear_list', []);
  });

  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [gearType, setGearType] = useState(GEAR_TYPES[0]);
  const [serialNo, setSerialNo] = useState('');
  const [swl, setSwl] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState(subcontractors[0]?.name || 'MAIN CONTRACTOR');
  const [dateInspection, setDateInspection] = useState(new Date().toISOString().split('T')[0]);
  const [colorCode, setColorCode] = useState('GREEN');
  const [status, setStatus] = useState<LiftingGearRecord['status']>('FIT');
  const [inspectorName, setInspectorName] = useState('Lifting Supervisor (Competent Person)');
  const [comments, setComments] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('lifting_gear_list', gearList, project?.id);
  }, [gearList, project?.id]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNo.trim()) {
      alert('Please fill in serial number or tag code.');
      return;
    }

    const payload: LiftingGearRecord = {
      id: editingId || `gear-${Date.now()}`,
      gearType,
      serialNo: serialNo.trim().toUpperCase(),
      swl: swl.trim().toUpperCase(),
      location: location.trim(),
      company,
      dateInspection,
      colorCode,
      status,
      inspectorName: inspectorName.trim(),
      photoUrl: photoUrl || undefined,
      comments: comments.trim()
    };

    if (editingId) {
      setGearList(prev => prev.map(g => g.id === editingId ? payload : g));
    } else {
      setGearList(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setGearType(GEAR_TYPES[0]);
    setSerialNo('');
    setSwl('');
    setLocation('');
    setCompany(subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setDateInspection(new Date().toISOString().split('T')[0]);
    setColorCode('GREEN');
    setStatus('FIT');
    setInspectorName('Lifting Supervisor (Competent Person)');
    setComments('');
    setPhotoUrl(null);
  };

  const handleOpenEdit = (g: LiftingGearRecord) => {
    setEditingId(g.id);
    setGearType(g.gearType);
    setSerialNo(g.serialNo || '');
    setSwl(g.swl || '');
    setLocation(g.location);
    setCompany(g.company);
    setDateInspection(g.dateInspection);
    setColorCode(g.colorCode || 'GREEN');
    setStatus(g.status);
    setInspectorName(g.inspectorName || 'Lifting Supervisor');
    setComments(g.comments || '');
    setPhotoUrl(g.photoUrl || null);
    setShowModal(true);
  };

  const handleDelete = (id: string, serial: string) => {
    if (window.confirm(`Delete lifting gear record: ${serial}?`)) {
      setGearList(prev => prev.filter(g => g.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return gearList.filter(g => {
      const matchSearch = (g.serialNo && g.serialNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        g.gearType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || g.gearType === filterType;
      const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [gearList, searchTerm, filterType, filterStatus]);

  const fitCount = gearList.filter(g => g.status === 'FIT').length;
  const defectiveCount = gearList.filter(g => g.status === 'DEFECTIVE').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Anchor size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Lifting Gear &amp; Rigging Accessories
              </h2>
              <p className="text-xs text-slate-400">
                Webbing Slings, Shackles, Chain Blocks &amp; Monthly Color Code Tag Inspection
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Register Lifting Gear</span>
        </button>
      </div>

      {/* KPI Counters & Active Color Code */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Rigging Gear</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{gearList.length}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Fit for Lifting (Certified)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{fitCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Defective / Quarantined</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{defectiveCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Active Color Coding</span>
          <div className="flex gap-1.5 mt-1">
            {COLOR_CODES.map(c => (
              <span key={c.id} className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${c.color}`}>
                {c.id}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by serial number, gear type, subcontractor, or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-400"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Gear Types</option>
          {GEAR_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="FIT">Fit for Service</option>
          <option value="DEFECTIVE">Defective / Quarantined</option>
        </select>
      </div>

      {/* Gear Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <Anchor size={36} className="mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-white uppercase">No Lifting Gear Logged</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log webbing slings, wire ropes, and shackles to track monthly color codes and safe working loads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => {
            const activeColor = COLOR_CODES.find(c => c.id === g.colorCode) || COLOR_CODES[0];

            return (
              <div 
                key={g.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                        {g.gearType}
                      </span>
                      <h3 className="text-base font-black text-white font-mono">
                        {g.serialNo || 'NO SERIAL'}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-300">
                        SWL / WLL: <span className="text-amber-400 font-mono">{g.swl || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border block ${
                        g.status === 'FIT' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      }`}>
                        {g.status}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border inline-block ${activeColor.color}`}>
                        {activeColor.id} TAG
                      </span>
                    </div>
                  </div>

                  {g.photoUrl && (
                    <div className="w-full h-32 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                      <img src={g.photoUrl} alt={g.serialNo} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-bold text-white">{g.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner:</span>
                      <span className="font-bold text-slate-300">{g.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inspected By:</span>
                      <span className="font-bold text-cyan-300">{g.inspectorName}</span>
                    </div>
                  </div>

                  {g.comments && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{g.comments}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Date: {g.dateInspection}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id, g.serialNo || g.gearType)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Gear */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Lifting Gear Record' : 'Register Lifting & Rigging Gear'}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gear Type *</label>
                  <select
                    value={gearType}
                    onChange={e => setGearType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-400"
                  >
                    {GEAR_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Serial / Tag No *</label>
                  <input 
                    type="text"
                    placeholder="e.g. WS-5T-001"
                    value={serialNo}
                    onChange={e => setSerialNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-indigo-400 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Safe Working Load (SWL)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 5 TON / 5000 KG"
                    value={swl}
                    onChange={e => setSwl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-indigo-400 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location / Zone</label>
                  <input 
                    type="text"
                    placeholder="e.g. Rigging Store / Crane 1"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor Owner</label>
                  <select
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-indigo-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="MAIN CONTRACTOR">MAIN CONTRACTOR</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quarter Color Code</label>
                  <select
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    {COLOR_CODES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Inspection Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="FIT">FIT (Safe for Lifting)</option>
                    <option value="DEFECTIVE">DEFECTIVE (Quarantined / Cut)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Inspection Date</label>
                  <input 
                    type="date"
                    value={dateInspection}
                    onChange={e => setDateInspection(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Inspector Name</label>
                <input 
                  type="text"
                  value={inspectorName}
                  onChange={e => setInspectorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Camera size={14} className="text-indigo-400" />
                  <span>{photoUrl ? 'Change Gear Photo' : 'Upload Inspection / Tag Photo'}</span>
                </button>
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
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Lifting Gear
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiftingGearView;
