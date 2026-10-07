import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

export const CorporateSubconPillarView: React.FC<{ project?: ProjectIdentity }> = () => {
  const [subconList] = useState<Array<{
    id: string;
    name: string;
    scope: string;
    cidbGrade: string;
    cidbExp: string;
    carInsuranceValid: boolean;
    carPolicyNo: string;
    greenCardCompliance: string;
    status: string;
  }>>([]);

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

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Subcon Vetting Status</span>
            <span className="text-xs font-black font-mono text-emerald-400">100% DILULUSKAN</span>
          </div>
        </div>
      </div>

      {/* Subcon Vetting Table */}
      <div className="space-y-3">
        {subconList.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Tiada Subkontraktor Didaftarkan Buat Masa Ini</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua subkontraktor kerja struktur, bumbung, mekanikal, dan kerja tanah perlu didaftarkan bersama sijil CIDB dan insurans CAR sebelum memasuki tapak.
            </p>
          </div>
        ) : (
          subconList.map(sub => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
                    CIDB Gred {sub.cidbGrade}
                  </span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {sub.name}
                  </span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {sub.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skop Kerja:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.scope}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Polisi Insurans CAR:</span>
                  <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {sub.carPolicyNo}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kepatuhan Kad Hijau CIDB:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.greenCardCompliance}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default CorporateSubconPillarView;
