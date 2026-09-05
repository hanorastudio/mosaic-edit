'use client';

import React from 'react';
import { SYSTEM_DECORATIONS } from '@/lib/engine/templateLibrary';
import { AlbumElement } from '@/types/album';
import { generateId } from '@/lib/utils';
import { Sparkles, Crown } from 'lucide-react';

interface DecorationsPanelProps {
  onAddDecoration: (element: AlbumElement) => void;
}

export const DecorationsPanel: React.FC<DecorationsPanelProps> = ({ onAddDecoration }) => {
  const handleAdd = (dec: (typeof SYSTEM_DECORATIONS)[0]) => {
    const newElement: AlbumElement = {
      id: generateId('elem_dec'),
      type: 'decoration',
      decorationType: dec.type,
      x: 25,
      y: dec.type === 'mandap-arch' || dec.type === 'gold-divider' ? 10 : 35,
      width: dec.type === 'gold-divider' ? 50 : 30,
      height: dec.type === 'gold-divider' ? 8 : 20,
      rotation: 0,
      zIndex: 5,
      opacity: 0.95,
    };
    onAddDecoration(newElement);
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] space-y-1">
        <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
          Decorations & Ornaments
        </h3>
        <p className="text-xs text-[#9E9E9E]">Click any ornament to place it on the active page.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {SYSTEM_DECORATIONS.map((dec) => (
          <button
            key={dec.id}
            onClick={() => handleAdd(dec)}
            className="w-full p-3 rounded-xl border border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B] hover:bg-[#1A1A1E] transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-12 bg-black/40 rounded-lg p-1.5 flex items-center justify-center border border-white/5 group-hover:border-[#C8A96B]/30"
                dangerouslySetInnerHTML={{ __html: dec.svg }}
              />
              <div>
                <div className="text-xs font-semibold text-[#FAF8F5]">{dec.name}</div>
                <div className="text-[10px] text-[#C8A96B] uppercase font-mono tracking-wider">
                  {dec.category}
                </div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-[#9E9E9E] group-hover:text-[#C8A96B] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
