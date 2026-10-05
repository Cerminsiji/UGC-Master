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
        visualAction: 'Kreator memegang produk dekat kamera dengan latar belakang kamar rapi, ekspresi takjub dan penasaran.',
        popupText: 'JANGAN BELI SEBELUM LIHAT INI! 🛑',
        soundEffect: 'Record scratch & gasp',
        dialogVO: 'Stop scrolling! Kalian wajib tahu kenapa barang satu ini lagi viral banget di mana-mana!',
        notesMood: 'Gaya teks: Bold Neon Yellow. Energi tinggi, pencahayaan studio hangat.',
        duration: 2
      },
      {
        cameraAngle: 'Close-up B-Roll',
        visualAction: 'Tangan memperlihatkan tekstur produk, segel asli, dan logo BPOM resmi.',
        popupText: 'KUALITAS BUKAN ABAL-ABAL ✨',
        soundEffect: 'Swoosh & sparkle chime',
        dialogVO: 'Awalnya aku skeptis karena harganya murah, tapi pas pegang langsung kerasa kualitas bahannya premium pol.',
        notesMood: 'Gaya teks: Minimalist Clean. Fokus tajam pada detail fisik produk.',
        duration: 3
      },
      {
        cameraAngle: 'Over the Shoulder / POV',
        visualAction: 'Demonstrasi pemakaian produk secara langsung, memperlihatkan kemudahan penggunaan.',
        popupText: 'HASIL DALAM 1 MENIT 😍',
        soundEffect: 'Tape slicing crisp & Ting',
        dialogVO: 'Cukup dipakai dikit aja secara merata, langsung kelihatan perubahannya tanpa ribet.',
        notesMood: 'Gaya teks: Dynamic Bouncy. Transisi cepat snap finger.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Kreator menunjukkan hasil nyata di depan cermin atau layar dengan senyum puas.',
        popupText: 'SUDAH BPOM & AMAN 100% ✅',
        soundEffect: 'Bell counter ding',
        dialogVO: 'Pantas aja review-nya udah ribuan bintang lima, beneran ngebantu banget buat sehari-hari.',
        notesMood: 'Gaya teks: Green Trust Badge. Ekspresi meyakinkan.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator tersenyum memegang produk sambil menunjuk ke arah kiri bawah layar.',
        popupText: 'PROMO FLASH SALE + FREE ONGKIR 🔥',
        soundEffect: 'Cha-ching cash register & Applause',
        dialogVO: 'Mumpung lagi promo diskon gede dan ada gratis ongkir, langsung amankan di keranjang kuning ya!',
        notesMood: 'Gaya teks: CTA Yellow Pulsing. Panah mengarah ke keranjang.',
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
        soundEffect: 'Tape slicing crisp & Fast whoosh',
        dialogVO: 'Akhirnya paket yang udah aku tungguin seminggu ini sampai juga di rumah!',
        notesMood: 'Gaya teks: Minimalist Subtitle. Pencahayaan natural soft morning sunlight.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Membuka lapisan bubble wrap tebal dan mengeluarkan kotak kemasan mewah dengan perlahan.',
        popupText: 'PACKAGING 10/10 RAPI BANGET 😍',
        soundEffect: 'Paper crinkle ASMR & Bubble pop',
        dialogVO: 'Jujur packagingnya niat banget, bubble wrap tebal dan sama sekali gak ada penyok.',
        notesMood: 'Gaya teks: Elegant Serif. Warna warm pastel.',
        duration: 3
      },
      {
        cameraAngle: 'Extreme Close-up',
        visualAction: 'Membuka segel kotak produk dan memperlihatkan isi produk pertama kali dari dekat.',
        popupText: 'FIRST LOOK: MEWAH POL! ✨',
        soundEffect: 'Sparkle magic ting & Sachet tear',
        dialogVO: 'Begitu dibuka, aromanya langsung wangi dan finishing produknya kelihatan mahal.',
        notesMood: 'Gaya teks: Shimmering Gold Caption. Efek lighting pantulan estetik.',
        duration: 3
      },
      {
        cameraAngle: 'POV / Handheld',
        visualAction: 'Mencoba tes produk pertama kali (swatch tekstur / menyalakan gadget / mencocokkan outfit).',
        popupText: 'SESUAI EKSPEKTASI BANGET 🔥',
        soundEffect: 'Click snap & Level up victory',
        dialogVO: 'Pas dicoba langsung bekerja sempurna, persis kayak yang sering seliweran di FYP.',
        notesMood: 'Gaya teks: Checklist checklist badge.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator memegang box dan produk sambil memberikan jempol puas ke lensa kamera.',
        popupText: 'WORTH IT BUAT DIBELI! LINK DI BIO 🛒',
        soundEffect: 'Cha-ching cash register',
        dialogVO: 'Buat harga under 100 ribu ini worth it pol! Link belinya udah aku taruh di keranjang ya.',
        notesMood: 'Gaya teks: Dynamic Pop CTA.',
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
        visualAction: 'Kreator berbicara langsung ke kamera dengan gesture tangan interaktif menghentikan scrolling audiens.',
        popupText: 'JANGAN SALAH PAKAI! IKUTI 3 STEP INI 💡',
        soundEffect: 'Ding notification & Swoosh',
        dialogVO: 'Banyak yang salah pakai produk ini makanya hasilnya gak maksimal. Sini aku ajarin 3 langkah benarnya!',
        notesMood: 'Gaya teks: Educational modern card. Nada bicara edukatif ramah.',
        duration: 3
      },
      {
        cameraAngle: 'Over the Shoulder / POV',
        visualAction: 'Langkah 1: Menunjukkan takaran pemakaian yang tepat dan membersihkan permukaan.',
        popupText: 'STEP 1: TAKARAN CUKUP 2-3 TETES',
        soundEffect: 'Cream squeeze squish & Ting',
        dialogVO: 'Langkah pertama, jangan kebanyakan. Cukup 2 sampai 3 tetes aja udah meng-cover seluruh area.',
        notesMood: 'Gaya teks: Step badge number 1.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Langkah 2: Tangan memperagakan gerakan memijat atau meratakan searah jarum jam.',
        popupText: 'STEP 2: RATAKAN PERLAHAN',
        soundEffect: 'Soft whoosh & Water swirl',
        dialogVO: 'Langkah kedua, ratakan secara memutar perlahan sampai benar-benar meresap sempurna.',
        notesMood: 'Gaya teks: Step badge number 2. Video speed 1.1x dinamis.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up B-Roll',
        visualAction: 'Langkah 3 / Rahasia Pro Tip: Memberikan tips trik tambahan yang jarang orang tahu.',
        popupText: 'STEP 3: RAHASIA TAHAN SEHARIAN 🤫',
        soundEffect: 'Whisper sound & Level up chime',
        dialogVO: 'Pro tip: tunggu 3 menit sebelum lanjut ke tahap berikutnya biar efeknya tahan seharian penuh.',
        notesMood: 'Gaya teks: Golden Tip alert.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Hasil akhir yang sempurna dibandingkan dengan cara yang salah, kreator tersenyum riang.',
        popupText: 'HASILNYA AUTO MAKSIMAL! SAVE YA 📌',
        soundEffect: 'Success fanfare & Cha-ching',
        dialogVO: 'Lihat hasilnya, langsung mulus dan rapi kan? Jangan lupa save video ini biar gak lupa ya!',
        notesMood: 'Gaya teks: Bookmark CTA pill.',
        duration: 3
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
        visualAction: 'Kreator memegang produk dengan ekspresi serius nan jujur tanpa filter lebay.',
        popupText: 'JUJUR REVIEW SETELAH 30 HARI 🤔',
        soundEffect: 'Dramatic bass drop & Dun dun dun',
        dialogVO: 'Setelah sebulan penuh aku pakai produk viral ini tiap hari, ini review jujur tanpa endorse.',
        notesMood: 'Gaya teks: Bold Red/White. Suasana autentik dan kredibel.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up B-Roll',
        visualAction: 'Kamera menyorot detail tekstur, formula, dan hasil pemakaian nyata di hari ke-1 vs hari ke-30.',
        popupText: 'KELEBIHAN: CEPAT MERESAP & RINGAN ✅',
        soundEffect: 'Sparkle magic ting',
        dialogVO: 'Poin plus pertamanya, dia cepet banget meresap dan gak bikin greasy sama sekali.',
        notesMood: 'Gaya teks: Green Pro Checklist.',
        duration: 4
      },
      {
        cameraAngle: 'POV Handheld',
        visualAction: 'Menunjukkan sedikit catatan atau minus kecil agar review terkesan sangat objektif dan terpercaya.',
        popupText: 'CATATAN: WANGINYA SOFT, GAK MENYENGAT ℹ️',
        soundEffect: 'Record scratch freeze',
        dialogVO: 'Cuma ada satu catatan: wanginya soft banget, jadi buat kalian yang suka wangi strong mungkin perlu adaptasi.',
        notesMood: 'Gaya teks: Neutral Grey Notice.',
        duration: 3
      },
      {
        cameraAngle: 'Macro Split-Screen',
        visualAction: 'Memperlihatkan perbandingan sebelum dan sesudah dengan foto dokumentasi hari ke-1.',
        popupText: 'HASILNYA NYATA DALAM 4 MINGGU 📈',
        soundEffect: 'Level up victory chime',
        dialogVO: 'Tapi dari segi hasil dan efektivitas, ini salah satu pembelian terbaik aku tahun ini.',
        notesMood: 'Gaya teks: Comparison Chart overlay.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator memberikan rating bintang dan kesimpulan akhir yang meyakinkan.',
        popupText: 'FINAL RATING: 9.8 / 10 ⭐⭐⭐⭐⭐',
        soundEffect: 'Cha-ching cash register & Ting',
        dialogVO: 'Overall aku kasih nilai 9.8 dari 10. Yang mau coba, checkout selagi masih ada diskon di bawah ya!',
        notesMood: 'Gaya teks: Golden Star Graphic. CTA tombol beli.',
        duration: 3
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
        visualAction: 'Karakter A berakting panik di depan cermin menghadapi masalah konyol sehari-hari sebelum berangkat.',
        popupText: 'KETIKA DISURUH BURU-BURU BERANGKAT 😭',
        soundEffect: 'Vine boom & Cartoon laugh',
        dialogVO: 'Aduh gawat telat! Mana muka kusam, rambut lepek, kerjaan numpuk lagi!',
        notesMood: 'Gaya teks: Meme Comic Font. Ekspresi mimik wajah over-acting lucu.',
        duration: 3
      },
      {
        cameraAngle: 'Wide Shot',
        visualAction: 'Karakter B tiba-tiba muncul dari balik pintu membawa produk penyelamat dengan gaya pahlawan.',
        popupText: 'TENANG! PAKAI SENJATA RAHASIA INI 😎',
        soundEffect: 'Heroic fanfare / Tadaa & Swoosh',
        dialogVO: 'Makanya jangan panik dulu! Nih cobain senjata andalan gue yang serba sat-set!',
        notesMood: 'Gaya teks: Glowing comic bubble superhero.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up POV',
        visualAction: 'Karakter A mengaplikasikan produk secara kilat dengan efek suara komedi cepat.',
        popupText: 'CUMA BUTUH 10 DETIK AJA ⚡',
        soundEffect: 'Fast whip whoosh & Bubble pop',
        dialogVO: 'Tinggal semprot dan usap dikit doang, gak nyampe semenit langsung seger!',
        notesMood: 'Gaya teks: Fast motion countdown overlay.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Karakter A kaget menatap cermin, ekspresi terkesima dan tersenyum percaya diri.',
        popupText: 'MUKA AUTO SEGAR TANPA OMELEAN BOS 🤣',
        soundEffect: 'Heavenly choir sound & Ting',
        dialogVO: 'Buset! Beneran auto glowing sekejap mata! Kok bisa seampuh ini dah?!',
        notesMood: 'Gaya teks: Comic shock jaw-drop.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot Karakter Berdua',
        visualAction: 'Karakter A dan B tos tangan, lalu kompak menunjuk ke keranjang kuning sambil tertawa.',
        popupText: 'BELI SEBELUM KEHABISAN DI BAWAH YA 🛒',
        soundEffect: 'Cha-ching cash register & Air horn blast',
        dialogVO: 'Beli di keranjang kuning lah! Buruan checkout sebelum teman kantor lu pada ikutan borong!',
        notesMood: 'Gaya teks: Bouncy comic CTA.',
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
        cameraAngle: 'Medium Wide Shot',
        visualAction: 'Montage estetik bangun pagi, membuka tirai jendela, cahaya matahari pagi masuk ke kamar.',
        popupText: 'A PRODUCTIVE DAY IN MY LIFE ☀️',
        soundEffect: 'Acoustic lofi beat & Birds chirp',
        dialogVO: 'Temenin aku siap-siap buat ngejalanin hari yang super padat hari ini yuk.',
        notesMood: 'Gaya teks: Aesthetic handwritten font. Tone warna warm cozy.',
        duration: 3
      },
      {
        cameraAngle: 'POV / Close-up',
        visualAction: 'Menyiapkan meja kerja, membuka laptop, dan mengambil produk dari dalam tas jinjing rapi.',
        popupText: 'STARTER PACK WAJIB TIAP HARI 💼',
        soundEffect: 'Bag zipper & Gentle tap sound',
        dialogVO: 'Kunci biar energiku gak drop dari pagi sampai sore adalah selalu bawa barang ini di tas.',
        notesMood: 'Gaya teks: Clean Minimalist Pill.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Mengkonsumsi atau menggunakan produk saat istirahat kerja dengan ekspresi santai dan rileks.',
        popupText: 'BOOSTER ENERGI SEHARIAN ☕',
        soundEffect: 'Pouring water swirl & Exhale breath',
        dialogVO: 'Rasanya enak, bikin mood langsung balik lagi dan fokus kerja jadi makin maksimal.',
        notesMood: 'Gaya teks: Soft glowing white caption.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator menyelesaikan pekerjaan dengan senyum puas dan membereskan meja kerja.',
        popupText: 'TETAP SEGAR SAMPAI MALAM ✨',
        soundEffect: 'Camera shutter & Ting',
        dialogVO: 'Udah jam 5 sore tapi badan tetap enteng dan muka gak kuyu sama sekali.',
        notesMood: 'Gaya teks: Golden hour aesthetic overlay.',
        duration: 3
      },
      {
        cameraAngle: 'POV Menunjuk Produk',
        visualAction: 'Kamera menyorot produk di samping kopi estetik, jempol kreator menunjuk keranjang.',
        popupText: 'LINK KERANJANG KUNING NO 1 YA 🛒',
        soundEffect: 'Cha-ching cash register & Bell ding',
        dialogVO: 'Yang mau samaan rahasia produktif aku, link-nya udah aku simpan di keranjang kuning ya.',
        notesMood: 'Gaya teks: Minimalist cozy CTA.',
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
        visualAction: 'Kreator mengenakan bando lucu menatap cermin rias sambil menyapa ramah audiens.',
        popupText: 'GRWM FOR WEEKEND DATE 💕',
        soundEffect: 'Makeup brush sound & Soft pop',
        dialogVO: 'GRWM yuk sambil aku spill rahasia kenapa makeup-ku bisa tahan seharian gak luntur!',
        notesMood: 'Gaya teks: Pastel aesthetic cursive. Lighting ring light lembut.',
        duration: 3
      },
      {
        cameraAngle: 'Extreme Close-up',
        visualAction: 'Kamera menyorot tekstur produk di punggung tangan sebelum diaplikasikan ke wajah.',
        popupText: 'TEKSTURNYA RINGAN & CEPAT BLUR ✨',
        soundEffect: 'Cream squeeze squish & Swoosh',
        dialogVO: 'Kalian lihat deh teksturnya, watery banget dan pas dibaurkan langsung nge-blur pori-pori.',
        notesMood: 'Gaya teks: Shimmering Dewy Text.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up 45° Angle',
        visualAction: 'Meratakan produk ke kulit wajah, memperlihatkan perbedaan setengah wajah sebelum vs sesudah.',
        popupText: 'HALF FACE COMPARISON 😱',
        soundEffect: 'Sparkle magic ting & Gasp',
        dialogVO: 'Ini bagian yang udah dipakein dan ini yang belum. Kelihatan banget bedanya, glowing natural!',
        notesMood: 'Gaya teks: Split side comparison line.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Melengkapi look dengan lip tint dan aksesoris, pose cantik di depan cermin.',
        popupText: 'FINISHING TOUCH: FRESH LOOK 💄',
        soundEffect: 'Camera flash click & Ting',
        dialogVO: 'Tinggal tambah lip tint dikit, look-nya langsung fresh dan flawless seharian.',
        notesMood: 'Gaya teks: Heart pulse animation.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Final reveal outfit lengkap dengan senyum memikat, menunjukkan produk ke kamera.',
        popupText: 'SEMUA PRODUK DI KERANJANG KUNING 🛒',
        soundEffect: 'Cha-ching cash register & Cheer',
        dialogVO: 'Gimana look hari ini? Produk yang aku pakai ada di keranjang kuning mumpung ready stock ya!',
        notesMood: 'Gaya teks: Romantic soft CTA.',
        duration: 3
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
        visualAction: 'Seseorang mengeluhkan masalah nyata (misal: perut buncit / jerawat meradang / kulit kusam), ekspresi lelah.',
        popupText: 'PERNAH GAK SIH MERASA GINI? 😫',
        soundEffect: 'Heartbeat thud tension & Dramatic bass',
        dialogVO: 'Udah coba berbagai macam cara tapi masalah satu ini gak pernah ada ujungnya?',
        notesMood: 'Gaya teks: Bold Red Warning. Suasana redup dramatis.',
        duration: 2
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Menunjukkan rasa frustrasi saat mencoba solusi lama yang gagal atau bikin boncos.',
        popupText: 'BUANG UANG & WAKTU SIA-SIA 💸',
        soundEffect: 'Record scratch freeze & Sigh',
        dialogVO: 'Habis jutaan rupiah tapi hasilnya nihil, malah bikin frustrasi sendiri.',
        notesMood: 'Gaya teks: Crossed-out text red.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot - Transition',
        visualAction: 'Transisi snap finger cepat ke produk solusi dengan cahaya studio terang benderang.',
        popupText: 'SAMPAI AKHIRNYA NEMU INI! 🔑',
        soundEffect: 'Finger snap click & Heroic fanfare',
        dialogVO: 'Sampai akhirnya temanku nyaranin formula ini yang langsung bekerja ke akar masalahnya.',
        notesMood: 'Gaya teks: Glowing Green Emerald. Suasana cerah penuh harapan.',
        duration: 3
      },
      {
        cameraAngle: 'Macro / Split Screen',
        visualAction: 'Memperlihatkan bukti transformasi nyata dan kemudahan pemakaian sehari-hari.',
        popupText: 'HASIL NYATA DALAM 7 HARI 📈',
        soundEffect: 'Sparkle magic ting & Level up victory',
        dialogVO: 'Cuma dalam 7 hari pemakaian rutin, perubahannya nyata banget dan badan jadi jauh lebih enteng.',
        notesMood: 'Gaya teks: Trust badge BPOM / Halal certified.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Talent tersenyum bangga memegang produk dengan gestur mengajak checkout.',
        popupText: 'GARANSI UANG KEMBALI + DISKON 🛒',
        soundEffect: 'Cha-ching cash register & Applause',
        dialogVO: 'Ada garansi uang kembali juga lho. Buruan checkout di keranjang kuning sebelum harganya naik!',
        notesMood: 'Gaya teks: Urgent CTA Flash Sale.',
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
    recommendedDuration: 35,
    defaultScenes: [
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Bapak bertubuh buncit garuk kepala sambil nelpon di depan cermin, kancing baju meregang sempit.',
        popupText: 'DIET GAGAL MULU, BAJU GAK MUAT?! 😫',
        soundEffect: 'Phone ring & sigh',
        dialogVO: 'Diet gagal mulu, kancing kemeja pada lepas, pusing!',
        notesMood: 'Gaya teks: Chat Bubble. Pencahayaan redup dramatis.',
        duration: 2
      },
      {
        cameraAngle: 'Close-up Frustrated',
        visualAction: 'Bapak menatap timbangan digital dengan ekspresi lelah dan putus asa.',
        popupText: 'COBAIN DIET EKSTREM MALAH LEMAS 😭',
        soundEffect: 'Record scratch freeze & Dramatic dun dun dun',
        dialogVO: 'Udah coba nahan makan seharian malah maag kambuh dan badan lemas gak bertenaga.',
        notesMood: 'Gaya teks: Warning Red tag. Nuansa murung.',
        duration: 2
      },
      {
        cameraAngle: 'Close-up B-Roll',
        visualAction: 'Menunjukkan kemasan Sago Green Coffee sachet praktis di tangan dengan latar cerah.',
        popupText: 'UNTUNG NEMU SAGO GREEN COFFEE ☕',
        soundEffect: 'Swoosh & sparkle chime',
        dialogVO: 'Untung temen kantor ngenalin kopi hijau alami ini yang praktis tinggal seduh.',
        notesMood: 'Gaya teks: Dynamic Bouncy. Fokus tajam pada produk.',
        duration: 2
      },
      {
        cameraAngle: 'POV / Medium Shot',
        visualAction: 'Menyeduh sachet kopi hijau dengan air panas, aroma mengepul nikmat diaduk dengan sendok.',
        popupText: 'RASA ENAK & BIKIN KENYANG TAHAN LAMA 😋',
        soundEffect: 'Pouring water swirl & Stirring cup ting',
        dialogVO: 'Tiap pagi tinggal seduh, rasanya enak gak pahit, dan nafsu makan auto terkontrol seharian.',
        notesMood: 'Gaya teks: Warm clean caption. Efek uap estetik.',
        duration: 3
      },
      {
        cameraAngle: 'Wide Shot',
        visualAction: 'Bapak tampil bugar dan percaya diri, mengenakan kaos pas badan dengan perut kempes rata.',
        popupText: 'TURUN 8 KG PERUT KEMPES! 💪',
        soundEffect: 'Level up victory chime & Bell ding',
        dialogVO: 'Sekarang lingkar pinggang susut 8 cm, badan jauh lebih enteng dan segar!',
        notesMood: 'Gaya teks: Green energetic transformation badge.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Bapak tersenyum memegang produk sambil menunjuk ke keranjang kuning di kiri bawah.',
        popupText: 'PROMO BELI 2 GRATIS 1 + FREE ONGKIR 🛒',
        soundEffect: 'Cha-ching cash register & Applause',
        dialogVO: 'Cobain deh di keranjang kuning mumpung ada promo beli 2 gratis 1 dan gratis ongkir!',
        notesMood: 'Gaya teks: Flashing yellow CTA button.',
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
        visualAction: 'Tangan mendemonstrasikan trik cerdas yang belum pernah terpikirkan sebelumnya di depan kamera.',
        popupText: 'RAHASIA YANG GAK DIKASIH TAHU TOKO! 🤫',
        soundEffect: 'Whisper sound & Mystery chime',
        dialogVO: 'Kebanyakan orang gak tahu trik rahasia ini buat bikin barang jadi 10x lebih awet!',
        notesMood: 'Gaya teks: Secret file alert. Kecepatan transisi snappy.',
        duration: 2
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Menunjukkan kesalahan fatal yang selama ini dilakukan 90% orang.',
        popupText: 'JANGAN PERNAH LAKUKAN INI ❌',
        soundEffect: 'Wah-wah fail horn & Record scratch',
        dialogVO: 'Kalo kalian masih pakai cara lama ini, siap-siap barang kalian cepat rusak.',
        notesMood: 'Gaya teks: Red cross warning.',
        duration: 3
      },
      {
        cameraAngle: 'POV Handheld',
        visualAction: 'Menunjukkan teknik mudah dengan produk yang menyelesaikan masalah rumit dalam 3 detik.',
        popupText: 'HACK: CUKUP PASANG DI SINI ⚡',
        soundEffect: 'Click snap & Fast whip whoosh',
        dialogVO: 'Kalian cukup pasang alat kecil ini di bagian sudut, dan lihat keajaibannya.',
        notesMood: 'Gaya teks: Yellow hazard tag.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Detail',
        visualAction: 'Hasil luar biasa memukau, perbandingan sebelum dan sesudah trik diaplikasikan.',
        popupText: 'HASILNYA 10X LEBIH KUAT & RAPI 😍',
        soundEffect: 'Sparkle magic ting & Ting',
        dialogVO: 'Lihat, jadi rapi banget dan hemat jutaan rupiah dari biaya servis!',
        notesMood: 'Gaya teks: Clean success badge.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator memberi jempol ke kamera sambil menunjukkan kemasan produk yang murah meriah.',
        popupText: 'SAVE & SHARE KE TEMENMU! 📌',
        soundEffect: 'Cha-ching cash register & Bell ding',
        dialogVO: 'Gampang banget kan? Save video ini dan checkout alatnya di keranjang kuning ya!',
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
        visualAction: 'Kuku mengetuk perlahan permukaan box kemasan dengan mikrofon dekat menghasilkan suara renyah.',
        popupText: 'WEAR HEADPHONES 🎧 (ASMR TAPPING)',
        soundEffect: 'Gentle box tapping ASMR & Crisp click',
        dialogVO: '(Suara bisikan lembut) Pasang headset kalian... dengarkan suara ini...',
        notesMood: 'Gaya teks: Soft glowing cursive. Lighting studio moody cinematic.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Angle 45°',
        visualAction: 'Mengelupas segel plastik secara perlahan dan memuaskan (peeling satisfaction).',
        popupText: 'SATISFYING PLASTIC PEELING ✨',
        soundEffect: 'Crisp plastic peel sound & Soft swoosh',
        dialogVO: '(Tanpa suara bicara - murni sound effect peeling renyah)',
        notesMood: 'Gaya teks: Minimalist corner badge.',
        duration: 3
      },
      {
        cameraAngle: 'Close-up Sachet / Bottle',
        visualAction: 'Merobek sachet atau membuka tutup botol dengan suara klik renyah di depan mikrofon.',
        popupText: 'CRISP SACHET TEAR ✂️',
        soundEffect: 'Sachet tear crisp & Paper crinkle ASMR',
        dialogVO: '(Suara bisikan pelan) Wanginya langsung semerbak...',
        notesMood: 'Gaya teks: Floating soft text.',
        duration: 3
      },
      {
        cameraAngle: 'Flat Lay Top-down',
        visualAction: 'Menuang cairan atau menekan pompa produk dengan tekstur creamy yang sangat memuaskan.',
        popupText: 'CREAMY TEXTURE SQUISH 🧼',
        soundEffect: 'Cream squeeze squish & Pouring water swirl',
        dialogVO: '(Suara desah puas lembut) Teksturnya beneran se-smooth ini...',
        notesMood: 'Gaya teks: Elegant white subtitle.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Kreator tersenyum tenang memegang produk dengan gestur damai menunjuk ke bawah.',
        popupText: 'SO CRISP & CLEAN! LINK DI KERANJANG 🛒',
        soundEffect: 'Bell counter ding & Sparkle magic ting',
        dialogVO: 'Sensasi relaksasi terbaik. Link produk original ada di keranjang kuning ya.',
        notesMood: 'Gaya teks: Glowing zen badge.',
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
        visualAction: 'Kreator duduk di lantai dikelilingi banyak kantong belanjaan dan kardus paket dengan ekspresi heboh.',
        popupText: 'HAUL BELANJAAN UNDER 100K 🛍️',
        soundEffect: 'Shopping mall chime & Air horn blast',
        dialogVO: 'Racun belanjaan minggu ini under 100 ribu tapi dapet barang se-mewah dan se-banyak ini!',
        notesMood: 'Gaya teks: Colorful shopping tags. High energy & vibrant.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Close-up',
        visualAction: 'Menunjukkan barang ke-1 dengan fit check dan menunjukkan detail jahitan/kualitas.',
        popupText: 'ITEM 1: KUALITAS BUTIK BANGET (RP 45.000) 👗',
        soundEffect: 'Camera shutter & Pop sound',
        dialogVO: 'Item pertama ini bahannya jatuh banget, gak nerawang dan jahitannya rapi pol.',
        notesMood: 'Gaya teks: Price tag overlay Rp 45.000.',
        duration: 4
      },
      {
        cameraAngle: 'Close-up Macro',
        visualAction: 'Menunjukkan barang ke-2 (aksesoris/skincare) dengan demonstrasi fungsi langsung.',
        popupText: 'ITEM 2: DUPES BRAND MAHAL 😱',
        soundEffect: 'Sparkle magic ting & Swoosh',
        dialogVO: 'Item kedua ini beneran dupes brand mahal tapi harganya cuma sepertiganya doang!',
        notesMood: 'Gaya teks: Golden Luxury Badge.',
        duration: 4
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Pilihan favorit utama yang paling direkomendasikan untuk dibeli pertama kali.',
        popupText: 'ITEM 3: JUARA UMUM MINGGU INI 🔥',
        soundEffect: 'Level up victory chime',
        dialogVO: 'Dan yang paling wajib kalian checkout adalah nomor 3 ini, asli kepake banget sehari-hari.',
        notesMood: 'Gaya teks: Best Choice Crown.',
        duration: 3
      },
      {
        cameraAngle: 'Medium Shot',
        visualAction: 'Kreator memegang semua barang favorit sambil menunjuk daftar keranjang kuning.',
        popupText: 'SEMUA LINK DI KERANJANG NO 1-5 🛒',
        soundEffect: 'Cha-ching cash register & Applause',
        dialogVO: 'Favorit kalian yang nomor berapa nih? Langsung klik keranjang kuning sebelum stoknya ludes!',
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
  'Panning / Tracking',
  'Macro Split-Screen',
  'Front Camera / Selfie',
  'Tracking Following Shot'
];

// Richly categorized SFX library
export const SFX_CATEGORIES = [
  {
    category: 'Meme & Reaksi Viral',
    items: [
      'Vine boom / Bass drop',
      'Record scratch freeze',
      'Dramatic dun dun dun',
      'Cartoon slide whistle',
      'Wah-wah fail horn',
      'Air horn blast',
      'Gasp sound effect',
      'Bruh sound effect',
      'Cartoon laugh & chuckle',
      'Heroic fanfare / Tadaa'
    ]
  },
  {
    category: 'ASMR & Foley Nyata',
    items: [
      'Tape slicing crisp',
      'Paper crinkle ASMR',
      'Sachet tear crisp',
      'Cream squeeze squish',
      'Pouring water swirl',
      'Stirring cup ting',
      'Gentle box tapping ASMR',
      'Crisp plastic peel sound',
      'Keyboard typing clicky',
      'Whisper mic brush',
      'Crunchy bite ASMR',
      'Glass clink ting'
    ]
  },
  {
    category: 'Transisi & Gerakan',
    items: [
      'Fast whip whoosh',
      'Heavy cinematic swoosh',
      'Finger snap click',
      'Camera shutter click',
      'Camera flash click & Ting',
      'Glitch distortion static',
      'Wind gust breeze',
      'Bubble pop sound'
    ]
  },
  {
    category: 'Komersial, Notifikasi & Konversi',
    items: [
      'Cha-ching cash register',
      'Ding notification / iPhone ping',
      'Bell counter ding',
      'Level up victory chime',
      'Sparkle magic ting',
      'Success fanfare',
      'Heartbeat thud tension',
      'Applause & cheering crowd',
      'Shopping mall chime'
    ]
  }
];

export const SFX_PRESETS = SFX_CATEGORIES.flatMap((c) => c.items);

// Rich VO Delivery Tones for Indonesian UGC
export const VO_TONE_PRESETS = [
  {
    name: 'Storytelling Curhat',
    badge: 'Curhat',
    example: 'Jujur awalnya aku skeptis banget sama produk ini...',
    style: 'Emosional, santai, terkesan curhat rahasia ke teman dekat.'
  },
  {
    name: 'Hard-Selling FOMO',
    badge: 'FOMO Hype',
    example: 'Stop scrolling! Jangan sampai kehabisan diskon 50% ini!',
    style: 'Energi tinggi, tempo cepat, mendesak audiens segera checkout.'
  },
  {
    name: 'ASMR Bisik Santai',
    badge: 'ASMR',
    example: '(Bisik pelan) Dengerin suara renyahnya, ini satisfying banget...',
    style: 'Suara bisikan halus, tempo tenang, fokus ke efek suara foley.'
  },
  {
    name: 'Review Edukatif & Objektif',
    badge: 'Edukatif',
    example: 'Setelah aku bedah kandungannya, ini alasan kenapa formulanya bekerja...',
    style: 'Kredibel, jelas, nada bicara informatif tanpa terkesan memaksa.'
  },
  {
    name: 'Reaksi Heboh / Shock',
    badge: 'Shock Viral',
    example: 'Sumpah kalian gak bakal percaya sama hasilnya barusan!',
    style: 'Ekspresif, penuh kejutan, intonasi naik turun dramatis.'
  },
  {
    name: 'Tips & Trik Sat-Set',
    badge: 'Sat-Set',
    example: 'Cukup ikutin 3 langkah mudah ini, auto beres tanpa ribet!',
    style: 'Praktis, to-the-point, berirama cepat dan efisien.'
  },
  {
    name: 'Sketsa Komedi Lucu',
    badge: 'Lucu / Sketsa',
    example: 'Mbak, tolong ini kok bisa semurah ini?! Kebangetan dah!',
    style: 'Relatable, humoris, memancing tawa dan engagement komentar.'
  }
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
  'Gaya teks: Soft glowing cursive. Lighting studio moody cinematic.',
  'Gaya teks: Flashing Red Urgent. Countdown flash sale 24 jam.',
  'Gaya teks: Trust Badge BPOM / Halal. Kredibilitas tinggi.'
];
