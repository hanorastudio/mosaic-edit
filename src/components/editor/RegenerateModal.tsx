'use client';

import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Crown, Feather, Grid, Maximize, Film } from 'lucide-react';

interface RegenerateModalProps {
  onRegenerate: (variation: string) => Promise<void>;
  onClose: () => void;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  onRegenerate,
  onClose,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<string>('luxury');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const variations = [
    {
      id: 'luxury',
      title: 'More Luxury & Royal Gold',
      desc: 'Adds gold filigree borders, dark velvet/champagne gradients, and couple spotlight insets.',
      icon: Crown,
    },
    {
      id: 'minimal',
      title: 'More Minimal & Clean',
      desc: 'Paring back decorations with generous ivory negative space and editorial typography.',
      icon: Feather,
    },
    {
      id: 'more-photos',
      title: 'More Photos per Page (Dense)',
      desc: 'Compacts images into harmonious 4-photo and 6-photo celebration collages.',
      icon: Grid,
    },
    {
      id: 'fewer-photos',
      title: 'Fewer Photos (Hero Focus)',
      desc: 'Expands into large full-bleed hero spreads and 2-photo focus layouts.',
      icon: Maximize,
    },
    {
      id: 'cinematic',
      title: 'More Cinematic Spreads',
      desc: 'Wide horizontal panoramic crops with movie-still elegance and subtitle captions.',
      icon: Film,
    },
  ];

  const handleApply = async () => {
    setIsProcessing(true);
    await onRegenerate(selectedVariation);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/20 flex items-center justify-center text-[#C8A96B]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#FAF8F5] font-heading">
                Regenerate Album Design
              </h3>
              <p className="text-xs text-[#9E9E9E]">
                Re-mix your photos into a brand new layout variation in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variations List */}
        <div className="p-6 space-y-3">
          {variations.map((v) => {
            const Icon = v.icon;
            const isSelected = selectedVariation === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVariation(v.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md'
                    : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/40 hover:bg-[#1C1C22]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-[#C8A96B] text-black' : 'bg-[#2C2C34] text-[#C8A96B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#FAF8F5]">{v.title}</h4>
                  <p className="text-[11px] text-[#9E9E9E] mt-0.5">{v.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#141414] bg-[#C8A96B] hover:bg-[#E5C158] rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            {isProcessing ? 'Regenerating...' : 'Regenerate Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
