'use client';

import React from 'react';
import { AlbumElement, PhotoMetadata, ElementFilter } from '@/types/album';
import {
  Trash2,
  Copy,
  Crop,
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Sliders,
  Sparkles,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Contrast,
} from 'lucide-react';

interface RightSidebarProps {
  selectedElement: AlbumElement | null;
  photosMap: Map<string, PhotoMetadata>;
  onUpdateElement: (updates: Partial<AlbumElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onOpenCropModal: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElement,
  photosMap,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  onOpenCropModal,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-72 h-full border-l border-[#2C2C34] bg-[#1A1A1E] p-6 flex flex-col items-center justify-center text-center text-xs text-[#9E9E9E] select-none shrink-0">
        <Sliders className="w-8 h-8 text-[#44444E] mb-3" />
        <h4 className="text-sm font-semibold text-white/80 mb-1">Inspector</h4>
        <p>Click on any photo, text, or ornament on the canvas to customize its properties.</p>
      </div>
    );
  }

  const selectedPhoto =
    selectedElement.type === 'photo' && selectedElement.photoId
      ? photosMap.get(selectedElement.photoId)
      : undefined;

  const currentFilter: ElementFilter = selectedElement.filter || {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
  };

  const handleFilterChange = (key: keyof ElementFilter, val: number) => {
    onUpdateElement({
      filter: {
        ...currentFilter,
        [key]: val,
      },
    });
  };

  return (
    <div className="w-80 h-full border-l border-[#2C2C34] bg-[#1A1A1E] flex flex-col text-white select-none shrink-0 z-20">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] flex items-center justify-between bg-[#141417]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8A96B]">
            {selectedElement.type} Inspector
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicateElement}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
            title="Duplicate element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteElement}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-colors"
            title="Delete element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Layer Arranging */}
        <div>
          <label className="block text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
            Layer Stacking
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBringToFront}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] rounded-lg transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Bring to Front</span>
            </button>
            <button
              onClick={onSendToBack}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] rounded-lg transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Send to Back</span>
            </button>
          </div>
        </div>

        {/* Geometry Settings */}
        <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Position & Dimensions (%)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-[10px] text-[#9E9E9E]">X: {Math.round(selectedElement.x)}%</span>
              <input
                type="range"
                min="0"
                max="90"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement({ x: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9E9E9E]">Y: {Math.round(selectedElement.y)}%</span>
              <input
                type="range"
                min="0"
                max="90"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement({ y: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9E9E9E]">Width: {Math.round(selectedElement.width)}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement({ width: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9E9E9E]">Height: {Math.round(selectedElement.height)}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement({ height: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
          </div>

          {/* Rotation & Opacity */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#2C2C34]">
            <div>
              <span className="text-[10px] text-[#9E9E9E]">Rotation: {selectedElement.rotation || 0}°</span>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedElement.rotation || 0}
                onChange={(e) => onUpdateElement({ rotation: parseInt(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9E9E9E]">
                Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedElement.opacity ?? 1}
                onChange={(e) => onUpdateElement({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B]"
              />
            </div>
          </div>
        </div>

        {/* PHOTO SPECIFIC SETTINGS */}
        {selectedElement.type === 'photo' && (
          <div className="space-y-4">
            {/* Focal Crop Button */}
            <button
              onClick={onOpenCropModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C8A96B]/15 hover:bg-[#C8A96B]/25 border border-[#C8A96B]/40 text-[#C8A96B] font-semibold rounded-xl transition-colors"
            >
              <Crop className="w-4 h-4" />
              <span>Adjust Crop & Smart Focal Point</span>
            </button>

            {/* Borders & Frames */}
            <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                Border & Frame Styling
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#9E9E9E]">
                    Border: {selectedElement.borderWidth || 0}px
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={selectedElement.borderWidth || 0}
                    onChange={(e) =>
                      onUpdateElement({
                        borderWidth: parseInt(e.target.value),
                        borderColor: selectedElement.borderColor || '#C8A96B',
                      })
                    }
                    className="w-full accent-[#C8A96B]"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-[#9E9E9E]">
                    Radius: {selectedElement.borderRadius || 0}px
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={selectedElement.borderRadius || 0}
                    onChange={(e) => onUpdateElement({ borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-[#C8A96B]"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#9E9E9E]">Border Color</span>
                <div className="flex items-center gap-1.5">
                  {['#C8A96B', '#D4AF37', '#FFFFFF', '#141414', '#5A2430'].map((col) => (
                    <button
                      key={col}
                      onClick={() => onUpdateElement({ borderColor: col, borderWidth: selectedElement.borderWidth || 2 })}
                      className={`w-5 h-5 rounded-full border ${
                        selectedElement.borderColor === col ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Filters */}
            <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                Photo Color Adjustments
              </label>

              <div>
                <div className="flex justify-between text-[10px] text-[#9E9E9E] mb-1">
                  <span>Brightness</span>
                  <span>{currentFilter.brightness || 100}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={currentFilter.brightness || 100}
                  onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                  className="w-full accent-[#C8A96B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-[#9E9E9E] mb-1">
                  <span>Contrast</span>
                  <span>{currentFilter.contrast || 100}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={currentFilter.contrast || 100}
                  onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                  className="w-full accent-[#C8A96B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-[#9E9E9E] mb-1">
                  <span>Saturation</span>
                  <span>{currentFilter.saturate || 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={currentFilter.saturate || 100}
                  onChange={(e) => handleFilterChange('saturate', parseInt(e.target.value))}
                  className="w-full accent-[#C8A96B]"
                />
              </div>

              {/* Quick Tone Presets */}
              <div className="grid grid-cols-3 gap-1.5 pt-2">
                <button
                  onClick={() =>
                    onUpdateElement({
                      filter: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0 },
                    })
                  }
                  className="py-1 px-2 rounded bg-[#2C2C34] hover:bg-[#383842] text-[10px]"
                >
                  Normal
                </button>
                <button
                  onClick={() =>
                    onUpdateElement({
                      filter: { brightness: 105, contrast: 115, saturate: 0, grayscale: 100, sepia: 0 },
                    })
                  }
                  className="py-1 px-2 rounded bg-[#2C2C34] hover:bg-[#383842] text-[10px]"
                >
                  Classic B&W
                </button>
                <button
                  onClick={() =>
                    onUpdateElement({
                      filter: { brightness: 100, contrast: 105, saturate: 85, grayscale: 0, sepia: 40 },
                    })
                  }
                  className="py-1 px-2 rounded bg-[#2C2C34] hover:bg-[#383842] text-[10px]"
                >
                  Vintage Sepia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEXT SPECIFIC SETTINGS */}
        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                Text Content
              </label>
              <textarea
                rows={3}
                value={selectedElement.text || ''}
                onChange={(e) => onUpdateElement({ text: e.target.value })}
                className="w-full p-2.5 bg-[#141417] border border-[#2C2C34] rounded-lg text-white text-xs focus:outline-none focus:border-[#C8A96B]"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                Typography & Font
              </label>

              {/* Font Family Dropdown */}
              <div>
                <span className="text-[10px] text-[#9E9E9E] block mb-1">Font Family</span>
                <select
                  value={selectedElement.fontFamily || 'Cinzel, serif'}
                  onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
                  className="w-full p-2 bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-xs text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="Cinzel, serif">Cinzel (Royal Gold & Luxury)</option>
                  <option value="Playfair Display, serif">Playfair Display (Editorial)</option>
                  <option value="Cormorant Garamond, serif">Cormorant Garamond (Poetic)</option>
                  <option value="Montserrat, sans-serif">Montserrat (Modern Clean)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Jakarta Sans (Minimal)</option>
                </select>
              </div>

              {/* Font Size & Alignment */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#9E9E9E]">Size: {selectedElement.fontSize || 16}pt</span>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-[#C8A96B]"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-[#9E9E9E] block mb-1">Align</span>
                  <div className="flex bg-[#1A1A1E] rounded-lg border border-[#2C2C34] p-0.5">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateElement({ textAlign: align })}
                        className={`flex-1 py-1 flex items-center justify-center rounded ${
                          selectedElement.textAlign === align
                            ? 'bg-[#C8A96B] text-black font-bold'
                            : 'text-[#9E9E9E]'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Letter Spacing & Color */}
              <div>
                <span className="text-[10px] text-[#9E9E9E]">Letter Spacing: {selectedElement.letterSpacing || 0}px</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selectedElement.letterSpacing || 0}
                  onChange={(e) => onUpdateElement({ letterSpacing: parseInt(e.target.value) })}
                  className="w-full accent-[#C8A96B]"
                />
              </div>

              {/* Text Color Presets */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#9E9E9E]">Text Color</span>
                <div className="flex items-center gap-1.5">
                  {['#FAF8F5', '#C8A96B', '#D4AF37', '#1A1A1A', '#5A2430', '#888888'].map((col) => (
                    <button
                      key={col}
                      onClick={() => onUpdateElement({ color: col })}
                      className={`w-5 h-5 rounded-full border ${
                        selectedElement.color === col ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
