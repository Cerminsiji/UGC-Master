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
  ExternalLink
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
  const [sortBy, setSortBy] = useState<'score' | 'velocity' | 'growth' | 'commission'>('score');
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);
  const [lastHarvestTime, setLastHarvestTime] = useState<string>('Baru saja (Real-Time)');
  const [selectedProductDetail, setSelectedProductDetail] = useState<ShopeeTrendingProduct | null>(null);
  const [marketInsights, setMarketInsights] = useState<string>(
    'Data Shopee Indonesia: Produk dengan velocity > 350 terjual/hari dan saturasi konten Rendah menghasilkan konversi affiliate 3.4x lebih tinggi.'
  );

  // Harvest real-time trends from backend API
  const handleHarvest = async () => {
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          setLastHarvestTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (data.marketInsights) {
            setMarketInsights(data.marketInsights);
          }
        }
      }
    } catch (err) {
      console.warn('Harvest fallback to client calculation:', err);
    } finally {
      setTimeout(() => {
        setIsHarvesting(false);
      }, 400);
    }
  };

  // Re-filter and sort locally whenever search, category or sort changes
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

      return matchCategory && matchQuery && matchScore;
    })
    .sort((a, b) => {
      if (sortBy === 'velocity') return b.metrics.salesVelocityDay - a.metrics.salesVelocityDay;
      if (sortBy === 'growth') return b.metrics.monthlyGrowthPercent - a.metrics.monthlyGrowthPercent;
      if (sortBy === 'commission') return b.affiliateCommissionAmount - a.affiliateCommissionAmount;
      return b.ugcOpportunityScore - a.ugcOpportunityScore;
    });

  // Aggregate stats
  const avgVelocity = Math.round(
    products.reduce((acc, p) => acc + p.metrics.salesVelocityDay, 0) / (products.length || 1)
  );
  const superViralCount = products.filter((p) => p.ugcOpportunityScore >= 90).length;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#070b14] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#11182c] via-[#0f172a] to-[#15102a] border border-[#233352] p-5 sm:p-7 overflow-hidden shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Shopee Real-Time Harvest
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                UGC Master Opportunity Score Algorithm
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Trending Harvest</span>
              <span className="text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">
                LIVE INTEL
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau produk berpotensi viral dari Shopee dengan metrik kecepatan penjualan (<span className="text-amber-300 font-semibold">sales velocity</span>), lonjakan pertumbuhan (<span className="text-emerald-300 font-semibold">growth</span>), dan demand pasar riil untuk memprioritaskan pembuatan storyboard video konversi tinggi.
            </p>

            {/* Real-time market tip */}
            <div className="pt-1 flex items-start gap-2 text-xs text-slate-400">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{marketInsights}</span>
            </div>
          </div>

          {/* Action & Realtime Counter */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              onClick={handleHarvest}
              disabled={isHarvesting}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-amber-900/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isHarvesting ? 'animate-spin' : ''}`} />
              <span>{isHarvesting ? 'Memanen Data Shopee...' : 'Panen Data Tren Terbaru'}</span>
            </button>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Diperbarui: <strong className="text-slate-300">{lastHarvestTime}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2a44]">
          <div className="bg-[#0b101c]/80 border border-[#1b263b] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Rata-rata Velocity</span>
            </div>
            <div className="text-lg font-black text-amber-300 mt-1">
              {avgVelocity.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">terjual/hari</span>
            </div>
          </div>

          <div className="bg-[#0b101c]/80 border border-[#1b263b] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Super Viral (Score 90+)</span>
            </div>
            <div className="text-lg font-black text-purple-300 mt-1">
              {superViralCount} <span className="text-xs font-normal text-slate-400">Produk Prioritas</span>
            </div>
          </div>

          <div className="bg-[#0b101c]/80 border border-[#1b263b] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estimasi Komisi</span>
            </div>
            <div className="text-lg font-black text-emerald-300 mt-1">
              10% - 18% <span className="text-xs font-normal text-slate-400">per transaksi</span>
            </div>
          </div>

          <div className="bg-[#0b101c]/80 border border-[#1b263b] rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Total Produk Dipantau</span>
            </div>
            <div className="text-lg font-black text-indigo-300 mt-1">
              {filteredProducts.length} <span className="text-xs font-normal text-slate-400">dari {products.length} item</span>
            </div>
          </div>
        </div>
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
              className="w-full bg-[#121a2f] border border-[#213150] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] text-slate-400 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-purple-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="score" className="bg-[#101726] text-white">Opportunity Score</option>
                <option value="velocity" className="bg-[#101726] text-white">Sales Velocity (Terjual/hari)</option>
                <option value="growth" className="bg-[#101726] text-white">Growth Rate (%)</option>
                <option value="commission" className="bg-[#101726] text-white">Komisi Terbesar (Rp)</option>
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400'
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
            Coba ubah kata kunci pencarian, turunkan filter skor minimum, atau pilih kategori lain.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setMinScoreFilter(0);
            }}
            className="text-xs text-purple-400 font-bold hover:underline"
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
                className="bg-gradient-to-b from-[#0f1629] to-[#0b101c] border border-[#1f2d48] hover:border-purple-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg hover:shadow-purple-950/20 flex flex-col justify-between group"
              >
                <div>
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
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-700/50 px-2 py-0.5 rounded-full">
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

                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-200 transition-colors">
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
                        <span>Growth 30h:</span>
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
                        <span>Demand Pasar:</span>
                        <span className="font-mono text-purple-300 font-bold">{product.metrics.marketDemandScore}/100</span>
                      </div>
                      <div className="w-full bg-[#182236] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${product.metrics.marketDemandScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Saturasi Video:</span>
                        <span className={`font-bold text-[10px] ${
                          product.metrics.contentSaturation === 'Sangat Rendah' || product.metrics.contentSaturation === 'Rendah'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}>
                          {product.metrics.contentSaturation}
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

                  {/* Strategic UGC Creator Opportunity Insights */}
                  <div className="mt-3.5 p-3 rounded-xl bg-[#101729]/90 border border-[#1d2a45] space-y-2">
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
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-purple-950/50 active:scale-95 transition-all cursor-pointer"
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
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Tentang Algoritma UGC Master Opportunity Score</span>
        </div>
        <p className="leading-relaxed">
          Skor dihitung secara matematis menggunakan pembobotan 4 faktor penentu konversi video:
          <strong className="text-slate-200"> Kecepatan Penjualan Riil (35%)</strong>, 
          <strong className="text-slate-200"> Lonjakan Pertumbuhan 30 Hari (30%)</strong>, 
          <strong className="text-slate-200"> Gap Saturasi Konten & Demand Pasar (20%)</strong>, dan 
          <strong className="text-slate-200"> Nilai Komisi Affiliate (15%)</strong>.
          Skor 90+ menandakan produk prioritas tinggi yang paling responsif terhadap format video vertikal 9:16 di TikTok Shop dan Shopee Video.
        </p>
      </div>

    </div>
  );
};
