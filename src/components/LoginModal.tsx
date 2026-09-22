import React, { useState } from 'react';
import type { AuthSession } from '../types';
import { authService } from '../services/authService';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  X, 
  UserPlus, 
  LogIn, 
  Key,
  ShieldAlert
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const isSystemReady = authService.isInitialized();
  const [mode, setMode] = useState<'login' | 'register' | 'setup'>(
    isSystemReady ? 'login' : 'setup'
  );

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classAccessCode, setClassAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Handle First-Time Owner Setup
  const handleSetupOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authService.setupOwner({
      name,
      username,
      password,
      classAccessCode,
    });

    if (res.success && res.session) {
      onLoginSuccess(res.session);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authService.login(username, password);
    if (res.success && res.session) {
      onLoginSuccess(res.session);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Register Member
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authService.registerUser({
      name,
      username,
      password,
      classAccessCode,
      role: 'student',
    });

    if (res.success && res.session) {
      onLoginSuccess(res.session);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
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
              <p className="text-xs text-slate-400">SI-ROTASI &middot; Kontrol Akses Terproteksi</p>
            </div>
          </div>

          {/* Mode Tabs (Only visible if system already initialized) */}
          {isSystemReady && (
            <div className="flex bg-slate-800 p-1 rounded-xl mt-5 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk (Login)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* 1. SETUP PEMILIK PERTAMA KALI */}
          {mode === 'setup' && (
            <form onSubmit={handleSetupOwner} className="space-y-3.5">
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Registrasi Pemilik Utama (Setup Pertama)</span>
                </div>
                <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                  Tidak ada kata sandi bawaan. Anda sebagai pemilik menentukan sendiri username, password, serta <strong>Kode Izin Kelas</strong> yang harus dimiliki orang lain jika ingin mendaftar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Pemilik / Komti
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Fajar (Ketua Tingkat)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Username Pengelola
                </label>
                <input
                  type="text"
                  placeholder="Contoh: admin atau fajar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kata Sandi Pribadi Anda
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password rahasia..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tentukan Kode Izin Kelas (Invitation Key)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KELAS-TI-2026"
                  value={classAccessCode}
                  onChange={(e) => setClassAccessCode(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-wider uppercase text-indigo-700"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Bagikan kode ini hanya kepada mahasiswa yang Anda izinkan mendaftar akun di kelas ini.
                </p>
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Simpan & Aktifkan Sebagai Pemilik</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. LOGIN (MASUK) */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Username / NIM
                </label>
                <input
                  type="text"
                  placeholder="Masukkan username atau NIM Anda..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full pr-10 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-2">Belum memiliki akun?</p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Daftar Akun dengan Kode Izin Kelas &rarr;
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTER (DAFTAR DENGAN KODE IZIN) */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Pendaftaran memerlukan <strong>Kode Izin Kelas</strong> yang diberikan oleh Pemilik / Komti kelas.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Username / NIM
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 220101001"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Buat Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Minimal 4 karakter..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kode Izin Kelas (Wajib dari Komti)</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan kode izin dari komti..."
                  value={classAccessCode}
                  onChange={(e) => setClassAccessCode(e.target.value)}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Verifikasi Kode & Daftarkan Akun</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
