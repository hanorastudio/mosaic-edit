'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MosaicProject } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { renderMosaicToCanvas } from '@/lib/mosaic/exportMosaic';
import { GLASS_EFFECT_PRESETS, GLASS_SHAPES, renderCanvas2DText } from '@/lib/mosaic/textStyles';
import {
  X,
  Download,
  Frame,
  Check,
  Sparkles,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  Upload,
} from 'lucide-react';

interface MosaicMockupModalProps {
  project: MosaicProject;
  photos: PhotoMetadata[];
  onClose: () => void;
}

type FrameStyle = 'gold' | 'black-matte' | 'natural-oak' | 'floating-acrylic' | 'canvas-wrap';
type RoomType = 'living-room' | 'gallery' | 'bedroom' | 'studio' | 'custom';

export const MosaicMockupModal: React.FC<MosaicMockupModalProps> = ({
  project,
  photos,
  onClose,
}) => {
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('gold');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('living-room');
  const [customRoomBg, setCustomRoomBg] = useState<string | null>(null);
  const [hasMatBoard, setHasMatBoard] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photosMap = useRef<Map<string, PhotoMetadata>>(new Map());
  useEffect(() => {
    const map = new Map<string, PhotoMetadata>();
    photos.forEach((p) => map.set(p.id, p));
    photosMap.current = map;
  }, [photos]);

  // Frame Configurations
  const frameStyles: Record<
    FrameStyle,
    {
      name: string;
      description: string;
      frameBorder: string;
      frameColor: string;
      bezelWidth: number;
    }
  > = {
    gold: {
      name: 'Royal Gold Ornate',
      description: 'Hand-leafed champagne gold metallic frame with bevel',
      frameBorder: 'border-[16px] border-[#C8A96B] ring-2 ring-[#E5C158]/70 shadow-[0_30px_70px_rgba(0,0,0,0.85)]',
      frameColor: '#C8A96B',
      bezelWidth: 16,
    },
    'black-matte': {
      name: 'Matte Gallery Black',
      description: 'Sleek architectural anodized aluminum frame',
      frameBorder: 'border-[14px] border-[#18181B] ring-1 ring-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.95)]',
      frameColor: '#18181B',
      bezelWidth: 14,
    },
    'natural-oak': {
      name: 'Scandinavian Oak',
      description: 'Solid warm natural oak grain with satin finish',
      frameBorder: 'border-[14px] border-[#9C784C] ring-1 ring-[#C2A074]/50 shadow-[0_25px_60px_rgba(0,0,0,0.8)]',
      frameColor: '#9C784C',
      bezelWidth: 14,
    },
    'floating-acrylic': {
      name: 'Floating Acrylic Glass',
      description: 'Frameless ultra-clear crystal acrylic with metal standoffs',
      frameBorder: 'border-[6px] border-white/30 ring-1 ring-white/50 shadow-[0_35px_80px_rgba(0,0,0,0.9)] backdrop-blur-md',
      frameColor: '#A0C4FF',
      bezelWidth: 6,
    },
    'canvas-wrap': {
      name: 'Gallery Canvas Wrap',
      description: 'Seamless continuous 1.5" wood-stretcher canvas wrap',
      frameBorder: 'border-[2px] border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.85)]',
      frameColor: '#FAF8F5',
      bezelWidth: 2,
    },
  };

  const currentFrame = frameStyles[selectedFrame];

  // Room Background Configurations
  const rooms: Record<
    RoomType,
    {
      name: string;
      wallBg: string;
      ambientLight: string;
      accentFurniture: string;
    }
  > = {
    'living-room': {
      name: 'Luxury Velvet Living Room',
      wallBg: 'linear-gradient(180deg, #1C1924 0%, #0E0D14 100%)',
      ambientLight: 'radial-gradient(ellipse at 50% 20%, rgba(245, 208, 169, 0.18) 0%, transparent 70%)',
      accentFurniture: '#17141E',
    },
    gallery: {
      name: 'Contemporary Art Gallery',
      wallBg: 'linear-gradient(180deg, #282932 0%, #131419 100%)',
      ambientLight: 'radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
      accentFurniture: '#1E1F26',
    },
    bedroom: {
      name: 'Master Suite Bedroom',
      wallBg: 'linear-gradient(180deg, #231B1E 0%, #100C0E 100%)',
      ambientLight: 'radial-gradient(ellipse at 50% 20%, rgba(255, 223, 186, 0.16) 0%, transparent 70%)',
      accentFurniture: '#1C1518',
    },
    studio: {
      name: 'Architect Studio & Bookshelf',
      wallBg: 'linear-gradient(180deg, #18202C 0%, #0B0E14 100%)',
      ambientLight: 'radial-gradient(ellipse at 50% 20%, rgba(176, 224, 230, 0.14) 0%, transparent 70%)',
      accentFurniture: '#121822',
    },
    custom: {
      name: 'Custom Room Wall Photo',
      wallBg: customRoomBg ? `url(${customRoomBg}) center/cover no-repeat` : 'linear-gradient(180deg, #1E1924 0%, #0E0D14 100%)',
      ambientLight: 'radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
      accentFurniture: '#17141E',
    },
  };

  const currentRoom = rooms[selectedRoom];
  const aspectRatio = project.settings.aspectRatio || 1;
  const overlay = project.settings.overlayText;

  // Handle Custom Room Background Upload
  const handleCustomRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomRoomBg(result);
        setSelectedRoom('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw Full Mosaic onto Interactive Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = Math.round(width / aspectRatio);
    canvas.width = width;
    canvas.height = height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Background
    if (project.settings.background.type === 'color') {
      ctx.fillStyle = project.settings.background.value;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0C0C0E';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw ALL Mosaic Tiles
    const tileGap = project.settings.tileGap || 0;
    const borderRadius = project.settings.borderRadius || 0;
    const isEmojiMosaic = project.settings.tileSourceMode === 'emojis';
    const outerTileOpacity =
      project.settings.outerTileOpacity !== undefined
        ? project.settings.outerTileOpacity
        : project.target.outerTileOpacity !== undefined
        ? project.target.outerTileOpacity
        : 1.0;
    const outerTileFilter =
      project.settings.outerTileFilter || project.target.outerTileFilter || 'none';

    for (const tile of project.tiles) {
      const tileX = (tile.x / 100) * width + tileGap;
      const tileY = (tile.y / 100) * height + tileGap;
      const tileW = Math.max(1, (tile.width / 100) * width - tileGap * 2);
      const tileH = Math.max(1, (tile.height / 100) * height - tileGap * 2);

      const isEmojiTile = tile.photoId.startsWith('emoji_') || isEmojiMosaic;
      const photo = photosMap.current.get(tile.photoId);
      const isSubjectTile = tile.isSubject !== false;

      ctx.save();

      if (!isSubjectTile && outerTileOpacity < 1.0) {
        ctx.globalAlpha = outerTileOpacity;
      }
      if (!isSubjectTile && outerTileFilter !== 'none') {
        if (outerTileFilter === 'monochrome') {
          ctx.filter = 'grayscale(100%)';
        } else if (outerTileFilter === 'soft-blur') {
          ctx.filter = 'blur(3px)';
        } else if (outerTileFilter === 'vignette-dim') {
          ctx.filter = 'brightness(0.60)';
        }
      }

      if (borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(tileX, tileY, tileW, tileH, borderRadius * (width / 1200));
        ctx.clip();
      }

      if (isEmojiTile) {
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
      } else if (photo && photo.thumbnail) {
        ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
        ctx.fillRect(tileX, tileY, tileW, tileH);

        const img = new Image();
        img.src = photo.thumbnail;
        if (img.complete) {
          ctx.drawImage(img, tileX, tileY, tileW, tileH);
        } else {
          img.onload = () => {
            ctx.save();
            if (borderRadius > 0) {
              ctx.beginPath();
              ctx.roundRect(tileX, tileY, tileW, tileH, borderRadius * (width / 1200));
              ctx.clip();
            }
            ctx.drawImage(img, tileX, tileY, tileW, tileH);
            ctx.restore();
          };
        }
      } else {
        ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
        ctx.fillRect(tileX, tileY, tileW, tileH);
      }

      // Apply photographic color tint ONLY for custom picture subject/tiles (zero tint for standard shapes)
      if (
        project.settings.colorTintBlend > 0 &&
        !isEmojiTile &&
        !isEmojiMosaic &&
        project.target.type === 'custom-image' &&
        tile.isSubject !== false
      ) {
        ctx.fillStyle = `rgba(${tile.targetRgb.r}, ${tile.targetRgb.g}, ${tile.targetRgb.b}, ${Math.min(0.70, project.settings.colorTintBlend * 0.95)})`;
        ctx.fillRect(tileX, tileY, tileW, tileH);
      }

      ctx.restore();
    }

    // 2.4 Photo Overlay for Custom Pictures (if not pure-mosaic)
    const isCustomImage = project.target.type === 'custom-image' && !!project.target.customImageUrl;
    const isPureMosaic = (project.settings.customImageBlendMode || project.target.customImageBlendMode) === 'pure-mosaic';

    if (isCustomImage && project.target.customImageUrl && project.settings.colorTintBlend > 0 && !isPureMosaic) {
      const targetImg = new Image();
      targetImg.src = project.target.customImageUrl;
      const blend = Math.min(0.65, project.settings.colorTintBlend * 0.85);
      const drawCustomOverlay = () => {
        ctx.save();
        ctx.globalAlpha = blend;
        const blendMode = project.settings.customImageBlendMode || project.target.customImageBlendMode || 'studio-hdr';
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
        const canvasAspect = width / height;
        let sX = 0, sY = 0, sW = targetImg.width, sH = targetImg.height;
        if (imgAspect > canvasAspect) {
          sW = targetImg.height * canvasAspect;
          sX = (targetImg.width - sW) / 2;
        } else {
          sH = targetImg.width / canvasAspect;
          sY = (targetImg.height - sH) / 2;
        }
        ctx.drawImage(targetImg, sX, sY, sW, sH, 0, 0, width, height);
        ctx.restore();
      };

      if (targetImg.complete) {
        drawCustomOverlay();
      } else {
        targetImg.onload = drawCustomOverlay;
      }
    }

    // 3. Draw Text Overlay & Glass Plaque
    if (overlay && overlay.position !== 'none' && (overlay.text || overlay.subtext)) {
      const fontSize = Math.round((overlay.fontSize || 24) * (width / 600));
      const isCursive = overlay.fontFamily?.includes('cursive');
      const mainFont = `bold ${fontSize}px ${overlay.fontFamily || 'Cinzel, serif'}`;
      const subFont = `italic ${Math.round(fontSize * 0.45)}px ${
        isCursive ? overlay.fontFamily : '"Cormorant Garamond", Georgia, serif'
      }`;

      const textX = ((overlay.x ?? 50) / 100) * width;
      const textY = ((overlay.y ?? 90) / 100) * height;

      // Measure dimensions
      ctx.save();
      ctx.font = mainFont;
      const mainW = ctx.measureText(overlay.text || '').width;
      let subW = 0;
      if (overlay.subtext) {
        ctx.font = subFont;
        subW = ctx.measureText(overlay.subtext).width;
      }
      ctx.restore();

      const textW = Math.max(mainW, subW);
      const hasSub = !!overlay.subtext;
      const totalH = hasSub ? fontSize * 1.55 : fontSize * 1.1;

      const padX = fontSize * 1.1;
      const padY = fontSize * 0.45;
      const cardW = textW + padX * 2;
      const cardH = totalH + padY * 2;
      const cardX = textX - cardW / 2;
      const cardY = textY - cardH / 2;

      const glassPreset =
        GLASS_EFFECT_PRESETS.find((p) => p.id === overlay.glassEffect) || GLASS_EFFECT_PRESETS[0];
      const isGlass = overlay.glassEffect && overlay.glassEffect !== 'none';
      const shape = GLASS_SHAPES.find((s) => s.id === overlay.glassShape) || GLASS_SHAPES[0];
      const radius = Math.min(cardH * shape.exportRadiusMultiplier, cardW * 0.5);
      const opacity = overlay.glassOpacity ?? 0.70;

      if (isGlass) {
        ctx.save();
        ctx.shadowColor = glassPreset.exportShadowColor;
        ctx.shadowBlur = Math.round((width / 1200) * glassPreset.exportShadowBlur);
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

        const borderWidth = Math.max(1, Math.round((width / 1200) * glassPreset.exportBorderWidth));
        if (borderWidth > 0 && glassPreset.exportBorder !== 'transparent') {
          ctx.strokeStyle = glassPreset.exportBorder;
          ctx.lineWidth = borderWidth;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Text Over Glass Plaque with Multi-Pass Contrast Isolation
      const titleY = hasSub ? textY - fontSize * 0.22 : textY;
      const textClarity = overlay.textClarity || 'ultra-pop';

      renderCanvas2DText(
        ctx,
        overlay.text || '',
        textX,
        titleY,
        mainFont,
        overlay.color || '#C8A96B',
        fontSize,
        textClarity
      );

      if (overlay.subtext) {
        const subY = textY + fontSize * 0.52;
        const subFontSize = Math.round(fontSize * 0.45);
        renderCanvas2DText(
          ctx,
          overlay.subtext,
          textX,
          subY,
          subFont,
          overlay.color || '#E5C158',
          subFontSize,
          textClarity === 'ultra-pop' ? 'deep-shadow' : textClarity
        );
      }
    }
  }, [project, aspectRatio, overlay]);

  // Master 4K High-Resolution Framed PNG Exporter
  const handleExportFramed = async (downloadMode: 'framed-only' | 'room-scene') => {
    setIsExporting(true);
    setExportProgress('Rendering 4K Ultra-HD photo tiles...');

    try {
      // 1. Render true 4K Mosaic Canvas (3200px) with original high-res photos
      const highResArtCanvas = await renderMosaicToCanvas(
        project,
        photosMap.current,
        3200,
        (prog) => setExportProgress(prog.status)
      );

      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (downloadMode === 'framed-only') {
        // High-Res Framed Output Canvas (3600px+)
        const baseArtW = 3200;
        const baseArtH = Math.round(baseArtW / aspectRatio);
        const matPadding = hasMatBoard ? 260 : 0;
        const frameThickness = selectedFrame === 'gold' ? 140 : 120;

        const totalW = baseArtW + (matPadding + frameThickness) * 2;
        const totalH = baseArtH + (matPadding + frameThickness) * 2;

        exportCanvas.width = totalW;
        exportCanvas.height = totalH;

        // 1. Draw Outer Luxury Frame
        if (selectedFrame === 'gold') {
          const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
          grad.addColorStop(0, '#F5D78E');
          grad.addColorStop(0.25, '#C8A96B');
          grad.addColorStop(0.5, '#8C6D37');
          grad.addColorStop(0.75, '#E5C158');
          grad.addColorStop(1, '#9C784C');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, totalW, totalH);

          // Deep metallic bevel grooves
          ctx.strokeStyle = 'rgba(255, 245, 220, 0.8)';
          ctx.lineWidth = 10;
          ctx.strokeRect(frameThickness / 2, frameThickness / 2, totalW - frameThickness, totalH - frameThickness);

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = 8;
          ctx.strokeRect(frameThickness - 8, frameThickness - 8, totalW - frameThickness * 2 + 16, totalH - frameThickness * 2 + 16);

        } else if (selectedFrame === 'black-matte') {
          ctx.fillStyle = '#141416';
          ctx.fillRect(0, 0, totalW, totalH);
          ctx.strokeStyle = '#2C2C32';
          ctx.lineWidth = 8;
          ctx.strokeRect(frameThickness / 2, frameThickness / 2, totalW - frameThickness, totalH - frameThickness);

        } else if (selectedFrame === 'natural-oak') {
          ctx.fillStyle = '#8C683C';
          ctx.fillRect(0, 0, totalW, totalH);
          ctx.strokeStyle = '#B58F5C';
          ctx.lineWidth = 10;
          ctx.strokeRect(frameThickness / 2, frameThickness / 2, totalW - frameThickness, totalH - frameThickness);

        } else if (selectedFrame === 'floating-acrylic') {
          ctx.fillStyle = '#101014';
          ctx.fillRect(0, 0, totalW, totalH);
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 18;
          ctx.strokeRect(16, 16, totalW - 32, totalH - 32);

        } else {
          // Canvas Wrap
          ctx.fillStyle = '#08080A';
          ctx.fillRect(0, 0, totalW, totalH);
        }

        // 2. Draw Museum Mat Board
        const matX = frameThickness;
        const matY = frameThickness;
        const matW = totalW - frameThickness * 2;
        const matH = totalH - frameThickness * 2;

        if (hasMatBoard) {
          ctx.fillStyle = '#FAF8F5';
          ctx.fillRect(matX, matY, matW, matH);

          // Deep Inner Bevel Cut Shadow for Mat Board
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 12;
          ctx.strokeRect(
            matX + matPadding - 6,
            matY + matPadding - 6,
            baseArtW + 12,
            baseArtH + 12
          );
        }

        // 3. Draw 4K Mosaic Artwork inside Frame
        const artX = frameThickness + matPadding;
        const artY = frameThickness + matPadding;
        ctx.drawImage(highResArtCanvas, artX, artY, baseArtW, baseArtH);

        // Download Trigger
        const link = document.createElement('a');
        link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4K_Framed_${selectedFrame}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();

      } else {
        // Full Room Scene Mockup Export (3840 x 2400 UHD)
        exportCanvas.width = 3840;
        exportCanvas.height = 2400;

        if (selectedRoom === 'custom' && customRoomBg) {
          const roomImg = new Image();
          roomImg.src = customRoomBg;
          await new Promise<void>((res) => {
            roomImg.onload = () => {
              ctx.drawImage(roomImg, 0, 0, 3840, 2400);
              res();
            };
            roomImg.onerror = () => res();
          });
        } else {
          // Draw Room Background
          const wallGrad = ctx.createLinearGradient(0, 0, 0, 2400);
          wallGrad.addColorStop(0, '#262232');
          wallGrad.addColorStop(1, '#0E0C14');
          ctx.fillStyle = wallGrad;
          ctx.fillRect(0, 0, 3840, 2400);

          // Ambient Spotlight
          const lightGrad = ctx.createRadialGradient(1920, 550, 80, 1920, 800, 1500);
          lightGrad.addColorStop(0, 'rgba(255, 235, 205, 0.28)');
          lightGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = lightGrad;
          ctx.fillRect(0, 0, 3840, 2400);
        }

        // Draw Framed Artwork with Wall Drop Shadow
        const frameW = 1400;
        const frameH = Math.round(frameW / aspectRatio);
        const frameX = (3840 - frameW) / 2;
        const frameY = 400;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 90;
        ctx.shadowOffsetY = 60;

        // Draw Frame Outer
        ctx.fillStyle = currentFrame.frameColor;
        ctx.fillRect(frameX, frameY, frameW, frameH);

        ctx.shadowColor = 'transparent';

        // Draw Mat + Inner Art
        const mPad = hasMatBoard ? 80 : 0;
        const fThick = 36;
        if (hasMatBoard) {
          ctx.fillStyle = '#FAF8F5';
          ctx.fillRect(frameX + fThick, frameY + fThick, frameW - fThick * 2, frameH - fThick * 2);
        }

        ctx.drawImage(
          highResArtCanvas,
          frameX + fThick + mPad,
          frameY + fThick + mPad,
          frameW - (fThick + mPad) * 2,
          frameH - (fThick + mPad) * 2
        );

        if (selectedRoom !== 'custom') {
          // Console Furniture Silhouette
          ctx.fillStyle = currentRoom.accentFurniture;
          ctx.fillRect(1150, 1950, 1540, 450);
        }

        const link = document.createElement('a');
        link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4K_Room_Mockup.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error('Framed export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92dvh] sm:h-[90vh] bg-[#141417] border border-[#C8A96B]/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-[#1A1A1E] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] shrink-0">
              <Frame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold font-heading text-white truncate">
                3D Wall Art & Interior Mockup
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400 hidden xs:block">
                Visualize and download in 4K Ultra-HD with luxury frames.
              </p>
            </div>
          </div>

          {/* Download Options in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportFramed('framed-only')}
              disabled={isExporting}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors shadow-lg touch-action-manipulation active:scale-95"
              title="Download high-resolution 4K framed artwork"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isExporting ? (exportProgress || 'Rendering...') : 'Download 4K Framed'}</span>
            </button>

            <button
              onClick={() => handleExportFramed('room-scene')}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222228] hover:bg-[#2C2C34] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors touch-action-manipulation"
              title="Download full 4K room interior scene"
            >
              <span>Room Scene</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 touch-action-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Body: Interactive Viewport + Frame/Room Selectors */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden custom-scrollbar">
          {/* 3D Interior Mockup Stage */}
          <div
            ref={containerRef}
            className="flex-1 min-h-[260px] sm:min-h-0 relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
            style={{
              background: currentRoom.wallBg,
            }}
          >
            {/* Ambient Ceiling Spotlight on Wall */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: currentRoom.ambientLight }}
            />

            {/* Framed Artwork Container with 100% COMPLETE Mosaic */}
            <div
              className={`relative transition-all duration-300 transform hover:scale-[1.01] max-w-[85vw] max-h-[38vh] sm:max-w-none sm:max-h-none ${currentFrame.frameBorder}`}
              style={{
                width: aspectRatio >= 1 ? '360px' : `${360 * aspectRatio}px`,
                height: aspectRatio >= 1 ? `${360 / aspectRatio}px` : '360px',
                backgroundColor: hasMatBoard ? '#FAF8F5' : '#141417',
                padding: hasMatBoard ? '22px' : '0px',
              }}
            >
              {/* Mat Board Bevel & Inner Canvas Container */}
              <div className="w-full h-full relative overflow-hidden rounded shadow-inner bg-black flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                />

                {/* Subtle Floating Acrylic Glass Reflection Glare */}
                {selectedFrame === 'floating-acrylic' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Interior Mid-Century Credenza / Shelf Silhouette */}
            {selectedRoom !== 'custom' && (
              <div
                className="w-64 sm:w-80 h-8 sm:h-10 mt-6 sm:mt-12 rounded-t-xl border-t border-white/10 shadow-2xl relative shrink-0"
                style={{ backgroundColor: currentRoom.accentFurniture }}
              >
                {/* Small Designer Plant / Lamp Accent Silhouette */}
                <div className="absolute -top-5 sm:-top-6 left-6 w-4 sm:w-5 h-5 sm:h-6 rounded-t-full bg-emerald-900/50 border border-emerald-500/20" />
                <div className="absolute -top-2.5 sm:-top-3 right-10 w-7 sm:w-8 h-2.5 sm:h-3 rounded bg-amber-900/40 border border-amber-600/20" />
              </div>
            )}

            {/* Floor Baseboard & Drop Shadow */}
            {selectedRoom !== 'custom' && (
              <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Right Controls Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#16161A] p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar pb-safe">
            {/* 1. Frame Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                Luxury Frame Style
              </label>
              <div className="space-y-1.5 sm:space-y-2">
                {(
                  [
                    { id: 'gold', name: 'Royal Gold Ornate', desc: 'Hand-leafed champagne gold', color: '#C8A96B' },
                    { id: 'black-matte', name: 'Matte Gallery Black', desc: 'Modern aluminum minimalist', color: '#18181B' },
                    { id: 'natural-oak', name: 'Scandinavian Oak', desc: 'Solid wood satin finish', color: '#9C784C' },
                    { id: 'floating-acrylic', name: 'Floating Acrylic Glass', desc: 'Frameless crystal sheen', color: '#7EA8F8' },
                    { id: 'canvas-wrap', name: 'Gallery Canvas Wrap', desc: '1.5" Stretched canvas wrap', color: '#FAF8F5' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition-all touch-action-manipulation active:scale-98 ${
                      selectedFrame === f.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold shadow-md'
                        : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{f.name}</div>
                        <div className="text-[10px] text-zinc-500">{f.desc}</div>
                      </div>
                    </div>
                    {selectedFrame === f.id && <Check className="w-4 h-4 text-[#C8A96B]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Room Environment Selector + Custom Room Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Room Interior
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-[#C8A96B] hover:underline flex items-center gap-1 touch-action-manipulation"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Wall Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomRoomUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'living-room', name: '🛋️ Living Room' },
                  { id: 'gallery', name: '🏛️ Art Gallery' },
                  { id: 'bedroom', name: '🛏️ Bedroom' },
                  { id: 'studio', name: '☕ Studio' },
                  ...(customRoomBg ? [{ id: 'custom', name: '📸 My Wall' }] : []),
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoom(r.id as any)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold transition-all touch-action-manipulation active:scale-95 ${
                      selectedRoom === r.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white'
                        : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Mat Board Toggle */}
            <label className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#141417] border border-[#2C2C34] text-xs cursor-pointer hover:border-white/20 touch-action-manipulation">
              <span className="font-semibold text-white">Museum Mat Board Border</span>
              <input
                type="checkbox"
                checked={hasMatBoard}
                onChange={(e) => setHasMatBoard(e.target.checked)}
                className="accent-[#C8A96B] w-4 h-4"
              />
            </label>

            {/* Direct Download Actions in Sidebar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#C8A96B]/10 border border-[#C8A96B]/30 space-y-2">
              <span className="text-xs font-bold text-[#E5C158] block">High-Resolution 4K Export</span>
              <button
                onClick={() => handleExportFramed('framed-only')}
                disabled={isExporting}
                className="w-full py-2.5 px-3 bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5 touch-action-manipulation active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? (exportProgress || 'Generating 4K PNG...') : 'Download 4K Framed PNG'}</span>
              </button>
              <button
                onClick={() => handleExportFramed('room-scene')}
                disabled={isExporting}
                className="w-full py-2 px-3 bg-[#1A1A1E] hover:bg-[#2C2C34] border border-white/15 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 touch-action-manipulation active:scale-95"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Download 4K Room Scene</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

