import { PhotoMetadata } from './album';

export type MosaicTargetType =
  | 'shape'
  | 'letter'
  | 'name'
  | 'word'
  | 'number'
  | 'custom-image'
  | 'custom-silhouette';

export type BuiltInShapeId =
  | 'heart'
  | 'star'
  | 'circle'
  | 'oval'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'crescent'
  | 'cloud'
  | 'sun'
  | 'moon'
  | 'camera'
  | 'flower'
  | 'butterfly'
  | 'crown'
  | 'ring'
  | 'infinity'
  | 'tree'
  | 'house'
  | 'gift'
  | 'cake'
  | 'balloon'
  | 'pet'
  | 'couple-silhouette';

export type MosaicDensity = 'low' | 'medium' | 'high' | 'ultra' | 'ultra-pro' | 'ultra-max';

export type ColorMatchingMode = 'shape-only' | 'color-match' | 'full-tonal' | 'artistic';

export type MosaicGridLayout =
  | 'perfect-aligned'
  | 'irregular-masonry'
  | 'chaos-random'
  | 'brick-staggered'
  | 'variable-scale';

export interface LabColor {
  l: number; // 0 to 100
  a: number; // -128 to 127
  b: number; // -128 to 127
}

export interface RgbColor {
  r: number; // 0 to 255
  g: number;
  b: number;
}

export interface AnalyzedMosaicPhoto {
  id: string;
  metadata: PhotoMetadata;
  averageRgb: RgbColor;
  averageLab: LabColor;
  brightness: number; // 0 to 100
  contrast: number; // 0 to 100
  dominantHue: number; // 0 to 360
  isHeroCandidate: boolean;
}

export type CustomImageRenderMode = 'vector-character' | 'studio-photo' | 'classic-overlay';

export interface MosaicTargetConfig {
  type: MosaicTargetType;
  shapeId?: BuiltInShapeId;
  targetText?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: number;
  textLayout?: 'auto' | 'single-line' | 'stacked' | 'emblem-plaque';
  textOrientation?: 'horizontal' | 'vertical';
  centerDividerEmoji?: string; // e.g. '❤️', '💍', '👑', '✨', 'none'
  centerEmojiScale?: number; // 0.4 to 1.6 (default 0.75)
  centerEmojiX?: number; // 0 to 100 percentage (default 50)
  centerEmojiY?: number; // 0 to 100 percentage (default 50)
  strokeThickness?: number; // 1 to 5
  customImageUrl?: string;
  customImageMaskData?: Uint8Array;
  customImageMode?: 'full-color' | 'silhouette';
  customImageRenderMode?: CustomImageRenderMode; // 'vector-character' (Pikachu/Cartoon style) | 'studio-photo' | 'classic-overlay'
  contourStrokeEnabled?: boolean; // Draw crisp vector contour outlines over the character
  contourStrokeThickness?: number; // 1 to 8 px
  contourStrokeColor?: 'black' | 'dark-accent' | 'gold' | 'white';
  autoSubjectIsolation?: boolean; // Auto-cutout background so background photo tiles stay 100% natural & crisp
  characterColorVibrancy?: number; // 1.0 to 2.0 (boosts yellow/red/vivid cartoon chroma)
  contourLineartUrl?: string; // Cached transparent PNG of the extracted vector outlines
  customImageBlendMode?: 'normal' | 'soft-light' | 'overlay' | 'multiply' | 'studio-hdr' | 'luminosity' | 'pure-mosaic';
  subjectEdgeBoost?: number; // 0.0 to 1.0 (auto edge & contour enhancement)
  backgroundContrastMode?: 'original' | 'studio-high-key' | 'dramatic-dim';
  contrastBoost?: number; // 1.0 to 1.5
  outerTileOpacity?: number; // 0.0 to 1.0
  outerTileFilter?: 'none' | 'monochrome' | 'soft-blur' | 'vignette-dim';
  threshold?: number; // 0 to 255 for custom image mask binarization
  invertMask?: boolean;
}

export interface MosaicTile {
  id: string;
  gridX: number;
  gridY: number;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  width: number; // percentage
  height: number; // percentage
  photoId: string;
  targetRgb: RgbColor;
  photoRgb: RgbColor;
  similarityScore: number; // 0 to 100 (higher = better color match)
  isHeroTile?: boolean;
  isSubject?: boolean; // true if cell is inside the main character/subject (vs background)
  opacity?: number;
}

export interface MosaicSettings {
  density: MosaicDensity;
  gridCols: number; // e.g. 24, 40, 60, 80
  gridRows: number;
  tileGap: number; // px (0 = no gap, 1-4 = micro gap)
  borderRadius: number; // px
  gridLayout?: MosaicGridLayout;
  colorMatchingMode: ColorMatchingMode;
  colorTintBlend: number; // 0.0 (pure photos) to 0.8 (enhanced target color / photo overlay)
  customImageRenderMode?: CustomImageRenderMode;
  contourStrokeEnabled?: boolean;
  contourStrokeThickness?: number;
  contourStrokeColor?: 'black' | 'dark-accent' | 'gold' | 'white';
  autoSubjectIsolation?: boolean;
  characterColorVibrancy?: number;
  customImageBlendMode?: 'normal' | 'soft-light' | 'overlay' | 'multiply' | 'studio-hdr' | 'luminosity' | 'pure-mosaic';
  contrastBoost?: number; // 1.0 to 1.6 (contrast grading)
  vibrancyBoost?: number; // 1.0 to 1.8 (saturation/chroma grading)
  brightnessBoost?: number; // 0.9 to 1.2 (highlight brightness grading)
  eyeCatchingPreset?: 'studio-pop' | 'romantic-glow' | 'vivid-sunshine' | 'monochrome-pop' | 'classic' | 'master-studio-vivid' | 'pure-photo';
  subjectEdgeBoost?: number; // 0.0 to 1.0
  backgroundContrastMode?: 'original' | 'studio-high-key' | 'dramatic-dim';
  useAllPhotosOnce: boolean;
  allowSmartRepetition: boolean;
  tileSourceMode?: 'photos' | 'emojis';
  selectedEmojis?: string[];
  photoFillStrategy?: 'repeat-uploaded' | 'mix-sample-photos';
  heroPhotoId?: string;
  heroScale: number; // 1 to 4 tiles wide
  outerTileOpacity?: number; // 0.0 (transparent/hidden) to 1.0 (fully opaque outer background tiles)
  outerTileFilter?: 'none' | 'monochrome' | 'soft-blur' | 'vignette-dim'; // Style effect for outer background photo tiles
  surfaceFinish?: 'none' | 'acrylic-gloss' | 'fine-art-canvas' | 'brushed-metal' | 'film-grain';
  vignetteStrength?: number; // 0.0 to 0.6
  aestheticFilter?: 'none' | 'royal-gold' | 'kodachrome' | 'noir-silver' | 'golden-hour' | 'cyber-midnight' | 'rose-quartz';
  filterIntensity?: number; // 0.0 to 1.0
  background: {
    type: 'color' | 'gradient' | 'image' | 'transparent';
    value: string;
    imageUrl?: string;
  };
  canvasPreset: '1:1' | '4:5' | '9:16' | '16:9' | 'A4' | 'A3' | '12x12' | '24x24';
  aspectRatio: number;
  overlayText?: {
    text: string;
    subtext?: string;
    position: 'inside' | 'below' | 'above' | 'custom' | 'none';
    fontFamily: string;
    color: string;
    fontSize: number;
    x?: number; // 0 to 100 percentage of canvas width (center = 50)
    y?: number; // 0 to 100 percentage of canvas height (bottom = 90)
    glassEffect?: 'none' | 'frosted-glass' | 'dark-luxury' | 'solid-black' | 'gold-glow' | 'minimal-blur' | 'white-frost';
    glassOpacity?: number; // 0.1 to 1.0 (default e.g. 0.70)
    glassShape?: 'pill' | 'rounded' | 'minimal';
    glassBorderColor?: string;
    textClarity?: 'ultra-pop' | 'deep-shadow' | 'luminous-glow' | 'subtle';
  };
}

export interface MosaicMetrics {
  shapeAccuracy: number; // e.g. 94.5%
  totalGridCells: number;
  shapeActiveCells: number;
  photosUsedCount: number;
  totalPhotosAvailable: number;
  colorMatchScore: number; // e.g. 88.2%
  facePreservationScore: number; // e.g. 97.0%
}

export interface MosaicProject {
  id: string;
  name: string;
  target: MosaicTargetConfig;
  settings: MosaicSettings;
  tiles: MosaicTile[];
  metrics: MosaicMetrics;
  photoCount: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export interface MosaicVariation {
  id: string;
  name: string;
  description: string;
  density: MosaicDensity;
  colorMode: ColorMatchingMode;
  tintBlend: number;
  tileGap: number;
  thumbnail?: string;
}
