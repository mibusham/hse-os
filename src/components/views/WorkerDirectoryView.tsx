import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Plus, Trash2, Edit3, 
  CheckCircle2, XCircle, 
  CreditCard, Download,
  Phone, UserCheck
} from 'lucide-react';
import type { ProjectIdentity, WorkerRecord, SubcontractorRecord } from '../../types/core';
import { ProjectService } from '../../services/projectService';

interface WorkerDirectoryViewProps {
  project?: ProjectIdentity;
}

const NATIONALITY_OPTIONS = [
  'Malaysia',
  'Indonesia',
  'Bangladesh',
  'Nepal',
  'Myanmar',
  'Pakistan',
  'India',
  'Vietnam',
  'Philippines',
  'Other'
];

export const WorkerDirectoryView: React.FC<WorkerDirectoryViewProps> = ({ project }) => {
  // Workers List (loaded and persisted)
  const [workers, setWorkers] = useState<WorkerRecord[]>(() => {
    return ProjectService.loadData<WorkerRecord[]>('site_workers_directory', []);
  });

  // Subcontractor list for linking
  const [subcontractors] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubcon, setFilterSubcon] = useState('ALL');
  const [filterTrade, setFilterTrade] = useState('ALL');
  const [filterNationality, setFilterNationality] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'IC' | 'PASSPORT'>('PASSPORT');
  const [documentNo, setDocumentNo] = useState('');
  const [nationality, setNationality] = useState('Indonesia');
  const [trade, setTrade] = useState('General Worker');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || project?.mainConName || 'MAIN CONTRACTOR');
  const [cidbGreenCardNo, setCidbGreenCardNo] = useState('');
  const [greenCardExpiry, setGreenCardExpiry] = useState('2027-12-31');
  const [inductionDate, setInductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasPassedInduction, setHasPassedInduction] = useState(true);
  const [bloodType, setBloodType] = useState('O');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [status, setStatus] = useState<WorkerRecord['status']>('ACTIVE');
  const [notes, setNotes] = useState('');

  // Persistence
  useEffect(() => {
    ProjectService.saveData('site_workers_directory', workers, project?.id);
  }, [workers, project?.id]);

  // Status helper
  const getCardStatus = (expiryDateStr: string) => {
    if (!expiryDateStr) return { status: 'UNKNOWN', label: 'No Date', color: 'slate' };
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: 'Expired', color: 'rose', days: diffDays };
    }
    if (diffDays <= 30) {
      return { status: 'EXPIRING_SOON', label: `Expires in ${diffDays}d`, color: 'amber', days: diffDays };
    }
    return { status: 'VALID', label: 'Valid (Active)', color: 'emerald', days: diffDays };
  };

  // KPIs
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'ACTIVE').length;
  const passedInductionCount = workers.filter(w => w.hasPassedInduction).length;
  const expiredCardsCount = workers.filter(w => getCardStatus(w.greenCardExpiry).status === 'EXPIRED').length;
  const expiringSoonCount = workers.filter(w => getCardStatus(w.greenCardExpiry).status === 'EXPIRING_SOON').length;

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      const matchSearch = 
        w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.cidbGreenCardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.subcontractor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubcon = filterSubcon === 'ALL' || w.subcontractor === filterSubcon;
      const matchTrade = filterTrade === 'ALL' || w.trade === filterTrade;
      const matchNat = filterNationality === 'ALL' || w.nationality === filterNationality;
      
      const cardStatus = getCardStatus(w.greenCardExpiry).status;
      const matchStatus = 
        filterStatus === 'ALL' ||
        (filterStatus === 'ACTIVE' && w.status === 'ACTIVE') ||
        (filterStatus === 'INACTIVE' && w.status === 'INACTIVE') ||
        (filterStatus === 'EXPIRED' && cardStatus === 'EXPIRED') ||
        (filterStatus === 'EXPIRING_SOON' && cardStatus === 'EXPIRING_SOON');

      return matchSearch && matchSubcon && matchTrade && matchNat && matchStatus;
    });
  }, [workers, searchTerm, filterSubcon, filterTrade, filterNationality, filterStatus]);

  // Available unique trades from workers
  const existingTrades = useMemo(() => {
    const set = new Set(workers.map(w => w.trade).filter(Boolean));
    return Array.from(set);
  }, [workers]);

  const handleOpenAddModal = () => {
    setEditingWorkerId(null);
    setFullName('');
    setDocumentType('PASSPORT');
    setDocumentNo('');
    setNationality('Indonesia');
    setTrade('General Worker');
    setSubcontractor(subcontractors[0]?.name || project?.mainConName || 'MAIN CONTRACTOR');
    setCidbGreenCardNo('');
    setGreenCardExpiry('2027-12-31');
    setInductionDate(new Date().toISOString().split('T')[0]);
    setHasPassedInduction(true);
    setBloodType('O');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setStatus('ACTIVE');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEditModal = (worker: WorkerRecord) => {
    setEditingWorkerId(worker.id);
    setFullName(worker.fullName);
    setDocumentType(worker.documentType);
    setDocumentNo(worker.documentNo);
    setNationality(worker.nationality);
    setTrade(worker.trade);
    setSubcontractor(worker.subcontractor);
    setCidbGreenCardNo(worker.cidbGreenCardNo);
    setGreenCardExpiry(worker.greenCardExpiry);
    setInductionDate(worker.inductionDate);
    setHasPassedInduction(worker.hasPassedInduction);
    setBloodType(worker.bloodType || 'O');
    setEmergencyContactName(worker.emergencyContactName || '');
    setEmergencyContactPhone(worker.emergencyContactPhone || '');
    setStatus(worker.status);
    setNotes(worker.notes || '');
    setShowModal(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !documentNo.trim()) return;

    if (editingWorkerId) {
      setWorkers(prev => prev.map(w => {
        if (w.id === editingWorkerId) {
          return {
            ...w,
            fullName: fullName.toUpperCase(),
            documentType,
            documentNo: documentNo.toUpperCase(),
            nationality,
            trade,
            subcontractor,
            cidbGreenCardNo: cidbGreenCardNo.toUpperCase(),
            greenCardExpiry,
            inductionDate,
            hasPassedInduction,
            bloodType,
            emergencyContactName,
            emergencyContactPhone,
            status,
            notes
          };
        }
        return w;
      }));
    } else {
      const newWorker: WorkerRecord = {
        id: `worker-${Date.now()}`,
        fullName: fullName.toUpperCase(),
        documentType,
        documentNo: documentNo.toUpperCase(),
        nationality,
        trade,
        subcontractor,
        cidbGreenCardNo: cidbGreenCardNo.toUpperCase(),
        greenCardExpiry,
        inductionDate,
        hasPassedInduction,
        bloodType,
        emergencyContactName,
        emergencyContactPhone,
        status,
        notes
      };
      setWorkers(prev => [newWorker, ...prev]);
    }

    setShowModal(false);
  };

  const handleDeleteWorker = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete worker record ${name}?`)) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (workers.length === 0) {
      alert('No worker records available to export.');
      return;
    }

    const headers = [
      'Full Name', 'Document Type', 'Document No', 'Nationality', 'Subcontractor',
      'Trade / Designation', 'CIDB Green Card No', 'Green Card Expiry', 'Induction Status',
      'Induction Date', 'Blood Type', 'Emergency Contact', 'Emergency Phone', 'Status'
    ];

    const rows = workers.map(w => [
      `"${w.fullName}"`,
      `"${w.documentType}"`,
      `"${w.documentNo}"`,
      `"${w.nationality}"`,
      `"${w.subcontractor}"`,
      `"${w.trade}"`,
      `"${w.cidbGreenCardNo}"`,
      `"${w.greenCardExpiry}"`,
      `"${w.hasPassedInduction ? 'PASSED' : 'PENDING'}"`,
      `"${w.inductionDate}"`,
      `"${w.bloodType || '-'}"`,
      `"${w.emergencyContactName || '-'}"`,
      `"${w.emergencyContactPhone || '-'}"`,
      `"${w.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HSE_OS_Worker_Directory_${project?.projectCode || 'Site'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <Users size={12} /> Daily Field Operations
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Worker Registry &amp; CIDB Green Card</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Site Worker Database &amp; Safety Induction Vetting
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Statutory verification of CIDB Green Card (Act 520), Passport/IC identity, Safety Induction compliance, and next of kin emergency contacts for all principal and subcontractor personnel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Register New Worker</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Registered */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registered Personnel</span>
          <p className="text-3xl font-black text-white mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-emerald-400 font-medium">{activeWorkers} Active On Site</span>
        </div>

        {/* Induction Compliance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Safety Induction Passed</span>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">
            {passedInductionCount} / {totalWorkers || 0}
          </p>
          <span className="text-[10px] text-cyan-400/80 font-medium">
            {totalWorkers > 0 ? Math.round((passedInductionCount / totalWorkers) * 100) : 100}% Induction Compliance
          </span>
        </div>

        {/* Expired Cards */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Expired CIDB Green Cards</span>
          <p className={`text-3xl font-black mt-1 font-mono ${expiredCardsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {expiredCardsCount}
          </p>
          <span className={`text-[10px] font-medium ${expiredCardsCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {expiredCardsCount > 0 ? 'Barred From Site (Act 520)' : 'Zero Expired Cards'}
          </span>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Expiring Soon (&lt;30 Days)</span>
          <p className={`text-3xl font-black mt-1 font-mono ${expiringSoonCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {expiringSoonCount}
          </p>
          <span className="text-[10px] text-amber-400/80 font-medium">Immediate CIDB Renewal Required</span>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search size={14} className="text-slate-500 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search worker name, IC/Passport, Green Card, or Subcon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-400 placeholder:text-slate-500"
            />
          </div>

          {/* Subcon Filter */}
          <div className="md:col-span-3">
            <select
              value={filterSubcon}
              onChange={e => setFilterSubcon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400"
            >
              <option value="ALL">All Subcontractors</option>
              {subcontractors.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Nationality Filter */}
          <div className="md:col-span-2">
            <select
              value={filterNationality}
              onChange={e => setFilterNationality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400"
            >
              <option value="ALL">All Nationalities</option>
              {NATIONALITY_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Personnel</option>
              <option value="EXPIRED">Expired Green Card</option>
              <option value="EXPIRING_SOON">Expiring Soon (&lt;30 Days)</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Quick Trade Filter Pills */}
        {existingTrades.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-mono text-slate-500 shrink-0">Trades:</span>
            <button
              type="button"
              onClick={() => setFilterTrade('ALL')}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                filterTrade === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All
            </button>
            {existingTrades.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterTrade(t)}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                  filterTrade === t ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Workers Table Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-emerald-400" /> Registered Personnel Directory ({filteredWorkers.length} Workers)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Google Cloud Sync Active</span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Users size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Worker Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No workers registered yet or matching criteria. Click "+ Register New Worker" above to add the first personnel.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Worker Name &amp; ID</th>
                    <th className="px-4 py-3.5">Subcontractor Company</th>
                    <th className="px-4 py-3.5">Trade / Role</th>
                    <th className="px-4 py-3.5">CIDB Green Card</th>
                    <th className="px-4 py-3.5">Induction Status</th>
                    <th className="px-4 py-3.5">Next of Kin / Contact</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredWorkers.map((worker) => {
                    const card = getCardStatus(worker.greenCardExpiry);
                    return (
                      <tr key={worker.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Name & Document */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs text-emerald-400 shrink-0">
                              {worker.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-white text-xs truncate max-w-[200px] uppercase">
                                {worker.fullName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span className="text-slate-500 font-bold">{worker.documentType}:</span>
                                <span>{worker.documentNo}</span>
                                <span>•</span>
                                <span className="text-slate-400 font-sans">{worker.nationality}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Subcontractor */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-slate-200 block truncate max-w-[180px]">
                            {worker.subcontractor}
                          </span>
                        </td>

                        {/* Trade */}
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                            {worker.trade}
                          </span>
                        </td>

                        {/* CIDB Green Card */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-200">
                              <CreditCard size={12} className="text-purple-400" />
                              <span>{worker.cidbGreenCardNo || 'NO CARD NUMBER'}</span>
                            </div>
                            <div>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                card.color === 'emerald'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : card.color === 'amber'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                              }`}>
                                {card.label} (Exp: {worker.greenCardExpiry})
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Induction Status */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-max ${
                              worker.hasPassedInduction 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {worker.hasPassedInduction ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                              <span>{worker.hasPassedInduction ? 'PASSED INDUCTION' : 'PENDING INDUCTION'}</span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block">
                              Date: {worker.inductionDate}
                            </span>
                          </div>
                        </td>

                        {/* Emergency Contact */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-slate-300 font-medium block truncate max-w-[140px]">
                              {worker.emergencyContactName || '-'}
                            </span>
                            {worker.emergencyContactPhone && (
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Phone size={10} className="text-emerald-400" />
                                <span>{worker.emergencyContactPhone}</span>
                              </span>
                            )}
                            {worker.bloodType && (
                              <span className="text-[9px] font-bold text-rose-400 font-mono">
                                Blood: {worker.bloodType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(worker)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                              title="Edit worker record"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorker(worker.id, worker.fullName)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-all"
                              title="Delete worker"
                            >
                              <Trash2 size={13} />
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
        )}
      </div>

      {/* 5. Modal: Register / Edit Worker */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    {editingWorkerId ? 'Update Worker Record' : 'Register New Site Worker'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">CIDB Green Card Verification &amp; Safety Induction</span>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Worker Name (As in IC / Passport) *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. MD ALAMIN HOSSAIN / MUHAMMAD AMIRUL"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Document Type & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={e => setDocumentType(e.target.value as any)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="PASSPORT">International Passport</option>
                    <option value="IC">MyKad (Citizen)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Document / Passport No *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. A12345678 / 920101-07-5555"
                    value={documentNo}
                    onChange={e => setDocumentNo(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nationality *
                  </label>
                  <select
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    {NATIONALITY_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcontractor & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Employer / Subcontractor *
                  </label>
                  <select
                    value={subcontractor}
                    onChange={e => setSubcontractor(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase"
                  >
                    {subcontractors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    {subcontractors.length === 0 && (
                      <option value={project?.mainConName || 'MAIN CONTRACTOR'}>
                        {project?.mainConName || 'MAIN CONTRACTOR'}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Trade / Site Designation *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Scaffolder / Barbender"
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* CIDB Green Card No & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CIDB Green Card No *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. CIDB-98765432"
                    value={cidbGreenCardNo}
                    onChange={e => setCidbGreenCardNo(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Green Card Expiry Date *
                  </label>
                  <input 
                    type="date"
                    value={greenCardExpiry}
                    onChange={e => setGreenCardExpiry(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* Safety Induction & Blood Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Site Induction Date *
                  </label>
                  <input 
                    type="date"
                    value={inductionDate}
                    onChange={e => setInductionDate(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Induction Status *
                  </label>
                  <select
                    value={hasPassedInduction ? 'YES' : 'NO'}
                    onChange={e => setHasPassedInduction(e.target.value === 'YES')}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="YES">✓ Passed Induction</option>
                    <option value="NO">✗ Pending / Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Next of Kin / Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Emergency Contact Name (Next of Kin)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. SITI FATIMAH (SPOUSE)"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Emergency Contact Phone No.
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. +6012-3456789"
                    value={emergencyContactPhone}
                    onChange={e => setEmergencyContactPhone(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 uppercase tracking-wider shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
                >
                  {editingWorkerId ? 'Save Changes' : 'Register & Authorize Entry'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDirectoryView;
