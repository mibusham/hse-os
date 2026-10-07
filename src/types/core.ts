/**
 * HSE OS CORE TYPE DEFINITIONS
 * Author: Antigravity AI & Mibu Spaces
 */

export type ProjectScope = 
  | 'HIGH_RISE'
  | 'INFRASTRUCTURE'
  | 'INDUSTRIAL_WAREHOUSE'
  | 'LANDED_RESIDENTIAL'
  | 'DEEP_EXCAVATION_TUNNEL';

export type DutyHolderRole = 
  | 'CLIENT' 
  | 'PRINCIPAL_DESIGNER_PCWD' 
  | 'PRINCIPAL_CONTRACTOR_PCWC' 
  | 'SAFETY_HEALTH_OFFICER_SHO' 
  | 'SITE_SAFETY_SUPERVISOR_SSS';

export interface ProjectIdentity {
  id: string;
  projectName: string;
  shortTitle?: string;
  projectCode: string;
  location: string;
  projectScope: ProjectScope;
  clientName: string;
  mainConName: string;
  contractValue: number; // in MYR
  startDate: string;
  targetCompletionDate: string;
  estimatedPersonDays: number;
  hasDeepExcavation: boolean;
  basementLevels: number;
  towerStoreys: number;
  isReg8Notifiable: boolean; // Computed by Core based on CDM 2024
}

export interface StatutoryDutyHolder {
  id: string;
  role: DutyHolderRole;
  name: string;
  companyName: string;
  registrationNo: string; // e.g. DOSH Green Book / BEM PE / CIDB
  contactNo: string;
  appointedAt: string;
  appointmentLetterUrl?: string;
}

export interface HSEModuleConfig {
  id: string;
  title: string;
  category: 'SAFETY' | 'HEALTH' | 'ENVIRONMENT' | 'CDM' | 'GOVERNANCE';
  icon: string;
  enabled: boolean;
  reason: string; // Explanation from AI Core why this module is active
}

export interface AICoreAdvisory {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'RECOMMENDATION' | 'INFO';
  pillar: 'DOSH' | 'CDM' | 'DOE' | 'HEALTH' | 'CORPORATE';
  title: string;
  description: string;
  statutoryReference: string; // e.g. "BOWEC Reg. 74", "CDM 2024 Reg. 8"
  suggestedAction: string;
  actionRoute?: string;
  timestamp: string;
}
