import React, { useState } from 'react';
import type { Student, SessionSchedule } from '../types';
import { calculateStudentStats } from '../services/rotationAlgorithm';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Phone, 
  ClipboardList
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  sessions: SessionSchedule[];
  activeCourseId: string | null;
  onUpdateStudents: (students: Student[]) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  sessions,
  activeCourseId,
  onUpdateStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Single add form
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    phone: '',
  });

  // Bulk paste text
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Student, 'id' | 'isActive'>[]>([]);

  // Calculate statistics per student
  const stats = calculateStudentStats(students, sessions, activeCourseId || undefined);

  // Filter students by search query
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle single student submit
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nim.trim()) return;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nim: formData.nim.trim(),
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      isActive: true,
    };

    onUpdateStudents([...students, newStudent]);
    setFormData({ nim: '', name: '', phone: '' });
    setIsAddModalOpen(false);
  };

  // Handle edit student save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updated = students.map((s) => (s.id === editingStudent.id ? editingStudent : s));
    onUpdateStudents(updated);
    setEditingStudent(null);
  };

  // Delete student
  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${name}" dari daftar mahasiswa?`)) {
      onUpdateStudents(students.filter((s) => s.id !== id));
    }
  };

  // Parse bulk text from WhatsApp/Excel
  const handleParseBulk = (text: string) => {
    setBulkText(text);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsed: Omit<Student, 'id' | 'isActive'>[] = [];

    for (const line of lines) {
      // 1. Remove leading numbering e.g. "1.", "1)", "[1]"
      let clean = line.replace(/^\s*\[?\d+\]?[\.\-\)\s]+/, '').trim();

      // 2. Find phone number if exists (starts with 08 or +62)
      let phone: string | undefined;
      const phoneMatch = clean.match(/(\+62|08)[0-9\-\s]{8,15}/);
      if (phoneMatch) {
        phone = phoneMatch[0].replace(/[\-\s]/g, '');
        clean = clean.replace(phoneMatch[0], '').trim();
      }

      // 3. Find NIM (sequence of 6 to 12 digits)
      let nim = '';
      const nimMatch = clean.match(/\b\d{6,14}\b/);
      if (nimMatch) {
        nim = nimMatch[0];
        clean = clean.replace(nimMatch[0], '').trim();
      }

      // 4. Clean leftover separators like "-", "|", ","
      clean = clean.replace(/^[\-\|\,\s]+|[\-\|\,\s]+$/g, '').trim();

      if (clean || nim) {
        parsed.push({
          nim: nim || `MHS-${Math.floor(1000 + Math.random() * 9000)}`,
          name: clean || `Mahasiswa ${parsed.length + 1}`,
          phone,
        });
      }
    }

    setBulkPreview(parsed);
  };

  // Confirm bulk import
  const handleConfirmBulk = () => {
    if (bulkPreview.length === 0) return;

    const newEntries: Student[] = bulkPreview.map((item, idx) => ({
      id: `std-${Date.now()}-${idx}`,
      nim: item.nim,
      name: item.name,
      phone: item.phone,
      isActive: true,
    }));

    onUpdateStudents([...students, ...newEntries]);
    setBulkText('');
    setBulkPreview([]);
    setIsBulkModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar Anggota Kelas / Mahasiswa</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              {students.length} Mahasiswa
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data mahasiswa yang akan diikutsertakan dalam pembagian rotasi PJ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Paste / Bulk Import</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama atau NIM mahasiswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-36">NIM</th>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4 w-40">No. WhatsApp</th>
                <th className="py-3 px-4 w-44">Tugas PJ Terjadwal</th>
                <th className="py-3 px-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const stat = stats.find((s) => s.student.id === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {student.nim}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {student.phone ? (
                          <a
                            href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-md"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{student.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-xs">-</span>
                        )}
                      </td>

                      {/* PJ Turns Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                              (stat?.totalAssigned || 0) === 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {stat?.totalAssigned || 0}x
                          </span>
                          {stat?.sessionNumbers && stat.sessionNumbers.length > 0 && (
                            <span className="text-[11px] text-slate-500">
                              (Sesi: {stat.sessionNumbers.join(', ')})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingStudent({ ...student })}
                            title="Edit Mahasiswa"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            title="Hapus Mahasiswa"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada mahasiswa yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Mahasiswa Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Tambah Mahasiswa Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Induk Mahasiswa (NIM)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 220101099"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Mahasiswa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Cahyono"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Tambah Mahasiswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Paste / Import */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bulk Import / Tempel Daftar Mahasiswa</h3>
                  <p className="text-xs text-slate-500">Salin & tempel daftar nama dari WhatsApp, Excel, atau Google Sheets</p>
                </div>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tempel (Paste) Teks di Sini:
                </label>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => handleParseBulk(e.target.value)}
                  placeholder={`Contoh format yang didukung (bebas):\n1. 220101001 Ahmad Fauzi 081234567801\n220101002 - Anisa Rahmawati\nBagus Pratama \t 220101003`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Live Preview of parsed items */}
              {bulkPreview.length > 0 && (
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900">
                      Hasil Deteksi ({bulkPreview.length} Mahasiswa Terbaca):
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-emerald-100 bg-white rounded-lg border border-emerald-200 text-xs">
                    {bulkPreview.map((item, i) => (
                      <div key={i} className="p-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="text-slate-500 ml-2 font-mono">({item.nim})</span>
                        </div>
                        {item.phone && (
                          <span className="text-[11px] text-emerald-700 font-mono">{item.phone}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulk}
                disabled={bulkPreview.length === 0}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
              >
                Tambahkan {bulkPreview.length} Mahasiswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Mahasiswa */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Data Mahasiswa</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={editingStudent.nim}
                  onChange={(e) => setEditingStudent({ ...editingStudent, nim: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
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
