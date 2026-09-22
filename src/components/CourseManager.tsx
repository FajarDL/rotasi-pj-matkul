import React, { useState } from 'react';
import type { Course, SessionSchedule, UserRole } from '../types';
import { COURSE_PRESETS, MASTER_LECTURERS, MASTER_ROOMS } from '../data/academicPresets';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X,
  Wand2,
  Lock
} from 'lucide-react';

interface CourseManagerProps {
  courses: Course[];
  activeCourseId: string | null;
  sessions: SessionSchedule[];
  userRole: UserRole;
  onSelectCourse: (courseId: string) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddCourseWithPreset?: (newCourse: Course, topics: string[]) => void;
  onRequestLogin?: () => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  courses,
  activeCourseId,
  sessions,
  userRole,
  onSelectCourse,
  onUpdateCourses,
  onDeleteCourse,
  onAddCourseWithPreset,
  onRequestLogin,
}) => {
  const isAdmin = userRole === 'owner' || userRole === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<string>('');

  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    code: '',
    name: '',
    lecturer: '',
    day: 'Senin',
    startTime: '08:00',
    endTime: '10:30',
    room: '',
    totalSessions: 16,
    color: 'indigo',
  });

  const openAddModal = () => {
    if (!isAdmin) {
      onRequestLogin?.();
      return;
    }
    setEditingCourse(null);
    setSelectedPresetIndex('');
    setFormData({
      code: '',
      name: '',
      lecturer: '',
      day: 'Senin',
      startTime: '08:00',
      endTime: '10:30',
      room: '',
      totalSessions: 16,
      color: 'indigo',
    });
    setIsModalOpen(true);
  };

  const handleSelectPreset = (indexStr: string) => {
    setSelectedPresetIndex(indexStr);
    if (!indexStr) return;
    const preset = COURSE_PRESETS[Number(indexStr)];
    if (preset) {
      setFormData({
        code: preset.code,
        name: preset.name,
        lecturer: preset.lecturer,
        day: preset.day,
        startTime: preset.startTime,
        endTime: preset.endTime,
        room: preset.room,
        totalSessions: preset.totalSessions,
        color: 'indigo',
      });
    }
  };

  const openEditModal = (course: Course) => {
    if (!isAdmin) {
      onRequestLogin?.();
      return;
    }
    setEditingCourse(course);
    setSelectedPresetIndex('');
    setFormData({
      code: course.code,
      name: course.name,
      lecturer: course.lecturer,
      day: course.day,
      startTime: course.startTime,
      endTime: course.endTime,
      room: course.room,
      totalSessions: course.totalSessions,
      color: course.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (editingCourse) {
      const updated = courses.map((c) =>
        c.id === editingCourse.id ? { ...c, ...formData } : c
      );
      onUpdateCourses(updated);
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        ...formData,
      };

      // If preset was selected and handler exists, populate syllabus automatically
      if (selectedPresetIndex !== '' && onAddCourseWithPreset) {
        const preset = COURSE_PRESETS[Number(selectedPresetIndex)];
        onAddCourseWithPreset(newCourse, preset?.topics || []);
      } else {
        onUpdateCourses([...courses, newCourse]);
      }

      if (!activeCourseId) {
        onSelectCourse(newCourse.id);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Manajemen Mata Kuliah</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
              {courses.length} Terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi mata kuliah, pengampu dosen, jadwal ruangan, dan jumlah pertemuan kelas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Kuliah</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Mode Hanya Baca (Mahasiswa)</span>
            </div>
          )}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          const courseSessions = sessions.filter((s) => s.courseId === course.id);
          const completedCount = courseSessions.filter((s) => s.status === 'completed');

          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl border transition relative p-6 flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600/20'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                      {course.code}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Mata Kuliah"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {courses.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus mata kuliah "${course.name}"? Jadwal terkait juga akan dihapus.`)) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Mata Kuliah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Dosen: <span className="font-semibold text-slate-800">{course.lecturer}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Setiap {course.day}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.startTime} - {course.endTime}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.room || 'Ruang Kuliah Belum Diatur'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Kemajuan: {completedCount.length} dari {course.totalSessions} Pertemuan</span>
                    <span className="font-semibold">{Math.round((completedCount.length / (course.totalSessions || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all"
                      style={{ width: `${Math.round((completedCount.length / (course.totalSessions || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {courseSessions.length} sesi terdata
                </span>
                {!isActive ? (
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Buka Mata Kuliah &rarr;
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-600">
                    Sedang Aktif
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Mata Kuliah with AUTOFILL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCourse ? 'Perbarui Data Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
                </h3>
                <p className="text-xs text-slate-500">Isi manual atau gunakan preset kurikulum otomatis</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Preset Autofill Banner */}
            {!editingCourse && (
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <span>Autofill dari Template Kurikulum:</span>
                </div>
                <select
                  value={selectedPresetIndex}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Pilih Template Mata Kuliah (Otomatis Isi Semua) --</option>
                  {COURSE_PRESETS.map((p, i) => (
                    <option key={i} value={i.toString()}>
                      {p.code} - {p.name} ({p.lecturer})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-indigo-700/80">
                  *Memilih template akan mengisi otomatis Nama MK, Dosen, Ruangan, dan 16 silabus materi pertemuan.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kode MK
                  </label>
                  <input
                    type="text"
                    placeholder="IF301"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Basis Data Lanjut"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Lecturer with quick master autofill */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Dosen Pengampu
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, lecturer: e.target.value });
                      }
                    }}
                    defaultValue=""
                    className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"
                  >
                    <option value="">Pilih dari Master Dosen...</option>
                    {MASTER_LECTURERS.map((lec, i) => (
                      <option key={i} value={lec.name}>
                        {lec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Prof. / Dr. / Ir. ..."
                  value={formData.lecturer}
                  onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hari
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Ruangan
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, room: e.target.value });
                        }
                      }}
                      defaultValue=""
                      className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"
                    >
                      <option value="">Preset Ruang...</option>
                      {MASTER_ROOMS.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Lab 3 / R.304"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Sesi Pertemuan
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
                >
                  {editingCourse ? 'Simpan Perubahan' : 'Buat Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
