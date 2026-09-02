import React, { useState, useRef } from 'react';
import {
  Sparkles,
  X,
  Zap,
  Clock,
  Smartphone,
  Globe,
  Flame,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Hand,
  User,
  Activity,
  Layers,
  ShieldCheck,
  Ban,
  Upload,
  Image as ImageIcon,
  Trash2,
  Lock,
} from 'lucide-react';
import { UGC_CATEGORIES } from '../data/categories';
import { AIGenerateParams, AutoDetectResult, ProductImageAnalysis } from '../types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategoryName: string;
  onGenerate: (params: AIGenerateParams) => Promise<void>;
  isGenerating: boolean;
  initialProductImage?: string;
  initialProductAnalysis?: ProductImageAnalysis;
  initialProductName?: string;
  initialUSP?: string;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentCategoryName,
  onGenerate,
  isGenerating,
  initialProductImage,
  initialProductAnalysis,
  initialProductName,
  initialUSP,
}) => {
  // Input states
  const [category, setCategory] = useState(currentCategoryName || 'Before & After');
  const [productName, setProductName] = useState(initialProductName || 'Sago Green Coffee');
  const [productDescription, setProductDescription] = useState('Kopi hijau herbal penurun berat badan alami dengan ekstrak sago yang mengontrol nafsu makan seharian.');
  const [targetAudience, setTargetAudience] = useState('Pria dan wanita usia 22-45 tahun yang ingin badan lebih ramping tanpa diet menyiksa.');
  const [keySellingPoints, setKeySellingPoints] = useState(initialUSP || 'Rasa enak gak pahit, bikin kenyang lebih lama, aman lambung, BPOM & Halal.');
  const [tone, setTone] = useState('Santai, Relatable & Meyakinkan');
  const [targetDuration, setTargetDuration] = useState(30);
  const [targetSceneCount, setTargetSceneCount] = useState<number>(0); // 0 = Auto, or 3-9
  const [visualFocus, setVisualFocus] = useState<'mix' | 'hands_only' | 'face' | 'full_body'>('mix');
  const [strictProductConsistency, setStrictProductConsistency] = useState(true);
  const [antiAiMovement, setAntiAiMovement] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState('TikTok Shop');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Product Image Upload & Vision Analysis States
  const [productImageBase64, setProductImageBase64] = useState<string | undefined>(initialProductImage);
  const [productImageAnalysis, setProductImageAnalysis] = useState<ProductImageAnalysis | undefined>(initialProductAnalysis);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalyzeSuccess, setImageAnalyzeSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect unified state
  const [smartInput, setSmartInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStep, setDetectStep] = useState('Menganalisis...');
  const [detectSuccess, setDetectSuccess] = useState<string | null>(null);
  const [detectTags, setDetectTags] = useState<string[]>([]);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [highlightFields, setHighlightFields] = useState(false);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setDetectError('Format file harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDetectError('Ukuran gambar maksimal 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProductImageBase64(base64);
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Analyze Image with Gemini Vision
  const analyzeImage = async (base64: string, mimeType = 'image/jpeg') => {
    setIsAnalyzingImage(true);
    setImageAnalyzeSuccess(null);
    setDetectError(null);
    try {
      const res = await fetch('/api/analyze-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          notes: smartInput || productName,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.data) {
        throw new Error(resData.error || 'Gagal menganalisis foto produk.');
      }

      const analyzed = resData.data;
      if (analyzed.productName) setProductName(analyzed.productName);
      if (analyzed.category) setCategory(analyzed.category);
      if (analyzed.productDescription) setProductDescription(analyzed.productDescription);
      if (analyzed.targetAudience) setTargetAudience(analyzed.targetAudience);
      if (analyzed.keySellingPoints) setKeySellingPoints(analyzed.keySellingPoints);
      if (analyzed.productImageAnalysis) {
        setProductImageAnalysis(analyzed.productImageAnalysis);
      }
      if (analyzed.detectedTags) {
        setDetectTags(analyzed.detectedTags);
      }

      setImageAnalyzeSuccess(`Foto produk teranalisis: "${analyzed.productName}". Konsistensi Google Flow aktif!`);
      setHighlightFields(true);
      setTimeout(() => setHighlightFields(false), 2500);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setDetectError(err.message || 'Gagal menganalisis foto produk.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const removeProductImage = () => {
    setProductImageBase64(undefined);
    setProductImageAnalysis(undefined);
    setImageAnalyzeSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Smart AI Auto-Detection from 1 single input (link + notes)
  const handleAutoDetect = async (shouldAutoGenerateAfterDetect = false) => {
    const trimmedInput = smartInput.trim();
    if (!trimmedInput && !productName.trim() && !productImageBase64) {
      setDetectError('Masukkan link produk, keterangan, atau unggah foto produk.');
      return;
    }

    setIsDetecting(true);
    setDetectStep('🔍 Menganalisis link & keterangan...');
    setDetectError(null);
    setDetectSuccess(null);

    const stepTimer1 = setTimeout(() => {
      setDetectStep('⚡ Mengekstrak USP & Target Audiens...');
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setDetectStep('✨ Menyesuaikan Kategori & Format UGC...');
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
      if (detected.category) setCategory(detected.category);
      if (detected.productDescription) setProductDescription(detected.productDescription);
      if (detected.targetAudience) setTargetAudience(detected.targetAudience);
      if (detected.keySellingPoints) setKeySellingPoints(detected.keySellingPoints);
      if (detected.tone) setTone(detected.tone);
      if (detected.targetPlatform) setTargetPlatform(detected.targetPlatform);
      if (detected.targetDuration) setTargetDuration(detected.targetDuration);
      if (detected.visualFocus) setVisualFocus(detected.visualFocus);
      if (detected.detectedTags && Array.isArray(detected.detectedTags)) {
        setDetectTags(detected.detectedTags);
      }

      setDetectSuccess(detected.detectionSummary || `Berhasil mendeteksi "${detected.productName}"`);
      setHighlightFields(true);
      setTimeout(() => setHighlightFields(false), 2500);

      // Auto-generate directly if requested
      if (shouldAutoGenerateAfterDetect && detected.productName) {
        await onGenerate({
          category: detected.category || category,
          productName: detected.productName.trim(),
          productDescription: (detected.productDescription || '').trim(),
          targetAudience: (detected.targetAudience || '').trim(),
          keySellingPoints: (detected.keySellingPoints || '').trim(),
          tone: detected.tone || tone,
          targetDuration: detected.targetDuration || targetDuration,
          targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
          visualFocus,
          strictProductConsistency,
          antiAiMovement,
          productImageBase64,
          productImageAnalysis,
          targetPlatform: detected.targetPlatform || targetPlatform,
          language,
        });
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Auto detect error:', err);
      setDetectError(err.message || 'Terjadi kesalahan saat mendeteksi produk.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSmartInput((prev) => (prev ? `${prev}\n${text}` : text));
      }
    } catch {
      // Ignore if clipboard permissions are restricted
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (smartInput.trim() && (productName === 'Sago Green Coffee' || !productName.trim())) {
      await handleAutoDetect(true);
      return;
    }

    if (!productName.trim()) {
      if (smartInput.trim()) {
        await handleAutoDetect(true);
      }
      return;
    }

    await onGenerate({
      category,
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      keySellingPoints: keySellingPoints.trim(),
      tone,
      targetDuration,
      targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
      visualFocus,
      strictProductConsistency,
      antiAiMovement,
      productImageBase64,
      productImageAnalysis,
      targetPlatform,
      language,
    });
  };

  const sampleInputs = [
    {
      label: 'Serum Niacinamide (TikTok)',
      content: 'https://vt.tiktok.com/ZS2mSkincareGlow/ Serum viral pencerah bekas jerawat 10% niacinamide murni, hasil nyata 7 hari aman untuk kulit sensitif.',
    },
    {
      label: 'Sago Green Coffee (Shopee)',
      content: 'https://shopee.co.id/sago-slimming-green-coffee-herbal Kopi hijau herbal penurun nafsu makan alami, melancarkan metabolisme & bersertifikasi BPOM.',
    },
    {
      label: 'Mechanical Keyboard (Tokped)',
      content: 'https://tokopedia.com/techstore/wireless-keyboard-rgb Keyboard mechanical wireless silent tactile switch, RGB estetik, baterai tahan 3 bulan.',
    },
    {
      label: 'Korean Fleece Hoodie (Fashion)',
      content: 'https://shopee.co.id/korean-oversize-fleece-hoodie Hoodie oversized bahan fleece tebal premium korean streetwear under 99k keranjang kuning.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2a42] flex items-center justify-between bg-gradient-to-r from-[#141b2e] via-[#111728] to-[#101625]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI UGC Storyboard Generator</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-bold">
                  Gemini Flash Vision AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload foto produk referensi, konsistensi Google Flow, & Anti-AI organic realism.
              </p>
            </div>
          </div>

          <button
            id="close-generator-modal-btn"
            onClick={onClose}
            disabled={isGenerating || isDetecting || isAnalyzingImage}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* SECTION 1: PRODUCT PHOTO REFERENCE UPLOAD (Google Flow Main Source) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18233f] to-[#12192d] border border-indigo-500/50 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Upload Foto Referensi Produk</span>
                    <span className="bg-indigo-950 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-indigo-700/50 font-bold">
                      SUMBER UTAMA PROMPT
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Foto produk akan dianalisis oleh AI Vision & dikunci ke setiap prompt adegan (Google Flow Consistency).
                  </p>
                </div>
              </div>

              {productImageBase64 && (
                <button
                  type="button"
                  id="remove-product-photo-btn"
                  onClick={removeProductImage}
                  className="text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>

            {/* Upload Area / Preview */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id="product-photo-file-input"
            />

            {productImageBase64 ? (
              <div className="p-3 bg-[#0c101c] border border-indigo-500/40 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                <div className="relative group shrink-0 w-24 h-24 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-indigo-500/40 bg-black/50 flex items-center justify-center">
                  <img
                    src={productImageBase64}
                    alt="Product Reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 rounded bg-black/70 text-white text-[10px]"
                    >
                      Ganti
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-xs text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Google Flow Locked
                    </span>
                    {isAnalyzingImage && (
                      <span className="text-[10px] text-indigo-300 animate-pulse flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menganalisis kemasan...
                      </span>
                    )}
                  </div>

                  {productImageAnalysis?.visualAppearance ? (
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-[#141b2c] p-1.5 rounded border border-indigo-900/40">
                      <span className="text-indigo-300 font-semibold">Karakteristik Kemasan: </span>
                      {productImageAnalysis.visualAppearance}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Foto produk terunggah. Siap menjadi panduan konsistensi kemasan di seluruh adegan storyboard.
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      id="reanalyze-photo-btn"
                      onClick={() => analyzeImage(productImageBase64)}
                      disabled={isAnalyzingImage}
                      className="text-[10px] text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 px-2 py-0.5 rounded transition-all flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                      <span>Analisis Ulang Foto</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-[#0c101c]/70 hover:bg-[#12182b] rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Klik atau Tarik Foto Produk ke Sini
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Format: JPG, PNG, WEBP (Maks. 10MB). AI akan mengekstrak detail kemasan secara otomatis.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: AUTO DETECT CARD (Link + Notes) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#182038] to-[#121829] border border-purple-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600/30 border border-purple-400/40 text-purple-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Atau Masukkan Link & Keterangan Produk</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-700/50 font-bold">
                      SMART TEXT
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tempel link produk (TikTok Shop, Shopee, Tokopedia, Web) dan/atau tulis deskripsi produk di sini.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="paste-clipboard-btn"
                onClick={handlePasteClipboard}
                className="text-[10px] font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95"
                title="Tempel teks atau link dari clipboard"
              >
                📋 Paste
              </button>
            </div>

            {/* Single Unified Smart Input (Link + Notes together) */}
            <div className="space-y-2.5">
              <div className="relative">
                <div className="absolute top-2.5 left-3 pointer-events-none text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <textarea
                  id="smart-product-input"
                  rows={2}
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Contoh: https://vt.tiktok.com/ZS2mSkincare/ Serum pencerah bekas jerawat 10% niacinamide, hasil 7 hari aman jerawat..."
                  className="w-full bg-[#0d121f] border border-[#263352] focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition-all shadow-inner"
                />
              </div>

              {/* Action Buttons for Auto-Detect */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Contoh:</span>
                  {sampleInputs.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      id={`sample-input-${idx}`}
                      onClick={() => setSmartInput(s.content)}
                      className="text-[10px] bg-[#141c2e] hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-[#23314e] hover:border-purple-500/50 px-2 py-0.5 rounded-md transition-all truncate max-w-[150px]"
                      title={s.content}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="auto-detect-btn"
                    onClick={() => handleAutoDetect(false)}
                    disabled={isDetecting || isGenerating}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md shadow-purple-900/40 transition-all disabled:opacity-50 border border-purple-400/40"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{detectStep}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Detect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status feedback */}
              {detectSuccess && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{detectSuccess}</span>
                </div>
              )}

              {imageAnalyzeSuccess && (
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{imageAnalyzeSuccess}</span>
                </div>
              )}

              {detectError && (
                <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{detectError}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: FORM DETAIL FIELDS */}
          <form id="storyboard-generator-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Product Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Nama Produk</span>
                  <span className="text-[10px] text-amber-400 font-semibold">*Wajib</span>
                </label>
                <input
                  type="text"
                  id="generator-product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Glow Niacinamide Serum"
                  required
                  className={`w-full bg-[#0d121f] border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 ring-2 ring-purple-500/30' : 'border-[#23304d] focus:border-purple-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Kategori UGC
                </label>
                <select
                  id="generator-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0d121f] border border-[#23304d] focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {UGC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.badgeText})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Visual Focus (Hands-only, Face, Full Body, Mix) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141b2c] border border-[#23304d]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pilihan Fokus Visual Talent:</span>
                </label>
                <span className="text-[10px] text-slate-400">Pilih angle talent video UGC</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'hands_only',
                    label: 'Hanya Tangan',
                    desc: 'POV Unboxing & Hands-on',
                    icon: Hand,
                  },
                  {
                    id: 'face',
                    label: 'Wajah (Talking Head)',
                    desc: 'Ekspresif & Kontak Mata',
                    icon: User,
                  },
                  {
                    id: 'full_body',
                    label: 'Full Body',
                    desc: 'Outfit & Gerak Tubuh',
                    icon: Activity,
                  },
                  {
                    id: 'mix',
                    label: 'Campuran Dinamis',
                    desc: 'Fast Cut Multi Angle',
                    icon: Layers,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = visualFocus === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`visual-focus-${item.id}`}
                      onClick={() => setVisualFocus(item.id as any)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                          : 'bg-[#0d121f] border-[#23304d] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Key Selling Points (USP) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Poin Penjualan Utama (USP)</span>
                <span className="text-[10px] text-slate-400">Paling memicu konversi keranjang kuning</span>
              </label>
              <input
                type="text"
                id="generator-usp-input"
                value={keySellingPoints}
                onChange={(e) => setKeySellingPoints(e.target.value)}
                placeholder="Contoh: Mencerahkan flek hitam dalam 7 hari, tekstur cepat meresap, BPOM"
                className={`w-full bg-[#0d121f] border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all ${
                  highlightFields ? 'border-purple-400 ring-2 ring-purple-500/30' : 'border-[#23304d] focus:border-purple-400'
                }`}
              />
            </div>

            {/* Row 4: Target Duration & Number of Scenes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Durasi:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[10, 15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      id={`duration-${d}s`}
                      onClick={() => setTargetDuration(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        targetDuration === d
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                          : 'bg-[#0d121f] border border-[#23304d] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Jumlah Adegan:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Hingga 9 adegan</span>
                </label>
                <div className="flex items-center gap-1">
                  {[0, 3, 4, 5, 6, 7, 8, 9].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      id={`scene-count-${cnt}`}
                      onClick={() => setTargetSceneCount(cnt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        targetSceneCount === cnt
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-[#0d121f] border border-[#23304d] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cnt === 0 ? 'Auto' : cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 5: Platform & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                  <span>Target Platform:</span>
                </label>
                <select
                  id="generator-platform-select"
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full bg-[#0d121f] border border-[#23304d] focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="TikTok Shop">TikTok Shop (Keranjang Kuning)</option>
                  <option value="Shopee Video">Shopee Video (Racun Shopee)</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bahasa Output:</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="lang-id-btn"
                    onClick={() => setLanguage('id')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      language === 'id'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'bg-[#0d121f] border border-[#23304d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇮🇩 Bahasa Indonesia (100% Slang UGC)
                  </button>
                  <button
                    type="button"
                    id="lang-en-btn"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      language === 'en'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'bg-[#0d121f] border border-[#23304d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Guarantee Badges */}
            <div className="p-3 bg-[#111728] border border-[#1e2942] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Google Flow Consistency Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-purple-300 font-semibold text-[11px]">
                  <Ban className="w-3.5 h-3.5" /> Anti-AI Movement (No CGI / No Cartoon)
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-medium">
                Auto Caption &lt; 150 chars
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                id="submit-generate-storyboard-btn"
                disabled={isGenerating || isDetecting || isAnalyzingImage}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-purple-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Sedang Menyusun Storyboard UGC Viral...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Storyboard UGC Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
