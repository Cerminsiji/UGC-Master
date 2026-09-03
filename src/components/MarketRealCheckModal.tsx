import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Video,
  Target,
  ArrowRight,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Percent,
  Layers,
  BarChart2,
  Info,
  RefreshCw,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { TrendingProduct, MarketRealCheckResult, RealCheckVerdict } from '../types';

interface MarketRealCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct: TrendingProduct | null;
  onSelectForStoryboard: (params: {
    productName: string;
    category: string;
    buyerProblem: string;
    buyerIntent: string;
    bestHook: string;
    bestCreativeAngle: string;
    mainSellingPoint: string;
    contentGap: string;
    targetAudience: string;
    recommendedCategory?: string;
  }) => void;
}

type InputType = 'NAME' | 'URL' | 'IMAGE' | 'MANUAL';

export const MarketRealCheckModal: React.FC<MarketRealCheckModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onSelectForStoryboard,
}) => {
  const [inputType, setInputType] = useState<InputType>('NAME');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [priceInput, setPriceInput] = useState('');
  const [salesInput, setSalesInput] = useState('');
  const [manualUSP, setManualUSP] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketRealCheckResult | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial product if passed from Trending Harvest
  useEffect(() => {
    if (initialProduct && isOpen) {
      setProductName(initialProduct.name);
      setCategory(initialProduct.category || 'Beauty');
      setPriceInput(initialProduct.price || '');
      setSalesInput(initialProduct.salesVolume || '');
      setProductUrl(initialProduct.marketplaceUrl || '');
      runRealCheck(initialProduct.name, initialProduct.marketplaceUrl, initialProduct.category, initialProduct.price);
    }
  }, [initialProduct, isOpen]);

  const runRealCheck = async (nameOverride?: string, urlOverride?: string, catOverride?: string, priceOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market-real-check-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType,
          productName: nameOverride !== undefined ? nameOverride : productName,
          productUrl: urlOverride !== undefined ? urlOverride : productUrl,
          category: catOverride !== undefined ? catOverride : category,
          priceInput: priceOverride !== undefined ? priceOverride : priceInput,
          salesInput,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || 'Gagal menjalankan Market Real-Check');
      }
    } catch (err: any) {
      console.error('Real check error:', err);
      setError('Koneksi terputus saat memproses Market Real-Check.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[MARKET REAL-CHECK 2.0 REPORT]
Produk: ${result.productName}
Brand: ${result.brand} | Kategori: ${result.category}
Harga: ${result.price} | Penjualan: ${result.sales}
Rating: ${result.rating} | Seller: ${result.sellerRating}
Komisi: ${result.commission} | Komisi Xtra: ${result.commissionXtra}

SKOR KELAYAKAN (OPPORTUNITY SCORE): ${result.opportunityScore}/100
VERDICT: ${result.verdict}
STATUS REKOMENDASI: ${result.recommended}

KOMPETISI & CELAH KONTEN:
- Search Saturation: ${result.searchSaturation}
- Angle Saturation: ${result.angleSaturation}
- Celah Konten (Gap): ${result.contentGapSummary}

BUYER INTENT & VIDEO POTENTIAL:
- Buyer Intent: ${result.buyerIntent}
- Demo Potential: ${result.demoPotential}/10
- Impulse Buy: ${result.impulseBuyScore}/10

MENGAPA PRODUK INI:
${result.whyThisProduct.map((b) => `• ${b}`).join('\n')}

RESIKO UTAMA:
${result.mainRisk.map((r) => `• ${r}`).join('\n')}

REKOMENDASI HOOK:
${result.bestHooks.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

ANGLE VIDEO TERBAIK:
${result.bestVideoAngle}

IDE VIDEO 10 DETIK:
${result.tenSecondVideoIdea}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCreateVideoFromCheck = () => {
    if (!result) return;
    onSelectForStoryboard({
      productName: result.productName,
      category: result.category,
      buyerProblem: result.whyThisProduct[0] || 'Masalah umum konsumen',
      buyerIntent: result.buyerIntent,
      bestHook: result.bestHooks[0] || 'Stop scrolling kalau mau hasil nyata!',
      bestCreativeAngle: result.bestVideoAngle,
      mainSellingPoint: result.productContent || result.bestContentAngle,
      contentGap: result.contentGapSummary,
      targetAudience: `Audiens ${result.category} dengan buyer intent ${result.buyerIntent}`,
      recommendedCategory: 'Problem & Solution',
    });
    onClose();
  };

  if (!isOpen) return null;

  const quickSamples = [
    { name: 'The Originote Hyalucera Moisturizer Gel 50ml', cat: 'Beauty', price: 'Rp 42.000' },
    { name: 'Facetology Triple Care Sunscreen SPF 40 PA+++', cat: 'Beauty', price: 'Rp 75.000' },
    { name: 'Pembersih Kerak Porselen & Kloset Ampuh Anti Bau 500ml', cat: 'Daily Necessities', price: 'Rp 28.500' },
    { name: 'Kotak Organizer Make Up Akrilik Putar 360 Derajat', cat: 'Organizer', price: 'Rp 58.000' },
    { name: 'Anker Soundcore R50i True Wireless Earbuds', cat: 'Electronics', price: 'Rp 149.000' },
  ];

  const getVerdictStyle = (v: RealCheckVerdict) => {
    switch (v) {
      case '🔥 TEST NOW':
        return 'bg-gradient-to-r from-red-600 to-amber-500 text-white border-amber-300 shadow-amber-500/30';
      case '🟢 HIGH POTENTIAL':
        return 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30';
      case '🟡 WORTH TESTING':
        return 'bg-amber-500 text-neutral-950 border-amber-300 shadow-amber-500/20';
      case '🟠 WATCH':
        return 'bg-orange-600 text-white border-orange-400';
      case '🔴 SKIP':
        return 'bg-rose-900 text-rose-200 border-rose-700';
      default:
        return 'bg-neutral-800 text-neutral-200 border-neutral-700';
    }
  };

  const getSaturationBadge = (val: string) => {
    if (val === 'LOW') return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">🟢 LOW</span>;
    if (val === 'MODERATE') return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">🟡 MODERATE</span>;
    if (val === 'HIGH') return <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">🟠 HIGH</span>;
    return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">🔴 SATURATED</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c1017] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-[#101622] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">MARKET REAL-CHECK 2.0</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Deep Validation
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">
                "IS THIS PRODUCT WORTH MAKING A VIDEO FOR?" — Verifikasi kelayakan, celah konten & potensi konversi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Input Section */}
          <div className="bg-[#121927] border border-neutral-800/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            {/* Input Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setInputType('NAME')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  inputType === 'NAME'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>1. Nama Produk</span>
              </button>
              <button
                onClick={() => setInputType('URL')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  inputType === 'URL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>2. Link Shopee / URL</span>
              </button>
              <button
                onClick={() => setInputType('MANUAL')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  inputType === 'MANUAL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Data Manual Lengkap</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-neutral-500 shrink-0 font-medium">Uji Cepat Produk Nyata:</span>
              {quickSamples.map((samp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setProductName(samp.name);
                    setCategory(samp.cat);
                    setPriceInput(samp.price);
                    runRealCheck(samp.name, '', samp.cat, samp.price);
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800/70 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors shrink-0 border border-neutral-700/50"
                >
                  {samp.name.split(' ')[0]} {samp.name.split(' ')[1]} ({samp.price})
                </button>
              ))}
            </div>

            {/* Form Fields Based on Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {inputType === 'NAME' && (
                <>
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Produk / Brand Lengkap</label>
                    <input
                      type="text"
                      placeholder="Contoh: The Originote Hyalucera Moisturizer Gel 50ml"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Beauty">Beauty & Skincare</option>
                      <option value="Electronics">Electronics & Gadget</option>
                      <option value="Fashion">Fashion & OOTD</option>
                      <option value="Daily Necessities">Daily Necessities</option>
                      <option value="Organizer">Organizer & Storage</option>
                      <option value="Kitchen">Kitchen & Home</option>
                      <option value="Mother & Baby">Mother & Baby</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Kisaran Harga (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rp 45.000"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              )}

              {inputType === 'URL' && (
                <>
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Link Produk Shopee / Shopee Video</label>
                    <input
                      type="text"
                      placeholder="https://shopee.co.id/product/..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Produk (Jika URL singkat)</label>
                    <input
                      type="text"
                      placeholder="Nama produk opsional..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              )}

              {inputType === 'MANUAL' && (
                <>
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Produk</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nama produk..."
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Harga Jual</label>
                    <input
                      type="text"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="Rp 45.000"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Volume Penjualan</label>
                    <input
                      type="text"
                      value={salesInput}
                      onChange={(e) => setSalesInput(e.target.value)}
                      placeholder="Contoh: 10K+ terjual"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Hallucination: Data yang tidak terverifikasi ditandai transparan "UNVERIFIED / DATA UNAVAILABLE".
              </span>

              <button
                onClick={() => runRealCheck()}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Real-Check...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Jalankan Market Real-Check</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Verdict & Opportunity Score Big Banner */}
              <div className="bg-[#121927] border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                
                {/* Score & Verdict */}
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="relative w-24 h-24 rounded-2xl bg-neutral-900 border-2 border-purple-500/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">SKOR</span>
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{result.opportunityScore}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">/ 100</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border shadow-md ${getVerdictStyle(result.verdict)}`}>
                        {result.verdict}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        Rekomendasi: <strong className={result.recommended === 'YES' ? 'text-emerald-400' : 'text-amber-400'}>{result.recommended}</strong>
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{result.productName}</h3>
                    <p className="text-xs text-neutral-400">
                      Brand: <strong className="text-neutral-200">{result.brand}</strong> • Kategori: <strong className="text-neutral-200">{result.category}</strong>
                    </p>
                  </div>
                </div>

                {/* Direct Action Bridge */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                  <button
                    onClick={handleCopyReport}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedReport ? 'Tersalin ke Clipboard!' : 'Salin Laporan'}</span>
                  </button>

                  <button
                    onClick={handleCreateVideoFromCheck}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-neutral-950" />
                    <span>CREATE VIDEO (Storyboard)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Anti-Hallucination & Integrity Banner */}
              <div className="px-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Sumber Data:</span>
                  <span className="font-bold text-neutral-200 bg-neutral-800 px-2 py-0.5 rounded">{result.source}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${result.isAiInference ? 'bg-purple-900/40 text-purple-300 border border-purple-700' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'}`}>
                    {result.isAiInference ? 'AI INFERENCE' : 'VERIFIED REAL CATALOG'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                  <span>Confidence: <strong className="text-neutral-200">{result.confidence}</strong></span>
                  <span>•</span>
                  <span>Diperbarui: <strong className="text-neutral-200">{result.lastUpdated}</strong></span>
                </div>
              </div>

              {/* 3 Main Deep Analytics Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Column 1: Market Snapshot & Affiliate Potential */}
                <div className="bg-[#121927] border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-400 pb-2 border-b border-neutral-800">
                    <DollarSign className="w-4 h-4" />
                    <span>1. Snapshot Pasar & Komisi</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Harga Sekarang:</span>
                      <span className="font-bold text-emerald-400">{result.price}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Diskon / Harga Asli:</span>
                      <span className="font-medium text-neutral-300">{result.discount} ({result.originalPrice})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Total Terjual:</span>
                      <span className="font-bold text-white">{result.sales}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Rating & Ulasan:</span>
                      <span className="font-medium text-amber-300">⭐ {result.rating} ({result.reviewCount})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Komisi Affiliate:</span>
                      <span className="font-bold text-amber-300">{result.commission}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Komisi Xtra:</span>
                      <span className="text-emerald-400 font-semibold">{result.commissionXtra}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Kualitas Seller:</span>
                      <span className="font-medium text-neutral-200">{result.sellerRating}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Pengiriman:</span>
                      <span className="text-neutral-300 font-medium">{result.shippingInfo}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Competition Check & Content Saturation */}
                <div className="bg-[#121927] border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-400 pb-2 border-b border-neutral-800">
                    <BarChart2 className="w-4 h-4" />
                    <span>2. Kompetisi & Saturasi Video</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Search Saturation:</span>
                      {getSaturationBadge(result.searchSaturation)}
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Content Saturation:</span>
                      {getSaturationBadge(result.contentSaturation)}
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Price Competition:</span>
                      {getSaturationBadge(result.priceCompetition)}
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Video Kompetitor:</span>
                      <span className="font-semibold text-white">{result.competingVideosCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Toko Bersaing:</span>
                      <span className="font-semibold text-white">{result.competingProductsCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Trust Score:</span>
                      <span className="font-bold text-emerald-400">{result.trustScore} / 100</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Affiliate Potential:</span>
                      <span className="font-bold text-amber-300">{result.affiliatePotentialScore} / 100</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Content Gap & Video Potential */}
                <div className="bg-[#121927] border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-400 pb-2 border-b border-neutral-800">
                    <Video className="w-4 h-4" />
                    <span>3. Potensi Video & Celah Konten</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Angle Saturation:</span>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${result.angleSaturation.includes('GAP') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                        {result.angleSaturation}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Buyer Intent:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        {result.buyerIntent}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Demo Potential (10 Detik):</span>
                      <span className="font-bold text-white text-sm">{result.demoPotential} / 10</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/60">
                      <span className="text-neutral-400">Impulse Buy Score:</span>
                      <span className="font-bold text-amber-300 text-sm">{result.impulseBuyScore} / 10</span>
                    </div>
                    <div className="py-1">
                      <p className="text-[11px] text-neutral-300 leading-relaxed italic bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                        "{result.demoExplanation}"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* 8-Component Weighted Scoring Breakdown */}
              <div className="bg-[#121927] border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-300">Scoring Breakdown (8 Pilar Bobot Otentik)</span>
                  <span className="text-[11px] text-neutral-400">Total Tertimbang: <strong className="text-white">{result.opportunityScore}/100</strong></span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Trend (20%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.trendScore}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Demand (15%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.demand}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Kompetisi (15%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.competition}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Content Gap (15%)</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{result.scoringComponents.contentGap}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Video Potensial (15%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.videoPotential}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Affiliate (10%)</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{result.scoringComponents.affiliateValue}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Trust (5%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.trust}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Price Zone (5%)</div>
                    <div className="text-sm font-bold text-white mt-0.5">{result.scoringComponents.priceAffinity}</div>
                  </div>
                </div>
              </div>

              {/* Smart Recommendations Section */}
              <div className="bg-[#121927] border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-white pb-2 border-b border-neutral-800">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Rekomendasi Kreatif Strategis (Smart Creator Action)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Why this product */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MENGAPA PRODUK INI LAYAK DIBUATKAN VIDEO?</span>
                    </h4>
                    <ul className="space-y-1.5 text-neutral-300 pl-4 list-disc text-[11px] leading-relaxed">
                      {result.whyThisProduct.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Main risks */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <h4 className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>RESIKO UTAMA YANG WAJIB DIWASPADAI</span>
                    </h4>
                    <ul className="space-y-1.5 text-neutral-300 pl-4 list-disc text-[11px] leading-relaxed">
                      {result.mainRisk.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3 Viral Hooks */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                  <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>3 PILIHAN HOOK VIRAL REKOMENDASI AI:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.bestHooks.map((hook, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 italic leading-snug">
                        <span className="font-bold text-amber-400 not-italic block mb-1">Hook #{idx + 1}:</span>
                        "{hook}"
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Concept & 10s Idea */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 font-medium block text-[11px]">Angle Video Paling Menjual:</span>
                    <p className="font-bold text-white mt-1 text-xs leading-relaxed">{result.bestVideoAngle}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400 font-medium block text-[11px]">Formula Video 10 Detik Cepat Closing:</span>
                    <p className="font-medium text-amber-300 mt-1 text-[11px] leading-relaxed">{result.tenSecondVideoIdea}</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-[#101622] flex items-center justify-between shrink-0 text-xs">
          <span className="text-neutral-500 text-[11px]">Market Real-Check 2.0 • UGC Master Intelligence Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
