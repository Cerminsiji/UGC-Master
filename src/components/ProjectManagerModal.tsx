import React, { useState } from 'react';
import {
  X,
  Plus,
  FolderOpen,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  FileVideo,
  Sparkles
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
}) => {
  if (!isOpen) return null;

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
                Kelola semua draft storyboard UGC yang tersimpan.
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

              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-purple-950/30 border-purple-600/60 shadow-lg shadow-purple-950/40'
                      : 'bg-[#131a29] border-[#212d47] hover:border-[#2f3e60]'
                  }`}
                >
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
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
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
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
