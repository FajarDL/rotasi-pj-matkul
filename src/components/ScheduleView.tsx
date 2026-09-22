import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Course, Student, SessionSchedule, RotationConfig, SessionStatus } from '../types';
import { 
  generateRotationSchedule, 
  generateWhatsAppMessage, 
  swapPjBetweenSessions 
} from '../services/rotationAlgorithm';
import { 
  Shuffle, 
  ArrowLeftRight, 
  Printer, 
  Download, 
  Share2, 
  Check, 
  Edit3, 
  X, 
  Search, 
  Sparkles,
  Info
} from 'lucide-react';

interface ScheduleViewProps {
  course: Course;
  students: Student[];
  sessions: SessionSchedule[];
  onUpdateSessions: (newSessions: SessionSchedule[]) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  course,
  students,
  sessions,
  onUpdateSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  
  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionSchedule | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Generate Rotation Config Form State
  const [rotationConfig, setRotationConfig] = useState<RotationConfig>({
    pjCountPerSession: 2,
    mode: 'fair_random',
    startDate: new Date().toISOString().split('T')[0],
    intervalDays: 7,
    excludeSessionNumbers: [],
  });

  // Swap State
  const [swapSessionAId, setSwapSessionAId] = useState<string>('');
  const [swapStudentAId, setSwapStudentAId] = useState<string>('');
  const [swapSessionBId, setSwapSessionBId] = useState<string>('');
  const [swapStudentBId, setSwapStudentBId] = useState<string>('');

  const courseSessions = sessions
    .filter((s) => s.courseId === course.id)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);

  // Filtered sessions
  const filteredSessions = courseSessions.filter((session) => {
    if (statusFilter !== 'all' && session.status !== statusFilter) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const matchesSession = `pertemuan ${session.sessionNumber}`.includes(query) ||
      session.topic.toLowerCase().includes(query) ||
      session.date.includes(query);

    const assignedStudents = students.filter((s) => session.assignedPjIds.includes(s.id));
    const matchesStudent = assignedStudents.some(
      (s) => s.name.toLowerCase().includes(query) || s.nim.toLowerCase().includes(query)
    );

    return matchesSession || matchesStudent;
  });

  // Handle Generate Rotation
  const handleGenerateRotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (students.filter((s) => s.isActive).length === 0) {
      alert('Tambahkan mahasiswa aktif terlebih dahulu di tab "Daftar Mahasiswa"!');
      return;
    }

    const updated = generateRotationSchedule(
      course.id,
      students,
      course.totalSessions,
      rotationConfig,
      courseSessions
    );

    // Keep sessions of other courses and replace this course's sessions
    const otherSessions = sessions.filter((s) => s.courseId !== course.id);
    onUpdateSessions([...otherSessions, ...updated]);
    setIsGenerateModalOpen(false);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Handle Swap PJ
  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapSessionAId || !swapStudentAId || !swapSessionBId || !swapStudentBId) {
      alert('Pilih pertemuan dan mahasiswa yang ingin ditukar secara lengkap!');
      return;
    }

    const updated = swapPjBetweenSessions(
      sessions,
      swapSessionAId,
      swapStudentAId,
      swapSessionBId,
      swapStudentBId
    );

    onUpdateSessions(updated);
    setIsSwapModalOpen(false);
    setSwapSessionAId('');
    setSwapStudentAId('');
    setSwapSessionBId('');
    setSwapStudentBId('');
  };

  // Handle Copy WA
  const handleCopyWA = (session: SessionSchedule) => {
    const assigned = students.filter((s) => session.assignedPjIds.includes(s.id));
    const text = generateWhatsAppMessage(
      course.name,
      course.lecturer,
      course.day,
      `${course.startTime} - ${course.endTime}`,
      course.room,
      session,
      assigned
    );
    navigator.clipboard.writeText(text);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2500);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Pertemuan', 'Tanggal', 'Topik', 'PJ 1', 'PJ 2', 'Status', 'Catatan'];
    const rows = courseSessions.map((session) => {
      const assigned = students.filter((s) => session.assignedPjIds.includes(s.id));
      const pj1 = assigned[0] ? `${assigned[0].name} (${assigned[0].nim})` : '-';
      const pj2 = assigned[1] ? `${assigned[1].name} (${assigned[1].nim})` : '-';
      return [
        `Pertemuan ${session.sessionNumber}`,
        session.date,
        `"${session.topic.replace(/"/g, '""')}"`,
        `"${pj1}"`,
        `"${pj2}"`,
        session.status,
        `"${(session.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jadwal-rotasi-pj-${course.code.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Save edited session
  const handleSaveSessionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const updated = sessions.map((s) => (s.id === editingSession.id ? editingSession : s));
    onUpdateSessions(updated);
    setEditingSession(null);
  };

  // Toggle status directly
  const handleStatusToggle = (sessionId: string) => {
    const statusCycle: SessionStatus[] = ['upcoming', 'ongoing', 'completed'];
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextIdx = (statusCycle.indexOf(s.status) + 1) % statusCycle.length;
        return { ...s, status: statusCycle[nextIdx] };
      }
      return s;
    });
    onUpdateSessions(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Jadwal Rotasi PJ ({course.name})</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              {courseSessions.length} Pertemuan
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur dan acak giliran penanggung jawab secara adil, atau tukar jadwal mahasiswa yang berhalangan.
          </p>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate Rotasi</span>
          </button>

          <button
            onClick={() => setIsSwapModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-600" />
            <span>Tukar PJ (Swap)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition cursor-pointer"
            title="Download Spreadsheet CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition cursor-pointer"
            title="Cetak Jadwal / Simpan PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari topik, sesi, atau nama PJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Status:</span>
          {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'Semua' : st === 'upcoming' ? 'Akan Datang' : st === 'ongoing' ? 'Berlangsung' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Sesi</th>
                <th className="py-3.5 px-4 w-36">Hari & Tanggal</th>
                <th className="py-3.5 px-4">Materi / Topik Kuliah</th>
                <th className="py-3.5 px-4">Penanggung Jawab (PJ)</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-28 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const assignedStudents = students.filter((s) => session.assignedPjIds.includes(s.id));
                  const isUtsOrUas = session.sessionNumber === 8 || session.sessionNumber === course.totalSessions;

                  return (
                    <tr 
                      key={session.id} 
                      className={`hover:bg-slate-50/60 transition ${
                        isUtsOrUas ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {/* Session Number */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${
                          isUtsOrUas 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{session.sessionNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(session.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                        </div>
                      </td>

                      {/* Topic & Notes */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {session.topic}
                        </div>
                        {session.notes && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="italic">{session.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned PJs */}
                      <td className="py-4 px-4">
                        {assignedStudents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedStudents.map((student) => (
                              <div
                                key={student.id}
                                className="inline-flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200/70 text-indigo-900 px-2.5 py-1 rounded-lg text-xs font-medium"
                              >
                                <span>{student.name}</span>
                                <span className="text-[10px] text-indigo-600/80">({student.nim})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum ada PJ</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(session.id)}
                          title="Klik untuk mengubah status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                            session.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : session.status === 'ongoing'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            session.status === 'completed' ? 'bg-emerald-500' : session.status === 'ongoing' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          <span>
                            {session.status === 'completed' ? 'Selesai' : session.status === 'ongoing' ? 'Berlangsung' : 'Belum'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right no-print whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyWA(session)}
                            title="Salin Pesan Format WhatsApp"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            {copiedSessionId === session.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingSession({ ...session })}
                            title="Edit Topik, Tanggal & PJ"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan sesi perkuliahan yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Generate Rotation */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Generate Rotasi PJ Otomatis
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateRotation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah PJ Per Pertemuan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRotationConfig({ ...rotationConfig, pjCountPerSession: num })}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        rotationConfig.pjCountPerSession === num
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num} Orang {num === 2 ? '(Pasangan/Duo)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Metode Pengacakan & Rotasi
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="fair_random"
                      checked={rotationConfig.mode === 'fair_random'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'fair_random' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Acak Adil (Fair Random)</div>
                      <div className="text-[11px] text-slate-500">
                        Urutan diacak, tetapi dijamin semua mahasiswa bertugas 1x sebelum putaran kedua dimulai.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="sequential_nim"
                      checked={rotationConfig.mode === 'sequential_nim'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'sequential_nim' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Urut Berdasarkan NIM</div>
                      <div className="text-[11px] text-slate-500">
                        Mahasiswa ditugaskan berurutan dari NIM terkecil ke terbesar.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="alphabetical"
                      checked={rotationConfig.mode === 'alphabetical'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'alphabetical' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Urut Berdasarkan Alfabet Nama (A-Z)</div>
                      <div className="text-[11px] text-slate-500">
                        Mahasiswa ditugaskan berurutan sesuai abjad nama lengkap.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Pertemuan 1
                  </label>
                  <input
                    type="date"
                    value={rotationConfig.startDate}
                    onChange={(e) => setRotationConfig({ ...rotationConfig, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Interval Kuliah
                  </label>
                  <select
                    value={rotationConfig.intervalDays}
                    onChange={(e) => setRotationConfig({ ...rotationConfig, intervalDays: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={7}>Tiap 7 Hari (Mingguan)</option>
                    <option value={14}>Tiap 2 Minggu (14 Hari)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
                >
                  Mulai Acak & Buat Rotasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Swap PJ */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tukar Jadwal PJ (Swap)
                </h3>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Gunakan fitur ini jika ada mahasiswa yang berhalangan sakit atau izin pada jadwal tertentu agar dapat ditukar dengan mahasiswa di pertemuan lain.
            </p>

            <form onSubmit={handleExecuteSwap} className="space-y-4">
              {/* Session A */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-indigo-700 uppercase">Pihak Pertama</span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={swapSessionAId}
                    onChange={(e) => {
                      setSwapSessionAId(e.target.value);
                      setSwapStudentAId('');
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">Pilih Sesi...</option>
                    {courseSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Sesi #{s.sessionNumber} ({s.date})
                      </option>
                    ))}
                  </select>

                  <select
                    value={swapStudentAId}
                    onChange={(e) => setSwapStudentAId(e.target.value)}
                    disabled={!swapSessionAId}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">Pilih Mahasiswa A...</option>
                    {students
                      .filter((std) => {
                        const sess = courseSessions.find((s) => s.id === swapSessionAId);
                        return sess?.assignedPjIds.includes(std.id);
                      })
                      .map((std) => (
                        <option key={std.id} value={std.id}>
                          {std.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Session B */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase">Pihak Kedua (Pengganti)</span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={swapSessionBId}
                    onChange={(e) => {
                      setSwapSessionBId(e.target.value);
                      setSwapStudentBId('');
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">Pilih Sesi...</option>
                    {courseSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Sesi #{s.sessionNumber} ({s.date})
                      </option>
                    ))}
                  </select>

                  <select
                    value={swapStudentBId}
                    onChange={(e) => setSwapStudentBId(e.target.value)}
                    disabled={!swapSessionBId}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">Pilih Mahasiswa B...</option>
                    {students
                      .filter((std) => {
                        const sess = courseSessions.find((s) => s.id === swapSessionBId);
                        return sess?.assignedPjIds.includes(std.id);
                      })
                      .map((std) => (
                        <option key={std.id} value={std.id}>
                          {std.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
                >
                  Tukar Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Session Details */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Sesi #{editingSession.sessionNumber}
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Materi / Topik Perkuliahan
                </label>
                <input
                  type="text"
                  value={editingSession.topic}
                  onChange={(e) => setEditingSession({ ...editingSession, topic: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={editingSession.date}
                    onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status Perkuliahan
                  </label>
                  <select
                    value={editingSession.status}
                    onChange={(e) => setEditingSession({ ...editingSession, status: e.target.value as SessionStatus })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="upcoming">Akan Datang</option>
                    <option value="ongoing">Berlangsung</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              {/* PJ Picker for this session */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Mahasiswa PJ Bertugas
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/50 space-y-1">
                  {students.filter((s) => s.isActive).map((std) => {
                    const isChecked = editingSession.assignedPjIds.includes(std.id);
                    return (
                      <label
                        key={std.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...editingSession.assignedPjIds, std.id]
                              : editingSession.assignedPjIds.filter((id) => id !== std.id);
                            setEditingSession({ ...editingSession, assignedPjIds: newIds });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">{std.name}</span>
                        <span className="text-slate-400">({std.nim})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editingSession.notes || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })}
                  placeholder="Misal: Siapkan materi presentasi, modul praktikum..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
