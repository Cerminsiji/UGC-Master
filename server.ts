import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// List of supported Gemini models with automatic cascading fallback (fastest, high-quota & stable)
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

// In-memory cache & Rate-Limit Circuit Breaker
let rateLimitCooldownUntil = 0;
const promptResponseCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins cache

export function isRateLimited(): boolean {
  return Date.now() < rateLimitCooldownUntil;
}

export function triggerRateLimitCooldown(ms = 8000) {
  rateLimitCooldownUntil = Date.now() + ms;
  console.log(`[Rate Limit Guard] Cooldown active for ${Math.round(ms / 1000)}s`);
}

// Lazy-safe Gemini AI client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Request timed out'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms)),
  ]);
}

// High-speed multi-model generator with clean config & strict timeouts (default 7.5s per candidate)
async function generateWithFallback(
  prompt: string,
  config: any,
  systemInstruction?: string,
  timeoutMs = 7500
): Promise<string | null> {
  // Check cache first to save quota
  const cacheKey = `${prompt}__${JSON.stringify(config || {})}__${systemInstruction || ''}`;
  const cached = promptResponseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.text;
  }

  // If in rate limit cooldown, smoothly yield for smart fallback
  if (isRateLimited()) {
    console.log('[Gemini AI] Rate limit cooldown active. Yielding for smart local engine.');
    return null;
  }

  const ai = getGeminiClient();
  if (!ai) return null;

  const requestConfig = {
    ...config,
    ...(systemInstruction ? { systemInstruction } : {}),
  };

  let allCandidatesQuotaExhausted = true;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: requestConfig,
        }),
        timeoutMs,
        `Timeout on model ${model}`
      );

      const text = response.text?.trim();
      if (text) {
        allCandidatesQuotaExhausted = false;
        promptResponseCache.set(cacheKey, { text, timestamp: Date.now() });
        return text;
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuota =
        err?.status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('Quota exceeded') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('rate limit') ||
        errMsg.includes('Rate limit') ||
        errMsg.includes('Rate exceeded');

      const isUnavailable =
        err?.status === 503 ||
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand');

      if (!isQuota) {
        allCandidatesQuotaExhausted = false;
      }

      if (isQuota) {
        console.log(`[Gemini AI] Quota/Rate limit on ${model}. Switching to next candidate...`);
      } else if (isUnavailable) {
        console.log(`[Gemini AI] Model ${model} temporarily busy, switching candidate...`);
      } else {
        console.log(`[Gemini AI] Model ${model} notice: ${errMsg.slice(0, 80)}`);
      }
    }
  }

  if (allCandidatesQuotaExhausted) {
    triggerRateLimitCooldown(10000);
  }

  return null;
}

// Clean JSON response helper with robust substring extractor
function parseSafeJson<T>(rawText: string | null): T | null {
  if (!rawText) return null;
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    clean = clean.trim();

    try {
      return JSON.parse(clean) as T;
    } catch {
      // Extract from first { to last } or first [ to last ]
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSub = clean.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSub) as T;
      }

      const firstBracket = clean.indexOf('[');
      const lastBracket = clean.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const jsonSub = clean.substring(firstBracket, lastBracket + 1);
        return JSON.parse(jsonSub) as T;
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse JSON text from Gemini:', rawText?.slice(0, 100));
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    models: CANDIDATE_MODELS,
  });
});

// Category-specific rich fallback generator with dynamic target duration allocation & up to 9 scenes
function formatShortCaption(productName: string, category: string = '', usp: string = ''): string {
  const cleanName = (productName || 'Produk Ini').replace(/\s+/g, ' ').trim().slice(0, 28);
  const options = [
    `Cobain ${cleanName}! Bikin makin pede & hasil nyata. Cek keranjang kuning mumpung promo! ✨ #RacunTikTok #fyp #TikTokShop`,
    `Stop scrolling! Ini rahasia ${cleanName} yang viral. Checkout sekarang mumpung diskon! 🔥 #TikTokShop #fyp #Viral`,
    `Jujur ${cleanName} ini worth it banget! Hasilnya terbukti nyata. Link di keranjang kuning ya 🛒 #RacunShop #fyp #Viral`,
    `Akhirnya nemu ${cleanName}! Praktis & kualitas juara. Cuss amankan di keranjang kuning! ⚡ #TikTokShop #fyp #UGC`,
  ];
  const chosen = options[Math.floor(Math.random() * options.length)];
  return chosen.length <= 150 ? chosen : chosen.slice(0, 147) + '...';
}

function generateRichFallback(
  category: string,
  productName: string,
  targetDuration: number = 30,
  targetAudience: string = '',
  keySellingPoints: string = '',
  requestedSceneCount: number = 0,
  cameraStyle: string = 'Kombinasi Dinamis (Rekomendasi AI Otomatis)',
  visualFraming: string = 'mix_framing'
) {
  const normCat = (category || '').toLowerCase();
  const safeName = productName || 'Produk Pilihan';
  const safeUSP = keySellingPoints || 'Hasil terbukti, praktis & aman digunakan setiap hari';

  // Customize scene templates based on visualFraming
  const isHandsOnly = visualFraming === 'hands_pov';
  const isFaceCloseup = visualFraming === 'face_closeup';
  const isFullBody = visualFraming === 'full_body';

  let defaultAngle1 = cameraStyle.includes('Vlog') ? 'Handheld Selfie (Eye Level)' :
    cameraStyle.includes('POV') ? 'POV First-Person Handheld' :
    cameraStyle.includes('Macro') ? 'Macro Extreme Close-Up' :
    cameraStyle.includes('Split') ? 'Split-Screen Dual Angle' :
    cameraStyle.includes('Overhead') ? 'Overhead 90° Top-Down' :
    cameraStyle.includes('Low-Angle') ? 'Low-Angle Hero Shot' : 'POV / Handheld Close';

  if (isHandsOnly) defaultAngle1 = 'POV First-Person (Hanya Tangan / Faceless)';
  if (isFaceCloseup) defaultAngle1 = 'Eye-Level Close-Up Wajah (Realistis)';
  if (isFullBody) defaultAngle1 = 'Full-Body Vertical (9:16 Kamera Berdiri)';

  // Rich 9-step template library with Anti-AI Realism, Consistent Product Packaging, and Google Flow Secret Codes
  const full9Scenes = [
    {
      cameraAngle: defaultAngle1,
      flowSecretCode: '/dollyin',
      cameraMovement: 'Cinematic push-in camera move stopping at subject eye-level',
      flowPrompt: `/dollyin [Shot: Dynamic push-in] [Subject: ${safeName}] [Action: Talent stops scrolling showing product] [Lighting: Softbox studio lighting, clean vertical frame] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV orang pertama (tanpa wajah): Kedua tangan kreator memegang kemasan ${safeName} di atas meja bersih dengan pencahayaan alami, menghentikan scroll secara tegas.`
        : isFaceCloseup
        ? `Kreator menatap langsung ke lensa kamera HP (eye-level) dengan ekspresi terkejut alami tanpa filter robotik, mendekatkan wajah dengan pencahayaan softbox studio rumahan.`
        : isFullBody
        ? `Full-body vertical 9:16: Kreator berdiri tegak di ruangan terang memperlihatkan postur keseluruhan, melangkah mantap mendekati kamera sambil memegang ${safeName}.`
        : `Kreator menatap kamera HP dengan ekspresi kaget alami (tanpa filter/CGI) dan gestur tangan menyetop scroll sambil menunjukkan kemasan ${safeName}.`,
      popupText: 'JANGAN SKIP DULU! 😱',
      soundEffect: 'Record scratch & Vine boom',
      dialogVO: `Stop scrolling! Ada satu rahasia yang wajib kalian tahu hari ini!`,
      notesMood: `Gaya teks: Bold Red/Yellow. Framing: ${visualFraming}. Natural skin texture & organic lighting.`,
    },
    {
      cameraAngle: isHandsOnly ? 'POV Hands Close-Up' : isFaceCloseup ? 'Extreme Close-Up Ekspresi' : isFullBody ? 'Full Body Turn / Side Shot' : 'Extreme Close-up',
      flowSecretCode: '/vertigo_zoom',
      cameraMovement: 'Dramatic vertigo dolly zoom warping background perspective',
      flowPrompt: `/vertigo [Shot: Vertigo dolly zoom] [Subject: Pain point reaction] [Action: Frustrated genuine expression] [Lighting: Moody soft contrast] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan memperlihatkan kondisi kendala/masalah sebelum memakai produk, tekstur permukaan terlihat sangat nyata dan organik tanpa keanehan AI.`
        : isFaceCloseup
        ? `Kamera close-up stabil menangkap ekspresi frustrasi alami kreator dengan mikro-ekspresi manusiawi dan kontak mata tulus.`
        : isFullBody
        ? `Kreator berputar 45 derajat menunjukkan postur tubuh atau detail outfit sebelum transformasi secara menyeluruh.`
        : `Kamera push-in perlahan dan stabil fokus ke ekspresi penasaran dan situasi masalah yang sering dialami audiens.`,
      popupText: 'PERNAH ALAMI INI? 😫',
      soundEffect: 'Dramatic swoosh',
      dialogVO: `Dulu sering banget kesel sama masalah ini dan gak nemu solusinya.`,
      notesMood: 'Gaya teks: Chat Bubble. Pencahayaan sedikit dramatis. Bebas CGI.',
    },
    {
      cameraAngle: isHandsOnly ? 'POV Top-Down Hands Unboxing' : isFaceCloseup ? 'Medium Close-up Wajah & Produk' : 'Medium Shot',
      flowSecretCode: '/orbit360',
      cameraMovement: 'Smooth 360° orbital rotation around subject',
      flowPrompt: `/orbit360 [Shot: Smooth 360 orbit] [Subject: ${safeName} packaging] [Action: Talent smiles holding product] [Lighting: Crisp commercial light, warm fill] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan membuka segel dan kemasan ${safeName}, bentuk dus, warna botol, dan logo terlihat tajam dan konsisten untuk referensi visual Google Flow.`
        : isFaceCloseup
        ? `Kreator tersenyum lega sambil mendekatkan kemasan ${safeName} di samping pipi dengan pencahayaan natural.`
        : isFullBody
        ? `Kreator dalam bingkai full-body tersenyum lega sambil mengangkat kemasan ${safeName} setinggi dada.`
        : `Kreator tersenyum lega sambil mengangkat kemasan ${safeName} dengan kemasan konsisten.`,
      popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
      soundEffect: 'Sparkle chime & Ding',
      dialogVO: `Sampai akhirnya aku nemu ${safeName} yang lagi viral ini!`,
      notesMood: 'Gaya teks: Bouncy Glow. Transisi mulus, packaging konsisten Google Flow.',
    },
    {
      cameraAngle: 'Close-up Macro (Konsistensi Kemasan)',
      flowSecretCode: '/macro_texture',
      cameraMovement: 'Macro lens tight focus exploring packaging details and texture',
      flowPrompt: `/macro [Shot: Extreme macro texture] [Subject: ${safeName} label & finish] [Action: Detailed texture exploration] [Lighting: Sharp rim edge highlights] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: `Sorotan makro tajam fokus pada detail kemasan ${safeName}, label merek, tutup botol/jar, dan tekstur fisik produk asli (organik smartphone capture).`,
      popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
      soundEffect: 'Camera shutter & Pop',
      dialogVO: `Packaging dan build quality-nya beneran premium banget.`,
      notesMood: 'Gaya teks: Gold Badge. Detail tekstur produk tajam & konsisten.',
    },
    {
      cameraAngle: isHandsOnly ? 'POV Hands Macro Texture Test' : 'POV / Macro Angle',
      flowSecretCode: '/slowmo_120fps',
      cameraMovement: 'High-speed camera tracking slow-motion fluid swatch dynamics',
      flowPrompt: `/slowmo [Shot: 120fps slow motion] [Subject: Application test of ${safeName}] [Action: Swatch and texture test] [Lighting: Bright clean studio aesthetic] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV kedua tangan menguji tekstur produk secara nyata (swatch di punggung tangan / tuang isi krim), tekstur formulasi tampak nyata tanpa efek kartun.`
        : isFaceCloseup
        ? `Kreator mengaplikasikan sedikit produk ke wajah sambil tersenyum takjub merasakan sensasi pemakaian.`
        : isFullBody
        ? `Kreator memperagakan penggunaan praktis produk secara aktif dengan gerakan ergonomis dan luwes.`
        : `Demonstrasi membuka / menuang / mencoba tekstur ${safeName} secara detail dengan tangan manusia asli beranatomi sempurna.`,
      popupText: 'TEKSTUR MEWAH & NYAMAN 🌿',
      soundEffect: 'ASMR Crisp & Smooth Whoosh',
      dialogVO: `Cara pakainya super praktis dan kerasa banget bedanya dari pertama coba.`,
      notesMood: 'Gaya teks: Minimalist Subtitle. Lighting jernih organik, zero CGI.',
    },
    {
      cameraAngle: isFullBody ? 'Full Body Dynamic Action' : 'Side Angle 45°',
      flowSecretCode: '/speed_ramp',
      cameraMovement: 'Speed ramp accelerating on approach then snapping into clarity',
      flowPrompt: `/speed_ramp [Shot: Dynamic speed ramp] [Subject: Transformation with ${safeName}] [Action: Quick turn showing results] [Lighting: Natural daylight] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan menunjukkan hasil aplikasi langsung pada produk, tekstur menyerap sempurna di permukaan kulit tangan.`
        : isFaceCloseup
        ? `Close-up sudut 45 derajat menyorot hasil nyata pada wajah dengan pori-pori kulit asli yang sehat dan bersih.`
        : isFullBody
        ? `Kreator bergerak dinamis (berjalan/berputar santai) memperlihatkan outfit/body transformation secara leluasa dan percaya diri.`
        : `Aksi pemakaian langsung produk di depan meja/ruangan dengan ekspresi riang dan gestur santai.`,
      popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
      soundEffect: 'Ting sparkle',
      dialogVO: `Kandungannya juara dan langsung ngefek positif tanpa ribet.`,
      notesMood: 'Gaya teks: Clean bullet points. Gerakan luwes anti-robotik.',
    },
    {
      cameraAngle: isHandsOnly ? 'POV Hands Side-by-Side' : isFaceCloseup ? 'Close-up Face (Puas & Terkesima)' : 'Close-up Face',
      flowSecretCode: '/before_after_wipe',
      cameraMovement: 'Locked static frame with seamless vertical wipe transition',
      flowPrompt: `/split_screen [Shot: Seamless vertical wipe] [Subject: Before vs After transformation] [Action: Instant side-by-side comparison] [Lighting: High-key radiant glow] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan menyejajarkan area sebelum vs sesudah dalam satu frame vertikal, perbedaan terlihat mencolok dan jelas.`
        : isFaceCloseup
        ? `Reaksi wajah puas tersenyum lebar menatap kamera HP dengan mata berbinar bahagia tanpa filter buatan.`
        : isFullBody
        ? `Kreator tersenyum percaya diri menampilkan siluet tubuh fit atau outfit lengkap dari ujung kepala hingga kaki.`
        : `Reaksi wajah puas tersenyum lebar dengan ekspresi terkesima dan kontak mata tulus.`,
      popupText: 'JUJUR GAK NYANGKA! 😍',
      soundEffect: 'Cheer & Success chime',
      dialogVO: `Hasilnya di luar dugaan, beneran ngebantu banget dan bikin pede!`,
      notesMood: 'Gaya teks: Heart pop emoji. Warm studio tone, manusia organik.',
    },
    {
      cameraAngle: isHandsOnly ? 'POV Hands Holding Product' : 'Medium Shot',
      flowSecretCode: '/tracking_follow',
      cameraMovement: 'Lateral tracking shot locked onto subject movement',
      flowPrompt: `/tracking [Shot: Fluid tracking follow] [Subject: ${safeName} in hand] [Action: Thumbs up recommendation] [Lighting: Studio softbox balance] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan menggenggam produk ${safeName} dengan kemasan tetap utuh dan konsisten, memberikan gestur jempol di samping produk.`
        : isFaceCloseup
        ? `Kreator memegang ${safeName} di samping wajah sambil memberikan gestur jempol dan anggukan mantap.`
        : isFullBody
        ? `Kreator dalam tampilan full-body memegang ${safeName} dengan postur percaya diri dan gesture meyakinkan.`
        : `Kreator memegang ${safeName} di samping wajah sambil memberikan gestur jempol.`,
      popupText: 'SUPER WORTH IT! 💯',
      soundEffect: 'Cha-ching cash register',
      dialogVO: `Menurut aku ini 10/10 dan beneran worth to buy banget.`,
      notesMood: 'Gaya teks: Green verified badge. Kemasan konsisten Google Flow.',
    },
    {
      cameraAngle: isHandsOnly ? 'POV Hands Pointing Yellow Cart' : isFullBody ? 'Full Body / Medium Wide CTA' : 'Medium Wide Shot',
      flowSecretCode: '/dollyout',
      cameraMovement: 'Smooth pull-back camera motion to full frame CTA',
      flowPrompt: `/dollyout [Shot: Smooth dolly out] [Subject: Call to action pointing yellow cart] [Action: Talent points to bottom-left corner] [Lighting: Vibrant commercial studio] [Style: 4K UHD, 9:16, 60fps cinematic flow]`,
      visualAction: isHandsOnly
        ? `POV tangan memegang produk ${safeName} dengan tangan kiri, sementara jari telunjuk tangan kanan menunjuk tegas ke sudut kiri bawah layar (menunjuk Keranjang Kuning TikTok).`
        : `Kreator tersenyum antusias menunjuk tegas ke pojok kiri bawah layar (Keranjang Kuning / tombol beli) sambil memperlihatkan kemasan ${safeName}.`,
      popupText: 'BURUAN CHECKOUT DISKON! 🛒',
      soundEffect: 'Bell ring & Cha-ching',
      dialogVO: `Mumpung ada voucher diskon & gratis ongkir, langsung checkout di keranjang kuning ya!`,
      notesMood: 'Gaya teks: Pulsing CTA Button. Aksi jari menunjuk keranjang kuning kiri bawah.',
    },
  ];

  // Determine scene count (user can specify up to 9 scenes even for 10s)
  let desiredCount = requestedSceneCount && requestedSceneCount >= 2 && requestedSceneCount <= 9
    ? requestedSceneCount
    : (normCat.includes('before') ? 6 : 5);

  // If duration is 10s and user requested 9 scenes, use all 9
  if (requestedSceneCount >= 2 && requestedSceneCount <= 9) {
    desiredCount = requestedSceneCount;
  }

  // Select evenly spaced scenes from full9Scenes
  let selectedBase: typeof full9Scenes = [];
  if (desiredCount === 9) {
    selectedBase = full9Scenes;
  } else if (desiredCount === 8) {
    selectedBase = [full9Scenes[0], full9Scenes[1], full9Scenes[2], full9Scenes[3], full9Scenes[4], full9Scenes[5], full9Scenes[6], full9Scenes[8]];
  } else if (desiredCount === 7) {
    selectedBase = [full9Scenes[0], full9Scenes[1], full9Scenes[2], full9Scenes[4], full9Scenes[5], full9Scenes[6], full9Scenes[8]];
  } else if (desiredCount === 6) {
    selectedBase = [full9Scenes[0], full9Scenes[1], full9Scenes[2], full9Scenes[4], full9Scenes[6], full9Scenes[8]];
  } else if (desiredCount === 5) {
    selectedBase = [full9Scenes[0], full9Scenes[2], full9Scenes[4], full9Scenes[6], full9Scenes[8]];
  } else if (desiredCount === 4) {
    selectedBase = [full9Scenes[0], full9Scenes[2], full9Scenes[5], full9Scenes[8]];
  } else if (desiredCount === 3) {
    selectedBase = [full9Scenes[0], full9Scenes[4], full9Scenes[8]];
  } else {
    selectedBase = [full9Scenes[0], full9Scenes[8]];
  }

  // Calculate durations (even for 10s with 9 scenes: 1s, 1s, 1s, 1s, 1s, 1s, 1s, 1s, 2s = 10s)
  const dur = Math.max(5, Number(targetDuration) || 30);
  const baseDur = Math.max(1, Math.floor(dur / selectedBase.length));
  let remainingTime = dur - (baseDur * selectedBase.length);

  const scenes = selectedBase.map((sc, i) => {
    let sceneDuration = baseDur;
    if (i === selectedBase.length - 1 && remainingTime > 0) {
      sceneDuration += remainingTime;
    } else if (remainingTime > 0 && i % 2 === 1) {
      sceneDuration += 1;
      remainingTime -= 1;
    }
    return {
      ...sc,
      duration: sceneDuration,
    };
  });

  return {
    title: `Storyboard ${category || 'UGC'} - ${safeName}`,
    targetAudienceSummary: targetAudience || 'Pengguna aktif TikTok & Reels yang mencari produk viral berkualitas',
    hookTip: 'Hook visual 3 detik pertama dengan ekspresi ekspresif & text overlay kontras tinggi untuk memicu retensi.',
    caption: formatShortCaption(safeName, category, safeUSP),
    scenes,
  };
}

// Generate complete UGC Storyboard using Gemini (with cascading fallback)
app.post('/api/generate-storyboard', async (req, res) => {
  try {
    const {
      category = 'Before & After',
      productName = 'Produk Unggulan',
      productDescription = '',
      targetAudience = 'Pengguna TikTok / Reels usia 18-35 tahun',
      keySellingPoints = '',
      tone = 'Santai, Antusias & Meyakinkan',
      cameraStyle = 'Kombinasi Dinamis (Rekomendasi AI Otomatis)',
      visualFraming = 'mix_framing',
      targetDuration = 30,
      targetSceneCount = 0, // 0 = Auto, or 3-9 adegan
      platform = 'TikTok / Reels',
      language = 'id',
      marketingFramework = 'aida',
      hookStrategy,
      ctaPreset,
    } = req.body;

    const sceneCountText = targetSceneCount && targetSceneCount >= 2 && targetSceneCount <= 9
      ? `WAJIB BUAT TEPAT ${targetSceneCount} ADEGAN (meskipun durasi hanya ${targetDuration} detik, buat ${targetSceneCount} adegan mikro yang dinamis dan terstruktur!).`
      : `Buat 5 sampai 7 adegan yang proporsional, kaya, dan variatif agar alur video memikat dan tidak monoton.`;

    const frameworkGuidelines: Record<string, string> = {
      pas: 'Framework PAS (Problem - Agitate - Solve): Adegan awal sentuh masalah menyebalkan yang dialami audiens, perparah rasa tidak nyaman itu, lalu hadirkan produk sebagai solusi instan penyelamat.',
      bab: 'Framework BAB (Before - After - Bridge): Tampilkan kontras dramatis kondisi awal (Before) vs kondisi memukau (After), lalu jadikan produk sebagai jembatan transformasi yang tak terbantahkan.',
      unboxing: 'Framework Unboxing & Honest Review: Tampilkan pengalaman unboxing nyata, detail material/tekstur asli, dan ulasan tulus tanpa rekayasa yang membangun rasa percaya tinggi (high trust).',
      fomo_urgency: 'Framework FOMO & Flash Urgency: Tekankan kelangkaan stok promo, harga diskon yang hampir habis hari ini, dan desakan untuk segera mengamankan pesanan.',
      aida: 'Framework AIDA (Attention - Interest - Desire - Action): Tangkap perhatian dalam 3 detik, bangun minat lewat demo keunggulan, bakar hasrat ingin memiliki, lalu dorong aksi klik belanja.',
    };
    const selectedFrameworkText = frameworkGuidelines[marketingFramework] || frameworkGuidelines['aida'];

    const framingGuidelines: Record<string, string> = {
      hands_pov: `FOKUS SUDUT PANDANG (VISUAL FRAMING): 🖐️ HANYA TANGAN (POV / FACELESS).
- Sudut Pengambilan Gambar: First-person camera POV (sudut pandang orang pertama langsung dari mata kreator menatap ke bawah/meja kerja).
- Aksi Utama: Menyoroti unboxing nyata, tes tekstur produk (swatch/tuang/oles), aplikasi penggunaan step-by-step, dan interaksi tangan memegang produk secara ergonomis.
- Batasan Ketat: TANPA MENAMPAKKAN WAJAH KREATOR (kreator faceless). Fokus 100% pada tangan manusia asli memegang kemasan dan detail produk secara makro tajam.`,

      face_closeup: `FOKUS SUDUT PANDANG (VISUAL FRAMING): 👤 WAJAH & EKSPRESI (CLOSE-UP).
- Sudut Pengambilan Gambar: Eye-level close-up & medium close-up menghadap kamera smartphone.
- Aksi Utama: Menyoroti ekspresi riil kreator (kaget, penasaran, puas, takjub), ulasan produk secara tulus (honest review), kontak mata langsung ke lensa, dan perubahan sebelum & sesudah pada wajah/kulit secara nyata.
- Batasan Ketat: Wajib tangkap mikro-ekspresi manusiawi alami, tekstur pori-pori kulit asli, tanpa filter wajah artifisial atau riasan robotik.`,

      full_body: `FOKUS SUDUT PANDANG (VISUAL FRAMING): 🧍 FULL BODY (OUTFIT & GERAK AKTIF).
- Sudut Pengambilan Gambar: Full-body vertical 9:16 framing (jarak 2-3 meter dari smartphone tegak).
- Aksi Utama: Menyoroti postur tubuh keseluruhan, kesesuaian outfit/fashion, siluet badan, peragaan gerakan aktif/berjalan/berputar dinamis, dan pembuktian transformasi tubuh.
- Batasan Ketat: Gerakan manusia aktif yang luwes, natural, ergonomis, memperlihatkan proporsi tubuh nyata dan fungsionalitas produk dalam aktivitas harian.`,

      mix_framing: `FOKUS SUDUT PANDANG (VISUAL FRAMING): 🔀 MIX FRAMING (DINAMIS & PROPORSIONAL).
- Sudut Pengambilan Gambar: Kombinasi sudut pengambilan gambar yang seimbang dan adaptif antar adegan.
- Alur Framing Proporsional:
  * Adegan 1 (Hook): Close-up Wajah ekspresi heboh / POV Tangan menarik perhatian seketika.
  * Adegan Demo / Masalah: POV Tangan (Hands-only POV) makro menyorot tekstur & penggunaan nyata.
  * Adegan Solusi / Reaksi: Medium Shot / Close-up Wajah ekspresi puas & sebelum-sesudah.
  * Adegan Terakhir (CTA): Medium Shot talent memegang produk sambil menunjuk ke arah keranjang kuning di pojok kiri bawah.`
    };
    const selectedFramingText = framingGuidelines[visualFraming] || framingGuidelines['mix_framing'];

    const hookGuidelineText = hookStrategy
      ? `Strategi Hook Adegan 1: Terapkan strategi '${hookStrategy}' (buat kalimat pembuka dan visual aksi yang sangat memancing rasa penasaran atau menghentikan scroll seketika).`
      : 'Strategi Hook Adegan 1: Wajib buat hook 3 detik pertama yang sangat tajam, relatable, dan memicu rasa penasaran audiens untuk stop scrolling.';

    const ctaGuidelineText = ctaPreset
      ? `Call To Action (Adegan Terakhir): Gunakan fokus '${ctaPreset}' (wajib dorong penonton klik Keranjang Kuning di kiri bawah).`
      : 'Call To Action (Adegan Terakhir): Wajib secara spesifik mengarahkan penonton untuk KLIK KERANJANG KUNING (atau tombol belanja di pojok kiri bawah) sebelum promo/stok habis.';

    const prompt = `Kamu adalah pakar Creative Director & Scriptwriter UGC (User-Generated Content) viral TikTok Shop, Shopee Video, dan Instagram Reels di Indonesia.
Buatkan storyboard UGC video lengkap yang terbukti memiliki Conversion Rate (CTR/Klik Beli) dan Retention Rate tertinggi untuk produk berikut:

Kategori Konten: ${category}
Nama Produk: ${productName}
Deskripsi Produk: ${productDescription || 'Produk viral berkualitas tinggi dengan manfaat nyata'}
Target Audiens: ${targetAudience}
Poin Penjualan Utama (USP): ${keySellingPoints || 'Hasil cepat, harga terjangkau, praktis digunakan'}
Formula Pemasaran: ${selectedFrameworkText}
${selectedFramingText}
${hookGuidelineText}
${ctaGuidelineText}
Tone of Voice: ${tone}
Style Kamera & Sinematografi: ${cameraStyle}
Target Durasi Total: ${targetDuration} detik
Jumlah Adegan yang Diminta: ${sceneCountText}
Platform: ${platform}
Bahasa: ${language === 'id' ? 'Bahasa Indonesia (Gaya bicara kreator UGC TikTok santai, luwes, natural, tidak kaku)' : 'English (Casual UGC creator style)'}

============================================================
ATURAN KRUSIAL: KONSISTENSI PRODUK & ANTI-AI REALISM MANDATE
============================================================
1. KONSISTENSI PRODUK UNTUK REFERENSI GOOGLE FLOW:
   - Deskripsi visual produk pada 'visualAction' WAJIB IDENTIK & KONSISTEN di setiap adegan (bentuk kemasan botol/jar/dus/sachet, warna utama, posisi logo, dan tekstur isi formulasi).
   - Karena naskah ini akan digunakan sebagai prompt pembuatan visual di Google Flow, jangan pernah mengubah warna, bentuk kemasan, atau karakteristik fisik produk dari Adegan 1 sampai akhir!

2. MANDAT ANTI-AI REALISM & REAL ORGANIC CREATOR (TOLAK ESTETIKA ARTIFISIAL):
   - TOLAK KERAS: Dilarang estetika CGI, 3D animated render, efek kartun, filter robotik artifisial, kulit plastik mengkilap anomali (uncanny AI valley), dan gerakan kamera warping sintetis.
   - WAJIB ESTETIKA KREATOR ORGANIK NYATA:
     * Kualitas video smartphone nyata (iPhone 15 / Android 4K HDR, 9:16 vertikal, pencahayaan alami ruangan atau softbox studio rumahan).
     * Detail manusia organik: pori-pori kulit asli tampak wajar, helai rambut alami, tangan manusia beranatomi 5 jari sempurna dan proporsional saat memegang produk.
     * Gerakan natural: bebas dari gerakan anomali atau kaku ala robot. Setiap aksi adalah gerakan fisik nyata yang wajar dilakukan manusia saat merekam konten.

3. KEPATUHAN PADA VISUAL FRAMING:
   - ${selectedFramingText}
   - Pastikan cameraAngle dan visualAction di setiap adegan mengikuti panduan fokus visual framing di atas.

4. HOOK PENARIK PERHATIAN (Adegan 1): WAJIB HOOK 3 DETIK PERTAMA (Visual + Audio/SFX + On-Screen Text) yang bikin orang stop scrolling dan langsung tertarik.
5. ALUR MEMICU KLIK BELI (High CTR): Tunjukkan bukti nyata/manfaat produk yang menjawab kebutuhan audiens sesuai formula pemasaran.
6. CALL TO ACTION (CTA) TERAKHIR: WAJIB instruksikan talent/tangan untuk mengarahkan jari ke sudut kiri bawah layar (menunjuk Keranjang Kuning / tombol belanja) dengan alasan mendesak.
7. Efek Suara (SFX): Berikan SFX yang KAYA, BERVARIASI, dan SPESIFIK di setiap adegan (ASMR nyata, meme viral, swoosh, cash register, ding, crunch, dsb). DILARANG menggunakan SFX yang sama berulang-ulang di tiap adegan.
8. Naskah Voiceover (VO): Naskah harus BERVARIASI SECARA EMOSIONAL dan intonasi alami: dari penasaran, heboh, curhat, hingga meyakinkan saat closing CTA. Sesuaikan panjang kata dengan durasi adegan agar tidak terburu-buru.
9. Pop-up Text: Huruf kapital mencolok & singkat (maksimal 6-8 kata) yang langsung menyampaikan pesan utama adegan.
10. Durasi setiap adegan (dalam integer detik) jika dijumlahkan WAJIB bernilai total mendekati ${targetDuration} detik.
11. AUTO CAPTION DENGAN HASHTAG: Tulis 1 caption postingan media sosial yang menjual, LENGKAP dengan 2-4 hashtag trending. TOTAL PANJANG KARAKTER CAPTION TERMASUK HASHTAG HARUS MAKSIMAL 150 KARAKTER!
12. MANDAT GOOGLE FLOW AI SECRET CODES & CINEMATIC PROMPTS:
    - Di setiap adegan, Anda WAJIB menyertakan:
      * 'flowSecretCode': Kode rahasia Google Flow AI (pilih salah satu yang paling presisi: /orbit360, /dollyin, /dollyout, /macro_texture, /fpv_glide, /tracking_follow, /vertigo_zoom, /slowmo_120fps, /speed_ramp, /studio_softbox, /golden_hour, /cyberpunk_neon, /rim_light_luxury, /before_after_wipe, /product_levitation, /liquid_explosion, /pov_unboxing).
      * 'cameraMovement': Arahan eksplisit pergerakan kamera sinematik (contoh: "Smooth 360° orbital rotation around subject", "Slow cinematic push-in toward product detail").
      * 'flowPrompt': Hidden prompt sinematik padat siap pakai untuk Google Flow / Veo / Kling / Sora berformat:
        "{flowSecretCode} [Shot: {cameraMovement}] [Subject: {productOrTalent}] [Action: {visualAction}] [Lighting: {lightingMood}] [Style: 4K UHD hyperrealistic commercial, 9:16 vertical, 60fps cinematic flow]"`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Judul storyboard yang menarik (e.g. Storyboard Before & After - Nama Produk)',
          },
          targetAudienceSummary: {
            type: Type.STRING,
            description: 'Ringkasan singkat target audiens',
          },
          hookTip: {
            type: Type.STRING,
            description: 'Alasan kenapa hook ini dipilih',
          },
          caption: {
            type: Type.STRING,
            description: 'Auto caption posting media sosial lengkap dengan 2-4 hashtag viral. PENTING: Total panjang karakter WAJIB MAKSIMAL 150 KARAKTER.',
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cameraAngle: {
                  type: Type.STRING,
                  description: 'Sudut kamera (e.g., Medium Shot, Close-up, POV / Handheld, Wide Shot, Extreme Close-up)',
                },
                flowSecretCode: {
                  type: Type.STRING,
                  description: 'Google Flow secret code e.g. /orbit360, /dollyin, /macro_texture, /tracking_follow, /slowmo_120fps',
                },
                cameraMovement: {
                  type: Type.STRING,
                  description: 'Explicit cinematic camera movement direction',
                },
                flowPrompt: {
                  type: Type.STRING,
                  description: 'Full hidden cinematic prompt formatted for Google Flow / AI Video generators',
                },
                visualAction: {
                  type: Type.STRING,
                  description: 'Deskripsi aksi fisik, ekspresi wajah, dan pergerakan objek di depan kamera.',
                },
                popupText: {
                  type: Type.STRING,
                  description: 'Teks pop-up overlay di layar video (huruf kapital tebal).',
                },
                soundEffect: {
                  type: Type.STRING,
                  description: 'Efek suara / SFX (e.g., Phone ring & sigh, Swoosh, Cha-ching, Vine boom, Ting).',
                },
                dialogVO: {
                  type: Type.STRING,
                  description: 'Dialog yang diucapkan talent atau suara Voice Over (VO).',
                },
                notesMood: {
                  type: Type.STRING,
                  description: 'Catatan teknis, gaya animasi teks (Chat Bubble/Bouncy), pencahayaan atau mood.',
                },
                duration: {
                  type: Type.INTEGER,
                  description: 'Durasi adegan dalam detik (integer, misal 1, 2, 3, 4, 5).',
                },
              },
              required: [
                'cameraAngle',
                'visualAction',
                'popupText',
                'soundEffect',
                'dialogVO',
                'notesMood',
                'duration',
              ],
            },
          },
        },
        required: ['title', 'scenes'],
      },
    };

    const rawText = await generateWithFallback(
      prompt,
      config,
      'You are an elite UGC video strategist and storyboard scriptwriter. Always return strictly valid JSON matching the schema. Keep caption under 150 characters.'
    );

    const parsedData = parseSafeJson<any>(rawText);
    if (parsedData && Array.isArray(parsedData.scenes) && parsedData.scenes.length > 0) {
      // Ensure caption is <= 150 chars
      if (!parsedData.caption || typeof parsedData.caption !== 'string') {
        parsedData.caption = formatShortCaption(productName, category, keySellingPoints);
      } else if (parsedData.caption.length > 150) {
        parsedData.caption = parsedData.caption.slice(0, 147) + '...';
      }

      // Guarantee Google Flow parameters on each scene
      parsedData.scenes = parsedData.scenes.map((sc: any, idx: number) => {
        const code = sc.flowSecretCode || (idx === 0 ? '/dollyin' : idx === parsedData.scenes.length - 1 ? '/dollyout' : '/orbit360');
        const movement = sc.cameraMovement || sc.cameraAngle || 'Smooth cinematic camera movement';
        const flowPrompt = sc.flowPrompt || `${code} [Shot: ${movement}] [Subject: ${productName}] [Action: ${sc.visualAction || 'Product showcase'}] [Lighting: Studio softbox, natural daylight] [Style: 4K UHD, 9:16 vertical video, 60fps cinematic flow]`;
        return {
          ...sc,
          flowSecretCode: code,
          cameraMovement: movement,
          flowPrompt,
        };
      });

      return res.json({
        success: true,
        data: parsedData,
        source: 'gemini',
      });
    }

    // High quality offline fallback generator (supports up to 9 scenes & custom duration)
    const fallbackData = generateRichFallback(
      category,
      productName,
      targetDuration,
      targetAudience,
      keySellingPoints,
      targetSceneCount,
      cameraStyle,
      visualFraming
    );

    return res.json({
      success: true,
      data: fallbackData,
      source: 'smart-template',
    });
  } catch (error: any) {
    console.error('Server error in /api/generate-storyboard (gracefully falling back):', error);
    const fallbackData = generateRichFallback(
      req.body?.category || 'Review',
      req.body?.productName || 'Produk Pilihan',
      req.body?.targetDuration || 30,
      req.body?.targetAudience || 'Target audiens',
      req.body?.keySellingPoints || '',
      req.body?.targetSceneCount || 5,
      req.body?.cameraStyle,
      req.body?.visualFraming
    );
    return res.json({
      success: true,
      data: fallbackData,
      source: 'smart-template',
    });
  }
});

// Top Creator & FYP Research-backed Caption Generator
app.post('/api/generate-caption', async (req, res) => {
  try {
    const {
      productName = 'Produk Pilihan',
      category = 'UGC',
      keySellingPoints = '',
      targetAudience = '',
      platform = 'TikTok Shop',
      productLinkOrNotes = '',
      hookStrategy = 'curiosity_gap',
      scenesSummary = '',
    } = req.body;

    const prompt = `Kamu adalah TikTok & Instagram Reels Viral Strategist dan Top Content Creator Copywriter.
Lakukan riset angle viral dan search-intent (TikTok SEO) agar postingan video produk berikut berpeluang maksimal tembus FYP (For You Page) dan mendongkrak penjualan keranjang kuning:

DATA RISET PRODUK:
- Nama Produk: ${productName}
- Kategori: ${category}
- USP / Nilai Jual: ${keySellingPoints || 'Hasil nyata, praktis & terpercaya'}
- Target Audiens: ${targetAudience || 'Pengguna aktif media sosial Indonesia'}
- Keterangan/Link Produk: ${productLinkOrNotes || '-'}
- Ringkasan Cerita Video: ${scenesSummary || '-'}
- Platform Utama: ${platform}

FORMULA COPYWRITING TOP CREATOR FYP:
1. Hook 3 Detik: Pancing rasa penasaran, emosi terkejut, atau problem relate (contoh: "Jujur nyesel baru tahu...", "Pernah ngalamin ini gak?", "Gak heran sold out mulu...").
2. Search-Intent (TikTok SEO): Sisipkan kata kunci alami yang sering diketik audiens di kolom pencarian TikTok.
3. Call To Action (CTA): Ajakan checkout keranjang kuning atau amankan promo sebelum kehabisan.
4. FYP Algorithm Hashtags: 3-5 hashtag tertarget (gabungan #fyp, #RacunTikTok / #TikTokShop, dan 2 hashtag niche spesifik produk).

ATURAN PANJANG KARAKTER:
- "caption": Teks caption utama postingan MAKSIMAL 150 KARAKTER (Character Count <= 150) termasuk hashtag, sangat padat & memicu klik.
- "longCaption": Deskripsi lengkap SEO (150-280 karakter) untuk pembuat konten yang ingin deskripsi lebih kaya.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: {
            type: Type.STRING,
            description: 'Caption viral ringkas maksimal 150 karakter termasuk hashtag',
          },
          longCaption: {
            type: Type.STRING,
            description: 'Caption lengkap dengan TikTok SEO deskripsi (150-280 karakter)',
          },
          hookTitle: {
            type: Type.STRING,
            description: 'Tipe hook yang diriset (misal: Curiosity Gap, Visual Shock, Relatable Pain)',
          },
          seoKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3-4 kata kunci pencarian TikTok hasil riset',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar 3-5 hashtag algoritma FYP hasil riset',
          },
          creatorTip: {
            type: Type.STRING,
            description: '1 tips singkat eksekusi dari Top Creator',
          },
        },
        required: ['caption'],
      },
    };

    const raw = await generateWithFallback(
      prompt,
      config,
      'You are a Top TikTok Creator & Reels Copywriter. Return strictly JSON with research-backed viral copy. Keep caption strictly <= 150 chars.',
      7000
    );

    const parsed = parseSafeJson<any>(raw);
    let finalCaption = parsed?.caption;

    if (!finalCaption || typeof finalCaption !== 'string') {
      finalCaption = formatShortCaption(productName, category, keySellingPoints);
    }

    if (finalCaption.length > 150) {
      finalCaption = finalCaption.slice(0, 147) + '...';
    }

    // Default hashtags if not parsed
    const cleanProdTag = productName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    const defaultHashtags = [
      '#fyp',
      '#RacunTikTok',
      '#TikTokShop',
      cleanProdTag ? `#${cleanProdTag}` : '#ReviewJujur',
    ];

    return res.json({
      success: true,
      caption: finalCaption,
      characterCount: finalCaption.length,
      longCaption: parsed?.longCaption || `${finalCaption} Cek keranjang kuning sekarang mumpung voucher diskon masih aktif ya! ✨`,
      hookTitle: parsed?.hookTitle || 'Curiosity & Relatable Hook',
      seoKeywords: parsed?.seoKeywords || [productName.toLowerCase(), `rekomendasi ${category.toLowerCase()}`, 'review jujur', 'promo diskon'],
      hashtags: parsed?.hashtags && parsed.hashtags.length > 0 ? parsed.hashtags : defaultHashtags,
      creatorTip: parsed?.creatorTip || 'Pasang teks pop-up hook di 2 detik pertama dan tunjukkan kemasan produk dengan jelas!',
      source: parsed?.caption ? 'gemini' : 'smart-research',
    });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    const cleanName = (req.body?.productName || 'Produk').replace(/\s+/g, ' ').trim().slice(0, 24);
    const fallbackCaption = `Jujur nyesel baru tahu ${cleanName}! Hasilnya nyata. Cek keranjang kuning mumpung promo! 🔥 #fyp #RacunTikTok #TikTokShop`;
    return res.json({
      success: true,
      caption: fallbackCaption.length <= 150 ? fallbackCaption : fallbackCaption.slice(0, 147) + '...',
      characterCount: fallbackCaption.length,
      longCaption: `Stop scrolling! Ini rahasia ${cleanName} yang lagi viral di TikTok. Kualitas terbukti bagus dan praktis. Checkout sekarang sebelum kehabisan voucher diskon di keranjang kuning! 🛒✨ #fyp #RacunTikTok #TikTokShop #Review`,
      hookTitle: 'Curiosity & Pain Point Hook',
      seoKeywords: [cleanName.toLowerCase(), 'racun tiktok', 'review jujur tiktok shop'],
      hashtags: ['#fyp', '#RacunTikTok', '#TikTokShop', '#ViralDiTikTok'],
      creatorTip: 'Pastikan pencahayaan terang dan ekspresi wajah meyakinkan saat menyebutkan promo di keranjang kuning.',
      source: 'smart-research',
    });
  }
});

// AI Single Scene Polish / Rewrite - Super Robust with High-Impact Creative Engine
app.post('/api/enhance-scene', async (req, res) => {
  const scene = req.body?.scene || {};
  const category = req.body?.category || 'UGC';
  const instruction = req.body?.instruction || 'Tingkatkan agar lebih viral, hook lebih tajam, dan aksi visual lebih ekspresif';
  const productName = req.body?.productName || 'Produk';

  try {
    const prompt = `Kamu adalah Top UGC Director & Cinematographer.
Perbaiki dan percantik adegan storyboard video berikut agar lebih viral, natural (bebas kesan robot AI/CGI), dan menghasilkan konversi tinggi:
Instruksi perbaikan: "${instruction}"
Kategori video: "${category}"
Nama Produk: "${productName}"

DATA ADEGAN SAAT INI:
- Sudut kamera: ${scene.cameraAngle || 'Medium Shot'}
- Aksi visual: ${scene.visualAction || ''}
- Teks pop-up layar: ${scene.popupText || ''}
- Efek suara (SFX): ${scene.soundEffect || ''}
- Dialog / VO: ${scene.dialogVO || ''}
- Catatan / Mood: ${scene.notesMood || ''}
- Durasi: ${scene.duration || 3} detik

PILIH KODE RAHASIA GOOGLE FLOW YANG SESUAI:
/orbit360, /dollyin, /dollyout, /macro_texture, /speed_ramp, /slowmo_120fps, /vertigo_zoom, /fpv_glide, /tracking_follow, /shallow_dof

Tulis ulang adegan ini dalam format JSON yang ditingkatkan:`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cameraAngle: { type: Type.STRING },
          flowSecretCode: { type: Type.STRING, description: 'Google Flow secret code e.g. /orbit360, /dollyin' },
          cameraMovement: { type: Type.STRING, description: 'Explicit camera motion direction' },
          flowPrompt: { type: Type.STRING, description: 'Full hidden cinematic prompt for Google Flow' },
          visualAction: { type: Type.STRING },
          popupText: { type: Type.STRING },
          soundEffect: { type: Type.STRING },
          dialogVO: { type: Type.STRING },
          notesMood: { type: Type.STRING },
          duration: { type: Type.INTEGER },
        },
        required: [
          'cameraAngle',
          'visualAction',
          'popupText',
          'soundEffect',
          'dialogVO',
          'notesMood',
          'duration',
        ],
      },
    };

    const rawText = await generateWithFallback(prompt, config, 'You are an elite UGC director. Return valid JSON only.', 6500);
    const parsedScene = parseSafeJson<any>(rawText);

    if (parsedScene && parsedScene.visualAction) {
      const code = parsedScene.flowSecretCode || scene.flowSecretCode || '/dollyin';
      const move = parsedScene.cameraMovement || scene.cameraMovement || parsedScene.cameraAngle || 'Smooth cinematic push-in';
      const promptText = parsedScene.flowPrompt || `${code} [Shot: ${move}] [Subject: ${productName}] [Action: ${parsedScene.visualAction}] [Lighting: Studio softbox] [Style: 4K UHD, 9:16 vertical, 60fps cinematic flow]`;
      return res.json({
        success: true,
        scene: {
          ...parsedScene,
          flowSecretCode: code,
          cameraMovement: move,
          flowPrompt: promptText,
          duration: Number(parsedScene.duration) || scene.duration || 3,
        },
        source: 'gemini',
      });
    }
  } catch (error: any) {
    console.warn('Enhance scene AI model busy, applying smart creative polish engine:', error?.message || error);
  }

  // High-Impact Creative Polish Engine (Always Succeeds 100%)
  const curAction = (scene.visualAction || '').trim();
  const curVO = (scene.dialogVO || '').trim();
  const curPopup = (scene.popupText || '').trim();
  const curSFX = (scene.soundEffect || '').trim();

  // Smart camera & flow determination
  const code = scene.flowSecretCode || (scene.order === 1 ? '/dollyin' : '/orbit360');
  const move = scene.cameraMovement || (code === '/dollyin' ? 'Cinematic push-in to subject eye-level' : 'Smooth orbital camera rotation around subject');

  // Polish Visual Action
  let enhancedAction = curAction;
  if (!enhancedAction) {
    enhancedAction = `Kreator menunjukkan kemasan ${productName} dengan gestur ekspresif dan kontak mata tulus ke kamera smartphone.`;
  } else if (!enhancedAction.includes('ekspresif') && !enhancedAction.includes('kamera')) {
    enhancedAction = `${enhancedAction} (Kamera stabil dengan gerakan ${move}, gestur tangan natural tanpa distorsi).`;
  }

  // Polish VO
  let enhancedVO = curVO;
  if (!enhancedVO) {
    enhancedVO = `Beneran deh, ini salah satu penemuan terbaik yang wajib kalian coba sekarang!`;
  } else if (!enhancedVO.endsWith('!') && !enhancedVO.endsWith('.')) {
    enhancedVO = `${enhancedVO}! Beneran gak nyangka hasilnya senyata ini.`;
  }

  // Polish Popup Text
  let enhancedPopup = curPopup;
  if (!enhancedPopup) {
    enhancedPopup = 'RAHASIA VIRAL TERUNGKAP! ✨';
  } else if (!enhancedPopup.includes('🔥') && !enhancedPopup.includes('✨') && !enhancedPopup.includes('😱')) {
    enhancedPopup = `${enhancedPopup.toUpperCase()} 🔥`;
  }

  // Polish SFX
  let enhancedSFX = curSFX;
  if (!enhancedSFX) {
    enhancedSFX = 'Swoosh & Subtle Ding';
  } else if (!enhancedSFX.includes('&') && !enhancedSFX.includes('+')) {
    enhancedSFX = `${enhancedSFX} + Dynamic Bass`;
  }

  const flowPrompt = `${code} [Shot: ${move}] [Subject: ${productName}] [Action: ${enhancedAction}] [Lighting: Crisp commercial softbox, clean natural fill] [Style: 4K UHD, 9:16 vertical video, 60fps cinematic flow]`;

  return res.json({
    success: true,
    scene: {
      cameraAngle: scene.cameraAngle || 'Medium Close-up Dynamic',
      flowSecretCode: code,
      cameraMovement: move,
      flowPrompt,
      visualAction: enhancedAction,
      popupText: enhancedPopup,
      soundEffect: enhancedSFX,
      dialogVO: enhancedVO,
      notesMood: scene.notesMood || 'Pencahayaan terang kontras, framing vertikal 9:16, bebas filter artifisial.',
      duration: Number(scene.duration) || 3,
    },
    source: 'creative-engine',
  });
});

// Dedicated Google Flow AI Hidden Prompt Generator Endpoint
app.post('/api/generate-flow-prompt', async (req, res) => {
  try {
    const { scene, productName = 'Produk Unggulan', category = 'UGC', visualFraming = 'vertical 9:16' } = req.body;
    if (!scene) {
      return res.status(400).json({ success: false, message: 'Data adegan wajib disertakan.' });
    }

    const prompt = `Kamu adalah Director Sinematografi AI dan Spesialis Prompt Google Flow AI Video (Veo, Kling, Sora, Runway Gen-3).
Tugasmu adalah menganalisis adegan storyboard berikut dan menghasilkan kode rahasia Flow AI beserta hidden prompt sinematik yang paling akurat dan memukau:
Produk: ${productName}
Kategori: ${category}
Visual Framing: ${visualFraming}
Sudut Kamera: ${scene.cameraAngle || 'Medium Shot'}
Aksi Visual: ${scene.visualAction || ''}
Voiceover: ${scene.dialogVO || ''}
Mood & Lighting: ${scene.notesMood || ''}

DAFTAR KODE RAHASIA GOOGLE FLOW (PILIH 1 PALING TEPAT):
- Gerakan Kamera: /orbit360 (rotasi 360 memutar), /dollyin (dorong maju dramatis), /dollyout (tarik mundur reveal), /fpv_glide (glide lincah ala drone), /tracking_follow (mengikuti gerakan tangan), /vertigo_zoom (dolly zoom efek shock), /whip_pan (transisi cepat snap), /tilt_reveal (tilt vertikal reveal).
- Lensa & Optik: /macro_texture (tekstur close-up droplet/formula), /rack_focus (pindah fokus latar ke produk), /shallow_dof (bokeh f/1.4 lembut), /anamorphic_flare (streak flare bioskop).
- Kecepatan: /slowmo_120fps (gerak lambat cairan/cipratan), /speed_ramp (akselerasi lalu lambat), /hyperlapse (kompresi waktu stabil).
- Lighting: /studio_softbox (komersial bersih), /golden_hour (cahaya sore hangat), /cyberpunk_neon (neon kontras), /rim_light_luxury (kilau garis tepi botol).
- Transisi & Reveal: /before_after_wipe (wipe transformasi seketika), /match_cut (kontinuitas objek), /product_levitation (melayang gravitasi nol).

OUTPUT FORMAT:
Susun 'flowPrompt' dalam struktur standar:
"{flowSecretCode} [Shot: {cameraMovement}] [Subject: {productName} / Talent] [Action: {visualAction}] [Lighting: {lightingMood}] [Style: 4K UHD hyperrealistic commercial, 9:16 vertical video, 60fps cinematic flow]"`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flowSecretCode: { type: Type.STRING },
          cameraMovement: { type: Type.STRING },
          flowPrompt: { type: Type.STRING },
        },
        required: ['flowSecretCode', 'cameraMovement', 'flowPrompt'],
      },
    };

    const rawText = await generateWithFallback(prompt, config, 'You are an elite Google Flow AI cinematographic prompter.', 6500);
    const parsed = parseSafeJson<any>(rawText);

    if (parsed && parsed.flowSecretCode && parsed.flowPrompt) {
      return res.json({
        success: true,
        flowSecretCode: parsed.flowSecretCode,
        cameraMovement: parsed.cameraMovement || scene.cameraAngle || 'Smooth cinematic movement',
        flowPrompt: parsed.flowPrompt,
      });
    }

    // Fallback prompt generation
    const code = scene.flowSecretCode || '/dollyin';
    const move = scene.cameraMovement || scene.cameraAngle || 'Smooth cinematic push-in';
    const flowPrompt = `${code} [Shot: ${move}] [Subject: ${productName}] [Action: ${scene.visualAction || 'Kreator memperagakan produk secara meyakinkan'}] [Lighting: Studio softbox balance] [Style: 4K UHD, 9:16 vertical video, 60fps cinematic flow]`;

    return res.json({
      success: true,
      flowSecretCode: code,
      cameraMovement: move,
      flowPrompt,
    });
  } catch (err: any) {
    const code = req.body?.scene?.flowSecretCode || '/dollyin';
    const move = req.body?.scene?.cameraMovement || req.body?.scene?.cameraAngle || 'Cinematic camera movement';
    return res.json({
      success: true,
      flowSecretCode: code,
      cameraMovement: move,
      flowPrompt: `${code} [Shot: ${move}] [Subject: ${req.body?.productName || 'Produk'}] [Action: ${req.body?.scene?.visualAction || 'Product action'}] [Style: 4K UHD, 9:16 vertical, 60fps]`,
    });
  }
});

// AI Hook Variations Generator
app.post('/api/generate-hooks', async (req, res) => {
  const productName = req.body?.productName || 'Produk';
  const category = req.body?.category || 'Before & After';
  try {
    const prompt = `Buatkan 5 variasi Hook 3 detik pertama paling viral untuk video UGC produk "${productName}" dalam kategori "${category}".
Berikan 5 jenis:
1. Visual Shock (Hook visual dramatis)
2. Negative Hook (Peringatan / Jangan beli sebelum...)
3. Curiosity / Question (Pertanyaan penasaran yang relate)
4. Secret / FOMO (Trik rahasia yang jarang orang tahu)
5. Relatable Pain Point (Masalah nyeri audiens sehari-hari)

Format JSON: array of objects dengan field: type, hookDialog, visualAction, popupText, sfx.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            hookDialog: { type: Type.STRING },
            visualAction: { type: Type.STRING },
            popupText: { type: Type.STRING },
            sfx: { type: Type.STRING },
          },
          required: ['type', 'hookDialog', 'visualAction', 'popupText', 'sfx'],
        },
      },
    };

    const rawText = await generateWithFallback(prompt, config);
    const parsedHooks = parseSafeJson<any[]>(rawText);

    if (parsedHooks && Array.isArray(parsedHooks) && parsedHooks.length > 0) {
      return res.json({ success: true, hooks: parsedHooks });
    }

    // Default fallback hooks
    return res.json({
      success: true,
      hooks: [
        {
          type: 'Visual Shock',
          hookDialog: 'Jangan kaget kalau dalam 3 hari perubahannya bisa se-drastis ini!',
          visualAction: `Menutup kamera dengan telapak tangan lalu transisi cepat ke hasil produk ${productName}.`,
          popupText: 'JANGAN KAGET DULU! 😱',
          sfx: 'Vine boom & Swoosh',
        },
        {
          type: 'Negative Hook',
          hookDialog: `JANGAN pernah beli ${productName} kalau kalian belum siap ketagihan sama hasilnya!`,
          visualAction: 'Kreator menggelengkan kepala dengan ekspresi serius di depan kamera.',
          popupText: `JANGAN DIBELI DULU ⚠️`,
          sfx: 'Record scratch & Warning buzzer',
        },
        {
          type: 'Curiosity / Question',
          hookDialog: `Pernah gak sih kalian mikir, kenapa produk ini bisa selalu sold out dalam hitungan menit?`,
          visualAction: `Memperlihatkan box kemasan ${productName} yang baru dibuka dari paket.`,
          popupText: `KENAPA BISA VIRAL BANGET? 🤔`,
          sfx: 'Ding question chime',
        },
        {
          type: 'Secret / FOMO',
          hookDialog: `Ini rahasia yang gak pernah dibocorin sama brand besar tapi beneran ampuh!`,
          visualAction: 'Mendekat ke mikrofon dengan gesture berbisik rahasia.',
          popupText: `RAHASIA GAK BOLEH BOCOR 🤫`,
          sfx: 'Whisper ASMR & Mystery chime',
        },
        {
          type: 'Relatable Pain Point',
          hookDialog: 'Capek gak sih buang-buang uang buat nyobain yang gak ada hasilnya?',
          visualAction: 'Memegang kepala dengan ekspresi lelah dan frustrasi menatap dompet/cermin.',
          popupText: 'CAPEK GAGAL MULU?! 😫',
          sfx: 'Heartbeat & Dramatic bass',
        },
      ],
      source: 'smart-template',
    });
  } catch (error: any) {
    console.error('Hooks generate fallback:', error);
    return res.json({
      success: true,
      hooks: [
        {
          type: 'Visual Shock',
          hookDialog: 'Jangan kaget kalau hasilnya se-drastis ini!',
          visualAction: `Transisi cepat memperlihatkan hasil produk ${productName}.`,
          popupText: 'JANGAN KAGET DULU! 😱',
          sfx: 'Vine boom & Swoosh',
        },
        {
          type: 'Curiosity / Question',
          hookDialog: `Kenapa produk ${productName} ini bisa viral banget di TikTok?`,
          visualAction: 'Menunjukkan detail fisik produk dengan rasa penasaran.',
          popupText: 'KENAPA BISA VIRAL BANGET? 🤔',
          sfx: 'Ding question chime',
        },
        {
          type: 'Secret / FOMO',
          hookDialog: 'Ini rahasia yang jarang dibocorin tapi beneran ampuh!',
          visualAction: 'Gesture berbisik ke mikrofon.',
          popupText: 'RAHASIA VIRAL 🤫',
          sfx: 'Whisper ASMR & Chime',
        },
      ],
      source: 'smart-template',
    });
  }
});

// AI Auto-Detect Product & Info from Unified Input (Link & Notes combined)
const autoDetectHandler = async (req: express.Request, res: express.Response) => {
  try {
    let { url = '', notes = '', input = '' } = req.body;

    // Support single unified input string containing both link & notes
    if (input && typeof input === 'string') {
      const urlMatches = input.match(/(https?:\/\/[^\s]+)/gi);
      if (urlMatches && urlMatches.length > 0) {
        url = urlMatches[0];
        notes = input.replace(urlMatches[0], '').trim();
      } else {
        notes = input.trim();
      }
    }

    const rawInputCombined = (input || `${url} ${notes}`).trim();

    if (!rawInputCombined) {
      return res.status(400).json({ error: 'Masukkan link produk atau keterangan produk terlebih dahulu' });
    }

    const prompt = `Kamu adalah AI UGC Product & Link Analyzer profesional untuk platform TikTok Shop, Shopee Video, Instagram Reels, Tokopedia, dan YouTube Shorts.
Analisis input gabungan link produk dan/atau keterangan berikut, lalu lakukan ekstraksi otomatis secara cerdas dan mendalam:

Input Pengguna (Link & Keterangan): "${rawInputCombined}"
${url ? `Terdeteksi URL: "${url}"` : ''}
${notes ? `Terdeteksi Keterangan: "${notes}"` : ''}

Daftar 12 Kategori UGC yang WAJIB dipilih salah satu yang paling cocok:
- "Affiliate"
- "Unboxing"
- "Tutorial"
- "Review"
- "Komedi / Sketsa"
- "Daily Vlog"
- "GRWM"
- "Problem & Solution"
- "Before & After"
- "Life Hacks"
- "ASMR / Satisfying"
- "Haul"

Tugas Anda:
1. productName: Nama produk yang bersih, spesifik, dan siap pakai (contoh: "Somethinc Niacinamide Barrier Serum", "Sago Green Coffee Slimming", "Keychron K2 Wireless Mechanical Keyboard").
2. category: Pilih 1 dari 12 kategori di atas yang paling tepat untuk mempromosikan produk ini.
3. productDescription: Deskripsi produk yang menarik, menjelaskan manfaat utama dan cara kerjanya secara ringkas.
4. targetAudience: Target audiens spesifik (misal: "Wanita 20-35 tahun pekerja kantor yang ingin kulit cerah tanpa breakout").
5. keySellingPoints: Poin keunggulan utama (USP) yang persuasif dan memicu checkout di keranjang kuning.
6. tone: Nada bicara yang paling pas (pilih salah satu: "Santai, Relatable & Meyakinkan", "Hype, Heboh & Excited", "Edukatif, Tenang & Elegan", "Drama Komedi & Sketsa Lucu", atau "ASMR Bisik & Estetik").
7. targetPlatform: Platform yang cocok ("TikTok Shop", "Shopee Video", "Instagram Reels", "YouTube Shorts").
8. targetDuration: Rekomendasi durasi (integer: 10, 15, 30, 45, atau 60 detik).
9. cameraStyle: Rekomendasi gaya kamera sinematografi terbaik untuk produk & kategori ini (PILIH SALAH SATU: "Kombinasi Dinamis (Rekomendasi AI Otomatis)", "Handheld Vlog & Casual Selfie", "POV First-Person Handheld", "Macro & Texture Extreme Close-Up", "Split-Screen & Dual Angle (Sebelum vs Sesudah)", "Fast Paced Whip-Pan & Snap Zoom", "Overhead / Flat Lay Studio (90° Top-Down)", "Cinematic Shallow Depth of Field (Bokeh Halus)", atau "Low-Angle Hero Power Shot").
10. cameraStyleReason: Alasan singkat 1 kalimat mengapa style kamera ini paling optimal untuk produk & kategori tersebut.
11. visualFraming: Rekomendasi framing/sudut pandang utama visual produk (PILIH SALAH SATU: "hands_pov" untuk demo unboxing/tekstur tanpa wajah, "face_closeup" untuk skincare/ekspresi wajah riil, "full_body" untuk fashion/outfit/body transformation gerak aktif, atau "mix_framing" untuk kombinasi dinamis proporsional).
12. detectedTags: Array 3-5 kata kunci relevan (misal: ["skincare", "niacinamide", "pencerah", "anti-acne"]).
13. detectionSummary: Penjelasan ringkas ramah 1 kalimat tentang apa yang berhasil dideteksi.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          category: { type: Type.STRING },
          productDescription: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          keySellingPoints: { type: Type.STRING },
          tone: { type: Type.STRING },
          targetPlatform: { type: Type.STRING },
          targetDuration: { type: Type.INTEGER },
          cameraStyle: { type: Type.STRING },
          cameraStyleReason: { type: Type.STRING },
          visualFraming: { type: Type.STRING },
          detectedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          detectionSummary: { type: Type.STRING },
        },
        required: [
          'productName',
          'category',
          'productDescription',
          'targetAudience',
          'keySellingPoints',
          'tone',
          'targetPlatform',
          'targetDuration',
        ],
      },
    };

    const rawText = await generateWithFallback(
      prompt,
      config,
      'You are a professional UGC Ecommerce strategist in Southeast Asia and TikTok Shop. Return pure JSON with accurate product extraction.',
      7500
    );

    const parsed = parseSafeJson<any>(rawText);
    if (parsed && parsed.productName) {
      return res.json({
        success: true,
        data: parsed,
        source: 'gemini',
      });
    }

    // Heuristic Offline Auto-Detector Fallback
    const combined = rawInputCombined.toLowerCase();
    const cleanTextNoUrls = rawInputCombined.replace(/https?:\/\/\S+/gi, '').replace(/[#@][\w-]+/g, '').trim();

    let detectedName = 'Produk Unggulan Pilihan';
    let detectedCat = 'Before & After';
    let detectedPlatform = 'TikTok Shop';
    let detectedDuration = 30;
    let detectedTone = 'Santai, Relatable & Meyakinkan';
    let detectedUSP = 'Kualitas terjamin, harga terjangkau, dan hasil nyata terbukti.';
    let detectedDesc = cleanTextNoUrls || notes || rawInputCombined || 'Produk viral yang banyak dicari di media sosial dengan ulasan positif.';
    let detectedAudience = 'Pengguna aktif TikTok & Shopee usia 18-35 tahun';
    const detectedTags: string[] = [];

    // Extract first meaningful phrase as product name if available
    if (cleanTextNoUrls) {
      const firstPhrase = cleanTextNoUrls.split(/[\n,\.\-–—!]/)[0]?.trim();
      if (firstPhrase && firstPhrase.length >= 3 && firstPhrase.length <= 60) {
        detectedName = firstPhrase;
      }
    }

    // URL / Domain based platform detection
    if (combined.includes('shopee')) {
      detectedPlatform = 'Shopee Video';
      detectedTags.push('Shopee Racun');
    } else if (combined.includes('instagram')) {
      detectedPlatform = 'Instagram Reels';
      detectedTags.push('Instagram Reels');
    } else if (combined.includes('youtube')) {
      detectedPlatform = 'YouTube Shorts';
      detectedTags.push('Shorts');
    } else if (combined.includes('tokopedia')) {
      detectedPlatform = 'TikTok Shop';
      detectedTags.push('Tokopedia');
    } else {
      detectedPlatform = 'TikTok Shop';
      detectedTags.push('TikTok Shop');
    }

    // Keyword heuristics for Category & Selling Points
    if (combined.includes('unboxing') || combined.includes('haul') || combined.includes('buka paket')) {
      detectedCat = 'Unboxing';
      detectedUSP = 'Packaging aman premium, kelengkapan lengkap, garansi resmi.';
    } else if (combined.includes('sebelum') || combined.includes('sesudah') || combined.includes('diet') || combined.includes('slimming') || combined.includes('jerawat') || combined.includes('flek')) {
      detectedCat = 'Before & After';
      detectedUSP = 'Hasil nyata terlihat dalam hitungan hari, aman dan bersertifikasi.';
    } else if (combined.includes('tutorial') || combined.includes('cara pakai') || combined.includes('step')) {
      detectedCat = 'Tutorial';
      detectedUSP = 'Sangat mudah diaplikasikan, praktis untuk pemula sehari-hari.';
    } else if (combined.includes('review') || combined.includes('honest') || combined.includes('jujur')) {
      detectedCat = 'Review';
      detectedUSP = 'Formula berkualitas tinggi, rating 4.9/5 dari ribuan pembeli.';
    } else if (combined.includes('daily') || combined.includes('vlog') || combined.includes('rutinitas')) {
      detectedCat = 'Daily Vlog';
    } else if (combined.includes('grwm') || combined.includes('makeup') || combined.includes('outfit')) {
      detectedCat = 'GRWM';
    }

    // Specific product heuristics
    if (combined.includes('kopi') || combined.includes('coffee') || combined.includes('diet') || combined.includes('slimming') || combined.includes('langsing')) {
      if (!cleanTextNoUrls || detectedName === 'Produk Unggulan Pilihan') detectedName = 'Sago Slimming Green Coffee';
      detectedCat = 'Before & After';
      detectedDesc = 'Kopi herbal penurun nafsu makan alami untuk menjaga berat badan ideal tanpa rasa pahit.';
      detectedUSP = 'Bikin kenyang lebih lama, metabolisme lancar, aman di lambung & bersertifikasi BPOM.';
      detectedAudience = 'Pria & wanita usia 22-45 tahun yang ingin badan lebih fit dan ramping.';
      detectedTags.push('Diet Sehat', 'Herbal Coffee');
    } else if (combined.includes('serum') || combined.includes('skincare') || combined.includes('jerawat') || combined.includes('acne') || combined.includes('glowing') || combined.includes('brightening')) {
      if (!cleanTextNoUrls || detectedName === 'Produk Unggulan Pilihan') detectedName = 'Glow Niacinamide Barrier Serum';
      detectedCat = 'Review';
      detectedDesc = 'Serum pencerah wajah dengan 10% Niacinamide murni yang merawat skin barrier dan memudarkan flek.';
      detectedUSP = 'Mencerahkan dalam 7 hari, tekstur ringan cepat meresap, non-comedogenic.';
      detectedAudience = 'Wanita & pria 18-35 tahun dengan masalah kulit kusam atau bekas jerawat.';
      detectedTags.push('Skincare Viral', 'Glowing Skin');
    } else if (combined.includes('keyboard') || combined.includes('headset') || combined.includes('tws') || combined.includes('gadget') || combined.includes('mouse')) {
      if (!cleanTextNoUrls || detectedName === 'Produk Unggulan Pilihan') detectedName = 'Wireless Ergonomic Mechanical Keyboard';
      detectedCat = 'Unboxing';
      detectedDesc = 'Keyboard wireless multi-device dengan tactile switch empuk dan lampu RGB estetik.';
      detectedUSP = 'Baterai awet hingga 3 bulan, switch hening, koneksi bluetooth stabil 3 perangkat.';
      detectedAudience = 'Pekerja WFH, content creator, dan gamers usia 18-35 tahun.';
      detectedTags.push('Setup Desk', 'Tech Gadget');
    } else if (combined.includes('baju') || combined.includes('hoodie') || combined.includes('outfit') || combined.includes('fashion') || combined.includes('dress')) {
      if (!cleanTextNoUrls || detectedName === 'Produk Unggulan Pilihan') detectedName = 'Korean Oversized Fleece Hoodie';
      detectedCat = 'Haul';
      detectedDesc = 'Hoodie streetwear bahan fleece tebal premium dengan potongan oversize korean style.';
      detectedUSP = 'Bahan lembut tidak panas, jahitan rapi kuat, promo diskon voucher toko.';
      detectedAudience = 'Gen Z dan remaja 16-28 tahun yang suka mix and match outfit kekinian.';
      detectedTags.push('OOTD', 'Korean Fashion');
    }

    return res.json({
      success: true,
      data: {
        productName: detectedName,
        category: detectedCat,
        productDescription: detectedDesc,
        targetAudience: detectedAudience,
        keySellingPoints: detectedUSP,
        tone: detectedTone,
        targetPlatform: detectedPlatform,
        targetDuration: detectedDuration,
        cameraStyle: detectedCat === 'Before & After' ? 'Split-Screen & Dual Angle (Sebelum vs Sesudah)' :
          detectedCat === 'Unboxing' ? 'Overhead / Flat Lay Studio (90° Top-Down)' :
          detectedCat === 'Review' ? 'Handheld Vlog & Casual Selfie' :
          'Kombinasi Dinamis (Rekomendasi AI Otomatis)',
        cameraStyleReason: `Gaya kamera disesuaikan dengan kategori ${detectedCat} untuk memaksimalkan retensi visual penonton.`,
        visualFraming: (detectedCat === 'Unboxing' || combined.includes('keyboard') || combined.includes('gadget')) ? 'hands_pov' :
          (detectedCat === 'Haul' || combined.includes('hoodie') || combined.includes('outfit') || combined.includes('baju')) ? 'full_body' :
          (combined.includes('serum') || combined.includes('skincare') || combined.includes('jerawat')) ? 'face_closeup' :
          'mix_framing',
        detectedTags,
        detectionSummary: `Berhasil mendeteksi otomatis produk "${detectedName}" untuk kategori ${detectedCat}.`,
      },
      source: 'smart-heuristic',
    });
  } catch (error: any) {
    console.error('Server error in /api/auto-detect-product:', error);
    res.status(500).json({ error: error.message || 'Gagal mendeteksi link produk' });
  }
};

app.post('/api/auto-detect', autoDetectHandler);
app.post('/api/auto-detect-product', autoDetectHandler);

// Helper to get directory safely across both native ESM (dev) and bundled CommonJS (production)
const getBaseDir = () => (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

// Serve @ffmpeg/core assets statically (for client-side FFmpeg WebAssembly)
const ffmpegDirCandidates = [
  path.join(process.cwd(), 'node_modules/@ffmpeg/core/dist/umd'),
  path.resolve(getBaseDir(), '../node_modules/@ffmpeg/core/dist/umd'),
];
for (const dir of ffmpegDirCandidates) {
  if (fs.existsSync(dir)) {
    app.use('/ffmpeg', express.static(dir));
    break;
  }
}

// Setup Vite development middleware or static production serving
async function startServer() {
  // Detect environment accurately:
  // In the AI Studio development sandbox, process.env.CONTROL_PLANE_PORT or NODE_ENV !== 'production' is set.
  // In Cloud Run production deployment, the bundled dist/server.cjs is executed in production mode.
  const isBundled = typeof __filename !== 'undefined' ? (__filename.endsWith('.cjs') || __filename.includes('dist')) : false;
  const isDevSandbox = !isBundled && (process.env.NODE_ENV === 'development' || Boolean(process.env.CONTROL_PLANE_PORT));
  const isProduction = !isDevSandbox;

  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('Vite dev middleware init error, falling back to static files:', viteErr);
      const distPath = fs.existsSync(path.join(getBaseDir(), 'index.html'))
        ? getBaseDir()
        : path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  } else {
    // Production static serving from dist/
    const distPath = fs.existsSync(path.join(getBaseDir(), 'index.html'))
      ? getBaseDir()
      : path.resolve(process.cwd(), 'dist');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(200).send('<!DOCTYPE html><html><body><h1>UGC Master App</h1></body></html>');
        }
      });
    }
  }

  // Determine port:
  // - In AI Studio Dev Sandbox: Port 3000 is required by the local nginx proxy.
  // - In Cloud Run Production: Cloud Run sets process.env.PORT (typically 8080) for health checks and traffic ingress.
  const PORT = isDevSandbox
    ? 3000
    : (process.env.PORT ? parseInt(process.env.PORT, 10) : 8080);

  const mainServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`UGC Master server running at http://0.0.0.0:${PORT} (isProduction=${isProduction})`);
  });

  mainServer.on('error', (err: any) => {
    console.error(`Main server error on port ${PORT}:`, err.message);
  });

  // If in production and PORT is not 3000, also bind an auxiliary listener on port 3000
  // to seamlessly handle any proxies routing to 3000 as well
  if (isProduction && PORT !== 3000) {
    try {
      const auxServer = app.listen(3000, '0.0.0.0', () => {
        console.log('UGC Master also listening on auxiliary port 3000');
      });
      auxServer.on('error', (err: any) => {
        // Safe to ignore if port 3000 is unavailable or already in use
      });
    } catch {
      // safe fallback
    }
  }
}

startServer();
