import React, { useState } from 'react';
import type { Student, AuthSession } from '../types';
import { authService } from '../services/authService';
import { ShieldCheck, UserCheck, KeyRound, Lock, ArrowRight, Eye, EyeOff, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  students,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'student' | 'admin'>('student');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedNim, setSelectedNim] = useState('');

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = authService.loginAsAdmin(pin);
    if (res.success) {
      onLoginSuccess(authService.getSession());
      onClose();
    } else {
      setErrorMessage(res.message || 'Autentikasi gagal.');
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.nim === selectedNim);
    const session = authService.loginAsStudent(
      student?.nim,
      student ? student.name : undefined
    );
    onLoginSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Portal Akses Perkuliahan</h3>
              <p className="text-xs text-slate-400">Sistem Pengelolaan & Rotasi Penanggung Jawab</p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-5 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setTab('student');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                tab === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Mahasiswa (Lihat Jadwal)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('admin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                tab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pengelola (Komti)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {tab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Mode Peninjau Mahasiswa:</span> Anda dapat melihat seluruh jadwal, menyalin format pengingat WhatsApp, dan mencari giliran tugas Anda secara mandiri.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilih Nama Anda (Opsional)
                </label>
                <select
                  value={selectedNim}
                  onChange={(e) => setSelectedNim(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Masuk sebagai Mahasiswa Umum --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.nim}>
                      {s.name} ({s.nim})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Memilih nama akan mempermudah Anda melihat sorotan jadwal tugas pribadi.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Buka Jadwal Perkuliahan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold">Akses Terbatas:</span> Hanya Ketua Tingkat (Komti), Koordinator, atau Dosen yang memiliki wewenang mengacak dan mengubah jadwal rotasi.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi / PIN Pengelola
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan PIN..."
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[11px] text-slate-500">PIN Bawaan Sistem: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono font-bold">123456</code></span>
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi & Masuk Sebagai Pengelola</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
