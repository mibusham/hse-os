import React from 'react';
import { 
  ShieldCheck, HardHat, BookOpen, Droplets, 
  HeartHandshake, Building2, FileText, Activity
} from 'lucide-react';

export type NavPillarId = 
  | 'overview'
  | 'dosh_ops'
  | 'cdm_studio'
  | 'doe_env'
  | 'health_welfare'
  | 'corporate_subcon'
  | 'reports_analytics';

interface SidebarCommandRailProps {
  activePillar: NavPillarId;
  onSelectPillar: (id: NavPillarId) => void;
  badgeCounts?: {
    dosh?: number;
    cdm?: number;
    doe?: number;
    health?: number;
    corporate?: number;
  };
}

export const SidebarCommandRail: React.FC<SidebarCommandRailProps> = ({
  activePillar,
  onSelectPillar,
  badgeCounts = { dosh: 2, cdm: 1, doe: 1, health: 0, corporate: 0 }
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Executive Command Matrix',
      sublabel: 'Central Core Brain & KPIs',
      icon: Activity,
      category: 'CORE',
      badge: null,
    },
    {
      id: 'dosh_ops',
      label: 'DOSH Statutory & Site Ops',
      sublabel: 'OSHA 2022, PTW, JKKP PMA, Perancah 7-Hari',
      icon: HardHat,
      category: 'PILLAR 1',
      badge: badgeCounts.dosh,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'cdm_studio',
      label: 'CDM 2024 Governance Studio',
      sublabel: 'Duty Holders, Reg 8, ERIC Risk, Dossier',
      icon: BookOpen,
      category: 'PILLAR 2',
      badge: badgeCounts.cdm,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'doe_env',
      label: 'DOE / JAS Environment & ESCP',
      sublabel: 'Earth Drain, Silt Trap, 180D Waste, 3R',
      icon: Droplets,
      category: 'PILLAR 3',
      badge: badgeCounts.doe,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'health_welfare',
      label: 'Health, CLQ & Welfare Suite',
      sublabel: 'Akta 446 Quarters, Denggi Fogging, Heat',
      icon: HeartHandshake,
      category: 'PILLAR 4',
      badge: badgeCounts.health,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'corporate_subcon',
      label: 'Corporate & Subcon Vetting',
      sublabel: 'CIDB Grade G7, Insurans CAR, Blacklist',
      icon: Building2,
      category: 'PILLAR 5',
      badge: badgeCounts.corporate,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'reports_analytics',
      label: 'Statutory Reports & Man-Hours',
      sublabel: 'DOSH Monthly Report, A×B×C=D Formula',
      icon: FileText,
      category: 'ANALYTICS',
      badge: null,
    },
  ];

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      
      {/* Brand & Project Identity Block */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-sm tracking-wider uppercase">HSE OS</span>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                PRO v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              Autonomous Safety Operating System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pillar Rail List */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const isActive = activePillar === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPillar(item.id as NavPillarId)}
              className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 relative group ${
                isActive
                  ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-md ring-1 ring-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400" />
              )}

              <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 border border-slate-800'
              }`}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {item.category}
                  </span>
                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                      {item.badge} ACTION
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {item.label}
                </h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Statutory Governance Live Heartbeat Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400">Statutory Core Active</span>
        </div>
        <span className="text-[9px] font-mono text-slate-600">DOSH • DOE • CIDB</span>
      </div>

    </aside>
  );
};

export default SidebarCommandRail;
