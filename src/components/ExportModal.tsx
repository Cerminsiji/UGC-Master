import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Download,
  Upload,
  Check,
  Code,
  FileSpreadsheet
} from 'lucide-react';
import { Scene } from '../types';
import { copyToClipboard, formatDuration } from '../utils/helpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryName: string;
  caption?: string;
  scenes: Scene[];
  onImportJSON: (importedScenes: Scene[], importedTitle?: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryName,
  caption,
  scenes,
  onImportJSON,
}) => {
  const [activeTab, setActiveTab] = useState<'caption' | 'table' | 'script' | 'json'>('table');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDuration = scenes.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);

  // Generate plain voiceover script
  const getPlainScript = () => {
    let output = `# ${title.toUpperCase()}\n`;
    output += `Kategori: ${categoryName} | Durasi Total: ${formatDuration(totalDuration)}\n\n`;
    output += `--------------------------------------------------------\n`;
    scenes.forEach((sc, i) => {
      output += `[ADEGAN ${i + 1} - ${sc.duration}s | ${sc.cameraAngle || 'Shot'}]\n`;
      output += `Visual: ${sc.visualAction}\n`;
      if (sc.popupText) output += `Teks Layar: ${sc.popupText}\n`;
      if (sc.soundEffect) output += `SFX: ${sc.soundEffect}\n`;
      output += `DIALOG: "${sc.dialogVO}"\n`;
      if (sc.notesMood) output += `Catatan/Mood: ${sc.notesMood}\n`;
      output += `\n`;
    });
    return output;
  };

  const handleCopyText = async (text: string, type: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ title, category: categoryName, scenes }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_storyboard.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed.scenes)) {
          onImportJSON(parsed.scenes, parsed.title);
          onClose();
        } else if (Array.isArray(parsed)) {
          onImportJSON(parsed);
          onClose();
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#1f2a42] flex items-center justify-between bg-[#131929]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Export & Bagikan Storyboard
              </h2>
              <p className="text-xs text-slate-400">
                Cetak Shooting Board, salin Voiceover script, atau simpan file JSON.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-[#1f2a42] bg-[#111726] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'table'
                ? 'text-purple-400 border-purple-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Shooting Board (PDF Ready)</span>
          </button>

          <button
            onClick={() => setActiveTab('caption')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'caption'
                ? 'text-purple-400 border-purple-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span className="text-amber-400">✨</span>
            <span>Caption & Hashtags (≤150 Karakter)</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'script'
                ? 'text-purple-400 border-purple-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Naskah VO / Script Talent</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'json'
                ? 'text-purple-400 border-purple-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0d121c]">
          
          {/* TAB: Auto Caption & Hashtags */}
          {activeTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Auto Caption & Hashtags Video</h3>
                  <p className="text-xs text-slate-400">
                    Siap salin untuk posting ke TikTok Shop, Shopee Video, atau IG Reels.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyText(caption || '', 'caption')}
                  disabled={!caption}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {copiedType === 'caption' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Caption Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Caption & Hashtags</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#131929] border border-[#212c44] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Konten Caption Postingan
                  </span>
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    (caption?.length || 0) <= 150 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-red-950 text-red-400 border border-red-800/60'
                  }`}>
                    {caption?.length || 0} / 150 Karakter
                  </span>
                </div>

                <div className="p-3 bg-[#0b0e17] rounded-lg border border-[#1b2438] text-sm text-slate-100 font-medium leading-relaxed">
                  {caption || 'Belum ada caption. Generate skrip dengan AI untuk mendapatkan auto caption.'}
                </div>
              </div>
            </div>
          )}
          
          {/* TAB 1: Printable Storyboard Table */}
          {activeTab === 'table' && (
            <div className="space-y-4 print:p-0">
              <div className="flex items-center justify-between pb-3 border-b border-[#212c44]">
                <div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs text-slate-400">
                    Kategori: {categoryName} • Total Durasi: {formatDuration(totalDuration)} ({scenes.length} Adegan)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Table */}
              <div className="overflow-x-auto border border-[#212d47] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#141b2a] text-slate-300 border-b border-[#212d47]">
                      <th className="p-2.5 font-bold uppercase w-16">Adegan</th>
                      <th className="p-2.5 font-bold uppercase w-28">Angle</th>
                      <th className="p-2.5 font-bold uppercase">Aksi Visual</th>
                      <th className="p-2.5 font-bold uppercase">Teks Layar</th>
                      <th className="p-2.5 font-bold uppercase text-amber-400">SFX</th>
                      <th className="p-2.5 font-bold uppercase">Dialog VO</th>
                      <th className="p-2.5 font-bold uppercase w-16 text-right">Durasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e283f] text-slate-200">
                    {scenes.map((sc, i) => (
                      <tr key={sc.id} className="hover:bg-[#121927] transition-colors">
                        <td className="p-2.5 font-bold text-purple-400 align-top">
                          #{i + 1}
                        </td>
                        <td className="p-2.5 font-medium text-slate-300 align-top">
                          {sc.cameraAngle}
                        </td>
                        <td className="p-2.5 align-top leading-relaxed">
                          {sc.visualAction}
                        </td>
                        <td className="p-2.5 font-bold text-sky-400 align-top">
                          {sc.popupText || '-'}
                        </td>
                        <td className="p-2.5 font-medium text-amber-300 italic align-top">
                          {sc.soundEffect || '-'}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-100 align-top">
                          "{sc.dialogVO}"
                        </td>
                        <td className="p-2.5 font-mono text-emerald-400 text-right align-top">
                          {sc.duration}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Script Text */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Naskah lengkap siap dibagikan ke talent / voiceover artist.
                </span>
                <button
                  onClick={() => handleCopyText(getPlainScript(), 'script')}
                  className="flex items-center gap-1 bg-[#182133] hover:bg-purple-900/40 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-800/40 transition-all"
                >
                  {copiedType === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Naskah</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0b0e17] border border-[#212c44] text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                {getPlainScript()}
              </pre>
            </div>
          )}

          {/* TAB 3: JSON */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Data struktur JSON lengkap storyboard.
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#222e47] cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleDownloadJSON}
                    className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#222e47] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(JSON.stringify(scenes, null, 2), 'json')}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                  >
                    {copiedType === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-[#0b0e17] border border-[#212c44] text-xs font-mono text-purple-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                {JSON.stringify({ title, category: categoryName, totalDuration, scenes }, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
