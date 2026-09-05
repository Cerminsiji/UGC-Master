import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// List of supported Gemini models with automatic cascading fallback (fastest & most stable first)
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
];

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

// High-speed multi-model generator with clean config & strict timeouts
async function generateWithFallback(
  prompt: string,
  config: any,
  systemInstruction?: string,
  timeoutMs = 25000
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const requestConfig = {
    ...config,
    ...(systemInstruction ? { systemInstruction } : {}),
  };

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
        return text;
      }
    } catch (err: any) {
      const isQuota =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('Quota exceeded') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');
      const isUnavailable =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('high demand');

      if (isQuota) {
        console.log(`[Gemini AI] Quota limit reached for ${model}, switching to next candidate.`);
      } else if (isUnavailable) {
        console.log(`[Gemini AI] Model ${model} temporarily unavailable, switching to next candidate.`);
      } else {
        console.log(`[Gemini AI] Model ${model} fallback: ${err?.message || err}`);
      }
    }
  }

  return null;
}

// Clean JSON response helper
function parseSafeJson<T>(rawText: string | null): T | null {
  if (!rawText) return null;
  try {
    // Strip possible markdown fences
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (err) {
    console.error('Failed to parse JSON text from Gemini:', err, rawText);
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
  requestedSceneCount: number = 0
) {
  const normCat = (category || '').toLowerCase();
  const safeName = productName || 'Produk Pilihan';
  const safeUSP = keySellingPoints || 'Hasil terbukti, praktis & aman digunakan setiap hari';

  // Rich 9-step template library
  const full9Scenes = [
    {
      cameraAngle: 'POV / Handheld Close',
      visualAction: `Kreator menatap kamera dengan tatapan kaget dan gesture tangan menyetop scroll.`,
      popupText: 'JANGAN SKIP DULU! 😱',
      soundEffect: 'Record scratch & Vine boom',
      dialogVO: `Stop scrolling! Ada satu rahasia yang wajib kalian tahu hari ini!`,
      notesMood: 'Gaya teks: Bold Red/Yellow. High energy expression.',
    },
    {
      cameraAngle: 'Extreme Close-up',
      visualAction: `Zoom cepat ke ekspresi penasaran/masalah yang sering dialami audiens.`,
      popupText: 'PERNAH ALAMI INI? 😫',
      soundEffect: 'Dramatic swoosh',
      dialogVO: `Dulu sering banget kesel sama masalah ini dan gak nemu solusinya.`,
      notesMood: 'Gaya teks: Chat Bubble. Pencahayaan sedikit dramatis.',
    },
    {
      cameraAngle: 'Medium Shot',
      visualAction: `Kreator tersenyum lega sambil mengangkat kemasan ${safeName}.`,
      popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
      soundEffect: 'Sparkle chime & Ding',
      dialogVO: `Sampai akhirnya aku nemu ${safeName} yang lagi viral ini!`,
      notesMood: 'Gaya teks: Bouncy Glow. Transisi cerah.',
    },
    {
      cameraAngle: 'Close-up Macro',
      visualAction: `Sorotan close-up kemasan, segel dan detail material estetik ${safeName}.`,
      popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
      soundEffect: 'Camera shutter & Pop',
      dialogVO: `Packaging dan build quality-nya beneran premium banget.`,
      notesMood: 'Gaya teks: Gold Badge. Detail tekstur produk.',
    },
    {
      cameraAngle: 'POV / Macro Angle',
      visualAction: `Demonstrasi membuka / menuang / mencoba tekstur ${safeName} secara detail.`,
      popupText: 'TEKSTUR MEWAH & NYAMAN 🌿',
      soundEffect: 'ASMR Crisp & Smooth Whoosh',
      dialogVO: `Cara pakainya super praktis dan kerasa banget bedanya dari pertama coba.`,
      notesMood: 'Gaya teks: Minimalist Subtitle. Lighting jernih.',
    },
    {
      cameraAngle: 'Side Angle 45°',
      visualAction: `Aksi pemakaian langsung produk di depan cermin/meja dengan ekspresi enjoy.`,
      popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
      soundEffect: 'Ting sparkle',
      dialogVO: `Kandungannya juara dan langsung ngefek positif tanpa ribet.`,
      notesMood: 'Gaya teks: Clean bullet points. Natural smile.',
    },
    {
      cameraAngle: 'Close-up Face',
      visualAction: `Reaksi wajah puas tersenyum lebar dengan ekspresi terkesima.`,
      popupText: 'JUJUR GAK NYANGKA! 😍',
      soundEffect: 'Cheer & Success chime',
      dialogVO: `Hasilnya di luar dugaan, beneran ngebantu banget dan bikin pede!`,
      notesMood: 'Gaya teks: Heart pop emoji. Warm studio tone.',
    },
    {
      cameraAngle: 'Medium Shot',
      visualAction: `Kreator memegang ${safeName} di samping wajah sambil memberikan gestur jempol.`,
      popupText: 'SUPER WORTH IT! 💯',
      soundEffect: 'Cha-ching cash register',
      dialogVO: `Menurut aku ini 10/10 dan beneran worth to buy banget.`,
      notesMood: 'Gaya teks: Green verified badge.',
    },
    {
      cameraAngle: 'Medium Wide Shot',
      visualAction: `Kreator tersenyum antusias menunjuk ke pojok kiri bawah (keranjang kuning).`,
      popupText: 'BURUAN CHECKOUT DISKON! 🛒',
      soundEffect: 'Bell ring & Cha-ching',
      dialogVO: `Mumpung ada voucher diskon & gratis ongkir, langsung checkout di keranjang kuning ya!`,
      notesMood: 'Gaya teks: Pulsing CTA Button. Urgent offer.',
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
      targetDuration = 30,
      targetSceneCount = 0, // 0 = Auto, or 3-9 adegan
      platform = 'TikTok / Reels',
      language = 'id',
    } = req.body;

    const sceneCountText = targetSceneCount && targetSceneCount >= 2 && targetSceneCount <= 9
      ? `WAJIB BUAT TEPAT ${targetSceneCount} ADEGAN (meskipun durasi hanya ${targetDuration} detik, buat ${targetSceneCount} adegan bergaya fast-cut mikro yang dinamis!).`
      : `Buat 5 sampai 7 adegan yang proporsional, kaya, dan variatif agar alur video memikat dan tidak monoton.`;

    const prompt = `Kamu adalah pakar Creative Director & Scriptwriter UGC (User-Generated Content) viral TikTok Shop, Shopee Video, dan Instagram Reels di Indonesia.
Buatkan storyboard UGC video lengkap yang terbukti memiliki Conversion Rate & Retention Rate tinggi untuk produk berikut:

Kategori Konten: ${category}
Nama Produk: ${productName}
Deskripsi Produk: ${productDescription || 'Produk viral berkualitas tinggi dengan manfaat nyata'}
Target Audiens: ${targetAudience}
Poin Penjualan Utama (USP): ${keySellingPoints || 'Hasil cepat, harga terjangkau, praktis digunakan'}
Tone of Voice: ${tone}
Target Durasi Total: ${targetDuration} detik
Jumlah Adegan yang Diminta: ${sceneCountText}
Platform: ${platform}
Bahasa: ${language === 'id' ? 'Bahasa Indonesia (Gaya bicara kreator UGC TikTok santai, luwes, natural, tidak kaku)' : 'English (Casual UGC creator style)'}

Syarat Wajib Format Storyboard:
1. Adegan 1 WAJIB HOOK 3 DETIK PERTAMA (Visual + Audio/SFX + On-Screen Text) yang bikin orang stop scrolling.
2. Adegan berikutnya mendemonstrasikan masalah / unboxing / tutorial / sebelum vs sesudah / manfaat nyata produk secara dinamis.
3. Adegan terakhir WAJIB Call To Action (CTA) yang jelas dan mendesak (misal: checkout di keranjang kuning mumpung promo diskon & gratis ongkir).
4. Berikan Sound Effect (SFX) yang KAYA, BERVARIASI, dan SPESIFIK di setiap adegan (kombinasi ASMR nyata, meme viral, bass drop, swoosh, cash register, ding, crunch, water swirl, heartbeat). DILARANG menggunakan SFX yang sama berulang-ulang di tiap adegan.
5. Naskah Voiceover (VO) harus BERVARIASI SECARA EMOSIONAL dan intonasi alami: dari penasaran, heboh, curhat, hingga meyakinkan saat closing CTA. Sesuaikan panjang kata dengan durasi adegan agar tidak terburu-buru.
6. Pop-up Text harus huruf kapital mencolok & singkat.
7. Durasi setiap adegan (dalam integer detik) jika dijumlahkan WAJIB bernilai total mendekati ${targetDuration} detik. Jika durasi pendek (${targetDuration}s) dan adegan banyak (hingga 9 adegan), gunakan durasi fast-cut 1-2 detik per adegan.
8. BUATKAN AUTO CAPTION DENGAN HASHTAG: Tulis 1 caption postingan media sosial yang menarik dan menjual, LENGKAP dengan 2-4 hashtag trending.
   PENTING: TOTAL PANJANG KARAKTER CAPTION TERMASUK HASHTAG HARUS MAKSIMAL 150 KARAKTER!`;

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
      targetSceneCount
    );

    return res.json({
      success: true,
      data: fallbackData,
      source: 'smart-template',
    });
  } catch (error: any) {
    console.error('Server error in /api/generate-storyboard:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Dedicated endpoint to generate / regenerate viral captions <= 150 characters
app.post('/api/generate-caption', async (req, res) => {
  try {
    const {
      productName = 'Produk Viral',
      category = 'UGC',
      keySellingPoints = '',
      targetAudience = '',
      platform = 'TikTok Shop',
    } = req.body;

    const prompt = `Buatkan 1 caption postingan media sosial (${platform}) yang super menjual, catchy, ada call-to-action ke keranjang kuning/bio, dan 2-4 hashtag trending untuk:
Produk: ${productName}
Kategori: ${category}
USP: ${keySellingPoints}
Target Audiens: ${targetAudience}

ATURAN PALING KRUSIAL:
TOTAL PANJANG KARAKTER CAPTION TERMASUK HASHTAG DAN SPASI HARUS MAKSIMAL 150 KARAKTER (Character Count <= 150).`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: {
            type: Type.STRING,
            description: 'Caption lengkap dengan hashtag (MAKSIMAL 150 KARAKTER)',
          },
          characterCount: {
            type: Type.INTEGER,
            description: 'Jumlah karakter dalam caption',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar hashtag yang disertakan',
          },
        },
        required: ['caption'],
      },
    };

    const raw = await generateWithFallback(
      prompt,
      config,
      'You are an expert social media copywriter. Keep caption length strictly under 150 characters.'
    );

    const parsed = parseSafeJson<any>(raw);
    let finalCaption = parsed?.caption || formatShortCaption(productName, category, keySellingPoints);
    if (finalCaption.length > 150) {
      finalCaption = finalCaption.slice(0, 147) + '...';
    }

    return res.json({
      success: true,
      caption: finalCaption,
      characterCount: finalCaption.length,
      hashtags: parsed?.hashtags || ['#RacunTikTok', '#fyp', '#TikTokShop'],
    });
  } catch (error: any) {
    const fallbackCaption = formatShortCaption(req.body?.productName || 'Produk');
    return res.json({
      success: true,
      caption: fallbackCaption,
      characterCount: fallbackCaption.length,
      hashtags: ['#RacunTikTok', '#fyp', '#TikTokShop'],
    });
  }
});

// AI Single Scene Polish / Rewrite
app.post('/api/enhance-scene', async (req, res) => {
  try {
    const { scene, instruction = 'make it more viral and catchy', category = 'UGC' } = req.body;

    const prompt = `Kamu adalah UGC director. Tingkatkan adegan storyboard video berikut agar lebih viral, natural, dan memicu konversi tinggi.
Instruksi perbaikan: "${instruction}"
Kategori video: "${category}"

Adegan saat ini:
- Sudut kamera: ${scene.cameraAngle || 'Medium Shot'}
- Aksi visual: ${scene.visualAction || ''}
- Teks pop-up layar: ${scene.popupText || ''}
- Efek suara (SFX): ${scene.soundEffect || ''}
- Dialog / VO: ${scene.dialogVO || ''}
- Catatan / Mood: ${scene.notesMood || ''}
- Durasi: ${scene.duration || 3} detik

Tulis ulang adegan ini dalam format JSON yang ditingkatkan.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cameraAngle: { type: Type.STRING },
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

    const rawText = await generateWithFallback(prompt, config);
    const parsedScene = parseSafeJson<any>(rawText);

    if (parsedScene && parsedScene.visualAction) {
      return res.json({ success: true, scene: parsedScene });
    }

    // Rule-based enhancement fallback
    return res.json({
      success: true,
      scene: {
        cameraAngle: scene.cameraAngle || 'Close-up Dynamic',
        visualAction: scene.visualAction
          ? `${scene.visualAction} (Gerakan tangan dipertegas, mimik ekspresif)`
          : 'Kreator menunjukkan produk dengan gesture ekspresif.',
        popupText: scene.popupText ? `${scene.popupText.toUpperCase()} 🔥` : 'RAHASIA VIRAL TERUNGKAP! ✨',
        soundEffect: scene.soundEffect ? `${scene.soundEffect} + Bass boost` : 'Swoosh & Cha-ching',
        dialogVO: scene.dialogVO
          ? `${scene.dialogVO} Beneran gak nyangka sebagus ini!`
          : 'Gak nyangka nemu barang sebagus ini!',
        notesMood: scene.notesMood || 'Gaya teks: Dynamic Bouncy. Pencahayaan terang kontras.',
        duration: Number(scene.duration) || 3,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Hook Variations Generator
app.post('/api/generate-hooks', async (req, res) => {
  try {
    const { productName = 'Produk', category = 'Before & After' } = req.body;

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
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
9. detectedTags: Array 3-5 kata kunci relevan (misal: ["skincare", "niacinamide", "pencerah", "anti-acne"]).
10. detectionSummary: Penjelasan ringkas ramah 1 kalimat tentang apa yang berhasil dideteksi.`;

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
      20000
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

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UGC Master server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
