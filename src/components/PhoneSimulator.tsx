import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Type,
  Mic,
  Music2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Disc3,
  ShieldAlert,
  Sparkles,
  Film,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Code2,
  Loader2,
  Check
} from 'lucide-react';
import { Scene } from '../types';
import { renderStoryboardVideo, VideoRenderResult } from '../utils/videoExporter';
import { compressImageFile, copyToClipboard, sanitizeStoryboardForJSON } from '../utils/helpers';

interface PhoneSimulatorProps {
  scenes: Scene[];
  title: string;
  categoryName: string;
  productImageUrl?: string;
  onUpdateProductImage?: (url: string) => void;
  onOpenVideoExport?: () => void;
  onSelectScene?: (index: number) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  scenes,
  title,
  categoryName,
  productImageUrl,
  onUpdateProductImage,
  onOpenVideoExport,
  onSelectScene,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [progress, setProgress] = useState(0);

  // Google Flow Video Generation States
  const [activeViewTab, setActiveViewTab] = useState<'simulator' | 'google_flow_video'>('simulator');
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);
  const [flowProgress, setFlowProgress] = useState(0);
  const [flowStatusText, setFlowStatusText] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoResult, setGeneratedVideoResult] = useState<VideoRenderResult | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const currentScene = scenes[currentIndex] || scenes[0];
  const totalScenes = scenes.length;
  const currentDuration = currentScene?.duration || 3;

  // Has reference image check (mandatory for Google Flow)
  const hasReferenceImage = Boolean(productImageUrl || currentScene?.imageUrl);

  // Auto-play timer for mock simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && totalScenes > 0 && activeViewTab === 'simulator') {
      const stepMs = 50;
      const totalSteps = (currentDuration * 1000) / stepMs;

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentIndex((idx) => {
              if (idx + 1 >= totalScenes) {
                setIsPlaying(false);
                return 0;
              }
              return idx + 1;
            });
            return 0;
          }
          return prev + 100 / totalSteps;
        });
      }, stepMs);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, currentDuration, totalScenes, activeViewTab]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1 < totalScenes ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalScenes - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentIndex(0);
  };

  // Image upload handlers (Mandatory Reference Image)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageFile(file, 900, 0.85);
      if (onUpdateProductImage) {
        onUpdateProductImage(base64);
      }
      setShowUploadModal(false);
      setFlowError(null);
    } catch (err: any) {
      alert('Gagal memproses gambar: ' + (err?.message || 'Format tidak didukung'));
    }
    e.target.value = '';
  };

  const handleApplyImageUrl = () => {
    if (!urlInput.trim()) return;
    if (onUpdateProductImage) {
      onUpdateProductImage(urlInput.trim());
    }
    setUrlInput('');
    setShowUploadModal(false);
    setFlowError(null);
  };

  // Google Flow Video Generation aligned with Storyboard JSON
  const handleGenerateGoogleFlowVideo = async () => {
    if (!hasReferenceImage) {
      setShowUploadModal(true);
      setFlowError('Gambar referensi produk wajib di-upload sebelum generate video Google Flow!');
      return;
    }

    setIsGeneratingFlow(true);
    setFlowProgress(5);
    setFlowStatusText('Menginisialisasi pipeline Google Flow 9:16...');
    setFlowError(null);

    try {
      const result = await renderStoryboardVideo({
        scenes,
        title,
        categoryName,
        productImageUrl: productImageUrl || currentScene.imageUrl,
        showTikTokOverlay: showSafeZone,
        resolution: '720p',
        onProgress: (p, status) => {
          setFlowProgress(p);
          setFlowStatusText(status);
        },
      });

      setGeneratedVideoResult(result);
      setGeneratedVideoUrl(result.url);
      setActiveViewTab('google_flow_video');
      setIsGeneratingFlow(false);
    } catch (err: any) {
      console.error('Google Flow generation error:', err);
      setFlowError('Gagal merender video Google Flow: ' + (err?.message || 'Unknown error'));
      setIsGeneratingFlow(false);
    }
  };

  // Generate Google Flow Prompt JSON aligned with scenes
  const handleCopyGoogleFlowJSON = async () => {
    const flowPayload = {
      pipeline: 'Google_Flow_Veo2_UGC_9x16',
      aspectRatio: '9:16',
      mandatoryReferenceImage: productImageUrl || currentScene?.imageUrl || 'REQUIRED_REFERENCE_IMAGE_ATTACHED',
      metadata: {
        title,
        category: categoryName,
        totalScenes: scenes.length,
        totalDurationSeconds: scenes.reduce((sum, s) => sum + (Number(s.duration) || 3), 0),
        generatedAt: new Date().toISOString(),
      },
      storyboardJson: sanitizeStoryboardForJSON(scenes.map((s, idx) => ({
        sceneNumber: idx + 1,
        flowSecretCode: s.flowSecretCode || (idx === 0 ? '/dollyin' : idx === scenes.length - 1 ? '/dollyout' : '/orbit360'),
        cameraMovement: s.cameraMovement || s.cameraAngle || 'Smooth cinematic push-in',
        cameraAngle: s.cameraAngle || 'POV',
        durationSeconds: s.duration || 3,
        flowPrompt: s.flowPrompt || `Cinematic 9:16 vertical video of product, professional lighting, ${s.visualAction || ''}`,
        visualAction: s.visualAction,
        popupText: s.popupText,
        soundEffect: s.soundEffect,
        dialogVO: s.dialogVO,
        notesMood: s.notesMood,
      }))),
    };

    const success = await copyToClipboard(JSON.stringify(flowPayload, null, 2));
    if (success) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    }
  };

  if (totalScenes === 0) {
    return (
      <div className="bg-[#111724] border border-[#1f2b42] rounded-2xl p-8 text-center text-slate-400">
        Belum ada adegan untuk disimulasikan.
      </div>
    );
  }

  return (
    <div className="bg-[#0f1422] border border-[#1e293f] rounded-2xl p-5 shadow-2xl space-y-5">
      
      {/* Simulator Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c273e]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Simulator Video 9:16 & Google Flow Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulasi adegan sesuai JSON Storyboard & eksekusi video motion 9:16 dengan Google Flow.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle View Mode: Simulator Mockup vs Live Google Flow Video */}
          <div className="flex items-center bg-[#131a29] border border-[#23304d] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setActiveViewTab('simulator')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeViewTab === 'simulator'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulasi UI 9:16
            </button>
            <button
              onClick={() => {
                if (generatedVideoUrl) {
                  setActiveViewTab('google_flow_video');
                } else {
                  handleGenerateGoogleFlowVideo();
                }
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeViewTab === 'google_flow_video'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{generatedVideoUrl ? 'Video Flow (9:16)' : 'Generate Flow'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              showSafeZone
                ? 'bg-purple-950/80 text-purple-300 border-purple-600/50'
                : 'bg-[#151c2d] text-slate-400 border-[#222e47] hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{showSafeZone ? 'Safe Zone: ON' : 'Safe Zone: OFF'}</span>
          </button>

          {activeViewTab === 'simulator' && (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Simulasi</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-xl bg-[#151c2d] hover:bg-[#1f2a42] text-slate-400 hover:text-slate-200 border border-[#222e47] transition-colors"
                title="Reset ke Adegan 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {onOpenVideoExport && (
            <button
              onClick={onOpenVideoExport}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 border border-emerald-400/30"
              title="Buka Video Export Studio & Google Drive"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Export Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Reference Image Requirement Banner & Uploader */}
      <div className={`p-4 rounded-xl border transition-all ${
        hasReferenceImage
          ? 'bg-[#111928] border-[#1e2e4b]'
          : 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {hasReferenceImage ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/60 shrink-0 bg-black relative group">
                <img
                  src={productImageUrl || currentScene?.imageUrl}
                  alt="Referensi Produk"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-600/60 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Gambar Referensi Produk (Wajib Google Flow)
                </h4>
                {hasReferenceImage ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terverifikasi</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Wajib Diunggah
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {hasReferenceImage
                  ? 'Foto produk asli terkunci untuk menjamin konsistensi visual 9:16 dan mencegah halusinasi AI.'
                  : 'Google Flow memerlukan gambar produk nyata agar storyboard JSON dirender akurat tanpa distorsi bentuk.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                hasReferenceImage
                  ? 'bg-[#1a2338] hover:bg-[#23304c] text-slate-200 border border-[#2b3a61]'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasReferenceImage ? 'Ganti Gambar' : 'Upload Gambar Wajib'}</span>
            </button>

            <button
              onClick={handleGenerateGoogleFlowVideo}
              disabled={isGeneratingFlow}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-950/60 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingFlow ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Merender Flow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Video Google Flow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generation Progress Bar */}
        {isGeneratingFlow && (
          <div className="mt-4 pt-4 border-t border-[#1c273f] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-purple-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>{flowStatusText || 'Sedang memproses adegan JSON...'}</span>
              </span>
              <span className="font-mono text-emerald-400">{flowProgress}%</span>
            </div>
            <div className="h-2 w-full bg-[#111726] rounded-full overflow-hidden border border-[#202b44]">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${flowProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {flowError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{flowError}</span>
          </div>
        )}
      </div>

      {/* Simulator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Phone Mockup (9:16 aspect ratio) */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
          <div className="w-[300px] sm:w-[330px] aspect-[9/16] bg-black rounded-[40px] border-[8px] border-[#1e2638] shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
            
            {/* Top Phone Notch / Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e2638] mr-2"></div>
              <div className="w-2 h-2 rounded-full bg-[#111624]"></div>
            </div>

            {/* TAB VIEW 1: GOOGLE FLOW GENERATED VIDEO PLAYER */}
            {activeViewTab === 'google_flow_video' && generatedVideoUrl ? (
              <div className="absolute inset-0 z-20 flex flex-col justify-between bg-black">
                <video
                  ref={videoPlayerRef}
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />

                {/* Floating Overlay Badge for Google Flow Engine */}
                <div className="absolute top-10 left-3 right-3 pointer-events-none flex items-center justify-between text-[10px]">
                  <span className="bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Google Flow 9:16</span>
                  </span>
                  <span className="bg-black/70 backdrop-blur-md text-emerald-400 font-mono px-2 py-0.5 rounded-md">
                    {scenes.length} Adegan JSON
                  </span>
                </div>
              </div>
            ) : (
              /* TAB VIEW 2: INTERACTIVE MOCKUP SIMULATOR */
              <>
                {/* Top Scene Progress Segments */}
                <div className="absolute top-8 left-3 right-3 z-30 flex items-center gap-1">
                  {scenes.map((sc, i) => (
                    <div
                      key={sc.id}
                      className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all duration-75 ${
                          i < currentIndex
                            ? 'w-full bg-white'
                            : i === currentIndex
                            ? 'bg-purple-400'
                            : 'w-0'
                        }`}
                        style={{
                          width: i === currentIndex ? `${progress}%` : undefined,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Top Bar Status */}
                <div className="absolute top-11 left-4 right-4 z-30 flex items-center justify-between text-[11px] text-white/80 font-medium">
                  <span className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                    Adegan {currentIndex + 1} / {totalScenes}
                  </span>
                  <span className="bg-purple-900/60 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {currentScene.cameraAngle || 'POV'}
                  </span>
                </div>

                {/* Safe Zone Grid Guides Overlay */}
                {showSafeZone && (
                  <div className="absolute inset-0 pointer-events-none z-20 border-2 border-dashed border-red-500/40 m-3 rounded-2xl flex flex-col justify-between p-2">
                    <div className="text-[9px] text-red-400/80 bg-red-950/70 px-1.5 py-0.5 rounded self-start">
                      Zona Aman Header (Cari/Tab)
                    </div>
                    <div className="self-end text-[9px] text-red-400/80 bg-red-950/70 px-1.5 py-0.5 rounded text-right">
                      Zona Tombol Like/Share →
                    </div>
                    <div className="text-[9px] text-red-400/80 bg-red-950/70 px-1.5 py-0.5 rounded self-start">
                      Zona Aman Caption & Keranjang Kuning ↓
                    </div>
                  </div>
                )}

                {/* Center Background Action Canvas */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#161f30] via-[#0d1424] to-[#080d18] flex flex-col items-center justify-center p-5 text-center overflow-hidden">
                  
                  {/* Product Reference Background Image */}
                  {(currentScene.imageUrl || productImageUrl) && (
                    <>
                      <img
                        src={currentScene.imageUrl || productImageUrl}
                        alt="Product Background"
                        className="absolute inset-0 w-full h-full object-cover blur-lg opacity-25 scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                    </>
                  )}

                  {/* Product Photo Showcase Thumbnail */}
                  {(currentScene.imageUrl || productImageUrl) ? (
                    <div className="relative mb-2.5 z-10">
                      <img
                        src={currentScene.imageUrl || productImageUrl}
                        alt="Product Showcase"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-purple-500/50 shadow-2xl"
                      />
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-purple-400/40 text-[8px] text-purple-200 font-bold whitespace-nowrap">
                        📸 Produk
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowUploadModal(true)}
                      className="relative mb-2.5 z-10 cursor-pointer p-4 rounded-2xl border-2 border-dashed border-amber-500/60 bg-amber-950/30 hover:bg-amber-950/50 transition-colors text-center max-w-[200px]"
                    >
                      <ImageIcon className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-amber-300">Wajib Upload Gambar</p>
                      <p className="text-[8px] text-slate-400">Klik untuk unggah foto referensi produk</p>
                    </div>
                  )}

                  {/* Visual Action Mockup Card */}
                  <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 max-w-[92%] shadow-lg mb-3 z-10">
                    <div className="flex items-center justify-center gap-1.5 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                      <Eye className="w-3 h-3" />
                      <span>Aksi Visual</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic line-clamp-3">
                      "{currentScene.visualAction || 'Visual adegan belum diisi'}"
                    </p>
                  </div>

                  {/* Dynamic Popup Text (Simulating real TikTok bold sticker) */}
                  {currentScene.popupText ? (
                    <div className="mt-2 max-w-[95%] transition-all duration-300">
                      <div className="bg-amber-400 text-black font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-2xl border-2 border-black tracking-tight uppercase leading-tight">
                        {currentScene.popupText}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-2">
                      (Tanpa teks pop-up layar)
                    </span>
                  )}

                  {/* SFX Alert Badge */}
                  {currentScene.soundEffect && (
                    <div className="mt-4 flex items-center gap-1 bg-purple-950/80 border border-purple-500/50 text-purple-200 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      <Music2 className="w-3 h-3 text-amber-300" />
                      <span>SFX: {currentScene.soundEffect}</span>
                    </div>
                  )}
                </div>

                {/* Right Side TikTok Interaction Icons Mockup */}
                <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white/90">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-rose-500">
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </div>
                    <span className="text-[9px] font-bold">24.8K</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold">482</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold">1.9K</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold">Share</span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center animate-spin">
                    <Disc3 className="w-5 h-5 text-white/80" />
                  </div>
                </div>

                {/* Bottom: Voiceover Dialogue Subtitle & Keranjang Kuning */}
                <div className="absolute bottom-4 left-3 right-16 z-30 space-y-2">
                  
                  {/* Voiceover Dialog Subtitle */}
                  <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-left shadow-lg">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
                      <Mic className="w-3 h-3" />
                      <span>Dialog Voice Over ({currentDuration} detik)</span>
                    </div>
                    <p className="text-xs text-white font-medium leading-snug">
                      "{currentScene.dialogVO || 'Tidak ada dialog pada adegan ini'}"
                    </p>
                  </div>

                  {/* Yellow Cart / TikTok Shop Mockup Banner */}
                  <div className="flex items-center gap-2 bg-[#ffdd00] text-black px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md">
                    <span className="text-xs">🛒</span>
                    <span className="truncate">Keranjang Kuning: {title}</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Right: Scene Navigation & Scene Detail Breakdown & Google Flow Actions */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          
          {/* Action Bar for Google Flow Video */}
          {generatedVideoResult && (
            <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-600/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Video Google Flow 9:16 Siap!</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Format vertikal 9:16 tersinkronisasi penuh dengan naskah dan gambar referensi.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={generatedVideoResult.url}
                  download={generatedVideoResult.filename}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>

                <button
                  onClick={handleCopyGoogleFlowJSON}
                  className="flex items-center gap-1.5 bg-[#172136] hover:bg-[#202d48] text-purple-300 border border-purple-500/40 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'JSON Tersalin!' : 'Salin JSON Flow'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex items-center justify-between bg-[#121927] border border-[#212d44] rounded-xl p-3">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#182236] hover:bg-[#202d48] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-bold text-purple-300">
              Adegan {currentIndex + 1} dari {totalScenes}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#182236] hover:bg-[#202d48] transition-colors"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scene Jump Pills */}
          <div className="flex flex-wrap gap-1.5">
            {scenes.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => {
                  setCurrentIndex(i);
                  setProgress(0);
                  if (onSelectScene) onSelectScene(i);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentIndex === i
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105'
                    : 'bg-[#141b2b] text-slate-400 hover:text-slate-200 border border-[#212e47]'
                }`}
              >
                Adegan {i + 1} ({sc.duration}s)
              </button>
            ))}
          </div>

          {/* Detailed Scene Info Card Aligned with JSON Storyboard */}
          <div className="bg-[#121927] border border-[#212d44] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c273e]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  Adegan {currentIndex + 1} Sesuai JSON Storyboard
                </span>
                {currentIndex === 0 && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-full font-bold">
                    Hook 3 Detik
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {currentDuration} Detik
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0e1422] border border-[#1b253b]">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Google Flow Secret Code
                </span>
                <p className="text-purple-300 font-mono font-bold">
                  {currentScene.flowSecretCode || (currentIndex === 0 ? '/dollyin' : currentIndex === totalScenes - 1 ? '/dollyout' : '/orbit360')}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0e1422] border border-[#1b253b]">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  Teks Pop-up Layar
                </span>
                <p className="text-sky-300 font-bold">{currentScene.popupText || '-'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0e1422] border border-[#1b253b]">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Efek Suara (SFX)
                </span>
                <p className="text-amber-300 italic">{currentScene.soundEffect || '-'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0e1422] border border-[#1b253b]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Angle & Movement Kamera
                </span>
                <p className="text-slate-200">
                  {currentScene.cameraMovement || currentScene.cameraAngle || 'Smooth movement'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b253b]">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                Aksi Visual Adegan
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentScene.visualAction || 'Belum ada deskripsi visual'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b253b]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Naskah Suara (Voiceover)
              </span>
              <p className="text-xs text-white font-medium leading-relaxed">
                "{currentScene.dialogVO || 'Belum ada naskah suara'}"
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Mandatory Image Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c273e]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Upload Gambar Referensi Wajib
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-[#1b253b]"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google Flow mewajibkan gambar referensi asli produk untuk merender adegan 9:16 secara konsisten sesuai bentuk fisik, warna kemasan, dan label produk.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/30 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                Pilih File Gambar dari Komputer / HP
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Format JPG, PNG, WEBP didukung (otomatis dikompresi)
              </p>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1c273e]"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-semibold">
                atau tempel URL gambar
              </span>
              <div className="flex-grow border-t border-[#1c273e]"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://contoh.com/foto-produk.jpg"
                className="flex-1 bg-[#121927] border border-[#212d44] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <button
                onClick={handleApplyImageUrl}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
              >
                Gunakan URL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
