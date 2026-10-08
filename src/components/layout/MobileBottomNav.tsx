import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, HardHat, Waves, Menu, X, 
  BookOpen, HeartHandshake, Building2, FileText, 
  ChevronRight, Bell, UserCheck, ShieldCheck
} from 'lucide-react';
import type { NavPillarId } from './SidebarCommandRail';

interface MobileBottomNavProps {
  activePillar: NavPillarId;
  onSelectPillar: (id: NavPillarId) => void;
  pendingAlertsCount: number;
  onOpenRadar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePillar,
  onSelectPillar,
  pendingAlertsCount,
  onOpenRadar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelect = (id: NavPillarId) => {
    onSelectPillar(id);
    setIsMenuOpen(false);
  };

  const ALL_PILLARS: Array<{ id: NavPillarId; label: string; sub: string; icon: any; color: string }> = [
    { id: 'overview', label: 'Executive AI Overview', sub: 'Project Health & Action Radar', icon: LayoutDashboard, color: 'text-emerald-400' },
    { id: 'daily_manpower', label: 'Daily Manpower Muster', sub: 'Headcount & Shift Trades', icon: Users, color: 'text-cyan-400' },
    { id: 'workers_db', label: 'Workers & AI Induction', sub: 'Passport/Permit OCR & Induction Pass', icon: UserCheck, color: 'text-emerald-400' },
    { id: 'dosh_ops', label: 'DOSH Site Ops & PTW', sub: 'PTW, Scaffolds, Plant & Lifting', icon: HardHat, color: 'text-rose-400' },
    { id: 'cdm_studio', label: 'CDM 2024 Studio', sub: 'Duty Holders & Reg 8 Notification', icon: BookOpen, color: 'text-amber-400' },
    { id: 'doe_env', label: 'DOE Environmental Suite', sub: 'Silt Trap, Rain Gauge & Waste', icon: Waves, color: 'text-emerald-400' },
    { id: 'health_welfare', label: 'Health, CLQ & Welfare', sub: 'Quarters Akta 446 & Fire Safety', icon: HeartHandshake, color: 'text-teal-400' },
    { id: 'corporate_subcon', label: 'Corporate & Subcontractors', sub: 'CIDB Vetting & Penalties', icon: Building2, color: 'text-purple-400' },
    { id: 'reports_analytics', label: 'SHO Monthly Reports', sub: 'Statutory Report & Documents', icon: FileText, color: 'text-blue-400' },
  ];

  return (
    <>
      {/* Fixed Bottom Bar on Mobile/Tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 pt-1.5 pb-2 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
          {/* Tab 1: Overview */}
          <button
            type="button"
            onClick={() => handleSelect('overview')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activePillar === 'overview' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={19} />
            <span className="text-[10px] mt-1 font-medium">Overview</span>
          </button>

          {/* Tab 2: Workers / Manpower */}
          <button
            type="button"
            onClick={() => handleSelect('workers_db')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activePillar === 'workers_db' || activePillar === 'daily_manpower'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={19} />
            <span className="text-[10px] mt-1 font-medium">Workers</span>
          </button>

          {/* Tab 3: Field Ops / DOSH */}
          <button
            type="button"
            onClick={() => handleSelect('dosh_ops')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activePillar === 'dosh_ops' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardHat size={19} />
            <span className="text-[10px] mt-1 font-medium">Field Ops</span>
          </button>

          {/* Tab 4: Environment DOE */}
          <button
            type="button"
            onClick={() => handleSelect('doe_env')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activePillar === 'doe_env' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves size={19} />
            <span className="text-[10px] mt-1 font-medium">DOE Env</span>
          </button>

          {/* Tab 5: All Pillars Menu Drawer */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
              isMenuOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Menu size={19} />
              {pendingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Slide-Up Bottom Sheet / Drawer for All 9 Pillars */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">HSE OS Command Center</h3>
                  <p className="text-[10px] text-slate-400">Select any Statutory Pillar or Operational Tool</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenRadar();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <Bell size={13} />
                  <span>{pendingAlertsCount} Alerts</span>
                </button>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List of All 9 Pillars */}
            <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {ALL_PILLARS.map((p) => {
                const Icon = p.icon;
                const isCurrent = activePillar === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isCurrent
                        ? 'bg-slate-800 border border-slate-700 text-white shadow-md'
                        : 'bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${p.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{p.label}</div>
                        <div className="text-[10px] text-slate-400">{p.sub}</div>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-500" />
                  </button>
                );
              })}
            </div>

            {/* Sheet Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-500">
              HSE OS Cloud v2.0 • 100% Mobile Responsive
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
