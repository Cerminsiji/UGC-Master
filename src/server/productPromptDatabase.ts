import fs from 'fs';
import path from 'path';
import { TrackedProductRecord, Scene, GoogleFlowScenePrompt, ProductImageAnalysis } from '../types';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'product_database.json');

// Helper to generate ready-to-use Google Flow Prompts
export function buildGoogleFlowScenePrompt(
  productName: string,
  brandName: string = '',
  visualAppearance: string = '',
  scene: Scene,
  visualFocus: string = 'mix'
): string {
  const cleanBrand = brandName ? `by ${brandName}` : '';
  const cleanAppearance = visualAppearance || `authentic commercial packaging of ${productName}, realistic retail label`;

  let framing = 'smartphone handheld POV';
  if (scene.cameraAngle.toLowerCase().includes('close')) {
    framing = 'macro close-up shot';
  } else if (scene.cameraAngle.toLowerCase().includes('wide') || scene.cameraAngle.toLowerCase().includes('full')) {
    framing = 'natural medium full-body shot';
  } else if (scene.cameraAngle.toLowerCase().includes('hands') || visualFocus === 'hands_only') {
    framing = 'top-down desk POV handheld hands-only';
  }

  return `${framing}, featuring ${productName} ${cleanBrand} (${cleanAppearance}). Action: ${scene.visualAction}. Organic natural indoor room lighting, human skin texture with pores, realistic TikTok UGC aesthetic, sharp focus, 4k photography --no cgi, 3d render, cartoon, deformed hands, extra fingers, artificial morphing, blurry logo`;
}

export function buildGoogleFlowMasterPrompt(
  productName: string,
  brandName: string = '',
  visualAppearance: string = '',
  usp: string = ''
): string {
  const cleanBrand = brandName ? `brand ${brandName}` : '';
  const appearance = visualAppearance || `clean retail bottle/box with authentic labels`;
  return `Consistent product reference for Google Flow Image Generation: [Product: ${productName} ${cleanBrand}]. Packaging details: [${appearance}]. Core benefit: [${usp}]. Visual style: 100% authentic Indonesian TikTok UGC creator photo, real smartphone camera sensor noise, natural studio ambient light, genuine human touch, photorealistic product placement --no cgi, 3d, anime, cartoon, distorted text, fake packaging`;
}

// Initial seed data with authentic Indonesian marketplace products & Google Flow prompts
const INITIAL_SEEDS: TrackedProductRecord[] = [
  {
    id: 'db-prod-originote',
    name: 'The Originote Hyalucera Moisturizer Gel 50ml',
    brandName: 'The Originote',
    category: 'Beauty & Skincare',
    productDescription: 'Moisturizer viral perbaikan skin barrier dengan Hyaluronic Acid dan Ceramide tekstur watery gel dingin.',
    keySellingPoints: 'Menenangkan kulit bruntusan dalam 5 hari, melembapkan tanpa rasa lengket, BPOM & aman bumil.',
    targetAudience: 'Pelajar, mahasiswi, dan wanita usia 16-28 tahun yang aktif di media sosial.',
    price: 'Rp 42.000',
    sourceUrl: 'https://shopee.co.id/theoriginoteofficial',
    productImageAnalysis: {
      extractedName: 'The Originote Hyalucera Moisturizer Gel 50ml',
      brandName: 'The Originote',
      visualAppearance: 'Jar transparan doff dengan tutup ulir putih minimalis, gel bening kebiruan transparan di dalam wadah, label putih berlogo hitam rapi.',
      extractedUSP: 'Hyaluronic Acid + Ceramide + Chlorelina perbaikan barrier 5 hari',
      suggestedCategory: 'Before & After',
      googleFlowPromptGuide: 'Jar bulat transparan bertekstur doff 50ml, tutup putih polos, isi gel air dingin bening, label tipografi hitam minimalis The Originote.',
    },
    googleFlowMasterPrompt: 'Consistent product reference: The Originote Hyalucera Moisturizer Gel 50ml in frosted clear plastic jar with white circular lid. Real gel texture visible inside. Authentic Indonesian creator desk setting, natural daylight, 4k UGC photorealistic --no cgi, 3d render, cartoon',
    caption: 'Gue kira overclaim, ternyata pas dicoba sendiri bruntusan dahi langsung kempes total! Pantesan sold out jutaan jar... 😭✨ #TheOriginote #SkinBarrier #RacunTikTok #fyp',
    tags: ['Skincare', 'SkinBarrier', 'Moisturizer', 'Viral'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    scenes: [
      {
        id: 'sc-seed-1',
        order: 1,
        cameraAngle: 'POV / Handheld Close-up',
        visualAction: 'Kreator memegang jar The Originote Hyalucera di depan cermin, menunjuk area dahi yang bertekstur lalu menatap kamera dengan tatapan kaget.',
        popupText: 'JANGAN SKIP DULU! 😱',
        soundEffect: 'Record scratch & Vine boom',
        dialogVO: 'Stop scrolling! Buat kalian yang dahinya sering bruntusan kasar, wajib tahu rahasia ini!',
        notesMood: 'Gaya teks: Bold Red/Yellow. Tatapan kaget ekspresif.',
        duration: 3,
        googleFlowPrompt: 'POV handheld close-up of Indonesian woman holding The Originote Hyalucera jar, natural skin texture, aesthetic bedroom mirror reflection, natural lighting --no cgi, 3d',
      },
      {
        id: 'sc-seed-2',
        order: 2,
        cameraAngle: 'Macro Close-up Texture',
        visualAction: 'Tangan membuka tutup jar dan mengambil sedikit gel bening dingin, menunjukkan tekstur watery melting saat diratakan ke punggung tangan.',
        popupText: 'TEKSTUR WATER-GEL ADEM 💧',
        soundEffect: 'Satisfying ASMR water drop',
        dialogVO: 'Lihat teksturnya, watery gel bening super ringan dan langsung nyerap tanpa rasa lengket sama sekali.',
        notesMood: 'Gaya teks: Aqua Glow. Macro focus on water gel.',
        duration: 4,
        googleFlowPrompt: 'Macro extreme close-up of fingers scooping clear watery gel from The Originote jar, satisfying texture, bright soft daylight --no cgi, deformed hands',
      },
      {
        id: 'sc-seed-3',
        order: 3,
        cameraAngle: 'Medium Close-up Face & Hand',
        visualAction: 'Kreator tersenyum puas memperlihatkan wajah yang glowing halus lembap, memegang jar The Originote di samping pipi.',
        popupText: '3 HARI LANGSUNG MULUS! ✨',
        soundEffect: 'Ting sparkle chime',
        dialogVO: 'Jujur gak nyangka, cuma rutin pakai 3 hari bruntusan mendem langsung reda dan kulit jadi kenyal banget!',
        notesMood: 'Gaya teks: Golden Sparkle. Glowing confident smile.',
        duration: 4,
        googleFlowPrompt: 'Medium shot of happy 22yo Indonesian creator with glowing healthy dewy facial skin holding The Originote jar beside cheek, realistic daylight studio --no cgi',
      },
      {
        id: 'sc-seed-4',
        order: 4,
        cameraAngle: 'Handheld POV Desk Final',
        visualAction: 'Kreator menaruh jar The Originote di atas meja estetik samping tanaman mini dengan gesture dua jempol meyakinkan.',
        popupText: 'FIX INI PENEMUAN TERBAIK! 💯',
        soundEffect: 'Cha-ching & Bell ding',
        dialogVO: 'Pantesan reviewnya tembus ratusan ribu, emang se-worth it itu hasilnya di kulit!',
        notesMood: 'Gaya teks: Green verified badge. High conviction.',
        duration: 4,
        googleFlowPrompt: 'Aesthetic desk flatlay with The Originote jar, mini succulent plant, hands giving double thumbs up, natural warm room lighting --no cgi, cartoon',
      },
    ],
    googleFlowScenePrompts: [
      {
        sceneOrder: 1,
        cameraAngle: 'POV / Handheld Close-up',
        visualAction: 'Kreator memegang jar The Originote Hyalucera di depan cermin, menunjuk area dahi yang bertekstur lalu menatap kamera dengan tatapan kaget.',
        dialogVO: 'Stop scrolling! Buat kalian yang dahinya sering bruntusan kasar, wajib tahu rahasia ini!',
        popupText: 'JANGAN SKIP DULU! 😱',
        googleFlowPrompt: 'POV handheld close-up of Indonesian woman holding The Originote Hyalucera jar, natural skin texture, aesthetic bedroom mirror reflection, natural lighting --no cgi, 3d',
      },
      {
        sceneOrder: 2,
        cameraAngle: 'Macro Close-up Texture',
        visualAction: 'Tangan membuka tutup jar dan mengambil sedikit gel bening dingin, menunjukkan tekstur watery melting saat diratakan ke punggung tangan.',
        dialogVO: 'Lihat teksturnya, watery gel bening super ringan dan langsung nyerap tanpa rasa lengket sama sekali.',
        popupText: 'TEKSTUR WATER-GEL ADEM 💧',
        googleFlowPrompt: 'Macro extreme close-up of fingers scooping clear watery gel from The Originote jar, satisfying texture, bright soft daylight --no cgi, deformed hands',
      },
      {
        sceneOrder: 3,
        cameraAngle: 'Medium Close-up Face & Hand',
        visualAction: 'Kreator tersenyum puas memperlihatkan wajah yang glowing halus lembap, memegang jar The Originote di samping pipi.',
        dialogVO: 'Jujur gak nyangka, cuma rutin pakai 3 hari bruntusan mendem langsung reda dan kulit jadi kenyal banget!',
        popupText: '3 HARI LANGSUNG MULUS! ✨',
        googleFlowPrompt: 'Medium shot of happy 22yo Indonesian creator with glowing healthy dewy facial skin holding The Originote jar beside cheek, realistic daylight studio --no cgi',
      },
      {
        sceneOrder: 4,
        cameraAngle: 'Handheld POV Desk Final',
        visualAction: 'Kreator menaruh jar The Originote di atas meja estetik samping tanaman mini dengan gesture dua jempol meyakinkan.',
        dialogVO: 'Pantesan reviewnya tembus ratusan ribu, emang se-worth it itu hasilnya di kulit!',
        popupText: 'FIX INI PENEMUAN TERBAIK! 💯',
        googleFlowPrompt: 'Aesthetic desk flatlay with The Originote jar, mini succulent plant, hands giving double thumbs up, natural warm room lighting --no cgi, cartoon',
      },
    ],
  },
  {
    id: 'db-prod-anker-r50i',
    name: 'Anker Soundcore R50i TWS Earbuds BassUp',
    brandName: 'Anker Soundcore',
    category: 'Gadget & Elektronik',
    productDescription: 'TWS earphone nirkabel Bluetooth 5.3 dengan teknologi BassUp, tahan air IPX5, dan baterai hingga 30 jam playtime.',
    keySellingPoints: 'Bass nendang gak bikin cempreng, mic jernih buat telponan motoran, ada tali lanyard praktis.',
    targetAudience: 'Mahasiswa, pekerja commuter, dan pecinta musik harian budget terjangkau.',
    price: 'Rp 199.000',
    sourceUrl: 'https://shopee.co.id/soundcoreofficial',
    productImageAnalysis: {
      extractedName: 'Anker Soundcore R50i TWS Earbuds',
      brandName: 'Anker Soundcore',
      visualAppearance: 'Charging case matte hitam compact dengan logo Soundcore di atas tutup, dilengkapi gantungan tali lanyard nilon hitam, earbuds in-ear bertangkai ergonomis.',
      extractedUSP: '10mm drivers with BassUp, 30h battery life, IPX5 waterproof',
      suggestedCategory: 'Review',
      googleFlowPromptGuide: 'Matte black pebble-shaped charging case with black lanyard strap, Soundcore branding, sleek wireless earbuds with comfortable silicone tips.',
    },
    googleFlowMasterPrompt: 'Consistent product reference: Anker Soundcore R50i matte black compact TWS case with braided nylon lanyard strap. Modern clean tech setup, natural desk ambient lighting, photorealistic Indonesian creator perspective --no cgi, 3d render',
    caption: 'TWS 100 ribuan tapi bass-nya bikin geleng-geleng kepala! Fix ini TWS paling awet yang pernah gue punya. 🎧🔥 #SoundcoreR50i #RacunGadget #fyp',
    tags: ['Gadget', 'TWS', 'Audio', 'Viral'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    scenes: [
      {
        id: 'sc-seed-anker-1',
        order: 1,
        cameraAngle: 'POV Handheld Close-up',
        visualAction: 'Tangan menjentikkan tutup case Anker Soundcore R50i yang mengeluarkan bunyi "klik" magnetis renyah di dekat mikrofon.',
        popupText: 'BASS-NYA BIKIN MERINDING! 🎧',
        soundEffect: 'Crisp magnetic click & Bass drop',
        dialogVO: 'Kalian jangan mau beli TWS mahal sebelum dengerin kualitas suara produk yang satu ini!',
        notesMood: 'Gaya teks: Bold Electric Blue. Crisp ASMR.',
        duration: 3,
        googleFlowPrompt: 'POV hands flicking open matte black Anker Soundcore R50i charging case near smartphone camera, natural desk setup --no cgi',
      },
      {
        id: 'sc-seed-anker-2',
        order: 2,
        cameraAngle: 'Close-up Ear & Profile',
        visualAction: 'Kreator memasang earbud ke telinga, seketika tersenyum mengangguk-anggukkan kepala mengikuti irama beat lagu.',
        popupText: 'BASSUP 10MM NENDANG BANGET 🔥',
        soundEffect: 'Heavy kick drum & Sub bass rumble',
        dialogVO: 'Bass-nya beneran tebal dan bulat, vokal jernih, dan fitting-nya kedap banget di telinga.',
        notesMood: 'Gaya teks: Neon Pulse. Energetic vibe.',
        duration: 4,
        googleFlowPrompt: 'Side profile close-up of young Indonesian man wearing matte black wireless earbud, smiling and nodding to beat, natural cafe lighting --no cgi',
      },
      {
        id: 'sc-seed-anker-3',
        order: 3,
        cameraAngle: 'POV Macro Flatlay',
        visualAction: 'Tangan mengangkat case memperlihatkan tali lanyard yang bisa digantung di jari atau ransel.',
        popupText: 'BATERAI AWET 30 JAM 🔋',
        soundEffect: 'Whoosh & Camera shutter',
        dialogVO: 'Baterainya tahan 30 jam, ada tali lanyard jadi ga gampang jatuh atau hilang di saku.',
        notesMood: 'Gaya teks: Gold Badge. Practical detail.',
        duration: 4,
        googleFlowPrompt: 'POV shot of hand twirling matte black TWS case with lanyard on finger, clean minimalist desk, warm ambient lighting --no cgi',
      },
    ],
    googleFlowScenePrompts: [
      {
        sceneOrder: 1,
        cameraAngle: 'POV Handheld Close-up',
        visualAction: 'Tangan menjentikkan tutup case Anker Soundcore R50i yang mengeluarkan bunyi "klik" magnetis renyah di dekat mikrofon.',
        dialogVO: 'Kalian jangan mau beli TWS mahal sebelum dengerin kualitas suara produk yang satu ini!',
        popupText: 'BASS-NYA BIKIN MERINDING! 🎧',
        googleFlowPrompt: 'POV hands flicking open matte black Anker Soundcore R50i charging case near smartphone camera, natural desk setup --no cgi',
      },
      {
        sceneOrder: 2,
        cameraAngle: 'Close-up Ear & Profile',
        visualAction: 'Kreator memasang earbud ke telinga, seketika tersenyum mengangguk-anggukkan kepala mengikuti irama beat lagu.',
        dialogVO: 'Bass-nya beneran tebal dan bulat, vokal jernih, dan fitting-nya kedap banget di telinga.',
        popupText: 'BASSUP 10MM NENDANG BANGET 🔥',
        googleFlowPrompt: 'Side profile close-up of young Indonesian man wearing matte black wireless earbud, smiling and nodding to beat, natural cafe lighting --no cgi',
      },
      {
        sceneOrder: 3,
        cameraAngle: 'POV Macro Flatlay',
        visualAction: 'Tangan mengangkat case memperlihatkan tali lanyard yang bisa digantung di jari atau ransel.',
        dialogVO: 'Baterainya tahan 30 jam, ada tali lanyard jadi ga gampang jatuh atau hilang di saku.',
        popupText: 'BATERAI AWET 30 JAM 🔋',
        googleFlowPrompt: 'POV shot of hand twirling matte black TWS case with lanyard on finger, clean minimalist desk, warm ambient lighting --no cgi',
      },
    ],
  },
];

class ProductPromptDatabase {
  private memoryCache: Map<string, TrackedProductRecord> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed: TrackedProductRecord[] = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => this.memoryCache.set(item.id, item));
        }
      } else {
        // Seed initial records
        INITIAL_SEEDS.forEach((seed) => this.memoryCache.set(seed.id, seed));
        this.saveToDisk();
      }
    } catch (err) {
      console.error('[ProductPromptDatabase] Initialization error:', err);
      INITIAL_SEEDS.forEach((seed) => this.memoryCache.set(seed.id, seed));
    }
  }

  private saveToDisk() {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const allRecords = Array.from(this.memoryCache.values());
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(allRecords, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ProductPromptDatabase] Failed to write to disk:', err);
    }
  }

  public getAll(): TrackedProductRecord[] {
    return Array.from(this.memoryCache.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getById(id: string): TrackedProductRecord | undefined {
    return this.memoryCache.get(id);
  }

  public save(record: TrackedProductRecord): TrackedProductRecord {
    const updatedRecord: TrackedProductRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
      createdAt: record.createdAt || new Date().toISOString(),
    };
    this.memoryCache.set(updatedRecord.id, updatedRecord);
    this.saveToDisk();
    return updatedRecord;
  }

  public delete(id: string): boolean {
    const existed = this.memoryCache.delete(id);
    if (existed) {
      this.saveToDisk();
    }
    return existed;
  }

  public search(query: string = '', category: string = ''): TrackedProductRecord[] {
    const q = (query || '').toLowerCase().trim();
    const cat = (category || '').toLowerCase().trim();

    return this.getAll().filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.brandName && item.brandName.toLowerCase().includes(q)) ||
        (item.keySellingPoints && item.keySellingPoints.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCategory = !cat || cat === 'semua' || item.category.toLowerCase().includes(cat);

      return matchesQuery && matchesCategory;
    });
  }

  public createFromStoryboard(params: {
    id?: string;
    productName: string;
    brandName?: string;
    category: string;
    productDescription?: string;
    keySellingPoints?: string;
    targetAudience?: string;
    price?: string;
    sourceUrl?: string;
    referenceImage?: string;
    productImageAnalysis?: ProductImageAnalysis;
    visualFocus?: string;
    caption?: string;
    tags?: string[];
    scenes: Scene[];
  }): TrackedProductRecord {
    const recordId = params.id || `prod-db-${Date.now()}`;
    const name = params.productName.trim() || 'Produk Unggulan';
    const brand = params.brandName || params.productImageAnalysis?.brandName || '';
    const appearance = params.productImageAnalysis?.visualAppearance || '';
    const usp = params.keySellingPoints || params.productImageAnalysis?.extractedUSP || '';

    // Generate Master Google Flow Prompt
    const masterPrompt = buildGoogleFlowMasterPrompt(name, brand, appearance, usp);

    // Generate Scene Prompts
    const scenePrompts: GoogleFlowScenePrompt[] = (params.scenes || []).map((sc, idx) => ({
      sceneOrder: sc.order || idx + 1,
      cameraAngle: sc.cameraAngle || 'Medium Shot',
      visualAction: sc.visualAction,
      dialogVO: sc.dialogVO,
      popupText: sc.popupText,
      googleFlowPrompt:
        sc.googleFlowPrompt ||
        buildGoogleFlowScenePrompt(name, brand, appearance, sc, params.visualFocus || 'mix'),
      negativePrompt: 'cgi, 3d render, cartoon, anime, deformed hands, extra fingers, distorted packaging logos, blurry text, unnatural skin',
    }));

    // Attach googleFlowPrompt directly to scenes if missing
    const enrichedScenes: Scene[] = (params.scenes || []).map((sc, idx) => ({
      ...sc,
      googleFlowPrompt:
        sc.googleFlowPrompt ||
        scenePrompts[idx]?.googleFlowPrompt ||
        buildGoogleFlowScenePrompt(name, brand, appearance, sc, params.visualFocus || 'mix'),
    }));

    // Safe caption without cart CTA
    let finalCaption = params.caption || `Cobain ${name}! Bikin penasaran & hasil nyata terbukti. Wajib coba sebelum kehabisan! ✨ #RacunTikTok #fyp #Viral`;
    // Clean out any cart references
    finalCaption = finalCaption
      .replace(/cek\s+keranjang\s+kuning/gi, 'wajib cobain sendiri')
      .replace(/klik\s+keranjang/gi, 'simak rahasianya')
      .replace(/keranjang\s+kuning/gi, 'rekomendasi viral')
      .replace(/keranjang\s+oranye/gi, 'rekomendasi viral')
      .trim();

    if (finalCaption.length > 150) {
      finalCaption = finalCaption.slice(0, 147) + '...';
    }

    const record: TrackedProductRecord = {
      id: recordId,
      name,
      brandName: brand,
      category: params.category || 'Before & After',
      productDescription: params.productDescription || '',
      keySellingPoints: usp,
      targetAudience: params.targetAudience || '',
      price: params.price || '',
      sourceUrl: params.sourceUrl || '',
      referenceImage: params.referenceImage,
      productImageAnalysis: params.productImageAnalysis,
      googleFlowMasterPrompt: masterPrompt,
      googleFlowScenePrompts: scenePrompts,
      caption: finalCaption,
      tags: params.tags || ['UGC', 'TikTokShop', 'RacunTikTok'],
      scenes: enrichedScenes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.save(record);
  }

  public exportDatabase(): string {
    const all = this.getAll();
    return JSON.stringify(all, null, 2);
  }

  public importDatabase(jsonString: string): { success: boolean; count: number } {
    try {
      const records: TrackedProductRecord[] = JSON.parse(jsonString);
      if (!Array.isArray(records)) {
        throw new Error('Format JSON harus berupa array of TrackedProductRecord');
      }
      let count = 0;
      records.forEach((rec) => {
        if (rec.id && rec.name) {
          this.memoryCache.set(rec.id, {
            ...rec,
            updatedAt: new Date().toISOString(),
          });
          count++;
        }
      });
      this.saveToDisk();
      return { success: true, count };
    } catch (err: any) {
      throw new Error(`Gagal impor database: ${err?.message || err}`);
    }
  }
}

export const productPromptDatabase = new ProductPromptDatabase();
