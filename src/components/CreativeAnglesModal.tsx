import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Layers,
  Copy,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Film,
  Zap,
} from 'lucide-react';
import { CreativeAngleVersion, Scene } from '../types';

interface CreativeAnglesModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  category: string;
  keySellingPoints?: string;
  buyerProblem?: string;
  onApplyAngleToStoryboard: (angle: CreativeAngleVersion) => void;
}

export const CreativeAnglesModal: React.FC<CreativeAnglesModalProps> = ({
  isOpen,
  onClose,
  productName,
  category,
  keySellingPoints = '',
  buyerProblem = '',
  onApplyAngleToStoryboard,
}) => {
  const [angles, setAngles] = useState<CreativeAngleVersion[]>([]);
  const [activeKey, setActiveKey] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  const fetchAngles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-creative-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          keySellingPoints,
          buyerProblem,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAngles(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch creative angles:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAngles();
    }
  }, [isOpen, productName, category]);

  if (!isOpen) return null;

  const activeAngle = angles.find((a) => a.versionKey === activeKey) || angles[0];

  const handleApply = (angle: CreativeAngleVersion) => {
    onApplyAngleToStoryboard(angle);
    setAppliedKey(angle.versionKey);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101b] border border-[#202c46] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b263e] flex items-center justify-between bg-gradient-to-r from-[#12192c] to-[#0d1322]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  A/B Testing: 5 Creative Angles
                </h2>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  Shopee Video V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                5 strategi konversi berbeda untuk produk "{productName}" tanpa sekadar mengubah kata-kata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAngles}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white bg-[#151d30] border border-[#233150] px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerasi 5 Angle</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#18233a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Tabs Switcher */}
        <div className="px-4 pt-3 pb-2 border-b border-[#18233a] bg-[#0e1423] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {angles.map((angle) => {
            const isActive = angle.versionKey === activeKey;
            return (
              <button
                key={angle.versionKey}
                onClick={() => setActiveKey(angle.versionKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50 shadow-md shadow-purple-950/60'
                    : 'bg-[#12192a] text-slate-300 border-[#1f2b45] hover:bg-[#19233a] hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-black/40 flex items-center justify-center text-[10px] font-black">
                  {angle.versionKey}
                </span>
                <span>{angle.name}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  {angle.estimatedScore}/100
                </span>
              </button>
            );
          })}
        </div>

        {/* Angle Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Merancang 5 strategi kreatif & storyboard Shopee Video...
              </p>
            </div>
          ) : activeAngle ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Angle Summary Card */}
              <div className="bg-gradient-to-r from-[#131b2f] to-[#0f1626] border border-[#233150] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c273e]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                        VERSION {activeAngle.versionKey}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Mekanisme: {activeAngle.conversionMechanism}
                      </h3>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {activeAngle.estimatedScore}/100 Est. Score
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeAngle.coreIdea}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApply(activeAngle)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-95 shrink-0"
                  >
                    {appliedKey === activeAngle.versionKey ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Diterapkan!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Gunakan Angle Ini di Storyboard</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Hook Highlight */}
                <div className="bg-[#0b0f19] border border-[#1b253b] rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      PRIMARY HOOK (0–2 Detik Pertama)
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      "{activeAngle.hook}"
                    </div>
                  </div>
                </div>

                {/* Overlays & CTA summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0b0f19] border border-[#1b253b] rounded-xl p-3">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                      Narasi & Overlay Alur
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      {activeAngle.overlaySummary}
                    </p>
                  </div>
                  <div className="bg-[#0b0f19] border border-[#1b253b] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                        High-Conversion CTA
                      </span>
                      <span className="text-sm font-bold text-white">
                        "{activeAngle.cta}"
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-1 rounded-md font-bold">
                      Anti-Spam
                    </span>
                  </div>
                </div>
              </div>

              {/* Storyboard 4-Scene Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>Rangkaian 4 Adegan 10 Detik (Version {activeAngle.versionKey})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Durasi: 10 Detik Total
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAngle.storyboard.map((sc, sIdx) => (
                    <div
                      key={sc.id || sIdx}
                      className="bg-[#111726] border border-[#1f2b43] rounded-xl p-3.5 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between border-b border-[#1b253b] pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded">
                            {sc.timeRange || `[${sIdx * 3}–${(sIdx + 1) * 3}s]`}
                          </span>
                          <span className="text-[10px] font-bold text-amber-300 uppercase">
                            {sc.scenePurpose || (sIdx === 0 ? 'HOOK' : sIdx === 3 ? 'CTA' : 'DEMO')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {sc.cameraAngle}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        <strong className="text-purple-300">Aksi:</strong> {sc.visualAction}
                      </p>

                      <div className="bg-[#0b0f19] rounded-lg p-2 text-xs space-y-1">
                        <div className="text-amber-300 font-bold font-mono text-[11px]">
                          📱 [{sc.popupText}]
                        </div>
                        <div className="text-slate-300 text-[11px] italic">
                          🗣️ "{sc.dialogVO}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy Flow Prompt Bar */}
              <div className="bg-[#0f1524] border border-[#1e2a44] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-purple-300 block">
                    Google Flow Prompt Master (Version {activeAngle.versionKey})
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-mono">
                    {activeAngle.googleFlowPrompt}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyPrompt(activeAngle.googleFlowPrompt)}
                  className="flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white bg-[#1a2339] border border-purple-700/40 px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Prompt Flow</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b263e] bg-[#0e1423] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Pilih angle yang paling cocok dengan karakter produk Anda lalu klik <strong>Terapkan</strong>.
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
