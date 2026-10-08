import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, FileText, CheckCircle2, 
  Send, AlertCircle, ShieldCheck,
  Printer, Edit3, Check
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';
import { ProjectService } from '../../services/projectService';

interface DutyHolderItem {
  id: string;
  role: string;
  name: string;
  company: string;
  regNo: string;
  contact: string;
  sub: string;
  status: string;
}

interface DossierItem {
  id: string;
  title: string;
  code: string;
  description: string;
  preparedBy: string;
  completed: boolean;
  dateUpdated: string;
}

export const CdmStudioPillarView: React.FC<{ project: ProjectIdentity }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'REG8' | 'DUTY_HOLDERS' | 'DOSSIER'>('REG8');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [noticeSent, setNoticeSent] = useState(false);

  // Duty Holders State & Persistence
  const defaultDutyHolders: DutyHolderItem[] = [
    {
      id: 'dh-client',
      role: 'CLIENT (REGULATION 4)',
      name: project.clientName || 'Eco World Development Group Bhd',
      company: project.clientName || 'Master Property Developer',
      regNo: 'ROC 199401018274',
      contact: '+604-508 8888',
      sub: 'Project funding entity & appointer of PCWD / PCWC',
      status: 'VERIFIED APPOINTED'
    },
    {
      id: 'dh-pcwc',
      role: 'PRINCIPAL CONTRACTOR / PCWC (REGULATION 10)',
      name: project.mainConName || 'Mibu Construction Sdn Bhd',
      company: project.mainConName || 'Main Contractor Grade G7',
      regNo: 'CIDB 0120150921-PP168234',
      contact: '+604-582 9900',
      sub: 'Responsible for construction phase execution & site safety management',
      status: 'VERIFIED G7 ACTIVE'
    },
    {
      id: 'dh-pcwd',
      role: 'PRINCIPAL DESIGNER / PCWD (REGULATION 6)',
      name: 'Ir. Ahmad Zulkifli, PEPC',
      company: 'Zul Jurutera Perunding Sdn Bhd',
      regNo: 'BEM PEPC 18294 (Civil & Structural)',
      contact: '+604-226 7711',
      sub: 'Manages pre-construction design risks per ERIC principles (BEM PEPC)',
      status: 'VERIFIED APPOINTED'
    },
    {
      id: 'dh-sho',
      role: 'SAFETY & HEALTH OFFICER (SHO SECTION 29)',
      name: 'En. Razak Bin Othman',
      company: 'Mibu Spaces HSE Division',
      regNo: 'DOSH HQ/14/SHO/00/5892 (Green Book)',
      contact: '+6012-482 1199',
      sub: 'DOSH Registered Safety & Health Officer (Green Book)',
      status: 'GREEN BOOK VERIFIED'
    },
  ];

  const [dutyHolders, setDutyHolders] = useState<DutyHolderItem[]>(() => {
    return ProjectService.loadData<DutyHolderItem[]>('cdm_duty_holders', defaultDutyHolders);
  });

  // Edit Duty Holder Modal
  const [editingDh, setEditingDh] = useState<DutyHolderItem | null>(null);

  // Dossier Items State & Persistence
  const defaultDossier: DossierItem[] = [
    {
      id: 'dos-1',
      title: 'Pre-Construction Information (PCI) Pack',
      code: 'CDM-PCI-01',
      description: 'Mapping of underground utilities (PBA water, TNB 33kV high voltage cables) and geotechnical soil investigation logs.',
      preparedBy: 'Principal Designer (PCWD)',
      completed: true,
      dateUpdated: '15 Aug 2026'
    },
    {
      id: 'dos-2',
      title: 'Construction Phase Plan (CPP)',
      code: 'CDM-CPP-01',
      description: 'Construction phase safety plan: earth truck logistics, dust abatement, scaffolding zones, and Emergency Response Plan (ERP).',
      preparedBy: 'Principal Contractor (PCWC)',
      completed: true,
      dateUpdated: '28 Aug 2026'
    },
    {
      id: 'dos-3',
      title: 'Site Specific Traffic Management Plan (TMP)',
      code: 'TMP-BDR-CASSIA',
      description: 'Truck ingress/egress routes connecting to Bandar Cassia arterial road approved by JKR & City Council (MBSP).',
      preparedBy: 'Traffic Safety Officer',
      completed: true,
      dateUpdated: '02 Sep 2026'
    },
    {
      id: 'dos-4',
      title: 'Health & Safety File Handover Framework',
      code: 'HSF-2026-FASA2',
      description: 'Safe operation and maintenance dossier for post-construction handover to Client (As-Built O&M Safety Manual).',
      preparedBy: 'PCWD & PCWC Joint Team',
      completed: false,
      dateUpdated: 'In Preparation'
    }
  ];

  const [dossierList, setDossierList] = useState<DossierItem[]>(() => {
    return ProjectService.loadData<DossierItem[]>('cdm_dossier_list', defaultDossier);
  });

  useEffect(() => {
    ProjectService.saveData('cdm_duty_holders', dutyHolders, project.id);
  }, [dutyHolders, project.id]);

  useEffect(() => {
    ProjectService.saveData('cdm_dossier_list', dossierList, project.id);
  }, [dossierList, project.id]);

  // Statutory Threshold Check
  const isThresholdExceeded = project.estimatedPersonDays > 500;

  const handleUpdateDutyHolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDh) return;
    setDutyHolders(prev => prev.map(d => d.id === editingDh.id ? editingDh : d));
    setEditingDh(null);
  };

  const handleToggleDossier = (id: string) => {
    setDossierList(prev => prev.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          completed: !item.completed, 
          dateUpdated: !item.completed ? new Date().toISOString().split('T')[0] : 'Under Review' 
        };
      }
      return item;
    }));
  };

  const completedDossierCount = dossierList.filter(d => d.completed).length;
  const dossierPercentage = Math.round((completedDossierCount / dossierList.length) * 100);

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
            Statutory Regulation 8 Notification (DOSH Form 103), duty holders appointment directory (Client, PCWD, PCWC, SHO), and Pre-Construction Information (PCI) dossier studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">CDM Statutory Threshold</span>
              <span className={`text-xs font-black font-mono ${isThresholdExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isThresholdExceeded ? 'MANDATORY DOSH NOTICE (REG 8)' : 'STANDARD EXEMPTION'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
          >
            <Printer size={16} />
            <span>Print / PDF DOSH 103</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'REG8', label: 'DOSH Form 103 (Reg. 8 Notice)', icon: Send },
          { id: 'DUTY_HOLDERS', label: 'Duty Holders Statutory Directory', icon: Users },
          { id: 'DOSSIER', label: `PCI/CPP Dossier (${dossierPercentage}%)`, icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
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
              <strong className="text-amber-300">Statutory Notice Obligation (Regulation 8 CDM 2024):</strong>
              <p className="text-slate-300 leading-relaxed">
                Because this project has an estimated workforce exceeding 500 person-days ({project.estimatedPersonDays.toLocaleString()} person-days), an official written notice via <strong>DOSH Form 103</strong> must be submitted to the State DOSH Director before any physical site construction commences.
              </p>
            </div>
          </div>

          {/* Form JKKP 103 Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono shadow-inner">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 text-xs gap-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider">DOSH FORM 103 (OFFICIAL CDM 2024 / SECTION 34B DRAFT)</span>
              <span className="text-slate-500">Department of Occupational Safety and Health Malaysia (DOSH Penang)</span>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">1. FULL CONTRACT TITLE:</span>
                  <span className="font-bold text-white uppercase">{project.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">2. SITE LOCATION &amp; DISTRICT:</span>
                  <span className="text-white">{project.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-900">
                <div>
                  <span className="text-slate-500 block text-[10px]">3. PROJECT CLIENT (REG. 4):</span>
                  <span className="text-white font-bold">{project.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">4. PRINCIPAL CONTRACTOR (PCWC):</span>
                  <span className="text-white font-bold">{project.mainConName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">5. CONTRACT VALUE:</span>
                  <span className="text-emerald-400 font-bold">RM {(project.contractValue / 1000000).toFixed(2)} Million</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-900">
                <div>
                  <span className="text-slate-500 block text-[10px]">6. SITE COMMENCEMENT DATE:</span>
                  <span className="text-white font-mono">{project.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">7. TARGET COMPLETION:</span>
                  <span className="text-white font-mono">{project.targetCompletionDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">8. ESTIMATED PERSON-DAYS:</span>
                  <span className="text-amber-400 font-bold font-mono">{project.estimatedPersonDays.toLocaleString()} Person-Days</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className={`text-[11px] font-bold ${noticeSent ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-400'}`}>
                {noticeSent ? <><CheckCircle2 size={14} /> Verified &amp; Ready for Submission to DOSH</> : 'Status: Notice Draft Ready for Export / Print'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNoticeSent(true);
                    setShowPrintModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                >
                  <Printer size={14} />
                  <span>Open DOSH Form 103 Print View (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY DUTY HOLDERS DIRECTORY */}
      {activeTab === 'DUTY_HOLDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users size={14} className="text-amber-400" /> Statutory Duty Holders Directory (Regulations 4, 6, 10 CDM 2024)
            </h3>
            <span className="text-[10px] text-slate-500">Click "Update" to modify duty holder assignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dutyHolders.map((dh) => (
              <div key={dh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    {dh.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingDh(dh)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <Edit3 size={12} /> Update
                  </button>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{dh.role}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{dh.name}</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">{dh.company}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Registration No.:</span>
                    <span className="text-slate-200 font-bold">{dh.regNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Number:</span>
                    <span className="text-slate-200">{dh.contact}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 font-sans">{dh.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOSSIER (PCI & CPP) */}
      {activeTab === 'DOSSIER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Health &amp; Safety Dossier: PCI &amp; CPP Framework
              </h3>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Preparation of Pre-Construction Information (PCI) and Construction Phase Plan (CPP) ensuring hazard controls are documented prior to physical site execution.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Dossier Progress</span>
                <span className="text-xl font-black font-mono text-emerald-400">{dossierPercentage}% COMPLETE</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${dossierPercentage}%` }} />
          </div>

          <div className="space-y-3">
            {dossierList.map(dos => (
              <div key={dos.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {dos.code}
                    </span>
                    <h4 className="text-xs font-bold text-white">{dos.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{dos.description}</p>
                  <span className="text-[10px] text-slate-500 block">Prepared by: {dos.preparedBy} • Updated: {dos.dateUpdated}</span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleDossier(dos.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      dos.completed 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {dos.completed ? <><Check size={14} /> Ready &amp; Verified</> : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUTORY DUTY HOLDER */}
      {editingDh && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users size={18} className="text-amber-400" /> Update {editingDh.role}
              </h3>
              <button onClick={() => setEditingDh(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateDutyHolder} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Individual Name / Authorized Representative *</label>
                <input 
                  type="text"
                  value={editingDh.name}
                  onChange={e => setEditingDh({ ...editingDh, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company / Firm Name *</label>
                <input 
                  type="text"
                  value={editingDh.company}
                  onChange={e => setEditingDh({ ...editingDh, company: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registration No. (BEM / DOSH / CIDB / ROC) *</label>
                <input 
                  type="text"
                  value={editingDh.regNo}
                  onChange={e => setEditingDh({ ...editingDh, regNo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone Number *</label>
                <input 
                  type="text"
                  value={editingDh.contact}
                  onChange={e => setEditingDh({ ...editingDh, contact: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingDh(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 uppercase tracking-wider shadow-lg shadow-amber-400/20">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE BORANG JKKP 103 (STATUTORY FORMAT) */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 space-y-6 shadow-2xl font-sans my-8 border border-slate-200">
            {/* Header / Actions for Print */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Official Statutory Document • Regulation 8 CDM 2024
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-slate-800 shadow-md"
                >
                  <Printer size={14} /> Print / Save PDF
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

            {/* Official DOSH Letterhead */}
            <div className="text-center space-y-1">
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-800">
                DEPARTMENT OF OCCUPATIONAL SAFETY AND HEALTH (DOSH) MALAYSIA
              </h1>
              <p className="text-[11px] font-serif text-slate-600">
                MINISTRY OF HUMAN RESOURCES
              </p>
              <div className="pt-2">
                <h2 className="text-base font-black uppercase text-slate-900 tracking-tight border-y border-slate-300 py-1 inline-block">
                  DOSH FORM 103 (BORANG JKKP 103)
                </h2>
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
                  Notification of Building Operations and Works of Engineering Construction
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  (Under Regulation 8, OSH (Construction Design and Management) Regulations 2024 / Section 34B OSHA 1994)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-slate-700">1. Project Title:</span>
                  <span className="col-span-2 font-bold text-slate-900 uppercase">{project.projectName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-slate-700">2. Site Location:</span>
                  <span className="col-span-2 text-slate-800">{project.location}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-slate-700">3. Project Scope:</span>
                  <span className="col-span-2 text-slate-800 uppercase">{project.projectScope.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px]">
                    4. Client Particulars (Reg. 4)
                  </h4>
                  <p><span className="text-slate-500">Name:</span> <strong>{project.clientName}</strong></p>
                  <p><span className="text-slate-500">Address:</span> EcoWorld Gallery @ Eco Horizon, Bandar Cassia</p>
                  <p><span className="text-slate-500">Status:</span> CDM Registered Client</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px]">
                    5. Principal Contractor / PCWC (Reg. 10)
                  </h4>
                  <p><span className="text-slate-500">Company Name:</span> <strong>{project.mainConName}</strong></p>
                  <p><span className="text-slate-500">CIDB Registration:</span> Grade G7 (Active)</p>
                  <p><span className="text-slate-500">SHO Officer:</span> En. Razak Bin Othman (Green Book)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px]">
                  6. Duration, Contract Value &amp; Person-Days
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Start Date:</span>
                    <strong>{project.startDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Completion:</span>
                    <strong>{project.targetCompletionDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Person-Days:</span>
                    <strong className="text-rose-600">{project.estimatedPersonDays.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Machinery & High Risk Operations */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 text-[11px]">
                  7. Hazardous Machinery &amp; Plant On-Site (PMA/PMT Certificates of Fitness)
                </h4>
                <p className="text-slate-700">
                  • Mobile Crane / Crawler Crane (DOSH Registered PMA)<br />
                  • Backhoe / Excavator (Periodic Fitness Inspection Certificate)<br />
                  • Tubular Frame Scaffolding &gt; 15 meters (PE Endorsed &amp; Level 3 Competent Scaffolder)<br />
                  • Dewatering System &amp; Earth Drain Silt Trap (DOE Approved ESCP)
                </p>
              </div>

              {/* Endorsement & Signatures */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px]">
                <div className="space-y-10">
                  <p className="text-slate-500">Signed by Principal Contractor (PCWC):</p>
                  <div className="border-t border-slate-400 pt-1">
                    <strong>{project.mainConName}</strong><br />
                    <span>Official Company Stamp &amp; Date</span>
                  </div>
                </div>
                <div className="space-y-10">
                  <p className="text-slate-500">Received by Department of Occupational Safety &amp; Health:</p>
                  <div className="border-t border-slate-400 pt-1">
                    <strong>State DOSH Office (Penang)</strong><br />
                    <span>Receiving Officer Signature &amp; Date Stamp</span>
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

export default CdmStudioPillarView;
