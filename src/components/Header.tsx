import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Settings,
  Tv,
  Download,
  Flame,
  FolderOpen,
  Check,
  Plus,
  BrainCircuit,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { formatDuration } from '../utils/helpers';
import { Scene } from '../types';

interface HeaderProps {
  title: string;
  categoryName: string;
  categoryBadge: string;
  scenes: Scene[];
  onTitleChange: (newTitle: string) => void;
  onOpenTrendingHarvest: () => void;
  onOpenMarketRealCheck: () => void;
  onOpenLearningCenter: () => void;
  onOpenProductDatabase: () => void;
  onOpenAIGenerator: () => void;
  onOpenHooksModal: () => void;
  onOpenTeleprompter: () => void;
  onOpenExportModal: () => void;
  onOpenProjectsModal: () => void;
  onCopyJSON: () => void;
  copiedJSON: boolean;
  onAddScene: () => void;
  onAutoOptimize?: () => void;
  isAutoOptimizing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  categoryBadge,
  scenes,
  onTitleChange,
  onOpenTrendingHarvest,
  onOpenMarketRealCheck,
  onOpenLearningCenter,
  onOpenProductDatabase,
  onOpenAIGenerator,
  onOpenHooksModal,
  onOpenTeleprompter,
  onOpenExportModal,
  onOpenProjectsModal,
  onCopyJSON,
  copiedJSON,
  onAddScene,
  onAutoOptimize,
  isAutoOptimizing = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

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
    <header className="sticky top-0 z-30 bg-[#0c1017]/95 backdrop-blur-md border-b border-[#1f293d] px-4 lg:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Left Side: Brand Logo & Current Storyboard Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-[#1f293d]/80">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/30 text-white font-black text-lg">
              U
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight leading-none">
                UGC Master
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-purple-400/90 uppercase mt-0.5">
                CREATOR STUDIO
              </div>
            </div>
          </div>

          {/* Title & Tag */}
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
                className="text-base font-bold text-white bg-[#161f30] border border-purple-500 rounded px-2 py-0.5 outline-none"
              />
            ) : (
              <div
                onClick={() => {
                  setTempTitle(title);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer"
                title="Klik untuk mengubah judul"
              >
                <h1 className="text-white font-bold text-base md:text-lg tracking-tight group-hover:text-purple-300 transition-colors">
                  {title}
                </h1>
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎
                </span>
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              {categoryBadge}
            </span>
          </div>
        </div>

        {/* Right Side: Total Duration & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          
          {/* Total Duration Widget */}
          <div className="flex items-center gap-2 bg-[#121926] border border-[#212d44] rounded-lg px-2.5 py-1.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              DURASI
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 tracking-wider">
              {formatDuration(totalDuration)}
            </span>
          </div>

          {/* Trending Harvest Button */}
          <button
            id="header-trending-harvest-btn"
            onClick={onOpenTrendingHarvest}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            title="Buka Trending Harvest 2.0 (Growth Velocity & Celah Konten)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Trending Harvest</span>
          </button>

          {/* Market Real-Check 2.0 Button */}
          <button
            id="header-market-real-check-btn"
            onClick={onOpenMarketRealCheck}
            className="flex items-center gap-1.5 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 hover:text-purple-200 border border-purple-500/40 hover:border-purple-400 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            title="Buka Market Real-Check 2.0 (Validasi Kelayakan & Celah Konten)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Real-Check 2.0</span>
          </button>

          {/* Market & User Learning Center Button */}
          <button
            id="header-learning-center-btn"
            onClick={onOpenLearningCenter}
            className="flex items-center gap-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 hover:border-indigo-400 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            title="Pusat Pembelajaran AI Pasar & Feedback User"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Belajar AI</span>
          </button>

          {/* Database Produk & Google Flow Prompts */}
          <button
            id="header-product-database-btn"
            onClick={onOpenProductDatabase}
            className="flex items-center gap-1.5 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 hover:text-purple-200 border border-purple-500/40 hover:border-purple-400 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            title="Database Produk & Google Flow Prompts Tersimpan"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Database Produk</span>
          </button>

          {/* AI Auto Optimize Button (V2.0 1-Click Engine) */}
          {onAutoOptimize && (
            <button
              id="header-ai-auto-optimize-btn"
              onClick={onAutoOptimize}
              disabled={isAutoOptimizing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-extrabold px-3 py-2 rounded-lg shadow-md shadow-emerald-950/50 transition-all active:scale-95 border border-emerald-400/40 disabled:opacity-50"
              title="1-Click AI Auto Optimize (Product Intelligence, 10s Retention, Audit & Scores)"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-200 ${isAutoOptimizing ? 'animate-spin' : ''}`} />
              <span>{isAutoOptimizing ? 'Optimizing...' : 'AI Auto Optimize'}</span>
            </button>
          )}

          {/* AI Generate Button */}
          <button
            id="header-ai-generate-btn"
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-purple-900/30 transition-all active:scale-95 border border-purple-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>AI Generate</span>
          </button>

          {/* Quick Viral Hook Helper */}
          <button
            id="header-viral-hooks-btn"
            onClick={onOpenHooksModal}
            className="flex items-center gap-1.5 bg-[#151c2d] hover:bg-[#1e2840] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 text-xs font-semibold px-2.5 py-2 rounded-lg transition-all shadow-sm active:scale-95"
            title="Pilih Variasi Hook 3 Detik Viral"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Viral Hooks</span>
          </button>

          {/* Copy JSON Button */}
          <button
            onClick={onCopyJSON}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95 border ${
              copiedJSON
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-[#151c2d] hover:bg-[#1d273f] text-slate-200 border-[#222e47]'
            }`}
            title="Salin data storyboard sebagai JSON"
          >
            {copiedJSON ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          {/* Teleprompter / Shooting Companion Button */}
          <button
            onClick={onOpenTeleprompter}
            className="flex items-center gap-1.5 bg-[#151c2d] hover:bg-[#1d273f] text-slate-200 border border-[#222e47] text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95"
            title="Mode Teleprompter & Recording Player"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">Teleprompter</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 bg-[#151c2d] hover:bg-[#1d273f] text-slate-200 border border-[#222e47] text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95"
            title="Export Script / PDF / TXT"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden xl:inline">Export</span>
          </button>

          {/* Project Manager Button */}
          <button
            onClick={onOpenProjectsModal}
            className="p-2 rounded-lg bg-[#151c2d] hover:bg-[#1d273f] text-slate-300 border border-[#222e47] transition-all active:scale-95"
            title="Kelola Project & Template Tersimpan"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* Quick Add Scene Mobile/Desktop */}
          <button
            onClick={onAddScene}
            className="flex items-center gap-1 bg-purple-700/60 hover:bg-purple-600 text-purple-100 border border-purple-500/40 text-xs font-semibold px-2.5 py-2 rounded-lg transition-all active:scale-95"
            title="Tambah Adegan Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adegan</span>
          </button>

        </div>
      </div>
    </header>
  );
};
