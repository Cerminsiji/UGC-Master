import React, { useRef, useState } from 'react';
import {
  X,
  Plus,
  FolderOpen,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  FileVideo,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  History,
  Link as LinkIcon,
  Edit2,
  Check,
  ExternalLink
} from 'lucide-react';
import { StoryboardProject } from '../types';
import { formatDuration } from '../utils/helpers';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StoryboardProject[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (project: StoryboardProject) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectNotes?: (projectId: string, notes: string) => void;
  onExportBackup?: () => void;
  onImportBackup?: (imported: StoryboardProject[]) => void;
  onRestoreSnapshot20260905?: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onUpdateProjectNotes,
  onExportBackup,
  onImportBackup,
  onRestoreSnapshot20260905,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEditNotes = (proj: StoryboardProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNotesId(proj.id);
    setTempNotes(proj.productLinkOrNotes || '');
  };

  const handleSaveNotes = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateProjectNotes) {
      onUpdateProjectNotes(projectId, tempNotes.trim());
    }
    setEditingNotesId(null);
  };

  const handleCancelNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNotesId(null);
  };

  const handleCopyNotes = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let list: StoryboardProject[] = [];

        if (Array.isArray(parsed)) {
          list = parsed;
        } else if (parsed && Array.isArray(parsed.projects)) {
          list = parsed.projects;
        } else if (parsed && parsed.defaultProject) {
          list = [parsed.defaultProject];
        } else if (parsed && parsed.id && parsed.scenes) {
          list = [parsed];
        }

        if (list.length > 0 && onImportBackup) {
          onImportBackup(list);
          alert(`Berhasil memulihkan ${list.length} project dari file backup! 🎉`);
        } else {
          alert('Format file JSON backup tidak valid atau tidak memiliki daftar adegan.');
        }
      } catch (err: any) {
        alert(`Gagal membaca file backup: ${err?.message || 'Format JSON rusak'}`);
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1422] border border-[#23304d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1f2a42] flex items-center justify-between bg-[#131929]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-300">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Project & Storyboard Manager
              </h2>
              <p className="text-xs text-slate-400">
                Kelola draft storyboard UGC beserta link produk & catatan AI Generate terintegrasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNewProject}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Project Baru</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {projects.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada project tersimpan.
            </div>
          ) : (
            projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              const totalSecs = proj.scenes.reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);
              const isEditingThisNotes = editingNotesId === proj.id;

              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                    isCurrent
                      ? 'bg-purple-950/30 border-purple-600/60 shadow-lg shadow-purple-950/40'
                      : 'bg-[#131a29] border-[#212d47] hover:border-[#2f3e60]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className="flex-1 min-w-0 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {proj.title}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 flex-wrap">
                        {proj.productName && (
                          <>
                            <span className="text-slate-300 font-semibold">{proj.productName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span className="text-purple-400 font-medium">{proj.categoryId.toUpperCase()}</span>
                        <span>•</span>
                        <span>{proj.scenes.length} Adegan</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-400">{formatDuration(totalSecs)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDuplicateProject(proj)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
                        title="Duplikat Project"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        disabled={projects.length <= 1}
                        className="p-2 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Keterangan & Link Produk Tersimpan (Menjadi 1 di Project Manager) */}
                  <div className="bg-[#0b101a] border border-[#1c263c] rounded-lg p-2.5 text-xs">
                    {isEditingThisNotes ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-purple-300 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <span>Edit Link & Keterangan Produk</span>
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Tempel link produk Shopee/TikTok atau tulis ringkasan USP produk..."
                          className="w-full bg-[#111726] border border-[#2b3a61] rounded-md p-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={handleCancelNotes}
                            className="px-2.5 py-1 rounded bg-[#182033] hover:bg-[#202a42] text-slate-300 text-[11px] transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleSaveNotes(proj.id, e)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold shadow transition-all"
                          >
                            <Check className="w-3 h-3" />
                            <span>Simpan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-0.5">
                            <LinkIcon className="w-3 h-3" />
                            <span>Link / Keterangan Produk</span>
                          </div>
                          {proj.productLinkOrNotes ? (
                            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 select-all font-mono break-all">
                              {proj.productLinkOrNotes}
                            </p>
                          ) : (
                            <p className="text-slate-500 italic text-[11px]">
                              Belum ada link atau keterangan produk tersimpan.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-1">
                          {proj.productLinkOrNotes && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyNotes(proj.productLinkOrNotes!, proj.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
                              title="Salin Link / Keterangan"
                            >
                              {copiedId === proj.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleStartEditNotes(proj, e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors"
                            title="Edit Link / Keterangan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Snapshot & Backup Toolbar */}
        <div className="p-4 border-t border-[#1f2a42] bg-[#111726] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            {onExportBackup && (
              <button
                onClick={onExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192238] hover:bg-[#222e4d] text-slate-200 border border-[#2b3a61] transition-all font-medium active:scale-95"
                title="Unduh seluruh project sebagai file cadangan JSON"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backup JSON</span>
              </button>
            )}
            {onImportBackup && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192238] hover:bg-[#222e4d] text-slate-200 border border-[#2b3a61] transition-all font-medium active:scale-95"
                title="Pulihkan project dari file JSON cadangan"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restore File</span>
              </button>
            )}
          </div>

          {onRestoreSnapshot20260905 && (
            <button
              onClick={() => {
                if (window.confirm('Pulihkan ke format awal Snapshot 2026-09-05 (Sago Green Coffee 6 Adegan)? Project yang belum di-backup mungkin tertimpa.')) {
                  onRestoreSnapshot20260905();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-700/50 transition-all font-medium active:scale-95"
              title="Kembalikan data default seperti snapshot tanggal 5 September 2026"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Restore Snapshot 05-Sep</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
