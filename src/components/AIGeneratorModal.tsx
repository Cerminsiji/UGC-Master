import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Zap,
  Target,
  Clock,
  Smartphone,
  Globe,
  Sliders,
  Check,
  Flame,
  ArrowRight,
  Link as LinkIcon,
  FileText,
  Loader2,
  RefreshCw,
  Tag,
  CheckCircle2,
  AlertCircle,
  User,
  Volume2
} from 'lucide-react';
import { UGC_CATEGORIES } from '../data/categories';
import { AIGenerateParams, AutoDetectResult } from '../types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategoryName: string;
  onGenerate: (params: AIGenerateParams) => Promise<void>;
  isGenerating: boolean;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentCategoryName,
  onGenerate,
  isGenerating,
}) => {
  // Input states
  const [category, setCategory] = useState(currentCategoryName || 'Before & After');
  const [productName, setProductName] = useState('Sago Green Coffee');
  const [productUrl, setProductUrl] = useState('');
  const [productDescription, setProductDescription] = useState('Kopi hijau herbal penurun berat badan alami dengan ekstrak sago yang mengontrol nafsu makan seharian.');
  const [targetAudience, setTargetAudience] = useState('Pria dan wanita usia 22-45 tahun yang ingin badan lebih ramping tanpa diet menyiksa.');
  const [keySellingPoints, setKeySellingPoints] = useState('Rasa enak gak pahit, bikin kenyang lebih lama, aman lambung, BPOM & Halal.');
  const [persona, setPersona] = useState<'Pria' | 'Wanita' | 'Hijaber' | 'Semua (Netral)'>('Wanita');
  const [tone, setTone] = useState('Santai, Mengalir & Natural (Teman Curhat)');
  const [targetDuration, setTargetDuration] = useState(30);
  const [targetSceneCount, setTargetSceneCount] = useState<number>(0); // 0 = Auto, or 3-9
  const [targetPlatform, setTargetPlatform] = useState('TikTok Shop');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Sync category when modal opens or active category changes
  React.useEffect(() => {
    if (isOpen && currentCategoryName) {
      setCategory(currentCategoryName);
    }
  }, [isOpen, currentCategoryName]);

  // Auto-detect unified state
  const [smartInput, setSmartInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStep, setDetectStep] = useState('Menganalisis...');
  const [detectSuccess, setDetectSuccess] = useState<string | null>(null);
  const [detectTags, setDetectTags] = useState<string[]>([]);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [highlightFields, setHighlightFields] = useState(false);

  if (!isOpen) return null;

  // Handle Smart AI Auto-Detection from 1 single input (link + notes)
  const handleAutoDetect = async (shouldAutoGenerateAfterDetect = false) => {
    const trimmedInput = smartInput.trim();
    if (!trimmedInput && !productName.trim()) {
      setDetectError('Masukkan link produk atau keterangan produk pada kolom di atas.');
      return;
    }

    // Extract URL if present in input
    const urlMatch = trimmedInput.match(/https?:\/\/[^\s]+/i);
    const extractedUrl = urlMatch ? urlMatch[0] : productUrl;
    if (extractedUrl) setProductUrl(extractedUrl);

    setIsDetecting(true);
    setDetectStep('🔍 Menganalisis link & mengekstrak data...');
    setDetectError(null);
    setDetectSuccess(null);

    const stepTimer1 = setTimeout(() => {
      setDetectStep('⚡ Mengekstrak USP, Persona & Target Audiens...');
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setDetectStep('✨ Menyesuaikan Format Storyboard UGC...');
    }, 1100);

    try {
      const response = await fetch('/api/auto-detect-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: trimmedInput || productName,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const rawText = await response.text();
      let resData: any = {};
      try {
        resData = JSON.parse(rawText);
      } catch {
        throw new Error('Respons server tidak valid. Silakan coba lagi sebentar.');
      }

      if (!response.ok || !resData.data) {
        throw new Error(resData.error || 'Gagal menganalisis produk.');
      }

      const detected: AutoDetectResult = resData.data;

      // Apply detected values
      if (detected.productName) setProductName(detected.productName);
      if (detected.productUrl || extractedUrl) setProductUrl(detected.productUrl || extractedUrl);
      if (detected.category) {
        const catMatch = UGC_CATEGORIES.find(
          (c) =>
            c.name.toLowerCase() === detected.category?.toLowerCase() ||
            c.id.toLowerCase() === detected.category?.toLowerCase() ||
            c.badgeText.toLowerCase() === detected.category?.toLowerCase()
        );
        setCategory(catMatch ? catMatch.name : detected.category);
      }
      if (detected.productDescription) setProductDescription(detected.productDescription);
      if (detected.targetAudience) setTargetAudience(detected.targetAudience);
      if (detected.keySellingPoints) setKeySellingPoints(detected.keySellingPoints);
      if (detected.persona) setPersona(detected.persona);
      if (detected.tone) setTone(detected.tone);
      if (detected.targetPlatform) setTargetPlatform(detected.targetPlatform);
      if (detected.targetDuration) setTargetDuration(detected.targetDuration);
      if (detected.detectedTags && Array.isArray(detected.detectedTags)) {
        setDetectTags(detected.detectedTags);
      }

      setDetectSuccess(detected.detectionSummary || `Berhasil mendeteksi "${detected.productName}"`);
      setHighlightFields(true);
      setTimeout(() => setHighlightFields(false), 2500);

      // Auto-generate directly if requested
      if (shouldAutoGenerateAfterDetect && detected.productName) {
        const catMatch = UGC_CATEGORIES.find(
          (c) =>
            c.name.toLowerCase() === detected.category?.toLowerCase() ||
            c.id.toLowerCase() === detected.category?.toLowerCase()
        );
        const resolvedCategory = catMatch ? catMatch.name : (detected.category || category);

        await onGenerate({
          category: resolvedCategory,
          productName: detected.productName.trim(),
          productUrl: extractedUrl,
          productDescription: (detected.productDescription || '').trim(),
          targetAudience: (detected.targetAudience || '').trim(),
          keySellingPoints: (detected.keySellingPoints || '').trim(),
          persona: detected.persona || persona,
          tone: detected.tone || tone,
          targetDuration: detected.targetDuration || targetDuration,
          targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
          targetPlatform: detected.targetPlatform || targetPlatform,
          language,
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Auto detect error:', err);
      setDetectError(err.message || 'Gagal mengekstrak info produk. Silakan lengkapi manual.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim() && !smartInput.trim()) return;

    // Check if smartInput has a URL
    let activeUrl = productUrl;
    if (!activeUrl && smartInput.trim()) {
      const match = smartInput.match(/https?:\/\/[^\s]+/i);
      if (match) activeUrl = match[0];
    }

    await onGenerate({
      category,
      productName: productName.trim() || 'Produk Unggulan',
      productUrl: activeUrl,
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      keySellingPoints: keySellingPoints.trim(),
      persona,
      tone,
      targetDuration,
      targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
      targetPlatform,
      language,
    });
    onClose();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSmartInput(text);
        setDetectError(null);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#1f2a42] flex items-center justify-between bg-gradient-to-r from-[#141b2e] via-[#111728] to-[#101625]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Studio Deteksi & Generator Naskah UGC</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-bold">
                  AI Viral Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ekstraksi produk instan dari tautan & generate storyboard UGC berkonversi tinggi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating || isDetecting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
          
          {/* AUTO DETECT CARD SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#182038] to-[#121829] border border-purple-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Deteksi Produk Cepat (Link & Keterangan)</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-700/50 font-bold">
                      SMART DETECT
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tempel link TikTok Shop, Shopee, Tokopedia, atau tulis catatan produk untuk diekstrak otomatis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[10px] font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                title="Tempel teks atau link dari clipboard"
              >
                📋 Paste
              </button>
            </div>

            {/* Single Unified Smart Input */}
            <div className="space-y-2.5">
              <div className="relative">
                <div className="absolute top-2.5 left-3 pointer-events-none text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Contoh: https://vt.tiktok.com/ZS2mSkincare/ Serum pencerah bekas jerawat 10% niacinamide, hasil 7 hari aman jerawat, ada diskon 50%..."
                  className="w-full bg-[#0d121f] border border-[#263352] focus:border-purple-400 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition-all shadow-inner"
                />
              </div>

              {/* Action Buttons for Auto-Detect */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Contoh:</span>
                  {[
                    { label: '☕ Kopi Hijau Diet', text: 'Kopi herbal penurun nafsu makan ekstrak sago slimming diet kenyang seharian BPOM' },
                    { label: '✨ Serum Niacinamide', text: 'Serum wajah pencerah flek hitam 10% niacinamide centella glowing 7 hari' },
                    { label: '⌨️ Mechanical Keyboard', text: 'Keyboard wireless ergonomis bluetooth 3 device RGB baterai 3 bulan' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSmartInput(p.text)}
                      className="text-[10px] bg-[#141b2c] hover:bg-[#1b253b] text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-[#212d44] transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoDetect(false)}
                    disabled={isDetecting || isGenerating}
                    className="flex items-center gap-1.5 bg-[#172036] hover:bg-[#202c4a] text-purple-300 border border-purple-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>Menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        <span>Deteksi Produk</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoDetect(true)}
                    disabled={isDetecting || isGenerating}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 border border-purple-400/40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span>Deteksi & Langsung Generate</span>
                  </button>
                </div>
              </div>

              {/* Status / Feedback Banner */}
              {isDetecting && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                  <span>{detectStep}</span>
                </div>
              )}

              {detectSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="font-bold">Berhasil: </span>
                    <span>{detectSuccess}</span>
                  </div>
                  {detectTags.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {detectTags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detectError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{detectError}</span>
                </div>
              )}
            </div>
          </div>

          {/* PARAMETERS FORM SECTION */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row: Category & Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Format / Kategori UGC
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                >
                  {UGC_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} ({cat.recommendedDuration}s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Platform
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full bg-[#141b2b] border border-[#23304d] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                >
                  <option value="TikTok Shop">TikTok Shop (Rasio 9:16)</option>
                  <option value="Shopee Video">Shopee Video (Rasio 9:16)</option>
                  <option value="Instagram Reels">Instagram Reels (Rasio 9:16)</option>
                  <option value="YouTube Shorts">YouTube Shorts (Rasio 9:16)</option>
                </select>
              </div>
            </div>

            {/* Product Name & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Sago Green Coffee, Glow Serum, Mechanical Keyboard"
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-sm text-slate-100 outline-none font-medium transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Link Asal Produk (Hasil Ekstraksi)
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://tiktok.com/... atau https://shopee.co.id/..."
                  className="w-full bg-[#141b2b] border border-[#23304d] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-purple-300 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Product Description & USP (Parameter UGC) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Jelaskan produk secara ringkas..."
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Poin Penjualan Utama (USP / Parameter UGC)
                </label>
                <textarea
                  rows={2}
                  value={keySellingPoints}
                  onChange={(e) => setKeySellingPoints(e.target.value)}
                  placeholder="e.g. Hasil cepat 7 hari, diskon 50%, BPOM & Halal, praktis..."
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* PARAMETER STORYBOARD: Persona Talent (Pria, Wanita, Hijaber) */}
            <div className="p-3.5 rounded-2xl bg-[#111726] border border-[#1e2940]">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Persona Talent Storyboard</span>
                </span>
                <span className="text-[10px] text-purple-400 font-semibold font-mono">
                  Aktif: {persona}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Pria', label: 'Pria', icon: '👱‍♂️', desc: 'Maskulin & Santai' },
                  { id: 'Wanita', label: 'Wanita', icon: '👩', desc: 'Lifestyle & Beauty' },
                  { id: 'Hijaber', label: 'Hijaber', icon: '🧕', desc: 'Muslimah Chic' },
                  { id: 'Semua (Netral)', label: 'Semua (Netral)', icon: '👥', desc: 'Universal Vibe' },
                ].map((item) => {
                  const isSelected = persona === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPersona(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-950/60 ring-1 ring-purple-500/40'
                          : 'bg-[#141b2b] border-[#222e47] text-slate-400 hover:text-slate-200 hover:bg-[#1a2338]'
                      }`}
                    >
                      <div className="text-base mb-1">{item.icon}</div>
                      <div className="text-xs font-bold leading-tight text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row: Target Audience & Voice Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Audiens
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Mahasiswa, Ibu muda, Pekerja kantoran"
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Voice Tone (Gaya Bicara Kreator)</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Diperbarui</span>
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                >
                  <option value="Santai, Mengalir & Natural (Teman Curhat)">Santai, Mengalir & Natural (Teman Curhat)</option>
                  <option value="Excited, Hype & Ceria (Racun Belanja)">Excited, Hype & Ceria (Racun Belanja TikTok)</option>
                  <option value="Storytelling & Emosional (Problem Solver)">Storytelling & Emosional (Problem Solver Nyata)</option>
                  <option value="Edukatif, Informatif & Berwibawa (Dokter / Expert)">Edukatif, Informatif & Berwibawa (Dokter / Expert)</option>
                  <option value="Soft-Spoken, Calming & Aesthetic (ASMR Vibe)">Soft-Spoken, Calming & Aesthetic (ASMR Vibe)</option>
                  <option value="Lucu, Sarkas & Blunder (Komedi Viral)">Lucu, Sarkas & Blunder (Komedi Viral)</option>
                  <option value="FOMO & Mendesak (Promo Kilat / Keranjang Kuning)">FOMO & Mendesak (Promo Kilat / Keranjang Kuning)</option>
                  <option value="Elegan, Mewah & Eksklusif (High-End Lifestyle)">Elegan, Mewah & Eksklusif (High-End Lifestyle)</option>
                  <option value="To-The-Point & Solutif (Hard-Selling Langsung)">To-The-Point & Solutif (Hard-Selling Langsung)</option>
                </select>
              </div>
            </div>

            {/* Target Duration & Scene Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target Durasi Video
                  </label>
                  <span className="text-[11px] font-bold text-purple-400 font-mono">
                    {targetDuration} Detik
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDuration(d)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        targetDuration === d
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                          : 'bg-[#141b2b] text-slate-400 border-[#23304d] hover:bg-[#1a2338]'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Jumlah Adegan
                  </label>
                  <span className="text-[11px] font-bold text-indigo-400 font-mono">
                    {targetSceneCount === 0 ? 'Otomatis' : `${targetSceneCount} Adegan`}
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetSceneCount(0)}
                    className={`col-span-2 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      targetSceneCount === 0
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                        : 'bg-[#141b2b] text-slate-400 border-[#23304d] hover:bg-[#1a2338]'
                    }`}
                  >
                    Auto
                  </button>
                  {[3, 4, 5, 6, 7, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTargetSceneCount(count)}
                      className={`col-span-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        targetSceneCount === count
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                          : 'bg-[#141b2b] text-slate-400 border-[#23304d] hover:bg-[#1a2338]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1f2a42] bg-[#121828] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating || isDetecting}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isGenerating || isDetecting || (!productName.trim() && !smartInput.trim())}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/30"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-purple-200" />
                <span>Menghasilkan Storyboard AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Generate Storyboard UGC</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
