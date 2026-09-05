'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  AlbumProject,
  AlbumPage,
  AlbumElement,
  PhotoMetadata,
} from '@/types/album';
import { getCssFilterString } from '@/lib/utils';
import { SYSTEM_DECORATIONS } from '@/lib/engine/templateLibrary';
import { Crop, Move, RotateCw, Image as ImageIcon } from 'lucide-react';

interface CanvasStageProps {
  project: AlbumProject;
  currentPageIndex: number;
  selectedElementId: string | null;
  photosMap: Map<string, PhotoMetadata>;
  zoomLevel: number;
  isSpreadView: boolean;
  showBleed: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<AlbumElement>) => void;
  onSwapPhoto: (elementId: string, newPhotoId: string) => void;
  onOpenCropModal: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  project,
  currentPageIndex,
  selectedElementId,
  photosMap,
  zoomLevel,
  isSpreadView,
  showBleed,
  onSelectElement,
  onUpdateElement,
  onSwapPhoto,
  onOpenCropModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<'move' | 'resize-br' | 'resize-tl' | 'rotate' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elemX: number; elemY: number; elemW: number; elemH: number; rot: number }>({
    x: 0,
    y: 0,
    elemX: 0,
    elemY: 0,
    elemW: 0,
    elemH: 0,
    rot: 0,
  });

  const currentPage = project.pages[currentPageIndex] || project.pages[0];
  const secondPage = isSpreadView && currentPageIndex + 1 < project.pages.length
    ? project.pages[currentPageIndex + 1]
    : null;

  const baseW = 600; // Base canvas render width in px
  const baseH = Math.round(baseW / project.dimensions.aspectRatio);

  const selectedElement = currentPage?.elements.find((e) => e.id === selectedElementId) || null;

  // Handle Drag & Drop photo swap onto an existing element
  const handleDropOnElement = (e: React.DragEvent, targetElem: AlbumElement) => {
    e.preventDefault();
    e.stopPropagation();
    const photoId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('photoId');
    if (photoId && targetElem.type === 'photo') {
      onSwapPhoto(targetElem.id, photoId);
    }
  };

  // Direct element manipulation: Mouse down handler
  const handleElementMouseDown = (
    e: React.MouseEvent,
    elem: AlbumElement,
    mode: 'move' | 'resize-br' | 'resize-tl' | 'rotate' = 'move'
  ) => {
    e.stopPropagation();
    onSelectElement(elem.id);
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height,
      rot: elem.rotation || 0,
    });
  };

  // Mouse move handler for dragging, resizing, rotating
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElement || !dragMode) return;

      const deltaX = (e.clientX - dragStart.x) / (baseW * zoomLevel);
      const deltaY = (e.clientY - dragStart.y) / (baseH * zoomLevel);

      const pctDeltaX = deltaX * 100;
      const pctDeltaY = deltaY * 100;

      if (dragMode === 'move') {
        const newX = Math.max(0, Math.min(100 - selectedElement.width, dragStart.elemX + pctDeltaX));
        const newY = Math.max(0, Math.min(100 - selectedElement.height, dragStart.elemY + pctDeltaY));
        onUpdateElement(selectedElement.id, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (dragMode === 'resize-br') {
        const newW = Math.max(10, Math.min(100 - selectedElement.x, dragStart.elemW + pctDeltaX));
        const newH = Math.max(10, Math.min(100 - selectedElement.y, dragStart.elemH + pctDeltaY));
        onUpdateElement(selectedElement.id, {
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      } else if (dragMode === 'rotate') {
        const angleDelta = (e.clientX - dragStart.x) * 0.5;
        onUpdateElement(selectedElement.id, {
          rotation: Math.round((dragStart.rot + angleDelta) % 360),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragMode, dragStart, selectedElement, baseW, baseH, zoomLevel, onUpdateElement]);

  const renderPageCanvas = (page: AlbumPage, isRightSpread: boolean = false) => {
    const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <div
        className="relative bg-white shadow-2xl overflow-hidden transition-all select-none"
        style={{
          width: `${baseW}px`,
          height: `${baseH}px`,
          background: page.background.value,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectElement(null);
          }
        }}
      >
        {/* Bleed Guide Overlay (3mm Bleed margin) */}
        {showBleed && (
          <div className="absolute inset-0 pointer-events-none border border-red-500/50 border-dashed z-40 m-1">
            <span className="absolute top-1 left-1 text-[8px] bg-red-500/80 text-white px-1 rounded">
              Bleed 3mm
            </span>
          </div>
        )}

        {/* Safe Margin Guide Overlay (6mm Margin) */}
        {showBleed && (
          <div className="absolute inset-0 pointer-events-none border border-blue-500/40 border-dashed z-40 m-4">
            <span className="absolute bottom-1 right-1 text-[8px] bg-blue-500/80 text-white px-1 rounded">
              Safe Zone
            </span>
          </div>
        )}

        {/* Elements Rendering */}
        {sortedElements.map((elem) => {
          const isSelected = selectedElementId === elem.id;
          const photo = elem.photoId ? photosMap.get(elem.photoId) : undefined;
          const filterStyle = elem.filter ? getCssFilterString(elem.filter) : 'none';

          return (
            <div
              key={elem.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(elem.id);
              }}
              onMouseDown={(e) => handleElementMouseDown(e, elem, 'move')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnElement(e, elem)}
              className={`absolute cursor-pointer transition-shadow ${
                isSelected
                  ? 'ring-2 ring-[#C8A96B] ring-offset-1 ring-offset-black/50 shadow-2xl z-30'
                  : 'hover:ring-1 hover:ring-[#C8A96B]/50'
              }`}
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
              {/* PHOTO ELEMENT */}
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
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.thumbnail}
                      alt={photo.name}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        filter: filterStyle,
                        transform: elem.crop
                          ? `translate(${elem.crop.x}%, ${elem.crop.y}%) scale(${elem.crop.scale})`
                          : 'none',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-zinc-400 bg-zinc-900/60">
                      <ImageIcon className="w-6 h-6 mb-1 text-zinc-500" />
                      <span className="text-[10px]">Drag Photo Here</span>
                    </div>
                  )}
                </div>
              )}

              {/* TEXT ELEMENT */}
              {elem.type === 'text' && (
                <div
                  className="w-full h-full flex items-center justify-center select-none"
                  style={{
                    fontFamily: elem.fontFamily || 'Cinzel, serif',
                    fontSize: `${(elem.fontSize || 16) * (baseW / 800)}px`,
                    fontWeight: elem.fontWeight || 'normal',
                    color: elem.color || '#1A1A1A',
                    textAlign: elem.textAlign || 'center',
                    letterSpacing: `${elem.letterSpacing || 0}px`,
                    fontStyle: elem.italic ? 'italic' : 'normal',
                  }}
                >
                  <span className="w-full truncate px-1">{elem.text}</span>
                </div>
              )}

              {/* DECORATION ELEMENT */}
              {elem.type === 'decoration' && (
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
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

              {/* Selected Element Handles (Resize, Rotate, Crop shortcuts) */}
              {isSelected && (
                <>
                  {/* Bottom-Right Resize Handle */}
                  <div
                    onMouseDown={(e) => handleElementMouseDown(e, elem, 'resize-br')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm bg-[#C8A96B] border border-black cursor-se-resize shadow-md z-40"
                  />

                  {/* Top Rotation Handle */}
                  <div
                    onMouseDown={(e) => handleElementMouseDown(e, elem, 'rotate')}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#C8A96B] border border-black flex items-center justify-center text-black cursor-grab shadow-md z-40"
                    title="Rotate"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                  </div>

                  {/* Quick Crop Badge (for photos) */}
                  {elem.type === 'photo' && photo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCropModal();
                      }}
                      className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[#C8A96B] text-[9px] flex items-center gap-1 border border-[#C8A96B]/40 shadow-md backdrop-blur z-40 hover:bg-black"
                      title="Adjust Crop"
                    >
                      <Crop className="w-2.5 h-2.5" />
                      <span>Crop</span>
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Page Number Label in Footer */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-black/30 pointer-events-none uppercase">
          {page.title || `Page ${page.pageNumber}`}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-[#0E0E10] overflow-auto flex items-center justify-center p-8 relative"
      onClick={() => onSelectElement(null)}
    >
      {/* Zoomed Canvas Container */}
      <div
        className="transition-transform duration-100 ease-out origin-center flex items-center shadow-2xl"
        style={{
          transform: `scale(${zoomLevel})`,
        }}
      >
        {isSpreadView && secondPage ? (
          <div className="flex items-center rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
            {/* Left Spread Page */}
            {renderPageCanvas(currentPage, false)}

            {/* Central Gutter Spine / Fold shadow simulation */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/25 via-black/40 to-black/25 pointer-events-none z-30" />

            {/* Right Spread Page */}
            {renderPageCanvas(secondPage, true)}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {renderPageCanvas(currentPage, false)}
          </div>
        )}
      </div>
    </div>
  );
};
