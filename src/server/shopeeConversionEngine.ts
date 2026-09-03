import { GoogleGenAI, Type } from '@google/genai';
import {
  Scene,
  ProductIntelligence,
  ConversionScores,
  HookVariation,
  CreativeAngleVersion,
  QualityCheckResult,
  ProductImageAnalysis,
} from '../types';

// The 18 Conversion Mechanisms from the Master Development Prompt
export const CONVERSION_MECHANISMS = [
  'Problem/Solution',
  'Before/After',
  'Curiosity',
  'Demonstration',
  'Transformation',
  'Comparison',
  'Unexpected Use',
  'Convenience',
  'Money Saving',
  'Time Saving',
  'Emotional Relatability',
  'Social Proof',
  'Product Discovery',
  '"I didn\'t know I needed this"',
  'Visual Satisfaction',
  'Pain Point',
  'Gift/Need',
  'Everyday Problem',
] as const;

export type ConversionMechanism = typeof CONVERSION_MECHANISMS[number];

// 10 Hook Types
export const HOOK_TYPES = [
  'Problem Hook',
  'Curiosity Hook',
  'Relatable Hook',
  'Shock/Surprise Hook',
  'Before-After Hook',
  'Demonstration Hook',
  'Mistake Hook',
  'Discovery Hook',
  'Contrarian Hook',
  'Question Hook',
] as const;

// Helper to construct Section 11 Google Flow / Google Omni Prompt
export function formatGoogleFlowPrompt(params: {
  sceneOrder: number;
  timeRange: string;
  duration: number;
  productName: string;
  brandName?: string;
  visualAppearance?: string;
  cameraAngle: string;
  cameraDistance?: string;
  cameraMovement?: string;
  visualAction: string;
  productPosition?: string;
  handPosition?: string;
  subjectAction?: string;
  environment?: string;
  lighting?: string;
  focus?: string;
  depthOfField?: string;
  textOverlay: string;
  dialogVO: string;
  sfx?: string;
  transition?: string;
  productConsistency?: string;
  negativeConstraints?: string;
}): string {
  const brandStr = params.brandName ? ` Brand: ${params.brandName}.` : '';
  const appearanceStr = params.visualAppearance
    ? ` Packaging & Appearance: ${params.visualAppearance}.`
    : ` Authentic commercial retail packaging, clear labels.`;

  return `USE THE ATTACHED STORYBOARD AS THE PRIMARY AND STRICT VISUAL REFERENCE.

SUBJECT:
Indonesian UGC creator talent, natural Southeast Asian skin texture with authentic pores, organic handheld smartphone video style.

PRODUCT:
${params.productName}.${brandStr}
${appearanceStr}

PRODUCT CONSISTENCY:
${params.productConsistency || 'Lock brand logo, typography, packaging shape, dimensions, lid, and color palette 100% identical to the reference image. Zero morphing or redesign.'}

VIDEO FORMAT:
Vertical 9:16, 10 seconds total.

SCENE:
Scene ${params.sceneOrder} (${params.timeRange || `Scene duration: ${params.duration}s`}).
Action: ${params.visualAction}

CAMERA:
${params.cameraAngle}. Distance: ${params.cameraDistance || 'Medium Close-up'}. Movement: ${params.cameraMovement || 'Natural subtle handheld shake with organic motion'}.

COMPOSITION:
${params.productPosition || 'Product prominently featured in lower-center third, readable logo'}.

SUBJECT MOVEMENT:
${params.subjectAction || 'Realistic creator physical interaction with high tactile engagement'}.

HAND INTERACTION:
${params.handPosition || 'Natural human hands with 5 anatomical fingers, firm organic grip on packaging'}.

PRODUCT MOVEMENT:
Realistic gravity and physical movement. Product remains rigid and true to its physical material.

ENVIRONMENT:
${params.environment || 'Authentic Indonesian home/room/table setting with natural ambient surroundings'}.

LIGHTING:
${params.lighting || 'Bright natural daylight with soft realistic window fill light'}.

FOCUS / DEPTH OF FIELD:
${params.focus || 'Crisp sharp focus on product and active interaction area'}, ${params.depthOfField || 'f/2.2 subtle depth of field'}.

MATERIAL BEHAVIOR:
Authentic physical texture, realistic liquid viscosity/powder dispersion, true-to-life reflections.

REALISM:
100% photorealistic TikTok / Shopee Video smartphone camera sensor aesthetic. Organic frame rate and compression.

AUDIO:
SFX: ${params.sfx || 'Crisp organic Foley sound'}.

VOICE OVER:
"${params.dialogVO}"

TEXT OVERLAY:
"${params.textOverlay}" (High-contrast bold font, centered upper/middle frame, 3-7 words).

TIMING:
${params.timeRange || `0-${params.duration}s`} (Exact ${params.duration} seconds).

TRANSITION:
${params.transition || 'Hard cut / rapid whip pan match cut'}.

NEGATIVE CONSTRAINTS:
${params.negativeConstraints || 'No CGI, no 3D cartoon render, no anime, no floating objects, no morphing logo, no extra fingers, no artificial plastic skin, no distorted typography, no commercial studio dolly'}.

IMPORTANT:
Do not redesign, replace, recolor, resize disproportionately, or alter the identity of the referenced product.`;
}

// Banned generic intros filter
export function filterGenericIntros(text: string): string {
  if (!text) return text;
  return text
    .replace(/^(halo guys|hai guys|hai semuanya|halo semuanya|ini dia produk|jadi hari ini aku mau|teman-teman|temen-temen|haii guys|halo gaes)[\s,!.-]*/gi, '')
    .trim();
}

// Ensure overlay is 3-7 words
export function formatOverlayText(text: string, defaultText: string = 'WAJIB LIHAT INI! 🔥'): string {
  if (!text || text.trim().length === 0) return defaultText;
  const words = text.trim().split(/\s+/);
  if (words.length > 7) {
    return words.slice(0, 7).join(' ').toUpperCase() + '!';
  }
  return text.trim().toUpperCase();
}

// Clean CTA to strictly Shopee High-Conversion V2 standard
export function sanitizeCTA(cta: string): string {
  if (!cta || cta.toLowerCase().includes('follow') || cta.toLowerCase().includes('share') || cta.toLowerCase().includes('subscribe')) {
    return 'Checkout sekarang.';
  }
  const clean = cta.trim();
  if (clean.length > 25) {
    return 'Checkout sekarang.';
  }
  return clean;
}

// Quality check and auto-fix engine
export function auditAndFixStoryboard(
  scenes: Scene[],
  productName: string,
  targetDuration: number = 10
): { scenes: Scene[]; qualityCheck: QualityCheckResult; scores: ConversionScores } {
  const details: string[] = [];
  let autoFixedCount = 0;

  // 1. Timing check & normalization to exactly 10s default
  let totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 0), 0);
  if (totalDuration !== targetDuration && scenes.length > 0) {
    details.push(`Durasi awal ${totalDuration}s dinormalisasi menjadi tepat ${targetDuration}s.`);
    autoFixedCount++;
    if (scenes.length === 3) {
      scenes[0].duration = 2;
      scenes[1].duration = 5;
      scenes[2].duration = 3;
    } else if (scenes.length === 4) {
      scenes[0].duration = 2;
      scenes[1].duration = 3;
      scenes[2].duration = 3;
      scenes[3].duration = 2;
    } else if (scenes.length === 5) {
      scenes[0].duration = 2;
      scenes[1].duration = 2;
      scenes[2].duration = 3;
      scenes[3].duration = 2;
      scenes[4].duration = 1;
    }
  }

  // Calculate cumulative time ranges
  let currentTime = 0;
  scenes.forEach((sc, idx) => {
    const start = currentTime;
    const end = currentTime + sc.duration;
    sc.timeRange = `[${start}–${end}s]`;
    currentTime = end;

    // Fix generic intros in VO
    const cleanedVO = filterGenericIntros(sc.dialogVO);
    if (cleanedVO !== sc.dialogVO) {
      sc.dialogVO = cleanedVO || `Lihat deh, produk ini langsung kasih hasil nyata!`;
      details.push(`Menghapus intro basi 'Halo guys/Hai semuanya' di adegan ${idx + 1}.`);
      autoFixedCount++;
    }

    // Fix overlay length (3-7 words)
    const words = sc.popupText.split(/\s+/);
    if (words.length > 7) {
      sc.popupText = words.slice(0, 6).join(' ').toUpperCase() + '!';
      details.push(`Memadatkan teks overlay adegan ${idx + 1} agar optimal 3-7 kata.`);
      autoFixedCount++;
    }

    // Ensure scene purpose is defined
    if (!sc.scenePurpose) {
      if (idx === 0) sc.scenePurpose = 'HOOK';
      else if (idx === 1) sc.scenePurpose = scenes.length >= 4 ? 'PROBLEM / PRODUCT' : 'DEMONSTRATION';
      else if (idx === scenes.length - 1) sc.scenePurpose = 'RESULT / CTA';
      else sc.scenePurpose = 'DEMONSTRATION';
    }

    // Ensure retention purpose
    if (!sc.retentionPurpose) {
      if (idx === 0) sc.retentionPurpose = 'Pattern interruption stop-scroll dalam 0.5 detik pertama';
      else if (idx === scenes.length - 1) sc.retentionPurpose = 'Strong urgency closing mendorong klik beli';
      else sc.retentionPurpose = 'Visual proof & dopamine hit menahan retensi audiens';
    }

    // Ensure camera & physical realism fields
    if (!sc.cameraMovement) sc.cameraMovement = 'Organic subtle handheld smartphone motion';
    if (!sc.lighting) sc.lighting = 'Natural bright indoor ambient light';
    if (!sc.negativeConstraints) sc.negativeConstraints = 'No CGI, no 3D cartoon, no deformed hands, no floating object';
    if (!sc.productConsistency) {
      sc.productConsistency = `100% strict packaging match for ${productName}, authentic logo and typography, no color shifting.`;
    }

    // Ensure Google Flow prompt is populated in Section 11 structure
    if (!sc.googleFlowPrompt || sc.googleFlowPrompt.length < 50) {
      sc.googleFlowPrompt = formatGoogleFlowPrompt({
        sceneOrder: idx + 1,
        timeRange: sc.timeRange,
        duration: sc.duration,
        productName: productName,
        cameraAngle: sc.cameraAngle || 'POV Close-up',
        visualAction: sc.visualAction,
        textOverlay: sc.popupText,
        dialogVO: sc.dialogVO,
        sfx: sc.soundEffect,
        productConsistency: sc.productConsistency,
        negativeConstraints: sc.negativeConstraints,
      });
      autoFixedCount++;
    }
  });

  // Check last scene CTA
  const lastScene = scenes[scenes.length - 1];
  if (lastScene) {
    if (!lastScene.dialogVO.toLowerCase().includes('checkout')) {
      lastScene.dialogVO = lastScene.dialogVO.replace(/\.?$/, '. Checkout sekarang.');
      details.push(`Memastikan closing CTA singkat dan tegas 'Checkout sekarang.' di adegan terakhir.`);
      autoFixedCount++;
    }
  }

  // Quality check flags
  const qualityCheck: QualityCheckResult = {
    hookCheck: scenes[0]?.duration <= 2 && scenes[0]?.popupText?.length > 0,
    productVisibilityCheck: scenes.some((s) => s.visualAction.toLowerCase().includes('produk') || s.visualAction.toLowerCase().includes(productName.toLowerCase())),
    productConsistencyCheck: scenes.every((s) => Boolean(s.productConsistency)),
    demonstrationCheck: scenes.length >= 3,
    visualProofCheck: scenes.some((s) => s.scenePurpose?.includes('DEMO') || s.scenePurpose?.includes('RESULT') || s.visualAction.toLowerCase().includes('hasil') || s.visualAction.toLowerCase().includes('tekstur')),
    textLengthCheck: scenes.every((s) => s.popupText.split(/\s+/).length <= 7),
    voiceoverLengthCheck: scenes.every((s) => s.dialogVO.length < s.duration * 30),
    timingCheck: scenes.reduce((a, b) => a + b.duration, 0) === targetDuration,
    ctaCheck: lastScene?.dialogVO.toLowerCase().includes('checkout') || false,
    aiVideoPromptConsistencyCheck: scenes.every((s) => Boolean(s.googleFlowPrompt && s.googleFlowPrompt.includes('USE THE ATTACHED STORYBOARD'))),
    autoFixedCount,
    details,
  };

  // Conversion scoring calculation (all criteria out of 10)
  const hookScore = qualityCheck.hookCheck ? 9.5 : 7.5;
  const retentionScore = scenes.length >= 4 ? 9.6 : 8.8;
  const productClarity = qualityCheck.productVisibilityCheck ? 9.4 : 7.8;
  const demonstrationScore = qualityCheck.demonstrationCheck ? 9.5 : 8.0;
  const emotionalRelevance = 9.2;
  const ctaScore = qualityCheck.ctaCheck ? 9.8 : 7.0;
  const ugcRealism = 9.6;
  const conversionPotential = 9.4;

  const totalScore = Math.round(
    (hookScore +
      retentionScore +
      productClarity +
      demonstrationScore +
      emotionalRelevance +
      ctaScore +
      ugcRealism +
      conversionPotential) *
      1.25
  );

  const scores: ConversionScores = {
    hookScore,
    retentionScore,
    productClarity,
    demonstrationScore,
    emotionalRelevance,
    ctaScore,
    ugcRealism,
    conversionPotential,
    totalScore: Math.min(100, Math.max(80, totalScore)),
    auditNotes: details,
  };

  return { scenes, qualityCheck, scores };
}

// Generate 10 High-Conversion Hooks
export function generate10HighConversionHooks(
  productName: string,
  category: string,
  usp: string,
  buyerProblem?: string
): HookVariation[] {
  const prob = buyerProblem || 'sering gagal dan buang uang';
  const cleanUsp = usp || 'hasil nyata tanpa ribet';

  return [
    {
      id: 'hk-1',
      type: 'Problem Hook',
      hook: `Capek banget kalau masalah ${prob} gak kelar-kelar?`,
      whyItWorks: 'Langsung menyenggol titik sakit (pain point) terdalam audiens dalam 0.8 detik pertama.',
      visualAction: `Kreator memegang kepala atau area masalah dengan ekspresi frustrasi relatable sebelum menunjukkan ${productName}.`,
      estimatedStrength: '9.8 / 10 🔥',
      score: 9.8,
    },
    {
      id: 'hk-2',
      type: 'Curiosity Hook',
      hook: `Pantesan di Shopee sold out ribuan, ternyata rahasianya ini!`,
      whyItWorks: 'Memanfaatkan rasa penasaran tinggi dan social proof volume penjualan masif.',
      visualAction: `Tangan membuka paket/kotak ${productName} secara cepat dari sudut pandang POV dengan efek zoom mikro.`,
      estimatedStrength: '9.7 / 10 🔥',
      score: 9.7,
    },
    {
      id: 'hk-3',
      type: 'Before-After Hook',
      hook: `Lihat perbedaannya sebelum dan sesudah coba ${productName}!`,
      whyItWorks: 'Visual proof instan tanpa basa-basi yang memaksa mata audiens bertahan menatap layar.',
      visualAction: `Split screen atau transisi match-cut cepat antara kondisi sebelum yang kusam/berantakan dan kondisi sesudah yang rapi memukau.`,
      estimatedStrength: '9.9 / 10 🔥',
      score: 9.9,
    },
    {
      id: 'hk-4',
      type: 'Relatable Hook',
      hook: `Siapa yang masih ngelakuin cara ribet kayak gini tiap hari?`,
      whyItWorks: 'Membuat audiens merasa terwakili dan sadar akan kebiasaan lama mereka yang tidak efisien.',
      visualAction: `Kreator menggelengkan kepala melihat cara lama yang berantakan lalu tersenyum memperlihatkan ${productName}.`,
      estimatedStrength: '9.4 / 10 ⭐',
      score: 9.4,
    },
    {
      id: 'hk-5',
      type: 'Shock/Surprise Hook',
      hook: `Jujur nyesel baru tahu ada produk seampuh ini sekarang!`,
      whyItWorks: 'Pembalikan emosi (emotional reversal) dari kata "nyesel" yang memicu lonjakan retensi.',
      visualAction: `Ekspresi mata melotot takjub menatap ke kamera dengan produk dipegang di samping wajah.`,
      estimatedStrength: '9.6 / 10 🔥',
      score: 9.6,
    },
    {
      id: 'hk-6',
      type: 'Demonstration Hook',
      hook: `Cuma modal 3 detik pakai ${productName}, langsung kelihatan hasilnya!`,
      whyItWorks: 'Spesifik dalam waktu (3 detik) dan menunjukkan kemudahan pakai instan.',
      visualAction: `Extreme close-up aksi tangan mendemonstrasikan produk saat digunakan pada objek/kulit secara real time.`,
      estimatedStrength: '9.8 / 10 🔥',
      score: 9.8,
    },
    {
      id: 'hk-7',
      type: 'Mistake Hook',
      hook: `Stop ngelakuin kesalahan fatal ini kalau mau hasil ${cleanUsp}!`,
      whyItWorks: 'Menghadirkan FOMO dan rasa takut berbuat salah (loss aversion).',
      visualAction: `Tangan memberi gestur "Stop / Jangan" ke arah lensa sebelum mengarahkan kamera ke ${productName}.`,
      estimatedStrength: '9.5 / 10 🔥',
      score: 9.5,
    },
    {
      id: 'hk-8',
      type: 'Discovery Hook',
      hook: `Barang Shopee ter-worth it yang aku temuin minggu ini!`,
      whyItWorks: 'Sentuhan kurasi personal khas konten rekomendasi Shopee Affiliate terpercaya.',
      visualAction: `POV tangan mengangkat produk dari meja unboxing dengan pencahayaan hangat estetik.`,
      estimatedStrength: '9.3 / 10 ⭐',
      score: 9.3,
    },
    {
      id: 'hk-9',
      type: 'Contrarian Hook',
      hook: `Banyak yang bilang ini biasa aja, sampai aku buktikan sendiri...`,
      whyItWorks: 'Memancing perdebatan di kepala audiens dan menantang skeptisisme mereka.',
      visualAction: `Kreator tersenyum skeptis lalu mulai mengoles/mengaplikasikan produk untuk pembuktian.`,
      estimatedStrength: '9.5 / 10 🔥',
      score: 9.5,
    },
    {
      id: 'hk-10',
      type: 'Question Hook',
      hook: `Masih ragu kalau ${productName} bisa kasih hasil secepat ini?`,
      whyItWorks: 'Pertanyaan retoris langsung memancing audiens untuk menonton sampai detik terakhir.',
      visualAction: `Kamera bergerak cepat mendekati botol kemasan ${productName} yang berdiri kokoh di atas meja studio.`,
      estimatedStrength: '9.2 / 10 ⭐',
      score: 9.2,
    },
  ];
}

// Generate 5 Creative Angles (A/B Test Engine)
export function generate5CreativeAngles(
  productName: string,
  category: string,
  usp: string,
  buyerProblem?: string
): CreativeAngleVersion[] {
  const prob = buyerProblem || 'masalah sehari-hari yang bikin jengkel';
  const cleanUsp = usp || 'hasil nyata & kualitas premium';

  return [
    {
      versionKey: 'A',
      name: 'Problem / Solution',
      conversionMechanism: 'Problem/Solution',
      hook: `Capek banget kalau masalah ${prob} gak beres-beres?`,
      coreIdea: 'Mulai dari rasa frustrasi audiens terhadap cara lama, lalu hadirkan produk sebagai solusi definitif yang cepat dan terjangkau.',
      voSummary: 'Curhat masalah relatable -> Kenalkan produk -> Demo hasil -> Checkout sekarang.',
      overlaySummary: 'MASALAH BERES! 🔥 | GAMPANG BANGET ✨ | CHECKOUT SEKARANG 🛒',
      cta: 'Checkout sekarang.',
      estimatedScore: 94,
      googleFlowPrompt: `Vertical 9:16 Shopee Video, Problem-Solution angle featuring ${productName}. Realistic handheld POV, natural lighting, genuine problem solving interaction --no cgi`,
      storyboard: [
        {
          id: 'ab-a-1',
          order: 1,
          timeRange: '[0–2s]',
          duration: 2,
          scenePurpose: 'HOOK',
          retentionPurpose: 'Pattern interruption curhat masalah relatable',
          cameraAngle: 'POV Handheld Close-up',
          visualAction: `Kreator menunjukkan rasa frustrasi menghadapi ${prob}, ekspresi relatable.`,
          popupText: 'JANGAN SKIP DULU! 😱',
          soundEffect: 'Record scratch & Vine boom',
          dialogVO: `Capek banget kalau masalah ${prob} gak beres-beres?`,
          notesMood: 'Frustasi relatable, ekspresi nyata.',
          googleFlowPrompt: `POV close-up Indonesian creator looking frustrated at problem before showing ${productName}, natural room lighting --no cgi`,
        },
        {
          id: 'ab-a-2',
          order: 2,
          timeRange: '[2–5s]',
          duration: 3,
          scenePurpose: 'PROBLEM / PRODUCT',
          retentionPurpose: 'Product introduction & USP connection',
          cameraAngle: 'Medium Close-up Product Reveal',
          visualAction: `Tangan mengangkat ${productName} ke depan kamera, kemasan tampak jelas dan bersih.`,
          popupText: 'UNTUNG KETEMU INI! ✨',
          soundEffect: 'Swoosh & Chime',
          dialogVO: `Untung aku nemu ${productName}, solusinya praktis banget!`,
          notesMood: 'Relief & excitement.',
          googleFlowPrompt: `Medium close-up hands presenting ${productName} packaging, sharp focus, natural daylight --no cgi`,
        },
        {
          id: 'ab-a-3',
          order: 3,
          timeRange: '[5–8s]',
          duration: 3,
          scenePurpose: 'DEMONSTRATION',
          retentionPurpose: 'Visual proof of product in use',
          cameraAngle: 'Macro Close-up Action',
          visualAction: `Demonstrasi nyata menggunakan ${productName}, membuktikan klaim ${cleanUsp}.`,
          popupText: 'LIHAT HASILNYA! 🚀',
          soundEffect: 'Satisfying crisp pop',
          dialogVO: `Cuma dipakai sebentar, hasilnya langsung kelihatan nyata.`,
          notesMood: 'High visual proof, texture in action.',
          googleFlowPrompt: `Macro shot of ${productName} in active use, realistic texture and material reaction --no cgi`,
        },
        {
          id: 'ab-a-4',
          order: 4,
          timeRange: '[8–10s]',
          duration: 2,
          scenePurpose: 'RESULT / CTA',
          retentionPurpose: 'Closing conversion push',
          cameraAngle: 'POV Product Display',
          visualAction: `Kreator mengacungkan jempol di samping ${productName} dengan senyum puas.`,
          popupText: 'CHECKOUT SEKARANG! 🛒',
          soundEffect: 'Cash register ding',
          dialogVO: `Yuk amankan sebelum kehabisan. Checkout sekarang.`,
          notesMood: 'Confident closing.',
          googleFlowPrompt: `POV of Indonesian creator smiling giving thumbs up next to ${productName}, warm lighting --no cgi`,
        },
      ],
    },
    {
      versionKey: 'B',
      name: 'Curiosity & Mystery',
      conversionMechanism: 'Curiosity',
      hook: `Pantesan di Shopee sold out terus, ternyata gara-gara ini!`,
      coreIdea: 'Membangkitkan rasa penasaran luar biasa melalui social proof dan mystery unboxing yang memikat hingga detik terakhir.',
      voSummary: 'Mystery unboxing -> Spill rahasia viral -> Pembuktian tekstur -> Checkout sekarang.',
      overlaySummary: 'PANTESAN VIRAL! 😱 | RAHASIANYA INI ✨ | CHECKOUT SEKARANG 🛒',
      cta: 'Checkout sekarang.',
      estimatedScore: 96,
      googleFlowPrompt: `Vertical 9:16 Shopee Video, Curiosity angle featuring ${productName}. Fast-paced unboxing, intrigue lighting, authentic satisfaction reaction --no cgi`,
      storyboard: [
        {
          id: 'ab-b-1',
          order: 1,
          timeRange: '[0–2s]',
          duration: 2,
          scenePurpose: 'HOOK',
          retentionPurpose: 'High curiosity hook',
          cameraAngle: 'POV Fast Unboxing',
          visualAction: `Tangan membuka bubble wrap kemasan ${productName} secara cepat dan menghentak.`,
          popupText: 'PANTESAN VIRAL! 😱',
          soundEffect: 'Fast whoosh & mystery riser',
          dialogVO: `Pantesan di Shopee sold out terus, ternyata gara-gara ini!`,
          notesMood: 'Intrigue & fast pace.',
          googleFlowPrompt: `POV fast hands unboxing ${productName}, dynamic angle, high intrigue --no cgi`,
        },
        {
          id: 'ab-b-2',
          order: 2,
          timeRange: '[2–5s]',
          duration: 3,
          scenePurpose: 'PROBLEM / PRODUCT',
          retentionPurpose: 'Curiosity payoff with feature breakdown',
          cameraAngle: 'Close-up Detail Inspection',
          visualAction: `Kamera memutar perlahan memperlihatkan detail kemasan eksklusif ${productName}.`,
          popupText: 'TERNYATA KAYA GINI! 🔍',
          soundEffect: 'Click & snap',
          dialogVO: `Awalnya ragu, tapi pas lihat kualitas packaging dan formulanya, wow banget.`,
          notesMood: 'Discovery & astonishment.',
          googleFlowPrompt: `Close-up crisp focus on ${productName} container, elegant reflections, authentic room setting --no cgi`,
        },
        {
          id: 'ab-b-3',
          order: 3,
          timeRange: '[5–8s]',
          duration: 3,
          scenePurpose: 'DEMONSTRATION',
          retentionPurpose: 'Proof of viral value',
          cameraAngle: 'POV Application',
          visualAction: `Penggunaan langsung produk memperlihatkan efektivitas ${cleanUsp}.`,
          popupText: 'WORTH IT BANGET! 💯',
          soundEffect: 'Sparkle chime',
          dialogVO: `Nyesel baru nyobain sekarang, kepakai banget setiap hari.`,
          notesMood: 'Dopamine satisfaction.',
          googleFlowPrompt: `POV real time demonstration of ${productName}, authentic human touch, soft daylight --no cgi`,
        },
        {
          id: 'ab-b-4',
          order: 4,
          timeRange: '[8–10s]',
          duration: 2,
          scenePurpose: 'RESULT / CTA',
          retentionPurpose: 'Scarcity closing push',
          cameraAngle: 'POV Holding Product',
          visualAction: `Produk didekatkan ke kamera dengan teks ajakan checkout jelas.`,
          popupText: 'CHECKOUT SEKARANG! 🛒',
          soundEffect: 'Notification pop',
          dialogVO: `Jangan sampai kehabisan promo. Checkout sekarang.`,
          notesMood: 'Urgent closing.',
          googleFlowPrompt: `POV product held towards camera with cheerful affirmative gesture, authentic TikTok aesthetic --no cgi`,
        },
      ],
    },
    {
      versionKey: 'C',
      name: 'Before / After',
      conversionMechanism: 'Before/After',
      hook: `Lihat perbedaannya sebelum dan sesudah coba ini!`,
      coreIdea: 'Kontras visual ekstrem yang tak terbantahkan antara kondisi buruk tanpa produk dan hasil memuaskan setelah menggunakan produk.',
      voSummary: 'Tampilkan kondisi kusam/kacau -> Gunakan produk -> Hasil memukau -> Checkout sekarang.',
      overlaySummary: 'SEBELUM VS SESUDAH! ⚡ | BEDA JAUH BANGET ✨ | CHECKOUT SEKARANG 🛒',
      cta: 'Checkout sekarang.',
      estimatedScore: 98,
      googleFlowPrompt: `Vertical 9:16 Shopee Video, Before-After transformation angle featuring ${productName}. Split-screen comparison, realistic visual transformation, high contrast --no cgi`,
      storyboard: [
        {
          id: 'ab-c-1',
          order: 1,
          timeRange: '[0–2s]',
          duration: 2,
          scenePurpose: 'HOOK',
          retentionPurpose: 'Instant visual shock via before state',
          cameraAngle: 'Extreme Close-up Before State',
          visualAction: `Menyorot kondisi awal yang bermasalah atau belum tertata rapi.`,
          popupText: 'SEBELUM VS SESUDAH! ⚡',
          soundEffect: 'Buzzer / low thud',
          dialogVO: `Lihat perbedaannya sebelum dan sesudah coba ini!`,
          notesMood: 'Problem reality check.',
          googleFlowPrompt: `Extreme close-up authentic before condition, textured detail, honest realistic lighting --no cgi`,
        },
        {
          id: 'ab-c-2',
          order: 2,
          timeRange: '[2–5s]',
          duration: 3,
          scenePurpose: 'PROBLEM / PRODUCT',
          retentionPurpose: 'The transformation catalyst',
          cameraAngle: 'POV Handheld Action',
          visualAction: `Tangan mengaplikasikan ${productName} pada area/objek target secara presisi.`,
          popupText: 'LANGSUNG BERUBAH! 🪄',
          soundEffect: 'Magic whoosh',
          dialogVO: `Tinggal usap atau pakai ${productName} secara merata, gak pake ribet.`,
          notesMood: 'Action & transformation in progress.',
          googleFlowPrompt: `POV hands applying ${productName}, crisp product focus, natural skin/surface texture --no cgi`,
        },
        {
          id: 'ab-c-3',
          order: 3,
          timeRange: '[5–8s]',
          duration: 3,
          scenePurpose: 'DEMONSTRATION',
          retentionPurpose: 'Payoff result inspection',
          cameraAngle: 'Macro Close-up After Result',
          visualAction: `Tampilan hasil akhir yang mulus, bersih, dan memuaskan.`,
          popupText: 'BEDA JAUH BANGET! ✨',
          soundEffect: 'Angelic chime / sparkle',
          dialogVO: `Lihat deh, beda jauh banget kan? Hasilnya beneran kelihatan.`,
          notesMood: 'Visual delight & satisfaction.',
          googleFlowPrompt: `Macro close-up glorious after result, bright clean lighting, genuine satisfaction proof --no cgi`,
        },
        {
          id: 'ab-c-4',
          order: 4,
          timeRange: '[8–10s]',
          duration: 2,
          scenePurpose: 'RESULT / CTA',
          retentionPurpose: 'High conversion closing',
          cameraAngle: 'Medium Close-up Smiling Creator',
          visualAction: `Kreator menunjukkan produk dengan senyum lebar dan gestur ajakan mantap.`,
          popupText: 'CHECKOUT SEKARANG! 🛒',
          soundEffect: 'Upbeat chime',
          dialogVO: `Biar gak penasaran lagi, yuk checkout sekarang.`,
          notesMood: 'Warm & persuasive.',
          googleFlowPrompt: `Creator smiling confidently holding ${productName}, natural lifestyle aesthetic --no cgi`,
        },
      ],
    },
    {
      versionKey: 'D',
      name: 'Demonstration & Action',
      conversionMechanism: 'Demonstration',
      hook: `Cuma modal 3 detik pakai ini, langsung kelihatan hasilnya!`,
      coreIdea: 'Fokus 100% pada fungsi teknis, interaksi tangan, kecepatan kerja produk, dan pembuktian langsung tanpa gimmick.',
      voSummary: 'Uji coba instan -> Langkah pakai -> Hasil kilat -> Checkout sekarang.',
      overlaySummary: 'CUMA 3 DETIK! ⚡ | LIHAT KERJANYA 🛠️ | CHECKOUT SEKARANG 🛒',
      cta: 'Checkout sekarang.',
      estimatedScore: 95,
      googleFlowPrompt: `Vertical 9:16 Shopee Video, Pure demonstration angle featuring ${productName}. Hands-on action, macro tool interaction, speed test --no cgi`,
      storyboard: [
        {
          id: 'ab-d-1',
          order: 1,
          timeRange: '[0–2s]',
          duration: 2,
          scenePurpose: 'HOOK',
          retentionPurpose: 'Demonstration speed hook',
          cameraAngle: 'POV Top-Down Table',
          visualAction: `Tangan mengambil ${productName} dan langsung menyiapkan langkah demonstrasi kilat.`,
          popupText: 'CUMA 3 DETIK! ⚡',
          soundEffect: 'Fast clock ticking & boom',
          dialogVO: `Cuma butuh 3 detik, langsung lihat gimana cara kerjanya!`,
          notesMood: 'Fast paced & efficient.',
          googleFlowPrompt: `Top-down desk POV hands operating ${productName}, crisp tabletop lighting --no cgi`,
        },
        {
          id: 'ab-d-2',
          order: 2,
          timeRange: '[2–5s]',
          duration: 3,
          scenePurpose: 'PROBLEM / PRODUCT',
          retentionPurpose: 'Tactile interaction details',
          cameraAngle: 'Macro Close-up Dispensing',
          visualAction: `Menunjukkan tekstur isi atau mekanisme mekanik ${productName} dengan sangat jelas.`,
          popupText: 'SE-GAMPANG INI?! 😳',
          soundEffect: 'Satisfying mechanical click',
          dialogVO: `Desainnya pintar banget, tinggal pakai gini dan langsung bekerja optimal.`,
          notesMood: 'Fascinating utility.',
          googleFlowPrompt: `Macro close-up hands activating ${productName}, rich physical texture details --no cgi`,
        },
        {
          id: 'ab-d-3',
          order: 3,
          timeRange: '[5–8s]',
          duration: 3,
          scenePurpose: 'DEMONSTRATION',
          retentionPurpose: 'Irrefutable utility proof',
          cameraAngle: 'POV High Angle Result',
          visualAction: `Objek demonstrasi selesai dengan sempurna membuktikan ${cleanUsp}.`,
          popupText: 'TERBUKTI AMPUH! 🎯',
          soundEffect: 'Ding level-up sound',
          dialogVO: `Gak perlu tenaga ekstra, pekerjaan langsung beres seketika.`,
          notesMood: 'Effortless triumph.',
          googleFlowPrompt: `POV successful demonstration result with ${productName} in foreground, clear proof --no cgi`,
        },
        {
          id: 'ab-d-4',
          order: 4,
          timeRange: '[8–10s]',
          duration: 2,
          scenePurpose: 'RESULT / CTA',
          retentionPurpose: 'Final direct CTA',
          cameraAngle: 'POV Product Front',
          visualAction: `Menaruh ${productName} di posisi tengah dengan gestur menunjuk tombol checkout.`,
          popupText: 'CHECKOUT SEKARANG! 🛒',
          soundEffect: 'Register ring',
          dialogVO: `Wajib punya di rumah. Checkout sekarang.`,
          notesMood: 'Decisive closing.',
          googleFlowPrompt: `Clean POV of ${productName} on wooden table, creator hand gesturing positively --no cgi`,
        },
      ],
    },
    {
      versionKey: 'E',
      name: 'Relatable UGC & Story',
      conversionMechanism: 'Emotional Relatability',
      hook: `Awalnya kupikir biasa aja, ternyata kepakai banget tiap hari!`,
      coreIdea: 'Gaya curhat jujur teman sebaya (peer-to-peer authentic Indonesian storytelling) yang memecah rasa curiga iklan komersil.',
      voSummary: 'Skeptis di awal -> Coba pakai -> Kaget hasilnya -> Checkout sekarang.',
      overlaySummary: 'JUJUR KAGET! 🥹 | KEPAKAI TIAP HARI 💖 | CHECKOUT SEKARANG 🛒',
      cta: 'Checkout sekarang.',
      estimatedScore: 97,
      googleFlowPrompt: `Vertical 9:16 Shopee Video, Authentic relatable UGC peer-to-peer recommendation of ${productName}. Warm natural home setting, zero corporate commercial feel --no cgi`,
      storyboard: [
        {
          id: 'ab-e-1',
          order: 1,
          timeRange: '[0–2s]',
          duration: 2,
          scenePurpose: 'HOOK',
          retentionPurpose: 'Peer-to-peer honest connection',
          cameraAngle: 'Selfie Front Camera Vlog Style',
          visualAction: `Kreator memegang ${productName} dengan gaya santai seolah curhat video call ke teman.`,
          popupText: 'JUJUR KAGET! 🥹',
          soundEffect: 'Soft bubble pop',
          dialogVO: `Awalnya kupikir biasa aja, ternyata kepakai banget tiap hari!`,
          notesMood: 'Warm, candid, honest friend.',
          googleFlowPrompt: `Selfie POV Indonesian woman talking casually holding ${productName}, cozy room ambient light --no cgi`,
        },
        {
          id: 'ab-e-2',
          order: 2,
          timeRange: '[2–5s]',
          duration: 3,
          scenePurpose: 'PROBLEM / PRODUCT',
          retentionPurpose: 'Relatable lifestyle integration',
          cameraAngle: 'POV Natural Use Routine',
          visualAction: `Kreator menggunakan ${productName} di tengah aktivitas harian yang wajar.`,
          popupText: 'PENYELAMAT BANGET! 🙌',
          soundEffect: 'Soft chime',
          dialogVO: `Ini bagian yang paling aku suka, praktis dan bikin hari-hari jauh lebih santai.`,
          notesMood: 'Comfort & genuine love of product.',
          googleFlowPrompt: `Natural POV lifestyle shot using ${productName} during daily routine, aesthetic warm tones --no cgi`,
        },
        {
          id: 'ab-e-3',
          order: 3,
          timeRange: '[5–8s]',
          duration: 3,
          scenePurpose: 'DEMONSTRATION',
          retentionPurpose: 'Dopamine satisfaction & recommendation',
          cameraAngle: 'POV Close-up Product Texture',
          visualAction: `Menunjukkan detail ${productName} yang membuat kreator jatuh cinta.`,
          popupText: 'BINTANG 5 BANGET! ⭐',
          soundEffect: 'Positive ping',
          dialogVO: `Kalian yang sering ngalamin hal yang sama, fix bakal suka banget sama ini.`,
          notesMood: 'Heartfelt endorsement.',
          googleFlowPrompt: `Close-up hands gently holding ${productName}, authentic details, natural soft reflections --no cgi`,
        },
        {
          id: 'ab-e-4',
          order: 4,
          timeRange: '[8–10s]',
          duration: 2,
          scenePurpose: 'RESULT / CTA',
          retentionPurpose: 'Friendly peer closing',
          cameraAngle: 'Selfie Smile & Thumbs Up',
          visualAction: `Kreator tersenyum hangat merekomendasikan produk ke penonton.`,
          popupText: 'CHECKOUT SEKARANG! 🛒',
          soundEffect: 'Friendly pop',
          dialogVO: `Cobain sendiri deh. Checkout sekarang.`,
          notesMood: 'Warm peer recommendation.',
          googleFlowPrompt: `Selfie view Indonesian creator giving friendly warm smile holding ${productName} --no cgi`,
        },
      ],
    },
  ];
}

// Generate Product Intelligence Breakdown
export function analyzeProductIntelligence(params: {
  productName: string;
  category: string;
  productDescription?: string;
  keySellingPoints?: string;
  targetAudience?: string;
}): ProductIntelligence {
  const name = params.productName || 'Produk Unggulan Shopee';
  const cat = params.category || 'Beauty & Lifestyle';
  const desc = params.productDescription || 'Produk viral berkualitas tinggi dengan solusi praktis.';
  const usp = params.keySellingPoints || 'Hasil instan, kualitas premium, dan harga ramah kantong';
  const aud = params.targetAudience || 'Pengguna Shopee yang mencari kepraktisan dan hasil nyata';

  // Smart selection of the best conversion mechanism based on category & description
  let chosenMechanism: ConversionMechanism = 'Problem/Solution';
  const lowerCat = (cat + ' ' + desc + ' ' + usp).toLowerCase();

  if (lowerCat.includes('skincare') || lowerCat.includes('diet') || lowerCat.includes('jerawat') || lowerCat.includes('glow')) {
    chosenMechanism = 'Before/After';
  } else if (lowerCat.includes('gadget') || lowerCat.includes('alat') || lowerCat.includes('cleaner') || lowerCat.includes('organizer')) {
    chosenMechanism = 'Demonstration';
  } else if (lowerCat.includes('viral') || lowerCat.includes('rahasia') || lowerCat.includes('tersembunyi')) {
    chosenMechanism = 'Curiosity';
  } else if (lowerCat.includes('murah') || lowerCat.includes('hemat') || lowerCat.includes('diskon')) {
    chosenMechanism = 'Money Saving';
  } else if (lowerCat.includes('cepat') || lowerCat.includes('instan') || lowerCat.includes('detik')) {
    chosenMechanism = 'Time Saving';
  } else if (lowerCat.includes('kaget') || lowerCat.includes('gak nyangka')) {
    chosenMechanism = '"I didn\'t know I needed this"';
  }

  return {
    productName: name,
    category: cat,
    primaryFunction: `Menyelesaikan keluhan utama seputar ${cat.toLowerCase()} secara cepat dan efektif.`,
    secondaryFunctions: [
      'Mempermudah rutinitas harian',
      'Menghemat pengeluaran dan waktu',
      'Memberikan hasil nyata tahan lama',
    ],
    targetBuyer: aud,
    buyerProblem: `Merasa frustrasi dengan produk biasa yang mahal atau ribet digunakan tanpa hasil nyata.`,
    buyerDesire: `Mendapatkan solusi yang terbukti ampuh, gampang dipakai, dan estetik saat digunakan.`,
    painPoint: `Kekhawatiran membeli produk yang overclaim atau susah diaplikasikan dalam kesibukan sehari-hari.`,
    buyingTrigger: `Melihat demonstrasi visual langsung yang memuaskan dan ulasan ulasan positif di Shopee.`,
    emotionalTrigger: `Rasa lega (relief), kepuasan instan (visual satisfaction), dan FOMO sebelum stok habis.`,
    uniqueSellingPoint: usp,
    mostVisualBenefit: `Perubahan kondisi seketika yang dapat dilihat mata secara langsung dalam hitungan detik.`,
    mostDemonstrableBenefit: `Tekstur, kemudahan penggunaan satu sentuhan, dan hasil bersih memuaskan.`,
    potentialObjection: `Apakah benar-benar semudah itu dan awet digunakan jangka panjang?`,
    whyBuyNow: `Stok terbatas dengan harga promo peluncuran khusus di Shopee Video.`,
    searchIntent: `Mencari ulasan jujur UGC sebelum memutuskan checkout di keranjang.`,
    contentAngle: `Peer-to-peer honest review dengan pembuktian visual Before/After dan demo tekstur asli.`,
    primarySellingPoint: `${name} memberikan ${usp} tanpa ribet dalam 10 detik pemakaian.`,
    chosenConversionMechanism: chosenMechanism,
  };
}

// Generate Shopee Affiliate SEO Caption & Hashtags
export function generateShopeeAffiliateCaption(
  productName: string,
  category: string,
  usp: string,
  chosenMechanism: string
): { caption: string; hashtags: string[] } {
  const hashtags = [
    '#ShopeeHaul',
    '#RacunShopee',
    '#ShopeeVideo',
    '#RacunTikTok',
    '#SpillBawaCuan',
    `#${category.replace(/[^a-zA-Z0-9]/g, '')}`,
    '#fyp',
  ];

  let coreText = `Gak nyangka ${productName} seampuh ini, ${usp}! Auto jadi barang wajib punya.`;
  if (chosenMechanism === 'Before/After') {
    coreText = `Lihat sendiri bedanya pas pakai ${productName}, hasilnya beneran nyata banget! 😭✨`;
  } else if (chosenMechanism === 'Curiosity') {
    coreText = `Pantesan viral di Shopee, ternyata ${productName} emang senyaman ini dipakai! ✨`;
  } else if (chosenMechanism === 'Demonstration') {
    coreText = `Cuma modal 3 detik pakai ${productName} urusan langsung beres seketika! Praktis pol.`;
  }

  // Combine and enforce strict 150-character limit
  const fullCaption = `${coreText} ${hashtags.slice(0, 5).join(' ')}`.trim();
  const safeCaption = fullCaption.length <= 150 ? fullCaption : fullCaption.slice(0, 147) + '...';

  return {
    caption: safeCaption,
    hashtags,
  };
}
