import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Receipt, Plus, Search, AlertOctagon, Camera, 
  Trash2, Edit3
} from 'lucide-react';
import type { ProjectIdentity, SitePenaltyRecord, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';
import { resizeImage } from '../../../utils/imageHelpers';

interface SitePenaltyViewProps {
  project?: ProjectIdentity;
}

export const SitePenaltyView: React.FC<SitePenaltyViewProps> = ({ project }) => {
  const [penalties, setPenalties] = useState<SitePenaltyRecord[]>(() => {
    return ProjectService.loadData<SitePenaltyRecord[]>('site_penalties_list', []);
  });

  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubcon, setFilterSubcon] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subcon, setSubcon] = useState(subcontractors[0]?.name || 'MAIN CONTRACTOR');
  const [amount, setAmount] = useState('200');
  const [demeritPoints, setDemeritPoints] = useState('5');
  const [description, setDescription] = useState('');
  const [issuedBy, setIssuedBy] = useState('Safety & Health Officer');
  const [status, setStatus] = useState<SitePenaltyRecord['status']>('ISSUED');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('site_penalties_list', penalties, project?.id);
  }, [penalties, project?.id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file, 1024, 0.8);
      setPhotoUrl(base64);
    } catch (err) {
      alert('Failed to upload penalty photo evidence');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter reason / violation description.');
      return;
    }

    const payload: SitePenaltyRecord = {
      id: editingId || `penalty-${Date.now()}`,
      date,
      subcon,
      amount: parseFloat(amount) || 0,
      demeritPoints: parseInt(demeritPoints, 10) || 0,
      description: description.trim(),
      issuedBy: issuedBy.trim(),
      status,
      photoUrl: photoUrl || undefined
    };

    if (editingId) {
      setPenalties(prev => prev.map(p => p.id === editingId ? payload : p));
    } else {
      setPenalties(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setSubcon(subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setAmount('200');
    setDemeritPoints('5');
    setDescription('');
    setStatus('ISSUED');
    setPhotoUrl(null);
  };

  const handleOpenEdit = (p: SitePenaltyRecord) => {
    setEditingId(p.id);
    setDate(p.date);
    setSubcon(p.subcon);
    setAmount(String(p.amount));
    setDemeritPoints(String(p.demeritPoints));
    setDescription(p.description);
    setIssuedBy(p.issuedBy);
    setStatus(p.status);
    setPhotoUrl(p.photoUrl || null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this site penalty ticket?')) {
      setPenalties(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return penalties.filter(p => {
      const matchSearch = p.subcon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubcon = filterSubcon === 'ALL' || p.subcon === filterSubcon;
      return matchSearch && matchSubcon;
    });
  }, [penalties, searchTerm, filterSubcon]);

  const totalAmount = penalties.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDemerit = penalties.reduce((acc, curr) => acc + curr.demeritPoints, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Receipt size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Site Penalties &amp; Demerit Compound Tracking
              </h2>
              <p className="text-xs text-slate-400">
                Non-Compliance Violations, Subcontractor Demerit Deductions &amp; Photo Slips
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Issue Penalty Ticket</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets Issued</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{penalties.length}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Cumulative Fines</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">RM {totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Total Demerit Points</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{totalDemerit} pts</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search penalties by subcontractor or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-400"
          />
        </div>

        <select
          value={filterSubcon}
          onChange={e => setFilterSubcon(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Subcontractors</option>
          {subcontractors.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <AlertOctagon size={36} className="mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-white uppercase">No Penalty Tickets</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Zero site safety compounds issued. Subcontractors are adhering to safety protocols.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div 
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-rose-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
                      {p.subcon}
                    </span>
                    <h3 className="text-base font-black text-white font-mono mt-0.5">
                      RM {p.amount.toLocaleString()}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-400">
                      Demerit: {p.demeritPoints} Points
                    </p>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    p.status === 'ISSUED' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : p.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>

                {p.photoUrl && (
                  <div className="w-full h-32 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                    <img src={p.photoUrl} alt="Violation" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-xs text-white font-medium">
                  {p.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono">
                  {p.date} • Issued by {p.issuedBy}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Penalty Ticket' : 'Issue Site Penalty Ticket'}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor *</label>
                  <select
                    value={subcon}
                    onChange={e => setSubcon(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="MAIN CONTRACTOR">MAIN CONTRACTOR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fine Amount (RM) *</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-rose-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Demerit Points</label>
                  <input 
                    type="number"
                    value={demeritPoints}
                    onChange={e => setDemeritPoints(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Violation Description *</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Failure to barricade deep excavation pit at Zone C."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ticket Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="ISSUED">Issued (Pending Deduction)</option>
                    <option value="PAID">Paid / Deducted</option>
                    <option value="DISPUTED">Disputed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Issued By</label>
                  <input 
                    type="text"
                    value={issuedBy}
                    onChange={e => setIssuedBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                  <Camera size={14} className="text-rose-400" />
                  <span>{photoUrl ? 'Change Violation Photo' : 'Upload Evidence Photo'}</span>
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
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Confirm Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SitePenaltyView;
