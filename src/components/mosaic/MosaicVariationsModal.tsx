'use client';

import React, { useState } from 'react';
import { MosaicSettings } from '@/types/mosaic';
import {
  X,
  Sparkles,
  Grid,
  Palette,
  Maximize2,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface MosaicVariationsModalProps {
  onApplyVariation: (settings: Partial<MosaicSettings>) => void;
  onClose: () => void;
}

export const MosaicVariationsModal: React.FC<MosaicVariationsModalProps> = ({
  onApplyVariation,
  onClose,
}) => {
  const variations: {
    id: string;
    name: string;
    desc: string;
    settings: Partial<MosaicSettings>;
  }[] = [
    {
      id: 'high-density',
      name: 'Ultra High Density',
      desc: 'Maximum detail with over 3,000 fine photo tiles forming a razor-sharp silhouette.',
      settings: { density: 'high', tileGap: 0, colorMatchingMode: 'color-match', colorTintBlend: 0.1 },
    },
    {
      id: 'large-tiles',
      name: 'Large Photos (Clean Micro-Gap)',
      desc: 'Spacious photo tiles with 2px borders, allowing viewers to see faces clearly without zooming.',
      settings: { density: 'low', tileGap: 2, borderRadius: 4, colorMatchingMode: 'shape-only', colorTintBlend: 0.05 },
    },
    {
      id: 'color-matched',
      name: 'High Precision Color Match',
      desc: 'Strict CIE-LAB Delta-E color sorting matching skin tones, florals and ambient light.',
      settings: { density: 'medium', colorMatchingMode: 'color-match', colorTintBlend: 0.2 },
    },
    {
      id: 'artistic-blend',
      name: 'Artistic Luxury Tone',
      desc: 'Harmonized champagne gold tint with high contrast shadows and rounded tile corners.',
      settings: { density: 'medium', tileGap: 1, borderRadius: 6, colorMatchingMode: 'artistic', colorTintBlend: 0.25 },
    },
  ];

  const [selectedId, setSelectedId] = useState<string>('high-density');

  const handleApply = () => {
    const chosen = variations.find((v) => v.id === selectedId) || variations[0];
    onApplyVariation(chosen.settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-xl max-h-[90dvh] shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2C2C34] bg-[#141417] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C8A96B]/20 flex items-center justify-center text-[#C8A96B] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading">Artwork Style Variations</h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">Select a layout variation for your photos.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 touch-action-manipulation">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variations List */}
        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {variations.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-start justify-between transition-all touch-action-manipulation active:scale-98 ${
                selectedId === v.id
                  ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md shadow-[#C8A96B]/20'
                  : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/40'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{v.name}</div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">{v.desc}</div>
              </div>
              {selectedId === v.id && (
                <CheckCircle2 className="w-4 h-4 text-[#C8A96B] shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#2C2C34] bg-[#141417] shrink-0 pb-safe">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors touch-action-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 text-xs font-bold text-[#141414] bg-[#C8A96B] hover:bg-[#E5C158] rounded-xl shadow-lg transition-colors touch-action-manipulation active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Apply Style Variation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

