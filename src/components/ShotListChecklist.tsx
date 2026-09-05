import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
  Sparkles,
  Camera,
  Layers,
  ShoppingBag,
  Mic,
  RotateCcw
} from 'lucide-react';
import { Scene, ShotItem } from '../types';
import { copyToClipboard, generateId } from '../utils/helpers';

interface ShotListChecklistProps {
  scenes: Scene[];
  shotList: ShotItem[];
  title: string;
  categoryName: string;
  onUpdateShotList: (items: ShotItem[]) => void;
}

export const ShotListChecklist: React.FC<ShotListChecklistProps> = ({
  scenes,
  shotList,
  title,
  categoryName,
  onUpdateShotList,
}) => {
  const [filterType, setFilterType] = useState<string>('Semua');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<ShotItem['type']>('B-Roll (Produk/Tangan)');
  const [newProps, setNewProps] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate shot list from scenes if empty or user requests
  const handleAutoGenerate = () => {
    const generated: ShotItem[] = [];

    scenes.forEach((sc, idx) => {
      // 1. A-Roll or primary talent shot
      if (sc.dialogVO && sc.dialogVO.trim().length > 0) {
        generated.push({
          id: generateId(),
          type: 'A-Roll (Talent/Muka)',
          description: `Adegan ${idx + 1} (${sc.cameraAngle || 'Shot'}): Dialog: "${sc.dialogVO}"`,
          sceneRef: idx + 1,
          propsNeeded: sc.notesMood || 'Lighting ring light, mic clip-on',
          isCompleted: false,
        });
      }

      // 2. B-Roll action or product cutaway
      if (sc.visualAction) {
        const isMacro =
          sc.visualAction.toLowerCase().includes('tekstur') ||
          sc.visualAction.toLowerCase().includes('oles') ||
          sc.visualAction.toLowerCase().includes('tetes') ||
          sc.visualAction.toLowerCase().includes('seduh') ||
          sc.cameraAngle?.toLowerCase().includes('close-up');

        generated.push({
          id: generateId(),
          type: isMacro ? 'Detail Tekstur/Unboxing' : 'B-Roll (Produk/Tangan)',
          description: `Adegan ${idx + 1}: ${sc.visualAction}`,
          sceneRef: idx + 1,
          propsNeeded: 'Produk fisik & pencahayaan tajam',
          isCompleted: false,
        });
      }

      // 3. Foley or sound effect
      if (sc.soundEffect && sc.soundEffect.trim() !== '-' && sc.soundEffect.trim() !== '') {
        generated.push({
          id: generateId(),
          type: 'Audio Foley/SFX',
          description: `Rekam suara asli / siapkan SFX: ${sc.soundEffect}`,
          sceneRef: idx + 1,
          propsNeeded: 'Rekam Foley asli saat syuting atau pakai library SFX',
          isCompleted: false,
        });
      }
    });

    onUpdateShotList(generated);
  };

  const handleToggleItem = (id: string) => {
    const updated = shotList.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onUpdateShotList(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = shotList.filter((item) => item.id !== id);
    onUpdateShotList(updated);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const newItem: ShotItem = {
      id: generateId(),
      type: newType,
      description: newDesc.trim(),
      sceneRef: 1,
      propsNeeded: newProps.trim() || undefined,
      isCompleted: false,
    };

    onUpdateShotList([...shotList, newItem]);
    setNewDesc('');
    setNewProps('');
  };

  const totalShots = shotList.length;
  const completedShots = shotList.filter((s) => s.isCompleted).length;
  const percent = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

  const filteredShots = shotList.filter((item) => {
    if (filterType === 'Semua') return true;
    return item.type.includes(filterType);
  });

  const handleCopyWhatsApp = async () => {
    let msg = `🎬 *SHOT-LIST & CHECKLIST SYUTING*\n`;
    msg += `Project: *${title}* (${categoryName})\n`;
    msg += `Progress: ${completedShots}/${totalShots} Shot Selesai (${percent}%)\n\n`;

    shotList.forEach((item, idx) => {
      const mark = item.isCompleted ? '✅ [SELESAI]' : '⬜ [BELUM]';
      msg += `${idx + 1}. ${mark} *${item.type}* (Adegan ${item.sceneRef})\n`;
      msg += `   Aksi: ${item.description}\n`;
      if (item.propsNeeded) msg += `   Properti: ${item.propsNeeded}\n`;
      msg += `\n`;
    });

    const ok = await copyToClipboard(msg);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0f1422] border border-[#1e293f] rounded-2xl p-5 shadow-2xl space-y-5">
      
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c273e]">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Shot-List & Checklist B-Roll Syuting
            </h3>
            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded-full font-bold">
              Produksi Video
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar footage wajib (A-Roll & B-Roll produk) agar tidak ada rekaman yang kurang saat masuk proses editing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 transition-all active:scale-95"
            title="Ekstrak otomatis daftar shot dari naskah storyboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{totalShots === 0 ? 'Ekstrak dari Naskah' : 'Refresh dari Naskah'}</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            disabled={totalShots === 0}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#161f31] hover:bg-[#202c46] text-slate-200 border border-[#212c44] transition-all active:scale-95 disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Format WA Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Checklist ke WA</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-xl bg-[#161f31] hover:bg-[#202c46] text-slate-400 hover:text-slate-200 border border-[#212c44] transition-colors"
            title="Print Lembar Syuting"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalShots > 0 && (
        <div className="p-3.5 rounded-xl bg-[#121826] border border-[#1f2b42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-white">
                Progress Syuting: <span className="text-emerald-400">{completedShots}</span> / {totalShots} Shot ({percent}%)
              </span>
              <span className={`text-[11px] font-bold ${percent === 100 ? 'text-emerald-400' : 'text-purple-300'}`}>
                {percent === 100 ? '🎉 Semua Footage Selesai!' : 'Siap Syuting & Centang'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#0b0f19] rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['Semua', 'A-Roll', 'B-Roll', 'Detail Tekstur', 'Audio Foley'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-[#121927] text-slate-400 hover:text-slate-200 border border-[#1f2b42]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {totalShots === 0 ? (
        <div className="p-8 rounded-2xl bg-[#111726] border border-dashed border-[#22304d] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-600/40 flex items-center justify-center text-purple-300 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Belum Ada Daftar Shot Syuting</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Klik tombol di bawah untuk mengekstrak seluruh kebutuhan A-Roll, B-Roll produk, dan SFX dari naskah storyboard Anda secara otomatis!
          </p>
          <button
            onClick={handleAutoGenerate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Ekstrak Otomatis dari Storyboard</span>
          </button>
        </div>
      ) : (
        /* Shot Items Checklist */
        <div className="space-y-2.5">
          {filteredShots.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group select-none ${
                item.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/40 opacity-70'
                  : 'bg-[#121826] hover:bg-[#161f30] border-[#1f2b42]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  className="mt-0.5 text-purple-400 group-hover:text-purple-300 shrink-0"
                >
                  {item.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 group-hover:text-purple-400" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        item.type.includes('A-Roll')
                          ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
                          : item.type.includes('Detail')
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                          : item.type.includes('Audio')
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                          : 'bg-sky-950/80 text-sky-300 border-sky-700/50'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Adegan {item.sceneRef}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-medium leading-relaxed ${
                      item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
                    }`}
                  >
                    {item.description}
                  </p>

                  {item.propsNeeded && (
                    <p className="text-[11px] text-amber-400/90 italic">
                      📦 Properti/Lighting: {item.propsNeeded}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(item.id);
                }}
                className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                title="Hapus shot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Shot Form */}
      <form
        onSubmit={handleAddCustomItem}
        className="p-3.5 rounded-xl bg-[#0c101a] border border-[#1b253b] space-y-3"
      >
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-purple-400" />
          <span>Tambah Shot Kustom</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full bg-[#121826] border border-[#212d44] focus:border-purple-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="A-Roll (Talent/Muka)">A-Roll (Talent/Muka)</option>
              <option value="B-Roll (Produk/Tangan)">B-Roll (Produk/Tangan)</option>
              <option value="Detail Tekstur/Unboxing">Detail Tekstur/Unboxing</option>
              <option value="Audio Foley/SFX">Audio Foley/SFX</option>
            </select>
          </div>

          <div className="sm:col-span-8">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Deskripsi shot (e.g. B-Roll teteskan serum ke pipi close-up slow-mo)..."
              className="w-full bg-[#121826] border border-[#212d44] focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={newProps}
            onChange={(e) => setNewProps(e.target.value)}
            placeholder="Catatan properti / lighting tambahan (opsional)..."
            className="flex-1 bg-[#121826] border border-[#212d44] focus:border-purple-500 rounded-xl px-3 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />

          <button
            type="submit"
            disabled={!newDesc.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            Tambah Shot
          </button>
        </div>
      </form>

    </div>
  );
};
