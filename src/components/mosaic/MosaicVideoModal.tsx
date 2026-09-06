'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MosaicProject } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { getPhotoUrl } from '@/lib/db';
import { Muxer as Mp4Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';
import { GLASS_EFFECT_PRESETS, GLASS_SHAPES, renderCanvas2DText } from '@/lib/mosaic/textStyles';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Video,
  Download,
  Sparkles,
  Film,
  Layers,
  Flame,
  Check,
  Smartphone,
  Square,
  Monitor,
  CheckCircle2,
} from 'lucide-react';

interface MosaicVideoModalProps {
  project: MosaicProject;
  photos: PhotoMetadata[];
  onClose: () => void;
}

type AnimationMode = 'macro-micro-flight' | 'magnetic-snap' | 'golden-ripple';
type VideoRatio = '1:1' | '9:16' | '16:9';
type ExportFormat = 'mp4' | 'webm';

export const MosaicVideoModal: React.FC<MosaicVideoModalProps> = ({
  project,
  photos,
  onClose,
}) => {
  const [animMode, setAnimMode] = useState<AnimationMode>('macro-micro-flight');
  const [videoRatio, setVideoRatio] = useState<VideoRatio>('1:1');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('mp4');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0.0 to 1.0
  const [videoDuration, setVideoDuration] = useState<number>(6); // seconds
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const photosMap = useRef<Map<string, PhotoMetadata>>(new Map());
  const cachedImages = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const map = new Map<string, PhotoMetadata>();
    photos.forEach((p) => {
      map.set(p.id, p);

      if (!cachedImages.current.has(p.id)) {
        const img = new Image();
        img.src = p.thumbnail;
        cachedImages.current.set(p.id, img);

        // Fetch high-res original photo from local DB
        getPhotoUrl(p.id)
          .then((fullUrl) => {
            if (fullUrl && fullUrl !== p.thumbnail) {
              const highResImg = new Image();
              highResImg.onload = () => {
                cachedImages.current.set(p.id, highResImg);
              };
              highResImg.src = fullUrl;
            }
          })
          .catch(() => {});
      }
    });
    if (project.target.customImageUrl) {
      const customImg = new Image();
      customImg.src = project.target.customImageUrl;
      cachedImages.current.set('__custom_target_img__', customImg);
    }
    if (project.target.contourLineartUrl) {
      const lineImg = new Image();
      lineImg.src = project.target.contourLineartUrl;
      cachedImages.current.set('__contour_lineart_img__', lineImg);
    }

    photosMap.current = map;
  }, [photos, project.target.customImageUrl, project.target.contourLineartUrl]);

  const activeRatio = videoRatio === '9:16' ? 9 / 16 : videoRatio === '16:9' ? 16 / 9 : 1;
  const overlay = project.settings.overlayText;

  // Master frame rendering function (Used for both real-time player and offline direct video encoder)
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    mode: AnimationMode,
    duration: number = 6
  ) => {
    // 1. Background Fill
    ctx.fillStyle = project.settings.background.value || '#0C0C0E';
    ctx.fillRect(0, 0, width, height);

    // Ambient gold backlight
    const glowGrad = ctx.createRadialGradient(
      width / 2 + Math.sin(t * Math.PI * 2) * 60,
      height / 2 + Math.cos(t * Math.PI * 2) * 40,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    glowGrad.addColorStop(0, 'rgba(200, 169, 107, 0.15)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic formation ratio based on chosen duration:
    // 3s: 40% formation (1.2s snap, 1.8s solid showcase)
    // 6s: 65% formation (3.9s slow cinematic assembly, 2.1s solid showcase)
    // 10s: 72% formation (7.2s storytelling slow-motion assembly, 2.8s solid showcase)
    const formationRatio = duration === 3 ? 0.40 : duration === 6 ? 0.65 : 0.72;

    // Helper to draw tile content (handling vector emojis and photos crisply)
    const isEmojiMosaic = project.settings.tileSourceMode === 'emojis';
    const outerTileOpacity =
      project.settings.outerTileOpacity !== undefined
        ? project.settings.outerTileOpacity
        : project.target.outerTileOpacity !== undefined
        ? project.target.outerTileOpacity
        : 1.0;
    const outerTileFilter =
      project.settings.outerTileFilter || project.target.outerTileFilter || 'none';

    const drawTileContent = (
      tile: typeof project.tiles[0],
      x: number,
      y: number,
      w: number,
      h: number,
      glow: number = 0
    ) => {
      const isEmojiTile = tile.photoId.startsWith('emoji_') || isEmojiMosaic;
      const img = cachedImages.current.get(tile.photoId);
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

      if (isEmojiTile) {
        try {
          const emojiChar = decodeURIComponent(tile.photoId.split('_')[1] || '❤️');
          const fontSize = Math.round(h * 0.85);
          ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Twemoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(emojiChar, x + w / 2, y + h / 2 + h * 0.05);
        } catch {
          ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
          ctx.fillRect(x, y, w, h);
        }
      } else if (img && img.complete) {
        ctx.drawImage(img, x, y, w, h);
      } else {
        ctx.fillStyle = `rgb(${tile.photoRgb.r}, ${tile.photoRgb.g}, ${tile.photoRgb.b})`;
        ctx.fillRect(x, y, w, h);
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
        ctx.fillRect(x, y, w, h);
      }

      if (glow > 0) {
        ctx.fillStyle = `rgba(229, 193, 88, ${glow * 0.45})`;
        ctx.fillRect(x, y, w, h);
      }

      ctx.restore();
    };

    // 2. Render Animation Modes
    if (mode === 'macro-micro-flight') {
      const diveStart = 0.12;
      const diveEnd = formationRatio;
      let currentScale = 1.0;
      let focusX = width / 2;
      let focusY = height / 2;

      if (t < diveStart) {
        currentScale = 1.0;
      } else if (t >= diveStart && t < diveEnd) {
        const diveP = (t - diveStart) / (diveEnd - diveStart);
        const easeDive = Math.sin(diveP * Math.PI);
        currentScale = 1.0 + easeDive * 2.5;

        // Smooth camera panning
        focusX = width / 2 + Math.sin(diveP * Math.PI) * (width * 0.16);
        focusY = height / 2 + Math.cos(diveP * Math.PI) * (height * 0.12);
      } else {
        // Complete solid finale
        currentScale = 1.0;
        focusX = width / 2;
        focusY = height / 2;
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(currentScale, currentScale);
      ctx.translate(-focusX, -focusY);

      for (const tile of project.tiles) {
        const px = (tile.x / 100) * width;
        const py = (tile.y / 100) * height;
        const pw = (tile.width / 100) * width;
        const ph = (tile.height / 100) * height;

        drawTileContent(tile, px, py, pw, ph);
      }
      ctx.restore();

    } else if (mode === 'magnetic-snap') {
      // Formation gracefully matches duration (snaps in 1.2s for 3s, 3.9s for 6s, 7.2s for 10s)
      const snapProgress = Math.min(1.0, t / formationRatio);
      const easeSnap = snapProgress === 1.0 ? 1.0 : 1 - Math.pow(1 - snapProgress, duration === 3 ? 3.5 : 2.6);

      for (let i = 0; i < project.tiles.length; i++) {
        const tile = project.tiles[i];
        const targetX = (tile.x / 100) * width;
        const targetY = (tile.y / 100) * height;

        let curX = targetX;
        let curY = targetY;

        if (easeSnap < 1.0) {
          const angle = ((i * 47) % 360) * (Math.PI / 180);
          const scatterDist = (1 - easeSnap) * (140 + ((i * 29) % 220));
          curX = targetX + Math.cos(angle) * scatterDist;
          curY = targetY + Math.sin(angle) * scatterDist;
        }

        const pw = (tile.width / 100) * width;
        const ph = (tile.height / 100) * height;

        drawTileContent(tile, curX, curY, pw, ph);
      }

      // Shimmer wave across the assembled mosaic
      if (t >= formationRatio) {
        const shimmerP = (t - formationRatio) / (1 - formationRatio);
        const sweepX = shimmerP * width * 1.6 - width * 0.3;
        const shimGrad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, height);
        shimGrad.addColorStop(0, 'transparent');
        shimGrad.addColorStop(0.5, 'rgba(255, 235, 175, 0.22)');
        shimGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shimGrad;
        ctx.fillRect(0, 0, width, height);
      }

    } else if (mode === 'golden-ripple') {
      // Radiant champagne gold wave sweeping across the canvas continuously
      const waveRadius = t * (Math.hypot(width, height) * 1.3);

      for (const tile of project.tiles) {
        const px = (tile.x / 100) * width;
        const py = (tile.y / 100) * height;
        const pw = (tile.width / 100) * width;
        const ph = (tile.height / 100) * height;

        const distFromCenter = Math.hypot(px - width / 2, py - height / 2);
        const waveDist = Math.abs(distFromCenter - waveRadius);
        const glow = Math.max(0, 1 - waveDist / 150);

        drawTileContent(tile, px, py, pw, ph, glow);
      }
    }

    // 2.3 Classic Translucent Custom Target Image Overlay
    const isCustomImage = project.target.type === 'custom-image' && !!project.target.customImageUrl;
    const isPureMosaic = (project.settings.customImageBlendMode || project.target.customImageBlendMode) === 'pure-mosaic';

    if (isCustomImage && project.target.customImageUrl && project.settings.colorTintBlend > 0 && !isPureMosaic) {
      const targetImg = cachedImages.current.get('__custom_target_img__');
      const targetOpacity =
        mode === 'macro-micro-flight' && t > 0.12 && t < formationRatio
          ? project.settings.colorTintBlend * 0.20 // Reduce overlay while diving deep into micro photos
          : Math.min(0.65, project.settings.colorTintBlend * 0.85);

      if (targetImg && targetImg.complete && targetOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = targetOpacity;
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
      }
    }

    // 2.5. Draw Center Divider Emoji (Normal clean glossy icon)
    if (
      project.target.centerDividerEmoji &&
      project.target.centerDividerEmoji !== 'none'
    ) {
      const emojiSize = Math.round(
        height * 0.16 * (project.target.centerEmojiScale || 0.70)
      );
      const posX = ((project.target.centerEmojiX ?? 50) / 100) * width;
      const posY = ((project.target.centerEmojiY ?? 50) / 100) * height;
      ctx.save();
      ctx.font = `${emojiSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = Math.round(emojiSize * 0.15);
      ctx.shadowOffsetY = Math.round(emojiSize * 0.05);
      ctx.fillText(project.target.centerDividerEmoji, posX, posY);
      ctx.restore();
    }

    // 3. Draw Text Overlay & Glass Plaque (Solid on finale)
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
  };

  const progressRef = useRef<number>(0);

  // Real-time animation loop for preview (Frame-rate locked, no useEffect churn)
  useEffect(() => {
    let animRunning = true;
    let animId: number;
    startTimeRef.current = Date.now() - progressRef.current * videoDuration * 1000;

    const render = () => {
      if (!animRunning) return;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = videoRatio === '9:16' ? 1080 : videoRatio === '16:9' ? 1920 : 1080;
          const height = Math.round(width / activeRatio);
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          let t = 0;
          if (isPlaying) {
            const now = Date.now();
            const elapsed = (now - startTimeRef.current) / 1000;
            t = (elapsed % videoDuration) / videoDuration;
            progressRef.current = t;
            setProgress(t);
          } else {
            t = progressRef.current;
          }

          drawFrame(ctx, width, height, t, animMode, videoDuration);
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      animRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [animMode, videoRatio, isPlaying, videoDuration, activeRatio, overlay, project]);

  // Direct High-Speed Video Export Engine (Zero Screen Recording, Fast Offline Hardware Encoding)
  const handleDirectExportVideo = async () => {
    setIsRecording(true);
    setRecordProgress(0);

    // Direct High-Resolution Dimensions (1080p Full HD)
    const exportW = videoRatio === '9:16' ? 1080 : videoRatio === '16:9' ? 1920 : 1080;
    const exportH = Math.round(exportW / activeRatio);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;
    const exportCtx = exportCanvas.getContext('2d', { alpha: false });

    if (!exportCtx) {
      setIsRecording(false);
      return;
    }

    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = 'high';

    const fps = 60;
    const totalFrames = Math.round(fps * videoDuration);

    try {
      // Use Direct WebCodecs Hardware Video Encoder if supported (100x faster than screen recording)
      if (typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined') {
        if (exportFormat === 'mp4') {
          const target = new ArrayBufferTarget();
          const muxer = new Mp4Muxer({
            target,
            video: {
              codec: 'avc',
              width: exportW,
              height: exportH,
            },
            fastStart: 'in-memory',
          });

          const encoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: (e) => console.error('VideoEncoder error:', e),
          });

          encoder.configure({
            codec: 'avc1.4d002a', // H.264 Main Profile
            width: exportW,
            height: exportH,
            bitrate: 20_000_000, // 20 Mbps High Bitrate
          });

          // Direct frame-by-frame encoding loop
          for (let f = 0; f <= totalFrames; f++) {
            const t = Math.min(1.0, f / totalFrames);
            drawFrame(exportCtx, exportW, exportH, t, animMode, videoDuration);

            const videoFrame = new VideoFrame(exportCanvas, {
              timestamp: (f / fps) * 1_000_000, // in microseconds
              duration: (1 / fps) * 1_000_000,
            });

            encoder.encode(videoFrame, { keyFrame: f % 30 === 0 });
            videoFrame.close();

            if (f % 4 === 0) {
              setRecordProgress(Math.round((f / totalFrames) * 100));
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

          await encoder.flush();
          muxer.finalize();

          const blob = new Blob([target.buffer], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${videoDuration}s_${animMode}.mp4`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRecording(false);
          return;

        } else {
          // WebM Muxer
          const target = new WebmArrayBufferTarget();
          const muxer = new WebmMuxer({
            target,
            video: {
              codec: 'V_VP9',
              width: exportW,
              height: exportH,
              frameRate: fps,
            },
          });

          const encoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: (e) => console.error('VideoEncoder error:', e),
          });

          encoder.configure({
            codec: 'vp09.00.10.08',
            width: exportW,
            height: exportH,
            bitrate: 25_000_000,
          });

          for (let f = 0; f <= totalFrames; f++) {
            const t = Math.min(1.0, f / totalFrames);
            drawFrame(exportCtx, exportW, exportH, t, animMode, videoDuration);

            const videoFrame = new VideoFrame(exportCanvas, {
              timestamp: (f / fps) * 1_000_000,
              duration: (1 / fps) * 1_000_000,
            });

            encoder.encode(videoFrame, { keyFrame: f % 30 === 0 });
            videoFrame.close();

            if (f % 4 === 0) {
              setRecordProgress(Math.round((f / totalFrames) * 100));
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

          await encoder.flush();
          muxer.finalize();

          const blob = new Blob([target.buffer], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${videoDuration}s_${animMode}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRecording(false);
          return;
        }
      }

      // Universal Browser Fallback via MediaRecorder
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsRecording(false);
        return;
      }

      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 25000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setIsRecording(false);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${videoDuration}s_${animMode}.webm`;
        a.click();
      };

      progressRef.current = 0;
      setProgress(0);
      startTimeRef.current = Date.now();
      setIsPlaying(true);
      mediaRecorder.start(100);

      const durationMs = videoDuration * 1000;
      const startRecordTime = Date.now();

      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - startRecordTime;
        const pct = Math.min(100, (elapsed / durationMs) * 100);
        setRecordProgress(pct);

        if (elapsed >= durationMs) {
          clearInterval(progressTimer);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }
      }, 30);

    } catch (err) {
      console.error('Video Direct Export Error:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92dvh] sm:h-[90vh] bg-[#141417] border border-[#C8A96B]/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-[#1A1A1E] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] shrink-0">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold font-heading text-white truncate">
                Direct HD Video Export Studio
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400 hidden xs:block">
                Direct offline video encoder — renders crystal clear MP4 and WebM videos in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectExportVideo}
              disabled={isRecording}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors shadow-lg touch-action-manipulation active:scale-95"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>
                {isRecording ? `Encoding (${Math.round(recordProgress)}%)...` : `Direct Export ${exportFormat.toUpperCase()}`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 touch-action-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden custom-scrollbar">
          {/* Animated Video Canvas Stage */}
          <div className="flex-1 min-h-[260px] sm:min-h-0 bg-gradient-to-b from-[#16141D] to-[#0A090D] relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
            {/* Ambient Backlight Glow */}
            <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#C8A96B]/15 blur-[100px] pointer-events-none" />

            {/* Scaled Video Frame Container */}
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-[#C8A96B]/40 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-black flex items-center justify-center max-w-[85vw] max-h-[35vh] sm:max-w-none sm:max-h-none"
              style={{
                width: videoRatio === '9:16' ? '240px' : videoRatio === '16:9' ? '440px' : '340px',
                height: videoRatio === '9:16' ? '426px' : videoRatio === '16:9' ? '247px' : '340px',
              }}
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain block" />
            </div>

            {/* Video Player Floating Timeline Bar */}
            <div className="w-full max-w-[90vw] sm:max-w-md mt-3 sm:mt-6 p-2 sm:p-2.5 rounded-2xl bg-[#1A1A1E]/95 border border-white/15 flex items-center gap-2 sm:gap-3 backdrop-blur-md shadow-2xl z-20 shrink-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 sm:p-2 rounded-xl bg-[#C8A96B] text-black hover:bg-[#E5C158] transition-colors shrink-0 font-bold touch-action-manipulation"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  progressRef.current = 0;
                  setProgress(0);
                  startTimeRef.current = Date.now();
                  setIsPlaying(true);
                }}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 touch-action-manipulation"
                title="Restart Animation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={progress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  progressRef.current = val;
                  setProgress(val);
                  startTimeRef.current = Date.now() - val * videoDuration * 1000;
                }}
                className="flex-1 accent-[#C8A96B] cursor-pointer"
              />

              <span className="text-[10px] sm:text-[11px] font-mono text-[#E5C158] font-bold shrink-0">
                {(progress * videoDuration).toFixed(1)}s / {videoDuration}s
              </span>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#16161A] p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar pb-safe">
            {/* 1. Animation Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                Cinematic Animation Style
              </label>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  {
                    id: 'macro-micro-flight',
                    name: '🚀 Macro to Micro Flight',
                    desc: 'Smooth deep zoom down into memories with 4K finale',
                  },
                  {
                    id: 'magnetic-snap',
                    name: '🧲 Magnetic Memory Snap',
                    desc: 'Scattered memories magnetically snap into shape',
                  },
                  {
                    id: 'golden-ripple',
                    name: '🌊 Golden Radiance Ripple',
                    desc: 'Luminous light wave illuminates photo tiles',
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setAnimMode(mode.id as any);
                      progressRef.current = 0;
                      setProgress(0);
                      startTimeRef.current = Date.now();
                      setIsPlaying(true);
                    }}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition-all touch-action-manipulation active:scale-98 ${
                      animMode === mode.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold shadow-md'
                        : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-white">{mode.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{mode.desc}</div>
                    </div>
                    {animMode === mode.id && <Check className="w-4 h-4 text-[#C8A96B] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Export Format Selection (MP4 vs WebM) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mp4', name: 'MP4 Video', desc: 'Universal (H.264)' },
                  { id: 'webm', name: 'WebM Video', desc: 'Web (VP9)' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id as any)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all touch-action-manipulation active:scale-95 ${
                      exportFormat === fmt.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                        : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{fmt.name}</div>
                    <div className="text-[10px] text-zinc-500">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Video Aspect Ratio Format */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                Video Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', name: 'Square (1:1)', icon: Square },
                  { id: '9:16', name: 'Reel (9:16)', icon: Smartphone },
                  { id: '16:9', name: 'Cinema (16:9)', icon: Monitor },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setVideoRatio(r.id as any)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 text-xs transition-colors touch-action-manipulation active:scale-95 ${
                        videoRatio === r.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{r.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Video Duration & Pace */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                Duration & Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 3, label: '3s (Fast)' },
                  { sec: 6, label: '6s (Cinema)' },
                  { sec: 10, label: '10s (Story)' },
                ].map((d) => (
                  <button
                    key={d.sec}
                    onClick={() => {
                      setVideoDuration(d.sec);
                      progressRef.current = 0;
                      setProgress(0);
                      startTimeRef.current = Date.now();
                      setIsPlaying(true);
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center text-xs transition-colors touch-action-manipulation active:scale-95 ${
                      videoDuration === d.sec
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                        : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Export Action in Sidebar */}
            <button
              onClick={handleDirectExportVideo}
              disabled={isRecording}
              className="w-full py-3 bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 touch-action-manipulation active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>
                {isRecording ? `Encoding Video (${Math.round(recordProgress)}%)...` : `Direct Export ${exportFormat.toUpperCase()} Video`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

