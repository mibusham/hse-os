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
    }
  ): {
    advisories: AICoreAdvisory[];
    complianceScore: number;
    statusLevel: 'OPTIMAL' | 'ELEVATED_RISK' | 'CRITICAL_STOP_WORK';
    lastScanTimestamp: string;
  } {
    const advisories: AICoreAdvisory[] = [];
    const timestamp = new Date().toISOString();

    // Load data from liveData or localStorage fallback
    let ptws = liveData?.ptws;
    let inspections = liveData?.inspections;
    let subcons = liveData?.subcons;
    let waterSamples = liveData?.waterSamples;
    let fogging = liveData?.fogging;
    let dutyHolders = liveData?.dutyHolders;

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
    } catch (e) {}

    ptws = ptws || [];
    inspections = inspections || [];
    subcons = subcons || [];
    waterSamples = waterSamples || [];
    fogging = fogging || [];
    dutyHolders = dutyHolders || [];

    // 1. PILLAR 1 DOSH AUDIT: 7-Day Inspection Red Tags
    const redTags = inspections.filter((i: any) => i.status === 'REJECT_RED_TAG');
    redTags.forEach((insp: any) => {
      advisories.push({
        id: `adv-redtag-${insp.id}`,
        severity: 'CRITICAL',
        pillar: 'DOSH',
        title: `⚠️ RED TAG BAHAYA: ${insp.tagNo} (${(insp.itemType || '').replace(/_/g, ' ')}) Gagal Ujian 7-Hari!`,
        description: `Pemeriksaan di ${insp.location} mendapati struktur/loji tidak selamat (${insp.remarks || 'Kerosakan fizikal'}). OSHA 1994 (Pindaan 2022) mewajibkan kerja dihentikan serta merta.`,
        statutoryReference: 'OSHA 1994 (Pindaan 2022) • Seksyen 15 & Garis Panduan JKKP',
        suggestedAction: 'Buka Pillar 1 & baiki struktur sebelum menukar ke Green Tag',
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
        title: `Permit PTW Tamat / Dibatalkan (${expiredPtws.length} Permit Aktif Dikesan)`,
        description: `Zon kerja berisiko tinggi (${expiredPtws.map((p: any) => p.locationZone).join(', ')}) tidak dibenarkan beroperasi tanpa permit sah. Pastikan pekerja telah dikosongkan dari zon.`,
        statutoryReference: 'OSHA 1994 Seksyen 15 • HIRADC PTW Mandatori',
        suggestedAction: 'Semak & tutup permit dalam Pillar 1',
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
        title: `⚠️ PELEPASAN AIR SILT TRAP MELEBIHI HAD JAS (${latestWater.tssValue} mg/L > 50 mg/L)!`,
        description: `Ujian efluen di ${latestWater.location} merekodkan ${latestWater.tssValue} mg/L (had selamat: 50 mg/L). Air kelodak berisiko mencemarkan saliran awam Bandar Cassia. Risiko kompaun JAS Seksyen 34A Akta 127.`,
        statutoryReference: 'Akta Kualiti Alam Sekeliling 1974 (Akta 127) • Pelan ESCP JAS',
        suggestedAction: 'Cuci mendapan lumpur & pasang penapis geotekstil segera',
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
          title: `⚠️ Semburan Fogging Aedes Terlewat (${daysSinceFog} Hari > Had 14 Hari)!`,
          description: `Kitaran semburan nyamuk Aedes di ${latestFog.area} telah tamat tempoh berkanun. Risiko pembiakan jentik-jentik dan kompaun KKM di bawah Akta 130.`,
          statutoryReference: 'Akta Pemusnahan Serangga Pembawa Penyakit 1975 (Akta 130)',
          suggestedAction: 'Jadualkan semburan thermal fogging baharu dalam Pillar 4',
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
        title: `Subkontraktor Belum Lulus Saringan CAR / CIDB (${pendingSubcons.length} Syarikat)`,
        description: `Syarikat (${pendingSubcons.map((s: any) => s.name).join(', ')}) masih belum mengesahkan polisi insurans CAR aktif atau pendaftaran Kad Hijau CIDB 100%.`,
        statutoryReference: 'Akta 520 CIDB • Klausa Insurans CAR Kontrak Utama',
        suggestedAction: 'Semak dokumen subkontraktor dalam Pillar 5',
        actionRoute: 'corporate_subcon',
        timestamp,
      });
    }

    // 6. PILLAR 2 CDM 2024 AUDIT: Regulation 8 Notification Check
    if (project.isReg8Notifiable) {
      advisories.push({
        id: 'adv-cdm-reg8',
        severity: 'CRITICAL',
        pillar: 'CDM',
        title: 'Notis Wajib Peraturan 8 (Borang JKKP 103)',
        description: `Projek melebihi ambang berkanun (${project.estimatedPersonDays.toLocaleString()} person-days). Draf Borang JKKP 103 wajib dicetak dan diserahkan ke Pejabat DOSH Negeri Pulau Pinang sebelum kerja pembinaan fizikal bermula.`,
        statutoryReference: 'Peraturan 8 CDM 2024 • Seksyen 34B OSHA 1994',
        suggestedAction: 'Buka Pillar 2 & cetak PDF rasmi Borang JKKP 103',
        actionRoute: 'cdm_studio',
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

