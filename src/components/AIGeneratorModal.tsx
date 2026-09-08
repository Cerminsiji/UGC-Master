import React, { useState, useEffect } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  Video,
  Eye,
  SlidersHorizontal,
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import {
  UGC_CATEGORIES,
  CAMERA_STYLE_OPTIONS,
  getRecommendedCameraStyle,
  MARKETING_FRAMEWORKS,
  HOOK_STRATEGY_OPTIONS,
  CTA_PRESETS,
  VISUAL_FRAMING_OPTIONS,
  VisualFramingOption
} from '../data/categories';
import { AIGenerateParams, AutoDetectResult, VisualFramingType } from '../types';
import { compressImageFile } from '../utils/helpers';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategoryName: string;
  onGenerate: (params: AIGenerateParams) => Promise<void>;
  isGenerating: boolean;
  initialParams?: Partial<AIGenerateParams> | null;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentCategoryName,
  onGenerate,
  isGenerating,
  initialParams,
}) => {
  // Input states
  const [category, setCategory] = useState(currentCategoryName || 'Before & After');
  const [productName, setProductName] = useState('Sago Green Coffee');
  const [productDescription, setProductDescription] = useState('Kopi hijau herbal penurun berat badan alami dengan ekstrak sago yang mengontrol nafsu makan seharian.');
  const [targetAudience, setTargetAudience] = useState('Pria dan wanita usia 22-45 tahun yang ingin badan lebih ramping tanpa diet menyiksa.');
  const [keySellingPoints, setKeySellingPoints] = useState('Rasa enak gak pahit, bikin kenyang lebih lama, aman lambung, BPOM & Halal.');
  const [tone, setTone] = useState('Santai, Relatable & Meyakinkan');
  const [cameraStyle, setCameraStyle] = useState<string>('Kombinasi Dinamis (Rekomendasi AI Otomatis)');
  const [visualFraming, setVisualFraming] = useState<VisualFramingType>('mix_framing');
  const [customCameraStyle, setCustomCameraStyle] = useState<string>('');
  const [isCustomCamera, setIsCustomCamera] = useState<boolean>(false);
  const [aiCameraReason, setAiCameraReason] = useState<string | null>(null);
  const [targetDuration, setTargetDuration] = useState(30);
  const [targetSceneCount, setTargetSceneCount] = useState<number>(0); // 0 = Auto, or 3, 4, 5, 6, 7, 8, 9
  const [targetPlatform, setTargetPlatform] = useState('TikTok Shop');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [productImage, setProductImage] = useState<string | undefined>(undefined);

  // Sync initialParams whenever provided or modal opens
  useEffect(() => {
    if (initialParams && isOpen) {
      if (initialParams.productName) setProductName(initialParams.productName);
      if (initialParams.productDescription) setProductDescription(initialParams.productDescription);
      if (initialParams.category) setCategory(initialParams.category);
      if (initialParams.targetAudience) setTargetAudience(initialParams.targetAudience);
      if (initialParams.keySellingPoints) setKeySellingPoints(initialParams.keySellingPoints);
      if (initialParams.visualFraming) setVisualFraming(initialParams.visualFraming);
      if (initialParams.productImage) setProductImage(initialParams.productImage);
      if (initialParams.tone) setTone(initialParams.tone);
      if (initialParams.targetPlatform) setTargetPlatform(initialParams.targetPlatform);
      if (initialParams.marketingFramework) setMarketingFramework(initialParams.marketingFramework);
      if (initialParams.hookStrategy) setHookStrategy(initialParams.hookStrategy);
      if (initialParams.ctaPreset) setCtaPreset(initialParams.ctaPreset);
    }
  }, [initialParams, isOpen]);

  // Conversion & Marketing Optimization states
  const [marketingFramework, setMarketingFramework] = useState<string>('aida');
  const [hookStrategy, setHookStrategy] = useState<string>('curiosity_gap');
  const [ctaPreset, setCtaPreset] = useState<string>('Keranjang Kuning + Diskon Terbatas');
  const [showAdvancedConversion, setShowAdvancedConversion] = useState<boolean>(true);

  // Dynamic AI recommendation based on current category
  const recommendedCameraInfo = getRecommendedCameraStyle(category);
  const matchedCameraPreset = CAMERA_STYLE_OPTIONS.find(
    (s) => s.name.toLowerCase() === recommendedCameraInfo.styleName.toLowerCase()
  ) || CAMERA_STYLE_OPTIONS[0];

  const handleProductPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
      if (compressedDataUrl) {
        setProductImage(compressedDataUrl);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProductImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

    setIsDetecting(true);
    setDetectStep('🔍 Menganalisis link & keterangan...');
    setDetectError(null);
    setDetectSuccess(null);

    // Fast progressive status updates for snappy feedback
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
      if (detected.tone) setTone(detected.tone);
      if (detected.targetPlatform) setTargetPlatform(detected.targetPlatform);
      if (detected.targetDuration) setTargetDuration(detected.targetDuration);
      if (detected.cameraStyle) {
        setCameraStyle(detected.cameraStyle);
        if (detected.cameraStyleReason) {
          setAiCameraReason(detected.cameraStyleReason);
        }
      }
      if (detected.visualFraming) {
        setVisualFraming(detected.visualFraming as VisualFramingType);
      }
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
        const resolvedCameraStyle = detected.cameraStyle || cameraStyle;
        const resolvedVisualFraming = (detected.visualFraming as VisualFramingType) || visualFraming;

        await onGenerate({
          category: resolvedCategory,
          productName: detected.productName.trim(),
          productDescription: (detected.productDescription || '').trim(),
          targetAudience: (detected.targetAudience || '').trim(),
          keySellingPoints: (detected.keySellingPoints || '').trim(),
          tone: detected.tone || tone,
          cameraStyle: resolvedCameraStyle,
          visualFraming: resolvedVisualFraming,
          marketingFramework,
          hookStrategy,
          ctaPreset,
          targetDuration: detected.targetDuration || targetDuration,
          targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
          targetPlatform: detected.targetPlatform || targetPlatform,
          language,
          productImage,
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

    // If user entered text in smartInput but hasn't run auto-detect yet, run auto-detect & generate
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

    const effectiveCameraStyle = isCustomCamera && customCameraStyle.trim()
      ? customCameraStyle.trim()
      : cameraStyle;

    await onGenerate({
      category,
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      keySellingPoints: keySellingPoints.trim(),
      tone,
      cameraStyle: effectiveCameraStyle,
      visualFraming,
      marketingFramework,
      hookStrategy,
      ctaPreset,
      targetDuration,
      targetSceneCount: targetSceneCount > 0 ? targetSceneCount : undefined,
      targetPlatform,
      language,
      productImage,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1f2a42] flex items-center justify-between bg-gradient-to-r from-[#141b2e] via-[#111728] to-[#101625]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI UGC Storyboard Generator</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-bold">
                  Gemini Flash AI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fitur Auto-Detect pintar dari Link & Keterangan untuk skrip video UGC viral otomatis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating || isDetecting}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {/* AUTO DETECT CARD SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#182038] to-[#121829] border border-purple-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600/30 border border-purple-400/40 text-purple-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Otomatisasi Auto-Detect AI (1 Input)</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-700/50 font-bold">
                      ALL-IN-ONE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tempel link produk (TikTok Shop, Shopee, Tokopedia, Web) dan/atau tulis keterangan produk sekaligus di sini.
                  </p>
                </div>
              </div>

              <button
                type="button"
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
                  rows={3}
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  placeholder="Contoh: https://vt.tiktok.com/ZS2mSkincare/ Serum pencerah bekas jerawat 10% niacinamide, hasil 7 hari aman jerawat, ada diskon 50%..."
                  className="w-full bg-[#0d121f] border border-[#263352] focus:border-purple-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition-all shadow-inner"
                />
              </div>

              {/* Action Buttons for Auto-Detect */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Coba contoh:</span>
                  {sampleInputs.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSmartInput(s.content)}
                      className="text-[10px] bg-[#141c2e] hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-[#23314e] hover:border-purple-500/50 px-2 py-0.5 rounded-md transition-all truncate max-w-[170px]"
                      title={s.content}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Button 1: Auto detect & fill form */}
                  <button
                    type="button"
                    onClick={() => handleAutoDetect(false)}
                    disabled={isDetecting || isGenerating}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-900/40 transition-all disabled:opacity-50 border border-purple-400/40"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{detectStep}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Detect & Isi Form</span>
                      </>
                    )}
                  </button>

                  {/* Button 2: Auto detect & langsung generate */}
                  <button
                    type="button"
                    onClick={() => handleAutoDetect(true)}
                    disabled={isDetecting || isGenerating}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50 border border-emerald-400/30"
                    title="Analisis link & keterangan lalu langsung generate storyboard lengkap secara otomatis"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Auto-Detect & Generate 🚀</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              {detectSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 flex items-start gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-100">{detectSuccess}</div>
                    {detectTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {detectTags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detectError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{detectError}</span>
                </div>
              )}

            </div>
          </div>

          {/* MANUAL FORM SECTION */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Parameter Storyboard UGC {highlightFields && <span className="text-amber-400 font-bold animate-pulse">(Data Terisi Otomatis ✨)</span>}</span>
              </div>
            </div>

            {/* Row: Category & Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kategori Template UGC
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-sm text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                >
                  {UGC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Target
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-sm text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                >
                  <option value="TikTok Shop">TikTok Shop (Keranjang Kuning)</option>
                  <option value="Shopee Video">Shopee Video (Racun Shopee)</option>
                  <option value="Instagram Reels">Instagram Reels / Ads</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                </select>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Produk / Layanan <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Sago Green Coffee, Serum Pencerah, Smart Lamp"
                className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-sm text-slate-100 outline-none font-medium transition-all ${
                  highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                }`}
              />
            </div>

            {/* Referensi Foto Produk untuk Video Preview & Scene */}
            <div className="p-3.5 rounded-xl bg-[#141b2c] border border-[#23304d] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Referensi Foto Produk (Untuk Video Export MP4 & Adegan)
                  </span>
                </div>
                {productImage && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full font-bold">
                    ✓ Foto Terpasang
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {productImage ? (
                  <div className="relative group shrink-0">
                    <img
                      src={productImage}
                      alt="Referensi Produk"
                      className="w-16 h-16 object-cover rounded-xl border border-purple-500/50 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setProductImage(undefined)}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition-all"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#0e1422] border border-dashed border-[#293652] flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px]">Pilih Foto</span>
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Unggah foto produk nyata (JPG/PNG). Foto ini akan digunakan oleh FFmpeg untuk merender visual video preview dan kartu adegan.
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 bg-[#1a2338] hover:bg-[#232f4a] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#2b3a59] cursor-pointer transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>{productImage ? 'Ganti Foto' : 'Upload Foto Produk'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductPhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {!productImage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProductImage('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80')}
                          className="text-[10px] bg-[#1a2338] hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-[#273552] px-2 py-1 rounded-md transition-all"
                        >
                          + Contoh Serum
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductImage('https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80')}
                          className="text-[10px] bg-[#1a2338] hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-[#273552] px-2 py-1 rounded-md transition-all"
                        >
                          + Contoh Kopi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description & USP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Jelaskan produk secara singkat..."
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Poin Penjualan Utama (USP / Keunggulan)
                </label>
                <textarea
                  rows={2}
                  value={keySellingPoints}
                  onChange={(e) => setKeySellingPoints(e.target.value)}
                  placeholder="e.g. Hasil cepat, diskon 50%, BPOM, aman..."
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                />
              </div>
            </div>

            {/* Row: Target Audience & Tone */}
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full bg-[#141b2b] border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all ${
                    highlightFields ? 'border-purple-400 bg-purple-950/30' : 'border-[#23304d] focus:border-purple-500'
                  }`}
                >
                  <option value="Santai, Relatable & Meyakinkan">Santai, Relatable & Meyakinkan (Best for TikTok Shop)</option>
                  <option value="Curhat Storytelling ('Jujur awalnya aku skeptis...')">Curhat Storytelling ('Jujur awalnya aku skeptis...')</option>
                  <option value="Hype, Heboh & Excited (High Energy Flash Sale)">Hype, Heboh & Excited (High Energy Flash Sale)</option>
                  <option value="Drama Komedi & Sketsa Lucu (Problem Solving Konyol)">Drama Komedi & Sketsa Lucu (Problem Solving Konyol)</option>
                  <option value="Review Edukatif & Bedah Kandungan (Kredibel Objektif)">Review Edukatif & Bedah Kandungan (Kredibel Objektif)</option>
                  <option value="ASMR Bisik & Estetik (Satisfying Whisper)">ASMR Bisik & Estetik (Satisfying Whisper)</option>
                  <option value="Tips & Trik Cepat Sat-Set (Solusi 3 Langkah)">Tips & Trik Cepat Sat-Set (Solusi 3 Langkah)</option>
                  <option value="Soft Selling ala Daily Vlog & GRWM">Soft Selling ala Daily Vlog & GRWM</option>
                </select>
              </div>
            </div>

            {/* Opsi Visual Framing & Sudut Pandang (UGC Framing & Anti-AI Mandate) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-[#141b2e] to-[#0e1424] border border-[#233554] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/90 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Opsi Visual Framing & Sudut Pandang
                      </span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-600/50 px-2 py-0.2 rounded-full font-bold">
                        Fokus Visual Kreator
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tentukan fokus kamera dan kehadiran talent pada storyboard UGC Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Konsistensi Google Flow & Anti-AI
                  </span>
                </div>
              </div>

              {/* 4 Interactive Framing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VISUAL_FRAMING_OPTIONS.map((opt) => {
                  const isSelected = visualFraming === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setVisualFraming(opt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-400 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400/50'
                          : 'bg-[#101728] border-[#1e2a44] hover:border-indigo-500/50 hover:bg-[#141d33]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{opt.icon}</span>
                            <span className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                              {opt.name}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap border ${
                            isSelected
                              ? 'bg-indigo-900/80 text-indigo-200 border-indigo-700/60'
                              : 'bg-[#18233a] text-slate-400 border-[#263554]'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#1b2742] flex items-center justify-between">
                        <span className="text-[9.5px] text-indigo-300/80 italic line-clamp-1">
                          {opt.id === 'hands_pov' && '🖐️ 100% Faceless creator'}
                          {opt.id === 'face_closeup' && '👤 Mikro-ekspresi & kontak mata riil'}
                          {opt.id === 'full_body' && '🧍 Gerak dinamis 9:16 vertikal'}
                          {opt.id === 'mix_framing' && '🔀 Alur proporsional Hook s/d CTA'}
                        </span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-600 text-white'
                            : 'border-slate-600 bg-transparent'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Anti-AI Realism & Google Flow System Lock Notice */}
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-[11px] text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300">
                    Sistem Terkunci: Konsistensi Produk Google Flow & Anti-AI Realism
                  </div>
                  <p className="text-slate-300 text-[10.5px] leading-relaxed">
                    AI mewajibkan deskripsi visual kemasan, warna, logo, dan tekstur produk selalu identik antar adegan untuk referensi Google Flow. Menolak estetika CGI, kartun, filter robotik artifisial, atau gerakan sintetis.
                  </p>
                </div>
              </div>
            </div>

            {/* Style Kamera & Sinematografi UGC (AI Recommendation + Manual Selection) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-[#131a2c] to-[#0e1422] border border-[#23304d] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-600/40 flex items-center justify-center text-purple-300">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Style Kamera & Sinematografi
                      </span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/50 px-2 py-0.2 rounded-full font-bold">
                        AI Recommended / Manual
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tentukan gaya pergerakan kamera dan framing visual sebelum generate storyboard.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomCamera(!isCustomCamera)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all self-start sm:self-center ${
                    isCustomCamera
                      ? 'bg-purple-900/50 text-purple-200 border-purple-500'
                      : 'bg-[#182133] text-slate-300 border-[#2b3a58] hover:bg-[#222e48]'
                  }`}
                >
                  {isCustomCamera ? '← Pilih dari Opsi Preset' : '✍️ Tulis Style Custom'}
                </button>
              </div>

              {/* AI Recommendation Spotlight Banner */}
              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-300">
                        Rekomendasi AI untuk {category}:
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {recommendedCameraInfo.styleName}
                      </span>
                      <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 py-0.2 rounded">
                        {matchedCameraPreset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {aiCameraReason || recommendedCameraInfo.reason || matchedCameraPreset.description}
                    </p>
                  </div>
                </div>

                {!isCustomCamera && cameraStyle !== recommendedCameraInfo.styleName && (
                  <button
                    type="button"
                    onClick={() => {
                      setCameraStyle(recommendedCameraInfo.styleName);
                    }}
                    className="shrink-0 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Terapkan Rekomendasi</span>
                  </button>
                )}
                {!isCustomCamera && cameraStyle === recommendedCameraInfo.styleName && (
                  <span className="shrink-0 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-600/50 px-2.5 py-1 rounded-md flex items-center gap-1 self-start sm:self-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Rekomendasi Aktif</span>
                  </span>
                )}
              </div>

              {/* Custom Camera Input Mode */}
              {isCustomCamera ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[11px] font-semibold text-purple-300">
                    Instruksi Khusus Gaya Kamera & Sinematografi:
                  </label>
                  <input
                    type="text"
                    value={customCameraStyle}
                    onChange={(e) => setCustomCameraStyle(e.target.value)}
                    placeholder="Contoh: Macro extreme close-up tekstur produk + 360 rotation table + snap zoom saat hook"
                    className="w-full bg-[#141b2b] border border-purple-500/50 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    AI akan menginstruksikan seluruh adegan storyboard agar bergerak sesuai gaya kamera kustom yang Anda masukkan.
                  </p>
                </div>
              ) : (
                /* Preset Grid of Camera Styles */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {CAMERA_STYLE_OPTIONS.map((style) => {
                    const isSelected = cameraStyle === style.name;
                    const isRecommended = recommendedCameraInfo.styleName.toLowerCase() === style.name.toLowerCase();
                    return (
                      <div
                        key={style.id}
                        onClick={() => setCameraStyle(style.name)}
                        className={`cursor-pointer p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between relative group ${
                          isSelected
                            ? 'bg-purple-950/70 border-purple-400 shadow-md shadow-purple-950/50'
                            : 'bg-[#121828] border-[#222e47] hover:border-purple-500/50 hover:bg-[#161e32]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-800/40 line-clamp-1">
                              {style.badge}
                            </span>
                            {isRecommended && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-1 py-0.2 rounded shrink-0">
                                ★ Rekomendasi
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                            {style.name}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {style.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-[#1b253b] flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 line-clamp-1">
                            {style.bestFor}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-purple-400 bg-purple-600 text-white'
                              : 'border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formula Pemasaran & Optimasi Konversi (Klik Pembeli & Anti-Anomali) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-[#131b2e] to-[#0d1322] border border-[#233352] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Formula Pemasaran & Konversi Klik (CTR)
                      </span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/50 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                        <ShoppingBag className="w-2.5 h-2.5" /> High Conversion
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Rancang alur psikologi pembeli dari hook 3 detik hingga ajakan klik keranjang kuning.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="text-[10px] bg-sky-950/90 text-sky-300 border border-sky-600/50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" /> Bebas Gerakan Anomali
                  </span>
                </div>
              </div>

              {/* 1. Marketing Framework Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Formula Alur Penjualan (Framework)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {MARKETING_FRAMEWORKS.map((fw) => {
                    const isSelected = marketingFramework === fw.id;
                    return (
                      <div
                        key={fw.id}
                        onClick={() => setMarketingFramework(fw.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                            : 'bg-[#101726] border-[#1f2b45] hover:border-[#2f4066]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white line-clamp-1">{fw.name}</span>
                            <span className="text-[9px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                              {fw.badge}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 line-clamp-2 leading-relaxed">
                            {fw.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-[#1b253b] flex items-center justify-between text-[9.5px]">
                          <span className="text-amber-300/90 font-medium line-clamp-1">
                            💡 {fw.psychologyTrigger}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-600 text-white'
                              : 'border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Hook 3 Detik & CTA Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Hook Strategy */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    2. Tipe Hook Pembuka (Stop-Scrolling)
                  </label>
                  <select
                    value={hookStrategy}
                    onChange={(e) => setHookStrategy(e.target.value)}
                    className="w-full bg-[#101726] border border-[#1f2b45] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                  >
                    {HOOK_STRATEGY_OPTIONS.map((hk) => (
                      <option key={hk.id} value={hk.id}>
                        {hk.name} ({hk.badge})
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const currentHook = HOOK_STRATEGY_OPTIONS.find((h) => h.id === hookStrategy);
                    return currentHook ? (
                      <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-1">
                        Contoh: "{currentHook.example}"
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Call to Action (CTA) Preset */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    3. Target Call to Action (CTA) Penutup
                  </label>
                  <select
                    value={ctaPreset}
                    onChange={(e) => setCtaPreset(e.target.value)}
                    className="w-full bg-[#101726] border border-[#1f2b45] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                  >
                    {CTA_PRESETS.map((cta, idx) => (
                      <option key={idx} value={cta.label}>
                        {cta.label}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const currentCta = CTA_PRESETS.find((c) => c.label === ctaPreset);
                    return currentCta ? (
                      <p className="text-[10px] text-emerald-400 mt-1 font-mono line-clamp-1">
                        Popup: {currentCta.popupText}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Row: Target Duration & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target Durasi Video
                  </label>
                  <span className="text-[11px] font-bold text-purple-400 font-mono">
                    {targetDuration} Detik (Mulai 10s)
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bahasa Naskah
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      language === 'id'
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#141b2b] text-slate-400 border-[#23304d]'
                    }`}
                  >
                    🇮🇩 Bahasa Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      language === 'en'
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#141b2b] text-slate-400 border-[#23304d]'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>
            </div>

            {/* Scene Density Selector: Up to 9 scenes even for 10s */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Jumlah Adegan Storyboard
                  </label>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Hingga 9 Adegan Fast-Cut (Bisa 10s)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-purple-400 font-mono">
                  {targetSceneCount === 0 ? 'Otomatis (5-6 Adegan Kaya)' : `${targetSceneCount} Adegan`}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetSceneCount(0)}
                  className={`col-span-2 py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                    targetSceneCount === 0
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                      : 'bg-[#141b2b] text-slate-400 border-[#23304d] hover:bg-[#1a2338]'
                  }`}
                >
                  ⚡ Auto
                </button>
                {[3, 4, 5, 6, 7, 8, 9].map((count) => (
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
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 <strong className="text-slate-300">Pacing Dinamis:</strong> Pilih 9 adegan untuk micro-pacing fast-cut 1 detik per adegan pada video pendek 10 detik!
              </p>
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

