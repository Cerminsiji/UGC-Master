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
  googleFlowPrompt?: string; // Prompt for Google Flow AI image/video generator
  
  // UGC Master V2.0 Fields
  timeRange?: string; // e.g. "[0–2s]"
  scenePurpose?: string; // "HOOK" | "PROBLEM / PRODUCT" | "DEMONSTRATION" | "RESULT / CTA"
  retentionPurpose?: string; // Purpose for viewer retention & stop scroll
  cameraDistance?: string; // "Close-up", "POV Macro", "Medium Shot", "Extreme Close-up"
  cameraMovement?: string; // "Subtle organic handheld shake", "Quick push-in"
  productPosition?: string; // Placement of product in frame
  handPosition?: string; // Hand interaction details
  subjectAction?: string; // Action by talent/creator
  facialExpression?: string; // If creator's face is shown
  environment?: string; // Lighting & background set
  lighting?: string; // Natural light, studio softbox, etc.
  focus?: string; // Point of focus
  depthOfField?: string; // Shallow depth of field, etc.
  transition?: string; // Match cut, whip pan, etc.
  productConsistency?: string; // Strict packaging & logo consistency details
  physicalConsistency?: string; // Organic realistic physics
  negativeConstraints?: string; // Anti-CGI, no deformities, no morphing
}

export interface ProductIntelligence {
  productName: string;
  category: string;
  primaryFunction: string;
  secondaryFunctions?: string[];
  targetBuyer: string;
  buyerProblem: string;
  buyerDesire: string;
  painPoint: string;
  buyingTrigger: string;
  emotionalTrigger: string;
  uniqueSellingPoint: string;
  mostVisualBenefit: string;
  mostDemonstrableBenefit: string;
  potentialObjection: string;
  whyBuyNow: string;
  searchIntent: string;
  contentAngle: string;
  primarySellingPoint: string; // The single strongest reason to buy
  chosenConversionMechanism: string; // One of the 18 conversion mechanisms
}

export interface ConversionScores {
  hookScore: number; // 0-10
  retentionScore: number; // 0-10
  productClarity: number; // 0-10
  demonstrationScore: number; // 0-10
  emotionalRelevance: number; // 0-10
  ctaScore: number; // 0-10
  ugcRealism: number; // 0-10
  conversionPotential: number; // 0-10
  totalScore: number; // 0-100
  auditNotes?: string[];
}

export interface QualityCheckResult {
  hookCheck: boolean;
  productVisibilityCheck: boolean;
  productConsistencyCheck: boolean;
  demonstrationCheck: boolean;
  visualProofCheck: boolean;
  textLengthCheck: boolean;
  voiceoverLengthCheck: boolean;
  timingCheck: boolean;
  ctaCheck: boolean;
  aiVideoPromptConsistencyCheck: boolean;
  autoFixedCount: number;
  details: string[];
}

export interface HookVariation {
  id: string;
  hook: string;
  type:
    | 'Problem Hook'
    | 'Curiosity Hook'
    | 'Relatable Hook'
    | 'Shock/Surprise Hook'
    | 'Before-After Hook'
    | 'Demonstration Hook'
    | 'Mistake Hook'
    | 'Discovery Hook'
    | 'Contrarian Hook'
    | 'Question Hook'
    | string;
  whyItWorks: string;
  visualAction: string;
  estimatedStrength: string;
  score: number;
}

export interface CreativeAngleVersion {
  versionKey: 'A' | 'B' | 'C' | 'D' | 'E';
  name: string; // "Problem/Solution" | "Curiosity" | "Before/After" | "Demonstration" | "Relatable UGC"
  hook: string;
  coreIdea: string;
  storyboard: Scene[];
  voSummary: string;
  overlaySummary: string;
  cta: string;
  googleFlowPrompt: string;
  conversionMechanism: string;
  estimatedScore: number;
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

  // UGC Master V2.0 additions
  platform?: 'Shopee Video' | 'TikTok Shop' | 'Instagram Reels';
  creativeStrategy?: string; // Chosen mechanism & angle
  productIntelligence?: ProductIntelligence;
  conversionScores?: ConversionScores;
  qualityCheck?: QualityCheckResult;
  creativeAngles?: CreativeAngleVersion[];
  selectedAngleKey?: 'A' | 'B' | 'C' | 'D' | 'E';
  hashtags?: string[];
  primaryHook?: string;
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

export interface TrendingSignals {
  salesGrowth: string; // e.g. "+145% (7d)" or "DATA UNAVAILABLE"
  salesVelocity: string; // e.g. "820 pcs/hari" or "DATA UNAVAILABLE"
  trend7Day: string; // e.g. "+82%" or "DATA UNAVAILABLE"
  trend30Day: string; // e.g. "+210%" or "DATA UNAVAILABLE"
  price: string;
  sales: string; // e.g. "42.8K terjual" or "DATA UNAVAILABLE"
  rating: number | string; // 4.9 or "DATA UNAVAILABLE"
  reviewCount: string; // e.g. "12.4K ulasan" or "DATA UNAVAILABLE"
  contentCompetition: 'LOW' | 'MODERATE' | 'HIGH' | 'SATURATED' | string;
  videoCompetition: string; // e.g. "48 video aktif" or "DATA UNAVAILABLE"
  sellerQuality: string; // e.g. "Shopee Mall / Star+" or "DATA UNAVAILABLE"
  commissionPotential: string; // e.g. "15% (~Rp 8.250/pcs)" or "DATA UNAVAILABLE"
  demoPotential: number; // 0-10
  repeatPurchasePotential: 'LOW' | 'MEDIUM' | 'HIGH' | string;
}

export type DataFreshnessStatus = 'VERIFIED' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
export type TrendVelocityType = 'BREAKOUT' | 'RISING' | 'STABLE' | 'COOLING' | 'DECLINING';
export type PlatformFilterType = 'ALL' | 'SHOPEE' | 'SHOPEE VIDEO' | 'SHOPEE LIVE' | 'SOCIAL MEDIA';
export type DataPeriodType = 'TODAY' | '3 DAYS' | '7 DAYS' | '30 DAYS';
export type QuickFilterType = 'ALL' | 'TRENDING' | 'RISING' | 'LOW_COMPETITION' | 'HIGH_AFFILIATE' | 'HIGH_VIDEO_POTENTIAL';

export interface TrendingProduct {
  id: string;
  name: string;
  brandName?: string;
  category: string;
  marketplace: 'Shopee Video' | 'Shopee' | 'Shopee Live' | 'TikTok Shop' | 'Tokopedia' | 'Instagram Reels' | 'Lazada' | string;
  marketplaceUrl?: string; // Direct real verification link
  isVerifiedReal?: boolean;
  productImage?: string;
  price: string;
  priceRaw: number;

  // V2.0 Core Metrics & Scoring
  opportunityScore: number; // 0-100 (UGC Master Opportunity Score)
  trendScore: number; // 0-100
  trendVelocity: TrendVelocityType | string; // 'BREAKOUT' | 'RISING' | 'STABLE' | 'COOLING' | 'DECLINING'
  salesVolume: string; // e.g. "18.4K terjual" or "DATA UNAVAILABLE"
  rating: number | string;
  reviewCount?: string;

  // Signals
  signals: TrendingSignals;

  // Data Integrity & Transparency
  dataFreshness: DataFreshnessStatus;
  freshnessText: string; // e.g. "Verified — 2 hours ago"
  source: string; // e.g. "Shopee Video", "Shopee", "THIRD-PARTY DATA"
  sourceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdated: string;
  isAiInference?: boolean;
  trendAlert?: string; // e.g. "PRODUCT JUST STARTED RISING" | "CONTENT GAP FOUND" | "OPPORTUNITY SCORE INCREASED"

  // Strategic Angles
  bestContentAngle: string;
  contentGap: string;
  demoPotentialScore: number; // 0-10
  impulseBuyScore: number; // 0-10

  // Deep Analysis Backwards-Compatible
  priceAnalysis?: {
    sweetSpot: string;
    competitorRange: string;
    priceRating: 'Impulse Buying (< Rp99rb)' | 'Mid Sweet Spot' | 'High Ticket Premium' | string;
    priceAdvantage: string;
  };
  buyerAnalysis?: {
    coreNeed: string;
    painPoint: string;
    targetPersona: string;
    triggerReason: string;
    buyerIntent?: string;
  };
  commissionAnalysis?: {
    commissionRate: string; // e.g. "12% - 15%"
    estProfitPer100Sales: string; // e.g. "Rp 1.185.000"
    affiliateRating: 'Sangat Menguntungkan 🔥' | 'Stabil & Cuan 💰' | 'High Volume ⚡' | string;
    closingDifficulty: 'Mudah Closing (Impulse)' | 'Sedang' | 'Butuh Edukasi' | string;
  };
  suggestedHook: string;
  suggestedUSP: string;
  suggestedCaption: string;
  recommendedCategory: string;
}

export interface WatchlistProduct {
  id: string;
  productId: string;
  product: TrendingProduct;
  firstSeen: string;
  lastChecked: string;
  trend: TrendVelocityType | string;
  previousScore: number;
  currentScore: number;
  scoreChange: number; // e.g. +9
}

export interface WatchlistItem {
  product: TrendingProduct;
  firstSeenDate: string;
  lastCheckedDate: string;
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  trendStatus: TrendVelocityType | string;
}

export type RealCheckVerdict =
  | '🔥 TEST NOW'
  | '🟢 HIGH POTENTIAL'
  | '🟡 WORTH TESTING'
  | '🟠 WATCH'
  | '🔴 SKIP';

export interface MarketRealCheckResult {
  productName: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  discount: string;
  sales: string;
  rating: string | number;
  reviewCount: string;
  sellerRating: string;
  sellerFollowers: string;
  productVariants: string;
  commission: string;
  commissionXtra: string;
  freeSample: string;
  productAvailability: string;
  shippingInfo: string;
  productContent: string;
  productImage?: string;
  marketplaceUrl?: string;

  // Competition Analysis
  competingProductsCount: string;
  competingVideosCount: string;
  searchSaturation: 'LOW' | 'MODERATE' | 'HIGH' | 'SATURATED';
  sellerCount: string;
  priceCompetition: 'LOW' | 'MODERATE' | 'HIGH';
  brandDominance: 'LOW' | 'MODERATE' | 'HIGH';
  contentSaturation: 'LOW' | 'MODERATE' | 'HIGH' | 'SATURATED';

  // Content Competition & Content Gap Engine
  angleSaturation: 'ANGLE SATURATION HIGH' | 'CONTENT GAP DETECTED';
  missingAngles: string[];
  contentGapSummary: string;

  // Buyer Intent & Product Video Potential
  buyerIntent:
    | 'PROBLEM AWARE'
    | 'PRODUCT AWARE'
    | 'SOLUTION AWARE'
    | 'PRICE SENSITIVE'
    | 'CONVENIENCE DRIVEN'
    | 'TREND DRIVEN'
    | 'IMPULSE BUY'
    | 'REPEAT BUY';
  demoPotential: number; // 0-10
  demoExplanation: string;
  impulseBuyScore: number; // 0-10
  affiliatePotentialScore: number; // 0-100
  trustScore: number; // 0-100

  // 8 Component Scoring Breakdown
  scoringComponents: {
    trendScore: number; // 20%
    demand: number; // 15%
    competition: number; // 15%
    contentGap: number; // 15%
    videoPotential: number; // 15%
    affiliateValue: number; // 10%
    trust: number; // 5%
    priceAffinity: number; // 5%
  };
  opportunityScore: number; // 0-100 (Weighted total)
  verdict: RealCheckVerdict;
  bestContentAngle: string;

  // Smart Recommendation
  whyThisProduct: string[]; // 3 bullet points
  mainRisk: string[]; // 1-3 bullet points
  bestHooks: string[]; // 3 hooks
  bestVideoAngle: string; // 1 angle
  tenSecondVideoIdea: string; // 1 concise concept
  recommended: 'YES' | 'WATCH' | 'NO';

  // Data Integrity & Source
  source: string;
  lastUpdated: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isAiInference: boolean;
  unverifiedFields: string[];
}


export interface LearnedRule {
  id: string;
  ruleText: string;
  category: string;
  source: 'user_defined' | 'market_signal' | 'feedback_loop';
  createdAt: string;
  active: boolean;
}

export interface MarketSignal {
  id: string;
  marketplace: string;
  trendName: string;
  insight: string;
  detectedAt: string;
  confidenceScore: number;
}

export interface CreatorLearningMemory {
  totalScriptsGenerated: number;
  totalFeedbacksLogged: number;
  learnedRules: LearnedRule[];
  marketSignals: MarketSignal[];
  preferredVisualFocus: string;
  topConvertingHooks: string[];
  winningPriceBracket: string;
  lastUpdated: string;
}

export interface GoogleFlowScenePrompt {
  sceneOrder: number;
  cameraAngle: string;
  visualAction: string;
  dialogVO: string;
  popupText: string;
  googleFlowPrompt: string;
  negativePrompt?: string;
}

export interface TrackedProductRecord {
  id: string;
  name: string;
  brandName?: string;
  category: string;
  productDescription?: string;
  keySellingPoints?: string;
  targetAudience?: string;
  price?: string;
  sourceUrl?: string;
  referenceImage?: string; // base64 or url
  productImageAnalysis?: ProductImageAnalysis;
  googleFlowMasterPrompt: string;
  googleFlowScenePrompts: GoogleFlowScenePrompt[];
  caption?: string; // Viral caption under 150 chars without cart CTA
  tags?: string[];
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

