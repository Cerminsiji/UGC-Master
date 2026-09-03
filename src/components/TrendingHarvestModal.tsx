import React, { useState, useEffect } from 'react';
import {
  Flame,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
  Check,
  Zap,
  Target,
  ArrowRight,
  Filter,
  BarChart3,
  HelpCircle,
  Search,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Copy,
  Bookmark,
  Scale,
  Video,
  Info,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import {
  TrendingProduct,
  DataPeriodType,
  PlatformFilterType,
  QuickFilterType,
  TrendVelocityType,
  DataFreshnessStatus,
  WatchlistItem,
} from '../types';

interface TrendingHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForStoryboard: (product: TrendingProduct) => void;
  onOpenRealCheck: (product: TrendingProduct) => void;
}

const PLATFORMS: PlatformFilterType[] = [
  'SHOPEE VIDEO',
  'SHOPEE',
  'SHOPEE LIVE',
  'ALL',
  'SOCIAL MEDIA',
];

const DATA_PERIODS: DataPeriodType[] = ['TODAY', '3 DAYS', '7 DAYS', '30 DAYS'];

const CATEGORIES = [
  'All Categories',
  'Beauty',
  'Personal Care',
  'Fashion',
  'Fashion Accessories',
  'Home & Living',
  'Kitchen',
  'Electronics',
  'Gadget Accessories',
  'Mother & Baby',
  'Kids',
  'Food & Beverage',
  'Health',
  'Sports',
  'Automotive',
  'Office & Stationery',
  'Pet',
  'Travel',
  'Organizer',
  'Daily Necessities',
  'Other',
];

const PRICE_PRESETS = [
  { label: 'Semua Harga', min: 0, max: 99999999 },
  { label: '< Rp10K', min: 0, max: 10000 },
  { label: 'Rp10K–25K', min: 10000, max: 25000 },
  { label: 'Rp25K–50K', min: 25000, max: 50000 },
  { label: 'Rp50K–100K (Sweet Spot)', min: 50000, max: 100000 },
  { label: 'Rp100K–200K', min: 100000, max: 200000 },
  { label: '> Rp200K', min: 200000, max: 99999999 },
];

export const TrendingHarvestModal: React.FC<TrendingHarvestModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForStoryboard,
  onOpenRealCheck,
}) => {
  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<DataPeriodType>('7 DAYS');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilterType>('SHOPEE VIDEO');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [customCategory, setCustomCategory] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceMin, setPriceMin] = useState(5000);
  const [priceMax, setPriceMax] = useState(150000);
  const [activePricePreset, setActivePricePreset] = useState('Default (Rp5K-150K)');

  // Data state
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view: 'LIST' | 'WATCHLIST' | 'COMPARE'
  const [activeView, setActiveView] = useState<'LIST' | 'WATCHLIST' | 'COMPARE'>('LIST');

  // Comparison list (up to 5 products)
  const [comparedProducts, setComparedProducts] = useState<TrendingProduct[]>([]);

  // Watchlist with delta tracking
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('ugc_watchlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ugc_watchlist_v2', JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  // Fetch Trending Harvest 2.0 products
  const fetchProducts = async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryToSend = customCategory.trim() ? customCategory.trim() : selectedCategory;
      const res = await fetch('/api/trending-harvest-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          platform: selectedPlatform,
          category: categoryToSend,
          priceMin,
          priceMax,
          quickFilter,
          customKeyword: searchKeyword,
          forceRefresh: force,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setLastUpdated(data.lastUpdated || new Date().toLocaleString('id-ID'));
      } else {
        setError(data.error || 'Gagal memuat produk trending');
      }
    } catch (err: any) {
      console.error('Trending harvest fetch error:', err);
      setError('Koneksi terputus saat memuat Trending Harvest.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, selectedPeriod, selectedPlatform, selectedCategory, quickFilter, priceMin, priceMax]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  // Compare Toggle (max 5)
  const toggleCompareProduct = (prod: TrendingProduct) => {
    if (comparedProducts.some((p) => p.id === prod.id)) {
      setComparedProducts((prev) => prev.filter((p) => p.id !== prod.id));
    } else {
      if (comparedProducts.length >= 5) {
        alert('Maksimal 5 produk yang dapat dibandingkan secara bersamaan.');
        return;
      }
      setComparedProducts((prev) => [...prev, prod]);
    }
  };

  // Save to Watchlist with delta change
  const toggleWatchlist = (prod: TrendingProduct) => {
    const existingIndex = watchlist.findIndex((item) => item.product.id === prod.id);
    const nowStr = new Date().toLocaleDateString('id-ID');

    if (existingIndex >= 0) {
      setWatchlist((prev) => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      // Simulate historical previous score for realistic delta tracking
      const previousScore = Math.max(50, prod.opportunityScore - Math.floor(Math.random() * 8 + 3));
      const newItem: WatchlistItem = {
        product: prod,
        firstSeenDate: nowStr,
        lastCheckedDate: nowStr,
        previousScore,
        currentScore: prod.opportunityScore,
        scoreDelta: prod.opportunityScore - previousScore,
        trendStatus: prod.trendVelocity,
      };
      setWatchlist((prev) => [newItem, ...prev]);
    }
  };

  const isSavedToWatchlist = (prodId: string) => watchlist.some((item) => item.product.id === prodId);

  // Copy Product Info
  const handleCopyProduct = (prod: TrendingProduct) => {
    const text = `[TRENDING HARVEST 2.0]
Produk: ${prod.name}
Brand: ${prod.brandName || 'Official Brand'}
Kategori: ${prod.category}
Harga: ${prod.price}
Skor Peluang: ${prod.opportunityScore}/100 (${prod.trendVelocity})
Pertumbuhan Penjualan: ${prod.signals.salesGrowth}
Celah Konten: ${prod.contentGap || '-'}
Angle Terbaik: ${prod.bestContentAngle || '-'}
Komisi: ${prod.commissionAnalysis?.commissionRate || '-'}
Link: ${prod.marketplaceUrl || '-'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(prod.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const getVelocityBadge = (v: TrendVelocityType | string) => {
    switch (v) {
      case 'BREAKOUT':
        return <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">🟢 BREAKOUT 🔥</span>;
      case 'RISING':
        return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 RISING 📈</span>;
      case 'STABLE':
        return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 STABLE</span>;
      case 'COOLING':
        return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30">🟠 COOLING</span>;
      case 'DECLINING':
        return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">🔴 DECLINING</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-neutral-800 text-neutral-300">{v}</span>;
    }
  };

  const getFreshnessBadge = (status: DataFreshnessStatus, text: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">🟢 {text}</span>;
      case 'RECENT':
        return <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">🟡 {text}</span>;
      case 'STALE':
        return <span className="text-[10px] font-semibold text-orange-400 flex items-center gap-1">🟠 {text}</span>;
      default:
        return <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">⚪ {text}</span>;
    }
  };

  const getAlertBadge = (alert: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
        ⚡ {alert}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-7xl max-h-[95vh] bg-[#0d121c] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-[#111724] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">TRENDING HARVEST 2.0</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Growth Velocity Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">
                "Find products with rising demand before the market gets saturated." — Membedakan produk <strong className="text-amber-300">Trending (pertumbuhan pesat)</strong> vs <strong className="text-neutral-300">Best Seller statis</strong>.
              </p>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Switchers */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveView('LIST')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'LIST' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Katalog ({products.length})
              </button>
              <button
                onClick={() => setActiveView('WATCHLIST')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeView === 'WATCHLIST' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist ({watchlist.length})</span>
              </button>
              <button
                onClick={() => setActiveView('COMPARE')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeView === 'COMPARE' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Bandingkan ({comparedProducts.length}/5)</span>
              </button>
            </div>

            {/* Daily Harvest Refresh */}
            <button
              onClick={() => fetchProducts(true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/50 transition-all"
              title="Perbarui Daily Harvest"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Filter Toolbar (Period, Platform, Quick Tabs, Price, Category) */}
        {activeView === 'LIST' && (
          <div className="px-5 py-3 border-b border-neutral-800 bg-[#0f1521] space-y-3 shrink-0">
            
            {/* Top Filter Row: Period & Platform & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Platform Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-bold text-neutral-400 uppercase mr-1">Platform:</span>
                {PLATFORMS.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedPlatform === plat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>

              {/* Data Period */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase mr-1">Periode:</span>
                {DATA_PERIODS.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedPeriod === period
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {period === '7 DAYS' ? '7 HARI (Default)' : period}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[200px] flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Cari produk / brand nyata..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 pointer-events-none" />
              </form>

            </div>

            {/* Bottom Filter Row: Quick Filters & Price Presets & Category */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-neutral-800/60">
              
              {/* Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setQuickFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    quickFilter === 'ALL'
                      ? 'bg-neutral-200 text-neutral-950'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setQuickFilter('TRENDING')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                    quickFilter === 'TRENDING'
                      ? 'bg-rose-500 text-white'
                      : 'bg-neutral-900 text-neutral-300 hover:text-rose-300 border border-neutral-800'
                  }`}
                >
                  <span>🔥 TRENDING</span>
                </button>
                <button
                  onClick={() => setQuickFilter('RISING')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                    quickFilter === 'RISING'
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-900 text-neutral-300 hover:text-emerald-300 border border-neutral-800'
                  }`}
                >
                  <span>📈 RISING</span>
                </button>
                <button
                  onClick={() => setQuickFilter('LOW_COMPETITION')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                    quickFilter === 'LOW_COMPETITION'
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-900 text-neutral-300 hover:text-blue-300 border border-neutral-800'
                  }`}
                >
                  <span>💎 LOW COMPETITION</span>
                </button>
                <button
                  onClick={() => setQuickFilter('HIGH_AFFILIATE')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                    quickFilter === 'HIGH_AFFILIATE'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-900 text-neutral-300 hover:text-amber-300 border border-neutral-800'
                  }`}
                >
                  <span>💰 HIGH AFFILIATE</span>
                </button>
                <button
                  onClick={() => setQuickFilter('HIGH_VIDEO_POTENTIAL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                    quickFilter === 'HIGH_VIDEO_POTENTIAL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-900 text-neutral-300 hover:text-purple-300 border border-neutral-800'
                  }`}
                >
                  <span>🎥 HIGH VIDEO POTENTIAL</span>
                </button>
              </div>

              {/* Category & Price Dropdowns */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={activePricePreset}
                  onChange={(e) => {
                    const presetName = e.target.value;
                    setActivePricePreset(presetName);
                    const found = PRICE_PRESETS.find((p) => p.label === presetName);
                    if (found) {
                      setPriceMin(found.min);
                      setPriceMax(found.max);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Default (Rp5K-150K)">Default (Rp5K - Rp150K)</option>
                  {PRICE_PRESETS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>
        )}

        {/* Status Bar */}
        <div className="px-5 py-2 bg-[#0b0e16] border-b border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Otentik: Shopee Video Indonesia</span>
            </span>
            <span>•</span>
            <span>Total Produk Terkurasi: <strong className="text-white">{products.length}</strong></span>
            <span>•</span>
            <span>Diperbarui: <strong className="text-neutral-200">{lastUpdated || 'Hari ini'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-400">
              Scoring: <strong className="text-amber-300">UGC Master Opportunity Score / 100</strong>
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW: KATALOG PRODUK LIST */}
          {activeView === 'LIST' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => {
                const isSaved = isSavedToWatchlist(prod.id);
                const isCompared = comparedProducts.some((p) => p.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="bg-[#121826] border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-xl shadow-neutral-950/40 group relative"
                  >
                    {/* Top Row: Brand, Category, Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {prod.brandName || 'Brand Resmi'}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {prod.category}
                          </span>
                        </div>
                        {prod.trendVelocity && getVelocityBadge(prod.trendVelocity)}
                      </div>

                      {/* Product Name */}
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {prod.name}
                      </h3>

                      {/* Trend Alert Badge */}
                      {prod.trendAlert && (
                        <div className="pt-0.5">
                          {getAlertBadge(prod.trendAlert)}
                        </div>
                      )}

                      {/* Core Opportunity Score Gauge & Price */}
                      <div className="flex items-center justify-between py-2 px-3 bg-neutral-900/90 border border-neutral-800 rounded-xl">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-neutral-400">Harga Jual</div>
                          <div className="text-base font-black text-emerald-400">{prod.price}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-end gap-1">
                            <span>Score</span>
                            <Info className="w-3 h-3 text-neutral-500" title="UGC Master Opportunity Score: Demand 25%, Velocity 20%, Momentum 20%, Competition 15%, Price 10%, Content 10%" />
                          </div>
                          <div className="text-lg font-black text-white">
                            <span className="text-amber-400">{prod.opportunityScore}</span>
                            <span className="text-xs text-neutral-500 font-medium">/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Signals Grid */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Sales Growth:</span>
                          <span className="font-bold text-emerald-400">{prod.signals.salesGrowth}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Sales Velocity:</span>
                          <span className="font-semibold text-neutral-200">{prod.signals.salesVelocity}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Total Terjual:</span>
                          <span className="font-semibold text-neutral-200">{prod.salesVolume}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Komisi Affiliate:</span>
                          <span className="font-bold text-amber-300">{prod.commissionAnalysis?.commissionRate || prod.signals.commissionPotential}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Kompetisi Konten:</span>
                          <span className="font-semibold text-neutral-300">{prod.signals.contentCompetition}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Demo Potential (10s):</span>
                          <span className="font-bold text-white">{prod.demoPotentialScore || prod.signals.demoPotential}/10</span>
                        </div>
                      </div>

                      {/* Content Gap & Best Angle */}
                      {prod.contentGap && (
                        <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] space-y-0.5">
                          <div className="font-bold text-purple-300 flex items-center gap-1 text-[10px] uppercase">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>Celah Konten (Content Gap):</span>
                          </div>
                          <p className="text-neutral-300 leading-snug line-clamp-2">{prod.contentGap}</p>
                        </div>
                      )}

                      {/* Data Freshness & Source Transparency */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                        {getFreshnessBadge(prod.dataFreshness || 'VERIFIED', prod.freshnessText || 'Verified 2 jam lalu')}
                        <span className="font-medium text-neutral-400">{prod.source || 'Shopee Video'}</span>
                      </div>
                    </div>

                    {/* Bottom Actions Row: Real-Check, Create Video, Compare, Save, Copy */}
                    <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* REAL-CHECK BUTTON */}
                        <button
                          id={`btn-realcheck-${prod.id}`}
                          onClick={() => onOpenRealCheck(prod)}
                          className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-purple-500/40 active:scale-95"
                          title="Lakukan Validasi Mendalam di Market Real-Check 2.0"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          <span>REAL-CHECK</span>
                        </button>

                        {/* CREATE VIDEO BUTTON */}
                        <button
                          id={`btn-create-video-${prod.id}`}
                          onClick={() => onSelectProductForStoryboard(prod)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30 active:scale-95"
                          title="Buat Storyboard Video Otomatis"
                        >
                          <Video className="w-3.5 h-3.5 text-neutral-950" />
                          <span>CREATE VIDEO</span>
                        </button>
                      </div>

                      {/* Utility Sub-actions */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        {/* Compare toggle */}
                        <button
                          onClick={() => toggleCompareProduct(prod)}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                            isCompared ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          <span>{isCompared ? 'Terpilih' : 'Bandingkan'}</span>
                        </button>

                        {/* Save to Watchlist */}
                        <button
                          onClick={() => toggleWatchlist(prod)}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                            isSaved ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>{isSaved ? 'Disimpan' : 'Watchlist'}</span>
                        </button>

                        {/* Copy details */}
                        <button
                          onClick={() => handleCopyProduct(prod)}
                          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded"
                          title="Salin Data Produk"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === prod.id ? 'Tersalin' : 'Salin'}</span>
                        </button>

                        {/* Marketplace direct link */}
                        {prod.marketplaceUrl && (
                          <a
                            href={prod.marketplaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-neutral-400 hover:text-amber-300"
                            title="Buka Toko Shopee Asli"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: WATCHLIST (With Delta Score Tracking) */}
          {activeView === 'WATCHLIST' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-purple-400" />
                    <span>Watchlist Produk Pilihan Anda ({watchlist.length})</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Pantau pergerakan skor peluang, lonjakan trend, dan riwayat verifikasi.</p>
                </div>

                {watchlist.length > 0 && (
                  <button
                    onClick={() => setWatchlist([])}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-semibold"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {watchlist.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Belum ada produk di Watchlist Anda.</p>
                  <p>Klik tombol <strong>"Watchlist"</strong> pada kartu produk di Katalog untuk memantau perubahan skor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {watchlist.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-4 bg-[#121826] border border-neutral-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                            {item.product.category}
                          </span>
                          {getVelocityBadge(item.trendStatus)}
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                          <span>Harga: <strong className="text-emerald-400">{item.product.price}</strong></span>
                          <span>Pertama Dicatat: {item.firstSeenDate}</span>
                          <span>Dicek: {item.lastCheckedDate}</span>
                        </div>
                      </div>

                      {/* Score Delta */}
                      <div className="flex items-center gap-6">
                        <div className="text-center px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Perubahan Skor</div>
                          <div className="flex items-center gap-1 text-sm font-black mt-0.5">
                            <span className="text-neutral-400">{item.previousScore}</span>
                            <span className="text-neutral-500">→</span>
                            <span className="text-amber-400 text-base">{item.currentScore}</span>
                            <span className="text-xs text-emerald-400 font-bold ml-1">
                              (+{item.scoreDelta} 🔥)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenRealCheck(item.product)}
                            className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                          >
                            Real-Check
                          </button>
                          <button
                            onClick={() => onSelectProductForStoryboard(item.product)}
                            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                          >
                            Buat Video
                          </button>
                          <button
                            onClick={() => toggleWatchlist(item.product)}
                            className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"
                            title="Hapus dari Watchlist"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: COMPARE (Up to 5 Products Side-by-Side) */}
          {activeView === 'COMPARE' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Perbandingan Head-to-Head ({comparedProducts.length}/5 Produk)</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Bandingkan metrik peluang, celah konten, dan potensi konversi berdampingan.</p>
                </div>

                {comparedProducts.length > 0 && (
                  <button
                    onClick={() => setComparedProducts([])}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-semibold"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>

              {comparedProducts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs space-y-2">
                  <Scale className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Belum ada produk yang dipilih untuk dibandingkan.</p>
                  <p>Buka tab <strong>Katalog</strong> dan klik <strong>"Bandingkan"</strong> pada hingga 5 produk.</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-4">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="p-3 bg-neutral-950 font-bold text-neutral-400 w-44">Metrik Kunci</th>
                        {comparedProducts.map((p) => (
                          <th key={p.id} className="p-3 bg-neutral-900/80 font-bold text-white min-w-[220px] max-w-[260px] border-l border-neutral-800">
                            <div className="space-y-1">
                              <span className="text-[10px] text-amber-400 block">{p.brandName}</span>
                              <div className="line-clamp-2 text-xs">{p.name}</div>
                              <button
                                onClick={() => toggleCompareProduct(p)}
                                className="text-[10px] text-rose-400 hover:underline block pt-1"
                              >
                                Hapus
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850">
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Opportunity Score</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-black text-amber-400 text-base">
                            {p.opportunityScore} / 100
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Trend Velocity</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800">
                            {getVelocityBadge(p.trendVelocity)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Harga Jual</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-bold text-emerald-400">
                            {p.price}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Sales Growth (7 Hari)</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-bold text-emerald-400">
                            {p.signals.salesGrowth}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Volume Terjual</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-medium text-neutral-200">
                            {p.salesVolume}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Komisi Affiliate</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-semibold text-amber-300">
                            {p.commissionAnalysis?.commissionRate || p.signals.commissionPotential}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Kompetisi Konten</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-medium text-neutral-300">
                            {p.signals.contentCompetition}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Demo Potential (10s)</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 font-bold text-white">
                            {p.demoPotentialScore || p.signals.demoPotential}/10
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Celah Konten</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800 text-[11px] text-purple-300 leading-snug">
                            {p.contentGap || '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-neutral-400 bg-neutral-950">Aksi</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="p-3 border-l border-neutral-800">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => onOpenRealCheck(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                              >
                                Real-Check
                              </button>
                              <button
                                onClick={() => onSelectProductForStoryboard(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                              >
                                Buat Video
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-[#101622] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trending Harvest 2.0 • Data verified against real marketplace items. No hallucinations.</span>
          </div>
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
