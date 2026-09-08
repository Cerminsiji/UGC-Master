import React, { useState } from 'react';
import {
  Sparkles,
  Tv,
  Download,
  Flame,
  FolderOpen,
  Plus,
  LayoutGrid,
  FileSpreadsheet,
  Smartphone,
  Camera,
  Coins,
  Pencil,
  Code,
  Check,
  Film,
  TrendingUp,
  Lock
} from 'lucide-react';
import { formatDuration } from '../utils/helpers';
import { Scene, StoryboardViewMode, GoogleUserProfile } from '../types';

interface HeaderProps {
  title: string;
  categoryName: string;
  categoryBadge: string;
  visualFraming?: string;
  scenes: Scene[];
  viewMode: StoryboardViewMode;
  onViewModeChange: (mode: StoryboardViewMode) => void;
  onTitleChange: (newTitle: string) => void;
  onOpenAIGenerator: () => void;
  onOpenHooksModal: () => void;
  onOpenTeleprompter: () => void;
  onOpenExportModal: () => void;
  onOpenProjectsModal: () => void;
  onOpenVideoModal?: () => void;
  onAddScene: () => void;
  onCopyJSON?: () => void;
  isJsonCopied?: boolean;
  googleUser?: GoogleUserProfile | null;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  onLockApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  categoryBadge,
  visualFraming,
  scenes,
  viewMode,
  onViewModeChange,
  onTitleChange,
  onOpenAIGenerator,
  onOpenHooksModal,
  onOpenTeleprompter,
  onOpenExportModal,
  onOpenProjectsModal,
  onOpenVideoModal,
  onAddScene,
  onCopyJSON,
  isJsonCopied,
  googleUser,
  onGoogleLogin,
  onGoogleLogout,
  onLockApp,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const totalDuration = scenes.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md border-b border-[#1b253b] px-4 lg:px-6 py-2.5">
      <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        
        {/* Left: Brand Identity & Active Storyboard Title */}
        <div className="flex items-center justify-between xl:justify-start gap-3.5">
          <div className="flex items-center gap-2.5 pr-3.5 border-r border-[#1e293f]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-900/40">
              U
            </div>
            <div>
              <div className="text-white font-extrabold text-sm tracking-tight leading-none">
                UGC Studio
              </div>
              <div className="text-[9px] font-semibold text-purple-400 tracking-wider uppercase mt-0.5">
                Affiliate Storyboard
              </div>
            </div>
          </div>

          {/* Editable Title */}
          <div className="flex flex-col">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTempTitle(title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-sm md:text-base font-bold text-white bg-[#141c2c] border border-purple-500 rounded-lg px-2.5 py-0.5 outline-none"
              />
            ) : (
              <div
                onClick={() => {
                  setTempTitle(title);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer"
                title="Klik untuk mengganti nama naskah"
              >
                <h1 className="text-white font-bold text-sm md:text-base tracking-tight group-hover:text-purple-300 transition-colors line-clamp-1 max-w-[240px] sm:max-w-xs md:max-w-sm">
                  {title}
                </h1>
                <Pencil className="w-3 h-3 text-slate-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[9px] font-bold text-purple-400 bg-purple-950/80 border border-purple-800/40 px-1.5 py-0.2 rounded uppercase tracking-wider">
                {categoryBadge}
              </span>
              {visualFraming && (
                <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/40 px-1.5 py-0.2 rounded tracking-wider flex items-center gap-1">
                  {visualFraming === 'hands_pov' && '🖐️ Hands POV'}
                  {visualFraming === 'face_closeup' && '👤 Close-up Face'}
                  {visualFraming === 'full_body' && '🧍 Full Body'}
                  {visualFraming === 'mix_framing' && '🔀 Mix Framing'}
                </span>
              )}
              <span className="text-[10px] text-slate-400">
                • {scenes.length} Adegan
              </span>
            </div>
          </div>
        </div>

        {/* Center: Creator Workflow Switcher (6 Dedicated Tools) */}
        <div className="flex items-center self-start xl:self-center bg-[#101625] border border-[#1e293f] p-1 rounded-xl shadow-inner overflow-x-auto max-w-full custom-scrollbar">
          <button
            onClick={() => onViewModeChange('trending_harvest')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'trending_harvest'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-900/40'
                : 'text-amber-400 hover:text-amber-300 hover:bg-[#161d30]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending Harvest</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
              viewMode === 'trending_harvest'
                ? 'bg-slate-950/25 text-slate-950'
                : 'bg-amber-400/20 text-amber-300'
            }`}>
              Shopee
            </span>
          </button>

          <button
            onClick={() => onViewModeChange('cards')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'cards'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Editor Adegan</span>
          </button>

          <button
            onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'table'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tabel Naskah</span>
          </button>

          <button
            onClick={() => onViewModeChange('phone_preview')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'phone_preview'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulasi 9:16</span>
          </button>

          <button
            onClick={() => onViewModeChange('shot_list')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'shot_list'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Shot-List Syuting</span>
          </button>

          <button
            onClick={() => onViewModeChange('rate_card')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              viewMode === 'rate_card'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Rate Card UGC</span>
          </button>
        </div>

        {/* Right: Tools & Primary Actions */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          
          {/* Duration Counter Pill */}
          <div
            className="flex items-center gap-1.5 bg-[#101726] border border-[#1e2a42] rounded-xl px-2.5 py-1 text-xs"
            title="Total durasi semua adegan"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total:
            </span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded text-xs">
              {formatDuration(totalDuration)}
            </span>
          </div>

          {/* Quick Viral Hooks */}
          <button
            onClick={onOpenHooksModal}
            className="flex items-center gap-1 bg-[#121927] hover:bg-[#1b253b] text-amber-300 border border-amber-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Pilih variasi hook 3 detik viral"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hook 3s</span>
          </button>

          {/* Teleprompter for Shooting */}
          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1 bg-[#121927] hover:bg-[#1b253b] text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
            title="Buka Teleprompter layar penuh untuk rekam video"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">Teleprompter</span>
          </button>

          {/* 1-Click Direct Copy JSON Storyboard */}
          {onCopyJSON && (
            <button
              onClick={onCopyJSON}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm border ${
                isJsonCopied
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                  : 'bg-[#121927] hover:bg-purple-950/40 text-purple-300 hover:text-white border-purple-500/40'
              }`}
              title="Salin data struktur JSON lengkap Storyboard ke Clipboard (1 Klik)"
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
          )}

          {/* Export / Share Modal */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 bg-[#121927] hover:bg-[#1b253b] text-slate-200 border border-[#222e47] text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
            title="Download PDF, Naskah TXT, CapCut Cue, atau kelola JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Video Preview & MP4 Export (Client-side FFmpeg) */}
          {onOpenVideoModal && (
            <button
              onClick={onOpenVideoModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-700/90 to-indigo-700/90 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-purple-950/40"
              title="Render storyboard menjadi video MP4 utuh menggunakan FFmpeg di browser"
            >
              <Film className="w-3.5 h-3.5 text-purple-200" />
              <span>Video MP4</span>
            </button>
          )}

          {/* Project Manager Button */}
          <button
            onClick={onOpenProjectsModal}
            className="p-1.5 rounded-xl bg-[#121927] hover:bg-[#1b253b] text-slate-300 border border-[#222e47] transition-all active:scale-95"
            title="Kelola & ganti project naskah"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* Lock App Security Button */}
          {onLockApp && (
            <button
              onClick={onLockApp}
              className="p-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-[#222e47] hover:border-rose-700/50 transition-all active:scale-95"
              title="Kunci Aplikasi (Perlu Password Ilalang@27)"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Google Flow / Account Status Button */}
          <div className="relative">
            {googleUser ? (
              <div>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 bg-[#121927] hover:bg-[#1b253b] border border-emerald-500/40 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
                  title="Akun Google terhubung (Google Flow & Drive Aktif)"
                >
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {(googleUser.displayName || googleUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-emerald-300 hidden md:inline max-w-[90px] truncate">
                    {googleUser.displayName?.split(' ')[0] || 'Google'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f1422] border border-[#23304d] shadow-2xl p-3 z-50 animate-fadeIn space-y-2.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#1f2a42]">
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
                          alt="Google Profile"
                          className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center">
                          {(googleUser.displayName || 'G')[0]}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">
                          {googleUser.displayName || 'Pengguna Google'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {googleUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Google Flow & Drive Terhubung</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Video hasil render dan naskah JSON dapat langsung disimpan ke Google Drive Anda.
                    </p>

                    {onGoogleLogout && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onGoogleLogout();
                        }}
                        className="w-full text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-[#182135] hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-[#243350] hover:border-rose-500/40 transition-all"
                      >
                        Keluar dari Akun Google
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              onGoogleLogin && (
                <button
                  onClick={onGoogleLogin}
                  className="flex items-center gap-1.5 bg-[#121927] hover:bg-[#1c263c] text-slate-200 hover:text-white border border-[#273654] hover:border-slate-500 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm"
                  title="Masuk dengan Google untuk kredensial Google Flow & Drive"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Masuk Google</span>
                </button>
              )
            )}
          </div>

          {/* Primary AI Generator */}
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-950/50 transition-all active:scale-95 border border-purple-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>AI Generate</span>
          </button>

          {/* Quick Add Scene */}
          <button
            onClick={onAddScene}
            className="flex items-center gap-1 bg-purple-900/60 hover:bg-purple-800 text-purple-100 border border-purple-600/40 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
            title="Tambah adegan baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Adegan</span>
          </button>

        </div>
      </div>
    </header>
  );
};
