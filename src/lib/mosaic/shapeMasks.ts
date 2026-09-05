import { BuiltInShapeId, MosaicTargetConfig, RgbColor } from '@/types/mosaic';
import { extractContourLineart, boostRgbSaturation } from './contourLineart';

export interface MaskSampleResult {
  maskGrid: boolean[][]; // [row][col] is true if cell is inside the shape
  targetColors: RgbColor[][]; // [row][col] target RGB color for cell
  activeCellCount: number;
  isSubjectGrid?: boolean[][]; // [row][col] is true if cell belongs to subject/character
  lineartDataUrl?: string; // transparent PNG of crisp vector outlines
}

export const BUILT_IN_SHAPES: {
  id: BuiltInShapeId;
  name: string;
  category: 'basic' | 'special' | 'love' | 'celebration';
  iconSvg: string;
  drawShape: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}[] = [
  // 1. Heart
  {
    id: 'heart',
    name: 'Heart',
    category: 'love',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, h * 0.25);
      ctx.bezierCurveTo(w / 2, h * 0.1, w * 0.95, h * 0.1, w * 0.95, h * 0.45);
      ctx.bezierCurveTo(w * 0.95, h * 0.65, w * 0.7, h * 0.85, w / 2, h * 0.95);
      ctx.bezierCurveTo(w * 0.3, h * 0.85, w * 0.05, h * 0.65, w * 0.05, h * 0.45);
      ctx.bezierCurveTo(w * 0.05, h * 0.1, w / 2, h * 0.1, w / 2, h * 0.25);
      ctx.fill();
    },
  },

  // 2. Star
  {
    id: 'star',
    name: 'Star',
    category: 'basic',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.3 5.5,21 7,14 2,9.3 9,8.5"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 5;
      const outerRadius = Math.min(w, h) * 0.45;
      const innerRadius = outerRadius * 0.45;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    },
  },

  // 3. Circle
  {
    id: 'circle',
    name: 'Circle',
    category: 'basic',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    },
  },

  // 4. Crescent Moon
  {
    id: 'crescent',
    name: 'Crescent Moon',
    category: 'special',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-5.4-5.4c0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      const r = Math.min(w, h) * 0.42;
      ctx.arc(w * 0.45, h * 0.5, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.arc(w * 0.35, h * 0.5, r * 0.85, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();
    },
  },

  // 5. Crown
  {
    id: 'crown',
    name: 'Crown',
    category: 'celebration',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.75);
      ctx.lineTo(w * 0.1, h * 0.25);
      ctx.lineTo(w * 0.35, h * 0.45);
      ctx.lineTo(w * 0.5, h * 0.18);
      ctx.lineTo(w * 0.65, h * 0.45);
      ctx.lineTo(w * 0.9, h * 0.25);
      ctx.lineTo(w * 0.85, h * 0.75);
      ctx.lineTo(w * 0.15, h * 0.75);
      ctx.fill();

      // Crown base bar
      ctx.fillRect(w * 0.12, h * 0.78, w * 0.76, h * 0.08);
    },
  },

  // 6. Butterfly
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'special',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c-2-3-6-4-8-1-2 3-1 7 2 8 2 1 5-1 6-7zm0 0c2-3 6-4 8-1 2 3 1 7-2 8-2 1-5-1-6-7zM11 5h2v14h-2z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      // Left wings
      ctx.ellipse(w * 0.32, h * 0.38, w * 0.22, h * 0.26, -0.3, 0, Math.PI * 2);
      ctx.ellipse(w * 0.35, h * 0.68, w * 0.18, h * 0.2, 0.3, 0, Math.PI * 2);
      // Right wings
      ctx.ellipse(w * 0.68, h * 0.38, w * 0.22, h * 0.26, 0.3, 0, Math.PI * 2);
      ctx.ellipse(w * 0.65, h * 0.68, w * 0.18, h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillRect(w * 0.48, h * 0.2, w * 0.04, h * 0.65);
    },
  },

  // 7. Diamond
  {
    id: 'diamond',
    name: 'Diamond',
    category: 'basic',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 22,12 12,22 2,12"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      ctx.moveTo(w / 2, h * 0.08);
      ctx.lineTo(w * 0.92, h / 2);
      ctx.lineTo(w / 2, h * 0.92);
      ctx.lineTo(w * 0.08, h / 2);
      ctx.closePath();
      ctx.fill();
    },
  },

  // 8. Infinity
  {
    id: 'infinity',
    name: 'Infinity Love',
    category: 'love',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 11l-2.83-2.85c-.97-.97-2.33-1.53-3.77-1.53-2.93 0-5.4 2.47-5.4 5.38 0 2.91 2.47 5.38 5.4 5.38 1.44 0 2.8-.56 3.77-1.53L12 13l2.83 2.85c.97.97 2.33 1.53 3.77 1.53 2.93 0 5.4-2.47 5.4-5.38 0-2.91-2.47-5.38-5.4-5.38zm-13.2 8.38c-1.66 0-3-1.34-3-3s1.34-3 3-3c.83 0 1.58.34 2.12.88L9.64 12l-2.12 2.12c-.54.54-1.29.88-2.12.88zm13.2 0c-.83 0-1.58-.34-2.12-.88L14.36 12l2.12-2.12c.54-.54 1.29-.88 2.12-.88 1.66 0 3 1.34 3 3s-1.34 3-3 3z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.lineWidth = Math.min(w, h) * 0.22;
      ctx.beginPath();
      ctx.arc(w * 0.32, h / 2, Math.min(w, h) * 0.24, 0, Math.PI * 2);
      ctx.arc(w * 0.68, h / 2, Math.min(w, h) * 0.24, 0, Math.PI * 2);
      ctx.stroke();
    },
  },

  // 9. Wedding Rings
  {
    id: 'ring',
    name: 'Interlocking Rings',
    category: 'love',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm6-7c0-.34-.04-.67-.1-1H17l-1-2h4l-1 2h2.1c-.06.33-.1.66-.1 1 0 3.87-3.13 7-7 7-.34 0-.67-.04-1-.1C15.42 14.7 15 12.92 15 11z"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.lineWidth = Math.min(w, h) * 0.16;
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.52, Math.min(w, h) * 0.28, 0, Math.PI * 2);
      ctx.arc(w * 0.62, h * 0.52, Math.min(w, h) * 0.28, 0, Math.PI * 2);
      ctx.stroke();
    },
  },

  // 10. Couple Silhouette
  {
    id: 'couple-silhouette',
    name: 'Couple Silhouette',
    category: 'love',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5a3 3 0 100 6 3 3 0 000-6zm8 0a3 3 0 100 6 3 3 0 000-6zM3 19a5 5 0 0110 0v1H3v-1zm10 0a5 5 0 018 0v1h-8v-1z"/></svg>`,
    drawShape: (ctx, w, h) => {
      // Groom
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.28, w * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.38, h * 0.65, w * 0.18, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bride
      ctx.beginPath();
      ctx.arc(w * 0.62, h * 0.32, w * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.45);
      ctx.lineTo(w * 0.82, h * 0.95);
      ctx.lineTo(w * 0.48, h * 0.95);
      ctx.closePath();
      ctx.fill();
    },
  },

  // 11. Camera
  {
    id: 'camera',
    name: 'Camera',
    category: 'special',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 3a5 5 0 100 10 5 5 0 000-10z"/></svg>`,
    drawShape: (ctx, w, h) => {
      // Body
      ctx.beginPath();
      ctx.roundRect(w * 0.1, h * 0.28, w * 0.8, h * 0.55, 16);
      ctx.fill();
      // Flash / Top bump
      ctx.fillRect(w * 0.35, h * 0.18, w * 0.3, h * 0.12);
      // Lens cutout ring
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.55, w * 0.22, 0, Math.PI * 2);
      ctx.fill();
    },
  },

  // 12. Birthday Cake
  {
    id: 'cake',
    name: 'Birthday Cake',
    category: 'celebration',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1.5 1.5 0 011.5 1.5c0 .38-.15.73-.39.99L12 6l-1.11-1.51A1.492 1.492 0 0110.5 3.5C10.5 2.67 11.17 2 12 2zm7 8h-3V7h-2v3h-4V7H8v3H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2z"/></svg>`,
    drawShape: (ctx, w, h) => {
      // Cake tiers
      ctx.beginPath();
      ctx.roundRect(w * 0.15, h * 0.55, w * 0.7, h * 0.35, 8);
      ctx.roundRect(w * 0.28, h * 0.32, w * 0.44, h * 0.25, 6);
      ctx.fill();
      // Candles
      ctx.fillRect(w * 0.48, h * 0.18, w * 0.04, h * 0.14);
    },
  },

  // 13. Hexagon
  {
    id: 'hexagon',
    name: 'Hexagon',
    category: 'basic',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2"/></svg>`,
    drawShape: (ctx, w, h) => {
      ctx.beginPath();
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.46;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    },
  },

  // 14. Tree of Life
  {
    id: 'tree',
    name: 'Tree of Life',
    category: 'special',
    iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v5H7v2h10v-2h-2v-5c2-1 4-3 4-6 0-4-3-7-7-7z"/></svg>`,
    drawShape: (ctx, w, h) => {
      // Foliage canopy
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.38, w * 0.35, 0, Math.PI * 2);
      ctx.arc(w * 0.3, h * 0.45, w * 0.22, 0, Math.PI * 2);
      ctx.arc(w * 0.7, h * 0.45, w * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillRect(w * 0.44, h * 0.58, w * 0.12, h * 0.35);
    },
  },
];

// Generate 2D binary and color mask from Target Configuration
export async function generateTargetMask(
  config: MosaicTargetConfig,
  gridCols: number,
  gridRows: number
): Promise<MaskSampleResult> {
  const canvas = document.createElement('canvas');
  const baseDim = 1200;
  canvas.width = baseDim;
  canvas.height = Math.round((baseDim * gridRows) / gridCols);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D context failed for mask generator');

  // Fill black background (0 = outside)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw white shape (255 = inside mask)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFFFFF';

  let extractedLineartUrl: string | undefined = undefined;
  let customSubjectGrid: boolean[][] | undefined = undefined;

  if (config.type === 'shape' && config.shapeId) {
    const shapeDef = BUILT_IN_SHAPES.find((s) => s.id === config.shapeId) || BUILT_IN_SHAPES[0];
    shapeDef.drawShape(ctx, canvas.width, canvas.height);
  } else if (
    config.type === 'letter' ||
    config.type === 'name' ||
    config.type === 'word' ||
    config.type === 'number'
  ) {
    const rawText = config.targetText || (config.type === 'number' ? '25' : 'ANANYA');
    const text = rawText.trim() || (config.type === 'number' ? '25' : 'ANANYA');
    const font = config.fontFamily || 'Montserrat, sans-serif';
    const layout = config.textLayout || 'auto';

    // 1. Check Orientation (Horizontal vs Vertical Columns)
    const orientation = config.textOrientation || 'horizontal';

    if (orientation === 'vertical') {
      // Split into words for vertical columns
      const words = text.includes(' ') ? text.split(/\s+/) : [text];
      const maxCharsInCol = Math.max(...words.map((w) => w.length));

      const targetH = canvas.height * 0.90;
      const targetW = canvas.width * 0.88;

      const calcFontSizeByH = targetH / (maxCharsInCol * 1.14);
      const calcFontSizeByW = targetW / (words.length * 1.4);
      const finalFontSize = Math.max(65, Math.min(320, Math.floor(Math.min(calcFontSizeByH, calcFontSizeByW))));

      ctx.font = `900 ${finalFontSize}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Draw Gold & White Luminous Gradient
      const grad = ctx.createLinearGradient(0, canvas.height * 0.05, 0, canvas.height * 0.95);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, '#FAF0D7');
      grad.addColorStop(0.65, '#E5C158');
      grad.addColorStop(1, '#C8A96B');
      ctx.fillStyle = grad;
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(4, Math.round(finalFontSize * 0.035 * (config.strokeThickness || 1.2)));

      const colWidth = finalFontSize * 1.2;
      const colGap = finalFontSize * 0.45;
      const totalWidth = words.length * colWidth + (words.length - 1) * colGap;
      const startX = (canvas.width - totalWidth) / 2 + colWidth / 2;
      const charLineHeight = finalFontSize * 1.14;

      words.forEach((word, wIdx) => {
        const colCenterX = startX + wIdx * (colWidth + colGap);
        const chars = Array.from(word);
        const colTotalH = chars.length * charLineHeight;
        const colStartY = (canvas.height - colTotalH) / 2 + charLineHeight / 2;

        chars.forEach((ch, cIdx) => {
          const charY = colStartY + cIdx * charLineHeight;
          ctx.strokeText(ch, colCenterX, charY);
          ctx.fillText(ch, colCenterX, charY);
        });
      });

    } else {
      // Horizontal Orientation (Standard / Stacked / Emblem)
      let lines: string[] = [text];
      if (layout === 'stacked') {
        if (text.includes(' ')) {
          const words = text.split(/\s+/);
          const mid = Math.ceil(words.length / 2);
          lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
        } else if (text.length >= 6) {
          const half = Math.ceil(text.length / 2);
          lines = [text.slice(0, half), text.slice(half)];
        }
      } else if (layout === 'auto' && text.includes(' ') && text.length > 7) {
        const words = text.split(/\s+/);
        const mid = Math.ceil(words.length / 2);
        lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      }

      // Draw Emblem Plaque Background if requested
      if (layout === 'emblem-plaque') {
        const plaqueMargin = canvas.width * 0.08;
        const plaqueH = canvas.height * 0.75;
        const plaqueY = (canvas.height - plaqueH) / 2;

        ctx.save();
        const plaqueGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
        plaqueGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        plaqueGrad.addColorStop(0.5, 'rgba(240, 220, 170, 0.9)');
        plaqueGrad.addColorStop(1, 'rgba(200, 169, 107, 0.85)');
        ctx.fillStyle = plaqueGrad;

        // Rounded Plaque
        const rad = 40;
        ctx.beginPath();
        ctx.roundRect(plaqueMargin, plaqueY, canvas.width - plaqueMargin * 2, plaqueH, rad);
        ctx.fill();
        ctx.restore();
      }

      // Check Center Divider Emoji & Scale
      const hasCenterEmoji =
        lines.length === 2 &&
        config.centerDividerEmoji &&
        config.centerDividerEmoji !== 'none';
      const emojiScale = config.centerEmojiScale !== undefined ? config.centerEmojiScale : 0.70;

      // Compute Optimal Font Size with Character Tracking & Safe Canvas Margins
      const spacingRatio = layout === 'stacked' || lines.length > 1 ? 0.12 : 0.14;
      let bestFontSize = 1000;

      for (const line of lines) {
        const chars = Array.from(line);
        let testSize = 200;
        ctx.font = `900 ${testSize}px ${font}`;
        
        let testLineWidth = 0;
        for (const ch of chars) {
          testLineWidth += ctx.measureText(ch).width;
        }
        testLineWidth += (chars.length - 1) * (testSize * spacingRatio);

        // Maximize canvas coverage with safe 15% padding
        const targetW = canvas.width * (layout === 'emblem-plaque' ? 0.78 : 0.88);
        // When center emoji is present, scale font according to emoji scale
        const verticalUnits = hasCenterEmoji ? (2.0 + emojiScale + 0.40) : Math.max(1, lines.length * 1.15);
        const targetH = (canvas.height * (layout === 'emblem-plaque' ? 0.60 : 0.70)) / verticalUnits;

        const scaleW = targetW / Math.max(10, testLineWidth);
        const scaleH = targetH / testSize;
        const lineFontSize = Math.floor(testSize * Math.min(scaleW, scaleH));
        if (lineFontSize < bestFontSize) {
          bestFontSize = lineFontSize;
        }
      }

      const finalFontSize = Math.max(45, Math.min(480, bestFontSize));

      ctx.font = `900 ${finalFontSize}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Draw Gold & White Luminous Gradient for text fill
      const grad = ctx.createLinearGradient(
        canvas.width * 0.1,
        canvas.height * 0.1,
        canvas.width * 0.9,
        canvas.height * 0.9
      );
      if (layout === 'emblem-plaque') {
        grad.addColorStop(0, '#101014');
        grad.addColorStop(1, '#202028');
      } else {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.25, '#FAF0D7');
        grad.addColorStop(0.65, '#E5C158');
        grad.addColorStop(1, '#C8A96B');
      }
      ctx.fillStyle = grad;
      ctx.strokeStyle = grad;

      // Subtle edge outline for clean tile boundary alignment
      const strokeWidth = Math.max(4, Math.round(finalFontSize * 0.035 * (config.strokeThickness || 1.2)));
      ctx.lineWidth = strokeWidth;

      const letterSpacing = finalFontSize * spacingRatio;
      const lineHeight = finalFontSize * 1.15;

      if (hasCenterEmoji && lines.length === 2) {
        // Safe 3-tier vertical layout with guaranteed margins
        const emojiSize = Math.round(finalFontSize * emojiScale);
        const emojiGap = Math.round(finalFontSize * 0.20);

        const line1Y = canvas.height / 2 - emojiSize / 2 - emojiGap - finalFontSize / 2;
        const emojiY = canvas.height / 2;
        const line2Y = canvas.height / 2 + emojiSize / 2 + emojiGap + finalFontSize / 2;

        [lines[0], lines[1]].forEach((line, idx) => {
          const y = idx === 0 ? line1Y : line2Y;
          const chars = Array.from(line);
          const charWidths = chars.map((ch) => ctx.measureText(ch).width);
          const totalLineWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing;

          let curX = (canvas.width - totalLineWidth) / 2;
          for (let cIdx = 0; cIdx < chars.length; cIdx++) {
            const ch = chars[cIdx];
            const chW = charWidths[cIdx];
            const charCenterX = curX + chW / 2;

            ctx.strokeText(ch, charCenterX, y);
            ctx.fillText(ch, charCenterX, y);

            curX += chW + letterSpacing;
          }
        });

        // Center Divider Emoji is rendered as a clean standalone graphic overlay (not pixelated tiles)

      } else {
        // Standard multi-line layout
        const totalBlockH = lines.length * lineHeight;
        const startY = (canvas.height - totalBlockH) / 2 + lineHeight / 2;

        lines.forEach((line, idx) => {
          const y = startY + idx * lineHeight;
          const chars = Array.from(line);
          const charWidths = chars.map((ch) => ctx.measureText(ch).width);
          const totalLineWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing;

          let curX = (canvas.width - totalLineWidth) / 2;
          for (let cIdx = 0; cIdx < chars.length; cIdx++) {
            const ch = chars[cIdx];
            const chW = charWidths[cIdx];
            const charCenterX = curX + chW / 2;

            ctx.strokeText(ch, charCenterX, y);
            ctx.fillText(ch, charCenterX, y);

            curX += chW + letterSpacing;
          }
        });
      }
    }
  } else if (config.type === 'custom-image' && config.customImageUrl) {
    // Custom uploaded image / silhouette
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = config.customImageUrl!;
    });

    try {
      const lineartResult = await extractContourLineart(
        config.customImageUrl,
        canvas.width,
        canvas.height,
        {
          strokeThickness: config.contourStrokeThickness ?? 2.5,
          strokeColor: config.contourStrokeColor || 'black',
          autoSubjectIsolation: config.autoSubjectIsolation !== false,
          characterColorVibrancy: config.characterColorVibrancy ?? 1.45,
          gridCols,
          gridRows,
        }
      );
      extractedLineartUrl = lineartResult.lineartDataUrl;
      customSubjectGrid = lineartResult.isSubjectGrid;
    } catch (e) {
      console.error('Contour extraction failed:', e);
    }
  } else {
    // Fallback: Heart
    BUILT_IN_SHAPES[0].drawShape(ctx, canvas.width, canvas.height);
  }

  // Sample grid
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imgData;

  const cellW = width / gridCols;
  const cellH = height / gridRows;

  // Pass 1: Raw Sampling
  const rawR: number[][] = [];
  const rawG: number[][] = [];
  const rawB: number[][] = [];
  const rawLum: number[][] = [];
  const isInsideGrid: boolean[][] = [];
  const threshold = config.threshold || 50;

  for (let r = 0; r < gridRows; r++) {
    rawR[r] = [];
    rawG[r] = [];
    rawB[r] = [];
    rawLum[r] = [];
    isInsideGrid[r] = [];

    for (let c = 0; c < gridCols; c++) {
      let totalLum = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let samples = 0;

      for (let sy = 0.2; sy <= 0.8; sy += 0.3) {
        for (let sx = 0.2; sx <= 0.8; sx += 0.3) {
          const px = Math.min(width - 1, Math.floor((c + sx) * cellW));
          const py = Math.min(height - 1, Math.floor((r + sy) * cellH));
          const idx = (py * width + px) * 4;

          const rVal = data[idx];
          const gVal = data[idx + 1];
          const bVal = data[idx + 2];
          const alpha = data[idx + 3];

          const lum = alpha < 100 ? 0 : 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;
          totalLum += lum;
          sumR += rVal;
          sumG += gVal;
          sumB += bVal;
          samples++;
        }
      }

      const avgLum = totalLum / samples;
      let isInside = true;

      if (config.type === 'custom-image') {
        if (config.customImageMode === 'silhouette') {
          isInside = config.invertMask ? avgLum < threshold : avgLum > threshold;
        } else {
          isInside = totalLum > 5 || samples > 0;
        }
      } else {
        isInside = config.invertMask ? avgLum < threshold : avgLum > threshold;
      }

      rawR[r][c] = sumR / samples;
      rawG[r][c] = sumG / samples;
      rawB[r][c] = sumB / samples;
      rawLum[r][c] = avgLum;
      isInsideGrid[r][c] = isInside;
    }
  }

  // Pass 2: 2D Sobel Gradient Edge Energy for Auto-Subject & Contour Sharpness
  const edgeEnergy: number[][] = [];
  let totalEdgeEnergy = 0;

  for (let r = 0; r < gridRows; r++) {
    edgeEnergy[r] = [];
    for (let c = 0; c < gridCols; c++) {
      const cLeft = Math.max(0, c - 1);
      const cRight = Math.min(gridCols - 1, c + 1);
      const rUp = Math.max(0, r - 1);
      const rDown = Math.min(gridRows - 1, r + 1);

      const dx = rawLum[r][cRight] - rawLum[r][cLeft];
      const dy = rawLum[rDown][c] - rawLum[rUp][c];
      const mag = Math.hypot(dx, dy);
      edgeEnergy[r][c] = mag;
      totalEdgeEnergy += mag;
    }
  }

  const avgEdge = totalEdgeEnergy / (gridRows * gridCols);
  const edgeBoost = config.subjectEdgeBoost ?? 0.60;
  const bgMode = config.backgroundContrastMode || 'studio-high-key';
  const contrast = config.contrastBoost || 1.22;
  const vibrancy = config.characterColorVibrancy ?? 1.45;

  const maskGrid: boolean[][] = [];
  const targetColors: RgbColor[][] = [];
  const isSubjectGrid: boolean[][] = [];
  let activeCellCount = 0;

  const centerC = gridCols / 2;
  const centerR = gridRows / 2;
  const maxRadius = Math.hypot(centerC, centerR);

  for (let r = 0; r < gridRows; r++) {
    maskGrid[r] = [];
    targetColors[r] = [];
    isSubjectGrid[r] = [];

    for (let c = 0; c < gridCols; c++) {
      let rVal = rawR[r][c];
      let gVal = rawG[r][c];
      let bVal = rawB[r][c];
      const lum = rawLum[r][c];
      const edge = edgeEnergy[r][c];
      const isInside = isInsideGrid[r][c];
      const isSubject = customSubjectGrid ? customSubjectGrid[r][c] : isInside;

      // Auto Edge & Subject Contour Boost
      if (config.type === 'custom-image') {
        if (isSubject && vibrancy > 1.0) {
          const boosted = boostRgbSaturation(rVal, gVal, bVal, vibrancy);
          rVal = boosted.r;
          gVal = boosted.g;
          bVal = boosted.b;
        }

        if (edgeBoost > 0 && edge > avgEdge * 0.8) {
          // Sharp boundary edge (silhouette, face, hair, clothing contours)
          const edgeFactor = Math.min(1.0, (edge / (avgEdge * 2.5))) * edgeBoost;
          if (lum < 128) {
            // Deepen edge shadows for extreme silhouette definition
            rVal *= 1.0 - edgeFactor * 0.35;
            gVal *= 1.0 - edgeFactor * 0.35;
            bVal *= 1.0 - edgeFactor * 0.35;
          } else {
            // Brighten edge highlights
            rVal = Math.min(255, rVal * (1.0 + edgeFactor * 0.25));
            gVal = Math.min(255, gVal * (1.0 + edgeFactor * 0.25));
            bVal = Math.min(255, bVal * (1.0 + edgeFactor * 0.25));
          }
        }

        // Background Pop & High-Key Separation
        const distRatio = Math.hypot(c - centerC, r - centerR) / maxRadius;
        const isPeripheralBg = !isSubject || (edge < avgEdge * 0.75 && distRatio > 0.35);

        if (bgMode === 'studio-high-key' && isPeripheralBg) {
          // Soft gallery high-key lift (+18% brightness with clean light tone)
          rVal = Math.min(255, rVal * 1.15 + 18);
          gVal = Math.min(255, gVal * 1.15 + 18);
          bVal = Math.min(255, bVal * 1.15 + 18);
        } else if (bgMode === 'dramatic-dim' && isPeripheralBg) {
          // Dramatic spotlight vignette dim
          rVal *= 0.82;
          gVal *= 0.82;
          bVal *= 0.82;
        }
      }

      // S-curve depth and dynamic range contrast enhancement
      const enhance = (val: number) => {
        const norm = Math.max(0, Math.min(1, val / 255));
        const sCurve =
          norm < 0.5
            ? Math.pow(2 * norm, contrast) / 2
            : 1 - Math.pow(2 * (1 - norm), contrast) / 2;
        return Math.max(0, Math.min(255, Math.round(sCurve * 255)));
      };

      maskGrid[r][c] = isInside;
      isSubjectGrid[r][c] = isSubject;
      targetColors[r][c] = {
        r: enhance(rVal),
        g: enhance(gVal),
        b: enhance(bVal),
      };

      if (isInside) activeCellCount++;
    }
  }

  return {
    maskGrid,
    targetColors,
    activeCellCount,
    isSubjectGrid,
    lineartDataUrl: extractedLineartUrl,
  };
}
