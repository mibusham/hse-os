import React, { useState } from 'react';
import { 
  Cpu, CloudRain, Thermometer, 
  Sparkles, Settings, Menu, Bell, RefreshCw
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';

interface CoreBrainHeaderProps {
  project: ProjectIdentity;
  onReconfigure: () => void;
  onOpenMobileMenu?: () => void;
  onOpenRadar?: () => void;
  onSyncEverine?: () => void;
  activeHazardsCount?: number;
  complianceScore?: number;
  statusLevel?: 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL_STOP_WORK';
}

export const CoreBrainHeader: React.FC<CoreBrainHeaderProps> = ({
  project,
  onReconfigure,
  onOpenMobileMenu,
  onOpenRadar,
  onSyncEverine,
  activeHazardsCount = 0,
  complianceScore = 100,
  statusLevel = 'OPTIMAL',
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
      
      {/* Left: Mobile Menu Button + Project Badge & Core Status */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0"
            title="Open All Pillars Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="relative shrink-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
            statusLevel === 'OPTIMAL' 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20' 
              : statusLevel === 'ELEVATED_RISK'
              ? 'bg-gradient-to-br from-amber-500 to-orange-700 shadow-amber-500/20'
              : 'bg-gradient-to-br from-rose-500 to-red-800 shadow-rose-500/30'
          }`}>
            <Cpu size={18} />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 animate-ping ${
            statusLevel === 'OPTIMAL' ? 'bg-emerald-400' : statusLevel === 'ELEVATED_RISK' ? 'bg-amber-400' : 'bg-rose-500'
          }`} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
            statusLevel === 'OPTIMAL' ? 'bg-emerald-400' : statusLevel === 'ELEVATED_RISK' ? 'bg-amber-400' : 'bg-rose-500'
          }`} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-[160px] sm:max-w-md lg:max-w-lg uppercase tracking-wide">
              {project.shortTitle || (
                project.projectName.length > 60
                  ? project.projectName.split('(')[0].trim() || project.projectName.slice(0, 60) + '...'
                  : project.projectName
              )}
            </h1>
            <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full border border-slate-700 shrink-0 hidden sm:inline">
              {project.projectCode}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5 truncate">
            <span className={`font-bold flex items-center gap-1 ${
              statusLevel === 'OPTIMAL' ? 'text-emerald-400' : statusLevel === 'ELEVATED_RISK' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              <Sparkles size={11} /> AI Watchdog
            </span>
            <span className="hidden md:inline">•</span>
            <span className="text-emerald-400 font-bold hidden md:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Cloud
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">{project.mainConName}</span>
          </div>
        </div>
      </div>

      {/* Right: Live MET Environmental Feed & Quick Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Real-Time Statutory Health Score */}
        <div className={`border rounded-2xl px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 sm:gap-2 ${
          statusLevel === 'OPTIMAL' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : statusLevel === 'ELEVATED_RISK'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
        }`}>
          <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">Health:</span>
          <span className="text-xs font-black font-mono">{complianceScore}%</span>
        </div>

        {/* Live Weather (Desktop / Tablet) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-3 py-1.5 hidden md:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Thermometer size={13} />
            <span>34°C</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1 text-blue-400 font-bold">
            <CloudRain size={13} />
            <span className="text-[10px] uppercase">Partly Cloudy</span>
          </div>
        </div>

        {/* Clickable Hazard Radar Button */}
        <button
          type="button"
          onClick={onOpenRadar}
          className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Open Risk Radar & Audits"
        >
          <Bell size={13} className={activeHazardsCount > 0 ? 'text-rose-400' : 'text-slate-400'} />
          <span className="text-[9px] font-black uppercase text-slate-400 hidden sm:inline">Radar:</span>
          <span className={`text-xs font-black flex items-center gap-1 ${
            activeHazardsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeHazardsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
            {activeHazardsCount}
          </span>
        </button>

        {/* Sync Everine Cloud Data Trigger */}
        {onSyncEverine && (
          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                await onSyncEverine();
              } finally {
                setIsSyncing(false);
              }
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Re-sync Everine 204 Workers & Historical Data"
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span className="text-[10px] font-bold hidden xl:inline">Sync Everine</span>
          </button>
        )}

        {/* Reconfigure Trigger */}
        <button
          type="button"
          onClick={onReconfigure}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Reconfigure Project Parameters"
        >
          <Settings size={15} />
        </button>

      </div>

    </header>
  );
};

export default CoreBrainHeader;
