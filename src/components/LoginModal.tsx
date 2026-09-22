import React, { useState } from 'react';
import type { AuthSession } from '../types';
import { authService } from '../services/authService';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  X, 
  UserPlus, 
  LogIn, 
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  isGate?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isGate = false,
}) => {
  const isSystemReady = authService.isInitialized();
  const config = authService.getSecurityConfig();
  const allowRegistration = config?.allowPublicRegistration ?? true;

  const [mode, setMode] = useState<'login' | 'register' | 'setup'>(
    isSystemReady ? 'login' : 'setup'
  );

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingSuccessMsg, setPendingSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle First-Time Owner Setup (No class code required)
  const handleSetupOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authService.setupOwner({
      name,
      username,
      password,
    });

    if (res.success && res.session) {
      onLoginSuccess(res.session);
      if (onClose) onClose();
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
      if (onClose) onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Register Member (Requires approval)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingSuccessMsg('');

    const res = authService.registerUser({
      name,
      username,
      password,
      role: 'student',
    });

    if (res.success) {
      setPendingSuccessMsg(res.message);
      setName('');
      setUsername('');
      setPassword('');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Reset Admin Account & Security
  const handleResetAdminAccount = () => {
    if (
      confirm(
        'Lupa akses atau ingin mereset akun pengelola?\n\nSemua data akun lama akan dihapus dan Anda akan langsung diarahkan ke form Setup Pemilik Baru untuk membuat username dan password baru.\n\n(Catatan: Data jadwal matkul dan mahasiswa tetap aman tersimpan).'
      )
    ) {
      authService.resetAllAuthAndSecurity();
      setMode('setup');
      setErrorMessage('');
      setName('');
      setUsername('');
      setPassword('');
      setPendingSuccessMsg('');
    }
  };

  // Handle Total App Reset
  const handleTotalReset = () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset TOTAL seluruh data aplikasi (mata kuliah, jadwal, mahasiswa, dan akun)?\n\nAplikasi akan kembali ke kondisi kosong awal.'
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm no-print ${isGate ? 'min-h-screen' : ''}`}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          {!isGate && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Portal Akses Perkuliahan</h3>
              <p className="text-xs text-slate-400">SI-ROTASI &middot; Autentikasi Pengguna</p>
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
                  setPendingSuccessMsg('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
                  setPendingSuccessMsg('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* 1. SETUP PEMILIK PERTAMA KALI */}
          {mode === 'setup' && (
            <form onSubmit={handleSetupOwner} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Inisialisasi Pemilik Kelas (Setup Pertama)</span>
                </div>
                <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                  Tentukan akun utama Anda sebagai Pemilik/Komti. Anda memiliki wewenang penuh untuk menyetujui mahasiswa atau membuatkan akun tanpa memerlukan kode kelas eksternal.
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
                  Username Akun Pemilik
                </label>
                <input
                  type="text"
                  placeholder="Contoh: admin atau komti"
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
                    placeholder="Buat kata sandi aman..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Aktifkan Sistem Sebagai Pemilik</span>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
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
                {allowRegistration ? (
                  <>
                    <p className="text-xs text-slate-500 mb-1.5">Belum memiliki akun terdaftar?</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage('');
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      Ajukan Pendaftaran Akun &rarr;
                    </button>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Pendaftaran publik ditutup. Hubungi Pengelola Kelas untuk mendapatkan akun.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-1.5 text-center">
                <button
                  type="button"
                  onClick={handleResetAdminAccount}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                  title="Klik untuk menghapus akun lama dan membuat akun admin baru"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Akun Pengelola & Setup Baru</span>
                </button>
                <button
                  type="button"
                  onClick={handleTotalReset}
                  className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                >
                  Atau reset total seluruh data aplikasi
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTER (PENDAFTARAN - MENUNGGU PERSETUJUAN) */}
          {mode === 'register' && (
            <div>
              {pendingSuccessMsg ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Permintaan Pendaftaran Terkirim</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {pendingSuccessMsg}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSuccessMsg('');
                      setMode('login');
                    }}
                    className="w-full py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Kembali ke Halaman Masuk (Login)
                  </button>
                </div>
              ) : !allowRegistration ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Pendaftaran Ditutup</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pemilik kelas menonaktifkan pendaftaran mandiri. Akun hanya dapat dibuat langsung oleh pengelola kelas.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    &larr; Kembali ke Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Pendaftaran akun memerlukan <strong>persetujuan (approval)</strong> dari Pemilik/Komti kelas sebelum dapat digunakan untuk masuk.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nama Lengkap Mahasiswa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sofyan Hadi Sumarno"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      NIM (Nomor Induk Mahasiswa)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 2450081111"
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

                  {errorMessage && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Kirim Permintaan Pendaftaran</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Sudah punya akun? <strong>Masuk di sini</strong>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
