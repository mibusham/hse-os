import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, Plus, Search, Camera, 
  Trash2, Edit3, Sparkles, Loader2, Image as ImageIcon
} from 'lucide-react';
import type { ProjectIdentity, ToolboxRecord } from '../../../types/core';
import { ProjectService } from '../../../services/projectService';
import { suggestTrainingTopic } from '../../../services/geminiService';
import { resizeImage } from '../../../utils/imageHelpers';

interface ToolboxGalleryViewProps {
  project?: ProjectIdentity;
}

export const ToolboxGalleryView: React.FC<ToolboxGalleryViewProps> = ({ project }) => {
  const [records, setRecords] = useState<ToolboxRecord[]>(() => {
    return ProjectService.loadData<ToolboxRecord[]>('toolbox_gallery_list', []);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<ToolboxRecord['type']>('Toolbox Talk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [presenter, setPresenter] = useState('Safety & Health Officer');
  const [attendeesCount, setAttendeesCount] = useState('35');
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSuggestingTopic, setIsSuggestingTopic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('toolbox_gallery_list', records, project?.id);
  }, [records, project?.id]);

  const handleSuggestAiTopic = async () => {
    setIsSuggestingTopic(true);
    try {
      const suggested = await suggestTrainingTopic(['Work at height', 'Mobile crane lifting', 'Hot work sparks']);
      if (suggested) {
        setTopic(suggested);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingTopic(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file, 1200, 0.85);
      setPhotoUrl(base64);
    } catch (err) {
      alert('Failed to upload toolbox meeting photo');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please fill in briefing topic.');
      return;
    }

    const payload: ToolboxRecord = {
      id: editingId || `tb-${Date.now()}`,
      type,
      date,
      topic: topic.trim().toUpperCase(),
      presenter: presenter.trim(),
      attendeesCount: parseInt(attendeesCount, 10) || 0,
      remarks: remarks.trim() || undefined,
      photoUrl: photoUrl || undefined
    };

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? payload : r));
    } else {
      setRecords(prev => [payload, ...prev]);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setType('Toolbox Talk');
    setDate(new Date().toISOString().split('T')[0]);
    setTopic('');
    setPresenter('Safety & Health Officer');
    setAttendeesCount('35');
    setRemarks('');
    setPhotoUrl(null);
  };

  const handleOpenEdit = (r: ToolboxRecord) => {
    setEditingId(r.id);
    setType(r.type);
    setDate(r.date);
    setTopic(r.topic);
    setPresenter(r.presenter);
    setAttendeesCount(String(r.attendeesCount));
    setRemarks(r.remarks || '');
    setPhotoUrl(r.photoUrl || null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this toolbox meeting log?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      return r.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.presenter.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [records, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Toolbox Meeting &amp; Training Gallery
              </h2>
              <p className="text-xs text-slate-400">
                Daily Safety Briefings, Photo Attendance Logs &amp; Gemini AI Topic Suggestions
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all uppercase tracking-wider"
        >
          <Plus size={16} />
          <span>Log Toolbox Meeting</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by topic, presenter, or keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Grid of Toolbox Sessions */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <ImageIcon size={36} className="mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-white uppercase">No Toolbox Sessions Logged</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log morning toolbox talks and training sessions with crowd photos for statutory compliance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r => (
            <div 
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl hover:border-teal-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                    {r.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {r.date}
                  </span>
                </div>

                {r.photoUrl ? (
                  <div className="w-full h-44 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                    <img src={r.photoUrl} alt={r.topic} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-600">
                    <Camera size={28} />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-black text-white uppercase leading-snug">
                    {r.topic}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Presenter: <strong className="text-slate-200">{r.presenter}</strong></span>
                    <span className="font-mono text-cyan-400 font-bold">{r.attendeesCount} Attendees</span>
                  </div>
                </div>

                {r.remarks && (
                  <p className="text-xs text-slate-400 italic">
                    "{r.remarks}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {editingId ? 'Edit Briefing Log' : 'Log Toolbox Briefing / Training'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Session Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  >
                    <option value="Toolbox Talk">Toolbox Talk</option>
                    <option value="Site Training">Site Training</option>
                    <option value="Special Briefing">Special Safety Briefing</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date *</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Topic / Subject *</label>
                  <button
                    type="button"
                    disabled={isSuggestingTopic}
                    onClick={handleSuggestAiTopic}
                    className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                  >
                    {isSuggestingTopic ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    <span>AI Suggest Topic</span>
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="e.g. WORKING AT HEIGHT & 100% TIE-OFF COMPLIANCE"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-teal-400 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Presenter</label>
                  <input 
                    type="text"
                    value={presenter}
                    onChange={e => setPresenter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Attendees Count</label>
                  <input 
                    type="number"
                    value={attendeesCount}
                    onChange={e => setAttendeesCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notes / Key Takeaways</label>
                <textarea 
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Camera size={14} className="text-teal-400" />
                  <span>{photoUrl ? 'Change Briefing Photo' : 'Upload Briefing / Attendance Photo'}</span>
                </button>
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
                  Save Briefing Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ToolboxGalleryView;
