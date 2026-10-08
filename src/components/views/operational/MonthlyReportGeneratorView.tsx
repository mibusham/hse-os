import React, { useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import type { ProjectIdentity } from '../../../types/core';

export const MonthlyReportGeneratorView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [reportMonth, setReportMonth] = useState('October 2026');
  const preparedBy = 'En. Razak Bin Othman (Safety & Health Officer)';
  const shoRegNo = 'DOSH HQ/14/SHO/00/5892 (Green Book)';
  const reviewedBy = 'Ir. Tan Kok Seng (Project Director)';

  // Mock aggregated stats for report
  const stats = {
    cumulativeManHours: 348500,
    ltiFreeDays: 245,
    fatalities: 0,
    lostTimeInjuries: 0,
    firstAidCases: 3,
    nearMisses: 2,
    activeWorkersPeak: 145,
    ptwIssued: 128,
    ptwActive: 14,
    unsafeFindings: 26,
    unsafeRectified: 24,
    rectificationRate: '92.3%',
    machineryPmaValid: 12,
    machineryTotal: 12,
    pmaCompliancePct: '100%',
    toolboxTalkSessions: 26,
    totalToolboxAttendees: 2940,
    waterRunoffTssAvg: '38 mg/L (Limit: 50 mg/L)',
    scheduledWasteKg: '450 kg (SW 305 Stored Safely)',
    clqAkta446Score: '98% (Exemplary)'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Statutory Executive Reporting
            </span>
            <span className="text-xs text-slate-400">DOSH OSHA 1994 Section 29 Statutory Requirement</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monthly HSE Statutory Safety Report</h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated monthly health and safety compilation, cumulative manhours calculation, statutory incident records, and executive endorsement sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="October 2026">October 2026</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print / Export Report
          </button>
        </div>
      </div>

      {/* Formal Printable Report Paper Container */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-200">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-widest text-blue-900 uppercase">
              MONTHLY STATUTORY SAFETY & HEALTH REPORT
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 mt-1 tracking-tight">
              {project?.projectName || 'DAWSON COMMERCIAL & HIGH-RISE (PLOT 262)'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Client: {project?.clientName || 'Eco World Development Group Bhd'} • Principal Contractor: {project?.mainConName || 'Mibu Construction Sdn Bhd'}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-300 sm:pl-6 shrink-0">
            <div className="text-xs font-bold text-slate-500 uppercase">Reporting Period</div>
            <div className="text-xl font-black text-blue-900 mt-0.5">{reportMonth}</div>
            <div className="text-[11px] text-slate-600 font-mono mt-1">DOC REF: YTC/HSE/REP/{reportMonth.replace(' ', '/').toUpperCase()}</div>
          </div>
        </div>

        {/* Executive Incident & Manhours Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
            1. Key Statutory HSE Performance Indicators (KPI)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Cumulative Man-Hours</div>
              <div className="text-xl md:text-2xl font-black text-blue-950 font-mono mt-1">
                {stats.cumulativeManHours.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">Without LTI</div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Safe Working Days</div>
              <div className="text-xl md:text-2xl font-black text-emerald-950 font-mono mt-1">
                {stats.ltiFreeDays} Days
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">Zero Lost Time Injuries</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Fatalities / LTI (DOSH 6/7)</div>
              <div className="text-xl md:text-2xl font-black text-slate-900 font-mono mt-1">
                0 / 0
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Zero Statutory Claims</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">First Aid Cases</div>
              <div className="text-xl md:text-2xl font-black text-amber-900 font-mono mt-1">
                {stats.firstAidCases} Cases
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Minor treated on-site</div>
            </div>
          </div>
        </div>

        {/* Section 2: Permit to Work & High Risk Operations */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
            2. Permit To Work (PTW) & Operational Audits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">Permit to Work Statistics</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Permits Issued:</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.ptwIssued}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active High Risk Permits:</span>
                  <span className="font-bold text-blue-900 font-mono">{stats.ptwActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hot Work & Confined Space:</span>
                  <span className="font-bold text-slate-900 font-mono">100% Authorized</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">Daily Walkabout & Hazards</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Unsafe Acts / Conditions:</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.unsafeFindings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rectified / Closed Out:</span>
                  <span className="font-bold text-emerald-700 font-mono">{stats.unsafeRectified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rectification Rate:</span>
                  <span className="font-bold text-emerald-800 font-mono">{stats.rectificationRate}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">Machinery & Plant Compliance</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Heavy Plant Registered:</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.machineryTotal} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Valid DOSH PMA Certificates:</span>
                  <span className="font-bold text-emerald-700 font-mono">{stats.machineryPmaValid} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Statutory PMA Compliance:</span>
                  <span className="font-bold text-emerald-800 font-mono">{stats.pmaCompliancePct}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Training & Welfare */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
            3. Workforce Training & Welfare Pematuhan Akta 446
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">Morning Toolbox Talk Sessions</div>
              <p className="text-slate-600 mb-2">
                Conducted every morning before 08:00 AM covering working at height, lifting exclusion zones, electrical tools, and extreme heat management.
              </p>
              <div className="flex justify-between font-mono font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Sessions: {stats.toolboxTalkSessions}</span>
                <span>Cumulative Attendees: {stats.totalToolboxAttendees} Man-Sessions</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-2">Environmental & CLQ Compliance</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Silt Trap Turbidity (TSS):</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.waterRunoffTssAvg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Scheduled Waste Storage:</span>
                  <span className="font-bold text-slate-900 font-mono">{stats.scheduledWasteKg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CLQ Quarters (Akta 446):</span>
                  <span className="font-bold text-emerald-800 font-mono">{stats.clqAkta446Score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formal Statutory Endorsement Block */}
        <div className="border-t-2 border-slate-900 pt-6 mt-10">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6">
            Statutory Endorsement & Verification Sign-Off
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="border border-slate-300 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">PREPARED BY (SHO)</div>
                <div className="font-bold text-slate-900 mt-1">{preparedBy}</div>
                <div className="text-[11px] text-slate-600 font-mono">{shoRegNo}</div>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-400">
                Signature & Official Stamp
              </div>
            </div>

            <div className="border border-slate-300 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">REVIEWED BY (PROJECT DIRECTOR)</div>
                <div className="font-bold text-slate-900 mt-1">{reviewedBy}</div>
                <div className="text-[11px] text-slate-600">Main Contractor Representative</div>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-400">
                Signature & Date
              </div>
            </div>

            <div className="border border-slate-300 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">ACKNOWLEDGED BY (CLIENT / S.O.)</div>
                <div className="font-bold text-slate-900 mt-1">Superintending Officer (S.O.)</div>
                <div className="text-[11px] text-slate-600">{project?.clientName || 'Master Property Developer'}</div>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-400">
                Client Safety Representative
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
