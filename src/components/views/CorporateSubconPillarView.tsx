import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, 
  Plus, Trash2, Users
} from 'lucide-react';
import type { ProjectIdentity, SubcontractorRecord } from '../../types/core';
import { ProjectService } from '../../services/projectService';

export const CorporateSubconPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [subconList, setSubconList] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [scope, setScope] = useState('KERJA_STRUKTUR_PERANCAH');
  const [cidbGrade, setCidbGrade] = useState('G7');
  const [cidbExp, setCidbExp] = useState('2027-12-31');
  const [carPolicyNo, setCarPolicyNo] = useState('');
  const [carExpiryDate, setCarExpiryDate] = useState('2027-06-30');
  const [workersCount, setWorkersCount] = useState<number>(15);
  const [status, setStatus] = useState<SubcontractorRecord['status']>('APPROVED');

  // Persistence
  useEffect(() => {
    ProjectService.saveData('subcontractors_list', subconList, project?.id);
  }, [subconList, project?.id]);

  const handleAddSubcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !carPolicyNo) return;

    const newSubcon: SubcontractorRecord = {
      id: `subcon-${Date.now()}`,
      name: name.toUpperCase(),
      scope: scope.replace(/_/g, ' '),
      cidbGrade,
      cidbExp,
      carInsuranceValid: true,
      carPolicyNo: carPolicyNo.toUpperCase(),
      carExpiryDate,
      greenCardCompliance: `100% (${workersCount}/${workersCount} Berdaftar)`,
      workersCount,
      status
    };

    setSubconList([newSubcon, ...subconList]);
    setShowAddModal(false);
    setName('');
    setCarPolicyNo('');
    setWorkersCount(15);
  };

  const handleDeleteSubcon = (id: string) => {
    setSubconList(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setSubconList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus: SubcontractorRecord['status'] = s.status === 'APPROVED' ? 'PENDING_DOCS' : 'APPROVED';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const approvedCount = subconList.filter(s => s.status === 'APPROVED').length;
  const totalWorkers = subconList.reduce((acc, curr) => acc + (curr.workersCount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Pillar 5 Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <Building2 size={12} /> Statutory Pillar 5
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Tadbir Urus Korporat &amp; Subkontraktor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Penapisan Kontraktor CIDB &amp; Polisi Insurans CAR
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pengesahan kad hijau CIDB pekerja subkontraktor (Akta 520), polisi Contractor's All Risk (CAR), Workmen Compensation (WCA/SOCSO), dan saringan kelayakan kemasukan tapak.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Daftar Subkontraktor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah Subkontraktor Berdaftar</span>
          <p className="text-3xl font-black text-white mt-1 font-mono">{subconList.length}</p>
          <span className="text-[10px] text-purple-400 font-medium">Syarikat Berdaftar CIDB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kelulusan Insurans CAR &amp; CIDB</span>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{approvedCount} / {subconList.length || 0}</p>
          <span className="text-[10px] text-emerald-400/80 font-medium">100% Polisi Aktif</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah Pekerja Berkad Hijau</span>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-cyan-400/80 font-medium">Pematuhan Penuh Akta 520 CIDB</span>
        </div>
      </div>

      {/* Subcon Vetting Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-purple-400" /> Direktori Subkontraktor Aktif Di Tapak
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Semakan Dokumen Wajib Sebelum Masuk</span>
        </div>

        {subconList.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Tiada Subkontraktor Didaftarkan Buat Masa Ini</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua subkontraktor kerja struktur, bumbung, mekanikal, dan kerja tanah perlu didaftarkan bersama sijil CIDB dan insurans CAR sebelum memasuki tapak. Klik butang di atas untuk mendaftar.
            </p>
          </div>
        ) : (
          subconList.map(sub => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20 font-mono">
                    CIDB Gred {sub.cidbGrade}
                  </span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {sub.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(sub.id)}
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                    title="Klik untuk ubah status saringan"
                  >
                    {sub.status === 'APPROVED' ? '✓ DILULUSKAN (PERMITTED)' : '⏳ DOKUMEN BELUM LENGKAP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubcon(sub.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skop Kerja Tapak:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.scope}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Polisi Insurans CAR:</span>
                  <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{sub.carPolicyNo}</span>
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">Sah shg: {sub.carExpiryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pekerja &amp; Kad Hijau:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.greenCardCompliance}</p>
                  <span className="text-[9px] text-emerald-400 font-mono">{sub.workersCount} Pekerja Sah</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Perakuan CIDB Sah:</span>
                  <p className="text-slate-200 font-mono mt-0.5">{sub.cidbExp}</p>
                  <span className="text-[9px] text-slate-500">Pusat Khidmat CIDB</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: DAFTAR SUBCON BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-400" /> Daftar Subkontraktor Baharu
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubcon} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Syarikat Subkontraktor *</label>
                <input 
                  type="text"
                  placeholder="cth: TEGUH BINA SDN BHD"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gred CIDB *</label>
                  <select 
                    value={cidbGrade}
                    onChange={e => setCidbGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
                  >
                    <option value="G1">Gred G1 (Hingga RM200k)</option>
                    <option value="G2">Gred G2 (Hingga RM500k)</option>
                    <option value="G3">Gred G3 (Hingga RM1 Juta)</option>
                    <option value="G4">Gred G4 (Hingga RM3 Juta)</option>
                    <option value="G5">Gred G5 (Hingga RM5 Juta)</option>
                    <option value="G6">Gred G6 (Hingga RM10 Juta)</option>
                    <option value="G7">Gred G7 (Tiada Had Nilai)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tarikh Luput Sijil CIDB</label>
                  <input 
                    type="date"
                    value={cidbExp}
                    onChange={e => setCidbExp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skop Kerja Di Tapak *</label>
                <select 
                  value={scope}
                  onChange={e => setScope(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
                >
                  <option value="KERJA_STRUKTUR_PERANCAH">Kerja Struktur Konkrit &amp; Perancah (Scaffolding)</option>
                  <option value="KERJA_BUMBUNG_KEKUDA">Pemasangan Kekuda Bumbung &amp; Genting</option>
                  <option value="KERJA_TANAH_PARIT">Kerja Tanah, Parit &amp; Pembentungan</option>
                  <option value="KERJA_MEKANIKAL_ELEKTRIK">Pemasangan M&amp;E dan Pendawaian Elektrik</option>
                  <option value="KERJA_IKAT_BATA_PLASTER">Ikat Bata, Lepaan Plaster &amp; Cat</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">No. Polisi Insurans CAR *</label>
                  <input 
                    type="text"
                    placeholder="cth: CAR/2026/MY-9801"
                    value={carPolicyNo}
                    onChange={e => setCarPolicyNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tarikh Luput CAR *</label>
                  <input 
                    type="date"
                    value={carExpiryDate}
                    onChange={e => setCarExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bilangan Pekerja Tapak *</label>
                  <input 
                    type="number"
                    value={workersCount}
                    onChange={e => setWorkersCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Saringan *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
                  >
                    <option value="APPROVED">APPROVED (Diluluskan)</option>
                    <option value="PENDING_DOCS">PENDING (Menunggu Dokumen)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-purple-400 hover:bg-purple-300 uppercase tracking-wider shadow-lg shadow-purple-400/20"
                >
                  Daftar &amp; Sahkan Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CorporateSubconPillarView;
