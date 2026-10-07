import React from 'react';
import { 
  Sparkles, Layers, Activity, ChevronRight
} from 'lucide-react';
import type { ProjectIdentity, HSEModuleConfig } from '../../types/core';

interface ExecutiveMatrixViewProps {
  project: ProjectIdentity;
  modules: HSEModuleConfig[];
  onSelectModule: (moduleId: string) => void;
}

export const ExecutiveMatrixView: React.FC<ExecutiveMatrixViewProps> = ({
  project,
  modules,
  onSelectModule,
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Executive AI Site Director Debriefing Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <Sparkles size={12} />
                Autonomous Site Intelligence Matrix
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {project.projectCode}
              </span>
            </div>

            {/* Smart Short Title / Hero Heading */}
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-snug">
                {project.shortTitle || (
                  project.projectName.length > 80 
                    ? project.projectName.split('(')[0].trim() || project.projectName.slice(0, 80) + '...'
                    : project.projectName
                )}
              </h1>
              
              {/* Full Statutory Contract Description Dropdown/Detail */}
              <div className="mt-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Tajuk Rasmi Kontrak / Statutory Title:
                </span>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer title-hint" title="Klik untuk lihat penuh">
                  {project.projectName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Scope: <strong className="text-emerald-400 font-bold">{project.projectScope.replace('_', ' ')}</strong> • Tingkat: <strong className="text-slate-200">{project.towerStoreys} Tingkat</strong> • Basemen: <strong className="text-slate-200">{project.basementLevels} Levels</strong>. Core mengaktifkan <strong className="text-emerald-400">{modules.length} modul statutori khusus</strong> (OSHA 2022, CDM 2024, DOE ESCP).
            </p>
          </div>

          {/* Quick Real-Time Metrics Pillars */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 min-w-[130px] flex-1 lg:flex-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statutory Score</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">100%</p>
              <span className="text-[9px] text-emerald-500 font-bold">Compliant Day 1</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 min-w-[130px] flex-1 lg:flex-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safe Man-Hours</span>
              <p className="text-2xl font-black text-blue-400 mt-1">0</p>
              <span className="text-[9px] text-blue-500 font-bold">LTI-Free Active</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 min-w-[130px] flex-1 lg:flex-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Modules</span>
              <p className="text-2xl font-black text-white mt-1">{modules.length}</p>
              <span className="text-[9px] text-slate-400 font-bold">Auto-Synthesized</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Site Twin & Zone Hazard Map Mock */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Site Digital Twin &amp; Operational Zones
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live spatial view of active operations, permits, and environmental monitoring zones.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            All 4 Zones Monitored
          </span>
        </div>

        {/* Tactical Zone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { zone: 'Zon A: Menara Utama (Tower A)', level: 'Tingkat 1 - 45', status: 'Active Structural Work', color: 'border-blue-500/30 bg-blue-500/5' },
            { zone: 'Zon B: Basement & Podium', level: 'B1 - B3 Excavation', status: 'Deep Dewatering & Silt Trap', color: 'border-emerald-500/30 bg-emerald-500/5' },
            { zone: 'Zon C: Pintu Masuk & Hoarding', level: 'Ground Gate 1 & 2', status: 'Wash Trough & Flagman Active', color: 'border-amber-500/30 bg-amber-500/5' },
            { zone: 'Zon D: Kabin, Kantin & CLQ', level: 'Welfare Quarters', status: 'Akta 446 Compliant • Fogging Done', color: 'border-purple-500/30 bg-purple-500/5' },
          ].map((z, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${z.color} flex flex-col justify-between gap-2 shadow-sm`}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{z.level}</span>
                <h4 className="text-xs font-bold text-white mt-0.5">{z.zone}</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{z.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Synthesized Statutory Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-emerald-400" /> Active Operating Modules (Tailored by Core)
          </span>
          <span className="text-[10px] font-mono text-slate-500">Autonomous Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(mod => (
            <div 
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Activity size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {mod.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {mod.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {mod.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold text-emerald-400">
                <span>Access Module</span>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveMatrixView;
