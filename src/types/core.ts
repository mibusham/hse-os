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
  documentType: 'IC' | 'PASSPORT' | 'UNHCR' | 'NRIC' | 'Other';
  documentNo: string;
  nationality: string;
  trade: string;
  subcontractor: string;
  cidbGreenCardNo: string;
  greenCardExpiry: string;
  inductionDate: string;
  hasPassedInduction: boolean;
  permitNumber?: string;
  permitExpiry?: string;
  passportExpiry?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  workerNumber?: string;
  companyContact?: string;
  personInCharge?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  photo?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BARRED';
  notes?: string;
  receivedPass?: boolean;
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

// Operational Models from ytchse
export interface MachineryItem {
  id: string;
  name: string; // e.g. Excavator, Mobile Crane, Tower Crane, Roller
  registrationNo: string;
  brandModel?: string;
  capacity?: string;
  subcontractor?: string;
  photoUrl?: string;
  pmaNo?: string;
  pmaCertUrl?: string;
  dateMobilize: string;
  dateDemobilize?: string | null;
  pmaExpiry?: string;
  operatorName?: string;
  operatorPhone?: string;
  operatorCidb?: string;
  operatorJkkp?: string;
  operatorIc?: string;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'BREAKDOWN';
  zone?: string;
  inspections?: any[];
}

export interface LiftingGearRecord {
  id: string;
  gearType: string;
  serialNo?: string;
  swl?: string;
  location: string;
  company: string;
  dateInspection: string;
  colorCode?: string;
  status: 'FIT' | 'DEFECTIVE';
  inspectorName?: string;
  photoUrl?: string;
  certificateUrl?: string;
  comments?: string;
}

export interface HandPowerToolRecord {
  id: string;
  toolType: string;
  serialNo: string;
  subcontractor: string;
  voltage: string;
  colorCode: string;
  status: 'PASS' | 'DEFECTIVE';
  inspectionDate: string;
  inspectorName: string;
  notes?: string;
}

export interface FireExtinguisherRecord {
  id: string;
  tagNo: string;
  cylinderType: 'ABC Powder' | 'CO2' | 'Water' | 'Foam';
  capacity: string;
  location: string;
  bombaExpiry: string;
  gaugeStatus: 'NORMAL' | 'LOW' | 'OVERCHARGED';
  physicalStatus: 'GOOD' | 'DAMAGED' | 'PIN_MISSING';
  lastInspectionDate: string;
  inspectorName: string;
}

export interface SafetyFindingRecord {
  id: string;
  date: string;
  location: string;
  subcontractor: string;
  description: string;
  category: 'Unsafe Act' | 'Unsafe Condition' | 'Environmental';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  photoUrl?: string;
  rectifiedPhotoUrl?: string;
  status: 'OPEN' | 'RECTIFIED' | 'CLOSED';
  actionTaken?: string;
  aiMitigation?: string;
  reportedBy: string;
}

export interface SitePenaltyRecord {
  id: string;
  date: string;
  photoUrl?: string;
  subcon: string;
  amount: number;
  demeritPoints: number;
  description: string;
  issuedBy: string;
  status: 'ISSUED' | 'PAID' | 'DISPUTED';
}

export interface ToolboxRecord {
  id: string;
  type: 'Toolbox Talk' | 'Site Training' | 'Special Briefing';
  date: string;
  photoUrl?: string;
  topic: string;
  presenter: string;
  attendeesCount: number;
  remarks?: string;
}

export interface IncidentRecord {
  id: string;
  referenceNo: string;
  date: string;
  time: string;
  location: string;
  subcontractor: string;
  incidentType: 'Near Miss' | 'First Aid' | 'Medical Treatment' | 'Lost Time Injury (LTI)' | 'Dangerous Occurrence' | 'Fatality';
  injuredPersonName?: string;
  injuryNature?: string;
  briefDescription: string;
  immediateAction: string;
  doshReportable: boolean;
  status: 'INVESTIGATING' | 'CLOSED';
}

export interface RainGaugeEntry {
  id: string;
  date: string;
  amountMm: number;
  recordedBy: string;
  status: 'NORMAL' | 'HEAVY_RAIN_ALERT' | 'STOP_WORK_CRITICAL';
}

export interface ChemicalItem {
  id: string;
  name: string;
  supplier: string;
  hazardClass: 'Flammable' | 'Toxic' | 'Corrosive' | 'Irritant' | 'Environmental Hazard' | string;
  storageLocation: string;
  maxQuantity: string;
  sdsAvailable: boolean;
  ppeRequired?: string;
}

export interface FoggingRecord {
  id: string;
  date: string;
  chemical: string;
  contractor: string;
  area: string;
  nextDueDate: string;
  status: 'COMPLETED';
}


