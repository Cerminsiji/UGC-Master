import { Scene } from '../types';

export interface FlowSecretCodeItem {
  code: string; // e.g. "/orbit360"
  name: string; // e.g. "360° Orbital Rotation"
  category: 'camera_moves' | 'lens_focus' | 'speed_motion' | 'lighting_vibe' | 'transition_reveal' | 'special_effects';
  description: string;
  cameraMovement: string;
  defaultPromptFragment: string;
  tags: string[];
}

export const FLOW_CATEGORIES: { id: FlowSecretCodeItem['category']; label: string; icon: string }[] = [
  { id: 'camera_moves', label: 'Gerakan Kamera (Moves)', icon: 'Video' },
  { id: 'lens_focus', label: 'Lensa & Kedalaman (Optics)', icon: 'Eye' },
  { id: 'speed_motion', label: 'Kecepatan & Waktu (Speed)', icon: 'Clock' },
  { id: 'lighting_vibe', label: 'Pencahayaan & Atmosfer', icon: 'Sun' },
  { id: 'transition_reveal', label: 'Transisi & Reveal', icon: 'Sparkles' },
  { id: 'special_effects', label: 'Sinematik Khusus (FX)', icon: 'Film' },
];

export const FLOW_SECRET_CODES: FlowSecretCodeItem[] = [
  // 1. CAMERA MOVES (Gerakan Kamera)
  {
    code: '/orbit360',
    name: '360° Smooth Orbit',
    category: 'camera_moves',
    description: 'Rotasi kamera memutar 360 derajat mengelilingi produk dengan halus dan stabil.',
    cameraMovement: 'Smooth 360° orbital rotation around subject',
    defaultPromptFragment: '/orbit360 camera seamlessly orbiting 360 degrees around the product with fluid stabilization',
    tags: ['orbit', 'rotation', '360', 'product_showcase']
  },
  {
    code: '/dollyin',
    name: 'Cinematic Dolly In',
    category: 'camera_moves',
    description: 'Kamera meluncur maju mendekati produk atau wajah untuk membangun fokus dramatis.',
    cameraMovement: 'Slow, dramatic dolly-in pushing forward toward subject',
    defaultPromptFragment: '/dollyin slow cinematic push in camera move focusing on fine details',
    tags: ['dolly', 'push', 'focus', 'reveal']
  },
  {
    code: '/dollyout',
    name: 'Smooth Dolly Out',
    category: 'camera_moves',
    description: 'Kamera meluncur mundur secara bertahap memperlihatkan lingkungan atau konteks hasil.',
    cameraMovement: 'Smooth dolly out revealing full subject environment',
    defaultPromptFragment: '/dollyout gradual pull-back camera motion revealing surrounding context',
    tags: ['dolly', 'pull', 'environment', 'reveal']
  },
  {
    code: '/fpv_glide',
    name: 'FPV Drone Glide',
    category: 'camera_moves',
    description: 'Gerakan kamera cepat dinamis menyusuri produk layaknya drone mikro dalam ruangan.',
    cameraMovement: 'Dynamic FPV glide flying closely past the product',
    defaultPromptFragment: '/fpv indoor micro-drone cinematic glide moving smoothly past the subject with high precision',
    tags: ['drone', 'fpv', 'glide', 'dynamic']
  },
  {
    code: '/tracking_follow',
    name: 'Smooth Tracking Follow',
    category: 'camera_moves',
    description: 'Kamera bergerak sejajar mengikuti langkah talent atau tangan yang memegang produk.',
    cameraMovement: 'Lateral tracking shot locked onto talent hand movement',
    defaultPromptFragment: '/tracking fluid tracking camera following hand motion at constant distance',
    tags: ['tracking', 'follow', 'handheld', 'motion']
  },
  {
    code: '/vertigo_zoom',
    name: 'Dolly Zoom (Vertigo Effect)',
    category: 'camera_moves',
    description: 'Kamera bergerak maju sambil zoom out (atau sebaliknya) untuk efek shock/terkejut dramatis.',
    cameraMovement: 'Hitchcock vertigo dolly zoom warping background perspective',
    defaultPromptFragment: '/vertigo dramatic dolly zoom distortion shifting background depth while keeping subject size static',
    tags: ['vertigo', 'dolly_zoom', 'shock', 'drama']
  },
  {
    code: '/whip_pan',
    name: 'Whip Pan Transition',
    category: 'camera_moves',
    description: 'Sapuan kamera super cepat dengan motion blur untuk transisi sebelum dan sesudah.',
    cameraMovement: 'Rapid whip pan with motion blur snap transition',
    defaultPromptFragment: '/whip_pan ultra-fast horizontal camera sweep with motion blur transitioning between states',
    tags: ['whip_pan', 'transition', 'snap', 'before_after']
  },
  {
    code: '/tilt_reveal',
    name: 'Vertical Tilt Reveal',
    category: 'camera_moves',
    description: 'Kamera mendongak dari bawah ke atas memperlihatkan kemasan produk secara megah.',
    cameraMovement: 'Vertical tilt-up reveal from base to brand logo',
    defaultPromptFragment: '/tiltup majestic vertical tilt upward revealing packaging details from bottom to top',
    tags: ['tilt', 'reveal', 'vertical', 'hero']
  },
  {
    code: '/crane_boom',
    name: 'Crane Boom Down',
    category: 'camera_moves',
    description: 'Kamera turun dari posisi tinggi ke eye level memberikan sudut pandang sinematik mewah.',
    cameraMovement: 'High-to-low cinematic crane boom descending smoothly',
    defaultPromptFragment: '/crane descending boom camera shot landing at product eye level',
    tags: ['crane', 'boom', 'cinematic', 'overhead']
  },
  {
    code: '/handheld_organic',
    name: 'Organic Handheld POV',
    category: 'camera_moves',
    description: 'Guncangan kamera tangan alami dan subtle memberikan kesan UGC otentik dan relatable.',
    cameraMovement: 'Authentic handheld POV with subtle organic micro-movements',
    defaultPromptFragment: '/handheld natural handheld smartphone camera feel with subtle organic motion',
    tags: ['handheld', 'pov', 'organic', 'ugc_authentic']
  },

  // 2. LENS & FOCUS (Lensa & Kedalaman)
  {
    code: '/macro_texture',
    name: 'Extreme Macro Texture',
    category: 'lens_focus',
    description: 'Bidikan jarak sangat dekat memperlihatkan tetesan air, bulir scrub, atau serat bahan.',
    cameraMovement: 'Macro lens tight focus exploring surface textures',
    defaultPromptFragment: '/macro extreme close-up with 100mm macro lens revealing microscopic droplet texture and surface richness',
    tags: ['macro', 'texture', 'closeup', 'droplet']
  },
  {
    code: '/rack_focus',
    name: 'Dynamic Rack Focus',
    category: 'lens_focus',
    description: 'Perpindahan titik fokus dari objek latar belakang ke produk di latar depan.',
    cameraMovement: 'Smooth rack focus shift from background talent to foreground product',
    defaultPromptFragment: '/rackfocus focal shift transitioning crisply from soft background to tack-sharp foreground product',
    tags: ['rack_focus', 'focus_shift', 'depth', 'cinematic']
  },
  {
    code: '/shallow_dof',
    name: 'Ultra Shallow DOF (Bokeh)',
    category: 'lens_focus',
    description: 'Latar belakang blur krem lembut (f/1.4 aperture) membuat produk menonjol sempurna.',
    cameraMovement: 'Fixed focal plane with dreamy circular bokeh background',
    defaultPromptFragment: '/shallow_dof shot on 85mm f/1.4 lens producing creamy cinematic bokeh blur in background',
    tags: ['bokeh', 'shallow_dof', 'aperture', 'portrait']
  },
  {
    code: '/anamorphic_flare',
    name: 'Anamorphic Lens Flare',
    category: 'lens_focus',
    description: 'Efek pantulan cahaya horizontal khas lensa bioskop anamorphic kelas atas.',
    cameraMovement: 'Horizontal pan catching subtle horizontal cyan lens flares',
    defaultPromptFragment: '/anamorphic cinematic anamorphic 2.39:1 aspect aesthetic with subtle horizontal flare streaks',
    tags: ['anamorphic', 'flare', 'cinematic', 'premium']
  },
  {
    code: '/fisheye_y2k',
    name: 'Fisheye Y2K Dynamic',
    category: 'lens_focus',
    description: 'Lensa ultra-wide fisheye yang melengkung dramatis, populer untuk konten streetwear & gen-z.',
    cameraMovement: 'Curved wide-angle perspective exaggerating hand proximity',
    defaultPromptFragment: '/fisheye 8mm ultra-wide fisheye barrel distortion trendy Y2K aesthetic close to lens',
    tags: ['fisheye', 'y2k', 'ultra_wide', 'streetwear']
  },

  // 3. SPEED & MOTION (Kecepatan & Waktu)
  {
    code: '/slowmo_120fps',
    name: 'Super Slow Motion 120fps',
    category: 'speed_motion',
    description: 'Gerak lambat mulus menangkap cipratan cairan, semprotan mist, atau jatuhnya produk.',
    cameraMovement: 'High-speed camera tracking slow-motion liquid dynamics',
    defaultPromptFragment: '/slowmo shot at 120fps smooth fluid slow motion capturing droplet splashes in suspended air',
    tags: ['slowmo', '120fps', 'splash', 'fluid']
  },
  {
    code: '/speed_ramp',
    name: 'Dynamic Speed Ramp',
    category: 'speed_motion',
    description: 'Gerakan cepat diperlambat pas di momen pemakaian (fast-to-slow ramp) yang adiktif.',
    cameraMovement: 'Speed ramp accelerating on approach then snapping into slow motion impact',
    defaultPromptFragment: '/speed_ramp quick whip acceleration snapping into ultra-clear slow motion on product interaction',
    tags: ['speed_ramp', 'fast_slow', 'impact', 'tiktok_trend']
  },
  {
    code: '/hyperlapse',
    name: 'Motion Hyperlapse',
    category: 'speed_motion',
    description: 'Perjalanan waktu dipercepat dengan pergerakan kamera halus menyusuri ruangan.',
    cameraMovement: 'Hyperlapse path moving forward in fast motion with stabilized horizon',
    defaultPromptFragment: '/hyperlapse stabilized fast motion forward path showing time compression and dynamic activity',
    tags: ['hyperlapse', 'timelapse', 'fast_forward', 'routine']
  },
  {
    code: '/freeze_frame',
    name: '3D Freeze Bullet Time',
    category: 'speed_motion',
    description: 'Waktu membeku sementara kamera terus berputar mengelilingi aksi produk di udara.',
    cameraMovement: 'Bullet-time camera arc rotating while subject action is frozen',
    defaultPromptFragment: '/freeze_frame matrix bullet-time camera arc orbiting around suspended mid-air product',
    tags: ['freeze', 'bullet_time', 'matrix', 'suspension']
  },

  // 4. LIGHTING & VIBE (Pencahayaan & Suasana)
  {
    code: '/golden_hour',
    name: 'Warm Golden Hour',
    category: 'lighting_vibe',
    description: 'Cahaya matahari terbenam keemasan yang hangat dan estetik menyinari kulit & produk.',
    cameraMovement: 'Sun flare glancing through product silhouette at sunset',
    defaultPromptFragment: '/golden_hour warm late afternoon sunrays casting glowing rim light and soft warm amber shadows',
    tags: ['golden_hour', 'sunset', 'warm', 'glow']
  },
  {
    code: '/studio_softbox',
    name: 'Commercial Studio Softbox',
    category: 'lighting_vibe',
    description: 'Pencahayaan studio komersial bersih dengan difusi lembut tanpa bayangan keras.',
    cameraMovement: 'Evenly balanced high-end commercial studio camera tracking',
    defaultPromptFragment: '/studio_softbox balanced 3-point diffused softbox lighting with crisp white reflections and true-to-life colors',
    tags: ['studio', 'softbox', 'clean', 'commercial']
  },
  {
    code: '/cyberpunk_neon',
    name: 'Cyberpunk Neon Glow',
    category: 'lighting_vibe',
    description: 'Pencahayaan neon kontras tinggi warna magenta dan cyan yang mencolok untuk produk gaming/tech.',
    cameraMovement: 'Glossy reflections sliding across product under vibrant neon lights',
    defaultPromptFragment: '/cyberpunk dual-tone neon lighting saturated cyan and hot pink rim highlights with moody dark reflections',
    tags: ['neon', 'cyberpunk', 'tech', 'gaming']
  },
  {
    code: '/rim_light_luxury',
    name: 'Luxury Rim Edge Light',
    category: 'lighting_vibe',
    description: 'Garis cahaya tipis berkilau di pinggiran botol/kemasan dengan latar belakang gelap elegan.',
    cameraMovement: 'Low key tracking revealing sparkling edge contour highlights',
    defaultPromptFragment: '/rim_light dramatic low-key lighting with sharp white rim highlights sculpting product silhouettes',
    tags: ['rim_light', 'luxury', 'low_key', 'perfume']
  },
  {
    code: '/natural_window',
    name: 'Morning Window Daylight',
    category: 'lighting_vibe',
    description: 'Sinar matahari pagi alami dari jendela kamar tidur, sangat cocok untuk skincare & lifestyle.',
    cameraMovement: 'Gentle organic glide bathed in airy window daylight',
    defaultPromptFragment: '/natural_light soft diffused morning sunlight streaming through window sheer curtains, airy aesthetic',
    tags: ['natural', 'morning', 'skincare', 'lifestyle']
  },

  // 5. TRANSITIONS & REVEALS
  {
    code: '/before_after_wipe',
    name: 'Before/After Seamless Wipe',
    category: 'transition_reveal',
    description: 'Garis transisi digital menggeser layar memperlihatkan transformasi sebelum & sesudah seketika.',
    cameraMovement: 'Locked static frame with seamless vertical wipe revelation',
    defaultPromptFragment: '/split_screen clean vertical wipe slider transitioning instantly from dull before-state to radiant glowing after-state',
    tags: ['wipe', 'before_after', 'split', 'transformation']
  },
  {
    code: '/match_cut',
    name: 'Object Match Cut',
    category: 'transition_reveal',
    description: 'Transisi sempurna dari satu adegan ke adegan lain dengan bentuk objek produk yang sama.',
    cameraMovement: 'Match cut snapping between two distinct locations on identical product angle',
    defaultPromptFragment: '/match_cut visual continuity match cut maintaining exact product position while scene environment switches',
    tags: ['match_cut', 'transition', 'creative', 'continuity']
  },
  {
    code: '/finger_snap_switch',
    name: 'Snap Finger Magic Swap',
    category: 'transition_reveal',
    description: 'Petikan jari talent seketika mengubah tampilan outfit, wajah kusam, atau ruangan berantakan.',
    cameraMovement: 'Snapping transition synchronized with hand gesture',
    defaultPromptFragment: '/snap_cut quick finger snap soundwave transition swapping instantly to upgraded result',
    tags: ['snap', 'swap', 'magic', 'tiktok_trend']
  },
  {
    code: '/curtain_shadow_reveal',
    name: 'Dramatic Shadow Reveal',
    category: 'transition_reveal',
    description: 'Bayangan tirai perlahan bergeser memperlihatkan produk dengan nuansa misterius.',
    cameraMovement: 'Slow tracking as moving cast shadows uncover the subject',
    defaultPromptFragment: '/dramatic_reveal moving palm leaf shadows sweeping away to reveal radiant pristine product packaging',
    tags: ['shadow', 'reveal', 'mystery', 'aesthetic']
  },

  // 6. SPECIAL CINEMATIC FX
  {
    code: '/product_levitation',
    name: 'Zero-Gravity Levitation',
    category: 'special_effects',
    description: 'Produk melayang di udara tanpa gravitasi diiringi butiran bahan yang mengorbit santai.',
    cameraMovement: 'Slow 3D orbital camera circling around floating zero-gravity product',
    defaultPromptFragment: '/levitation surreal zero-gravity product floating suspended in mid-air with gentle rotational drift',
    tags: ['levitation', 'floating', 'zero_gravity', 'surreal']
  },
  {
    code: '/liquid_explosion',
    name: 'Water Splash Burst',
    category: 'special_effects',
    description: 'Cipratan air kristal jernih meledak di sekitar produk dengan efek visual memukau.',
    cameraMovement: 'Extreme slow motion circular pan around exploding crystal clear water droplets',
    defaultPromptFragment: '/splash_burst high velocity dynamic water splash crowning around the product, hyper-detailed fluid simulation',
    tags: ['splash', 'water', 'burst', 'hydration']
  },
  {
    code: '/pov_unboxing',
    name: 'Hands-on POV Unboxing',
    category: 'special_effects',
    description: 'Sudut pandang orang pertama unboxing merobek segel dan membuka boks secara memuaskan.',
    cameraMovement: 'First-person perspective downward tilt watching hands slice box seal',
    defaultPromptFragment: '/unboxing POV first-person point-of-view peeling packaging seal with crisp tactile satisfaction',
    tags: ['unboxing', 'pov', 'hands', 'tactile']
  }
];

/**
 * Constructs a production-ready, dense Google Flow AI / Video Generation prompt
 * incorporating the secret code, scene camera motion, subject, action, lighting, and video specs.
 */
export function constructGoogleFlowPrompt(
  scene: Partial<Scene>,
  productName = 'Produk Unggulan',
  framingDirection = 'vertical 9:16'
): string {
  const code = scene.flowSecretCode || '/dollyin';
  const camera = scene.cameraMovement || scene.cameraAngle || 'cinematic smooth move';
  const action = scene.visualAction || 'kreator menunjukkan produk secara antusias';
  const mood = scene.notesMood || 'studio lighting, clear details';

  // Find matching secret code item if available
  const match = FLOW_SECRET_CODES.find((c) => c.code === code);
  const codePromptFragment = match ? match.defaultPromptFragment : `${code} ${camera}`;

  return `${code} [Shot: ${camera}] [Subject: ${productName}] [Action: ${action}] [Mood & Lighting: ${mood}] [Style: 4K UHD, hyperrealistic commercial, ${framingDirection}, photorealistic textures, 60fps cinematic flow]`.trim();
}

/**
 * Suggests the best Flow Secret Code based on camera angle and visual action keywords
 */
export function suggestFlowCodeForScene(scene: Partial<Scene>): FlowSecretCodeItem {
  const text = `${scene.cameraAngle || ''} ${scene.visualAction || ''} ${scene.soundEffect || ''}`.toLowerCase();

  if (text.includes('orbit') || text.includes('putar') || text.includes('keliling') || text.includes('360')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/orbit360')!;
  }
  if (text.includes('macro') || text.includes('tekstur') || text.includes('tetes') || text.includes('serat')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/macro_texture')!;
  }
  if (text.includes('slow') || text.includes('lambat') || text.includes('ciprat') || text.includes('splash')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/slowmo_120fps')!;
  }
  if (text.includes('unboxing') || text.includes('buka boks') || text.includes('segel')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/pov_unboxing')!;
  }
  if (text.includes('before') || text.includes('sesudah') || text.includes('beda') || text.includes('perubahan')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/before_after_wipe')!;
  }
  if (text.includes('drone') || text.includes('fpv') || text.includes('terbang')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/fpv_glide')!;
  }
  if (text.includes('shock') || text.includes('kaget') || text.includes('vertigo') || text.includes('dolly zoom')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/vertigo_zoom')!;
  }
  if (text.includes('mundur') || text.includes('lingkungan') || text.includes('out') || text.includes('pull')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/dollyout')!;
  }
  if (text.includes('cahaya') || text.includes('matahari') || text.includes('sore') || text.includes('sunset')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/golden_hour')!;
  }
  if (text.includes('neon') || text.includes('cyber') || text.includes('gaming')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/cyberpunk_neon')!;
  }
  if (text.includes('focus') || text.includes('fokus') || text.includes('bokeh')) {
    return FLOW_SECRET_CODES.find((c) => c.code === '/shallow_dof')!;
  }

  // Default to Dolly In for dynamic entrance
  return FLOW_SECRET_CODES.find((c) => c.code === '/dollyin')!;
}
