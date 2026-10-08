import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, Search, Plus, Trash2, Edit3, 
  CheckCircle2, XCircle, 
  CreditCard, Download,
  Phone, UserCheck, Camera, FileBadge, 
  Loader2, Printer, Shield, 
  User, ExternalLink, Sparkles
} from 'lucide-react';
import type { ProjectIdentity, WorkerRecord, SubcontractorRecord } from '../../types/core';
import { ProjectService } from '../../services/projectService';
import { analyzeWorkerDocument } from '../../services/geminiService';
import { resizeImage, cropToPassport } from '../../utils/imageHelpers';

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
  'China',
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

  // View mode
  const [viewTab, setViewTab] = useState<'DIRECTORY' | 'BADGES'>('DIRECTORY');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubcon, setFilterSubcon] = useState('ALL');
  const [filterTrade, setFilterTrade] = useState('ALL');
  const [filterNationality, setFilterNationality] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);

  // Selected Worker for Badge Print
  const [selectedWorkerForBadge, setSelectedWorkerForBadge] = useState<WorkerRecord | null>(null);

  // AI OCR Scanning States
  const [isScanningID, setIsScanningID] = useState(false);
  const [isScanningPermit, setIsScanningPermit] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);

  // Hidden File Inputs for OCR & Photo
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const permitFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<WorkerRecord['documentType']>('PASSPORT');
  const [documentNo, setDocumentNo] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [nationality, setNationality] = useState('Indonesia');
  const [trade, setTrade] = useState('General Worker');
  const [subcontractor, setSubcontractor] = useState(subcontractors[0]?.name || project?.mainConName || 'MAIN CONTRACTOR');
  const [cidbGreenCardNo, setCidbGreenCardNo] = useState('');
  const [greenCardExpiry, setGreenCardExpiry] = useState('2027-12-31');
  const [permitNumber, setPermitNumber] = useState('');
  const [permitExpiry, setPermitExpiry] = useState('');
  const [inductionDate, setInductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasPassedInduction, setHasPassedInduction] = useState(true);
  const [bloodType, setBloodType] = useState('O');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [workerPhoto, setWorkerPhoto] = useState<string | null>(null);
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
        (w.cidbGreenCardNo && w.cidbGreenCardNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (w.permitNumber && w.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSubcon = filterSubcon === 'ALL' || w.subcontractor === filterSubcon;
      const matchTrade = filterTrade === 'ALL' || w.trade === filterTrade;
      const matchNationality = filterNationality === 'ALL' || w.nationality === filterNationality;
      const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;

      return matchSearch && matchSubcon && matchTrade && matchNationality && matchStatus;
    });
  }, [workers, searchTerm, filterSubcon, filterTrade, filterNationality, filterStatus]);

  // Unique list of trades
  const uniqueTrades = useMemo(() => {
    const set = new Set<string>();
    workers.forEach(w => { if (w.trade) set.add(w.trade); });
    return Array.from(set).sort();
  }, [workers]);

  // Reset form
  const resetForm = () => {
    setEditingWorkerId(null);
    setFullName('');
    setDocumentType('PASSPORT');
    setDocumentNo('');
    setPassportExpiry('');
    setDateOfBirth('');
    setGender('MALE');
    setNationality('Indonesia');
    setTrade('General Worker');
    setSubcontractor(subcontractors[0]?.name || project?.mainConName || 'MAIN CONTRACTOR');
    setCidbGreenCardNo('');
    setGreenCardExpiry('2027-12-31');
    setPermitNumber('');
    setPermitExpiry('');
    setInductionDate(new Date().toISOString().split('T')[0]);
    setHasPassedInduction(true);
    setBloodType('O');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setWorkerPhoto(null);
    setStatus('ACTIVE');
    setNotes('');
    setScanStatusMessage(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (worker: WorkerRecord) => {
    setEditingWorkerId(worker.id);
    setFullName(worker.fullName);
    setDocumentType(worker.documentType || 'PASSPORT');
    setDocumentNo(worker.documentNo);
    setPassportExpiry(worker.passportExpiry || '');
    setDateOfBirth(worker.dateOfBirth || '');
    setGender(worker.gender || 'MALE');
    setNationality(worker.nationality);
    setTrade(worker.trade);
    setSubcontractor(worker.subcontractor);
    setCidbGreenCardNo(worker.cidbGreenCardNo || '');
    setGreenCardExpiry(worker.greenCardExpiry);
    setPermitNumber(worker.permitNumber || '');
    setPermitExpiry(worker.permitExpiry || '');
    setInductionDate(worker.inductionDate);
    setHasPassedInduction(worker.hasPassedInduction);
    setBloodType(worker.bloodType || 'O');
    setEmergencyContactName(worker.emergencyContactName || '');
    setEmergencyContactPhone(worker.emergencyContactPhone || '');
    setWorkerPhoto(worker.photo || worker.photoUrl || null);
    setStatus(worker.status);
    setNotes(worker.notes || '');
    setScanStatusMessage(null);
    setShowModal(true);
  };

  // --- AI OCR Auto-Scan Handlers ---
  const handleIDScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningID(true);
    setScanStatusMessage('Scanning ID / Passport via Gemini Vision AI...');
    try {
      const base64Img = await resizeImage(file, 1200, 0.85);
      const base64ForApi = base64Img.split(',')[1];
      const extracted = await analyzeWorkerDocument(base64ForApi, 'id');

      const safeUpper = (str: any) => str ? String(str).trim().toUpperCase() : '';

      if (extracted) {
        if (extracted.fullName) setFullName(safeUpper(extracted.fullName));
        if (extracted.passportNumber) setDocumentNo(safeUpper(extracted.passportNumber));
        if (extracted.passportExpiry) setPassportExpiry(extracted.passportExpiry);
        if (extracted.dateOfBirth) setDateOfBirth(extracted.dateOfBirth);
        if (extracted.nationality) {
          const nat = safeUpper(extracted.nationality);
          const matched = NATIONALITY_OPTIONS.find(n => n.toUpperCase() === nat);
          setNationality(matched || extracted.nationality);
        }
        if (extracted.gender) {
          const gUpper = String(extracted.gender).toUpperCase();
          setGender(gUpper.includes('FEMALE') ? 'FEMALE' : 'MALE');
        }
        if (extracted.documentType) {
          const dt = String(extracted.documentType).toUpperCase();
          if (dt.includes('NRIC') || dt.includes('MYKAD')) setDocumentType('NRIC');
          else if (dt.includes('UNHCR')) setDocumentType('UNHCR');
          else setDocumentType('PASSPORT');
        }

        if (!workerPhoto) {
          setWorkerPhoto(base64Img);
        }

        setScanStatusMessage(`ID parsed successfully: ${safeUpper(extracted.fullName || extracted.passportNumber || 'Document Processed')}`);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Could not auto-read ID document. Please verify image clarity and try again.');
      setScanStatusMessage('AI Scan failed. You may enter details manually.');
    } finally {
      setIsScanningID(false);
      if (idFileInputRef.current) idFileInputRef.current.value = '';
    }
  };

  const handlePermitScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningPermit(true);
    setScanStatusMessage('Scanning Work Permit / Visa via Gemini Vision AI...');
    try {
      const base64Img = await resizeImage(file, 1200, 0.85);
      const base64ForApi = base64Img.split(',')[1];
      const extracted = await analyzeWorkerDocument(base64ForApi, 'permit');

      const safeUpper = (str: any) => str ? String(str).trim().toUpperCase() : '';

      if (extracted) {
        if (extracted.permitNumber) setPermitNumber(safeUpper(extracted.permitNumber));
        if (extracted.permitExpiry) setPermitExpiry(extracted.permitExpiry);
        setScanStatusMessage(`Work permit parsed: ${safeUpper(extracted.permitNumber)} (Exp: ${extracted.permitExpiry || 'N/A'})`);
      }
    } catch (err) {
      console.error('Permit OCR Error:', err);
      alert('Could not auto-read Permit. Please check image clarity.');
      setScanStatusMessage('Permit AI Scan failed. Please input manually.');
    } finally {
      setIsScanningPermit(false);
      if (permitFileInputRef.current) permitFileInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const croppedBase64 = await cropToPassport(file);
      setWorkerPhoto(croppedBase64);
    } catch (err) {
      alert('Failed to process passport portrait photo.');
    } finally {
      if (photoFileInputRef.current) photoFileInputRef.current.value = '';
    }
  };

  const handleCheckCIDBPortal = () => {
    if (!documentNo) {
      alert('Please enter or scan a Passport / IC number first.');
      return;
    }
    window.open(`https://cims.cidb.gov.my/`, '_blank');
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !documentNo.trim()) {
      alert('Please fill in Worker Name and Document / Passport Number.');
      return;
    }

    const payload: WorkerRecord = {
      id: editingWorkerId || Date.now().toString(),
      fullName: fullName.trim().toUpperCase(),
      documentType,
      documentNo: documentNo.trim().toUpperCase(),
      passportExpiry: passportExpiry || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || 'MALE',
      nationality,
      trade: trade.trim().toUpperCase(),
      subcontractor,
      cidbGreenCardNo: cidbGreenCardNo.trim().toUpperCase(),
      greenCardExpiry,
      permitNumber: permitNumber ? permitNumber.trim().toUpperCase() : undefined,
      permitExpiry: permitExpiry || undefined,
      inductionDate,
      hasPassedInduction,
      bloodType,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      photo: workerPhoto,
      photoUrl: workerPhoto || undefined,
      status,
      notes: notes.trim(),
      receivedPass: true
    };

    if (editingWorkerId) {
      setWorkers(prev => prev.map(w => w.id === editingWorkerId ? payload : w));
    } else {
      setWorkers(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDeleteWorker = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently remove worker: ${name}?`)) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleToggleInduction = (id: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, hasPassedInduction: !w.hasPassedInduction };
      }
      return w;
    }));
  };

  const handleExportCSV = () => {
    if (workers.length === 0) {
      alert('No workers available to export.');
      return;
    }

    const headers = [
      'Full Name',
      'Document Type',
      'Passport / IC No',
      'Nationality',
      'Subcontractor',
      'Trade',
      'CIDB Green Card No',
      'Green Card Expiry',
      'Permit Number',
      'Permit Expiry',
      'Induction Date',
      'Induction Passed',
      'Blood Type',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Status'
    ];

    const rows = filteredWorkers.map(w => [
      `"${w.fullName}"`,
      `"${w.documentType}"`,
      `"${w.documentNo}"`,
      `"${w.nationality}"`,
      `"${w.subcontractor}"`,
      `"${w.trade}"`,
      `"${w.cidbGreenCardNo || ''}"`,
      `"${w.greenCardExpiry || ''}"`,
      `"${w.permitNumber || ''}"`,
      `"${w.permitExpiry || ''}"`,
      `"${w.inductionDate}"`,
      `"${w.hasPassedInduction ? 'YES' : 'NO'}"`,
      `"${w.bloodType || ''}"`,
      `"${w.emergencyContactName || ''}"`,
      `"${w.emergencyContactPhone || ''}"`,
      `"${w.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HSE_OS_Worker_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden File Inputs for AI Vision OCR & Camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={idFileInputRef} 
        onChange={handleIDScan} 
      />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={permitFileInputRef} 
        onChange={handlePermitScan} 
      />
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={photoFileInputRef} 
        onChange={handlePhotoUpload} 
      />

      {/* 1. Header & Live KPI Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight uppercase">
                  Worker Induction &amp; Directory
                </h1>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles size={10} />
                  Gemini Vision OCR Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Auto-Scan Passports &amp; Permits, CIDB Act 520 Verification, &amp; On-Site Safety Induction Pass
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Switcher */}
          <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 flex items-center">
            <button
              onClick={() => setViewTab('DIRECTORY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'DIRECTORY' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Master Directory
            </button>
            <button
              onClick={() => setViewTab('BADGES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'BADGES' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Induction Passes
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all"
            title="Export filtered directory to CSV"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
          >
            <Plus size={16} />
            <span>Register &amp; Scan Worker</span>
          </button>
        </div>
      </div>

      {/* 2. Quick AI Scan Launchpad Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => {
            handleOpenAddModal();
            setTimeout(() => idFileInputRef.current?.click(), 300);
          }}
          className="bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-500/30 rounded-3xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Camera size={12} /> Auto-Scan Passport / IC
            </span>
            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
              Snap Document Photo
            </p>
            <p className="text-[11px] text-slate-400">
              AI fills name, passport no, expiry &amp; nationality instantly
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Sparkles size={20} />
          </div>
        </div>

        <div 
          onClick={() => {
            handleOpenAddModal();
            setTimeout(() => permitFileInputRef.current?.click(), 300);
          }}
          className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <FileBadge size={12} /> Auto-Scan Work Permit
            </span>
            <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Snap Visa / PLKS Sticker
            </p>
            <p className="text-[11px] text-slate-400">
              Extracts permit number &amp; validity expiry date
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <FileBadge size={20} />
          </div>
        </div>

        <div 
          onClick={() => window.open('https://cims.cidb.gov.my/', '_blank')}
          className="bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-900 border border-purple-500/30 rounded-3xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
              <CreditCard size={12} /> CIDB CIMS Portal
            </span>
            <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Check Green Card Status
            </p>
            <p className="text-[11px] text-slate-400">
              Statutory verification under CIDB Act 520
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <ExternalLink size={18} />
          </div>
        </div>
      </div>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
          <div className="text-2xl font-black text-white font-mono">{totalWorkers}</div>
          <span className="text-[10px] text-slate-500">In Site Database</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Inducted Workers</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{passedInductionCount}</div>
          <span className="text-[10px] text-slate-500">{totalWorkers > 0 ? Math.round((passedInductionCount/totalWorkers)*100) : 0}% Site Compliance</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Active On-Site</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{activeWorkers}</div>
          <span className="text-[10px] text-slate-500">Current Deployment</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CIDB Expiring Soon</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{expiringSoonCount}</div>
          <span className="text-[10px] text-amber-500/80">Within 30 Days</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Expired CIDB Cards</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{expiredCardsCount}</div>
          <span className="text-[10px] text-rose-500/80">Barred from Site</span>
        </div>
      </div>

      {/* 4. Directory View vs Badge Generator View */}
      {viewTab === 'DIRECTORY' ? (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by worker name, passport, IC, permit, or CIDB number..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              {/* Subcon Filter */}
              <select
                value={filterSubcon}
                onChange={e => setFilterSubcon(e.target.value)}
                className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-400"
              >
                <option value="ALL">All Subcontractors</option>
                {subcontractors.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>

              {/* Trade Filter */}
              <select
                value={filterTrade}
                onChange={e => setFilterTrade(e.target.value)}
                className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-400"
              >
                <option value="ALL">All Trades</option>
                {uniqueTrades.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Nationality Filter */}
              <select
                value={filterNationality}
                onChange={e => setFilterNationality(e.target.value)}
                className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-400"
              >
                <option value="ALL">All Nationalities</option>
                {NATIONALITY_OPTIONS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-400"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BARRED">Barred</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {filteredWorkers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Users size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase">No Workers Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchTerm || filterSubcon !== 'ALL' || filterTrade !== 'ALL' 
                    ? 'No worker records match your search or filter criteria.' 
                    : 'Start by registering your site workers and scanning their passports or work permits.'}
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all uppercase"
              >
                <Plus size={14} />
                <span>Register &amp; Scan Worker</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="px-4 py-3.5">Worker Profile</th>
                      <th className="px-4 py-3.5">Employer / Subcon</th>
                      <th className="px-4 py-3.5">Trade</th>
                      <th className="px-4 py-3.5">CIDB Green Card</th>
                      <th className="px-4 py-3.5">Work Permit / Visa</th>
                      <th className="px-4 py-3.5">Site Induction</th>
                      <th className="px-4 py-3.5">Emergency Contact</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredWorkers.map(worker => {
                      const card = getCardStatus(worker.greenCardExpiry);
                      const permitStatus = worker.permitExpiry ? getCardStatus(worker.permitExpiry) : null;

                      return (
                        <tr key={worker.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Profile */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                {worker.photo || worker.photoUrl ? (
                                  <img 
                                    src={worker.photo || worker.photoUrl} 
                                    alt={worker.fullName} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <User size={18} className="text-slate-500" />
                                )}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-white text-xs truncate max-w-[160px]">
                                  {worker.fullName}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                  <span className="text-slate-500">{worker.documentType || 'ID'}:</span>
                                  <span className="text-slate-300 font-bold">{worker.documentNo}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>{worker.nationality}</span>
                                  {worker.gender && <span className="text-slate-600">• {worker.gender}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Subcon */}
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-bold text-slate-300 block truncate max-w-[150px]">
                              {worker.subcontractor}
                            </span>
                            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                              worker.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : worker.status === 'BARRED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {worker.status}
                            </span>
                          </td>

                          {/* Trade */}
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                              {worker.trade}
                            </span>
                          </td>

                          {/* CIDB Green Card */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-200">
                                <CreditCard size={12} className="text-purple-400" />
                                <span>{worker.cidbGreenCardNo || 'PENDING'}</span>
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

                          {/* Work Permit */}
                          <td className="px-4 py-3.5">
                            {worker.permitNumber ? (
                              <div className="space-y-1">
                                <div className="text-[11px] font-mono font-bold text-slate-200 flex items-center gap-1">
                                  <FileBadge size={12} className="text-emerald-400" />
                                  <span>{worker.permitNumber}</span>
                                </div>
                                {permitStatus && (
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                    permitStatus.color === 'emerald'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    Exp: {worker.permitExpiry}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {worker.documentType === 'IC' ? 'Citizen (Exempt)' : 'No Permit Logged'}
                              </span>
                            )}
                          </td>

                          {/* Induction Status */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <button
                                onClick={() => handleToggleInduction(worker.id)}
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                                  worker.hasPassedInduction 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                                }`}
                                title="Click to toggle induction pass status"
                              >
                                {worker.hasPassedInduction ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                <span>{worker.hasPassedInduction ? 'INDUCTED' : 'PENDING'}</span>
                              </button>
                              <span className="text-[9px] text-slate-500 font-mono block">
                                {worker.inductionDate}
                              </span>
                            </div>
                          </td>

                          {/* Emergency Contact */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5 text-[11px]">
                              <span className="text-slate-300 font-medium block truncate max-w-[130px]">
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
                                onClick={() => setSelectedWorkerForBadge(worker)}
                                className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:text-white hover:bg-cyan-600 transition-all"
                                title="Generate Printable Site Induction Pass"
                              >
                                <Printer size={13} />
                              </button>
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
      ) : (
        /* BADGE GALLERY VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(w => (
            <div 
              key={w.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    {project?.projectName || 'SITE SAFETY PASS'}
                  </span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  w.hasPassedInduction 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {w.hasPassedInduction ? 'INDUCTED' : 'NOT INDUCTED'}
                </span>
              </div>

              {/* Worker Card Core */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {w.photo || w.photoUrl ? (
                    <img src={w.photo || w.photoUrl} alt={w.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-600" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase leading-snug truncate">
                    {w.fullName}
                  </h4>
                  <p className="text-[11px] font-bold text-cyan-400">
                    {w.trade}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {w.subcontractor}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {w.documentType}: {w.documentNo}
                  </p>
                </div>
              </div>

              {/* Statutory details */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block">CIDB Green Card:</span>
                  <span className="text-slate-200 font-bold">{w.cidbGreenCardNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Permit Expiry:</span>
                  <span className="text-slate-200 font-bold">{w.permitExpiry || 'N/A'}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorkerForBadge(w)}
                className="w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Printer size={14} />
                <span>Print Induction Pass</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. Modal: Register / Edit Worker with AI Auto-Scan */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    {editingWorkerId ? 'Update Worker Record' : 'Register New Site Worker'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    AI Vision OCR • Passport &amp; Permit Auto-Extraction
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* AI Auto-Scan Action Bar in Modal */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Gemini Vision AI Auto-Fill Engine
                </span>
                {scanStatusMessage && (
                  <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[280px]">
                    {scanStatusMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isScanningID}
                  onClick={() => idFileInputRef.current?.click()}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isScanningID ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  <span>{isScanningID ? 'Scanning Passport...' : 'Scan Passport / ID'}</span>
                </button>

                <button
                  type="button"
                  disabled={isScanningPermit}
                  onClick={() => permitFileInputRef.current?.click()}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isScanningPermit ? <Loader2 size={16} className="animate-spin" /> : <FileBadge size={16} />}
                  <span>{isScanningPermit ? 'Scanning Permit...' : 'Scan Work Permit / Visa'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4">
              
              {/* Photo & Basic Details Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="relative group shrink-0">
                  <div className="w-24 h-32 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                    {workerPhoto ? (
                      <img src={workerPhoto} alt="Worker" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-500 p-2">
                        <User size={32} className="mx-auto" />
                        <span className="text-[9px] block mt-1 font-bold">3:4 Photo</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-2xl transition-all text-[10px] font-bold"
                  >
                    <Camera size={18} />
                    <span>Upload Photo</span>
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Full Legal Name (Passport / IC) *
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. MD ALAMIN HOSSAIN"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 uppercase placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-emerald-400"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Date of Birth
                      </label>
                      <input 
                        type="date"
                        value={dateOfBirth}
                        onChange={e => setDateOfBirth(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Type, Number, Nationality */}
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
                    <option value="PASSPORT">Passport</option>
                    <option value="NRIC">MyKad (Citizen)</option>
                    <option value="UNHCR">UNHCR Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Document / Passport No *
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. A12345678"
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
                    placeholder="e.g. Scaffolder / Barbender / General Worker"
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* CIDB Green Card & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CIDB Green Card No
                    </label>
                    <button
                      type="button"
                      onClick={handleCheckCIDBPortal}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline flex items-center gap-1"
                    >
                      Verify CIDB <ExternalLink size={10} />
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="e.g. CIDB-98765432"
                    value={cidbGreenCardNo}
                    onChange={e => setCidbGreenCardNo(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
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

              {/* Work Permit No & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Working Permit / Visa Number
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. PLKS-2024-8899"
                    value={permitNumber}
                    onChange={e => setPermitNumber(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Permit Expiry Date
                  </label>
                  <input 
                    type="date"
                    value={permitExpiry}
                    onChange={e => setPermitExpiry(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Induction Date & Blood Type */}
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
                    Induction Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasPassedInduction(!hasPassedInduction)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      hasPassedInduction 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {hasPassedInduction ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{hasPassedInduction ? 'Passed Induction' : 'Pending Induction'}</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Blood Type
                  </label>
                  <select
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="O">O Positive</option>
                    <option value="A">A Positive</option>
                    <option value="B">B Positive</option>
                    <option value="AB">AB Positive</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Emergency Contact Name / Supervisor
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Subcon PIC / Next of Kin"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Emergency Contact Phone
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

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Site Access Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'INACTIVE', 'BARRED'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        status === s 
                          ? s === 'ACTIVE' 
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md' 
                            : s === 'BARRED'
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                            : 'bg-slate-700 text-white border-slate-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                >
                  {editingWorkerId ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Induction Badge Modal */}
      {selectedWorkerForBadge && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black text-white uppercase tracking-wider">Site Safety Pass</span>
              <button 
                onClick={() => setSelectedWorkerForBadge(null)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Printable Pass Layout */}
            <div className="bg-white text-slate-950 p-5 rounded-2xl border-4 border-slate-950 space-y-4 shadow-lg text-center">
              <div className="border-b-2 border-slate-900 pb-2">
                <h4 className="text-sm font-black tracking-widest uppercase">SITE SAFETY INDUCTION PASS</h4>
                <p className="text-[9px] font-bold text-slate-600 uppercase">{project?.projectName || 'CONSTRUCTION SITE'}</p>
              </div>

              <div className="w-24 h-32 mx-auto rounded-xl border-2 border-slate-950 overflow-hidden bg-slate-100 flex items-center justify-center">
                {selectedWorkerForBadge.photo || selectedWorkerForBadge.photoUrl ? (
                  <img src={selectedWorkerForBadge.photo || selectedWorkerForBadge.photoUrl} alt="Worker" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-slate-400" />
                )}
              </div>

              <div>
                <h3 className="text-base font-black uppercase leading-snug">{selectedWorkerForBadge.fullName}</h3>
                <span className="inline-block mt-1 px-3 py-0.5 bg-slate-950 text-white text-[11px] font-black rounded-md uppercase">
                  {selectedWorkerForBadge.trade}
                </span>
              </div>

              <div className="text-left text-[10px] space-y-1 font-mono border-t pt-2 border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">Employer:</span>
                  <span className="font-black text-slate-900">{selectedWorkerForBadge.subcontractor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">{selectedWorkerForBadge.documentType}:</span>
                  <span className="font-black text-slate-900">{selectedWorkerForBadge.documentNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">CIDB Card:</span>
                  <span className="font-black text-slate-900">{selectedWorkerForBadge.cidbGreenCardNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">Inducted On:</span>
                  <span className="font-black text-slate-900">{selectedWorkerForBadge.inductionDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-950">
                <span className="text-[9px] font-black tracking-widest text-emerald-700 uppercase">
                  ✓ VERIFIED AUTHORIZED ENTRY
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer size={15} />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setSelectedWorkerForBadge(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDirectoryView;

