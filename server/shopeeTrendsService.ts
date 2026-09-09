import { GoogleGenAI } from '@google/genai';

export interface ShopeeMetrics {
  salesVelocityDay: number;
  totalSold: number;
  monthlyGrowthPercent: number;
  marketDemandScore: number;
  searchVolumeLevel?: 'Sangat Tinggi' | 'Tinggi' | 'Sedang';
  contentSaturation: 'Sangat Rendah' | 'Rendah' | 'Sedang' | 'Tinggi';
  creatorVideoCount: number;
}

export interface HarvestProduct {
  id: string;
  name: string;
  category: string;
  shopeeCategorySlug: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  affiliateCommissionPercent: number;
  affiliateCommissionAmount: number;
  rating: number;
  reviewCount: number;
  shopName: string;
  shopLocation: string;
  shopBadge: 'Shopee Mall' | 'Star+' | 'Star' | 'Official Store';
  imageUrl: string;
  metrics: ShopeeMetrics;
  ugcOpportunityScore?: number;
  opportunityTier?: '💎 Super Viral' | '🔥 High Potential' | '⚡ Steady Performer';
  isBlueOcean?: boolean;
  blueOceanScore?: number;
  competitorAnalysisReason?: string;
  recommendedAngle: string;
  recommendedHook: string;
  targetAudience: string;
  keySellingPoints: string;
  recommendedFraming: 'hands_pov' | 'face_closeup' | 'full_body' | 'mix_framing';
  recommendedFormatId: string;
  trendingTags: string[];
}

export const CATEGORY_IMAGE_MAP: Record<string, string[]> = {
  skincare: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248597359-005d5e23631f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
  ],
  gadget: [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  ],
  home: [
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  ],
  health: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  ],
  baby: [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
  ],
};

export function getRandomImageUrl(categorySlug: string): string {
  const images = CATEGORY_IMAGE_MAP[categorySlug] || CATEGORY_IMAGE_MAP['home'];
  return images[Math.floor(Math.random() * images.length)];
}

export function computeProductScores(p: HarvestProduct): HarvestProduct {
  const vScore = Math.min(100, Math.max(10, Math.round((p.metrics.salesVelocityDay / 450) * 100)));
  const gScore = Math.min(100, Math.max(10, Math.round((p.metrics.monthlyGrowthPercent / 180) * 100)));
  let satAdj = 0;
  if (p.metrics.contentSaturation === 'Sangat Rendah') satAdj = 18;
  else if (p.metrics.contentSaturation === 'Rendah') satAdj = 10;
  else if (p.metrics.contentSaturation === 'Tinggi') satAdj = -12;
  const dScore = Math.min(100, Math.max(15, Math.round(p.metrics.marketDemandScore + satAdj)));
  const cScore = Math.min(100, Math.max(10, Math.round((p.affiliateCommissionPercent / 15) * 100)));

  const totalScore = Math.min(99, Math.max(50, Math.round(
    vScore * 0.35 + gScore * 0.30 + dScore * 0.20 + cScore * 0.15
  )));

  let tier: '💎 Super Viral' | '🔥 High Potential' | '⚡ Steady Performer' = '⚡ Steady Performer';
  if (totalScore >= 88) tier = '💎 Super Viral';
  else if (totalScore >= 74) tier = '🔥 High Potential';

  const isLowComp = p.metrics.contentSaturation === 'Sangat Rendah' || p.metrics.contentSaturation === 'Rendah' || (p.metrics.creatorVideoCount <= 400);
  const isHighSearch = p.metrics.marketDemandScore >= 80;
  const isBlueOcean = isLowComp && isHighSearch;

  const blueOceanScore = Math.min(99, Math.max(40, Math.round(
    p.metrics.marketDemandScore * 0.55 + 
    (Math.max(0, 1000 - p.metrics.creatorVideoCount) / 1000) * 35 +
    ((p.metrics.monthlyGrowthPercent || 150) / 200) * 10
  )));

  const searchVolumeLevel = p.metrics.marketDemandScore >= 90 ? 'Sangat Tinggi' : p.metrics.marketDemandScore >= 80 ? 'Tinggi' : 'Sedang';

  let competitorAnalysisReason = p.competitorAnalysisReason;
  if (!competitorAnalysisReason) {
    if (isBlueOcean) {
      competitorAnalysisReason = `Pencarian kata kunci naik pesat (+${p.metrics.monthlyGrowthPercent}%), namun baru ada ~${p.metrics.creatorVideoCount} video kreator. Sangat berpeluang viral tanpa perang harga!`;
    } else if (p.metrics.contentSaturation === 'Tinggi') {
      competitorAnalysisReason = `Demand sangat tinggi tapi kreator padat (>1.000 video). Wajib gunakan angle visual dramatis/kontras.`;
    } else {
      competitorAnalysisReason = `Keseimbangan demand stabil dan persaingan kreator wajar. Efektif untuk review storytelling.`;
    }
  }

  return {
    ...p,
    ugcOpportunityScore: totalScore,
    opportunityTier: tier,
    isBlueOcean,
    blueOceanScore,
    metrics: {
      ...p.metrics,
      searchVolumeLevel,
    },
    competitorAnalysisReason,
  };
}

// Master catalogue with authentic Indonesian Shopee items
export const HARVEST_MASTER_CATALOG: HarvestProduct[] = [
  {
    id: 'shp_blue_1',
    name: 'INBEX Tripod Auto-Tracking AI 360° Face Sensor',
    category: 'Gadget & Elektronik',
    shopeeCategorySlug: 'gadget',
    price: 189000,
    originalPrice: 320000,
    discountPercent: 41,
    affiliateCommissionPercent: 15,
    affiliateCommissionAmount: 28350,
    rating: 4.8,
    reviewCount: 34900,
    shopName: 'INBEX Official Shop',
    shopLocation: 'Kota Tangerang',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 480,
      totalSold: 78500,
      monthlyGrowthPercent: 210,
      marketDemandScore: 94,
      contentSaturation: 'Rendah',
      creatorVideoCount: 260,
    },
    recommendedAngle: 'Solusi Bikin Konten Sendirian Tanpa Perlu Minta Tolong Kameramen',
    recommendedHook: 'Buat kreator solo yang capek minta tolong orang buat videoin, kalian wajib liat ini!',
    targetAudience: 'Kreator pemula, online shop owner, vlogger OOTD & dance cover',
    keySellingPoints: 'Sensor AI cerdas tanpa aplikasi bluetooth, rotasi 360° otomatis, baterai tahan 8 jam, stabil kokoh',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#tripodtracking', '#alatngonten', '#tripodai', '#inbextripod'],
  },
  {
    id: 'shp_blue_2',
    name: 'OXY Miracle Powder Pembersih Kerak & Noda Baju Membandel 500g',
    category: 'Home & Living',
    shopeeCategorySlug: 'home',
    price: 48500,
    originalPrice: 79000,
    discountPercent: 38,
    affiliateCommissionPercent: 16,
    affiliateCommissionAmount: 7760,
    rating: 4.9,
    reviewCount: 52300,
    shopName: 'CleanHome Solusi Indonesia',
    shopLocation: 'Kab. Sidoarjo',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 540,
      totalSold: 118000,
      monthlyGrowthPercent: 245,
      marketDemandScore: 95,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 140,
    },
    recommendedAngle: 'Demonstrasi Cuci Noda Kuning Kerah Baju & Kerak Panci 10 Detik Bersih Total',
    recommendedHook: 'Jangan buang baju putih kamu yang kuning kena noda! Rendam pakai ini 10 menit, noda langsung rontok sendiri!',
    targetAudience: 'Ibu rumah tangga, anak kost, pekerja kantor yang bajunya sering kena noda kopi/keringat',
    keySellingPoints: 'Formula oksigen aktif tanpa klorin pemutih, aman untuk baju berwarna, tanpa sikat capek langsung kinclong',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'before_after',
    trendingTags: ['#pembersihnoda', '#oxypowder', '#tipsrumahtangga', '#hackanakkost'],
  },
  {
    id: 'shp_blue_3',
    name: 'Mini Bluetooth Pocket Thermal Label Printer Portable No Ink',
    category: 'Gadget & Elektronik',
    shopeeCategorySlug: 'gadget',
    price: 119000,
    originalPrice: 199000,
    discountPercent: 40,
    affiliateCommissionPercent: 14,
    affiliateCommissionAmount: 16660,
    rating: 4.8,
    reviewCount: 18400,
    shopName: 'TechStyle Gadget Official',
    shopLocation: 'Jakarta Barat',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 390,
      totalSold: 42000,
      monthlyGrowthPercent: 185,
      marketDemandScore: 91,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 110,
    },
    recommendedAngle: 'Organizing Hack: Labeling Bumbu Dapur, Buku Catatan & Resi Pengiriman Tanpa Tinta',
    recommendedHook: 'Printer secuil ini gak butuh tinta selamanya! Tinggal ketik di HP langsung keluar stiker estetik.',
    targetAudience: 'Pencinta stationery, pelajar/mahasiswa, pemilik olshop kecil, ibu rumah tangga',
    keySellingPoints: 'Thermal printing bebas tinta selamanya, koneksi bluetooth cepat via iOS/Android, ukuran mungil masuk kantong',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'unboxing',
    trendingTags: ['#printermini', '#stationeryhaul', '#alatpacking', '#estetik'],
  },
  {
    id: 'shp_blue_4',
    name: 'Handsfree Wearable Electric Breast Pump Ultra Silent 9-Speed',
    category: 'Ibu & Bayi',
    shopeeCategorySlug: 'baby',
    price: 249000,
    originalPrice: 399000,
    discountPercent: 38,
    affiliateCommissionPercent: 15,
    affiliateCommissionAmount: 37350,
    rating: 4.8,
    reviewCount: 22100,
    shopName: 'MommyCare Baby Store',
    shopLocation: 'Jakarta Barat',
    shopBadge: 'Official Store',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 310,
      totalSold: 38400,
      monthlyGrowthPercent: 175,
      marketDemandScore: 92,
      contentSaturation: 'Rendah',
      creatorVideoCount: 165,
    },
    recommendedAngle: 'Working Mom Hack: Pumping Sambil Ngetik di Kantor Tanpa Ada yang Tahu',
    recommendedHook: 'Penyelamat hidup working mom! Sekarang bisa pumping di kantor tanpa harus sembunyi di toilet.',
    targetAudience: 'Ibu menyusui, working mom, new moms yang butuh pompa ASI praktis tanpa kabel',
    keySellingPoints: 'Desain masuk ke dalam bra tanpa selang kabel, motor ultra-silent di bawah 40dB, 9 level hisapan lembut',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#pompaasi', '#workingmom', '#pejuangasi', '#asieksklusif'],
  },
  {
    id: 'shp_blue_5',
    name: 'Cica AHA BHA Peeling Gel Eksfoliasi Daki & Komedo Wajah 100ml',
    category: 'Skincare & Kecantikan',
    shopeeCategorySlug: 'skincare',
    price: 52000,
    originalPrice: 85000,
    discountPercent: 39,
    affiliateCommissionPercent: 15,
    affiliateCommissionAmount: 7800,
    rating: 4.9,
    reviewCount: 41200,
    shopName: 'Dermalogy Naturals Lab',
    shopLocation: 'Kota Bandung',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 460,
      totalSold: 67000,
      monthlyGrowthPercent: 215,
      marketDemandScore: 93,
      contentSaturation: 'Rendah',
      creatorVideoCount: 220,
    },
    recommendedAngle: 'Rontokin Sel Kulit Mati & Komedo Hidung Kasar Tanpa Bikin Kulit Mengelupas Sakit',
    recommendedHook: 'Kalau hidung kamu gradakan banyak komedo putih kasar, jangan dipencet! Cukup oles gel ini 30 detik.',
    targetAudience: 'Pria/wanita usia 16-30 yang punya masalah tekstur wajah kasar dan komedo membandel',
    keySellingPoints: 'Cica extract penenang kulit, AHA BHA lembut tanpa butiran scrub tajam, daki langsung menggumpal keluar seketika',
    recommendedFraming: 'face_closeup',
    recommendedFormatId: 'before_after',
    trendingTags: ['#peelinggel', '#komedohilang', '#eksfoliasiwajah', '#kulitglowing'],
  },
  {
    id: 'shp_blue_6',
    name: 'Bantal Duduk Ergonomis Memory Foam Orthopedic Anti Sakit Pinggang',
    category: 'Home & Living',
    shopeeCategorySlug: 'home',
    price: 135000,
    originalPrice: 220000,
    discountPercent: 38,
    affiliateCommissionPercent: 14,
    affiliateCommissionAmount: 18900,
    rating: 4.8,
    reviewCount: 19800,
    shopName: 'ErgoComfort Living',
    shopLocation: 'Jakarta Selatan',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 290,
      totalSold: 31000,
      monthlyGrowthPercent: 190,
      marketDemandScore: 89,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 120,
    },
    recommendedAngle: 'Ergonomic Workstation Setup: Duduk 8 Jam di Kursi Kerja Tanpa Encok Pinggang',
    recommendedHook: 'Siapa di sini yang kalau duduk kerja seharian pulang-pulang pinggang rasanya mau patah? Ini penyelamatnya!',
    targetAudience: 'Pekerja kantoran, freelancer WFH, gamer, driver mobil jarak jauh',
    keySellingPoints: 'Desain U-cutout meredakan tekanan tulang ekor, memory foam tebal anti kempes, cover breathable bisa dicuci',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#bantalduduk', '#sakittulangbelakang', '#ergonomicsetup', '#wfhlife'],
  },
  {
    id: 'shp_blue_7',
    name: 'Celana Kulot Highwaist Linen Premium Flowy Anti Kusut',
    category: 'Fashion & OOTD',
    shopeeCategorySlug: 'fashion',
    price: 89000,
    originalPrice: 149000,
    discountPercent: 40,
    affiliateCommissionPercent: 13,
    affiliateCommissionAmount: 11570,
    rating: 4.9,
    reviewCount: 47000,
    shopName: 'LinenDaily Fashion House',
    shopLocation: 'Pekalongan',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 420,
      totalSold: 94000,
      monthlyGrowthPercent: 165,
      marketDemandScore: 90,
      contentSaturation: 'Rendah',
      creatorVideoCount: 290,
    },
    recommendedAngle: 'Styling Hack: 1 Celana Kulot untuk 3 Gaya (Kantor, Kampus & Hangout Kafe)',
    recommendedHook: 'Akhirnya nemu kulot yang gak bikin paha keliatan lebar dan potongannya bikin kaki keliatan 5cm lebih jenjang!',
    targetAudience: 'Wanita hijab & non-hijab usia 18-35 yang butuh celana kerja nyaman tidak gerah',
    keySellingPoints: 'Bahan linen crinkle premium tidak perlu disetrika, potongan pinggang highwaist elastis, saku dalam fungsional',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'haul',
    trendingTags: ['#kulothighwaist', '#ootdkerja', '#outfithijab', '#kulotlinen'],
  },
  {
    id: 'shp_blue_8',
    name: 'Madu Murni Lambung Sehat Ekstrak Kunyit & Temulawak 280g',
    category: 'Diet & Kesehatan',
    shopeeCategorySlug: 'health',
    price: 79000,
    originalPrice: 120000,
    discountPercent: 34,
    affiliateCommissionPercent: 16,
    affiliateCommissionAmount: 12640,
    rating: 4.9,
    reviewCount: 38200,
    shopName: 'HerbaSehat Nusantara',
    shopLocation: 'Solo',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 350,
      totalSold: 62000,
      monthlyGrowthPercent: 180,
      marketDemandScore: 92,
      contentSaturation: 'Rendah',
      creatorVideoCount: 190,
    },
    recommendedAngle: 'Solusi Alami Atasi Sesak Dada & Perut Begah Akibat Asam Lambung Naik',
    recommendedHook: 'Tiap pagi perut mual perih atau dada sering panas kayak terbakar? Stop minum obat kimia terus, coba rutin ini 7 hari!',
    targetAudience: 'Pecinta kopi, orang yang sering telat makan, penderita maag / GERD kronis',
    keySellingPoints: 'Madu hutan murni grade A dipadukan ekstrak rimpang kunyit dan temulawak, legal BPOM & Halal MUI',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'review',
    trendingTags: ['#madulambung', '#gerdsembuh', '#obatasamlambung', '#herbalalami'],
  },
  {
    id: 'shp_blue_9',
    name: 'Electric Foot Callus Grinder Alat Penghalus Tumit Kaki Kapalan',
    category: 'Skincare & Kecantikan',
    shopeeCategorySlug: 'skincare',
    price: 69000,
    originalPrice: 129000,
    discountPercent: 46,
    affiliateCommissionPercent: 15,
    affiliateCommissionAmount: 10350,
    rating: 4.8,
    reviewCount: 26400,
    shopName: 'SmoothGlow Beauty Tools',
    shopLocation: 'Jakarta Utara',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 380,
      totalSold: 41000,
      monthlyGrowthPercent: 210,
      marketDemandScore: 91,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 115,
    },
    recommendedAngle: 'Pedicure Spa di Rumah: Tumit Pecah-pecah Kasar Langsung Mulus Bayi dalam 1 Menit',
    recommendedHook: 'Malu pakai sandal terbuka karena tumit kaki retak-retak kering? Coba liat pas kulit mati ini diserut!',
    targetAudience: 'Wanita & pria yang sering berdiri lama atau tumit kakinya pecah-pecah',
    keySellingPoints: '2 kepala roller kuarsa mineral, baterai rechargeable USB, tahan air dan ada vacuum penghisap serbuk kulit mati',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'before_after',
    trendingTags: ['#tumitmulus', '#callusremover', '#pedicuredirumah', '#perawatankaki'],
  },
  {
    id: 'shp_blue_10',
    name: 'Lampu LED Sensor Gerak Smart Motion Sensor Lemari & Tangga Magnetik',
    category: 'Home & Living',
    shopeeCategorySlug: 'home',
    price: 34000,
    originalPrice: 65000,
    discountPercent: 47,
    affiliateCommissionPercent: 16,
    affiliateCommissionAmount: 5440,
    rating: 4.9,
    reviewCount: 88000,
    shopName: 'Lumina Smart Home',
    shopLocation: 'Semarang',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 610,
      totalSold: 140000,
      monthlyGrowthPercent: 230,
      marketDemandScore: 94,
      contentSaturation: 'Rendah',
      creatorVideoCount: 210,
    },
    recommendedAngle: 'Smart Home Murah Tanpa Bobok Tembok: Buka Lemari / Lewat Langsung Nyala',
    recommendedHook: 'Bikin rumah keliatan kayak hotel bintang 5 cuma modal 30 ribuan tanpa kabel sama sekali!',
    targetAudience: 'Pemilik rumah, anak kost, orang yang sering terbangun malam hari ke kamar mandi',
    keySellingPoints: 'Sensor otomatis sudut 120°, tempel magnetik tanpa bor tembok, baterai tahan 30 hari sekali cas',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#lampusensor', '#smarthomemurah', '#hackanakkost', '#dekorasikamar'],
  },
  {
    id: 'shp_1',
    name: 'Skintific 5X Ceramide Barrier Moisture Gel 30g',
    category: 'Skincare & Kecantikan',
    shopeeCategorySlug: 'skincare',
    price: 139000,
    originalPrice: 169000,
    discountPercent: 18,
    affiliateCommissionPercent: 12,
    affiliateCommissionAmount: 16680,
    rating: 4.9,
    reviewCount: 284000,
    shopName: 'SKINTIFIC Official Store',
    shopLocation: 'Jakarta Utara',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 620,
      totalSold: 412000,
      monthlyGrowthPercent: 175,
      marketDemandScore: 96,
      contentSaturation: 'Sedang',
      creatorVideoCount: 1420,
    },
    recommendedAngle: 'Skincare Barrier Rescue (Sebelum vs Sesudah Kering Mengelupas)',
    recommendedHook: 'Sumpah stop pakai skincare keras kalau skin barrier kamu lagi rusak merah-merah!',
    targetAudience: 'Wanita/pria usia 18-35 dengan masalah kulit sensitif, kemerahan & bruntusan',
    keySellingPoints: '5X Ceramide, Hyaluronic Acid, Centella Asiatica, tekstur gel dingin ringan menyerap dalam 10 detik',
    recommendedFraming: 'face_closeup',
    recommendedFormatId: 'before_after',
    trendingTags: ['#skintific', '#skinbarrier', '#ceramide', '#moisturizerkering'],
  },
  {
    id: 'shp_3',
    name: 'Aerostreet Massive Low Sepatu Sneakers Casual Pria/Wanita',
    category: 'Fashion & OOTD',
    shopeeCategorySlug: 'fashion',
    price: 149900,
    originalPrice: 299000,
    discountPercent: 50,
    affiliateCommissionPercent: 10,
    affiliateCommissionAmount: 14990,
    rating: 4.9,
    reviewCount: 512000,
    shopName: 'Aerostreet Official',
    shopLocation: 'Kab. Klaten',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 550,
      totalSold: 890000,
      monthlyGrowthPercent: 140,
      marketDemandScore: 92,
      contentSaturation: 'Sedang',
      creatorVideoCount: 1850,
    },
    recommendedAngle: 'Styling OOTD Sneakers Lokal Kualitas Mewah di Bawah 150 Ribu',
    recommendedHook: 'Sepatu 100 ribuan tapi kelihatan kayak 1 jutaan! Gak percaya? Cek detail jahitannya.',
    targetAudience: 'Remaja, mahasiswa & pekerja muda penggemar casual streetwear',
    keySellingPoints: 'Teknologi Shoes Injection Mould anti jebol meski kena air hujan, insole empuk, desain timeless',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'haul',
    trendingTags: ['#aerostreet', '#lokalpride', '#sneakersmurah', '#ootdkece'],
  },
  {
    id: 'shp_8',
    name: 'Baseus Bowie WM02 TWS Bluetooth 5.3 Earphones Mini Pods',
    category: 'Gadget & Elektronik',
    shopeeCategorySlug: 'gadget',
    price: 169000,
    originalPrice: 289000,
    discountPercent: 41,
    affiliateCommissionPercent: 11,
    affiliateCommissionAmount: 18590,
    rating: 4.8,
    reviewCount: 180000,
    shopName: 'Baseus Official Mall',
    shopLocation: 'Jakarta Pusat',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 430,
      totalSold: 290000,
      monthlyGrowthPercent: 125,
      marketDemandScore: 89,
      contentSaturation: 'Sedang',
      creatorVideoCount: 890,
    },
    recommendedAngle: 'Bass Nendang & Baterai Tahan Seminggu untuk Daily Commute & Gym',
    recommendedHook: 'TWS harga 100 ribuan tapi punya aplikasi equalizer sendiri? Desain transparan estetik abis!',
    targetAudience: 'Pecinta musik, pekerja komuter KRL/MRT, gamer casual & pelari',
    keySellingPoints: 'Desain kapsul transparan estetik, low latency 0.06s untuk gaming, playtime hingga 25 jam',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'unboxing',
    trendingTags: ['#baseus', '#twsmurah', '#earphonebluetooth', '#gadgetviral'],
  },
  {
    id: 'shp_9',
    name: 'Flimty Minuman Serat Alami Rasa Blackcurrant / Raspberry',
    category: 'Diet & Kesehatan',
    shopeeCategorySlug: 'health',
    price: 295000,
    originalPrice: 350000,
    discountPercent: 16,
    affiliateCommissionPercent: 10,
    affiliateCommissionAmount: 29500,
    rating: 4.9,
    reviewCount: 480000,
    shopName: 'Flimty Official Store',
    shopLocation: 'Jakarta Barat',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 580,
      totalSold: 840000,
      monthlyGrowthPercent: 110,
      marketDemandScore: 93,
      contentSaturation: 'Tinggi',
      creatorVideoCount: 3200,
    },
    recommendedAngle: 'Detox Saluran Cerna Setelah Makan Berlemak / Cheat Day',
    recommendedHook: 'Habis makan all-you-can-eat atau gorengan banyak? Wajib minum ini sebelum tidur biar gak nimbun!',
    targetAudience: 'Pria/wanita yang sering begadang, sembelit, atau makan makanan cepat saji',
    keySellingPoints: 'Psyllium Husk, Goji Berry, Ekstrak Buah & Sayur, membantu detoksifikasi & melancarkan BAB harian',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'review',
    trendingTags: ['#flimty', '#minumanserat', '#detoxtubuh', '#dietkenyang'],
  },
  {
    id: 'shp_10',
    name: 'Oversized Boxy Heavyweight Hoodie Cotton Fleece 330gsm',
    category: 'Fashion & OOTD',
    shopeeCategorySlug: 'fashion',
    price: 175000,
    originalPrice: 280000,
    discountPercent: 37,
    affiliateCommissionPercent: 12,
    affiliateCommissionAmount: 21000,
    rating: 4.9,
    reviewCount: 62000,
    shopName: 'RawType Studio Apparel',
    shopLocation: 'Kota Bandung',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 320,
      totalSold: 49000,
      monthlyGrowthPercent: 165,
      marketDemandScore: 87,
      contentSaturation: 'Rendah',
      creatorVideoCount: 290,
    },
    recommendedAngle: 'Koreans Boxy Cut Fit: Hoodie Tebal Siluet Keren yang Bikin Postur Tegap',
    recommendedHook: 'Pencarian hoodie boxy sempurna berakhir di sini! Cuttingan bahu jatuh bikin badan keliatan tegap.',
    targetAudience: 'Cowok & cewek pencinta streetwear clean minimalis',
    keySellingPoints: 'Heavyweight fleece 330gsm tebal jatuh, rib tangan presisi, kapuchon tebal tegak tidak lepek',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'haul',
    trendingTags: ['#hoodieboxy', '#heavyweighthoodie', '#streetwearindo', '#ootdkece'],
  },
];
