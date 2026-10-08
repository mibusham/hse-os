import React, { useState } from 'react';
import { 
  FileText, Download, Upload, Search, 
  ShieldCheck, BookOpen
} from 'lucide-react';
import type { ProjectIdentity } from '../../../types/core';

interface DocumentItem {
  id: string;
  title: string;
  category: 'STATUTORY_ACTS' | 'SITE_POLICIES' | 'SOP_PROCEDURES' | 'INSPECTION_TEMPLATES' | 'PROJECT_DRAWINGS';
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'DWG';
  fileSize: string;
  authorOrRef: string;
  dateUploaded: string;
  isStatutory: boolean;
  downloadUrl?: string;
  summary: string;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Occupational Safety and Health Act 1994 (Act 514) & Amendment 2022',
    category: 'STATUTORY_ACTS',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    authorOrRef: 'Federal Gazette Act 514 / Act A1648',
    dateUploaded: '2026-01-01',
    isStatutory: true,
    summary: 'Master statutory health and safety legislation in Malaysia with 2022 enhanced penalties and principal duty holder requirements.'
  },
  {
    id: 'doc-2',
    title: 'CDM Regulations 2024 - P.U. (A) 147 (Design & Management)',
    category: 'STATUTORY_ACTS',
    fileType: 'PDF',
    fileSize: '2.8 MB',
    authorOrRef: 'DOSH Malaysia / P.U.(A) 147',
    dateUploaded: '2026-02-15',
    isStatutory: true,
    summary: 'Statutory regulation governing Clients, Principal Designers (PCWD), and Principal Contractors (PCWC) across all construction phases.'
  },
  {
    id: 'doc-3',
    title: 'Factories and Machinery (BOWEC) Regulations 1986',
    category: 'STATUTORY_ACTS',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    authorOrRef: 'FMA 1967 Subsidiary Legislation',
    dateUploaded: '2026-01-01',
    isStatutory: true,
    summary: 'Building Operations and Works of Engineering Construction statutory safety code for scaffolds, trenches, cranes, and personal protective equipment.'
  },
  {
    id: 'doc-4',
    title: 'Environmental Quality Act 1974 (Act 127) - Scheduled Waste 2005',
    category: 'STATUTORY_ACTS',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    authorOrRef: 'DOE Malaysia Act 127',
    dateUploaded: '2026-01-10',
    isStatutory: true,
    summary: 'Statutory environmental laws regulating industrial effluent, water runoff silt traps, and Scheduled Waste management (SW 305/410).'
  },
  {
    id: 'doc-5',
    title: 'Master Site HSE Management Plan (Project Plot 262 Dawson)',
    category: 'SITE_POLICIES',
    fileType: 'PDF',
    fileSize: '8.4 MB',
    authorOrRef: 'Mibu Construction Corporate HSE Dept',
    dateUploaded: '2026-03-01',
    isStatutory: false,
    summary: 'Comprehensive site safety execution plan approved by Client and Supervising Consultant.'
  },
  {
    id: 'doc-6',
    title: 'Standard Operating Procedure: Critical Crane Lifting & Rigging',
    category: 'SOP_PROCEDURES',
    fileType: 'DOCX',
    fileSize: '650 KB',
    authorOrRef: 'SOP-HSE-OPS-04',
    dateUploaded: '2026-02-20',
    isStatutory: false,
    summary: 'Step-by-step procedures for mobile crane outrigger pads, load calculations, radius verification, and rigger communication protocols.'
  },
  {
    id: 'doc-7',
    title: 'Emergency Response Plan (ERP) & Medical Evacuation Route',
    category: 'SITE_POLICIES',
    fileType: 'PDF',
    fileSize: '3.5 MB',
    authorOrRef: 'ERP-DAWSON-V2',
    dateUploaded: '2026-01-15',
    isStatutory: true,
    summary: 'Emergency evacuation routes, muster points, Bomba & Hospital liaison contacts, and designated First Aider roster.'
  },
  {
    id: 'doc-8',
    title: 'Statutory PTW Permit to Work Template Suite (6 Trades)',
    category: 'INSPECTION_TEMPLATES',
    fileType: 'DOCX',
    fileSize: '1.2 MB',
    authorOrRef: 'FORM-PTW-2026',
    dateUploaded: '2026-02-01',
    isStatutory: false,
    summary: 'Editable templates for Hot Work, Working at Height, Confined Space, Deep Excavation, Electrical Lock-out, and Heavy Lifting.'
  }
];

export const HseDocumentsView: React.FC<{ project?: ProjectIdentity }> = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentItem['category']>('SITE_POLICIES');
  const [newRef, setNewRef] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                        doc.authorOrRef.toLowerCase().includes(search.toLowerCase()) ||
                        doc.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      fileType: 'PDF',
      fileSize: '1.5 MB',
      authorOrRef: newRef || 'Internal HSE Team',
      dateUploaded: new Date().toISOString().split('T')[0],
      isStatutory: false,
      summary: newSummary || 'Uploaded site health and safety document.'
    };
    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewRef('');
    setNewSummary('');
  };

  const handleDownload = (doc: DocumentItem) => {
    alert(`Downloading: ${doc.title}\nFormat: ${doc.fileType} (${doc.fileSize})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Statutory Law & Site Document Repository
            </span>
            <span className="text-xs text-slate-400">OSHA 1994 • FMA 1967 • CIDB • EQA 1974</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">HSE Documents & Statutory Acts Library</h2>
          <p className="text-sm text-slate-400 mt-1">
            Access statutory legislation, project health and safety plans, emergency response procedures, and standardized inspection checklists.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/20 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Documents' },
            { id: 'STATUTORY_ACTS', label: 'Statutory Acts & Regulations' },
            { id: 'SITE_POLICIES', label: 'Site Safety Policies & ERP' },
            { id: 'SOP_PROCEDURES', label: 'Safe Work Procedures (SOP)' },
            { id: 'INSPECTION_TEMPLATES', label: 'Checklists & Templates' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents or legislation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    doc.fileType === 'PDF' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                      {doc.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                {doc.isStatutory && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Statutory
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {doc.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <div className="font-mono text-[11px]">
                <span>{doc.authorOrRef}</span> • <span>{doc.fileSize}</span>
              </div>

              <button
                onClick={() => handleDownload(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-lg transition-all font-medium active:scale-95 text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
              Upload Site HSE Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Scaffolding Weekly Audit Form"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="SITE_POLICIES">Site Safety Policies & ERP</option>
                  <option value="SOP_PROCEDURES">Safe Work Procedures (SOP)</option>
                  <option value="INSPECTION_TEMPLATES">Checklists & Templates</option>
                  <option value="PROJECT_DRAWINGS">Project Safety Drawings</option>
                  <option value="STATUTORY_ACTS">Statutory Acts & Standards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Ref / Author</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="e.g. SOP-OPS-2026-001"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Brief Description / Scope</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Brief summary of requirements or checklist steps..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm"
                >
                  Save & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
