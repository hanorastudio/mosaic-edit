'use client';

import React from 'react';
import { AlbumProject, AlbumSize, AlbumOrientation } from '@/types/album';

interface SettingsPanelProps {
  project: AlbumProject;
  onChangeSize: (size: AlbumSize, orientation: AlbumOrientation) => void;
  onToggleBleedGuide: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  project,
  onChangeSize,
  onToggleBleedGuide,
  onToggleGrid,
  onToggleSnap,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] space-y-1">
        <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
          Album & Canvas Settings
        </h3>
        <p className="text-xs text-[#9E9E9E]">Configure print dimensions and guides.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dimensions */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
            Print Dimensions
          </label>
          <div className="space-y-2">
            {[
              { id: '12x12', name: '12 × 12 inches (Grand Karizma)', orient: 'square' as const },
              { id: '10x10', name: '10 × 10 inches (Classic Square)', orient: 'square' as const },
              { id: '8x8', name: '8 × 8 inches (Compact Square)', orient: 'square' as const },
              { id: 'A4', name: 'A4 Landscape (Print Book)', orient: 'landscape' as const },
              { id: 'A3', name: 'A3 Deluxe Widescreen', orient: 'landscape' as const },
            ].map((s) => (
              <label
                key={s.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  project.size === s.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white'
                    : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E] hover:border-[#2C2C34]'
                }`}
              >
                <span className="text-xs font-medium">{s.name}</span>
                <input
                  type="radio"
                  name="albumSize"
                  checked={project.size === s.id}
                  onChange={() => onChangeSize(s.id as AlbumSize, s.orient)}
                  className="accent-[#C8A96B]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Guides & Snapping */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
            Guides & Canvas Display
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#2C2C34] bg-[#141417] cursor-pointer text-xs">
              <div>
                <div className="font-semibold text-white">Print Bleed & Safe Margin Lines</div>
                <div className="text-[11px] text-[#9E9E9E]">Shows 3mm cut margin & 6mm safe area</div>
              </div>
              <input
                type="checkbox"
                checked={project.settings.printBleed}
                onChange={onToggleBleedGuide}
                className="accent-[#C8A96B]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#2C2C34] bg-[#141417] cursor-pointer text-xs">
              <div>
                <div className="font-semibold text-white">Alignment Grid</div>
                <div className="text-[11px] text-[#9E9E9E]">Displays subtle background layout grid</div>
              </div>
              <input
                type="checkbox"
                checked={project.settings.showGrid}
                onChange={onToggleGrid}
                className="accent-[#C8A96B]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#2C2C34] bg-[#141417] cursor-pointer text-xs">
              <div>
                <div className="font-semibold text-white">Snap to Centers & Edges</div>
                <div className="text-[11px] text-[#9E9E9E]">Automatically magnetic snapping on drag</div>
              </div>
              <input
                type="checkbox"
                checked={project.settings.snapToElements}
                onChange={onToggleSnap}
                className="accent-[#C8A96B]"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
