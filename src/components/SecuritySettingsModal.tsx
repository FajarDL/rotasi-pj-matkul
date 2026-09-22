import React, { useState } from 'react';
import { authService } from '../services/authService';
import { KeyRound, X, Users, Copy, Check } from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const config = authService.getSecurityConfig();
  const registeredUsers = authService.getRegisteredUsers();

  const [newAccessCode, setNewAccessCode] = useState(config?.classAccessCode || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = authService.updateClassAccessCode(newAccessCode);
    if (res.success) {
      onSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleCopyCode = () => {
    if (newAccessCode) {
      navigator.clipboard.writeText(newAccessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Izin & Kode Akses Kelas</h3>
              <p className="text-xs text-slate-500">Kelola kode izin untuk mengontrol siapa saja yang boleh mendaftar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Class Access Code Form */}
        <form onSubmit={handleUpdateCode} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase">
              Kode Izin Kelas (Invitation Code)
            </label>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[11px] text-indigo-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Kode Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAccessCode}
              onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
              placeholder="Contoh: KELAS-TI-2026"
              className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-slate-900"
              required
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs"
            >
              Simpan Kode
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            *Setiap mahasiswa baru yang mendaftar wajib memasukkan kode izin ini. Jika Anda mengubah kode ini, kode lama tidak akan berlaku lagi untuk pendaftar baru.
          </p>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded">
              {error}
            </div>
          )}
        </form>

        {/* List of Registered Accounts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Daftar Akun Pengguna Terdaftar ({registeredUsers.length})</span>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white text-xs">
            {registeredUsers.map((u) => (
              <div key={u.id} className="p-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-slate-500 font-mono text-[11px]">Username: {u.username}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'owner'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {u.role === 'owner' ? 'Pemilik (Owner)' : 'Mahasiswa'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
