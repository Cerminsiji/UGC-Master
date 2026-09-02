import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  X,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Sliders,
  ThumbsUp,
  MessageSquarePlus,
  ShieldCheck,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { CreatorLearningMemory, LearnedRule, MarketSignal } from '../types';

interface MarketLearningCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

export const MarketLearningCenterModal: React.FC<MarketLearningCenterModalProps> = ({
  isOpen,
  onClose,
  onNotification,
}) => {
  const [memory, setMemory] = useState<CreatorLearningMemory | null>(null);
  const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'signals' | 'feedback'>('rules');

  // New Rule State
  const [newRuleText, setNewRuleText] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Semua Kategori');
  const [isAddingRule, setIsAddingRule] = useState(false);

  // New Feedback State
  const [feedbackProduct, setFeedbackProduct] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Beauty & Skincare');
  const [feedbackType, setFeedbackType] = useState<'viral_success' | 'high_closing' | 'needs_improvement' | 'custom'>('viral_success');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Scanning Market State
  const [isScanningMarket, setIsScanningMarket] = useState(false);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/market-learning');
      const data = await res.json();
      if (data.success && data.memory) {
        setMemory(data.memory);
        if (data.memory.feedbackLogs) {
          setFeedbackLogs(data.memory.feedbackLogs);
        }
      }
    } catch (err) {
      console.error('Error fetching market learning memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemory();
    }
  }, [isOpen]);

  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/market-learning/rule/${ruleId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchMemory();
      }
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/market-learning/rule/${ruleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMemory();
        onNotification?.('Aturan berhasil dihapus dari memori AI.');
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleAddRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    setIsAddingRule(true);
    try {
      const res = await fetch('/api/market-learning/rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleText: newRuleText.trim(),
          category: newRuleCategory,
          source: 'user_defined',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewRuleText('');
        fetchMemory();
        onNotification?.('Aturan baru berhasil disimpan ke Memori Pembelajaran AI!');
      }
    } catch (err) {
      console.error('Error adding rule:', err);
    } finally {
      setIsAddingRule(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/market-learning/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: feedbackProduct || 'Produk Kreator',
          category: feedbackCategory,
          feedbackType,
          notes: feedbackNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackProduct('');
        setFeedbackNotes('');
        fetchMemory();
        onNotification?.(data.message || 'Feedback berhasil dicatat dan dipelajari AI!');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleScanMarket = async () => {
    setIsScanningMarket(true);
    try {
      const res = await fetch('/api/market-learning/scan-market', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchMemory();
        onNotification?.('AI berhasil memindai tren pasar terbaru dari Google & TikTok!');
      }
    } catch (err) {
      console.error('Error scanning market:', err);
    } finally {
      setIsScanningMarket(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="market-learning-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="market-learning-modal-container"
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Pusat Pembelajaran AI Pasar & User</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Continuous Learning Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                AI terus beradaptasi dengan tren penjualan TikTok Shop/Shopee dan masukan hasil video kreator Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="scan-market-signals-btn"
              onClick={handleScanMarket}
              disabled={isScanningMarket}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningMarket ? 'animate-spin' : ''}`} />
              <span>{isScanningMarket ? 'Memindai...' : 'Pindai Tren Pasar Live'}</span>
            </button>
            <button
              id="close-learning-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="px-5 py-3 border-b border-neutral-800/80 bg-neutral-950/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <span className="text-neutral-400 text-[11px]">Skrip Tergenerate</span>
            <div className="text-base font-extrabold text-white mt-0.5">{memory?.totalScriptsGenerated || 0} Video</div>
          </div>
          <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <span className="text-neutral-400 text-[11px]">Feedback Tersimpan</span>
            <div className="text-base font-extrabold text-indigo-400 mt-0.5">{memory?.totalFeedbacksLogged || 0} Log</div>
          </div>
          <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <span className="text-neutral-400 text-[11px]">Aturan Aktif</span>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5">
              {memory?.learnedRules.filter((r) => r.active).length || 0} Aturan
            </div>
          </div>
          <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <span className="text-neutral-400 text-[11px]">Winning Price Bracket</span>
            <div className="text-xs font-bold text-amber-400 mt-1">{memory?.winningPriceBracket || 'Rp 39rb - Rp 89rb'}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-neutral-800 bg-neutral-900">
          <button
            id="tab-learning-rules"
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Aturan Pembelajaran ({memory?.learnedRules.length || 0})</span>
          </button>
          <button
            id="tab-learning-signals"
            onClick={() => setActiveTab('signals')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'signals'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sinyal Tren Marketplace</span>
          </button>
          <button
            id="tab-learning-feedback"
            onClick={() => setActiveTab('feedback')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Lapor Performa & Feedback</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              {/* Add Custom Rule Form */}
              <form onSubmit={handleAddRuleSubmit} className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    Ajarkan Pola / Aturan Baru ke AI
                  </span>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Semua Kategori">Semua Kategori</option>
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Gadget & Elektronik">Gadget & Elektronik</option>
                    <option value="Fashion & OOTD">Fashion & OOTD</option>
                    <option value="Kesehatan & Diet">Kesehatan & Diet</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Untuk produk parfum, wajib mention ketahanan 12 jam di adegan 1..."
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingRule || !newRuleText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </form>

              {/* Rules List */}
              <div className="space-y-2.5">
                {memory?.learnedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      rule.active
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-neutral-950/40 border-neutral-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          rule.active ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                        title={rule.active ? 'Aktif (Digunakan saat generate)' : 'Nonaktif'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-neutral-800 text-indigo-300 border border-neutral-700">
                            {rule.category}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                            Sumber: {rule.source === 'market_signal' ? 'Sinyal Pasar' : rule.source === 'feedback_loop' ? 'Feedback Loop' : 'Kreator'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 leading-relaxed font-medium">{rule.ruleText}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Hapus aturan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Sinyal pasar berikut secara otomatis disuntikkan ke dalam AI Prompt setiap kali Anda membuat Storyboard atau Hook baru.
                </span>
              </div>

              <div className="space-y-3">
                {memory?.marketSignals.map((sig) => (
                  <div key={sig.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {sig.marketplace}
                        </span>
                        <h4 className="text-sm font-bold text-white">{sig.trendName}</h4>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Confidence {sig.confidenceScore}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{sig.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <form onSubmit={handleFeedbackSubmit} className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-amber-400" />
                  Catat Performa Video UGC & Beri Feedback ke AI
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">Nama Produk</label>
                    <input
                      type="text"
                      placeholder="e.g. Skintific Ceramide Gel"
                      value={feedbackProduct}
                      onChange={(e) => setFeedbackProduct(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Kategori</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Gadget & Elektronik">Gadget & Elektronik</option>
                      <option value="Fashion & OOTD">Fashion & OOTD</option>
                      <option value="Kesehatan & Diet">Kesehatan & Diet</option>
                      <option value="Home & Living">Home & Living</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Hasil / Tipe Feedback</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'viral_success', label: '🔥 Viral (>50K Views)' },
                      { id: 'high_closing', label: '💰 Closing Tinggi' },
                      { id: 'needs_improvement', label: '📉 Retensi Rendah' },
                      { id: 'custom', label: '✍️ Catatan Khusus' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFeedbackType(item.id as any)}
                        className={`p-2 rounded-lg border text-center font-medium transition-all ${
                          feedbackType === item.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Catatan Tambahan (Pelajaran untuk AI)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Hook uji gesek air sangat efektif memicu komentar dan pembelian..."
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !feedbackNotes.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {isSubmittingFeedback ? 'Menyimpan...' : 'Kirim Feedback & Latih AI'}
                </button>
              </form>

              {/* Past Feedback Logs */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Riwayat Feedback Pembelajaran ({feedbackLogs.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feedbackLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{log.productName}</span>
                        <span className="text-[10px] text-neutral-500">{new Date(log.timestamp).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-neutral-300 text-[11px]">{log.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/90 text-neutral-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            Sistem memori dinamis memperkuat kualitas skrip, hook, dan caption setiap saat.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
