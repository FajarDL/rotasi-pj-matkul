import React, { useState } from 'react';
import type { Course, Student, SessionSchedule } from '../types';
import { calculateStudentStats, generateWhatsAppMessage } from '../services/rotationAlgorithm';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';

interface DashboardViewProps {
  course: Course;
  students: Student[];
  sessions: SessionSchedule[];
  onNavigateToSchedule: () => void;
  onNavigateToStudents: () => void;
  onToggleSessionStatus: (sessionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  course,
  students,
  sessions,
  onNavigateToSchedule,
  onNavigateToStudents,
  onToggleSessionStatus,
}) => {
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Filter sessions for this course
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
  const studentsWithoutTurn = studentStats.filter((s) => s.totalAssigned === 0 && s.student.isActive);

  // Assigned students for next session
  const nextSessionPjs = nextSession 
    ? students.filter((s) => nextSession.assignedPjIds.includes(s.id))
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
      
      {/* Course Banner Info */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -top-12 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/40 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Mata Kuliah Aktif: {course.code}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {course.name}
            </h2>
            <p className="text-indigo-100 text-sm font-medium">
              Dosen Pengampu: <span className="text-white font-semibold">{course.lecturer}</span>
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-indigo-100 pt-2">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-indigo-200" />
                <span>{course.day}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <Clock className="w-4 h-4 text-indigo-200" />
                <span>{course.startTime} - {course.endTime} WIB</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <MapPin className="w-4 h-4 text-indigo-200" />
                <span>{course.room}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 justify-end">
            <button
              onClick={onNavigateToSchedule}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm cursor-pointer"
            >
              <span>Lihat Jadwal Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Mahasiswa */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mahasiswa Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{activeStudents.length}</span>
            <span className="text-xs text-slate-500">orang di kelas</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <button
              onClick={onNavigateToStudents}
              className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Kelola Mahasiswa &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Progress Perkuliahan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Progres Kuliah
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">
              {completedSessions.length}
              <span className="text-lg font-normal text-slate-400">/{courseSessions.length}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600">{progressPercent}% Selesai</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Mahasiswa Sudah Dapat Giliran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pemerataan PJ
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{studentsWithTurn.length}</span>
            <span className="text-xs text-slate-500">sudah terjadwal</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {studentsWithoutTurn.length > 0 ? (
              <span className="text-amber-600 font-medium">
                {studentsWithoutTurn.length} mahasiswa belum dapat giliran
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">
                Semua mahasiswa sudah terjadwal!
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Sisa Pertemuan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Pertemuan
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">
              {courseSessions.length - completedSessions.length}
            </span>
            <span className="text-xs text-slate-500">sesi ke depan</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total {course.totalSessions} sesi perkuliahan
          </div>
        </div>
      </div>

      {/* Focus Area: Next Session Details & WhatsApp Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Next Session Spotlight Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Pertemuan Terdekat
                </span>
                {nextSession && (
                  <span className="text-xs font-semibold text-slate-500">
                    Sesi #{nextSession.sessionNumber}
                  </span>
                )}
              </div>

              {nextSession && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    nextSession.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : nextSession.status === 'ongoing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {nextSession.status === 'completed'
                    ? 'Selesai'
                    : nextSession.status === 'ongoing'
                    ? 'Berlangsung'
                    : 'Akan Datang'}
                </span>
              )}
            </div>

            {nextSession ? (
              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {nextSession.topic || `Pertemuan Ke-${nextSession.sessionNumber}`}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(nextSession.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {course.startTime} - {course.endTime} WIB
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {course.room}
                    </span>
                  </div>
                </div>

                {/* Assigned PJs */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Penanggung Jawab (PJ) Bertugas:
                  </h4>
                  {nextSessionPjs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {nextSessionPjs.map((student) => (
                        <div
                          key={student.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{student.name}</div>
                            <div className="text-xs text-slate-500">NIM: {student.nim}</div>
                          </div>
                          {student.phone && (
                            <a
                              href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium px-2 py-1 rounded-md transition"
                            >
                              WA
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-amber-700 flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>Belum ada PJ yang ditugaskan untuk pertemuan ini. Silakan generate rotasi.</span>
                    </div>
                  )}
                </div>

                {nextSession.notes && (
                  <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg">
                    <span className="font-semibold text-amber-900">Catatan:</span> {nextSession.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Belum ada jadwal sesi untuk mata kuliah ini.
              </div>
            )}
          </div>

          {/* Action Footer */}
          {nextSession && (
            <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => onToggleSessionStatus(nextSession.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  nextSession.status === 'completed'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {nextSession.status === 'completed'
                  ? 'Tandai Belum Selesai'
                  : 'Tandai Selesai Dilaksanakan'}
              </button>

              <button
                onClick={() => handleCopyWA(nextSession)}
                className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedSessionId === nextSession.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Format WA Disalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Salin Pesan WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Fairness Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Distribusi Giliran PJ
              </h3>
              <button
                onClick={onNavigateToStudents}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Statistik penugasan untuk memastikan tidak ada mahasiswa yang terbebani dua kali sebelum yang lain.
            </p>

            <div className="mt-4 space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {studentStats.slice(0, 8).map(({ student, totalAssigned, completedCount }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 truncate">{student.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{student.nim}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        totalAssigned === 0
                          ? 'bg-amber-100 text-amber-800'
                          : totalAssigned === 1
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {totalAssigned}x PJ
                    </span>
                    {completedCount > 0 && (
                      <span className="text-[10px] text-slate-400">
                        ({completedCount} selesai)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateToSchedule}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Atur / Ubah Rotasi di Halaman Jadwal &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
