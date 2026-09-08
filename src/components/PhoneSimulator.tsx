import React, { useState, useEffect } from 'react';
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
  Film
} from 'lucide-react';
import { Scene } from '../types';

interface PhoneSimulatorProps {
  scenes: Scene[];
  title: string;
  categoryName: string;
  productImageUrl?: string;
  onOpenVideoExport?: () => void;
  onSelectScene?: (index: number) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  scenes,
  title,
  categoryName,
  productImageUrl,
  onOpenVideoExport,
  onSelectScene,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentScene = scenes[currentIndex] || scenes[0];
  const totalScenes = scenes.length;
  const currentDuration = currentScene?.duration || 3;

  // Auto-play timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && totalScenes > 0) {
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
  }, [isPlaying, currentIndex, currentDuration, totalScenes]);

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

  if (totalScenes === 0) {
    return (
      <div className="bg-[#111724] border border-[#1f2b42] rounded-2xl p-8 text-center text-slate-400">
        Belum ada adegan untuk disimulasikan.
      </div>
    );
  }

  return (
    <div className="bg-[#0f1422] border border-[#1e293f] rounded-2xl p-5 shadow-2xl">
      {/* Simulator Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-[#1c273e]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Simulator Video 9:16 (TikTok & Reels Safe Zone)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cek posisi teks pop-up agar tidak tertutup tombol like/komentar dan sound bar.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          {onOpenVideoExport && (
            <button
              onClick={onOpenVideoExport}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 border border-emerald-400/30"
              title="Ekspor seluruh adegan menjadi video MP4 dengan FFmpeg"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Export MP4</span>
            </button>
          )}
        </div>
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
              {(currentScene.imageUrl || productImageUrl) && (
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

              {/* Dynamic Popup Text (Simulating real TikTok bold sticker - Clean, steady, anti-anomaly) */}
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

          </div>
        </div>

        {/* Right: Scene Navigation & Scene Detail Breakdown */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          
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

          {/* Detailed Scene Info Card */}
          <div className="bg-[#121927] border border-[#212d44] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c273e]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  Detail Adegan {currentIndex + 1}
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
                  Angle Kamera
                </span>
                <p className="text-slate-200">{currentScene.cameraAngle || '-'}</p>
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
                  Catatan / Mood
                </span>
                <p className="text-slate-300">{currentScene.notesMood || '-'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1b253b]">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                Aksi Visual Lengkap
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
    </div>
  );
};
