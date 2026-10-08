import React, { useState, useEffect } from 'react';
import { 
  Droplets, Plus, 
  Waves, Activity
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';
import { ProjectService } from '../../services/projectService';

interface WaterSample {
  id: string;
  date: string;
  location: string;
  tssValue: number; // DOE limit: 50 mg/L
  phValue: number; // DOE limit: 6.0 - 9.0
  turbidityNtu: number;
  status: 'COMPLIANT' | 'EXCEEDED';
  testedBy: string;
}

interface ScheduledWasteItem {
  id: string;
  code: string;
  name: string;
  quantity: string;
  dateIn: string;
  maxDays: number;
  daysRemaining: number;
  status: 'SAFE_STORAGE' | 'URGENT_DISPOSAL_180D';
}

export const DoeEnvPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [washTroughPumpActive, setWashTroughPumpActive] = useState<boolean>(true);
  
  // Water Samples State & Persistence
  const defaultSamples: WaterSample[] = [
    {
      id: 'ws-1',
      date: new Date().toISOString().split('T')[0],
      location: 'Silt Trap 1 (Pelepasan Akhir Ke Parit Monsun)',
      tssValue: 38,
      phValue: 7.2,
      turbidityNtu: 45,
      status: 'COMPLIANT',
      testedBy: 'En. Razak (In-house Turbidity Probe)'
    }
  ];

  const [samplesList, setSamplesList] = useState<WaterSample[]>(() => {
    return ProjectService.loadData<WaterSample[]>('doe_water_samples', defaultSamples);
  });

  // Scheduled Waste State & Persistence
  const defaultWaste: ScheduledWasteItem[] = [
    {
      id: 'sw-1',
      code: 'SW 305',
      name: 'Minyak Pelincir Terpakai (Spent Lubricant Oil)',
      quantity: '2 Drum (400 Liter)',
      dateIn: '2026-09-20',
      maxDays: 180,
      daysRemaining: 162,
      status: 'SAFE_STORAGE'
    },
    {
      id: 'sw-2',
      code: 'SW 410',
      name: 'Penapis Minyak Lori Terpakai (Spent Oil Filters)',
      quantity: '1 Tong (50 kg)',
      dateIn: '2026-09-25',
      maxDays: 180,
      daysRemaining: 167,
      status: 'SAFE_STORAGE'
    }
  ];

  const [wasteList, setWasteList] = useState<ScheduledWasteItem[]>(() => {
    return ProjectService.loadData<ScheduledWasteItem[]>('doe_waste_list', defaultWaste);
  });

  // Modals
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleLocation, setSampleLocation] = useState('Silt Trap 1 (Pelepasan Akhir)');
  const [sampleTss, setSampleTss] = useState<number>(35);
  const [samplePh, setSamplePh] = useState<number>(7.0);
  const [sampleTurbidity, setSampleTurbidity] = useState<number>(40);
  const [sampleTester, setSampleTester] = useState('En. Razak (SHO)');

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteCode, setWasteCode] = useState('SW 305');
  const [wasteName, setWasteName] = useState('Minyak Hidraulik Terpakai');
  const [wasteQty, setWasteQty] = useState('1 Drum (200 Liter)');

  useEffect(() => {
    ProjectService.saveData('doe_water_samples', samplesList, project?.id);
  }, [samplesList, project?.id]);

  useEffect(() => {
    ProjectService.saveData('doe_waste_list', wasteList, project?.id);
  }, [wasteList, project?.id]);

  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    const newSample: WaterSample = {
      id: `ws-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      location: sampleLocation,
      tssValue: sampleTss,
      phValue: samplePh,
      turbidityNtu: sampleTurbidity,
      status: sampleTss <= 50 ? 'COMPLIANT' : 'EXCEEDED',
      testedBy: sampleTester
    };
    setSamplesList([newSample, ...samplesList]);
    setShowSampleModal(false);
  };

  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const newWaste: ScheduledWasteItem = {
      id: `sw-${Date.now()}`,
      code: wasteCode,
      name: wasteName,
      quantity: wasteQty,
      dateIn: new Date().toISOString().split('T')[0],
      maxDays: 180,
      daysRemaining: 180,
      status: 'SAFE_STORAGE'
    };
    setWasteList([newWaste, ...wasteList]);
    setShowWasteModal(false);
  };

  const latestSample = samplesList[0] || { tssValue: 35, phValue: 7.0, status: 'COMPLIANT' };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Droplets size={12} /> Statutory Pillar 3
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Jabatan Alam Sekitar (DOE / JAS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            ESCP, Kawalan Kelodak &amp; Pelupusan Buangan Berjadual
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pemantauan pelan kawalan hakisan dan kelodak tanah (ESCP), paras TSS air pelepasan, sistem basuh tayar lori (wash trough), dan pengurusan buangan berjadual e-SWIS 180 hari.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSampleModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Ujian Air TSS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWasteModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-400 hover:bg-blue-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-400/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ e-SWIS Buangan</span>
          </button>
        </div>
      </div>

      {/* Grid: ESCP Live Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Silt Trap TSS Reading */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pelepasan Air Silt Trap (TSS)</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              latestSample.tssValue <= 50 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}>
              HAD JAS &lt; 50 mg/L
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {latestSample.tssValue} <span className="text-xs font-normal text-slate-400">mg/L</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${latestSample.tssValue <= 50 ? 'bg-emerald-400' : 'bg-rose-500'}`} 
              style={{ width: `${Math.min(100, (latestSample.tssValue / 50) * 100)}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-400">pH Air: <strong>{latestSample.phValue}</strong> (Normal 6.0 - 9.0) • {latestSample.status}</p>
        </div>

        {/* Wash Trough / Tyre Washing Bay */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wash Trough Jet Pump (Pintu Keluar)</span>
            <button
              type="button"
              onClick={() => setWashTroughPumpActive(!washTroughPumpActive)}
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                washTroughPumpActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
              }`}
              title="Klik untuk ubah status pump"
            >
              {washTroughPumpActive ? 'ONLINE AUTO ✓' : 'MAINTENANCE ⚠'}
            </button>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            {washTroughPumpActive ? 'Sistem Pancutan Tekanan Tinggi Berfungsi' : 'Pam Jet Dalam Pemeriksaan / Cuci Enapan'}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Menghalang lori membawa tanah keluar ke Lebuhraya Bandar Cassia. Menepati syarat kelulusan Pelan ESCP JAS.
          </p>
        </div>

        {/* Scheduled Waste 180 Days Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Buangan Berjadual (eSWIS)</span>
            <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              {wasteList.length} LOT AKTIF
            </span>
          </div>
          <p className="text-xl font-black text-white font-mono mt-1">
            {wasteList.length > 0 ? `${180 - (wasteList[0]?.daysRemaining || 180)} / 180` : '0 / 180'} <span className="text-xs font-normal text-slate-400">Hari Simpanan</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Minyak hitam terpakai &amp; sisa hidraulik disimpan dalam kawasan berbumbung berlesen sebelum diserah kepada Kualiti Alam.
          </p>
        </div>
      </div>

      {/* Detailed Tables: Water Samples & Scheduled Waste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Water Test Samples */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Waves size={14} /> Log Ujian Pelepasan Air Silt Trap (ESCP)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Had JAS: 50 mg/L</span>
          </div>

          <div className="space-y-2">
            {samplesList.map(s => (
              <div key={s.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block">{s.location}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Tarikh: {s.date} • pH: {s.phValue} • Diuji: {s.testedBy}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-mono font-black text-sm block ${s.tssValue <= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.tssValue} mg/L
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: e-SWIS Waste Inventory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Activity size={14} /> Inventori Buangan Berjadual (Had 180-Hari)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">e-Consignment Ready</span>
          </div>

          <div className="space-y-2">
            {wasteList.map(w => (
              <div key={w.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {w.code}
                    </span>
                    <span className="font-bold text-white">{w.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Kuantiti: {w.quantity} • Tarikh Masuk: {w.dateIn}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-xs text-amber-400 block">
                    Baki {w.daysRemaining} Hari
                  </span>
                  <span className="text-[9px] uppercase font-bold text-emerald-400">Patuh JAS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: UJIAN AIR TSS BARU */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Droplets size={18} className="text-emerald-400" /> Rekod Ujian Pelepasan Air (TSS)
              </h3>
              <button onClick={() => setShowSampleModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSample} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lokasi Persampelan *</label>
                <input 
                  type="text"
                  value={sampleLocation}
                  onChange={e => setSampleLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bacaan TSS (mg/L) *</label>
                  <input 
                    type="number"
                    value={sampleTss}
                    onChange={e => setSampleTss(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                  <span className="text-[9px] text-slate-500">Maks 50 mg/L</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nilai pH *</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={samplePh}
                    onChange={e => setSamplePh(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                  <span className="text-[9px] text-slate-500">6.0 - 9.0</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kekeruhan (NTU) *</label>
                  <input 
                    type="number"
                    value={sampleTurbidity}
                    onChange={e => setSampleTurbidity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                  <span className="text-[9px] text-slate-500">Probe NTU</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pegawai Pemeriksa *</label>
                <input 
                  type="text"
                  value={sampleTester}
                  onChange={e => setSampleTester(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSampleModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 uppercase tracking-wider shadow-lg shadow-emerald-400/20">Simpan Ujian Air</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUANGAN BERJADUAL BARU */}
      {showWasteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" /> Catat Buangan Berjadual (e-SWIS)
              </h3>
              <button onClick={() => setShowWasteModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleAddWaste} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kod Buangan Berjadual *</label>
                <select 
                  value={wasteCode}
                  onChange={e => setWasteCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400 font-mono"
                >
                  <option value="SW 305">SW 305 (Minyak Pelincir Terpakai / Spent Lubricant)</option>
                  <option value="SW 306">SW 306 (Minyak Hidraulik Terpakai)</option>
                  <option value="SW 409">SW 409 (Kain Kekotoran Minyak / Contaminated Rags)</option>
                  <option value="SW 410">SW 410 (Penapis Minyak Lori Terpakai / Filters)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keterangan Bahan Sisa *</label>
                <input 
                  type="text"
                  value={wasteName}
                  onChange={e => setWasteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kuantiti &amp; Bekas Penyimpanan *</label>
                <input 
                  type="text"
                  value={wasteQty}
                  onChange={e => setWasteQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400 font-mono"
                  placeholder="cth: 2 Drum (400 Liter)"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowWasteModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-blue-400 hover:bg-blue-300 uppercase tracking-wider shadow-lg shadow-blue-400/20">Daftar Ke e-SWIS</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoeEnvPillarView;
