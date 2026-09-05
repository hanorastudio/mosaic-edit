'use client';

import React, { useState } from 'react';
import {
  AlbumProject,
  PhotoMetadata,
  TemplateDefinition,
  PageBackground,
  AlbumElement,
  AlbumSize,
  AlbumOrientation,
} from '@/types/album';
import { PhotosPanel } from './PhotosPanel';
import { PagesPanel } from './PagesPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { BackgroundsPanel } from './BackgroundsPanel';
import { DecorationsPanel } from './DecorationsPanel';
import { TypographyPanel } from './TypographyPanel';
import { SettingsPanel } from './SettingsPanel';
import {
  Image as ImageIcon,
  BookOpen,
  LayoutGrid,
  Palette,
  Sparkles,
  Type,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface LeftSidebarProps {
  project: AlbumProject;
  photos: PhotoMetadata[];
  photosMap: Map<string, PhotoMetadata>;
  currentPageIndex: number;
  onUploadPhotos: (files: File[]) => void;
  onLoadSamplePhotos: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onOpenDuplicatesModal: () => void;
  onDragStartPhoto: (e: React.DragEvent, photoId: string) => void;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onApplyTemplate: (template: TemplateDefinition) => void;
  onApplyBackground: (bg: PageBackground, applyToAll: boolean) => void;
  onAddDecoration: (element: AlbumElement) => void;
  onAddTextElement: (element: AlbumElement) => void;
  onChangeSize: (size: AlbumSize, orientation: AlbumOrientation) => void;
  onToggleBleedGuide: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  project,
  photos,
  photosMap,
  currentPageIndex,
  onUploadPhotos,
  onLoadSamplePhotos,
  onToggleFavorite,
  onDeletePhoto,
  onOpenDuplicatesModal,
  onDragStartPhoto,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onApplyTemplate,
  onApplyBackground,
  onAddDecoration,
  onAddTextElement,
  onChangeSize,
  onToggleBleedGuide,
  onToggleGrid,
  onToggleSnap,
}) => {
  const [activeTab, setActiveTab] = useState<
    'photos' | 'pages' | 'templates' | 'backgrounds' | 'decorations' | 'text' | 'settings'
  >('photos');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const tabs = [
    { id: 'photos', label: 'Photos', icon: ImageIcon, count: photos.length },
    { id: 'pages', label: 'Pages', icon: BookOpen, count: project.pages.length },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'backgrounds', label: 'Backgrounds', icon: Palette },
    { id: 'decorations', label: 'Decorations', icon: Sparkles },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentPage = project.pages[currentPageIndex] || project.pages[0];

  return (
    <div className="flex h-full border-r border-[#2C2C34] bg-[#141417] relative select-none shrink-0 z-20">
      {/* Icon Navigation Bar (Left-most slim strip) */}
      <div className="w-16 flex flex-col items-center py-3 bg-[#121214] border-r border-[#222228] gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isCollapsed;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab === tab.id && !isCollapsed) {
                  setIsCollapsed(true);
                } else {
                  setActiveTab(tab.id as any);
                  setIsCollapsed(false);
                }
              }}
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

        {/* Collapse toggle at bottom */}
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

      {/* Expanded Tab Content Drawer */}
      {!isCollapsed && (
        <div className="w-80 h-full overflow-hidden bg-[#1A1A1E] flex flex-col animate-in fade-in duration-150">
          {activeTab === 'photos' && (
            <PhotosPanel
              photos={photos}
              onUploadPhotos={onUploadPhotos}
              onLoadSamplePhotos={onLoadSamplePhotos}
              onToggleFavorite={onToggleFavorite}
              onDeletePhoto={onDeletePhoto}
              onOpenDuplicatesModal={onOpenDuplicatesModal}
              onDragStartPhoto={onDragStartPhoto}
            />
          )}
          {activeTab === 'pages' && (
            <PagesPanel
              project={project}
              currentPageIndex={currentPageIndex}
              photosMap={photosMap}
              onSelectPage={onSelectPage}
              onAddPage={onAddPage}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
              onMovePage={onMovePage}
            />
          )}
          {activeTab === 'templates' && <TemplatesPanel onApplyTemplate={onApplyTemplate} />}
          {activeTab === 'backgrounds' && (
            <BackgroundsPanel
              currentBackground={currentPage?.background || { type: 'color', value: '#FAF8F5' }}
              onApplyBackground={onApplyBackground}
            />
          )}
          {activeTab === 'decorations' && (
            <DecorationsPanel onAddDecoration={onAddDecoration} />
          )}
          {activeTab === 'text' && <TypographyPanel onAddTextElement={onAddTextElement} />}
          {activeTab === 'settings' && (
            <SettingsPanel
              project={project}
              onChangeSize={onChangeSize}
              onToggleBleedGuide={onToggleBleedGuide}
              onToggleGrid={onToggleGrid}
              onToggleSnap={onToggleSnap}
            />
          )}
        </div>
      )}
    </div>
  );
};
