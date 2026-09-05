'use client';

import React, { useState } from 'react';
import { MosaicProject } from '@/types/mosaic';
import { PhotoMetadata } from '@/types/album';
import { exportMosaicImage, exportMosaicToPdf } from '@/lib/mosaic/exportMosaic';
import {
  X,
  FileDown,
  FileArchive,
  CheckCircle2,
  Sparkles,
  Printer,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MosaicExportModalProps {
  project: MosaicProject;
  photos: PhotoMetadata[];
  onClose: () => void;
}

export const MosaicExportModal: React.FC<MosaicExportModalProps> = ({
  project,
  photos,
  onClose,
}) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');
  const [resolution, setResolution] = useState<'2k' | '4k' | '8k'>('4k');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const photosMap = new Map<string, PhotoMetadata>();
  photos.forEach((p) => photosMap.set(p.id, p));

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    setProgressPercent(0);

    try {
      if (exportFormat === 'pdf') {
        const blob = await exportMosaicToPdf(project, photosMap, (prog) => {
          setProgressStatus(prog.status);
          setProgressPercent(prog.percent);
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}_PrintReady_Mosaic.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const blob = await exportMosaicImage(
          project,
          photosMap,
          resolution,
          exportFormat,
          (prog) => {
            setProgressStatus(prog.status);
            setProgressPercent(prog.percent);
          }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}_${resolution.toUpperCase()}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#C8A96B', '#E5C158', '#FAF8F5'],
      });
    } catch (err) {
      console.error('Mosaic export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A96B]/20 flex items-center justify-center text-[#C8A96B]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#FAF8F5] font-heading">
                Export High-Resolution Photo Art
              </h3>
              <p className="text-xs text-[#9E9E9E]">2K, 4K, 8K Ultra-HD or 300 DPI Print PDF.</p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isExporting ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-[#C8A96B]/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#C8A96B] border-r-[#C8A96B] border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[#141417] flex items-center justify-center text-[#C8A96B]">
                  <FileDown className="w-7 h-7 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Rendering Ultra-HD Mosaic...</h4>
                <p className="text-xs text-[#C8A96B]">{progressStatus}</p>
              </div>

              <div className="w-full bg-[#141417] h-3 rounded-full overflow-hidden border border-[#2C2C34]">
                <div
                  className="h-full bg-gradient-to-r from-[#C8A96B] to-[#E5C158] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[#9E9E9E] font-mono">{progressPercent}% complete</p>
            </div>
          ) : downloadSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white font-heading">
                  Mosaic Exported Successfully!
                </h4>
                <p className="text-xs text-[#9E9E9E]">Your download has begun.</p>
              </div>
              <button
                onClick={() => setDownloadSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-[#C8A96B] hover:bg-[#C8A96B]/15 rounded-lg transition-colors"
              >
                Export another resolution
              </button>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                  Select Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'png', name: 'PNG Image', desc: 'Lossless clarity' },
                    { id: 'jpeg', name: 'JPEG Image', desc: 'Compressed' },
                    { id: 'pdf', name: 'Print PDF', desc: '300 DPI poster' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        exportFormat === fmt.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                      }`}
                    >
                      <div className="text-xs">{fmt.name}</div>
                      <div className="text-[10px] text-zinc-500">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution selection (for images) */}
              {exportFormat !== 'pdf' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Rendering Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '2k', name: '2K Standard', res: '2048 × 2048 px' },
                      { id: '4k', name: '4K Ultra HD', res: '4096 × 4096 px' },
                      { id: '8k', name: '8K Print Wall', res: '8192 × 8192 px' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setResolution(r.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          resolution === r.id
                            ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                            : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                        }`}
                      >
                        <div className="text-xs">{r.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">{r.res}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#141417] border border-[#2C2C34] flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Total Tiles: <strong className="text-white">{project.tiles.length}</strong>
                </span>
                <span>
                  Accuracy: <strong className="text-emerald-400">{project.metrics.shapeAccuracy}%</strong>
                </span>
                <span>
                  Used: <strong className="text-[#C8A96B]">{project.metrics.photosUsedCount} photos</strong>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] to-[#E5C158] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/25 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Export High-Res Art</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
