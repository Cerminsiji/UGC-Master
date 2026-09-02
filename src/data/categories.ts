import { UGCTemplateCategory } from '../types';

export const UGC_CATEGORIES: UGCTemplateCategory[] = [
  {
    id: 'affiliate',
    name: 'Affiliate',
    iconName: 'ShoppingBag',
    badgeText: 'AFFILIATE',
    description: 'Format penjualan produk cepat untuk TikTok Shop & Shopee Video dengan fokus hook dan CTA keranjang kuning.',
    recommendedDuration: 30,
    defaultScenes: [
      {
        cameraAngle: 'POV / Handheld',
        visualAction: 'Kreator memegang produk dekat kamera dengan latar belakang kamar rapi, ekspresi takjub.',
        popupText: 'JANGAN BELI SEBELUM LIHAT INI!',
        soundEffect: 'Record scratch & gasp',
        dialogVO: 'Stop scrolling! Kalian wajib tahu racun baru yang lagi viral satu ini!',
        notesMood: 'Gaya teks: Bold Neon Yellow. Energi tinggi, pencahayaan studio hangat.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up',
        visualAction: 'Demonstrasi pemakaian produk secara detail dan langsung melihat hasilnya.',
        popupText: 'HASIL DALAM 1 MENIT ✨',
        soundEffect: 'Sparkle ding / Ting',
        dialogVO: 'Cuma diaplikasiin dikit aja, perubahannya langsung kelihatan nyata banget.',
        notesMood: 'Gaya teks: Minimalist Clean. Fokus tajam pada tekstur produk.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator tersenyum puas menunjukkan produk di samping wajahnya.',
        popupText: 'HARGA PROMO FLASH SALE 🔥',
        soundEffect: 'Cha-ching cash register',
        dialogVO: 'Mumpung lagi promo diskon gede di keranjang kuning, buruan checkout sebelum kehabisan!',
        notesMood: 'Gaya teks: Bouncy Pop-up. Gerakan tangan menunjuk ke kiri bawah.',
        duration: 3
      }
    ]
  },
  {
    id: 'unboxing',
    name: 'Unboxing',
    iconName: 'Package',
    badgeText: 'UNBOXING',
    description: 'Pengalaman membuka paket estetik dengan detail barang, kualitas packaging, dan first impression.',
    recommendedDuration: 30,
    defaultScenes: [
      {
        cameraAngle: 'Flat Lay / Top-down',
        visualAction: 'Kardus paket rapi di atas meja kayu estetik, cutter membelah selotip paket dengan mulus.',
        popupText: 'PAKET VIRAL AKHIRNYA SAMPAI 📦',
        soundEffect: 'Tape slicing ASMR & Whoosh',
        dialogVO: 'Akhirnya paket yang aku tunggu-tunggu selama seminggu ini nyampe juga!',
        notesMood: 'Gaya teks: Minimalist Subtitle. Pencahayaan natural soft morning sunlight.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up',
        visualAction: 'Membuka lapisan bubble wrap dan mengeluarkan box produk mewah.',
        popupText: 'PACKAGING 10/10 😍',
        soundEffect: 'Paper crinkle & Pop',
        dialogVO: 'Jujur packagingnya niat banget dan aman pol, gak ada penyok sama sekali.',
        notesMood: 'Gaya teks: Elegant Serif. Warna warm pastel.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Mencoba pertama kali dan menunjukkan produk ke lensa kamera dengan gembira.',
        popupText: 'FIRST IMPRESSION: WORTH IT!',
        soundEffect: 'Chime sparkle',
        dialogVO: 'Pas dicoba langsung kerasa kualitas premiumnya. Sangat worth it buat harga segini.',
        notesMood: 'Gaya teks: Dynamic pop. Kontras tinggi.',
        duration: 3
      }
    ]
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    iconName: 'PlaySquare',
    badgeText: 'TUTORIAL',
    description: 'Panduan langkah demi langkah cara pemakaian atau trik jitu yang mudah diikuti audiens.',
    recommendedDuration: 45,
    defaultScenes: [
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator berbicara langsung ke kamera dengan gesture tangan interaktif.',
        popupText: 'CARA MUDAH HANYA 3 STEP! 💡',
        soundEffect: 'Ding notification',
        dialogVO: 'Banyak yang nanya gimana caranya dapetin hasil maksimal kayak gini, yuk ikutin 3 langkah mudahnya.',
        notesMood: 'Gaya teks: Educational modern card. Nada bicara edukatif ramah.',
        duration: 3
      },
      {
        cameraAngle: 'Over the Shoulder / POV',
        visualAction: 'Langkah 1 & 2: Tangan menunjukkan teknik aplikasi yang benar secara runtut.',
        popupText: 'STEP 1: APLIKASIKAN MERATA',
        soundEffect: 'Click / Tap sound',
        dialogVO: 'Langkah pertama, pastikan permukaan bersih lalu aplikasikan tipis-tipis secara merata.',
        notesMood: 'Gaya teks: Step number badge. Kecepatan video 1.2x dinamis.',
        duration: 5
      },
      {
        cameraAngle: 'Close-up',
        visualAction: 'Hasil akhir yang sempurna dibandingkan dengan cara yang salah.',
        popupText: 'STEP 2: TUNGGU 5 MENIT & LIHAT!',
        soundEffect: 'Success fanfare',
        dialogVO: 'Dan hasilnya langsung rapi tanpa ribet! Jangan lupa save video ini biar gak lupa ya!',
        notesMood: 'Gaya teks: Call-to-action bookmark pill.',
        duration: 4
      }
    ]
  },
  {
    id: 'review',
    name: 'Review',
    iconName: 'MessageSquare',
    badgeText: 'REVIEW',
    description: 'Ulasan jujur produk dengan kelebihan, kekurangan, dan rekomendasi pemakaian nyata.',
    recommendedDuration: 40,
    defaultScenes: [
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Kreator memegang produk dengan ekspresi serius nan jujur.',
        popupText: 'JUJUR REVIEW SETELAH 1 BULAN 🤔',
        soundEffect: 'Bass drop thud',
        dialogVO: 'Setelah sebulan penuh aku pakai produk ini tiap hari, ini review jujur dari aku.',
        notesMood: 'Gaya teks: Bold Red/White. Suasana autentik tanpa filter berlebihan.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up B-Roll',
        visualAction: 'Kamera menyorot detail tekstur, bahan, dan pemakaian sehari-hari.',
        popupText: 'PLUS: TAHAN LAMA & PRAKTIS ✅',
        soundEffect: 'Soft swoosh',
        dialogVO: 'Poin plusnya adalah daya tahannya luar biasa dan gampang dibawa traveling.',
        notesMood: 'Gaya teks: Checklist pro/cons.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator memberikan rating bintang dan kesimpulan akhir.',
        popupText: 'RATING: 9.5 / 10 ⭐⭐⭐⭐⭐',
        soundEffect: 'Ting level up',
        dialogVO: 'Untuk kalian yang punya problem serupa, ini sangat recommended buat dicoba.',
        notesMood: 'Gaya teks: Golden Star Graphic. Kesimpulan meyakinkan.',
        duration: 4
      }
    ]
  },
  {
    id: 'komedi',
    name: 'Komedi / Sketsa',
    iconName: 'Smile',
    badgeText: 'KOMEDI / SKETSA',
    description: 'Format sketsa drama lucu & relatable yang menyelipkan solusi produk secara natural.',
    recommendedDuration: 45,
    defaultScenes: [
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Karakter A berakting panik atau dramatis menghadapi masalah konyol sehari-hari.',
        popupText: 'KETIKA DISURUH CEPAT-CEPAT 😭',
        soundEffect: 'Vine boom & Cartoon laugh',
        dialogVO: 'Waduh telat! Mana muka masih kusam, kerjaan numpuk lagi!',
        notesMood: 'Gaya teks: Meme Comic Font. Ekspresi mimik wajah over-acting lucu.',
        duration: 3
      },
      {
        cameraAngle: 'Wide Shot',
        visualAction: 'Karakter B datang membawa solusi produk dengan gaya pahlawan penyelamat.',
        popupText: 'TENANG! PAKAI INI DULU 😎',
        soundEffect: 'Heroic entrance horn / Tadaa',
        dialogVO: 'Makanya punya barang itu yang serbaguna, tinggal semprot langsung beres!',
        notesMood: 'Gaya teks: Glowing comic bubble.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up',
        visualAction: 'Karakter A lega dan tersenyum gembira, masalah langsung selesai.',
        popupText: 'SELAMAT DARI OMELAN BOS 🤣',
        soundEffect: 'Funny pop & Cha-ching',
        dialogVO: 'Wah beneran auto ganteng dalam sekejap! Beli di mana lu?',
        notesMood: 'Gaya teks: Call to action keranjang kuning.',
        duration: 3
      }
    ]
  },
  {
    id: 'daily_vlog',
    name: 'Daily Vlog',
    iconName: 'Video',
    badgeText: 'DAILY VLOG',
    description: 'Cerita keseharian estetik (Day in my life) yang menyatukan produk ke dalam rutinitas.',
    recommendedDuration: 40,
    defaultScenes: [
      {
        cameraAngle: 'Medium Wide',
        visualAction: 'Montage bangun pagi, buka gorden kamar, menyiapkan sarapan/meja kerja.',
        popupText: 'A DAY IN MY LIFE ☀️',
        soundEffect: 'Acoustic lofi beat & birds chirp',
        dialogVO: 'Temenin aku siap-siap buat produktif hari ini yuk!',
        notesMood: 'Gaya teks: Aesthetic handwritten font. Tone warna warm cozy.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up POV',
        visualAction: 'Mengkonsumsi atau menggunakan produk saat istirahat kerja.',
        popupText: 'BOOSTER ENERGI SEHARIAN ☕',
        soundEffect: 'Sip & exhale sound',
        dialogVO: 'Kunci biar tetap fokus dan gak gampang lemas selalu konsumsi ini sebelum mulai kerja.',
        notesMood: 'Gaya teks: Minimalist soft white.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator tersenyum di meja kerja sambil menunjukkan produk di dekat laptop.',
        popupText: 'LINK DI BIO / KERANJANG 🛒',
        soundEffect: 'Camera shutter click',
        dialogVO: 'Yang mau samaan rahasia produktif aku, langsung cek link di bawah ya.',
        notesMood: 'Gaya teks: Clean pill badge.',
        duration: 3
      }
    ]
  },
  {
    id: 'grwm',
    name: 'GRWM',
    iconName: 'Sparkles',
    badgeText: 'GRWM',
    description: 'Get Ready With Me: Obrolan santai sambil dandan, styling baju, atau skincare routine.',
    recommendedDuration: 50,
    defaultScenes: [
      {
        cameraAngle: 'Front Camera / Vanity Mirror',
        visualAction: 'Kreator dengan bando skincare menatap cermin sambil menyapa ramah audiens.',
        popupText: 'GRWM FOR WEEKEND DATE 💕',
        soundEffect: 'Soft pop & Makeup brush sound',
        dialogVO: 'GRWM yuk sambil aku cerita kenapa kemarin bisa ketemu cowok idaman di cafe.',
        notesMood: 'Gaya teks: Pastel aesthetic cursive. Lighting ring light lembut.',
        duration: 4
      },
      {
        cameraAngle: 'Extreme Close-up',
        visualAction: 'Mengoleskan produk ke wajah, memperlihatkan efek glowing instan.',
        popupText: 'LOOK AT THAT GLOW ✨',
        soundEffect: 'Sparkle sound / Swoosh',
        dialogVO: 'Lihat deh, teksturnya ringan banget tapi coverage-nya bikin pori-pori auto blur!',
        notesMood: 'Gaya teks: Shimmering text.',
        duration: 5
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Final look reveal dengan pose cantik dan outfit lengkap.',
        popupText: 'FINAL LOOK! SUKA BANGET 😍',
        soundEffect: 'Camera flash click / Ting',
        dialogVO: 'Gimana menurut kalian look-nya? Semua produk yang aku pake ada di keranjang kuning ya!',
        notesMood: 'Gaya teks: Heart pulse animation.',
        duration: 4
      }
    ]
  },
  {
    id: 'problem_solution',
    name: 'Problem & Solution',
    iconName: 'Zap',
    badgeText: 'PROBLEM & SOLUTION',
    description: 'Pola iklan terkuat: sorot rasa sakit / masalah spesifik audiens lalu hadirkan solusi instan.',
    recommendedDuration: 35,
    defaultScenes: [
      {
        cameraAngle: 'Close-up Frustrated',
        visualAction: 'Seseorang mengeluhkan masalah nyata (misal: rambut rontok / tagihan boncos / jerawat meradang).',
        popupText: 'PERNAH GAK SIH MERASA GINI? 😫',
        soundEffect: 'Heartbeat & Dramatic bass thud',
        dialogVO: 'Udah coba berbagai macam cara tapi masalah satu ini gak pernah kelar-kelar?',
        notesMood: 'Gaya teks: Bold Red Warning. Suasana sedikit gloomy / monokrom.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot - Transition',
        visualAction: 'Transisi snap finger / swipe cepat ke produk solusi dengan cahaya terang benderang.',
        popupText: 'INI SOLUSI RAHASIANYA! 🔑',
        soundEffect: 'Finger snap & Magic whoosh',
        dialogVO: 'Sampai akhirnya aku nemu formula ini yang beneran kerja langsung ke akar masalahnya.',
        notesMood: 'Gaya teks: Glowing Green Emerald. Suasana cerah dan penuh harapan.',
        duration: 4
      },
      {
        cameraAngle: 'Macro / Split Screen',
        visualAction: 'Memperlihatkan bukti transformasi nyata dan kemudahan pemakaian.',
        popupText: 'PROVEN RESULT DALAM 7 HARI 📈',
        soundEffect: 'Cha-ching & Upbeat bell',
        dialogVO: 'Hasilnya nyata dan terbukti aman BPOM. Langsung checkout mumpung ada garansi!',
        notesMood: 'Gaya teks: Trust badge BPOM / Halal.',
        duration: 3
      }
    ]
  },
  {
    id: 'before_after',
    name: 'Before & After',
    iconName: 'ArrowLeftRight',
    badgeText: 'BEFORE AFTER',
    description: 'Transformasi dramatis sebelum vs sesudah memakai produk yang memicu konversi tinggi.',
    recommendedDuration: 30,
    defaultScenes: [
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Bapak buncit garuk kepala sambil nelpon, ekspresi frustrasi.',
        popupText: 'DIET GAGAL MULU?!',
        soundEffect: 'Phone ring & sigh',
        dialogVO: 'Diet gagal mulu, pusing!',
        notesMood: 'Gaya teks: Chat Bubble. Pencahayaan redup dramatis.',
        duration: 2
      },
      {
        cameraAngle: 'Close-up',
        visualAction: 'Menunjukkan kemasan Sago Green Coffee ke kamera.',
        popupText: 'SAGO GREEN COFFEE',
        soundEffect: 'Swoosh',
        dialogVO: 'Untung nemu ini.',
        notesMood: 'Gaya teks: Dynamic Bouncy. Fokus terang pada produk.',
        duration: 2
      },
      {
        cameraAngle: 'POV / Medium Shot',
        visualAction: 'Menyeduh sachet kopi hijau dengan air panas, aroma mengepul nikmat.',
        popupText: 'RASA ENAK & BIKIN KENYANG ☕',
        soundEffect: 'Pouring water & Stirring cup',
        dialogVO: 'Tiap pagi tinggal seduh, rasanya enak dan nafsu makan auto terkontrol.',
        notesMood: 'Gaya teks: Warm clean caption. Efek uap estetik.',
        duration: 3
      },
      {
        cameraAngle: 'Wide Shot',
        visualAction: 'Bapak tampil bugar, mengenakan kaos pas badan dengan senyum percaya diri.',
        popupText: 'TURUN 8 KG LEBIH SEGAR! 💪',
        soundEffect: 'Success chime & Cha-ching',
        dialogVO: 'Sekarang perut buncit kempes dan badan enteng. Cobain deh di keranjang kuning!',
        notesMood: 'Gaya teks: Green energetic badge. CTA tombol beli.',
        duration: 3
      }
    ]
  },
  {
    id: 'life_hacks',
    name: 'Life Hacks',
    iconName: 'Lightbulb',
    badgeText: 'LIFE HACKS',
    description: 'Trik rahasia atau cara cerdas yang jarang orang tahu untuk mempermudah hidup.',
    recommendedDuration: 30,
    defaultScenes: [
      {
        cameraAngle: 'POV Eye-Level',
        visualAction: 'Tangan mendemonstrasikan trik cerdas yang belum pernah terpikirkan sebelumnya.',
        popupText: 'RAHASIA YANG GAK DIKASIH TAHU TOKO! 🤫',
        soundEffect: 'Whisper sound & Mystery chime',
        dialogVO: 'Kebanyakan orang gak tahu trik rahasia ini buat bikin barang jadi 10x lebih awet!',
        notesMood: 'Gaya teks: Secret file alert. Kecepatan transisi snappy.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Menunjukkan teknik mudah dengan produk yang menyelesaikan masalah rumit dalam 3 detik.',
        popupText: 'HACK: CUKUP TEMPEL DI SINI ⚡',
        soundEffect: 'Click snap & Ting',
        dialogVO: 'Kalian cukup aplikasikan di bagian ini, dan lihat apa yang terjadi.',
        notesMood: 'Gaya teks: Yellow hazard tag.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Hasil luar biasa memukau, kreator memberi jempol ke kamera.',
        popupText: 'SAVE & SHARE KE TEMENMU! 📌',
        soundEffect: 'Like & Bell sound',
        dialogVO: 'Gampang banget kan? Save video ini sebelum dihapus ya!',
        notesMood: 'Gaya teks: Bookmark CTA.',
        duration: 3
      }
    ]
  },
  {
    id: 'asmr',
    name: 'ASMR / Satisfying',
    iconName: 'Headphones',
    badgeText: 'ASMR / SATISFYING',
    description: 'Fokus pada suara renyah (tapping, peeling, pouring) yang menenangkan dan visual satisfying.',
    recommendedDuration: 30,
    defaultScenes: [
      {
        cameraAngle: 'Macro Extreme Close-up',
        visualAction: 'Kuku mengetuk perlahan permukaan box kemasan dengan mikrofon dekat.',
        popupText: 'WEAR HEADPHONES 🎧 (ASMR)',
        soundEffect: 'Gentle box tapping ASMR',
        dialogVO: '(Suara bisikan lembut) Dengarkan suara ini...',
        notesMood: 'Gaya teks: Soft glowing cursive. Lighting studio moody cinematic.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Angle 45°',
        visualAction: 'Mengelupas segel plastik secara perlahan dan memuaskan (peeling satisfaction).',
        popupText: 'SATISFYING PEELING SOUND ✨',
        soundEffect: 'Crisp plastic peel sound',
        dialogVO: '(Tanpa suara bicara - murni sound effect satisfying)',
        notesMood: 'Gaya teks: Minimalist corner badge.',
        duration: 4
      },
      {
        cameraAngle: 'Flat Lay Top-down',
        visualAction: 'Menuang cairan atau menekan pompa produk dengan tekstur creamy yang estetik.',
        popupText: 'SO CRISP & CLEAN 🧼',
        soundEffect: 'Pump squirt & Squish sound',
        dialogVO: 'Tekstur dan aromanya bikin nagih banget. Link ada di keranjang ya.',
        notesMood: 'Gaya teks: Elegant white subtitle.',
        duration: 3
      }
    ]
  },
  {
    id: 'haul',
    name: 'Haul',
    iconName: 'ShoppingBag',
    badgeText: 'HAUL',
    description: 'Memamerkan beberapa barang belanjaan dalam satu video dengan rating dan rekomendasi.',
    recommendedDuration: 45,
    defaultScenes: [
      {
        cameraAngle: 'Wide Shot',
        visualAction: 'Kreator duduk di lantai dikelilingi banyak kantong belanjaan / kardus paket.',
        popupText: 'HAUL BELANJAAN UNDER 100K 🛍️',
        soundEffect: 'Shopping mall chime & Upbeat beat',
        dialogVO: 'Racun belanjaan minggu ini under 100 ribu tapi dapet barang se-mewah ini!',
        notesMood: 'Gaya teks: Colorful shopping tags. High energy & vibrant.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Menunjukkan barang ke-1 dan ke-2 dengan fit check / fungsi langsung.',
        popupText: 'ITEM 1: KUALITAS BUTIK BANGET 👗',
        soundEffect: 'Camera shutter & Pop',
        dialogVO: 'Item pertama ini bahannya jatuh banget, gak nerawang dan jahitannya rapi pol.',
        notesMood: 'Gaya teks: Price tag overlay Rp 49.000.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Pilihan favorit utama dan memberikan rekap semua nomor keranjang.',
        popupText: 'SEMUA LINK DI BIO NO 1-5 🛒',
        soundEffect: 'Cha-ching jackpot',
        dialogVO: 'Favorit kalian yang nomor berapa nih? Langsung komen di bawah ya!',
        notesMood: 'Gaya teks: Numbered list CTA.',
        duration: 3
      }
    ]
  }
];

export const CAMERA_ANGLE_PRESETS = [
  'Medium Shot',
  'Close-up',
  'Wide Shot',
  'POV / Handheld',
  'Over the Shoulder',
  'Flat Lay / Top-down',
  'Extreme Close-up',
  'Bird\'s Eye View',
  'Low Angle',
  'Dutch Angle',
  'Panning / Tracking'
];

export const SFX_PRESETS = [
  'Phone ring & sigh',
  'Swoosh / Whoosh',
  'Cha-ching / Cash Register',
  'Ding / Bell Ting',
  'Vine boom / Bass drop',
  'Pop sound / Bubble',
  'Record scratch',
  'Paper crinkle / ASMR',
  'Finger snap',
  'Camera shutter click',
  'Dramatic hit / Thud',
  'Applause / Cheer',
  'Typing keyboard',
  'Magic sparkle'
];

export const MOOD_PRESETS = [
  'Gaya teks: Chat Bubble. Pencahayaan redup dramatis.',
  'Gaya teks: Dynamic Bouncy. Fokus terang pada produk.',
  'Gaya teks: Bold Neon Yellow. Energi tinggi, pencahayaan studio hangat.',
  'Gaya teks: Minimalist Clean. Fokus tajam pada tekstur produk.',
  'Gaya teks: Meme Comic Font. Ekspresi mimik wajah over-acting lucu.',
  'Gaya teks: Aesthetic handwritten font. Tone warna warm cozy.',
  'Gaya teks: Pastel aesthetic cursive. Lighting ring light lembut.',
  'Gaya teks: Shimmering text. Tone mewah elegan.',
  'Gaya teks: Glowing Green Emerald. Suasana cerah dan penuh harapan.',
  'Gaya teks: Soft glowing cursive. Lighting studio moody cinematic.'
];
