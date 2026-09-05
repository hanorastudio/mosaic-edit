import JSZip from 'jszip';
import { AlbumProject, PhotoMetadata } from '@/types/album';
import { renderPageToCanvas } from './exportPdf';

export interface ZipExportProgress {
  currentPage: number;
  totalPages: number;
  status: string;
  percent: number;
}

export async function exportAlbumToZip(
  project: AlbumProject,
  photosMap: Map<string, PhotoMetadata>,
  format: 'png' | 'jpeg' = 'png',
  onProgress?: (progress: ZipExportProgress) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`${project.name.replace(/\s+/g, '_')}_Pages`) || zip;
  const totalPages = project.pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = project.pages[i];

    if (onProgress) {
      onProgress({
        currentPage: i + 1,
        totalPages,
        status: `Rendering page ${i + 1} of ${totalPages} to image...`,
        percent: Math.round(((i + 1) / totalPages) * 85),
      });
    }

    const canvas = await renderPageToCanvas(page, project, photosMap, 2.0);
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const base64Data = dataUrl.split(',')[1];

    const fileName = `Page_${String(i + 1).padStart(3, '0')}_${page.title?.replace(/\s+/g, '_') || 'Spread'}.${format}`;
    folder.file(fileName, base64Data, { base64: true });

    await new Promise((r) => setTimeout(r, 10));
  }

  if (onProgress) {
    onProgress({
      currentPage: totalPages,
      totalPages,
      status: 'Compressing album archive...',
      percent: 95,
    });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        status: `Compressing archive: ${Math.round(metadata.percent)}%`,
        percent: Math.round(85 + (metadata.percent / 100) * 15),
      });
    }
  });

  return zipBlob;
}
