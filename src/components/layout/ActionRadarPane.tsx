import React from 'react';
import { 
  Bell, ChevronRight, Sparkles, CheckCircle2, X
} from 'lucide-react';
import type { AICoreAdvisory } from '../../types/core';

interface ActionRadarPaneProps {
  advisories: AICoreAdvisory[];
  onActionClick: (advisory: AICoreAdvisory) => void;
  onClose?: () => void;
}

export const ActionRadarPane: React.FC<ActionRadarPaneProps> = ({
  advisories,
  onActionClick,
  onClose,
}) => {
  return (
    <aside className="w-88 max-w-[90vw] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none">
      
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Action Radar &amp; Audits
            </h3>
            <span className="text-[9px] font-mono text-slate-500 block">
              Autonomous Risk Watchdog
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
            {advisories.length} Pending
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Advisories Feed List */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Priority Action Required</span>
          <span>Statutory Ref</span>
        </div>

        {advisories.map(adv => (
          <div 
            key={adv.id} 
            className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 space-y-2.5 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                adv.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {adv.pillar} • {adv.severity}
              </span>
              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">
                {adv.statutoryReference}
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug">
              {adv.title}
            </h4>

            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
              {adv.description}
            </p>

            <button
              type="button"
              onClick={() => onActionClick(adv)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
            >
              <span>{adv.suggestedAction}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        ))}

        {advisories.length === 0 && (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500/40" />
            <p className="text-xs font-bold uppercase tracking-wider">All Statutory Checks Cleared</p>
            <p className="text-[10px]">Zero outstanding compliance gaps on radar</p>
          </div>
        )}
      </div>

      {/* Audit Log Heartbeat Strip */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Sparkles size={11} className="text-emerald-400" /> Auto-Scanning
          </span>
          <span className="text-slate-500 font-mono">Live • DOSH/DOE Radar</span>
        </div>
      </div>

    </aside>
  );
};

export default ActionRadarPane;
