'use client';

import React from 'react';
import { AlbumPage, AlbumProject, PhotoMetadata } from '@/types/album';
import { Plus, Copy, Trash2, ChevronUp, ChevronDown, BookOpen } from 'lucide-react';

interface PagesPanelProps {
  project: AlbumProject;
  currentPageIndex: number;
  photosMap: Map<string, PhotoMetadata>;
  onSelectPage: (pageIndex: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const PagesPanel: React.FC<PagesPanelProps> = ({
  project,
  currentPageIndex,
  photosMap,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C34] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">Pages</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
            {project.pages.length}
          </span>
        </div>
        <button
          onClick={onAddPage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#C8A96B] hover:bg-[#E5C158] text-black rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {project.pages.map((page, idx) => {
          const isSelected = idx === currentPageIndex;
          const photoElements = page.elements.filter((e) => e.type === 'photo' && e.photoId);

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(idx)}
              className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-[0_0_12px_rgba(200,169,107,0.2)]'
                  : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/40 hover:bg-[#1A1A1E]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#FAF8F5] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#2C2C34] text-[10px] flex items-center justify-center text-[#C8A96B] font-mono">
                    {idx + 1}
                  </span>
                  <span>{page.title || `Page ${idx + 1}`}</span>
                </span>
                <span className="text-[10px] text-[#9E9E9E] font-mono capitalize">
                  {page.layoutType.replace(/-/g, ' ')}
                </span>
              </div>

              {/* Mini visual representation of page layout */}
              <div className="w-full h-24 rounded-lg bg-[#0E0E10] border border-[#2C2C34] relative overflow-hidden flex items-center justify-center p-1.5">
                {photoElements.length === 0 ? (
                  <div className="text-[10px] text-[#666666] flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Text / Cover Layout</span>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {photoElements.map((elem) => {
                      const photo = elem.photoId ? photosMap.get(elem.photoId) : undefined;
                      return (
                        <div
                          key={elem.id}
                          className="absolute rounded-[2px] overflow-hidden border border-white/10 bg-black/60"
                          style={{
                            left: `${elem.x}%`,
                            top: `${elem.y}%`,
                            width: `${elem.width}%`,
                            height: `${elem.height}%`,
                          }}
                        >
                          {photo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage(idx, idx - 1);
                    }}
                    className="p-1 rounded bg-[#2C2C34] hover:bg-[#383842] text-white/80 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === project.pages.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage(idx, idx + 1);
                    }}
                    className="p-1 rounded bg-[#2C2C34] hover:bg-[#383842] text-white/80 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(idx);
                    }}
                    className="p-1 rounded bg-[#2C2C34] hover:bg-[#383842] text-white/80"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    disabled={project.pages.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(idx);
                    }}
                    className="p-1 rounded bg-[#2C2C34] hover:bg-red-500 hover:text-white text-red-400 disabled:opacity-30"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
