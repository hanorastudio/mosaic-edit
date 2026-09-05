'use client';

import React, { useState } from 'react';
import {
  AlbumCategory,
  AlbumSize,
  AlbumOrientation,
  AutoDesignOptions,
} from '@/types/album';
import {
  Sparkles,
  X,
  Layers,
  Crown,
  Heart,
  Cake,
  Baby,
  GraduationCap,
  Plane,
  Users,
  Settings2,
  CheckCircle2,
} from 'lucide-react';

interface AutoDesignModalProps {
  photoCount: number;
  initialCategory?: AlbumCategory;
  onStartAutoDesign: (options: AutoDesignOptions) => Promise<void>;
  onClose: () => void;
}

export const AutoDesignModal: React.FC<AutoDesignModalProps> = ({
  photoCount,
  initialCategory = 'wedding',
  onStartAutoDesign,
  onClose,
}) => {
  const [category, setCategory] = useState<AlbumCategory>(initialCategory);
  const [style, setStyle] = useState<string>('royal-wedding');
  const [title, setTitle] = useState<string>('UMESH & SAKSHI');
  const [subtitle, setSubtitle] = useState<string>('Our Wedding Story');
  const [dateText, setDateText] = useState<string>('2026');
  const [locationText, setLocationText] = useState<string>('Udaipur Palace');
  const [size, setSize] = useState<AlbumSize>('12x12');
  const [orientation, setOrientation] = useState<AlbumOrientation>('square');
  const [density, setDensity] = useState<'sparse' | 'balanced' | 'dense'>('balanced');
  const [photosPerPage, setPhotosPerPage] = useState<'auto' | 1 | 2 | 3 | 4 | 6 | 9>('auto');
  const [includeDecorations, setIncludeDecorations] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const categories: {
    id: AlbumCategory;
    title: string;
    icon: React.ElementType;
    desc: string;
    styles: { id: string; label: string }[];
  }[] = [
    {
      id: 'wedding',
      title: 'Wedding Album',
      icon: Heart,
      desc: 'Royal, Traditional & Luxury wedding spreads',
      styles: [
        { id: 'royal-wedding', label: 'Royal Gold Wedding' },
        { id: 'traditional-indian', label: 'Traditional Indian Wedding' },
        { id: 'luxury-minimal', label: 'Luxury Minimalist' },
        { id: 'floral-romance', label: 'Floral Romance' },
        { id: 'cinematic-wedding', label: 'Cinematic Widescreen' },
        { id: 'couple-story', label: 'Couple Story Chapter' },
      ],
    },
    {
      id: 'karizma',
      title: 'Karizma Album',
      icon: Crown,
      desc: 'Authentic Indian Karizma luxury album styling',
      styles: [
        { id: 'karizma-royal-gold', label: 'Royal Gold & Insets' },
        { id: 'karizma-black-gold', label: 'Black Obsidian & Gold Foil' },
        { id: 'karizma-mandap-varmala', label: 'Mandap & Varmala Spread' },
        { id: 'karizma-floral-traditional', label: 'Traditional Karizma' },
      ],
    },
    {
      id: 'birthday',
      title: 'Birthday Album',
      icon: Cake,
      desc: 'Kids, 1st milestone, party & family birthdays',
      styles: [
        { id: 'kids-birthday', label: 'Kids Fun & Colorful' },
        { id: 'first-birthday', label: '1st Birthday Milestone' },
        { id: 'luxury-birthday', label: 'Luxury Celebration' },
        { id: 'party-fun', label: 'Party Album' },
      ],
    },
    {
      id: 'baby',
      title: 'Baby Album',
      icon: Baby,
      desc: 'Newborn, cute pastel milestones & shower',
      styles: [
        { id: 'newborn-pastel', label: 'Newborn Pastel' },
        { id: 'baby-milestones', label: 'Monthly Milestones' },
        { id: 'baby-shower', label: 'Baby Shower Joy' },
      ],
    },
    {
      id: 'graduation',
      title: 'Graduation & School',
      icon: GraduationCap,
      desc: 'Yearbook, achievements & college memories',
      styles: [
        { id: 'classic-yearbook', label: 'Classic Yearbook' },
        { id: 'achievement-glory', label: 'Achievement Story' },
      ],
    },
    {
      id: 'travel',
      title: 'Travel & Vacation',
      icon: Plane,
      desc: 'Wanderlust, scenic heroes & trip journals',
      styles: [
        { id: 'travel-journal', label: 'Travel Magazine' },
        { id: 'scenic-widescreen', label: 'Scenic Panorama' },
      ],
    },
    {
      id: 'family',
      title: 'Family & Events',
      icon: Users,
      desc: 'Anniversaries, festivals, reunions & events',
      styles: [
        { id: 'family-heritage', label: 'Family Heritage' },
        { id: 'festival-moments', label: 'Festivals & Celebrations' },
      ],
    },
  ];

  const currentCategoryData = categories.find((c) => c.id === category) || categories[0];

  const handleRunDesign = async () => {
    setIsProcessing(true);

    const steps = [
      { text: 'Analyzing photo orientations & aspect ratios...', pct: 22 },
      { text: 'Detecting faces & calculating smart crop coordinates...', pct: 44 },
      { text: 'Clustering event moments & duplicate candidates...', pct: 65 },
      { text: 'Synthesizing professional page layouts...', pct: 83 },
      { text: 'Applying luxury backgrounds & vector ornaments...', pct: 95 },
      { text: 'Finalizing album compilation...', pct: 100 },
    ];

    for (const step of steps) {
      setCurrentStep(step.text);
      setProgressPercent(step.pct);
      await new Promise((r) => setTimeout(r, 260));
    }

    await onStartAutoDesign({
      category,
      style,
      title,
      subtitle,
      dateText,
      locationText,
      size,
      orientation,
      density,
      photosPerPage,
      includeDecorations,
    });

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8A96B] to-[#8B6B38] flex items-center justify-center text-black font-bold shadow-lg">
              <Sparkles className="w-5 h-5 text-[#141414]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#FAF8F5] font-heading flex items-center gap-2">
                <span>AI Auto Design Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] font-mono">
                  {photoCount} Photos Ready
                </span>
              </h3>
              <p className="text-xs text-[#9E9E9E]">
                Select your album theme. The layout engine will craft the entire album automatically.
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-white hover:bg-[#2C2C34] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        {isProcessing ? (
          <div className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[#C8A96B]/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#C8A96B] border-r-[#C8A96B] border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-[#141417] flex items-center justify-center text-[#C8A96B]">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-semibold text-[#FAF8F5] font-heading">
                Generating Your Album...
              </h4>
              <p className="text-sm text-[#C8A96B] font-medium transition-all duration-300">
                {currentStep}
              </p>
            </div>

            <div className="w-full max-w-md bg-[#141417] h-3 rounded-full overflow-hidden border border-[#2C2C34]">
              <div
                className="h-full bg-gradient-to-r from-[#C8A96B] to-[#E5C158] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#9E9E9E]">{progressPercent}% complete</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Category Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider mb-2">
                1. Select Album Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setStyle(cat.styles[0]?.id || 'default');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                        isSelected
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 shadow-[0_0_16px_rgba(200,169,107,0.2)]'
                          : 'border-[#2C2C34] bg-[#141417] hover:border-[#C8A96B]/40 hover:bg-[#1A1A1E]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#C8A96B] text-black' : 'bg-[#2C2C34] text-[#C8A96B]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FAF8F5]">{cat.title}</div>
                        <div className="text-[10px] text-[#9E9E9E] line-clamp-1">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Style Preset Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#C8A96B] uppercase tracking-wider mb-2">
                2. Design Aesthetic / Layout Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentCategoryData.styles.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st.id)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors flex items-center justify-between ${
                      style === st.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-[#FAF8F5]'
                        : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E] hover:text-white hover:border-[#2C2C34]'
                    }`}
                  >
                    <span>{st.label}</span>
                    {style === st.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96B]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Cover Details */}
            <div className="p-4 rounded-xl bg-[#141417] border border-[#2C2C34] space-y-3">
              <div className="text-xs font-semibold text-[#C8A96B] uppercase tracking-wider">
                3. Cover Title & Event Info
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9E9E9E] mb-1">Couple / Event Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. UMESH & SAKSHI"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9E9E9E] mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Our Wedding Story"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9E9E9E] mb-1">Date / Year</label>
                  <input
                    type="text"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9E9E9E] mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="e.g. Udaipur Palace"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1E] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Layout & Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-1">
                  Album Dimensions
                </label>
                <select
                  value={size}
                  onChange={(e) => {
                    const newSize = e.target.value as AlbumSize;
                    setSize(newSize);
                    if (newSize === 'A4' || newSize === 'A3') setOrientation('landscape');
                    else setOrientation('square');
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#141417] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="12x12">12 × 12 inches (Grand Karizma)</option>
                  <option value="10x10">10 × 10 inches (Classic)</option>
                  <option value="8x8">8 × 8 inches (Compact)</option>
                  <option value="A4">A4 Landscape (Print Book)</option>
                  <option value="A3">A3 Deluxe Panorama</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-1">
                  Layout Density
                </label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#141417] border border-[#2C2C34] rounded-lg text-white focus:outline-none focus:border-[#C8A96B]"
                >
                  <option value="sparse">Sparse & Minimalist (1-2 photos/page)</option>
                  <option value="balanced">Balanced Editorial (2-4 photos/page)</option>
                  <option value="dense">High Density Collage (4-6 photos/page)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9E9E] mb-1">
                  Decorations & Accents
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeDecorations(!includeDecorations)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border flex items-center justify-between ${
                    includeDecorations
                      ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-[#FAF8F5]'
                      : 'border-[#2C2C34] bg-[#141417] text-[#9E9E9E]'
                  }`}
                >
                  <span>{includeDecorations ? '✓ Gold & Floral Accents' : 'Clean / No Borders'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!isProcessing && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
            <p className="text-xs text-[#9E9E9E]">
              Processes 100% locally on your computer with zero upload.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white/80 hover:bg-[#2C2C34] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRunDesign}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/25 transition-all transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                ✨ Generate Complete Album
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
