export type PhotoOrientation = 'portrait' | 'landscape' | 'square';

export interface PhotoFocalPoint {
  x: number; // 0 to 1 (percentage from left)
  y: number; // 0 to 1 (percentage from top)
}

export interface PhotoMetadata {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: PhotoOrientation;
  thumbnail: string; // Base64 or Blob URL for fast UI rendering
  hash: string; // Perceptual difference hash
  sharpness: number; // 0 to 100
  brightness: number; // 0 to 100
  contrast: number; // 0 to 100
  facesDetected: number;
  focalPoint: PhotoFocalPoint;
  favorite: boolean;
  isDuplicateCandidate: boolean;
  duplicateGroupId?: string;
  isBlurry: boolean;
  dateTaken?: string;
  timestamp?: number;
  usedCount: number;
}

export type AlbumCategory =
  | 'wedding'
  | 'karizma'
  | 'birthday'
  | 'baby'
  | 'graduation'
  | 'travel'
  | 'family'
  | 'anniversary'
  | 'event'
  | 'custom';

export type AlbumSize = '8x8' | '10x10' | '12x12' | 'A4' | 'A3' | 'custom';
export type AlbumOrientation = 'square' | 'landscape' | 'portrait';

export interface PageDimensions {
  width: number; // in pixels at base display scale
  height: number;
  dpi: number;
  bleedMm: number;
  safeMarginMm: number;
  aspectRatio: number;
  physicalWidthInches: number;
  physicalHeightInches: number;
}

export type ElementType = 'photo' | 'text' | 'decoration' | 'shape';

export interface ElementCrop {
  x: number; // percentage offset -50 to 50
  y: number; // percentage offset -50 to 50
  scale: number; // 1 to 3
}

export interface ElementFilter {
  brightness?: number; // 0 to 200 (100 is normal)
  contrast?: number; // 0 to 200
  saturate?: number; // 0 to 200
  grayscale?: number; // 0 to 100
  sepia?: number; // 0 to 100
  warmth?: number; // -100 to 100
  vignette?: number; // 0 to 100
  blur?: number; // px
}

export interface AlbumElement {
  id: string;
  type: ElementType;
  x: number; // 0 to 100% of page width
  y: number; // 0 to 100% of page height
  width: number; // 0 to 100% of page width
  height: number; // 0 to 100% of page height
  rotation: number; // -180 to 180 deg
  zIndex: number;
  opacity: number; // 0 to 1

  // Photo element properties
  photoId?: string;
  crop?: ElementCrop;
  objectFit?: 'cover' | 'contain';
  borderRadius?: number; // px
  borderWidth?: number; // px
  borderColor?: string;
  shadow?: string; // CSS box-shadow definition or preset
  filter?: ElementFilter;
  maskShape?: 'none' | 'circle' | 'arch' | 'oval' | 'heart' | 'diamond';

  // Text element properties
  text?: string;
  fontSize?: number; // in pt or relative px
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number; // px
  lineHeight?: number;
  italic?: boolean;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';

  // Decoration & Ornament element properties
  decorationType?:
    | 'gold-divider'
    | 'floral-corner'
    | 'ornament-badge'
    | 'luxury-frame'
    | 'mandap-arch'
    | 'varmala-motif'
    | 'geometric-line'
    | 'star'
    | 'heart'
    | 'ring'
    | 'crown'
    | 'custom-svg';
  svgPath?: string;
  strokeWidth?: number;

  // Shape element properties
  shapeType?: 'rectangle' | 'circle' | 'line';
  fill?: string;
  stroke?: string;
}

export type PageLayoutType =
  | 'cover'
  | 'intro-story'
  | 'story'
  | 'full-hero'
  | 'two-split-h'
  | 'two-split-v'
  | 'three-triptych'
  | 'three-hero-supporting'
  | 'four-luxury-grid'
  | 'four-dynamic'
  | 'six-collage'
  | 'nine-mosaic'
  | 'magazine-editorial'
  | 'cinematic-widescreen'
  | 'couple-focus'
  | 'karizma-royal-gold'
  | 'karizma-ornate-spread'
  | 'karizma-portrait-inset'
  | 'custom';

export interface PageBackground {
  type: 'color' | 'gradient' | 'texture' | 'image';
  value: string; // Hex, gradient string, or texture identifier
  overlayOpacity?: number; // 0 to 1
}

export interface AlbumPage {
  id: string;
  pageNumber: number;
  title?: string;
  layoutType: PageLayoutType;
  background: PageBackground;
  elements: AlbumElement[];
  isSpreadLeft?: boolean;
  isSpreadRight?: boolean;
}

export interface AlbumCoverConfig {
  title: string;
  subtitle: string;
  dateText: string;
  locationText: string;
  coverPhotoId?: string;
  style: string;
  fontFamily: string;
  goldFoil: boolean;
}

export interface AlbumSettings {
  photosPerPage: 'auto' | 1 | 2 | 3 | 4 | 6 | 9;
  layoutDensity: 'sparse' | 'balanced' | 'dense';
  includeDecorations: boolean;
  fontTheme: string;
  paletteTheme: string;
  printBleed: boolean;
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToElements: boolean;
}

export interface AlbumProject {
  id: string;
  name: string;
  category: AlbumCategory;
  style: string;
  size: AlbumSize;
  orientation: AlbumOrientation;
  dimensions: PageDimensions;
  cover: AlbumCoverConfig;
  settings: AlbumSettings;
  pages: AlbumPage[];
  photoCount: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: AlbumCategory | 'all';
  style: string;
  photoCount: number;
  layoutType: PageLayoutType;
  thumbnailSvg?: string;
  previewUrl?: string;
  description: string;
  elements: Omit<AlbumElement, 'id'>[];
  defaultBackground: PageBackground;
}

export interface AnalysisProgress {
  total: number;
  processed: number;
  currentStep: string;
  stage: 'reading' | 'thumbnails' | 'analysis' | 'grouping' | 'layouts' | 'finalizing' | 'done';
  percent: number;
  duplicatesFound: number;
  blurryFound: number;
}

export interface AutoDesignOptions {
  category: AlbumCategory;
  style: string;
  title: string;
  subtitle: string;
  dateText: string;
  locationText: string;
  size: AlbumSize;
  orientation: AlbumOrientation;
  density: 'sparse' | 'balanced' | 'dense';
  photosPerPage: 'auto' | 1 | 2 | 3 | 4 | 6 | 9;
  includeDecorations: boolean;
  targetPageCount?: number;
  variationType?: 'default' | 'luxury' | 'minimal' | 'cinematic' | 'more-photos' | 'fewer-photos' | 'traditional';
}
