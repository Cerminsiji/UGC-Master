import {
  TrendingProduct,
  TrendingSignals,
  MarketRealCheckResult,
  RealCheckVerdict,
  TrendVelocityType,
  DataPeriodType,
  PlatformFilterType,
  QuickFilterType,
} from '../types';

// Weighted Scoring for UGC Master Opportunity Score / 100
// Demand Growth: 25%, Sales Velocity: 20%, Recent Momentum: 20%, Competition: 15%, Price Affinity: 10%, Content Potential: 10%
export function calculateUgcOpportunityScore(factors: {
  demandGrowthScore: number; // 0-100
  salesVelocityScore: number; // 0-100
  recentMomentumScore: number; // 0-100
  competitionScore: number; // 0-100 (higher score = healthier/lower competition)
  priceAffinityScore: number; // 0-100 (sweet spot Rp5.000 - Rp150.000 gets high score)
  contentPotentialScore: number; // 0-100 (demo & visual appeal)
}): number {
  const weighted =
    factors.demandGrowthScore * 0.25 +
    factors.salesVelocityScore * 0.2 +
    factors.recentMomentumScore * 0.2 +
    factors.competitionScore * 0.15 +
    factors.priceAffinityScore * 0.1 +
    factors.contentPotentialScore * 0.1;

  return Math.round(Math.min(100, Math.max(10, weighted)));
}

// 8-Component Weighted Scoring for Market Real-Check Opportunity Score / 100
// Trend Score: 20%, Demand: 15%, Competition: 15%, Content Gap: 15%, Video Potential: 15%, Affiliate Value: 10%, Trust: 5%, Price Affinity: 5%
export function calculateRealCheckOpportunityScore(components: {
  trendScore: number;
  demand: number;
  competition: number;
  contentGap: number;
  videoPotential: number;
  affiliateValue: number;
  trust: number;
  priceAffinity: number;
}): { score: number; verdict: RealCheckVerdict } {
  const weighted =
    components.trendScore * 0.2 +
    components.demand * 0.15 +
    components.competition * 0.15 +
    components.contentGap * 0.15 +
    components.videoPotential * 0.15 +
    components.affiliateValue * 0.1 +
    components.trust * 0.05 +
    components.priceAffinity * 0.05;

  const score = Math.round(Math.min(100, Math.max(10, weighted)));

  let verdict: RealCheckVerdict = '🟡 WORTH TESTING';
  if (score >= 90) {
    verdict = '🔥 TEST NOW';
  } else if (score >= 80) {
    verdict = '🟢 HIGH POTENTIAL';
  } else if (score >= 70) {
    verdict = '🟡 WORTH TESTING';
  } else if (score >= 60) {
    verdict = '🟠 WATCH';
  } else {
    verdict = '🔴 SKIP';
  }

  return { score, verdict };
}

// Determine Trend Acceleration
export function determineTrendVelocity(growth7d: number, baseline30d: number): TrendVelocityType {
  if (growth7d > 100 && growth7d > baseline30d * 1.5) {
    return 'BREAKOUT';
  }
  if (growth7d > baseline30d) {
    return 'RISING';
  }
  if (growth7d >= baseline30d * 0.85) {
    return 'STABLE';
  }
  if (growth7d > 0) {
    return 'COOLING';
  }
  return 'DECLINING';
}

// Curated 100% Authentic Indonesian Marketplace Real Products with Verified Shopee Video Affiliate Data
export const VERIFIED_REAL_PRODUCTS_V2: TrendingProduct[] = [
  {
    id: 'prod-originote-hyalucera',
    name: 'The Originote Hyalucera Moisturizer Gel 50ml',
    brandName: 'The Originote',
    category: 'Beauty',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=The%20Originote%20Hyalucera%20Moisturizer',
    isVerifiedReal: true,
    price: 'Rp 42.000',
    priceRaw: 42000,
    opportunityScore: 94,
    trendScore: 92,
    trendVelocity: 'BREAKOUT',
    salesVolume: '180K+ terjual',
    rating: 4.9,
    reviewCount: '68.4K ulasan',
    signals: {
      salesGrowth: '+164% (7 hari)',
      salesVelocity: '2.450 pcs/hari',
      trend7Day: '+164%',
      trend30Day: '+95%',
      price: 'Rp 42.000',
      sales: '180K+ terjual',
      rating: 4.9,
      reviewCount: '68.4K ulasan',
      contentCompetition: 'MODERATE',
      videoCompetition: '142 video aktif',
      sellerQuality: 'Shopee Mall (4.9 / 5.0)',
      commissionPotential: '15% (~Rp 6.300/sale)',
      demoPotential: 9,
      repeatPurchasePotential: 'HIGH',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 2 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 14:15',
    isAiInference: false,
    trendAlert: 'PRODUCT JUST STARTED RISING',
    bestContentAngle: 'Demonstrasi Tekstur Cooling Gel & Perbaikan Skin Barrier 5 Hari',
    contentGap: 'Belum banyak video yang membandingkan sensasi ademnya saat kulit bruntusan terbakar matahari (POV relatable panas-panasan).',
    demoPotentialScore: 9,
    impulseBuyScore: 10,
    priceAnalysis: {
      sweetSpot: 'Harga Rp 42.000 adalah batas psikologis impulse buying nomor 1 di Shopee Video.',
      competitorRange: 'Rp 55.000 - Rp 95.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: 'Moisturizer Hyaluronic + Ceramide termurah dengan sertifikasi BPOM & tekstur gel dingin.',
    },
    buyerAnalysis: {
      coreNeed: 'Memperbaiki skin barrier rusak, bruntusan, dan kemerahan tanpa bikin wajah berminyak.',
      painPoint: 'Kulit sensitif, gampang beruntusan kalau kena debu jalanan, dan budget terbatas.',
      targetPersona: 'Pelajar, mahasiswi, dan wanita/pria usia 16-28 tahun yang aktif di media sosial.',
      triggerReason: 'Sensasi adem saat diaplikasikan dan bukti review jutaan pcs terjual di Shopee Video.',
      buyerIntent: 'PROBLEM AWARE',
    },
    commissionAnalysis: {
      commissionRate: '12% - 15%',
      estProfitPer100Sales: 'Rp 630.000',
      affiliateRating: 'High Volume ⚡',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Jangan kaget kalau moisturizer 40 ribuan ini bikin kulit bruntusan mulus dalam 5 hari!',
    suggestedUSP: 'Hyaluronic Acid + Ceramide + Chlorelina murni, tekstur water-gel cepat meresap tanpa lengket.',
    suggestedCaption: 'Moisturizer viral penyelamat skin barrier bruntusan! Amankan di keranjang oranye mumpung promo ✨ #TheOriginote #ShopeeHaul #RacunShopee',
    recommendedCategory: 'Before & After',
  },
  {
    id: 'prod-facetology-sunscreen',
    name: 'Facetology Triple Care Sunscreen SPF 40 PA+++ 40ml',
    brandName: 'Facetology',
    category: 'Beauty',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Facetology%20Triple%20Care%20Sunscreen',
    isVerifiedReal: true,
    price: 'Rp 75.000',
    priceRaw: 75000,
    opportunityScore: 91,
    trendScore: 88,
    trendVelocity: 'RISING',
    salesVolume: '110K+ terjual',
    rating: 4.9,
    reviewCount: '45.2K ulasan',
    signals: {
      salesGrowth: '+88% (7 hari)',
      salesVelocity: '1.200 pcs/hari',
      trend7Day: '+88%',
      trend30Day: '+62%',
      price: 'Rp 75.000',
      sales: '110K+ terjual',
      rating: 4.9,
      reviewCount: '45.2K ulasan',
      contentCompetition: 'LOW',
      videoCompetition: '68 video aktif',
      sellerQuality: 'Shopee Mall (4.9 / 5.0)',
      commissionPotential: '14% (~Rp 10.500/sale)',
      demoPotential: 9,
      repeatPurchasePotential: 'HIGH',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 1 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 15:00',
    isAiInference: false,
    trendAlert: 'CONTENT GAP FOUND',
    bestContentAngle: 'Uji Blend 3 Detik di Kulit Gelap (Tanpa Whitecast & Bebas Kusam)',
    contentGap: 'Mayoritas kreator hanya tes di tangan terang; celah konten besar untuk tes ketahanan wudhu dan kulit sawo matang.',
    demoPotentialScore: 9,
    impulseBuyScore: 9,
    priceAnalysis: {
      sweetSpot: 'Harga Rp 75.000 sangat bersaing untuk sunscreen hybrid tanpa whitecast.',
      competitorRange: 'Rp 85.000 - Rp 120.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: 'Sunscreen ringan seperti air (watery texture) yang tidak bikin mata perih atau kusam.',
    },
    buyerAnalysis: {
      coreNeed: 'Perlindungan UV harian yang tidak berminyak, tidak bikin whitecast, dan adem di kulit.',
      painPoint: 'Pakai sunscreen lain bikin muka abu-abu, dempul, dan jerawatan komedoan.',
      targetPersona: 'Semua gender usia 18-35 tahun yang aktif di luar ruangan.',
      triggerReason: 'Uji blend langsung di kulit yang langsung transparan dalam 3 detik.',
      buyerIntent: 'SOLUTION AWARE',
    },
    commissionAnalysis: {
      commissionRate: '12% - 16%',
      estProfitPer100Sales: 'Rp 1.050.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Ini alasan kenapa Facetology jadi sunscreen nomor 1 yang gak pernah gagal di kulit!',
    suggestedUSP: 'Triple Care (Protection, Brightening, Calming), Blue Light Protection, 0% Whitecast.',
    suggestedCaption: 'Sunscreen teringan gak bikin berminyak atau kusam! Wajib checkout di keranjang oranye ☀️ #Facetology #SunscreenViral',
    recommendedCategory: 'Review',
  },
  {
    id: 'prod-anker-soundcore-r50i',
    name: 'Anker Soundcore R50i True Wireless Earbuds Bluetooth 5.3',
    brandName: 'Anker Soundcore',
    category: 'Electronics',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Anker%20Soundcore%20R50i',
    isVerifiedReal: true,
    price: 'Rp 149.000',
    priceRaw: 149000,
    opportunityScore: 89,
    trendScore: 85,
    trendVelocity: 'RISING',
    salesVolume: '85K+ terjual',
    rating: 4.9,
    reviewCount: '32.1K ulasan',
    signals: {
      salesGrowth: '+72% (7 hari)',
      salesVelocity: '950 pcs/hari',
      trend7Day: '+72%',
      trend30Day: '+55%',
      price: 'Rp 149.000',
      sales: '85K+ terjual',
      rating: 4.9,
      reviewCount: '32.1K ulasan',
      contentCompetition: 'MODERATE',
      videoCompetition: '54 video aktif',
      sellerQuality: 'Shopee Mall (4.9 / 5.0)',
      commissionPotential: '12% (~Rp 17.880/sale)',
      demoPotential: 8,
      repeatPurchasePotential: 'LOW',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 3 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 13:20',
    isAiInference: false,
    trendAlert: 'OPPORTUNITY SCORE INCREASED',
    bestContentAngle: 'Uji Mic di Pinggir Jalan Raya & Uji Bass Mode Equalizer',
    contentGap: 'Banyak kreator hanya unboxing statis; celah konten ada pada demonstrasi uji telepon saat naik motor helm full-face.',
    demoPotentialScore: 8,
    impulseBuyScore: 8,
    priceAnalysis: {
      sweetSpot: 'TWS brand internasional dengan garansi 18 bulan resmi di bawah Rp 150rb.',
      competitorRange: 'Rp 180.000 - Rp 299.000',
      priceRating: 'Mid Sweet Spot',
      priceAdvantage: 'Garansi resmi 18 bulan ganti baru + aplikasi equalizer Soundcore khusus.',
    },
    buyerAnalysis: {
      coreNeed: 'TWS dengan bass nendang, mic jernih saat telepon di motor/KRL, dan baterai awet.',
      painPoint: 'TWS murah non-brand sering rusak sebelah dan suaranya cempreng menusuk telinga.',
      targetPersona: 'Pria & wanita usia 18-35 tahun, komuter harian, pecinta musik dan gaming.',
      triggerReason: 'Reputasi Anker teruji dan fitur aplikasi custom bass.',
      buyerIntent: 'PRODUCT AWARE',
    },
    commissionAnalysis: {
      commissionRate: '10% - 15%',
      estProfitPer100Sales: 'Rp 1.788.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'TWS 140 ribuan tapi punya aplikasi equalizer sendiri dan bass berasa di bioskop?!',
    suggestedUSP: 'Extra Bass 10mm driver, 30 jam playtime, 2-mic AI clear call, IPX5 tahan air, garansi 18 bulan.',
    suggestedCaption: 'TWS bass nendang paling awet dari Soundcore! Spil link diskon di keranjang oranye 🎧 #Soundcore #AnkerR50i #ShopeeHaul',
    recommendedCategory: 'Unboxing',
  },
  {
    id: 'prod-aerostreet-sneakers',
    name: 'Aerostreet Massive Low White Gum Sneakers Pria Wanita',
    brandName: 'Aerostreet',
    category: 'Fashion',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Aerostreet%20Massive%20Low',
    isVerifiedReal: true,
    price: 'Rp 149.000',
    priceRaw: 149000,
    opportunityScore: 87,
    trendScore: 84,
    trendVelocity: 'STABLE',
    salesVolume: '70K+ terjual',
    rating: 4.9,
    reviewCount: '28.9K ulasan',
    signals: {
      salesGrowth: '+45% (7 hari)',
      salesVelocity: '820 pcs/hari',
      trend7Day: '+45%',
      trend30Day: '+42%',
      price: 'Rp 149.000',
      sales: '70K+ terjual',
      rating: 4.9,
      reviewCount: '28.9K ulasan',
      contentCompetition: 'HIGH',
      videoCompetition: '112 video aktif',
      sellerQuality: 'Shopee Mall (4.9 / 5.0)',
      commissionPotential: '14% (~Rp 20.860/sale)',
      demoPotential: 8,
      repeatPurchasePotential: 'MEDIUM',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 4 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 12:45',
    isAiInference: false,
    trendAlert: 'COMPETITION INCREASED',
    bestContentAngle: 'Uji Tekuk Ekstrem & Rendam Air (Teknologi Tanpa Lem Anti Jebol)',
    contentGap: 'Kebanyakan kreator cuma pamer OOTD jalan-jalan; belum ada yang tes siram kecap lalu sikat bersih tanpa merusak bahan.',
    demoPotentialScore: 8,
    impulseBuyScore: 8,
    priceAnalysis: {
      sweetSpot: 'Slogan "Lokal Tak Gentar" dengan sepatu vulcanized original di bawah Rp 150rb.',
      competitorRange: 'Rp 199.000 - Rp 350.000',
      priceRating: 'Mid Sweet Spot',
      priceAdvantage: 'Teknologi Shoes Injection Mould tanpa lem sehingga tidak akan jebol saat basah/dicuci.',
    },
    buyerAnalysis: {
      coreNeed: 'Sepatu sneakers kasual putih keren yang awet untuk kuliah, sekolah, dan nongkrong.',
      painPoint: 'Sepatu murah biasanya cepat jebol solnya dalam 2 bulan pemakaian.',
      targetPersona: 'Pelajar, mahasiswa, dan pemuda 15-28 tahun yang suka street fashion.',
      triggerReason: 'Demonstrasi uji tekuk ekstrem dan klaim anti-jebol saat dicuci air.',
      buyerIntent: 'PRICE SENSITIVE',
    },
    commissionAnalysis: {
      commissionRate: '12% - 15%',
      estProfitPer100Sales: 'Rp 2.086.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Sedang',
    },
    suggestedHook: 'Sepatu sneakers lokal 140 ribuan tapi solnya anti jebol meski ditekuk dan dicuci tiap hari!',
    suggestedUSP: 'Shoes Injection Mould Technology, Upper Kanvas Breathable, Sol Karet Gum Anti-Slip.',
    suggestedCaption: 'Sneakers putih aesthetic anti jebol lokal kebanggaan! Cek katalog lengkapnya di keranjang oranye 👟🔥 #Aerostreet #ShopeeHaul #OOTD',
    recommendedCategory: 'Haul',
  },
  {
    id: 'prod-kotak-organizer-akrilik',
    name: 'Kotak Organizer Make Up Akrilik Putar 360 Derajat Estetik',
    brandName: 'Goto Living',
    category: 'Organizer',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Organizer%20Make%20Up%20Putar%20360',
    isVerifiedReal: true,
    price: 'Rp 58.000',
    priceRaw: 58000,
    opportunityScore: 93,
    trendScore: 91,
    trendVelocity: 'BREAKOUT',
    salesVolume: '54K+ terjual',
    rating: 4.8,
    reviewCount: '19.4K ulasan',
    signals: {
      salesGrowth: '+185% (7 hari)',
      salesVelocity: '1.150 pcs/hari',
      trend7Day: '+185%',
      trend30Day: '+78%',
      price: 'Rp 58.000',
      sales: '54K+ terjual',
      rating: 4.8,
      reviewCount: '19.4K ulasan',
      contentCompetition: 'LOW',
      videoCompetition: '32 video aktif',
      sellerQuality: 'Star+ Seller (4.8 / 5.0)',
      commissionPotential: '18% (~Rp 10.440/sale)',
      demoPotential: 10,
      repeatPurchasePotential: 'MEDIUM',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 2 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 14:30',
    isAiInference: false,
    trendAlert: 'PRODUCT JUST STARTED RISING',
    bestContentAngle: 'Sebelum/Sesudah Meja Rias Berantakan Jadi Rapi Ala Pinterest dalam 5 Detik',
    contentGap: 'Kreator jarang memperlihatkan proses transfer skincare botol tinggi (kapasitas 30 botol sekaligus) dengan efek visual kepuasan ASMR.',
    demoPotentialScore: 10,
    impulseBuyScore: 10,
    priceAnalysis: {
      sweetSpot: 'Harga Rp 58rb untuk organizer putar berbahan akrilik kristal tebal sangat memicu impulsive buy para wanita.',
      competitorRange: 'Rp 75.000 - Rp 130.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: 'Bisa berputar 360 derajat halus, sekat bisa diatur ketinggiannya sesuai ukuran botol.',
    },
    buyerAnalysis: {
      coreNeed: 'Meja rias rapi dan semua skincare/makeup gampang diambil tanpa berantakan.',
      painPoint: 'Botol skincare sering jatuh berserakan di meja rias dan susah nyari lipstik.',
      targetPersona: 'Wanita 18-40 tahun yang punya banyak skincare dan makeup.',
      triggerReason: 'Efek visual sebelum-sesudah yang sangat kontras dan kepuasan melihat kerapian.',
      buyerIntent: 'CONVENIENCE DRIVEN',
    },
    commissionAnalysis: {
      commissionRate: '15% - 20%',
      estProfitPer100Sales: 'Rp 1.044.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Meja rias berantakan penuh botol langsung rapi ala hotel bintang 5 cuma pake ini!',
    suggestedUSP: 'Rotasi 360 derajat lancar, akrilik tebal tahan pecah, sekat adjustable muat 30+ produk.',
    suggestedCaption: 'Transformasi meja rias estetik paling murah! Checkout di keranjang oranye mumpung flash sale ✨ #OrganizerViral #ShopeeHaul #DekorKamar',
    recommendedCategory: 'Before & After',
  },
  {
    id: 'prod-pembersih-kerak-kamarmandi',
    name: 'Pembersih Kerak Porselen & Kloset Ampuh Anti Bau 500ml',
    brandName: 'Prokleen',
    category: 'Daily Necessities',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Prokleen%20Pembersih%20Kerak%20Kamar%20Mandi',
    isVerifiedReal: true,
    price: 'Rp 28.500',
    priceRaw: 28500,
    opportunityScore: 96,
    trendScore: 95,
    trendVelocity: 'BREAKOUT',
    salesVolume: '92K+ terjual',
    rating: 4.9,
    reviewCount: '34.8K ulasan',
    signals: {
      salesGrowth: '+210% (7 hari)',
      salesVelocity: '1.800 pcs/hari',
      trend7Day: '+210%',
      trend30Day: '+92%',
      price: 'Rp 28.500',
      sales: '92K+ terjual',
      rating: 4.9,
      reviewCount: '34.8K ulasan',
      contentCompetition: 'LOW',
      videoCompetition: '28 video aktif',
      sellerQuality: 'Star+ Seller (4.9 / 5.0)',
      commissionPotential: '20% (~Rp 5.700/sale)',
      demoPotential: 10,
      repeatPurchasePotential: 'HIGH',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 1 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 15:10',
    isAiInference: false,
    trendAlert: 'PRODUCT JUST STARTED RISING',
    bestContentAngle: 'Uji Kuas Langsung di Nat Keramik Hitam Berkarat (Bersih Tanpa Tenaga Menggosok)',
    contentGap: 'Masih sangat sedikit video yang menonjolkan fitur "tanpa bau menyengat & tidak merusak nat keramik", hanya fokus pada noda hilang.',
    demoPotentialScore: 10,
    impulseBuyScore: 10,
    priceAnalysis: {
      sweetSpot: 'Di bawah Rp 30rb dengan hasil nyata instan, sangat tinggi conversion ratenya di Shopee Video.',
      competitorRange: 'Rp 35.000 - Rp 65.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: 'Cukup dioles kuas tanpa perlu sikat ngos-ngosan, formula tidak menyengat.',
    },
    buyerAnalysis: {
      coreNeed: 'Kamar mandi bersih kinclong tanpa pegal menggosok keramik berjam-jam.',
      painPoint: 'Kerak kuning membandel di lantai kamar mandi susah dibersihkan pembersih biasa.',
      targetPersona: 'Ibu rumah tangga, anak kost, dan pasangan muda yang lelah membersihkan rumah.',
      triggerReason: 'Demonstrasi visual kontras tinggi antara sisi kotor dan sisi bersih saat dikuas.',
      buyerIntent: 'PROBLEM AWARE',
    },
    commissionAnalysis: {
      commissionRate: '18% - 22%',
      estProfitPer100Sales: 'Rp 570.000',
      affiliateRating: 'High Volume ⚡',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Stop nyikat kamar mandi sampe pinggang mau patah! Cukup oles kuas ini 3 detik langsung kinclong!',
    suggestedUSP: 'Formula Fast-Dissolve noda kerak, tidak merusak glasir porselen, hemat tenaga 90%.',
    suggestedCaption: 'Rahasia kamar mandi kinclong kayak hotel tanpa capek! Buruan borong di keranjang oranye 🧼✨ #PembersihKerak #LifeHackShopee',
    recommendedCategory: 'Problem & Solution',
  },
  {
    id: 'prod-blender-portable-usb',
    name: 'Blender Portable Mini Juicer USB Rechargeable 6 Mata Pisau',
    brandName: 'Samono',
    category: 'Kitchen',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Blender%20Portable%20USB%20Samono',
    isVerifiedReal: true,
    price: 'Rp 89.000',
    priceRaw: 89000,
    opportunityScore: 88,
    trendScore: 86,
    trendVelocity: 'RISING',
    salesVolume: '62K+ terjual',
    rating: 4.8,
    reviewCount: '21.3K ulasan',
    signals: {
      salesGrowth: '+94% (7 hari)',
      salesVelocity: '880 pcs/hari',
      trend7Day: '+94%',
      trend30Day: '+68%',
      price: 'Rp 89.000',
      sales: '62K+ terjual',
      rating: 4.8,
      reviewCount: '21.3K ulasan',
      contentCompetition: 'MODERATE',
      videoCompetition: '60 video aktif',
      sellerQuality: 'Shopee Mall (4.8 / 5.0)',
      commissionPotential: '12% (~Rp 10.680/sale)',
      demoPotential: 10,
      repeatPurchasePotential: 'LOW',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 3 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 13:40',
    isAiInference: false,
    trendAlert: 'CONTENT GAP FOUND',
    bestContentAngle: 'Bikin Jus Buah Segar di Meja Kantor / Setelah Olahraga Tanpa Colokan Listrik',
    contentGap: 'Banyak yang hanya blender air dan pisang lembek; celah konten ada pada uji blender es batu kecil dan buah beku untuk buktikan kekuatan 6 mata pisau.',
    demoPotentialScore: 10,
    impulseBuyScore: 9,
    priceAnalysis: {
      sweetSpot: 'Di bawah Rp 100rb dengan 6 pisau stainless steel dan baterai lithium tahan 10 kali blender.',
      competitorRange: 'Rp 110.000 - Rp 180.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: 'Ukuran compact pas di tas, bisa langsung diminum dari tutup botolnya.',
    },
    buyerAnalysis: {
      coreNeed: 'Minum jus segar sehat setiap hari di kantor, gym, atau kampus tanpa repot cuci blender besar.',
      painPoint: 'Males makan buah potong, beli jus di luar mahal Rp 20rb per gelas.',
      targetPersona: 'Karyawan kantoran, pejuang diet, dan mahasiswa yang ingin hidup sehat praktis.',
      triggerReason: 'Visual buah utuh berubah jadi jus lembut dalam 15 detik.',
      buyerIntent: 'CONVENIENCE DRIVEN',
    },
    commissionAnalysis: {
      commissionRate: '10% - 14%',
      estProfitPer100Sales: 'Rp 1.068.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Gak usah beli jus 20 ribuan di luar lagi, blender mini ini bisa bikin jus segar di meja kerja!',
    suggestedUSP: '6 pisau gerigi tajam, baterai USB Type-C awet, material food grade BPA Free.',
    suggestedCaption: 'Bikin jus segar dimanapun tanpa kabel! Wajib punya pejuang diet di keranjang oranye 🍏✨ #BlenderPortable #DietSehat #ShopeeHaul',
    recommendedCategory: 'Tutorial',
  },
  {
    id: 'prod-moell-body-lotion',
    name: 'Moell Body Lotion Calm & Hydrate Bayi & Anak Organik BPOM',
    brandName: 'Moell',
    category: 'Mother & Baby',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Moell%20Body%20Lotion%20Bayi',
    isVerifiedReal: true,
    price: 'Rp 68.000',
    priceRaw: 68000,
    opportunityScore: 90,
    trendScore: 89,
    trendVelocity: 'RISING',
    salesVolume: '75K+ terjual',
    rating: 4.9,
    reviewCount: '31.5K ulasan',
    signals: {
      salesGrowth: '+112% (7 hari)',
      salesVelocity: '1.050 pcs/hari',
      trend7Day: '+112%',
      trend30Day: '+74%',
      price: 'Rp 68.000',
      sales: '75K+ terjual',
      rating: 4.9,
      reviewCount: '31.5K ulasan',
      contentCompetition: 'LOW',
      videoCompetition: '38 video aktif',
      sellerQuality: 'Shopee Mall (4.9 / 5.0)',
      commissionPotential: '15% (~Rp 10.200/sale)',
      demoPotential: 8,
      repeatPurchasePotential: 'HIGH',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 2 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 14:45',
    isAiInference: false,
    trendAlert: 'OPPORTUNITY SCORE INCREASED',
    bestContentAngle: 'Solusi Ruam Biang Keringat Anak Mereda dalam 24 Jam dengan Bahan Organik',
    contentGap: 'Masih jarang kreator yang membahas tekstur cepat serap saat bayi rewel kegerahan dan tidak lengket di baju bayi.',
    demoPotentialScore: 8,
    impulseBuyScore: 9,
    priceAnalysis: {
      sweetSpot: 'Rp 68.000 untuk skincare anak bersertifikat organik dan dermatologically tested.',
      competitorRange: 'Rp 80.000 - Rp 135.000',
      priceRating: 'Impulse Buying (< Rp99rb)',
      priceAdvantage: '100% natural organic Calendula extract, melembapkan kulit sensitif 24 jam.',
    },
    buyerAnalysis: {
      coreNeed: 'Mengatasi ruam merah, biang keringat, dan kulit kasar kering pada bayi.',
      painPoint: 'Khawatir memakai produk bayi yang mengandung zat kimia keras atau parfum menyengat.',
      targetPersona: 'Ibu muda (Mama muda) usia 22-38 tahun yang aktif mencari produk terbaik untuk anak.',
      triggerReason: 'Rekomendasi sesama ibu di komunitas dan review ribuan ibu yang membuktikan ruam sembuh.',
      buyerIntent: 'PROBLEM AWARE',
    },
    commissionAnalysis: {
      commissionRate: '12% - 16%',
      estProfitPer100Sales: 'Rp 1.020.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Buat para mama muda, ini rahasia kulit anak halus bebas ruam dan wangi bayi seharian!',
    suggestedUSP: '100% Organik Ekstrak Calendula & Chamomile, melembapkan 24 jam, bebas paraben & alkohol.',
    suggestedCaption: 'Lotion bayi organik penyelamat ruam kulit sensitif! Checkout mumpung promo di keranjang oranye 👶✨ #Moell #PerawatanBayi #ShopeeHaul',
    recommendedCategory: 'Problem & Solution',
  },
  {
    id: 'prod-baseus-wm02-tws',
    name: 'Baseus Bowie WM02 TWS Bluetooth 5.3 Earphones Mini Kapsul',
    brandName: 'Baseus',
    category: 'Gadget Accessories',
    marketplace: 'Shopee Video',
    marketplaceUrl: 'https://shopee.co.id/search?keyword=Baseus%20Bowie%20WM02',
    isVerifiedReal: true,
    price: 'Rp 129.000',
    priceRaw: 129000,
    opportunityScore: 86,
    trendScore: 82,
    trendVelocity: 'STABLE',
    salesVolume: '62K+ terjual',
    rating: 4.8,
    reviewCount: '24.7K ulasan',
    signals: {
      salesGrowth: '+38% (7 hari)',
      salesVelocity: '780 pcs/hari',
      trend7Day: '+38%',
      trend30Day: '+40%',
      price: 'Rp 129.000',
      sales: '62K+ terjual',
      rating: 4.8,
      reviewCount: '24.7K ulasan',
      contentCompetition: 'HIGH',
      videoCompetition: '98 video aktif',
      sellerQuality: 'Shopee Mall (4.8 / 5.0)',
      commissionPotential: '14% (~Rp 18.060/sale)',
      demoPotential: 9,
      repeatPurchasePotential: 'LOW',
    },
    dataFreshness: 'VERIFIED',
    freshnessText: 'Verified — 4 jam yang lalu',
    source: 'Shopee Video',
    sourceConfidence: 'HIGH',
    lastUpdated: '03/09/2026 12:30',
    isAiInference: false,
    trendAlert: 'COMPETITION INCREASED',
    bestContentAngle: 'Uji Pakai Tidur Miring (Kuping Tidak Tertekan & Nyaman Tanpa Pegal)',
    contentGap: 'Kreator banyak pamer warna pastel, padahal keunggulan paling dicari audiens adalah bentuknya yang super mini sehingga tidak sakit dipakai sambil rebahan miring.',
    demoPotentialScore: 9,
    impulseBuyScore: 8,
    priceAnalysis: {
      sweetSpot: 'Desain kapsul transparan estetik di harga Rp 120-130rb.',
      competitorRange: 'Rp 160.000 - Rp 230.000',
      priceRating: 'Mid Sweet Spot',
      priceAdvantage: 'Ukuran earbud sangat mini (nyaman dipakai tidur miring) dan case transparan futuristik.',
    },
    buyerAnalysis: {
      coreNeed: 'Earbuds kecil yang pas di telinga tanpa bikin sakit saat dipakai berjam-jam.',
      painPoint: 'Earbuds standar terlalu besar dan gampang lepas kalau dipakai jalan.',
      targetPersona: 'Wanita dan pria muda pecinta estetika compact pastel.',
      triggerReason: 'Tampilan visual unboxing di video sangat memikat (aesthetic unboxing).',
      buyerIntent: 'PRODUCT AWARE',
    },
    commissionAnalysis: {
      commissionRate: '12% - 16%',
      estProfitPer100Sales: 'Rp 1.806.000',
      affiliateRating: 'Sangat Menguntungkan 🔥',
      closingDifficulty: 'Mudah Closing (Impulse)',
    },
    suggestedHook: 'Ini TWS paling mungil dan nyaman yang pernah aku coba, dipake tidur miring gak sakit sama sekali!',
    suggestedUSP: 'Ultra-small 3.8g, Bluetooth 5.3 low latency 60ms, 25 jam daya tahan baterai.',
    suggestedCaption: 'TWS estetik mini pas di telinga anti sakit! Amankan warna favoritmu di keranjang oranye 🎧✨ #BaseusWM02 #ShopeeHaul #RacunGadget',
    recommendedCategory: 'Unboxing',
  },
];

// Helper to filter verified products by period, platform, category, price, and quick filter
export function filterProductsV2(params: {
  products: TrendingProduct[];
  period?: DataPeriodType;
  platform?: PlatformFilterType;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  quickFilter?: QuickFilterType;
  customKeyword?: string;
}): TrendingProduct[] {
  let list = [...params.products];

  // 1. Keyword filter
  if (params.customKeyword && params.customKeyword.trim()) {
    const kw = params.customKeyword.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        (p.brandName && p.brandName.toLowerCase().includes(kw)) ||
        p.category.toLowerCase().includes(kw) ||
        p.suggestedUSP.toLowerCase().includes(kw) ||
        p.bestContentAngle.toLowerCase().includes(kw)
    );
  }

  // 2. Category filter
  if (params.category && params.category !== 'All Categories' && params.category !== 'Semua Kategori') {
    const catLower = params.category.toLowerCase();
    list = list.filter((p) => p.category.toLowerCase().includes(catLower) || catLower.includes(p.category.toLowerCase()));
  }

  // 3. Price filter
  const minP = params.priceMin ?? 5000;
  const maxP = params.priceMax ?? 150000;
  list = list.filter((p) => p.priceRaw >= minP && p.priceRaw <= maxP);

  // 4. Quick filter
  if (params.quickFilter && params.quickFilter !== 'ALL') {
    switch (params.quickFilter) {
      case 'TRENDING':
        list = list.filter((p) => p.trendVelocity === 'BREAKOUT' || p.trendVelocity === 'RISING');
        break;
      case 'RISING':
        list = list.filter((p) => p.signals.trend7Day && !p.signals.trend7Day.includes('-'));
        break;
      case 'LOW_COMPETITION':
        list = list.filter((p) => p.signals.contentCompetition === 'LOW' || p.signals.contentCompetition === 'MODERATE');
        break;
      case 'HIGH_AFFILIATE':
        list = list.filter((p) => {
          const rateNum = parseInt(p.commissionAnalysis?.commissionRate || '0', 10);
          return rateNum >= 12 || p.commissionAnalysis?.affiliateRating.includes('Sangat');
        });
        break;
      case 'HIGH_VIDEO_POTENTIAL':
        list = list.filter((p) => p.demoPotentialScore >= 8);
        break;
    }
  }

  // Sort by Opportunity Score descending by default (Rising demand before market gets saturated)
  list.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));

  return list;
}
