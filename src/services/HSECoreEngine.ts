import type { ProjectIdentity, HSEModuleConfig, AICoreAdvisory } from '../types/core';

/**
 * The Autonomous Synthesis Engine of HSE OS.
 * Analyzes project parameters and formulates tailored modules, baseline statutory roadmaps, and proactive alerts.
 */
export class HSECoreEngine {
  /**
   * Synthesizes relevant HSE OS modules based on project scope & parameters
   */
  static synthesizeModules(project: ProjectIdentity): HSEModuleConfig[] {
    const modules: HSEModuleConfig[] = [
      // Standard Core Modules for All Sites
      {
        id: 'workforce_induction',
        title: 'Workforce Induction & CIDB Green Card',
        category: 'GOVERNANCE',
        icon: 'Users',
        enabled: true,
        reason: 'Mandatory for all construction sites under CIDB Act 520.',
      },
      {
        id: 'ptw_engine',
        title: 'Permit To Work (PTW) & Digital Endorsement',
        category: 'SAFETY',
        icon: 'FileCheck',
        enabled: true,
        reason: 'High-risk activity authorization under OSHA 1994 (Amendment 2022).',
      },
      {
        id: 'safe_manhours',
        title: 'Safe Man-Hours & LTI Tracker',
        category: 'SAFETY',
        icon: 'Clock',
        enabled: true,
        reason: 'Statutory Monthly Safety Report standard calculation (A × B × C = D).',
      },
      {
        id: 'emergency_ert',
        title: 'Fire Protection & ERT Readiness',
        category: 'SAFETY',
        icon: 'Flame',
        enabled: true,
        reason: 'BOMBA & OSHA emergency preparedness compliance.',
      },
      {
        id: 'first_aid_welfare',
        title: 'First Aid & Health Surveillance',
        category: 'HEALTH',
        icon: 'Activity',
        enabled: true,
        reason: 'DOSH Guidelines on First Aid in Workplace 2004.',
      },
      {
        id: 'vector_control',
        title: 'Anti-Aedes Vector Control (14-Day Fogging)',
        category: 'HEALTH',
        icon: 'Bug',
        enabled: true,
        reason: 'Mandatory under Destruction of Disease-Bearing Insects Act 1975.',
      },
      {
        id: 'waste_3r',
        title: 'Solid Waste & 3R Scrap Metal Logistics',
        category: 'ENVIRONMENT',
        icon: 'Trash2',
        enabled: true,
        reason: 'SWCorp & PBT commercial waste disposal governance.',
      },
    ];

    // Dynamic Module Injection: Landed Residential Housing (Rumah Teres / Berkembar)
    if (project.projectScope === 'LANDED_RESIDENTIAL') {
      modules.push(
        {
          id: 'landed_traffic_mobile_plant',
          title: 'Site Logistics, Backhoe & Mobile Plant Traffic Plan',
          category: 'SAFETY',
          icon: 'Anchor',
          enabled: true,
          reason: 'Landed housing horizontal sprawling requires strict segregation of public roads, concrete mixers & backhoes.',
        },
        {
          id: 'roof_truss_safety',
          title: 'Roof Truss, Rafters & Fall Prevention System',
          category: 'SAFETY',
          icon: 'Layers',
          enabled: true,
          reason: 'Roof structure installation and tiling works at 2-storey level require static lifeline and catch net.',
        },
        {
          id: 'frame_scaffolding',
          title: 'Tubular Frame Scaffolding & Bricklaying Platforms',
          category: 'SAFETY',
          icon: 'Shield',
          enabled: true,
          reason: 'External plastering, bricklaying and RC slab casting for terraced houses.',
        }
      );
    }

    // Dynamic Module Injection: High-Rise Structures
    if (project.projectScope === 'HIGH_RISE' || (project.projectScope !== 'LANDED_RESIDENTIAL' && project.towerStoreys > 4)) {
      modules.push(
        {
          id: 'scaffolding_osha',
          title: '7-Day Scaffolding Inspection (OSHA 1994 Amendment 2022)',
          category: 'SAFETY',
          icon: 'Layers',
          enabled: true,
          reason: `Activated as structure has ${project.towerStoreys} storeys requiring statutory access scaffolding and fall arrest systems.`,
        },
        {
          id: 'lifting_pma',
          title: 'Tower Crane, Passenger Hoist & DOSH PMA Certification',
          category: 'SAFETY',
          icon: 'Anchor',
          enabled: true,
          reason: 'High-level lifting operations require statutory DOSH Certificate of Fitness (PMA) and certified lifting plans.',
        },
        {
          id: 'gondola_facade',
          title: 'Suspended Access Equipment (Gondola) & Facade Safety',
          category: 'SAFETY',
          icon: 'Shield',
          enabled: true,
          reason: 'External facade installation requires Professional Engineer (PE) certified roof anchorage points.',
        }
      );
    }

    // Dynamic Module Injection: Deep Excavation & Basements
    if (project.hasDeepExcavation || project.basementLevels > 0) {
      modules.push(
        {
          id: 'deep_trench_escp',
          title: 'Deep Excavation, Shoring & Dewatering',
          category: 'SAFETY',
          icon: 'AlertTriangle',
          enabled: true,
          reason: `Detected ${project.basementLevels} basement levels with deep excavation hazards (trench collapse & soil settlement).`,
        },
        {
          id: 'escp_silt_trap',
          title: 'DOE/JAS Earth Drains, Silt Traps & Check Dams',
          category: 'ENVIRONMENT',
          icon: 'Droplets',
          enabled: true,
          reason: 'Earthwork phase requires strict Erosion and Sediment Control Plan (ESCP) compliance.',
        }
      );
    }

    // Dynamic Module Injection: CDM 2024
    if (project.isReg8Notifiable) {
      modules.push({
        id: 'cdm_2024_dossier',
        title: 'CDM 2024 Dossier (PCI, CPP & H&S File)',
        category: 'CDM',
        icon: 'BookOpen',
        enabled: true,
        reason: 'Project surpasses Regulation 8 threshold (>30 days / >20 workers / >500 person-days), triggering mandatory JKKP notification.',
      });
    }

    return modules;
  }

  /**
   * The Active Autonomous Site Watchdog Engine.
   * Dynamically audits all real-time operational data across the 5 statutory pillars
   * and computes live statutory compliance scores and priority advisories.
   */
  static runAutonomousAudit(
    project: ProjectIdentity,
    liveData?: {
      ptws?: any[];
      inspections?: any[];
      subcons?: any[];
      waterSamples?: any[];
      fogging?: any[];
      dutyHolders?: any[];
      workers?: any[];
    }
  ): {
    advisories: AICoreAdvisory[];
    complianceScore: number;
    statusLevel: 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL_STOP_WORK';
    lastScanTimestamp: string;
  } {
    const advisories: AICoreAdvisory[] = [];
    const timestamp = new Date().toISOString();

    if (!project) {
      return {
        advisories: [],
        complianceScore: 100,
        statusLevel: 'OPTIMAL',
        lastScanTimestamp: timestamp,
      };
    }

    // Load data from liveData or localStorage fallback
    let ptws = liveData?.ptws;
    let inspections = liveData?.inspections;
    let subcons = liveData?.subcons;
    let waterSamples = liveData?.waterSamples;
    let fogging = liveData?.fogging;
    let dutyHolders = liveData?.dutyHolders;
    let workers = liveData?.workers;

    try {
      if (!ptws) {
        const stored = localStorage.getItem('hse_os_ptw_list');
        if (stored) ptws = JSON.parse(stored);
      }
      if (!inspections) {
        const stored = localStorage.getItem('hse_os_inspections_list');
        if (stored) inspections = JSON.parse(stored);
      }
      if (!subcons) {
        const stored = localStorage.getItem('hse_os_subcontractors_list');
        if (stored) subcons = JSON.parse(stored);
      }
      if (!waterSamples) {
        const stored = localStorage.getItem('hse_os_doe_water_samples');
        if (stored) waterSamples = JSON.parse(stored);
      }
      if (!fogging) {
        const stored = localStorage.getItem('hse_os_health_fogging_list');
        if (stored) fogging = JSON.parse(stored);
      }
      if (!dutyHolders) {
        const stored = localStorage.getItem('hse_os_cdm_duty_holders');
        if (stored) dutyHolders = JSON.parse(stored);
      }
      if (!workers) {
        const stored = localStorage.getItem('hse_os_site_workers_directory');
        if (stored) workers = JSON.parse(stored);
      }
    } catch (e) {}

    ptws = ptws || [];
    inspections = inspections || [];
    subcons = subcons || [];
    waterSamples = waterSamples || [];
    fogging = fogging || [];
    dutyHolders = dutyHolders || [];
    workers = workers || [];

    // 1. PILLAR 1 DOSH AUDIT: 7-Day Inspection Red Tags
    const redTags = inspections.filter((i: any) => i.status === 'REJECT_RED_TAG');
    redTags.forEach((insp: any) => {
      advisories.push({
        id: `adv-redtag-${insp.id}`,
        severity: 'CRITICAL',
        pillar: 'DOSH',
        title: `⚠️ CRITICAL RED TAG: ${insp.tagNo} (${(insp.itemType || '').replace(/_/g, ' ')}) Failed 7-Day Inspection!`,
        description: `Inspection at ${insp.location} flagged unsafe equipment/structure (${insp.remarks || 'Physical damage/defect'}). OSHA 1994 (Amendment 2022) mandates immediate stoppage of work.`,
        statutoryReference: 'OSHA 1994 (Amendment 2022) • Section 15 & DOSH Guidelines',
        suggestedAction: 'Open Site Inspections & rectify structure before re-tagging Green',
        actionRoute: 'dosh_ops',
        timestamp,
      });
    });

    // 2. PILLAR 1 DOSH AUDIT: Expired or Revoked PTWs
    const expiredPtws = ptws.filter((p: any) => p.status === 'EXPIRED');
    if (expiredPtws.length > 0) {
      advisories.push({
        id: 'adv-ptw-expired',
        severity: 'WARNING',
        pillar: 'DOSH',
        title: `Permit To Work Expired / Revoked (${expiredPtws.length} Active PTWs Detected)`,
        description: `High-risk operational zones (${expiredPtws.map((p: any) => p.locationZone).join(', ')}) are unauthorized without a valid PTW. Personnel must be evacuated immediately.`,
        statutoryReference: 'OSHA 1994 Section 15 • Mandatory HIRADC PTW',
        suggestedAction: 'Review & close expired permits in Inspections & PTW',
        actionRoute: 'dosh_ops',
        timestamp,
      });
    }

    // 3. PILLAR 3 DOE AUDIT: Silt Trap TSS Water Discharge Limit (<50 mg/L)
    const latestWater = waterSamples[0];
    if (latestWater && Number(latestWater.tssValue) > 50) {
      advisories.push({
        id: 'adv-doe-tss-high',
        severity: 'CRITICAL',
        pillar: 'DOE',
        title: `⚠️ SILT TRAP WATER DISCHARGE EXCEEDS DOE LIMIT (${latestWater.tssValue} mg/L > 50 mg/L)!`,
        description: `Effluent sample at ${latestWater.location} recorded ${latestWater.tssValue} mg/L (statutory limit: 50 mg/L). Risk of silt pollution into public drainage. Potential compound under Section 34A EQA 1974.`,
        statutoryReference: 'Environmental Quality Act 1974 (Act 127) • DOE ESCP Plan',
        suggestedAction: 'Desilt sediment basin & install geotextile filter immediately',
        actionRoute: 'doe_env',
        timestamp,
      });
    }

    // 4. PILLAR 4 HEALTH AUDIT: Anti-Aedes 14-Day Fogging Cycle Check
    const latestFog = fogging[0];
    if (latestFog) {
      const daysSinceFog = Math.floor((Date.now() - new Date(latestFog.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceFog > 14) {
        advisories.push({
          id: 'adv-health-fogging-overdue',
          severity: 'CRITICAL',
          pillar: 'HEALTH',
          title: `⚠️ Aedes Fogging Cycle Overdue (${daysSinceFog} Days > 14-Day Limit)!`,
          description: `Anti-Aedes thermal fogging at ${latestFog.area} has expired beyond statutory interval. Vector breeding risk and compound liability under Act 130.`,
          statutoryReference: 'Destruction of Disease-Bearing Insects Act 1975 (Act 130)',
          suggestedAction: 'Schedule thermal fogging in Health & Vector Suite',
          actionRoute: 'health_welfare',
          timestamp,
        });
      }
    }

    // 5. PILLAR 5 CORPORATE AUDIT: Subcontractors Vetting
    const pendingSubcons = subcons.filter((s: any) => s.status === 'PENDING_DOCS');
    if (pendingSubcons.length > 0) {
      advisories.push({
        id: 'adv-subcon-pending',
        severity: 'WARNING',
        pillar: 'CORPORATE',
        title: `Subcontractor CAR / CIDB Vetting Incomplete (${pendingSubcons.length} Firms)`,
        description: `Companies (${pendingSubcons.map((s: any) => s.name).join(', ')}) have pending CAR insurance or incomplete CIDB Green Card registration.`,
        statutoryReference: 'CIDB Act 520 • Principal Contractor CAR Insurance Clause',
        suggestedAction: 'Review subcontractor documentation in Subcontractor Vetting',
        actionRoute: 'corporate_subcon',
        timestamp,
      });
    }

    // 6. PILLAR 2 CDM 2024 AUDIT: Regulation 8 Notification Check
    if (project?.isReg8Notifiable) {
      advisories.push({
        id: 'adv-cdm-reg8',
        severity: 'CRITICAL',
        pillar: 'CDM',
        title: 'Mandatory Regulation 8 Notification Notice (DOSH Form 103)',
        description: `Project exceeds statutory threshold (${(project.estimatedPersonDays || 0).toLocaleString()} person-days). Formal DOSH Form 103 must be submitted to State DOSH Office prior to site works.`,
        statutoryReference: 'CDM Regulations 2024 (Regulation 8) • Section 34B OSHA 1994',
        suggestedAction: 'Open CDM 2024 Studio & print official DOSH Form 103',
        actionRoute: 'cdm_studio',
        timestamp,
      });
    }

    // 7. WORKER REGISTRY AUDIT: Expired CIDB Green Cards or Missing Induction
    const todayDate = new Date().toISOString().split('T')[0];
    const expiredCards = workers.filter((w: any) => w.status === 'ACTIVE' && w.greenCardExpiry && w.greenCardExpiry < todayDate);
    if (expiredCards.length > 0) {
      advisories.push({
        id: 'adv-worker-cidb-expired',
        severity: 'CRITICAL',
        pillar: 'CORPORATE',
        title: `⚠️ Expired CIDB Green Cards Detected (${expiredCards.length} Active Personnel)!`,
        description: `Workers (${expiredCards.map((w: any) => w.fullName).slice(0, 3).join(', ')}${expiredCards.length > 3 ? '...' : ''}) have expired Green Cards. Under CIDB Act 520 & OSHA 2022 Section 15, uncertified workers are strictly prohibited from site zones.`,
        statutoryReference: 'Lembaga Pembangunan Industri Pembinaan Malaysia Act 1994 (Act 520) • Section 33',
        suggestedAction: 'Open Workers Directory & update CIDB Green Card renewal',
        actionRoute: 'workers_db',
        timestamp,
      });
    }

    const uninductedWorkers = workers.filter((w: any) => w.status === 'ACTIVE' && !w.hasPassedInduction);
    if (uninductedWorkers.length > 0) {
      advisories.push({
        id: 'adv-worker-no-induction',
        severity: 'WARNING',
        pillar: 'DOSH',
        title: `Workers Pending Safety Induction (${uninductedWorkers.length} Personnel)`,
        description: `New workers (${uninductedWorkers.map((w: any) => w.fullName).slice(0, 3).join(', ')}) have not completed mandatory site safety induction.`,
        statutoryReference: 'OSHA 1994 (Amendment 2022) • Section 15 General Duties of Employers',
        suggestedAction: 'Conduct site safety induction and mark passed in Workers Directory',
        actionRoute: 'workers_db',
        timestamp,
      });
    }

    // Compute Dynamic Compliance Score
    let score = 100;
    advisories.forEach(adv => {
      if (adv.severity === 'CRITICAL') score -= 15;
      else if (adv.severity === 'WARNING') score -= 5;
    });
    score = Math.max(15, Math.min(100, score));

    let statusLevel: 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL_STOP_WORK' = 'OPTIMAL';
    if (advisories.some(a => a.severity === 'CRITICAL')) {
      statusLevel = 'CRITICAL_STOP_WORK';
    } else if (advisories.length > 0) {
      statusLevel = 'ELEVATED_RISK';
    }

    return {
      advisories,
      complianceScore: score,
      statusLevel,
      lastScanTimestamp: timestamp,
    };
  }

  /**
   * Generates initial proactive advisories from Core on Day 1 (Legacy fallback)
   */
  static generateDayOneAdvisories(project: ProjectIdentity): AICoreAdvisory[] {
    const audit = this.runAutonomousAudit(project);
    return audit.advisories;
  }
}

