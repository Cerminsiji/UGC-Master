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
  imageUrl?: string; // Optional image reference/product photo for this scene
  // Google Flow AI & Video Generation Engine parameters
  flowSecretCode?: string; // e.g. "/orbit360", "/dollyin", "/macro_texture", "/tracking_follow"
  cameraMovement?: string; // e.g. "Smooth 360° orbital rotation around subject"
  flowPrompt?: string; // Full structured hidden prompt optimized for Google Flow / Veo / AI Video
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
  productImageUrl?: string; // Uploaded product photo reference
  productLinkOrNotes?: string; // Stored product link & notes from AI Generate input
  cameraStyle?: string; // Selected Camera Style & Cinematography direction
  visualFraming?: string; // 'hands_pov' | 'face_closeup' | 'full_body' | 'mix_framing'
  marketingFramework?: string; // Marketing conversion framework (AIDA, PAS, BAB, Unboxing, FOMO)
  hookStrategy?: string; // Selected hook strategy
  ctaPreset?: string; // Selected call to action style
  scenes: Scene[];
  hookVariants?: HookVariant[];
  shotList?: ShotItem[];
  createdAt: string;
  updatedAt: string;
}

export type VisualFramingType = 'hands_pov' | 'face_closeup' | 'full_body' | 'mix_framing';

export interface AIGenerateParams {
  category: string;
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  keySellingPoints?: string;
  productLinkOrNotes?: string; // Stored product link or description
  tone: string;
  cameraStyle?: string; // e.g. "Kombinasi Dinamis (Rekomendasi AI Otomatis)", "Handheld Vlog & Casual Selfie", etc.
  visualFraming?: VisualFramingType | string; // 'hands_pov' | 'face_closeup' | 'full_body' | 'mix_framing'
  marketingFramework?: string; // e.g. "aida", "pas", "bab", "unboxing", "fomo_urgency"
  hookStrategy?: string; // e.g. "curiosity_gap", "relatable_pain", "shock_reaction", "secret_hack", "direct_benefit"
  ctaPreset?: string; // Call to Action preference
  targetDuration: number;
  targetSceneCount?: number;
  targetPlatform: string;
  language: 'id' | 'en';
  productImage?: string; // Base64 data URL or image link
}

export interface AutoDetectResult {
  productName: string;
  category: string;
  productDescription: string;
  targetAudience: string;
  keySellingPoints: string;
  tone: string;
  cameraStyle?: string;
  cameraStyleReason?: string;
  visualFraming?: string;
  targetPlatform: string;
  targetDuration: number;
  suggestedCaption?: string;
  detectedTags?: string[];
  detectionSummary?: string;
}

export interface GoogleUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
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

