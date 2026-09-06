import React, { useState } from 'react';
import { MosaicProject } from '@/types/mosaic';
import {
  Undo2,
  Redo2,
  Sparkles,
  Download,
  ArrowLeft,
  RefreshCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Video,
  Eye,
  MessageSquare,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

interface MosaicTopToolbarProps {
  project: MosaicProject;
  canUndo: boolean;
  canRedo: boolean;
  zoomLevel: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onOpenVariations: () => void;
  onOpenMockup: () => void;
  onOpenVideo: () => void;
  onOpenExport: () => void;
  onUpdateProjectName: (name: string) => void;
}

export const MosaicTopToolbar: React.FC<MosaicTopToolbarProps> = ({
  project,
  canUndo,
  canRedo,
  zoomLevel,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onOpenVariations,
  onOpenMockup,
  onOpenVideo,
  onOpenExport,
  onUpdateProjectName,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#2C2C34] bg-[#141417] px-3 sm:px-4 flex items-center justify-between text-white select-none shrink-0 z-30 relative pt-safe">
      {/* Left: Back & Project Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-[#9E9E9E] hover:text-white hover:bg-[#222228] transition-colors shrink-0 touch-action-manipulation active:scale-95"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-5 w-[1px] bg-[#2C2C34] shrink-0 hidden sm:block" />

        <div className="min-w-0">
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-[#FAF8F5] focus:bg-[#1A1A1E] focus:outline-none focus:ring-1 focus:ring-[#C8A96B] px-1.5 py-1 rounded transition-all max-w-[130px] sm:max-w-[200px] md:max-w-xs truncate"
            title="Click to rename artwork"
          />
          <div className="hidden xs:flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 px-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">{project.tiles.length} tiles</span>
          </div>
        </div>
      </div>

      {/* Center: History & Zoom (Desktop) */}
      <div className="hidden md:flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl px-2 py-0.5 gap-1.5 text-xs text-[#9E9E9E]">
          <button onClick={onZoomOut} className="hover:text-white p-1">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] text-white">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button onClick={onZoomIn} className="hover:text-white p-1">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={onZoomFit} className="hover:text-white p-1 ml-1" title="Reset Zoom">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Actions & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Undo/Redo visible on Mobile Header */}
        <div className="flex md:hidden items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-[#9E9E9E] hover:text-white disabled:opacity-30 touch-action-manipulation active:scale-90"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-[#9E9E9E] hover:text-white disabled:opacity-30 touch-action-manipulation active:scale-90"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden xl:flex items-center gap-2">
          <button
            onClick={onOpenVideo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#222228] hover:bg-[#2C2C34] border border-[#C8A96B]/30 hover:border-[#C8A96B] text-[#E5C158] rounded-xl transition-all shadow-sm"
          >
            <span>🎬 Video Reveal</span>
          </button>

          <button
            onClick={onOpenMockup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1E1E24] hover:bg-[#2C2C34] border border-white/10 hover:border-[#C8A96B]/50 text-zinc-300 hover:text-white rounded-xl transition-all shadow-sm"
          >
            <span>🖼️ Wall Preview</span>
          </button>

          <button
            onClick={onOpenVariations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#222228] hover:bg-[#2C2C34] border border-[#C8A96B]/30 text-[#C8A96B] rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>✨ Variations</span>
          </button>

          <Link
            href="/feature-request"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl transition-all shadow-sm"
            title="Request a feature or chat on WhatsApp (+91 8482961442)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feature / Issue</span>
          </Link>
        </div>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold bg-[#FAF8F5] hover:bg-white text-[#141414] rounded-xl shadow-md transition-all shrink-0 touch-action-manipulation active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export 4K/PDF</span>
          <span className="sm:hidden">Export</span>
        </button>

        {/* Mobile / Tablet More Actions Menu (•••) */}
        <div className="xl:hidden relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl border transition-all touch-action-manipulation active:scale-95 ${
              isMobileMenuOpen
                ? 'bg-[#C8A96B] text-black border-[#C8A96B]'
                : 'bg-[#1E1E24] hover:bg-[#2C2C34] border-[#2C2C34] text-zinc-300 hover:text-white'
            }`}
            title="More Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
              />

              <div className="absolute right-0 mt-2 w-64 bg-[#18181E] border border-[#C8A96B]/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1 text-left">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#C8A96B] uppercase tracking-wider border-b border-white/10 mb-1">
                  Creative Studios
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenVideo();
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#2C2C34] text-left transition-colors group touch-action-manipulation active:scale-98"
                >
                  <span className="text-lg">🎬</span>
                  <div>
                    <div className="text-xs font-bold text-[#E5C158] group-hover:text-white">
                      Video Reveal Studio
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Reels & TikTok animated MP4 export
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenMockup();
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#2C2C34] text-left transition-colors group touch-action-manipulation active:scale-98"
                >
                  <span className="text-lg">🖼️</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                      3D Wall Mockup
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Luxury room & frame preview in 4K
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenVariations();
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#2C2C34] text-left transition-colors group touch-action-manipulation active:scale-98"
                >
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                      4-Style Variations
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      1-click artistic palette transforms
                    </div>
                  </div>
                </button>

                <Link
                  href="/feature-request"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 text-left transition-colors group border border-emerald-500/30 touch-action-manipulation active:scale-98"
                >
                  <span className="text-lg">💬</span>
                  <div>
                    <div className="text-xs font-bold text-emerald-300 group-hover:text-white flex items-center gap-1">
                      <span>Feature Request & Issues</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Chat with Hanora Studio (+91 8482961442)
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

