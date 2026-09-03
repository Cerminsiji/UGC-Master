import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Search,
  Sparkles,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ImageIcon,
  ArrowRight,
  Filter,
  Tag,
  Eye,
  Camera,
  Layers,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileVideo
} from 'lucide-react';
import { TrackedProductRecord, Scene } from '../types';

interface ProductTrackingDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoStoryboard: (record: TrackedProductRecord) => void;
  currentStoryboardData?: {
    productName: string;
    category: string;
    caption: string;
    scenes: Scene[];
  };
  onSaveCurrentToDatabase?: () => void;
}

export const ProductTrackingDatabaseModal: React.FC<ProductTrackingDatabaseModalProps> = ({
  isOpen,
  onClose,
  onLoadIntoStoryboard,
  currentStoryboardData,
  onSaveCurrentToDatabase,
}) => {
  const [products, setProducts] = useState<TrackedProductRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tracked-products?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory === 'semua' ? '' : selectedCategory)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load tracked products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, searchQuery, selectedCategory]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data tracking produk "${name}" dari database?`)) return;
    try {
      const res = await fetch(`/api/tracked-products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product record:', err);
    }
  };

  if (!isOpen) return null;

  const categories = ['semua', 'Beauty & Skincare', 'Gadget & Tech', 'Fashion', 'Health & Diet', 'Home & Living'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1320] border border-[#212d46] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#1c273e] bg-[#121929] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                  Database Tracking Produk & Google Flow
                </h2>
                <span className="bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {products.length} Produk Tersimpan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyimpanan referensi visual produk, prompt Google Flow konsisten, dan UGC Storyboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="p-2 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-[#1b253b] transition-colors"
              title="Refresh database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1b253b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, & Snapshot button */}
        <div className="p-4 border-b border-[#1a243a] bg-[#101625] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, brand, USP, atau tag..."
                className="w-full bg-[#151c2d] border border-[#212d46] focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                    : 'bg-[#151c2d] border-[#212d46] text-slate-400 hover:text-slate-200 hover:bg-[#1a2338]'
                }`}
              >
                {cat === 'semua' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {loading && products.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
              <span>Memuat data tracking produk...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Database className="w-8 h-8 text-slate-600" />
              <span className="font-semibold text-slate-300">Belum ada produk yang cocok</span>
              <span className="text-slate-500 max-w-sm">
                Gunakan fitur AI Generate atau analisa gambar produk untuk otomatis melacak dan menyimpan prompt Google Flow di sini.
              </span>
            </div>
          ) : (
            products.map((prod) => {
              const isExpanded = expandedProductId === prod.id;
              const hasImage = Boolean(prod.referenceImage);
              const sceneCount = prod.scenes?.length || 0;

              return (
                <div
                  key={prod.id}
                  className="bg-[#121827] border border-[#1e2a42] hover:border-[#2d3e61] rounded-2xl p-4 md:p-5 transition-all shadow-md flex flex-col gap-4"
                >
                  {/* Top row: Thumbnail / Info / Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail / Image Preview */}
                      <div className="w-16 h-16 rounded-xl bg-[#172033] border border-[#23314d] flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
                        {hasImage ? (
                          <img
                            src={prod.referenceImage}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        )}
                        <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] text-purple-300 px-1 font-mono">
                          {sceneCount}S
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {prod.name}
                          </h3>
                          {prod.brandName && (
                            <span className="bg-indigo-950/70 text-indigo-300 border border-indigo-600/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {prod.brandName}
                            </span>
                          )}
                          <span className="bg-purple-950/70 text-purple-300 border border-purple-600/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                          {prod.price && (
                            <span className="text-emerald-400 font-bold text-xs bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                              {prod.price}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                          {prod.keySellingPoints || prod.productDescription || 'Deskripsi produk viral UGC.'}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(prod.updatedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {prod.tags && prod.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-purple-400" />
                              {prod.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => {
                          onLoadIntoStoryboard(prod);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
                        title="Buka storyboard produk ini di editor"
                      >
                        <FileVideo className="w-3.5 h-3.5" />
                        <span>Buka Storyboard</span>
                      </button>

                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : prod.id)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl border transition-all ${
                          isExpanded
                            ? 'bg-[#1e273e] text-purple-300 border-purple-500/50'
                            : 'bg-[#151c2d] text-slate-300 border-[#222e47] hover:border-[#2f3e60]'
                        }`}
                        title="Lihat detail Google Flow Prompts"
                      >
                        <span>Prompt & Visual</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-800/40 transition-colors"
                        title="Hapus dari database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Details: Google Flow Master Prompt & Scenes */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#1c273e] space-y-4 animate-fadeIn">
                      
                      {/* Master Google Flow Consistency Prompt */}
                      <div className="bg-[#0c101a] border border-[#1f2b43] rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>GOOGLE FLOW MASTER CONSISTENCY PROMPT</span>
                          </div>
                          <button
                            onClick={() => handleCopy(`master-${prod.id}`, prod.googleFlowMasterPrompt)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            {copiedKey === `master-${prod.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin Master Prompt</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#111724] p-2.5 rounded-lg border border-[#1b263b] select-all">
                          {prod.googleFlowMasterPrompt}
                        </p>
                      </div>

                      {/* Viral TikTok Caption */}
                      {prod.caption && (
                        <div className="bg-[#0c101a] border border-[#1f2b43] rounded-xl p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                              CAPTION VIDEO TIKTOK (UGC STYLE, TANPA CTA KERANJANG)
                            </span>
                            <button
                              onClick={() => handleCopy(`cap-${prod.id}`, prod.caption || '')}
                              className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {copiedKey === `cap-${prod.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-300">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin Caption</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-200 bg-[#111724] p-2.5 rounded-lg border border-[#1b263b]">
                            {prod.caption}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Panjang: {prod.caption.length} karakter (Maksimal 150)</span>
                            <span>100% Bebas CTA Keranjang</span>
                          </div>
                        </div>
                      )}

                      {/* Scene by Scene Prompts */}
                      <div className="space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>PROMPT GOOGLE FLOW PER ADEGAN ({prod.scenes?.length || 0} ADEGAN)</span>
                          <button
                            onClick={() => {
                              const allPrompts = prod.scenes
                                .map((s, i) => `[ADEGAN ${i + 1} - ${s.cameraAngle}]\nVisual: ${s.visualAction}\nVO: "${s.dialogVO}"\nOverlay: "${s.popupText}"\nGoogle Flow Prompt:\n${s.googleFlowPrompt || ''}\n`)
                                .join('\n---\n\n');
                              handleCopy(`all-scenes-${prod.id}`, allPrompts);
                            }}
                            className="text-[10px] font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                          >
                            {copiedKey === `all-scenes-${prod.id}` ? (
                              <span className="text-emerald-400">Semua Tersalin!</span>
                            ) : (
                              <span>Salin Semua Prompt Adegan</span>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                          {prod.scenes?.map((sc, idx) => (
                            <div
                              key={sc.id || idx}
                              className="bg-[#0f1422] border border-[#1d283e] rounded-xl p-3 text-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                    ADEGAN {idx + 1}
                                  </span>
                                  <span className="text-slate-300 font-semibold text-[11px]">
                                    {sc.cameraAngle} ({sc.duration}s)
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleCopy(`sc-${prod.id}-${idx}`, sc.googleFlowPrompt || sc.visualAction)}
                                  className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/40 border border-purple-600/30 px-2 py-0.5 rounded"
                                >
                                  {copiedKey === `sc-${prod.id}-${idx}` ? 'Tersalin' : 'Copy Prompt'}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#182337]">
                                <div>
                                  <span className="text-sky-400 font-bold">Text Overlay: </span>
                                  <span className="text-sky-200 font-bold">{sc.popupText}</span>
                                </div>
                                <div>
                                  <span className="text-rose-400 font-bold">Voice Over: </span>
                                  <span className="text-slate-300 italic">"{sc.dialogVO}"</span>
                                </div>
                              </div>

                              {sc.googleFlowPrompt && (
                                <div className="bg-[#0a0e17] p-2 rounded border border-[#192439] text-[11px] font-mono text-slate-400 select-all">
                                  <span className="text-purple-400 font-bold">Flow Prompt: </span>
                                  {sc.googleFlowPrompt}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c273e] bg-[#121929] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Semua produk otomatis tersimpan dengan format konsistensi visual Google Flow & TikTok UGC.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1a2338] hover:bg-[#222e47] text-white font-bold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
