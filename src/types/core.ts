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
  statutoryReference: string; // e.g. "OSHA 1994 (2022) Sec. 29", "CDM 2024 Reg. 8"
  suggestedAction: string;
  actionRoute?: string;
  timestamp: string;
}

export interface PTWRecord {
  id: string;
  ptwNo: string;
  activityType: 'HOT_WORK' | 'WORKING_AT_HEIGHT' | 'LIFTING' | 'EXCAVATION' | 'CONFINED_SPACE' | 'ELECTRICAL';
  locationZone: string;
  subcontractor: string;
  startDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_APPROVAL' | 'CLOSED';
  authorizedBy: string;
  riskPrecautions: string[];
  createdAt?: string;
}

export interface InspectionRecord {
  id: string;
  itemType: 'SCAFFOLDING_FRAME' | 'MOBILE_CRANE_BACKHOE' | 'ELECTRICAL_DB' | 'ROOF_SAFETY_LINE' | 'SILT_TRAP_ESCP';
  tagNo: string;
  location: string;
  inspectorName: string;
  lastInspectionDate: string;
  nextDueDate: string;
  status: 'SAFE_GREEN_TAG' | 'REJECT_RED_TAG' | 'PENDING_CHECK';
  remarks?: string;
}

export interface SubcontractorRecord {
  id: string;
  name: string;
  scope: string;
  cidbGrade: string;
  cidbExp: string;
  carInsuranceValid: boolean;
  carPolicyNo: string;
  carExpiryDate: string;
  greenCardCompliance: string;
  workersCount: number;
  status: 'APPROVED' | 'PENDING_DOCS' | 'SUSPENDED';
}

export interface ManHoursLog {
  id: string;
  monthYear: string;
  workerCount: number;
  workDays: number;
  hoursPerDay: number;
  totalMonthlyManHours: number;
  cumulativeManHours: number;
  ltiCount: number;
}

export interface WorkerRecord {
  id: string;
  fullName: string;
  documentType: 'IC' | 'PASSPORT';
  documentNo: string;
  nationality: string;
  trade: string;
  subcontractor: string;
  cidbGreenCardNo: string;
  greenCardExpiry: string;
  inductionDate: string;
  hasPassedInduction: boolean;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BARRED';
  notes?: string;
}

export interface TradeItem {
  id: string;
  name: string;
  count: number;
  subcon?: string;
}

export interface DailyManpowerEntry {
  id: string;
  date: string; // YYYY-MM-DD
  trades: TradeItem[];
  totalWorkers: number;
  recordedBy: string;
  shift: 'DAY' | 'NIGHT';
  weatherMorning?: string;
  weatherAfternoon?: string;
  notes?: string;
  createdAt: string;
}

