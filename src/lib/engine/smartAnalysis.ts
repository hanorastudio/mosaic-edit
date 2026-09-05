import { PhotoMetadata, PhotoOrientation, PhotoFocalPoint, AnalysisProgress } from '@/types/album';
import { generateId } from '@/lib/utils';

export interface ProcessedPhotoResult {
  metadata: PhotoMetadata;
  blob: Blob;
}

// Compute 64-bit dHash (difference hash) for duplicate & similarity detection
export function computeDHash(imageData: ImageData): string {
  // We sample 9x8 pixels
  const { data, width, height } = imageData;
  const sampleW = 9;
  const sampleH = 8;

  const grayMatrix: number[][] = [];
  const stepX = width / sampleW;
  const stepY = height / sampleH;

  for (let y = 0; y < sampleH; y++) {
    grayMatrix[y] = [];
    for (let x = 0; x < sampleW; x++) {
      const srcX = Math.min(width - 1, Math.floor((x + 0.5) * stepX));
      const srcY = Math.min(height - 1, Math.floor((y + 0.5) * stepY));
      const idx = (srcY * width + srcX) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Standard luminance formula
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      grayMatrix[y][x] = lum;
    }
  }

  let hashBinary = '';
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW - 1; x++) {
      hashBinary += grayMatrix[y][x] < grayMatrix[y][x + 1] ? '1' : '0';
    }
  }

  // Convert 64-bit binary to hex
  let hexHash = '';
  for (let i = 0; i < hashBinary.length; i += 4) {
    const nibble = hashBinary.substring(i, i + 4);
    hexHash += parseInt(nibble, 2).toString(16);
  }

  return hexHash;
}

// Calculate Hamming distance between two hex hashes
export function getHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const v1 = parseInt(hash1[i], 16);
    const v2 = parseInt(hash2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

// Estimate image sharpness using Laplacian variance
export function estimateSharpness(imageData: ImageData): { sharpness: number; isBlurry: boolean } {
  const { data, width, height } = imageData;
  const gray: number[] = new Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Apply 3x3 Laplacian filter: [0, 1, 0; 1, -4, 1; 0, 1, 0]
  const laplacian: number[] = [];
  let sum = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const val =
        gray[idx - width] +
        gray[idx + width] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];
      laplacian.push(val);
      sum += val;
    }
  }

  const mean = sum / laplacian.length;
  let variance = 0;
  for (let i = 0; i < laplacian.length; i++) {
    variance += Math.pow(laplacian[i] - mean, 2);
  }
  variance = variance / laplacian.length;

  // Scale variance (typical range: 5 to 500) to 0-100 score
  const sharpnessScore = Math.min(100, Math.max(0, Math.round((variance / 150) * 100)));
  const isBlurry = variance < 12;

  return { sharpness: sharpnessScore, isBlurry };
}

// Compute brightness and contrast (0-100)
export function computeBrightnessAndContrast(imageData: ImageData): { brightness: number; contrast: number } {
  const { data } = imageData;
  let totalLuminance = 0;
  const pixelCount = data.length / 4;
  const luminances: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalLuminance += lum;
    luminances.push(lum);
  }

  const avgLum = totalLuminance / pixelCount;
  const brightness = Math.round((avgLum / 255) * 100);

  let variance = 0;
  for (let i = 0; i < luminances.length; i++) {
    variance += Math.pow(luminances[i] - avgLum, 2);
  }
  const stdDev = Math.sqrt(variance / pixelCount);
  const contrast = Math.min(100, Math.round((stdDev / 128) * 100));

  return { brightness, contrast };
}

// Detect skin tones & subject saliency to determine optimal crop focal point
export function detectFocalPointAndFaces(imageData: ImageData): { focalPoint: PhotoFocalPoint; facesDetected: number } {
  const { data, width, height } = imageData;
  let skinPixelCount = 0;
  let skinSumX = 0;
  let skinSumY = 0;

  // Rule of thirds default center
  let weightedSumX = 0;
  let weightedSumY = 0;
  let totalWeight = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Standard skin-tone heuristic formula (Peer et al. algorithm)
      const isSkin =
        r > 95 &&
        g > 40 &&
        b > 20 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 15 &&
        r > g &&
        r > b;

      // Center bias weight
      const normX = x / width;
      const normY = y / height;
      const centerDist = Math.hypot(normX - 0.5, normY - 0.4); // slightly upper-center biased
      const centerWeight = Math.max(0.1, 1 - centerDist);

      if (isSkin) {
        skinPixelCount++;
        skinSumX += normX;
        skinSumY += normY;
        weightedSumX += normX * 3;
        weightedSumY += normY * 3;
        totalWeight += 3;
      } else {
        weightedSumX += normX * centerWeight * 0.2;
        weightedSumY += normY * centerWeight * 0.2;
        totalWeight += centerWeight * 0.2;
      }
    }
  }

  let focalX = 0.5;
  let focalY = 0.45; // Default slightly above vertical center for human portraits

  if (skinPixelCount > 20) {
    focalX = skinSumX / skinPixelCount;
    focalY = skinSumY / skinPixelCount;
  } else if (totalWeight > 0) {
    focalX = weightedSumX / totalWeight;
    focalY = weightedSumY / totalWeight;
  }

  // Estimate candidate face clusters
  const facesDetected = skinPixelCount > 400 ? Math.min(5, Math.ceil(skinPixelCount / 600)) : skinPixelCount > 50 ? 1 : 0;

  return {
    focalPoint: {
      x: Math.max(0.15, Math.min(0.85, Number(focalX.toFixed(3)))),
      y: Math.max(0.15, Math.min(0.85, Number(focalY.toFixed(3)))),
    },
    facesDetected,
  };
}

// Client-side single image processor (Canvas-based)
export async function analyzeLocalImageFile(
  file: File,
  projectId: string
): Promise<ProcessedPhotoResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        const aspectRatio = width / height;

        let orientation: PhotoOrientation = 'square';
        if (aspectRatio > 1.12) {
          orientation = 'landscape';
        } else if (aspectRatio < 0.88) {
          orientation = 'portrait';
        }

        // 1. Generate lightweight UI thumbnail (240px max)
        const thumbMaxDim = 240;
        let thumbW = width;
        let thumbH = height;
        if (width > height) {
          if (width > thumbMaxDim) {
            thumbW = thumbMaxDim;
            thumbH = Math.round((height * thumbMaxDim) / width);
          }
        } else {
          if (height > thumbMaxDim) {
            thumbH = thumbMaxDim;
            thumbW = Math.round((width * thumbMaxDim) / height);
          }
        }

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const thumbCtx = thumbCanvas.getContext('2d', { willReadFrequently: true });
        if (!thumbCtx) throw new Error('Canvas 2D context unavailable');

        thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
        const thumbnail = thumbCanvas.toDataURL('image/webp', 0.85);

        // 2. Perform sample analysis on 128x128 grid for speed and low memory
        const sampleDim = 128;
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleDim;
        sampleCanvas.height = sampleDim;
        const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
        if (!sampleCtx) throw new Error('Sample Canvas unavailable');

        sampleCtx.drawImage(img, 0, 0, sampleDim, sampleDim);
        const sampleData = sampleCtx.getImageData(0, 0, sampleDim, sampleDim);

        // Run analytical algorithms
        const hash = computeDHash(sampleData);
        const { sharpness, isBlurry } = estimateSharpness(sampleData);
        const { brightness, contrast } = computeBrightnessAndContrast(sampleData);
        const { focalPoint, facesDetected } = detectFocalPointAndFaces(sampleData);

        const photoId = generateId('photo');
        const metadata: PhotoMetadata = {
          id: photoId,
          projectId,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          width,
          height,
          aspectRatio: Number(aspectRatio.toFixed(3)),
          orientation,
          thumbnail,
          hash,
          sharpness,
          brightness,
          contrast,
          facesDetected,
          focalPoint,
          favorite: false,
          isDuplicateCandidate: false,
          isBlurry,
          dateTaken: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
          timestamp: file.lastModified || Date.now(),
          usedCount: 0,
        };

        URL.revokeObjectURL(objectUrl);
        resolve({
          metadata,
          blob: file,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image ${file.name}`));
    };

    img.src = objectUrl;
  });
}

// Process 10 to 300+ photos in asynchronous batches with real-time progress
export async function batchProcessPhotos(
  files: File[],
  projectId: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<{ photos: PhotoMetadata[]; blobsMap: Map<string, Blob> }> {
  const total = files.length;
  const photos: PhotoMetadata[] = [];
  const blobsMap = new Map<string, Blob>();

  let processedCount = 0;
  let duplicatesFound = 0;
  let blurryFound = 0;

  // Process in small parallel chunks to keep UI responsive
  const chunkSize = 4;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map((file) => analyzeLocalImageFile(file, projectId))
    );

    for (const res of results) {
      if (res.status === 'fulfilled') {
        const { metadata, blob } = res.value;
        if (metadata.isBlurry) blurryFound++;
        photos.push(metadata);
        blobsMap.set(metadata.id, blob);
      }
      processedCount++;
    }

    if (onProgress) {
      onProgress({
        total,
        processed: processedCount,
        currentStep: `Analyzing photo ${processedCount} of ${total}...`,
        stage: 'analysis',
        percent: Math.min(95, Math.round((processedCount / total) * 90)),
        duplicatesFound,
        blurryFound,
      });
    }

    // Small microtask yield so browser can repaint progress animations
    await new Promise((r) => setTimeout(r, 10));
  }

  // Duplicate & similarity clustering pass
  if (onProgress) {
    onProgress({
      total,
      processed: total,
      currentStep: 'Detecting duplicates and similarities...',
      stage: 'grouping',
      percent: 96,
      duplicatesFound,
      blurryFound,
    });
  }

  let dupGroupCounter = 1;
  for (let i = 0; i < photos.length; i++) {
    for (let j = i + 1; j < photos.length; j++) {
      const dist = getHammingDistance(photos[i].hash, photos[j].hash);
      // If hamming distance is <= 8, they are near duplicates or identical shots in burst
      if (dist <= 8) {
        photos[i].isDuplicateCandidate = true;
        photos[j].isDuplicateCandidate = true;

        const groupId = photos[i].duplicateGroupId || photos[j].duplicateGroupId || `dup_${dupGroupCounter++}`;
        photos[i].duplicateGroupId = groupId;
        photos[j].duplicateGroupId = groupId;
        duplicatesFound++;
      }
    }
  }

  if (onProgress) {
    onProgress({
      total,
      processed: total,
      currentStep: 'Photo organization complete!',
      stage: 'done',
      percent: 100,
      duplicatesFound: Math.floor(duplicatesFound / 2),
      blurryFound,
    });
  }

  return { photos, blobsMap };
}
