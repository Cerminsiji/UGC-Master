import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow image base64 uploads up to 15mb
app.use(express.json({ limit: '15mb' }));

// List of supported Gemini models with automatic cascading fallback (fastest first)
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest',
];

// Lazy-safe Gemini AI client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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
  timeoutMs = 6000
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

      if (isQuota) {
        console.warn(`[Gemini AI] Quota limit reached for ${model}, switching to next candidate.`);
      } else {
        console.warn(`[Gemini AI] Model ${model} skipped: ${err?.message || err}`);
      }
    }
  }

  return null;
}

// Multimodal Vision Generator for product image analysis
async function generateMultimodalWithFallback(
  parts: any[],
  config: any,
  systemInstruction?: string,
  timeoutMs = 8000
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
          contents: [{ role: 'user', parts }],
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
      console.warn(`[Gemini Vision] Model ${model} skipped: ${err?.message || err}`);
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
  requestedSceneCount: number = 0,
  visualFocus: 'mix' | 'hands_only' | 'face' | 'full_body' = 'mix'
) {
  const normCat = (category || '').toLowerCase();
  const safeName = productName || 'Produk Pilihan';
  const safeUSP = keySellingPoints || 'Hasil terbukti, praktis & aman digunakan setiap hari';

  // Base scene definitions adapted according to visualFocus (hands_only, face, full_body, mix)
  let full9Scenes = [];

  if (visualFocus === 'hands_only') {
    full9Scenes = [
      {
        cameraAngle: 'POV Top-Down / Handheld Desk',
        visualAction: `Dua tangan memegang kemasan ${safeName} di atas meja estetik, membuka segel kemasan dengan suara crisp ASMR. Konsisten 100% dengan gambar referensi produk di Google Flow (NO CGI, NO Kartun/3D, tekstur tangan manusia alami, no extra fingers).`,
        popupText: 'JANGAN SKIP DULU! 😱',
        soundEffect: 'Box opening & Crisp unboxing click',
        dialogVO: `Stop scrolling! Ada satu produk viral yang wajib kalian lihat detailnya hari ini!`,
        notesMood: 'Gaya teks: Bold Red/Yellow. Fokus hanya tangan, pencahayaan meja estetik.',
      },
      {
        cameraAngle: 'POV Extreme Close-up Hands',
        visualAction: `Tangan menunjukkan perbandingan tekstur/kemasan lama vs detail premium ${safeName}. Tangan bergerak alami tanpa morphing AI.`,
        popupText: 'BEDANYA JAUH BANGET! 😫',
        soundEffect: 'Dramatic swoosh & Pop',
        dialogVO: `Dulu sering kecewa sama produk abal-abal, sampai akhirnya nemu yang ini.`,
        notesMood: 'Gaya teks: Chat Bubble. Macro lens detail.',
      },
      {
        cameraAngle: 'POV Eye-level Desk',
        visualAction: `Tangan memutar kemasan ${safeName} 360 derajat memperlihatkan logo dan label asli sesuai referensi gambar.`,
        popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
        soundEffect: 'Sparkle chime & Ding',
        dialogVO: `Ini dia ${safeName}, kemasannya beneran mewah dan tersegel rapi banget!`,
        notesMood: 'Gaya teks: Bouncy Glow. Clean lighting.',
      },
      {
        cameraAngle: 'Close-up Macro Texture',
        visualAction: `Tangan menuangkan / mengaplikasikan sedikit ${safeName} ke punggung tangan untuk memperlihatkan tekstur asli yang cepat meresap.`,
        popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
        soundEffect: 'Satisfying squish & Camera shutter',
        dialogVO: `Lihat teksturnya, halus banget, wangi lembut dan langsung meresap sempurna.`,
        notesMood: 'Gaya teks: Gold Badge. ASMR focus.',
      },
      {
        cameraAngle: 'POV Hands Action',
        visualAction: `Kedua tangan memperagakan cara penggunaan ${safeName} secara step-by-step di atas meja kerja yang bersih.`,
        popupText: 'PRAKTIS & NYAMAN 🌿',
        soundEffect: 'ASMR Crisp & Smooth Whoosh',
        dialogVO: `Cara pakainya praktis gak butuh waktu lama, beneran kepake tiap hari.`,
        notesMood: 'Gaya teks: Minimalist Subtitle. Natural skin tone.',
      },
      {
        cameraAngle: 'POV Side Angle 45°',
        visualAction: `Tangan menunjukkan hasil uji coba langsung produk ${safeName} dengan gesture jempol mantap di depan kemasan.`,
        popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
        soundEffect: 'Ting sparkle',
        dialogVO: `Kandungannya juara dan langsung kerasa manfaatnya dari pemakaian pertama.`,
        notesMood: 'Gaya teks: Clean bullet points.',
      },
      {
        cameraAngle: 'POV Close-up Swatch',
        visualAction: `Tangan membandingkan hasil nyata di permukaan kulit yang tampak bersih, cerah dan natural.`,
        popupText: 'JUJUR GAK NYANGKA! 😍',
        soundEffect: 'Cheer & Success chime',
        dialogVO: `Hasilnya di luar ekspektasi, beneran gak nyesel coba produk ini!`,
        notesMood: 'Gaya teks: Heart pop emoji.',
      },
      {
        cameraAngle: 'POV Handheld Presentation',
        visualAction: `Satu tangan memegang produk ${safeName} tegak di tengah frame, menepuk-nepuk botol dengan percaya diri.`,
        popupText: 'SUPER WORTH IT! 💯',
        soundEffect: 'Cha-ching cash register',
        dialogVO: `Buat harga segini dengan kualitas bintang 5, menurut aku 10/10 worth to buy.`,
        notesMood: 'Gaya teks: Green verified badge.',
      },
      {
        cameraAngle: 'POV Handheld Pointing',
        visualAction: `Tangan memegang ${safeName} sambil jari telunjuk menunjuk ke sudut kiri bawah layar (arah keranjang kuning).`,
        popupText: 'BURUAN CHECKOUT DISKON! 🛒',
        soundEffect: 'Bell ring & Cha-ching',
        dialogVO: `Mumpung ada voucher diskon & gratis ongkir, langsung tap keranjang kuning di bawah ya!`,
        notesMood: 'Gaya teks: Pulsing CTA Button. Urgent offer.',
      },
    ];
  } else if (visualFocus === 'face') {
    full9Scenes = [
      {
        cameraAngle: 'Close-up Face / Talking Head',
        visualAction: `Kreator menatap langsung ke kamera smartphone dengan ekspresi kaget penasaran, alis terangkat, mimik wajah ekspresif natural tanpa AI filter berlebih.`,
        popupText: 'JANGAN SKIP DULU! 😱',
        soundEffect: 'Record scratch & Vine boom',
        dialogVO: `Stop scrolling! Kalian wajib tahu rahasia yang satu ini sebelum nyesel!`,
        notesMood: 'Gaya teks: Bold Red/Yellow. Talking head ekspresif, pencahayaan ring-light natural.',
      },
      {
        cameraAngle: 'Tight Close-up Face',
        visualAction: `Kreator mendekat ke kamera dengan tatapan curhat mengenai masalah sehari-hari yang relate dengan audiens.`,
        popupText: 'PERNAH ALAMI INI? 😫',
        soundEffect: 'Dramatic swoosh',
        dialogVO: `Dulu aku sering banget ngeluh dan gak percaya diri gara-gara masalah ini.`,
        notesMood: 'Gaya teks: Chat Bubble. Ekspresi curhat natural.',
      },
      {
        cameraAngle: 'Medium Close-up Face & Product',
        visualAction: `Kreator tersenyum lega sambil mengangkat kemasan ${safeName} sejajar dengan pipi. Kemasan konsisten 100% sesuai gambar referensi Google Flow.`,
        popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
        soundEffect: 'Sparkle chime & Ding',
        dialogVO: `Sampai akhirnya aku nemu ${safeName} yang beneran jadi penyelamat aku!`,
        notesMood: 'Gaya teks: Bouncy Glow. Senyum tulus organik.',
      },
      {
        cameraAngle: 'Close-up Face Talking',
        visualAction: `Kreator menjelaskan keunggulan utama dengan kontak mata tajam dan antusias ke kamera.`,
        popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
        soundEffect: 'Camera shutter & Pop',
        dialogVO: `Formulanya aman, packaging-nya premium, dan beneran cocok di aku.`,
        notesMood: 'Gaya teks: Gold Badge. Mimik meyakinkan.',
      },
      {
        cameraAngle: 'Medium Close-up Reaction',
        visualAction: `Kreator mendemonstrasikan aroma / rasa / sensasi penggunaan ${safeName} dengan ekspresi wajah menikmati (closed eyes refreshing).`,
        popupText: 'ENAK & NYAMAN BANGET 🌿',
        soundEffect: 'ASMR Crisp & Smooth Whoosh',
        dialogVO: `Pas dicoba tuh rasanya nyaman banget, gak ada sensasi aneh sama sekali.`,
        notesMood: 'Gaya teks: Minimalist Subtitle.',
      },
      {
        cameraAngle: 'Close-up Face Smile',
        visualAction: `Kreator mengangguk mantap sambil tersenyum lebar menjelaskan poin keunggulan ${safeUSP}.`,
        popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
        soundEffect: 'Ting sparkle',
        dialogVO: `Manfaatnya langsung berasa dan bikin rutinitas harian aku jadi jauh lebih gampang.`,
        notesMood: 'Gaya teks: Clean bullet points.',
      },
      {
        cameraAngle: 'Tight Face Reaction',
        visualAction: `Kreator menatap pantulan cermin / kamera dengan mata berbinar puas melihat perubahan nyata.`,
        popupText: 'JUJUR GAK NYANGKA! 😍',
        soundEffect: 'Cheer & Success chime',
        dialogVO: `Jujur aku gak nyangka hasilnya bakal sebagus ini dalam waktu singkat!`,
        notesMood: 'Gaya teks: Heart pop emoji.',
      },
      {
        cameraAngle: 'Medium Close-up Face & Bottle',
        visualAction: `Kreator memeluk / memegang ${safeName} di dekat dagu dengan gestur jempol mantap.`,
        popupText: 'SUPER WORTH IT! 💯',
        soundEffect: 'Cha-ching cash register',
        dialogVO: `Ini beneran rekomendasi jujur dari aku, kalian wajib coba sendiri!`,
        notesMood: 'Gaya teks: Green verified badge.',
      },
      {
        cameraAngle: 'Medium Close-up Talking Head',
        visualAction: `Kreator tersenyum ramah dan mengedipkan mata sambil menunjuk ke arah keranjang kuning di kiri bawah.`,
        popupText: 'BURUAN CHECKOUT DISKON! 🛒',
        soundEffect: 'Bell ring & Cha-ching',
        dialogVO: `Mumpung ada promo diskon & gratis ongkir, langsung klik keranjang kuning sekarang ya!`,
        notesMood: 'Gaya teks: Pulsing CTA Button. Urgent call to action.',
      },
    ];
  } else if (visualFocus === 'full_body') {
    full9Scenes = [
      {
        cameraAngle: 'Full Body Standing Shot',
        visualAction: `Kreator berdiri full body di ruangan modern/outdoor, berjalan ke arah kamera dengan percaya diri dan postur tegap. NO CGI, tubuh manusia asli dengan gerakan organik alami.`,
        popupText: 'JANGAN SKIP DULU! 😱',
        soundEffect: 'Record scratch & Bass drop',
        dialogVO: `Stop scrolling! Buat kalian yang pengen perubahan postur & penampilan nyata, tonton ini!`,
        notesMood: 'Gaya teks: Bold Red/Yellow. Full body outfit/postur jelas.',
      },
      {
        cameraAngle: 'Full Body Profile Shot',
        visualAction: `Kreator memperlihatkan perbandingan postur tubuh / fitting pakaian sebelum vs sesudah dengan gerakan memutar badan anggun.`,
        popupText: 'PERNAH GAK PEDE? 😫',
        soundEffect: 'Dramatic swoosh',
        dialogVO: `Dulu sering banget ngerasa gak pede tiap kali mau pilih baju atau keluar rumah.`,
        notesMood: 'Gaya teks: Chat Bubble. Pencahayaan full body merata.',
      },
      {
        cameraAngle: 'Medium Full Shot',
        visualAction: `Kreator memegang kemasan ${safeName} sambil berpose dinamis, memperlihatkan produk secara konsisten sesuai gambar referensi Google Flow.`,
        popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
        soundEffect: 'Sparkle chime & Ding',
        dialogVO: `Sampai akhirnya aku konsisten pakai ${safeName} yang lagi viral ini!`,
        notesMood: 'Gaya teks: Bouncy Glow. Energi positif.',
      },
      {
        cameraAngle: 'Full Body Action Shot',
        visualAction: `Kreator mendemonstrasikan aktivitas harian / olahraga ringan / OOTD sambil membawa ${safeName}.`,
        popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
        soundEffect: 'Upbeat pop & Whoosh',
        dialogVO: `Bikin badan tetap segar, enteng dan berenergi sepanjang hari tanpa lemas.`,
        notesMood: 'Gaya teks: Gold Badge. Gerakan badan luwes alami.',
      },
      {
        cameraAngle: 'Medium Shot Walking',
        visualAction: `Kreator melangkah anggun memperlihatkan siluet tubuh yang proporsional dan outfit yang pas.`,
        popupText: 'LEBIH FIT & PEDE 🌿',
        soundEffect: 'ASMR Crisp & Smooth Whoosh',
        dialogVO: `Hasilnya kerasa banget, pakaian lama sekarang jadi muat dan nyaman dipakai.`,
        notesMood: 'Gaya teks: Minimalist Subtitle.',
      },
      {
        cameraAngle: 'Full Body 360 Turn',
        visualAction: `Kreator memutar badan 360 derajat tersenyum ceria memperlihatkan keunggulan ${safeUSP}.`,
        popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
        soundEffect: 'Ting sparkle',
        dialogVO: `Manfaatnya terbukti nyata dan bikin badan jauh lebih sehat dan bugar.`,
        notesMood: 'Gaya teks: Clean bullet points.',
      },
      {
        cameraAngle: 'Medium Full Body Smile',
        visualAction: `Kreator tersenyum riang merentangkan tangan dengan ekspresi bebas dan penuh percaya diri.`,
        popupText: 'JUJUR GAK NYANGKA! 😍',
        soundEffect: 'Cheer & Success chime',
        dialogVO: `Beneran seneng banget sama perubahannya, temen-temen sampai pada nanya rahasianya!`,
        notesMood: 'Gaya teks: Heart pop emoji.',
      },
      {
        cameraAngle: 'Full Body Pose',
        visualAction: `Kreator berpose santai memegang ${safeName} di pinggang dengan gesture dua jempol mantap.`,
        popupText: 'SUPER WORTH IT! 💯',
        soundEffect: 'Cha-ching cash register',
        dialogVO: `Buat kalian yang mau hasil nyata, aku rekomendasiin banget buat coba ${safeName}.`,
        notesMood: 'Gaya teks: Green verified badge.',
      },
      {
        cameraAngle: 'Medium Full Shot CTA',
        visualAction: `Kreator melangkah maju sambil tersenyum menunjuk jemari ke arah ikon keranjang kuning di kiri bawah.`,
        popupText: 'BURUAN CHECKOUT DISKON! 🛒',
        soundEffect: 'Bell ring & Cha-ching',
        dialogVO: `Yuk checkout sekarang mumpung lagi diskon besar dan gratis ongkir di keranjang kuning!`,
        notesMood: 'Gaya teks: Pulsing CTA Button. Dynamic closing.',
      },
    ];
  } else {
    // Dynamic Mix: Face + POV Hands + Full/Medium Shots
    full9Scenes = [
      {
        cameraAngle: 'POV / Handheld Close',
        visualAction: `Kreator menatap kamera dengan tatapan kaget dan gesture tangan menyetop scroll. Konsisten 100% dengan referensi produk Google Flow (No CGI, No Kartun/3D, Real Organic UGC).`,
        popupText: 'JANGAN SKIP DULU! 😱',
        soundEffect: 'Record scratch & Vine boom',
        dialogVO: `Stop scrolling! Ada satu rahasia yang wajib kalian tahu hari ini!`,
        notesMood: 'Gaya teks: Bold Red/Yellow. High energy expression.',
      },
      {
        cameraAngle: 'Extreme Close-up',
        visualAction: `Zoom cepat ke ekspresi penasaran/masalah yang sering dialami audiens. Kulit berpori natural tanpa filter berlebihan.`,
        popupText: 'PERNAH ALAMI INI? 😫',
        soundEffect: 'Dramatic swoosh',
        dialogVO: `Dulu sering banget kesel sama masalah ini dan gak nemu solusinya.`,
        notesMood: 'Gaya teks: Chat Bubble. Pencahayaan sedikit dramatis.',
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: `Kreator tersenyum lega sambil mengangkat kemasan ${safeName} yang identik dengan gambar referensi Google Flow.`,
        popupText: `SOLUSI: ${safeName.toUpperCase()} ✨`,
        soundEffect: 'Sparkle chime & Ding',
        dialogVO: `Sampai akhirnya aku nemu ${safeName} yang lagi viral ini!`,
        notesMood: 'Gaya teks: Bouncy Glow. Transisi cerah.',
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: `Sorotan close-up kemasan, segel dan detail material estetik ${safeName} dipegang oleh tangan manusia asli.`,
        popupText: 'KUALITAS BINTANG 5 ⭐⭐⭐⭐⭐',
        soundEffect: 'Camera shutter & Pop',
        dialogVO: `Packaging dan build quality-nya beneran premium banget.`,
        notesMood: 'Gaya teks: Gold Badge. Detail tekstur produk.',
      },
      {
        cameraAngle: 'POV / Macro Angle',
        visualAction: `Demonstrasi membuka / menuang / mencoba tekstur ${safeName} secara detail dengan tangan asli bertekstur nyata.`,
        popupText: 'TEKSTUR MEWAH & NYAMAN 🌿',
        soundEffect: 'ASMR Crisp & Smooth Whoosh',
        dialogVO: `Cara pakainya super praktis dan kerasa banget bedanya dari pertama coba.`,
        notesMood: 'Gaya teks: Minimalist Subtitle. Lighting jernih.',
      },
      {
        cameraAngle: 'Side Angle 45°',
        visualAction: `Aksi pemakaian langsung produk di depan cermin/meja dengan ekspresi enjoy dan gerakan organik.`,
        popupText: `${safeUSP.toUpperCase().slice(0, 30)} ⚡`,
        soundEffect: 'Ting sparkle',
        dialogVO: `Kandungannya juara dan langsung ngefek positif tanpa ribet.`,
        notesMood: 'Gaya teks: Clean bullet points. Natural smile.',
      },
      {
        cameraAngle: 'Close-up Face',
        visualAction: `Reaksi wajah puas tersenyum lebar dengan ekspresi terkesima dan kontak mata ramah.`,
        popupText: 'JUJUR GAK NYANGKA! 😍',
        soundEffect: 'Cheer & Success chime',
        dialogVO: `Hasilnya di luar dugaan, beneran ngebantu banget dan bikin pede!`,
        notesMood: 'Gaya teks: Heart pop emoji. Warm studio tone.',
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: `Kreator memegang ${safeName} di samping wajah sambil memberikan gestur jempol meyakinkan.`,
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
  }

  // Determine scene count (user can specify up to 9 scenes even for 10s)
  let desiredCount = requestedSceneCount && requestedSceneCount >= 2 && requestedSceneCount <= 9
    ? requestedSceneCount
    : (normCat.includes('before') || normCat.includes('unboxing') ? 4 : 3);

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
      id: `scene_${Date.now()}_${i + 1}`,
      order: i + 1,
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
      visualFocus = 'mix', // 'hands_only' | 'face' | 'full_body' | 'mix'
      productImageAnalysis = null,
      platform = 'TikTok / Reels',
      language = 'id',
    } = req.body;

    const sceneCountText = targetSceneCount && targetSceneCount >= 2 && targetSceneCount <= 9
      ? `WAJIB BUAT TEPAT ${targetSceneCount} ADEGAN (meskipun durasi hanya ${targetDuration} detik, buat ${targetSceneCount} adegan bergaya fast-cut mikro yang dinamis!).`
      : `Buat 3 sampai 9 adegan yang proporsional sesuai kebutuhan kategori.`;

    let visualFocusInstruction = '';
    if (visualFocus === 'hands_only') {
      visualFocusInstruction = `PILIHAN FOKUS TALENT: HANYA TANGAN (Hands-only / POV Unboxing & ASMR / Tanpa Wajah).
- DILARANG menampilkan wajah talent.
- Semua aksi visual berfokus pada interaksi tangan manusia asli yang memegang produk, unboxing di atas meja, demonstrasi tekstur, menuangkan, mengoleskan, atau memencet packaging dengan detail dekat (POV / Macro / Flatlay).`;
    } else if (visualFocus === 'face') {
      visualFocusInstruction = `PILIHAN FOKUS TALENT: WAJAH (Talking Head / Close-up Face / Mimik Ekspresif).
- Fokus utama pada wajah kreator yang berbicara langsung ke kamera smartphone (talking head).
- Ekspresi wajah mikro yang alami, kontak mata meyakinkan, reaksi mimik spontan, dan produk dipegang di samping wajah/dada.`;
    } else if (visualFocus === 'full_body') {
      visualFocusInstruction = `PILIHAN FOKUS TALENT: FULL BODY (Tubuh Penuh / Outfit / OOTD / Demonstrasi Fisik).
- Tampilkan postur tubuh penuh atau medium-full shot.
- Menampilkan gerakan badan nyata, peragaan outfit/fitting, aktivitas fisik/olahraga/vlog langkah, atau transformasi postur tubuh secara lengkap.`;
    } else {
      visualFocusInstruction = `PILIHAN FOKUS TALENT: CAMPURAN DINAMIS (Kombinasi Talking Head Wajah, POV Tangan Dekat, dan Medium/Full Shot).
- Variasikan sudut kamera antara wajah kreator, detail tangan memegang produk, dan demonstrasi interaksi produk secara dinamis.`;
    }

    const imagePromptGuide = productImageAnalysis?.googleFlowPromptGuide
      ? `\nREFERENSI VISUAL FOTO PRODUK (PANDUAN GOOGLE FLOW KONSISTENSI):
- Karakteristik Kemasan: ${productImageAnalysis.visualAppearance || 'Sesuai foto produk terunggah'}
- Instruksi Prompt Visual: ${productImageAnalysis.googleFlowPromptGuide}
- Kunci elemen visual kemasan di atas ke setiap adegan aksi visual agar gambar/video render nantinya 100% konsisten.`
      : '';

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
${visualFocusInstruction}
${imagePromptGuide}
Platform: ${platform}
Bahasa: ${language === 'id' ? 'Bahasa Indonesia (Gaya bicara kreator UGC TikTok santai, luwes, natural, tidak kaku)' : 'English (Casual UGC creator style)'}

====================
ATURAN WAJIB & MANDATORY PROMPT GUIDELINES (ANTI-AI & PRODUCT CONSISTENCY):
====================

1. KONSISTENSI PRODUK MUTLAK (GOOGLE FLOW IMAGE REFERENCE MATCHING):
   - Bentuk kemasan fisik (packaging botol, box, tube, sachet, pouch), warna kemasan, posisi label, font, dan logo brand WAJIB 100% konsisten dan persis dengan gambar referensi di Google Flow sepanjang SEMUA adegan.
   - DILARANG KERAS mengubah bentuk botol, warna tutup, atau mendistorsi logo produk antar adegan.

2. ANTI-AI MOVEMENT & REAL ORGANIC UGC QUALITY:
   - Gerakan Kamera: Gunakan pergerakan kamera smartphone handheld yang organik, natural, stabil alami khas kreator UGC (BUKAN gerakan AI gliding, floating, atau robotic panning yang kaku).
   - Talent Manusia Asli: Penampilan talent manusia nyata Indonesia/Asia Tenggara dengan tekstur pori-pori kulit asli, mimik wajah mikro alami (BUKAN uncanny valley, BUKAN kulit plastik lilin sintetis, BUKAN deepfake).
   - Pencahayaan: Pencahayaan ruangan alami / ring-light natural / meja studio kreator realistis.

3. ANTI-NEGATIVE CONSTRAINTS (STRICTLY FORBIDDEN):
   - BUKAN CGI, BUKAN 3D ANIMATION, BUKAN KARTUN/ANIME, NO ARTIFICIAL AI MORPHING.
   - NO DEFORMED EXTRA FINGERS/HANDS, NO DISTORTED PACKAGING LOGOS, NO ROBOTIC STIFFNESS, NO SYNTHETIC VIDEO SMOOTHING, NO UNCANNY VALLEY ARTIFACTS.

4. STRUKTUR FORMAT STORYBOARD:
   - Adegan 1: WAJIB HOOK 3 DETIK PERTAMA (Visual Shock / Negative Hook / Curhat Masalah + Audio SFX + On-Screen Text) yang membuat orang langsung berhenti scrolling.
   - Adegan Tengah: Demonstrasi produk, unboxing/tekstur, pembuktian USP, reaksi nyata sesuai fokus talent (${visualFocus}).
   - Adegan Terakhir: WAJIB Call To Action (CTA) mendesak ke keranjang kuning / checkout promo.
   - Durasi setiap adegan (integer detik) jika dijumlahkan bernilai total mendekati ${targetDuration} detik.
   - AUTO CAPTION VIRAL DENGAN HASHTAG: Tulis 1 caption postingan media sosial yang sangat menjual lengkap dengan 2-4 hashtag. TOTAL PANJANG KARAKTER CAPTION TERMASUK HASHTAG WAJIB MAKSIMAL 150 KARAKTER!`;

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
                  description: 'Deskripsi aksi fisik, ekspresi wajah, interaksi produk, konsistensi kemasan referensi Google Flow, anti-CGI, dan framing talent.',
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
                  description: 'Catatan teknis, gaya animasi teks (Chat Bubble/Bouncy), pencahayaan, instruksi anti-AI dan mood.',
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
      'You are an elite UGC video strategist and storyboard scriptwriter. Always return strictly valid JSON matching the schema. Adhere strictly to product reference consistency and anti-AI organic realism. Keep caption under 150 characters.'
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

    // High quality offline fallback generator (supports up to 9 scenes & custom duration & visual focus)
    const fallbackData = generateRichFallback(
      category,
      productName,
      targetDuration,
      targetAudience,
      keySellingPoints,
      targetSceneCount,
      visualFocus
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

// AI Product Image Analyzer (Multimodal Gemini Vision + Google Flow Prompt Guide)
app.post('/api/analyze-product-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', notes = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar produk tidak ditemukan' });
    }

    // Clean base64 string if it contains data prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Kamu adalah pakar Visual Product Director & UGC Ecommerce Analyst profesional.
Analisis foto produk yang diunggah pengguna ini secara mendalam untuk keperluan pembuatan Video UGC dan Storyboard konsisten (Google Flow match).

Catatan tambahan dari user: "${notes || 'Tidak ada'}"

Tugas ekstraksi Anda:
1. extractedName: Nama produk dan brand yang jelas & bersih terbaca pada kemasan atau label.
2. brandName: Nama brand/merek produk jika ada.
3. visualAppearance: Deskripsi visual kemasan secara sangat presisi (tipe wadah: botol pipet/jar/tube/spray/box/pouch/sachet, warna kemasan utama, warna tutup, bentuk kemasan, tekstur isi yang terlihat, logo dan teks utama).
4. extractedUSP: Poin keunggulan / klaim manfaat utama yang terbaca di label atau tampak dari jenis produk.
5. suggestedCategory: Kategori template UGC terbaik dari 12 pilihan: ["Before & After", "Review", "Unboxing", "Tutorial", "Problem & Solution", "Affiliate", "Daily Vlog", "GRWM", "Life Hacks", "ASMR / Satisfying", "Komedi / Sketsa", "Haul"].
6. targetAudience: Target persona pembeli yang paling relevan dengan produk ini.
7. googleFlowPromptGuide: Instruksi prompt visual singkat (1-2 kalimat) untuk mengunci konsistensi kemasan produk pada AI image/video generator (misal: "Kemasan botol kaca frosted 30ml tutup putih dengan cairan bening kental, label putih minimalis bertuliskan logo hitam").
8. detectedTags: Array 3-5 hashtag kata kunci relevan.
9. summary: Kalimat ramah 1 baris yang menyimpulkan produk yang terdeteksi.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedName: { type: Type.STRING },
          brandName: { type: Type.STRING },
          visualAppearance: { type: Type.STRING },
          extractedUSP: { type: Type.STRING },
          suggestedCategory: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          googleFlowPromptGuide: { type: Type.STRING },
          detectedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          summary: { type: Type.STRING },
        },
        required: [
          'extractedName',
          'visualAppearance',
          'extractedUSP',
          'suggestedCategory',
          'targetAudience',
          'googleFlowPromptGuide',
        ],
      },
    };

    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      },
    ];

    const rawText = await generateMultimodalWithFallback(
      parts,
      config,
      'You are an expert AI vision analyst for ecommerce products. Output strictly valid JSON.'
    );

    const parsed = parseSafeJson<any>(rawText);
    if (parsed && parsed.extractedName) {
      return res.json({
        success: true,
        data: {
          productName: parsed.extractedName,
          brandName: parsed.brandName || '',
          category: parsed.suggestedCategory || 'Review',
          productDescription: `Produk ${parsed.extractedName}. ${parsed.visualAppearance || ''}`,
          targetAudience: parsed.targetAudience || 'Pengguna media sosial yang mencari solusi praktis',
          keySellingPoints: parsed.extractedUSP || 'Kualitas premium terjamin dengan kemasan estetik',
          tone: 'Santai, Relatable & Meyakinkan',
          targetPlatform: 'TikTok Shop',
          targetDuration: 30,
          detectedTags: parsed.detectedTags || ['#RacunTikTok', '#UGC', '#Viral'],
          detectionSummary: parsed.summary || `Foto produk berhasil dianalisis: "${parsed.extractedName}"`,
          productImageAnalysis: {
            extractedName: parsed.extractedName,
            brandName: parsed.brandName,
            visualAppearance: parsed.visualAppearance,
            extractedUSP: parsed.extractedUSP,
            suggestedCategory: parsed.suggestedCategory,
            googleFlowPromptGuide: parsed.googleFlowPromptGuide,
          },
        },
        source: 'gemini-vision',
      });
    }

    // Heuristic Fallback for Image Upload
    return res.json({
      success: true,
      data: {
        productName: 'Produk Referensi Foto',
        brandName: 'Brand Pilihan',
        category: 'Before & After',
        productDescription: 'Kemasan produk sesuai dengan foto referensi terunggah dengan detail fisik konsisten.',
        targetAudience: 'Audiens media sosial usia 18-35 tahun yang tertarik dengan review produk nyata.',
        keySellingPoints: 'Kemasan tersegel rapi, visual premium, hasil terbukti memuaskan.',
        tone: 'Santai, Relatable & Meyakinkan',
        targetPlatform: 'TikTok Shop',
        targetDuration: 30,
        detectedTags: ['#RacunTikTok', '#ProdukViral', '#SpillRacun'],
        detectionSummary: 'Foto produk referensi berhasil dimuat dan visual siap dikunci ke Google Flow prompt.',
        productImageAnalysis: {
          extractedName: 'Produk Referensi Terunggah',
          visualAppearance: 'Kemasan produk fisik konsisten 100% dengan foto referensi yang diunggah user.',
          extractedUSP: 'Formula efektif, kemasan praktis, hasil terbukti memuaskan.',
          suggestedCategory: 'Before & After',
          googleFlowPromptGuide: 'Gunakan kemasan fisik, warna, dan logo persis sesuai referensi foto produk yang terunggah.',
        },
      },
      source: 'smart-heuristic',
    });
  } catch (error: any) {
    console.error('Server error in /api/analyze-product-image:', error);
    res.status(500).json({ error: error.message || 'Gagal menganalisis foto produk' });
  }
});

// AI Single Scene Polish / Rewrite (100% Strict Indonesian Language Guarantee)
app.post('/api/enhance-scene', async (req, res) => {
  try {
    const {
      scene,
      instruction = 'Tingkatkan agar lebih viral, hook lebih tajam, dan aksi visual lebih ekspresif',
      category = 'UGC',
      language = 'id',
    } = req.body;

    const isIndonesian = language === 'id';

    const languageConstraint = isIndonesian
      ? `ATURAN BAHASA MUTLAK:
- WAJIB 100% BAHASA INDONESIA yang luwes, natural, dan gaul khas kreator UGC TikTok/Shopee Video Indonesia.
- Gunakan kosakata UGC relatable seperti: "worth it", "racun banget", "auto checkout", "bikin nagih", "gak nyangka", "jujurly".
- DILARANG KERAS mengeluarkan teks bahasa Inggris pada dialogVO, visualAction, popupText, soundEffect, atau notesMood jika target bahasa adalah Bahasa Indonesia!`
      : `LANGUAGE REQUIREMENT: Strictly 100% natural, casual English as spoken by TikTok/Reels UGC creators.`;

    const prompt = `Kamu adalah Creative Director UGC profesional. Poles dan tingkatkan adegan storyboard video berikut agar jauh lebih menarik, memiliki stop-scroll power tinggi, dan memicu rasa ingin beli.

Instruksi khusus: "${instruction}"
Kategori video: "${category}"
${languageConstraint}

Adegan saat ini:
- Sudut kamera: ${scene.cameraAngle || 'Medium Shot'}
- Aksi visual: ${scene.visualAction || ''}
- Teks pop-up layar: ${scene.popupText || ''}
- Efek suara (SFX): ${scene.soundEffect || ''}
- Dialog / VO: ${scene.dialogVO || ''}
- Catatan / Mood: ${scene.notesMood || ''}
- Durasi: ${scene.duration || 3} detik

Tulis ulang adegan ini dalam format JSON yang dipoles maksimal.`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cameraAngle: {
            type: Type.STRING,
            description: isIndonesian ? 'Sudut kamera dalam Bahasa Indonesia (misal: Close-up Tangan & Produk, POV Meja Estetik)' : 'Camera angle',
          },
          visualAction: {
            type: Type.STRING,
            description: isIndonesian ? 'Deskripsi aksi visual talent dan interaksi produk dalam Bahasa Indonesia yang hidup dan anti-CGI' : 'Visual action',
          },
          popupText: {
            type: Type.STRING,
            description: isIndonesian ? 'Teks pop-up layar kapital Bahasa Indonesia yang mencolok dengan emoji' : 'Popup text',
          },
          soundEffect: {
            type: Type.STRING,
            description: isIndonesian ? 'Efek suara / SFX dalam Bahasa Indonesia (misal: Suara ASMR unboxing & Kling)' : 'Sound effect',
          },
          dialogVO: {
            type: Type.STRING,
            description: isIndonesian ? 'Dialog talent / VO dalam Bahasa Indonesia santai dan meyakinkan' : 'Dialog VO',
          },
          notesMood: {
            type: Type.STRING,
            description: isIndonesian ? 'Catatan mood dan gaya teks dalam Bahasa Indonesia' : 'Notes mood',
          },
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

    const rawText = await generateWithFallback(
      prompt,
      config,
      isIndonesian
        ? 'You are an elite Indonesian UGC video director. Always output 100% natural conversational Indonesian without English fallback.'
        : 'You are an elite UGC video director. Output high converting English storyboard scripts.'
    );

    const parsedScene = parseSafeJson<any>(rawText);

    if (parsedScene && parsedScene.visualAction) {
      return res.json({ success: true, scene: parsedScene });
    }

    // Indonesian-first Rule-based enhancement fallback
    return res.json({
      success: true,
      scene: {
        cameraAngle: scene.cameraAngle || 'Close-up Dinamis & Produk',
        visualAction: scene.visualAction
          ? `${scene.visualAction} (Gerakan tangan dipertegas, mimik wajah ekspresif natural tanpa AI filter, pencahayaan studio bersih).`
          : 'Kreator memperlihatkan produk dengan gesture antusias dan kontak mata meyakinkan ke kamera.',
        popupText: scene.popupText ? `${scene.popupText.toUpperCase()} 🔥` : 'RAHASIA VIRAL TERUNGKAP! ✨',
        soundEffect: scene.soundEffect ? `${scene.soundEffect} + Suara Ting renyah` : 'Swoosh transisi & Bunyi Kasir Cha-ching',
        dialogVO: scene.dialogVO
          ? `${scene.dialogVO} Beneran gak nyangka hasilnya sebagus dan senyata ini!`
          : 'Sumpah gak nyangka nemu produk yang beneran ngaruh secepet ini!',
        notesMood: scene.notesMood || 'Gaya teks: Dynamic Bouncy Teks Kuning-Putih. Pencahayaan terang natural.',
        duration: Number(scene.duration) || 3,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Hook Variations Generator (7 Distinct Viral Hook Archetypes for 2026)
app.post('/api/generate-hooks', async (req, res) => {
  try {
    const { productName = 'Produk', category = 'Before & After', language = 'id' } = req.body;

    const isIndonesian = language === 'id';

    const prompt = `Buatkan 7 variasi Hook 3 detik pertama paling viral dan stop-scroll untuk video UGC produk "${productName}" dalam kategori "${category}".
Gunakan 7 formula psikologi audiens:
1. Visual Shock (Pola interupsi visual & ekspresi kaget yang menghentikan jempol scrolling)
2. Negative Hook (Peringatan & Larangan: "Jangan beli sebelum...", "Nyesel banget baru tahu...")
3. Curiosity / Question (Pertanyaan penasaran yang bikin audiens mikir)
4. FOMO / Secret (Rahasia tersembunyi yang jarang dibocorin)
5. Relatable Pain Point (Curhat masalah nyeri audiens sehari-hari)
6. Price Spill & Promo (Spill harga kaget & diskon keranjang kuning yang gak masuk akal)
7. Extreme Demo (Uji ketahanan / perbandingan langsung yang membuktikan klaim)

ATURAN BAHASA:
${isIndonesian ? 'WAJIB 100% Bahasa Indonesia santai khas kreator TikTok/Reels lokal. DILARANG menggunakan bahasa Inggris.' : 'Strictly in conversational English.'}

Format JSON: array of 7 objects dengan field: type, hookDialog, visualAction, popupText, sfx.`;

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

    const rawText = await generateWithFallback(
      prompt,
      config,
      'You are a viral TikTok hook specialist. Generate 7 high-retention Indonesian hooks.'
    );

    const parsedHooks = parseSafeJson<any[]>(rawText);

    if (parsedHooks && Array.isArray(parsedHooks) && parsedHooks.length >= 5) {
      return res.json({ success: true, hooks: parsedHooks });
    }

    // Default Indonesian 7-hook fallback
    return res.json({
      success: true,
      hooks: [
        {
          type: 'Visual Shock',
          hookDialog: 'Jangan kaget kalau dalam 3 hari perubahannya bisa se-drastis ini!',
          visualAction: `Menutup kamera dengan telapak tangan lalu transisi cepat ke hasil pemakaian ${productName}.`,
          popupText: 'JANGAN KAGET DULU! 😱',
          sfx: 'Vine boom & Swoosh cepat',
        },
        {
          type: 'Negative Hook',
          hookDialog: `JANGAN pernah beli ${productName} kalau kalian belum siap ketagihan sama hasilnya!`,
          visualAction: 'Kreator menggelengkan kepala dengan ekspresi serius menatap langsung ke kamera.',
          popupText: `JANGAN DIBELI DULU ⚠️`,
          sfx: 'Record scratch & Warning buzzer',
        },
        {
          type: 'Curiosity / Question',
          hookDialog: `Pernah gak sih kalian mikir, kenapa produk ini bisa selalu sold out dalam hitungan menit?`,
          visualAction: `Memperlihatkan box kemasan ${productName} yang baru dibuka dari bubble wrap.`,
          popupText: `KENAPA BISA VIRAL BANGET? 🤔`,
          sfx: 'Ding question chime & Pop',
        },
        {
          type: 'FOMO / Secret',
          hookDialog: `Ini rahasia yang gak pernah dibocorin sama brand besar tapi beneran ampuh banget!`,
          visualAction: 'Mendekat ke mikrofon dengan gesture berbisik rahasia sambil memegang produk.',
          popupText: `RAHASIA GAK BOLEH BOCOR 🤫`,
          sfx: 'Whisper ASMR & Mystery chime',
        },
        {
          type: 'Relatable Pain Point',
          hookDialog: 'Capek gak sih buang-buang uang buat nyobain produk yang zonk dan gak ada hasilnya?',
          visualAction: 'Memegang kepala dengan ekspresi lelah dan frustrasi menatap dompet/cermin.',
          popupText: 'CAPEK GAGAL MULU?! 😫',
          sfx: 'Heartbeat & Dramatic bass drop',
        },
        {
          type: 'Price Spill & Promo',
          hookDialog: `Seriusan barang sebagus ini harganya gak nyampe seratus ribu plus gratis ongkir?!`,
          visualAction: 'Mata membelalak kaget sambil mengecek layar handphone dan mengangkat produk.',
          popupText: 'HARGANYA GAK MASUK AKAL! 💸',
          sfx: 'Cash register cha-ching & Bell',
        },
        {
          type: 'Extreme Demo',
          hookDialog: `Kita tes langsung di depan kamera, beneran tahan lama atau cuma omong kosong doang?`,
          visualAction: 'Langsung melakukan uji coba ekstrem produk secara live di atas meja.',
          popupText: 'UJI COBA LANGSUNG! 🧪',
          sfx: 'Camera shutter & Ting sparkle',
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Realtime Trending Harvest & Deep Market Potential Analyzer (Price, Buyer, Persona, Commission)
app.post('/api/trending-harvest', async (req, res) => {
  try {
    const {
      marketplace = 'TikTok Shop',
      category = 'Semua Kategori',
    } = req.body;

    const prompt = `Kamu adalah E-Commerce Market Intelligence & Affiliate Analytics Expert untuk marketplace ${marketplace} di Indonesia.
Lakukan "Trending Harvest" dan analisis potensi pasar mendalam untuk 6 produk paling viral dan berpotensi tinggi saat ini pada kategori: "${category}".

Untuk setiap produk, lakukan analisis terstruktur:
1. name: Nama produk trending yang spesifik (misal: "Somethinc Niacinamide 10% Barrier Serum", "Erigo Oversized Heavyweight T-Shirt", "TWS Bluetooth Noise Cancelling Earphone", "Sago Slimming Fiber Drink").
2. category: Kategori industri (Skincare, Fashion, Gadget, Makanan & Minuman, Perlengkapan Rumah, Diet & Kesehatan).
3. marketplace: "${marketplace}".
4. price: Harga ritel dalam Rupiah (misal: "Rp 79.000").
5. priceRaw: Angka nominal harga integer (misal: 79000).
6. priceAnalysis:
   - sweetSpot: Analisis apakah harga ini masuk sweet spot impulse buying.
   - competitorRange: Rentang harga kompetitor di marketplace.
   - priceRating: "Impulse Buying (< Rp99rb)" | "Mid Sweet Spot" | "High Ticket Premium".
   - priceAdvantage: Alasan kenapa harga ini memicu konversi tinggi.
7. buyerAnalysis:
   - coreNeed: Kebutuhan utama pembeli.
   - painPoint: Masalah mendesak yang ingin diselesaikan pembeli.
   - targetPersona: Demografi & kebiasaan pembeli (usia, pekerjaan, gaya hidup).
   - triggerReason: Alasan psikologis kenapa mereka langsung checkout saat nonton UGC video.
8. commissionAnalysis:
   - commissionRate: Persentase komisi affiliate (misal: "12% - 15%").
   - estProfitPer100Sales: Estimasi keuntungan affiliate kreator per 100 penjualan (misal: "Rp 1.185.000").
   - affiliateRating: "Sangat Menguntungkan 🔥" | "Stabil & Cuan 💰" | "High Volume ⚡".
   - closingDifficulty: "Mudah Closing (Impulse)" | "Sedang" | "Butuh Edukasi".
9. trendVelocity: "Peak Viral 🔥" | "Sedang Meledak 🚀" | "Evergreen Terlaris ⭐".
10. salesVolume: Jumlah penjualan (misal: "24.5K terjual/minggu").
11. rating: Rating rata-rata (misal: 4.9).
12. suggestedHook: 1 kalimat hook 3 detik paling mematikan untuk produk ini.
13. suggestedUSP: Poin keunggulan utama produk.
14. suggestedCaption: Auto caption singkat viral (<150 karakter) dengan hashtag.
15. recommendedCategory: 1 dari 12 kategori UGC ("Before & After", "Review", "Unboxing", "Tutorial", "Problem & Solution", "Affiliate", "Haul", "GRWM", "Daily Vlog", "Life Hacks", "ASMR / Satisfying", "Komedi / Sketsa").`;

    const config = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            marketplace: { type: Type.STRING },
            price: { type: Type.STRING },
            priceRaw: { type: Type.INTEGER },
            priceAnalysis: {
              type: Type.OBJECT,
              properties: {
                sweetSpot: { type: Type.STRING },
                competitorRange: { type: Type.STRING },
                priceRating: { type: Type.STRING },
                priceAdvantage: { type: Type.STRING },
              },
              required: ['sweetSpot', 'competitorRange', 'priceRating', 'priceAdvantage'],
            },
            buyerAnalysis: {
              type: Type.OBJECT,
              properties: {
                coreNeed: { type: Type.STRING },
                painPoint: { type: Type.STRING },
                targetPersona: { type: Type.STRING },
                triggerReason: { type: Type.STRING },
              },
              required: ['coreNeed', 'painPoint', 'targetPersona', 'triggerReason'],
            },
            commissionAnalysis: {
              type: Type.OBJECT,
              properties: {
                commissionRate: { type: Type.STRING },
                estProfitPer100Sales: { type: Type.STRING },
                affiliateRating: { type: Type.STRING },
                closingDifficulty: { type: Type.STRING },
              },
              required: ['commissionRate', 'estProfitPer100Sales', 'affiliateRating', 'closingDifficulty'],
            },
            trendVelocity: { type: Type.STRING },
            salesVolume: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            suggestedHook: { type: Type.STRING },
            suggestedUSP: { type: Type.STRING },
            suggestedCaption: { type: Type.STRING },
            recommendedCategory: { type: Type.STRING },
          },
          required: [
            'name',
            'category',
            'price',
            'priceAnalysis',
            'buyerAnalysis',
            'commissionAnalysis',
            'trendVelocity',
            'salesVolume',
            'suggestedHook',
            'suggestedUSP',
            'suggestedCaption',
            'recommendedCategory',
          ],
        },
      },
    };

    const rawText = await generateWithFallback(
      prompt,
      config,
      'You are an expert ecommerce product intelligence agent for Indonesian creator economy.'
    );

    const parsed = parseSafeJson<any[]>(rawText);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const itemsWithIds = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `trend-${Date.now()}-${idx}`,
        marketplace,
      }));
      return res.json({
        success: true,
        marketplace,
        category,
        products: itemsWithIds,
        source: 'gemini-live-intelligence',
      });
    }

    // High-quality Indonesian Curated Dataset for Trending Products Fallback
    const fallbackProducts = [
      {
        id: 'trend-skincare-1',
        name: 'Glow Niacinamide 10% Barrier Serum',
        category: 'Beauty & Skincare',
        marketplace,
        price: 'Rp 69.000',
        priceRaw: 69000,
        priceAnalysis: {
          sweetSpot: 'Sangat ideal di bawah Rp 70rb untuk produk perawatan wajah harian.',
          competitorRange: 'Rp 85.000 - Rp 140.000',
          priceRating: 'Impulse Buying (< Rp99rb)',
          priceAdvantage: '35% lebih hemat dibanding kompetitor sekelas dengan formula murni.',
        },
        buyerAnalysis: {
          coreNeed: 'Mencerahkan kulit kusam & memudarkan bekas jerawat kehitaman.',
          painPoint: 'Malu dengan flek hitam & kulit belang setelah aktivitas di luar ruangan.',
          targetPersona: 'Wanita & Pria usia 18-32 tahun, mahasiswa & first-jobber aktif.',
          triggerReason: 'Ingin hasil cepat dalam 7 hari tanpa rasa lengket di kulit.',
        },
        commissionAnalysis: {
          commissionRate: '15%',
          estProfitPer100Sales: 'Rp 1.035.000',
          affiliateRating: 'Sangat Menguntungkan 🔥',
          closingDifficulty: 'Mudah Closing (Impulse)',
        },
        trendVelocity: 'Peak Viral 🔥',
        salesVolume: '32.8K terjual/minggu',
        rating: 4.9,
        suggestedHook: 'Jangan kaget kalau bekas jerawat 2 tahun lalu bisa pudar dalam 7 hari!',
        suggestedUSP: '10% Niacinamide murni + Ceramide perbaikan skin barrier cepat meresap.',
        suggestedCaption: 'Serum pencerah viral bikin kulit auto glowing bebas kusam! Checkout di keranjang kuning mumpung promo ✨ #RacunTikTok #fyp',
        recommendedCategory: 'Before & After',
      },
      {
        id: 'trend-fnb-2',
        name: 'Sago Green Coffee Slimming Detox',
        category: 'Kesehatan & Diet',
        marketplace,
        price: 'Rp 88.000',
        priceRaw: 88000,
        priceAnalysis: {
          sweetSpot: 'Harga psikologis Rp80-90rb membuat pembeli merasa mendapatkan paket hemat 14 hari.',
          competitorRange: 'Rp 110.000 - Rp 175.000',
          priceRating: 'Impulse Buying (< Rp99rb)',
          priceAdvantage: 'Dilengkapi sertifikasi BPOM resmi dengan rasa kopi susu nikmat.',
        },
        buyerAnalysis: {
          coreNeed: 'Menahan nafsu makan & melancarkan BAB tanpa mules menyiksa.',
          painPoint: 'Gagal diet berkali-kali karena lapar mata & metabolisme lambat.',
          targetPersona: 'Wanita 22-45 tahun pekerja kantoran & ibu muda.',
          triggerReason: 'Bisa ngopi enak sambil jaga berat badan ideal tanpa diet ekstrem.',
        },
        commissionAnalysis: {
          commissionRate: '18%',
          estProfitPer100Sales: 'Rp 1.584.000',
          affiliateRating: 'Sangat Menguntungkan 🔥',
          closingDifficulty: 'Mudah Closing (Impulse)',
        },
        trendVelocity: 'Sedang Meledak 🚀',
        salesVolume: '21.4K terjual/minggu',
        rating: 4.8,
        suggestedHook: 'Jujur nyesel baru tahu kopi ini sekarang, nafsu makan auto terkunci seharian!',
        suggestedUSP: 'Ekstrak biji kopi hijau alami + sago fiber, aman lambung & halal BPOM.',
        suggestedCaption: 'Kopi diet viral rasa enak gak pahit, perut kempes badan enteng! Cek keranjang kuning 🔥 #DietSehat #TikTokShop #fyp',
        recommendedCategory: 'Before & After',
      },
      {
        id: 'trend-gadget-3',
        name: 'Wireless Bluetooth Noise-Cancelling TWS',
        category: 'Gadget & Elektronik',
        marketplace,
        price: 'Rp 99.000',
        priceRaw: 99000,
        priceAnalysis: {
          sweetSpot: 'Angka keramat Rp99.000 adalah batas psikologis terkuat untuk gadget impulse.',
          competitorRange: 'Rp 150.000 - Rp 299.000',
          priceRating: 'Impulse Buying (< Rp99rb)',
          priceAdvantage: 'Fitur Active Noise Cancelling & Bass nendang di bawah Rp 100rb.',
        },
        buyerAnalysis: {
          coreNeed: 'Mendengarkan musik jernih & telepon tanpa gangguan bising saat di jalan.',
          painPoint: 'TWS lama suara cempreng, mic kresek-kresek, dan baterai cepat habis.',
          targetPersona: 'Pria & Wanita 16-35 tahun, komuter KRL/ojol, gamers, pelajar.',
          triggerReason: 'Tampilan mirip earbuds flagship jutaan rupiah dengan harga sangat murah.',
        },
        commissionAnalysis: {
          commissionRate: '12%',
          estProfitPer100Sales: 'Rp 1.188.000',
          affiliateRating: 'High Volume ⚡',
          closingDifficulty: 'Mudah Closing (Impulse)',
        },
        trendVelocity: 'Peak Viral 🔥',
        salesVolume: '45.1K terjual/minggu',
        rating: 4.9,
        suggestedHook: 'TWS 90 ribuan tapi suaranya berasa pake earphone 2 juta! Jangan sampe kehabisan!',
        suggestedUSP: 'Bass nendang, baterai tahan 36 jam, mic jernih anti noise, bluetooth 5.3.',
        suggestedCaption: 'TWS bass nendang murah meriah anti budeg! Mumpung flash sale amankan di keranjang kuning 🎧 #RacunGadget #fyp',
        recommendedCategory: 'Unboxing',
      },
      {
        id: 'trend-fashion-4',
        name: 'Korean Oversized Heavyweight Cotton Hoodie',
        category: 'Fashion & OOTD',
        marketplace,
        price: 'Rp 129.000',
        priceRaw: 129000,
        priceAnalysis: {
          sweetSpot: 'Harga mid-tier terjangkau untuk bahan cotton fleece 330gsm tebal.',
          competitorRange: 'Rp 160.000 - Rp 250.000',
          priceRating: 'Mid Sweet Spot',
          priceAdvantage: 'Bahan tebal tidak panas, jahitan garment rapi dengan potongan aesthetic.',
        },
        buyerAnalysis: {
          coreNeed: 'Outfit kasual kekinian yang nyaman dan cocok untuk nongkrong/ngampus.',
          painPoint: 'Beli baju online sering kecewa karena bahan tipis menerawang dan sablon pecah.',
          targetPersona: 'Gen Z usia 16-26 tahun, pecinta Korean style & streetwear.',
          triggerReason: 'Visual cutting oversized jatuh sempurna saat dipakai di video OOTD.',
        },
        commissionAnalysis: {
          commissionRate: '14%',
          estProfitPer100Sales: 'Rp 1.806.000',
          affiliateRating: 'Sangat Menguntungkan 🔥',
          closingDifficulty: 'Sedang',
        },
        trendVelocity: 'Evergreen Terlaris ⭐',
        salesVolume: '18.9K terjual/minggu',
        rating: 4.8,
        suggestedHook: 'Akhirnya nemu hoodie oversized bahan tebal 100 ribuan yang gak kaleng-kaleng!',
        suggestedUSP: 'Bahan fleece katun tebal 330gsm, tidak melar saat dicuci, cutting Korean drop shoulder.',
        suggestedCaption: 'Hoodie oversize tebal nyaman buat OOTD nongkrong! Spill link di keranjang kuning ya 🧥 #OOTD #KoreanStyle #fyp',
        recommendedCategory: 'Haul',
      },
      {
        id: 'trend-home-5',
        name: 'Mini Smart Aroma Diffuser & Flame Humidifier',
        category: 'Home & Living',
        marketplace,
        price: 'Rp 75.000',
        priceRaw: 75000,
        priceAnalysis: {
          sweetSpot: 'Harga Rp75rb sangat cocok untuk dekorasi kamar tidur dan kado estetik.',
          competitorRange: 'Rp 95.000 - Rp 150.000',
          priceRating: 'Impulse Buying (< Rp99rb)',
          priceAdvantage: 'Efek lampu LED api simulasi realistis dengan uap wangi menenangkan.',
        },
        buyerAnalysis: {
          coreNeed: 'Kamar wangi relaksasi & estetik saat lampu kamar dimatikan.',
          painPoint: 'Kamar pengap, bau apek, dan susah tidur karena stres setelah bekerja.',
          targetPersona: 'Remaja & Dewasa 18-35 tahun yang suka dekorasi kamar estetik Pinterest.',
          triggerReason: 'Visual uap lampu api sangat memukau di video TikTok (aesthetic room visual).',
        },
        commissionAnalysis: {
          commissionRate: '16%',
          estProfitPer100Sales: 'Rp 1.200.000',
          affiliateRating: 'Stabil & Cuan 💰',
          closingDifficulty: 'Mudah Closing (Impulse)',
        },
        trendVelocity: 'Peak Viral 🔥',
        salesVolume: '28.3K terjual/minggu',
        rating: 4.9,
        suggestedHook: 'Ini alasan kenapa kamar aku sekarang selalu wangi kayak hotel bintang 5!',
        suggestedUSP: 'Efek visual api hangat, hening tanpa suara, auto shut-off saat air habis.',
        suggestedCaption: 'Humidifier estetik bikin kamar auto wangi hotel mewah! Cek keranjang kuning mumpung diskon 🕯️ #RacunDekor #fyp',
        recommendedCategory: 'ASMR / Satisfying',
      },
      {
        id: 'trend-beauty-6',
        name: 'Velvet Lip Tint Transferproof 16 Jam',
        category: 'Beauty & Skincare',
        marketplace,
        price: 'Rp 45.000',
        priceRaw: 45000,
        priceAnalysis: {
          sweetSpot: 'Harga super impulse di bawah Rp50.000, membuat penonton tidak berpikir 2x untuk beli.',
          competitorRange: 'Rp 55.000 - Rp 90.000',
          priceRating: 'Impulse Buying (< Rp99rb)',
          priceAdvantage: 'Tekstur velvet ringan, tidak bikin bibir kering, tahan makan gorengan.',
        },
        buyerAnalysis: {
          coreNeed: 'Warna bibir segar seharian tanpa harus sering touch-up.',
          painPoint: 'Lip cream nempel di sedotan/masker dan bikin bibir pecah-pecah.',
          targetPersona: 'Remaja, mahasiswi, dan karyawati usia 16-30 tahun.',
          triggerReason: 'Demonstrasi uji ketahanan (minum air / cium tisu tanpa bekas) sangat meyakinkan.',
        },
        commissionAnalysis: {
          commissionRate: '20%',
          estProfitPer100Sales: 'Rp 900.000',
          affiliateRating: 'High Volume ⚡',
          closingDifficulty: 'Mudah Closing (Impulse)',
        },
        trendVelocity: 'Sedang Meledak 🚀',
        salesVolume: '54.2K terjual/minggu',
        rating: 4.9,
        suggestedHook: 'Kita tes makan bakso pedas sama minum boba, lip tint 40 ribuan ini luntur gak ya?',
        suggestedUSP: 'Tekstur velvet buttery ringan, transferproof 16 jam, mengandung Vitamin E & Jojoba Oil.',
        suggestedCaption: 'Lip tint tahan banting gak nempel di gelas! Koleksi semua warnanya di keranjang kuning 💄 #RacunLipstik #fyp',
        recommendedCategory: 'Review',
      },
    ];

    return res.json({
      success: true,
      marketplace,
      category,
      products: fallbackProducts,
      source: 'curated-market-intelligence',
    });
  } catch (error: any) {
    console.error('Server error in /api/trending-harvest:', error);
    res.status(500).json({ error: error.message || 'Gagal memproses trending harvest' });
  }
});


// AI Auto-Detect Product & Info from Unified Input (Link & Notes combined)
app.post('/api/auto-detect-product', async (req, res) => {
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
      3500
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
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
