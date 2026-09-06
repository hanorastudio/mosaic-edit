'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  MosaicProject,
  MosaicTargetConfig,
  MosaicSettings,
  MosaicTile,
  AnalyzedMosaicPhoto,
} from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import {
  getProjectById,
  saveProject,
  getPhotosByProjectId,
  savePhotosBatch,
  updatePhotoMetadata,
  deletePhoto,
  clearProjectPhotos,
} from '@/lib/db';
import { batchProcessPhotos } from '@/lib/engine/smartAnalysis';
import { analyzePhotosForMosaic } from '@/lib/mosaic/photoAnalyzer';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { generateEmojiPhotos } from '@/lib/mosaic/emojiTiles';

import { MosaicTopToolbar } from '@/components/mosaic/MosaicTopToolbar';
import { MosaicLeftSidebar } from '@/components/mosaic/MosaicLeftSidebar';
import { MosaicRightSidebar } from '@/components/mosaic/MosaicRightSidebar';
import { MosaicCanvasStage } from '@/components/mosaic/MosaicCanvasStage';
import { MosaicExportModal } from '@/components/mosaic/MosaicExportModal';
import { MosaicVariationsModal } from '@/components/mosaic/MosaicVariationsModal';
import { MosaicMockupModal } from '@/components/mosaic/MosaicMockupModal';
import { MosaicVideoModal } from '@/components/mosaic/MosaicVideoModal';
import {
  Loader2,
  Image as ImageIcon,
  Smile,
  Shapes,
  Type,
  Sliders,
  X,
  ChevronDown,
  Sparkles,
  Upload,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MosaicEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function MosaicEditorPage({ params }: MosaicEditorPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<MosaicProject | null>(null);
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedMosaicPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isVariationsOpen, setIsVariationsOpen] = useState<boolean>(false);
  const [isMockupOpen, setIsMockupOpen] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

  // Mobile Bottom Sheet State
  const [mobileSheet, setMobileSheet] = useState<string | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState<boolean>(false);
  const [sheetTouchStartY, setSheetTouchStartY] = useState<number | null>(null);

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    setSheetTouchStartY(e.touches[0].clientY);
  };

  const handleSheetTouchEnd = (e: React.TouchEvent) => {
    if (sheetTouchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - sheetTouchStartY;
    setSheetTouchStartY(null);

    // Upward swipe -> Expand to full view
    if (deltaY < -35) {
      setIsSheetExpanded(true);
    }
    // Downward swipe -> Collapse or close
    else if (deltaY > 45) {
      if (isSheetExpanded) {
        setIsSheetExpanded(false);
      } else {
        setMobileSheet(null);
      }
    }
  };

  // Undo / Redo History
  const [history, setHistory] = useState<MosaicProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize and load project
  useEffect(() => {
    async function loadMosaic() {
      setIsLoading(true);
      try {
        let loadedPhotos = await getPhotosByProjectId(projectId);

        if (loadedPhotos.length === 0) {
          const sample = await createSampleMosaicPhotoCollection(projectId, 120);
          await savePhotosBatch(sample.photos, sample.blobsMap);
          loadedPhotos = sample.photos;
        }

        const analyzed = await analyzePhotosForMosaic(loadedPhotos);
        setPhotos(loadedPhotos);
        setAnalyzedPhotos(analyzed);

        // 1. Check if an existing project is stored in IndexedDB
        const existing = await getProjectById(projectId);
        if (existing && (existing as any).target && (existing as any).settings) {
          const loadedMosaic = existing as unknown as MosaicProject;
          setProject(loadedMosaic);
          setHistory([loadedMosaic]);
          setHistoryIndex(0);
          setIsLoading(false);
          return;
        }

        // 2. Parse URL parameters for initial target type, text, or shape
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const paramType = urlParams?.get('type');
        const paramText = urlParams?.get('text');
        const paramShape = urlParams?.get('shape');

        let targetType: 'shape' | 'name' | 'letter' | 'number' | 'custom-image' = 'shape';
        if (paramType === 'name' || paramType === 'letter' || paramType === 'number' || paramType === 'custom-image') {
          targetType = paramType;
        } else if (paramText) {
          targetType = paramText.length === 1 ? 'letter' : isNaN(Number(paramText)) ? 'name' : 'number';
        }

        const isTextOrNumber = targetType === 'name' || targetType === 'letter' || targetType === 'number';
        const isCustom = targetType === 'custom-image';

        const defaultTarget: MosaicTargetConfig = {
          type: targetType,
          shapeId: (paramShape as any) || 'heart',
          targetText: paramText || (targetType === 'number' ? '25' : 'ANANYA'),
          customImageUrl: isCustom ? '/default-custom-pic.png' : undefined,
          customImageMode: isCustom ? 'full-color' : undefined,
          fontFamily: 'Montserrat, sans-serif',
          textOrientation: 'horizontal',
          centerDividerEmoji: 'none',
          centerEmojiScale: 0.70,
        };

        const defaultSettings: MosaicSettings = {
          density: isTextOrNumber ? 'ultra' : isCustom ? 'high' : 'medium',
          gridCols: isTextOrNumber ? 96 : isCustom ? 60 : 40,
          gridRows: isTextOrNumber ? 96 : isCustom ? 60 : 40,
          tileGap: 0,
          borderRadius: 2,
          gridLayout: 'perfect-aligned',
          colorMatchingMode: isCustom ? 'full-tonal' : 'color-match',
          colorTintBlend: isCustom ? 0.56 : 0.0,
          contrastBoost: isCustom ? 1.32 : 1.25,
          vibrancyBoost: isCustom ? 1.28 : 1.18,
          eyeCatchingPreset: isCustom ? 'romantic-glow' : undefined,
          subjectEdgeBoost: 0.60,
          backgroundContrastMode: 'studio-high-key',
          customImageBlendMode: 'studio-hdr',
          useAllPhotosOnce: true,
          allowSmartRepetition: true,
          heroScale: 2,
          background: { type: 'color', value: '#0C0C0E' },
          canvasPreset: '1:1',
          aspectRatio: 1,
          overlayText: isCustom
            ? {
                text: 'CUSTOM PICTURE ART',
                subtext: 'A Lifetime of Beautiful Memories • 2026',
                position: 'below',
                fontFamily: 'Cinzel, serif',
                color: '#C8A96B',
                fontSize: 24,
              }
            : {
                text: defaultTarget.targetText ? `${defaultTarget.targetText}` : 'BUNTY ❤️ BABLI',
                subtext: 'A Lifetime of Beautiful Memories • 2026',
                position: 'below',
                fontFamily: 'Cinzel, serif',
                color: '#C8A96B',
                fontSize: 24,
              },
        };

        const initialMosaic = await createPhotoMosaic(analyzed, defaultTarget, defaultSettings);
        initialMosaic.id = projectId;
        await saveProject(initialMosaic as any);

        setProject(initialMosaic);
        setHistory([initialMosaic]);
        setHistoryIndex(0);
      } catch (err) {
        console.error('Failed to load mosaic project:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMosaic();
  }, [projectId]);

  // Recalculate Mosaic
  const regenerate = useCallback(
    async (
      overrideTarget?: Partial<MosaicTargetConfig>,
      overrideSettings?: Partial<MosaicSettings>
    ) => {
      if (!project || analyzedPhotos.length === 0) return;
      setIsProcessing(true);

      try {
        const nextTarget = { ...project.target, ...overrideTarget };
        const nextSettings = { ...project.settings, ...overrideSettings };

        // Auto-upgrade density to 'ultra' for Names, Words, and Numbers to ensure sharp text contours
        const isTextOrNumber =
          nextTarget.type === 'name' ||
          nextTarget.type === 'letter' ||
          nextTarget.type === 'word' ||
          nextTarget.type === 'number';

        if (
          isTextOrNumber &&
          !overrideSettings?.density &&
          (nextSettings.density === 'low' || nextSettings.density === 'medium')
        ) {
          nextSettings.density = 'ultra';
        }

        // Auto-set balanced clarity & blend settings for Custom Pictures (Classic Translucent Overlay)
        if (nextTarget.type === 'custom-image' && nextTarget.customImageUrl) {
          if (!overrideSettings?.colorTintBlend && (!nextSettings.colorTintBlend || nextSettings.colorTintBlend < 0.20)) {
            nextSettings.colorTintBlend = 0.45;
          }
          if (!nextSettings.customImageBlendMode) {
            nextSettings.customImageBlendMode = 'studio-hdr';
          }
        }

        const updatedMosaic = await createPhotoMosaic(analyzedPhotos, nextTarget, nextSettings);
        updatedMosaic.id = projectId;
        updatedMosaic.name = project.name;

        setProject(updatedMosaic);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), updatedMosaic]);
        setHistoryIndex((prev) => prev + 1);
      } catch (err) {
        console.error('Regeneration error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [project, analyzedPhotos, projectId, historyIndex]
  );

  // Undo & Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setProject(prev);
      setHistoryIndex((i) => i - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setProject(next);
      setHistoryIndex((i) => i + 1);
    }
  };

  // Photo uploads
  const handleUploadPhotos = async (files: File[], replaceExisting: boolean = false) => {
    try {
      setIsProcessing(true);
      const { photos: newPhotos, blobsMap } = await batchProcessPhotos(files, projectId);
      
      if (replaceExisting) {
        await clearProjectPhotos(projectId);
        await savePhotosBatch(newPhotos, blobsMap);
        const newlyAnalyzed = await analyzePhotosForMosaic(newPhotos);
        setPhotos(newPhotos);
        setAnalyzedPhotos(newlyAnalyzed);

        if (project) {
          const updated = await createPhotoMosaic(newlyAnalyzed, project.target, project.settings);
          updated.id = projectId;
          setProject(updated);
        }
      } else {
        await savePhotosBatch(newPhotos, blobsMap);
        const combinedPhotos = [...photos, ...newPhotos];
        const newlyAnalyzed = await analyzePhotosForMosaic(combinedPhotos);
        setPhotos(combinedPhotos);
        setAnalyzedPhotos(newlyAnalyzed);

        if (project) {
          const updated = await createPhotoMosaic(newlyAnalyzed, project.target, project.settings);
          updated.id = projectId;
          setProject(updated);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAllPhotos = async () => {
    try {
      setIsProcessing(true);
      await clearProjectPhotos(projectId);
      setPhotos([]);
      setAnalyzedPhotos([]);
      if (project) {
        setProject({
          ...project,
          tiles: [],
          metrics: {
            shapeAccuracy: 0,
            totalGridCells: 0,
            shapeActiveCells: 0,
            photosUsedCount: 0,
            totalPhotosAvailable: 0,
            colorMatchScore: 0,
            facePreservationScore: 0,
          },
        });
      }
    } catch (err) {
      console.error('Clear photos error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      const remainingPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(remainingPhotos);

      if (remainingPhotos.length > 0) {
        const remainingAnalyzed = await analyzePhotosForMosaic(remainingPhotos);
        setAnalyzedPhotos(remainingAnalyzed);
        if (project) {
          const updated = await createPhotoMosaic(remainingAnalyzed, project.target, project.settings);
          updated.id = projectId;
          setProject(updated);
        }
      } else {
        setAnalyzedPhotos([]);
        if (project) {
          setProject({ ...project, tiles: [] });
        }
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  const handleLoadSamplePhotos = async () => {
    try {
      setIsProcessing(true);
      const sample = await createSampleMosaicPhotoCollection(projectId, 100);
      await savePhotosBatch(sample.photos, sample.blobsMap);
      const combined = [...photos, ...sample.photos];
      const newlyAnalyzed = await analyzePhotosForMosaic(combined);

      setPhotos(combined);
      setAnalyzedPhotos(newlyAnalyzed);

      if (project) {
        const updated = await createPhotoMosaic(newlyAnalyzed, project.target, project.settings);
        updated.id = projectId;
        setProject(updated);
      }
    } catch (err) {
      console.error('Sample loading error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFavorite = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    const newFav = !photo.favorite;
    await updatePhotoMetadata(photoId, { favorite: newFav });
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, favorite: newFav } : p)));
    setAnalyzedPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, metadata: { ...p.metadata, favorite: newFav }, isHeroCandidate: newFav }
          : p
      )
    );
  };

  const handleReplaceTilePhoto = useCallback((tileId: string, newPhotoId: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const newPhoto = analyzedPhotos.find((p) => p.id === newPhotoId);
      if (!newPhoto) return prev;

      const newTiles = prev.tiles.map((t) => {
        if (t.id !== tileId) return t;
        return {
          ...t,
          photoId: newPhotoId,
          photoRgb: newPhoto.averageRgb,
        };
      });

      return { ...prev, tiles: newTiles };
    });
  }, [analyzedPhotos]);

  const handleSetHeroPhoto = useCallback((photoId: string) => {
    regenerate(undefined, { heroPhotoId: photoId });
  }, [regenerate]);

  const handleApplyEmojiMosaic = useCallback(async (emojis: string[]) => {
    try {
      setIsProcessing(true);
      const { analyzedPhotos: emojiAnalyzed, photos: emojiPhotos } = generateEmojiPhotos(emojis);

      setPhotos(emojiPhotos);
      setAnalyzedPhotos(emojiAnalyzed);

      if (project) {
        const nextSettings: MosaicSettings = {
          ...project.settings,
          tileSourceMode: 'emojis',
          selectedEmojis: emojis,
        };

        const updated = await createPhotoMosaic(emojiAnalyzed, project.target, nextSettings);
        updated.id = projectId;
        updated.name = project.name;
        setProject(updated);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), updated]);
        setHistoryIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Emoji mosaic error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [project, projectId, historyIndex]);

  const photosMap = useMemo(() => {
    const map = new Map<string, PhotoMetadata>();
    photos.forEach((p) => map.set(p.id, p));
    return map;
  }, [photos]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSaveProject = useCallback((projectToSave: MosaicProject) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveProject(projectToSave).catch(console.error);
    }, 400);
  }, []);

  const handleUpdateSettings = useCallback(
    (newSettings: Partial<MosaicSettings>) => {
      if (!project) return;

      const needsRegeneration =
        newSettings.gridLayout !== undefined ||
        newSettings.density !== undefined ||
        newSettings.colorMatchingMode !== undefined ||
        newSettings.photoFillStrategy !== undefined ||
        newSettings.canvasPreset !== undefined ||
        newSettings.aspectRatio !== undefined ||
        newSettings.subjectEdgeBoost !== undefined ||
        newSettings.backgroundContrastMode !== undefined ||
        newSettings.heroPhotoId !== undefined ||
        newSettings.customImageRenderMode !== undefined ||
        newSettings.contourStrokeEnabled !== undefined ||
        newSettings.contourStrokeThickness !== undefined ||
        newSettings.contourStrokeColor !== undefined ||
        newSettings.autoSubjectIsolation !== undefined ||
        newSettings.characterColorVibrancy !== undefined;

      if (needsRegeneration) {
        regenerate(undefined, newSettings);
      } else {
        setProject((prev) => {
          if (!prev) return prev;
          const updated: MosaicProject = {
            ...prev,
            settings: {
              ...prev.settings,
              ...newSettings,
            },
            updatedAt: Date.now(),
          };
          debouncedSaveProject(updated);
          return updated;
        });
      }
    },
    [project, regenerate, debouncedSaveProject]
  );

  const handleUpdateTarget = useCallback(
    (newTarget: Partial<MosaicTargetConfig>) => {
      if (!project) return;

      const needsRegeneration =
        (newTarget.type !== undefined && newTarget.type !== project.target.type) ||
        (newTarget.shapeId !== undefined && newTarget.shapeId !== project.target.shapeId) ||
        (newTarget.targetText !== undefined && newTarget.targetText !== project.target.targetText) ||
        (newTarget.customImageUrl !== undefined && newTarget.customImageUrl !== project.target.customImageUrl) ||
        (newTarget.fontFamily !== undefined && newTarget.fontFamily !== project.target.fontFamily) ||
        (newTarget.textLayout !== undefined && newTarget.textLayout !== project.target.textLayout) ||
        (newTarget.textOrientation !== undefined && newTarget.textOrientation !== project.target.textOrientation) ||
        (newTarget.strokeThickness !== undefined && newTarget.strokeThickness !== project.target.strokeThickness);

      if (needsRegeneration) {
        regenerate(newTarget, undefined);
      } else {
        setProject((prev) => {
          if (!prev) return prev;
          const updated: MosaicProject = {
            ...prev,
            target: {
              ...prev.target,
              ...newTarget,
            },
            updatedAt: Date.now(),
          };
          debouncedSaveProject(updated);
          return updated;
        });
      }
    },
    [project, regenerate, debouncedSaveProject]
  );

  if (isLoading || !project) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center bg-[#0C0C0E] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#C8A96B] mb-4" />
        <h2 className="text-base font-semibold font-heading">Synthesizing Photo Mosaic...</h2>
        <p className="text-xs text-zinc-400 mt-1">Analyzing color distributions & shapes</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden bg-[#0C0C0E]">
      {/* Top Navigation Toolbar */}
      <MosaicTopToolbar
        project={project}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        zoomLevel={zoomLevel}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={() => setZoomLevel((z) => Math.min(5.0, Number((z + 0.2).toFixed(2))))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.25, Number((z - 0.2).toFixed(2))))}
        onZoomFit={() => setZoomLevel(0.85)}
        onOpenVariations={() => setIsVariationsOpen(true)}
        onOpenMockup={() => setIsMockupOpen(true)}
        onOpenVideo={() => setIsVideoOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onUpdateProjectName={(name) => setProject({ ...project, name })}
      />

      {/* Main Studio Working Canvas & Sidebars */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left Sidebar (Desktop) */}
        <MosaicLeftSidebar
          photos={photos}
          target={project.target}
          settings={project.settings}
          tilesCount={project?.tiles?.length || 0}
          onUpdateTarget={handleUpdateTarget}
          onUpdateSettings={handleUpdateSettings}
          onUploadPhotos={handleUploadPhotos}
          onLoadSamplePhotos={handleLoadSamplePhotos}
          onToggleFavorite={handleToggleFavorite}
          onClearAllPhotos={handleClearAllPhotos}
          onDeletePhoto={handleDeletePhoto}
          onApplyEmojis={handleApplyEmojiMosaic}
        />

        {/* Center Deep-Zoom Interactive Canvas Stage */}
        <MosaicCanvasStage
          project={project}
          photosMap={photosMap}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onSelectTile={() => {}}
          onReplaceTilePhoto={handleReplaceTilePhoto}
          onSetHeroPhoto={handleSetHeroPhoto}
          onUpdateSettings={handleUpdateSettings}
          onUpdateTarget={handleUpdateTarget}
        />

        {/* Right Sidebar (Desktop) */}
        <MosaicRightSidebar
          settings={project.settings}
          metrics={project.metrics}
          photos={photos}
          onUpdateSettings={handleUpdateSettings}
          onRegenerateMosaic={() => regenerate(undefined, project.settings)}
        />
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <div className="lg:hidden h-16 min-h-[64px] bg-[#141417] border-t border-[#2C2C34] flex items-center justify-around px-1 sm:px-2 z-30 shrink-0 select-none pb-[env(safe-area-inset-bottom,0px)]">
        {[
          { id: 'photos', label: 'Photos', icon: ImageIcon, count: photos.length },
          { id: 'emojis', label: 'Emojis', icon: Smile },
          { id: 'custom', label: 'Custom Pic', icon: Upload },
          { id: 'shapes', label: 'Shapes', icon: Shapes },
          { id: 'letters', label: 'Names & Art', icon: Type },
          { id: 'settings', label: 'Settings', icon: Sliders },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = mobileSheet === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMobileSheet(mobileSheet === item.id ? null : item.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-[#C8A96B] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#C8A96B]' : 'text-zinc-400'}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-[#C8A96B] text-[8px] text-black font-bold font-mono">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Slide-Up Bottom Sheet Drawer (< 1024px) */}
      {mobileSheet && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => {
              setMobileSheet(null);
              setIsSheetExpanded(false);
            }}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden animate-in fade-in duration-150"
          />

          {/* Drawer Sheet */}
          <div
            className={`fixed inset-x-0 bottom-0 z-50 lg:hidden ${
              isSheetExpanded ? 'h-[95dvh] max-h-[95dvh]' : 'h-[78dvh] max-h-[78dvh]'
            } bg-[#18181E] border-t-2 border-[#C8A96B]/40 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-out transform-gpu will-change-transform animate-in slide-in-from-bottom`}
          >
            {/* Sheet Header */}
            <div
              onTouchStart={handleSheetTouchStart}
              onTouchEnd={handleSheetTouchEnd}
              className="px-4 py-3 bg-[#141417] border-b border-[#2C2C34] flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing select-none relative"
            >
              {/* Drag Handle in top center */}
              <div
                onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                className="w-12 h-1.5 bg-zinc-500 hover:bg-[#C8A96B] rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer transition-colors"
                title="Tap or swipe to toggle full view"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  {mobileSheet === 'settings'
                    ? '⚙️ Mosaic Settings'
                    : mobileSheet === 'photos'
                    ? '📸 Photo Collection'
                    : mobileSheet === 'custom'
                    ? '🖼️ Custom Picture'
                    : mobileSheet === 'emojis'
                    ? '😀 Emoji Studio'
                    : mobileSheet === 'shapes'
                    ? '🔷 Shape Art'
                    : mobileSheet === 'letters'
                    ? '🔤 Names & Words'
                    : '🎨 Customizer'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                  className="w-8 h-8 rounded-full bg-[#222228] hover:bg-[#2C2C34] text-zinc-300 hover:text-[#E5C158] flex items-center justify-center transition-colors"
                  title={isSheetExpanded ? 'Collapse' : 'Full Screen View'}
                >
                  {isSheetExpanded ? (
                    <Minimize2 className="w-4 h-4 text-[#C8A96B]" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setMobileSheet(null);
                    setIsSheetExpanded(false);
                  }}
                  className="w-8 h-8 rounded-full bg-[#222228] hover:bg-[#2C2C34] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                {mobileSheet === 'settings' ? (
                  <MosaicRightSidebar
                    settings={project.settings}
                    metrics={project.metrics}
                    photos={photos}
                    onUpdateSettings={handleUpdateSettings}
                    onRegenerateMosaic={() => {
                      regenerate(undefined, project.settings);
                    }}
                    isMobileSheet={true}
                  />
                ) : (
                  <MosaicLeftSidebar
                    photos={photos}
                    target={project.target}
                    settings={project.settings}
                    tilesCount={project?.tiles?.length || 0}
                    onUpdateTarget={handleUpdateTarget}
                    onUpdateSettings={handleUpdateSettings}
                    onUploadPhotos={handleUploadPhotos}
                    onLoadSamplePhotos={handleLoadSamplePhotos}
                    onToggleFavorite={handleToggleFavorite}
                    onClearAllPhotos={handleClearAllPhotos}
                    onDeletePhoto={handleDeletePhoto}
                    onApplyEmojis={handleApplyEmojiMosaic}
                    isMobileSheet={true}
                    mobileActiveTab={mobileSheet}
                    onSelectMobileTab={(tab) => setMobileSheet(tab)}
                    onExpandMobileSheet={() => setIsSheetExpanded(true)}
                    onCloseMobileSheet={() => {
                      setMobileSheet(null);
                      setIsSheetExpanded(false);
                    }}
                  />
                )}
              </div>

              {/* Sheet Quick Action Footer */}
              <div className="p-3 bg-[#141417] border-t border-[#2C2C34] flex items-center justify-between gap-3 shrink-0 pb-safe">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{project.tiles.length} tiles rendered</span>
                </div>

                <button
                  onClick={() => setMobileSheet(null)}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#C8A96B] to-[#E5C158] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Done & View Canvas</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isExportOpen && (
        <MosaicExportModal
          project={project}
          photos={photos}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isVariationsOpen && (
        <MosaicVariationsModal
          onApplyVariation={(newSettings) => regenerate(undefined, newSettings)}
          onClose={() => setIsVariationsOpen(false)}
        />
      )}

      {isMockupOpen && (
        <MosaicMockupModal
          project={project}
          photos={photos}
          onClose={() => setIsMockupOpen(false)}
        />
      )}

      {isVideoOpen && (
        <MosaicVideoModal
          project={project}
          photos={photos}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </div>
  );
}
