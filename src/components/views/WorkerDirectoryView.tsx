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
  'Filipina',
  'Lain-lain'
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
  const [trade, setTrade] = useState('Pekerja Am (General Worker)');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || project?.mainConName || 'KONTRAKTOR UTAMA');
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
    if (!expiryDateStr) return { status: 'UNKNOWN', label: 'Tiada Tarikh', color: 'slate' };
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: 'Tamat Tempoh', color: 'rose', days: diffDays };
    }
    if (diffDays <= 30) {
      return { status: 'EXPIRING_SOON', label: `Luput dlm ${diffDays} hari`, color: 'amber', days: diffDays };
    }
    return { status: 'VALID', label: 'Sah (Aktif)', color: 'emerald', days: diffDays };
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
    setTrade('Pekerja Am (General Worker)');
    setSubcontractor(subcontractors[0]?.name || project?.mainConName || 'KONTRAKTOR UTAMA');
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
      // Edit
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
      // Add
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
    if (confirm(`Adakah anda pasti mahu memadamkan rekod pekerja ${name}?`)) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (workers.length === 0) {
      alert('Tiada data pekerja untuk dieksport.');
      return;
    }

    const headers = [
      'Nama Penuh', 'Jenis Dokumen', 'No Dokumen', 'Warganegara', 'Subkontraktor',
      'Trade / Jawatan', 'No Kad Hijau CIDB', 'Tarikh Luput Kad Hijau', 'Status Induksi',
      'Tarikh Induksi', 'Jenis Darah', 'Waris Kecemasan', 'No Telefon Waris', 'Status'
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
      `"${w.hasPassedInduction ? 'LULUS' : 'GAGAL'}"`,
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
    link.setAttribute('download', `HSE_OS_Direktori_Pekerja_${project?.projectCode || 'Tapak'}_${new Date().toISOString().split('T')[0]}.csv`);
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
              <Users size={12} /> Operasi Harian Tapak
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Direktori Pekerja &amp; Kad Hijau CIDB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Pangkalan Data Pekerja &amp; Saringan Induksi Keselamatan
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pengesahan kad hijau CIDB (Akta 520), pendaftaran pasport/IC, kelulusan induksi tapak (*Safety Induction*), dan butiran waris kecemasan bagi semua pekerja kontraktor utama dan subkontraktor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download size={14} />
            <span>Eksport CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Daftar Pekerja Baharu</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Registered */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah Pekerja Berdaftar</span>
          <p className="text-3xl font-black text-white mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-emerald-400 font-medium">{activeWorkers} Pekerja Aktif di Tapak</span>
        </div>

        {/* Induction Compliance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lulus Induksi Keselamatan</span>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">
            {passedInductionCount} / {totalWorkers || 0}
          </p>
          <span className="text-[10px] text-cyan-400/80 font-medium">
            {totalWorkers > 0 ? Math.round((passedInductionCount / totalWorkers) * 100) : 100}% Kadar Lulus Induksi
          </span>
        </div>

        {/* Expired Cards */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kad Hijau CIDB Tamat Tempoh</span>
          <p className={`text-3xl font-black mt-1 font-mono ${expiredCardsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {expiredCardsCount}
          </p>
          <span className={`text-[10px] font-medium ${expiredCardsCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {expiredCardsCount > 0 ? 'Dilarang Masuk (Akta 520)' : 'Tiada Kad Tamat Tempoh'}
          </span>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bakal Luput (&lt;30 Hari)</span>
          <p className={`text-3xl font-black mt-1 font-mono ${expiringSoonCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {expiringSoonCount}
          </p>
          <span className="text-[10px] text-amber-400/80 font-medium">Perlu Pembaharuan CIDB Segera</span>
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
              placeholder="Cari nama pekerja, No IC/Pasport, Kad Hijau, atau Subcon..."
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
              <option value="ALL">Semua Subkontraktor</option>
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
              <option value="ALL">Semua Warganegara</option>
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
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Pekerja Aktif</option>
              <option value="EXPIRED">Kad Hijau Tamat</option>
              <option value="EXPIRING_SOON">Bakal Luput (&lt;30 Hari)</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Quick Trade Filter Pills */}
        {existingTrades.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-mono text-slate-500 shrink-0">Pilihan Trade:</span>
            <button
              type="button"
              onClick={() => setFilterTrade('ALL')}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                filterTrade === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua
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
            <Users size={14} className="text-emerald-400" /> Senarai Pekerja Berdaftar ({filteredWorkers.length} Orang)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Penyegerakan Google Cloud Aktif</span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Users size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Tiada Rekod Pekerja Ditemui</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada pekerja didaftarkan atau tiada padanan carian. Klik butang "+ Daftar Pekerja Baharu" di atas untuk menambah pekerja pertama.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Nama Pekerja &amp; Dokumen</th>
                    <th className="px-4 py-3.5">Syarikat Subkontraktor</th>
                    <th className="px-4 py-3.5">Trade / Jawatan</th>
                    <th className="px-4 py-3.5">Kad Hijau CIDB</th>
                    <th className="px-4 py-3.5">Status Induksi</th>
                    <th className="px-4 py-3.5">Waris / Kecemasan</th>
                    <th className="px-4 py-3.5 text-right">Tindakan</th>
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
                              <span>{worker.cidbGreenCardNo || 'TIADA NO KAD'}</span>
                            </div>
                            <div>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                card.color === 'emerald'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : card.color === 'amber'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                              }`}>
                                {card.label} (shg: {worker.greenCardExpiry})
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
                              <span>{worker.hasPassedInduction ? 'LULUS INDUKSI' : 'BELUM INDUKSI'}</span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block">
                              Tarikh: {worker.inductionDate}
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
                                Darah: {worker.bloodType}
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
                              title="Kemaskini data pekerja"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorker(worker.id, worker.fullName)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-all"
                              title="Padam pekerja"
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

      {/* 5. Modal: Daftar / Kemaskini Pekerja */}
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
                    {editingWorkerId ? 'Kemaskini Butiran Pekerja' : 'Daftar Pekerja Baharu'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Saringan Kad Hijau CIDB &amp; Induksi Keselamatan</span>
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
                  Nama Penuh Pekerja (Mengikut IC / Pasport) *
                </label>
                <input 
                  type="text"
                  placeholder="cth: MD ALAMIN HOSSAIN / MUHAMMAD AMIRUL"
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
                    Jenis Dokumen *
                  </label>
                  <select
                    value={documentType}
                    onChange={e => setDocumentType(e.target.value as any)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="PASSPORT">Pasport Antarabangsa</option>
                    <option value="IC">MyKad (Warganegara)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    No. Dokumen / Pasport *
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: A12345678 / 920101-07-5555"
                    value={documentNo}
                    onChange={e => setDocumentNo(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Warganegara *
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
                    Syarikat Majikan / Subkontraktor *
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
                      <option value={project?.mainConName || 'KONTRAKTOR UTAMA'}>
                        {project?.mainConName || 'KONTRAKTOR UTAMA'}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Trade / Jawatan Tapak *
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: Pemasang Perancah / Barbender"
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
                    No. Kad Hijau CIDB *
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: CIDB-98765432"
                    value={cidbGreenCardNo}
                    onChange={e => setCidbGreenCardNo(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tarikh Luput Kad Hijau *
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
                    Tarikh Induksi Tapak *
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
                    Status Induksi *
                  </label>
                  <select
                    value={hasPassedInduction ? 'YES' : 'NO'}
                    onChange={e => setHasPassedInduction(e.target.value === 'YES')}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="YES">✓ Lulus Induksi</option>
                    <option value="NO">✗ Belum / Gagal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kumpulan Darah
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
                    <option value="UNKNOWN">Tidak Pasti</option>
                  </select>
                </div>
              </div>

              {/* Next of Kin / Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Waris Kecemasan (Next of Kin)
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: SITI FATIMAH (ISTERI)"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    No. Telefon Waris Kecemasan
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: +6012-3456789"
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
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 uppercase tracking-wider shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
                >
                  {editingWorkerId ? 'Simpan Perubahan' : 'Daftar & Sahkan Masuk'}
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
