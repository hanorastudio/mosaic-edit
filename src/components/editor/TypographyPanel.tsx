'use client';

import React from 'react';
import { AlbumElement } from '@/types/album';
import { generateId } from '@/lib/utils';
import { Type, Sparkles } from 'lucide-react';

interface TypographyPanelProps {
  onAddTextElement: (element: AlbumElement) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ onAddTextElement }) => {
  const textPresets = [
    {
      id: 'cover-title',
      name: 'Royal Cover Title',
      sample: 'UMESH & SAKSHI',
      fontFamily: 'Cinzel, serif',
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 4,
      color: '#C8A96B',
      height: 10,
    },
    {
      id: 'editorial-heading',
      name: 'Editorial Chapter Heading',
      sample: 'The Sacred Vows',
      fontFamily: 'Playfair Display, serif',
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: 2,
      color: '#1A1A1A',
      height: 8,
    },
    {
      id: 'poetic-quote',
      name: 'Poetic Quote / Story',
      sample: '"A lifetime of shared smiles & eternal love."',
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 14,
      fontWeight: 400,
      italic: true,
      letterSpacing: 1,
      color: '#666666',
      height: 8,
    },
    {
      id: 'modern-subheading',
      name: 'Modern Clean Subtitle',
      sample: '24TH NOVEMBER 2026',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 3,
      color: '#888888',
      height: 6,
    },
  ];

  const handleAddPreset = (preset: (typeof textPresets)[0]) => {
    const newText: AlbumElement = {
      id: generateId('elem_txt'),
      type: 'text',
      text: preset.sample,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      letterSpacing: preset.letterSpacing,
      color: preset.color,
      italic: preset.italic || false,
      textAlign: 'center',
      x: 15,
      y: 40,
      width: 70,
      height: preset.height,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
    };
    onAddTextElement(newText);
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] space-y-1">
        <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
          Typography & Text
        </h3>
        <p className="text-xs text-[#9E9E9E]">Add titles, dates, quotes and captions.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {textPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleAddPreset(preset)}
            className="w-full p-4 rounded-xl border border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B] hover:bg-[#1A1A1E] transition-all text-left group space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-[#9E9E9E]">
              <span className="font-semibold text-white/90">{preset.name}</span>
              <span className="text-[10px] font-mono">{preset.fontFamily.split(',')[0]}</span>
            </div>

            <div
              className="py-2 px-3 bg-[#121214] rounded-lg border border-white/5 truncate group-hover:border-[#C8A96B]/30"
              style={{
                fontFamily: preset.fontFamily,
                fontSize: 16,
                fontWeight: preset.fontWeight,
                color: preset.color,
                letterSpacing: `${preset.letterSpacing}px`,
                fontStyle: preset.italic ? 'italic' : 'normal',
              }}
            >
              {preset.sample}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
