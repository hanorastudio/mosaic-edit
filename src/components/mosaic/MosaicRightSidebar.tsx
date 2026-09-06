'use client';

import React from 'react';
import {
  MosaicSettings,
  MosaicMetrics,
  MosaicDensity,
  ColorMatchingMode,
} from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import {
  Sliders,
  Sparkles,
  Grid,
  Palette,
  CheckCircle2,
  Maximize2,
  Crown,
  Heart,
} from 'lucide-react';

interface MosaicRightSidebarProps {
  settings: MosaicSettings;
  metrics: MosaicMetrics;
  photos: PhotoMetadata[];
  onUpdateSettings: (newSettings: Partial<MosaicSettings>) => void;
  onRegenerateMosaic: () => void;
  isMobileSheet?: boolean;
}

const MosaicRightSidebarComponent: React.FC<MosaicRightSidebarProps> = ({
  settings,
  metrics,
  photos,
  onUpdateSettings,
  onRegenerateMosaic,
  isMobileSheet = false,
}) => {
  const densityEstimatedTiles =
    settings.density === 'ultra-max'
      ? 12800
      : settings.density === 'ultra-pro'
      ? 8200
      : settings.density === 'ultra'
      ? 4600
      : settings.density === 'high'
      ? 2600
      : settings.density === 'low'
      ? 650
      : 1350;

  const requiredTiles = metrics?.shapeActiveCells > 0 ? metrics.shapeActiveCells : densityEstimatedTiles;
  const isEnoughPhotos = photos.length >= requiredTiles;

  return (
    <div className={`${isMobileSheet ? 'w-full h-full' : 'hidden lg:flex w-80 h-full border-l border-[#2C2C34]'} bg-[#1A1A1E] flex flex-col text-white select-none shrink-0 z-20`}>
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] flex items-center justify-between bg-[#141417]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#C8A96B]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
            Mosaic Settings
          </span>
        </div>
        <button
          onClick={onRegenerateMosaic}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors shadow-sm"
        >
          <Sparkles className="w-3 h-3" />
          <span>Apply</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 text-xs pb-28 sm:pb-6">
        {/* Live Mathematical Accuracy Metrics */}
        <div className="p-4 rounded-2xl bg-[#141417] border border-[#C8A96B]/30 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[#C8A96B] text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Optimization Metrics</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-white/5 space-y-0.5">
              <div className="text-[10px] text-zinc-400">Shape Accuracy</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {metrics.shapeAccuracy}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-white/5 space-y-0.5">
              <div className="text-[10px] text-zinc-400">Photo Usage</div>
              <div className="text-sm font-bold font-mono text-[#C8A96B]">
                {metrics.photosUsedCount} / {metrics.totalPhotosAvailable}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-white/5 space-y-0.5">
              <div className="text-[10px] text-zinc-400">Color Match</div>
              <div className="text-sm font-bold font-mono text-[#E5C158]">
                {metrics.colorMatchScore}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-white/5 space-y-0.5">
              <div className="text-[10px] text-zinc-400">Face Preservation</div>
              <div className="text-sm font-bold font-mono text-white">
                {metrics.facePreservationScore}%
              </div>
            </div>
          </div>
        </div>

        {/* 1. Tile Grid Layout & Alignment */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
              Tile Grid Layout & Alignment
            </label>
            <span className="text-[10px] font-mono text-[#E5C158] font-bold">
              {settings.gridLayout === 'irregular-masonry'
                ? 'Mixed Sizes'
                : settings.gridLayout === 'chaos-random'
                ? 'Irregular Spread'
                : settings.gridLayout === 'brick-staggered'
                ? 'Brick Offset'
                : settings.gridLayout === 'variable-scale'
                ? 'Variable Scale'
                : 'Perfect Aligned'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'perfect-aligned',
                name: '📐 Perfectly Aligned',
                desc: 'Strict symmetrical grid (Pikachu / Ref Style)',
                badge: 'Reference Look',
              },
              {
                id: 'chaos-random',
                name: '🎲 Irregular Spread',
                desc: 'Randomized spread & maximum photo dispersion',
                badge: 'Anti-Repeating',
              },
              {
                id: 'irregular-masonry',
                name: '🧩 Irregular Masonry',
                desc: 'Mixed sizes (6x6, 6x3, 4x4, 4x2, 2x2, 2x1 & 1x1 tiles)',
                badge: 'Mixed Sizes',
              },
              {
                id: 'brick-staggered',
                name: '🧱 Brick Staggered',
                desc: '50% horizontal alternating row offset',
                badge: 'Subway Pattern',
              },
              {
                id: 'variable-scale',
                name: '🎯 Variable Scale',
                desc: 'Micro center tiles, larger outer tiles',
                badge: 'Focal Hierarchy',
              },
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => {
                  onUpdateSettings({ gridLayout: layout.id as any });
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  (settings.gridLayout || 'perfect-aligned') === layout.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-md shadow-[#C8A96B]/15 ring-1 ring-[#C8A96B]/50'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{layout.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{layout.desc}</div>
                </div>
                {layout.badge && (
                  <span className="text-[9px] text-[#E5C158] font-semibold mt-1.5 font-mono">
                    {layout.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Photo Density */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Photo Density / Tile Count
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'low', name: 'Low (36x36)', desc: '~1,000 tiles' },
              { id: 'medium', name: 'Medium (52x52)', desc: '~2,500 tiles' },
              { id: 'high', name: 'High (72x72)', desc: '~4,500 tiles' },
              { id: 'ultra', name: 'Ultra (96x96)', desc: '~8,000 tiles' },
              { id: 'ultra-pro', name: '⚡ Ultra Pro (128x128)', desc: '~16,000 tiles' },
              { id: 'ultra-max', name: '🚀 Ultra Max (160x160)', desc: '~25,000 tiles' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  onUpdateSettings({ density: d.id as MosaicDensity });
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                  settings.density === d.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-[#C8A96B]/40'
                }`}
              >
                <span className="text-xs">{d.name}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Color Matching Mode */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Color Matching Mode
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'color-match', name: 'Color Match (Delta-E)', desc: 'Matches photos to target colors' },
              { id: 'shape-only', name: 'Shape Silhouette Only', desc: 'Focuses purely on outline shape' },
              { id: 'full-tonal', name: 'Full Tonal / Contrast', desc: 'Preserves highlights and shadows' },
              { id: 'artistic', name: 'Artistic Organic Flow', desc: 'Creative color harmonization' },
            ].map((mode) => (
              <label
                key={mode.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  settings.colorMatchingMode === mode.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/10 text-white'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="colorMode"
                  checked={settings.colorMatchingMode === mode.id}
                  onChange={() => onUpdateSettings({ colorMatchingMode: mode.id as ColorMatchingMode })}
                  className="mt-0.5 accent-[#C8A96B]"
                />
                <div>
                  <div className="text-xs font-semibold text-white">{mode.name}</div>
                  <div className="text-[10px] text-zinc-500">{mode.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tile Spacing & Corner Radius */}
        <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Tile Gap / Spacing</span>
              <span className="font-mono text-white">{settings.tileGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={settings.tileGap}
              onChange={(e) => onUpdateSettings({ tileGap: parseInt(e.target.value) })}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Tile Corner Radius</span>
              <span className="font-mono text-white">{settings.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={settings.borderRadius}
              onChange={(e) => onUpdateSettings({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-[#C8A96B]"
            />
          </div>
        </div>

        {/* Outer Background Mosaic Photos Opacity & Focus */}
        <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#C8A96B]/30 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#FAF8F5] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Outer Photos Opacity</span>
            </span>
            <span className="font-mono text-[#E5C158] px-2 py-0.5 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30">
              {Math.round((settings.outerTileOpacity ?? 1.0) * 100)}%
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-snug">
            Controls the visibility of background photo tiles around the subject / character.
          </p>

          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={settings.outerTileOpacity ?? 1.0}
            onChange={(e) => onUpdateSettings({ outerTileOpacity: parseFloat(e.target.value) })}
            className="w-full accent-[#C8A96B] cursor-pointer"
          />

          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: '0%', sub: 'Ghost', val: 0.0 },
              { label: '35%', sub: 'Subtle', val: 0.35 },
              { label: '70%', sub: 'Soft', val: 0.70 },
              { label: '100%', sub: 'Solid', val: 1.0 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => onUpdateSettings({ outerTileOpacity: p.val })}
                className={`p-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                  Math.abs((settings.outerTileOpacity ?? 1.0) - p.val) < 0.05
                    ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold'
                    : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold">{p.label}</span>
                <span className="text-[8px] text-[#C8A96B] font-mono">{p.sub}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2C2C34]/80 space-y-1.5">
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Outer Photos Style Effect
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: '🎨 Color', desc: 'True photos' },
                { id: 'monochrome', label: '🖤 B&W', desc: 'Subject Pop' },
                { id: 'vignette-dim', label: '🌙 Dimmed', desc: 'Spotlight' },
                { id: 'soft-blur', label: '✨ Bokeh', desc: 'Soft Focus' },
              ].map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => onUpdateSettings({ outerTileFilter: flt.id as any })}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    (settings.outerTileFilter || 'none') === flt.id
                      ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/50'
                      : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-semibold">{flt.label}</span>
                  <span className="text-[9px] text-zinc-400 font-mono mt-0.5">{flt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Canvas Dimensions Presets */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Canvas Aspect Ratio & Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '1:1', name: '1:1 Square (Instagram / 24x24")', ratio: 1 },
              { id: '4:5', name: '4:5 Portrait (Poster)', ratio: 4 / 5 },
              { id: '9:16', name: '9:16 Story / Wallpaper', ratio: 9 / 16 },
              { id: '16:9', name: '16:9 Landscape Screen', ratio: 16 / 9 },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onUpdateSettings({
                    canvasPreset: p.id as any,
                    aspectRatio: p.ratio,
                  })
                }
                className={`p-2.5 rounded-xl border text-center text-xs transition-colors ${
                  settings.canvasPreset === p.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Cinematic Aesthetic Color Grading */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Cinematic Color Grading
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', name: 'Original Color', desc: 'True natural photos' },
              { id: 'royal-gold', name: '👑 Royal Gold', desc: 'Champagne warm tint' },
              { id: 'kodachrome', name: '🎞️ 35mm Vintage', desc: 'Rich analog tones' },
              { id: 'noir-silver', name: '🌑 Noir Silver', desc: 'Moody B&W contrast' },
              { id: 'golden-hour', name: '🌅 Golden Hour', desc: 'Amber-sunset radiance' },
              { id: 'rose-quartz', name: '🌸 Rose Quartz', desc: 'Delicate romantic bloom' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onUpdateSettings({ aestheticFilter: f.id as any })}
                className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                  (settings.aestheticFilter || 'none') === f.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold shadow-sm'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-white/20'
                }`}
              >
                <span className="text-xs">{f.name}</span>
                <span className="text-[9px] text-zinc-500 mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>

          {(settings.aestheticFilter && settings.aestheticFilter !== 'none') && (
            <div className="p-3 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Filter Intensity</span>
                <span className="font-mono text-[#C8A96B]">
                  {Math.round((settings.filterIntensity ?? 0.35) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={settings.filterIntensity ?? 0.35}
                onChange={(e) => onUpdateSettings({ filterIntensity: parseFloat(e.target.value) })}
                className="w-full accent-[#C8A96B] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 7. Canvas Surface Finishes (Luxury Realism) */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Canvas Surface Finish
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', name: 'Digital Clean', desc: 'Standard vibrant display' },
              { id: 'acrylic-gloss', name: '💎 Acrylic Glass', desc: 'Reflection glare sweep' },
              { id: 'fine-art-canvas', name: '🎨 Fine Canvas', desc: 'Cotton woven texture' },
              { id: 'brushed-metal', name: '🪙 Brushed Gold', desc: 'Metallic sheen' },
            ].map((sf) => (
              <button
                key={sf.id}
                onClick={() => onUpdateSettings({ surfaceFinish: sf.id as any })}
                className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                  (settings.surfaceFinish || 'none') === sf.id
                    ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold shadow-sm'
                    : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-white/20'
                }`}
              >
                <span className="text-xs">{sf.name}</span>
                <span className="text-[9px] text-zinc-500 mt-0.5">{sf.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 7. Low Photo Count Fill Strategy */}
        <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-2">
          <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
            Photo Fill Strategy
          </label>
          {isEnoughPhotos ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Unique Photos Matched</span>
              </div>
              <p className="text-[10px] text-emerald-200/80 leading-relaxed">
                You have {photos.length} uploaded photos for {requiredTiles} tiles. Every tile uses a distinct unique photo with zero repetition.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-zinc-400">
                {photos.length} uploaded photos for ~{requiredTiles} tiles. Choose how remaining tiles are filled:
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => onUpdateSettings({ photoFillStrategy: 'repeat-uploaded' })}
                  className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                    settings.photoFillStrategy !== 'mix-sample-photos'
                      ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                      : 'border-[#2C2C34] bg-[#1A1A1E] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span>🔁 Repeat My Uploaded Photos</span>
                  {settings.photoFillStrategy !== 'mix-sample-photos' && (
                    <span className="text-[10px] text-[#E5C158] font-bold">Active</span>
                  )}
                </button>
                <button
                  onClick={() => onUpdateSettings({ photoFillStrategy: 'mix-sample-photos' })}
                  className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                    settings.photoFillStrategy === 'mix-sample-photos'
                      ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                      : 'border-[#2C2C34] bg-[#1A1A1E] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span>✨ Mix In Sample Photos</span>
                  {settings.photoFillStrategy === 'mix-sample-photos' && (
                    <span className="text-[10px] text-[#E5C158] font-bold">Active</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const MosaicRightSidebar = React.memo(MosaicRightSidebarComponent);
