import { useState, useEffect } from 'react';
import type { AppState, Course, SessionSchedule, Student, SessionStatus } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { StudentManager } from './components/StudentManager';
import { CourseManager } from './components/CourseManager';
import { PrintScheduleView } from './components/PrintScheduleView';
import { CheckCircle2, BookOpen } from 'lucide-react';

export function App() {
  const [data, setData] = useState<AppState>(() => storageService.loadData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'students' | 'courses'>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    storageService.saveData(data);
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Active course
  const activeCourse = data.courses.find((c) => c.id === data.activeCourseId) || data.courses[0];

  // Handler to switch active course
  const handleSelectCourse = (courseId: string) => {
    setData((prev) => ({ ...prev, activeCourseId: courseId }));
    showToast('Mata kuliah aktif diubah');
  };

  // Handlers for Courses
  const handleUpdateCourses = (newCourses: Course[]) => {
    setData((prev) => {
      let activeId = prev.activeCourseId;
      if (!newCourses.some((c) => c.id === activeId)) {
        activeId = newCourses[0]?.id || null;
      }
      return { ...prev, courses: newCourses, activeCourseId: activeId };
    });
    showToast('Data mata kuliah diperbarui');
  };

  const handleDeleteCourse = (courseId: string) => {
    setData((prev) => {
      const remainingCourses = prev.courses.filter((c) => c.id !== courseId);
      const remainingSessions = prev.sessions.filter((s) => s.courseId !== courseId);
      const newActiveId = remainingCourses[0]?.id || null;
      return {
        ...prev,
        courses: remainingCourses,
        sessions: remainingSessions,
        activeCourseId: newActiveId,
      };
    });
    showToast('Mata kuliah dihapus');
  };

  // Handlers for Students
  const handleUpdateStudents = (newStudents: Student[]) => {
    setData((prev) => ({ ...prev, students: newStudents }));
    showToast('Daftar mahasiswa berhasil diperbarui');
  };

  // Handlers for Sessions
  const handleUpdateSessions = (newSessions: SessionSchedule[]) => {
    setData((prev) => ({ ...prev, sessions: newSessions }));
    showToast('Jadwal rotasi diperbarui');
  };

  // Toggle single session status from dashboard
  const handleToggleSessionStatus = (sessionId: string) => {
    setData((prev) => {
      const updated = prev.sessions.map((s) => {
        if (s.id === sessionId) {
          const nextStatus: SessionStatus = s.status === 'completed' ? 'upcoming' : 'completed';
          return { ...s, status: nextStatus };
        }
        return s;
      });
      return { ...prev, sessions: updated };
    });
    showToast('Status pertemuan diperbarui');
  };

  // Backup & Restore
  const handleBackup = () => {
    storageService.exportBackup(data);
    showToast('File backup berhasil diunduh');
  };

  const handleRestore = async (file: File) => {
    try {
      const restored = await storageService.importBackup(file);
      setData(restored);
      showToast('Data berhasil dipulihkan dari file backup!');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke contoh data awal?')) {
      const defaultData = storageService.getDefaultData();
      setData(defaultData);
      showToast('Data telah direset ke contoh awal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={data.courses}
        activeCourseId={activeCourse?.id || null}
        onSelectCourse={handleSelectCourse}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onReset={handleReset}
        onOpenNewCourse={() => setActiveTab('courses')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 no-print">
        {activeCourse ? (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                course={activeCourse}
                students={data.students}
                sessions={data.sessions}
                onNavigateToSchedule={() => setActiveTab('schedule')}
                onNavigateToStudents={() => setActiveTab('students')}
                onToggleSessionStatus={handleToggleSessionStatus}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                course={activeCourse}
                students={data.students}
                sessions={data.sessions}
                onUpdateSessions={handleUpdateSessions}
              />
            )}

            {activeTab === 'students' && (
              <StudentManager
                students={data.students}
                sessions={data.sessions}
                activeCourseId={activeCourse.id}
                onUpdateStudents={handleUpdateStudents}
              />
            )}

            {activeTab === 'courses' && (
              <CourseManager
                courses={data.courses}
                activeCourseId={activeCourse.id}
                sessions={data.sessions}
                onSelectCourse={(id) => {
                  handleSelectCourse(id);
                  setActiveTab('dashboard');
                }}
                onUpdateCourses={handleUpdateCourses}
                onDeleteCourse={handleDeleteCourse}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-12">
            <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Belum Ada Mata Kuliah</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Mulai dengan menambahkan mata kuliah pertama untuk mengelola jadwal rotasi PJ.
            </p>
            <button
              onClick={() => setActiveTab('courses')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Tambah Mata Kuliah
            </button>
          </div>
        )}
      </main>

      {/* Print View for PDF generation (only rendered on window.print()) */}
      {activeCourse && (
        <PrintScheduleView
          course={activeCourse}
          students={data.students}
          sessions={data.sessions}
        />
      )}

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Rotasi PJ Matkul</span>
            <span>&bull;</span>
            <span>Aplikasi Pembagian Penanggung Jawab Perkuliahan</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
              Penyimpanan: Offline / LocalStorage Aktif
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-indigo-600 hover:underline font-medium"
            >
              Ke Atas &uarr;
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
