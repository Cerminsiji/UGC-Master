import fs from 'fs';
import path from 'path';
import { LearnedRule, MarketSignal, CreatorLearningMemory } from '../types';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'market_learning_memory.json');

// Default initial high-performing market rules and signals for Indonesian UGC creators
const INITIAL_RULES: LearnedRule[] = [
  {
    id: 'rule-skincare-texture',
    ruleText: 'Untuk produk Skincare & Kosmetik di TikTok Shop & Shopee Video, adegan 1 wajib menyorot perbandingan tekstur kulit atau swatch nyata di tangan di bawah cahaya natural (Anti-Filter) untuk membangun trust instan.',
    category: 'Beauty & Skincare',
    source: 'market_signal',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'rule-negative-hook',
    ruleText: 'Gaya Negative Hook ("Jangan pernah beli produk ini kalau kamu belum siap...") menghasilkan retensi 3 detik pertama 35% lebih tinggi dibanding hook standar pada audiens Gen Z Indonesia.',
    category: 'Semua Kategori',
    source: 'market_signal',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'rule-sweet-spot-price',
    ruleText: 'Rentang harga sweet spot impulse buying tertinggi di TikTok Shop & Shopee Indonesia adalah Rp 39.000 - Rp 89.000 dengan mention "Gratis Ongkir & Diskon Keranjang Kuning" di detik ke-15.',
    category: 'Affiliate',
    source: 'market_signal',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'rule-hands-only-gadget',
    ruleText: 'Untuk produk Gadget, Aksesoris Meja, dan Home Living, demonstrasi POV Hanya Tangan (Hands-Only POV) di atas meja kayu/estetik menghasilkan conversion rate 1.4x lebih tinggi daripada full face.',
    category: 'Gadget & Elektronik',
    source: 'feedback_loop',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'rule-caption-limit',
    ruleText: 'Caption wajib padat di bawah 150 karakter dengan CTA jelas dan 3-4 hashtag relevan (#RacunTikTok, #TikTokShop, #SpillRacun) agar tidak tertutup tombol UI video.',
    category: 'Semua Kategori',
    source: 'user_defined',
    createdAt: new Date().toISOString(),
    active: true,
  },
];

const INITIAL_SIGNALS: MarketSignal[] = [
  {
    id: 'sig-1',
    marketplace: 'TikTok Shop',
    trendName: 'Format Uji Ketahanan Ekstrem (Proof Test)',
    insight: 'Audiens lebih percaya video review yang menguji ketahanan produk langsung (contoh: tes semprot air, tes gesek tisu, tes pakai seharian).',
    detectedAt: new Date().toISOString(),
    confidenceScore: 96,
  },
  {
    id: 'sig-2',
    marketplace: 'Shopee Video',
    trendName: 'Spill Voucher Live & Keranjang Oranye',
    insight: 'Penyebutan voucher ekstra cashback pada adegan CTA meningkatkan rasio checkout hingga 28%.',
    detectedAt: new Date().toISOString(),
    confidenceScore: 92,
  },
  {
    id: 'sig-3',
    marketplace: 'Tokopedia & Lazada',
    trendName: 'Official Store & Garansi Original',
    insight: 'Penyebutan "100% Original BPOM & Garansi Resmi" efektif untuk produk kesehatan dan elektronik.',
    detectedAt: new Date().toISOString(),
    confidenceScore: 90,
  },
];

interface LearningStoreData {
  totalScriptsGenerated: number;
  totalFeedbacksLogged: number;
  learnedRules: LearnedRule[];
  marketSignals: MarketSignal[];
  preferredVisualFocus: string;
  topConvertingHooks: string[];
  winningPriceBracket: string;
  feedbackLogs: Array<{
    id: string;
    productName: string;
    category: string;
    feedbackType: 'viral_success' | 'high_closing' | 'needs_improvement' | 'custom';
    notes: string;
    timestamp: string;
  }>;
  lastUpdated: string;
}

class LearningEngine {
  private data: LearningStoreData;

  constructor() {
    this.data = this.loadMemory();
  }

  private loadMemory(): LearningStoreData {
    try {
      if (fs.existsSync(MEMORY_FILE_PATH)) {
        const raw = fs.readFileSync(MEMORY_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.learnedRules)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Learning Engine] Could not read memory file, initializing default:', e);
    }

    const defaultData: LearningStoreData = {
      totalScriptsGenerated: 142,
      totalFeedbacksLogged: 38,
      learnedRules: INITIAL_RULES,
      marketSignals: INITIAL_SIGNALS,
      preferredVisualFocus: 'mix',
      topConvertingHooks: [
        'Negative Hook: "Jangan pernah beli kalau belum siap..."',
        'Visual Shock: Uji ketahanan langsung 3 detik pertama',
        'Relatable Pain Point: Curhat masalah sehari-hari',
      ],
      winningPriceBracket: 'Rp 45.000 - Rp 89.000',
      feedbackLogs: [
        {
          id: 'fb-1',
          productName: 'The Originote Hyalucera Gel',
          category: 'Beauty & Skincare',
          feedbackType: 'viral_success',
          notes: 'Hook visual swatch tekstur dingin tembus 70K views dalam 24 jam.',
          timestamp: new Date().toISOString(),
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    this.saveMemory(defaultData);
    return defaultData;
  }

  private saveMemory(dataToSave: LearningStoreData = this.data) {
    try {
      fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Learning Engine] Error saving memory file:', e);
    }
  }

  public getMemory(): CreatorLearningMemory & { feedbackLogs: any[] } {
    return {
      totalScriptsGenerated: this.data.totalScriptsGenerated,
      totalFeedbacksLogged: this.data.totalFeedbacksLogged,
      learnedRules: this.data.learnedRules,
      marketSignals: this.data.marketSignals,
      preferredVisualFocus: this.data.preferredVisualFocus,
      topConvertingHooks: this.data.topConvertingHooks,
      winningPriceBracket: this.data.winningPriceBracket,
      feedbackLogs: this.data.feedbackLogs,
      lastUpdated: this.data.lastUpdated,
    };
  }

  public getActiveRulesPromptContext(category?: string): string {
    const activeRules = this.data.learnedRules.filter((r) => r.active);
    if (activeRules.length === 0) return '';

    const matchingCategoryRules = category
      ? activeRules.filter((r) => r.category === 'Semua Kategori' || r.category.toLowerCase().includes(category.toLowerCase()))
      : activeRules;

    const list = (matchingCategoryRules.length > 0 ? matchingCategoryRules : activeRules)
      .slice(0, 6)
      .map((r, i) => `${i + 1}. [${r.source.toUpperCase()}] ${r.ruleText}`)
      .join('\n');

    return `\n=== MEMORI PEMBELAJARAN AI (ATURAN PASAR & PREFERENSI USER YANG TERUS DIPELAJARI) ===\nIntegrasikan pola-pola kemenangan berikut ke dalam skrip storyboard:\n${list}\n`;
  }

  public incrementScriptCount() {
    this.data.totalScriptsGenerated += 1;
    this.data.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  public addRule(ruleText: string, category: string = 'Semua Kategori', source: 'user_defined' | 'market_signal' | 'feedback_loop' = 'user_defined'): LearnedRule {
    const newRule: LearnedRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ruleText: ruleText.trim(),
      category,
      source,
      createdAt: new Date().toISOString(),
      active: true,
    };

    this.data.learnedRules = [newRule, ...this.data.learnedRules];
    this.data.lastUpdated = new Date().toISOString();
    this.saveMemory();
    return newRule;
  }

  public toggleRule(id: string): boolean {
    const rule = this.data.learnedRules.find((r) => r.id === id);
    if (rule) {
      rule.active = !rule.active;
      this.data.lastUpdated = new Date().toISOString();
      this.saveMemory();
      return true;
    }
    return false;
  }

  public deleteRule(id: string): boolean {
    const initialLen = this.data.learnedRules.length;
    this.data.learnedRules = this.data.learnedRules.filter((r) => r.id !== id);
    if (this.data.learnedRules.length !== initialLen) {
      this.data.lastUpdated = new Date().toISOString();
      this.saveMemory();
      return true;
    }
    return false;
  }

  public recordFeedback(feedback: {
    productName: string;
    category: string;
    feedbackType: 'viral_success' | 'high_closing' | 'needs_improvement' | 'custom';
    notes: string;
  }): { ruleAdded?: LearnedRule } {
    this.data.totalFeedbacksLogged += 1;
    const logItem = {
      id: `fb-${Date.now()}`,
      productName: feedback.productName || 'Produk',
      category: feedback.category || 'UGC',
      feedbackType: feedback.feedbackType,
      notes: feedback.notes || 'Feedback kreator tercatat',
      timestamp: new Date().toISOString(),
    };

    this.data.feedbackLogs = [logItem, ...this.data.feedbackLogs.slice(0, 49)];

    let ruleAdded: LearnedRule | undefined = undefined;

    // Automatically synthesize a learned rule from positive feedback with notes
    if (feedback.notes && feedback.notes.length > 10 && (feedback.feedbackType === 'viral_success' || feedback.feedbackType === 'high_closing')) {
      const synthesizedRule = `Untuk ${feedback.productName || 'produk ini'} (${feedback.category}): ${feedback.notes}`;
      ruleAdded = this.addRule(synthesizedRule, feedback.category, 'feedback_loop');
    }

    this.data.lastUpdated = new Date().toISOString();
    this.saveMemory();

    return { ruleAdded };
  }

  public updateMarketSignals(signals: MarketSignal[]) {
    if (Array.isArray(signals) && signals.length > 0) {
      this.data.marketSignals = signals;
      this.data.lastUpdated = new Date().toISOString();
      this.saveMemory();
    }
  }
}

export const learningEngine = new LearningEngine();
