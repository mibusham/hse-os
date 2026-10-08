import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Plus, 
  Trash2, Wind
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';
import { ProjectService } from '../../services/projectService';

interface FoggingRecord {
  id: string;
  date: string;
  chemical: string;
  contractor: string;
  area: string;
  nextDueDate: string;
  status: 'COMPLETED';
}

export const HealthWelfarePillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  // Fogging State & Persistence
  const defaultFogging: FoggingRecord[] = [
    {
      id: 'fog-1',
      date: '2026-09-30',
      chemical: 'Resigen & Abate 1SG Larvicide',
      contractor: 'BioVector Pest Control Sdn Bhd (Berlesen)',
      area: 'Longkang Fasa 2A & Tapak Kerja Eco Sun',
      nextDueDate: '2026-10-14',
      status: 'COMPLETED'
    }
  ];

  const [foggingList, setFoggingList] = useState<FoggingRecord[]>(() => {
    return ProjectService.loadData<FoggingRecord[]>('health_fogging_list', defaultFogging);
  });

  // Heat Stress & WBGT State
  const [wbgtIndex, setWbgtIndex] = useState<number>(31.2);
  const [showFoggingModal, setShowFoggingModal] = useState(false);
  const [fogChem, setFogChem] = useState('Resigen & Abate 1SG');
  const [fogContractor, setFogContractor] = useState('BioVector Pest Control (Berlesen)');
  const [fogArea, setFogArea] = useState('Zon Rumah Teres & Parit Earth Drain');

  // CLQ Akta 446
  const [clqResidents, setClqResidents] = useState<number>(45);
  const [clqCertValid, setClqCertValid] = useState<boolean>(true);

  useEffect(() => {
    ProjectService.saveData('health_fogging_list', foggingList, project?.id);
  }, [foggingList, project?.id]);

  // Calculations for Fogging Cycle
  const latestFog = foggingList[0];
  const daysSinceLastFog = latestFog ? Math.floor((Date.now() - new Date(latestFog.date).getTime()) / (1000 * 60 * 60 * 24)) : 8;
  const cycleRemaining = Math.max(0, 14 - daysSinceLastFog);

  // Heat Risk Level
  let heatRiskLabel = 'WASPADA (SEDERHANA)';
  let heatRiskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  let heatAdvice = 'Bekalan air sejuk & minuman garam rehidrasi di stesen rehat berbumbung.';

  if (wbgtIndex < 28) {
    heatRiskLabel = 'NORMAL (RENDAH)';
    heatRiskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    heatAdvice = 'Kerja luar berjalan seperti biasa. Minum air mencukupi.';
  } else if (wbgtIndex >= 32.5) {
    heatRiskLabel = 'BAHAYA (TINGGI - MANDATORI REHAT)';
    heatRiskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    heatAdvice = 'Wajib rehat 15 minit setiap jam bagi pekerja kekuda bumbung & kerja terbuka.';
  }

  const handleAddFogging = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + 14);
    const nextDueStr = nextDue.toISOString().split('T')[0];

    const newRecord: FoggingRecord = {
      id: `fog-${Date.now()}`,
      date: todayStr,
      chemical: fogChem,
      contractor: fogContractor,
      area: fogArea,
      nextDueDate: nextDueStr,
      status: 'COMPLETED'
    };

    setFoggingList([newRecord, ...foggingList]);
    setShowFoggingModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Pillar 4 Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1.5">
              <HeartHandshake size={12} /> Statutory Pillar 4
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Kesihatan Pekerja, CLQ Akta 446 &amp; Vektor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Kebajikan Pekerja, Kawalan Vektor Aedes &amp; Tekanan Haba
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pematuhan Akta Piawaian Minimum Perumahan dan Penginapan Pekerja (Akta 446), kitaran semburan kabus nyamuk (Akta 130), dan pemantauan indeks tekanan haba (Heat Stress WBGT).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFoggingModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-400 hover:bg-blue-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-400/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Rekod Semburan Fogging</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vector Control / Fogging Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kawalan Vektor Aedes (Akta 130)</span>
            <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              KITARAN 14-HARI
            </span>
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            Hari Ke-{daysSinceLastFog} / 14
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (daysSinceLastFog / 14) * 100)}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Baki <strong>{cycleRemaining} hari</strong> sebelum semburan seterusnya ({latestFog?.nextDueDate || '14 Okt 2026'}).
          </p>
        </div>

        {/* Heat Stress Index Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Heat Stress (Indeks WBGT)</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${heatRiskColor}`}>
              {heatRiskLabel}
            </span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-amber-400 font-mono mt-1">
              {wbgtIndex.toFixed(1)}°C
            </p>
            <span className="text-xs text-slate-400 font-medium">Suhu Basah Terbuka</span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="range"
              min="26"
              max="35"
              step="0.1"
              value={wbgtIndex}
              onChange={e => setWbgtIndex(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            {heatAdvice}
          </p>
        </div>

        {/* Akta 446 CLQ Quarters Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Penginapan Pekerja (Akta 446)</span>
            <button
              type="button"
              onClick={() => setClqCertValid(!clqCertValid)}
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                clqCertValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {clqCertValid ? 'PERAKUAN JTKSM ✓' : 'MENUNGGU KELULUSAN'}
            </button>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Pekerja Ditempatkan Di CLQ Berpusat Berdaftar
          </p>
          <div className="flex items-center justify-between text-xs pt-1 font-mono text-slate-300">
            <span>Kapasiti Pekerja:</span>
            <div className="flex items-center gap-1">
              <input 
                type="number"
                value={clqResidents}
                onChange={e => setClqResidents(Number(e.target.value))}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-right font-bold text-emerald-400 font-mono text-xs"
              />
              <span className="text-slate-400">Orang</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Tiada kongsi haram di atas tapak. Pematuhan penuh syarat bomba dan Jabatan Tenaga Kerja Semenanjung Malaysia.
          </p>
        </div>
      </div>

      {/* Fogging Log History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Wind size={14} /> Lejar Semburan Thermal Fogging &amp; Abate (Kawalan Denggi)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Pemeriksaan KKM / Majlis Daerah</span>
        </div>

        <div className="space-y-2">
          {foggingList.map(fog => (
            <div key={fog.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{fog.area}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {fog.chemical}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Tarikh Semburan: {fog.date} • Kontraktor: {fog.contractor}
                </span>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Jadual Seterusnya:</span>
                  <span className="font-mono font-bold text-emerald-400">{fog.nextDueDate}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setFoggingList(prev => prev.filter(f => f.id !== fog.id))}
                  className="p-1 rounded text-slate-500 hover:text-rose-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: REKOD FOGGING BARU */}
      {showFoggingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wind size={18} className="text-blue-400" /> Rekod Semburan Fogging Baharu
              </h3>
              <button onClick={() => setShowFoggingModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleAddFogging} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kawasan Semburan *</label>
                <input 
                  type="text"
                  value={fogArea}
                  onChange={e => setFogArea(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bahan Kimia / Larvasid *</label>
                <input 
                  type="text"
                  value={fogChem}
                  onChange={e => setFogChem(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Syarikat Kawalan Vektor Berlesen *</label>
                <input 
                  type="text"
                  value={fogContractor}
                  onChange={e => setFogContractor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFoggingModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-blue-400 hover:bg-blue-300 uppercase tracking-wider shadow-lg shadow-blue-400/20">Simpan Log Fogging</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HealthWelfarePillarView;
