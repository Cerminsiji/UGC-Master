export interface Scene {
  id: string;
  order: number;
  cameraAngle: string;
  visualAction: string;
  popupText: string;
  soundEffect: string;
  dialogVO: string;
  notesMood: string;
  duration: number; // in seconds
}

export interface UGCTemplateCategory {
  id: string;
  name: string;
  iconName: string;
  badgeText: string;
  description: string;
  recommendedDuration: number;
  defaultScenes: Omit<Scene, 'id' | 'order'>[];
}

export interface ProductImageAnalysis {
  extractedName?: string;
  brandName?: string;
  visualAppearance?: string; // kemasan, warna, botol/box, material, logo
  extractedUSP?: string;
  suggestedCategory?: string;
  googleFlowPromptGuide?: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  categoryId: string;
  productName?: string;
  brandName?: string;
  targetAudience?: string;
  productImage?: string; // Base64 or URL of reference product image
  productImageAnalysis?: ProductImageAnalysis;
  visualFocus?: 'mix' | 'hands_only' | 'face' | 'full_body';
  caption?: string; // Auto caption & hashtags (max 150 chars)
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface AIGenerateParams {
  category: string;
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  keySellingPoints?: string;
  tone: string;
  targetDuration: number;
  targetSceneCount?: number; // Up to 9 scenes even for 10s
  visualFocus?: 'mix' | 'hands_only' | 'face' | 'full_body'; // Hands only, face only, full body, or mix
  strictProductConsistency?: boolean; // Google Flow reference match
  antiAiMovement?: boolean; // Real organic human, anti-CGI, anti-cartoon
  productImageBase64?: string; // User reference photo
  productImageAnalysis?: ProductImageAnalysis;
  targetPlatform: string;
  language: 'id' | 'en';
}

export interface AutoDetectResult {
  productName: string;
  category: string;
  productDescription: string;
  targetAudience: string;
  keySellingPoints: string;
  tone: string;
  targetPlatform: string;
  targetDuration: number;
  suggestedCaption?: string;
  visualFocus?: 'mix' | 'hands_only' | 'face' | 'full_body';
  detectedTags?: string[];
  detectionSummary?: string;
  productImageAnalysis?: ProductImageAnalysis;
}

export interface AIHookOption {
  type:
    | 'Visual Shock'
    | 'Negative Hook'
    | 'Curiosity / Question'
    | 'FOMO / Secret'
    | 'Relatable Pain Point'
    | 'Price Spill & Promo'
    | 'Extreme Demo';
  hookDialog: string;
  visualAction: string;
  popupText: string;
  sfx: string;
}

export interface TrendingProduct {
  id: string;
  name: string;
  category: string;
  marketplace: 'TikTok Shop' | 'Shopee Video' | 'Tokopedia' | 'Instagram Reels';
  price: string;
  priceRaw: number;
  priceAnalysis: {
    sweetSpot: string;
    competitorRange: string;
    priceRating: 'Impulse Buying (< Rp99rb)' | 'Mid Sweet Spot' | 'High Ticket Premium';
    priceAdvantage: string;
  };
  buyerAnalysis: {
    coreNeed: string;
    painPoint: string;
    targetPersona: string;
    triggerReason: string;
  };
  commissionAnalysis: {
    commissionRate: string; // e.g. "12% - 15%"
    estProfitPer100Sales: string; // e.g. "Rp 1.185.000"
    affiliateRating: 'Sangat Menguntungkan 🔥' | 'Stabil & Cuan 💰' | 'High Volume ⚡';
    closingDifficulty: 'Mudah Closing (Impulse)' | 'Sedang' | 'Butuh Edukasi';
  };
  trendVelocity: 'Peak Viral 🔥' | 'Sedang Meledak 🚀' | 'Evergreen Terlaris ⭐';
  salesVolume: string; // e.g. "18.4K terjual/minggu"
  rating: number;
  suggestedHook: string;
  suggestedUSP: string;
  suggestedCaption: string;
  recommendedCategory: string;
}
