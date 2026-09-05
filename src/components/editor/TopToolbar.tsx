'use client';

import React from 'react';
import { AlbumProject } from '@/types/album';
import {
  Undo2,
  Redo2,
  Sparkles,
  RefreshCw,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns2,
  Square,
  CheckCircle2,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface TopToolbarProps {
  project: AlbumProject;
  currentPageIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  isSpreadView: boolean;
  zoomLevel: number;
  showBleed: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSelectPage: (index: number) => void;
  onToggleSpreadView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToggleBleed: () => void;
  onOpenAutoDesign: () => void;
  onOpenRegenerate: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  onUpdateProjectName: (name: string) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  project,
  currentPageIndex,
  canUndo,
  canRedo,
  isSpreadView,
  zoomLevel,
  showBleed,
  onUndo,
  onRedo,
  onSelectPage,
  onToggleSpreadView,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onToggleBleed,
  onOpenAutoDesign,
  onOpenRegenerate,
  onOpenPreview,
  onOpenExport,
  onUpdateProjectName,
}) => {
  const totalPages = project.pages.length;

  return (
    <header className="h-14 border-b border-[#2C2C34] bg-[#141417] px-4 flex items-center justify-between text-white select-none shrink-0 z-30">
      {/* Left: Back to Dashboard & Project Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-[#9E9E9E] hover:text-white hover:bg-[#222228] transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-5 w-[1px] bg-[#2C2C34]" />

        <div>
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateProjectName(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#FAF8F5] focus:bg-[#1A1A1E] focus:outline-none focus:ring-1 focus:ring-[#C8A96B] px-1.5 py-0.5 rounded transition-all max-w-[200px] sm:max-w-xs truncate"
            title="Click to rename project"
          />
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 px-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Saved locally to IndexedDB</span>
          </div>
        </div>
      </div>

      {/* Center: History, Page Stepper, View Mode & Zoom */}
      <div className="hidden lg:flex items-center gap-2">
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

        {/* Page Stepper */}
        <div className="flex items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl px-2 py-1 gap-2 text-xs">
          <button
            onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-0.5 text-[#9E9E9E] hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-white/90">
            Page <strong className="text-[#C8A96B]">{currentPageIndex + 1}</strong> of {totalPages}
          </span>
          <button
            onClick={() => onSelectPage(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === totalPages - 1}
            className="p-0.5 text-[#9E9E9E] hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode: Single vs Spread */}
        <div className="flex items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl p-0.5">
          <button
            onClick={onToggleSpreadView}
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              !isSpreadView ? 'bg-[#2C2C34] text-white font-medium' : 'text-[#9E9E9E] hover:text-white'
            }`}
            title="Single Page View"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Single</span>
          </button>
          <button
            onClick={onToggleSpreadView}
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
              isSpreadView ? 'bg-[#2C2C34] text-[#C8A96B] font-medium' : 'text-[#9E9E9E] hover:text-white'
            }`}
            title="Double Page Spread View"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Spread</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#1A1A1E] border border-[#2C2C34] rounded-xl px-2 py-0.5 gap-1.5 text-xs text-[#9E9E9E]">
          <button onClick={onZoomOut} className="hover:text-white p-1">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center font-mono text-[11px] text-white">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button onClick={onZoomIn} className="hover:text-white p-1">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={onZoomFit} className="hover:text-white p-1 ml-1" title="Fit to Screen">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: AI Design, Regenerate, Preview & Export Actions */}
      <div className="flex items-center gap-2">
        {/* Regenerate Variations */}
        <button
          onClick={onOpenRegenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#222228] hover:bg-[#2C2C34] border border-[#C8A96B]/30 text-[#C8A96B] rounded-xl transition-all shadow-sm"
          title="Regenerate with variations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Regenerate</span>
        </button>

        {/* Auto-Design Engine */}
        <button
          onClick={onOpenAutoDesign}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-[#C8A96B] to-[#E5C158] text-[#141414] rounded-xl hover:brightness-110 shadow-md shadow-[#C8A96B]/20 transition-all transform hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Auto Design</span>
        </button>

        {/* 3D Flipbook Preview */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#222228] hover:bg-[#2C2C34] text-white/90 border border-white/10 rounded-xl transition-colors"
          title="Realistic Flipbook Preview"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span className="hidden md:inline">Preview</span>
        </button>

        {/* Export PDF / ZIP */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#FAF8F5] hover:bg-white text-[#141414] rounded-xl shadow-md transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
