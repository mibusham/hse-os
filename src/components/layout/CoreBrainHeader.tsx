import React from 'react';
import { 
  Cpu, CloudRain, Thermometer, 
  Sparkles, Settings
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

interface CoreBrainHeaderProps {
  project: ProjectIdentity;
  onReconfigure: () => void;
  activeHazardsCount?: number;
}

export const CoreBrainHeader: React.FC<CoreBrainHeaderProps> = ({
  project,
  onReconfigure,
  activeHazardsCount = 3,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      
      {/* Left: Project Badge & Core Status */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Cpu size={20} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md lg:max-w-lg uppercase tracking-wide">
              {project.shortTitle || (
                project.projectName.length > 60
                  ? project.projectName.split('(')[0].trim() || project.projectName.slice(0, 60) + '...'
                  : project.projectName
              )}
            </h1>
            <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
              {project.projectCode}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles size={11} /> AI Site Director Online
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Google Cloud Synced
            </span>
            <span>•</span>
            <span className="text-slate-300">{project.mainConName}</span>
            <span>•</span>
            <span>{project.location}</span>
          </div>
        </div>
      </div>

      {/* Right: Live MET Environmental Feed & Quick Action Tools */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Live Weather / MET Malaysia Advisory Pill */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Thermometer size={14} />
            <span>34°C</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <CloudRain size={14} />
            <span className="text-[10px] uppercase">Partly Cloudy</span>
          </div>
          <div className="h-3 w-px bg-slate-800 hidden sm:block" />
          <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
            MET Malaysia Live
          </span>
        </div>

        {/* Hazard Radar Indicator */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2">
          <span className="text-[9px] font-black uppercase text-slate-400">Risk Radar:</span>
          <span className="text-xs font-black text-rose-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {activeHazardsCount} Priority
          </span>
        </div>

        {/* Reconfigure Trigger */}
        <button
          type="button"
          onClick={onReconfigure}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Reconfigure Project Parameters"
        >
          <Settings size={16} />
        </button>

      </div>

    </header>
  );
};

export default CoreBrainHeader;
