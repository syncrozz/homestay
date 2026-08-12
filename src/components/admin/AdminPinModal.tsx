import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, KeyRound, ShieldCheck, CheckCircle2, AlertTriangle, X, Unlock } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isAdminUnlocked, unlockAdminMode, lockAdminMode, setCurrentRole } = useApp();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = unlockAdminMode(pin);
    if (res.success) {
      setSuccessMsg('Akses Admin Berjaya! Mod Admin telah diaktifkan.');
      setCurrentRole('OWNER');
      setPin('');
      setTimeout(() => {
        setSuccessMsg(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } else {
      setError(res.error || 'PIN Code keselamatan tidak sah.');
    }
  };

  const handleLock = () => {
    lockAdminMode();
    setSuccessMsg('Sesi Admin telah dikunci.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Kawalan Mod Admin
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sahkan PIN Admin untuk akses pengubahan &amp; pembatalan penuh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator if already unlocked */}
        {isAdminUnlocked ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Mod Admin Berjaya Unlocked!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Sesi Admin anda aktif. Anda mempunyai kuasa penuh untuk mengubah atau membatalkan mana-mana tempahan tanpa perlu mengesahkan e-mel atau nombor telefon tetamu.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
              <button
                type="button"
                onClick={handleLock}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Kunci Sesi Admin
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
              >
                Teruskan
              </button>
            </div>
          </div>
        ) : (
          /* Lock form if locked */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Kod PIN Pengesahan Admin</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sila masukkan PIN keselamatan untuk mengaktifkan Mod Admin.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Masukkan PIN Admin (4-Digit)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d{4}"
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-center text-lg tracking-[0.5em] font-mono font-black text-slate-900 outline-hidden transition-all"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Sahkan PIN Admin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
