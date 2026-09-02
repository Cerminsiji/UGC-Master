import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SceneCard } from './components/SceneCard';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { TrendingHarvestModal } from './components/TrendingHarvestModal';
import { HookGeneratorModal } from './components/HookGeneratorModal';
import { MarketLearningCenterModal } from './components/MarketLearningCenterModal';
import { TeleprompterModal } from './components/TeleprompterModal';
import { ExportModal } from './components/ExportModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { UGC_CATEGORIES } from './data/categories';
import { Scene, StoryboardProject, UGCTemplateCategory, AIGenerateParams, AIHookOption, TrendingProduct, ProductImageAnalysis } from './types';
import { copyToClipboard, generateId } from './utils/helpers';
import {
  Plus,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Film,
  Image as ImageIcon,
  Lock,
  Hand,
  User,
  Activity,
  Layers,
  ShoppingBag,
} from 'lucide-react';

const STORAGE_KEY = 'ugc_master_projects_v1';
const CURRENT_PROJECT_ID_KEY = 'ugc_master_current_proj_id';

// Initial project matching the exact screenshot
const INITIAL_BEFORE_AFTER_PROJECT: StoryboardProject = {
  id: 'proj_before_after_sago',
  title: 'Storyboard Before & After',
  categoryId: 'before_after',
  productName: 'Sago Green Coffee',
  targetAudience: 'Pria/wanita diet & sehat',
  visualFocus: 'mix',
  caption: 'Cobain Sago Green Coffee! Bikin makin pede & hasil nyata. Cek keranjang kuning mumpung promo! ✨ #RacunTikTok #fyp #TikTokShop',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scenes: [
    {
      id: 'sc_1',
      order: 1,
      cameraAngle: 'Medium Shot',
      visualAction: 'Bapak buncit garuk kepala sambil nelpon, ekspresi frustrasi.',
      popupText: 'DIET GAGAL MULU?!',
      soundEffect: 'Phone ring & sigh',
      dialogVO: 'Diet gagal mulu, pusing!',
      notesMood: 'Gaya teks: Chat Bubble. Pencahayaan redup dramatis.',
      duration: 2,
    },
    {
      id: 'sc_2',
      order: 2,
      cameraAngle: 'Close-up',
      visualAction: 'Menunjukkan kemasan Sago Green Coffee ke kamera.',
      popupText: 'SAGO GREEN COFFEE',
      soundEffect: 'Swoosh',
      dialogVO: 'Untung nemu ini.',
      notesMood: 'Gaya teks: Dynamic Bouncy. Fokus terang pada produk.',
      duration: 2,
    },
    {
      id: 'sc_3',
      order: 3,
      cameraAngle: 'POV / Medium Shot',
      visualAction: 'Menyeduh sachet kopi hijau dengan air panas, aroma mengepul nikmat.',
      popupText: 'RASA ENAK & BIKIN KENYANG ☕',
      soundEffect: 'Pouring water & Stirring cup',
      dialogVO: 'Tiap pagi tinggal seduh, rasanya enak dan nafsu makan auto terkontrol.',
      notesMood: 'Gaya teks: Warm clean caption. Efek uap estetik.',
      duration: 3,
    },
    {
      id: 'sc_4',
      order: 4,
      cameraAngle: 'Wide Shot',
      visualAction: 'Bapak tampil bugar, mengenakan kaos pas badan dengan senyum percaya diri.',
      popupText: 'TURUN 8 KG LEBIH SEGAR! 💪',
      soundEffect: 'Success chime & Cha-ching',
      dialogVO: 'Sekarang perut buncit kempes dan badan enteng. Cobain deh di keranjang kuning!',
      notesMood: 'Gaya teks: Green energetic badge. CTA tombol beli.',
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

  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isTrendingHarvestOpen, setIsTrendingHarvestOpen] = useState(false);
  const [isLearningCenterOpen, setIsLearningCenterOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Pre-seed product info for generator modal
  const [seedProductName, setSeedProductName] = useState<string | undefined>(undefined);
  const [seedUSP, setSeedUSP] = useState<string | undefined>(undefined);
  const [seedProductImage, setSeedProductImage] = useState<string | undefined>(undefined);
  const [seedProductAnalysis, setSeedProductAnalysis] = useState<ProductImageAnalysis | undefined>(undefined);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [enhancingSceneId, setEnhancingSceneId] = useState<string | null>(null);

  // Active Project
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  // Active Category
  const activeCategory =
    UGC_CATEGORIES.find((c) => c.id === currentProject?.categoryId) ||
    UGC_CATEGORIES[8]; // before_after default

  // Save projects to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_PROJECT_ID_KEY, currentProjectId);
    } catch {}
  }, [currentProjectId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Update current project
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

  // Category switch
  const handleSelectCategory = (cat: UGCTemplateCategory) => {
    updateCurrentProject((p) => {
      return {
        ...p,
        categoryId: cat.id,
        title: `Storyboard ${cat.name}`,
        scenes: cat.defaultScenes.map((sc, idx) => ({
          ...sc,
          id: generateId(),
          order: idx + 1,
        })),
      };
    });
    showToast(`Memuat template kategori: ${cat.name}`);
  };

  // Trigger AI with selected category
  const handleTriggerAICategory = (cat: UGCTemplateCategory) => {
    handleSelectCategory(cat);
    setIsAIGeneratorOpen(true);
  };

  // Handle selection from Trending Harvest
  const handleSelectTrendingProduct = (trending: TrendingProduct) => {
    setSeedProductName(trending.name);
    setSeedUSP(trending.suggestedUSP);
    const matchedCategory = UGC_CATEGORIES.find((c) => c.name.toLowerCase() === trending.recommendedCategory.toLowerCase()) || activeCategory;
    
    // Auto-update or open generator
    setIsTrendingHarvestOpen(false);
    setIsAIGeneratorOpen(true);
    showToast(`Produk "${trending.name}" dipilih dari Trending Harvest!`);
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
    
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
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

  // AI Single Scene Polish with strict Indonesian enforcement
  const handleEnhanceSceneAI = async (scene: Scene) => {
    setEnhancingSceneId(scene.id);
    try {
      const res = await fetch('/api/enhance-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          category: activeCategory.name,
          instruction: 'Tingkatkan agar lebih viral, hook lebih tajam, aksi visual lebih ekspresif, dan WAJIB 100% Bahasa Indonesia luwes khas kreator UGC',
          language: 'id',
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
        });
        showToast('Adegan berhasil dipoles oleh AI (100% Bahasa Indonesia)!');
      }
    } catch (e) {
      console.error('Enhance scene error:', e);
      showToast('Gagal memoles adegan');
    } finally {
      setEnhancingSceneId(null);
    }
  };

  // AI Generate Storyboard
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
        const genScenes: Scene[] = resData.data.scenes.map((sc: any, idx: number) => ({
          id: generateId(),
          order: idx + 1,
          cameraAngle: sc.cameraAngle || 'Medium Shot',
          visualAction: sc.visualAction || '',
          popupText: sc.popupText || '',
          soundEffect: sc.soundEffect || '',
          dialogVO: sc.dialogVO || '',
          notesMood: sc.notesMood || '',
          duration: Number(sc.duration) || 3,
        }));

        const matchedCat = UGC_CATEGORIES.find((c) => c.name === params.category) || activeCategory;

        const newProj: StoryboardProject = {
          id: generateId(),
          title: resData.data.title || `Storyboard ${params.category} - ${params.productName}`,
          categoryId: matchedCat.id,
          productName: params.productName,
          targetAudience: params.targetAudience,
          visualFocus: params.visualFocus || 'mix',
          productImage: params.productImageBase64,
          productImageAnalysis: params.productImageAnalysis,
          caption: (resData.data.caption || `Cobain ${params.productName}! Hasil nyata bikin makin pede. Cek keranjang kuning sekarang! ✨ #RacunTikTok #fyp #TikTokShop`).slice(0, 150),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scenes: genScenes,
        };

        setProjects((prev) => [newProj, ...prev]);
        setCurrentProjectId(newProj.id);
        setIsAIGeneratorOpen(false);
        showToast('🎉 Storyboard AI berhasil dibuat!');
      }
    } catch (err) {
      console.error('Generate error:', err);
      showToast('Terjadi kesalahan saat generate storyboard');
    } finally {
      setIsGeneratingAI(false);
    }
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
        duration: Math.max(2, Math.min(3, newScenes[0].duration)),
      };
      return { ...p, scenes: newScenes };
    });

    showToast(`Hook "${hook.type}" berhasil dipasang di Adegan 1!`);
  };

  // Copy JSON
  const handleCopyJSON = async () => {
    const jsonString = JSON.stringify(
      {
        title: currentProject.title,
        category: activeCategory.name,
        productName: currentProject.productName,
        visualFocus: currentProject.visualFocus,
        googleFlowConsistency: true,
        antiAiOrganic: true,
        totalDuration: currentProject.scenes.reduce((s, sc) => s + (Number(sc.duration) || 0), 0),
        scenes: currentProject.scenes,
      },
      null,
      2
    );

    const ok = await copyToClipboard(jsonString);
    if (ok) {
      setCopiedJSON(true);
      showToast('Data Storyboard JSON berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedJSON(false), 2500);
    }
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
          visualAction: 'Kreator menyapa dengan hook penasaran.',
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Application Header */}
      <Header
        title={currentProject.title}
        categoryName={activeCategory.name}
        categoryBadge={activeCategory.badgeText}
        scenes={currentProject.scenes}
        onTitleChange={handleTitleChange}
        onOpenTrendingHarvest={() => setIsTrendingHarvestOpen(true)}
        onOpenLearningCenter={() => setIsLearningCenterOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onOpenHooksModal={() => setIsHooksModalOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        onCopyJSON={handleCopyJSON}
        copiedJSON={copiedJSON}
        onAddScene={handleAddScene}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Categories list matching screenshot */}
        <Sidebar
          selectedCategoryId={currentProject.categoryId}
          onSelectCategory={handleSelectCategory}
          onTriggerAICategory={handleTriggerAICategory}
        />

        {/* Main Content Area */}
        <main className="flex-1 bg-[#090d16] overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Category Banner / Quick Bar */}
            <div className="bg-gradient-to-r from-[#111726] to-[#0d131f] border border-[#1d273e] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                {currentProject.productImage ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-indigo-500/50 bg-black/60 shrink-0">
                    <img
                      src={currentProject.productImage}
                      alt={currentProject.productName || 'Product'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-indigo-900/90 text-[8px] text-center font-bold text-indigo-200 py-0.5">
                      FOTO
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-300 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                )}
                
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {activeCategory.name}
                    </h2>
                    <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-600/40 px-2 py-0.5 rounded-full font-bold uppercase">
                      {activeCategory.badgeText}
                    </span>
                    
                    {/* Visual Focus Badge */}
                    {currentProject.visualFocus && (
                      <span className="text-[10px] bg-indigo-950/90 text-indigo-300 border border-indigo-600/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        {currentProject.visualFocus === 'hands_only' && '🖐️ Hanya Tangan (POV)'}
                        {currentProject.visualFocus === 'face' && '👤 Wajah & Ekspresi'}
                        {currentProject.visualFocus === 'full_body' && '🧍 Full Body (Outfit/Gerak)'}
                        {currentProject.visualFocus === 'mix' && '🔀 Mix Framing'}
                      </span>
                    )}

                    <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Google Flow Lock
                    </span>
                    <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-medium">
                      🚫 Anti-AI / No CGI
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {currentProject.productName ? `Storyboard untuk "${currentProject.productName}" • ` : ''}
                    {activeCategory.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {/* Trending Harvest Button */}
                <button
                  id="banner-trending-harvest-btn"
                  onClick={() => setIsTrendingHarvestOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/40 transition-all shadow-sm active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending Harvest</span>
                </button>

                <button
                  onClick={() => setIsHooksModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#141b2c] hover:bg-[#1d273f] text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-500/30 transition-all shadow-sm active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hook Populer</span>
                </button>

                <button
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-purple-950/50 transition-all active:scale-95 border border-purple-400/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>AI Generate Skrip</span>
                </button>
              </div>
            </div>

            {/* Auto Caption & Hashtags Widget (Max 150 Characters) */}
            <div className="bg-gradient-to-r from-[#111828] to-[#0e1422] border border-[#202d4a] rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c273e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Auto Caption & Hashtags Video
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                        (currentProject.caption || '').length <= 150
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                          : 'bg-red-950/80 text-red-300 border-red-700/50'
                      }`}>
                        {(currentProject.caption || '').length} / 150 Karakter
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Caption otomatis & hashtag viral siap posting (maksimal 150 karakter).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleGenerateNewCaption}
                    disabled={isGeneratingCaption}
                    className="flex items-center gap-1.5 bg-[#172033] hover:bg-[#202c44] text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-800/40 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingCaption ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCaption ? 'Membuat...' : 'AI Generate Caption'}</span>
                  </button>

                  <button
                    onClick={handleCopyCaption}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {copiedCaption ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        <span>Salin Caption</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <textarea
                  rows={2}
                  value={currentProject.caption || ''}
                  onChange={(e) => updateCurrentProject((p) => ({ ...p, caption: e.target.value }))}
                  placeholder="Ketik atau edit caption postingan di sini (lengkap dengan hashtag)..."
                  className="w-full bg-[#0a0e18] border border-[#1e2a42] focus:border-purple-500 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition-all resize-y"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>💡 Klik teks untuk mengedit langsung sebelum diposting.</span>
                  <span className={(currentProject.caption || '').length > 150 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {(currentProject.caption || '').length <= 150 ? '✅ Sesuai batas 150 karakter' : '⚠️ Melebihi batas 150 karakter'}
                  </span>
                </div>
              </div>
            </div>

            {/* List of Scene Cards matching the screenshot */}
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
                  isEnhancing={enhancingSceneId === scene.id}
                />
              ))}
            </div>

            {/* Bottom Add Scene & Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleAddScene}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#121827] hover:bg-[#182135] text-purple-300 hover:text-purple-100 border-2 border-dashed border-purple-700/40 hover:border-purple-500/80 font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 group"
              >
                <Plus className="w-4 h-4 text-purple-400 group-hover:rotate-90 transition-transform" />
                <span>Tambah Adegan Baru (+ ADEGAN {currentProject.scenes.length + 1})</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Total: <strong className="text-white">{currentProject.scenes.length} Adegan</strong></span>
                <span>•</span>
                <span>Durasi: <strong className="text-emerald-400">{currentProject.scenes.reduce((s, sc) => s + (Number(sc.duration) || 0), 0)} Detik</strong></span>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121929] border border-purple-500/60 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce shadow-purple-950/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <TrendingHarvestModal
        isOpen={isTrendingHarvestOpen}
        onClose={() => setIsTrendingHarvestOpen(false)}
        onSelectProductForStoryboard={handleSelectTrendingProduct}
      />

      <MarketLearningCenterModal
        isOpen={isLearningCenterOpen}
        onClose={() => setIsLearningCenterOpen(false)}
        onNotification={showToast}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        currentCategoryName={activeCategory.name}
        onGenerate={handleGenerateStoryboard}
        isGenerating={isGeneratingAI}
        initialProductName={seedProductName}
        initialUSP={seedUSP}
        initialProductImage={seedProductImage}
        initialProductAnalysis={seedProductAnalysis}
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
        onImportJSON={handleImportJSON}
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

