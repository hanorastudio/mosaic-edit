import { AnalyzedMosaicPhoto, LabColor, RgbColor } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { rgbToLab } from './photoAnalyzer';

export interface EmojiPreset {
  id: string;
  name: string;
  category: string;
  emojis: string[];
}

export const EMOJI_THEME_PRESETS: EmojiPreset[] = [
  {
    id: 'love',
    name: '❤️ Love & Romance',
    category: 'Romance',
    emojis: ['❤️', '💖', '💕', '💓', '💗', '💘', '💝', '🌹', '💍', '💌', '😍', '🥰', '💋', '💐', '👰', '🤵', '🥂'],
  },
  {
    id: 'gold-luxury',
    name: '✨ Gold & Luxury',
    category: 'Luxury',
    emojis: ['👑', '💎', '🏆', '🌟', '💰', '⚜️', '🎖️', '🍾', '🪙', '✨', '🥂', '🎇', '⭐', '💫', '🥇', '💍'],
  },
  {
    id: 'celebration',
    name: '🥳 Birthday & Party',
    category: 'Party',
    emojis: ['🎂', '🎈', '🎉', '🎁', '🥳', '🍰', '🥂', '🎊', '🍭', '🧁', '🍿', '🍧', '🍾', '🍩', '🍫', '🎇'],
  },
  {
    id: 'nature',
    name: '🌸 Nature & Flowers',
    category: 'Nature',
    emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌿', '🍀', '🦋', '💐', '🌼', '🌴', '🌈', '🌾', '🍁', '🍃', '🌱'],
  },
  {
    id: 'vibes',
    name: '🔥 Neon & Vibes',
    category: 'Vibes',
    emojis: ['🔥', '⚡', '🚀', '🌈', '🦄', '👾', '💫', '🔮', '🛸', '🎯', '💯', '💥', '🕶️', '🎸', '🕹️', '🏆'],
  },
  {
    id: 'animals',
    name: '🐱 Cute Animals',
    category: 'Animals',
    emojis: ['🐱', '🐶', '🐼', '🐰', '🦊', '🐻', '🐨', '🦁', '🐯', '🦄', '🐧', '🦉', '🦋', '🐬', '🐙', '🐢'],
  },
  {
    id: 'food',
    name: '🍔 Food & Treats',
    category: 'Food',
    emojis: ['🍕', '🍔', '🍩', '🍦', '🍓', '🍫', '🍹', '🍿', '🧁', '🍉', '🥑', '🥞', '🍣', '🍟', '🍒', '🍪'],
  },
  {
    id: 'rainbow',
    name: '🌈 Spectrum Palette',
    category: 'Colors',
    emojis: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍'],
  },
  {
    id: 'wedding',
    name: '💍 Wedding & Rings',
    category: 'Romance',
    emojis: ['💍', '👰', '🤵', '💒', '🥂', '🕊️', '💐', '🌹', '❤️', '🍾', '🍰', '✨', '👑', '💎', '💌', '🕊️'],
  },
  {
    id: 'baby',
    name: '🍼 Baby & Kids',
    category: 'Kids',
    emojis: ['🍼', '👶', '🧸', '🐣', '🎈', '🍭', '🧁', '⭐', '🦄', '🌸', '🎀', '🐥', '🍬', '🎠', '🍼'],
  },
];

// Helper to extract individual emoji characters from any text string (supporting composite emojis like 👨‍👩‍👧)
export function parseEmojisFromString(input: string): string[] {
  // Regex to match unicode emojis
  const emojiRegex = /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;
  const matches = input.match(emojiRegex);
  if (!matches || matches.length === 0) {
    return [];
  }
  // Unique emojis
  return Array.from(new Set(matches));
}

// Render an individual emoji to a high-resolution canvas & compute its perceptual color
export function renderEmojiToCanvas(
  emoji: string,
  size = 128
): { dataUrl: string; rgb: RgbColor; lab: LabColor } {
  if (typeof document === 'undefined') {
    return {
      dataUrl: '',
      rgb: { r: 200, g: 169, b: 107 },
      lab: { l: 70, a: 5, b: 35 },
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      dataUrl: '',
      rgb: { r: 200, g: 169, b: 107 },
      lab: { l: 70, a: 5, b: 35 },
    };
  }

  // Draw crisp emoji centered
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(size * 0.78)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji", sans-serif`;
  ctx.fillText(emoji, size / 2, size / 2 + Math.round(size * 0.06));

  // Compute average RGB of visible pixels
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 30) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  const r = count > 0 ? Math.round(totalR / count) : 200;
  const g = count > 0 ? Math.round(totalG / count) : 169;
  const b = count > 0 ? Math.round(totalB / count) : 107;
  const rgb: RgbColor = { r, g, b };
  const lab = rgbToLab(rgb);
  const dataUrl = canvas.toDataURL('image/png');

  return { dataUrl, rgb, lab };
}

// Convert an array of emojis into AnalyzedMosaicPhoto and PhotoMetadata items
export function generateEmojiPhotos(emojis: string[]): {
  analyzedPhotos: AnalyzedMosaicPhoto[];
  photos: PhotoMetadata[];
} {
  const analyzedPhotos: AnalyzedMosaicPhoto[] = [];
  const photos: PhotoMetadata[] = [];

  const uniqueEmojis = Array.from(new Set(emojis.filter((e) => e && e.trim().length > 0)));

  for (let i = 0; i < uniqueEmojis.length; i++) {
    const emoji = uniqueEmojis[i];
    const { dataUrl, rgb, lab } = renderEmojiToCanvas(emoji, 128);
    const id = `emoji_${encodeURIComponent(emoji)}_${i}`;

    const metadata: PhotoMetadata = {
      id,
      projectId: 'emoji_project',
      name: `Emoji ${emoji}`,
      size: 1024,
      type: 'image/png',
      width: 128,
      height: 128,
      aspectRatio: 1,
      orientation: 'square',
      thumbnail: dataUrl,
      hash: `hash_${emoji}`,
      sharpness: 95,
      brightness: Math.round(lab.l),
      contrast: 80,
      facesDetected: 0,
      focalPoint: { x: 0.5, y: 0.5 },
      favorite: false,
      isDuplicateCandidate: false,
      isBlurry: false,
      usedCount: 0,
    };

    photos.push(metadata);

    analyzedPhotos.push({
      id,
      metadata,
      averageRgb: rgb,
      averageLab: lab,
      brightness: Math.round(lab.l),
      contrast: 80,
      dominantHue: Math.round(Math.atan2(lab.b, lab.a) * (180 / Math.PI)),
      isHeroCandidate: i === 0,
    });
  }

  return { analyzedPhotos, photos };
}
