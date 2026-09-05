'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlbumProject,
  PhotoMetadata,
  AlbumElement,
  TemplateDefinition,
  PageBackground,
  AlbumSize,
  AlbumOrientation,
  AutoDesignOptions,
  ElementCrop,
} from '@/types/album';
import {
  getProjectById,
  saveProject,
  getPhotosByProjectId,
  savePhotosBatch,
  updatePhotoMetadata,
} from '@/lib/db';
import { batchProcessPhotos } from '@/lib/engine/smartAnalysis';
import { autoDesignAlbum } from '@/lib/engine/autoDesigner';
import { createSamplePhotoCollection } from '@/lib/db/sampleData';
import { generateId } from '@/lib/utils';

import { TopToolbar } from '@/components/editor/TopToolbar';
import { LeftSidebar } from '@/components/editor/LeftSidebar';
import { RightSidebar } from '@/components/editor/RightSidebar';
import { CanvasStage } from '@/components/editor/CanvasStage';
import { AutoDesignModal } from '@/components/editor/AutoDesignModal';
import { RegenerateModal } from '@/components/editor/RegenerateModal';
import { CropModal } from '@/components/editor/CropModal';
import { DuplicatesModal } from '@/components/editor/DuplicatesModal';
import { ExportModal } from '@/components/editor/ExportModal';
import { FlipbookViewer } from '@/components/preview/FlipbookViewer';
import { Loader2 } from 'lucide-react';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<AlbumProject | null>(null);
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isSpreadView, setIsSpreadView] = useState<boolean>(false);
  const [showBleed, setShowBleed] = useState<boolean>(false);

  // Modals state
  const [isAutoDesignOpen, setIsAutoDesignOpen] = useState<boolean>(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState<boolean>(false);
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [isDuplicatesOpen, setIsDuplicatesOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<AlbumProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Load project and photos from IndexedDB
  useEffect(() => {
    async function loadProjectData() {
      setIsLoading(true);
      try {
        let proj = await getProjectById(projectId);
        let loadedPhotos = await getPhotosByProjectId(projectId);

        if (!proj) {
          // If fresh project, create standard default project
          const sampleResult = await createSamplePhotoCollection(projectId, 'wedding', 18);
          await savePhotosBatch(sampleResult.photos, sampleResult.blobsMap);
          loadedPhotos = sampleResult.photos;

          proj = autoDesignAlbum(sampleResult.photos, {
            category: 'wedding',
            style: 'royal-wedding',
            title: 'UMESH & SAKSHI',
            subtitle: 'Our Wedding Story',
            dateText: '2026',
            locationText: 'Udaipur Palace',
            size: '12x12',
            orientation: 'square',
            density: 'balanced',
            photosPerPage: 'auto',
            includeDecorations: true,
          });
          proj.id = projectId;
          await saveProject(proj);
        }

        setProject(proj);
        setPhotos(loadedPhotos);
        setHistory([proj]);
        setHistoryIndex(0);
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjectData();
  }, [projectId]);

  // Recalculate photo usage counts
  useEffect(() => {
    if (!project) return;
    const usageMap = new Map<string, number>();
    project.pages.forEach((page) => {
      page.elements.forEach((elem) => {
        if (elem.type === 'photo' && elem.photoId) {
          usageMap.set(elem.photoId, (usageMap.get(elem.photoId) || 0) + 1);
        }
      });
    });

    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        usedCount: usageMap.get(p.id) || 0,
      }))
    );
  }, [project]);

  // Push new state to history & save to IndexedDB
  const updateProjectState = useCallback(
    (newProject: AlbumProject, recordHistory = true) => {
      setProject(newProject);
      saveProject(newProject).catch((e) => console.error('Auto-save error:', e));

      if (recordHistory) {
        setHistory((prev) => {
          const nextHistory = prev.slice(0, historyIndex + 1);
          return [...nextHistory, newProject];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [historyIndex]
  );

  // Undo & Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevProject = history[prevIndex];
      setProject(prevProject);
      setHistoryIndex(prevIndex);
      saveProject(prevProject);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextProject = history[nextIndex];
      setProject(nextProject);
      setHistoryIndex(nextIndex);
      saveProject(nextProject);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && project) {
          e.preventDefault();
          handleDeleteElement();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedElementId && project) {
          e.preventDefault();
          handleDuplicateElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const photosMap = new Map<string, PhotoMetadata>();
  photos.forEach((p) => photosMap.set(p.id, p));

  // --- Element Manipulations ---
  const handleUpdateElement = (updates: Partial<AlbumElement>) => {
    if (!project || !selectedElementId) return;
    const curPage = project.pages[currentPageIndex];
    if (!curPage) return;

    const newPages = project.pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.map((elem) => {
          if (elem.id !== selectedElementId) return elem;
          return { ...elem, ...updates };
        }),
      };
    });

    updateProjectState({
      ...project,
      pages: newPages,
    });
  };

  const handleDeleteElement = () => {
    if (!project || !selectedElementId) return;
    const newPages = project.pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.filter((e) => e.id !== selectedElementId),
      };
    });

    setSelectedElementId(null);
    updateProjectState({ ...project, pages: newPages });
  };

  const handleDuplicateElement = () => {
    if (!project || !selectedElementId) return;
    const curPage = project.pages[currentPageIndex];
    const elem = curPage?.elements.find((e) => e.id === selectedElementId);
    if (!elem) return;

    const newElem: AlbumElement = {
      ...elem,
      id: generateId('elem'),
      x: Math.min(85, elem.x + 4),
      y: Math.min(85, elem.y + 4),
      zIndex: (elem.zIndex || 1) + 1,
    };

    const newPages = project.pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page;
      return {
        ...page,
        elements: [...page.elements, newElem],
      };
    });

    setSelectedElementId(newElem.id);
    updateProjectState({ ...project, pages: newPages });
  };

  const handleBringToFront = () => {
    if (!project || !selectedElementId) return;
    const curPage = project.pages[currentPageIndex];
    const maxZ = Math.max(1, ...curPage.elements.map((e) => e.zIndex || 1));
    handleUpdateElement({ zIndex: maxZ + 1 });
  };

  const handleSendToBack = () => {
    if (!project || !selectedElementId) return;
    handleUpdateElement({ zIndex: 0 });
  };

  const handleSwapPhoto = (elementId: string, newPhotoId: string) => {
    if (!project) return;
    const newPages = project.pages.map((page, idx) => {
      if (idx !== currentPageIndex) return page;
      return {
        ...page,
        elements: page.elements.map((elem) => {
          if (elem.id !== elementId) return elem;
          return {
            ...elem,
            photoId: newPhotoId,
            crop: undefined, // Reset crop for new photo
          };
        }),
      };
    });
    updateProjectState({ ...project, pages: newPages });
  };

  // --- Page Manipulations ---
  const handleAddPage = () => {
    if (!project) return;
    const newPageNumber = project.pages.length + 1;
    const newPage: AlbumProject['pages'][0] = {
      id: generateId('page'),
      pageNumber: newPageNumber,
      title: `Page ${newPageNumber}`,
      layoutType: 'custom',
      background: project.pages[0]?.background || { type: 'color', value: '#FAF8F5' },
      elements: [],
    };

    const newPages = [...project.pages, newPage];
    updateProjectState({ ...project, pages: newPages });
    setCurrentPageIndex(newPages.length - 1);
  };

  const handleDuplicatePage = (pageIdx: number) => {
    if (!project) return;
    const pageToDup = project.pages[pageIdx];
    if (!pageToDup) return;

    const dupPage = {
      ...pageToDup,
      id: generateId('page'),
      title: `${pageToDup.title || 'Page'} (Copy)`,
      pageNumber: pageIdx + 2,
      elements: pageToDup.elements.map((e) => ({ ...e, id: generateId('elem') })),
    };

    const newPages = [...project.pages];
    newPages.splice(pageIdx + 1, 0, dupPage);
    // Renumber
    newPages.forEach((p, i) => (p.pageNumber = i + 1));

    updateProjectState({ ...project, pages: newPages });
    setCurrentPageIndex(pageIdx + 1);
  };

  const handleDeletePage = (pageIdx: number) => {
    if (!project || project.pages.length <= 1) return;
    const newPages = project.pages.filter((_, i) => i !== pageIdx);
    newPages.forEach((p, i) => (p.pageNumber = i + 1));

    updateProjectState({ ...project, pages: newPages });
    setCurrentPageIndex(Math.max(0, Math.min(newPages.length - 1, pageIdx)));
  };

  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (!project || toIndex < 0 || toIndex >= project.pages.length) return;
    const newPages = [...project.pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);
    newPages.forEach((p, i) => (p.pageNumber = i + 1));

    updateProjectState({ ...project, pages: newPages });
    setCurrentPageIndex(toIndex);
  };

  const handleApplyTemplate = (template: TemplateDefinition) => {
    if (!project) return;
    // Map existing photos on page or unassigned photos to template slots
    const unusedPhotos = photos.filter((p) => p.usedCount === 0);
    const pool = unusedPhotos.length >= template.photoCount ? unusedPhotos : photos;

    let photoIdx = 0;
    const newElements: AlbumElement[] = template.elements.map((elem) => {
      const id = generateId('elem');
      if (elem.type === 'photo') {
        const assignedPhoto = pool[photoIdx % pool.length];
        photoIdx++;
        return {
          ...elem,
          id,
          photoId: assignedPhoto?.id,
          crop: assignedPhoto
            ? {
                x: (assignedPhoto.focalPoint.x - 0.5) * 30,
                y: (assignedPhoto.focalPoint.y - 0.5) * 30,
                scale: 1,
              }
            : undefined,
        };
      }
      return { ...elem, id };
    });

    const newPages = project.pages.map((p, idx) => {
      if (idx !== currentPageIndex) return p;
      return {
        ...p,
        layoutType: template.layoutType,
        background: template.defaultBackground,
        elements: newElements,
      };
    });

    updateProjectState({ ...project, pages: newPages });
  };

  const handleApplyBackground = (bg: PageBackground, applyToAll: boolean) => {
    if (!project) return;
    const newPages = project.pages.map((p, idx) => {
      if (applyToAll || idx === currentPageIndex) {
        return { ...p, background: bg };
      }
      return p;
    });
    updateProjectState({ ...project, pages: newPages });
  };

  const handleAddDecoration = (element: AlbumElement) => {
    if (!project) return;
    const newPages = project.pages.map((p, idx) => {
      if (idx !== currentPageIndex) return p;
      return { ...p, elements: [...p.elements, element] };
    });
    setSelectedElementId(element.id);
    updateProjectState({ ...project, pages: newPages });
  };

  const handleAddTextElement = (element: AlbumElement) => {
    if (!project) return;
    const newPages = project.pages.map((p, idx) => {
      if (idx !== currentPageIndex) return p;
      return { ...p, elements: [...p.elements, element] };
    });
    setSelectedElementId(element.id);
    updateProjectState({ ...project, pages: newPages });
  };

  // --- Photo Upload & Sample Pack ---
  const handleUploadPhotos = async (files: File[]) => {
    if (!project) return;
    try {
      const { photos: newPhotos, blobsMap } = await batchProcessPhotos(files, project.id);
      await savePhotosBatch(newPhotos, blobsMap);
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error('Failed to upload photos:', err);
    }
  };

  const handleLoadSamplePhotos = async () => {
    if (!project) return;
    try {
      const sample = await createSamplePhotoCollection(
        project.id,
        project.category === 'karizma' ? 'karizma' : 'wedding',
        18
      );
      await savePhotosBatch(sample.photos, sample.blobsMap);
      setPhotos((prev) => [...prev, ...sample.photos]);
    } catch (err) {
      console.error('Failed to load sample photos:', err);
    }
  };

  const handleToggleFavorite = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    const newFav = !photo.favorite;
    await updatePhotoMetadata(photoId, { favorite: newFav });
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, favorite: newFav } : p))
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // --- Auto Design & Regenerate Execution ---
  const handleExecuteAutoDesign = async (options: AutoDesignOptions) => {
    if (photos.length === 0) return;
    const newProject = autoDesignAlbum(photos, options);
    newProject.id = projectId;
    updateProjectState(newProject);
    setCurrentPageIndex(0);
    setIsAutoDesignOpen(false);
  };

  const handleExecuteRegenerate = async (variation: string) => {
    if (!project || photos.length === 0) return;
    const options: AutoDesignOptions = {
      category: project.category,
      style: project.style,
      title: project.cover.title,
      subtitle: project.cover.subtitle,
      dateText: project.cover.dateText,
      locationText: project.cover.locationText,
      size: project.size,
      orientation: project.orientation,
      density: variation === 'more-photos' ? 'dense' : variation === 'fewer-photos' ? 'sparse' : 'balanced',
      photosPerPage: 'auto',
      includeDecorations: variation !== 'minimal',
      variationType: variation as any,
    };

    const newProject = autoDesignAlbum(photos, options);
    newProject.id = projectId;
    updateProjectState(newProject);
    setIsRegenerateOpen(false);
  };

  const handleSaveCrop = (crop: ElementCrop) => {
    if (!selectedElementId) return;
    handleUpdateElement({ crop });
    setIsCropOpen(false);
  };

  if (isLoading || !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#141417] text-white space-y-4">
        <Loader2 className="w-10 h-10 text-[#C8A96B] animate-spin" />
        <h3 className="text-base font-semibold font-heading">Loading Studio Workspace...</h3>
      </div>
    );
  }

  const selectedElement =
    project.pages[currentPageIndex]?.elements.find((e) => e.id === selectedElementId) || null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#121214]">
      {/* Top Studio Toolbar */}
      <TopToolbar
        project={project}
        currentPageIndex={currentPageIndex}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSpreadView={isSpreadView}
        zoomLevel={zoomLevel}
        showBleed={showBleed}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSelectPage={setCurrentPageIndex}
        onToggleSpreadView={() => setIsSpreadView(!isSpreadView)}
        onZoomIn={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
        onZoomFit={() => setZoomLevel(1.0)}
        onToggleBleed={() => setShowBleed(!showBleed)}
        onOpenAutoDesign={() => setIsAutoDesignOpen(true)}
        onOpenRegenerate={() => setIsRegenerateOpen(true)}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onUpdateProjectName={(name) => updateProjectState({ ...project, name })}
      />

      {/* Main Studio Working Canvas + Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer Panels */}
        <LeftSidebar
          project={project}
          photos={photos}
          photosMap={photosMap}
          currentPageIndex={currentPageIndex}
          onUploadPhotos={handleUploadPhotos}
          onLoadSamplePhotos={handleLoadSamplePhotos}
          onToggleFavorite={handleToggleFavorite}
          onDeletePhoto={handleDeletePhoto}
          onOpenDuplicatesModal={() => setIsDuplicatesOpen(true)}
          onDragStartPhoto={(e, id) => {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.setData('photoId', id);
          }}
          onSelectPage={setCurrentPageIndex}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onMovePage={handleMovePage}
          onApplyTemplate={handleApplyTemplate}
          onApplyBackground={handleApplyBackground}
          onAddDecoration={handleAddDecoration}
          onAddTextElement={handleAddTextElement}
          onChangeSize={(size, orientation) => updateProjectState({ ...project, size, orientation })}
          onToggleBleedGuide={() => setShowBleed(!showBleed)}
          onToggleGrid={() =>
            updateProjectState({
              ...project,
              settings: { ...project.settings, showGrid: !project.settings.showGrid },
            })
          }
          onToggleSnap={() =>
            updateProjectState({
              ...project,
              settings: { ...project.settings, snapToElements: !project.settings.snapToElements },
            })
          }
        />

        {/* Center Interactive Canvas Stage */}
        <CanvasStage
          project={project}
          currentPageIndex={currentPageIndex}
          selectedElementId={selectedElementId}
          photosMap={photosMap}
          zoomLevel={zoomLevel}
          isSpreadView={isSpreadView}
          showBleed={showBleed}
          onSelectElement={setSelectedElementId}
          onUpdateElement={(id, updates) => handleUpdateElement(updates)}
          onSwapPhoto={handleSwapPhoto}
          onOpenCropModal={() => setIsCropOpen(true)}
        />

        {/* Right Element Property Inspector */}
        <RightSidebar
          selectedElement={selectedElement}
          photosMap={photosMap}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onOpenCropModal={() => setIsCropOpen(true)}
        />
      </div>

      {/* MODALS */}
      {isAutoDesignOpen && (
        <AutoDesignModal
          photoCount={photos.length}
          initialCategory={project.category}
          onStartAutoDesign={handleExecuteAutoDesign}
          onClose={() => setIsAutoDesignOpen(false)}
        />
      )}

      {isRegenerateOpen && (
        <RegenerateModal
          onRegenerate={handleExecuteRegenerate}
          onClose={() => setIsRegenerateOpen(false)}
        />
      )}

      {isCropOpen && selectedElement && selectedElement.photoId && (
        <CropModal
          element={selectedElement}
          photo={photosMap.get(selectedElement.photoId)!}
          photoUrl={photosMap.get(selectedElement.photoId)?.thumbnail || ''}
          onSaveCrop={handleSaveCrop}
          onClose={() => setIsCropOpen(false)}
        />
      )}

      {isDuplicatesOpen && (
        <DuplicatesModal
          photos={photos}
          onToggleFavorite={handleToggleFavorite}
          onRemovePhoto={handleDeletePhoto}
          onClose={() => setIsDuplicatesOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          project={project}
          photos={photos}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isPreviewOpen && (
        <FlipbookViewer
          project={project}
          photosMap={photosMap}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
