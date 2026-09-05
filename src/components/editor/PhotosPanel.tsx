'use client';

import React, { useState } from 'react';
import { PhotoMetadata } from '@/types/album';
import {
  Search,
  Upload,
  Heart,
  Sparkles,
  CheckCircle2,
  FolderPlus,
  Trash2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface PhotosPanelProps {
  photos: PhotoMetadata[];
  onUploadPhotos: (files: File[]) => void;
  onLoadSamplePhotos: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onOpenDuplicatesModal: () => void;
  onDragStartPhoto: (e: React.DragEvent, photoId: string) => void;
}

export const PhotosPanel: React.FC<PhotosPanelProps> = ({
  photos,
  onUploadPhotos,
  onLoadSamplePhotos,
  onToggleFavorite,
  onDeletePhoto,
  onOpenDuplicatesModal,
  onDragStartPhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'used' | 'unused' | 'favorites' | 'portrait' | 'landscape' | 'duplicates'
  >('all');

  const duplicateCount = photos.filter((p) => p.isDuplicateCandidate).length;
  const favoriteCount = photos.filter((p) => p.favorite).length;

  const filteredPhotos = photos.filter((p) => {
    // Search query
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category filters
    if (activeFilter === 'used' && p.usedCount === 0) return false;
    if (activeFilter === 'unused' && p.usedCount > 0) return false;
    if (activeFilter === 'favorites' && !p.favorite) return false;
    if (activeFilter === 'portrait' && p.orientation !== 'portrait') return false;
    if (activeFilter === 'landscape' && p.orientation !== 'landscape') return false;
    if (activeFilter === 'duplicates' && !p.isDuplicateCandidate) return false;
    return true;
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadPhotos(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1E] text-white">
      {/* Top Header & Actions */}
      <div className="p-4 border-b border-[#2C2C34] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#FAF8F5]">
              Photos
            </h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
              {photos.length}
            </span>
          </div>
          {duplicateCount > 0 && (
            <button
              onClick={onOpenDuplicatesModal}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#C8A96B]/20 hover:bg-[#C8A96B]/30 text-[#C8A96B] rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review ({duplicateCount})</span>
            </button>
          )}
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8A96B] hover:bg-[#E5C158] text-[#141414] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Add Photos</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          <button
            onClick={onLoadSamplePhotos}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2C2C34] hover:bg-[#383842] text-white/90 text-xs font-medium rounded-lg transition-colors border border-white/5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Sample Pack</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos by filename..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#141417] border border-[#2C2C34] rounded-lg text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {[
            { id: 'all', label: `All (${photos.length})` },
            { id: 'unused', label: `Unused (${photos.filter((p) => p.usedCount === 0).length})` },
            { id: 'used', label: `Used (${photos.filter((p) => p.usedCount > 0).length})` },
            { id: 'favorites', label: `★ (${favoriteCount})` },
            { id: 'portrait', label: 'Portrait' },
            { id: 'landscape', label: 'Landscape' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === tab.id
                  ? 'bg-[#C8A96B] text-black font-semibold'
                  : 'bg-[#141417] text-[#9E9E9E] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Virtualized/Scrollable Photo Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredPhotos.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-[#9E9E9E] space-y-2 p-4">
            <AlertCircle className="w-6 h-6 text-[#666666]" />
            <p>No photos match the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => onDragStartPhoto(e, photo.id)}
                className={`group relative rounded-xl overflow-hidden border bg-black/40 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] hover:shadow-lg ${
                  photo.favorite
                    ? 'border-[#C8A96B] shadow-[0_0_10px_rgba(200,169,107,0.2)]'
                    : 'border-[#2C2C34] hover:border-[#C8A96B]/50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnail}
                  alt={photo.name}
                  className="w-full h-28 object-cover select-none"
                  loading="lazy"
                />

                {/* Used Badge */}
                {photo.usedCount > 0 && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 backdrop-blur">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{photo.usedCount}x</span>
                  </div>
                )}

                {/* Orientation Tag */}
                <div className="absolute bottom-1.5 left-1.5 px-1 py-0.5 rounded text-[9px] uppercase font-mono bg-black/70 text-white/70 backdrop-blur">
                  {photo.orientation[0]}
                </div>

                {/* Favorite & Delete Buttons */}
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    className={`p-1 rounded-full backdrop-blur ${
                      photo.favorite
                        ? 'bg-[#C8A96B] text-black'
                        : 'bg-black/60 text-white hover:bg-[#C8A96B] hover:text-black'
                    }`}
                    title="Favorite"
                  >
                    <Heart className="w-3 h-3 fill-current" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(photo.id);
                    }}
                    className="p-1 rounded-full bg-black/60 text-red-400 hover:bg-red-500 hover:text-white transition-colors backdrop-blur"
                    title="Remove from project"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-3 border-t border-[#2C2C34] bg-[#141417] text-center">
        <p className="text-[10px] text-[#9E9E9E] flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Photos processed 100% locally on your machine</span>
        </p>
      </div>
    </div>
  );
};
