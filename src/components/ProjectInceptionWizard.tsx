import React, { useState } from 'react';
import { 
  Sparkles, Layers, ArrowRight, 
  CheckCircle2, Cpu, Database
} from 'lucide-react';
import type { ProjectIdentity, ProjectScope } from '../types/core';
import { HSECoreEngine } from '../services/HSECoreEngine';
import { ProjectService } from '../services/projectService';

interface ProjectInceptionWizardProps {
  onComplete: (project: ProjectIdentity) => void;
}

export const ProjectInceptionWizard: React.FC<ProjectInceptionWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [projectName, setProjectName] = useState('PROPOSED EXECUTION AND COMPLETION OF MAIN BUILDING WORKS (ECO SUN PHASE 2)...');
  const [shortTitle, setShortTitle] = useState('ECO SUN PHASE 2 (90 UNITS 2-STOREY TERRACE)');
  const [projectCode, setProjectCode] = useState('HSE-PRJ-2026-01');
  const [location, setLocation] = useState('Bandar Cassia, Mukim 13, Seberang Perai Selatan, Pulau Pinang');
  const [projectScope, setProjectScope] = useState<ProjectScope>('LANDED_RESIDENTIAL');
  const [clientName, setClientName] = useState('ECO HORIZON SDN. BHD');
  const [mainConName, setMainConName] = useState('YTC BUILDERS SDN BHD (G7)');
  const [contractValue, setContractValue] = useState(52800000); // RM 52.8 Million
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetCompletionDate] = useState('2028-12-31');
  const [towerStoreys, setTowerStoreys] = useState(2);
  const [hasDeepExcavation, setHasDeepExcavation] = useState(false);
  const [basementLevels, setBasementLevels] = useState(0);
  const [estimatedPersonDays] = useState(120000);

  const [isSaving, setIsSaving] = useState(false);

  // Synthesis Preview
  const tempProject: ProjectIdentity = {
    id: `prj-${Date.now()}`,
    projectName,
    shortTitle: shortTitle.trim() || undefined,
    projectCode,
    location,
    projectScope,
    clientName,
    mainConName,
    contractValue,
    startDate,
    targetCompletionDate,
    estimatedPersonDays,
    hasDeepExcavation,
    basementLevels: hasDeepExcavation ? basementLevels : 0,
    towerStoreys: projectScope === 'HIGH_RISE' ? towerStoreys : 1,
    isReg8Notifiable: estimatedPersonDays > 500,
  };

  const synthesizedModules = HSECoreEngine.synthesizeModules(tempProject);
  const initialAdvisories = HSECoreEngine.generateDayOneAdvisories(tempProject);

  const handleLaunchProject = async () => {
    setIsSaving(true);
    try {
      await onComplete(tempProject);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8">
      {/* Glow Backdrop */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
        
        {/* Wizard Header Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Cpu size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Autonomous Core Inception
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs font-mono text-slate-400">HSE OS v1.0 Enterprise</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-wide mt-0.5">
                {step === 1 ? '1. Project Parameters & Statutory Scoping' : '2. Core Synthesis & Blueprint Activation'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${step === 1 ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-xs font-mono font-bold text-slate-400">Step {step} of 2</span>
          </div>
        </div>

        {/* Step 1: Input Parameters */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Core Insight:</strong> Provide statutory project parameters below. The HSE OS Core Engine will analyze these specifications to synthesize statutory compliance modules for DOSH, DOE, CDM 2024, and generate Day-1 proactive alerts.
              </p>
            </div>

            {/* Quick Load Everine Live Site Data Button */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span>Everine Eco Sun Ph2 Live Data</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">204 Workers + Full History</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Instantly load 204 inducted workers, PTWs, rain gauge logs, subcontractors &amp; scaffolds without typing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const evr = await ProjectService.initializeWithEverineData();
                    await onComplete(evr);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Quick Load Everine</span>
              </button>
            </div>

            {/* Scope Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Project Classification &amp; Scope *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { id: 'LANDED_RESIDENTIAL', label: 'Landed Housing & Terraced', desc: 'Terrace Houses / Semi-Detached / Bungalows' },
                  { id: 'HIGH_RISE', label: 'High-Rise Commercial / Residential', desc: '>4 Storeys / Towers / Condominiums' },
                  { id: 'INFRASTRUCTURE', label: 'Infrastructure & Roadworks', desc: 'Highways / Bridges / Civil Drainage' },
                  { id: 'INDUSTRIAL_WAREHOUSE', label: 'Industrial Warehouse & Plant', desc: 'Factories / Steel Structure Warehouses' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProjectScope(item.id as ProjectScope);
                      if (item.id === 'LANDED_RESIDENTIAL') {
                        setTowerStoreys(2); // Default 2 storeys
                        setHasDeepExcavation(false);
                        setBasementLevels(0);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      projectScope === item.id 
                        ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/50' 
                        : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block text-slate-200">{item.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Name, Short Title & Code */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                    Short Project Title (For Dashboard &amp; Header Display) *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. ECO SUN PHASE 2 (90 UNITS 2-STOREY TERRACE)"
                    value={shortTitle}
                    onChange={e => setShortTitle(e.target.value)}
                    className="w-full bg-slate-800/80 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase ring-1 ring-emerald-500/20"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    Clean and concise title for optimal dashboard readability.
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Project Code / Reference
                  </label>
                  <input 
                    type="text"
                    value={projectCode}
                    onChange={e => setProjectCode(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Full Statutory Project Contract Description (Contract &amp; DOSH Formal Title) *
                </label>
                <textarea 
                  rows={3}
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-xs font-medium text-slate-200 outline-none focus:border-emerald-400 uppercase leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Client & Main Contractor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Project Client (Duty Holder Reg. 4) *
                </label>
                <input 
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Principal Contractor (PCWC Reg. 10) *
                </label>
                <input 
                  type="text"
                  value={mainConName}
                  onChange={e => setMainConName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase"
                />
              </div>
            </div>

            {/* Location & Contract Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Site Physical Location
                </label>
                <input 
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Contract Value (MYR)
                </label>
                <input 
                  type="number"
                  value={contractValue}
                  onChange={e => setContractValue(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {/* Technical Parameters: Heights & Excavations */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Layers size={14} /> {projectScope === 'LANDED_RESIDENTIAL' ? 'Housing & Site Parameters' : 'Structural & Civil Hazard Parameters'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    {projectScope === 'LANDED_RESIDENTIAL' ? 'Building Storeys' : 'Tower Storeys'}
                  </label>
                  <input 
                    type="number"
                    value={towerStoreys}
                    onChange={e => setTowerStoreys(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white font-mono"
                  />
                  {projectScope === 'LANDED_RESIDENTIAL' && (
                    <span className="text-[9px] text-slate-500 block mt-1">e.g. 2 Storeys (Terrace)</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Deep Excavation / Basement?</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasDeepExcavation(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        hasDeepExcavation ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasDeepExcavation(false);
                        setBasementLevels(0);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        !hasDeepExcavation ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Basement Levels</label>
                  <input 
                    type="number"
                    disabled={!hasDeepExcavation}
                    value={basementLevels}
                    onChange={e => setBasementLevels(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white font-mono disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Step 2: Synthesis Preview */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  AI Core Synthesis Complete
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {tempProject.projectName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">Total Activated Modules</span>
                <p className="text-xl font-black text-emerald-400">{synthesizedModules.length}</p>
              </div>
            </div>

            {/* Day 1 Proactive Advisories */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" /> Day 1 Core Proactive Advisories
              </span>
              {initialAdvisories.map(adv => (
                <div key={adv.id} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                      {adv.severity} • {adv.pillar}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{adv.statutoryReference}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{adv.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{adv.description}</p>
                </div>
              ))}
            </div>

            {/* Synthesized Modules Grid */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Cpu size={14} className="text-emerald-400" /> Tailored Active Dashboard Modules
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {synthesizedModules.map(mod => (
                  <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">{mod.title}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-2 mt-0.5">{mod.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Back to Parameters
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">
              Ready for synthesis
            </span>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-400/20 active:scale-95"
            >
              <span>Synthesize Blueprint</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleLaunchProject}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-400/20 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Launch HSE OS Dashboard</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProjectInceptionWizard;
