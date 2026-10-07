import React, { useState } from 'react';
import { 
  FileCheck, CheckCircle2, 
  Clock, AlertTriangle, Plus, 
  Layers, HardHat
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

interface PTWRecord {
  id: string;
  ptwNo: string;
  activityType: 'HOT_WORK' | 'WORKING_AT_HEIGHT' | 'LIFTING' | 'EXCAVATION' | 'CONFINED_SPACE';
  locationZone: string;
  subcontractor: string;
  startDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_APPROVAL' | 'CLOSED';
  authorizedBy: string;
  riskPrecautions: string[];
}

interface InspectionRecord {
  id: string;
  itemType: 'SCAFFOLDING_FRAME' | 'MOBILE_CRANE_BACKHOE' | 'ELECTRICAL_DB' | 'ROOF_SAFETY_LINE';
  tagNo: string;
  location: string;
  inspectorName: string;
  lastInspectionDate: string;
  nextDueDate: string;
  status: 'SAFE_GREEN_TAG' | 'REJECT_RED_TAG' | 'PENDING_CHECK';
}

export const DoshOpsPillarView: React.FC<{ project?: ProjectIdentity }> = () => {
  const [activeTab, setActiveTab] = useState<'PTW' | 'INSPECTIONS' | 'MANHOURS'>('PTW');

  // Clean Real-Data States (Zero Dummy Data)
  const [ptwList, setPtwList] = useState<PTWRecord[]>([]);

  // Statutory 7-Day Inspection Records (OSHA 1994 Pindaan 2022)
  const [inspectionList] = useState<InspectionRecord[]>([]);

  // Manhours Calculations (DOSH Monthly Statutory formula)
  const [workerCount, setWorkerCount] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const totalMonthlyManHours = workerCount * workDays * hoursPerDay;

  // New PTW Modal State
  const [showNewPtwModal, setShowNewPtwModal] = useState(false);
  const [newActivity, setNewActivity] = useState<PTWRecord['activityType']>('WORKING_AT_HEIGHT');
  const [newSubcon, setNewSubcon] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleCreatePTW = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcon || !newLocation) return;
    const newRecord: PTWRecord = {
      id: `ptw-${Date.now()}`,
      ptwNo: `PTW-2026-${newActivity.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      activityType: newActivity,
      locationZone: newLocation,
      subcontractor: newSubcon.toUpperCase(),
      startDate: new Date().toISOString().split('T')[0],
      validUntil: '19:00 Today',
      status: 'ACTIVE',
      authorizedBy: 'SHO / SSS Digital Endorsement',
      riskPrecautions: ['HIRADC diterangkan dalam taklimat toolbox', 'Penguatkuasaan 100% PPE mandatori', 'Kawasan kerja dibariskan pita amaran'],
    };
    setPtwList([newRecord, ...ptwList]);
    setShowNewPtwModal(false);
    setNewSubcon('');
    setNewLocation('');
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
            <span className="text-xs font-mono text-slate-400 font-bold">DOSH / JKKP Statutory &amp; Site Ops</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Operasi Kawalan Risiko &amp; Pematuhan OSHA 1994 (Pindaan 2022) / CDM 2024
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pengurusan permit kerja berisiko tinggi (PTW), rekod perancah pusingan 7-hari berkanun, integriti kekuda bumbung, dan rekod jam kerja selamat (A × B × C = D).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNewPtwModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Keluarkan PTW Baru</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'PTW', label: 'Permit To Work (PTW)', count: ptwList.length, icon: FileCheck },
          { id: 'INSPECTIONS', label: 'Pemeriksaan 7-Hari (OSHA 1994 Pindaan 2022)', count: inspectionList.length, icon: Layers },
          { id: 'MANHOURS', label: 'Safe Man-Hours (Formula A×B×C=D)', count: null, icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
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
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PTW Aktif Hari Ini</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{ptwList.filter(p => p.status === 'ACTIVE').length}</p>
              <span className="text-[10px] text-slate-500">Kebenaran sah sehingga 19:00</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PTW Tamat / Perlu Pembaharuan</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{ptwList.filter(p => p.status === 'EXPIRED').length}</p>
              <span className="text-[10px] text-rose-400/80">Kerja wajib dihentikan serta merta</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pengesah Ditauliahkan (SHO / SSS)</span>
              <p className="text-sm font-bold text-white mt-1.5 truncate">Ir. Razak (Green Book)</p>
              <span className="text-[10px] text-slate-500">Pematuhan Seksyen 29 Akta OSHA 1994</span>
            </div>
          </div>

          {/* PTW Data List */}
          <div className="space-y-3">
            {ptwList.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <FileCheck size={36} className="text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Tiada Permit To Work (PTW) Aktif Buat Masa Ini</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Semua kerja harian memerlukan permit khas. Klik butang <strong>"Keluarkan PTW Baru"</strong> di atas untuk memulakan permohonan permit kerja sebenar tapak.
                </p>
              </div>
            ) : (
              ptwList.map(ptw => (
                <div 
                  key={ptw.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-3"
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
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {ptw.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Sah: {ptw.validUntil}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lokasi Tapak:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{ptw.locationZone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subkontraktor:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{ptw.subcontractor}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Langkah Kawalan Wajib (Mandatory Precautions):</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ptw.riskPrecautions.map((pre, idx) => (
                        <span key={idx} className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          {pre}
                        </span>
                      ))}
                    </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pemeriksaan Perancah &amp; Struktur 7-Hari (OSHA 1994 Pindaan 2022)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Semua struktur perancah kerja wajib diperiksa oleh Orang Yang Kompeten (Designated Person / Scaffolder) sekurang-kurangnya sekali setiap 7 hari atau selepas cuaca buruk.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {inspectionList.length === 0 ? (
              <div className="col-span-full bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Layers size={36} className="text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Tiada Tag Pemeriksaan 7-Hari Direkodkan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Belum ada log perancah atau jentera direkodkan. Rekod pemeriksaan sebenar tapak boleh ditambah mengikut kitaran mingguan.
                </p>
              </div>
            ) : (
              inspectionList.map(insp => (
                <div key={insp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      {insp.tagNo}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      insp.status === 'SAFE_GREEN_TAG' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                    }`}>
                      {insp.status === 'SAFE_GREEN_TAG' ? 'GREEN TAG (SELAMAT)' : 'RED TAG (STOP WORK)'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{insp.itemType.replace(/_/g, ' ')}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{insp.location}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Pemeriksaan Terakhir:</span>
                      <span className="font-mono text-slate-300">{insp.lastInspectionDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tarikh Luput (7 Hari):</span>
                      <span className={`font-mono font-bold ${insp.status === 'REJECT_RED_TAG' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {insp.nextDueDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1">
                      <span>Pemeriksa:</span>
                      <span className="text-slate-300 font-medium truncate max-w-[140px]">{insp.inspectorName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAFE MAN-HOURS CALCULATOR */}
      {activeTab === 'MANHOURS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              Formula Statutori DOSH: Rekod Jam Kerja Selamat (Safe Man-Hours)
            </h3>
            <p className="text-xs text-slate-400">
              Pengiraan rasmi bulanan DOSH mengikut formula: <strong>A (Bilangan Pekerja) × B (Hari Bekerja Sebulan) × C (Jam Bekerja Sehari) = D (Jumlah Jam Bekerja)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl items-center">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                A. Jumlah Pekerja (Avg/Day)
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
                B. Hari Bekerja (Days/Mo)
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
                C. Jam Sehari (Hours/Day)
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
                D. Jumlah Man-Hours Bulanan
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {totalMonthlyManHours.toLocaleString()}
              </p>
              <span className="text-[9px] text-slate-400 font-bold">Jam Bekerja Selamat</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KELUARKAN PTW BARU */}
      {showNewPtwModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-rose-400" /> Keluarkan Permit To Work (PTW) Baharu
              </h3>
              <button 
                onClick={() => setShowNewPtwModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleCreatePTW} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jenis Aktiviti Berisiko Tinggi *</label>
                <select 
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400"
                >
                  <option value="WORKING_AT_HEIGHT">WORKING AT HEIGHT (Kerja Di Tempat Tinggi / Kekuda Bumbung)</option>
                  <option value="HOT_WORK">HOT WORK (Kimpalan / Oxy-Cutting)</option>
                  <option value="EXCAVATION">EXCAVATION (Pengorekan Parit / Longkang Utama)</option>
                  <option value="LIFTING">HEAVY LIFTING (Pemasangan Konkrit Pratuang / Mobile Crane)</option>
                  <option value="CONFINED_SPACE">CONFINED SPACE (Ruang Terkurung / Manhole Kumbahan)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Subkontraktor *</label>
                <input 
                  type="text"
                  placeholder="cth: SYARIKAT PEMBINAAN MAJU JAYA SDN BHD"
                  value={newSubcon}
                  onChange={e => setNewSubcon(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-400 uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lokasi Khusus Di Tapak (Lot / Zon) *</label>
                <input 
                  type="text"
                  placeholder="cth: Unit 21 - 35, Fasa 2A (Pemasangan Bumbung)"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
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
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-rose-400 hover:bg-rose-300 uppercase tracking-wider shadow-lg shadow-rose-400/20"
                >
                  Sahkan &amp; Endorse PTW
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
