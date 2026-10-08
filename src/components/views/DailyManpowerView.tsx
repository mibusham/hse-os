import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Plus, Trash2, 
  Save, RefreshCw, Copy, CheckCircle2,
  HardHat, Sun, CloudRain, History
} from 'lucide-react';
import type { ProjectIdentity, TradeItem, DailyManpowerEntry } from '../../types/core';
import { ProjectService } from '../../services/projectService';

interface DailyManpowerViewProps {
  project?: ProjectIdentity;
}

const DEFAULT_TRADE_LIST = [
  'Pekerja Am (General Worker)',
  'Tukang Kayu (Carpenter)',
  'Anyaman Besi (Barbender)',
  'Kerja Konkrit (Concreter)',
  'Ikat Bata & Plaster (Bricklayer)',
  'Pemasang Perancah (Scaffolder)',
  'Kekuda & Bumbung (Roofer)',
  'Pendawaian Elektrik (M&E)',
  'Paip & Sanitari (Plumber)',
  'Operator Jentera Berat (Plant Operator)',
  'Pengecat (Painter)',
  'Penyelia Tapak (Site Supervisor)'
];

export const DailyManpowerView: React.FC<DailyManpowerViewProps> = ({ project }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [shift, setShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [weatherMorning, setWeatherMorning] = useState('Cerah');
  const [weatherAfternoon, setWeatherAfternoon] = useState('Panas 34°C');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manpower History Entries
  const [manpowerHistory, setManpowerHistory] = useState<DailyManpowerEntry[]>(() => {
    return ProjectService.loadData<DailyManpowerEntry[]>('daily_manpower_history', []);
  });

  // Master Trades List
  const [masterTrades, setMasterTrades] = useState<string[]>(() => {
    return ProjectService.loadData<string[]>('manpower_master_trades', DEFAULT_TRADE_LIST);
  });

  // Current day trade counts
  const [currentTrades, setCurrentTrades] = useState<TradeItem[]>(() => {
    // Check if there is an existing record for today
    const existing = ProjectService.loadData<DailyManpowerEntry[]>('daily_manpower_history', [])
      .find(h => h.date === todayStr && h.shift === 'DAY');
    
    if (existing && existing.trades.length > 0) {
      return existing.trades;
    }
    return DEFAULT_TRADE_LIST.map((name, idx) => ({
      id: `trade-${idx}`,
      name,
      count: 0
    }));
  });

  const [newTradeName, setNewTradeName] = useState('');
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);

  // Persistence
  useEffect(() => {
    ProjectService.saveData('daily_manpower_history', manpowerHistory, project?.id);
  }, [manpowerHistory, project?.id]);

  useEffect(() => {
    ProjectService.saveData('manpower_master_trades', masterTrades, project?.id);
  }, [masterTrades, project?.id]);

  // When date changes, load that date's data if exists
  useEffect(() => {
    const record = manpowerHistory.find(h => h.date === selectedDate && h.shift === shift);
    if (record) {
      setCurrentTrades(record.trades);
      setWeatherMorning(record.weatherMorning || 'Cerah');
      setWeatherAfternoon(record.weatherAfternoon || 'Panas 34°C');
      setNotes(record.notes || '');
    } else {
      // Re-populate from master trades with 0 count
      setCurrentTrades(masterTrades.map((name, idx) => ({
        id: `trade-${selectedDate}-${idx}`,
        name,
        count: 0
      })));
      setNotes('');
    }
  }, [selectedDate, shift, masterTrades, manpowerHistory]);

  const totalWorkers = currentTrades.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const handleUpdateCount = (tradeName: string, delta: number) => {
    setCurrentTrades(prev => prev.map(t => {
      if (t.name === tradeName) {
        const next = Math.max(0, (t.count || 0) + delta);
        return { ...t, count: next };
      }
      return t;
    }));
  };

  const handleSetExactCount = (tradeName: string, count: number) => {
    setCurrentTrades(prev => prev.map(t => {
      if (t.name === tradeName) {
        return { ...t, count: Math.max(0, count) };
      }
      return t;
    }));
  };

  const handleSaveEntry = () => {
    const entry: DailyManpowerEntry = {
      id: `manpower-${selectedDate}-${shift}`,
      date: selectedDate,
      shift,
      trades: currentTrades,
      totalWorkers,
      recordedBy: 'Pegawai Keselamatan Tapak (SHO)',
      weatherMorning,
      weatherAfternoon,
      notes,
      createdAt: new Date().toISOString()
    };

    setManpowerHistory(prev => {
      const filtered = prev.filter(h => !(h.date === selectedDate && h.shift === shift));
      return [entry, ...filtered];
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopyYesterday = () => {
    const yesterday = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0];
    const prevRecord = manpowerHistory.find(h => h.date === yesterday && h.shift === shift);
    if (prevRecord) {
      setCurrentTrades(prevRecord.trades);
      alert(`Berjaya menyalin rekod kehadiran semalam (${yesterday}): ${prevRecord.totalWorkers} orang pekerja.`);
    } else {
      alert(`Tiada rekod tersimpan untuk tarikh semalam (${yesterday}).`);
    }
  };

  const handleResetZeros = () => {
    if (confirm('Set semula semua kiraan hari ini kepada 0?')) {
      setCurrentTrades(prev => prev.map(t => ({ ...t, count: 0 })));
    }
  };

  const handleAddNewTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTradeName.trim()) return;
    const clean = newTradeName.trim();
    if (masterTrades.includes(clean)) {
      alert('Kategori trade ini sudah wujud!');
      return;
    }
    const updated = [...masterTrades, clean];
    setMasterTrades(updated);
    setCurrentTrades(prev => [...prev, { id: `trade-${Date.now()}`, name: clean, count: 0 }]);
    setNewTradeName('');
    setShowAddTradeModal(false);
  };

  const handleDeleteTrade = (name: string) => {
    if (confirm(`Padam kategori trade "${name}" dari senarai?`)) {
      setMasterTrades(prev => prev.filter(t => t !== name));
      setCurrentTrades(prev => prev.filter(t => t.name !== name));
    }
  };

  const handleDeleteHistory = (id: string) => {
    if (confirm('Padam rekod sejarah ini?')) {
      setManpowerHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1.5">
              <Users size={12} /> Operasi Harian Tapak
            </span>
            <span className="text-xs text-slate-500 font-mono">•</span>
            <span className="text-xs font-mono text-slate-400 font-bold">Daily Manpower Muster Tracker</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Log Kehadiran &amp; Kuota Pekerja Tapak Harian
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Merekodkan bilangan kehadiran harian pekerja subkontraktor mengikut perdagangan (*trade*). Data ini diselaraskan secara automatik ke dalam pengiraan Jam Bekerja Selamat (*Safe Man-Hours*) dan Laporan Bulanan JKKP.
          </p>
        </div>

        {/* Quick Date & Shift Picker */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-cyan-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setShift('DAY')}
              className={`px-2.5 py-1 rounded-lg transition-all ${shift === 'DAY' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
            >
              ☀️ Siang
            </button>
            <button
              type="button"
              onClick={() => setShift('NIGHT')}
              className={`px-2.5 py-1 rounded-lg transition-all ${shift === 'NIGHT' ? 'bg-indigo-500 text-white font-black' : 'text-slate-400 hover:text-white'}`}
            >
              🌙 Malam
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Workers Card */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-cyan-500/20 pointer-events-none">
            <Users size={48} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Total Pekerja Hari Ini</span>
          <p className="text-4xl font-black text-white mt-1 font-mono">{totalWorkers}</p>
          <span className="text-[10px] text-slate-400 font-medium">Orang Hadir di Tapak Bina</span>
        </div>

        {/* Active Trades Count */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kategori Perdagangan Aktif</span>
          <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">
            {currentTrades.filter(t => t.count > 0).length} / {currentTrades.length}
          </p>
          <span className="text-[10px] text-emerald-400/80 font-medium">Trade Sedang Beroperasi</span>
        </div>

        {/* Weather Morning */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sun size={12} className="text-amber-400" /> Cuaca Pagi
          </span>
          <input 
            type="text"
            value={weatherMorning}
            onChange={e => setWeatherMorning(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-cyan-400 mt-2"
            placeholder="Cerah / Hujan"
          />
        </div>

        {/* Weather Afternoon */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CloudRain size={12} className="text-blue-400" /> Cuaca Petang
          </span>
          <input 
            type="text"
            value={weatherAfternoon}
            onChange={e => setWeatherAfternoon(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-cyan-400 mt-2"
            placeholder="Panas 34°C / Hujan Lebat"
          />
        </div>
      </div>

      {/* 3. Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyYesterday}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Salin kiraan pekerja daripada hari semalam"
          >
            <Copy size={13} />
            <span>Salin Semalam</span>
          </button>

          <button
            type="button"
            onClick={handleResetZeros}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} />
            <span>Reset Sifar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddTradeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus size={13} />
            <span>+ Tambah Trade Baru</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveEntry}
          className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
            saveSuccess
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20'
          }`}
        >
          {saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{saveSuccess ? 'Berjaya Disimpan!' : 'Simpan Kehadiran Hari Ini'}</span>
        </button>
      </div>

      {/* 4. Trade Counters Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HardHat size={14} className="text-cyan-400" /> Pecahan Kehadiran Mengikut Perdagangan (Trade Muster)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Gunakan butang + / - atau taip nombor terus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentTrades.map((trade) => (
            <div 
              key={trade.name}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all ${
                trade.count > 0 
                  ? 'border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/20 shadow-sm' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-black text-white leading-tight">
                  {trade.name}
                </span>
                
                {masterTrades.length > 5 && !DEFAULT_TRADE_LIST.includes(trade.name) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTrade(trade.name)}
                    className="text-slate-600 hover:text-rose-400 p-0.5"
                    title="Padam trade ini"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Fast Stepper Counter */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(trade.name, -5)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs flex items-center justify-center active:scale-95 transition-all"
                    title="-5"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(trade.name, -1)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-200 hover:text-rose-300 font-black text-sm flex items-center justify-center active:scale-95 transition-all"
                  >
                    -
                  </button>
                </div>

                <input 
                  type="number"
                  min="0"
                  value={trade.count || ''}
                  onChange={e => handleSetExactCount(trade.name, Number(e.target.value))}
                  placeholder="0"
                  className="w-16 bg-slate-950 border border-slate-700 rounded-xl py-1 text-center font-mono font-black text-base text-cyan-300 outline-none focus:border-cyan-400"
                />

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(trade.name, 1)}
                    className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm flex items-center justify-center border border-cyan-500/30 active:scale-95 transition-all"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(trade.name, 5)}
                    className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center active:scale-95 transition-all"
                    title="+5"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Sejarah Kehadiran Lepas (Manpower History Logs) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History size={14} className="text-cyan-400" /> Lejar Sejarah Kehadiran Tapak ({manpowerHistory.length} Hari Direkodkan)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Simpanan Masa-Nyata Google Cloud</span>
        </div>

        {manpowerHistory.length === 0 ? (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <Users size={32} className="text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Belum ada sejarah log harian disimpan.</p>
            <p className="text-[11px] text-slate-500">Klik "Simpan Kehadiran Hari Ini" di atas untuk memulakan lejar.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Tarikh</th>
                    <th className="px-4 py-3">Sif</th>
                    <th className="px-4 py-3 text-right">Jumlah Pekerja</th>
                    <th className="px-4 py-3">Pecahan Trade Utama</th>
                    <th className="px-4 py-3">Cuaca Pagi/Petang</th>
                    <th className="px-4 py-3">Pegawai Merekod</th>
                    <th className="px-4 py-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {manpowerHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white flex items-center gap-2">
                        <Calendar size={13} className="text-cyan-400" />
                        <span>{item.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.shift === 'DAY' ? 'bg-amber-500/10 text-amber-300' : 'bg-indigo-500/10 text-indigo-300'
                        }`}>
                          {item.shift === 'DAY' ? 'Siang' : 'Malam'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-cyan-400 text-sm">
                        {item.totalWorkers}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 max-w-xs truncate">
                        {item.trades.filter(t => t.count > 0).map(t => `${t.name}: ${t.count}`).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {item.weatherMorning} / {item.weatherAfternoon}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {item.recordedBy}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Padam rekod ini"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Tambah Trade Baharu */}
      {showAddTradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-cyan-400" /> Tambah Kategori Trade Baharu
            </h3>

            <form onSubmit={handleAddNewTrade} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Trade / Kemahiran *
                </label>
                <input 
                  type="text"
                  placeholder="cth: Pemasang Solar PV"
                  value={newTradeName}
                  onChange={e => setNewTradeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTradeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 uppercase tracking-wider shadow-lg shadow-cyan-400/20"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailyManpowerView;
