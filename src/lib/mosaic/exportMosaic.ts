import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { MosaicProject } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { getPhotoUrl } from '@/lib/db';
import { renderEmojiToCanvas } from './emojiTiles';
import { GLASS_EFFECT_PRESETS, GLASS_SHAPES, renderCanvas2DText } from './textStyles';

export interface MosaicExportProgress {
  status: string;
  percent: number;
}

// Render the mosaic onto an Offscreen/HTML Canvas at high resolution
export async function renderMosaicToCanvas(
  project: MosaicProject,
  photosMap: Map<string, PhotoMetadata>,
  targetWidth: number = 3840, // 4K default
  onProgress?: (progress: MosaicExportProgress) => void
): Promise<HTMLCanvasElement> {
  const aspectRatio = project.settings.aspectRatio || 1;
  const canvasW = targetWidth;
  const canvasH = Math.round(targetWidth / aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D context unavailable for high-res export');

  // 1. Draw Background
  const bg = project.settings.background;
  if (bg.type === 'color') {
    ctx.fillStyle = bg.value;
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else if (bg.type === 'transparent') {
    ctx.clearRect(0, 0, canvasW, canvasH);
  } else if (bg.type === 'image' && bg.imageUrl) {
    try {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise<void>((res) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
          res();
        };
        bgImg.onerror = () => res();
        bgImg.src = bg.imageUrl!;
      });
    } catch {
      ctx.fillStyle = '#0C0C0E';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  } else {
    // Gradient / default
    const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    grad.addColorStop(0, '#1E1924');
    grad.addColorStop(0.5, '#0C0C0E');
    grad.addColorStop(1, '#14120E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // Preload unique images used in tiles
  const uniquePhotoIds = Array.from(new Set(project.tiles.map((t) => t.photoId)));
  const imageCache = new Map<string, HTMLImageElement>();
  const totalUnique = uniquePhotoIds.length;

  for (let i = 0; i < totalUnique; i++) {
    const pId = uniquePhotoIds[i];
    let url = await getPhotoUrl(pId);

    // Fallback to photosMap metadata (needed for emoji tiles and in-memory photos)
    if (!url) {
      const meta = photosMap.get(pId);
      if (meta && meta.thumbnail) {
        url = meta.thumbnail;
      }
    }

    // Direct emoji fallback generation
    if (!url && pId.startsWith('emoji_')) {
      try {
        const emojiChar = decodeURIComponent(pId.split('_')[1]);
        const { dataUrl } = renderEmojiToCanvas(emojiChar, 256);
        url = dataUrl;
      } catch {}
    }

    if (url) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache.set(pId, img);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url!;
      });
    }

    if (onProgress && i % 10 === 0) {
      onProgress({
        status: `Preloading high-res assets ${i + 1} of ${totalUnique}...`,
        percent: Math.round(((i + 1) / totalUnique) * 45),
      });
    }
  }

  // 2. Render Tiles
  const totalTiles = project.tiles.length;
  const tileGap = project.settings.tileGap || 0;
  const borderRadius = project.settings.borderRadius || 0;
  const tintBlend = project.settings.colorTintBlend || 0;
  const outerTileOpacity =
    project.settings.outerTileOpacity !== undefined
      ? project.settings.outerTileOpacity
      : project.target.outerTileOpacity !== undefined
      ? project.target.outerTileOpacity
      : 1.0;
  const outerTileFilter =
    project.settings.outerTileFilter || project.target.outerTileFilter || 'none';
  const isCustomImage =
    project.target.type === 'custom-image' && !!project.target.customImageUrl;

  for (let i = 0; i < totalTiles; i++) {
    const tile = project.tiles[i];
    const isEmojiTile = tile.photoId.startsWith('emoji_') || project.settings.tileSourceMode === 'emojis';
    const img = imageCache.get(tile.photoId);
    const isSubjectTile = tile.isSubject !== false;

    const tileX = (tile.x / 100) * canvasW + tileGap;
    const tileY = (tile.y / 100) * canvasH + tileGap;
    const tileW = Math.max(1, (tile.width / 100) * canvasW - tileGap * 2);
    const tileH = Math.max(1, (tile.height / 100) * canvasH - tileGap * 2);

    ctx.save();

    if (!isSubjectTile && outerTileOpacity < 1.0) {
      ctx.globalAlpha = outerTileOpacity;
    }
    if (!isSubjectTile && outerTileFilter !== 'none') {
      if (outerTileFilter === 'monochrome') {
        ctx.filter = 'grayscale(100%)';
      } else if (outerTileFilter === 'soft-blur') {
        ctx.filter = 'blur(4px)';
      } else if (outerTileFilter === 'vignette-dim') {
        ctx.filter = 'brightness(0.60)';
      }
    }

    if (borderRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(tileX, tileY, tileW, tileH, borderRadius * (canvasW / 1200));
      ctx.clip();
    }

    if (img) {
      // Object fit cover
      const imgAspect = img.width / img.height;
      const tileAspect = tileW / tileH;

      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (imgAspect > tileAspect) {
        srcW = img.height * tileAspect;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / tileAspect;
        srcY = (img.height - srcH) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, tileX, tileY, tileW, tileH);
    } else if (isEmojiTile) {
      // Crisp direct vector emoji rendering
      try {
        const emojiChar = decodeURIComponent(tile.photoId.split('_')[1] || '❤️');
        const fontSize = Math.round(tileH * 0.85);
        ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emojiChar, tileX + tileW / 2, tileY + tileH / 2 + tileH * 0.05);
      } catch {
        ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
        ctx.fillRect(tileX, tileY, tileW, tileH);
      }
    } else {
      ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
      ctx.fillRect(tileX, tileY, tileW, tileH);
    }

    // Apply photographic color tint blend ONLY for custom picture subject/tiles (zero tint for standard shapes)
    if (tintBlend > 0 && !isEmojiTile && isCustomImage && tile.isSubject !== false) {
      ctx.fillStyle = `rgba(${tile.targetRgb.r}, ${tile.targetRgb.g}, ${tile.targetRgb.b}, ${Math.min(0.70, tintBlend * 0.95)})`;
      ctx.fillRect(tileX, tileY, tileW, tileH);
    }

    ctx.restore();

    if (onProgress && i % 100 === 0) {
      onProgress({
        status: `Rendering mosaic tile ${i + 1} of ${totalTiles}...`,
        percent: Math.round(45 + ((i + 1) / totalTiles) * 45),
      });
    }
  }

  // 2.4 Photo Overlay for Custom Pictures (if not pure-mosaic)
  const isPureMosaic = (project.settings.customImageBlendMode || project.target.customImageBlendMode) === 'pure-mosaic';
  if (isCustomImage && project.target.customImageUrl && tintBlend > 0 && !isPureMosaic) {
    try {
      const targetImg = new Image();
      targetImg.crossOrigin = 'anonymous';
      await new Promise<void>((res) => {
        targetImg.onload = () => res();
        targetImg.onerror = () => res();
        targetImg.src = project.target.customImageUrl!;
      });

      ctx.save();
      ctx.globalAlpha = Math.min(0.65, tintBlend * 0.85);
      const blendMode =
        project.settings.customImageBlendMode ||
        project.target.customImageBlendMode ||
        'studio-hdr';
      const contrast = project.settings.contrastBoost ?? project.target.contrastBoost ?? 1.25;
      const vibrancy = project.settings.vibrancyBoost ?? project.target.characterColorVibrancy ?? 1.18;
      const brightness = project.settings.brightnessBoost ?? 1.02;

      if (blendMode === 'soft-light') {
        ctx.globalCompositeOperation = 'soft-light';
        ctx.filter = `contrast(${Math.max(1.0, contrast * 0.92)}) saturate(${vibrancy})`;
      } else if (blendMode === 'overlay') {
        ctx.globalCompositeOperation = 'overlay';
        ctx.filter = `contrast(${contrast}) saturate(${vibrancy})`;
      } else if (blendMode === 'multiply') {
        ctx.globalCompositeOperation = 'multiply';
      } else if (blendMode === 'luminosity') {
        ctx.globalCompositeOperation = 'luminosity';
      } else if (blendMode === 'studio-hdr') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = `contrast(${contrast}) saturate(${vibrancy}) brightness(${brightness})`;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = `contrast(${Math.max(1.0, contrast * 0.92)}) saturate(${vibrancy})`;
      }

      const imgAspect = targetImg.width / targetImg.height;
      const canvasAspect = canvasW / canvasH;
      let sX = 0;
      let sY = 0;
      let sW = targetImg.width;
      let sH = targetImg.height;

      if (imgAspect > canvasAspect) {
        sW = targetImg.height * canvasAspect;
        sX = (targetImg.width - sW) / 2;
      } else {
        sH = targetImg.width / canvasAspect;
        sY = (targetImg.height - sH) / 2;
      }

      ctx.drawImage(targetImg, sX, sY, sW, sH, 0, 0, canvasW, canvasH);
      ctx.restore();
    } catch (e) {
      console.error('Failed to overlay custom image on export canvas', e);
    }
  }

  // 2.8 Aesthetic Color Grading on Export Canvas
  if (project.settings.aestheticFilter && project.settings.aestheticFilter !== 'none') {
    const filter = project.settings.aestheticFilter;
    const intensity = project.settings.filterIntensity ?? 0.35;
    ctx.save();
    ctx.globalAlpha = intensity;

    if (filter === 'royal-gold') {
      ctx.globalCompositeOperation = 'color';
      const fGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      fGrad.addColorStop(0, 'rgba(217, 119, 6, 0.5)');
      fGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.4)');
      fGrad.addColorStop(1, 'rgba(252, 211, 77, 0.5)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (filter === 'golden-hour') {
      ctx.globalCompositeOperation = 'overlay';
      const fGrad = ctx.createLinearGradient(0, canvasH, 0, 0);
      fGrad.addColorStop(0, 'rgba(234, 88, 12, 0.6)');
      fGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      fGrad.addColorStop(1, 'rgba(253, 224, 71, 0.3)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (filter === 'rose-quartz') {
      ctx.globalCompositeOperation = 'color';
      const fGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      fGrad.addColorStop(0, 'rgba(244, 63, 94, 0.5)');
      fGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.4)');
      fGrad.addColorStop(1, 'rgba(254, 205, 211, 0.4)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
    ctx.restore();
  }

  // 3. Render Center Divider Emoji if active
  if (
    project.target.centerDividerEmoji &&
    project.target.centerDividerEmoji !== 'none'
  ) {
    const emojiSize = Math.round(
      canvasH * 0.16 * (project.target.centerEmojiScale || 0.70)
    );
    const posX = ((project.target.centerEmojiX ?? 50) / 100) * canvasW;
    const posY = ((project.target.centerEmojiY ?? 50) / 100) * canvasH;
    ctx.save();
    ctx.font = `${emojiSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = Math.round(emojiSize * 0.15);
    ctx.shadowOffsetY = Math.round(emojiSize * 0.05);
    ctx.fillText(project.target.centerDividerEmoji, posX, posY);
    ctx.restore();
  }

  // 4. Render Text Overlay and Glass Plaque if enabled
  if (
    project.settings.overlayText &&
    project.settings.overlayText.position !== 'none' &&
    (project.settings.overlayText.text || project.settings.overlayText.subtext)
  ) {
    const textCfg = project.settings.overlayText;
    const fontSize = Math.round(canvasW * 0.045 * (textCfg.fontSize / 24));
    const isCursive = textCfg.fontFamily?.includes('cursive');
    const mainFont = `bold ${fontSize}px ${textCfg.fontFamily || 'Cinzel, serif'}`;
    const subFont = `italic ${Math.round(fontSize * 0.45)}px ${
      isCursive ? textCfg.fontFamily : '"Cormorant Garamond", Georgia, serif'
    }`;

    let textX = canvasW / 2;
    let textY = canvasH * 0.90;

    if (textCfg.x !== undefined && textCfg.y !== undefined) {
      textX = (textCfg.x / 100) * canvasW;
      textY = (textCfg.y / 100) * canvasH;
    } else if (textCfg.position === 'above') {
      textY = canvasH * 0.08;
    } else if (textCfg.position === 'inside') {
      textY = canvasH * 0.5;
    }

    // Measure text dimensions for glass plaque
    ctx.save();
    ctx.font = mainFont;
    const mainMetrics = ctx.measureText(textCfg.text || '');
    let subMetricsWidth = 0;
    if (textCfg.subtext) {
      ctx.font = subFont;
      subMetricsWidth = ctx.measureText(textCfg.subtext).width;
    }
    ctx.restore();

    const textWidth = Math.max(mainMetrics.width, subMetricsWidth);
    const hasSub = !!textCfg.subtext;
    const totalTextHeight = hasSub ? fontSize * 1.55 : fontSize * 1.1;

    const padX = fontSize * 1.1;
    const padY = fontSize * 0.45;
    const cardW = textWidth + padX * 2;
    const cardH = totalTextHeight + padY * 2;
    const cardX = textX - cardW / 2;
    const cardY = textY - cardH / 2;

    const glassPreset =
      GLASS_EFFECT_PRESETS.find((p) => p.id === textCfg.glassEffect) || GLASS_EFFECT_PRESETS[0];
    const isGlass = textCfg.glassEffect && textCfg.glassEffect !== 'none';
    const shape = GLASS_SHAPES.find((s) => s.id === textCfg.glassShape) || GLASS_SHAPES[0];
    const radius = Math.min(cardH * shape.exportRadiusMultiplier, cardW * 0.5);
    const opacity = textCfg.glassOpacity ?? 0.70;

    if (isGlass) {
      ctx.save();
      ctx.shadowColor = glassPreset.exportShadowColor;
      ctx.shadowBlur = Math.round((canvasW / 1200) * glassPreset.exportShadowBlur);
      ctx.shadowOffsetY = Math.round(cardH * 0.08);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      } else {
        ctx.rect(cardX, cardY, cardW, cardH);
      }

      if (glassPreset.exportBg(opacity) !== 'transparent') {
        ctx.fillStyle = glassPreset.exportBg(opacity);
        ctx.fill();
      }

      const borderWidth = Math.max(1, Math.round((canvasW / 1200) * glassPreset.exportBorderWidth));
      if (borderWidth > 0 && glassPreset.exportBorder !== 'transparent') {
        ctx.strokeStyle = glassPreset.exportBorder;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw Text Over Glass Plaque with Multi-Pass Contrast Isolation
    const titleY = hasSub ? textY - fontSize * 0.22 : textY;
    const textClarity = textCfg.textClarity || 'ultra-pop';

    renderCanvas2DText(
      ctx,
      textCfg.text || '',
      textX,
      titleY,
      mainFont,
      textCfg.color || '#C8A96B',
      fontSize,
      textClarity
    );

    if (textCfg.subtext) {
      const subY = textY + fontSize * 0.52;
      const subFontSize = Math.round(fontSize * 0.45);
      renderCanvas2DText(
        ctx,
        textCfg.subtext,
        textX,
        subY,
        subFont,
        textCfg.color || '#E5C158',
        subFontSize,
        textClarity === 'ultra-pop' ? 'deep-shadow' : textClarity
      );
    }
  }

  if (onProgress) {
    onProgress({
      status: 'Finalizing canvas output...',
      percent: 98,
    });
  }

  return canvas;
}

// Export 300 DPI Print-Ready PDF
export async function exportMosaicToPdf(
  project: MosaicProject,
  photosMap: Map<string, PhotoMetadata>,
  onProgress?: (progress: MosaicExportProgress) => void
): Promise<Blob> {
  const isSquare = project.settings.aspectRatio === 1;
  const widthInches = isSquare ? 24 : 36;
  const heightInches = 24;

  const canvas = await renderMosaicToCanvas(project, photosMap, 4096, onProgress);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const doc = new jsPDF({
    orientation: widthInches > heightInches ? 'landscape' : 'portrait',
    unit: 'in',
    format: [widthInches, heightInches],
    compress: true,
  });

  doc.addImage(imgData, 'JPEG', 0, 0, widthInches, heightInches, undefined, 'FAST');
  return doc.output('blob');
}

// Export High-Res Image (PNG / JPEG)
export async function exportMosaicImage(
  project: MosaicProject,
  photosMap: Map<string, PhotoMetadata>,
  resolution: '2k' | '4k' | '8k',
  format: 'png' | 'jpeg',
  onProgress?: (progress: MosaicExportProgress) => void
): Promise<Blob> {
  const dim = resolution === '8k' ? 8192 : resolution === '4k' ? 4096 : 2048;
  const canvas = await renderMosaicToCanvas(project, photosMap, dim, onProgress);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      0.95
    );
  });
}
