import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

export const ReportsAnalyticsPillarView: React.FC<{ project: ProjectIdentity }> = ({ project }) => {
  const [selectedMonth] = useState('Oktober 2026');

  return (
    <div className="space-y-6">
      
      {/* Analytics Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <FileText size={12} /> Analytics &amp; Statutory Reports
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Laporan Bulanan Keselamatan DOSH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Penjana Laporan Bulanan SHO &amp; Analisis Kemalangan Sifar (Zero LTI)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Format laporan bulanan berkanun mengikut kehendak Seksyen 29 Akta OSHA 1994, audit bulanan Jawatankuasa Keselamatan &amp; Kesihatan (SHC), dan metrik LTI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
          >
            <Download size={16} />
            <span>Cetak / Eksport PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Report Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ringkasan Eksekutif Bulanan</span>
            <h3 className="text-sm font-bold text-white mt-0.5">{selectedMonth} - {project.shortTitle || project.projectName}</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-full text-emerald-400 border border-slate-700">
            KADAR KEMALANGAN: 0.00
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TOTAL MAN-HOURS</span>
            <span className="text-lg font-bold text-white">29,120</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">LOST TIME INJURY (LTI)</span>
            <span className="text-lg font-bold text-emerald-400">0</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">FIRST AID CASES</span>
            <span className="text-lg font-bold text-white">1 (Minor)</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">PTW ISSUED</span>
            <span className="text-lg font-bold text-white">18</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportsAnalyticsPillarView;
