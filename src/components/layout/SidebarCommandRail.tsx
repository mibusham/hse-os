import React from 'react';
import { 
  ShieldCheck, HardHat, BookOpen, Droplets, 
  HeartHandshake, Building2, FileText, Activity,
  Users, UserCheck
} from 'lucide-react';

export type NavPillarId = 
  | 'overview'
  | 'daily_manpower'
  | 'workers_db'
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
    workers?: number;
    manpower?: number;
  };
}

export const SidebarCommandRail: React.FC<SidebarCommandRailProps> = ({
  activePillar,
  onSelectPillar,
  badgeCounts = { dosh: 2, cdm: 1, doe: 1, health: 0, corporate: 0 }
}) => {
  // Operational Items (Daily Field Ops from ytchse)
  const operationalItems = [
    {
      id: 'daily_manpower',
      label: 'Kehadiran Manpower Harian',
      sublabel: 'Daily Muster, Kuota & Shift',
      icon: Users,
      badge: null,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'workers_db',
      label: 'Pekerja & Kad Hijau CIDB',
      sublabel: 'Direktori Pekerja & Induksi Tapak',
      icon: UserCheck,
      badge: badgeCounts.workers,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'dosh_ops',
      label: 'Pemeriksaan & PTW Tapak',
      sublabel: 'OSHA 2022, Tag Perancah 7-Hari & JKKP',
      icon: HardHat,
      badge: badgeCounts.dosh,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'doe_env',
      label: 'Alam Sekitar & Sisa Berjadual',
      sublabel: 'Ujian Silt Trap TSS, e-SWIS 180 Hari',
      icon: Droplets,
      badge: badgeCounts.doe,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'health_welfare',
      label: 'Kesihatan, Vektor & CLQ',
      sublabel: 'Fogging Aedes 14-Hari, CLQ Akta 446',
      icon: HeartHandshake,
      badge: badgeCounts.health,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  ];

  // Governance & Statutory Items
  const statutoryItems = [
    {
      id: 'overview',
      label: 'Executive Command Matrix',
      sublabel: 'Core Watchdog & Site Twin',
      icon: Activity,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'cdm_studio',
      label: 'Tadbir Urus CDM 2024',
      sublabel: 'Borang JKKP 103 & Duty Holders',
      icon: BookOpen,
      badge: badgeCounts.cdm,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'corporate_subcon',
      label: 'Saringan Subkontraktor',
      sublabel: 'Gred CIDB, Insurans CAR & AI Copilot',
      icon: Building2,
      badge: badgeCounts.corporate,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'reports_analytics',
      label: 'Laporan Bulanan SHO & Lejar',
      sublabel: 'Laporan Seksyen 29, Safe Man-Hours',
      icon: FileText,
      badge: null,
      badgeColor: '',
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
                CLOUD v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              Google Cloud Safety Operating System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pillar Rail List */}
      <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* Section 1: Operasi Harian Tapak (Daily Field Ops) */}
        <div className="space-y-1">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
              Operasi Tapak Harian
            </span>
            <span className="text-[9px] font-mono text-slate-500">Field Ops</span>
          </div>

          {operationalItems.map(item => {
            const isActive = activePillar === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPillar(item.id as NavPillarId)}
                className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-start gap-3 relative group ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-md ring-1 ring-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400" />
                )}

                <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 border border-slate-800'
                }`}>
                  <Icon size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </h4>
                    {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Section 2: Tadbir Urus & Laporan Berkanun */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Tadbir Urus &amp; Laporan
            </span>
            <span className="text-[9px] font-mono text-slate-500">Statutory</span>
          </div>

          {statutoryItems.map(item => {
            const isActive = activePillar === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPillar(item.id as NavPillarId)}
                className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-start gap-3 relative group ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400" />
                )}

                <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 border border-slate-800'
                }`}>
                  <Icon size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </h4>
                    {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

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
