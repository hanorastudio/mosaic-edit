import { RgbColor } from '@/types/mosaic';

export interface ContourExtractionOptions {
  strokeThickness?: number; // 1 to 8 px
  strokeColor?: 'black' | 'dark-accent' | 'gold' | 'white';
  autoSubjectIsolation?: boolean;
  characterColorVibrancy?: number; // 1.0 to 2.0
  gridCols?: number;
  gridRows?: number;
}

export interface ContourExtractionResult {
  lineartDataUrl: string; // Transparent PNG of crisp vector contour lines
  isSubjectGrid: boolean[][]; // [row][col] grid of subject cells vs background
  boostedColors: RgbColor[][]; // [row][col] target colors with cartoon vibrancy
  hasLineart: boolean;
}

// Convert RGB to HSL and boost saturation
export function boostRgbSaturation(r: number, g: number, b: number, boostFactor: number = 1.45): RgbColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  // Boost saturation for cartoon pop (especially for yellows, reds, blues, greens, pinks)
  const newS = Math.min(1.0, s * boostFactor);

  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  let newR = l;
  let newG = l;
  let newB = l;

  if (newS !== 0) {
    const q = l < 0.5 ? l * (1 + newS) : l + newS - l * newS;
    const p = 2 * l - q;
    newR = hue2rgb(p, q, h + 1 / 3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(Math.max(0, Math.min(255, newR * 255))),
    g: Math.round(Math.max(0, Math.min(255, newG * 255))),
    b: Math.round(Math.max(0, Math.min(255, newB * 255))),
  };
}

/**
 * Extracts crisp vector contour outlines and subject mask from any custom character or photo image.
 */
export async function extractContourLineart(
  imageUrl: string,
  canvasWidth: number = 1200,
  canvasHeight: number = 1200,
  options: ContourExtractionOptions = {}
): Promise<ContourExtractionResult> {
  const {
    strokeThickness = 2.5,
    strokeColor = 'black',
    autoSubjectIsolation = true,
    characterColorVibrancy = 1.45,
    gridCols = 40,
    gridRows = 40,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 1. Offscreen source canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = canvasWidth;
      srcCanvas.height = canvasHeight;
      const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
      if (!srcCtx) {
        resolve({
          lineartDataUrl: '',
          isSubjectGrid: Array.from({ length: gridRows }, () => new Array(gridCols).fill(true)),
          boostedColors: Array.from({ length: gridRows }, () =>
            new Array(gridCols).fill({ r: 200, g: 200, b: 200 })
          ),
          hasLineart: false,
        });
        return;
      }

      // Draw image fitted to canvas
      srcCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      const imgData = srcCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const { data, width, height } = imgData;

      // 2. Detect background color from 4 corners & edges
      const cornerCoords = [
        [4, 4],
        [width - 5, 4],
        [4, height - 5],
        [width - 5, height - 5],
        [Math.floor(width / 2), 4],
        [4, Math.floor(height / 2)],
        [width - 5, Math.floor(height / 2)],
      ];

      let bgR = 0;
      let bgG = 0;
      let bgB = 0;
      let bgSamples = 0;
      let isTransparentBg = false;

      for (const [cx, cy] of cornerCoords) {
        const idx = (cy * width + cx) * 4;
        const alpha = data[idx + 3];
        if (alpha < 50) {
          isTransparentBg = true;
          break;
        }
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
        bgSamples++;
      }

      if (bgSamples > 0) {
        bgR /= bgSamples;
        bgG /= bgSamples;
        bgB /= bgSamples;
      }

      const isLightBg = isTransparentBg || (bgR > 215 && bgG > 215 && bgB > 215);

      // 3. Create Lineart Output Canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvasWidth;
      outCanvas.height = canvasHeight;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        resolve({
          lineartDataUrl: '',
          isSubjectGrid: Array.from({ length: gridRows }, () => new Array(gridCols).fill(true)),
          boostedColors: Array.from({ length: gridRows }, () =>
            new Array(gridCols).fill({ r: 200, g: 200, b: 200 })
          ),
          hasLineart: false,
        });
        return;
      }

      const outImgData = outCtx.createImageData(canvasWidth, canvasHeight);
      const outData = outImgData.data;

      // Determine stroke RGBA
      let sR = 15;
      let sG = 15;
      let sB = 18;
      if (strokeColor === 'gold') {
        sR = 218;
        sG = 175;
        sB = 88;
      } else if (strokeColor === 'white') {
        sR = 250;
        sG = 250;
        sB = 255;
      } else if (strokeColor === 'dark-accent') {
        sR = 30;
        sG = 25;
        sB = 40;
      }

      // 4. Multi-scale Edge & Dark Ink Line Extraction
      const isEdgePixel = new Uint8Array(width * height);
      const isSubjectPixel = new Uint8Array(width * height);

      for (let y = 1; y < height - 1; y++) {
        const rowOffset = y * width;
        for (let x = 1; x < width - 1; x++) {
          const idx = (rowOffset + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Subject detection
          let isSub = true;
          if (a < 50) {
            isSub = false;
          } else if (autoSubjectIsolation && isLightBg) {
            const distToBg = Math.hypot(r - bgR, g - bgG, b - bgB);
            if (distToBg < 35 && (r > 210 && g > 210 && b > 210)) {
              isSub = false;
            }
          }
          isSubjectPixel[rowOffset + x] = isSub ? 1 : 0;

          // Color & Luminance Gradient Edge Detection (dx, dy)
          const leftIdx = (rowOffset + x - 1) * 4;
          const rightIdx = (rowOffset + x + 1) * 4;
          const upIdx = ((y - 1) * width + x) * 4;
          const downIdx = ((y + 1) * width + x) * 4;

          const dR = Math.abs(data[rightIdx] - data[leftIdx]) + Math.abs(data[downIdx] - data[upIdx]);
          const dG = Math.abs(data[rightIdx + 1] - data[leftIdx + 1]) + Math.abs(data[downIdx + 1] - data[upIdx + 1]);
          const dB = Math.abs(data[rightIdx + 2] - data[leftIdx + 2]) + Math.abs(data[downIdx + 2] - data[upIdx + 2]);
          const totalColorGrad = dR + dG + dB;

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const isDarkInkStroke = lum < 65 && isSub;

          if (totalColorGrad > 110 || (isDarkInkStroke && totalColorGrad > 35)) {
            isEdgePixel[rowOffset + x] = Math.min(255, Math.round(totalColorGrad * 1.2));
          }
        }
      }

      // 5. Dilate & render crisp antialiased stroke lines
      const radius = Math.max(1, Math.round(strokeThickness * (canvasWidth / 1000)));
      for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
          const centerEdge = isEdgePixel[y * width + x];
          if (centerEdge > 0) {
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const dist = Math.hypot(dx, dy);
                if (dist <= radius + 0.5) {
                  const pIdx = ((y + dy) * width + (x + dx)) * 4;
                  const alphaFactor = Math.max(0, 1.0 - dist / (radius + 0.8));
                  const currentAlpha = outData[pIdx + 3];
                  const newAlpha = Math.min(255, Math.max(currentAlpha, Math.round(alphaFactor * 245)));

                  outData[pIdx] = sR;
                  outData[pIdx + 1] = sG;
                  outData[pIdx + 2] = sB;
                  outData[pIdx + 3] = newAlpha;
                }
              }
            }
          }
        }
      }

      outCtx.putImageData(outImgData, 0, 0);
      const lineartDataUrl = outCanvas.toDataURL('image/png');

      // 6. Compute Grid-level Subject Mask & Vibrant Target Colors
      const cellW = width / gridCols;
      const cellH = height / gridRows;

      const isSubjectGrid: boolean[][] = [];
      const boostedColors: RgbColor[][] = [];

      for (let r = 0; r < gridRows; r++) {
        isSubjectGrid[r] = [];
        boostedColors[r] = [];

        for (let c = 0; c < gridCols; c++) {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let subjectCount = 0;
          let totalSamples = 0;

          for (let sy = 0.2; sy <= 0.8; sy += 0.3) {
            for (let sx = 0.2; sx <= 0.8; sx += 0.3) {
              const px = Math.min(width - 1, Math.floor((c + sx) * cellW));
              const py = Math.min(height - 1, Math.floor((r + sy) * cellH));
              const idx = (py * width + px) * 4;

              sumR += data[idx];
              sumG += data[idx + 1];
              sumB += data[idx + 2];
              if (isSubjectPixel[py * width + px] === 1) {
                subjectCount++;
              }
              totalSamples++;
            }
          }

          const avgR = sumR / totalSamples;
          const avgG = sumG / totalSamples;
          const avgB = sumB / totalSamples;

          const isCellSubject = autoSubjectIsolation
            ? subjectCount / totalSamples >= 0.35
            : true;

          isSubjectGrid[r][c] = isCellSubject;

          // Apply cartoon vibrancy boost to subject colors
          if (isCellSubject && characterColorVibrancy > 1.0) {
            boostedColors[r][c] = boostRgbSaturation(avgR, avgG, avgB, characterColorVibrancy);
          } else {
            boostedColors[r][c] = {
              r: Math.round(avgR),
              g: Math.round(avgG),
              b: Math.round(avgB),
            };
          }
        }
      }

      resolve({
        lineartDataUrl,
        isSubjectGrid,
        boostedColors,
        hasLineart: true,
      });
    };

    img.onerror = () => {
      resolve({
        lineartDataUrl: '',
        isSubjectGrid: Array.from({ length: gridRows }, () => new Array(gridCols).fill(true)),
        boostedColors: Array.from({ length: gridRows }, () =>
          new Array(gridCols).fill({ r: 200, g: 200, b: 200 })
        ),
        hasLineart: false,
      });
    };

    img.src = imageUrl;
  });
}
