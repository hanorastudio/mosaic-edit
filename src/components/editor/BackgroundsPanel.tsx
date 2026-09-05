'use client';

import React, { useState } from 'react';
import { SYSTEM_BACKGROUNDS } from '@/lib/engine/templateLibrary';
import { PageBackground } from '@/types/album';
import { CheckCircle2, Palette } from 'lucide-react';

interface BackgroundsPanelProps {
  currentBackground: PageBackground;
  onApplyBackground: (bg: PageBackground, applyToAll: boolean) => void;
}

export const BackgroundsPanel: React.FC<BackgroundsPanelProps> = ({
  currentBackground,
  onApplyBackground,
}) => {
  const [customColor, setCustomColor] = useState<string>('#FAF8F5');
  const [applyToAll, setApplyToAll] = useState<boolean>(false);

  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] space-y-3">
        <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
          Page Backgrounds
        </h3>

        {/* Scope Toggle */}
        <label className="flex items-center gap-2 p-2 rounded-lg bg-[#141417] border border-[#2C2C34] cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="accent-[#C8A96B]"
          />
          <span className="text-[#FAF8F5]">Apply chosen background to all pages</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Curated Luxury Presets */}
        <div>
          <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider mb-2.5">
            Curated Palettes & Textures
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {SYSTEM_BACKGROUNDS.map((item) => {
              const isSelected = currentBackground.value === item.background.value;
              return (
                <button
                  key={item.id}
                  onClick={() => onApplyBackground(item.background, applyToAll)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                    isSelected
                      ? 'border-[#C8A96B] shadow-[0_0_12px_rgba(200,169,107,0.3)]'
                      : 'border-[#2C2C34] hover:border-[#C8A96B]/50'
                  } bg-[#141417]`}
                >
                  <div
                    className="w-full h-14 rounded-lg border border-black/20 shadow-inner relative flex items-center justify-center"
                    style={{
                      background: item.background.value,
                    }}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#C8A96B] drop-shadow-md" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#FAF8F5] truncate">
                    {item.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Selector */}
        <div className="p-4 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>Custom Solid Color</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-white font-mono focus:outline-none focus:border-[#C8A96B]"
            />
          </div>

          <button
            onClick={() => onApplyBackground({ type: 'color', value: customColor }, applyToAll)}
            className="w-full py-2 bg-[#2C2C34] hover:bg-[#C8A96B] hover:text-black text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
};
