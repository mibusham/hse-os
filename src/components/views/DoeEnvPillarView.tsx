import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

export const DoeEnvPillarView: React.FC<{ project?: ProjectIdentity }> = () => {
  const [washTroughPumpActive] = useState(true);
  const [lastWaterTss] = useState(38); // mg/L (Limit DOE: 50 mg/L)

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
            Pemantauan pelan kawalan hakisan dan kelodak tanah (ESCP), paras TSS air pelepasan, sistem basuh tayar lori (wash trough), dan pengurusan sisa binaan 3R.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">DOE Compliance Status</span>
            <span className="text-sm font-black font-mono text-emerald-400">100% OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Grid: ESCP Live Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Silt Trap TSS Reading */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pelepasan Air Silt Trap (TSS)</span>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              DOE LIMIT &lt; 50 mg/L
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {lastWaterTss} <span className="text-xs font-normal text-slate-400">mg/L</span>
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(lastWaterTss / 50) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">Sampel diuji: Kolam Enapan Silt Trap 1 (Pelepasan Akhir)</p>
        </div>

        {/* Wash Trough / Tyre Washing Bay */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Wash Trough Jet Pump (Pintu Keluar)</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              washTroughPumpActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {washTroughPumpActive ? 'ONLINE AUTO' : 'FAULTY'}
            </span>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Sistem Pancutan Tekanan Tinggi Berfungsi
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Menghalang lori membawa tanah keluar ke Lebuhraya Bandar Cassia. Tiada kompaun PBT / JAS.
          </p>
        </div>

        {/* Scheduled Waste 180 Days Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Buangan Berjadual (SW 305/306)</span>
            <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              eSWIS REGISTERED
            </span>
          </div>
          <p className="text-xl font-black text-white font-mono mt-1">
            18 / 180 <span className="text-xs font-normal text-slate-400">Hari Penyimpanan</span>
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Minyak hitam terpakai &amp; sisa hidraulik disimpan dalam kawasan berbumbung &amp; secondary containment.
          </p>
        </div>
      </div>

    </div>
  );
};

export default DoeEnvPillarView;
