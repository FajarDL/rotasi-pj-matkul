import React, { useRef } from 'react';
import type { Course } from '../types';
import { 
  CalendarDays, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'schedule' | 'students' | 'courses';
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'students' | 'courses') => void;
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onReset: () => void;
  onOpenNewCourse: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  courses,
  activeCourseId,
  onSelectCourse,
  onBackup,
  onRestore,
  onReset,
  onOpenNewCourse,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCourse = courses.find((c) => c.id === activeCourseId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  Rotasi PJ Matkul
                </h1>
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Manajemen & Pembagian Giliran PJ Kuliah Otomatis
              </p>
            </div>
          </div>

          {/* Active Course Selector & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Course Selector Dropdown */}
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
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-medium py-2 pl-3 pr-8 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition max-w-[180px] sm:max-w-[240px] truncate"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
                <option value="__NEW__">+ Tambah Mata Kuliah Baru</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Backup & Restore Action Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={onBackup}
                title="Download Backup Data (JSON)"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload & Restore Data (JSON)"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition"
              >
                <Upload className="w-4 h-4" />
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
                title="Reset ke Contoh Data Awal"
                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded-md transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Jadwal & Rotasi</span>
              {activeCourse && (
                <span className="ml-1 bg-white/20 text-current text-[11px] px-1.5 py-0.2 rounded-full">
                  {activeCourse.totalSessions} Sesi
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar Mahasiswa</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kelola Mata Kuliah</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
