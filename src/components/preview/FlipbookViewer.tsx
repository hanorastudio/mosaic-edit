'use client';

import React, { useState, useEffect } from 'react';
import { AlbumProject, PhotoMetadata, AlbumPage } from '@/types/album';
import { getCssFilterString } from '@/lib/utils';
import { SYSTEM_DECORATIONS } from '@/lib/engine/templateLibrary';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';

interface FlipbookViewerProps {
  project: AlbumProject;
  photosMap: Map<string, PhotoMetadata>;
  onClose: () => void;
}

export const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  project,
  photosMap,
  onClose,
}) => {
  const [spreadIndex, setSpreadIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  // Spread pairs: Page 1 (Cover alone), then Page 2 & 3, Page 4 & 5...
  const spreads: (AlbumPage | null)[][] = [];

  // Cover is single right-hand page
  spreads.push([null, project.pages[0] || null]);

  // Inside spreads
  for (let i = 1; i < project.pages.length; i += 2) {
    const leftPage = project.pages[i] || null;
    const rightPage = project.pages[i + 1] || null;
    spreads.push([leftPage, rightPage]);
  }

  const totalSpreads = spreads.length;
  const currentSpread = spreads[spreadIndex] || [null, null];

  const playPageTurnSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch (e) {
      // Audio context policy fallback
    }
  };

  const handleNext = () => {
    if (spreadIndex < totalSpreads - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      playPageTurnSound();
      setTimeout(() => {
        setSpreadIndex((s) => s + 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  const handlePrev = () => {
    if (spreadIndex > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      playPageTurnSound();
      setTimeout(() => {
        setSpreadIndex((s) => s - 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  // Keyboard navigation (Arrow keys, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const renderBookPage = (page: AlbumPage | null, isLeft: boolean) => {
    if (!page) {
      return (
        <div className="w-[440px] h-[440px] bg-[#0E0E10] border border-white/5 flex items-center justify-center text-zinc-700 text-xs shadow-2xl">
          <span>{isLeft ? '• Inside Front Cover •' : '• Inside Back Cover •'}</span>
        </div>
      );
    }

    const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <div
        className="w-[440px] h-[440px] relative overflow-hidden shadow-2xl transition-all select-none"
        style={{
          background: page.background.value,
          boxShadow: isLeft
            ? 'inset -15px 0 30px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.6)'
            : 'inset 15px 0 30px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Render elements */}
        {sortedElements.map((elem) => {
          const photo = elem.photoId ? photosMap.get(elem.photoId) : undefined;
          const filterStyle = elem.filter ? getCssFilterString(elem.filter) : 'none';

          return (
            <div
              key={elem.id}
              className="absolute pointer-events-none"
              style={{
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                width: `${elem.width}%`,
                height: `${elem.height}%`,
                transform: `rotate(${elem.rotation || 0}deg)`,
                opacity: elem.opacity ?? 1,
                zIndex: elem.zIndex || 1,
              }}
            >
              {elem.type === 'photo' && (
                <div
                  className="w-full h-full relative overflow-hidden bg-zinc-800"
                  style={{
                    borderRadius: `${elem.borderRadius || 0}px`,
                    border: elem.borderWidth
                      ? `${elem.borderWidth}px solid ${elem.borderColor || '#C8A96B'}`
                      : 'none',
                    boxShadow: elem.shadow || 'none',
                  }}
                >
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.thumbnail}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: filterStyle,
                        transform: elem.crop
                          ? `translate(${elem.crop.x}%, ${elem.crop.y}%) scale(${elem.crop.scale})`
                          : 'none',
                      }}
                    />
                  )}
                </div>
              )}

              {elem.type === 'text' && (
                <div
                  className="w-full h-full flex items-center justify-center text-center select-none"
                  style={{
                    fontFamily: elem.fontFamily || 'Cinzel, serif',
                    fontSize: `${(elem.fontSize || 14) * 0.55}px`,
                    fontWeight: elem.fontWeight || 'normal',
                    color: elem.color || '#1A1A1A',
                    letterSpacing: `${elem.letterSpacing || 0}px`,
                    fontStyle: elem.italic ? 'italic' : 'normal',
                  }}
                >
                  <span className="w-full truncate px-1">{elem.text}</span>
                </div>
              )}

              {elem.type === 'decoration' && (
                <div className="w-full h-full flex items-center justify-center">
                  {(() => {
                    const dec = SYSTEM_DECORATIONS.find((d) => d.type === elem.decorationType);
                    if (dec) {
                      return (
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: dec.svg }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          );
        })}

        {/* Page Number */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest text-black/30 pointer-events-none uppercase">
          {page.title || `Page ${page.pageNumber}`}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0C] text-white animate-in fade-in duration-200 select-none">
      {/* Top Header Bar */}
      <div className="h-14 px-6 border-b border-white/10 bg-[#121214]/90 backdrop-blur-md flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C8A96B]/20 text-[#C8A96B] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FAF8F5] font-heading">{project.name}</h3>
            <p className="text-[11px] text-[#9E9E9E]">Interactive 3D Photobook Preview</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute page turns' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C8A96B]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3D Book Stage */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-[#0E0E12] via-[#08080A] to-[#040405]">
        {/* Previous Spread Button */}
        <button
          onClick={handlePrev}
          disabled={spreadIndex === 0}
          className="absolute left-6 z-40 w-12 h-12 rounded-full bg-black/60 hover:bg-[#C8A96B] hover:text-black text-white/80 flex items-center justify-center border border-white/10 disabled:opacity-20 transition-all shadow-xl"
          title="Previous page (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 3D Realistic Open Album Book */}
        <div
          className={`relative flex items-center shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border border-white/15 transition-transform duration-300 ${
            isFlipping ? 'scale-[0.98]' : 'scale-100'
          }`}
        >
          {/* Left Page */}
          <div className="relative overflow-hidden">
            {renderBookPage(currentSpread[0], true)}
          </div>

          {/* Central Book Spine & Gutter Crease Shadow */}
          <div className="w-6 h-[440px] bg-gradient-to-r from-black/40 via-black/70 to-black/40 z-30 shadow-inner pointer-events-none" />

          {/* Right Page */}
          <div className="relative overflow-hidden">
            {renderBookPage(currentSpread[1], false)}
          </div>
        </div>

        {/* Next Spread Button */}
        <button
          onClick={handleNext}
          disabled={spreadIndex === totalSpreads - 1}
          className="absolute right-6 z-40 w-12 h-12 rounded-full bg-black/60 hover:bg-[#C8A96B] hover:text-black text-white/80 flex items-center justify-center border border-white/10 disabled:opacity-20 transition-all shadow-xl"
          title="Next page (Right Arrow or Space)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Slider Navigation Bar */}
      <div className="h-14 px-8 border-t border-white/10 bg-[#121214]/90 backdrop-blur-md flex items-center justify-between text-xs z-30">
        <span className="text-[#9E9E9E] font-mono">
          Spread <strong className="text-[#C8A96B]">{spreadIndex + 1}</strong> of {totalSpreads}
        </span>

        {/* Scrub Slider */}
        <div className="w-96 max-w-full flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={totalSpreads - 1}
            value={spreadIndex}
            onChange={(e) => setSpreadIndex(parseInt(e.target.value))}
            className="w-full accent-[#C8A96B] cursor-pointer"
          />
        </div>

        <span className="text-[11px] text-[#9E9E9E] hidden sm:inline">
          Use ← and → arrows to flip pages
        </span>
      </div>
    </div>
  );
};
