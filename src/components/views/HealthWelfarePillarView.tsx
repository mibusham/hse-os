import React, { useState } from 'react';
import { HeartHandshake, Activity } from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

export const HealthWelfarePillarView: React.FC<{ project?: ProjectIdentity }> = () => {
  const [foggingCycleDays] = useState(8); // Limit 14 days
  const [wbgtIndex] = useState(31.2); // Wet Bulb Globe Temp °C

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
            Pematuhan Akta Piawaian Minimum Perumahan dan Penginapan Pekerja (Akta 446), kitaran semburan kabus nyamuk (Akta 130), dan pemantauan indeks tekanan haba (Heat Stress).
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Health Surveillance</span>
            <span className="text-xs font-black font-mono text-emerald-400">SIFAT SIFAR WABAK</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vector Control / Fogging */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kawalan Nyamuk Aedes (Fogging)</span>
            <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              KITARAN 14-HARI
            </span>
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            Hari Ke-{foggingCycleDays} / 14
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(foggingCycleDays / 14) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">
            Tarikh semburan seterusnya: <strong>13 Oktober 2026</strong>. Pasukan pest control berlesen.
          </p>
        </div>

        {/* Heat Stress Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Heat Stress (Indeks WBGT)</span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              AMARAN WASPADA
            </span>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {wbgtIndex}°C <span className="text-xs font-normal text-slate-400">Suhu Lokasi Terbuka</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Stesen rehat berbumbung &amp; bekalan air minuman bergaram isotonik disediakan berdekatan tapak rumah teres.
          </p>
        </div>

        {/* Akta 446 CLQ Quarters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Penginapan Pekerja (Akta 446)</span>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              PERAKUAN JTKSM
            </span>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Pekerja Ditempatkan Di CLQ Berpusat Berdaftar
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tiada kongsi haram dibina di atas tapak projek Eco Sun. Pematuhan penuh syarat bomba dan JTK.
          </p>
        </div>
      </div>

    </div>
  );
};

export default HealthWelfarePillarView;
