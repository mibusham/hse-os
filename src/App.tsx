import React, { useState, useEffect } from 'react';
import type { ProjectIdentity } from './types/core';
import { HSECoreEngine } from './services/HSECoreEngine';
import { ProjectService } from './services/projectService';
import ProjectInceptionWizard from './components/ProjectInceptionWizard';
import SidebarCommandRail from './components/layout/SidebarCommandRail';
import type { NavPillarId } from './components/layout/SidebarCommandRail';
import CoreBrainHeader from './components/layout/CoreBrainHeader';
import ActionRadarPane from './components/layout/ActionRadarPane';
import ExecutiveMatrixView from './components/views/ExecutiveMatrixView';
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

  // Load project on mount from Supabase Cloud / local cache
  useEffect(() => {
    async function initProject() {
      try {
        const { project: loadedProject } = await ProjectService.loadActiveProject();
        if (loadedProject) {
          setProject(loadedProject);
        }
      } catch (e) {
        console.error('Failed to load project:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initProject();
  }, []);

  const handleProjectComplete = async (newProject: ProjectIdentity) => {
    await ProjectService.saveProject(newProject);
    setProject(newProject);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100 font-sans">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
          Connecting to Google Cloud Firestore...
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
  const advisories = HSECoreEngine.generateDayOneAdvisories(project);

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
    if (adv.pillar === 'DOSH') setActivePillar('dosh_ops');
    else if (adv.pillar === 'CDM') setActivePillar('cdm_studio');
    else if (adv.pillar === 'DOE') setActivePillar('doe_env');
    else if (adv.pillar === 'HEALTH') setActivePillar('health_welfare');
    else if (adv.pillar === 'CORPORATE') setActivePillar('corporate_subcon');
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Zone Left: The Sidebar Command Rail */}
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
        }}
      />

      {/* 2. Central Zone: Main Viewport (Header + Scrollable Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Autonomous Core Brain Header */}
        <CoreBrainHeader
          project={project}
          onReconfigure={() => setProject(null)}
          activeHazardsCount={advisories.length}
        />

        {/* Scrollable Central Working Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-slate-950/80">
          {activePillar === 'overview' && (
            <ExecutiveMatrixView
              project={project}
              modules={modules}
              onSelectModule={handleSelectModule}
            />
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

      {/* 3. Zone Right: The Action Radar & Live Audit Pane */}
      <ActionRadarPane
        advisories={advisories}
        onActionClick={handleActionClick}
      />

    </div>
  );
};

export default App;
