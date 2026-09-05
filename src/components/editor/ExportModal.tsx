'use client';

import React, { useState } from 'react';
import { AlbumProject, PhotoMetadata } from '@/types/album';
import { exportAlbumToPdf } from '@/lib/engine/exportPdf';
import { exportAlbumToZip } from '@/lib/engine/exportZip';
import { X, FileDown, FileArchive, CheckCircle2, Sparkles, Printer, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  project: AlbumProject;
  photos: PhotoMetadata[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  photos,
  onClose,
}) => {
  const [exportType, setExportType] = useState<'pdf' | 'zip'>('pdf');
  const [pdfQuality, setPdfQuality] = useState<'print' | 'high' | 'standard'>('print');
  const [zipFormat, setZipFormat] = useState<'png' | 'jpeg'>('png');
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
      if (exportType === 'pdf') {
        const blob = await exportAlbumToPdf(
          project,
          photosMap,
          pdfQuality,
          (progress) => {
            setProgressStatus(progress.status);
            setProgressPercent(progress.percent);
          }
        );

        // Download trigger
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}_${pdfQuality.toUpperCase()}_Album.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const blob = await exportAlbumToZip(
          project,
          photosMap,
          zipFormat,
          (progress) => {
            setProgressStatus(progress.status);
            setProgressPercent(progress.percent);
          }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}_Pages_ZIP.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8A96B', '#E5C158', '#FAF8F5'],
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export encountered an error. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A96B]/20 flex items-center justify-center text-[#C8A96B]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#FAF8F5] font-heading">
                Export Print-Ready Album
              </h3>
              <p className="text-xs text-[#9E9E9E]">
                Render and download your complete album locally without cloud upload.
              </p>
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
                <h4 className="text-base font-semibold text-white">Rendering Album Pages...</h4>
                <p className="text-xs text-[#C8A96B]">{progressStatus}</p>
              </div>

              <div className="w-full bg-[#141417] h-3 rounded-full overflow-hidden border border-[#2C2C34]">
                <div
                  className="h-full bg-gradient-to-r from-[#C8A96B] to-[#E5C158] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[#9E9E9E]">{progressPercent}% complete</p>
            </div>
          ) : downloadSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white font-heading">
                  Export Completed Successfully!
                </h4>
                <p className="text-xs text-[#9E9E9E]">
                  Your download has started. Check your browser downloads folder.
                </p>
              </div>
              <button
                onClick={() => setDownloadSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-[#C8A96B] hover:bg-[#C8A96B]/15 rounded-lg transition-colors"
              >
                Export another format
              </button>
            </div>
          ) : (
            <>
              {/* Format Selection Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportType('pdf')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    exportType === 'pdf'
                      ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md'
                      : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E] hover:border-[#C8A96B]/40'
                  }`}
                >
                  <FileDown
                    className={`w-6 h-6 shrink-0 mt-0.5 ${
                      exportType === 'pdf' ? 'text-[#C8A96B]' : 'text-zinc-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">Multi-Page PDF</h4>
                    <p className="text-[11px] text-[#9E9E9E] mt-0.5">
                      Print-ready document with high DPI vector rendering & bleed.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType('zip')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    exportType === 'zip'
                      ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-md'
                      : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E] hover:border-[#C8A96B]/40'
                  }`}
                >
                  <FileArchive
                    className={`w-6 h-6 shrink-0 mt-0.5 ${
                      exportType === 'zip' ? 'text-[#C8A96B]' : 'text-zinc-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">ZIP of Page Images</h4>
                    <p className="text-[11px] text-[#9E9E9E] mt-0.5">
                      Individual high-res PNG / JPEG images for each page spread.
                    </p>
                  </div>
                </button>
              </div>

              {/* PDF Quality Settings */}
              {exportType === 'pdf' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    PDF Resolution & Quality
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'print',
                        title: 'Print Ready (300 DPI Ultra High Quality)',
                        desc: 'Best for physical professional printing (Karizma & Wedding albums).',
                      },
                      {
                        id: 'high',
                        title: 'High Quality (200 DPI Web & Display)',
                        desc: 'Crisp for digital sharing, tablets, and lightweight printing.',
                      },
                      {
                        id: 'standard',
                        title: 'Standard Preview (150 DPI Small Size)',
                        desc: 'Fastest export, ideal for quick email proofs.',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          pdfQuality === opt.id
                            ? 'border-[#C8A96B] bg-[#C8A96B]/10'
                            : 'border-[#2C2C34] bg-[#141417] hover:border-[#2C2C34]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pdfQuality"
                          checked={pdfQuality === opt.id}
                          onChange={() => setPdfQuality(opt.id as any)}
                          className="mt-1 accent-[#C8A96B]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">{opt.title}</div>
                          <div className="text-[11px] text-[#9E9E9E]">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                    Image Archive Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['png', 'jpeg'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setZipFormat(fmt as any)}
                        className={`p-3 rounded-xl border text-xs font-semibold uppercase text-center transition-colors ${
                          zipFormat === fmt
                            ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white'
                            : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E]'
                        }`}
                      >
                        {fmt.toUpperCase()} Images
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs Summary */}
              <div className="p-3.5 rounded-xl bg-[#141417] border border-[#2C2C34] flex items-center justify-between text-xs text-[#9E9E9E]">
                <span>
                  Pages to render: <strong className="text-white">{project.pages.length}</strong>
                </span>
                <span>
                  Dimensions:{' '}
                  <strong className="text-white">
                    {project.dimensions.physicalWidthInches}&quot; ×{' '}
                    {project.dimensions.physicalHeightInches}&quot;
                  </strong>
                </span>
                <span>
                  Bleed: <strong className="text-[#C8A96B]">3.18 mm</strong>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
            <p className="text-[11px] text-[#9E9E9E]">100% Client-side local rendering.</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleStartExport}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/25 transition-all transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                Start Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
