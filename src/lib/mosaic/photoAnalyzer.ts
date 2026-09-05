import { PhotoMetadata } from '@/types/album';
import { AnalyzedMosaicPhoto, LabColor, RgbColor } from '@/types/mosaic';

// RGB to CIE-LAB color space conversion for perceptual color matching
export function rgbToLab(rgb: RgbColor): LabColor {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Gamma correction (sRGB to linear RGB)
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Linear RGB to CIE XYZ (D65 illuminant standard observer)
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  // XYZ to CIE-LAB
  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const l = Math.max(0, 116 * fy - 16);
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return {
    l: Number(l.toFixed(2)),
    a: Number(a.toFixed(2)),
    b: Number(bVal.toFixed(2)),
  };
}

// Calculate CIE76 Delta-E color distance (perceptual color difference)
export function getDeltaE(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Extract average RGB color from image thumbnail dataURL
export async function extractPhotoColors(
  photo: PhotoMetadata
): Promise<{ rgb: RgbColor; lab: LabColor; hue: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = 40;
      const h = 40;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        const fallbackRgb = { r: 180, g: 170, b: 160 };
        return resolve({
          rgb: fallbackRgb,
          lab: rgbToLab(fallbackRgb),
          hue: 30,
        });
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        totalR += data[i];
        totalG += data[i + 1];
        totalB += data[i + 2];
      }

      const avgR = Math.round(totalR / pixelCount);
      const avgG = Math.round(totalG / pixelCount);
      const avgB = Math.round(totalB / pixelCount);

      const rgb: RgbColor = { r: avgR, g: avgG, b: avgB };
      const lab = rgbToLab(rgb);

      // Dominant Hue calculation
      const max = Math.max(avgR, avgG, avgB);
      const min = Math.min(avgR, avgG, avgB);
      let hue = 0;
      if (max !== min) {
        const d = max - min;
        switch (max) {
          case avgR:
            hue = (avgG - avgB) / d + (avgG < avgB ? 6 : 0);
            break;
          case avgG:
            hue = (avgB - avgR) / d + 2;
            break;
          case avgB:
            hue = (avgR - avgG) / d + 4;
            break;
        }
        hue = Math.round(hue * 60);
      }

      resolve({ rgb, lab, hue });
    };

    img.onerror = () => {
      const fallbackRgb = { r: 180, g: 170, b: 160 };
      resolve({
        rgb: fallbackRgb,
        lab: rgbToLab(fallbackRgb),
        hue: 30,
      });
    };

    img.src = photo.thumbnail;
  });
}

// Batch analyze all uploaded photos for Mosaic placement
export async function analyzePhotosForMosaic(
  photos: PhotoMetadata[],
  onProgress?: (pct: number) => void
): Promise<AnalyzedMosaicPhoto[]> {
  const analyzed: AnalyzedMosaicPhoto[] = [];
  const total = photos.length;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    const { rgb, lab, hue } = await extractPhotoColors(photo);

    const isHeroCandidate = photo.favorite || (photo.facesDetected > 0 && photo.sharpness > 60);

    analyzed.push({
      id: photo.id,
      metadata: photo,
      averageRgb: rgb,
      averageLab: lab,
      brightness: photo.brightness || Math.round((0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 2.55),
      contrast: photo.contrast || 50,
      dominantHue: hue,
      isHeroCandidate,
    });

    if (onProgress && (i % 10 === 0 || i === total - 1)) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  return analyzed;
}
