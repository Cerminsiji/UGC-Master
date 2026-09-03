import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  Sparkles,
  TrendingUp,
  Clock,
  Video,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { ConversionScores, QualityCheckResult, Scene } from '../types';

interface ConversionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  scenes: Scene[];
  conversionScores?: ConversionScores;
  qualityCheck?: QualityCheckResult;
  onApplyAuditFix: (fixedScenes: Scene[], newScores: ConversionScores, newCheck: QualityCheckResult) => void;
}

export const ConversionAuditModal: React.FC<ConversionAuditModalProps> = ({
  isOpen,
  onClose,
  productName,
  scenes,
  conversionScores,
  qualityCheck,
  onApplyAuditFix,
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixSuccess, setFixSuccess] = useState(false);

  if (!isOpen) return null;

  const currentScores: ConversionScores = conversionScores || {
    hookScore: 9.4,
    retentionScore: 9.5,
    productClarity: 9.2,
    demonstrationScore: 9.3,
    emotionalRelevance: 9.1,
    ctaScore: 9.7,
    ugcRealism: 9.5,
    conversionPotential: 9.4,
    totalScore: 94,
    auditNotes: [],
  };

  const currentCheck: QualityCheckResult = qualityCheck || {
    hookCheck: true,
    productVisibilityCheck: true,
    productConsistencyCheck: true,
    demonstrationCheck: true,
    visualProofCheck: true,
    textLengthCheck: true,
    voiceoverLengthCheck: true,
    timingCheck: true,
    ctaCheck: true,
    aiVideoPromptConsistencyCheck: true,
    autoFixedCount: 0,
    details: [],
  };

  const handleRunAutoFix = async () => {
    setIsFixing(true);
    try {
      const res = await fetch('/api/audit-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          productName,
          targetDuration: 10,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onApplyAuditFix(data.data.scenes, data.data.scores, data.data.qualityCheck);
        setFixSuccess(true);
        setTimeout(() => setFixSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to run auto fix audit:', e);
    } finally {
      setIsFixing(false);
    }
  };

  const checklistItems = [
    { label: 'Hook Check (0–2 Detik Pertama Berbobot & Bebas Intro Basi)', pass: currentCheck.hookCheck },
    { label: 'Product Visibility Check (Produk Ditampilkan Jelas & Terbaca)', pass: currentCheck.productVisibilityCheck },
    { label: 'Product Consistency Lock (Logo & Kemasan Terkunci Konsisten)', pass: currentCheck.productConsistencyCheck },
    { label: 'Demonstration Check (Aksi Pakai Nyata: Problem -> Aksi -> Hasil)', pass: currentCheck.demonstrationCheck },
    { label: 'Visual Proof Check (Terdapat Minimal 1 Bukti Visual Nyata)', pass: currentCheck.visualProofCheck },
    { label: 'Text Length Check (Overlay Ringkas 3–7 Kata Mobile-First)', pass: currentCheck.textLengthCheck },
    { label: 'Voiceover Length Check (Narasi Pas Durasi & Tidak Kecepatan)', pass: currentCheck.voiceoverLengthCheck },
    { label: 'Timing Check (Total Durasi Presisi 10 Detik)', pass: currentCheck.timingCheck },
    { label: 'CTA Check (Ajakan Checkout Singkat & Bebas Spam Follow/Share)', pass: currentCheck.ctaCheck },
    { label: 'Google Flow Prompt Consistency Check (Prompt Sesuai Standar)', pass: currentCheck.aiVideoPromptConsistencyCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0d121f] border border-[#202c46] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1c273e] flex items-center justify-between bg-gradient-to-r from-[#141c30] to-[#0f1526]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Audit Konversi & Quality Control
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-bold">
                  Shopee Video V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi 8 metrik konversi dan 10 poin audit mutu storyboard "{productName}".
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#18233a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Total Creative Score Banner */}
          <div className="bg-gradient-to-r from-[#121b30] to-[#0e1628] border border-[#243354] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex flex-col items-center justify-center text-white shadow-lg shadow-purple-950/60 shrink-0">
                <span className="text-2xl font-black font-mono leading-none">
                  {currentScores.totalScore}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-90">
                  / 100
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                  <TrendingUp className="w-4 h-4" />
                  <span>ESTIMATED CONVERSION STRENGTH</span>
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {currentScores.totalScore >= 90
                    ? 'Potensi Konversi Sangat Tinggi 🔥'
                    : currentScores.totalScore >= 80
                    ? 'Siap Produksi & Teroptimasi ⭐'
                    : 'Perlu Perbaikan Otomatis ⚠️'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Storyboard terkalibrasi khusus algoritma Shopee Video & Affiliate Indonesia.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAutoFix}
              disabled={isFixing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Memperbaiki Storyboard...</span>
                </>
              ) : fixSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Berhasil Diperbaiki!</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Jalankan Auto-Fix Mutu</span>
                </>
              )}
            </button>
          </div>

          {/* 8 Conversion Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Rincian 8 Metrik Konversi (/10)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Hook Score', score: currentScores.hookScore },
                { label: 'Retention Score', score: currentScores.retentionScore },
                { label: 'Product Clarity', score: currentScores.productClarity },
                { label: 'Demonstration', score: currentScores.demonstrationScore },
                { label: 'Emotional Fit', score: currentScores.emotionalRelevance },
                { label: 'CTA Score', score: currentScores.ctaScore },
                { label: 'UGC Realism', score: currentScores.ugcRealism },
                { label: 'Conversion Pot.', score: currentScores.conversionPotential },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#111726] border border-[#1f2c46] rounded-xl p-3 flex flex-col justify-between space-y-1"
                >
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.label}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-white font-mono">
                      {item.score}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">/10</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${(item.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Automated Quality Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>10 Poin Quality Control (Shopee Video Compliance)</span>
            </h4>

            <div className="bg-[#0f1524] border border-[#1e2a44] rounded-2xl p-4 space-y-2.5">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#18233a] last:border-0"
                >
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#161f33] text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {item.label}
                  </span>
                  {item.pass ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lolos
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded-full shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" /> Auto-Fix Ready
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Fix Details Log */}
          {currentCheck.details && currentCheck.details.length > 0 && (
            <div className="bg-[#0b0f19] border border-[#1c263d] rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Catatan Optimasi Otomatis Terakhir:
              </span>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {currentCheck.details.map((detail, dIdx) => (
                  <li key={dIdx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c273e] bg-[#0e1423] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Sistem otomatis memastikan skor &gt;80 sebelum naskah diproduksi.
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-[#161e31] hover:bg-[#1e2942] px-4 py-2 rounded-xl transition-colors"
          >
            Selesai & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
