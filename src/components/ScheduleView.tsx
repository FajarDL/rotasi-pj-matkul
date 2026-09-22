import React, { useState } from 'react';
import type { Course, Student, SessionSchedule, RotationConfig, SessionStatus, UserRole } from '../types';
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
  Info,
  Lock
} from 'lucide-react';

interface ScheduleViewProps {
  course: Course;
  students: Student[];
  sessions: SessionSchedule[];
  userRole: UserRole;
  onUpdateSessions: (newSessions: SessionSchedule[]) => void;
  onRequestLogin?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  course,
  students,
  sessions,
  userRole,
  onUpdateSessions,
  onRequestLogin,
}) => {
  const isAdmin = userRole === 'owner' || userRole === 'admin';
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
    if (!isAdmin) {
      onRequestLogin?.();
      return;
    }

    if (students.filter((s) => s.isActive).length === 0) {
      alert('Tambahkan mahasiswa aktif terlebih dahulu di tab "Data Mahasiswa"!');
      return;
    }

    const updated = generateRotationSchedule(
      course.id,
      students,
      course.totalSessions,
      rotationConfig,
      courseSessions
    );

    const otherSessions = sessions.filter((s) => s.courseId !== course.id);
    onUpdateSessions([...otherSessions, ...updated]);
    setIsGenerateModalOpen(false);
  };

  // Handle Swap PJ
  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequestLogin?.();
      return;
    }

    if (!swapSessionAId || !swapStudentAId || !swapSessionBId || !swapStudentBId) {
      alert('Pilih pertemuan dan mahasiswa yang ingin ditukar secara lengkap.');
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
    link.setAttribute('download', `jadwal-rotasi-${course.code.toLowerCase()}.csv`);
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

  // Toggle status
  const handleStatusToggle = (sessionId: string) => {
    if (!isAdmin) return; // Protected for admin
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
      
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Jadwal Rotasi Perkuliahan ({course.code})</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
              {courseSessions.length} Pertemuan
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar resmi penugasan penanggung jawab perkuliahan per pertemuan semester aktif.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Generate Rotasi</span>
              </button>

              <button
                onClick={() => setIsSwapModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-200"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-600" />
                <span>Tukar PJ (Swap)</span>
              </button>
            </>
          ) : (
            <button
              onClick={onRequestLogin}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-2 rounded-xl border border-slate-200 transition"
              title="Masuk sebagai komti untuk mengacak atau menukar giliran"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Masuk Komti untuk Edit</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-xl transition cursor-pointer"
            title="Cetak Jadwal Resmi"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari sesi, materi, atau nama PJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Sesi</th>
                <th className="py-3 px-4 w-36">Hari & Tanggal</th>
                <th className="py-3 px-4">Pokok Bahasan / Materi</th>
                <th className="py-3 px-4">Penanggung Jawab (PJ)</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right no-print">Aksi</th>
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
                      className={`hover:bg-slate-50/70 transition ${
                        isUtsOrUas ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs ${
                          isUtsOrUas 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{session.sessionNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
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

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {session.topic}
                        </div>
                        {session.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Info className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="italic">{session.notes}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {assignedStudents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedStudents.map((student) => (
                              <div
                                key={student.id}
                                className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs font-medium"
                              >
                                <span>{student.name}</span>
                                <span className="text-[11px] font-mono text-slate-500">({student.nim})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(session.id)}
                          disabled={!isAdmin}
                          title={isAdmin ? 'Klik untuk mengubah status' : 'Status pertemuan'}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition border ${
                            isAdmin ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            session.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : session.status === 'ongoing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>
                            {session.status === 'completed' ? 'Selesai' : session.status === 'ongoing' ? 'Berlangsung' : 'Belum'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right no-print whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyWA(session)}
                            title="Salin Pesan Format WhatsApp"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            {copiedSessionId === session.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setEditingSession({ ...session })}
                              title="Edit Detail Sesi & PJ"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Tidak ditemukan pertemuan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Generate Rotation (Admin only) */}
      {isGenerateModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Konfigurasi Generator Rotasi Otomatis
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateRotation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah PJ Per Sesi Pertemuan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRotationConfig({ ...rotationConfig, pjCountPerSession: num })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition ${
                        rotationConfig.pjCountPerSession === num
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num} Orang {num === 2 ? '(Pasangan)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Metode Rotasi Penugasan
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="fair_random"
                      checked={rotationConfig.mode === 'fair_random'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'fair_random' })}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Acak Adil (Fair Randomization)</div>
                      <div className="text-[11px] text-slate-500">
                        Urutan diacak, tetapi setiap mahasiswa dijamin mendapat 1 giliran sebelum ada yang bertugas 2 kali.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="sequential_nim"
                      checked={rotationConfig.mode === 'sequential_nim'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'sequential_nim' })}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Berurutan Sesuai NIM</div>
                      <div className="text-[11px] text-slate-500">
                        Mahasiswa ditugaskan berurutan dari nomor induk mahasiswa (NIM) terkecil.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rotationMode"
                      value="alphabetical"
                      checked={rotationConfig.mode === 'alphabetical'}
                      onChange={() => setRotationConfig({ ...rotationConfig, mode: 'alphabetical' })}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Berurutan Sesuai Abjad (A-Z)</div>
                      <div className="text-[11px] text-slate-500">
                        Mahasiswa ditugaskan urut berdasarkan alfabet nama lengkap.
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
                    Siklus Perkuliahan
                  </label>
                  <select
                    value={rotationConfig.intervalDays}
                    onChange={(e) => setRotationConfig({ ...rotationConfig, intervalDays: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={7}>Setiap 7 Hari (Mingguan)</option>
                    <option value={14}>Setiap 14 Hari (Dua Mingguan)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
                >
                  Jalankan Generator Rotasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Swap PJ */}
      {isSwapModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Tukar Jadwal Penugasan (Swap PJ)
              </h3>
              <button onClick={() => setIsSwapModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pilih dua pertemuan dan nama mahasiswa yang akan saling ditukar jadwal penugasannya.
            </p>

            <form onSubmit={handleExecuteSwap} className="space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase">Pihak Pertama</span>
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
                    <option value="">Pilih Mahasiswa...</option>
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

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase">Pihak Kedua (Pengganti)</span>
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
                    <option value="">Pilih Mahasiswa...</option>
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
                >
                  Tukar Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Session */}
      {editingSession && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Sesi Pertemuan #{editingSession.sessionNumber}
              </h3>
              <button onClick={() => setEditingSession(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Materi / Pokok Bahasan
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
                    Tanggal Perkuliahan
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
                    Status
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Penugasan PJ (Pilih Mahasiswa)
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
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
                          className="rounded text-slate-900 focus:ring-slate-900"
                        />
                        <span className="font-semibold text-slate-800">{std.name}</span>
                        <span className="text-slate-400 font-mono">({std.nim})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Sesi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editingSession.notes || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })}
                  placeholder="Catatan persiapan ruang atau tugas kelas..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
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
