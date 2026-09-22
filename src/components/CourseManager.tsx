import React, { useState } from 'react';
import type { Course, SessionSchedule } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X
} from 'lucide-react';

interface CourseManagerProps {
  courses: Course[];
  activeCourseId: string | null;
  sessions: SessionSchedule[];
  onSelectCourse: (courseId: string) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  courses,
  activeCourseId,
  sessions,
  onSelectCourse,
  onUpdateCourses,
  onDeleteCourse,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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
    setEditingCourse(null);
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

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
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
      onUpdateCourses([...courses, newCourse]);
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
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              {courses.length} MK Terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tambahkan mata kuliah untuk mengelola giliran penanggung jawab secara terpisah per mata kuliah.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          const courseSessions = sessions.filter((s) => s.courseId === course.id);
          const completedCount = courseSessions.filter((s) => s.status === 'completed').length;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl border transition relative p-6 flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {course.code}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <CheckCircle className="w-3 h-3" />
                        Aktif Dipilih
                      </span>
                    )}
                  </div>

                  {/* Actions */}
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
                          if (confirm(`Yakin ingin menghapus mata kuliah "${course.name}"?`)) {
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
                </div>

                {/* Title & Lecturer */}
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dosen: <span className="font-semibold text-slate-700">{course.lecturer}</span>
                  </p>
                </div>

                {/* Schedule details */}
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
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{course.room || 'Ruang Belum Diatur'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progres: {completedCount} dari {course.totalSessions} Pertemuan</span>
                    <span className="font-semibold">{Math.round((completedCount / (course.totalSessions || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.round((completedCount / (course.totalSessions || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Select Course Button */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {courseSessions.length} sesi tergenerate
                </span>
                {!isActive ? (
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Buka Mata Kuliah Ini &rarr;
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600">
                    Sedang Dikelola
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tambah / Edit Mata Kuliah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Mata Kuliah
                  </label>
                  <input
                    type="text"
                    placeholder="Kecerdasan Buatan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dosen Pengampu
                </label>
                <input
                  type="text"
                  placeholder="Prof. Dr. Anton Wijaya, M.T."
                  value={formData.lecturer}
                  onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hari Kuliah
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
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ruangan / Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Lab 4 / R.201"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jumlah Pertemuan (Sesi)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
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
