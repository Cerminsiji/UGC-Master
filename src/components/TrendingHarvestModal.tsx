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
} from 'lucide-react';
import { TrendingProduct, AIGenerateParams } from '../types';

interface TrendingHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForStoryboard: (product: TrendingProduct) => void;
}

const MARKETPLACES: Array<'TikTok Shop' | 'Shopee Video' | 'Tokopedia' | 'Instagram Reels'> = [
  'TikTok Shop',
  'Shopee Video',
  'Tokopedia',
  'Instagram Reels',
];

const CATEGORIES = [
  'Semua Kategori',
  'Beauty & Skincare',
  'Fashion & OOTD',
  'Gadget & Elektronik',
  'Kesehatan & Diet',
  'Home & Living',
];

export const TrendingHarvestModal: React.FC<TrendingHarvestModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForStoryboard,
}) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<'TikTok Shop' | 'Shopee Video' | 'Tokopedia' | 'Instagram Reels'>('TikTok Shop');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [selectedProductDetail, setSelectedProductDetail] = useState<TrendingProduct | null>(null);

  const fetchTrendingHarvest = async (mkt = selectedMarketplace, cat = selectedCategory, kw = searchKeyword) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trending-harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketplace: mkt,
          category: cat,
          customKeyword: kw,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.products) {
        throw new Error(data.error || 'Gagal mengambil data trending');
      }

      setProducts(data.products);
      setDataSource(data.source || '');
      if (data.products.length > 0) {
        setSelectedProductDetail(data.products[0]);
      }
    } catch (err: any) {
      console.error('Error fetching trending harvest:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data trending.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrendingHarvest(selectedMarketplace, selectedCategory, searchKeyword);
    }
  }, [isOpen, selectedMarketplace, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrendingHarvest(selectedMarketplace, selectedCategory, searchKeyword);
  };

  if (!isOpen) return null;

  return (
    <div
      id="trending-harvest-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="trending-harvest-modal-container"
        className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Trending Harvest & Market Real-Check</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Produk Asli Terverifikasi
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Data ditarik langsung dari produk nyata dan brand terlaris di {selectedMarketplace} Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-trending-btn"
              onClick={() => fetchTrendingHarvest(selectedMarketplace, selectedCategory, searchKeyword)}
              disabled={isLoading}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh Harvest"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              id="close-trending-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Live Search Bar */}
        <div className="px-5 py-3 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3">
          {/* Marketplace Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {MARKETPLACES.map((mkt) => {
              const isActive = selectedMarketplace === mkt;
              return (
                <button
                  key={mkt}
                  id={`mkt-tab-${mkt.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedMarketplace(mkt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {mkt}
                </button>
              );
            })}
          </div>

          {/* Search Input & Category Dropdown */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
              <input
                id="trending-search-input"
                type="text"
                placeholder="Cari produk (e.g. moisturizer, tws)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                id="trending-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-medium">Sedang memverifikasi data produk asli di {selectedMarketplace}...</p>
              <p className="text-xs text-neutral-500">Mencocokkan nama brand autentik, sweet spot harga pasar, dan link checkout</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Product Cards List (Left Column) */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Produk Nyata Terverifikasi ({products.length})
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Ada di Marketplace
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {products.map((prod) => {
                    const isSelected = selectedProductDetail?.id === prod.id;
                    return (
                      <div
                        key={prod.id}
                        id={`product-card-${prod.id}`}
                        onClick={() => setSelectedProductDetail(prod)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {prod.trendVelocity}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-medium">
                                {prod.category}
                              </span>
                              {prod.brandName && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
                                  {prod.brandName}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-300">
                              {prod.name}
                            </h3>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-extrabold text-amber-400">{prod.price}</div>
                            <div className="text-[10px] text-neutral-400">{prod.salesVolume}</div>
                          </div>
                        </div>

                        {/* Badges row */}
                        <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-300">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Percent className="w-3 h-3" /> Komisi {prod.commissionAnalysis?.commissionRate}
                            </span>
                            <span className="text-neutral-500">•</span>
                            <span className="text-neutral-400 truncate max-w-[110px]">
                              {prod.commissionAnalysis?.affiliateRating}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {prod.marketplaceUrl && (
                              <a
                                href={prod.marketplaceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                                title={`Cek langsung di ${prod.marketplace || 'Marketplace'}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              id={`btn-select-${prod.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProductForStoryboard(prod);
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 font-bold text-[11px] transition-all flex items-center gap-1 shrink-0 border border-amber-500/40"
                            >
                              <span>Buat Script</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deep Analysis Panel (Right Column) */}
              <div className="lg:col-span-6 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                {selectedProductDetail ? (
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="border-b border-neutral-800 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {selectedProductDetail.marketplace}
                          </span>
                          {selectedProductDetail.marketplaceUrl && (
                            <a
                              href={selectedProductDetail.marketplaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>Buka di {selectedProductDetail.marketplace}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold">
                          Estimasi: {selectedProductDetail.commissionAnalysis?.estProfitPer100Sales} / 100 sales
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">{selectedProductDetail.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        USP: <span className="text-neutral-200">{selectedProductDetail.suggestedUSP}</span>
                      </p>
                    </div>

                    {/* 4 Deep Analytics Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 1. Harga & Sweet Spot */}
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>1. Analisis Harga</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          <span className="text-neutral-400">Rating: </span>
                          <span className="font-semibold text-amber-300">
                            {selectedProductDetail.priceAnalysis?.priceRating}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {selectedProductDetail.priceAnalysis?.sweetSpot}
                        </p>
                        <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                          Kompetitor: {selectedProductDetail.priceAnalysis?.competitorRange}
                        </div>
                      </div>

                      {/* 2. Target Persona & Kebutuhan */}
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-blue-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>2. Kebutuhan & Buyer</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          <span className="text-neutral-400">Core Need: </span>
                          <span className="font-medium text-neutral-200">
                            {selectedProductDetail.buyerAnalysis?.coreNeed}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          <span className="text-rose-400 font-medium">Pain Point: </span>
                          {selectedProductDetail.buyerAnalysis?.painPoint}
                        </p>
                      </div>

                      {/* 3. Komisi & Keuntungan Affiliate */}
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <Percent className="w-3.5 h-3.5" />
                          <span>3. Komisi & Cuan</span>
                        </div>
                        <div className="text-[11px] text-neutral-300 flex justify-between">
                          <span>Rate Komisi:</span>
                          <span className="font-bold text-emerald-400">
                            {selectedProductDetail.commissionAnalysis?.commissionRate}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-300 flex justify-between">
                          <span>Closing:</span>
                          <span className="font-medium text-neutral-200">
                            {selectedProductDetail.commissionAnalysis?.closingDifficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/80 pt-1 border-t border-neutral-800">
                          {selectedProductDetail.commissionAnalysis?.affiliateRating}
                        </p>
                      </div>

                      {/* 4. Rekomendasi Format UGC */}
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-purple-400">
                          <Target className="w-3.5 h-3.5" />
                          <span>4. Format UGC Teruji</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          <span className="text-neutral-400">Kategori: </span>
                          <span className="font-bold text-purple-300">
                            {selectedProductDetail.recommendedCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Formula ini terbukti memberikan Conversion Rate tertinggi untuk audiens {selectedProductDetail.buyerAnalysis?.targetPersona}.
                        </p>
                      </div>
                    </div>

                    {/* Suggested Hook Preview */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Rekomendasi Hook 3 Detik Viral:</span>
                      </div>
                      <p className="text-xs text-amber-200 italic font-medium">
                        "{selectedProductDetail.suggestedHook}"
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        id="generate-from-trending-btn"
                        onClick={() => onSelectProductForStoryboard(selectedProductDetail)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-neutral-950" />
                        <span>Buat Storyboard dari Produk Ini</span>
                        <ArrowRight className="w-4 h-4 text-neutral-950" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                    Pilih produk di sebelah kiri untuk melihat analisis mendalam
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/90 text-neutral-400 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Produk terverifikasi real-time dari database penjualan marketplace Indonesia
          </span>
          <span className="text-[11px] text-neutral-500">
            Sistem Pembelajaran Otomatis & Anti-AI Realism Active
          </span>
        </div>
      </div>
    </div>
  );
};
