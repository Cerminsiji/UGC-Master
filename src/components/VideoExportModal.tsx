import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Film,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Maximize2,
  ShieldCheck,
  Smartphone,
  Layers,
  Clock,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
  Cloud,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Scene, GoogleUserProfile } from '../types';
import {
  renderStoryboardVideo,
  VideoRenderResult,
  loadFFmpeg,
} from '../utils/videoExporter';
import { uploadVideoToDrive, DriveUploadResult } from '../services/googleDrive';
import { formatDuration, compressImageFile } from '../utils/helpers';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  title: string;
  categoryName: string;
  productImageUrl?: string;
  onUpdateProductImage?: (newUrl: string) => void;
  googleUser?: GoogleUserProfile | null;
  googleAccessToken?: string | null;
  onGoogleLogin?: () => Promise<void> | void;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  scenes,
  title,
  categoryName,
  productImageUrl: initialProductImage,
  onUpdateProductImage,
  googleUser,
  googleAccessToken,
  onGoogleLogin,
}) => {
  const [productImage, setProductImage] = useState<string | undefined>(initialProductImage);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('Siap untuk merender video...');
  const [videoResult, setVideoResult] = useState<VideoRenderResult | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Google Drive & Flow State
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadProgress, setDriveUploadProgress] = useState(0);
  const [driveUploadStatus, setDriveUploadStatus] = useState('');
  const [driveResult, setDriveResult] = useState<DriveUploadResult | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Settings
  const [resolution, setResolution] = useState<'720p' | '540p'>('720p');
  const [showOverlay, setShowOverlay] = useState(true);

  // Video player controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Sync initial product image
  useEffect(() => {
    if (initialProductImage) {
      setProductImage(initialProductImage);
    }
  }, [initialProductImage]);

  // Pre-load FFmpeg in background when modal opens
  useEffect(() => {
    if (isOpen && !videoResult && !isRendering) {
      loadFFmpeg();
    }
  }, [isOpen, videoResult, isRendering]);

  if (!isOpen) return null;

  const totalDuration = scenes.reduce((sum, s) => sum + (Number(s.duration) || 3), 0);

  // Handle image upload from file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
      if (compressedDataUrl) {
        setProductImage(compressedDataUrl);
        if (onUpdateProductImage) {
          onUpdateProductImage(compressedDataUrl);
        }
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProductImage(result);
          if (onUpdateProductImage) {
            onUpdateProductImage(result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample quick photos for testing
  const samplePhotos = [
    {
      name: 'Serum Wajah (Kecantikan)',
      url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kopi Herbal (F&B)',
      url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Keyboard RGB (Gadget)',
      url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fashion Sneaker',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Start rendering video
  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderError(null);
    setRenderProgress(0);
    setRenderStatus('Menyiapkan canvas dan FFmpeg WebAssembly...');

    try {
      const result = await renderStoryboardVideo({
        scenes,
        title,
        categoryName,
        productImageUrl: productImage,
        showTikTokOverlay: showOverlay,
        resolution,
        onProgress: (pct, text) => {
          setRenderProgress(pct);
          setRenderStatus(text);
        },
      });

      setVideoResult(result);
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (err: any) {
      console.error('Error exporting video:', err);
      setRenderError(err.message || 'Gagal merender video storyboard.');
    } finally {
      setIsRendering(false);
    }
  };

  // Resilient download video file
  const handleDownload = () => {
    if (!videoResult) return;
    try {
      const a = document.createElement('a');
      a.href = videoResult.url;
      a.download = videoResult.filename;
      a.setAttribute('download', videoResult.filename);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 150);
    } catch (err) {
      console.warn('Direct download click failed, opening in new tab:', err);
      window.open(videoResult.url, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (!videoResult) return;
    window.open(videoResult.url, '_blank');
  };

  // Upload rendered video directly to Google Drive (Google Flow)
  const handleSaveToDrive = async () => {
    if (!videoResult) return;

    if (!googleUser || !googleAccessToken) {
      if (onGoogleLogin) {
        await onGoogleLogin();
      }
      return;
    }

    setIsUploadingToDrive(true);
    setDriveError(null);
    setDriveUploadProgress(10);
    setDriveUploadStatus('Menghubungkan ke Google Drive...');

    try {
      const result = await uploadVideoToDrive({
        videoBlob: videoResult.blob,
        filename: videoResult.filename,
        accessToken: googleAccessToken,
        onProgress: (pct, status) => {
          setDriveUploadProgress(pct);
          setDriveUploadStatus(status);
        },
      });
      setDriveResult(result);
    } catch (err: any) {
      console.error('Upload to Drive error:', err);
      setDriveError(err.message || 'Gagal mengunggah video ke Google Drive.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Video playback listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || totalDuration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2a42] flex items-center justify-between bg-gradient-to-r from-[#141b2e] via-[#111728] to-[#101625]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Export Video MP4 (FFmpeg Preview)
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold">
                  Client-Side FFmpeg
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Render seluruh adegan storyboard menjadi video vertikal 9:16 utuh dengan referensi foto produk.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRendering}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Video Preview Stage (9:16 phone view) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="w-[280px] sm:w-[310px] aspect-[9/16] bg-black rounded-[36px] border-[6px] border-[#1e2638] shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
                
                {/* When video is ready */}
                {videoResult ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      src={videoResult.url}
                      playsInline
                      muted={isMuted}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      onTimeUpdate={handleTimeUpdate}
                      className="w-full h-full object-cover"
                    />

                    {/* Play/Pause Overlay Click Target */}
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-all group"
                    >
                      {!isPlaying && (
                        <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : isRendering ? (
                  /* Rendering Loading Animation */
                  <div className="w-full h-full bg-[#0d1322] flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
                        <Film className="w-8 h-8 text-purple-400" />
                      </div>
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin absolute -bottom-2 -right-2" />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white mb-1">
                        Merender Video Storyboard
                      </div>
                      <div className="text-xs text-purple-300 font-medium">
                        {renderProgress}% Selesai
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#182133] rounded-full h-2 overflow-hidden border border-[#23304d]">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                      {renderStatus}
                    </p>
                  </div>
                ) : (
                  /* Placeholder Before Render */
                  <div className="w-full h-full bg-gradient-to-b from-[#131b2e] to-[#0a0f1d] flex flex-col items-center justify-center p-6 text-center">
                    {productImage ? (
                      <div className="relative mb-4">
                        <img
                          src={productImage}
                          alt="Product Preview"
                          className="w-28 h-28 object-cover rounded-2xl border-2 border-purple-500/40 shadow-xl"
                        />
                        <span className="absolute -bottom-2 -right-2 text-[9px] bg-purple-900 text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded-full font-bold">
                          Foto Produk
                        </span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#1a233a] border border-[#23304d] flex items-center justify-center text-slate-500 mb-4">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    <div className="text-sm font-bold text-slate-200 mb-1">
                      {scenes.length} Adegan • {totalDuration} Detik
                    </div>
                    <p className="text-xs text-slate-400 max-w-[220px] mb-5">
                      Klik tombol "Mulai Render Video" di sebelah kanan untuk menyatukan semua adegan menjadi MP4.
                    </p>

                    <button
                      onClick={handleStartRender}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-950/60 active:scale-95 transition-all border border-purple-400/30"
                    >
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Mulai Render Video (FFmpeg)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Video Player Scrubber & Controls (When ready) */}
              {videoResult && (
                <div className="w-[280px] sm:w-[310px] mt-3 p-2.5 rounded-xl bg-[#121827] border border-[#1f2a41] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-[#1a243b] text-white hover:bg-purple-600 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="p-1.5 rounded-lg bg-[#1a243b] text-slate-300 hover:text-white transition-colors"
                      title="Ulangi dari awal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={duration || totalDuration}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 accent-purple-500 h-1.5 bg-[#1f2b44] rounded-lg cursor-pointer"
                    />

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-[#1a243b] text-slate-300 hover:text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{formatDuration(currentTime)}</span>
                    <span className="text-purple-300 font-semibold">
                      {videoResult.isFFmpegMp4 ? 'MP4 (libx264)' : 'WebM (Video)'}
                    </span>
                    <span>{formatDuration(duration || totalDuration)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Settings, Product Photo Reference, & Download */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Card 1: Product Photo Reference */}
              <div className="p-4 rounded-2xl bg-[#121828] border border-[#212d47] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Referensi Foto Produk
                    </span>
                  </div>
                  {productImage && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold">
                      ✓ Foto Terpasang
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  {productImage ? (
                    <div className="relative group shrink-0">
                      <img
                        src={productImage}
                        alt="Product Reference"
                        className="w-20 h-20 object-cover rounded-xl border border-purple-500/50 shadow-md"
                      />
                      <button
                        onClick={() => {
                          setProductImage(undefined);
                          if (onUpdateProductImage) onUpdateProductImage('');
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition-all"
                        title="Hapus foto produk"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#0c101c] border border-dashed border-[#293652] flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[9px]">Pilih Foto</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-slate-300">
                      Foto produk ini akan menjadi visual utama dan latar belakang adegan video yang dirender.
                    </p>

                    <label className="inline-flex items-center gap-1.5 bg-[#182135] hover:bg-[#212d46] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#273552] cursor-pointer transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>{productImage ? 'Ganti Foto' : 'Upload Foto Produk'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-[#1b253b]">
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    Atau gunakan contoh foto katalog siap pakai:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setProductImage(p.url);
                          if (onUpdateProductImage) onUpdateProductImage(p.url);
                        }}
                        className="text-[10px] bg-[#161f33] hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-[#222f4b] hover:border-purple-500/50 p-1.5 rounded-lg text-left truncate transition-all"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Render Settings */}
              <div className="p-4 rounded-2xl bg-[#121828] border border-[#212d47] space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Pengaturan Video Output
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Resolusi Video (9:16)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setResolution('720p')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          resolution === '720p'
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-[#182135] text-slate-400 border-[#273552]'
                        }`}
                      >
                        720p HD
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolution('540p')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          resolution === '540p'
                            ? 'bg-purple-600 text-white border-purple-400'
                            : 'bg-[#182135] text-slate-400 border-[#273552]'
                        }`}
                      >
                        540p Cepat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Overlay UI TikTok/Reels
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOverlay(!showOverlay)}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        showOverlay
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                          : 'bg-[#182135] text-slate-400 border-[#273552]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{showOverlay ? 'Overlay Aktif' : 'Video Bersih'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Alert or Error */}
              {renderError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal render: </span>
                    <span>{renderError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#151c2e] to-[#121828] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {videoResult ? 'Video Siap Diunduh!' : 'Siap Merender Video?'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {videoResult
                        ? `File ${videoResult.filename} (${(videoResult.blob.size / 1024 / 1024).toFixed(2)} MB)`
                        : `${scenes.length} Adegan • Total ${totalDuration} Detik • FFmpeg Engine`}
                    </span>
                  </div>

                  {videoResult && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-600/50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{videoResult.isFFmpegMp4 ? 'H.264 MP4' : 'Video OK'}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  {videoResult ? (
                    <>
                      <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/60 active:scale-95 transition-all border border-emerald-400/30"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download File .MP4</span>
                      </button>

                      <button
                        onClick={handleOpenInNewTab}
                        className="flex items-center justify-center gap-1.5 bg-[#161f33] hover:bg-[#202b45] text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#273654] transition-all"
                        title="Buka preview video langsung di tab browser baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Buka Tab</span>
                      </button>

                      <button
                        onClick={handleStartRender}
                        disabled={isRendering}
                        className="flex items-center justify-center gap-1.5 bg-[#182135] hover:bg-[#222e47] text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#293652] transition-all"
                        title="Render ulang dengan pengaturan baru"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Render Ulang</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartRender}
                      disabled={isRendering}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-lg shadow-purple-950/60 active:scale-95 transition-all border border-purple-400/30 disabled:opacity-50"
                    >
                      {isRendering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                          <span>{renderStatus}</span>
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4 text-purple-200" />
                          <span>Render Video Storyboard (FFmpeg MP4)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Google Drive & Flow Cloud Save Section */}
                {videoResult && (
                  <div className="pt-2 border-t border-[#1f2c45]/70 space-y-2">
                    {driveResult ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-emerald-200 block">
                              Tersimpan di Google Drive!
                            </span>
                            <span className="text-[11px] text-emerald-300/80">
                              Folder: "UGC Storyboard Hub" • File: {driveResult.name}
                            </span>
                          </div>
                        </div>

                        {driveResult.webViewLink && (
                          <a
                            href={driveResult.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 self-start sm:self-center"
                          >
                            <span>Buka di Drive</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#101726] border border-[#212f4c]">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">
                              Google Flow / Google Drive
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {googleUser
                                ? `Terhubung sebagai ${googleUser.displayName || googleUser.email}`
                                : 'Simpan video langsung ke akun Google Drive Anda'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleSaveToDrive}
                          disabled={isUploadingToDrive}
                          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 border border-sky-400/30 disabled:opacity-50 self-start sm:self-center"
                        >
                          {isUploadingToDrive ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{driveUploadProgress}% {driveUploadStatus}</span>
                            </>
                          ) : (
                            <>
                              <Cloud className="w-3.5 h-3.5" />
                              <span>
                                {googleUser ? 'Simpan ke Google Drive' : 'Masuk & Simpan ke Drive'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {driveError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-[11px] text-rose-200 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="font-medium">{driveError}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 pl-6">
                          💡 <strong>Tips:</strong> Anda bisa langsung klik tombol <span className="text-purple-300 font-bold">"Download Video (MP4)"</span> di atas untuk mengunduh video langsung ke perangkat tanpa memerlukan izin Google Drive.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1f2a42] bg-[#121828] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Pemrosesan 100% di browser sisi klien (Private & Aman)</span>
          </span>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#182133] hover:bg-[#202c42] rounded-lg border border-[#232f48] transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
