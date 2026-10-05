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

export interface HookVariant {
  id: string;
  name: string; // e.g. "Varian A (FOMO)", "Varian B (Visual Shock)"
  type: string;
  dialogVO: string;
  visualAction: string;
  popupText: string;
  soundEffect: string;
  duration: number;
}

export interface ShotItem {
  id: string;
  type: 'A-Roll (Talent/Muka)' | 'B-Roll (Produk/Tangan)' | 'Detail Tekstur/Unboxing' | 'Audio Foley/SFX';
  description: string;
  sceneRef: number; // e.g. Adegan 1
  propsNeeded?: string;
  isCompleted: boolean;
}

export interface StoryboardProject {
  id: string;
  title: string;
  categoryId: string;
  productName?: string;
  brandName?: string;
  targetAudience?: string;
  caption?: string; // Auto caption & hashtags (max 150 chars)
  scenes: Scene[];
  hookVariants?: HookVariant[];
  shotList?: ShotItem[];
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
  targetSceneCount?: number;
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
  detectedTags?: string[];
  detectionSummary?: string;
}

export interface AIHookOption {
  type: 'Visual Shock' | 'Negative Hook' | 'Curiosity / Question' | 'FOMO / Secret' | 'Relatable Pain Point';
  hookDialog: string;
  visualAction: string;
  popupText: string;
  sfx: string;
}

export interface RateCardConfig {
  creatorTier: 'Pemula (1k-10k)' | 'Nano (10k-50k)' | 'Micro (50k-250k)' | 'Mid-Tier (250k+)';
  basePrice: number;
  videoCount: number;
  hookCount: number; // extra hook variants
  hasRawFootage: boolean;
  usageRightsDays: 0 | 30 | 60 | 90 | 180 | 365;
  hasSparkCode: boolean;
  fastDelivery: boolean;
  notes?: string;
}

export type StoryboardViewMode = 'cards' | 'table' | 'phone_preview' | 'shot_list' | 'rate_card';
