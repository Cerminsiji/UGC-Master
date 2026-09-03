import React, { useState } from 'react';
import {
  Video,
  Eye,
  Type,
  Music2,
  Mic,
  FileText,
  Clock,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  Wand2,
  ImageIcon
} from 'lucide-react';
import { Scene } from '../types';
import { CAMERA_ANGLE_PRESETS, SFX_PRESETS, MOOD_PRESETS } from '../data/categories';

interface SceneCardProps {
  scene: Scene;
  index: number;
  totalScenes: number;
  onUpdate: (updatedScene: Scene) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEnhanceAI: (scene: Scene) => void;
  isEnhancing?: boolean;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  totalScenes,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onEnhanceAI,
  isEnhancing = false,
}) => {
  const [showAngleMenu, setShowAngleMenu] = useState(false);
  const [showSfxMenu, setShowSfxMenu] = useState(false);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [showFlowPrompt, setShowFlowPrompt] = useState(false);
  const [copiedFlow, setCopiedFlow] = useState(false);

  const handleChange = (field: keyof Scene, value: any) => {
    onUpdate({
      ...scene,
      [field]: value,
    });
  };

  const handleDurationChange = (delta: number) => {
    const newDuration = Math.max(1, Math.min(60, (Number(scene.duration) || 1) + delta));
    handleChange('duration', newDuration);
  };

  const handleSyncOverlayFromVoice = () => {
    if (!scene.dialogVO) return;
    const cleaned = scene.dialogVO
      .replace(/^(stop scrolling|kalian wajib tahu|jujur kaget|pantesan viral)[\s,!.-]*/gi, '')
      .trim();
    const words = (cleaned || scene.dialogVO).split(/[,.!?]/)[0].trim().split(/\s+/).slice(0, 4).join(' ');
    const emoji = index === 0 ? '😱' : index === totalScenes - 1 ? '🔥' : '✨';
    handleChange('popupText', `${words.toUpperCase()}! ${emoji}`);
  };

  const handleCopyFlowPrompt = () => {
    const text = scene.googleFlowPrompt || scene.visualAction;
    navigator.clipboard.writeText(text);
    setCopiedFlow(true);
    setTimeout(() => setCopiedFlow(false), 2000);
  };

  return (
    <div
      id={`scene-card-${scene.id}`}
      className="bg-[#101623] hover:bg-[#121927] border border-[#1d273c] hover:border-[#2b3a59] rounded-2xl p-4 md:p-5 transition-all shadow-lg shadow-black/30 relative group"
    >
      {/* Card Header matching the purple ADEGAN badge & right buttons */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1b253a]/80">
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-purple-300 border border-purple-500/40 text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
            ADEGAN {index + 1}
          </span>
          {index === 0 && (
            <span className="bg-amber-950/60 text-amber-300 border border-amber-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Hook 3 Detik
            </span>
          )}
          {index === totalScenes - 1 && totalScenes > 1 && (
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              CTA / Closing
            </span>
          )}
        </div>

        {/* Action icons on header: Up, Down, Duplicate, AI Polish, Delete */}
        <div className="flex items-center gap-1 bg-[#151c2d] border border-[#222e47] rounded-lg p-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className={`p-1.5 rounded transition-colors ${
              index === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-[#202b42]'
            }`}
            title="Pindahkan adegan ke atas"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalScenes - 1}
            className={`p-1.5 rounded transition-colors ${
              index === totalScenes - 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-[#202b42]'
            }`}
            title="Pindahkan adegan ke bawah"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#202b42] transition-colors"
            title="Duplikat adegan ini"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEnhanceAI(scene)}
            disabled={isEnhancing}
            className="p-1.5 rounded text-purple-400 hover:text-purple-200 hover:bg-purple-900/40 transition-colors"
            title="Poles adegan ini dengan AI"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onDelete}
            disabled={totalScenes <= 1}
            className={`p-1.5 rounded transition-colors ${
              totalScenes <= 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40'
            }`}
            title="Hapus adegan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="space-y-4">
        
        {/* ROW 1: Angle Kamera (Left) & Aksi Visual / Adegan (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Angle Kamera */}
          <div className="lg:col-span-4 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Eye className="w-3 h-3 text-purple-400" />
                <span>ANGLE KAMERA</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAngleMenu(!showAngleMenu)}
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
              >
                <span>Pilih</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            
            <input
              type="text"
              value={scene.cameraAngle}
              onChange={(e) => handleChange('cameraAngle', e.target.value)}
              placeholder="e.g. Medium Shot, Close-up, POV"
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />

            {/* Dropdown Preset Angles */}
            {showAngleMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#141b29] border border-[#2b3a58] rounded-xl shadow-2xl z-20 p-1.5 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                  Pilihan Angle Populer
                </div>
                {CAMERA_ANGLE_PRESETS.map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => {
                      handleChange('cameraAngle', angle);
                      setShowAngleMenu(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-purple-900/40 hover:text-purple-200 transition-colors flex items-center justify-between"
                  >
                    <span>{angle}</span>
                    {scene.cameraAngle === angle && (
                      <Check className="w-3 h-3 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Aksi Visual / Adegan */}
          <div className="lg:col-span-8">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <Video className="w-3 h-3 text-indigo-400" />
              <span>AKSI VISUAL / ADEGAN</span>
            </label>
            <textarea
              rows={2}
              value={scene.visualAction}
              onChange={(e) => handleChange('visualAction', e.target.value)}
              placeholder="Deskripsikan apa yang dilakukan talent, ekspresi, properti, dan pergerakan kamera..."
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

        </div>

        {/* ROW 2: Teks Pop-up (Layar), Efek Suara (SFX), Dialog / Voice Over */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Teks Pop-up (Layar) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Type className="w-3 h-3 text-sky-400" />
                <span>TEKS POP-UP (LAYAR)</span>
              </label>
              {scene.dialogVO && (
                <button
                  type="button"
                  onClick={handleSyncOverlayFromVoice}
                  className="text-[10px] text-sky-300 hover:text-sky-200 flex items-center gap-1 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-600/40 px-1.5 py-0.5 rounded transition-colors"
                  title="Sinkronkan teks overlay langsung dari intisari dialog voice over"
                >
                  <Wand2 className="w-2.5 h-2.5" />
                  <span>Sync VO</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={scene.popupText}
              onChange={(e) => handleChange('popupText', e.target.value)}
              placeholder="e.g. DIET GAGAL MULU?!"
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-purple-500 rounded-xl px-3 py-2 text-sm font-bold text-sky-300 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Efek Suara (SFX) - Highlighted in yellow text per screenshot */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Music2 className="w-3 h-3 text-amber-400" />
                <span>EFEK SUARA (SFX)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSfxMenu(!showSfxMenu)}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              >
                <span>Pilih</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <input
              type="text"
              value={scene.soundEffect}
              onChange={(e) => handleChange('soundEffect', e.target.value)}
              placeholder="e.g. Phone ring & sigh, Swoosh"
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-amber-500/80 rounded-xl px-3 py-2 text-sm font-medium text-amber-300 placeholder-slate-500 outline-none transition-colors italic"
            />

            {/* Dropdown Preset SFX */}
            {showSfxMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-60 overflow-y-auto bg-[#141b29] border border-[#2b3a58] rounded-xl shadow-2xl z-20 p-1.5 space-y-1 custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                  SFX Viral TikTok
                </div>
                {SFX_PRESETS.map((sfx) => (
                  <button
                    key={sfx}
                    type="button"
                    onClick={() => {
                      handleChange('soundEffect', sfx);
                      setShowSfxMenu(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-amber-200 hover:bg-amber-950/50 hover:text-amber-100 transition-colors flex items-center justify-between"
                  >
                    <span>{sfx}</span>
                    {scene.soundEffect === sfx && (
                      <Check className="w-3 h-3 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dialog / Voice Over */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <Mic className="w-3 h-3 text-rose-400" />
              <span>DIALOG / VOICE OVER</span>
            </label>
            <input
              type="text"
              value={scene.dialogVO}
              onChange={(e) => handleChange('dialogVO', e.target.value)}
              placeholder="e.g. Diet gagal mulu, pusing!"
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

        </div>

        {/* ROW 3: Catatan / Mood (Left) & Durasi (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1">
          
          {/* Catatan / Mood */}
          <div className="lg:col-span-9 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>CATATAN / MOOD</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMoodMenu(!showMoodMenu)}
                className="text-[10px] text-slate-400 hover:text-slate-300 flex items-center gap-0.5"
              >
                <span>Template Mood</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <input
              type="text"
              value={scene.notesMood}
              onChange={(e) => handleChange('notesMood', e.target.value)}
              placeholder="e.g. Gaya teks: Chat Bubble. Pencahayaan redup dramatis."
              className="w-full bg-[#141b29] border border-[#222e47] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 outline-none transition-colors"
            />

            {/* Dropdown Preset Moods */}
            {showMoodMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-80 max-h-60 overflow-y-auto bg-[#141b29] border border-[#2b3a58] rounded-xl shadow-2xl z-20 p-1.5 space-y-1 custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                  Catatan Visual & Teks
                </div>
                {MOOD_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      handleChange('notesMood', m);
                      setShowMoodMenu(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-[#202b42] hover:text-white transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Durasi Widget matching the screenshot */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end">
            <div className="flex items-center gap-2 bg-[#141b29] border border-[#222e47] rounded-xl px-3 py-1.5">
              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>DURASI</span>
              </label>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => handleDurationChange(-1)}
                  className="w-5 h-5 rounded bg-[#1c263a] hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 flex items-center justify-center text-xs transition-colors"
                  title="Kurangi 1 detik"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>

                <input
                  type="number"
                  min={1}
                  max={60}
                  value={scene.duration}
                  onChange={(e) => handleChange('duration', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-8 text-center bg-[#0d121c] border border-[#2b3a58] rounded text-xs font-bold text-purple-300 py-0.5 outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleDurationChange(1)}
                  className="w-5 h-5 rounded bg-[#1c263a] hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 flex items-center justify-center text-xs transition-colors"
                  title="Tambah 1 detik"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  DTK
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 4: Google Flow Prompt & Image Generator Assistant */}
        <div className="pt-2 border-t border-[#1a2337]/80 mt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFlowPrompt(!showFlowPrompt)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 hover:text-purple-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>GOOGLE FLOW & IMAGEN PROMPT</span>
              <span className="bg-purple-950/80 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30">
                Visual Consistency
              </span>
              {showFlowPrompt ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleCopyFlowPrompt}
              className="flex items-center gap-1 text-[10px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 px-2 py-1 rounded-lg transition-colors"
              title="Salin prompt Google Flow untuk adegan ini"
            >
              {copiedFlow ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Flow Prompt</span>
                </>
              )}
            </button>
          </div>

          {showFlowPrompt && (
            <div className="mt-2 bg-[#0c101a] border border-[#1d273f] rounded-xl p-3 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Prompt photorealistic sesuai referensi kemasan & konsistensi Google Flow:</span>
              </div>
              <textarea
                rows={2}
                value={scene.googleFlowPrompt || ''}
                onChange={(e) => handleChange('googleFlowPrompt', e.target.value)}
                placeholder="smartphone handheld POV, authentic packaging of product, realistic lighting, organic human skin texture, TikTok UGC aesthetic --no cgi, 3d render"
                className="w-full bg-[#111726] border border-[#1f2b43] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-purple-200 placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
