import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Tractor, Plus, Search, 
  User, Phone, Edit3, Trash2, Camera, 
  FileText
} from 'lucide-react';
import type { ProjectIdentity, MachineryItem, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';
import { resizeImage } from '../../../utils/imageHelpers';

interface MachineryHeavyPlantViewProps {
  project?: ProjectIdentity;
}

const DEFAULT_MACHINERY_TYPES = [
  'Excavator',
  'Mobile Crane',
  'Tower Crane',
  'Crawler Crane',
  'Lorry Crane (Hiab)',
  'Backhoe Loader',
  'Skid Steer (Bobcat)',
  'Road Roller / Compactor',
  'Forklift',
  'Skylift / Boom Lift',
  'Scissor Lift',
  'Concrete Pump Truck',
  'Air Compressor',
  'Piling Rig',
  'Other Heavy Plant'
];

export const MachineryHeavyPlantView: React.FC<MachineryHeavyPlantViewProps> = ({ project }) => {
  const [machinery, setMachinery] = useState<MachineryItem[]>(() => {
    return ProjectService.loadData<MachineryItem[]>('machinery_heavy_plant_list', []);
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
  const [name, setName] = useState(DEFAULT_MACHINERY_TYPES[0]);
  const [registrationNo, setRegistrationNo] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || 'MAIN CONTRACTOR');
  const [dateMobilize, setDateMobilize] = useState(new Date().toISOString().split('T')[0]);
  const [pmaNo, setPmaNo] = useState('');
  const [pmaExpiry, setPmaExpiry] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [operatorPhone, setOperatorPhone] = useState('');
  const [operatorCidb, setOperatorCidb] = useState('');
  const [operatorJkkp, setOperatorJkkp] = useState('');
  const [operatorIc, setOperatorIc] = useState('');
  const [status, setStatus] = useState<MachineryItem['status']>('ACTIVE');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('machinery_heavy_plant_list', machinery, project?.id);
  }, [machinery, project?.id]);

  // PMA Countdown calculation
  const getPmaStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: 'NO_PMA', label: 'No PMA Logged', color: 'slate', days: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: `Expired (${Math.abs(diffDays)}d ago)`, color: 'rose', days: diffDays };
    }
    if (diffDays <= 30) {
      return { status: 'EXPIRING_SOON', label: `Expires in ${diffDays}d`, color: 'amber', days: diffDays };
    }
    return { status: 'VALID', label: `Valid (${diffDays}d left)`, color: 'emerald', days: diffDays };
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNo.trim()) {
      alert('Please enter machine registration or plant serial number.');
      return;
    }

    const payload: MachineryItem = {
      id: editingId || `machine-${Date.now()}`,
      name,
      registrationNo: registrationNo.trim().toUpperCase(),
      brandModel: brandModel.trim(),
      capacity: capacity.trim(),
      subcontractor,
      dateMobilize,
      pmaNo: pmaNo.trim().toUpperCase(),
      pmaExpiry: pmaExpiry || undefined,
      operatorName: operatorName.trim().toUpperCase(),
      operatorPhone: operatorPhone.trim(),
      operatorCidb: operatorCidb.trim(),
      operatorJkkp: operatorJkkp.trim(),
      operatorIc: operatorIc.trim(),
      status,
      photoUrl: photoUrl || undefined
    };

    if (editingId) {
      setMachinery(prev => prev.map(m => m.id === editingId ? payload : m));
    } else {
      setMachinery(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName(DEFAULT_MACHINERY_TYPES[0]);
    setRegistrationNo('');
    setBrandModel('');
    setCapacity('');
    setSubcontractor(subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setDateMobilize(new Date().toISOString().split('T')[0]);
    setPmaNo('');
    setPmaExpiry('');
    setOperatorName('');
    setOperatorPhone('');
    setOperatorCidb('');
    setOperatorJkkp('');
    setOperatorIc('');
    setStatus('ACTIVE');
    setPhotoUrl(null);
  };

  const handleOpenEdit = (m: MachineryItem) => {
    setEditingId(m.id);
    setName(m.name);
    setRegistrationNo(m.registrationNo);
    setBrandModel(m.brandModel || '');
    setCapacity(m.capacity || '');
    setSubcontractor(m.subcontractor || subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setDateMobilize(m.dateMobilize);
    setPmaNo(m.pmaNo || '');
    setPmaExpiry(m.pmaExpiry || '');
    setOperatorName(m.operatorName || '');
    setOperatorPhone(m.operatorPhone || '');
    setOperatorCidb(m.operatorCidb || '');
    setOperatorJkkp(m.operatorJkkp || '');
    setOperatorIc(m.operatorIc || '');
    setStatus(m.status || 'ACTIVE');
    setPhotoUrl(m.photoUrl || null);
    setShowModal(true);
  };

  const handleDelete = (id: string, reg: string) => {
    if (window.confirm(`Delete plant record for ${reg}?`)) {
      setMachinery(prev => prev.filter(m => m.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return machinery.filter(m => {
      const matchSearch = m.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.subcontractor && m.subcontractor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.pmaNo && m.pmaNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.operatorName && m.operatorName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'ALL' || m.name === filterType;
      const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [machinery, searchTerm, filterType, filterStatus]);

  const totalCount = machinery.length;
  const activeCount = machinery.filter(m => m.status === 'ACTIVE').length;
  const expiredPmaCount = machinery.filter(m => getPmaStatus(m.pmaExpiry).status === 'EXPIRED').length;
  const expiringPmaCount = machinery.filter(m => getPmaStatus(m.pmaExpiry).status === 'EXPIRING_SOON').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Tractor size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Plant &amp; Heavy Machinery (PMA / PMT)
              </h2>
              <p className="text-xs text-slate-400">
                DOSH / JKKP Certificate of Fitness Tracking, Mobilization &amp; Competent Operators
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Register New Machinery</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Plant &amp; Machines</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{totalCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Active Operational</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{activeCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase">PMA Expiring &lt;30d</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{expiringPmaCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Expired PMA (Barred)</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{expiredPmaCount}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by registration number, machine name, PMA, or operator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Machine Types</option>
          {DEFAULT_MACHINERY_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="BREAKDOWN">Breakdown</option>
        </select>
      </div>

      {/* Machinery Cards */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <Tractor size={36} className="mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-white uppercase">No Heavy Machinery Logged</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add site excavators, cranes, piling rigs, and equipment with valid JKKP PMA certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => {
            const pma = getPmaStatus(m.pmaExpiry);

            return (
              <div 
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                        {m.name}
                      </span>
                      <h3 className="text-base font-black text-white font-mono">
                        {m.registrationNo}
                      </h3>
                      {m.brandModel && (
                        <p className="text-[11px] text-slate-400 font-medium">{m.brandModel}</p>
                      )}
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      m.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : m.status === 'MAINTENANCE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {m.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Photo if available */}
                  {m.photoUrl && (
                    <div className="w-full h-36 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                      <img src={m.photoUrl} alt={m.registrationNo} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* PMA Certificate Box */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <FileText size={12} className="text-purple-400" />
                        JKKP PMA No:
                      </span>
                      <span className="font-mono font-bold text-white">{m.pmaNo || 'NO PMA'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">PMA Validity:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] border ${
                        pma.color === 'emerald' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : pma.color === 'amber'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                          : pma.color === 'rose'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {pma.label}
                      </span>
                    </div>
                  </div>

                  {/* Operator Info */}
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <User size={13} className="text-cyan-400" />
                      <span>Operator: {m.operatorName || 'NOT ASSIGNED'}</span>
                    </div>
                    {m.operatorPhone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                        <Phone size={11} className="text-emerald-400" />
                        <span>{m.operatorPhone}</span>
                      </div>
                    )}
                    {m.subcontractor && (
                      <p className="text-[10px] text-slate-400 font-medium">
                        Owner: {m.subcontractor}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Mobilized: {m.dateMobilize}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.registrationNo)}
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

      {/* Modal: Add / Edit Machine */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Plant & Machinery Record' : 'Register Heavy Plant / Machinery'}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Machine Type *</label>
                  <select
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    {DEFAULT_MACHINERY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Registration / Plate No *</label>
                  <input 
                    type="text"
                    placeholder="e.g. WXY 1234 / CRANE-01"
                    value={registrationNo}
                    onChange={e => setRegistrationNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Brand / Model</label>
                  <input 
                    type="text"
                    placeholder="e.g. KATO 50T / HITACHI ZX200"
                    value={brandModel}
                    onChange={e => setBrandModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor Owner</label>
                  <select
                    value={subcontractor}
                    onChange={e => setSubcontractor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="MAIN CONTRACTOR">MAIN CONTRACTOR</option>
                  </select>
                </div>
              </div>

              {/* PMA Details */}
              <div className="grid grid-cols-2 gap-3 bg-purple-950/20 p-3 rounded-2xl border border-purple-500/20">
                <div>
                  <label className="text-[10px] font-bold text-purple-300 uppercase block mb-1">DOSH / JKKP PMA No</label>
                  <input 
                    type="text"
                    placeholder="e.g. PMA 12345"
                    value={pmaNo}
                    onChange={e => setPmaNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-purple-400 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-purple-300 uppercase block mb-1">PMA Expiry Date</label>
                  <input 
                    type="date"
                    value={pmaExpiry}
                    onChange={e => setPmaExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Operator Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Operator Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. AHMAD BIN ALI"
                    value={operatorName}
                    onChange={e => setOperatorName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Operator Contact Phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. +6012-3456789"
                    value={operatorPhone}
                    onChange={e => setOperatorPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Status & Photo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Machine Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="ACTIVE">Active (Fit for Operation)</option>
                    <option value="MAINTENANCE">Maintenance / Servicing</option>
                    <option value="BREAKDOWN">Breakdown</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date Mobilized</label>
                  <input 
                    type="date"
                    value={dateMobilize}
                    onChange={e => setDateMobilize(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
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
                  <Camera size={14} className="text-cyan-400" />
                  <span>{photoUrl ? 'Change Machine Photo' : 'Upload Machine Photo'}</span>
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
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Machinery
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MachineryHeavyPlantView;
