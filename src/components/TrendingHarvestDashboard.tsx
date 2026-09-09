import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  Zap,
  ShoppingBag,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Coins,
  Store,
  MapPin,
  Star,
  Tag,
  BarChart3,
  Percent,
  Layers,
  ArrowUpDown,
  AlertCircle,
  ExternalLink,
  Compass,
  Award,
  Video,
  Target
} from 'lucide-react';
import {
  ShopeeTrendingProduct,
  VisualFramingType,
  AIGenerateParams
} from '../types';
import {
  INITIAL_SHOPEE_TRENDING_PRODUCTS,
  SHOPEE_TRENDING_CATEGORIES,
  calculateUGCOpportunityScore
} from '../data/shopeeTrends';

interface TrendingHarvestDashboardProps {
  onGenerateStoryboardForProduct: (product: ShopeeTrendingProduct) => void;
}

export const TrendingHarvestDashboard: React.FC<TrendingHarvestDashboardProps> = ({
  onGenerateStoryboardForProduct,
}) => {
  const [products, setProducts] = useState<ShopeeTrendingProduct[]>(INITIAL_SHOPEE_TRENDING_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'blue_ocean' | 'velocity' | 'growth' | 'commission'>('blue_ocean');
  const [filterMode, setFilterMode] = useState<'all' | 'blue_ocean' | 'high_growth' | 'high_commission'>('blue_ocean');
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);
  const [lastHarvestTime, setLastHarvestTime] = useState<string>('Real-time Active');
  const [marketInsights, setMarketInsights] = useState<string>(
    'Rekomendasi Blue Ocean: Produk dengan demand pencarian tinggi tapi video kreator < 350 memiliki probabilitas viral FYP 3.8x lebih tinggi tanpa perang harga.'
  );

  // Harvest real-time trends from backend API
  const handleHarvest = async (isExplicitRefresh: boolean = false) => {
    setIsHarvesting(true);
    try {
      const response = await fetch('/api/shopee-trends/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          keyword: searchQuery,
          minScore: minScoreFilter,
          sortBy,
          filterMode,
          refresh: isExplicitRefresh,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setLastHarvestTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (data.marketInsights) {
            setMarketInsights(data.marketInsights);
          }
        }
      }
    } catch (err) {
      console.warn('Harvest fallback to dynamic pool:', err);
    } finally {
      setTimeout(() => {
        setIsHarvesting(false);
      }, 500);
    }
  };

  // Run initial harvest on mount
  useEffect(() => {
    handleHarvest(false);
  }, [selectedCategory, sortBy, filterMode]);

  // Re-filter and sort locally
  const filteredProducts = products
    .filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.shopeeCategorySlug === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keySellingPoints.toLowerCase().includes(q) ||
        p.recommendedAngle.toLowerCase().includes(q) ||
        p.trendingTags.some((t) => t.toLowerCase().includes(q));
      
      const matchScore = minScoreFilter === 0 || p.ugcOpportunityScore >= minScoreFilter;

      let matchFilterMode = true;
      if (filterMode === 'blue_ocean') {
        matchFilterMode = !!p.isBlueOcean;
      } else if (filterMode === 'high_growth') {
        matchFilterMode = p.metrics.monthlyGrowthPercent >= 180;
      } else if (filterMode === 'high_commission') {
        matchFilterMode = p.affiliateCommissionPercent >= 14;
      }

      return matchCategory && matchQuery && matchScore && matchFilterMode;
    })
    .sort((a, b) => {
      if (sortBy === 'blue_ocean') {
        return (b.blueOceanScore || 0) - (a.blueOceanScore || 0);
      }
      if (sortBy === 'velocity') return b.metrics.salesVelocityDay - a.metrics.salesVelocityDay;
      if (sortBy === 'growth') return b.metrics.monthlyGrowthPercent - a.metrics.monthlyGrowthPercent;
      if (sortBy === 'commission') return b.affiliateCommissionAmount - a.affiliateCommissionAmount;
      return b.ugcOpportunityScore - a.ugcOpportunityScore;
    });

  // Aggregate stats
  const avgVelocity = Math.round(
    products.reduce((acc, p) => acc + p.metrics.salesVelocityDay, 0) / (products.length || 1)
  );
  const blueOceanTotal = products.filter((p) => p.isBlueOcean).length;
  const superViralCount = products.filter((p) => p.ugcOpportunityScore >= 90).length;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#070b14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c152a] via-[#0d1c38] to-[#12112e] border border-[#20365b] p-5 sm:p-7 overflow-hidden shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black tracking-wide">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                BLUE OCEAN INTEL: LOW COMPETITOR + HIGH SEARCH
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                UGC Opportunity Algorithm
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Trending Harvest Shopee</span>
              <span className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black px-2.5 py-1 rounded-md tracking-wider">
                LIVE & DYNAMIC
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Analisis pasar real-time menemukan produk <span className="text-cyan-300 font-bold">pencarian tinggi (High Demand)</span> dengan <span className="text-emerald-300 font-bold">persaingan kreator rendah (Low Saturation)</span>. Kunci rahasia affiliate TikTok & Shopee Video agar cepat FYP tanpa terjebak perang konten padat.
            </p>

            {/* Real-time market tip */}
            <div className="pt-1 flex items-start gap-2 text-xs text-cyan-200/90 bg-cyan-950/40 border border-cyan-800/40 p-2.5 rounded-xl">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{marketInsights}</span>
            </div>
          </div>

          {/* Action & Realtime Counter */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              onClick={() => handleHarvest(true)}
              disabled={isHarvesting}
              className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isHarvesting ? 'animate-spin' : ''}`} />
              <span>{isHarvesting ? 'Memanen Tren Real-time...' : 'Panen Data Tren Terbaru'}</span>
            </button>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Pembaruan: <strong className="text-cyan-300">{lastHarvestTime}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2e4e]">
          <div className="bg-[#081022]/90 border border-[#1b2d4f] rounded-xl p-3">
            <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peluang Blue Ocean</span>
            </div>
            <div className="text-lg font-black text-cyan-200 mt-1">
              {blueOceanTotal} <span className="text-xs font-normal text-slate-400">Rekomendasi Emas</span>
            </div>
          </div>

          <div className="bg-[#081022]/90 border border-[#1b2d4f] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Rata-rata Velocity</span>
            </div>
            <div className="text-lg font-black text-amber-300 mt-1">
              {avgVelocity.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">terjual/hari</span>
            </div>
          </div>

          <div className="bg-[#081022]/90 border border-[#1b2d4f] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Super Viral (Skor 90+)</span>
            </div>
            <div className="text-lg font-black text-purple-300 mt-1">
              {superViralCount} <span className="text-xs font-normal text-slate-400">Produk Prioritas</span>
            </div>
          </div>

          <div className="bg-[#081022]/90 border border-[#1b2d4f] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Komisi Affiliate</span>
            </div>
            <div className="text-lg font-black text-emerald-300 mt-1">
              10% - 16% <span className="text-xs font-normal text-slate-400">komisi per checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Filter Bar: Low Competitor vs All */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setFilterMode('blue_ocean')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-md ${
            filterMode === 'blue_ocean'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 shadow-cyan-950/50'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-300" />
          <span>🌊 Rekomendasi Blue Ocean (Low Kompetitor, High Search)</span>
          <span className="bg-cyan-950/80 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-md border border-cyan-700/50">
            {blueOceanTotal}
          </span>
        </button>

        <button
          onClick={() => setFilterMode('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterMode === 'all'
              ? 'bg-purple-600 text-white border border-purple-400 shadow-purple-950/50'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Semua Produk Tren ({products.length})</span>
        </button>

        <button
          onClick={() => setFilterMode('high_growth')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterMode === 'high_growth'
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>Lonjakan Tertinggi (+180% Growth)</span>
        </button>

        <button
          onClick={() => setFilterMode('high_commission')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterMode === 'high_commission'
              ? 'bg-amber-600 text-white border border-amber-400'
              : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-300" />
          <span>Komisi Jumbo (≥14%)</span>
        </button>
      </div>

      {/* Search, Category Selector & Sorting Controls */}
      <div className="bg-[#0e1424] border border-[#1d2942] rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Live Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk Shopee, kata kunci, tag..."
              className="w-full bg-[#121a2f] border border-[#213150] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-end">
            {/* Min Score Filter */}
            <div className="flex items-center gap-1.5 bg-[#12192c] border border-[#21304d] rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium">Min Skor:</span>
              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-[#101726] text-white">Semua Skor</option>
                <option value={80} className="bg-[#101726] text-white">80+ (Tinggi)</option>
                <option value={90} className="bg-[#101726] text-white">90+ (Super Viral)</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#12192c] border border-[#21304d] rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] text-slate-400 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="blue_ocean" className="bg-[#101726] text-white">🌊 Rekomendasi Blue Ocean</option>
                <option value="score" className="bg-[#101726] text-white">⭐ UGC Opportunity Score</option>
                <option value="velocity" className="bg-[#101726] text-white">🔥 Sales Velocity (Terjual/hari)</option>
                <option value="growth" className="bg-[#101726] text-white">📈 Growth Rate (%)</option>
                <option value="commission" className="bg-[#101726] text-white">💰 Komisi Terbesar (Rp)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {SHOPEE_TRENDING_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-400'
                    : 'bg-[#12182b] text-slate-400 hover:text-slate-200 border border-[#1e2942] hover:bg-[#161f36]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#0e1424] border border-[#1d2942] rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Tidak ada produk yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Coba ubah kata kunci pencarian, ganti filter kategori, atau klik tombol "Panen Data Tren Terbaru".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setMinScoreFilter(0);
              setFilterMode('all');
            }}
            className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredProducts.map((product) => {
            const isSuperViral = product.ugcOpportunityScore >= 90;
            const isHighPotential = product.ugcOpportunityScore >= 75 && product.ugcOpportunityScore < 90;

            return (
              <div
                key={product.id}
                className={`bg-gradient-to-b from-[#0f1629] to-[#0b101c] border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg flex flex-col justify-between group ${
                  product.isBlueOcean
                    ? 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-cyan-950/30'
                    : 'border-[#1f2d48] hover:border-purple-500/50 hover:shadow-purple-950/20'
                }`}
              >
                <div>
                  {/* Blue Ocean Indicator Ribbon */}
                  {product.isBlueOcean && (
                    <div className="mb-3 flex items-center justify-between gap-2 bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-transparent border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>BLUE OCEAN: Low Kompetitor & High Search</span>
                      </div>
                      <span className="text-[11px] font-extrabold bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-md border border-cyan-400/40">
                        Skor Potensi {product.blueOceanScore || 95}
                      </span>
                    </div>
                  )}

                  {/* Card Header: Product image, titles, tags, and UGC Master Score */}
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#141d33] shrink-0 border border-[#243555]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-300 bg-[#162035] border border-[#243352] px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>

                        {/* Opportunity Score Pill */}
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black shadow-sm ${
                            isSuperViral
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400'
                              : isHighPotential
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border border-amber-400'
                              : 'bg-[#18233c] text-slate-300 border border-slate-600'
                          }`}
                          title="UGC Master Opportunity Score (0-100)"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Skor {product.ugcOpportunityScore}</span>
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-200 transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          {product.shopName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                          <MapPin className="w-2.5 h-2.5" />
                          {product.shopLocation}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-slate-400 bg-[#141b2d] px-1.5 py-0.5 rounded border border-[#212b45]">
                          {product.shopBadge}
                        </span>
                      </div>

                      {/* Price & Affiliate Commission */}
                      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-amber-400">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          Komisi: Rp {product.affiliateCommissionAmount.toLocaleString('id-ID')} ({product.affiliateCommissionPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Quantitative Performance Metric Progress Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 p-3 bg-[#0d1424] rounded-xl border border-[#1b263d]">
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Sales Velocity:</span>
                        <span className="font-mono text-amber-400 font-bold">{product.metrics.salesVelocityDay}/hari</span>
                      </div>
                      <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (product.metrics.salesVelocityDay / 650) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Pertumbuhan 30h:</span>
                        <span className="font-mono text-emerald-400 font-bold">+{product.metrics.monthlyGrowthPercent}%</span>
                      </div>
                      <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, (product.metrics.monthlyGrowthPercent / 220) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Pencarian Pasar:</span>
                        <span className="font-bold text-cyan-300 text-[10px]">
                          {product.metrics.searchVolumeLevel || (product.metrics.marketDemandScore >= 90 ? 'Sangat Tinggi' : 'Tinggi')}
                        </span>
                      </div>
                      <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                          style={{ width: `${product.metrics.marketDemandScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Kompetitor Video:</span>
                        <span className={`font-bold text-[10px] ${
                          product.metrics.contentSaturation === 'Sangat Rendah' || product.metrics.contentSaturation === 'Rendah'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}>
                          {product.metrics.creatorVideoCount} vid ({product.metrics.contentSaturation})
                        </span>
                      </div>
                      <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            product.metrics.contentSaturation === 'Sangat Rendah'
                              ? 'bg-emerald-400 w-1/4'
                              : product.metrics.contentSaturation === 'Rendah'
                              ? 'bg-emerald-500 w-1/2'
                              : product.metrics.contentSaturation === 'Sedang'
                              ? 'bg-amber-400 w-3/4'
                              : 'bg-red-400 w-full'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Competitor Analysis Reason (Why this is low comp + high search) */}
                  {product.competitorAnalysisReason && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#091428] border border-cyan-800/40 text-xs text-cyan-200/90 flex items-start gap-2">
                      <Target className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-cyan-300">Analisis Peluang Pasar: </span>
                        <span>{product.competitorAnalysisReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Strategic UGC Creator Opportunity Insights */}
                  <div className="mt-3 p-3 rounded-xl bg-[#101729]/90 border border-[#1d2a45] space-y-2">
                    <div className="flex items-start gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-300">Angle Rekomendasi: </span>
                        <span className="text-slate-200">{product.recommendedAngle}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-purple-300">Ide Hook 3 Detik: </span>
                        <span className="text-slate-300 italic">"{product.recommendedHook}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#18233a] text-[11px] text-slate-400 flex-wrap">
                      <span className="font-semibold text-slate-300">Framing:</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#18233c] text-indigo-300 border border-indigo-700/40">
                        {product.recommendedFraming === 'hands_pov' && '🖐️ Hands POV (Tanpa Wajah)'}
                        {product.recommendedFraming === 'face_closeup' && '👤 Close-up Face (Ekspresi)'}
                        {product.recommendedFraming === 'full_body' && '🧍 Full Body (Gerak Dinamis)'}
                        {product.recommendedFraming === 'mix_framing' && '🔀 Mix Framing'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{product.targetAudience}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-[#1a253d] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{product.metrics.totalSold.toLocaleString('id-ID')} Terjual di Shopee</span>
                  </div>

                  <button
                    onClick={() => onGenerateStoryboardForProduct(product)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-cyan-950/50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Storyboard Produk Ini</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Algorithm Transparency Footer Card */}
      <div className="rounded-2xl bg-[#0b101c] border border-[#1b263b] p-5 text-xs text-slate-400 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Tentang Formula "Blue Ocean" & UGC Master Opportunity Score</span>
        </div>
        <p className="leading-relaxed">
          Sistem menganalisis jutaan sinyal pembeli di Shopee Indonesia dan memetakan gap konten affiliate:
          <strong className="text-cyan-300"> Demand Pencarian Tinggi (≥80)</strong> dipadukan dengan 
          <strong className="text-emerald-300"> Saturasi Video Rendah (&lt;350 video)</strong> menghasilkan prediktor "Blue Ocean".
          Skor dihitung berbobot: <strong className="text-slate-200">Kecepatan Penjualan (35%)</strong>, 
          <strong className="text-slate-200">Lonjakan 30 Hari (30%)</strong>, 
          <strong className="text-slate-200">Pencarian vs Saturasi (20%)</strong>, dan 
          <strong className="text-slate-200">Komisi Affiliate (15%)</strong>.
        </p>
      </div>

    </div>
  );
};
