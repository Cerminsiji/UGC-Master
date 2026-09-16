import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Printer,
  Copy,
  Download,
  Upload,
  Check,
  Code,
  FileSpreadsheet,
  Sparkles,
  Loader2,
  AlertCircle,
  Video,
  Film,
  Cloud,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Scene, HookVariant, GoogleUserProfile, StoryboardProject } from '../types';
import { copyToClipboard, formatDuration, sanitizeStoryboardForJSON } from '../utils/helpers';
import { uploadProjectToDrive, DriveUploadResult } from '../services/googleDrive';
import { constructGoogleFlowPrompt } from '../data/flowSecretCodes';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryName: string;
  caption?: string;
  scenes: Scene[];
  hookVariants?: HookVariant[];
  initialTab?: 'table' | 'flow' | 'caption' | 'script' | 'capcut' | 'json';
  onImportJSON: (importedScenes: Scene[], importedTitle?: string) => void;
  onOpenVideoModal?: () => void;
  googleUser?: GoogleUserProfile | null;
  googleAccessToken?: string | null;
  onGoogleLogin?: () => Promise<void> | void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryName,
  caption: initialCaption,
  scenes,
  hookVariants,
  initialTab = 'table',
  onImportJSON,
  onOpenVideoModal,
  googleUser,
  googleAccessToken,
  onGoogleLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'flow' | 'caption' | 'script' | 'capcut' | 'json'>(initialTab);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [caption, setCaption] = useState(initialCaption || '');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Google Drive project save
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveResult, setDriveSaveResult] = useState<DriveUploadResult | null>(null);
  const [driveSaveError, setDriveSaveError] = useState<string | null>(null);

  const handleSaveProjectToDrive = async () => {
    if (!googleUser || !googleAccessToken) {
      if (onGoogleLogin) await onGoogleLogin();
      return;
    }

    setIsSavingToDrive(true);
    setDriveSaveError(null);

    const projectPayload: StoryboardProject = {
      id: `proj_${Date.now()}`,
      title,
      categoryId: categoryName.toLowerCase().replace(/\s+/g, '-'),
      productName: title,
      targetAudience: 'Target Audience UGC',
      caption,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes,
      hookVariants,
    };

    try {
      const result = await uploadProjectToDrive({
        project: projectPayload,
        accessToken: googleAccessToken,
      });
      setDriveSaveResult(result);
    } catch (err: any) {
      console.error('Save project to drive error:', err);
      setDriveSaveError(err.message || 'Gagal menyimpan naskah ke Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialCaption) {
      setCaption(initialCaption);
    }
  }, [initialCaption]);

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

  // Generate CapCut subtitle and sticker cue
  const getCapCutCueText = () => {
    let output = `🎬 FORMAT CAPCUT & TIKTOK VIDEO EDITOR: ${title.toUpperCase()}\n`;
    output += `Total Durasi: ${totalDuration}s\n\n`;
    output += `=== 📌 1. STIKER TEKS POP-UP LAYAR (TEMPEL KE CAPCUT TEXT TRACK) ===\n`;
    let accumulatedTime = 0;
    scenes.forEach((sc, i) => {
      const start = accumulatedTime;
      const end = accumulatedTime + (Number(sc.duration) || 3);
      accumulatedTime = end;
      const startStr = `00:${String(start).padStart(2, '0')}`;
      const endStr = `00:${String(end).padStart(2, '0')}`;
      output += `[${startStr} - ${endStr}] Adegan ${i + 1}: ${sc.popupText || '(Tanpa Teks)'}\n`;
    });

    output += `\n=== 🎙️ 2. SUBTITLE / VOICE OVER TRACK ===\n`;
    accumulatedTime = 0;
    scenes.forEach((sc, i) => {
      const start = accumulatedTime;
      const end = accumulatedTime + (Number(sc.duration) || 3);
      accumulatedTime = end;
      const startStr = `00:${String(start).padStart(2, '0')}`;
      const endStr = `00:${String(end).padStart(2, '0')}`;
      output += `[${startStr} - ${endStr}] Adegan ${i + 1}: "${sc.dialogVO || ''}"\n`;
      if (sc.soundEffect) {
        output += `  ↳ SFX: ${sc.soundEffect}\n`;
      }
    });

    return output;
  };

  // Generate Google Flow AI hidden prompts text
  const getFlowPromptsText = () => {
    let output = `⚡ GOOGLE FLOW AI SECRET CODES & CINEMATIC PROMPTS: ${title.toUpperCase()}\n`;
    output += `Kategori: ${categoryName} | Total Adegan: ${scenes.length} | Durasi Total: ${formatDuration(totalDuration)}\n`;
    output += `Platform Video AI: Google Flow / Veo / Kling AI / OpenAI Sora / Runway Gen-3\n`;
    output += `Panduan: Salin prompt tiap adegan ke video generator AI Anda untuk menjaga konsistensi visual dan pergerakan kamera tanpa distorsi.\n\n`;
    output += `========================================================\n\n`;

    scenes.forEach((sc, i) => {
      const code = sc.flowSecretCode || (i === 0 ? '/dollyin' : i === scenes.length - 1 ? '/dollyout' : '/orbit360');
      const movement = sc.cameraMovement || sc.cameraAngle || 'Smooth cinematic movement';
      const prompt = sc.flowPrompt || constructGoogleFlowPrompt({
        ...sc,
        flowSecretCode: code,
        cameraMovement: movement
      }, title);

      output += `[ADEGAN ${i + 1} - ${sc.duration}s | Code: ${code}]\n`;
      output += `Gerakan Kamera: ${movement}\n`;
      output += `Aksi Visual: ${sc.visualAction}\n`;
      output += `PROMPT FLOW:\n${prompt}\n\n`;
    });

    return output;
  };

  const handleDownloadFlowPrompts = () => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(getFlowPromptsText());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_flow_prompts.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyText = async (text: string, type: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const getFullStoryboardJSON = () => {
    const rawData = {
      title,
      category: categoryName,
      totalDuration,
      caption,
      hookVariants,
      scenes,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(sanitizeStoryboardForJSON(rawData), null, 2);
  };

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(getFullStoryboardJSON());
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

    setUploadError(null);
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
        } else {
          setUploadError('Format JSON tidak sesuai: harus berisi array adegan (scenes).');
        }
      } catch {
        setUploadError('Format file JSON tidak valid. Pastikan file berformat JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: title,
          category: categoryName,
          keySellingPoints: scenes.map((s) => s.popupText).filter(Boolean).slice(0, 3).join(', '),
        }),
      });
      const data = await res.json();
      if (data.success && data.caption) {
        setCaption(data.caption);
      }
    } catch (e) {
      console.error('Failed to generate caption:', e);
    } finally {
      setIsGeneratingCaption(false);
    }
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
                Cetak Shooting Board, format CapCut timeline cue, salin Voiceover script, atau simpan JSON.
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
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'flow'
                ? 'text-cyan-400 border-cyan-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Flow Prompts</span>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.2 rounded font-mono font-bold">
              AI Video
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capcut')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'capcut'
                ? 'text-purple-400 border-purple-500 bg-[#161f31]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-sky-400" />
            <span>Format CapCut & Editor</span>
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
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON Storyboard</span>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.2 rounded font-mono">
              Salin / Unduh
            </span>
          </button>

          {onOpenVideoModal && (
            <button
              onClick={() => {
                onClose();
                onOpenVideoModal();
              }}
              className="ml-auto flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-purple-950/50 transition-all active:scale-95 whitespace-nowrap mb-1"
              title="Render storyboard menjadi video MP4 dengan FFmpeg"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Export Video MP4 (FFmpeg)</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          
          {/* TAB 1: SHOOTING BOARD TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Pratinjau lembar produksi video untuk tim syuting dan klien.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(getPlainScript(), 'table')}
                    className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#222e47] transition-all"
                  >
                    {copiedType === 'table' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Table */}
              <div className="p-5 bg-white text-slate-900 rounded-xl overflow-x-auto shadow" id="printable-board">
                <div className="border-b pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-black tracking-tight">{title}</h1>
                    <p className="text-xs text-slate-500">
                      Kategori: {categoryName} • Total Durasi: {formatDuration(totalDuration)} ({totalDuration} detik)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md">
                      Shooting Storyboard
                    </span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-700">
                      <th className="py-2 px-2 font-bold w-12">#</th>
                      <th className="py-2 px-2 font-bold w-16">Durasi</th>
                      <th className="py-2 px-2 font-bold w-48">Angle & Visual</th>
                      <th className="py-2 px-2 font-bold w-36">Teks Pop-up</th>
                      <th className="py-2 px-2 font-bold">Voiceover / Dialog</th>
                      <th className="py-2 px-2 font-bold w-28">SFX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scenes.map((sc, i) => (
                      <tr key={sc.id} className="align-top">
                        <td className="py-2.5 px-2 font-bold text-purple-700">{i + 1}</td>
                        <td className="py-2.5 px-2 font-mono font-bold text-emerald-700">{sc.duration}s</td>
                        <td className="py-2.5 px-2">
                          {sc.cameraAngle && (
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px] mr-1">
                              {sc.cameraAngle}
                            </span>
                          )}
                          <p className="mt-0.5">{sc.visualAction}</p>
                        </td>
                        <td className="py-2.5 px-2 font-bold text-sky-800">{sc.popupText || '-'}</td>
                        <td className="py-2.5 px-2 italic font-medium">"{sc.dialogVO || '-'}"</td>
                        <td className="py-2.5 px-2 text-amber-700 text-[11px]">{sc.soundEffect || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE FLOW AI SECRET CODES & PROMPTS */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-[#111928] to-[#121a2c] border border-cyan-500/40 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-cyan-200 block">
                      Google Flow AI Secret Codes & Cinematic Video Prompts
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Format prompt pergerakan kamera ultra sinematik siap tempel ke Google Flow, Veo, Sora, Kling AI, dan Runway Gen-3.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    onClick={handleDownloadFlowPrompts}
                    className="flex items-center gap-1.5 bg-[#142036] hover:bg-[#1a2b4a] text-cyan-300 border border-cyan-700/50 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                    title="Unduh seluruh prompt dalam format text .txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(getFlowPromptsText(), 'flow_all')}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {copiedType === 'flow_all' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Semua Prompt Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Semua Prompt Flow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Individual Scene Flow Prompt Cards */}
              <div className="grid grid-cols-1 gap-3">
                {scenes.map((sc, i) => {
                  const code = sc.flowSecretCode || (i === 0 ? '/dollyin' : i === scenes.length - 1 ? '/dollyout' : '/orbit360');
                  const movement = sc.cameraMovement || sc.cameraAngle || 'Smooth cinematic movement';
                  const prompt = sc.flowPrompt || constructGoogleFlowPrompt({
                    ...sc,
                    flowSecretCode: code,
                    cameraMovement: movement
                  }, title);
                  const isCopied = copiedType === `flow_sc_${i}`;

                  return (
                    <div
                      key={sc.id || i}
                      className="p-3.5 rounded-xl bg-[#0e1422] border border-[#202c44] hover:border-cyan-600/50 transition-all space-y-2 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-[#162136] border border-slate-700">
                            Adegan {i + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                            {code}
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {movement}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {sc.duration} detik
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyText(prompt, `flow_sc_${i}`)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all self-end sm:self-auto ${
                            isCopied
                              ? 'bg-emerald-500 text-black shadow'
                              : 'bg-[#152033] hover:bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 hover:border-cyan-500'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Prompt Adegan {i + 1}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Visual:</strong> {sc.visualAction}
                      </p>

                      <div className="p-2.5 rounded-lg bg-[#070b12] border border-cyan-950 text-xs font-mono text-cyan-200 leading-relaxed break-words select-all">
                        {prompt}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Raw Output Container */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Raw Batch Prompts (Semua Adegan Sekaligus):
                  </span>
                  <button
                    onClick={() => handleCopyText(getFlowPromptsText(), 'flow_raw')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedType === 'flow_raw' ? 'Tersalin!' : 'Salin Raw'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#080c14] border border-[#1d273e] text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                  {getFlowPromptsText()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: CAPCUT & VIDEO EDITOR FORMAT */}
          {activeTab === 'capcut' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Cue Sheet CapCut & Premiere Pro (Timeline & Subtitle)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tinggal salin dan paste ke CapCut Text Sticker tanpa perlu mengetik ulang!
                  </span>
                </div>

                <button
                  onClick={() => handleCopyText(getCapCutCueText(), 'capcut')}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {copiedType === 'capcut' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Format CapCut Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua Cue CapCut</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0b0e17] border border-[#212c44] text-xs font-mono text-sky-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                {getCapCutCueText()}
              </pre>
            </div>
          )}

          {/* TAB 3: CAPTION */}
          {activeTab === 'caption' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Caption postingan TikTok / Shopee Video (Maksimal 150 Karakter).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption}
                    className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-purple-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-800/40 transition-all disabled:opacity-50"
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Buat Ulang Caption</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(caption, 'caption')}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                  >
                    {copiedType === 'caption' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Caption</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[#0a0e18] border border-[#1e2a42] focus:border-purple-500 rounded-xl p-3 text-xs sm:text-sm text-slate-100 outline-none leading-relaxed transition-all resize-y"
                  placeholder="Ketik caption video..."
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Maksimal 150 karakter untuk TikTok Affiliate.</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      caption.length <= 150
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {caption.length} / 150 Karakter
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPT TALENT */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Naskah dialog talent / voiceover untuk dibaca saat recording.
                </span>
                <button
                  onClick={() => handleCopyText(getPlainScript(), 'script')}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                >
                  {copiedType === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
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

          {/* TAB 5: JSON */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 block">
                      Data Struktur JSON Storyboard
                    </span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full font-semibold">
                      ✨ Tanpa Data Image (Google Flow Ready)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Format ringan tanpa base64/url image, siap di-upload & diproses pada Google Flow atau automasi lainnya.
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <label className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#222e47] cursor-pointer transition-all active:scale-95">
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
                    className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#222e47] transition-all active:scale-95"
                    title="Unduh file .json ke komputer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(JSON.stringify(sanitizeStoryboardForJSON(scenes), null, 2), 'scenes_only')}
                    className="flex items-center gap-1 bg-[#182133] hover:bg-[#202c42] text-purple-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-800/40 transition-all active:scale-95"
                    title="Hanya salin array daftar adegan"
                  >
                    {copiedType === 'scenes_only' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Adegan Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Array Adegan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveProjectToDrive}
                    disabled={isSavingToDrive}
                    className="flex items-center gap-1.5 bg-[#142038] hover:bg-sky-950/70 text-sky-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-600/40 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    title="Simpan backup naskah dan adegan langsung ke folder UGC Storyboard Hub di Google Drive"
                  >
                    {isSavingToDrive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5 text-sky-400" />
                        <span>Simpan ke Google Drive</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyText(getFullStoryboardJSON(), 'json_full')}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md shadow-purple-950/50 transition-all active:scale-95 border border-purple-400/30"
                    title="Salin data JSON lengkap Storyboard (Judul, Durasi, Caption, Variasi Hook, dan Adegan)"
                  >
                    {copiedType === 'json_full' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>JSON Lengkap Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin JSON Storyboard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {driveSaveResult && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Naskah berhasil disimpan ke Google Drive (UGC Storyboard Hub)!</span>
                  </div>
                  {driveSaveResult.webViewLink && (
                    <a
                      href={driveSaveResult.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-300 hover:text-white underline flex items-center gap-1"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {driveSaveError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{driveSaveError}</span>
                </div>
              )}

              <div className="relative">
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
                  <span className="text-[10px] font-mono font-bold bg-[#141b2c] border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded">
                    {scenes.length} Scenes • {totalDuration}s Total
                  </span>
                </div>
                <pre className="p-4 rounded-xl bg-[#0b0e17] border border-[#212c44] text-xs font-mono text-purple-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                  {getFullStoryboardJSON()}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
