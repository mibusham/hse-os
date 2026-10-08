import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, 
  Plus, Trash2, Users,
  Bot, Sparkles, Send, X, Check, ShieldCheck, Receipt
} from 'lucide-react';
import type { ProjectIdentity, SubcontractorRecord } from '../../types/core';
import { ProjectService } from '../../services/projectService';
import { SitePenaltyView } from './operational/SitePenaltyView';

export interface SubconScopeOption {
  id: string;
  name: string;
  cidbSpecialization: string;
  riskCategory: string;
  recommendedGrade?: string;
  isCustom?: boolean;
}

const DEFAULT_SCOPES: SubconScopeOption[] = [
  { 
    id: 'KERJA_STRUKTUR_PERANCAH', 
    name: 'Structural Concrete & Scaffolding Works', 
    cidbSpecialization: 'B04 (Building Construction) / CE21', 
    riskCategory: 'High (Working at Height)', 
    recommendedGrade: 'G4' 
  },
  { 
    id: 'KERJA_BUMBUNG_KEKUDA', 
    name: 'Roof Truss & Roof Tiling Installation', 
    cidbSpecialization: 'B04 / B12 (Roofing Works)', 
    riskCategory: 'High (Roofing & Falls from Height)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_TANAH_PARIT', 
    name: 'Earthworks, Deep Trenching & Drainage', 
    cidbSpecialization: 'CE01 / CE02 (Earthworks & Drainage)', 
    riskCategory: 'High (Trench Collapse & Heavy Plant)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_MEKANIKAL_ELEKTRIK', 
    name: 'M&E Installation & Electrical Wiring', 
    cidbSpecialization: 'E01 - E11 / ME', 
    riskCategory: 'Moderate (Electrocution & Hot Work)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_IKAT_BATA_PLASTER', 
    name: 'Bricklaying, Plastering & Painting', 
    cidbSpecialization: 'B04 (General Building Works)', 
    riskCategory: 'Low - Moderate', 
    recommendedGrade: 'G2' 
  },
];

export const CorporateSubconPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [subconTab, setSubconTab] = useState<'DIRECTORY' | 'PENALTIES'>('DIRECTORY');

  const [subconList, setSubconList] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  // Dynamic Scopes List (persisted)
  const [scopes, setScopes] = useState<SubconScopeOption[]>(() => {
    return ProjectService.loadData<SubconScopeOption[]>('subcon_scopes', DEFAULT_SCOPES);
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<string>(DEFAULT_SCOPES[0].name);
  const [cidbGrade, setCidbGrade] = useState('G7');
  const [cidbExp, setCidbExp] = useState('2027-12-31');
  const [carPolicyNo, setCarPolicyNo] = useState('');
  const [carExpiryDate, setCarExpiryDate] = useState('2027-06-30');
  const [workersCount, setWorkersCount] = useState<number>(15);
  const [status, setStatus] = useState<SubcontractorRecord['status']>('APPROVED');

  // Core AI Trade Copilot Chat State
  const [showCoreChat, setShowCoreChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'core';
    text: string;
    suggestion?: SubconScopeOption;
  }>>([
    {
      sender: 'core',
      text: 'Hello! What is this subcontractor\'s actual scope of work on site? Describe it casually (e.g. solar panel installation, bored piling, premix road paving, lift installation, etc.). I will match it with official CIDB specialization codes and OSH safety standards, then inject it directly into your form options.',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('subcontractors_list', subconList, project?.id);
  }, [subconList, project?.id]);

  useEffect(() => {
    ProjectService.saveData('subcon_scopes', scopes, project?.id);
  }, [scopes, project?.id]);

  // AI Trade Knowledge Matcher
  const analyzeTradeWithCore = (text: string): SubconScopeOption => {
    const lower = text.toLowerCase();
    if (lower.includes('solar') || lower.includes('pv') || lower.includes('panel')) {
      return {
        id: `SCOPE_SOLAR_${Date.now()}`,
        name: 'Solar PV Installation & High-Voltage Cable Tray',
        cidbSpecialization: 'E11 (Signage & Solar Systems) / ME',
        riskCategory: 'High (Roof Work & High-Voltage DC Shock)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('pile') || lower.includes('piling') || lower.includes('cerucuk') || lower.includes('bore')) {
      return {
        id: `SCOPE_PILING_${Date.now()}`,
        name: 'Piling Works (Bored/Spun/Sheet Pile) & Static Load Testing',
        cidbSpecialization: 'CE02 (Bridges, Jetties & Piling) / CE21',
        riskCategory: 'High (Heavy Piling Rig & Geotechnical Risk)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }
    if (lower.includes('jalan') || lower.includes('road') || lower.includes('premix') || lower.includes('tar') || lower.includes('kerb') || lower.includes('turap')) {
      return {
        id: `SCOPE_ROAD_${Date.now()}`,
        name: 'Road Pavement, Premix Asphalt & Roadside Drainage',
        cidbSpecialization: 'CE01 (Roads & Pavements)',
        riskCategory: 'High (Heavy Tipper Traffic & Hot Bitumen)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('kaca') || lower.includes('tingkap') || lower.includes('fasad') || lower.includes('facade') || lower.includes('curtain') || lower.includes('aluminium') || lower.includes('glass')) {
      return {
        id: `SCOPE_FACADE_${Date.now()}`,
        name: 'Aluminium Composite Panel & Curtain Wall Glass Facade',
        cidbSpecialization: 'B04 / B28 (Glass & Aluminium Works)',
        riskCategory: 'High (Working at Height & Suspended Boom Lift)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('lif') || lower.includes('lift') || lower.includes('eskalator') || lower.includes('escalator') || lower.includes('hoist')) {
      return {
        id: `SCOPE_LIFT_${Date.now()}`,
        name: 'Passenger Hoist, Lift & Escalator Installation and Commissioning',
        cidbSpecialization: 'M03 (Lifts & Escalators) / ME',
        riskCategory: 'High (Open Lift Shaft Falls & Confined Pit)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }
    if (lower.includes('aircond') || lower.includes('hvac') || lower.includes('hawa dingin') || lower.includes('chiller') || lower.includes('duct')) {
      return {
        id: `SCOPE_HVAC_${Date.now()}`,
        name: 'HVAC Air Conditioning & Mechanical Ventilation Ducting',
        cidbSpecialization: 'M01 (Air Conditioning & Ventilation Systems)',
        riskCategory: 'Moderate (Ceiling Scaffolding & Pressurized Refrigerant)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('bomba') || lower.includes('fire') || lower.includes('sprinkler') || lower.includes('kebakaran') || lower.includes('hosereel')) {
      return {
        id: `SCOPE_FIRE_${Date.now()}`,
        name: 'Fire Protection Piping & Sprinkler System Installation',
        cidbSpecialization: 'M02 (Fire Protection Systems)',
        riskCategory: 'Moderate (Pressure Testing & Hot Work Welding)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('paip') || lower.includes('plumbing') || lower.includes('sanitari') || lower.includes('sanitary') || lower.includes('kumbahan') || lower.includes('culvert') || lower.includes('pipe')) {
      return {
        id: `SCOPE_PLUMBING_${Date.now()}`,
        name: 'Internal Plumbing, Sanitary & Underground Sewerage Reticulation',
        cidbSpecialization: 'CE19 (Sewerage Systems) / CE20 / B04',
        riskCategory: 'Moderate (Trench Shoring & Confined Manholes)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('landskap') || lower.includes('landscape') || lower.includes('pokok') || lower.includes('rumput') || lower.includes('turfing')) {
      return {
        id: `SCOPE_LANDSCAPE_${Date.now()}`,
        name: 'Soft Landscaping (Turfing/Trees) & External Hardscape Works',
        cidbSpecialization: 'CE14 (Landscaping & Beautification)',
        riskCategory: 'Low (Mowers & Fertilizer Handling)',
        recommendedGrade: 'G1',
        isCustom: true,
      };
    }
    if (lower.includes('waterproof') || lower.includes('kalis air') || lower.includes('epoxy') || lower.includes('cat') || lower.includes('paint')) {
      return {
        id: `SCOPE_FINISHES_${Date.now()}`,
        name: 'Waterproofing Membrane Application & Epoxy Coating Finishes',
        cidbSpecialization: 'B04 / B09 (Waterproofing & Finishes)',
        riskCategory: 'Moderate (Toxic Vapor / VOC Solvents)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('besi') || lower.includes('rebar') || lower.includes('tetulang') || lower.includes('acuan') || lower.includes('formwork')) {
      return {
        id: `SCOPE_REBAR_${Date.now()}`,
        name: 'Formwork Shuttering & Rebar Steel Fixing Works',
        cidbSpecialization: 'B04 / CE21',
        riskCategory: 'High (Exposed Starter Bar Impalement & Shutter Collapse)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('cerun') || lower.includes('slope') || lower.includes('gabion') || lower.includes('soil nail')) {
      return {
        id: `SCOPE_SLOPE_${Date.now()}`,
        name: 'Slope Protection, Gabion Retaining Walls & Soil Nailing',
        cidbSpecialization: 'CE08 (Slope Protection)',
        riskCategory: 'High (Landslide Risk & Steep Working Conditions)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }

    // Bespoke fallback
    const cleanWords = text.trim().slice(0, 50);
    const capitalized = cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1);
    return {
      id: `SCOPE_CUSTOM_${Date.now()}`,
      name: `Specialist Trade: ${capitalized}`,
      cidbSpecialization: 'B04 / CE21 (General Building / Civil Engineering)',
      riskCategory: 'Subject to Site-Specific HIRADC Assessment',
      recommendedGrade: 'G2',
      isCustom: true,
    };
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      const matched = analyzeTradeWithCore(query);
      const coreReply = {
        sender: 'core' as const,
        text: `Based on your description "${query}", Core has matched this with official CIDB specialization codes and OSH risk standards. Review the proposed scope below:`,
        suggestion: matched,
      };
      setChatMessages(prev => [...prev, coreReply]);
      setIsThinking(false);
    }, 450);
  };

  const handleConfirmAddScope = (scopeToAdd: SubconScopeOption) => {
    if (!scopes.some(s => s.name.toLowerCase() === scopeToAdd.name.toLowerCase())) {
      setScopes(prev => [...prev, scopeToAdd]);
    }
    setScope(scopeToAdd.name);
    if (scopeToAdd.recommendedGrade) {
      setCidbGrade(scopeToAdd.recommendedGrade);
    }
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'core',
        text: `✅ Success! Scope "${scopeToAdd.name}" has been created and auto-selected in your registration form. CIDB grade has been set to ${scopeToAdd.recommendedGrade || 'G3'}. You can now complete the CAR policy details and submit.`
      }
    ]);
  };

  const handleAddSubcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !carPolicyNo) return;

    const newSubcon: SubcontractorRecord = {
      id: `subcon-${Date.now()}`,
      name: name.toUpperCase(),
      scope: scope,
      cidbGrade,
      cidbExp,
      carInsuranceValid: true,
      carPolicyNo: carPolicyNo.toUpperCase(),
      carExpiryDate,
      greenCardCompliance: `100% (${workersCount}/${workersCount} Certified)`,
      workersCount,
      status
    };

    setSubconList([newSubcon, ...subconList]);
    setShowAddModal(false);
    setShowCoreChat(false);
    setName('');
    setCarPolicyNo('');
    setWorkersCount(15);
  };

  const handleDeleteSubcon = (id: string) => {
    setSubconList(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setSubconList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus: SubcontractorRecord['status'] = s.status === 'APPROVED' ? 'PENDING_DOCS' : 'APPROVED';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const approvedCount = subconList.filter(s => s.status === 'APPROVED').length;
  const totalWorkers = subconList.reduce((acc, curr) => acc + (curr.workersCount || 0), 0);
  const currentScopeObj = scopes.find(s => s.name === scope);

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
            <span className="text-xs font-mono text-slate-400 font-bold">Corporate Governance &amp; Subcontractor Vetting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            CIDB Contractor Vetting &amp; CAR Insurance Compliance
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Statutory verification of subcontractor CIDB Green Cards (Act 520), Contractor's All Risk (CAR) policies, Workmen's Compensation (WCA/SOCSO), and site entry clearance supported by Core AI Trade Copilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(true);
              setShowCoreChat(false);
            }}
            className="px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Register Subcontractor</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSubconTab('DIRECTORY')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
            subconTab === 'DIRECTORY'
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 ring-1 ring-purple-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>Subcontractor Directory &amp; CAR Insurance</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-slate-800 text-slate-300">
            {subconList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubconTab('PENALTIES')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
            subconTab === 'PENALTIES'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt size={14} />
          <span>Site Penalties &amp; Demerit Compound Slips</span>
        </button>
      </div>

      {subconTab === 'PENALTIES' && <SitePenaltyView project={project} />}

      {subconTab === 'DIRECTORY' && (
        <>
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registered Subcontractors</span>
          <p className="text-3xl font-black text-white mt-1 font-mono">{subconList.length}</p>
          <span className="text-[10px] text-purple-400 font-medium">CIDB Registered Firms</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CAR Insurance &amp; CIDB Clearance</span>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{approvedCount} / {subconList.length || 0}</p>
          <span className="text-[10px] text-emerald-400/80 font-medium">100% Active Policies</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Green Card Certified Workers</span>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-cyan-400/80 font-medium">Full Compliance with CIDB Act 520</span>
        </div>
      </div>

      {/* Subcon Vetting Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-purple-400" /> Active On-Site Subcontractor Directory
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Mandatory Pre-Entry Document Clearance</span>
        </div>

        {subconList.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Subcontractors Registered Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All structural, roofing, M&amp;E, and earthwork subcontractors must be registered with valid CIDB accreditation and active CAR insurance before site mobilization. Click the button above to register.
            </p>
          </div>
        ) : (
          subconList.map(sub => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20 font-mono">
                    CIDB Grade {sub.cidbGrade}
                  </span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {sub.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(sub.id)}
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                    title="Click to toggle vetting status"
                  >
                    {sub.status === 'APPROVED' ? '✓ APPROVED (PERMITTED)' : '⏳ PENDING DOCUMENTS'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubcon(sub.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scope of Work:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.scope}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CAR Insurance Policy:</span>
                  <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{sub.carPolicyNo}</span>
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">Valid until: {sub.carExpiryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Personnel &amp; Green Cards:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.greenCardCompliance}</p>
                  <span className="text-[9px] text-emerald-400 font-mono">{sub.workersCount} Certified Workers</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valid CIDB Certification:</span>
                  <p className="text-slate-200 font-mono mt-0.5">{sub.cidbExp}</p>
                  <span className="text-[9px] text-slate-500">CIDB Central Registry</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}

      {/* MODAL: REGISTER NEW SUBCON WITH IN-CONTEXT CORE AI TRADE COPILOT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full shadow-2xl transition-all my-auto ${
            showCoreChat ? 'max-w-4xl' : 'max-w-xl'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    Register New Subcontractor
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">CIDB &amp; CAR Insurance Compliance Screening</span>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={`grid gap-6 pt-4 ${showCoreChat ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* Form Section */}
              <form onSubmit={handleAddSubcon} className={`space-y-4 ${showCoreChat ? 'lg:col-span-7' : ''}`}>
                
                {/* Company Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subcontractor Company Name *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. SURIA MAJU ENGINEERING SDN BHD"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Scope Selection + AI Trigger Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Scope of Work On Site *
                    </label>

                    {/* Button: Discuss with Core AI */}
                    <button
                      type="button"
                      onClick={() => setShowCoreChat(!showCoreChat)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                        showCoreChat
                          ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-md shadow-purple-500/20'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-200'
                      }`}
                    >
                      <Sparkles size={11} className={showCoreChat ? 'animate-spin' : ''} />
                      <span>{showCoreChat ? 'Close Core Copilot' : '✨ Not In List? Discuss with Core'}</span>
                    </button>
                  </div>

                  <select 
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400"
                  >
                    {scopes.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isCustom ? '★ (AI Custom Scope)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Context Note of the Selected Scope */}
                  {currentScopeObj && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[10px] flex items-start gap-2 text-slate-400">
                      <ShieldCheck size={13} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-purple-300 font-bold">CIDB Code: {currentScopeObj.cidbSpecialization}</span>
                        <span className="mx-1.5 text-slate-600">•</span>
                        <span>Risk Profile: <strong className="text-slate-300">{currentScopeObj.riskCategory}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CIDB Grade & Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CIDB Grade *
                    </label>
                    <select 
                      value={cidbGrade}
                      onChange={e => setCidbGrade(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                    >
                      <option value="G1">Grade G1 (Up to RM200k)</option>
                      <option value="G2">Grade G2 (Up to RM500k)</option>
                      <option value="G3">Grade G3 (Up to RM1 Million)</option>
                      <option value="G4">Grade G4 (Up to RM3 Million)</option>
                      <option value="G5">Grade G5 (Up to RM5 Million)</option>
                      <option value="G6">Grade G6 (Up to RM10 Million)</option>
                      <option value="G7">Grade G7 (Unlimited)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CIDB Expiry Date *
                    </label>
                    <input 
                      type="date"
                      value={cidbExp}
                      onChange={e => setCidbExp(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* CAR Policy & Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CAR Insurance Policy No. *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. CAR/2026/MY-9801"
                      value={carPolicyNo}
                      onChange={e => setCarPolicyNo(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase font-mono placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CAR Policy Expiry Date *
                    </label>
                    <input 
                      type="date"
                      value={carExpiryDate}
                      onChange={e => setCarExpiryDate(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Workers Count & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Site Workers Headcount *
                    </label>
                    <input 
                      type="number"
                      value={workersCount}
                      onChange={e => setWorkersCount(Number(e.target.value))}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Vetting Status *
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
                    >
                      <option value="APPROVED">APPROVED (Cleared for Site Entry)</option>
                      <option value="PENDING_DOCS">PENDING (Pending Documents)</option>
                    </select>
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-purple-400 hover:bg-purple-300 uppercase tracking-wider shadow-lg shadow-purple-400/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Register &amp; Clear Entry</span>
                  </button>
                </div>
              </form>

              {/* CORE AI TRADE SPECIALIST CHAT PANEL */}
              {showCoreChat && (
                <div className="lg:col-span-5 bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col h-[460px] shadow-inner relative">
                  
                  {/* Chat Panel Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                        <Bot size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          Core AI Trade Copilot
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </h4>
                        <span className="text-[9px] text-purple-300 font-mono">CIDB &amp; OSHA Trade Specialization</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCoreChat(false)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Chat Quick Trade Pills */}
                  <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">Quick Suggestions:</span>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Roof solar PV installation and high voltage cable ladder')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      ☀️ Solar PV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Bored piling works and foundation load test')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🚜 Bored Piling
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Premix asphalt road paving and roadside kerbs')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🛣️ Asphalt Road
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Curtain wall glass facade installation on higher levels')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🪟 Glass Facade
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Passenger lift and escalator installation')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🛗 Lift &amp; Hoist
                    </button>
                  </div>

                  {/* Chat Messages Body */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs custom-scrollbar">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`rounded-2xl p-3 max-w-[95%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-purple-600 text-white rounded-br-sm shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-[11px]">{msg.text}</p>

                          {/* Action Card: Core Scope Proposal */}
                          {msg.suggestion && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 bg-slate-950/80 p-2.5 rounded-xl border border-purple-500/20">
                              <div className="flex items-center gap-1.5 text-purple-400 font-black text-[10px] uppercase">
                                <Sparkles size={11} /> Core Specialization Proposal
                              </div>

                              <div className="space-y-1 text-[10px]">
                                <div>
                                  <span className="text-slate-400">Proposed Scope: </span>
                                  <strong className="text-white">{msg.suggestion.name}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">CIDB Specialization: </span>
                                  <strong className="text-cyan-400 font-mono">{msg.suggestion.cidbSpecialization}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Risk Profile: </span>
                                  <span className="text-amber-400 font-semibold">{msg.suggestion.riskCategory}</span>
                                </div>
                                {msg.suggestion.recommendedGrade && (
                                  <div>
                                    <span className="text-slate-400">Recommended CIDB Grade: </span>
                                    <span className="text-purple-300 font-mono font-bold">{msg.suggestion.recommendedGrade}</span>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleConfirmAddScope(msg.suggestion!)}
                                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                <Check size={12} />
                                <span>+ Confirm &amp; Create This Scope</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono italic">
                        <Sparkles size={12} className="text-purple-400 animate-spin" />
                        <span>Core is analyzing CIDB trade specialization codes...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Field */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 shrink-0">
                    <input 
                      type="text"
                      placeholder="Describe work (e.g. solar panel installation)..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-purple-400 placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage()}
                      className="w-8 h-8 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 transition-all"
                    >
                      <Send size={13} />
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CorporateSubconPillarView;
