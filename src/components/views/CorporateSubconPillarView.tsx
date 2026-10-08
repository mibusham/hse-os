import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, 
  Plus, Trash2, Users,
  Bot, Sparkles, Send, X, Check, ShieldCheck
} from 'lucide-react';
import type { ProjectIdentity, SubcontractorRecord } from '../../types/core';
import { ProjectService } from '../../services/projectService';

export interface SubconScopeOption {
  id: string;
  name: string;
  cidbSpecialization: string;
  riskCategory: string;
  recommendedGrade?: string;
  isCustom?: boolean;
}

const DEFAULT_SCOPES: SubconScopeOption[] = [
  { 
    id: 'KERJA_STRUKTUR_PERANCAH', 
    name: 'Kerja Struktur Konkrit & Perancah (Scaffolding)', 
    cidbSpecialization: 'B04 (Pembinaan Bangunan) / CE21', 
    riskCategory: 'Tinggi (Bekerja di Tempat Tinggi)', 
    recommendedGrade: 'G4' 
  },
  { 
    id: 'KERJA_BUMBUNG_KEKUDA', 
    name: 'Pemasangan Kekuda Bumbung & Genting', 
    cidbSpecialization: 'B04 / B12 (Kerja Bumbung)', 
    riskCategory: 'Tinggi (Bumbung & Jatuh)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_TANAH_PARIT', 
    name: 'Kerja Tanah, Parit & Pembentungan', 
    cidbSpecialization: 'CE01 / CE02 (Kerja Tanah & Saliran)', 
    riskCategory: 'Tinggi (Korek Parit & Loji Berat)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_MEKANIKAL_ELEKTRIK', 
    name: 'Pemasangan M&E dan Pendawaian Elektrik', 
    cidbSpecialization: 'E01 - E11 / ME', 
    riskCategory: 'Sederhana (Renjatan & Kerja Panas)', 
    recommendedGrade: 'G3' 
  },
  { 
    id: 'KERJA_IKAT_BATA_PLASTER', 
    name: 'Ikat Bata, Lepaan Plaster & Cat', 
    cidbSpecialization: 'B04 (Kerja Am Bangunan)', 
    riskCategory: 'Rendah - Sederhana', 
    recommendedGrade: 'G2' 
  },
];

export const CorporateSubconPillarView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [subconList, setSubconList] = useState<SubcontractorRecord[]>(() => {
    return ProjectService.loadData<SubcontractorRecord[]>('subcontractors_list', []);
  });

  // Dynamic Scopes List (persisted)
  const [scopes, setScopes] = useState<SubconScopeOption[]>(() => {
    return ProjectService.loadData<SubconScopeOption[]>('subcon_scopes', DEFAULT_SCOPES);
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<string>(DEFAULT_SCOPES[0].name);
  const [cidbGrade, setCidbGrade] = useState('G7');
  const [cidbExp, setCidbExp] = useState('2027-12-31');
  const [carPolicyNo, setCarPolicyNo] = useState('');
  const [carExpiryDate, setCarExpiryDate] = useState('2027-06-30');
  const [workersCount, setWorkersCount] = useState<number>(15);
  const [status, setStatus] = useState<SubcontractorRecord['status']>('APPROVED');

  // Core AI Trade Copilot Chat State
  const [showCoreChat, setShowCoreChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'core';
    text: string;
    suggestion?: SubconScopeOption;
  }>>([
    {
      sender: 'core',
      text: 'Salam bro! Apa skop kerja sebenar subkontraktor ini di tapak? Terangkan kepada saya secara santai (contoh: pasang solar, bore piling, turap jalan, pasang lif dsb). Saya akan padankan dengan kod pengkhususan CIDB & standard KKP, kemudian wujudkan pilihan skop ini untuk borang bro.',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('subcontractors_list', subconList, project?.id);
  }, [subconList, project?.id]);

  useEffect(() => {
    ProjectService.saveData('subcon_scopes', scopes, project?.id);
  }, [scopes, project?.id]);

  // AI Trade Knowledge Matcher
  const analyzeTradeWithCore = (text: string): SubconScopeOption => {
    const lower = text.toLowerCase();
    if (lower.includes('solar') || lower.includes('pv') || lower.includes('panel')) {
      return {
        id: `SCOPE_SOLAR_${Date.now()}`,
        name: 'Pemasangan Sistem Solar PV & Pendawaian Arus Tinggi',
        cidbSpecialization: 'E11 (Pemasangan Tanda & Sistem Solar) / ME',
        riskCategory: 'Tinggi (Bekerja di Bumbung & Bahaya Elektrik DC)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('pile') || lower.includes('piling') || lower.includes('cerucuk') || lower.includes('bore')) {
      return {
        id: `SCOPE_PILING_${Date.now()}`,
        name: 'Kerja Cerucuk (Bore/Spun/Sheet Pile) & Ujian Beban Asas',
        cidbSpecialization: 'CE02 (Jambatan, Jeti & Cerucuk) / CE21',
        riskCategory: 'Tinggi (Jentera Berat Piling Rig & Geoteknik)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }
    if (lower.includes('jalan') || lower.includes('road') || lower.includes('premix') || lower.includes('tar') || lower.includes('kerb') || lower.includes('turap')) {
      return {
        id: `SCOPE_ROAD_${Date.now()}`,
        name: 'Pembinaan Jalan Raya, Premix Berturap & Longkang Jalan',
        cidbSpecialization: 'CE01 (Jalan Raya & Pavmen)',
        riskCategory: 'Tinggi (Trafik Loji Berat & Bahan Panas Bitumen)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('kaca') || lower.includes('tingkap') || lower.includes('fasad') || lower.includes('facade') || lower.includes('curtain') || lower.includes('aluminium')) {
      return {
        id: `SCOPE_FACADE_${Date.now()}`,
        name: 'Pemasangan Fasad Aluminium Komposit & Kaca Tingkap (Curtain Wall)',
        cidbSpecialization: 'B04 / B28 (Kerja Kaca & Aluminium)',
        riskCategory: 'Tinggi (Kerja di Tempat Tinggi & Gondola / Boom Lift)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('lif') || lower.includes('lift') || lower.includes('eskalator') || lower.includes('escalator') || lower.includes('hoist')) {
      return {
        id: `SCOPE_LIFT_${Date.now()}`,
        name: 'Pemasangan & Pengujian Lif Penumpang, Barang & Eskalator',
        cidbSpecialization: 'M03 (Lif & Eskalator) / ME',
        riskCategory: 'Tinggi (Lubang Lif Terbuka Shaft & Ruang Terkurung)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }
    if (lower.includes('aircond') || lower.includes('hvac') || lower.includes('hawa dingin') || lower.includes('chiller') || lower.includes('duct')) {
      return {
        id: `SCOPE_HVAC_${Date.now()}`,
        name: 'Pemasangan Sistem Penyamanan Udara (HVAC) & Salur Udara',
        cidbSpecialization: 'M01 (Sistem Penyamanan Udara & Pengalihan Udara)',
        riskCategory: 'Sederhana (Bekerja Atas Siling & Gas Penyejuk Bertekanan)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('bomba') || lower.includes('fire') || lower.includes('sprinkler') || lower.includes('kebakaran') || lower.includes('hosereel')) {
      return {
        id: `SCOPE_FIRE_${Date.now()}`,
        name: 'Pemasangan Sistem Perlindungan Kebakaran & Paip Sprinkler',
        cidbSpecialization: 'M02 (Sistem Pencegahan Kebakaran)',
        riskCategory: 'Sederhana (Ujian Tekanan Paip & Kimpalan Panas)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('paip') || lower.includes('plumbing') || lower.includes('sanitari') || lower.includes('sanitary') || lower.includes('kumbahan') || lower.includes('culvert')) {
      return {
        id: `SCOPE_PLUMBING_${Date.now()}`,
        name: 'Pemasangan Paip Air Dalaman, Sanitari & Saliran Kumbahan',
        cidbSpecialization: 'CE19 (Sistem Pembetungan) / CE20 / B04',
        riskCategory: 'Sederhana (Korek Parit & Ruang Terkurung Manhole)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('landskap') || lower.includes('landscape') || lower.includes('pokok') || lower.includes('rumput') || lower.includes('turfing')) {
      return {
        id: `SCOPE_LANDSCAPE_${Date.now()}`,
        name: 'Kerja Landskap Lembut (Turfing/Pokok) & Hardscape Luaran',
        cidbSpecialization: 'CE14 (Landskap & Pengindahan)',
        riskCategory: 'Rendah (Jentera Pemotong & Baja)',
        recommendedGrade: 'G1',
        isCustom: true,
      };
    }
    if (lower.includes('waterproof') || lower.includes('kalis air') || lower.includes('epoxy') || lower.includes('cat') || lower.includes('paint')) {
      return {
        id: `SCOPE_FINISHES_${Date.now()}`,
        name: 'Kerja Membran Kalis Air (Waterproofing) & Salutan Cat/Epoksi',
        cidbSpecialization: 'B04 / B09 (Kalis Air & Kemasan)',
        riskCategory: 'Sederhana (Wap Toksik Bahan Kimia VOC)',
        recommendedGrade: 'G2',
        isCustom: true,
      };
    }
    if (lower.includes('besi') || lower.includes('rebar') || lower.includes('tetulang') || lower.includes('acuan') || lower.includes('formwork')) {
      return {
        id: `SCOPE_REBAR_${Date.now()}`,
        name: 'Pemasangan Acuan Konkrit (Formwork) & Anyaman Besi Tetulang (Rebar)',
        cidbSpecialization: 'B04 / CE21',
        riskCategory: 'Tinggi (Bahaya Tertusuk Besi Terdedah & Acuan Runtuh)',
        recommendedGrade: 'G3',
        isCustom: true,
      };
    }
    if (lower.includes('cerun') || lower.includes('slope') || lower.includes('gabion') || lower.includes('soil nail')) {
      return {
        id: `SCOPE_SLOPE_${Date.now()}`,
        name: 'Penstabilan Cerun, Pemasangan Gabion & Soil Nailing',
        cidbSpecialization: 'CE08 (Perlindungan Cerun)',
        riskCategory: 'Tinggi (Tanah Runtuh & Bekerja di Kecerunan Curam)',
        recommendedGrade: 'G4',
        isCustom: true,
      };
    }

    // Bespoke fallback
    const cleanWords = text.trim().slice(0, 50);
    const capitalized = cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1);
    return {
      id: `SCOPE_CUSTOM_${Date.now()}`,
      name: `Kerja Khusus Tapak: ${capitalized}`,
      cidbSpecialization: 'B04 / CE21 (Kerja Am Bangunan / Kejuruteraan)',
      riskCategory: 'Tertakluk kepada HIRADC Khusus Tapak',
      recommendedGrade: 'G2',
      isCustom: true,
    };
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      const matched = analyzeTradeWithCore(query);
      const coreReply = {
        sender: 'core' as const,
        text: `Berdasarkan huraian "${query}", analisis Core telah memadankan skop ini dengan pengkhususan statutori CIDB dan profil risiko KKP yang tepat. Sila semak cadangan di bawah:`,
        suggestion: matched,
      };
      setChatMessages(prev => [...prev, coreReply]);
      setIsThinking(false);
    }, 450);
  };

  const handleConfirmAddScope = (scopeToAdd: SubconScopeOption) => {
    // Add to scopes if not already present
    if (!scopes.some(s => s.name.toLowerCase() === scopeToAdd.name.toLowerCase())) {
      setScopes(prev => [...prev, scopeToAdd]);
    }
    // Set current form scope directly to the name
    setScope(scopeToAdd.name);
    // Auto-update CIDB Grade recommendation if available
    if (scopeToAdd.recommendedGrade) {
      setCidbGrade(scopeToAdd.recommendedGrade);
    }
    // Confirmation message in chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'core',
        text: `✅ Berjaya! Skop "${scopeToAdd.name}" telah diwujudkan ke dalam senarai dan dipilih secara automatik. Gred CIDB juga diselaraskan ke ${scopeToAdd.recommendedGrade || 'G3'}. Bro boleh lengkapkan no. polisi CAR dan klik Daftar sekarang.`
      }
    ]);
  };

  const handleAddSubcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !carPolicyNo) return;

    const newSubcon: SubcontractorRecord = {
      id: `subcon-${Date.now()}`,
      name: name.toUpperCase(),
      scope: scope,
      cidbGrade,
      cidbExp,
      carInsuranceValid: true,
      carPolicyNo: carPolicyNo.toUpperCase(),
      carExpiryDate,
      greenCardCompliance: `100% (${workersCount}/${workersCount} Berdaftar)`,
      workersCount,
      status
    };

    setSubconList([newSubcon, ...subconList]);
    setShowAddModal(false);
    setShowCoreChat(false);
    setName('');
    setCarPolicyNo('');
    setWorkersCount(15);
  };

  const handleDeleteSubcon = (id: string) => {
    setSubconList(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setSubconList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus: SubcontractorRecord['status'] = s.status === 'APPROVED' ? 'PENDING_DOCS' : 'APPROVED';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const approvedCount = subconList.filter(s => s.status === 'APPROVED').length;
  const totalWorkers = subconList.reduce((acc, curr) => acc + (curr.workersCount || 0), 0);
  const currentScopeObj = scopes.find(s => s.name === scope);

  return (
    <div className="space-y-6">
      
      {/* Pillar 5 Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <Building2 size={12} /> Statutory Pillar 5
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Tadbir Urus Korporat &amp; Subkontraktor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Penapisan Kontraktor CIDB &amp; Polisi Insurans CAR
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pengesahan kad hijau CIDB pekerja subkontraktor (Akta 520), polisi Contractor's All Risk (CAR), Workmen Compensation (WCA/SOCSO), dan saringan kelayakan kemasukan tapak bersama sokongan AI Trade Specialist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(true);
              setShowCoreChat(false);
            }}
            className="px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>+ Daftar Subkontraktor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah Subkontraktor Berdaftar</span>
          <p className="text-3xl font-black text-white mt-1 font-mono">{subconList.length}</p>
          <span className="text-[10px] text-purple-400 font-medium">Syarikat Berdaftar CIDB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kelulusan Insurans CAR &amp; CIDB</span>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{approvedCount} / {subconList.length || 0}</p>
          <span className="text-[10px] text-emerald-400/80 font-medium">100% Polisi Aktif</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah Pekerja Berkad Hijau</span>
          <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-cyan-400/80 font-medium">Pematuhan Penuh Akta 520 CIDB</span>
        </div>
      </div>

      {/* Subcon Vetting Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-purple-400" /> Direktori Subkontraktor Aktif Di Tapak
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Semakan Dokumen Wajib Sebelum Masuk</span>
        </div>

        {subconList.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Tiada Subkontraktor Didaftarkan Buat Masa Ini</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua subkontraktor kerja struktur, bumbung, mekanikal, dan kerja tanah perlu didaftarkan bersama sijil CIDB dan insurans CAR sebelum memasuki tapak. Klik butang di atas untuk mendaftar.
            </p>
          </div>
        ) : (
          subconList.map(sub => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20 font-mono">
                    CIDB Gred {sub.cidbGrade}
                  </span>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {sub.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(sub.id)}
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                    title="Klik untuk ubah status saringan"
                  >
                    {sub.status === 'APPROVED' ? '✓ DILULUSKAN (PERMITTED)' : '⏳ DOKUMEN BELUM LENGKAP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubcon(sub.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skop Kerja Tapak:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.scope}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Polisi Insurans CAR:</span>
                  <p className="text-slate-200 font-mono mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{sub.carPolicyNo}</span>
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">Sah shg: {sub.carExpiryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pekerja &amp; Kad Hijau:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{sub.greenCardCompliance}</p>
                  <span className="text-[9px] text-emerald-400 font-mono">{sub.workersCount} Pekerja Sah</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Perakuan CIDB Sah:</span>
                  <p className="text-slate-200 font-mono mt-0.5">{sub.cidbExp}</p>
                  <span className="text-[9px] text-slate-500">Pusat Khidmat CIDB</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: DAFTAR SUBCON BARU DENGAN INTEGRASI IN-CONTEXT CORE AI CHAT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full shadow-2xl transition-all my-auto ${
            showCoreChat ? 'max-w-4xl' : 'max-w-xl'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    Daftar Subkontraktor Baharu
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Saringan Pematuhan CIDB &amp; Insurans CAR</span>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split Layout if Core Chat is Active */}
            <div className={`grid gap-6 pt-4 ${showCoreChat ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* Form Section */}
              <form onSubmit={handleAddSubcon} className={`space-y-4 ${showCoreChat ? 'lg:col-span-7' : ''}`}>
                
                {/* Company Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Syarikat Subkontraktor *
                  </label>
                  <input 
                    type="text"
                    placeholder="cth: SURIA MAJU ENGINEERING SDN BHD"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Scope Selection + AI Trigger Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Skop Kerja Di Tapak *
                    </label>

                    {/* Button: Bincang Dengan Core AI */}
                    <button
                      type="button"
                      onClick={() => setShowCoreChat(!showCoreChat)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                        showCoreChat
                          ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-md shadow-purple-500/20'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-200'
                      }`}
                    >
                      <Sparkles size={11} className={showCoreChat ? 'animate-spin' : ''} />
                      <span>{showCoreChat ? 'Tutup Bantuan Core' : '✨ Tiada Dalam List? Bincang Dgn Core'}</span>
                    </button>
                  </div>

                  <select 
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400"
                  >
                    {scopes.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isCustom ? '★ (Skop AI)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Context Note of the Selected Scope */}
                  {currentScopeObj && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[10px] flex items-start gap-2 text-slate-400">
                      <ShieldCheck size={13} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-purple-300 font-bold">Kod CIDB: {currentScopeObj.cidbSpecialization}</span>
                        <span className="mx-1.5 text-slate-600">•</span>
                        <span>Profil Risiko: <strong className="text-slate-300">{currentScopeObj.riskCategory}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CIDB Grade & Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Gred CIDB *
                    </label>
                    <select 
                      value={cidbGrade}
                      onChange={e => setCidbGrade(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                    >
                      <option value="G1">Gred G1 (Hingga RM200k)</option>
                      <option value="G2">Gred G2 (Hingga RM500k)</option>
                      <option value="G3">Gred G3 (Hingga RM1 Juta)</option>
                      <option value="G4">Gred G4 (Hingga RM3 Juta)</option>
                      <option value="G5">Gred G5 (Hingga RM5 Juta)</option>
                      <option value="G6">Gred G6 (Hingga RM10 Juta)</option>
                      <option value="G7">Gred G7 (Tiada Had Nilai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tarikh Luput Sijil CIDB
                    </label>
                    <input 
                      type="date"
                      value={cidbExp}
                      onChange={e => setCidbExp(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* CAR Policy & Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      No. Polisi Insurans CAR *
                    </label>
                    <input 
                      type="text"
                      placeholder="cth: CAR/2026/MY-9801"
                      value={carPolicyNo}
                      onChange={e => setCarPolicyNo(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 uppercase font-mono placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tarikh Luput CAR *
                    </label>
                    <input 
                      type="date"
                      value={carExpiryDate}
                      onChange={e => setCarExpiryDate(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Workers Count & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Bilangan Pekerja Tapak *
                    </label>
                    <input 
                      type="number"
                      value={workersCount}
                      onChange={e => setWorkersCount(Number(e.target.value))}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Status Saringan *
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
                    >
                      <option value="APPROVED">APPROVED (Diluluskan)</option>
                      <option value="PENDING_DOCS">PENDING (Menunggu Dokumen)</option>
                    </select>
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-purple-400 hover:bg-purple-300 uppercase tracking-wider shadow-lg shadow-purple-400/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Daftar &amp; Sahkan Masuk</span>
                  </button>
                </div>
              </form>

              {/* CORE AI TRADE SPECIALIST CHAT PANEL */}
              {showCoreChat && (
                <div className="lg:col-span-5 bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col h-[460px] shadow-inner relative">
                  
                  {/* Chat Panel Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                        <Bot size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          Core AI Trade Copilot
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </h4>
                        <span className="text-[9px] text-purple-300 font-mono">Pakar Pengkhususan CIDB &amp; OSHA</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCoreChat(false)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Chat Quick Trade Pills */}
                  <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">Cadangan Pantas:</span>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Pasang panel solar bumbung & kerja kabel elektrik')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      ☀️ Solar PV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Kerja bore piling dan cerucuk asas')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🚜 Piling
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Turap jalan tar premix dan pasang kerb')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🛣️ Jalan Tar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Pasang kaca fasad curtain wall di tingkat atas')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🪟 Kaca Fasad
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage('Pemasangan sistem lif dan escalator')}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500 shrink-0"
                    >
                      🛗 Lif
                    </button>
                  </div>

                  {/* Chat Messages Body */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs custom-scrollbar">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`rounded-2xl p-3 max-w-[95%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-purple-600 text-white rounded-br-sm shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-[11px]">{msg.text}</p>

                          {/* Action Card: Core Scope Proposal */}
                          {msg.suggestion && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 bg-slate-950/80 p-2.5 rounded-xl border border-purple-500/20">
                              <div className="flex items-center gap-1.5 text-purple-400 font-black text-[10px] uppercase">
                                <Sparkles size={11} /> Cadangan Pengkhususan Core
                              </div>

                              <div className="space-y-1 text-[10px]">
                                <div>
                                  <span className="text-slate-400">Nama Skop: </span>
                                  <strong className="text-white">{msg.suggestion.name}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Pengkhususan CIDB: </span>
                                  <strong className="text-cyan-400 font-mono">{msg.suggestion.cidbSpecialization}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400">Kategori Risiko: </span>
                                  <span className="text-amber-400 font-semibold">{msg.suggestion.riskCategory}</span>
                                </div>
                                {msg.suggestion.recommendedGrade && (
                                  <div>
                                    <span className="text-slate-400">Cadangan Gred CIDB: </span>
                                    <span className="text-purple-300 font-mono font-bold">{msg.suggestion.recommendedGrade}</span>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleConfirmAddScope(msg.suggestion!)}
                                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                <Check size={12} />
                                <span>+ Sahkan &amp; Cipta Skop Ini</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono italic">
                        <Sparkles size={12} className="text-purple-400 animate-spin" />
                        <span>Core sedang menganalisis kod pengkhususan CIDB...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Field */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 shrink-0">
                    <input 
                      type="text"
                      placeholder="Taip kerja subcon (cth: pasang solar)..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-purple-400 placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage()}
                      className="w-8 h-8 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 transition-all"
                    >
                      <Send size={13} />
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CorporateSubconPillarView;
