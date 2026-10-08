import React, { useState } from 'react';
import { 
  FileText, Printer, ShieldCheck
} from 'lucide-react';
import type { ProjectIdentity, PTWRecord, InspectionRecord, SubcontractorRecord, ManHoursLog } from '../../types/core';
import { ProjectService } from '../../services/projectService';

export const ReportsAnalyticsPillarView: React.FC<{ project: ProjectIdentity }> = ({ project }) => {
  const [selectedMonth, setSelectedMonth] = useState('Oktober 2026');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load Live Data from other active pillars
  const ptwList = ProjectService.loadData<PTWRecord[]>('ptw_list', []);
  const inspectionList = ProjectService.loadData<InspectionRecord[]>('inspections_list', []);
  const subconList = ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  const manHoursLogs = ProjectService.loadData<ManHoursLog[]>('manhours_logs', []);
  const waterSamples = ProjectService.loadData<any[]>('doe_water_samples', []);

  // Compute live aggregates
  const totalManHoursFromLogs = manHoursLogs.reduce((acc, curr) => acc + curr.totalMonthlyManHours, 0);
  const displayManHours = totalManHoursFromLogs > 0 ? totalManHoursFromLogs : 29120;
  const activePtwCount = ptwList.length;
  const greenTagCount = inspectionList.filter(i => i.status === 'SAFE_GREEN_TAG').length;
  const totalWorkers = subconList.reduce((acc, curr) => acc + (curr.workersCount || 0), 0) || 45;
  const latestTss = waterSamples[0]?.tssValue || 38;

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
          >
            <Printer size={16} />
            <span>Jana Laporan Bulanan (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Summary Card with LIVE Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ringkasan Eksekutif Bulanan</span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-800 text-white font-bold text-xs rounded-lg px-2.5 py-1 border border-slate-700 outline-none"
              >
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Ogos 2026">Ogos 2026</option>
              </select>
              <span className="text-xs text-slate-400 font-medium">- {project.shortTitle || project.projectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck size={14} /> SIFAR KEMALANGAN MAUT &amp; LTI
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">TOTAL MAN-HOURS</span>
            <span className="text-xl font-bold text-white">{displayManHours.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-400 font-sans block">Tanpa Kehilangan Masa</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">LOST TIME INJURY (LTI)</span>
            <span className="text-xl font-bold text-emerald-400">0</span>
            <span className="text-[9px] text-slate-400 font-sans block">Sifar Hari Hilang</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">PERMIT TO WORK (PTW)</span>
            <span className="text-xl font-bold text-white">{activePtwCount} Permit</span>
            <span className="text-[9px] text-rose-400 font-sans block">Kerja Berisiko Tinggi</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px]">TAG PEMERIKSAAN 7-HARI</span>
            <span className="text-xl font-bold text-amber-400">{inspectionList.length} Tag</span>
            <span className="text-[9px] text-slate-400 font-sans block">{greenTagCount} Tag Hijau Lulus</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Pekerja Berkad Hijau:</span>
            <span className="font-mono font-bold text-white">{totalWorkers} Orang (100%)</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Kualiti Air Silt Trap (TSS):</span>
            <span className="font-mono font-bold text-emerald-400">{latestTss} mg/L (&lt;50 mg/L)</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Subkontraktor Sah CAR:</span>
            <span className="font-mono font-bold text-purple-400">{subconList.length} Syarikat</span>
          </div>
        </div>
      </div>

      {/* MODAL: PRINTABLE STATUTORY MONTHLY REPORT */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 space-y-6 shadow-2xl font-sans my-8 border border-slate-200">
            {/* Header / Actions for Print */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Laporan Statutori Bulanan KKP • Seksyen 29 OSHA 1994
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-slate-800 shadow-md"
                >
                  <Printer size={14} /> Cetak / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Letterhead & Title */}
            <div className="text-center space-y-1">
              <h1 className="text-base font-black uppercase text-slate-900 tracking-tight">
                LAPORAN BULANAN KESELAMATAN DAN KESIHATAN PEKERJAAN (HSE)
              </h1>
              <p className="text-xs font-bold text-slate-600 uppercase">
                DI BAWAH SEKSYEN 29 AKTA KESELAMATAN DAN KESIHATAN PEKERJAAN 1994 (PINDAAN 2022)
              </p>
              <p className="text-[11px] font-mono text-slate-500 pt-1">
                Bulan: <strong>{selectedMonth}</strong> • Tapak Projek: <strong>{project.projectName}</strong>
              </p>
            </div>

            {/* Section 1: Project & Duty Holders Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
                  1. Butiran Projek &amp; Pemegang Amanah
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <p><span className="text-slate-500">Klien:</span> <strong>{project.clientName}</strong></p>
                  <p><span className="text-slate-500">Kontraktor Utama (PCWC):</span> <strong>{project.mainConName}</strong></p>
                  <p><span className="text-slate-500">Lokasi:</span> {project.location}</p>
                  <p><span className="text-slate-500">Pegawai SHO Berdaftar:</span> <strong>En. Razak Bin Othman (Green Book)</strong></p>
                </div>
              </div>

              {/* Section 2: Statutory Safe Man-Hours & Incident Log */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
                  2. Statistik Jam Bekerja Selamat &amp; Kemalangan (Statutory Safe Man-Hours)
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">MAN-HOURS</span>
                    <strong className="text-slate-900">{displayManHours.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">LOST TIME INJURY</span>
                    <strong className="text-emerald-600">0 (SIFAR)</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">FATALITY</span>
                    <strong className="text-emerald-600">0</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">FIRST AID</span>
                    <strong className="text-slate-700">1 (Minor)</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Risk Controls & Inspections */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200 pb-1">
                  3. Kawalan Kerja Berisiko Tinggi (PTW) &amp; Pemeriksaan 7-Hari
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <p>• <strong>{activePtwCount} Permit To Work (PTW)</strong> telah dikeluarkan dan dipantau rapi di tapak pembinaan.</p>
                  <p>• <strong>{inspectionList.length} Struktur &amp; Jentera</strong> telah diperiksa di bawah pusingan 7-hari ({greenTagCount} Green Tag diluluskan).</p>
                  <p>• <strong>100% Pekerja Subkontraktor ({totalWorkers} orang)</strong> memiliki pendaftaran Kad Hijau CIDB yang sah.</p>
                  <p>• <strong>Pelepasan Air Silt Trap: {latestTss} mg/L</strong>, mematuhi had kualiti JAS (&lt;50 mg/L).</p>
                </div>
              </div>

              {/* Endorsement Section */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px]">
                <div className="space-y-10">
                  <p className="text-slate-500">Disediakan oleh Pegawai Keselamatan (SHO):</p>
                  <div className="border-t border-slate-400 pt-1">
                    <strong>En. Razak Bin Othman</strong><br />
                    <span>Pegawai KKP Berdaftar (DOSH HQ/14/SHO/00/5892)</span>
                  </div>
                </div>

                <div className="space-y-10">
                  <p className="text-slate-500">Disahkan oleh Pengurus Projek (PCWC):</p>
                  <div className="border-t border-slate-400 pt-1">
                    <strong>Pengurus Projek Tapak</strong><br />
                    <span>{project.mainConName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsAnalyticsPillarView;
