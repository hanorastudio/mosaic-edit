'use client';

import React, { useState } from 'react';
import { AlbumElement, PhotoMetadata, ElementCrop } from '@/types/album';
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';

interface CropModalProps {
  element: AlbumElement;
  photo: PhotoMetadata;
  photoUrl: string;
  onSaveCrop: (crop: ElementCrop) => void;
  onClose: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  element,
  photo,
  photoUrl,
  onSaveCrop,
  onClose,
}) => {
  const currentCrop = element.crop || { x: 0, y: 0, scale: 1 };
  const [cropX, setCropX] = useState(currentCrop.x);
  const [cropY, setCropY] = useState(currentCrop.y);
  const [scale, setScale] = useState(currentCrop.scale);

  const handleReset = () => {
    // Reset to photo's smart focal point
    const smartX = (photo.focalPoint.x - 0.5) * 30;
    const smartY = (photo.focalPoint.y - 0.5) * 30;
    setCropX(smartX);
    setCropY(smartY);
    setScale(1);
  };

  const handleSave = () => {
    onSaveCrop({
      x: Number(cropX.toFixed(1)),
      y: Number(cropY.toFixed(1)),
      scale: Number(scale.toFixed(2)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34]">
          <div>
            <h3 className="text-lg font-semibold text-[#FAF8F5] font-heading">
              Adjust Photo Focal Point & Crop
            </h3>
            <p className="text-xs text-[#9E9E9E]">
              Reposition or zoom to center faces and key subjects perfectly in the frame.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Crop Preview Box */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#121214]">
          <div
            className="relative overflow-hidden bg-black/40 border-2 border-dashed border-[#C8A96B] rounded-lg shadow-inner flex items-center justify-center"
            style={{
              width: 320,
              height: Math.round((320 * (element.height || 50)) / (element.width || 50)),
              maxHeight: 280,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl || photo.thumbnail}
              alt={photo.name}
              className="absolute max-w-none transition-transform duration-75 select-none pointer-events-none"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                objectFit: 'cover',
                transform: `translate(${cropX}%, ${cropY}%) scale(${scale})`,
              }}
            />
            {/* Crosshair Guide */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/15">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div className="" />
            </div>
          </div>

          <p className="mt-3 text-xs text-[#C8A96B]">
            Smart Focal Point detected: X: {Math.round(photo.focalPoint.x * 100)}%, Y:{' '}
            {Math.round(photo.focalPoint.y * 100)}%
          </p>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 bg-[#1A1A1E]">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-[#9E9E9E]" />
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between text-xs text-[#9E9E9E] mb-1">
                <span>Zoom / Scale</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-[#C8A96B] cursor-pointer"
              />
            </div>
            <ZoomIn className="w-4 h-4 text-[#C8A96B]" />
          </div>

          {/* Pan X Slider */}
          <div className="flex flex-col">
            <div className="flex justify-between text-xs text-[#9E9E9E] mb-1">
              <span>Horizontal Pan (X)</span>
              <span>{Math.round(cropX)}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={cropX}
              onChange={(e) => setCropX(parseFloat(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>

          {/* Pan Y Slider */}
          <div className="flex flex-col">
            <div className="flex justify-between text-xs text-[#9E9E9E] mb-1">
              <span>Vertical Pan (Y)</span>
              <span>{Math.round(cropY)}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={cropY}
              onChange={(e) => setCropY(parseFloat(e.target.value))}
              className="w-full accent-[#C8A96B] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to AI Focal Point
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-[#141414] bg-[#C8A96B] hover:bg-[#E5C158] rounded-lg shadow-md transition-colors"
            >
              <Check className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
