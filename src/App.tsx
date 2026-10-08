import React, { useState, useEffect } from 'react';
import type { ProjectIdentity } from './types/core';
import { HSECoreEngine } from './services/HSECoreEngine';
import { ProjectService } from './services/projectService';
import ProjectInceptionWizard from './components/ProjectInceptionWizard';
import SidebarCommandRail from './components/layout/SidebarCommandRail';
import type { NavPillarId } from './components/layout/SidebarCommandRail';
import CoreBrainHeader from './components/layout/CoreBrainHeader';
import ActionRadarPane from './components/layout/ActionRadarPane';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import ExecutiveMatrixView from './components/views/ExecutiveMatrixView';
import DailyManpowerView from './components/views/DailyManpowerView';
import WorkerDirectoryView from './components/views/WorkerDirectoryView';
import DoshOpsPillarView from './components/views/DoshOpsPillarView';
import CdmStudioPillarView from './components/views/CdmStudioPillarView';
import DoeEnvPillarView from './components/views/DoeEnvPillarView';
import HealthWelfarePillarView from './components/views/HealthWelfarePillarView';
import CorporateSubconPillarView from './components/views/CorporateSubconPillarView';
import ReportsAnalyticsPillarView from './components/views/ReportsAnalyticsPillarView';

export const App: React.FC = () => {
  const [project, setProject] = useState<ProjectIdentity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePillar, setActivePillar] = useState<NavPillarId>('overview');
  const [, setSelectedModule] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isRadarSheetOpen, setIsRadarSheetOpen] = useState<boolean>(false);
  const [coreAudit, setCoreAudit] = useState<{
    advisories: any[];
    complianceScore: number;
    statusLevel: 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL_STOP_WORK';
    lastScanTimestamp: string;
  }>({
    advisories: [],
    complianceScore: 100,
    statusLevel: 'OPTIMAL',
    lastScanTimestamp: new Date().toISOString(),
  });

  // Load project on mount from Supabase Cloud / local cache
  useEffect(() => {
    async function initProject() {
      try {
        const { project: loadedProject } = await ProjectService.loadActiveProject();
        if (loadedProject) {
          setProject(loadedProject);
          setCoreAudit(HSECoreEngine.runAutonomousAudit(loadedProject));
        }
      } catch (e) {
        console.error('Failed to load project:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initProject();
  }, []);

  // Continuous Heartbeat: Scans site operational datasets every 2.5 seconds
  useEffect(() => {
    if (!project) return;
    const interval = setInterval(() => {
      setCoreAudit(HSECoreEngine.runAutonomousAudit(project));
    }, 2500);
    return () => clearInterval(interval);
  }, [project, activePillar]);

  const handleProjectComplete = async (newProject: ProjectIdentity) => {
    await ProjectService.saveProject(newProject);
    setProject(newProject);
    setCoreAudit(HSECoreEngine.runAutonomousAudit(newProject));
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100 font-sans">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
          Connecting to Cloud Core...
        </p>
      </div>
    );
  }

  // If no project has been initialized, launch Day 1 Core Inception Wizard
  if (!project) {
    return (
      <ProjectInceptionWizard 
        onComplete={handleProjectComplete} 
      />
    );
  }

  const modules = HSECoreEngine.synthesizeModules(project);
  const advisories = coreAudit.advisories;

  const handleSelectModule = (modId: string) => {
    setSelectedModule(modId);
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    if (mod.category === 'SAFETY') setActivePillar('dosh_ops');
    else if (mod.category === 'CDM') setActivePillar('cdm_studio');
    else if (mod.category === 'ENVIRONMENT') setActivePillar('doe_env');
    else if (mod.category === 'HEALTH') setActivePillar('health_welfare');
    else if (mod.category === 'GOVERNANCE') setActivePillar('corporate_subcon');
  };

  const handleActionClick = (adv: any) => {
    if (adv.actionRoute) {
      setActivePillar(adv.actionRoute as NavPillarId);
      return;
    }
    if (adv.pillar === 'DOSH') setActivePillar('dosh_ops');
    else if (adv.pillar === 'CDM') setActivePillar('cdm_studio');
    else if (adv.pillar === 'DOE') setActivePillar('doe_env');
    else if (adv.pillar === 'HEALTH') setActivePillar('health_welfare');
    else if (adv.pillar === 'CORPORATE') setActivePillar('corporate_subcon');
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Zone Left: Desktop Command Rail */}
      <div className="hidden lg:flex shrink-0 w-72 xl:w-80 h-full border-r border-slate-800">
        <SidebarCommandRail
          activePillar={activePillar}
          onSelectPillar={(pillarId) => {
            setActivePillar(pillarId);
            setSelectedModule(null);
          }}
          badgeCounts={{
            dosh: advisories.filter(a => a.pillar === 'DOSH').length,
            cdm: advisories.filter(a => a.pillar === 'CDM').length,
            doe: advisories.filter(a => a.pillar === 'DOE').length,
            health: advisories.filter(a => a.pillar === 'HEALTH').length,
            corporate: advisories.filter(a => a.pillar === 'CORPORATE').length,
            workers: advisories.filter(a => a.actionRoute === 'workers_db').length,
          }}
        />
      </div>

      {/* Mobile Off-Canvas Drawer (Left) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            <SidebarCommandRail
              activePillar={activePillar}
              onSelectPillar={(pillarId) => {
                setActivePillar(pillarId);
                setSelectedModule(null);
                setIsMobileDrawerOpen(false);
              }}
              onClose={() => setIsMobileDrawerOpen(false)}
              badgeCounts={{
                dosh: advisories.filter(a => a.pillar === 'DOSH').length,
                cdm: advisories.filter(a => a.pillar === 'CDM').length,
                doe: advisories.filter(a => a.pillar === 'DOE').length,
                health: advisories.filter(a => a.pillar === 'HEALTH').length,
                corporate: advisories.filter(a => a.pillar === 'CORPORATE').length,
                workers: advisories.filter(a => a.actionRoute === 'workers_db').length,
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Central Zone: Main Viewport (Header + Scrollable Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Autonomous Core Brain Header */}
        <CoreBrainHeader
          project={project}
          onReconfigure={() => setProject(null)}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenRadar={() => setIsRadarSheetOpen(true)}
          onSyncEverine={async () => {
            const evr = await ProjectService.initializeWithEverineData();
            setProject(evr);
            setCoreAudit(HSECoreEngine.runAutonomousAudit(evr));
          }}
          activeHazardsCount={advisories.length}
          complianceScore={coreAudit.complianceScore}
          statusLevel={coreAudit.statusLevel}
        />

        {/* Scrollable Central Working Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 bg-slate-950/80">
          {activePillar === 'overview' && (
            <ExecutiveMatrixView
              project={project}
              modules={modules}
              onSelectModule={handleSelectModule}
              complianceScore={coreAudit.complianceScore}
              advisoriesCount={advisories.length}
            />
          )}

          {activePillar === 'daily_manpower' && (
            <DailyManpowerView project={project} />
          )}

          {activePillar === 'workers_db' && (
            <WorkerDirectoryView project={project} />
          )}

          {activePillar === 'dosh_ops' && (
            <DoshOpsPillarView project={project} />
          )}

          {activePillar === 'cdm_studio' && (
            <CdmStudioPillarView project={project} />
          )}

          {activePillar === 'doe_env' && (
            <DoeEnvPillarView project={project} />
          )}

          {activePillar === 'health_welfare' && (
            <HealthWelfarePillarView project={project} />
          )}

          {activePillar === 'corporate_subcon' && (
            <CorporateSubconPillarView project={project} />
          )}

          {activePillar === 'reports_analytics' && (
            <ReportsAnalyticsPillarView project={project} />
          )}
        </main>

      </div>

      {/* 3. Zone Right: Action Radar & Live Audit Pane */}
      {/* Desktop Persistent Rail (>= 2xl) */}
      <div className="hidden 2xl:flex shrink-0 w-88 h-full">
        <ActionRadarPane
          advisories={advisories}
          onActionClick={handleActionClick}
        />
      </div>

      {/* Mobile & Tablet Slide-out Drawer (< 2xl) */}
      {isRadarSheetOpen && (
        <div className="2xl:hidden fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRadarSheetOpen(false)}
          />
          <div className="relative w-88 max-w-[90vw] h-full bg-slate-900 border-l border-slate-800 shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
            <ActionRadarPane
              advisories={advisories}
              onActionClick={(adv) => {
                handleActionClick(adv);
                setIsRadarSheetOpen(false);
              }}
              onClose={() => setIsRadarSheetOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 4. Touch Navigation Bar (Mobile / Tablet Only) */}
      <MobileBottomNav
        activePillar={activePillar}
        onSelectPillar={(pillarId) => {
          setActivePillar(pillarId);
          setSelectedModule(null);
        }}
        pendingAlertsCount={advisories.length}
        onOpenRadar={() => setIsRadarSheetOpen(true)}
      />

    </div>
  );
};

export default App;
