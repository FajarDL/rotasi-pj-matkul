import React, { useRef } from 'react';
import type { Course, UserRole } from '../types';
import { 
  CalendarDays, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  GraduationCap,
  Shield,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'schedule' | 'students' | 'courses';
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'students' | 'courses') => void;
  courses: Course[];
  activeCourseId: string | null;
  userRole: UserRole;
  userName: string;
  pendingCount?: number;
  onSelectCourse: (courseId: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onReset: () => void;
  onOpenNewCourse: () => void;
  onOpenLogin: () => void;
  onOpenSecurity: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  courses,
  activeCourseId,
  userRole,
  userName,
  pendingCount = 0,
  onSelectCourse,
  onBackup,
  onRestore,
  onReset,
  onOpenNewCourse,
  onOpenLogin,
  onOpenSecurity,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs no-print">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Institutional Academic Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  SI-ROTASI
                </h1>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 tracking-wider">
                  AKADEMIK
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Manajemen Rotasi Penanggung Jawab Perkuliahan
              </p>
            </div>
          </div>

          {/* Right Controls: Course Selector, Role Badge & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Course Selector */}
            <div className="relative">
              <select
                value={activeCourseId || ''}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    onOpenNewCourse();
                  } else {
                    onSelectCourse(e.target.value);
                  }
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold py-2 pl-3 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer transition max-w-[150px] sm:max-w-[210px] truncate"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
                {isAdmin && <option value="__NEW__">+ Tambah Mata Kuliah</option>}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Auth / Role Badge */}
            <button
              onClick={onOpenLogin}
              title="Profil Pengguna Aktif"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isAdmin
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className="max-w-[100px] truncate hidden md:inline">{userName}</span>
              <span className="md:hidden">{isAdmin ? 'Admin' : 'Mhs'}</span>
            </button>

            {/* Admin: User & Access Management Button with Pending Badge */}
            {isAdmin && (
              <button
                onClick={onOpenSecurity}
                title="Kelola Akun & Persetujuan Pendaftar"
                className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Akses & Akun</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Data Backup & Restore */}
            {isAdmin && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={onBackup}
                  title="Unduh Cadangan Data (JSON)"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Pulihkan Data (JSON)"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={onReset}
                  title="Reset Data ke Default"
                  className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-white rounded transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar (Logout)"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Jadwal & Rotasi</span>
              {activeCourse && (
                <span className="ml-1 bg-white/20 text-current text-[11px] px-1.5 py-0.2 rounded font-mono">
                  {activeCourse.totalSessions} Sesi
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Mahasiswa</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mata Kuliah</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
