import React from 'react';
import {
  ShoppingBag,
  Package,
  PlaySquare,
  MessageSquare,
  Smile,
  Video,
  Sparkles,
  Zap,
  ArrowLeftRight,
  Lightbulb,
  Headphones,
  ShoppingBag as HaulBag,
  CheckCircle2,
  Info,
  Wand2
} from 'lucide-react';
import { UGC_CATEGORIES } from '../data/categories';
import { UGCTemplateCategory } from '../types';

interface SidebarProps {
  selectedCategoryId: string;
  onSelectCategory: (category: UGCTemplateCategory) => void;
  onTriggerAICategory: (category: UGCTemplateCategory) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategoryId,
  onSelectCategory,
  onTriggerAICategory,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return ShoppingBag;
      case 'Package':
        return Package;
      case 'PlaySquare':
        return PlaySquare;
      case 'MessageSquare':
        return MessageSquare;
      case 'Smile':
        return Smile;
      case 'Video':
        return Video;
      case 'Sparkles':
        return Sparkles;
      case 'Zap':
        return Zap;
      case 'ArrowLeftRight':
        return ArrowLeftRight;
      case 'Lightbulb':
        return Lightbulb;
      case 'Headphones':
        return Headphones;
      default:
        return HaulBag;
    }
  };

  const activeCat = UGC_CATEGORIES.find(c => c.id === selectedCategoryId) || UGC_CATEGORIES[8];

  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-[#0c1017] border-r border-[#1a2335] flex flex-col shrink-0">
      
      {/* Category Header */}
      <div className="p-4 border-b border-[#1a2335]/70 flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          KATEGORI TEMPLATE
        </h2>
        <span className="text-[10px] bg-[#161f30] text-purple-400 font-semibold px-2 py-0.5 rounded-full border border-purple-900/40">
          {UGC_CATEGORIES.length} Format
        </span>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {UGC_CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.iconName);
          const isActive = cat.id === selectedCategoryId;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/40 text-white font-semibold border border-purple-600/60 shadow-lg shadow-purple-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-[#141b29] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#141b29] text-slate-400 group-hover:text-purple-300 group-hover:bg-[#1b2438]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs tracking-wide truncate">
                  {cat.name}
                </span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info Banner matching screenshot tip */}
      <div className="p-3 border-t border-[#1a2335] bg-[#0e1420]">
        <div className="p-3 rounded-xl bg-[#131a29] border border-[#1e293f] relative overflow-hidden">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-purple-950/80 text-purple-400 border border-purple-800/40 shrink-0 mt-0.5">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Pilih kategori untuk memuat template AI khusus.
              </p>
              <button
                onClick={() => onTriggerAICategory(activeCat)}
                className="mt-2 text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>Generate dengan AI {activeCat.name}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
