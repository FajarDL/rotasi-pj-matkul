import React, { useState } from 'react';
import type { Student, UserAccount, UserRole } from '../types';
import { authService } from '../services/authService';
import { 
  X, 
  Users, 
  Check, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  Wand2, 
  ToggleLeft, 
  ToggleRight,
  Shield,
  Clock
} from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSuccess: (msg: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  students,
  onSuccess,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'users' | 'tools'>('pending');
  const [, setRefreshKey] = useState(0);

  // States for Direct Account Creation
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [createError, setCreateError] = useState('');

  // States for Batch Generation
  const [batchDefaultPassword, setBatchDefaultPassword] = useState('');
  const [batchResult, setBatchResult] = useState<{ createdCount: number; existingCount: number } | null>(null);

  // Reset password state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [resetPassInput, setResetPassInput] = useState('');

  if (!isOpen) return null;

  const config = authService.getSecurityConfig();
  const allowRegistration = config?.allowPublicRegistration ?? true;
  const allUsers = authService.getUsers();
  const pendingUsers = allUsers.filter((u) => u.status === 'pending');
  const activeUsers = allUsers.filter((u) => u.status === 'active');

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Approve a pending user
  const handleApprove = (userId: string) => {
    const res = authService.approveUser(userId);
    if (res.success) {
      triggerRefresh();
      onSuccess(res.message);
    }
  };

  // Reject a pending user
  const handleReject = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menolak dan membatalkan pendaftaran ini?')) {
      const res = authService.rejectUser(userId);
      if (res.success) {
        triggerRefresh();
        onSuccess(res.message);
      }
    }
  };

  // Delete an active user
  const handleDeleteUser = (u: UserAccount) => {
    if (u.role === 'owner') {
      alert('Akun Pemilik Utama tidak dapat dihapus.');
      return;
    }
    if (confirm(`Hapus akun ${u.name} (@${u.username})? Pengguna ini tidak akan bisa masuk lagi.`)) {
      const res = authService.deleteUser(u.id);
      if (res.success) {
        triggerRefresh();
        onSuccess(res.message);
      }
    }
  };

  // Reset Password
  const handleSaveResetPassword = (userId: string) => {
    const res = authService.resetPassword(userId, resetPassInput);
    if (res.success) {
      setEditingUserId(null);
      setResetPassInput('');
      triggerRefresh();
      onSuccess(res.message);
    } else {
      alert(res.message);
    }
  };

  // Direct Account Creation
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const res = authService.createUser({
      name: newName,
      username: newUsername,
      password: newPassword,
      role: newRole,
    });

    if (res.success) {
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('student');
      triggerRefresh();
      onSuccess(res.message);
    } else {
      setCreateError(res.message);
    }
  };

  // Toggle Public Registration
  const handleToggleRegistration = () => {
    const res = authService.setPublicRegistration(!allowRegistration);
    if (res.success) {
      triggerRefresh();
      onSuccess(res.message);
    }
  };

  // Batch Generate Student Accounts
  const handleBatchGenerate = () => {
    if (students.length === 0) {
      alert('Daftar mahasiswa kosong. Tambahkan atau import daftar mahasiswa terlebih dahulu.');
      return;
    }

    const res = authService.batchGenerateStudentAccounts(
      students.map((s) => ({ nim: s.nim, name: s.name })),
      batchDefaultPassword || undefined
    );

    setBatchResult(res);
    triggerRefresh();
    onSuccess(`Berhasil membuat ${res.createdCount} akun baru dari daftar mahasiswa!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Manajemen Pengguna & Akses</h3>
              <p className="text-xs text-slate-400">Kontrol persetujuan pendaftar & keamanan aplikasi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Persetujuan Akun</span>
            {pendingUsers.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Akun Aktif ({activeUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tools')}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'tools'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Buat Akun & Kontrol</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: PENDING USERS (APPROVAL QUEUE) */}
          {activeSubTab === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Antrean Pendaftaran Mahasiswa ({pendingUsers.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Orang luar tidak dapat masuk tanpa persetujuan Anda
                </span>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-700">Tidak ada pendaftar yang menunggu persetujuan.</p>
                  <p className="text-slate-400 text-[11px]">
                    Semua akun yang masuk saat ini telah diproses atau terverifikasi.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          NIM / Username: <strong className="text-slate-800">{u.username}</strong> &middot;{' '}
                          {new Date(u.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE USERS */}
          {activeSubTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Daftar Akun yang Memiliki Akses ({activeUsers.length})
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                {activeUsers.map((u) => {
                  const isOwner = u.role === 'owner';
                  const isEditing = editingUserId === u.id;

                  return (
                    <div key={u.id} className="p-3.5 space-y-2 hover:bg-slate-50/80 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isOwner
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : u.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isOwner ? 'Pemilik Utama' : u.role === 'admin' ? 'Co-Admin' : 'Mahasiswa'}
                            </span>
                          </div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                            Username / NIM: <span className="font-semibold text-slate-700">{u.username}</span>
                          </div>
                        </div>

                        {!isOwner && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUserId(isEditing ? null : u.id);
                                setResetPassInput('');
                              }}
                              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Password Reset Box */}
                      {isEditing && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 animate-in fade-in">
                          <input
                            type="password"
                            placeholder="Kata sandi baru (min 4 karakter)..."
                            value={resetPassInput}
                            onChange={(e) => setResetPassInput(e.target.value)}
                            className="flex-1 p-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveResetPassword(u.id)}
                            className="px-2.5 py-1.5 bg-slate-900 text-white rounded font-bold text-xs hover:bg-slate-800 cursor-pointer"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-1.5 text-slate-500 hover:bg-slate-200 rounded text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TOOLS (CREATE DIRECTLY & BATCH GENERATION) */}
          {activeSubTab === 'tools' && (
            <div className="space-y-5">
              
              {/* Toggle Public Registration */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Izinkan Pendaftaran Mandiri</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      allowRegistration ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {allowRegistration ? 'DIBUKA' : 'DITUTUP'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {allowRegistration 
                      ? 'Orang dapat mengajukan pendaftaran mandiri (wajib approval Anda sebelum aktif).' 
                      : 'Form pendaftaran publik ditutup total. Hanya akun yang Anda buat langsung yang dapat masuk.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRegistration}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    allowRegistration 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {allowRegistration ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              {/* Batch Generate from Student List */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <span>Generate Akun Massal dari Daftar Mahasiswa</span>
                </div>
                <p className="text-indigo-950 text-[11px] leading-relaxed">
                  Otomatis membuat akun untuk <strong>{students.length} mahasiswa</strong> di kelas Anda (Username = NIM, Password awal = NIM atau kata sandi yang Anda tentukan di bawah). Akun langsung berstatus <strong>Aktif</strong> tanpa perlu persetujuan.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Password awal (kosongkan jika = NIM)..."
                    value={batchDefaultPassword}
                    onChange={(e) => setBatchDefaultPassword(e.target.value)}
                    className="flex-1 p-2 bg-white border border-indigo-300 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleBatchGenerate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Akun ({students.length})</span>
                  </button>
                </div>

                {batchResult && (
                  <div className="text-[11px] text-indigo-800 bg-white/70 p-2.5 rounded-lg border border-indigo-200">
                    &bull; {batchResult.createdCount} akun baru dibuat.
                    {batchResult.existingCount > 0 && ` (${batchResult.existingCount} akun sudah ada sebelumnya).`}
                  </div>
                )}
              </div>

              {/* Direct Account Creation Form */}
              <form onSubmit={handleCreateAccount} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-slate-600" />
                  <span>Buat Akun Tunggal Manual</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Contoh: Diki Bagas Putra"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Username / NIM</label>
                    <input
                      type="text"
                      placeholder="Contoh: 2450081116"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Kata Sandi</label>
                    <input
                      type="password"
                      placeholder="Minimal 4 karakter..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Peran (Role)</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="student">Mahasiswa</option>
                      <option value="admin">Co-Admin (Pengelola)</option>
                    </select>
                  </div>
                </div>

                {createError && (
                  <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-2xs"
                >
                  Tambahkan Akun Aktif
                </button>
              </form>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
