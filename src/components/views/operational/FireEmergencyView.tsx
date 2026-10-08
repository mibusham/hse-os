import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Plus, Search, 
  Trash2, Edit3, PhoneCall, Siren
} from 'lucide-react';
import type { ProjectIdentity, FireExtinguisherRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';

interface FireEmergencyViewProps {
  project?: ProjectIdentity;
}

export const FireEmergencyView: React.FC<FireEmergencyViewProps> = ({ project }) => {
  const [extinguishers, setExtinguishers] = useState<FireExtinguisherRecord[]>(() => {
    return ProjectService.loadData<FireExtinguisherRecord[]>('fire_extinguishers_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [tagNo, setTagNo] = useState('');
  const [cylinderType, setCylinderType] = useState<FireExtinguisherRecord['cylinderType']>('ABC Powder');
  const [capacity, setCapacity] = useState('9 KG');
  const [location, setLocation] = useState('');
  const [bombaExpiry, setBombaExpiry] = useState('2027-06-30');
  const [gaugeStatus, setGaugeStatus] = useState<FireExtinguisherRecord['gaugeStatus']>('NORMAL');
  const [physicalStatus, setPhysicalStatus] = useState<FireExtinguisherRecord['physicalStatus']>('GOOD');
  const [lastInspectionDate, setLastInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('Safety & Health Officer');

  // Persistence
  useEffect(() => {
    ProjectService.saveData('fire_extinguishers_list', extinguishers, project?.id);
  }, [extinguishers, project?.id]);

  const getBombaStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: 'BOMBA Expired', color: 'rose', days: diffDays };
    }
    if (diffDays <= 30) {
      return { status: 'EXPIRING_SOON', label: `Expires in ${diffDays}d`, color: 'amber', days: diffDays };
    }
    return { status: 'VALID', label: `Valid (${diffDays}d left)`, color: 'emerald', days: diffDays };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNo.trim() || !location.trim()) {
      alert('Please fill in Tag number and location.');
      return;
    }

    const payload: FireExtinguisherRecord = {
      id: editingId || `fe-${Date.now()}`,
      tagNo: tagNo.trim().toUpperCase(),
      cylinderType,
      capacity: capacity.trim(),
      location: location.trim(),
      bombaExpiry,
      gaugeStatus,
      physicalStatus,
      lastInspectionDate,
      inspectorName: inspectorName.trim()
    };

    if (editingId) {
      setExtinguishers(prev => prev.map(f => f.id === editingId ? payload : f));
    } else {
      setExtinguishers(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTagNo('');
    setCylinderType('ABC Powder');
    setCapacity('9 KG');
    setLocation('');
    setBombaExpiry('2027-06-30');
    setGaugeStatus('NORMAL');
    setPhysicalStatus('GOOD');
  };

  const handleOpenEdit = (f: FireExtinguisherRecord) => {
    setEditingId(f.id);
    setTagNo(f.tagNo);
    setCylinderType(f.cylinderType);
    setCapacity(f.capacity);
    setLocation(f.location);
    setBombaExpiry(f.bombaExpiry);
    setGaugeStatus(f.gaugeStatus);
    setPhysicalStatus(f.physicalStatus);
    setLastInspectionDate(f.lastInspectionDate);
    setInspectorName(f.inspectorName);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete extinguisher record?')) {
      setExtinguishers(prev => prev.filter(f => f.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return extinguishers.filter(f => {
      return f.tagNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cylinderType.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [extinguishers, searchTerm]);

  const validCount = extinguishers.filter(f => getBombaStatus(f.bombaExpiry).status === 'VALID').length;
  const expiredCount = extinguishers.filter(f => getBombaStatus(f.bombaExpiry).status === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Fire Protection &amp; Emergency Readiness
              </h2>
              <p className="text-xs text-slate-400">
                Fire Extinguisher Register, BOMBA Certification Expiry &amp; Emergency Hotlines
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Register Extinguisher</span>
        </button>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Siren size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">BOMBA Hotline</span>
            <span className="text-sm font-black font-mono text-white">999 / 112</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <PhoneCall size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Police Hotline</span>
            <span className="text-sm font-black font-mono text-white">999</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PhoneCall size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Gov Hospital</span>
            <span className="text-sm font-black font-mono text-white">999 (Ambulans)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <PhoneCall size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">TNB Breakdown</span>
            <span className="text-sm font-black font-mono text-white">15454</span>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Fire Extinguishers</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{extinguishers.length}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">BOMBA Certified &amp; Valid</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{validCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">BOMBA Expired</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{expiredCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by tag number, location, or cylinder type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Extinguishers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-4 py-3.5">FE Tag Number</th>
                <th className="px-4 py-3.5">Type &amp; Weight</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Pressure Gauge</th>
                <th className="px-4 py-3.5">BOMBA Expiry</th>
                <th className="px-4 py-3.5">Physical Condition</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(fe => {
                const bStatus = getBombaStatus(fe.bombaExpiry);

                return (
                  <tr key={fe.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-orange-400">
                      {fe.tagNo}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white">
                      {fe.cylinderType} ({fe.capacity})
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-300">
                      {fe.location}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        fe.gaugeStatus === 'NORMAL' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {fe.gaugeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        bStatus.color === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {fe.bombaExpiry} ({bStatus.label})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {fe.physicalStatus}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(fe)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(fe.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Fire Extinguisher' : 'Register Fire Extinguisher'}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tag / Serial No *</label>
                  <input 
                    type="text"
                    placeholder="e.g. FE-L1-01"
                    value={tagNo}
                    onChange={e => setTagNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-orange-400 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cylinder Type</label>
                  <select
                    value={cylinderType}
                    onChange={e => setCylinderType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
                  >
                    <option value="ABC Powder">ABC Dry Powder</option>
                    <option value="CO2">Carbon Dioxide (CO2)</option>
                    <option value="Water">Water (AFFF)</option>
                    <option value="Foam">Chemical Foam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Capacity</label>
                  <input 
                    type="text"
                    placeholder="e.g. 9 KG / 2 KG"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Location *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Site Office / Zone A"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">BOMBA Expiry Date</label>
                  <input 
                    type="date"
                    value={bombaExpiry}
                    onChange={e => setBombaExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gauge Pressure</label>
                  <select
                    value={gaugeStatus}
                    onChange={e => setGaugeStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="NORMAL">NORMAL (Green Zone)</option>
                    <option value="LOW">LOW (Discharged)</option>
                    <option value="OVERCHARGED">OVERCHARGED</option>
                  </select>
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
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Extinguisher
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FireEmergencyView;
