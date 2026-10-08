import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Plus, Search, Trash2, Award, 
  Phone, X
} from 'lucide-react';
import { ProjectService } from '../../../services/projectService';
import type { ProjectIdentity } from '../../../types/core';

export interface SubcontractorCompany {
  id: string;
  name: string;
  trade: string;
  cidbGrade: string; // G1 to G7
  regNo: string;
  picName: string;
  picContact: string;
  activeWorkers: number;
  demeritPoints: number;
  complianceRating: 'EXCELLENT' | 'SATISFACTORY' | 'UNDER_REVIEW' | 'BLACKLISTED';
  joinedDate: string;
}

export interface CompetentPersonRecord {
  id: string;
  name: string;
  icNo: string;
  role: 'SAFETY & HEALTH OFFICER (SHO)' | 'SITE SAFETY SUPERVISOR (SSS)' | 'LIFTING SUPERVISOR' | 'COMPETENT SCAFFOLDER' | 'FIRST AIDER' | 'CONFINED SPACE AGT/AESP';
  certNo: string;
  expiryDate: string;
  company: string;
  contact: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
}

const DEFAULT_SUBCONS: SubcontractorCompany[] = [
  {
    id: 'sub-1',
    name: 'Advance Geotechnical & Piling Sdn Bhd',
    trade: 'Bored Piling & Earthwork',
    cidbGrade: 'G7',
    regNo: 'CIDB 0120180211-PP182390',
    picName: 'En. Faizal Ariffin',
    picContact: '+6012-482 9911',
    activeWorkers: 24,
    demeritPoints: 0,
    complianceRating: 'EXCELLENT',
    joinedDate: '2026-01-10'
  },
  {
    id: 'sub-2',
    name: 'Mega Structure Concreting Services',
    trade: 'RC Structure & Formwork',
    cidbGrade: 'G6',
    regNo: 'CIDB 0120190514-PP198214',
    picName: 'Mr. Koh Chee Wah',
    picContact: '+6019-338 1289',
    activeWorkers: 58,
    demeritPoints: 4,
    complianceRating: 'SATISFACTORY',
    joinedDate: '2026-02-01'
  },
  {
    id: 'sub-3',
    name: 'Sinarmas Scaffolding & Rigging Works',
    trade: 'Tubular & Modular Scaffolding',
    cidbGrade: 'G5',
    regNo: 'CIDB 0120200819-PP210492',
    picName: 'En. Roslan Mat Zin',
    picContact: '+6017-551 0923',
    activeWorkers: 18,
    demeritPoints: 2,
    complianceRating: 'SATISFACTORY',
    joinedDate: '2026-02-15'
  }
];

const DEFAULT_COMPETENT: CompetentPersonRecord[] = [
  {
    id: 'cp-1',
    name: 'Razak Bin Othman',
    icNo: '820412-08-5521',
    role: 'SAFETY & HEALTH OFFICER (SHO)',
    certNo: 'DOSH HQ/14/SHO/00/5892',
    expiryDate: '2027-08-14',
    company: 'Mibu Construction HSE Div',
    contact: '+6012-482 1199',
    status: 'ACTIVE'
  },
  {
    id: 'cp-2',
    name: 'Ahmad Nizam Bin Salleh',
    icNo: '840512-07-5531',
    role: 'LIFTING SUPERVISOR',
    certNo: 'DOSH LS/2021/0491',
    expiryDate: '2027-03-30',
    company: 'Advance Geotechnical & Piling',
    contact: '+6016-441 8820',
    status: 'ACTIVE'
  },
  {
    id: 'cp-3',
    name: 'Muhammad Faris Bin Johari',
    icNo: '910304-02-5819',
    role: 'COMPETENT SCAFFOLDER',
    certNo: 'CIDB / ABM SCAFF-LEV3-2819',
    expiryDate: '2026-12-10',
    company: 'Sinarmas Scaffolding',
    contact: '+6013-882 1092',
    status: 'ACTIVE'
  },
  {
    id: 'cp-4',
    name: 'Siti Nur Aisyah',
    icNo: '950821-08-6012',
    role: 'FIRST AIDER',
    certNo: 'ST JOHN AMBULANCE FA-2025-991',
    expiryDate: '2028-01-15',
    company: 'Mibu Construction HQ',
    contact: '+6011-209 8831',
    status: 'ACTIVE'
  }
];

export const StaffSubconView: React.FC<{ project?: ProjectIdentity }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'SUBCONS' | 'COMPETENT'>('SUBCONS');
  const [subcons, setSubcons] = useState<SubcontractorCompany[]>(() => {
    return ProjectService.loadData<SubcontractorCompany[]>('hse_subcon_directory', DEFAULT_SUBCONS);
  });
  const [competentPersons, setCompetentPersons] = useState<CompetentPersonRecord[]>(() => {
    return ProjectService.loadData<CompetentPersonRecord[]>('hse_competent_persons', DEFAULT_COMPETENT);
  });

  const [search, setSearch] = useState('');
  const [showSubconModal, setShowSubconModal] = useState(false);
  const [showCompetentModal, setShowCompetentModal] = useState(false);

  // Subcon form
  const [subName, setSubName] = useState('');
  const [subTrade, setSubTrade] = useState('Reinforced Concrete');
  const [subCidbGrade, setSubCidbGrade] = useState('G7');
  const [subRegNo, setSubRegNo] = useState('');
  const [subPicName, setSubPicName] = useState('');
  const [subPicContact, setSubPicContact] = useState('');
  const [subWorkers, setSubWorkers] = useState<number>(10);

  // Competent form
  const [cpName, setCpName] = useState('');
  const [cpIc, setCpIc] = useState('');
  const [cpRole, setCpRole] = useState<CompetentPersonRecord['role']>('SITE SAFETY SUPERVISOR (SSS)');
  const [cpCertNo, setCpCertNo] = useState('');
  const [cpExpiry, setCpExpiry] = useState('');
  const [cpCompany, setCpCompany] = useState('');
  const [cpContact, setCpContact] = useState('');

  useEffect(() => {
    ProjectService.saveData('hse_subcon_directory', subcons, project?.id);
  }, [subcons, project?.id]);

  useEffect(() => {
    ProjectService.saveData('hse_competent_persons', competentPersons, project?.id);
  }, [competentPersons, project?.id]);

  const handleAddSubcon = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: SubcontractorCompany = {
      id: `sub-${Date.now()}`,
      name: subName,
      trade: subTrade,
      cidbGrade: subCidbGrade,
      regNo: subRegNo || `CIDB 012026-${Math.floor(Math.random() * 900000)}`,
      picName: subPicName,
      picContact: subPicContact,
      activeWorkers: Number(subWorkers),
      demeritPoints: 0,
      complianceRating: 'EXCELLENT',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setSubcons([...subcons, newSub]);
    setShowSubconModal(false);
    setSubName('');
    setSubPicName('');
    setSubPicContact('');
  };

  const handleAddCompetent = (e: React.FormEvent) => {
    e.preventDefault();
    const newCp: CompetentPersonRecord = {
      id: `cp-${Date.now()}`,
      name: cpName,
      icNo: cpIc,
      role: cpRole,
      certNo: cpCertNo,
      expiryDate: cpExpiry || '2027-12-31',
      company: cpCompany || 'Subcontractor Partner',
      contact: cpContact,
      status: 'ACTIVE'
    };
    setCompetentPersons([...competentPersons, newCp]);
    setShowCompetentModal(false);
    setCpName('');
    setCpIc('');
    setCpCertNo('');
  };

  const handleDeleteSubcon = (id: string) => {
    if (confirm('Delete this subcontractor?')) {
      setSubcons(subcons.filter(s => s.id !== id));
    }
  };

  const handleDeleteCompetent = (id: string) => {
    if (confirm('Delete this competent person record?')) {
      setCompetentPersons(competentPersons.filter(c => c.id !== id));
    }
  };

  const filteredSubcons = subcons.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.trade.toLowerCase().includes(search.toLowerCase()) ||
    s.picName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompetent = competentPersons.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Corporate Partner & Competency Register
            </span>
            <span className="text-xs text-slate-400">CIDB Act 520 & DOSH Statutory Duty</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Subcontractor Companies & Competent Staff</h2>
          <p className="text-sm text-slate-400 mt-1">
            Maintain verified subcontractor corporate records, CIDB grades, emergency PICs, and statutory certified competent persons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SUBCONS' ? (
            <button
              onClick={() => setShowSubconModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Register Subcontractor
            </button>
          ) : (
            <button
              onClick={() => setShowCompetentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Competent Person
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SUBCONS')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'SUBCONS'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            Subcontractor Companies ({subcons.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPETENT')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'COMPETENT'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-blue-400" />
            Statutory Competent Persons ({competentPersons.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* View: Subcontractors Tab */}
      {activeTab === 'SUBCONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubcons.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      CIDB {s.cidbGrade}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 leading-snug">{s.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{s.trade}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSubcon(s.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reg No:</span>
                    <span className="font-mono text-slate-300">{s.regNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PIC:</span>
                    <span className="font-medium text-white">{s.picName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Contact:</span>
                    <a href={`tel:${s.picContact}`} className="text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" />
                      {s.picContact}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.activeWorkers} Workers Active</span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    s.demeritPoints === 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : s.demeritPoints <= 5 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {s.demeritPoints} Demerit Pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Competent Persons Tab */}
      {activeTab === 'COMPETENT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Name & IC No.</th>
                <th className="py-3.5 px-4">Statutory Role</th>
                <th className="py-3.5 px-4">Certificate / DOSH Reg</th>
                <th className="py-3.5 px-4">Company / Employer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCompetent.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-sm">{c.name}</div>
                    <div className="text-slate-400 font-mono mt-0.5">{c.icNo}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {c.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-white">{c.certNo}</div>
                    <div className="text-slate-500 text-[11px]">Exp: {c.expiryDate}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {c.company}
                  </td>
                  <td className="py-3.5 px-4">
                    <a href={`tel:${c.contact}`} className="text-emerald-400 font-mono flex items-center gap-1 hover:underline">
                      <Phone className="w-3 h-3" />
                      {c.contact}
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCompetent(c.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add Subcontractor */}
      {showSubconModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Register Subcontractor Company</h3>
              <button onClick={() => setShowSubconModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubcon} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Pembinaan Bersatu Sdn Bhd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Trade Package *</label>
                  <input
                    type="text"
                    required
                    value={subTrade}
                    onChange={(e) => setSubTrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">CIDB Grade *</label>
                  <select
                    value={subCidbGrade}
                    onChange={(e) => setSubCidbGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="G7">G7 (Unlimited)</option>
                    <option value="G6">G6 (Up to RM10M)</option>
                    <option value="G5">G5 (Up to RM5M)</option>
                    <option value="G4">G4 (Up to RM3M)</option>
                    <option value="G3">G3 (Up to RM1M)</option>
                    <option value="G2">G2 (Up to RM500k)</option>
                    <option value="G1">G1 (Up to RM200k)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">CIDB Reg Certificate No</label>
                <input
                  type="text"
                  value={subRegNo}
                  onChange={(e) => setSubRegNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. CIDB 0120240912-PP198822"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Safety PIC Name *</label>
                  <input
                    type="text"
                    required
                    value={subPicName}
                    onChange={(e) => setSubPicName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">PIC Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={subPicContact}
                    onChange={(e) => setSubPicContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Estimated Workforce Count</label>
                <input
                  type="number"
                  value={subWorkers}
                  onChange={(e) => setSubWorkers(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubconModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm"
                >
                  Save Subcontractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Competent Person */}
      {showCompetentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Statutory Competent Person</h3>
              <button onClick={() => setShowCompetentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompetent} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={cpName}
                  onChange={(e) => setCpName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">IC / Passport No *</label>
                  <input
                    type="text"
                    required
                    value={cpIc}
                    onChange={(e) => setCpIc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Statutory Competent Role *</label>
                  <select
                    value={cpRole}
                    onChange={(e) => setCpRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SAFETY & HEALTH OFFICER (SHO)">Safety & Health Officer (SHO)</option>
                    <option value="SITE SAFETY SUPERVISOR (SSS)">Site Safety Supervisor (SSS)</option>
                    <option value="LIFTING SUPERVISOR">Lifting Supervisor</option>
                    <option value="COMPETENT SCAFFOLDER">Competent Scaffolder</option>
                    <option value="FIRST AIDER">First Aider</option>
                    <option value="CONFINED SPACE AGT/AESP">Confined Space AGT/AESP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DOSH / Cert No *</label>
                  <input
                    type="text"
                    required
                    value={cpCertNo}
                    onChange={(e) => setCpCertNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g. DOSH HQ/14/SHO/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={cpExpiry}
                    onChange={(e) => setCpExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Employer / Company</label>
                  <input
                    type="text"
                    value={cpCompany}
                    onChange={(e) => setCpCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contact No</label>
                  <input
                    type="text"
                    value={cpContact}
                    onChange={(e) => setCpContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompetentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm"
                >
                  Save Competent Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
