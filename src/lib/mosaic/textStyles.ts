// Mosaic Artwork Text Overlay Fonts, Glassmorphism Effects, Clarity Modes, and Rendering Helpers

export interface StylishFont {
  id: string;
  name: string;
  category: string;
  sample: string;
  cssFamily: string;
  fontScale?: number;
}

export const STYLISH_FONTS: StylishFont[] = [
  {
    id: 'Cinzel, serif',
    name: 'Cinzel Royal',
    category: '👑 Royal Luxury',
    sample: 'Royal & Prestige',
    cssFamily: 'Cinzel, serif',
    fontScale: 1.0,
  },
  {
    id: '"Great Vibes", cursive',
    name: 'Great Vibes Script',
    category: '✍️ Wedding Calligraphy',
    sample: 'Forever & Always',
    cssFamily: '"Great Vibes", cursive',
    fontScale: 1.25,
  },
  {
    id: '"Dancing Script", cursive',
    name: 'Dancing Script',
    category: '💖 Romantic Cursive',
    sample: 'Cherished Moments',
    cssFamily: '"Dancing Script", cursive',
    fontScale: 1.15,
  },
  {
    id: '"Playfair Display", serif',
    name: 'Playfair Vogue',
    category: '💎 Editorial Vogue',
    sample: 'Timeless Elegance',
    cssFamily: '"Playfair Display", serif',
    fontScale: 1.0,
  },
  {
    id: '"Alex Brush", cursive',
    name: 'Alex Brush Calligraphy',
    category: '💍 Fine Wedding',
    sample: 'A Love Story',
    cssFamily: '"Alex Brush", cursive',
    fontScale: 1.3,
  },
  {
    id: '"Satisfy", cursive',
    name: 'Satisfy Brush',
    category: '✨ Modern Script',
    sample: 'Happy Memories',
    cssFamily: '"Satisfy", cursive',
    fontScale: 1.1,
  },
  {
    id: '"Pacifico", cursive',
    name: 'Pacifico Casual',
    category: '🏖️ Vacation & Fun',
    sample: 'Adventures 2026',
    cssFamily: '"Pacifico", cursive',
    fontScale: 1.05,
  },
  {
    id: '"Prata", serif',
    name: 'Prata Art Serif',
    category: '🏛️ Museum Fine-Art',
    sample: 'Artistic Masterpiece',
    cssFamily: '"Prata", serif',
    fontScale: 1.0,
  },
  {
    id: '"Caveat", cursive',
    name: 'Caveat Handcrafted',
    category: '🖋️ Signature Touch',
    sample: 'Our Special Day',
    cssFamily: '"Caveat", cursive',
    fontScale: 1.2,
  },
  {
    id: '"Bebas Neue", sans-serif',
    name: 'Bebas Bold Poster',
    category: '⚡ High Impact',
    sample: 'LOUD & PROUD',
    cssFamily: '"Bebas Neue", sans-serif',
    fontScale: 1.1,
  },
  {
    id: '"Outfit", sans-serif',
    name: 'Outfit Ultra Clean',
    category: '🚀 Modern Tech',
    sample: 'Modern Branding',
    cssFamily: '"Outfit", sans-serif',
    fontScale: 0.95,
  },
  {
    id: 'Montserrat, sans-serif',
    name: 'Montserrat Studio',
    category: '🌟 Clean Studio',
    sample: 'Studio Edition',
    cssFamily: 'Montserrat, sans-serif',
    fontScale: 0.95,
  },
  {
    id: 'Impact, sans-serif',
    name: 'Impact Extra Bold',
    category: '🧱 Solid Block',
    sample: 'SOLID STATEMENT',
    cssFamily: 'Impact, sans-serif',
    fontScale: 1.0,
  },
];

export interface GlassEffectPreset {
  id: 'none' | 'frosted-glass' | 'dark-luxury' | 'solid-black' | 'gold-glow' | 'minimal-blur' | 'white-frost';
  name: string;
  badge: string;
  desc: string;
  previewBg: string;
  // CSS Classes for DOM live canvas overlay
  bgClass: string;
  borderClass: string;
  shadowClass: string;
  backdropClass: string;
  // Canvas export parameters (RGB values & alpha)
  exportBg: (opacity: number) => string;
  exportBorder: string;
  exportBorderWidth: number;
  exportShadowColor: string;
  exportShadowBlur: number;
}

export const GLASS_EFFECT_PRESETS: GlassEffectPreset[] = [
  {
    id: 'none',
    name: 'Pure Text',
    badge: '🚫 None',
    desc: 'No card, text floats directly over mosaic photos with ultra-deep shadow & halo',
    previewBg: 'bg-transparent border-dashed border-zinc-700',
    bgClass: 'bg-transparent',
    borderClass: 'border-transparent',
    shadowClass: 'drop-shadow-[0_4px_16px_rgba(0,0,0,1.0)]',
    backdropClass: '',
    exportBg: () => 'transparent',
    exportBorder: 'transparent',
    exportBorderWidth: 0,
    exportShadowColor: 'rgba(0,0,0,1.0)',
    exportShadowBlur: 20,
  },
  {
    id: 'dark-luxury',
    name: 'Obsidian Glass',
    badge: '🖤 Obsidian',
    desc: 'Deep smoky obsidian glass with refined 24K gold rim accent & maximum contrast',
    previewBg: 'bg-[#08080A]/95 backdrop-blur-md border border-[#C8A96B]/80 shadow-md',
    bgClass: 'bg-[#08080A]/[0.94]',
    borderClass: 'border border-[#C8A96B]/80',
    shadowClass: 'shadow-[0_18px_50px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(200,169,107,0.4)]',
    backdropClass: 'backdrop-blur-2xl',
    exportBg: (op) => `rgba(8, 8, 10, ${Math.min(1.0, Math.max(0.70, op))})`,
    exportBorder: 'rgba(200, 169, 107, 0.85)',
    exportBorderWidth: 1.5,
    exportShadowColor: 'rgba(0,0,0,0.95)',
    exportShadowBlur: 32,
  },
  {
    id: 'solid-black',
    name: 'Solid Onyx',
    badge: '⬛ Solid Dark',
    desc: '100% deep opaque dark plaque for zero background bleed & crystal-clear readability',
    previewBg: 'bg-black/95 border border-white/20 shadow-xl',
    bgClass: 'bg-[#060608]/[0.96]',
    borderClass: 'border border-white/30',
    shadowClass: 'shadow-[0_18px_50px_rgba(0,0,0,0.98),inset_0_1px_1px_rgba(255,255,255,0.2)]',
    backdropClass: 'backdrop-blur-2xl',
    exportBg: (op) => `rgba(6, 6, 8, ${Math.min(1.0, Math.max(0.75, op))})`,
    exportBorder: 'rgba(255, 255, 255, 0.40)',
    exportBorderWidth: 1.5,
    exportShadowColor: 'rgba(0,0,0,0.98)',
    exportShadowBlur: 34,
  },
  {
    id: 'frosted-glass',
    name: 'Frosted Glass',
    badge: '🧊 Glass',
    desc: 'Deep smoky frosted acrylic with specular white rim and dark ambient contrast',
    previewBg: 'bg-[#0E0E14]/90 backdrop-blur-md border border-white/40 shadow-md',
    bgClass: 'bg-[#0E0E14]/[0.90]',
    borderClass: 'border border-white/40',
    shadowClass: 'shadow-[0_16px_48px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)]',
    backdropClass: 'backdrop-blur-2xl',
    exportBg: (op) => `rgba(14, 14, 20, ${Math.min(0.98, Math.max(0.65, op))})`,
    exportBorder: 'rgba(255, 255, 255, 0.50)',
    exportBorderWidth: 1.5,
    exportShadowColor: 'rgba(0,0,0,0.85)',
    exportShadowBlur: 28,
  },
  {
    id: 'gold-glow',
    name: 'Royal Gold Glass',
    badge: '👑 Royal Gold',
    desc: 'Dark amber-tinted acrylic with glowing golden border and warm back-illumination',
    previewBg: 'bg-[#140E04]/90 backdrop-blur-md border border-[#E5C158]/85 shadow-md',
    bgClass: 'bg-[#140E04]/[0.90]',
    borderClass: 'border border-[#E5C158]/85',
    shadowClass: 'shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_24px_rgba(229,193,88,0.35)]',
    backdropClass: 'backdrop-blur-2xl',
    exportBg: (op) => `rgba(20, 14, 4, ${Math.min(0.98, Math.max(0.60, op))})`,
    exportBorder: 'rgba(229, 193, 88, 0.90)',
    exportBorderWidth: 2,
    exportShadowColor: 'rgba(200, 169, 107, 0.65)',
    exportShadowBlur: 32,
  },
  {
    id: 'minimal-blur',
    name: 'Subtle Aura',
    badge: '☁️ Aura Glass',
    desc: 'Deep smoked black aura shield for maximum text readability without heavy borders',
    previewBg: 'bg-black/85 backdrop-blur-md border border-white/20 shadow-sm',
    bgClass: 'bg-black/[0.85]',
    borderClass: 'border border-white/20',
    shadowClass: 'shadow-[0_14px_36px_rgba(0,0,0,0.85)]',
    backdropClass: 'backdrop-blur-xl',
    exportBg: (op) => `rgba(0, 0, 0, ${Math.min(0.98, Math.max(0.55, op))})`,
    exportBorder: 'rgba(255, 255, 255, 0.25)',
    exportBorderWidth: 1,
    exportShadowColor: 'rgba(0,0,0,0.85)',
    exportShadowBlur: 24,
  },
  {
    id: 'white-frost',
    name: 'Crystal White',
    badge: '✨ White Frost',
    desc: 'Luminous bright frosted plate for strong contrast against colorful mosaic art',
    previewBg: 'bg-white/90 backdrop-blur-lg border border-white/95 shadow-md',
    bgClass: 'bg-white/[0.90]',
    borderClass: 'border border-white/95',
    shadowClass: 'shadow-[0_16px_44px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)]',
    backdropClass: 'backdrop-blur-2xl',
    exportBg: (op) => `rgba(255, 255, 255, ${Math.min(0.98, Math.max(0.60, op))})`,
    exportBorder: 'rgba(255, 255, 255, 0.95)',
    exportBorderWidth: 1.5,
    exportShadowColor: 'rgba(0,0,0,0.65)',
    exportShadowBlur: 28,
  },
];

export const GLASS_SHAPES = [
  { id: 'pill' as const, name: 'Stadium Pill', icon: '💊', radiusClass: 'rounded-full', exportRadiusMultiplier: 0.5 },
  { id: 'rounded' as const, name: 'Smooth Rounded', icon: '🔲', radiusClass: 'rounded-2xl', exportRadiusMultiplier: 0.25 },
  { id: 'minimal' as const, name: 'Subtle Corners', icon: '◽', radiusClass: 'rounded-xl', exportRadiusMultiplier: 0.12 },
];

export interface TextClarityPreset {
  id: 'ultra-pop' | 'deep-shadow' | 'luminous-glow' | 'subtle';
  name: string;
  badge: string;
  desc: string;
  icon: string;
}

export const TEXT_CLARITY_PRESETS: TextClarityPreset[] = [
  {
    id: 'ultra-pop',
    name: 'Ultra Pop',
    badge: '🌟 High Contrast',
    desc: 'Multi-layer deep shadow + crisp stroke halo for 100% readability over any photo background',
    icon: '🌟',
  },
  {
    id: 'deep-shadow',
    name: 'Deep Shadow',
    badge: '🖤 3D Depth',
    desc: 'Cinematic multi-pass 3D ambient shadow with strong depth',
    icon: '🖤',
  },
  {
    id: 'luminous-glow',
    name: 'Radiant Glow',
    badge: '✨ Champagne Glow',
    desc: 'Warm luminous champagne aura and subtle back-glow',
    icon: '✨',
  },
  {
    id: 'subtle',
    name: 'Subtle Clean',
    badge: '◽ Minimal',
    desc: 'Clean minimal shadow without halo outline',
    icon: '◽',
  },
];

// Helper to compute CSS style for live DOM rendering on canvas stage
export function getTextClarityCss(
  clarity: 'ultra-pop' | 'deep-shadow' | 'luminous-glow' | 'subtle' = 'ultra-pop',
  textColor: string = '#C8A96B'
): React.CSSProperties {
  const isDark = textColor === '#0C0C0E' || textColor === '#000000' || textColor === '#121214';

  if (clarity === 'ultra-pop') {
    return {
      textShadow: isDark
        ? '0 0 2px #ffffff, 0 2px 5px rgba(255,255,255,1.0), 0 4px 18px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.9)'
        : '0 0 3px #000000, 0 2px 6px rgba(0,0,0,1.0), 0 4px 20px rgba(0,0,0,1.0), 0 0 36px rgba(0,0,0,0.98)',
      WebkitTextStroke: isDark ? '0.8px rgba(255,255,255,0.95)' : '0.8px rgba(0,0,0,0.95)',
      paintOrder: 'stroke fill',
    };
  }
  if (clarity === 'deep-shadow') {
    return {
      textShadow: isDark
        ? '0 3px 6px rgba(255,255,255,1.0), 0 6px 20px rgba(255,255,255,0.95), 0 12px 36px rgba(255,255,255,0.85)'
        : '0 3px 6px rgba(0,0,0,1.0), 0 6px 24px rgba(0,0,0,0.98), 0 14px 44px rgba(0,0,0,0.95)',
      WebkitTextStroke: isDark ? '0.6px rgba(255,255,255,0.85)' : '0.6px rgba(0,0,0,0.85)',
      paintOrder: 'stroke fill',
    };
  }
  if (clarity === 'luminous-glow') {
    return {
      textShadow: isDark
        ? '0 0 12px rgba(255,255,255,1.0), 0 0 24px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.9)'
        : '0 0 12px rgba(229,193,88,1.0), 0 0 26px rgba(200,169,107,0.9), 0 2px 8px rgba(0,0,0,1.0)',
      WebkitTextStroke: isDark ? '0.6px rgba(255,255,255,0.8)' : '0.6px rgba(0,0,0,0.8)',
      paintOrder: 'stroke fill',
    };
  }
  // subtle
  return {
    textShadow: isDark ? '0 2px 10px rgba(255,255,255,0.9)' : '0 2px 10px rgba(0,0,0,0.95)',
    WebkitTextStroke: isDark ? '0.4px rgba(255,255,255,0.6)' : '0.4px rgba(0,0,0,0.6)',
    paintOrder: 'stroke fill',
  };
}

// Master Canvas 2D Text Renderer for 4K / 8K Exports, 3D Mockups, and MP4 Video
export function renderCanvas2DText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  fontSize: number,
  clarity: 'ultra-pop' | 'deep-shadow' | 'luminous-glow' | 'subtle' = 'ultra-pop'
) {
  if (!text) return;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const isDark = color === '#0C0C0E' || color === '#000000' || color === '#121214';

  if (clarity === 'ultra-pop') {
    // Pass 1: Dark stroke halo outline behind letters
    ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.07));
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';
    ctx.strokeText(text, x, y);

    // Pass 2: Deep multi-layer ambient shadow
    ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 1.0)';
    ctx.shadowBlur = Math.round(fontSize * 0.5);
    ctx.shadowOffsetY = Math.round(fontSize * 0.1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    // Pass 3: Crisp sharp fill over top
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else if (clarity === 'deep-shadow') {
    ctx.lineWidth = Math.max(1.5, Math.round(fontSize * 0.04));
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.9)';
    ctx.strokeText(text, x, y);

    ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 1.0)';
    ctx.shadowBlur = Math.round(fontSize * 0.6);
    ctx.shadowOffsetY = Math.round(fontSize * 0.14);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.shadowColor = 'transparent';
    ctx.fillText(text, x, y);
  } else if (clarity === 'luminous-glow') {
    ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 1.0)' : 'rgba(229, 193, 88, 1.0)';
    ctx.shadowBlur = Math.round(fontSize * 0.65);
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = Math.round(fontSize * 0.25);
    ctx.fillText(text, x, y);
  } else {
    // subtle
    ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = Math.round(fontSize * 0.3);
    ctx.shadowOffsetY = Math.round(fontSize * 0.06);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}
