'use client';

import React, { useState } from 'react';
import { TEMPLATE_DEFINITIONS } from '@/lib/engine/templateLibrary';
import { TemplateDefinition, AlbumCategory } from '@/types/album';
import { LayoutGrid, Sparkles } from 'lucide-react';

interface TemplatesPanelProps {
  onApplyTemplate: (template: TemplateDefinition) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = TEMPLATE_DEFINITIONS.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory || t.category === 'all';
  });

  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
            Page Templates
          </h3>
          <span className="text-xs text-[#9E9E9E]">Click to apply</span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'karizma', label: 'Karizma' },
            { id: 'wedding', label: 'Wedding' },
            { id: 'minimal', label: 'Minimal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-[#C8A96B] text-black font-semibold'
                  : 'bg-[#141417] text-[#9E9E9E] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onApplyTemplate(template)}
            className="group p-3 rounded-xl border border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B] hover:bg-[#1A1A1E] transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FAF8F5]">{template.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
                {template.photoCount} {template.photoCount === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>

            {/* Template Geometry Preview Wireframe */}
            <div className="w-full h-28 rounded-lg bg-[#0D0D10] border border-[#2C2C34] relative overflow-hidden p-2">
              {template.elements.map((elem, idx) => {
                if (elem.type === 'photo') {
                  return (
                    <div
                      key={idx}
                      className="absolute rounded bg-[#2A2A35] border border-[#C8A96B]/40 flex items-center justify-center text-[10px] text-[#C8A96B]/80 font-mono shadow-sm"
                      style={{
                        left: `${elem.x}%`,
                        top: `${elem.y}%`,
                        width: `${elem.width}%`,
                        height: `${elem.height}%`,
                      }}
                    >
                      Photo
                    </div>
                  );
                } else if (elem.type === 'text') {
                  return (
                    <div
                      key={idx}
                      className="absolute bg-[#C8A96B]/20 rounded text-[8px] text-center text-[#C8A96B] font-serif flex items-center justify-center truncate px-1"
                      style={{
                        left: `${elem.x}%`,
                        top: `${elem.y}%`,
                        width: `${elem.width}%`,
                        height: `${elem.height}%`,
                      }}
                    >
                      {elem.text || 'Heading'}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <p className="text-[11px] text-[#9E9E9E] line-clamp-1">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
