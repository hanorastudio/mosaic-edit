import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlbumSize, AlbumOrientation, PageDimensions, ElementFilter } from "@/types/album";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = "elem"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export function getAlbumDimensions(size: AlbumSize, orientation: AlbumOrientation): PageDimensions {
  const bleedMm = 3.175; // 1/8th inch industry bleed standard
  const safeMarginMm = 6.35; // 1/4th inch safe margin

  switch (size) {
    case '8x8':
      return {
        width: 800,
        height: 800,
        dpi: 300,
        bleedMm,
        safeMarginMm,
        aspectRatio: 1,
        physicalWidthInches: 8,
        physicalHeightInches: 8,
      };
    case '10x10':
      return {
        width: 1000,
        height: 1000,
        dpi: 300,
        bleedMm,
        safeMarginMm,
        aspectRatio: 1,
        physicalWidthInches: 10,
        physicalHeightInches: 10,
      };
    case '12x12':
      return {
        width: 1200,
        height: 1200,
        dpi: 300,
        bleedMm,
        safeMarginMm,
        aspectRatio: 1,
        physicalWidthInches: 12,
        physicalHeightInches: 12,
      };
    case 'A4':
      if (orientation === 'landscape') {
        return {
          width: 1122,
          height: 794,
          dpi: 300,
          bleedMm,
          safeMarginMm,
          aspectRatio: 1122 / 794,
          physicalWidthInches: 11.69,
          physicalHeightInches: 8.27,
        };
      } else {
        return {
          width: 794,
          height: 1122,
          dpi: 300,
          bleedMm,
          safeMarginMm,
          aspectRatio: 794 / 1122,
          physicalWidthInches: 8.27,
          physicalHeightInches: 11.69,
        };
      }
    case 'A3':
      if (orientation === 'landscape') {
        return {
          width: 1587,
          height: 1122,
          dpi: 300,
          bleedMm,
          safeMarginMm,
          aspectRatio: 1587 / 1122,
          physicalWidthInches: 16.54,
          physicalHeightInches: 11.69,
        };
      } else {
        return {
          width: 1122,
          height: 1587,
          dpi: 300,
          bleedMm,
          safeMarginMm,
          aspectRatio: 1122 / 1587,
          physicalWidthInches: 11.69,
          physicalHeightInches: 16.54,
        };
      }
    case 'custom':
    default:
      return {
        width: 1000,
        height: 1000,
        dpi: 300,
        bleedMm,
        safeMarginMm,
        aspectRatio: 1,
        physicalWidthInches: 10,
        physicalHeightInches: 10,
      };
  }
}

export function getCssFilterString(filter?: ElementFilter): string {
  if (!filter) return 'none';
  const parts: string[] = [];
  if (filter.brightness !== undefined && filter.brightness !== 100) {
    parts.push(`brightness(${filter.brightness}%)`);
  }
  if (filter.contrast !== undefined && filter.contrast !== 100) {
    parts.push(`contrast(${filter.contrast}%)`);
  }
  if (filter.saturate !== undefined && filter.saturate !== 100) {
    parts.push(`saturate(${filter.saturate}%)`);
  }
  if (filter.grayscale && filter.grayscale > 0) {
    parts.push(`grayscale(${filter.grayscale}%)`);
  }
  if (filter.sepia && filter.sepia > 0) {
    parts.push(`sepia(${filter.sepia}%)`);
  }
  if (filter.blur && filter.blur > 0) {
    parts.push(`blur(${filter.blur}px)`);
  }
  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
