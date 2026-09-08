import { ShopeeTrendingProduct, ShopeeProductMetrics } from '../types';

/**
 * UGC Master Opportunity Score Algorithm
 * Evaluates high-potential products for TikTok Shop & Shopee video creators.
 * 
 * Weights:
 * - Sales Velocity (35%): How fast the product is selling right now (units/day)
 * - Growth Momentum (30%): Sales acceleration & viral surge in 7-30 days
 * - Market Demand & Gap (20%): Search volume vs creator video saturation
 * - Affiliate Commission (15%): Profit potential for creators (commission %)
 */
export function calculateUGCOpportunityScore(
  metrics: ShopeeProductMetrics,
  commissionPercent: number
): {
  totalScore: number;
  tier: '💎 Super Viral' | '🔥 High Potential' | '⚡ Steady Performer';
  velocityScore: number;
  growthScore: number;
  demandScore: number;
  commissionScore: number;
} {
  // 1. Sales Velocity: Benchmark 450 units/day = 100 pts
  const velocityScore = Math.min(100, Math.max(10, Math.round((metrics.salesVelocityDay / 450) * 100)));

  // 2. Growth Momentum: Benchmark 180% monthly growth = 100 pts
  const growthScore = Math.min(100, Math.max(10, Math.round((metrics.monthlyGrowthPercent / 180) * 100)));

  // 3. Market Demand & Saturation Gap:
  // Saturation bonus: Sangat Rendah (+15), Rendah (+10), Sedang (+0), Tinggi (-10)
  let saturationAdj = 0;
  if (metrics.contentSaturation === 'Sangat Rendah') saturationAdj = 15;
  else if (metrics.contentSaturation === 'Rendah') saturationAdj = 8;
  else if (metrics.contentSaturation === 'Tinggi') saturationAdj = -12;

  const demandScore = Math.min(100, Math.max(15, Math.round(metrics.marketDemandScore + saturationAdj)));

  // 4. Commission Score: Benchmark 15% commission = 100 pts
  const commissionScore = Math.min(100, Math.max(10, Math.round((commissionPercent / 15) * 100)));

  const totalScore = Math.round(
    velocityScore * 0.35 +
    growthScore * 0.30 +
    demandScore * 0.20 +
    commissionScore * 0.15
  );

  const clampedTotal = Math.min(99, Math.max(50, totalScore));

  let tier: '💎 Super Viral' | '🔥 High Potential' | '⚡ Steady Performer' = '⚡ Steady Performer';
  if (clampedTotal >= 88) {
    tier = '💎 Super Viral';
  } else if (clampedTotal >= 74) {
    tier = '🔥 High Potential';
  }

  return {
    totalScore: clampedTotal,
    tier,
    velocityScore,
    growthScore,
    demandScore,
    commissionScore,
  };
}

export const SHOPEE_TRENDING_CATEGORIES = [
  { id: 'all', name: 'Semua Kategori', icon: '🔥' },
  { id: 'skincare', name: 'Skincare & Kecantikan', icon: '✨' },
  { id: 'fashion', name: 'Fashion & OOTD', icon: '👕' },
  { id: 'gadget', name: 'Gadget & Elektronik', icon: '🎧' },
  { id: 'home', name: 'Home & Living', icon: '🏡' },
  { id: 'health', name: 'Diet & Kesehatan', icon: '🌿' },
  { id: 'baby', name: 'Ibu & Bayi', icon: '🍼' },
];

export const INITIAL_SHOPEE_TRENDING_PRODUCTS: ShopeeTrendingProduct[] = [
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
    ugcOpportunityScore: 95,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Skincare Barrier Rescue (Sebelum vs Sesudah Kering Mengelupas)',
    recommendedHook: 'Sumpah stop pakai skincare keras kalau skin barrier kamu lagi rusak merah-merah!',
    targetAudience: 'Wanita/pria usia 18-35 dengan masalah kulit sensitif, kemerahan & bruntusan',
    keySellingPoints: '5X Ceramide, Hyaluronic Acid, Centella Asiatica, tekstur gel dingin ringan menyerap dalam 10 detik',
    recommendedFraming: 'face_closeup',
    recommendedFormatId: 'before_after',
    trendingTags: ['#skintific', '#skinbarrier', '#ceramide', '#moisturizerkering'],
  },
  {
    id: 'shp_2',
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
      creatorVideoCount: 380,
    },
    ugcOpportunityScore: 96,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Solusi Bikin Konten Sendirian Tanpa Perlu Minta Tolong Kameramen',
    recommendedHook: 'Buat kreator solo yang capek minta tolong orang buat videoin, kalian wajib liat ini!',
    targetAudience: 'Kreator pemula, online shop owner, vlogger OOTD & dance cover',
    keySellingPoints: 'Sensor AI cerdas tanpa aplikasi bluetooth, rotasi 360° otomatis, baterai tahan 8 jam, stabil kokoh',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#tripodtracking', '#alatngonten', '#tripodai', '#inbextripod'],
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
    ugcOpportunityScore: 91,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Styling OOTD Sneakers Lokal Kualitas Mewah di Bawah 150 Ribu',
    recommendedHook: 'Sepatu 100 ribuan tapi kelihatan kayak 1 jutaan! Gak percaya? Cek detail jahitannya.',
    targetAudience: 'Remaja, mahasiswa & pekerja muda penggemar casual streetwear',
    keySellingPoints: 'Teknologi Shoes Injection Mould anti jebol meski kena air hujan, insole empuk, desain timeless',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'haul',
    trendingTags: ['#aerostreet', '#lokalpride', '#sneakersmurah', '#ootdkece'],
  },
  {
    id: 'shp_4',
    name: 'Sago Green Coffee Slimming Extract Herbal 15 Sachet',
    category: 'Diet & Kesehatan',
    shopeeCategorySlug: 'health',
    price: 89000,
    originalPrice: 125000,
    discountPercent: 29,
    affiliateCommissionPercent: 18,
    affiliateCommissionAmount: 16020,
    rating: 4.8,
    reviewCount: 41200,
    shopName: 'Sago Herbal Naturals',
    shopLocation: 'Kota Bandung',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 390,
      totalSold: 64000,
      monthlyGrowthPercent: 185,
      marketDemandScore: 91,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 210,
    },
    ugcOpportunityScore: 94,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Diet Santai Tanpa Kelaparan Menyiksa (Curhat Relatable)',
    recommendedHook: 'Udah coba macam-macam diet tapi perut buncit masih nggelambir? Dengerin rahasia ini dulu.',
    targetAudience: 'Pria & wanita usia 22-45 yang ingin turun berat badan sehat & aman lambung',
    keySellingPoints: 'Green coffee chlorogenic acid alami, bikin kenyang awet, detox pencernaan lancar, rasa gurih nikmat',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'before_after',
    trendingTags: ['#dietsehat', '#kopihijau', '#perutbuncit', '#turunbb'],
  },
  {
    id: 'shp_5',
    name: 'Pembersih Noda Kerak Ajaib Serbaguna Porcelain Clean 500ml',
    category: 'Home & Living',
    shopeeCategorySlug: 'home',
    price: 49000,
    originalPrice: 85000,
    discountPercent: 42,
    affiliateCommissionPercent: 16,
    affiliateCommissionAmount: 7840,
    rating: 4.9,
    reviewCount: 89000,
    shopName: 'CleanHome Solution ID',
    shopLocation: 'Kota Surabaya',
    shopBadge: 'Star+',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 510,
      totalSold: 162000,
      monthlyGrowthPercent: 230,
      marketDemandScore: 95,
      contentSaturation: 'Sangat Rendah',
      creatorVideoCount: 190,
    },
    ugcOpportunityScore: 97,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Visual Shock Kerak Kamar Mandi Hitam Rontok Sekali Oles Tanpa Disikat',
    recommendedHook: 'Jangan ganti keramik kamar mandi dulu! Lihat gimana kerak tahunan ini rontok cuma 5 detik!',
    targetAudience: 'Ibu rumah tangga, anak kost, pemilik rumah yang ingin rumah bersih kinclong',
    keySellingPoints: 'Formula aktif pengikis kerak membandel, tidak berbau menyengat, aman untuk nat & stainless steel',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'satisfying_asmr',
    trendingTags: ['#bersihbersih', '#pembersihkerak', '#rumahkinclong', '#asmrcleaning'],
  },
  {
    id: 'shp_6',
    name: 'Pompa ASI Elektrik Hands-Free Wireless Wearable Breastpump',
    category: 'Ibu & Bayi',
    shopeeCategorySlug: 'baby',
    price: 249000,
    originalPrice: 399000,
    discountPercent: 38,
    affiliateCommissionPercent: 14,
    affiliateCommissionAmount: 34860,
    rating: 4.8,
    reviewCount: 22100,
    shopName: 'MommyCare Baby Store',
    shopLocation: 'Jakarta Barat',
    shopBadge: 'Official Store',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 280,
      totalSold: 38400,
      monthlyGrowthPercent: 160,
      marketDemandScore: 88,
      contentSaturation: 'Rendah',
      creatorVideoCount: 175,
    },
    ugcOpportunityScore: 89,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Working Mom Hack: Pumping Sambil Ngetik di Kantor Tanpa Ada yang Tahu',
    recommendedHook: 'Penyelamat hidup working mom! Sekarang bisa pumping di kantor tanpa harus sembunyi di toilet.',
    targetAudience: 'Ibu menyusui, working mom, new moms yang butuh pompa ASI praktis tanpa kabel',
    keySellingPoints: 'Desain masuk ke dalam bra tanpa selang kabel, motor ultra-silent di bawah 40dB, 9 level hisapan lembut',
    recommendedFraming: 'hands_pov',
    recommendedFormatId: 'review',
    trendingTags: ['#pompaasi', '#workingmom', '#pejuangasi', '#asieksklusif'],
  },
  {
    id: 'shp_7',
    name: 'Glad2Glow Pomegranate 10% Niacinamide Power Bright Serum',
    category: 'Skincare & Kecantikan',
    shopeeCategorySlug: 'skincare',
    price: 49000,
    originalPrice: 69000,
    discountPercent: 29,
    affiliateCommissionPercent: 15,
    affiliateCommissionAmount: 7350,
    rating: 4.9,
    reviewCount: 310000,
    shopName: 'Glad2Glow Official Store',
    shopLocation: 'Jakarta Utara',
    shopBadge: 'Shopee Mall',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-005d5e23631f?w=800&auto=format&fit=crop&q=80',
    metrics: {
      salesVelocityDay: 680,
      totalSold: 720000,
      monthlyGrowthPercent: 155,
      marketDemandScore: 97,
      contentSaturation: 'Sedang',
      creatorVideoCount: 2400,
    },
    ugcOpportunityScore: 92,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Solusi Bekas Jerawat Menghitam Pudar Cepat Ramah Dompet Mahasiswa',
    recommendedHook: 'Serum pencerah 40 ribuan tapi kandungannya 10% Niacinamide murni? Nih buktinya!',
    targetAudience: 'Remaja dan mahasiswa dengan kulit kusam dan PIH bekas jerawat',
    keySellingPoints: 'Ekstrak Delima & Niacinamide 10%, tekstur seringan air, cepat meresap tanpa rasa lengket',
    recommendedFraming: 'face_closeup',
    recommendedFormatId: 'problem_solution',
    trendingTags: ['#glad2glow', '#serumpencerah', '#bekasjerawat', '#skincarepelajar'],
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
    ugcOpportunityScore: 86,
    opportunityTier: '🔥 High Potential',
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
    ugcOpportunityScore: 84,
    opportunityTier: '🔥 High Potential',
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
    ugcOpportunityScore: 88,
    opportunityTier: '💎 Super Viral',
    recommendedAngle: 'Koreans Boxy Cut Fit: Hoodie Tebal Siluet Keren yang Bikin Postur Tegap',
    recommendedHook: 'Pencarian hoodie boxy sempurna berakhir di sini! Cuttingan bahu jatuh bikin badan keliatan tegap.',
    targetAudience: 'Cowok & cewek pencinta streetwear clean minimalis',
    keySellingPoints: 'Heavyweight fleece 330gsm tebal jatuh, rib tangan presisi, kapuchon tebal tegak tidak lepek',
    recommendedFraming: 'full_body',
    recommendedFormatId: 'haul',
    trendingTags: ['#hoodieboxy', '#heavyweighthoodie', '#streetwearindo', '#ootdkece'],
  },
];
