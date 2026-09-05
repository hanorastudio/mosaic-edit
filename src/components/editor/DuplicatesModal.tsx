'use client';

import React from 'react';
import { PhotoMetadata } from '@/types/album';
import { X, Sparkles, Check, Trash2, Heart, AlertCircle } from 'lucide-react';

interface DuplicatesModalProps {
  photos: PhotoMetadata[];
  onToggleFavorite: (photoId: string) => void;
  onRemovePhoto: (photoId: string) => void;
  onClose: () => void;
}

export const DuplicatesModal: React.FC<DuplicatesModalProps> = ({
  photos,
  onToggleFavorite,
  onRemovePhoto,
  onClose,
}) => {
  // Group duplicate candidates
  const duplicateGroupsMap = new Map<string, PhotoMetadata[]>();
  const blurryPhotos = photos.filter((p) => p.isBlurry);

  photos.forEach((photo) => {
    if (photo.isDuplicateCandidate && photo.duplicateGroupId) {
      const group = duplicateGroupsMap.get(photo.duplicateGroupId) || [];
      group.push(photo);
      duplicateGroupsMap.set(photo.duplicateGroupId, group);
    }
  });

  const duplicateGroups = Array.from(duplicateGroupsMap.values()).filter((g) => g.length > 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/20 flex items-center justify-center text-[#C8A96B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#FAF8F5] font-heading">
                Smart Photo Recommendations
              </h3>
              <p className="text-xs text-[#9E9E9E]">
                We analyzed your photo collection and found potential duplicates & low sharpness shots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Duplicates Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#C8A96B] uppercase tracking-wider flex items-center gap-2">
                <span>Similar / Burst Shots Detected</span>
                <span className="px-2 py-0.5 text-xs bg-[#C8A96B]/20 text-[#C8A96B] rounded-full">
                  {duplicateGroups.length} Clusters
                </span>
              </h4>
            </div>

            {duplicateGroups.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#141417] border border-[#2C2C34] text-center text-xs text-[#9E9E9E]">
                ✓ No unnecessary duplicate clusters found! Your collection is distinct.
              </div>
            ) : (
              <div className="space-y-4">
                {duplicateGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#9E9E9E]">
                      <span>Similar Series #{idx + 1} ({group.length} shots)</span>
                      <span className="text-[#C8A96B]">Select best shot to highlight</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {group.map((p) => (
                        <div
                          key={p.id}
                          className={`relative group rounded-lg overflow-hidden border ${
                            p.favorite
                              ? 'border-[#C8A96B] shadow-[0_0_12px_rgba(200,169,107,0.3)]'
                              : 'border-[#2C2C34]'
                          } bg-black/40`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.thumbnail}
                            alt={p.name}
                            className="w-full h-32 object-cover"
                          />
                          {/* Badges */}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white backdrop-blur">
                            Sharpness: {p.sharpness}%
                          </div>
                          {/* Actions */}
                          <div className="absolute top-1.5 right-1.5 flex gap-1">
                            <button
                              onClick={() => onToggleFavorite(p.id)}
                              className={`p-1 rounded-full ${
                                p.favorite
                                  ? 'bg-[#C8A96B] text-black'
                                  : 'bg-black/60 text-white hover:bg-[#C8A96B] hover:text-black'
                              } transition-colors`}
                              title="Favorite this shot"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => onRemovePhoto(p.id)}
                              className="p-1 rounded-full bg-black/60 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-1.5 text-[11px] truncate text-white/80 bg-[#1A1A1E]">
                            {p.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blurry / Soft Focus Photos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#E5C158] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Low Sharpness / Soft Focus Shots</span>
                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded-full">
                  {blurryPhotos.length} Photos
                </span>
              </h4>
            </div>

            {blurryPhotos.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#141417] border border-[#2C2C34] text-center text-xs text-[#9E9E9E]">
                ✓ All photos have high sharpness clarity!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {blurryPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="relative group rounded-lg overflow-hidden border border-yellow-500/30 bg-black/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-full h-32 object-cover opacity-85"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] bg-yellow-950/80 text-yellow-300 backdrop-blur">
                      Sharpness: {p.sharpness}%
                    </div>
                    <button
                      onClick={() => onRemovePhoto(p.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove blurry photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1.5 text-[11px] truncate text-white/80 bg-[#1A1A1E]">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
          <p className="text-xs text-[#9E9E9E]">
            Nothing is deleted automatically unless you click the trash icon.
          </p>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-[#141414] bg-[#C8A96B] hover:bg-[#E5C158] rounded-lg shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
