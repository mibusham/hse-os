import React, { useState, useEffect } from 'react';
import { 
  Plus, CloudRain, Trash2, 
  FlaskConical, Activity, Bug, ShieldAlert,
  Fuel, Waves
} from 'lucide-react';
import type { ProjectIdentity } from '../../types/core';
import { ProjectService } from '../../services/projectService';

// Data Interfaces
interface WaterSample {
  id: string;
  date: string;
  location: string;
  tssValue: number; // DOE limit: 50 mg/L
  phValue: number; // DOE limit: 6.0 - 9.0
  turbidityNtu: number;
  status: 'COMPLIANT' | 'EXCEEDED';
  testedBy: string;
}

interface ScheduledWasteItem {
  id: string;
  code: string;
  name: string;
  quantity: string;
  dateIn: string;
  maxDays: number;
  daysRemaining: number;
  status: 'SAFE_STORAGE' | 'URGENT_DISPOSAL_180D';
}

interface RainGaugeEntry {
  id: string;
  date: string;
  amountMm: number;
  recordedBy: string;
  status: 'NORMAL' | 'HEAVY_RAIN_ALERT' | 'STOP_WORK_CRITICAL';
}

interface ChemicalItem {
  id: string;
  name: string;
  supplier: string;
  hazardClass: 'Flammable' | 'Toxic' | 'Corrosive' | 'Irritant' | 'Environmental Hazard';
  storageLocation: string;
  maxQuantity: string;
  sdsAvailable: boolean;
  ppeRequired: string;
}

interface EqmRecord {
  id: string;
  month: string;
  tspAir: number; // Limit 260 ug/m3
  tssWater: number; // Limit 50 mg/L
  noiseDb: number; // Limit 65 dB(A)
}

interface VectorControlEntry {
  id: string;
  activityType: 'Fogging' | 'Larviciding / Abate' | 'Breeding Inspection';
  date: string;
  targetArea: string;
  conductedBy: string;
  status: 'COMPLETED' | 'SCHEDULED';
}

interface SpillKitEntry {
  id: string;
  location: string;
  absorbentPadsQty: number;
  absorbentBoomsQty: number;
  nitrileGlovesPairs: number;
  disposalBagsQty: number;
  inspectionStatus: 'READY' | 'REPLENISH_NEEDED';
}

interface ResourceAccountingEntry {
  id: string;
  month: string;
  dieselLiters: number;
  electricityKwh: number;
  waterM3: number;
  estCarbonTonnes: number;
}

export const DoeEnvPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<
    'WATER_RUNOFF' | 'RAIN_GAUGE' | 'SCHEDULED_WASTE' | 'CHEMICAL_REGISTER' | 
    'EQM_MONITORING' | 'VECTOR_CONTROL' | 'SPILL_RESPONSE' | 'RESOURCE_ACCOUNTING'
  >('WATER_RUNOFF');

  const [washTroughPumpActive, setWashTroughPumpActive] = useState<boolean>(true);

  // --- 1. Water Samples ---
  const defaultSamples: WaterSample[] = [
    {
      id: 'ws-1',
      date: new Date().toISOString().split('T')[0],
      location: 'Silt Trap 1 (Final Discharge to Monsoon Drain)',
      tssValue: 38,
      phValue: 7.2,
      turbidityNtu: 45,
      status: 'COMPLIANT',
      testedBy: 'En. Razak (In-house Turbidity Probe)'
    }
  ];
  const [samplesList, setSamplesList] = useState<WaterSample[]>(() => {
    return ProjectService.loadData<WaterSample[]>('doe_water_samples', defaultSamples);
  });

  // --- 2. Scheduled Waste ---
  const defaultWaste: ScheduledWasteItem[] = [
    {
      id: 'sw-1',
      code: 'SW 305',
      name: 'Spent Lubricant Oil',
      quantity: '2 Drums (400 Liters)',
      dateIn: '2026-09-20',
      maxDays: 180,
      daysRemaining: 162,
      status: 'SAFE_STORAGE'
    },
    {
      id: 'sw-2',
      code: 'SW 410',
      name: 'Spent Truck Oil Filters',
      quantity: '1 Bin (50 kg)',
      dateIn: '2026-09-25',
      maxDays: 180,
      daysRemaining: 167,
      status: 'SAFE_STORAGE'
    }
  ];
  const [wasteList, setWasteList] = useState<ScheduledWasteItem[]>(() => {
    return ProjectService.loadData<ScheduledWasteItem[]>('doe_waste_list', defaultWaste);
  });

  // --- 3. Rain Gauge ---
  const defaultRain: RainGaugeEntry[] = [
    { id: 'rg-1', date: new Date().toISOString().split('T')[0], amountMm: 14.5, recordedBy: 'En. Razak', status: 'HEAVY_RAIN_ALERT' },
    { id: 'rg-2', date: '2026-10-07', amountMm: 4.2, recordedBy: 'En. Razak', status: 'NORMAL' },
    { id: 'rg-3', date: '2026-10-06', amountMm: 0.0, recordedBy: 'En. Razak', status: 'NORMAL' },
  ];
  const [rainList, setRainList] = useState<RainGaugeEntry[]>(() => {
    return ProjectService.loadData<RainGaugeEntry[]>('doe_rain_gauge', defaultRain);
  });

  // --- 4. Chemicals ---
  const defaultChemicals: ChemicalItem[] = [
    { id: 'ch-1', name: 'Diesel Fuel (Euro 5)', supplier: 'Petronas Dagangan', hazardClass: 'Flammable', storageLocation: 'Fuel Skid Zone B', maxQuantity: '2,500 L', sdsAvailable: true, ppeRequired: 'Nitrile Gloves, Goggles' },
    { id: 'ch-2', name: 'Formwork Mould Oil (Release Agent)', supplier: 'Sika Kimia', hazardClass: 'Irritant', storageLocation: 'Subcon Store 1', maxQuantity: '400 L', sdsAvailable: true, ppeRequired: 'Rubber Gloves, Face Shield' },
    { id: 'ch-3', name: 'Portland Cement (Type I)', supplier: 'YTL Cement', hazardClass: 'Corrosive', storageLocation: 'Dry Silo 1', maxQuantity: '60 Tonnes', sdsAvailable: true, ppeRequired: 'N95 Respirator, Gloves' },
  ];
  const [chemicalList, setChemicalList] = useState<ChemicalItem[]>(() => {
    return ProjectService.loadData<ChemicalItem[]>('doe_chemical_register', defaultChemicals);
  });

  // --- 5. EQM ---
  const defaultEqm: EqmRecord[] = [
    { id: 'eq-1', month: 'Aug 2026', tspAir: 175, tssWater: 36, noiseDb: 61.2 },
    { id: 'eq-2', month: 'Sep 2026', tspAir: 195, tssWater: 42, noiseDb: 63.8 },
    { id: 'eq-3', month: 'Oct 2026', tspAir: 182, tssWater: 38, noiseDb: 62.1 },
  ];
  const [eqmList] = useState<EqmRecord[]>(() => {
    return ProjectService.loadData<EqmRecord[]>('doe_eqm_records', defaultEqm);
  });

  // --- 6. Vector Control ---
  const defaultVector: VectorControlEntry[] = [
    { id: 'vc-1', activityType: 'Fogging', date: '2026-10-06', targetArea: 'Site Perimeter & CLQ Quarters', conductedBy: 'Advance Pest Services (Licensed)', status: 'COMPLETED' },
    { id: 'vc-2', activityType: 'Larviciding / Abate', date: '2026-10-04', targetArea: 'Temporary Earth Drains & Sump Pits', conductedBy: 'In-house Safety Team', status: 'COMPLETED' },
  ];
  const [vectorList] = useState<VectorControlEntry[]>(() => {
    return ProjectService.loadData<VectorControlEntry[]>('doe_vector_control', defaultVector);
  });

  // --- 7. Spill Kits ---
  const defaultSpill: SpillKitEntry[] = [
    { id: 'sk-1', location: 'Fuel Storage Skid (Zone B)', absorbentPadsQty: 45, absorbentBoomsQty: 4, nitrileGlovesPairs: 8, disposalBagsQty: 15, inspectionStatus: 'READY' },
    { id: 'sk-2', location: 'Workshop & Batching Plant', absorbentPadsQty: 30, absorbentBoomsQty: 2, nitrileGlovesPairs: 6, disposalBagsQty: 10, inspectionStatus: 'READY' },
  ];
  const [spillList] = useState<SpillKitEntry[]>(() => {
    return ProjectService.loadData<SpillKitEntry[]>('doe_spill_kits', defaultSpill);
  });

  // --- 8. Resource Accounting ---
  const defaultResources: ResourceAccountingEntry[] = [
    { id: 'res-1', month: 'Aug 2026', dieselLiters: 14200, electricityKwh: 8900, waterM3: 420, estCarbonTonnes: 44.8 },
    { id: 'res-2', month: 'Sep 2026', dieselLiters: 15800, electricityKwh: 9400, waterM3: 460, estCarbonTonnes: 49.6 },
    { id: 'res-3', month: 'Oct 2026', dieselLiters: 13900, electricityKwh: 8600, waterM3: 390, estCarbonTonnes: 43.2 },
  ];
  const [resourceList] = useState<ResourceAccountingEntry[]>(() => {
    return ProjectService.loadData<ResourceAccountingEntry[]>('doe_resources', defaultResources);
  });

  // Form Modals
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [waterLoc, setWaterLoc] = useState('Silt Trap 1 (Discharge)');
  const [waterTss, setWaterTss] = useState(38);
  const [waterPh, setWaterPh] = useState(7.2);
  const [waterTurbidity, setWaterTurbidity] = useState(45);

  const [showRainModal, setShowRainModal] = useState(false);
  const [rainAmount, setRainAmount] = useState<number>(0);

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteCode, setWasteCode] = useState('SW 305');
  const [wasteName, setWasteName] = useState('Spent Lubricant Oil');
  const [wasteQty, setWasteQty] = useState('1 Drum (200 Liters)');

  const [showChemModal, setShowChemModal] = useState(false);
  const [chemName, setChemName] = useState('');
  const [chemSupplier, setChemSupplier] = useState('');
  const [chemHazard, setChemHazard] = useState<ChemicalItem['hazardClass']>('Flammable');
  const [chemLoc, setChemLoc] = useState('');
  const [chemQty, setChemQty] = useState('');

  // Persist
  useEffect(() => { ProjectService.saveData('doe_water_samples', samplesList, project?.id); }, [samplesList, project?.id]);
  useEffect(() => { ProjectService.saveData('doe_waste_list', wasteList, project?.id); }, [wasteList, project?.id]);
  useEffect(() => { ProjectService.saveData('doe_rain_gauge', rainList, project?.id); }, [rainList, project?.id]);
  useEffect(() => { ProjectService.saveData('doe_chemical_register', chemicalList, project?.id); }, [chemicalList, project?.id]);
  useEffect(() => { ProjectService.saveData('doe_vector_control', vectorList, project?.id); }, [vectorList, project?.id]);
  useEffect(() => { ProjectService.saveData('doe_spill_kits', spillList, project?.id); }, [spillList, project?.id]);

  const handleAddWater = (e: React.FormEvent) => {
    e.preventDefault();
    const item: WaterSample = {
      id: `ws-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      location: waterLoc,
      tssValue: Number(waterTss),
      phValue: Number(waterPh),
      turbidityNtu: Number(waterTurbidity),
      status: Number(waterTss) <= 50 ? 'COMPLIANT' : 'EXCEEDED',
      testedBy: 'En. Razak (SHO)'
    };
    setSamplesList([item, ...samplesList]);
    setShowWaterModal(false);
  };

  const handleAddRain = (e: React.FormEvent) => {
    e.preventDefault();
    const mm = Number(rainAmount);
    const item: RainGaugeEntry = {
      id: `rg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amountMm: mm,
      recordedBy: 'En. Razak (SHO)',
      status: mm >= 25 ? 'STOP_WORK_CRITICAL' : mm >= 12.5 ? 'HEAVY_RAIN_ALERT' : 'NORMAL'
    };
    setRainList([item, ...rainList]);
    setShowRainModal(false);
    setRainAmount(0);
  };

  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ScheduledWasteItem = {
      id: `sw-${Date.now()}`,
      code: wasteCode,
      name: wasteName,
      quantity: wasteQty,
      dateIn: new Date().toISOString().split('T')[0],
      maxDays: 180,
      daysRemaining: 180,
      status: 'SAFE_STORAGE'
    };
    setWasteList([item, ...wasteList]);
    setShowWasteModal(false);
  };

  const handleAddChem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ChemicalItem = {
      id: `ch-${Date.now()}`,
      name: chemName,
      supplier: chemSupplier,
      hazardClass: chemHazard,
      storageLocation: chemLoc,
      maxQuantity: chemQty,
      sdsAvailable: true,
      ppeRequired: 'Gloves, Goggles'
    };
    setChemicalList([...chemicalList, item]);
    setShowChemModal(false);
    setChemName('');
    setChemSupplier('');
  };

  const todayRain = rainList[0]?.amountMm || 0;
  const isHeavyRain = todayRain >= 12.5;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Waves className="w-3 h-3" />
              DOE & ESG Environmental Command
            </span>
            <span className="text-xs text-slate-400">Environmental Quality Act 1974 (Act 127)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Environmental, Chemical & Sustainability Suite</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time silt trap runoff, rain gauge alerts, eSWIS scheduled waste, CSDS chemical inventory, EQM boundary monitoring, and dengue vector controls.
          </p>
        </div>

        {/* Pump Status Widget */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-left">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Wash Trough Recirculation</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${washTroughPumpActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {washTroughPumpActive ? 'Submersible Pump ON' : 'Pump Standby / OFF'}
            </div>
          </div>
          <button
            onClick={() => setWashTroughPumpActive(!washTroughPumpActive)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            Toggle
          </button>
        </div>
      </div>

      {/* Heavy Rain Alert Banner if triggered */}
      {isHeavyRain && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <CloudRain className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                ⚠️ HEAVY RAINFALL ALERT ({todayRain} mm recorded)
              </div>
              <div className="text-xs text-amber-300/90 mt-0.5">
                Erosion & Sediment Control Plan (ESCP) active. Inspect silt traps, cutoff drains, and suspend all deep excavation works.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('RAIN_GAUGE')}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shrink-0"
          >
            View Rain Log
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none text-xs font-semibold">
        {[
          { id: 'WATER_RUNOFF', label: 'Water Runoff & Silt Trap', icon: Waves },
          { id: 'RAIN_GAUGE', label: 'Rain Gauge & Storm Alert', icon: CloudRain },
          { id: 'SCHEDULED_WASTE', label: 'Scheduled Waste (eSWIS)', icon: Trash2 },
          { id: 'CHEMICAL_REGISTER', label: 'Chemicals & SDS Register', icon: FlaskConical },
          { id: 'EQM_MONITORING', label: 'EQM Monitoring (Air/Noise)', icon: Activity },
          { id: 'VECTOR_CONTROL', label: 'Vector Control (Dengue)', icon: Bug },
          { id: 'SPILL_RESPONSE', label: 'Spill Kit Readiness', icon: ShieldAlert },
          { id: 'RESOURCE_ACCOUNTING', label: 'Resource & Carbon (ESG)', icon: Fuel },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Water Runoff */}
      {activeTab === 'WATER_RUNOFF' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Silt Trap & Turbidity Water Monitoring</h3>
              <p className="text-xs text-slate-400">DOE Statutory Effluent Limit: TSS &lt; 50 mg/L • pH 6.0 - 9.0</p>
            </div>
            <button
              onClick={() => setShowWaterModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Water Sample
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Location</th>
                  <th className="py-3 px-4">TSS (mg/L)</th>
                  <th className="py-3 px-4">Turbidity (NTU)</th>
                  <th className="py-3 px-4">pH Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tested By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {samplesList.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{s.location}</div>
                      <div className="text-[11px] text-slate-500">{s.date}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {s.tssValue} mg/L
                    </td>
                    <td className="py-3 px-4">{s.turbidityNtu} NTU</td>
                    <td className="py-3 px-4">{s.phValue}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'COMPLIANT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{s.testedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Rain Gauge */}
      {activeTab === 'RAIN_GAUGE' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Site Daily Rain Gauge Log</h3>
              <p className="text-xs text-slate-400">Rainfall &gt; 12.5mm triggers ESCP inspection • &gt; 25mm triggers heavy rain stop work</p>
            </div>
            <button
              onClick={() => setShowRainModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Rain Gauge
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Latest Rainfall</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{todayRain} mm</div>
              <div className="text-xs text-slate-500 mt-1">{isHeavyRain ? '⚠️ Warning Threshold Exceeded' : 'Normal conditions'}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Monthly Cumulative Rain</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {rainList.reduce((acc, r) => acc + r.amountMm, 0).toFixed(1)} mm
              </div>
              <div className="text-xs text-slate-500 mt-1">October 2026 Season</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Rain Alert Days</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {rainList.filter(r => r.amountMm >= 12.5).length} Days
              </div>
              <div className="text-xs text-slate-500 mt-1">Erosion control active</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Rainfall (mm)</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rainList.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans text-white">{r.date}</td>
                    <td className="py-3 px-4 font-bold text-white text-sm">{r.amountMm} mm</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'STOP_WORK_CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : r.status === 'HEAVY_RAIN_ALERT'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{r.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Scheduled Waste */}
      {activeTab === 'SCHEDULED_WASTE' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Scheduled Waste Register (eSWIS DOE 180 Days)</h3>
              <p className="text-xs text-slate-400">Environmental Quality (Scheduled Wastes) Regulations 2005</p>
            </div>
            <button
              onClick={() => setShowWasteModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Waste Entry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wasteList.map(w => (
              <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {w.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {w.daysRemaining} Days Left
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base mt-2">{w.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Quantity Stored: <span className="font-mono text-white font-bold">{w.quantity}</span></p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>In-Date: {w.dateIn}</span>
                  <span className="text-emerald-400 font-sans font-bold">Safe Bunded Pallet</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Chemicals */}
      {activeTab === 'CHEMICAL_REGISTER' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Site Chemical Inventory & CSDS / Safety Data Sheets</h3>
              <p className="text-xs text-slate-400">Occupational Safety and Health (CLASS) Regulations 2013</p>
            </div>
            <button
              onClick={() => setShowChemModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Chemical
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chemicalList.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {c.hazardClass}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold">SDS Valid</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{c.name}</h4>
                  <div className="text-xs text-slate-400 mt-1">Supplier: {c.supplier}</div>
                  <div className="text-xs text-slate-400">Location: {c.storageLocation}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="text-slate-500">Max Qty:</span> <span className="font-mono text-white">{c.maxQuantity}</span> • <span className="text-slate-500">PPE:</span> {c.ppeRequired}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 5: EQM Monitoring */}
      {activeTab === 'EQM_MONITORING' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Environmental Quality Monitoring (EQM) Stations</h3>
            <p className="text-xs text-slate-400">Statutory Monthly Ambient Air (TSP), Noise Boundary, and Water Runoff</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Ambient Dust (TSP)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {eqmList[eqmList.length - 1]?.tspAir || 182} ug/m³
              </div>
              <div className="text-xs text-slate-500 mt-1">DOE Limit: 260 ug/m³ (Compliant)</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Daytime Boundary Noise (Leq)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {eqmList[eqmList.length - 1]?.noiseDb || 62.1} dB(A)
              </div>
              <div className="text-xs text-slate-500 mt-1">DOE Limit: 65.0 dB(A) (Compliant)</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Suspended Solids (TSS)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {eqmList[eqmList.length - 1]?.tssWater || 38} mg/L
              </div>
              <div className="text-xs text-slate-500 mt-1">DOE Limit: 50 mg/L (Compliant)</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: Vector Control */}
      {activeTab === 'VECTOR_CONTROL' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Dengue Vector & Pest Control Logs</h3>
              <p className="text-xs text-slate-400">Destruction of Disease-Bearing Insects Act 1975</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Target Site Area</th>
                  <th className="py-3 px-4">Conducted By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {vectorList.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-white">{v.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{v.activityType}</td>
                    <td className="py-3 px-4 text-slate-400">{v.targetArea}</td>
                    <td className="py-3 px-4 text-slate-400">{v.conductedBy}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 7: Spill Response */}
      {activeTab === 'SPILL_RESPONSE' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Chemical & Fuel Spill Kit Readiness</h3>
            <p className="text-xs text-slate-400">Emergency spill containment readiness and absorbent inventories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spillList.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{s.location}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.inspectionStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded-lg">Pads: <span className="font-bold text-white">{s.absorbentPadsQty}</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg">Booms: <span className="font-bold text-white">{s.absorbentBoomsQty}</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg">Gloves: <span className="font-bold text-white">{s.nitrileGlovesPairs} pairs</span></div>
                  <div className="bg-slate-950 p-2 rounded-lg">Bags: <span className="font-bold text-white">{s.disposalBagsQty}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 8: Resource Accounting */}
      {activeTab === 'RESOURCE_ACCOUNTING' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Resource Accounting & Carbon Emissions (ESG)</h3>
            <p className="text-xs text-slate-400">Monthly site diesel fuel, electrical power, water consumption, and GHG emissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceList.map(r => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="font-bold text-white text-sm border-b border-slate-800 pb-2">{r.month}</div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between"><span>Diesel:</span><span className="text-white font-bold">{r.dieselLiters.toLocaleString()} L</span></div>
                  <div className="flex justify-between"><span>Electricity:</span><span className="text-white font-bold">{r.electricityKwh.toLocaleString()} kWh</span></div>
                  <div className="flex justify-between"><span>Water:</span><span className="text-white font-bold">{r.waterM3.toLocaleString()} m³</span></div>
                  <div className="flex justify-between text-emerald-400 font-sans font-bold pt-2 border-t border-slate-800">
                    <span>Carbon Footprint:</span>
                    <span>{r.estCarbonTonnes} tCO2e</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Log Water Sample</h3>
            <form onSubmit={handleAddWater} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={waterLoc}
                  onChange={e => setWaterLoc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">TSS (mg/L)</label>
                  <input
                    type="number"
                    value={waterTss}
                    onChange={e => setWaterTss(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterPh}
                    onChange={e => setWaterPh(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Turbidity</label>
                  <input
                    type="number"
                    value={waterTurbidity}
                    onChange={e => setWaterTurbidity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowWaterModal(false)} className="px-3 py-1.5 text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">Save Sample</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Record Daily Rainfall</h3>
            <form onSubmit={handleAddRain} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Rain Gauge Measurement (mm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={rainAmount}
                  onChange={e => setRainAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowRainModal(false)} className="px-3 py-1.5 text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Save Rain Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWasteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Add Scheduled Waste</h3>
            <form onSubmit={handleAddWaste} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Waste Code</label>
                <input
                  type="text"
                  required
                  value={wasteCode}
                  onChange={e => setWasteCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={wasteName}
                  onChange={e => setWasteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity</label>
                <input
                  type="text"
                  required
                  value={wasteQty}
                  onChange={e => setWasteQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowWasteModal(false)} className="px-3 py-1.5 text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-600 text-slate-950 font-bold rounded-xl text-xs">Save Waste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">Register Chemical</h3>
            <form onSubmit={handleAddChem} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Chemical Name *</label>
                <input
                  type="text"
                  required
                  value={chemName}
                  onChange={e => setChemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier / Brand</label>
                <input
                  type="text"
                  value={chemSupplier}
                  onChange={e => setChemSupplier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hazard Class</label>
                <select
                  value={chemHazard}
                  onChange={e => setChemHazard(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="Flammable">Flammable</option>
                  <option value="Toxic">Toxic</option>
                  <option value="Corrosive">Corrosive</option>
                  <option value="Irritant">Irritant</option>
                  <option value="Environmental Hazard">Environmental Hazard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Storage Location</label>
                <input
                  type="text"
                  value={chemLoc}
                  onChange={e => setChemLoc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Max Stored Quantity</label>
                <input
                  type="text"
                  value={chemQty}
                  onChange={e => setChemQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowChemModal(false)} className="px-3 py-1.5 text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoeEnvPillarView;
