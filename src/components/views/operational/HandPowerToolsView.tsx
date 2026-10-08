import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, Plus, Search, 
  Edit3, Trash2
} from 'lucide-react';
import type { ProjectIdentity, HandPowerToolRecord, SubcontractorRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';

interface HandPowerToolsViewProps {
  project?: ProjectIdentity;
}

const TOOL_TYPES = [
  'Portable Angle Grinder (4" / 7")',
  'Impact Drill / Rotary Hammer',
  'Circular Saw / Wood Cutter',
  'Chop Saw / Metal Cut-off',
  'Demolition Breaker',
  'Inverter Welding Machine',
  'Electric Router / Trimmer',
  'Portable Generator',
  'Extension Cable Reel',
  'Other Portable Tool'
];

export const HandPowerToolsView: React.FC<HandPowerToolsViewProps> = ({ project }) => {
  const [tools, setTools] = useState<HandPowerToolRecord[]>(() => {
    return ProjectService.loadData<HandPowerToolRecord[]>('hand_power_tools_list', []);
  });

  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [toolType, setToolType] = useState(TOOL_TYPES[0]);
  const [serialNo, setSerialNo] = useState('');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || 'MAIN CONTRACTOR');
  const [voltage, setVoltage] = useState('240V (Single Phase)');
  const [colorCode, setColorCode] = useState('GREEN');
  const [status, setStatus] = useState<HandPowerToolRecord['status']>('PASS');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('Site Safety Supervisor');
  const [notes, setNotes] = useState('');

  // Persistence
  useEffect(() => {
    ProjectService.saveData('hand_power_tools_list', tools, project?.id);
  }, [tools, project?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNo.trim()) {
      alert('Please fill in serial number or asset tag.');
      return;
    }

    const payload: HandPowerToolRecord = {
      id: editingId || `tool-${Date.now()}`,
      toolType,
      serialNo: serialNo.trim().toUpperCase(),
      subcontractor,
      voltage,
      colorCode,
      status,
      inspectionDate,
      inspectorName: inspectorName.trim(),
      notes: notes.trim() || undefined
    };

    if (editingId) {
      setTools(prev => prev.map(t => t.id === editingId ? payload : t));
    } else {
      setTools(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setToolType(TOOL_TYPES[0]);
    setSerialNo('');
    setSubcontractor(subcontractors[0]?.name || 'MAIN CONTRACTOR');
    setVoltage('240V (Single Phase)');
    setColorCode('GREEN');
    setStatus('PASS');
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setInspectorName('Site Safety Supervisor');
    setNotes('');
  };

  const handleOpenEdit = (t: HandPowerToolRecord) => {
    setEditingId(t.id);
    setToolType(t.toolType);
    setSerialNo(t.serialNo);
    setSubcontractor(t.subcontractor);
    setVoltage(t.voltage);
    setColorCode(t.colorCode);
    setStatus(t.status);
    setInspectionDate(t.inspectionDate);
    setInspectorName(t.inspectorName);
    setNotes(t.notes || '');
    setShowModal(true);
  };

  const handleDelete = (id: string, s: string) => {
    if (window.confirm(`Delete power tool record: ${s}?`)) {
      setTools(prev => prev.filter(t => t.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return tools.filter(t => {
      const matchSearch = t.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toolType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subcontractor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [tools, searchTerm, filterStatus]);

  const passCount = tools.filter(t => t.status === 'PASS').length;
  const defectiveCount = tools.filter(t => t.status === 'DEFECTIVE').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Hand Power Tools &amp; Electrical Inspection
              </h2>
              <p className="text-xs text-slate-400">
                Angle Grinders, Drills, Saws, Cable Condition &amp; Monthly Tagging
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Register Power Tool</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Tools Tagged</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{tools.length}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Inspected &amp; Safe (Pass)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{passCount}</div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Defective / Quarantined</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{defectiveCount}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search power tools by serial no, type, or subcontractor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
        >
          <option value="ALL">All Inspection Status</option>
          <option value="PASS">Pass (Safe)</option>
          <option value="DEFECTIVE">Defective (Quarantined)</option>
        </select>
      </div>

      {/* Tools Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-4 py-3.5">Tool Specification</th>
                <th className="px-4 py-3.5">Serial / Tag No</th>
                <th className="px-4 py-3.5">Subcontractor</th>
                <th className="px-4 py-3.5">Voltage</th>
                <th className="px-4 py-3.5">Tag Color</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Inspection Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">
                    {t.toolType}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-cyan-300">
                    {t.serialNo}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-300">
                    {t.subcontractor}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {t.voltage}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {t.colorCode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      t.status === 'PASS' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                    }`}>
                      {t.status === 'PASS' ? 'SAFE (PASS)' : 'DEFECTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {t.inspectionDate}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.serialNo)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register / Edit Tool */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Tool Record' : 'Register Portable Power Tool'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tool Type *</label>
                <select
                  value={toolType}
                  onChange={e => setToolType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-teal-400"
                >
                  {TOOL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Serial / Asset Tag No *</label>
                <input 
                  type="text"
                  placeholder="e.g. MAKITA-GR-01"
                  value={serialNo}
                  onChange={e => setSerialNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-teal-400 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subcontractor</label>
                  <select
                    value={subcontractor}
                    onChange={e => setSubcontractor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-teal-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="MAIN CONTRACTOR">MAIN CONTRACTOR</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Voltage Rating</label>
                  <select
                    value={voltage}
                    onChange={e => setVoltage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="240V (Single Phase)">240V (Single Phase)</option>
                    <option value="110V (Step-down)">110V (Step-down)</option>
                    <option value="415V (3-Phase)">415V (3-Phase)</option>
                    <option value="Battery Powered (Cordless)">Cordless / Battery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Inspection Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="PASS">PASS (Safe for Use)</option>
                    <option value="DEFECTIVE">DEFECTIVE (Quarantined)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tag Color</label>
                  <select
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="GREEN">GREEN</option>
                    <option value="BLUE">BLUE</option>
                    <option value="YELLOW">YELLOW</option>
                    <option value="RED">RED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Save Tool
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HandPowerToolsView;
