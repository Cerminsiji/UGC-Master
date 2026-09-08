import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface PasswordGateProps {
  onUnlock: () => void;
}

const APP_SECRET_PASSWORD = 'Ilalang@27';

export const PasswordGate: React.FC<PasswordGateProps> = ({ onUnlock }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordInput.trim()) {
      setErrorMsg('Silakan masukkan password akses.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (passwordInput === APP_SECRET_PASSWORD) {
        setIsSubmitting(false);
        try {
          localStorage.setItem('ugc_master_unlocked_v1', 'true');
        } catch (e) {
          console.warn('LocalStorage not accessible', e);
        }
        onUnlock();
      } else {
        setIsSubmitting(false);
        setErrorMsg('Password salah! Periksa kembali huruf besar, kecil, dan karakter simbol.');
        triggerShake();
      }
    }, 250);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/95 backdrop-blur-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-md relative z-10 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="bg-[#0b101c]/90 border border-[#1e293f] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500" />

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-950 to-indigo-900 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-900/50">
              <Lock className="w-7 h-7 text-purple-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Akses Keamanan Kreator</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              UGC Master Storyboard Pro
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Masukkan password untuk mengakses platform pembuatan storyboard & Trending Harvest.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Password Keamanan:</span>
                <span className="text-[10px] text-purple-400 font-normal">Wajib diisi</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  autoFocus
                  placeholder="Masukkan password..."
                  className={`w-full pl-10 pr-11 py-3 bg-[#111728] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errorMsg
                      ? 'border-red-500/80 focus:ring-red-500/40'
                      : 'border-[#22314d] focus:border-purple-500 focus:ring-purple-500/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Akses Aplikasi</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-[#182236] text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>TikTok Shop & Shopee Creator Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
