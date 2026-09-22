import React, { useState } from 'react';
import type { Course, Student, SessionSchedule, UserRole } from '../types';
import { calculateStudentStats, generateWhatsAppMessage } from '../services/rotationAlgorithm';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Check, 
  CheckCircle2, 
  Share2, 
  ArrowRight,
  BarChart3,
  Search
} from 'lucide-react';

interface DashboardViewProps {
  course: Course;
  students: Student[];
  sessions: SessionSchedule[];
  userRole: UserRole;
  currentStudentNim?: string;
  onNavigateToSchedule: () => void;
  onNavigateToStudents: () => void;
  onToggleSessionStatus: (sessionId: string) => void;
  onRequestLogin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  course,
  students,
  sessions,
  userRole,
  currentStudentNim,
  onNavigateToSchedule,
  onNavigateToStudents,
  onToggleSessionStatus,
  onRequestLogin,
}) => {
  const isAdmin = userRole === 'owner' || userRole === 'admin';
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [personalSearchNim, setPersonalSearchNim] = useState<string>(currentStudentNim || '');

  // Filter sessions for active course
  const courseSessions = sessions
    .filter((s) => s.courseId === course.id)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);

  // Identify next upcoming session
  const nextSession = courseSessions.find((s) => s.status === 'upcoming' || s.status === 'ongoing') 
    || courseSessions[0];

  const completedSessions = courseSessions.filter((s) => s.status === 'completed');
  const progressPercent = courseSessions.length > 0 
    ? Math.round((completedSessions.length / courseSessions.length) * 100) 
    : 0;

  // Student fairness stats
  const studentStats = calculateStudentStats(students, sessions, course.id);
  const activeStudents = students.filter((s) => s.isActive);
  const studentsWithTurn = studentStats.filter((s) => s.totalAssigned > 0 && s.student.isActive);

  // Next session PJs
  const nextSessionPjs = nextSession 
    ? students.filter((s) => nextSession.assignedPjIds.includes(s.id))
    : [];

  // Personal schedule lookup for students
  const searchedStudent = students.find((s) => s.nim === personalSearchNim);
  const myAssignedSessions = searchedStudent 
    ? courseSessions.filter((s) => s.assignedPjIds.includes(searchedStudent.id))
    : [];

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

  return (
    <div className="space-y-6">
      
      {/* Institutional Course Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-slate-800 text-indigo-300 px-2.5 py-0.5 rounded border border-slate-700">
                {course.code}
              </span>
              <span className="text-xs text-slate-400">
                Semester Ganjil/Genap 2026/2027
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {course.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300">
              Dosen Pengampu: <span className="text-white font-semibold">{course.lecturer}</span>
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.day}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.startTime} - {course.endTime} WIB</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.room}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToSchedule}
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-2xs"
            >
              <span>Lihat Jadwal Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Mahasiswa</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeStudents.length}</span>
            <span className="text-xs text-slate-500">terdaftar aktif</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <button
              onClick={onNavigateToStudents}
              className="text-slate-700 hover:text-slate-900 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Data Mahasiswa &rarr;
            </button>
            {!isAdmin && onRequestLogin && (
              <button
                onClick={onRequestLogin}
                className="text-[11px] text-slate-400 hover:text-indigo-600"
              >
                Login Komti
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Kemajuan Perkuliahan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {completedSessions.length}
              <span className="text-base font-normal text-slate-400">/{courseSessions.length}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">{progressPercent}% Selesai</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pemerataan Tugas PJ</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{studentsWithTurn.length}</span>
            <span className="text-xs text-slate-500">/{activeStudents.length} bertugas</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {activeStudents.length - studentsWithTurn.length > 0 ? (
              <span className="text-amber-700 font-medium">
                {activeStudents.length - studentsWithTurn.length} mahasiswa menunggu giliran
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">100% mahasiswa telah bertugas</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Sisa Pertemuan</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {courseSessions.length - completedSessions.length}
            </span>
            <span className="text-xs text-slate-500">sesi tersisa</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target kurikulum: {course.totalSessions} sesi
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Session & Personal Schedule Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Session Spotlight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pertemuan Terdekat
                </span>
                {nextSession && (
                  <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Sesi #{nextSession.sessionNumber}
                  </span>
                )}
              </div>

              {nextSession && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  nextSession.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : nextSession.status === 'ongoing'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {nextSession.status === 'completed'
                    ? 'Telah Selesai'
                    : nextSession.status === 'ongoing'
                    ? 'Sedang Berlangsung'
                    : 'Akan Datang'}
                </span>
              )}
            </div>

            {nextSession ? (
              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {nextSession.topic || `Pertemuan Ke-${nextSession.sessionNumber}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(nextSession.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.startTime} - {course.endTime} WIB
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {course.room}
                    </span>
                  </div>
                </div>

                {/* Assigned PJs */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    Penanggung Jawab (PJ) yang Bertugas:
                  </div>

                  {nextSessionPjs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {nextSessionPjs.map((student) => (
                        <div
                          key={student.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">{student.name}</div>
                            <div className="font-mono text-xs text-slate-500">NIM: {student.nim}</div>
                          </div>
                          {student.phone && (
                            <a
                              href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-2 py-1 rounded border border-emerald-200 transition"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
                      Belum ada penugasan PJ untuk sesi ini.
                    </div>
                  )}
                </div>

                {nextSession.notes && (
                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <span className="font-semibold text-slate-900">Catatan:</span> {nextSession.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada jadwal pertemuan terkonfigurasi.
              </div>
            )}
          </div>

          {nextSession && (
            <div className="pt-5 border-t border-slate-100 mt-5 flex flex-wrap items-center justify-between gap-3">
              {isAdmin ? (
                <button
                  onClick={() => onToggleSessionStatus(nextSession.id)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 border ${
                    nextSession.status === 'completed'
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{nextSession.status === 'completed' ? 'Tandai Belum Terlaksana' : 'Tandai Selesai Terlaksana'}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => handleCopyWA(nextSession)}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedSessionId === nextSession.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Format WhatsApp Berhasil Disalin</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Salin Format Broadcast WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Personal Schedule Checker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-600" />
                Cek Jadwal Tugas Saya
              </h3>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Pilih nama atau masukkan NIM Anda untuk melihat daftar sesi dan tanggal giliran tugas Anda.
            </p>

            <div className="mt-4">
              <select
                value={personalSearchNim}
                onChange={(e) => setPersonalSearchNim(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.nim}>
                    {s.name} ({s.nim})
                  </option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="mt-4">
              {searchedStudent ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-700 flex justify-between items-center">
                    <span>Penugasan {searchedStudent.name}:</span>
                    <span className="font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {myAssignedSessions.length} Kali Bertugas
                    </span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {myAssignedSessions.length > 0 ? (
                      myAssignedSessions.map((s) => (
                        <div key={s.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Pertemuan #{s.sessionNumber}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{s.date}</span>
                          </div>
                          <div className="text-slate-600 mt-1 truncate">{s.topic}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                        Belum ada jadwal giliran tugas pada mata kuliah ini.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Pilih mahasiswa di atas untuk melihat giliran tugas individu.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateToSchedule}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Lihat Seluruh Tabel Pertemuan 1-16 &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
