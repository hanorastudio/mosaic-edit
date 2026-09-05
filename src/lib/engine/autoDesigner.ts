import {
  AlbumProject,
  PhotoMetadata,
  AutoDesignOptions,
  AlbumPage,
  AlbumElement,
  PageBackground,
  PageLayoutType,
} from '@/types/album';
import { generateId, getAlbumDimensions } from '@/lib/utils';
import { TEMPLATE_DEFINITIONS, SYSTEM_BACKGROUNDS } from './templateLibrary';

export function autoDesignAlbum(
  photos: PhotoMetadata[],
  options: AutoDesignOptions
): AlbumProject {
  const dimensions = getAlbumDimensions(options.size, options.orientation);
  const projectId = generateId('proj');

  // 1. Sort photos: priority to favorites, then chronological/order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

  // 2. Select Cover Photo (Top favorite or highest sharpness score with face)
  const coverCandidate =
    sortedPhotos.find((p) => p.favorite) ||
    sortedPhotos.find((p) => p.facesDetected > 0 && p.sharpness > 50) ||
    sortedPhotos[0];

  const coverPhotoId = coverCandidate ? coverCandidate.id : undefined;

  // Determine category-specific color & background defaults
  let defaultBg: PageBackground = { type: 'color', value: '#FAF8F5' };
  let primaryTextColor = '#1A1A1A';
  let accentColor = '#C8A96B';
  let defaultFont = 'Cinzel, serif';

  if (options.category === 'karizma') {
    defaultBg = { type: 'gradient', value: 'linear-gradient(145deg, #18191E 0%, #0C0D0F 100%)' };
    primaryTextColor = '#FFFFFF';
    accentColor = '#D4AF37';
  } else if (options.category === 'baby') {
    defaultBg = { type: 'color', value: '#F4F9F6' };
    primaryTextColor = '#2C3E50';
    accentColor = '#88D49E';
    defaultFont = 'Playfair Display, serif';
  } else if (options.category === 'birthday') {
    defaultBg = { type: 'gradient', value: 'linear-gradient(135deg, #FFFDF8 0%, #FFF3DC 100%)' };
    primaryTextColor = '#1A1A1A';
    accentColor = '#E67E22';
  }

  // 3. Build Cover Page (Page 1)
  const coverElements: AlbumElement[] = [];

  if (coverPhotoId) {
    if (options.category === 'karizma') {
      coverElements.push({
        id: generateId('elem'),
        type: 'photo',
        photoId: coverPhotoId,
        x: 10,
        y: 10,
        width: 80,
        height: 55,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        borderRadius: 4,
        borderWidth: 2.5,
        borderColor: '#D4AF37',
        shadow: '0 20px 40px rgba(0,0,0,0.6)',
        objectFit: 'cover',
      });
    } else {
      coverElements.push({
        id: generateId('elem'),
        type: 'photo',
        photoId: coverPhotoId,
        x: 15,
        y: 12,
        width: 70,
        height: 52,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        borderRadius: 2,
        borderWidth: 0,
        shadow: '0 16px 36px rgba(0,0,0,0.1)',
        objectFit: 'cover',
      });
    }
  }

  // Cover Main Title
  coverElements.push({
    id: generateId('elem'),
    type: 'text',
    text: options.title || 'OUR WEDDING STORY',
    fontFamily: defaultFont,
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: 4,
    color: options.category === 'karizma' ? '#D4AF37' : primaryTextColor,
    textAlign: 'center',
    x: 10,
    y: 68,
    width: 80,
    height: 10,
    rotation: 0,
    zIndex: 2,
    opacity: 1,
  });

  // Cover Subtitle / Date / Location
  if (options.subtitle || options.dateText || options.locationText) {
    const subText = [options.subtitle, options.dateText, options.locationText]
      .filter(Boolean)
      .join('  •  ');
    coverElements.push({
      id: generateId('elem'),
      type: 'text',
      text: subText || 'A LIFETIME OF MEMORIES',
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 14,
      italic: true,
      letterSpacing: 2,
      color: options.category === 'karizma' ? '#E5C158' : '#777777',
      textAlign: 'center',
      x: 10,
      y: 79,
      width: 80,
      height: 6,
      rotation: 0,
      zIndex: 2,
      opacity: 0.9,
    });
  }

  // Cover Decorative Divider
  if (options.includeDecorations) {
    coverElements.push({
      id: generateId('elem'),
      type: 'decoration',
      decorationType: options.category === 'karizma' ? 'mandap-arch' : 'gold-divider',
      x: 30,
      y: 86,
      width: 40,
      height: 6,
      rotation: 0,
      zIndex: 3,
      opacity: 0.9,
    });
  }

  const pages: AlbumPage[] = [
    {
      id: generateId('page'),
      pageNumber: 1,
      title: 'Cover Page',
      layoutType: 'cover',
      background: defaultBg,
      elements: coverElements,
    },
  ];

  // 4. Distribute Remaining Photos to Inside Pages
  const remainingPhotos = sortedPhotos.filter((p) => p.id !== coverPhotoId);
  let photoIndex = 0;
  let pageNumber = 2;

  // Calculate target photos per page based on settings & density
  const getBatchSize = (photosLeft: number): number => {
    if (options.photosPerPage !== 'auto') {
      return Math.min(photosLeft, options.photosPerPage as number);
    }
    if (options.density === 'sparse') {
      // 1 to 2 photos per page
      return photosLeft >= 2 && Math.random() > 0.4 ? 2 : 1;
    }
    if (options.density === 'dense') {
      // 3 to 6 photos per page
      if (photosLeft >= 6 && Math.random() > 0.6) return 6;
      if (photosLeft >= 4) return 4;
      return Math.min(photosLeft, 3);
    }
    // Balanced default: mix of 1, 2, 3, 4, 6
    const roll = Math.random();
    if (roll < 0.2 && photosLeft >= 1) return 1; // Hero spotlight
    if (roll < 0.55 && photosLeft >= 2) return 2; // Split
    if (roll < 0.85 && photosLeft >= 3) return 3; // Triptych or hero+2
    if (photosLeft >= 4) return 4; // Grid
    return Math.min(photosLeft, 2);
  };

  while (photoIndex < remainingPhotos.length) {
    const photosLeft = remainingPhotos.length - photoIndex;
    const batchSize = getBatchSize(photosLeft);
    const pagePhotos = remainingPhotos.slice(photoIndex, photoIndex + batchSize);
    photoIndex += batchSize;

    // Pick optimal layout matching photo count & orientations
    const pageElements: AlbumElement[] = [];
    let layoutType: PageLayoutType = 'full-hero';

    if (batchSize === 1) {
      layoutType = 'full-hero';
      const p = pagePhotos[0];
      pageElements.push({
        id: generateId('elem'),
        type: 'photo',
        photoId: p.id,
        x: 8,
        y: 8,
        width: 84,
        height: 84,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        borderRadius: options.category === 'karizma' ? 4 : 2,
        borderWidth: options.category === 'karizma' ? 2 : 0,
        borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
        shadow: '0 12px 32px rgba(0,0,0,0.1)',
        objectFit: 'cover',
        crop: {
          x: (p.focalPoint.x - 0.5) * 30,
          y: (p.focalPoint.y - 0.5) * 30,
          scale: 1,
        },
      });
    } else if (batchSize === 2) {
      const allLandscape = pagePhotos.every((p) => p.orientation === 'landscape');
      if (allLandscape) {
        layoutType = 'two-split-v';
        pageElements.push(
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[0].id,
            x: 8,
            y: 8,
            width: 84,
            height: 40,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            borderWidth: options.category === 'karizma' ? 1.5 : 0,
            borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
            shadow: '0 8px 20px rgba(0,0,0,0.06)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[1].id,
            x: 8,
            y: 52,
            width: 84,
            height: 40,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            borderWidth: options.category === 'karizma' ? 1.5 : 0,
            borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
            shadow: '0 8px 20px rgba(0,0,0,0.06)',
            objectFit: 'cover',
          }
        );
      } else {
        layoutType = 'two-split-h';
        pageElements.push(
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[0].id,
            x: 6,
            y: 8,
            width: 42,
            height: 84,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            borderWidth: options.category === 'karizma' ? 1.5 : 0,
            borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
            shadow: '0 8px 24px rgba(0,0,0,0.06)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[1].id,
            x: 52,
            y: 8,
            width: 42,
            height: 84,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            borderWidth: options.category === 'karizma' ? 1.5 : 0,
            borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
            shadow: '0 8px 24px rgba(0,0,0,0.06)',
            objectFit: 'cover',
          }
        );
      }
    } else if (batchSize === 3) {
      if (options.category === 'karizma') {
        layoutType = 'karizma-royal-gold';
        pageElements.push(
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[0].id,
            x: 6,
            y: 8,
            width: 54,
            height: 84,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#D4AF37',
            shadow: '0 16px 36px rgba(0,0,0,0.5)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[1].id,
            x: 63,
            y: 10,
            width: 31,
            height: 38,
            rotation: 0,
            zIndex: 2,
            opacity: 1,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: '#D4AF37',
            shadow: '0 12px 24px rgba(0,0,0,0.4)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[2].id,
            x: 63,
            y: 52,
            width: 31,
            height: 38,
            rotation: 0,
            zIndex: 2,
            opacity: 1,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: '#D4AF37',
            shadow: '0 12px 24px rgba(0,0,0,0.4)',
            objectFit: 'cover',
          }
        );
      } else {
        layoutType = 'three-hero-supporting';
        pageElements.push(
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[0].id,
            x: 6,
            y: 8,
            width: 52,
            height: 84,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            shadow: '0 8px 24px rgba(0,0,0,0.07)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[1].id,
            x: 61,
            y: 8,
            width: 33,
            height: 40,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            shadow: '0 6px 16px rgba(0,0,0,0.05)',
            objectFit: 'cover',
          },
          {
            id: generateId('elem'),
            type: 'photo',
            photoId: pagePhotos[2].id,
            x: 61,
            y: 52,
            width: 33,
            height: 40,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            shadow: '0 6px 16px rgba(0,0,0,0.05)',
            objectFit: 'cover',
          }
        );
      }
    } else if (batchSize === 4) {
      layoutType = 'four-luxury-grid';
      const coords = [
        { x: 6, y: 6 },
        { x: 52, y: 6 },
        { x: 6, y: 52 },
        { x: 52, y: 52 },
      ];
      pagePhotos.forEach((p, idx) => {
        pageElements.push({
          id: generateId('elem'),
          type: 'photo',
          photoId: p.id,
          x: coords[idx].x,
          y: coords[idx].y,
          width: 42,
          height: 42,
          rotation: 0,
          zIndex: 1,
          opacity: 1,
          borderRadius: options.category === 'karizma' ? 4 : 2,
          borderWidth: options.category === 'karizma' ? 1.5 : 0,
          borderColor: options.category === 'karizma' ? '#D4AF37' : undefined,
          shadow: '0 6px 16px rgba(0,0,0,0.06)',
          objectFit: 'cover',
        });
      });
    } else {
      // 6-photo collage fallback
      layoutType = 'six-collage';
      const coords = [
        { x: 5, y: 6, w: 44, h: 56 },
        { x: 52, y: 6, w: 43, h: 26 },
        { x: 52, y: 35, w: 43, h: 27 },
        { x: 5, y: 65, w: 28, h: 29 },
        { x: 36, y: 65, w: 28, h: 29 },
        { x: 67, y: 65, w: 28, h: 29 },
      ];
      pagePhotos.forEach((p, idx) => {
        if (coords[idx]) {
          pageElements.push({
            id: generateId('elem'),
            type: 'photo',
            photoId: p.id,
            x: coords[idx].x,
            y: coords[idx].y,
            width: coords[idx].w,
            height: coords[idx].h,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            borderRadius: 2,
            objectFit: 'cover',
          });
        }
      });
    }

    // Optional page corner ornaments
    if (options.includeDecorations && (pageNumber % 3 === 0 || options.category === 'karizma')) {
      pageElements.push({
        id: generateId('elem'),
        type: 'decoration',
        decorationType: 'floral-corner',
        x: 88,
        y: 2,
        width: 10,
        height: 10,
        rotation: 0,
        zIndex: 3,
        opacity: 0.7,
      });
    }

    pages.push({
      id: generateId('page'),
      pageNumber,
      title: `Page ${pageNumber}`,
      layoutType,
      background: defaultBg,
      elements: pageElements,
    });

    pageNumber++;
  }

  // 5. Back Cover / Closing Page
  const backCoverElements: AlbumElement[] = [
    {
      id: generateId('elem'),
      type: 'text',
      text: 'THE END',
      fontFamily: defaultFont,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: 6,
      color: options.category === 'karizma' ? '#D4AF37' : primaryTextColor,
      textAlign: 'center',
      x: 10,
      y: 45,
      width: 80,
      height: 8,
      rotation: 0,
      zIndex: 2,
      opacity: 1,
    },
    {
      id: generateId('elem'),
      type: 'text',
      text: 'Moments cherish forever in love & happiness.',
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 13,
      italic: true,
      color: options.category === 'karizma' ? '#E5C158' : '#888888',
      textAlign: 'center',
      x: 10,
      y: 54,
      width: 80,
      height: 6,
      rotation: 0,
      zIndex: 2,
      opacity: 0.8,
    },
  ];

  if (options.includeDecorations) {
    backCoverElements.push({
      id: generateId('elem'),
      type: 'decoration',
      decorationType: 'gold-divider',
      x: 35,
      y: 62,
      width: 30,
      height: 5,
      rotation: 0,
      zIndex: 3,
      opacity: 0.8,
    });
  }

  pages.push({
    id: generateId('page'),
    pageNumber,
    title: 'Back Cover',
    layoutType: 'cover',
    background: defaultBg,
    elements: backCoverElements,
  });

  return {
    id: projectId,
    name: options.title || 'My Photo Album',
    category: options.category,
    style: options.style,
    size: options.size,
    orientation: options.orientation,
    dimensions,
    cover: {
      title: options.title || 'OUR WEDDING STORY',
      subtitle: options.subtitle || '',
      dateText: options.dateText || '',
      locationText: options.locationText || '',
      coverPhotoId,
      style: options.style,
      fontFamily: defaultFont,
      goldFoil: options.category === 'karizma',
    },
    settings: {
      photosPerPage: options.photosPerPage,
      layoutDensity: options.density,
      includeDecorations: options.includeDecorations,
      fontTheme: defaultFont,
      paletteTheme: options.category === 'karizma' ? 'royal-gold' : 'warm-ivory',
      printBleed: true,
      showRulers: true,
      showGrid: false,
      snapToGrid: true,
      snapToElements: true,
    },
    pages,
    photoCount: photos.length,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
