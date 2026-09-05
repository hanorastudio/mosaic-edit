import { PhotoMetadata } from '@/types/album';
import { generateId } from '@/lib/utils';
import { analyzePhotosForMosaic } from './photoAnalyzer';
import { AnalyzedMosaicPhoto } from '@/types/mosaic';

// Curated high-resolution authentic photography collection (couples, portraits, weddings, celebrations, scenery)
const CURATED_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80', // Wedding couple
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80', // Traditional bride
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80', // Couple romance
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80', // Wedding florals
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80', // Golden sunset
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', // Portrait smile
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Groom portrait
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=400&q=80', // Wedding dance
  'https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=400&q=80', // Ring exchange
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', // Candid laugh
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', // Portrait man
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Joyful bride
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80', // Warm embrace
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80', // Elegance dress
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80', // Sunset silhouette
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', // Candid portrait
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', // Golden light portrait
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', // Classic portrait
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80', // Holding hands
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', // Friendly smile
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80', // Mountain landscape
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', // Radiant portrait
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80', // Starlight sky
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', // Beach sunset
];

// Helper: load image and convert to dataURL / blob
async function fetchAndCreatePhotoData(
  imageUrl: string,
  fallbackIndex: number
): Promise<{ dataUrl: string; blob: Blob }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Network response not ok');
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ dataUrl: reader.result as string, blob });
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    // Offline photographic canvas fallback (realistic scenic & portrait photo grading, NOT flat avatars)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Rich photographic natural gradient (golden hour, sunset, twilight, warm rose)
    const hue = (fallbackIndex * 37) % 360;
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, `hsl(${hue}, 65%, 45%)`);
    grad.addColorStop(0.5, `hsl(${(hue + 25) % 360}, 55%, 35%)`);
    grad.addColorStop(1, `hsl(${(hue + 50) % 360}, 75%, 20%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Photographic bokeh light circles
    for (let b = 0; b < 12; b++) {
      const bx = ((fallbackIndex * 83 + b * 97) % 360) + 20;
      const by = ((fallbackIndex * 67 + b * 113) % 360) + 20;
      const br = 20 + ((b * 19) % 40);
      const bgrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bgrad.addColorStop(0, 'rgba(255, 245, 220, 0.45)');
      bgrad.addColorStop(0.6, 'rgba(255, 230, 180, 0.15)');
      bgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = bgrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Photographic vignette
    const vignette = ctx.createRadialGradient(200, 200, 120, 200, 200, 280);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 400, 400);

    // Warm golden hour sunlight leak
    const sun = ctx.createRadialGradient(40, 40, 0, 40, 40, 220);
    sun.addColorStop(0, 'rgba(255, 220, 150, 0.5)');
    sun.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  }
}

// Generate realistic photographic sample collection for mosaic testing (100 to 500+ photos)
export async function createSampleMosaicPhotoCollection(
  projectId: string,
  count: number = 120
): Promise<{ photos: PhotoMetadata[]; analyzedPhotos: AnalyzedMosaicPhoto[]; blobsMap: Map<string, Blob> }> {
  const photos: PhotoMetadata[] = [];
  const blobsMap = new Map<string, Blob>();

  const photoTitles = [
    'Romantic Sunset Embrace',
    'Golden Hour Portrait',
    'Wedding Couple Glance',
    'Candid Laughter Joy',
    'Exchange of Vows',
    'Bride Portrait Elegance',
    'Groom Smile Moment',
    'Holding Hands Forever',
    'Floral Ring Details',
    'Reception Dance Lights',
    'Fairytale Evening Walk',
    'Starlight Celebration',
    'Warm Family Blessings',
    'Sweet Summer Memories',
    'Ocean Breeze Romance',
    'Forever & Always',
  ];

  for (let i = 0; i < count; i++) {
    const photoUrl = CURATED_PHOTO_URLS[i % CURATED_PHOTO_URLS.length];
    const label = photoTitles[i % photoTitles.length];
    const { dataUrl, blob } = await fetchAndCreatePhotoData(photoUrl, i);

    const photoId = generateId('photo');
    const photoMeta: PhotoMetadata = {
      id: photoId,
      projectId,
      name: `${label.replace(/\s+/g, '_')}_${i + 1}.jpg`,
      size: blob.size,
      type: 'image/jpeg',
      width: 400,
      height: 400,
      aspectRatio: 1,
      orientation: 'square',
      thumbnail: dataUrl,
      hash: `dhash_real_${i.toString(16).padStart(4, '0')}`,
      sharpness: 85 + Math.floor(Math.random() * 12),
      brightness: 55 + Math.floor(Math.random() * 25),
      contrast: 65,
      facesDetected: i % 2 === 0 ? 1 : 2,
      focalPoint: { x: 0.5, y: 0.45 },
      favorite: i === 0 || i === 4 || i === 9 || i === 18,
      isDuplicateCandidate: false,
      isBlurry: false,
      timestamp: Date.now() - i * 60000,
      usedCount: 0,
    };

    photos.push(photoMeta);
    blobsMap.set(photoId, blob);
  }

  const analyzedPhotos = await analyzePhotosForMosaic(photos);
  return { photos, analyzedPhotos, blobsMap };
}
