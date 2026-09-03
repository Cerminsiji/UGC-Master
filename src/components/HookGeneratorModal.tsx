import React, { useState, useEffect } from 'react';
import {
  Flame,
  X,
  Sparkles,
  Check,
  Video,
  ArrowRight,
  RefreshCw,
  Copy,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { HookVariation, AIHookOption } from '../types';

interface HookGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  category: string;
  keySellingPoints?: string;
  buyerProblem?: string;
  onSelectHook: (hook: AIHookOption | { hook: string; visualAction: string; popupText?: string; sfx?: string }) => void;
}

export const HookGeneratorModal: React.FC<HookGeneratorModalProps> = ({
  isOpen,
  onClose,
  productName,
  category,
  keySellingPoints = '',
  buyerProblem = '',
  onSelectHook,
}) => {
  const [hooks, setHooks] = useState<HookVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, category, keySellingPoints, buyerProblem }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHooks(data.data);
      }
    } catch (e) {
      console.error('Failed to load 10 hooks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHooks();
    }
  }, [isOpen, productName, category]);

  if (!isOpen) return null;

  const handleCopy = (hook: HookVariation) => {
    navigator.clipboard.writeText(hook.hook);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseHook = (hook: HookVariation) => {
    const cleanWord = hook.hook.split(/\s+/).slice(0, 4).join(' ').toUpperCase();
    onSelectHook({
      hook: hook.hook,
      visualAction: hook.visualAction,
      popupText: `${cleanWord}! 😱`,
      sfx: 'Vine boom & Record scratch',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1422] border border-[#23304d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2a42] flex items-center justify-between bg-gradient-to-r from-[#141b2e] to-[#101625]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  10 Hook Engine Variations
                </h2>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-bold">
                  Stop-Scroll V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula 0.5–1 detik pertama: visual hook, text overlay tebal, dan bebas intro basi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHooks}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
              title="Generate 10 variasi baru"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List of 10 Hooks */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Mengevaluasi 8 kriteria & menyusun 10 hook terkuat untuk "{productName}"...
              </p>
            </div>
          ) : (
            hooks.map((h, i) => (
              <div
                key={h.id || i}
                className="p-4 rounded-xl bg-[#131a29] border border-[#212d47] hover:border-amber-500/50 transition-all space-y-3 relative group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/30 tracking-wider">
                      {h.type}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-md">
                      {h.estimatedStrength}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(h)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#1a2339] hover:bg-[#232f4c] border border-[#2b3a5a] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedId === h.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleUseHook(h)}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 px-3 py-1 rounded-lg transition-all shadow-sm active:scale-95"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Gunakan di Adegan 1</span>
                    </button>
                  </div>
                </div>

                {/* Main Hook Dialogue */}
                <div className="text-sm sm:text-base font-bold text-white leading-snug">
                  "{h.hook}"
                </div>

                {/* Why It Works & Visual Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2.5 border-t border-[#1b253b] text-xs">
                  <div className="bg-[#0c101a] rounded-lg p-2.5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      <span>Mengapa Hook Ini Bekerja:</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {h.whyItWorks}
                    </p>
                  </div>

                  <div className="bg-[#0c101a] rounded-lg p-2.5 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>Aksi Visual (0.5–1 Detik):</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {h.visualAction}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2a42] bg-[#0c101b] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Pilih salah satu hook untuk langsung mengganti dialog dan aksi Adegan 1 (Hook).
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
