import React, { useState, useEffect } from 'react';
import { 
  Tractor, Calculator, Plus, Printer, Trash2, 
  ShieldCheck, HardHat, X
} from 'lucide-react';
import { ProjectService } from '../../../services/projectService';
import type { ProjectIdentity } from '../../../types/core';

export interface LiftingPlanItem {
  id: string;
  projectName: string;
  dateRequest: string;
  location: string;
  materialToLift: string;
  craneType: 'Mobile Crane' | 'Crawler Crane' | 'Tower Crane' | 'Lorry Crane';
  craneModel: string;
  pmaNo: string;
  craneCapacityTon: number;
  boomLengthM: number;
  liftingRadiusM: number;
  swlAtRadiusTon: number;
  mainBlockKg: number;
  auxBlockKg: number;
  riggingGearKg: number;
  materialWeightTon: number;
  isNightWork: boolean;
  nightTime?: string;
  supervisorName: string;
  supervisorIc: string;
  operatorName: string;
  operatorIc: string;
  riggerName: string;
  riggerIc: string;
  signalmanName: string;
  signalmanIc: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  checklist: {
    groundStable: boolean;
    outriggersExtended: boolean;
    craneLevel: boolean;
    loadChartChecked: boolean;
    barricadeErected: boolean;
    windSpeedChecked: boolean;
    riggingInspected: boolean;
  };
  notes: string;
}

const DEFAULT_PLANS: LiftingPlanItem[] = [
  {
    id: 'lp-1',
    projectName: 'Dawson Commercial & High-Rise (Plot 262)',
    dateRequest: new Date().toISOString().split('T')[0],
    location: 'Zone B - Main Podium Structure',
    materialToLift: 'Rebar Bundles (High Tensile Y25)',
    craneType: 'Mobile Crane',
    craneModel: 'Kato KR-500 (50 Ton)',
    pmaNo: 'PMA 12844',
    craneCapacityTon: 50,
    boomLengthM: 28,
    liftingRadiusM: 14,
    swlAtRadiusTon: 12.5,
    mainBlockKg: 450,
    auxBlockKg: 100,
    riggingGearKg: 150,
    materialWeightTon: 6.5,
    isNightWork: false,
    supervisorName: 'Ahmad Nizam (Competent Lifting Supervisor)',
    supervisorIc: '840512-07-5531',
    operatorName: 'Tan Cheng Leong',
    operatorIc: '780321-08-5421',
    riggerName: 'Md Kobir Hossain',
    riggerIc: 'A7654321',
    signalmanName: 'Zaw Min Tun',
    signalmanIc: 'B9876543',
    status: 'ACTIVE',
    checklist: {
      groundStable: true,
      outriggersExtended: true,
      craneLevel: true,
      loadChartChecked: true,
      barricadeErected: true,
      windSpeedChecked: true,
      riggingInspected: true,
    },
    notes: 'Ground bearing pressure verified with outrigger steel pads placed.'
  }
];

export const LiftingPlanView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [plans, setPlans] = useState<LiftingPlanItem[]>(() => {
    return ProjectService.loadData<LiftingPlanItem[]>('hse_lifting_plans', DEFAULT_PLANS);
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedPlanForPrint, setSelectedPlanForPrint] = useState<LiftingPlanItem | null>(null);

  // Form State
  const [materialToLift, setMaterialToLift] = useState('Precast Concrete Beam');
  const [craneType, setCraneType] = useState<LiftingPlanItem['craneType']>('Mobile Crane');
  const [craneModel, setCraneModel] = useState('Tadano GT-550E (55 Ton)');
  const [pmaNo, setPmaNo] = useState('PMA 14920');
  const [location, setLocation] = useState('Block A Level 3');
  const [craneCapacityTon, setCraneCapacityTon] = useState<number>(55);
  const [boomLengthM, setBoomLengthM] = useState<number>(24);
  const [liftingRadiusM, setLiftingRadiusM] = useState<number>(12);
  const [swlAtRadiusTon, setSwlAtRadiusTon] = useState<number>(14.2);
  const [mainBlockKg, setMainBlockKg] = useState<number>(400);
  const [auxBlockKg, setAuxBlockKg] = useState<number>(80);
  const [riggingGearKg, setRiggingGearKg] = useState<number>(120);
  const [materialWeightTon, setMaterialWeightTon] = useState<number>(7.5);
  const [isNightWork, setIsNightWork] = useState(false);
  const [supervisorName, setSupervisorName] = useState('En. Razak (Lifting Supervisor)');
  const [supervisorIc, setSupervisorIc] = useState('820412-08-5521');
  const [operatorName, setOperatorName] = useState('Lee Kok Wah');
  const [operatorIc, setOperatorIc] = useState('790115-07-5111');
  const [riggerName, setRiggerName] = useState('Mohd Sojun Ali');
  const [riggerIc, setRiggerIc] = useState('P3456789');
  const [signalmanName, setSignalmanName] = useState('Nay Lin Oo');
  const [signalmanIc, setSignalmanIc] = useState('P9876541');
  const [notes, setNotes] = useState('Double check sling choke angle and tag lines before hook-up.');

  useEffect(() => {
    ProjectService.saveData('hse_lifting_plans', plans, project?.id);
  }, [plans, project?.id]);

  // Live Calculations
  const totalDeductionsTon = (mainBlockKg + auxBlockKg + riggingGearKg) / 1000;
  const totalGrossLoadTon = materialWeightTon + totalDeductionsTon;
  const capacityUtilizationPct = swlAtRadiusTon > 0 ? (totalGrossLoadTon / swlAtRadiusTon) * 100 : 0;
  const isOverloaded = capacityUtilizationPct > 90;
  const isCaution = capacityUtilizationPct >= 75 && capacityUtilizationPct <= 90;

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: LiftingPlanItem = {
      id: `lp-${Date.now()}`,
      projectName: project?.projectName || 'Dawson Commercial & High-Rise (Plot 262)',
      dateRequest: new Date().toISOString().split('T')[0],
      location,
      materialToLift,
      craneType,
      craneModel,
      pmaNo,
      craneCapacityTon: Number(craneCapacityTon),
      boomLengthM: Number(boomLengthM),
      liftingRadiusM: Number(liftingRadiusM),
      swlAtRadiusTon: Number(swlAtRadiusTon),
      mainBlockKg: Number(mainBlockKg),
      auxBlockKg: Number(auxBlockKg),
      riggingGearKg: Number(riggingGearKg),
      materialWeightTon: Number(materialWeightTon),
      isNightWork,
      supervisorName,
      supervisorIc,
      operatorName,
      operatorIc,
      riggerName,
      riggerIc,
      signalmanName,
      signalmanIc,
      status: 'ACTIVE',
      checklist: {
        groundStable: true,
        outriggersExtended: true,
        craneLevel: true,
        loadChartChecked: true,
        barricadeErected: true,
        windSpeedChecked: true,
        riggingInspected: true,
      },
      notes
    };

    setPlans([newPlan, ...plans]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this lifting plan record?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Tractor className="w-3 h-3" />
              Lifting Operations & Load Safety
            </span>
            <span className="text-xs text-slate-400">DOSH / JKKP PNA & BS 7121 Compliant</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lifting Plan & Crane Load Calculator</h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered lifting calculations, crane load radius analysis, critical lift evaluation, and lifting crew appointments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Lifting Plan
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Total Lifting Plans</div>
          <div className="text-2xl font-bold text-white mt-1">{plans.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active site permits</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Critical Lifts (&gt;75% SWL)</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {plans.filter(p => {
              const gross = p.materialWeightTon + ((p.mainBlockKg + p.auxBlockKg + p.riggingGearKg) / 1000);
              return p.swlAtRadiusTon > 0 && (gross / p.swlAtRadiusTon) >= 0.75;
            }).length}
          </div>
          <div className="text-xs text-amber-500/80 mt-1">Special supervision required</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Designated Lifting Supervisors</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {new Set(plans.map(p => p.supervisorName)).size}
          </div>
          <div className="text-xs text-emerald-500/80 mt-1">Certified personnel on site</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Night Lifting Permits</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {plans.filter(p => p.isNightWork).length}
          </div>
          <div className="text-xs text-sky-500/80 mt-1">Floodlights & permit endorsed</div>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            Lifting Plans Register
          </h3>
          <span className="text-xs text-slate-400">Showing {plans.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Lifting Item & Location</th>
                <th className="py-3.5 px-4">Crane & PMA</th>
                <th className="py-3.5 px-4">Radius / SWL</th>
                <th className="py-3.5 px-4">Gross Load</th>
                <th className="py-3.5 px-4">Capacity %</th>
                <th className="py-3.5 px-4">Lifting Crew</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {plans.map((p) => {
                const deductions = (p.mainBlockKg + p.auxBlockKg + p.riggingGearKg) / 1000;
                const grossLoad = p.materialWeightTon + deductions;
                const utilPct = p.swlAtRadiusTon > 0 ? (grossLoad / p.swlAtRadiusTon) * 100 : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{p.materialToLift}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.location} • {p.dateRequest}</div>
                      {p.isNightWork && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                          🌙 Night Lift
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{p.craneModel}</div>
                      <div className="text-xs text-amber-400 font-mono">{p.pmaNo} ({p.craneType})</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div>R: <span className="text-white font-medium">{p.liftingRadiusM} m</span></div>
                      <div className="text-slate-400">SWL: <span className="text-emerald-400 font-medium">{p.swlAtRadiusTon} T</span></div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="text-white font-medium">{grossLoad.toFixed(2)} Ton</div>
                      <div className="text-slate-400">Load: {p.materialWeightTon}T + Rig: {deductions.toFixed(2)}T</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          utilPct > 90 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : utilPct >= 75 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {utilPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {utilPct > 90 ? 'Critical / Overload' : utilPct >= 75 ? 'Caution Lift' : 'Safe Operating'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-white font-medium">Sup: {p.supervisorName.split('(')[0]}</div>
                      <div className="text-slate-400">Op: {p.operatorName}</div>
                      <div className="text-slate-500">Rig: {p.riggerName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPlanForPrint(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors title='Print Formal Plan'"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form: Create Lifting Plan */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Create New Lifting Plan & Load Verification</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-6 pt-4">
              {/* Section 1: Lift General Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Material / Load to Lift *</label>
                  <input
                    type="text"
                    required
                    value={materialToLift}
                    onChange={(e) => setMaterialToLift(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Precast Wall, Rebar Bundle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Specific Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Block A Level 3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Crane Type *</label>
                  <select
                    value={craneType}
                    onChange={(e) => setCraneType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mobile Crane">Mobile Crane</option>
                    <option value="Crawler Crane">Crawler Crane</option>
                    <option value="Tower Crane">Tower Crane</option>
                    <option value="Lorry Crane">Lorry Crane</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Crane Brand / Model *</label>
                  <input
                    type="text"
                    required
                    value={craneModel}
                    onChange={(e) => setCraneModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Tadano GT-550E"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DOSH PMA Certificate No *</label>
                  <input
                    type="text"
                    required
                    value={pmaNo}
                    onChange={(e) => setPmaNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. PMA 14920"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Rated Max Capacity (Ton) *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={craneCapacityTon}
                    onChange={(e) => setCraneCapacityTon(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Section 2: Mathematical Engineering Calculations */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Load & Capacity Engineering Calculations</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Boom Length (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={boomLengthM}
                      onChange={(e) => setBoomLengthM(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Lifting Radius (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={liftingRadiusM}
                      onChange={(e) => setLiftingRadiusM(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">SWL At Radius (Ton)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={swlAtRadiusTon}
                      onChange={(e) => setSwlAtRadiusTon(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Material Net Weight (Ton)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={materialWeightTon}
                      onChange={(e) => setMaterialWeightTon(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Main Block Deduction (kg)</label>
                    <input
                      type="number"
                      value={mainBlockKg}
                      onChange={(e) => setMainBlockKg(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Aux Hook Deduction (kg)</label>
                    <input
                      type="number"
                      value={auxBlockKg}
                      onChange={(e) => setAuxBlockKg(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Rigging & Slings (kg)</label>
                    <input
                      type="number"
                      value={riggingGearKg}
                      onChange={(e) => setRiggingGearKg(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Calculation Result Callout */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverloaded 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : isCaution 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div>
                    <div className="text-xs uppercase font-semibold">Total Gross Load to be Lifted</div>
                    <div className="text-xl font-bold font-mono">
                      {totalGrossLoadTon.toFixed(2)} Ton <span className="text-xs font-normal">({materialWeightTon}T net + {totalDeductionsTon.toFixed(2)}T rigging)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase font-semibold">Crane Capacity Utilized</div>
                    <div className="text-2xl font-black font-mono">
                      {capacityUtilizationPct.toFixed(1)}%
                    </div>
                    <div className="text-xs font-medium">
                      {isOverloaded ? '⚠️ DANGER: OVERLOAD >90%' : isCaution ? '⚠️ CRITICAL LIFT (75-90%)' : '✅ SAFE OPERATING LOAD (<75%)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Lifting Crew Personnel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Lifting Supervisor
                  </div>
                  <input
                    type="text"
                    required
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    required
                    value={supervisorIc}
                    onChange={(e) => setSupervisorIc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    placeholder="IC / Passport No."
                  />
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1">
                    <HardHat className="w-3.5 h-3.5" />
                    Crane Operator
                  </div>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    required
                    value={operatorIc}
                    onChange={(e) => setOperatorIc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    placeholder="IC / DOSH Certificate"
                  />
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-2">Competent Rigger</div>
                  <input
                    type="text"
                    required
                    value={riggerName}
                    onChange={(e) => setRiggerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    required
                    value={riggerIc}
                    onChange={(e) => setRiggerIc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    placeholder="IC / Passport"
                  />
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-2">Competent Signalman</div>
                  <input
                    type="text"
                    required
                    value={signalmanName}
                    onChange={(e) => setSignalmanName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    required
                    value={signalmanIc}
                    onChange={(e) => setSignalmanIc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                    placeholder="IC / Passport"
                  />
                </div>
              </div>

              {/* Night Lifting Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="nightLiftCheck"
                  checked={isNightWork}
                  onChange={(e) => setIsNightWork(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-900 border-slate-700"
                />
                <label htmlFor="nightLiftCheck" className="text-sm text-slate-200 cursor-pointer">
                  Requires Night Lifting Operation (Special lighting & DOSH night permit conditions)
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Safety Precautions & Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Ground soil compaction tested, wind speed anemometer monitoring..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverloaded}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  Confirm & Authorize Lifting Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Sheet View */}
      {selectedPlanForPrint && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedPlanForPrint(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                  ENGINEERED LIFTING PERMIT & LOAD PLAN
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  DOSH Statutory Lifting Operation Compliance • FMA 1967 • BOWEC 1986
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                  {selectedPlanForPrint.pmaNo}
                </span>
                <p className="text-xs text-slate-500 mt-1">{selectedPlanForPrint.dateRequest}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p><span className="font-bold">Project:</span> {selectedPlanForPrint.projectName}</p>
                <p><span className="font-bold">Location:</span> {selectedPlanForPrint.location}</p>
                <p><span className="font-bold">Material:</span> {selectedPlanForPrint.materialToLift}</p>
              </div>
              <div>
                <p><span className="font-bold">Crane:</span> {selectedPlanForPrint.craneModel} ({selectedPlanForPrint.craneType})</p>
                <p><span className="font-bold">Boom Length:</span> {selectedPlanForPrint.boomLengthM} m</p>
                <p><span className="font-bold">Working Radius:</span> {selectedPlanForPrint.liftingRadiusM} m</p>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wide">
                Load Assessment & Safety Margin
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">SWL at Radius</div>
                  <div className="text-lg font-black text-slate-900 font-mono">{selectedPlanForPrint.swlAtRadiusTon} Ton</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase">Gross Load (With Rigging)</div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {(selectedPlanForPrint.materialWeightTon + ((selectedPlanForPrint.mainBlockKg + selectedPlanForPrint.auxBlockKg + selectedPlanForPrint.riggingGearKg) / 1000)).toFixed(2)} Ton
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[10px] text-amber-800 uppercase font-bold">Capacity Used</div>
                  <div className="text-xl font-black text-amber-900 font-mono">
                    {(( (selectedPlanForPrint.materialWeightTon + ((selectedPlanForPrint.mainBlockKg + selectedPlanForPrint.auxBlockKg + selectedPlanForPrint.riggingGearKg) / 1000)) / selectedPlanForPrint.swlAtRadiusTon ) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900">Appointed Lifting Supervisor:</p>
                <p>{selectedPlanForPrint.supervisorName}</p>
                <p className="text-slate-500">IC: {selectedPlanForPrint.supervisorIc}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900">Competent Crane Operator:</p>
                <p>{selectedPlanForPrint.operatorName}</p>
                <p className="text-slate-500">Cert: {selectedPlanForPrint.operatorIc}</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic mb-6">
              Signoff declaration: All rigging equipment has been visually inspected. Outriggers are 100% extended with ground pads. The lifting radius is strictly cordoned off.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-sm"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
