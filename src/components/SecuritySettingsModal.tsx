import React, { useState } from 'react';
import { authService } from '../services/authService';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Check, 
  RotateCcw,
  Shield
} from 'lucide-react';

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
  const currentKey = authService.getAccessKey() || '';
  const [newKey, setNewKey] = useState('');
  const [showCurrentKey, setShowCurrentKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpdateKey = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newKey.trim()) {
      setError('Kunci akses baru tidak boleh kosong.');
      return;
    }

    const res = authService.setAccessKey(newKey.trim());
    if (res.success) {
      setNewKey('');
      onSuccess(res.message);
      onClose();
    } else {
      setError(res.message);
    }
  };

  const handleLockNow = () => {
    authService.lock();
    window.location.reload();
  };

  const handleResetKey = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mereset kunci akses?\n\nKunci akan dihapus dari penyimpanan lokal dan aplikasi akan meminta Anda membuat kunci baru.'
      )
    ) {
      authService.resetKey();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Kunci Akses Aplikasi</h3>
              <p className="text-xs text-slate-400">Kunci disimpan di penyimpanan lokal browser</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Current Key Display */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Kunci Akses Aktif Saat Ini
              </span>
              <button
                type="button"
                onClick={() => setShowCurrentKey(!showCurrentKey)}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {showCurrentKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCurrentKey ? 'Sembunyikan' : 'Lihat Kunci'}</span>
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 bg-white p-2 rounded-lg border border-slate-200">
              {showCurrentKey ? currentKey : '••••••••••••'}
            </div>
          </div>

          {/* Change Key Form */}
          <form onSubmit={handleUpdateKey} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Ganti Kunci Akses Baru
              </label>
              <div className="relative">
                <input
                  type={showNewKey ? 'text' : 'password'}
                  placeholder="Ketik kunci baru pilihan Anda..."
                  value={newKey}
                  onChange={(e) => {
                    setNewKey(e.target.value);
                    setError('');
                  }}
                  className="w-full pr-10 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewKey(!showNewKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kunci Baru</span>
            </button>
          </form>

          {/* Action Buttons: Lock Now & Reset */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleLockNow}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Kunci aplikasi dan kembali ke layar Passkey"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Kunci Aplikasi Sekarang</span>
            </button>

            <button
              type="button"
              onClick={handleResetKey}
              className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Kunci</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
