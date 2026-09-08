import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SceneCard } from './components/SceneCard';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ScriptTableView } from './components/ScriptTableView';
import { ShotListChecklist } from './components/ShotListChecklist';
import { RateCardCalculator } from './components/RateCardCalculator';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { HookGeneratorModal } from './components/HookGeneratorModal';
import { TeleprompterModal } from './components/TeleprompterModal';
import { ExportModal } from './components/ExportModal';
import { VideoExportModal } from './components/VideoExportModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { PasswordGate } from './components/PasswordGate';
import { TrendingHarvestDashboard } from './components/TrendingHarvestDashboard';
import { UGC_CATEGORIES } from './data/categories';
import {
  Scene,
  StoryboardProject,
  UGCTemplateCategory,
  AIGenerateParams,
  AIHookOption,
  StoryboardViewMode,
  ShotItem,
  HookVariant,
  GoogleUserProfile,
  ShopeeTrendingProduct,
} from './types';
import { initAuth, googleSignIn, googleSignOut } from './services/googleAuth';
import { copyToClipboard, generateId, sanitizeStoryboardForJSON } from './utils/helpers';
import {
  saveProjectsToLocalStorage,
  saveProjectsToIndexedDB,
  loadProjectsFromIndexedDB,
  STORAGE_KEY,
  CURRENT_PROJECT_ID_KEY,
} from './utils/storage';
import {
  Plus,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Film,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Info,
  Code,
  Check
} from 'lucide-react';

// Initial project matching UGC Before & After format with 6 rich scenes
const INITIAL_BEFORE_AFTER_PROJECT: StoryboardProject = {
  id: 'proj_before_after_sago',
  title: 'Storyboard Before & After',
  categoryId: 'before_after',
  productName: 'Sago Green Coffee',
  targetAudience: 'Pria/wanita diet & sehat',
  visualFraming: 'full_body',
  productImageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
  caption: 'Cobain Sago Green Coffee! Bikin makin pede & hasil nyata. Cek keranjang kuning mumpung promo! ✨ #RacunTikTok #fyp #TikTokShop',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hookVariants: [
    {
      id: 'h_a',
      name: 'Hook A (Curhat Relatable)',
      type: 'Relatable Pain Point',
      dialogVO: 'Diet gagal mulu, kancing kemeja pada lepas, pusing!',
      visualAction: 'Bapak bertubuh buncit garuk kepala sambil nelpon di depan cermin, kancing baju meregang sempit.',
      popupText: 'DIET GAGAL MULU, BAJU GAK MUAT?! 😫',
      soundEffect: 'Phone ring & sigh',
      duration: 2,
    },
    {
      id: 'h_b',
      name: 'Hook B (Visual Shock)',
      type: 'Visual Shock',
      dialogVO: 'Sumpah kalian harus liat celana lama gue yang dulu gak muat ini!',
      visualAction: 'Bapak menarik celana jeans lama yang sekarang longgar hingga muat 2 kepalan tangan.',
      popupText: 'CELANA LAMA LANGSUNG KEDODORAN 😱',
      soundEffect: 'Vine boom / Bass drop & Gasp',
      duration: 2,
    },
    {
      id: 'h_c',
      name: 'Hook C (FOMO / Rahasia)',
      type: 'FOMO / Secret',
      dialogVO: 'Jangan skip dulu! Ini rahasia perut buncit kempes tanpa tersiksa diet ekstrem.',
      visualAction: 'Talent menunjuk ke kamera dengan tatapan serius, memegang sachet kopi hijau.',
      popupText: 'RAHASIA KEMPES 8 KG TANPA LEMAS 🤫',
      soundEffect: 'Whisper sound & Mystery chime',
      duration: 2,
    },
  ],
  scenes: [
    {
      id: 'sc_1',
      order: 1,
      cameraAngle: 'Medium Shot',
      visualAction: 'Bapak bertubuh buncit garuk kepala sambil nelpon di depan cermin, kancing baju meregang sempit.',
      popupText: 'DIET GAGAL MULU, BAJU GAK MUAT?! 😫',
      soundEffect: 'Phone ring & sigh',
      dialogVO: 'Diet gagal mulu, kancing kemeja pada lepas, pusing!',
      notesMood: 'Gaya teks: Chat Bubble. Pencahayaan redup dramatis.',
      duration: 2,
    },
    {
      id: 'sc_2',
      order: 2,
      cameraAngle: 'Close-up Frustrated',
      visualAction: 'Bapak menatap timbangan digital dengan ekspresi lelah dan putus asa.',
      popupText: 'COBAIN DIET EKSTREM MALAH LEMAS 😭',
      soundEffect: 'Record scratch freeze & Dramatic dun dun dun',
      dialogVO: 'Udah coba nahan makan seharian malah maag kambuh dan badan lemas gak bertenaga.',
      notesMood: 'Gaya teks: Warning Red tag. Nuansa murung.',
      duration: 2,
    },
    {
      id: 'sc_3',
      order: 3,
      cameraAngle: 'Close-up B-Roll',
      visualAction: 'Menunjukkan kemasan Sago Green Coffee sachet praktis di tangan dengan latar cerah.',
      popupText: 'UNTUNG NEMU SAGO GREEN COFFEE ☕',
      soundEffect: 'Swoosh & sparkle chime',
      dialogVO: 'Untung temen kantor ngenalin kopi hijau alami ini yang praktis tinggal seduh.',
      notesMood: 'Gaya teks: Dynamic Bouncy. Fokus tajam pada produk.',
      duration: 2,
    },
    {
      id: 'sc_4',
      order: 4,
      cameraAngle: 'POV / Medium Shot',
      visualAction: 'Menyeduh sachet kopi hijau dengan air panas, aroma mengepul nikmat diaduk dengan sendok.',
      popupText: 'RASA ENAK & BIKIN KENYANG TAHAN LAMA 😋',
      soundEffect: 'Pouring water swirl & Stirring cup ting',
      dialogVO: 'Tiap pagi tinggal seduh, rasanya enak gak pahit, dan nafsu makan auto terkontrol seharian.',
      notesMood: 'Gaya teks: Warm clean caption. Efek uap estetik.',
      duration: 3,
    },
    {
      id: 'sc_5',
      order: 5,
      cameraAngle: 'Wide Shot',
      visualAction: 'Bapak tampil bugar dan percaya diri, mengenakan kaos pas badan dengan perut kempes rata.',
      popupText: 'TURUN 8 KG PERUT KEMPES! 💪',
      soundEffect: 'Level up victory chime & Bell ding',
      dialogVO: 'Sekarang lingkar pinggang susut 8 cm, badan jauh lebih enteng dan segar!',
      notesMood: 'Gaya teks: Green energetic transformation badge.',
      duration: 3,
    },
    {
      id: 'sc_6',
      order: 6,
      cameraAngle: 'Medium Close-up',
      visualAction: 'Bapak tersenyum memegang produk sambil menunjuk ke keranjang kuning di kiri bawah.',
      popupText: 'PROMO BELI 2 GRATIS 1 + FREE ONGKIR 🛒',
      soundEffect: 'Cha-ching cash register & Applause',
      dialogVO: 'Cobain deh di keranjang kuning mumpung ada promo beli 2 gratis 1 dan gratis ongkir!',
      notesMood: 'Gaya teks: Flashing yellow CTA button.',
      duration: 3,
    },
  ],
};

export default function App() {
  const [projects, setProjects] = useState<StoryboardProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved projects:', e);
    }
    return [INITIAL_BEFORE_AFTER_PROJECT];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_PROJECT_ID_KEY);
      if (savedId) return savedId;
    } catch {}
    return INITIAL_BEFORE_AFTER_PROJECT.id;
  });

  // View Mode: 'cards' (editor) | 'table' (script breakdown) | 'phone_preview' (9:16 simulation) | 'trending_harvest'
  const [viewMode, setViewMode] = useState<StoryboardViewMode>('cards');

  // Application Password Gate State (Initial security gate: Ilalang@27)
  const [isAppUnlocked, setIsAppUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ugc_studio_auth_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlockApp = () => {
    try {
      localStorage.setItem('ugc_studio_auth_unlocked', 'true');
    } catch {}
    setIsAppUnlocked(true);
    showToast('🔓 Akses Berhasil Terbuka! Selamat datang di UGC Studio.');
  };

  const handleLockApp = () => {
    try {
      localStorage.removeItem('ugc_studio_auth_unlocked');
    } catch {}
    setIsAppUnlocked(false);
  };

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isCaptionOpen, setIsCaptionOpen] = useState(true);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiModalInitialParams, setAiModalInitialParams] = useState<Partial<AIGenerateParams> | null>(null);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [exportModalInitialTab, setExportModalInitialTab] = useState<'table' | 'caption' | 'script' | 'capcut' | 'json'>('table');
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isJsonCopied, setIsJsonCopied] = useState(false);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [enhancingSceneId, setEnhancingSceneId] = useState<string | null>(null);

  // Google Flow / Google Auth Credentials state
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Initialize Google Auth on mount & hydrate from IndexedDB
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      (token) => setGoogleAccessToken(token)
    );

    // Hydrate projects from IndexedDB if available (contains any cached offline images)
    loadProjectsFromIndexedDB()
      .then((dbProjects) => {
        if (dbProjects && Array.isArray(dbProjects) && dbProjects.length > 0) {
          setProjects(dbProjects);
        }
      })
      .catch(() => {});

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.profile);
        setGoogleAccessToken(result.accessToken);
        showToast(`👋 Halo ${result.profile.displayName || 'Kreator'}! Google Flow & Drive terhubung.`);
      }
      // If result is null, user cancelled or closed popup gracefully
    } catch (err: any) {
      console.warn('Google Sign-In caught notice:', err);
      showToast(err.message || 'Gagal masuk dengan Google');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleAccessToken(null);
      showToast('Berhasil keluar dari akun Google.');
    } catch (err) {
      showToast('Gagal logout.');
    }
  };

  // Active Project
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0] || INITIAL_BEFORE_AFTER_PROJECT;

  // Active Category
  const activeCategory =
    UGC_CATEGORIES.find((c) => c.id === currentProject?.categoryId) ||
    UGC_CATEGORIES[8]; // before_after default

  // Generate full comprehensive storyboard JSON object (without image data for Google Flow)
  const getFullStoryboardJSON = () => {
    const rawData = {
      id: currentProject.id,
      title: currentProject.title,
      category: activeCategory.name,
      categoryId: currentProject.categoryId,
      totalDuration: currentProject.scenes.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0),
      caption: currentProject.caption || '',
      hookVariants: currentProject.hookVariants || [],
      scenes: currentProject.scenes,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(sanitizeStoryboardForJSON(rawData), null, 2);
  };

  // 1-Click Copy Storyboard JSON to clipboard
  const handleCopyJSON = async () => {
    const jsonString = getFullStoryboardJSON();
    const ok = await copyToClipboard(jsonString);
    if (ok) {
      setIsJsonCopied(true);
      showToast('JSON Storyboard berhasil disalin ke clipboard! 📋');
      setTimeout(() => setIsJsonCopied(false), 2500);
    } else {
      // Direct fallback: Download JSON file so the user is never blocked by browser iframe clipboard restrictions
      try {
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeTitle = (currentProject.title || 'storyboard')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_');
        a.href = url;
        a.download = `${safeTitle}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsJsonCopied(true);
        showToast('Clipboard dibatasi browser. File JSON otomatis diunduh! 📁');
        setTimeout(() => setIsJsonCopied(false), 2500);
      } catch {
        handleOpenExportWithTab('json');
        showToast('Buka tab JSON untuk menyalin secara manual 📋');
      }
    }
  };

  const handleOpenExportWithTab = (tab: 'table' | 'caption' | 'script' | 'capcut' | 'json' = 'table') => {
    setExportModalInitialTab(tab);
    setIsExportModalOpen(true);
  };

  // Save projects resiliently to localStorage (quota-safe, base64-stripped) and IndexedDB (full data)
  useEffect(() => {
    saveProjectsToLocalStorage(projects, currentProjectId);
    saveProjectsToIndexedDB(projects);
  }, [projects, currentProjectId]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Helper to mutate active project
  const updateCurrentProject = (updater: (prev: StoryboardProject) => StoryboardProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === currentProject.id) {
          const updated = updater(p);
          return {
            ...updated,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  // Title change
  const handleTitleChange = (newTitle: string) => {
    updateCurrentProject((p) => ({ ...p, title: newTitle }));
    showToast(`Judul diperbarui: "${newTitle}"`);
  };

  // Non-destructive category switch: updates metadata without erasing user's custom scenes
  const handleSelectCategory = (cat: UGCTemplateCategory) => {
    updateCurrentProject((p) => ({
      ...p,
      categoryId: cat.id,
      title: p.title.startsWith('Storyboard ') ? `Storyboard ${cat.name}` : p.title,
    }));
    showToast(`Format video diubah ke: ${cat.name}`);
  };

  // Reset to default template of current category (with confirmation)
  const handleResetToCategoryTemplate = (cat: UGCTemplateCategory) => {
    updateCurrentProject((p) => ({
      ...p,
      categoryId: cat.id,
      title: `Storyboard ${cat.name}`,
      scenes: cat.defaultScenes.map((sc, idx) => ({
        ...sc,
        id: generateId(),
        order: idx + 1,
      })),
    }));
    showToast(`Template default "${cat.name}" dimuat (${cat.defaultScenes.length} adegan).`);
  };

  // Trigger AI with selected category
  const handleTriggerAICategory = (cat: UGCTemplateCategory) => {
    updateCurrentProject((p) => ({ ...p, categoryId: cat.id }));
    setIsAIGeneratorOpen(true);
  };

  // Scene Operations
  const handleAddScene = () => {
    const newScene: Scene = {
      id: generateId(),
      order: currentProject.scenes.length + 1,
      cameraAngle: 'Medium Shot',
      visualAction: 'Kreator menjelaskan keunggulan produk secara antusias ke kamera.',
      popupText: 'REKOMENDASI TERBAIK ✨',
      soundEffect: 'Swoosh',
      dialogVO: 'Yuk buktikan sendiri hasilnya sekarang juga!',
      notesMood: 'Gaya teks: Clean Modern. Tone cerah.',
      duration: 3,
    };

    updateCurrentProject((p) => ({
      ...p,
      scenes: [...p.scenes, newScene],
    }));

    showToast(`Adegan ${currentProject.scenes.length + 1} berhasil ditambahkan!`);
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    updateCurrentProject((p) => ({
      ...p,
      scenes: p.scenes.map((sc) => (sc.id === updatedScene.id ? updatedScene : sc)),
    }));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    updateCurrentProject((p) => {
      const newScenes = [...p.scenes];
      const temp = newScenes[index - 1];
      newScenes[index - 1] = newScenes[index];
      newScenes[index] = temp;
      return { ...p, scenes: newScenes };
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentProject.scenes.length - 1) return;
    updateCurrentProject((p) => {
      const newScenes = [...p.scenes];
      const temp = newScenes[index + 1];
      newScenes[index + 1] = newScenes[index];
      newScenes[index] = temp;
      return { ...p, scenes: newScenes };
    });
  };

  const handleDuplicateScene = (index: number) => {
    const targetScene = currentProject.scenes[index];
    const clonedScene: Scene = {
      ...targetScene,
      id: generateId(),
      order: index + 2,
    };

    updateCurrentProject((p) => {
      const newScenes = [...p.scenes];
      newScenes.splice(index + 1, 0, clonedScene);
      return { ...p, scenes: newScenes };
    });

    showToast(`Adegan ${index + 1} berhasil diduplikasi!`);
  };

  const handleDeleteScene = (index: number) => {
    if (currentProject.scenes.length <= 1) return;
    updateCurrentProject((p) => {
      const newScenes = p.scenes.filter((_, idx) => idx !== index);
      return { ...p, scenes: newScenes };
    });
    showToast(`Adegan ${index + 1} telah dihapus.`);
  };

  // AI Single Scene Polish
  const handleEnhanceSceneAI = async (scene: Scene) => {
    setEnhancingSceneId(scene.id);
    try {
      const res = await fetch('/api/enhance-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          category: activeCategory.name,
          instruction: 'Tingkatkan agar lebih viral, hook lebih tajam, dan aksi visual lebih ekspresif',
        }),
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }
      if (data.success && data.scene) {
        handleUpdateScene({
          ...scene,
          ...data.scene,
          id: scene.id,
          duration: Number(data.scene.duration) || scene.duration,
        });
        showToast('✨ Adegan berhasil dipercantik dengan AI!');
      } else {
        showToast('Gagal memoles adegan');
      }
    } catch (e) {
      console.error('Enhance scene error:', e);
      showToast('Gagal memproses AI enhance');
    } finally {
      setEnhancingSceneId(null);
    }
  };

  // AI Full Storyboard Generate
  const handleGenerateStoryboard = async (params: AIGenerateParams) => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const rawText = await res.text();
      let resData: any = {};
      try {
        resData = JSON.parse(rawText);
      } catch {
        resData = {};
      }

      if (resData.success && resData.data) {
        const genScenes: Scene[] = (resData.data.scenes || []).map((sc: any, i: number) => ({
          id: generateId(),
          order: i + 1,
          cameraAngle: sc.cameraAngle || 'Medium Shot',
          visualAction: sc.visualAction || '',
          popupText: sc.popupText || '',
          soundEffect: sc.soundEffect || '',
          dialogVO: sc.dialogVO || '',
          notesMood: sc.notesMood || '',
          duration: Number(sc.duration) || 3,
        }));

        const matchedCat =
          UGC_CATEGORIES.find(
            (c) =>
              c.name.toLowerCase() === params.category.toLowerCase() ||
              c.id.toLowerCase() === params.category.toLowerCase()
          ) || activeCategory;

        const newProj: StoryboardProject = {
          id: generateId(),
          title: resData.data.title || `Storyboard ${params.category} - ${params.productName}`,
          categoryId: matchedCat.id,
          productName: params.productName,
          targetAudience: params.targetAudience,
          productImageUrl: params.productImage,
          cameraStyle: params.cameraStyle,
          visualFraming: params.visualFraming,
          marketingFramework: params.marketingFramework,
          hookStrategy: params.hookStrategy,
          ctaPreset: params.ctaPreset,
          caption: resData.data.caption || `Cobain ${params.productName}! Hasil nyata bikin makin pede. Cek keranjang kuning sekarang! ✨ #RacunTikTok #fyp #TikTokShop`.slice(0, 150),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: genScenes.map((sc) => ({
            ...sc,
            imageUrl: sc.imageUrl || params.productImage,
          })),
        };

        setProjects((prev) => [newProj, ...prev]);
        setCurrentProjectId(newProj.id);
        setIsAIGeneratorOpen(false);
        showToast('🎉 Storyboard AI berhasil dibuat!');
      } else {
        showToast(resData.error || 'Gagal menghasilkan storyboard AI.');
      }
    } catch (err: any) {
      console.error('Generate error:', err);
      showToast(err?.message || 'Terjadi kesalahan saat generate storyboard');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Pre-fill AI Generator from Trending Harvest Shopee Product
  const handleGenerateStoryboardForProduct = (product: ShopeeTrendingProduct) => {
    setAiModalInitialParams({
      productName: product.name,
      category: product.category,
      targetAudience: product.targetAudience,
      keySellingPoints: product.keySellingPoints,
      visualFraming: product.recommendedFraming,
      productImage: product.imageUrl,
      tone: 'Santai, Relatable & Meyakinkan',
      targetPlatform: 'Shopee Video / TikTok Shop',
      hookStrategy: 'curiosity_gap',
      marketingFramework: 'problem_agitation_solution',
    });
    setIsAIGeneratorOpen(true);
    showToast(`🎯 Form AI terisi otomatis untuk produk: ${product.name.slice(0, 30)}...`);
  };

  // Apply viral hook to Scene 1
  const handleApplyHook = (hook: AIHookOption) => {
    if (currentProject.scenes.length === 0) return;

    updateCurrentProject((p) => {
      const newScenes = [...p.scenes];
      newScenes[0] = {
        ...newScenes[0],
        dialogVO: hook.hookDialog,
        visualAction: hook.visualAction,
        popupText: hook.popupText,
        soundEffect: hook.sfx,
        duration: Math.max(2, Math.min(4, newScenes[0].duration)),
      };
      return { ...p, scenes: newScenes };
    });

    showToast(`Hook "${hook.type}" berhasil dipasang di Adegan 1!`);
  };

  // Import JSON
  const handleImportJSON = (importedScenes: Scene[], importedTitle?: string) => {
    updateCurrentProject((p) => ({
      ...p,
      title: importedTitle || p.title,
      scenes: importedScenes.map((sc, i) => ({
        ...sc,
        id: sc.id || generateId(),
        order: i + 1,
        duration: Number(sc.duration) || 3,
      })),
    }));
    showToast('Storyboard JSON berhasil di-import!');
  };

  // Copy caption & hashtags to clipboard
  const handleCopyCaption = async () => {
    const textToCopy = currentProject.caption || '';
    if (!textToCopy) return;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedCaption(true);
      showToast('📋 Auto Caption & Hashtags berhasil disalin!');
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  // Generate / Regenerate fresh caption under 150 chars
  const handleGenerateNewCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: currentProject.productName || 'Produk Unggulan',
          category: activeCategory.name,
          targetAudience: currentProject.targetAudience || '',
        }),
      });
      const data = await res.json();
      if (data.success && data.caption) {
        updateCurrentProject((p) => ({ ...p, caption: data.caption }));
        showToast('✨ Caption viral baru berhasil dibuat!');
      }
    } catch (e) {
      console.error('Caption generate error:', e);
      showToast('Gagal membuat caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Project management
  const handleCreateNewProject = () => {
    const newProj: StoryboardProject = {
      id: generateId(),
      title: 'Storyboard UGC Baru',
      categoryId: 'before_after',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: [
        {
          id: generateId(),
          order: 1,
          cameraAngle: 'Medium Shot',
          visualAction: 'Kreator menyapa dengan ekspresi kaget dan hook penasaran.',
          popupText: 'JANGAN SKIP! 🔥',
          soundEffect: 'Vine boom',
          dialogVO: 'Stop scrolling! Kalian wajib tahu ini!',
          notesMood: 'Gaya teks: Bold Red. High energy.',
          duration: 3,
        },
        {
          id: generateId(),
          order: 2,
          cameraAngle: 'Close-up',
          visualAction: 'Demonstrasi produk ke kamera.',
          popupText: 'HASIL NYATA ✨',
          soundEffect: 'Swoosh',
          dialogVO: 'Ini rahasia yang bikin perubahannya instan.',
          notesMood: 'Gaya teks: Clean Modern.',
          duration: 3,
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    setIsProjectsModalOpen(false);
    showToast('Project baru dibuat!');
  };

  const handleDuplicateProject = (proj: StoryboardProject) => {
    const duplicated: StoryboardProject = {
      ...proj,
      id: generateId(),
      title: `${proj.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: proj.scenes.map((sc) => ({ ...sc, id: generateId() })),
    };
    setProjects((prev) => [duplicated, ...prev]);
    setCurrentProjectId(duplicated.id);
    showToast(`Project "${proj.title}" berhasil diduplikasi!`);
  };

  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== projId);
    setProjects(remaining);
    if (currentProjectId === projId) {
      setCurrentProjectId(remaining[0].id);
    }
    showToast('Project telah dihapus.');
  };

  // Shot List Update Handler
  const handleUpdateShotList = (items: ShotItem[]) => {
    updateCurrentProject((prev) => ({
      ...prev,
      shotList: items,
    }));
  };

  // A/B Hook Testing Variant Handlers
  const [activeHookIndex, setActiveHookIndex] = useState<number>(0);

  const handleSelectHookVariant = (variantIdx: number) => {
    setActiveHookIndex(variantIdx);
    const variants = currentProject.hookVariants || [];
    if (variants[variantIdx]) {
      const v = variants[variantIdx];
      updateCurrentProject((prev) => {
        const updatedScenes = [...prev.scenes];
        if (updatedScenes[0]) {
          updatedScenes[0] = {
            ...updatedScenes[0],
            dialogVO: v.dialogVO,
            visualAction: v.visualAction,
            popupText: v.popupText,
            soundEffect: v.soundEffect,
            duration: v.duration || updatedScenes[0].duration,
          };
        }
        return {
          ...prev,
          scenes: updatedScenes,
        };
      });
      showToast(`Beralih ke variasi: ${v.name}`);
    }
  };

  const handleAddHookVariant = () => {
    const currentVariants = currentProject.hookVariants && currentProject.hookVariants.length > 0
      ? currentProject.hookVariants
      : [
          {
            id: 'h_a',
            name: 'Hook A (Utama)',
            type: 'Visual Shock',
            dialogVO: currentProject.scenes[0]?.dialogVO || '',
            visualAction: currentProject.scenes[0]?.visualAction || '',
            popupText: currentProject.scenes[0]?.popupText || '',
            soundEffect: currentProject.scenes[0]?.soundEffect || '',
            duration: currentProject.scenes[0]?.duration || 3,
          },
        ];

    if (currentVariants.length >= 3) {
      showToast('Maksimal 3 variasi hook untuk A/B testing.');
      return;
    }

    const nextChar = String.fromCharCode(65 + currentVariants.length);
    const newVariant: HookVariant = {
      id: generateId(),
      name: `Hook ${nextChar}`,
      type: 'FOMO / Secret',
      dialogVO: 'Sumpah kalian harus tau ini sebelum kehabisan!',
      visualAction: 'Talent menunjuk ke kamera dengan ekspresi heboh, memperlihatkan kemasan produk.',
      popupText: 'JANGAN SKIP! RAHASIA TERBONGKAR 😱',
      soundEffect: 'Vine boom & Cha-ching',
      duration: 3,
    };

    const updated = [...currentVariants, newVariant];
    updateCurrentProject((prev) => ({
      ...prev,
      hookVariants: updated,
    }));
    setActiveHookIndex(updated.length - 1);
    handleSelectHookVariant(updated.length - 1);
    showToast(`Varian ${newVariant.name} berhasil ditambahkan!`);
  };

  const totalDuration = currentProject.scenes.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);

  // Security Gate: require password Ilalang@27 on first open
  if (!isAppUnlocked) {
    return <PasswordGate onUnlock={handleUnlockApp} />;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Application Header */}
      <Header
        title={currentProject.title}
        categoryName={activeCategory.name}
        categoryBadge={activeCategory.badgeText}
        visualFraming={currentProject.visualFraming}
        scenes={currentProject.scenes}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onTitleChange={handleTitleChange}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onOpenHooksModal={() => setIsHooksModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenExportModal={() => handleOpenExportWithTab('table')}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        onAddScene={handleAddScene}
        onCopyJSON={handleCopyJSON}
        isJsonCopied={isJsonCopied}
        googleUser={googleUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        onLockApp={handleLockApp}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Formats & Saved Projects */}
        <Sidebar
          selectedCategoryId={currentProject.categoryId}
          onSelectCategory={handleSelectCategory}
          onTriggerAICategory={handleTriggerAICategory}
          projects={projects}
          currentProjectId={currentProject.id}
          onSelectProject={(id) => setCurrentProjectId(id)}
          onCreateNewProject={handleCreateNewProject}
          onOpenTrendingHarvest={() => setViewMode('trending_harvest')}
        />

        {/* Main Content Area: Trending Harvest OR Storyboard Editor Modes */}
        {viewMode === 'trending_harvest' ? (
          <TrendingHarvestDashboard
            onGenerateStoryboardForProduct={handleGenerateStoryboardForProduct}
          />
        ) : (
          <main className="flex-1 bg-[#070a12] overflow-y-auto p-4 md:p-6 lg:p-7 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-5">
            
            {/* Context Bar: Current Format, Summary & Quick Triggers */}
            <div className="bg-[#0e1320] border border-[#1b253b] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-600/40 flex items-center justify-center text-purple-300 shrink-0 shadow-md">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {activeCategory.name}
                    </h2>
                    <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-600/40 px-2 py-0.5 rounded-full font-bold uppercase">
                      {activeCategory.badgeText}
                    </span>
                    {currentProject.visualFraming && (
                      <span className="text-[10px] bg-indigo-950/90 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        {currentProject.visualFraming === 'hands_pov' && '🖐️ Hanya Tangan (POV)'}
                        {currentProject.visualFraming === 'face_closeup' && '👤 Wajah & Ekspresi'}
                        {currentProject.visualFraming === 'full_body' && '🧍 Full Body'}
                        {currentProject.visualFraming === 'mix_framing' && '🔀 Mix Framing'}
                      </span>
                    )}
                    <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                      {totalDuration} Detik • {currentProject.scenes.length} Adegan
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {activeCategory.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={handleCopyJSON}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all shadow-sm active:scale-95 ${
                    isJsonCopied
                      ? 'bg-emerald-950 border-emerald-500/80 text-emerald-300'
                      : 'bg-[#141b2c] hover:bg-purple-950/40 text-purple-300 hover:text-white border-purple-500/40'
                  }`}
                  title="Salin data JSON lengkap Storyboard ke Clipboard"
                >
                  {isJsonCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold">JSON Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Code className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold">Copy JSON</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleResetToCategoryTemplate(activeCategory)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#141b2c] hover:bg-[#1b253b] text-slate-300 border border-[#212d44] transition-all"
                  title="Muat ulang adegan default untuk kategori ini"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Template Default</span>
                </button>

                <button
                  onClick={() => setIsHooksModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#141b2c] hover:bg-[#1b253b] text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all shadow-sm active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pilih 5 Hook Viral</span>
                </button>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#141b2c] hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-500/40 transition-all shadow-sm active:scale-95"
                  title="Pratinjau & Render video utuh MP4 menggunakan FFmpeg di browser"
                >
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preview Video (MP4)</span>
                </button>

                <button
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 border border-purple-400/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>Generate dengan AI</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE 1: Interactive Scene Cards Editor */}
            {viewMode === 'cards' && (
              <>
                {/* Collapsible Auto Caption & Hashtags Bar */}
                <div className="bg-[#0e1320] border border-[#1c273e] rounded-2xl overflow-hidden shadow-md">
                  <div
                    onClick={() => setIsCaptionOpen(!isCaptionOpen)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#121929] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Auto Caption & Hashtags TikTok (Maksimal 150 Karakter)
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                          (currentProject.caption || '').length <= 150
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                            : 'bg-red-950/80 text-red-300 border-red-700/50'
                        }`}
                      >
                        {(currentProject.caption || '').length} / 150
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCaption();
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 transition-colors"
                      >
                        {copiedCaption ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Caption</span>
                          </>
                        )}
                      </button>

                      {isCaptionOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isCaptionOpen && (
                    <div className="p-3.5 pt-0 space-y-2 border-t border-[#1a2336] bg-[#0b0f1a]">
                      <textarea
                        rows={2}
                        value={currentProject.caption || ''}
                        onChange={(e) => updateCurrentProject((p) => ({ ...p, caption: e.target.value }))}
                        placeholder="Ketik caption video dan hashtags di sini..."
                        className="w-full bg-[#080c15] border border-[#1d273e] focus:border-purple-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition-all resize-y"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={handleGenerateNewCaption}
                          disabled={isGeneratingCaption}
                          className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${isGeneratingCaption ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingCaption ? 'Membuat Caption...' : 'AI Buat Caption Baru'}</span>
                        </button>
                        <span className={(currentProject.caption || '').length > 150 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {(currentProject.caption || '').length <= 150 ? '✅ Sesuai batas posting' : '⚠️ Melebihi 150 karakter'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* List of Scene Cards */}
                <div className="space-y-4">
                  {currentProject.scenes.map((scene, index) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      index={index}
                      totalScenes={currentProject.scenes.length}
                      onUpdate={handleUpdateScene}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      onDuplicate={() => handleDuplicateScene(index)}
                      onDelete={() => handleDeleteScene(index)}
                      onEnhanceAI={handleEnhanceSceneAI}
                      onOpenHooksModal={() => setIsHooksModalOpen(true)}
                      isEnhancing={enhancingSceneId === scene.id}
                      hookVariants={
                        index === 0
                          ? currentProject.hookVariants && currentProject.hookVariants.length > 0
                            ? currentProject.hookVariants
                            : [
                                {
                                  id: 'h_a',
                                  name: 'Hook A (Utama)',
                                  type: 'Visual Shock',
                                  dialogVO: scene.dialogVO,
                                  visualAction: scene.visualAction,
                                  popupText: scene.popupText,
                                  soundEffect: scene.soundEffect,
                                  duration: scene.duration,
                                },
                              ]
                          : undefined
                      }
                      activeHookIndex={activeHookIndex}
                      onSelectHookVariant={handleSelectHookVariant}
                      onAddHookVariant={handleAddHookVariant}
                    />
                  ))}
                </div>

                {/* Bottom Add Scene & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={handleAddScene}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0e1320] hover:bg-[#141b2c] text-purple-300 hover:text-purple-100 border-2 border-dashed border-purple-700/40 hover:border-purple-500/80 font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 group"
                  >
                    <Plus className="w-4 h-4 text-purple-400 group-hover:rotate-90 transition-transform" />
                    <span>Tambah Adegan Baru (+ ADEGAN {currentProject.scenes.length + 1})</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Total: <strong className="text-white">{currentProject.scenes.length} Adegan</strong></span>
                    <span>•</span>
                    <span>Durasi: <strong className="text-emerald-400">{totalDuration} Detik</strong></span>
                  </div>
                </div>
              </>
            )}

            {/* VIEW MODE 2: Agency & Client Script Breakdown Table */}
            {viewMode === 'table' && (
              <ScriptTableView
                scenes={currentProject.scenes}
                title={currentProject.title}
                categoryName={activeCategory.name}
                caption={currentProject.caption}
              />
            )}

            {/* VIEW MODE 3: 9:16 Smartphone Simulator with TikTok Safe Zone */}
            {viewMode === 'phone_preview' && (
              <PhoneSimulator
                scenes={currentProject.scenes}
                title={currentProject.title}
                categoryName={activeCategory.name}
                productImageUrl={currentProject.productImageUrl}
                onOpenVideoExport={() => setIsVideoModalOpen(true)}
                onSelectScene={(idx) => {
                  setViewMode('cards');
                  setTimeout(() => {
                    const el = document.getElementById(`scene-card-${currentProject.scenes[idx]?.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 150);
                }}
              />
            )}

            {/* VIEW MODE 4: Shot-List & Checklist B-Roll Syuting */}
            {viewMode === 'shot_list' && (
              <ShotListChecklist
                scenes={currentProject.scenes}
                shotList={currentProject.shotList || []}
                title={currentProject.title}
                categoryName={activeCategory.name}
                onUpdateShotList={handleUpdateShotList}
              />
            )}

            {/* VIEW MODE 5: Kalkulator Rate Card & Penawaran Jasa */}
            {viewMode === 'rate_card' && (
              <RateCardCalculator
                projectTitle={currentProject.title}
                productName={currentProject.productName}
                categoryName={activeCategory.name}
              />
            )}

          </div>
        </main>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101726] border border-purple-500/80 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce shadow-purple-950/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => {
          setIsAIGeneratorOpen(false);
          setAiModalInitialParams(null);
        }}
        currentCategoryName={activeCategory.name}
        onGenerate={handleGenerateStoryboard}
        isGenerating={isGeneratingAI}
        initialParams={aiModalInitialParams}
      />

      <HookGeneratorModal
        isOpen={isHooksModalOpen}
        onClose={() => setIsHooksModalOpen(false)}
        productName={currentProject.productName || 'Produk'}
        category={activeCategory.name}
        onSelectHook={handleApplyHook}
      />

      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        title={currentProject.title}
        scenes={currentProject.scenes}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={currentProject.title}
        categoryName={activeCategory.name}
        caption={currentProject.caption}
        scenes={currentProject.scenes}
        hookVariants={currentProject.hookVariants}
        initialTab={exportModalInitialTab}
        onImportJSON={handleImportJSON}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        googleUser={googleUser}
        googleAccessToken={googleAccessToken}
        onGoogleLogin={handleGoogleLogin}
      />

      <VideoExportModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        scenes={currentProject.scenes}
        title={currentProject.title}
        categoryName={activeCategory.name}
        productImageUrl={currentProject.productImageUrl}
        googleUser={googleUser}
        googleAccessToken={googleAccessToken}
        onGoogleLogin={handleGoogleLogin}
        onUpdateProductImage={(newUrl) => {
          updateCurrentProject((p) => ({
            ...p,
            productImageUrl: newUrl || undefined,
            scenes: p.scenes.map((sc) => ({
              ...sc,
              imageUrl: sc.imageUrl || newUrl || undefined,
            })),
          }));
          showToast('Foto referensi produk berhasil diperbarui! 📸');
        }}
      />

      <ProjectManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        currentProjectId={currentProject.id}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onCreateNewProject={handleCreateNewProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
      />

    </div>
  );
}
