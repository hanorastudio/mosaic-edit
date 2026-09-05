import { PhotoMetadata } from '@/types/album';
import { generateId } from '@/lib/utils';
import { computeDHash } from '../engine/smartAnalysis';

const CURATED_REAL_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
];

export async function createSamplePhotoCollection(
  projectId: string,
  category: 'wedding' | 'karizma' | 'birthday' | 'baby' | 'travel',
  count: number = 24
): Promise<{ photos: PhotoMetadata[]; blobsMap: Map<string, Blob> }> {
  const photos: PhotoMetadata[] = [];
  const blobsMap = new Map<string, Blob>();

  for (let i = 0; i < count; i++) {
    const url = CURATED_REAL_PHOTOS[i % CURATED_REAL_PHOTOS.length];
    let dataUrl = '';
    let blob: Blob;

    try {
      const resp = await fetch(url);
      blob = await resp.blob();
      dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      // Clean photographic gradient fallback without avatar icons
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 600, 600);
      grad.addColorStop(0, '#3D1520');
      grad.addColorStop(1, '#1F0B11');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 600);

      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const res = await fetch(dataUrl);
      blob = await res.blob();
    }

    const photoId = generateId('photo');
    const photoMeta: PhotoMetadata = {
      id: photoId,
      projectId,
      name: `Photo_${i + 1}.jpg`,
      size: blob.size,
      type: 'image/jpeg',
      width: 600,
      height: 600,
      aspectRatio: 1,
      orientation: 'square',
      thumbnail: dataUrl,
      hash: `dhash_sample_${i.toString(16)}`,
      sharpness: 85,
      brightness: 60,
      contrast: 65,
      facesDetected: 1,
      focalPoint: { x: 0.5, y: 0.45 },
      favorite: i === 0 || i === 3,
      isDuplicateCandidate: false,
      isBlurry: false,
      timestamp: Date.now() - i * 60000,
      usedCount: 0,
    };

    photos.push(photoMeta);
    blobsMap.set(photoId, blob);
  }

  return { photos, blobsMap };
}
