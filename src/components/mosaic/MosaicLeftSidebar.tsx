'use client';

import React, { useState } from 'react';
import {
  MosaicTargetConfig,
  BuiltInShapeId,
  MosaicSettings,
} from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { BUILT_IN_SHAPES } from '@/lib/mosaic/shapeMasks';
import {
  Image as ImageIcon,
  Shapes,
  Type,
  Hash,
  Upload,
  Palette,
  FolderPlus,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
  AlignJustify,
  Trash2,
  Smile,
  Plus,
} from 'lucide-react';
import { EMOJI_THEME_PRESETS, parseEmojisFromString } from '@/lib/mosaic/emojiTiles';
import {
  STYLISH_FONTS,
  GLASS_EFFECT_PRESETS,
  GLASS_SHAPES,
  TEXT_CLARITY_PRESETS,
} from '@/lib/mosaic/textStyles';

export const EYE_CATCHING_STYLES = [
  {
    id: 'master-studio-vivid',
    title: '⭐ Studio Master Fusion',
    desc: 'Crisp micro photo tiles inside subject + Radiant face & 100% natural vibrant background (Reference 1 & 5)',
    badge: '👑 Master Look',
    settings: {
      colorTintBlend: 0.35,
      customImageBlendMode: 'studio-hdr' as const,
      contrastBoost: 1.28,
      vibrancyBoost: 1.25,
      brightnessBoost: 1.02,
      outerTileOpacity: 1.0,
      outerTileFilter: 'none' as const,
      eyeCatchingPreset: 'master-studio-vivid' as const,
    },
  },
  {
    id: 'pure-photo',
    title: '💎 Pure True-Photo Mosaic',
    desc: '100% pure photographic mosaic tiles with cell luminance grading & zero foggy overlay (Reference 4)',
    badge: 'Pure Mosaic',
    settings: {
      colorTintBlend: 0.30,
      customImageBlendMode: 'pure-mosaic' as const,
      contrastBoost: 1.30,
      vibrancyBoost: 1.22,
      brightnessBoost: 1.00,
      outerTileOpacity: 1.0,
      outerTileFilter: 'none' as const,
      eyeCatchingPreset: 'pure-photo' as const,
    },
  },
  {
    id: 'romantic-glow',
    title: '💖 Romantic Couple Glow',
    desc: 'Deep shadow tones in hair/suits + warm glowing highlights & rich skin tones (Reference 2 & 3)',
    badge: 'Couples',
    settings: {
      colorTintBlend: 0.40,
      customImageBlendMode: 'studio-hdr' as const,
      contrastBoost: 1.32,
      vibrancyBoost: 1.28,
      brightnessBoost: 1.02,
      outerTileOpacity: 1.0,
      outerTileFilter: 'none' as const,
      eyeCatchingPreset: 'romantic-glow' as const,
    },
  },
  {
    id: 'vivid-sunshine',
    title: '🏖️ Vivid Sunshine / Family',
    desc: 'High-chroma radiant colors for joyful expressions, weddings & celebrations (Reference 3 & 5)',
    badge: 'Vibrant',
    settings: {
      colorTintBlend: 0.38,
      customImageBlendMode: 'studio-hdr' as const,
      contrastBoost: 1.24,
      vibrancyBoost: 1.35,
      brightnessBoost: 1.04,
      outerTileOpacity: 1.0,
      outerTileFilter: 'none' as const,
      eyeCatchingPreset: 'vivid-sunshine' as const,
    },
  },
  {
    id: 'monochrome-pop',
    title: '🖤 Spotlight Monochrome BG',
    desc: 'B&W outer background photo tiles + Glowing full-color subject focus',
    badge: 'Spotlight',
    settings: {
      colorTintBlend: 0.38,
      customImageBlendMode: 'studio-hdr' as const,
      contrastBoost: 1.28,
      vibrancyBoost: 1.25,
      brightnessBoost: 1.02,
      outerTileOpacity: 0.85,
      outerTileFilter: 'monochrome' as const,
      eyeCatchingPreset: 'monochrome-pop' as const,
    },
  },
  {
    id: 'classic',
    title: '☁️ Cinematic Soft-Light',
    desc: 'Smooth translucent photographic blend with subtle artistic tone',
    badge: 'Subtle',
    settings: {
      colorTintBlend: 0.32,
      customImageBlendMode: 'soft-light' as const,
      contrastBoost: 1.15,
      vibrancyBoost: 1.12,
      brightnessBoost: 1.00,
      outerTileOpacity: 1.0,
      outerTileFilter: 'none' as const,
      eyeCatchingPreset: 'classic' as const,
    },
  },
];

interface MosaicLeftSidebarProps {
  photos: PhotoMetadata[];
  target: MosaicTargetConfig;
  settings: MosaicSettings;
  tilesCount?: number;
  onUpdateTarget: (newTarget: Partial<MosaicTargetConfig>) => void;
  onUpdateSettings: (newSettings: Partial<MosaicSettings>) => void;
  onUploadPhotos: (files: File[], replaceExisting?: boolean) => void;
  onLoadSamplePhotos: () => void;
  onToggleFavorite: (photoId: string) => void;
  onClearAllPhotos?: () => void;
  onDeletePhoto?: (photoId: string) => void;
  onApplyEmojis?: (emojis: string[]) => void;
  isMobileSheet?: boolean;
  mobileActiveTab?: string;
  onCloseMobileSheet?: () => void;
  onSelectMobileTab?: (tabId: string) => void;
}

export const MosaicLeftSidebar: React.FC<MosaicLeftSidebarProps> = ({
  photos,
  target,
  settings,
  tilesCount,
  onUpdateTarget,
  onUpdateSettings,
  onUploadPhotos,
  onLoadSamplePhotos,
  onToggleFavorite,
  onClearAllPhotos,
  onDeletePhoto,
  onApplyEmojis,
  isMobileSheet = false,
  mobileActiveTab,
  onCloseMobileSheet,
  onSelectMobileTab,
}) => {
  const getInitialTab = () => {
    if (mobileActiveTab) return mobileActiveTab as any;
    if (target?.type === 'name' || target?.type === 'letter' || target?.type === 'word') return 'letters';
    if (target?.type === 'number') return 'numbers';
    if (target?.type === 'custom-image' || target?.type === 'custom-silhouette') return 'custom';
    return 'shapes';
  };

  const [activeTab, setActiveTab] = useState<
    'photos' | 'emojis' | 'shapes' | 'letters' | 'numbers' | 'custom' | 'backgrounds' | 'text'
  >(getInitialTab());
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customEmojiInput, setCustomEmojiInput] = useState<string>('');
  const [activeEmojis, setActiveEmojis] = useState<string[]>(
    settings.selectedEmojis && settings.selectedEmojis.length > 0
      ? settings.selectedEmojis
      : ['❤️', '💖', '💕', '💓', '💗', '🌹', '✨', '👑', '💎', '🌸', '💍']
  );

  // Synchronize activeTab if target.type changes or is updated from parent / URL
  React.useEffect(() => {
    if (mobileActiveTab) {
      setActiveTab(mobileActiveTab as any);
      return;
    }
    if (target?.type === 'name' || target?.type === 'letter' || target?.type === 'word') {
      setActiveTab('letters');
    } else if (target?.type === 'number') {
      setActiveTab('numbers');
    } else if (target?.type === 'custom-image' || target?.type === 'custom-silhouette') {
      setActiveTab('custom');
    } else if (target?.type === 'shape') {
      setActiveTab('shapes');
    }
  }, [target?.type, mobileActiveTab]);

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

  const requiredTiles = tilesCount && tilesCount > 0 ? tilesCount : densityEstimatedTiles;
  const isEnoughPhotos = photos.length >= requiredTiles;

  const currentTab = isMobileSheet && mobileActiveTab ? mobileActiveTab : activeTab;

  const tabs = [
    { id: 'photos', label: 'Photos', icon: ImageIcon, count: photos.length },
    { id: 'emojis', label: 'Emojis', icon: Smile, count: activeEmojis.length },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'letters', label: 'Names & Words', icon: Type },
    { id: 'numbers', label: 'Numbers', icon: Hash },
    { id: 'custom', label: 'Custom Target', icon: Upload },
    { id: 'backgrounds', label: 'Background', icon: Palette },
    { id: 'text', label: 'Text Overlay', icon: AlignJustify },
  ];

  const filteredPhotos = photos.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleTabClick = (tabId: string) => {
    if (!isMobileSheet && activeTab === tabId && !isCollapsed) {
      setIsCollapsed(true);
      return;
    }

    setActiveTab(tabId as any);
    setIsCollapsed(false);
    onSelectMobileTab?.(tabId);

    // Auto-switch target type & regenerate canvas when switching categories
    if (tabId === 'letters') {
      const isLowOrMedium = settings.density === 'low' || settings.density === 'medium';
      onUpdateSettings({
        ...(isLowOrMedium ? { density: 'ultra' } : {}),
        canvasPreset: settings.canvasPreset || '1:1',
        aspectRatio: settings.aspectRatio || 1,
      });
      if (target.type !== 'name' && target.type !== 'letter' && target.type !== 'word') {
        const text = target.targetText && target.targetText !== 'BUNTY & BABLI' ? target.targetText : 'BUNTY BABLI';
        onUpdateTarget({
          type: text.length === 1 ? 'letter' : 'name',
          targetText: text,
          fontFamily: target.fontFamily || 'Montserrat, sans-serif',
          textOrientation: target.textOrientation || 'horizontal',
          centerDividerEmoji: target.centerDividerEmoji || 'none',
          centerEmojiScale: target.centerEmojiScale !== undefined ? target.centerEmojiScale : 0.70,
        });
      }
    } else if (tabId === 'numbers') {
      if (settings.density === 'low' || settings.density === 'medium') {
        onUpdateSettings({ density: 'ultra' });
      }
      if (target.type !== 'number') {
        onUpdateTarget({
          type: 'number',
          targetText: target.targetText && !isNaN(Number(target.targetText)) ? target.targetText : '25',
        });
      }
    } else if (tabId === 'shapes') {
      if (target.type !== 'shape') {
        onUpdateTarget({
          type: 'shape',
          shapeId: target.shapeId || 'heart',
        });
      }
    } else if (tabId === 'custom') {
      if (target.type !== 'custom-image' && target.type !== 'custom-silhouette') {
        if (target.customImageUrl) {
          onUpdateTarget({ type: 'custom-image' });
        }
      }
    }
  };

  const renderCenterDividerEmojiSection = () => {
    const isCustomPositioned =
      (target.centerEmojiX !== undefined && target.centerEmojiX !== 50) ||
      (target.centerEmojiY !== undefined && target.centerEmojiY !== 50);

    return (
      <div className="space-y-3 p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#C8A96B] font-bold">Center Divider Emoji</span>
          <span className="text-[11px] font-mono text-zinc-300">
            {target.centerDividerEmoji && target.centerDividerEmoji !== 'none' ? (
              <span className="flex items-center gap-1">
                <span className="text-zinc-400">Active:</span>
                <span className="text-[#E5C158] font-bold">{target.centerDividerEmoji}</span>
              </span>
            ) : (
              <span className="text-zinc-500">None</span>
            )}
          </span>
        </div>

        {/* 8-Card Emoji Grid (4x2) Matching User's Design */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: '❤️', emoji: '❤️', label: 'Heart' },
            { id: '💍', emoji: '💍', label: 'Rings' },
            { id: '👑', emoji: '👑', label: 'Crown' },
            { id: '✨', emoji: '✨', label: 'Sparkle' },
            { id: '🌸', emoji: '🌸', label: 'Floral' },
            { id: '🎂', emoji: '🎂', label: 'Cake' },
            { id: '🕊️', emoji: '🕊️', label: 'Dove' },
            { id: 'none', emoji: '🚫', label: 'None' },
          ].map((item) => {
            const isSelected = (target.centerDividerEmoji || 'none') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onUpdateTarget({
                    centerDividerEmoji: item.id,
                  })
                }
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-md shadow-[#C8A96B]/15 ring-1 ring-[#C8A96B]/40'
                    : 'border-[#2C2C34] bg-[#1A1A1E] hover:border-zinc-600 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-lg leading-none select-none">{item.emoji}</span>
                <span className="text-[11px] font-semibold tracking-tight select-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Emoji Size Slider & Drag Controls */}
        {target.centerDividerEmoji && target.centerDividerEmoji !== 'none' && (
          <div className="pt-2.5 border-t border-[#2C2C34] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-semibold">Emoji Icon Size</span>
              <span className="font-mono text-[#E5C158] font-bold text-xs">
                {Math.round((target.centerEmojiScale || 0.70) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.35"
              max="1.30"
              step="0.05"
              value={target.centerEmojiScale || 0.70}
              onChange={(e) =>
                onUpdateTarget({ centerEmojiScale: parseFloat(e.target.value) })
              }
              className="w-full accent-[#C8A96B] cursor-pointer h-1.5 bg-[#2C2C34] rounded-lg"
            />

            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>Mini (35%)</span>
              <span>Balanced (70%)</span>
              <span>Large (130%)</span>
            </div>

            {/* Drag & Move Position HUD */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400 bg-[#101012] p-2 rounded-xl border border-white/5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span>🖐️</span>
                <span>Drag emoji on canvas to move</span>
              </span>
              {isCustomPositioned ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateTarget({
                      centerEmojiX: 50,
                      centerEmojiY: 50,
                    })
                  }
                  className="px-2 py-0.5 rounded bg-[#2C2C34] hover:bg-[#383842] text-[#E5C158] font-semibold text-[10px] transition-colors"
                  title="Reset to center (50%, 50%)"
                >
                  Reset Center
                </button>
              ) : (
                <span className="text-emerald-400 font-mono text-[9px]">● Centered</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCustomPictureControls = () => {
    const isCustomImage = target.type === 'custom-image' && !!target.customImageUrl;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
            Custom Picture Target
          </h3>
          <p className="text-xs text-[#9E9E9E] mt-1">
            Upload portraits, couples, or family photos for eye-catching studio mosaics.
          </p>
        </div>

        {isCustomImage ? (
          <div className="space-y-3.5">
            {/* Uploaded Image Preview & Actions */}
            <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-[#C8A96B] shadow-xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={target.customImageUrl}
                alt="Custom Target Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] text-[#E5C158] font-bold border border-[#C8A96B]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Active Target</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <label className="px-2.5 py-1.5 rounded-xl bg-black/85 hover:bg-black text-[#E5C158] text-[11px] font-bold backdrop-blur cursor-pointer transition-colors shadow-lg border border-[#C8A96B]/40 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        onUpdateTarget({
                          type: 'custom-image',
                          customImageUrl: url,
                          customImageMode: 'full-color',
                        });
                        onUpdateSettings({
                          colorTintBlend: 0.48,
                          customImageBlendMode: 'studio-hdr',
                          contrastBoost: 1.25,
                          vibrancyBoost: 1.18,
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateTarget({
                      type: 'custom-image',
                      customImageUrl: '',
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-950/85 hover:bg-red-900 text-red-300 hover:text-white text-[11px] font-bold backdrop-blur cursor-pointer transition-colors shadow-lg border border-red-500/40 flex items-center gap-1.5"
                  title="Remove Custom Picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Pic</span>
                </button>
              </div>
            </div>

            {/* 1. Eye-Catching Pro Style Presets (Inspired by Reference Photos) */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#C8A96B]/40 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E5C158] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Eye-Catching Pro Styles</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">1-Click Presets</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Instantly match top studio portrait, romantic wedding, and high-vibrancy reference looks.
              </p>

              <div className="grid grid-cols-1 gap-1.5">
                {EYE_CATCHING_STYLES.map((style) => {
                  const isActive = (settings.eyeCatchingPreset || 'master-studio-vivid') === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        onUpdateSettings(style.settings);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col ${
                        isActive
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E5C158]">{style.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isActive ? 'bg-[#C8A96B] text-black font-bold' : 'bg-white/10 text-zinc-400'
                          }`}
                        >
                          {style.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-300 mt-1 leading-snug">{style.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Picture Overlay Clarity / Tint */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#FAF8F5] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Picture Overlay Clarity / Tint</span>
                </span>
                <span className="font-mono text-[#E5C158] px-2 py-0.5 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30">
                  {Math.round(settings.colorTintBlend * 100)}%
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                Balances facial sharpness with underlying photo tile visibility.
              </p>

              <input
                type="range"
                min="0.10"
                max="0.85"
                step="0.02"
                value={settings.colorTintBlend}
                onChange={(e) =>
                  onUpdateSettings({ colorTintBlend: parseFloat(e.target.value) })
                }
                className="w-full accent-[#C8A96B] cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[
                  { label: '20%', val: 0.20, desc: 'High Tiles' },
                  { label: '35%', val: 0.35, desc: '⭐ Master 35%' },
                  { label: '50%', val: 0.50, desc: 'Balanced' },
                  { label: '65%', val: 0.65, desc: 'Face Pop' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onUpdateSettings({ colorTintBlend: preset.val })}
                    className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      Math.abs(settings.colorTintBlend - preset.val) < 0.04
                        ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{preset.label}</span>
                    <span className="text-[8px] text-[#C8A96B] font-mono leading-none mt-0.5">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tonal Contrast & Depth Boost */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#FAF8F5] flex items-center gap-1.5">
                  <span>🌓 Facial Contrast & Shadow Depth</span>
                </span>
                <span className="font-mono text-[#E5C158] px-2 py-0.5 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30">
                  {Math.round(((settings.contrastBoost ?? 1.25) - 1.0) * 100 + 100)}%
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                Deepens shadows in hair/eyes while keeping highlights bright for punchy 3D depth.
              </p>

              <input
                type="range"
                min="1.00"
                max="1.50"
                step="0.05"
                value={settings.contrastBoost ?? 1.25}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ contrastBoost: val });
                }}
                className="w-full accent-[#C8A96B] cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { label: 'Natural', val: 1.05 },
                  { label: '⭐ Studio Pop', val: 1.25 },
                  { label: 'Deep Dramatic', val: 1.45 },
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => {
                      onUpdateSettings({ contrastBoost: c.val });
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      Math.abs((settings.contrastBoost ?? 1.25) - c.val) < 0.04
                        ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] block truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Color Radiance & Vibrancy Boost */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#FAF8F5] flex items-center gap-1.5">
                  <span>✨ Color Radiance & Skin Warmth</span>
                </span>
                <span className="font-mono text-[#E5C158] px-2 py-0.5 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30">
                  {Math.round(((settings.vibrancyBoost ?? 1.18) - 1.0) * 100 + 100)}%
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                Enriches skin tones, lip color, and background vibrancy for eye-grabbing radiance.
              </p>

              <input
                type="range"
                min="1.00"
                max="1.60"
                step="0.05"
                value={settings.vibrancyBoost ?? 1.18}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ vibrancyBoost: val });
                }}
                className="w-full accent-[#C8A96B] cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { label: 'Natural', val: 1.00 },
                  { label: '⭐ Studio Glow', val: 1.20 },
                  { label: 'Vivid Radiant', val: 1.45 },
                ].map((v) => (
                  <button
                    key={v.label}
                    onClick={() => {
                      onUpdateSettings({ vibrancyBoost: v.val });
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      Math.abs((settings.vibrancyBoost ?? 1.18) - v.val) < 0.04
                        ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] block truncate">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Picture Blend Mode */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2 shadow-sm">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                Picture Blend Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'studio-hdr', name: '✨ Studio HDR', desc: 'Adaptive Glow + Tiles' },
                  { id: 'pure-mosaic', name: '💎 Pure Mosaic', desc: '100% Photo Grid - No Fog' },
                  { id: 'soft-light', name: '☁️ Soft Light', desc: 'Cinematic Soft' },
                  { id: 'overlay', name: '🔥 Overlay', desc: 'Vibrant Colors' },
                  { id: 'multiply', name: '🌑 Multiply', desc: 'Deep Shadows' },
                  { id: 'normal', name: '🖼️ Normal', desc: 'Direct Translucent' },
                  { id: 'luminosity', name: '💡 Luminosity', desc: 'Brightness Only' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onUpdateSettings({ customImageBlendMode: mode.id as any });
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      (settings.customImageBlendMode || 'studio-hdr') === mode.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/50'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold">{mode.name}</span>
                    <span className="text-[9px] text-zinc-400 font-mono mt-0.5">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Outer Background Photo Tiles Opacity & Style */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#C8A96B]/30 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#FAF8F5] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E5C158]" />
                  <span>Outer Background Photos Opacity</span>
                </span>
                <span className="font-mono text-[#E5C158] px-2 py-0.5 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30">
                  {Math.round((settings.outerTileOpacity ?? 1.0) * 100)}%
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                Control the transparency of background photo tiles around your subject to adjust focus.
              </p>

              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.outerTileOpacity ?? 1.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ outerTileOpacity: val });
                }}
                className="w-full accent-[#C8A96B] cursor-pointer"
              />

              {/* Quick Opacity Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[
                  { label: '0%', sub: 'Ghost BG', val: 0.0 },
                  { label: '35%', sub: 'Subtle', val: 0.35 },
                  { label: '70%', sub: 'Soft Focus', val: 0.70 },
                  { label: '100%', sub: 'Solid', val: 1.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onUpdateSettings({ outerTileOpacity: preset.val });
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      Math.abs((settings.outerTileOpacity ?? 1.0) - preset.val) < 0.05
                        ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{preset.label}</span>
                    <span className="text-[9px] text-[#C8A96B] font-mono">{preset.sub}</span>
                  </button>
                ))}
              </div>

              {/* Outer Photo Filter / Style */}
              <div className="pt-2 border-t border-[#2C2C34]/80 space-y-1.5">
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Outer Photos Style Effect
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'none', label: '🎨 Natural Color', desc: 'True photos' },
                    { id: 'monochrome', label: '🖤 B&W Grayscale', desc: 'Subject Color Pop' },
                    { id: 'vignette-dim', label: '🌙 Dimmed Vignette', desc: 'Dark & Moody' },
                    { id: 'soft-blur', label: '✨ Soft Blur', desc: 'Bokeh Effect' },
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      onClick={() => {
                        onUpdateSettings({ outerTileFilter: flt.id as any });
                      }}
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

            {/* 7. Tile Grid Density (Facial Resolution / Reference Clarity) */}
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2 shadow-sm">
              <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider flex items-center justify-between">
                <span>Grid Density (Facial Resolution)</span>
                <span className="text-[10px] text-[#E5C158] font-mono">{settings.gridCols || 40} cols</span>
              </label>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Higher density renders sharper, more realistic facial features (as seen in studio reference photos).
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { cols: 32, label: 'Balanced (32)', desc: '~1,000 Tiles' },
                  { cols: 48, label: '⭐ Studio (48)', desc: '~2,300 Tiles' },
                  { cols: 60, label: 'Ultra HD (60)', desc: '~3,600 Tiles' },
                ].map((g) => (
                  <button
                    key={g.cols}
                    onClick={() => {
                      const aspect = settings.aspectRatio || 1;
                      onUpdateSettings({
                        gridCols: g.cols,
                        gridRows: Math.round(g.cols / aspect),
                      });
                    }}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      (settings.gridCols || 40) === g.cols
                        ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                        : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{g.label}</span>
                    <span className="text-[9px] text-[#C8A96B] font-mono">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#C8A96B]/50 hover:border-[#C8A96B] bg-[#141417] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer relative transition-colors group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onUpdateTarget({
                    type: 'custom-image',
                    customImageUrl: url,
                    customImageMode: 'full-color',
                  });
                  onUpdateSettings({
                    colorTintBlend: 0.48,
                    customImageBlendMode: 'studio-hdr',
                    contrastBoost: 1.25,
                    vibrancyBoost: 1.18,
                  });
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#C8A96B]/15 flex items-center justify-center text-[#C8A96B] group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Upload Picture / Portrait</span>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Couples, portraits, art, photos</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTextOverlayControls = () => {
    const overlay = settings.overlayText || {
      text: '',
      subtext: '',
      position: 'none',
      fontFamily: 'Cinzel, serif',
      color: '#C8A96B',
      fontSize: 24,
      glassEffect: 'none',
      glassOpacity: 0.70,
      glassShape: 'pill',
    };

    const isEnabled = overlay.position !== 'none' || (overlay.text && overlay.text.trim().length > 0);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
            Artwork Words & Glass Plaque
          </h3>
          <p className="text-xs text-[#9E9E9E] mt-1">
            Add custom names, dates, or titles with luxury glassmorphism plaques.
          </p>
        </div>

        {/* Text Input Fields */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34]">
          <div>
            <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider mb-1">
              Title Words
            </label>
            <input
              type="text"
              value={overlay.text || ''}
              onChange={(e) =>
                onUpdateSettings({
                  overlayText: {
                    ...overlay,
                    text: e.target.value,
                    position: overlay.position === 'none' ? 'below' : overlay.position,
                  },
                })
              }
              placeholder="e.g. BUNTY BABLI"
              className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Subtitle / Date Words
            </label>
            <input
              type="text"
              value={overlay.subtext || ''}
              onChange={(e) =>
                onUpdateSettings({
                  overlayText: {
                    ...overlay,
                    subtext: e.target.value,
                    position: overlay.position === 'none' ? 'below' : overlay.position,
                  },
                })
              }
              placeholder="e.g. A Lifetime of Beautiful Memories • 2026"
              className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-zinc-300"
            />
          </div>

          {/* Quick Position Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Quick Position
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'above', label: 'Top' },
                { id: 'inside', label: 'Center' },
                { id: 'below', label: 'Bottom' },
                { id: 'none', label: 'Hide' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => {
                    let y = overlay.y ?? 90;
                    if (pos.id === 'above') y = 8;
                    else if (pos.id === 'inside') y = 50;
                    else if (pos.id === 'below') y = 90;

                    onUpdateSettings({
                      overlayText: {
                        ...overlay,
                        position: pos.id as any,
                        x: 50,
                        y,
                      },
                    });
                  }}
                  className={`py-1.5 px-1 rounded-xl border text-center text-xs font-semibold transition-all ${
                    overlay.position === pos.id
                      ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold'
                      : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Size */}
          <div className="pt-2 border-t border-[#2C2C34] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Text Color
              </label>
              <div className="flex gap-1.5 items-center">
                {['#C8A96B', '#FFFFFF', '#E5C158', '#FF758C', '#00F2FE', '#0C0C0E'].map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      onUpdateSettings({
                        overlayText: {
                          ...overlay,
                          color: c,
                        },
                      })
                    }
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      overlay.color === c ? 'scale-125 border-white shadow' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-semibold text-zinc-400">
                <span>Text Size</span>
                <span className="font-mono text-[#C8A96B]">{overlay.fontSize || 24}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="56"
                step="1"
                value={overlay.fontSize || 24}
                onChange={(e) =>
                  onUpdateSettings({
                    overlayText: {
                      ...overlay,
                      fontSize: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#C8A96B] cursor-pointer"
              />
            </div>

            {/* Text Clarity & Pop Controls */}
            <div className="pt-2 border-t border-[#2C2C34] space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-semibold text-[#C8A96B] uppercase tracking-wider">
                  🌟 Text Contrast & Pop
                </span>
                <span className="text-zinc-400 font-mono text-[9px]">100% Legibility</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TEXT_CLARITY_PRESETS.map((preset) => {
                  const isSelected = (overlay.textClarity || 'ultra-pop') === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateSettings({
                          overlayText: {
                            ...overlay,
                            textClarity: preset.id,
                          },
                        })
                      }
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold ring-1 ring-[#C8A96B]/60'
                          : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span className="text-xs font-semibold text-white">{preset.name}</span>
                        <span className="text-[10px]">{preset.icon}</span>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-snug line-clamp-1">
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 13 Stylish Fonts Selector */}
        <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
              ✨ Stylish Font Style
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">13 Pro Fonts</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {STYLISH_FONTS.map((font) => {
              const isSelected = (overlay.fontFamily || 'Cinzel, serif') === font.cssFamily;
              return (
                <button
                  key={font.id}
                  onClick={() =>
                    onUpdateSettings({
                      overlayText: {
                        ...overlay,
                        fontFamily: font.cssFamily,
                      },
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/50'
                      : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-200">{font.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400 font-mono">
                        {font.category}
                      </span>
                    </div>
                    <span
                      className="text-sm mt-0.5 truncate text-[#FAF8F5]"
                      style={{ fontFamily: font.cssFamily }}
                    >
                      {overlay.text || font.sample}
                    </span>
                  </div>
                  {isSelected && (
                    <Sparkles className="w-4 h-4 text-[#E5C158] shrink-0 fill-[#E5C158]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Glassmorphism Plaque Effect */}
        <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
              🧊 Glassmorphism Effect
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">Plaque Card</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {GLASS_EFFECT_PRESETS.map((preset) => {
              const isSelected = (overlay.glassEffect || 'none') === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    onUpdateSettings({
                      overlayText: {
                        ...overlay,
                        glassEffect: preset.id,
                      },
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold ring-1 ring-[#C8A96B]/60'
                      : 'border-[#2C2C34] bg-[#121214] text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold text-white">{preset.name}</span>
                    <span className="text-[10px]">{preset.badge}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Glass Plaque Shape & Opacity */}
          {overlay.glassEffect && overlay.glassEffect !== 'none' && (
            <div className="pt-2 border-t border-[#2C2C34] space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Glass Plaque Shape
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GLASS_SHAPES.map((shape) => {
                    const isShapeSelected = (overlay.glassShape || 'pill') === shape.id;
                    return (
                      <button
                        key={shape.id}
                        onClick={() =>
                          onUpdateSettings({
                            overlayText: {
                              ...overlay,
                              glassShape: shape.id,
                            },
                          })
                        }
                        className={`p-1.5 rounded-lg border text-center text-xs flex items-center justify-center gap-1 transition-all ${
                          isShapeSelected
                            ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                            : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>{shape.icon}</span>
                        <span className="text-[11px] truncate">{shape.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-300 font-semibold uppercase">Plaque Darkness / Opacity</span>
                  <span className="font-mono text-[#E5C158] font-bold">
                    {Math.round((overlay.glassOpacity ?? 0.88) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="1.0"
                  step="0.05"
                  value={overlay.glassOpacity ?? 0.88}
                  onChange={(e) =>
                    onUpdateSettings({
                      overlayText: {
                        ...overlay,
                        glassOpacity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-[#C8A96B] cursor-pointer h-1.5"
                />
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[
                    { label: '50%', val: 0.50 },
                    { label: '75%', val: 0.75 },
                    { label: '90%', val: 0.90 },
                    { label: '100% Solid', val: 1.0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() =>
                        onUpdateSettings({
                          overlayText: {
                            ...overlay,
                            glassOpacity: p.val,
                          },
                        })
                      }
                      className={`py-1 rounded-md text-[10px] font-semibold border transition-all ${
                        Math.abs((overlay.glassOpacity ?? 0.88) - p.val) < 0.04
                          ? 'border-[#C8A96B] bg-[#C8A96B]/30 text-white font-bold'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete / Clear Words Button */}
        {isEnabled && (
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                overlayText: {
                  text: '',
                  subtext: '',
                  position: 'none',
                  fontFamily: 'Cinzel, serif',
                  color: '#C8A96B',
                  fontSize: 24,
                  glassEffect: 'none',
                },
              })
            }
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Canvas Words Completely</span>
          </button>
        )}
      </div>
    );
  };

  // If rendering inside a mobile bottom sheet
  if (isMobileSheet) {
    return (
      <div className="w-full h-full flex flex-col bg-[#18181E] text-white">
        {/* Mobile Horizontal Tabs Pill Bar */}
        <div className="flex items-center gap-1.5 p-2 bg-[#121214] border-b border-[#2C2C34] overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#C8A96B] text-black font-bold shadow-md shadow-[#C8A96B]/20'
                    : 'text-zinc-400 hover:text-white bg-[#1A1A1E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-black/20 text-black' : 'bg-[#2C2C34] text-[#C8A96B]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content for Mobile */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {/* TAB 1: PHOTOS */}
          {currentTab === 'photos' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#2C2C34] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Photo Collection
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
                    {photos.length} Photos
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#C8A96B] hover:bg-[#E5C158] text-[#141414] text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm text-center">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Add Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onUploadPhotos(Array.from(e.target.files), false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#2C2C34] hover:bg-[#383842] border border-[#C8A96B]/30 text-[#E5C158] text-xs font-bold rounded-xl cursor-pointer transition-colors text-center">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Upload & Replace</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onUploadPhotos(Array.from(e.target.files), true);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onLoadSamplePhotos}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#1E1E24] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300 text-[11px] font-medium rounded-xl transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Load Sample Photos</span>
                    </button>
                    {onClearAllPhotos && (
                      <button
                        onClick={onClearAllPhotos}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#1E1E24] hover:bg-red-500/20 border border-[#2C2C34] hover:border-red-500/40 text-zinc-300 hover:text-red-400 text-[11px] font-medium rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Clear All Photos</span>
                      </button>
                    )}
                  </div>

                  {/* Photo Fill Strategy Selector OR 100% Unique Match Banner */}
                  {isEnoughPhotos ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✨ 100% Unique Photos Matched</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          Zero Repetition
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-snug">
                        You have {photos.length} photos for {requiredTiles} tiles. Every tile uses a unique picture with zero duplicates! Repetition is automatically disabled.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#C8A96B]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Photo Fill Strategy</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#E5C158] font-bold">
                          {photos.length} / {requiredTiles} photos
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 leading-snug">
                        You have {photos.length} photos for {requiredTiles} tiles. Choose how remaining tiles are filled:
                      </p>

                      <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                        <button
                          onClick={() => onUpdateSettings({ photoFillStrategy: 'repeat-uploaded' })}
                          className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                            settings.photoFillStrategy !== 'mix-sample-photos'
                              ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white shadow-sm'
                              : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#E5C158]">🔁 Repeat My Uploaded Photos</span>
                            {settings.photoFillStrategy !== 'mix-sample-photos' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            Strictly uses only your uploaded pictures with smart anti-adjacent placement.
                          </span>
                        </button>

                        <button
                          onClick={() => onUpdateSettings({ photoFillStrategy: 'mix-sample-photos' })}
                          className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                            settings.photoFillStrategy === 'mix-sample-photos'
                              ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white shadow-sm'
                              : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">✨ Mix In Sample Photos</span>
                            {settings.photoFillStrategy === 'mix-sample-photos' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            Places your uploaded photos first, and supplements with curated photography.
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Grid Preview */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {onDeletePhoto && (
                        <button
                          onClick={() => onDeletePhoto(p.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 flex items-center justify-center text-white text-[10px] transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMOJIS */}
          {currentTab === 'emojis' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  😀 Emoji Mosaic Studio
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">
                  Photos are replaced with colorful emojis to form your shape!
                </p>
              </div>

              <div className="p-3 bg-[#121214] border border-[#2C2C34] rounded-2xl space-y-2.5">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Type or Paste Emojis
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmojiInput}
                    onChange={(e) => setCustomEmojiInput(e.target.value)}
                    placeholder="Type emojis: ❤️ 🔥 ✨ 👑 🌸 💎"
                    className="flex-1 px-3 py-2 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-base text-white"
                  />
                  <button
                    onClick={() => {
                      const parsed = parseEmojisFromString(customEmojiInput);
                      if (parsed.length > 0) {
                        const next = Array.from(new Set([...parsed, ...activeEmojis]));
                        setActiveEmojis(next);
                        onApplyEmojis?.(next);
                        setCustomEmojiInput('');
                      }
                    }}
                    className="px-4 py-2 bg-[#C8A96B] hover:bg-[#E5C158] text-black font-bold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Curated Emoji Theme Packs
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EMOJI_THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setActiveEmojis(preset.emojis);
                        onApplyEmojis?.(preset.emojis);
                      }}
                      className="p-2.5 rounded-xl border border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B] text-left transition-all flex flex-col justify-between"
                    >
                      <div className="text-xs font-bold text-white">{preset.name}</div>
                      <div className="text-xs tracking-tight mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {preset.emojis.slice(0, 5).join(' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHAPES */}
          {currentTab === 'shapes' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Target Shape Library
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Select a silhouette for your photos.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUILT_IN_SHAPES.map((shape) => {
                  const isSelected = target.type === 'shape' && target.shapeId === shape.id;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => onUpdateTarget({ type: 'shape', shapeId: shape.id })}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md shadow-[#C8A96B]/20 text-white'
                          : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/50 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center ${
                          isSelected ? 'text-[#C8A96B]' : 'text-zinc-400'
                        }`}
                        dangerouslySetInnerHTML={{ __html: shape.iconSvg }}
                      />
                      <span className="text-xs font-semibold">{shape.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Divider / Accent Emoji */}
              {renderCenterDividerEmojiSection()}
            </div>
          )}

          {/* TAB 4: LETTERS & NAMES */}
          {currentTab === 'letters' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Letters, Words & Names
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Photos will form your custom text.</p>
              </div>

              {/* Auto-Optimized Grid Density Notice & Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#141417] border border-[#C8A96B]/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#C8A96B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Grid Density & Sharpness</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#E5C158] font-bold border border-[#C8A96B]/30">
                    {settings.density === 'ultra'
                      ? '⭐ Ultra (Auto-Set)'
                      : settings.density === 'ultra-pro'
                      ? '⚡ Ultra Pro'
                      : settings.density === 'ultra-max'
                      ? '🚀 Ultra Max'
                      : settings.density.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Ultra density is automatically activated for Names & Words so letter curves and lines remain crisp with thousands of micro photos.
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'high', label: 'High', tiles: '~4.5k' },
                    { id: 'ultra', label: '⭐ Ultra', tiles: '~8k', badge: 'Auto' },
                    { id: 'ultra-pro', label: '⚡ Pro', tiles: '~16k' },
                    { id: 'ultra-max', label: '🚀 Max', tiles: '~25k' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onUpdateSettings({ density: d.id as any })}
                      className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                        settings.density === d.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-[11px] truncate">{d.label}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{d.tiles}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input with Clear Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Text Content
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {(target.targetText || '').length} chars
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={target.targetText || ''}
                    onChange={(e) =>
                      onUpdateTarget({
                        type: 'name',
                        targetText: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. ANANYA or BUNTY BABLI"
                    className="w-full pl-4 pr-9 py-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#C8A96B]"
                  />
                  {target.targetText && (
                    <button
                      onClick={() => onUpdateTarget({ type: 'name', targetText: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                      title="Clear text"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'BUNTY BABLI',
                    'AARAV & PRIYA',
                    'HAPPY BIRTHDAY',
                    'SHUBHAM JAISWAL',
                    'LOVE & FOREVER',
                    'OUR FAMILY',
                    'ANANYA',
                    'ROHAN',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() =>
                        onUpdateTarget({
                          type: example.length === 1 ? 'letter' : 'name',
                          targetText: example,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        target.targetText === example
                          ? 'bg-[#C8A96B] text-black font-bold shadow-sm'
                          : 'bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300'
                      }`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Aspect Ratio Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/30">
                <div className="flex items-center justify-between text-xs font-semibold text-[#C8A96B]">
                  <span>Canvas Aspect Ratio</span>
                  <span className="text-[10px] font-mono text-[#E5C158] font-bold">
                    {settings.canvasPreset === '9:16' ? '9:16 Reel (Recommended)' : settings.canvasPreset || '1:1'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { id: '9:16', label: '📱 9:16 Vertical', ratio: 9 / 16, badge: 'Best' },
                    { id: '1:1', label: '⏹️ 1:1 Square', ratio: 1 },
                    { id: '16:9', label: '🖥️ 16:9 Banner', ratio: 16 / 9 },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateSettings({
                          canvasPreset: preset.id as any,
                          aspectRatio: preset.ratio,
                        })
                      }
                      className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center text-xs transition-all ${
                        settings.canvasPreset === preset.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {preset.badge && (
                        <span className="text-[9px] text-[#E5C158] font-semibold mt-0.5">
                          {preset.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bold Typography */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Bold Typography
                </label>
                <select
                  value={target.fontFamily || 'Montserrat, sans-serif'}
                  onChange={(e) => onUpdateTarget({ fontFamily: e.target.value })}
                  className="w-full p-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="Montserrat, sans-serif">Montserrat Black (Modern ExtraBold)</option>
                  <option value='Impact, "Arial Black", sans-serif'>⚡ Impact Ultra Block (Maximum Tile Grid Fill)</option>
                  <option value="Cinzel, serif">Cinzel Bold (Royal Luxury Serif)</option>
                  <option value='Anton, Impact, "Arial Black", sans-serif'>Anton Heavy (Tall & Punchy)</option>
                  <option value="Playfair Display, serif">Playfair Display (Editorial Luxury)</option>
                  <option value='"Arial Black", sans-serif'>Arial Black (Heavy Geometric)</option>
                </select>
              </div>

              {/* Word Orientation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Word Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'horizontal',
                      name: '↔️ Horizontal',
                      desc: 'Standard left-to-right reading',
                    },
                    {
                      id: 'vertical',
                      name: '↕️ Vertical Columns',
                      desc: 'Top-to-bottom columns (Perfect for 9:16)',
                    },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onUpdateTarget({ textOrientation: o.id as any })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                        (target.textOrientation || 'horizontal') === o.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{o.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Divider / Accent Emoji */}
              {renderCenterDividerEmojiSection()}
            </div>
          )}

          {/* TAB 5: NUMBERS */}
          {currentTab === 'numbers' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Number Art
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Birthdays, anniversaries, milestone years.</p>
              </div>

              {/* Auto-Optimized Grid Density Notice & Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#141417] border border-[#C8A96B]/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#C8A96B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Grid Density & Sharpness</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#E5C158] font-bold border border-[#C8A96B]/30">
                    {settings.density === 'ultra'
                      ? '⭐ Ultra (Auto-Set)'
                      : settings.density === 'ultra-pro'
                      ? '⚡ Ultra Pro'
                      : settings.density === 'ultra-max'
                      ? '🚀 Ultra Max'
                      : settings.density.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Ultra density is automatically activated for Numbers to give smooth, ultra-sharp numeric contours.
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'high', label: 'High', tiles: '~4.5k' },
                    { id: 'ultra', label: '⭐ Ultra', tiles: '~8k', badge: 'Auto' },
                    { id: 'ultra-pro', label: '⚡ Pro', tiles: '~16k' },
                    { id: 'ultra-max', label: '🚀 Max', tiles: '~25k' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onUpdateSettings({ density: d.id as any })}
                      className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                        settings.density === d.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-[11px] truncate">{d.label}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{d.tiles}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={target.targetText || ''}
                    onChange={(e) =>
                      onUpdateTarget({
                        type: 'number',
                        targetText: e.target.value,
                      })
                    }
                    placeholder="e.g. 25 or 2026"
                    className="w-full pl-4 pr-9 py-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-[#C8A96B]"
                  />
                  {target.targetText && (
                    <button
                      onClick={() => onUpdateTarget({ type: 'number', targetText: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                      title="Clear number"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-400 font-medium">🎂 Popular Milestones & Years:</div>
                  <div className="flex flex-wrap gap-2">
                    {['2026', '25', '50', '18', '21', '30', '1', '7', '10', '100', '2025'].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          onUpdateTarget({
                            type: 'number',
                            targetText: num,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-all ${
                          target.targetText === num
                            ? 'bg-[#C8A96B] text-black font-bold shadow-sm'
                            : 'bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center Divider / Accent Emoji */}
                {renderCenterDividerEmojiSection()}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM IMAGE */}
          {currentTab === 'custom' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderCustomPictureControls()}
            </div>
          )}

          {/* TAB 7: BACKGROUNDS */}
          {currentTab === 'backgrounds' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Canvas Background
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Obsidian Velvet', type: 'color', value: '#0C0C0E' },
                  { name: 'Imperial Burgundy', type: 'color', value: '#2C0D15' },
                  { name: 'Sapphire Midnight', type: 'color', value: '#0B1528' },
                  { name: 'Emerald Forest', type: 'color', value: '#071F18' },
                  { name: 'Gallery White', type: 'color', value: '#FFFFFF' },
                  { name: 'Transparent (Cutout)', type: 'transparent', value: 'transparent' },
                ].map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() =>
                      onUpdateSettings({
                        background: {
                          type: bg.type as any,
                          value: bg.value,
                        },
                      })
                    }
                    className="p-2.5 rounded-xl border border-[#2C2C34] bg-[#141417] flex items-center gap-2 text-xs"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ background: bg.value }}
                    />
                    <span className="truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: TEXT OVERLAY */}
          {currentTab === 'text' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {renderTextOverlayControls()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Dual-Sidebar layout
  return (
    <div className="hidden lg:flex h-full border-r border-[#2C2C34] bg-[#141417] relative select-none shrink-0 z-20">
      {/* Slim Tab Icons Strip */}
      <div className="w-16 flex flex-col items-center py-3 bg-[#121214] border-r border-[#222228] gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isCollapsed;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'bg-[#C8A96B] text-black font-semibold shadow-lg shadow-[#C8A96B]/20'
                  : 'text-[#9E9E9E] hover:text-white hover:bg-[#1E1E24]'
              }`}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider scale-90">{tab.label}</span>
              {tab.count !== undefined && !isActive && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#2C2C34] text-[8px] flex items-center justify-center text-[#C8A96B] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#666666] hover:text-white hover:bg-[#1E1E24] transition-colors"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Drawer */}
      {!isCollapsed && (
        <div className="w-80 h-full overflow-hidden bg-[#1A1A1E] flex flex-col text-white animate-in fade-in duration-150">
          {/* TAB 1: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#2C2C34] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                    Photo Collection
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
                    {photos.length} Photos
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8A96B] hover:bg-[#E5C158] text-[#141414] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm text-center">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Add Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onUploadPhotos(Array.from(e.target.files), false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2C2C34] hover:bg-[#383842] border border-[#C8A96B]/30 text-[#E5C158] text-xs font-bold rounded-lg cursor-pointer transition-colors text-center" title="Replaces all existing/sample photos and uses only your uploaded photos">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Upload & Replace</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            onUploadPhotos(Array.from(e.target.files), true);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onLoadSamplePhotos}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#1E1E24] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300 text-[11px] font-medium rounded-lg transition-colors"
                    >
                      <FolderPlus className="w-3 h-3 text-[#C8A96B]" />
                      <span>+100 Samples</span>
                    </button>

                    {onClearAllPhotos && (
                      <button
                        onClick={() => {
                          if (confirm('Clear all photos from this project and start fresh with your own photos?')) {
                            onClearAllPhotos();
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-semibold rounded-lg transition-colors"
                        title="Delete all photos and start completely fresh"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All Photos</span>
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos..."
                  className="w-full px-3 py-1.5 text-xs bg-[#141417] border border-[#2C2C34] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A96B]"
                />

                {/* Photo Fill Strategy Selector OR 100% Unique Match Banner */}
                {isEnoughPhotos ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>✨ 100% Unique Photos Matched</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Zero Repetition
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-snug">
                      You have {photos.length} photos for {requiredTiles} tiles. Every tile uses a unique picture with zero duplicates! Repetition is automatically disabled.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#C8A96B]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Photo Fill Strategy</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#E5C158] font-bold">
                        {photos.length} / {requiredTiles} photos
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-snug">
                      You have {photos.length} photos for {requiredTiles} tiles. Choose how remaining tiles are filled:
                    </p>

                    <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                      <button
                        onClick={() => onUpdateSettings({ photoFillStrategy: 'repeat-uploaded' })}
                        className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                          settings.photoFillStrategy !== 'mix-sample-photos'
                            ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white shadow-sm'
                            : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#E5C158]">🔁 Repeat My Uploaded Photos</span>
                          {settings.photoFillStrategy !== 'mix-sample-photos' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          Strictly uses only your uploaded pictures with smart anti-adjacent placement.
                        </span>
                      </button>

                      <button
                        onClick={() => onUpdateSettings({ photoFillStrategy: 'mix-sample-photos' })}
                        className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                          settings.photoFillStrategy === 'mix-sample-photos'
                            ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white shadow-sm'
                            : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">✨ Mix In Sample Photos</span>
                          {settings.photoFillStrategy === 'mix-sample-photos' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          Places your uploaded photos first, and supplements with curated photography.
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2">
                {filteredPhotos.map((p) => (
                  <div
                    key={p.id}
                    className={`relative group rounded-lg overflow-hidden border ${
                      p.favorite ? 'border-[#C8A96B]' : 'border-[#2C2C34]'
                    } bg-black/40 h-20`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Favorite Button (Top Left) */}
                    <button
                      onClick={() => onToggleFavorite(p.id)}
                      className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur transition-opacity ${
                        p.favorite ? 'bg-[#C8A96B] text-black' : 'bg-black/60 text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title={p.favorite ? 'Favorited' : 'Add to favorites'}
                    >
                      <Heart className="w-2.5 h-2.5 fill-current" />
                    </button>

                    {/* Delete Photo Button (Top Right) */}
                    {onDeletePhoto && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePhoto(p.id);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white backdrop-blur opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete this photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emojis Tab */}
          {activeTab === 'emojis' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-[#2C2C34] space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>😀 Emoji Mosaic Studio</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Construct shape art using multiple emojis instead of pictures.
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
                    {activeEmojis.length} Emojis
                  </span>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => onApplyEmojis?.(activeEmojis)}
                  className="w-full py-2.5 px-3 bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Emoji Mosaic</span>
                </button>

                {/* Custom Emoji Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Type or Paste Custom Emojis:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      placeholder="e.g. ❤️✨👑💍🌸🎂🚀"
                      className="flex-1 px-3 py-1.5 text-sm bg-[#141417] border border-[#2C2C34] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8A96B]"
                    />
                    <button
                      onClick={() => {
                        if (customEmojiInput.trim()) {
                          const parsed = parseEmojisFromString(customEmojiInput);
                          if (parsed.length > 0) {
                            const updated = Array.from(new Set([...activeEmojis, ...parsed]));
                            setActiveEmojis(updated);
                            setCustomEmojiInput('');
                            onApplyEmojis?.(updated);
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-[#2C2C34] hover:bg-[#383842] text-[#C8A96B] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Emoji Chips & Preset Packs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Active Selected Emojis Box */}
                <div className="p-3 rounded-xl bg-[#18181E] border border-[#2C2C34] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#C8A96B]">Active Emojis Palette</span>
                    <button
                      onClick={() => {
                        setActiveEmojis([]);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-red-400"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[48px] p-2 bg-[#121215] rounded-lg border border-white/5">
                    {activeEmojis.length === 0 ? (
                      <span className="text-[11px] text-zinc-500 italic m-auto">
                        No emojis selected. Pick presets or emojis below!
                      </span>
                    ) : (
                      activeEmojis.map((emoji) => (
                        <span
                          key={emoji}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#22222A] border border-white/10 text-sm hover:border-[#C8A96B] transition-colors"
                        >
                          <span>{emoji}</span>
                          <button
                            onClick={() => {
                              const updated = activeEmojis.filter((e) => e !== emoji);
                              setActiveEmojis(updated);
                              if (updated.length > 0) {
                                onApplyEmojis?.(updated);
                              }
                            }}
                            className="text-zinc-500 hover:text-red-400 text-xs ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Emoji Picker Tray */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Quick Pick Popular Emojis:
                  </label>
                  <div className="grid grid-cols-8 gap-1 p-2 bg-[#18181E] border border-[#2C2C34] rounded-xl text-lg text-center">
                    {[
                      '❤️', '💖', '💕', '💓', '💗', '💘', '💝', '🌹',
                      '✨', '👑', '💎', '💍', '⭐', '🌟', '💫', '🏆',
                      '🎂', '🎈', '🎉', '🎁', '🥳', '🍰', '🥂', '🍾',
                      '🌸', '🌺', '🌻', '🌷', '🌿', '🍀', '🦋', '🌈',
                      '🔥', '⚡', '🚀', '🦄', '👾', '🔮', '💯', '🎯',
                      '🐱', '🐶', '🐼', '🐰', '🦊', '🐻', '🐨', '🦁',
                      '🍕', '🍔', '🍩', '🍦', '🍓', '🍫', '🍹', '🍿',
                      '🕊️', '👰', '🤵', '🍼', '👶', '🧸', '☕', '🕶️',
                    ].map((emoji) => {
                      const isSelected = activeEmojis.includes(emoji);
                      return (
                        <button
                          key={emoji}
                          onClick={() => {
                            let updated: string[];
                            if (isSelected) {
                              updated = activeEmojis.filter((e) => e !== emoji);
                            } else {
                              updated = [...activeEmojis, emoji];
                            }
                            setActiveEmojis(updated);
                            if (updated.length > 0) {
                              onApplyEmojis?.(updated);
                            }
                          }}
                          className={`p-1 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-[#C8A96B]/30 ring-1 ring-[#C8A96B] scale-110 shadow-sm'
                              : 'hover:bg-white/10'
                          }`}
                          title={`Toggle ${emoji}`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curated Theme Preset Packs */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Curated Emoji Theme Packs
                  </label>
                  <div className="space-y-1.5">
                    {EMOJI_THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setActiveEmojis(preset.emojis);
                          onApplyEmojis?.(preset.emojis);
                        }}
                        className="w-full p-2.5 rounded-xl border border-[#2C2C34] bg-[#18181E] hover:border-[#C8A96B] text-left transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#E5C158]">
                            {preset.name}
                          </div>
                          <div className="text-sm tracking-tight mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                            {preset.emojis.slice(0, 8).join(' ')}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-[#2C2C34] text-zinc-400 group-hover:bg-[#C8A96B] group-hover:text-black font-semibold transition-colors">
                          Apply
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHAPES */}
          {activeTab === 'shapes' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Target Shape Library
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Select a silhouette for your photos.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUILT_IN_SHAPES.map((shape) => {
                  const isSelected = target.type === 'shape' && target.shapeId === shape.id;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => onUpdateTarget({ type: 'shape', shapeId: shape.id })}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md shadow-[#C8A96B]/20 text-white'
                          : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/50 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center ${
                          isSelected ? 'text-[#C8A96B]' : 'text-zinc-400'
                        }`}
                        dangerouslySetInnerHTML={{ __html: shape.iconSvg }}
                      />
                      <span className="text-xs font-semibold">{shape.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Divider / Accent Emoji */}
              {renderCenterDividerEmojiSection()}
            </div>
          )}

          {/* TAB 3: LETTERS & NAMES */}
          {activeTab === 'letters' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Letters, Words & Names
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Photos will form your custom text.</p>
              </div>

              {/* Auto-Optimized Grid Density Notice & Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#141417] border border-[#C8A96B]/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#C8A96B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Grid Density & Sharpness</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#E5C158] font-bold border border-[#C8A96B]/30">
                    {settings.density === 'ultra'
                      ? '⭐ Ultra (Auto-Set)'
                      : settings.density === 'ultra-pro'
                      ? '⚡ Ultra Pro'
                      : settings.density === 'ultra-max'
                      ? '🚀 Ultra Max'
                      : settings.density.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Ultra density is automatically activated for Names & Words so letter curves and lines remain crisp with thousands of micro photos.
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'high', label: 'High', tiles: '~4.5k' },
                    { id: 'ultra', label: '⭐ Ultra', tiles: '~8k', badge: 'Auto' },
                    { id: 'ultra-pro', label: '⚡ Pro', tiles: '~16k' },
                    { id: 'ultra-max', label: '🚀 Max', tiles: '~25k' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onUpdateSettings({ density: d.id as any })}
                      className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                        settings.density === d.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-[11px] truncate">{d.label}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{d.tiles}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Text Content
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {(target.targetText || '').length} chars
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={target.targetText || ''}
                    onChange={(e) =>
                      onUpdateTarget({
                        type: 'name',
                        targetText: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. ANANYA or BUNTY BABLI"
                    className="w-full pl-4 pr-9 py-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#C8A96B]"
                  />
                  {target.targetText && (
                    <button
                      onClick={() => onUpdateTarget({ type: 'name', targetText: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                      title="Clear text"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'BUNTY BABLI',
                    'AARAV & PRIYA',
                    'HAPPY BIRTHDAY',
                    'SHUBHAM JAISWAL',
                    'LOVE & FOREVER',
                    'OUR FAMILY',
                    'ANANYA',
                    'ROHAN',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() =>
                        onUpdateTarget({
                          type: example.length === 1 ? 'letter' : 'name',
                          targetText: example,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        target.targetText === example
                          ? 'bg-[#C8A96B] text-black font-bold shadow-sm'
                          : 'bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300'
                      }`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Aspect Ratio Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/30">
                <div className="flex items-center justify-between text-xs font-semibold text-[#C8A96B]">
                  <span>Canvas Aspect Ratio</span>
                  <span className="text-[10px] font-mono text-[#E5C158] font-bold">
                    {settings.canvasPreset === '9:16' ? '9:16 Reel (Recommended)' : settings.canvasPreset || '1:1'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { id: '9:16', label: '📱 9:16 Vertical', ratio: 9 / 16, badge: 'Best' },
                    { id: '1:1', label: '⏹️ 1:1 Square', ratio: 1 },
                    { id: '16:9', label: '🖥️ 16:9 Banner', ratio: 16 / 9 },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateSettings({
                          canvasPreset: preset.id as any,
                          aspectRatio: preset.ratio,
                        })
                      }
                      className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center text-xs transition-all ${
                        settings.canvasPreset === preset.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/25 text-white font-bold shadow-sm'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {preset.badge && (
                        <span className="text-[9px] text-[#E5C158] font-semibold mt-0.5">
                          {preset.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Bold Typography
                </label>
                <select
                  value={target.fontFamily || 'Montserrat, sans-serif'}
                  onChange={(e) => onUpdateTarget({ fontFamily: e.target.value })}
                  className="w-full p-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="Montserrat, sans-serif">Montserrat Black (Modern ExtraBold)</option>
                  <option value='Impact, "Arial Black", sans-serif'>⚡ Impact Ultra Block (Maximum Tile Grid Fill)</option>
                  <option value="Cinzel, serif">Cinzel Bold (Royal Luxury Serif)</option>
                  <option value='Anton, Impact, "Arial Black", sans-serif'>Anton Heavy (Tall & Punchy)</option>
                  <option value="Playfair Display, serif">Playfair Display (Editorial Luxury)</option>
                  <option value='"Arial Black", sans-serif'>Arial Black (Heavy Geometric)</option>
                </select>
              </div>

              {/* Word Orientation (Horizontal vs Vertical Columns) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Word Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'horizontal',
                      name: '↔️ Horizontal',
                      desc: 'Standard left-to-right reading',
                    },
                    {
                      id: 'vertical',
                      name: '↕️ Vertical Columns',
                      desc: 'Top-to-bottom columns (Perfect for 9:16)',
                    },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onUpdateTarget({ textOrientation: o.id as any })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                        (target.textOrientation || 'horizontal') === o.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{o.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Divider / Accent Emoji */}
              {renderCenterDividerEmojiSection()}

              {/* Text Layout Mode (Stacked Block vs Wide Banner vs Plaque) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Layout & Fill Style
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    {
                      id: 'auto',
                      name: '⚡ Auto-Fit (Balanced Fill)',
                      desc: 'Optimizes letter sizes to maximize canvas coverage',
                    },
                    {
                      id: 'stacked',
                      name: '🧱 Stacked 2-Line Block (Giant Letters)',
                      desc: 'Splits long names into 2 big bold lines for 80% coverage',
                    },
                    {
                      id: 'single-line',
                      name: '📏 Single-Line Banner',
                      desc: 'Classic horizontal name stream',
                    },
                    {
                      id: 'emblem-plaque',
                      name: '🛡️ Royal Plaque Emblem',
                      desc: 'Fills the background badge contour with photos and highlighted name',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onUpdateTarget({ textLayout: item.id as any })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                        (target.textLayout || 'auto') === item.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-semibold shadow-sm'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#E5C158]">{item.name}</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stroke Thickness / Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#C8A96B]">
                  <span>Letter Stem Thickness</span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {target.strokeThickness || 1.4}x Extra Bold
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: 1.0, label: 'Normal' },
                    { val: 1.4, label: 'Bold (1.4x)' },
                    { val: 2.0, label: 'Ultra Heavy (2x)' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => onUpdateTarget({ strokeThickness: s.val })}
                      className={`py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                        (target.strokeThickness || 1.4) === s.val
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NUMBERS */}
          {activeTab === 'numbers' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Number Art
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">Birthdays, anniversaries, dates.</p>
              </div>

              {/* Auto-Optimized Grid Density Notice & Quick-Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#141417] border border-[#C8A96B]/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#C8A96B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Grid Density & Sharpness</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#E5C158] font-bold border border-[#C8A96B]/30">
                    {settings.density === 'ultra'
                      ? '⭐ Ultra (Auto-Set)'
                      : settings.density === 'ultra-pro'
                      ? '⚡ Ultra Pro'
                      : settings.density === 'ultra-max'
                      ? '🚀 Ultra Max'
                      : settings.density.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Ultra density is automatically activated for Numbers to give smooth, ultra-sharp numeric contours.
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'high', label: 'High', tiles: '~4.5k' },
                    { id: 'ultra', label: '⭐ Ultra', tiles: '~8k', badge: 'Auto' },
                    { id: 'ultra-pro', label: '⚡ Pro', tiles: '~16k' },
                    { id: 'ultra-max', label: '🚀 Max', tiles: '~25k' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onUpdateSettings({ density: d.id as any })}
                      className={`p-1.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                        settings.density === d.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm ring-1 ring-[#C8A96B]/50'
                          : 'border-[#2C2C34] bg-[#18181E] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-[11px] truncate">{d.label}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">{d.tiles}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Number Value
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {(target.targetText || '').length} digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={target.targetText || ''}
                    onChange={(e) =>
                      onUpdateTarget({
                        type: 'number',
                        targetText: e.target.value,
                      })
                    }
                    placeholder="e.g. 25 or 2026"
                    className="w-full pl-4 pr-9 py-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-[#C8A96B]"
                  />
                  {target.targetText && (
                    <button
                      onClick={() => onUpdateTarget({ type: 'number', targetText: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                      title="Clear number"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-400 font-medium">🎂 Popular Milestones & Years:</div>
                  <div className="flex flex-wrap gap-2">
                    {['2026', '25', '50', '18', '21', '30', '1', '7', '10', '100', '2025'].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          onUpdateTarget({
                            type: 'number',
                            targetText: num,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-all ${
                          target.targetText === num
                            ? 'bg-[#C8A96B] text-black font-bold shadow-sm'
                            : 'bg-[#141417] hover:bg-[#2C2C34] border border-[#2C2C34] text-zinc-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                      Number Style
                </label>
                <select
                  value={target.fontFamily || 'Montserrat, sans-serif'}
                  onChange={(e) => onUpdateTarget({ fontFamily: e.target.value })}
                  className="w-full p-2.5 bg-[#141417] border border-[#2C2C34] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="Montserrat, sans-serif">Montserrat Black (Solid Block)</option>
                  <option value="Arial Black, sans-serif">Arial Black (Extra Thick)</option>
                  <option value="Impact, sans-serif">Impact (Condensed Bold)</option>
                  <option value="Cinzel, serif">Cinzel Bold (Royal Serif)</option>
                </select>
              </div>

              {/* Center Divider / Accent Emoji */}
              {renderCenterDividerEmojiSection()}
            </div>
          )}

          {/* TAB 5: CUSTOM IMAGE */}
          {activeTab === 'custom' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {renderCustomPictureControls()}
            </div>
          )}

          {/* TAB 6: BACKGROUNDS */}
          {activeTab === 'backgrounds' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  Canvas Background
                </h3>
                <p className="text-xs text-[#9E9E9E] mt-1">
                  Choose luxury colors, gradients, custom colors, or upload an image.
                </p>
              </div>

              {/* Custom Color Chooser */}
              <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5">
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Custom Color Picker
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-md cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={settings.background.type === 'color' ? settings.background.value : '#0C0C0E'}
                      onChange={(e) =>
                        onUpdateSettings({
                          background: {
                            type: 'color',
                            value: e.target.value,
                          },
                        })
                      }
                      className="absolute -inset-2 w-14 h-14 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={settings.background.value}
                      onChange={(e) =>
                        onUpdateSettings({
                          background: {
                            type: e.target.value.startsWith('linear') ? 'gradient' : 'color',
                            value: e.target.value,
                          },
                        })
                      }
                      placeholder="#0C0C0E"
                      className="w-full px-3 py-1.5 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs font-mono text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Background Image Uploader */}
              <div className="p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] space-y-2.5">
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Upload Background Image
                </label>
                {settings.background.type === 'image' && settings.background.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-24 rounded-xl overflow-hidden border border-[#C8A96B]/50 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.background.imageUrl}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          onUpdateSettings({
                            background: {
                              type: 'color',
                              value: '#0C0C0E',
                            },
                          })
                        }
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-black text-white hover:text-red-400 backdrop-blur transition-colors"
                        title="Remove custom background"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-medium">✓ Custom background active</p>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#2C2C34] hover:border-[#C8A96B] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-[#9E9E9E] group-hover:text-[#C8A96B] mb-1 transition-colors" />
                    <span className="text-xs text-zinc-300 font-semibold">Upload Texture / Photo</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Wood, marble, scenery, wallpaper</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onUpdateSettings({
                            background: {
                              type: 'image',
                              value: `url(${url})`,
                              imageUrl: url,
                            },
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Rich Color Palettes & Gradients */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Rich Color Palettes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Obsidian Velvet', type: 'color', value: '#0C0C0E' },
                    { name: 'Imperial Burgundy', type: 'color', value: '#2C0D15' },
                    { name: 'Sapphire Midnight', type: 'color', value: '#0B1528' },
                    { name: 'Emerald Forest', type: 'color', value: '#071F18' },
                    { name: 'Amethyst Plum', type: 'color', value: '#1A0C2E' },
                    { name: 'Rose Quartz', type: 'color', value: '#2D141B' },
                    { name: 'Gallery White', type: 'color', value: '#FFFFFF' },
                    { name: 'Warm Ivory', type: 'color', value: '#FAF8F5' },
                    {
                      name: 'Champagne Silk',
                      type: 'gradient',
                      value: 'linear-gradient(135deg, #2A241C 0%, #14120E 100%)',
                    },
                    {
                      name: 'Golden Shimmer',
                      type: 'gradient',
                      value: 'linear-gradient(135deg, #3A2F1B 0%, #17130A 100%)',
                    },
                    {
                      name: 'Twilight Nebula',
                      type: 'gradient',
                      value: 'linear-gradient(135deg, #180B22 0%, #0A0A10 50%, #0E1A24 100%)',
                    },
                    {
                      name: 'Deep Space Noir',
                      type: 'gradient',
                      value: 'linear-gradient(180deg, #121217 0%, #060608 100%)',
                    },
                    { name: 'Transparent (Cutout)', type: 'transparent', value: 'transparent' },
                  ].map((bg) => {
                    const isSelected = settings.background.value === bg.value;
                    return (
                      <button
                        key={bg.name}
                        onClick={() =>
                          onUpdateSettings({
                            background: {
                              type: bg.type as any,
                              value: bg.value,
                            },
                          })
                        }
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold shadow-sm'
                            : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-[#C8A96B]/40'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-inner"
                          style={{
                            background: bg.value === 'transparent' ? '#333' : bg.value,
                          }}
                        />
                        <span className="truncate text-xs">{bg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TEXT OVERLAY */}
          {activeTab === 'text' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {renderTextOverlayControls()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
