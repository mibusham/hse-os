import React, { useState } from 'react';
import { 
  BookOpen, Users, FileText, CheckCircle2, 
  Send, AlertCircle, Building2, UserCheck, ShieldCheck
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

export const CdmStudioPillarView: React.FC<{ project: ProjectIdentity }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'REG8' | 'DUTY_HOLDERS' | 'DOSSIER'>('REG8');
  const [noticeSent, setNoticeSent] = useState(false);

  // Statutory Threshold Check
  const isThresholdExceeded = project.estimatedPersonDays > 500;

  return (
    <div className="space-y-6">
      
      {/* Pillar 2 Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
              <BookOpen size={12} /> Statutory Pillar 2
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">OSHA (Amendment) 2022 / CDM 2024</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            CDM 2024 Governance &amp; Statutory Dossier Studio
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pengurusan Notifikasi Wajib Peraturan 8 (Borang JKKP 103), hierarki perlantikan pemegang amanah undang-undang (Client, PCWD, PCWC, SHO), dan pembinaan fail Pre-Construction Information (PCI).
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Ambang Statutori CDM</span>
            <span className={`text-xs font-black font-mono ${isThresholdExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isThresholdExceeded ? 'MANDATORI NOTIS JKKP (REG 8)' : 'STANDARD EXEMPTION'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'REG8', label: 'Borang JKKP 103 (Notis Reg. 8)', icon: Send },
          { id: 'DUTY_HOLDERS', label: 'Direktori Pemegang Amanah (Duty Holders)', icon: Users },
          { id: 'DOSSIER', label: 'Dossier Kesihatan & Keselamatan (PCI/CPP)', icon: FileText },
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
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGULATION 8 STATUTORY NOTICE (JKKP 103) */}
      {activeTab === 'REG8' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-amber-300">Statutory Notice Obligation (Peraturan 8 CDM 2024):</strong>
              <p className="text-slate-300 leading-relaxed">
                Oleh kerana projek ini mempunyai anggaran lebih 500 hari-orang ({project.estimatedPersonDays.toLocaleString()} person-days), pemberitahuan bertulis rasmi mengikut <strong>Borang JKKP 103</strong> wajib diserahkan kepada Pengarah DOSH Negeri sebelum sebarang kerja fizikal pembinaan bermula.
              </p>
            </div>
          </div>

          {/* Form JKKP 103 Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider">BORANG JKKP 103 (DRAF RASMI CDM 2024)</span>
              <span className="text-slate-500">Jabatan Keselamatan &amp; Kesihatan Pekerjaan Malaysia</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">1. NAMA PROJEK:</span>
                  <span className="font-bold text-white uppercase">{project.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">2. LOKASI TAPAK:</span>
                  <span className="text-white">{project.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">3. KLIEN (REG. 4):</span>
                  <span className="text-white">{project.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">4. KONTRAKTOR UTAMA (PCWC):</span>
                  <span className="text-white">{project.mainConName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">5. NILAI KONTRAK:</span>
                  <span className="text-emerald-400 font-bold">RM {(project.contractValue / 1000000).toFixed(2)} Juta</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${noticeSent ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-400'}`}>
                {noticeSent ? <><CheckCircle2 size={14} /> Berjaya Direkodkan &amp; Sedia Dieksport PDF</> : 'Status: Menunggu Pengesahan Terakhir Pegawai'}
              </span>

              <button
                type="button"
                onClick={() => setNoticeSent(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Send size={14} />
                <span>Jana Notis JKKP 103 (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY DUTY HOLDERS DIRECTORY */}
      {activeTab === 'DUTY_HOLDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              role: 'CLIENT (REGULATION 4)',
              name: project.clientName || 'Belum Ditetapkan',
              sub: 'Pihak yang membiayai projek & melantik PCWD / PCWC',
              status: project.clientName ? 'VERIFIED APPOINTED' : 'PENDING',
              icon: Building2,
              color: 'text-blue-400 border-blue-500/20 bg-blue-500/10'
            },
            {
              role: 'PRINCIPAL CONTRACTOR / PCWC (REGULATION 10)',
              name: project.mainConName || 'Belum Ditetapkan',
              sub: 'Bertanggungjawab mengurus fasa pembinaan & keselamatan tapak',
              status: project.mainConName ? 'VERIFIED G7 ACTIVE' : 'PENDING',
              icon: ShieldCheck,
              color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
            },
            {
              role: 'PRINCIPAL DESIGNER / PCWD (REGULATION 6)',
              name: 'Belum Didaftarkan (Menunggu Input Projek)',
              sub: 'Mengawal risiko fasa reka bentuk mengikut prinsip ERIC (BEM PEPC)',
              status: 'PENDING REGISTRATION',
              icon: UserCheck,
              color: 'text-slate-400 border-slate-700/50 bg-slate-800/40'
            },
            {
              role: 'SAFETY & HEALTH OFFICER (SHO SEKSYEN 29)',
              name: 'Belum Didaftarkan (Menunggu Green Book)',
              sub: 'Pegawai Keselamatan & Kesihatan Berdaftar JKKP (Green Book)',
              status: 'PENDING REGISTRATION',
              icon: Users,
              color: 'text-slate-400 border-slate-700/50 bg-slate-800/40'
            },
          ].map((dh, idx) => {
            const Icon = dh.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${dh.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {dh.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{dh.role}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{dh.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{dh.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: DOSSIER (PCI & CPP) */}
      {activeTab === 'DOSSIER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Fail Maklumat Pra-Pembinaan (PCI) &amp; Pelan Fasa Pembinaan (CPP)
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Dokumen dossier ini mengumpulkan maklumat utiliti bawah tanah, kabel TNB, talian paip PBA, dan bahaya geoteknikal tapak untuk rujukan semua pihak.
          </p>
          <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            Dossier lengkap sedia untuk diarkibkan secara digital ke Google Cloud Storage.
          </div>
        </div>
      )}

    </div>
  );
};

export default CdmStudioPillarView;
