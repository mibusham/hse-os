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
          title: 'Pemeriksaan Perancah 7-Hari (OSHA 1994 Pindaan 2022)',
          category: 'SAFETY',
          icon: 'Layers',
          enabled: true,
          reason: `Diaktifkan kerana menara mempunyai ${project.towerStoreys} tingkat yang memerlukan sistem perancah berkanun dan penangkap jatuh.`,
        },
        {
          id: 'lifting_pma',
          title: 'Tower Crane, Passenger Hoist & Perakuan PMA JKKP',
          category: 'SAFETY',
          icon: 'Anchor',
          enabled: true,
          reason: 'Kerja pengangkatan tinggi memerlukan Perakuan Kelayakan PMA JKKP & pelan angkat diluluskan.',
        },
        {
          id: 'gondola_facade',
          title: 'Pelantar Tergantung (Gondola) & Keselamatan Fasad',
          category: 'SAFETY',
          icon: 'Shield',
          enabled: true,
          reason: 'Kerja-kerja kemasan luaran memerlukan titik sauh (anchorage) disahkan Jurutera Profesional (PE).',
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
   * Generates initial proactive advisories from Core on Day 1
   */
  static generateDayOneAdvisories(project: ProjectIdentity): AICoreAdvisory[] {
    const advisories: AICoreAdvisory[] = [];
    const timestamp = new Date().toISOString();

    // 1. CDM 2024 Regulation 8 Check
    if (project.isReg8Notifiable) {
      advisories.push({
        id: 'adv-cdm-reg8',
        severity: 'CRITICAL',
        pillar: 'CDM',
        title: 'Statutory Notification Required (CDM 2024 Reg. 8)',
        description: `This project exceeds the statutory threshold with ${project.estimatedPersonDays} estimated person-days. Formal notification (Form JKKP 103) must be served to the State DOSH Director before physical works commence.`,
        statutoryReference: 'CDM 2024 Regulation 8 • OSHA 1994 (Amendment 2022)',
        suggestedAction: 'Generate and serve JKKP 103 Project Commencement Notice',
        actionRoute: 'cdm_2024_dossier',
        timestamp,
      });
    }

    // 2. Competent Person Appointment
    advisories.push({
      id: 'adv-duty-holders',
      severity: 'WARNING',
      pillar: 'DOSH',
      title: 'Duty Holders & Green Book SHO Appointment Pending',
      description: `Contract value of RM ${(project.contractValue / 1000000).toFixed(1)}M requires appointment of registered Safety & Health Officer (SHO) and statutory duty holders.`,
      statutoryReference: 'OSHA 1994 Section 29 • CDM 2024 Reg. 4 & 10',
      suggestedAction: 'Register Principal Designer (PCWD) and Principal Contractor (PCWC)',
      actionRoute: 'workforce_induction',
      timestamp,
    });

    // 3. Environmental Silt Trap & Earth Drain Setup
    if (project.hasDeepExcavation) {
      advisories.push({
        id: 'adv-escp-sediment',
        severity: 'WARNING',
        pillar: 'DOE',
        title: 'ESCP Earth Drains & Silt Trap Readiness',
        description: 'Excavation phase commenced. DOE requires wash troughs, perimeter earth drains, and silt traps to be certified functional before heavy machinery entry.',
        statutoryReference: 'Environmental Quality Act 1974 Section 34A • ESCP Guidelines',
        suggestedAction: 'Log first ESCP inspection & certify wash trough jet pump',
        actionRoute: 'escp_silt_trap',
        timestamp,
      });
    }

    return advisories;
  }
}
