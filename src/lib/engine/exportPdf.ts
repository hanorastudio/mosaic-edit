import jsPDF from 'jspdf';
import { AlbumProject, PhotoMetadata, AlbumPage, AlbumElement } from '@/types/album';
import { getPhotoUrl } from '@/lib/db';
import { SYSTEM_DECORATIONS } from './templateLibrary';

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
  status: string;
  percent: number;
}

// Render a single album page onto an HTML Canvas at specified scale
export async function renderPageToCanvas(
  page: AlbumPage,
  project: AlbumProject,
  photosMap: Map<string, PhotoMetadata>,
  renderScale: number = 2 // 2x for High Quality / 3x for 300 DPI Print
): Promise<HTMLCanvasElement> {
  const baseW = project.dimensions.width;
  const baseH = project.dimensions.height;
  const canvasW = Math.round(baseW * renderScale);
  const canvasH = Math.round(baseH * renderScale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context creation failed');

  // Scale context
  ctx.scale(renderScale, renderScale);

  // 1. Draw Page Background
  const bg = page.background;
  if (bg.type === 'color') {
    ctx.fillStyle = bg.value;
    ctx.fillRect(0, 0, baseW, baseH);
  } else if (bg.type === 'gradient') {
    // Linear gradient simulation
    const grad = ctx.createLinearGradient(0, 0, baseW, baseH);
    if (bg.value.includes('#18191E') || bg.value.includes('#121214')) {
      grad.addColorStop(0, '#1A1A20');
      grad.addColorStop(1, '#0C0D0F');
    } else if (bg.value.includes('#FFFDF8') || bg.value.includes('#FFF3DC')) {
      grad.addColorStop(0, '#FFFDF8');
      grad.addColorStop(1, '#FFF3DC');
    } else if (bg.value.includes('#FFF5F5')) {
      grad.addColorStop(0, '#FFF5F5');
      grad.addColorStop(1, '#F5E6E8');
    } else {
      grad.addColorStop(0, '#FBF8F1');
      grad.addColorStop(1, '#EFE5D0');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, baseW, baseH);
  } else {
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, baseW, baseH);
  }

  // 2. Sort elements by zIndex
  const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  // Preload all photos for this page
  const imageCache = new Map<string, HTMLImageElement>();
  for (const elem of sortedElements) {
    if (elem.type === 'photo' && elem.photoId) {
      const photoMeta = photosMap.get(elem.photoId);
      const url = await getPhotoUrl(elem.photoId);
      if (url) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            imageCache.set(elem.photoId!, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        });
      }
    }
  }

  // 3. Render Each Element
  for (const elem of sortedElements) {
    ctx.save();
    const elemX = (elem.x / 100) * baseW;
    const elemY = (elem.y / 100) * baseH;
    const elemW = (elem.width / 100) * baseW;
    const elemH = (elem.height / 100) * baseH;

    // Apply rotation if any
    if (elem.rotation) {
      ctx.translate(elemX + elemW / 2, elemY + elemH / 2);
      ctx.rotate((elem.rotation * Math.PI) / 180);
      ctx.translate(-(elemX + elemW / 2), -(elemY + elemH / 2));
    }

    ctx.globalAlpha = elem.opacity ?? 1;

    if (elem.type === 'photo') {
      const img = elem.photoId ? imageCache.get(elem.photoId) : undefined;
      const radius = elem.borderRadius || 0;

      // Draw rounded rectangle clip path
      ctx.beginPath();
      ctx.roundRect(elemX, elemY, elemW, elemH, radius);

      // Shadow if present
      if (elem.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;
      }

      if (img) {
        ctx.save();
        ctx.clip();

        // Calculate aspect ratio crop
        const imgAspect = img.width / img.height;
        const frameAspect = elemW / elemH;

        let srcX = 0;
        let srcY = 0;
        let srcW = img.width;
        let srcH = img.height;

        if (imgAspect > frameAspect) {
          srcW = img.height * frameAspect;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / frameAspect;
          srcY = (img.height - srcH) / 2;
        }

        // Apply crop offset if provided
        if (elem.crop) {
          srcX += (elem.crop.x / 100) * srcW;
          srcY += (elem.crop.y / 100) * srcH;
          srcX = Math.max(0, Math.min(img.width - srcW, srcX));
          srcY = Math.max(0, Math.min(img.height - srcH, srcY));
        }

        ctx.drawImage(img, srcX, srcY, srcW, srcH, elemX, elemY, elemW, elemH);
        ctx.restore();
      } else {
        // Placeholder box if image missing
        ctx.fillStyle = '#E2DCD5';
        ctx.fill();
      }

      // Draw border if defined
      if (elem.borderWidth && elem.borderWidth > 0 && elem.borderColor) {
        ctx.strokeStyle = elem.borderColor;
        ctx.lineWidth = elem.borderWidth;
        ctx.stroke();
      }
    } else if (elem.type === 'text' && elem.text) {
      ctx.fillStyle = elem.color || '#1A1A1A';
      const fontSize = (elem.fontSize || 14) * (baseW / 1000);
      const fontStyle = elem.italic ? 'italic ' : '';
      const fontWeight = elem.fontWeight || 'normal';
      const fontFamily = elem.fontFamily || 'Cinzel, serif';
      ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = elem.textAlign || 'center';
      ctx.textBaseline = 'middle';

      const textX =
        elem.textAlign === 'left'
          ? elemX
          : elem.textAlign === 'right'
          ? elemX + elemW
          : elemX + elemW / 2;
      const textY = elemY + elemH / 2;

      ctx.fillText(elem.text, textX, textY, elemW);
    } else if (elem.type === 'decoration' && elem.decorationType) {
      // Draw vector ornaments
      const decMeta = SYSTEM_DECORATIONS.find((d) => d.type === elem.decorationType);
      if (decMeta) {
        const svgImg = new Image();
        const svgBlob = new Blob([decMeta.svg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve) => {
          svgImg.onload = () => {
            ctx.drawImage(svgImg, elemX, elemY, elemW, elemH);
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          svgImg.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          svgImg.src = svgUrl;
        });
      }
    }

    ctx.restore();
  }

  return canvas;
}

export async function exportAlbumToPdf(
  project: AlbumProject,
  photosMap: Map<string, PhotoMetadata>,
  quality: 'print' | 'high' | 'standard' = 'high',
  onProgress?: (progress: PdfExportProgress) => void
): Promise<Blob> {
  const { physicalWidthInches, physicalHeightInches } = project.dimensions;
  const isLandscape = physicalWidthInches > physicalHeightInches;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Determine scale multiplier based on quality
  const renderScale = quality === 'print' ? 2.5 : quality === 'high' ? 1.8 : 1.2;
  const totalPages = project.pages.length;

  const doc = new jsPDF({
    orientation,
    unit: 'in',
    format: [physicalWidthInches, physicalHeightInches],
    compress: true,
  });

  for (let i = 0; i < totalPages; i++) {
    const page = project.pages[i];

    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages,
        status: `Rendering page ${i + 1} of ${totalPages}...`,
        percent: Math.round(((i + 1) / totalPages) * 90),
      });
    }

    const canvas = await renderPageToCanvas(page, project, photosMap, renderScale);
    const imgData = canvas.toDataURL('image/jpeg', quality === 'print' ? 0.95 : 0.88);

    if (i > 0) {
      doc.addPage([physicalWidthInches, physicalHeightInches], orientation);
    }

    doc.addImage(imgData, 'JPEG', 0, 0, physicalWidthInches, physicalHeightInches, undefined, 'FAST');

    // Microtask yield
    await new Promise((r) => setTimeout(r, 10));
  }

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'Finalizing PDF output...',
      percent: 98,
    });
  }

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
