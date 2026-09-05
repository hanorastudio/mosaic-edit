'use client';

import React, { useRef, useState } from 'react';
import { MosaicProject, MosaicTile, MosaicSettings } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
  Heart,
  Crown,
  Sparkles,
  RefreshCw,
  X,
  Type,
  Trash2,
  Edit3,
  Move,
  Search,
  Layers,
  Sliders,
  Sparkle,
} from 'lucide-react';
import {
  STYLISH_FONTS,
  GLASS_EFFECT_PRESETS,
  GLASS_SHAPES,
  TEXT_CLARITY_PRESETS,
  getTextClarityCss,
} from '@/lib/mosaic/textStyles';

interface MosaicCanvasStageProps {
  project: MosaicProject;
  photosMap: Map<string, PhotoMetadata>;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  onSelectTile: (tile: MosaicTile | null) => void;
  onReplaceTilePhoto: (tileId: string, newPhotoId: string) => void;
  onSetHeroPhoto: (photoId: string) => void;
  onUpdateSettings?: (newSettings: Partial<MosaicSettings>) => void;
  onUpdateTarget?: (newTarget: Partial<import('@/types/mosaic').MosaicTargetConfig>) => void;
}

export const MosaicCanvasStage: React.FC<MosaicCanvasStageProps> = ({
  project,
  photosMap,
  zoomLevel,
  onZoomChange,
  onSelectTile,
  onReplaceTilePhoto,
  onSetHeroPhoto,
  onUpdateSettings,
  onUpdateTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [selectedTile, setSelectedTile] = useState<MosaicTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<MosaicTile | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Magic Spyglass Loupe / Magnifier
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // On-Canvas Text Overlay Editing & Free Dragging
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [textEditorTab, setTextEditorTab] = useState<'content' | 'font' | 'glass'>('content');
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [textDragStart, setTextDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
  }>({ mouseX: 0, mouseY: 0, initialX: 50, initialY: 90 });

  // Draggable Emoji Overlay State
  const [isDraggingEmoji, setIsDraggingEmoji] = useState<boolean>(false);
  const [emojiDragStart, setEmojiDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
  }>({ mouseX: 0, mouseY: 0, initialX: 50, initialY: 50 });

  const baseSize = 800; // Base canvas width in px
  const aspectRatio = project.settings.aspectRatio || 1;
  const canvasWidth = baseSize;
  const canvasHeight = Math.round(baseSize / aspectRatio);

  const tileGap = project.settings.tileGap || 0;
  const borderRadius = project.settings.borderRadius || 0;
  const tintBlend = project.settings.colorTintBlend || 0;
  const surfaceFinish = project.settings.surfaceFinish || 'none';

  const overlay = project.settings.overlayText;
  const hasTextOverlay = overlay && overlay.position !== 'none' && (overlay.text || overlay.subtext);

  // Compute text X and Y percentage
  const currentTextX = overlay?.x !== undefined ? overlay.x : 50;
  const currentTextY =
    overlay?.y !== undefined
      ? overlay.y
      : overlay?.position === 'above'
      ? 8
      : overlay?.position === 'inside'
      ? 50
      : 90;

  // Compute emoji X and Y percentage
  const currentEmojiX = project.target.centerEmojiX !== undefined ? project.target.centerEmojiX : 50;
  const currentEmojiY = project.target.centerEmojiY !== undefined ? project.target.centerEmojiY : 50;

  const isCustomImage = project.target.type === 'custom-image' && !!project.target.customImageUrl;

  const dragDistanceRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Emoji drag handlers
  const handleEmojiMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingEmoji(true);
    setEmojiDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: currentEmojiX,
      initialY: currentEmojiY,
    });
  };

  const handleEmojiTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      const touch = e.touches[0];
      setIsDraggingEmoji(true);
      setEmojiDragStart({
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        initialX: currentEmojiX,
        initialY: currentEmojiY,
      });
    }
  };

  // Mouse wheel deep-zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.20, Math.min(5.0, Number((zoomLevel * zoomFactor).toFixed(2))));
    onZoomChange(newZoom);
  };

  // Mouse handlers — allows dragging anywhere on canvas, background, or photo tiles
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingText || isDraggingEmoji) return;

    if (e.button === 0) {
      setIsPanning(true);
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouseCanvasPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (isDraggingEmoji && onUpdateTarget) {
      const deltaX = e.clientX - emojiDragStart.mouseX;
      const deltaY = e.clientY - emojiDragStart.mouseY;

      const scaleWidth = canvasWidth * zoomLevel;
      const scaleHeight = canvasHeight * zoomLevel;

      const newPctX = Math.max(3, Math.min(97, Number((emojiDragStart.initialX + (deltaX / scaleWidth) * 100).toFixed(1))));
      const newPctY = Math.max(3, Math.min(97, Number((emojiDragStart.initialY + (deltaY / scaleHeight) * 100).toFixed(1))));

      onUpdateTarget({ centerEmojiX: newPctX, centerEmojiY: newPctY });
      return;
    }

    if (isDraggingText && onUpdateSettings) {
      const deltaX = e.clientX - textDragStart.mouseX;
      const deltaY = e.clientY - textDragStart.mouseY;

      const scaleWidth = canvasWidth * zoomLevel;
      const scaleHeight = canvasHeight * zoomLevel;

      const newPctX = Math.max(5, Math.min(95, Number((textDragStart.initialX + (deltaX / scaleWidth) * 100).toFixed(1))));
      const newPctY = Math.max(5, Math.min(95, Number((textDragStart.initialY + (deltaY / scaleHeight) * 100).toFixed(1))));

      handleUpdateTextCoordinates(newPctX, newPctY);
      return;
    }

    if (isPanning && isDraggingRef.current) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      dragDistanceRef.current += Math.hypot(newPanX - panOffset.x, newPanY - panOffset.y);
      setPanOffset({ x: newPanX, y: newPanY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    isDraggingRef.current = false;
    setIsDraggingText(false);
    setIsDraggingEmoji(false);
  };

  // Touch Handlers for Mobile (Pinch-to-zoom & 1-finger pan with pivot)
  const touchStartRef = useRef<{
    t1: { x: number; y: number };
    t2?: { x: number; y: number };
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
  }>({
    t1: { x: 0, y: 0 },
    initialDist: 0,
    initialZoom: zoomLevel,
    initialPan: { x: 0, y: 0 },
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDraggingEmoji) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
      touchStartRef.current.t1 = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = {
        t1: { x: t1.clientX, y: t1.clientY },
        t2: { x: t2.clientX, y: t2.clientY },
        initialDist: dist,
        initialZoom: zoomLevel,
        initialPan: { ...panOffset },
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingEmoji && onUpdateTarget && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - emojiDragStart.mouseX;
      const deltaY = touch.clientY - emojiDragStart.mouseY;

      const scaleWidth = canvasWidth * zoomLevel;
      const scaleHeight = canvasHeight * zoomLevel;

      const newPctX = Math.max(3, Math.min(97, Number((emojiDragStart.initialX + (deltaX / scaleWidth) * 100).toFixed(1))));
      const newPctY = Math.max(3, Math.min(97, Number((emojiDragStart.initialY + (deltaY / scaleHeight) * 100).toFixed(1))));

      onUpdateTarget({ centerEmojiX: newPctX, centerEmojiY: newPctY });
      return;
    }

    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const newPanX = touch.clientX - panStart.x;
      const newPanY = touch.clientY - panStart.y;
      dragDistanceRef.current += Math.hypot(newPanX - panOffset.x, newPanY - panOffset.y);
      setPanOffset({ x: newPanX, y: newPanY });
    } else if (e.touches.length === 2 && touchStartRef.current.initialDist > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleDelta = currentDist / touchStartRef.current.initialDist;

      const newZoom = Math.max(
        0.20,
        Math.min(5.0, Number((touchStartRef.current.initialZoom * scaleDelta).toFixed(2)))
      );
      onZoomChange(newZoom);

      // Pan towards touch midpoint while pinching
      const initialMidX = (touchStartRef.current.t1.x + (touchStartRef.current.t2?.x || touchStartRef.current.t1.x)) / 2;
      const initialMidY = (touchStartRef.current.t1.y + (touchStartRef.current.t2?.y || touchStartRef.current.t1.y)) / 2;
      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;

      setPanOffset({
        x: touchStartRef.current.initialPan.x + (currentMidX - initialMidX),
        y: touchStartRef.current.initialPan.y + (currentMidY - initialMidY),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDraggingEmoji(false);
    if (e.touches.length === 0) {
      setIsPanning(false);
      isDraggingRef.current = false;
      touchStartRef.current.initialDist = 0;
    } else if (e.touches.length === 1) {
      // Switched from pinch to 1-finger pan smoothly
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
      setIsPanning(true);
      isDraggingRef.current = true;
    }
  };

  const handleTileClick = (e: React.MouseEvent, tile: MosaicTile) => {
    // If the mouse/finger was dragged, don't trigger tile selection click
    if (dragDistanceRef.current > 6) {
      return;
    }
    e.stopPropagation();
    setSelectedTile(tile);
    setIsEditingText(false);
    onSelectTile(tile);
  };

  // Text overlay click & drag start
  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingText(true);
    setTextDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: currentTextX,
      initialY: currentTextY,
    });
  };

  const handleTextOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingText(true);
    setSelectedTile(null);
  };

  const handleDeleteTextOverlay = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        overlayText: {
          text: '',
          subtext: '',
          position: 'none',
          fontFamily: 'Cinzel, serif',
          color: '#C8A96B',
          fontSize: 24,
          x: 50,
          y: 90,
        },
      });
    }
    setIsEditingText(false);
  };

  const handleUpdateTextCoordinates = (x: number, y: number) => {
    if (onUpdateSettings && overlay) {
      onUpdateSettings({
        overlayText: {
          ...overlay,
          position: 'custom',
          x,
          y,
        },
      });
    }
  };

  const handleUpdateText = (
    fieldOrUpdates:
      | 'text'
      | 'subtext'
      | 'position'
      | 'color'
      | 'fontFamily'
      | 'fontSize'
      | 'glassEffect'
      | 'glassOpacity'
      | 'glassShape'
      | 'textClarity'
      | Partial<NonNullable<MosaicSettings['overlayText']>>,
    value?: any
  ) => {
    if (onUpdateSettings) {
      const current = project.settings.overlayText || {
        text: 'BUNTY BABLI',
        subtext: 'A Lifetime of Beautiful Memories • 2026',
        position: 'below',
        fontFamily: 'Cinzel, serif',
        color: '#C8A96B',
        fontSize: 24,
        x: 50,
        y: 90,
        glassEffect: 'none',
        glassOpacity: 0.70,
        glassShape: 'pill',
        textClarity: 'ultra-pop',
      };

      if (typeof fieldOrUpdates === 'object') {
        onUpdateSettings({
          overlayText: {
            ...current,
            ...fieldOrUpdates,
          },
        });
        return;
      }

      let newX = current.x;
      let newY = current.y;

      if (fieldOrUpdates === 'position') {
        if (value === 'above') {
          newX = 50;
          newY = 8;
        } else if (value === 'inside') {
          newX = 50;
          newY = 50;
        } else if (value === 'below') {
          newX = 50;
          newY = 90;
        }
      }

      onUpdateSettings({
        overlayText: {
          ...current,
          [fieldOrUpdates]: value,
          x: newX,
          y: newY,
        },
      });
    }
  };

  const selectedPhotoMeta = selectedTile ? photosMap.get(selectedTile.photoId) : undefined;
  const hoveredPhotoMeta = hoveredTile ? photosMap.get(hoveredTile.photoId) : undefined;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`flex-1 h-full bg-[#0C0C0E] overflow-hidden flex items-center justify-center relative select-none touch-none ${
        isDraggingText || isDraggingEmoji ? 'cursor-grabbing' : isLoupeActive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Zoom Level Indicator / Floating HUD */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#141417]/90 border border-white/10 text-[11px] sm:text-xs backdrop-blur-md shadow-xl text-white pointer-events-none">
        <span className="text-[#C8A96B] font-mono font-bold">
          {Math.round(zoomLevel * 100)}%
        </span>
        <span className="text-zinc-400 text-[10px] sm:text-[11px] hidden xs:inline">
          {zoomLevel <= 0.5
            ? '• Macro Shape'
            : zoomLevel >= 1.5
            ? '• Micro Photos'
            : '• Detailed Mosaic'}
        </span>
      </div>

      {/* Floating Magic Loupe & Zoom Controls Bar */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[#141417]/95 border border-white/15 backdrop-blur-md shadow-2xl max-w-[95vw]">
        {/* Magic Loupe Magnifier Button */}
        <button
          onClick={() => setIsLoupeActive(!isLoupeActive)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            isLoupeActive
              ? 'bg-[#C8A96B] text-black font-bold shadow-lg shadow-[#C8A96B]/30'
              : 'bg-white/5 hover:bg-white/10 text-[#C8A96B]'
          }`}
          title="Toggle 400% Magic Spyglass Magnifier lens"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Magic Loupe</span>
        </button>

        <div className="h-4 w-[1px] bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

        {/* Mobile Compact Zoom Controls (< 640px) */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => onZoomChange(Math.max(0.25, Number((zoomLevel - 0.25).toFixed(2))))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => onZoomChange(0.85)}
            className="px-2 py-1 rounded-lg bg-white/10 text-white font-mono text-[11px] font-bold"
            title="Tap to Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(5.0, Number((zoomLevel + 0.25).toFixed(2))))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>
        </div>

        {/* Desktop Preset Zoom Buttons (>= 640px) */}
        <div className="hidden sm:flex items-center gap-1">
          {[0.25, 0.5, 1.0, 2.0, 4.0].map((preset) => (
            <button
              key={preset}
              onClick={() => onZoomChange(preset)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                Math.abs(zoomLevel - preset) < 0.05
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {preset * 100}%
            </button>
          ))}
        </div>

        <div className="h-4 w-[1px] bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

        <button
          onClick={() => {
            onZoomChange(0.85);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 shrink-0"
          title="Reset Zoom & Pan to Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Scalable Mosaic Stage */}
      <div
        ref={stageRef}
        className="transition-transform duration-75 ease-out origin-center relative shadow-[0_30px_100px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border border-white/15"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          background: project.settings.background.value,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Empty State when no photos are uploaded */}
        {project.tiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 select-none">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1E] border border-[#C8A96B]/30 flex items-center justify-center mb-4 shadow-xl text-[#C8A96B]">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Canvas Ready for Your Photos</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
              Upload your photos from the left Photos tab or click below to build your mosaic.
            </p>
          </div>
        )}

        {/* Render Mosaic Tiles */}
        {(() => {
          const outerTileOpacity =
            project.settings.outerTileOpacity !== undefined
              ? project.settings.outerTileOpacity
              : project.target.outerTileOpacity !== undefined
              ? project.target.outerTileOpacity
              : 1.0;

          const outerTileFilter =
            project.settings.outerTileFilter || project.target.outerTileFilter || 'none';

          return project.tiles.map((tile) => {
            const photo = photosMap.get(tile.photoId);
            const isSelected = selectedTile?.id === tile.id;
            const isHovered = hoveredTile?.id === tile.id;
            const isHeroPhoto = project.settings.heroPhotoId === tile.photoId;
            const isSubjectTile = tile.isSubject !== false;
            const tileOpacity = isSubjectTile ? 1.0 : outerTileOpacity;

            const outerFilterStyle =
              !isSubjectTile && outerTileFilter !== 'none'
                ? outerTileFilter === 'monochrome'
                  ? 'grayscale(100%) contrast(0.95)'
                  : outerTileFilter === 'soft-blur'
                  ? 'blur(2px)'
                  : outerTileFilter === 'vignette-dim'
                  ? 'brightness(0.60) contrast(1.1)'
                  : undefined
                : undefined;

            return (
              <div
                key={tile.id}
                onClick={(e) => handleTileClick(e, tile)}
                onMouseEnter={() => setHoveredTile(tile)}
                onMouseLeave={() => setHoveredTile(null)}
                className={`absolute cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-[#C8A96B] z-30 scale-105 shadow-2xl'
                    : isHovered
                    ? 'ring-1 ring-white/80 z-20 scale-105'
                    : isHeroPhoto
                    ? 'ring-2 ring-[#E5C158] shadow-lg shadow-[#E5C158]/30'
                    : ''
                }`}
                style={{
                  left: `${tile.x}%`,
                  top: `${tile.y}%`,
                  width: `${tile.width}%`,
                  height: `${tile.height}%`,
                  padding: `${tileGap}px`,
                  opacity: tileOpacity,
                  filter: outerFilterStyle,
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                }}
              >
              <div
                className="w-full h-full relative overflow-hidden bg-zinc-900"
                style={{
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {photo && photo.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.thumbnail}
                    alt={photo.name}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                ) : tile.photoId.startsWith('emoji_') ? (
                  <div className="w-full h-full flex items-center justify-center text-xs leading-none select-none pointer-events-none">
                    {decodeURIComponent(tile.photoId.split('_')[1] || '❤️')}
                  </div>
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`,
                    }}
                  />
                )}

                {/* Per-Tile Photographic Tint & Color Grading (Custom Pictures Subject Only - Zero Tint for Standard Shapes) */}
                {tintBlend > 0 &&
                  !tile.photoId.startsWith('emoji_') &&
                  project.settings.tileSourceMode !== 'emojis' &&
                  isCustomImage &&
                  tile.isSubject !== false && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: `rgba(${tile.targetRgb.r}, ${tile.targetRgb.g}, ${tile.targetRgb.b}, ${Math.min(0.70, tintBlend * 0.95)})`,
                      }}
                    />
                  )}
              </div>
            </div>
          );
        });
      })()}

        {/* Full / Subject-Aware Photo Overlay for Custom Pictures */}
        {isCustomImage &&
          project.target.customImageUrl &&
          tintBlend > 0 &&
          project.settings.customImageBlendMode !== 'pure-mosaic' &&
          (() => {
            const rawMode = project.settings.customImageBlendMode || project.target.customImageBlendMode || 'studio-hdr';
            const isStudioHdr = rawMode === 'studio-hdr';
            const isLuminosity = rawMode === 'luminosity';
            const cssBlendMode = isStudioHdr ? 'normal' : isLuminosity ? 'luminosity' : rawMode;
            const contrast = project.settings.contrastBoost ?? project.target.contrastBoost ?? 1.25;
            const vibrancy = project.settings.vibrancyBoost ?? project.target.characterColorVibrancy ?? 1.18;
            const brightness = project.settings.brightnessBoost ?? 1.02;

            return (
              <div
                className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
                style={{
                  opacity: Math.min(0.65, tintBlend * 0.85),
                  mixBlendMode: cssBlendMode as any,
                  filter: isStudioHdr
                    ? `contrast(${contrast}) saturate(${vibrancy}) brightness(${brightness}) drop-shadow(0 0 1px rgba(0,0,0,0.35))`
                    : `contrast(${Math.max(1.0, contrast * 0.92)}) saturate(${vibrancy})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.target.customImageUrl}
                  alt="Custom Picture Target"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            );
          })()}

        {/* Freely Draggable Glossy Center Divider Emoji Overlay */}
        {project.target.centerDividerEmoji &&
          project.target.centerDividerEmoji !== 'none' && (
            <div
              onMouseDown={handleEmojiMouseDown}
              onTouchStart={handleEmojiTouchStart}
              className={`absolute group z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none transition-shadow ${
                isDraggingEmoji
                  ? 'cursor-grabbing scale-110 ring-2 ring-[#C8A96B] ring-offset-2 ring-offset-black/50 rounded-2xl bg-black/40 backdrop-blur-xs shadow-2xl'
                  : 'cursor-grab hover:scale-105 hover:ring-2 hover:ring-[#C8A96B]/60 hover:ring-offset-1 hover:ring-offset-black/40 rounded-2xl p-1'
              }`}
              style={{
                left: `${currentEmojiX}%`,
                top: `${currentEmojiY}%`,
                fontSize: `${Math.round(canvasHeight * 0.16 * (project.target.centerEmojiScale || 0.70))}px`,
                lineHeight: 1,
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.85)) drop-shadow(0 2px 8px rgba(255,255,255,0.2))',
              }}
              title="Click and drag to move emoji anywhere on canvas"
            >
              <span>{project.target.centerDividerEmoji}</span>

              {/* Hover Drag Hint Tooltip */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-black/90 text-[10px] text-[#E5C158] font-semibold px-2 py-0.5 rounded-md border border-[#C8A96B]/40 shadow-lg z-30">
                🖐️ Drag to Move
              </div>
            </div>
          )}

        {/* Freely Movable Interactive Text Overlay with Drag Handles and Glassmorphism */}
        {hasTextOverlay && (() => {
          const glassPreset = GLASS_EFFECT_PRESETS.find((p) => p.id === overlay.glassEffect) || GLASS_EFFECT_PRESETS[0];
          const isGlass = overlay.glassEffect && overlay.glassEffect !== 'none';
          const glassShape = GLASS_SHAPES.find((s) => s.id === overlay.glassShape) || GLASS_SHAPES[0];
          const glassOpacity = overlay.glassOpacity ?? 0.70;
          const textClarity = overlay.textClarity || 'ultra-pop';
          const clarityStyles = getTextClarityCss(textClarity, overlay.color || '#C8A96B');

          return (
            <div
              onMouseDown={handleTextMouseDown}
              onClick={handleTextOverlayClick}
              className={`absolute group cursor-move flex flex-col items-center justify-center transition-all max-w-[92%] select-none ${
                glassShape.radiusClass
              } ${
                isGlass
                  ? `${glassPreset.bgClass} ${glassPreset.borderClass} ${glassPreset.backdropClass} ${glassPreset.shadowClass} px-7 py-3`
                  : 'p-3 hover:bg-black/30'
              } ${
                isDraggingText
                  ? 'ring-2 ring-[#C8A96B] shadow-2xl cursor-grabbing scale-[1.02]'
                  : isEditingText
                  ? 'ring-2 ring-[#C8A96B] shadow-2xl'
                  : 'hover:ring-1 hover:ring-white/50'
              }`}
              style={{
                left: `${currentTextX}%`,
                top: `${currentTextY}%`,
                transform: 'translate(-50%, -50%)',
                ...(isGlass && overlay.glassOpacity !== undefined
                  ? { backgroundColor: glassPreset.exportBg(glassOpacity) }
                  : {}),
              }}
            >
              {/* Move & Edit Drag Handle Header */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1E] border border-white/20 px-2 py-0.5 rounded-full shadow-lg mb-1 text-[10px] text-white">
                <Move className="w-3 h-3 text-[#C8A96B]" />
                <span className="text-[#C8A96B] font-semibold">Drag Anywhere</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTextOverlay();
                  }}
                  className="ml-1 p-0.5 hover:text-red-400 text-zinc-400"
                  title="Delete text overlay"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <h2
                className="font-bold text-center select-none whitespace-nowrap leading-tight"
                style={{
                  fontFamily: overlay.fontFamily || 'Cinzel, serif',
                  fontSize: `${(overlay.fontSize || 24) * (canvasWidth / 600)}px`,
                  color: overlay.color || '#C8A96B',
                  letterSpacing: overlay.fontFamily?.includes('cursive') ? '0.5px' : '2.5px',
                  ...clarityStyles,
                }}
              >
                {overlay.text}
              </h2>
              {overlay.subtext && (
                <p
                  className="text-xs italic mt-1 text-center select-none whitespace-nowrap"
                  style={{
                    fontFamily: overlay.fontFamily?.includes('cursive') ? overlay.fontFamily : '"Cormorant Garamond", Georgia, serif',
                    color: overlay.color || '#E5C158',
                    fontSize: `${(overlay.fontSize || 24) * 0.45 * (canvasWidth / 600)}px`,
                    ...getTextClarityCss(textClarity === 'ultra-pop' ? 'deep-shadow' : textClarity, overlay.color || '#E5C158'),
                  }}
                >
                  {overlay.subtext}
                </p>
              )}
            </div>
          );
        })()}

        {/* Cinematic Aesthetic Color Grading Layer */}
        {project.settings.aestheticFilter === 'royal-gold' && (
          <div
            className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-amber-300/25 pointer-events-none mix-blend-color"
            style={{ opacity: project.settings.filterIntensity ?? 0.35 }}
          />
        )}
        {project.settings.aestheticFilter === 'kodachrome' && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-amber-900/35 via-rose-900/20 to-amber-700/30 pointer-events-none mix-blend-soft-light"
            style={{ opacity: project.settings.filterIntensity ?? 0.35 }}
          />
        )}
        {project.settings.aestheticFilter === 'noir-silver' && (
          <div
            className="absolute inset-0 bg-black/60 pointer-events-none backdrop-grayscale backdrop-contrast-125"
            style={{ opacity: project.settings.filterIntensity ?? 0.8 }}
          />
        )}
        {project.settings.aestheticFilter === 'golden-hour' && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-orange-600/35 via-amber-500/25 to-yellow-300/15 pointer-events-none mix-blend-overlay"
            style={{ opacity: project.settings.filterIntensity ?? 0.35 }}
          />
        )}
        {project.settings.aestheticFilter === 'cyber-midnight' && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-700/35 via-purple-600/25 to-pink-600/20 pointer-events-none mix-blend-color"
            style={{ opacity: project.settings.filterIntensity ?? 0.35 }}
          />
        )}
        {project.settings.aestheticFilter === 'rose-quartz' && (
          <div
            className="absolute inset-0 bg-gradient-to-tr from-rose-500/30 via-pink-400/20 to-rose-200/25 pointer-events-none mix-blend-color"
            style={{ opacity: project.settings.filterIntensity ?? 0.35 }}
          />
        )}

        {/* Surface Finish Effects Layer */}
        {surfaceFinish === 'acrylic-gloss' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay" />
        )}
        {surfaceFinish === 'fine-art-canvas' && (
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] opacity-15 pointer-events-none mix-blend-overlay" />
        )}
        {surfaceFinish === 'brushed-metal' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent pointer-events-none mix-blend-color-dodge" />
        )}
      </div>

      {/* Magic Spyglass Loupe Magnifier (Follows Cursor at 400% Zoom) */}
      {isLoupeActive && hoveredTile && hoveredPhotoMeta && (
        <div
          className="fixed pointer-events-none z-50 w-44 h-44 rounded-full border-4 border-[#C8A96B] shadow-[0_0_35px_rgba(200,169,107,0.5)] overflow-hidden bg-black flex items-center justify-center -translate-x-1/2 -translate-y-1/2 backdrop-blur-md"
          style={{
            left: `${mouseCanvasPos.x}px`,
            top: `${mouseCanvasPos.y}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hoveredPhotoMeta.thumbnail}
            alt=""
            className="w-full h-full object-cover scale-150"
          />
          <div className="absolute bottom-2 inset-x-0 text-center">
            <span className="px-2 py-0.5 rounded-full bg-black/85 text-[10px] font-mono text-[#E5C158] font-bold border border-[#C8A96B]/40 shadow">
              400% Inspection
            </span>
          </div>
        </div>
      )}

      {/* Floating On-Canvas Text Editor Toolbar / Popover */}
      {isEditingText && overlay && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-[420px] max-w-[95vw] rounded-2xl bg-[#1A1A1E]/95 border border-[#C8A96B]/50 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150 text-white space-y-3.5 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#C8A96B]" />
              <span className="text-xs font-bold font-heading">Edit Canvas Words & Plaque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDeleteTextOverlay}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[11px] font-semibold transition-colors"
                title="Delete this text completely from the canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Words</span>
              </button>
              <button
                onClick={() => setIsEditingText(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Words, Fonts, Glassmorphism */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#121214] rounded-xl border border-[#2C2C34] shrink-0">
            {[
              { id: 'content', label: '📝 Words & Color' },
              { id: 'font', label: '🔤 Stylish Fonts' },
              { id: 'glass', label: '🧊 Glassmorphism' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTextEditorTab(tab.id as any)}
                className={`py-1.5 px-1 rounded-lg text-center text-[11px] font-semibold transition-all ${
                  textEditorTab === tab.id
                    ? 'bg-[#C8A96B] text-black shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: WORDS, COLOR & POSITION */}
          {textEditorTab === 'content' && (
            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {/* Drag Instruction Banner */}
              <div className="p-2 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/25 flex items-center gap-2 text-[11px] text-[#C8A96B]">
                <Move className="w-3.5 h-3.5 shrink-0" />
                <span>Click and drag the text anywhere on canvas to reposition freely!</span>
              </div>

              {/* Direct Text Inputs */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#C8A96B] mb-1">
                    Title Text
                  </label>
                  <input
                    type="text"
                    value={overlay.text || ''}
                    onChange={(e) => handleUpdateText('text', e.target.value)}
                    placeholder="e.g. BUNTY BABLI"
                    className="w-full px-3 py-1.5 bg-[#121214] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Subtitle Text
                  </label>
                  <input
                    type="text"
                    value={overlay.subtext || ''}
                    onChange={(e) => handleUpdateText('subtext', e.target.value)}
                    placeholder="e.g. A Lifetime of Beautiful Memories • 2026"
                    className="w-full px-3 py-1.5 bg-[#121214] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-zinc-200"
                  />
                </div>
              </div>

              {/* Position, Font Size & Color Quick Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Quick Snap Position
                  </label>
                  <div className="flex bg-[#121214] border border-[#2C2C34] rounded-xl p-0.5">
                    {[
                      { id: 'above', label: 'Top' },
                      { id: 'inside', label: 'Center' },
                      { id: 'below', label: 'Bottom' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => handleUpdateText('position', pos.id)}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                          overlay.position === pos.id &&
                          overlay.y === (pos.id === 'above' ? 8 : pos.id === 'inside' ? 50 : 90)
                            ? 'bg-[#C8A96B] text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Color
                  </label>
                  <div className="flex gap-1.5 items-center py-1">
                    {['#C8A96B', '#FFFFFF', '#E5C158', '#FF758C', '#00F2FE', '#0C0C0E'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleUpdateText('color', c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          overlay.color === c ? 'scale-125 border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  <span>Text Size</span>
                  <span className="font-mono text-[#C8A96B]">{overlay.fontSize || 24}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="56"
                  step="1"
                  value={overlay.fontSize || 24}
                  onChange={(e) => handleUpdateText('fontSize', parseInt(e.target.value))}
                  className="w-full accent-[#C8A96B] cursor-pointer"
                />
              </div>

              {/* Text Clarity & Pop Mode */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Text Contrast & Pop
                  </span>
                  <span className="text-zinc-400 font-mono text-[9px]">100% Legibility</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TEXT_CLARITY_PRESETS.map((preset) => {
                    const isSelected = (overlay.textClarity || 'ultra-pop') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleUpdateText('textClarity', preset.id)}
                        className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold ring-1 ring-[#C8A96B]/60'
                            : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className="text-xs font-semibold text-white">{preset.name}</span>
                          <span className="text-[10px]">{preset.icon}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-snug line-clamp-1">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STYLISH FONTS */}
          {textEditorTab === 'font' && (
            <div className="space-y-2 overflow-y-auto pr-1 max-h-[340px] custom-scrollbar">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-[#C8A96B] font-semibold">
                  13 Stylish Signature & Luxury Fonts
                </span>
                <span className="text-[10px] text-zinc-400">1-Tap Apply</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {STYLISH_FONTS.map((font) => {
                  const isSelected = (overlay.fontFamily || 'Cinzel, serif') === font.cssFamily;
                  return (
                    <button
                      key={font.id}
                      onClick={() => handleUpdateText('fontFamily', font.cssFamily)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-200">{font.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400 font-mono">
                            {font.category}
                          </span>
                        </div>
                        <span
                          className="text-sm mt-0.5 truncate text-[#FAF8F5]"
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {overlay.text || font.sample}
                        </span>
                      </div>
                      {isSelected && (
                        <Sparkle className="w-4 h-4 text-[#E5C158] shrink-0 fill-[#E5C158]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GLASSMORPHISM PLAQUE */}
          {textEditorTab === 'glass' && (
            <div className="space-y-3.5 overflow-y-auto pr-1 max-h-[340px] custom-scrollbar">
              <div>
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider mb-1.5">
                  Glassmorphism Card Effect
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GLASS_EFFECT_PRESETS.map((preset) => {
                    const isSelected = (overlay.glassEffect || 'none') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleUpdateText('glassEffect', preset.id)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/60'
                            : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-semibold text-white">{preset.name}</span>
                          <span className="text-[10px]">{preset.badge}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Glass Shape & Opacity (Only when glass is active) */}
              {overlay.glassEffect && overlay.glassEffect !== 'none' && (
                <div className="p-3 rounded-xl bg-[#121214] border border-[#2C2C34] space-y-3">
                  {/* Shape Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                      Glass Plaque Shape
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GLASS_SHAPES.map((shape) => {
                        const isShapeSelected = (overlay.glassShape || 'pill') === shape.id;
                        return (
                          <button
                            key={shape.id}
                            onClick={() => handleUpdateText('glassShape', shape.id)}
                            className={`p-1.5 rounded-lg border text-center text-xs flex items-center justify-center gap-1 transition-all ${
                              isShapeSelected
                                ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                                : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{shape.icon}</span>
                            <span className="text-[11px] truncate">{shape.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Glass Frosting / Dark Opacity Slider */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-300 font-semibold uppercase">Plaque Darkness / Opacity</span>
                      <span className="font-mono text-[#E5C158] font-bold">
                        {Math.round((overlay.glassOpacity ?? 0.88) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.20"
                      max="1.0"
                      step="0.05"
                      value={overlay.glassOpacity ?? 0.88}
                      onChange={(e) => handleUpdateText('glassOpacity', parseFloat(e.target.value))}
                      className="w-full accent-[#C8A96B] cursor-pointer h-1.5"
                    />
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { label: '50%', val: 0.50 },
                        { label: '75%', val: 0.75 },
                        { label: '90%', val: 0.90 },
                        { label: '100% Solid', val: 1.0 },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => handleUpdateText('glassOpacity', p.val)}
                          className={`py-1 rounded-md text-[10px] font-semibold border transition-all ${
                            Math.abs((overlay.glassOpacity ?? 0.88) - p.val) < 0.04
                              ? 'border-[#C8A96B] bg-[#C8A96B]/30 text-white font-bold'
                              : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Tile Inspector Popover */}
      {selectedTile && selectedPhotoMeta && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute top-16 right-6 z-40 w-72 rounded-2xl bg-[#1A1A1E]/95 border border-[#C8A96B]/40 p-4 shadow-2xl backdrop-blur-md animate-in fade-in duration-150 text-white space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A96B]" />
              <span className="text-xs font-bold font-heading">Tile Photo Inspector</span>
            </div>
            <button
              onClick={() => setSelectedTile(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhotoMeta.thumbnail}
              alt={selectedPhotoMeta.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#C8A96B]/30 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate text-white">
                {selectedPhotoMeta.name}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                Grid: [{selectedTile.gridX}, {selectedTile.gridY}]
              </div>
              <div className="text-[11px] text-[#C8A96B] font-semibold mt-0.5">
                Match Score: {selectedTile.similarityScore}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => onSetHeroPhoto(selectedPhotoMeta.id)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#C8A96B]/15 hover:bg-[#C8A96B]/25 text-[#C8A96B] text-xs font-semibold transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Set as Hero</span>
            </button>

            <button
              onClick={() => {
                const allPhotos = Array.from(photosMap.values());
                const nextPhoto =
                  allPhotos[
                    (allPhotos.findIndex((p) => p.id === selectedPhotoMeta.id) + 1) %
                      allPhotos.length
                  ];
                onReplaceTilePhoto(selectedTile.id, nextPhoto.id);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cycle Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
