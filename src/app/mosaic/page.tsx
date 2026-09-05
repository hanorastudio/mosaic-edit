'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Upload,
  Layers,
  Printer,
  Heart,
  Crown,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Shapes,
  Type,
  Hash,
  Star,
  Laptop,
  Smartphone,
  Monitor,
  Download,
  Video,
  Sliders,
  Eye,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Check,
  X,
  FileImage,
  Palette,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { savePhotosBatch, saveProject } from '@/lib/db';
import { generateId } from '@/lib/utils';

// FAQ Structured Data for Rich Snippets (Schema.org FAQPage)
const faqData = [
  {
    question: 'Is this photo mosaic maker really 100% free with no watermark?',
    answer:
      'Yes! Aura Mosaic Studio is a 100% free online photo mosaic maker with zero watermarks, no hidden paywalls, and no subscription required. You can generate unlimited photo mosaics and download high-resolution JPG, PNG, and 300 DPI print-ready PDF files completely free.',
  },
  {
    question: 'How do I turn multiple pictures into one picture mosaic online?',
    answer:
      'Simply upload 50 to 1,000+ of your photos, choose your target subject (such as a heart, name, anniversary number, or custom portrait image), select your desired grid density, and click generate. Our intelligent CIE-LAB Delta E algorithm analyzes your photos and assembles them into a stunning photo mosaic within seconds.',
  },
  {
    question: 'Are my personal photos uploaded to a cloud server?',
    answer:
      'No. Aura Mosaic Studio runs 100% client-side in your web browser using HTML5 Canvas, Web Workers, and WebAssembly. Your photos never leave your device or get uploaded to any external server, ensuring complete privacy for sensitive wedding, family, and personal pictures.',
  },
  {
    question: 'Does this mosaic generator work on Mac, Windows, iPhone, and Android?',
    answer:
      'Yes! Aura Mosaic Studio is a universal browser-based photo mosaic creator that runs seamlessly on macOS (Safari, Chrome), Windows 10/11 (Edge, Chrome, Firefox), iPhone/iPad (iOS Safari), and Android mobile devices without downloading any heavy desktop software.',
  },
  {
    question: 'What is the Irregular Masonry Mosaic Grid (6x6 to 1x1)?',
    answer:
      'Unlike traditional rigid square tile generators that repeat the same small box, our advanced irregular masonry generator combines micro and macro photo tiles (6x6, 6x3, 4x4, 4x2, 2x2, 2x1, and 1x1). This creates dynamic visual hierarchy where important portrait photos stand out while smaller pictures form intricate details.',
  },
  {
    question: 'Can I export 300 DPI print-ready photo mosaics for large canvas wall art?',
    answer:
      'Yes! You can export your mosaic in ultra-high resolution up to 8K and download 300 DPI PDF files specifically formatted with bleed margins for large-scale photo canvas printing, framed poster wall art, and anniversary gifts.',
  },
  {
    question: 'Can I generate video animations of my photo mosaic?',
    answer:
      'Yes. Aura Mosaic Studio includes a built-in Video to Mosaic Maker that renders cinematic 4K MP4 zoom-in and zoom-out animations, revealing individual micro pictures transitioning into the grand macro artwork—perfect for Instagram Reels, YouTube, and wedding presentations.',
  },
  {
    question: 'How does CIE-LAB color matching differ from color tinting?',
    answer:
      'Traditional mosaic software simply slaps a colored overlay or tint on top of photos, resulting in washed-out pictures. Aura Mosaic Studio uses scientific CIE-LAB Delta E perceptual color distance matching to find photos that naturally match the target color palette, keeping your micro images crisp and recognizable.',
  },
];

export default function MosaicLandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [interactiveZoom, setInteractiveZoom] = useState<number>(0.4);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleLaunchDemo = async (typeOrShape: string = 'shape', targetText?: string) => {
    setIsDemoLoading(true);
    try {
      const projectId = generateId('mosaic');
      const sample = await createSampleMosaicPhotoCollection(projectId, 120);
      await savePhotosBatch(sample.photos, sample.blobsMap);

      const isText = typeOrShape === 'name' || typeOrShape === 'letter' || (targetText && isNaN(Number(targetText)));
      const isNumber =
        typeOrShape === 'number' ||
        (targetText && !isNaN(Number(targetText)) && typeOrShape !== 'heart' && typeOrShape !== 'star' && typeOrShape !== 'crown');

      const targetType: 'shape' | 'name' | 'number' = isNumber ? 'number' : isText ? 'name' : 'shape';
      const shapeId =
        typeOrShape === 'heart' || typeOrShape === 'star' || typeOrShape === 'crown'
          ? typeOrShape
          : 'heart';
      const finalTargetText = targetText || (targetType === 'number' ? '25' : 'SAKSHI');
      const isTextOrNum = targetType === 'name' || targetType === 'number';

      const mosaic = await createPhotoMosaic(
        sample.analyzedPhotos,
        {
          type: targetType,
          shapeId: shapeId as any,
          targetText: finalTargetText,
          fontFamily: 'Montserrat, sans-serif',
          textOrientation: 'horizontal',
          centerDividerEmoji: 'none',
          centerEmojiScale: 0.70,
        },
        {
          density: isTextOrNum ? 'ultra' : 'medium',
          gridCols: isTextOrNum ? 96 : 40,
          gridRows: isTextOrNum ? 96 : 40,
          tileGap: 0,
          borderRadius: 2,
          colorMatchingMode: 'color-match',
          colorTintBlend: 0.0,
          useAllPhotosOnce: true,
          allowSmartRepetition: true,
          heroScale: 2,
          background: { type: 'color', value: '#0C0C0E' },
          canvasPreset: '1:1',
          aspectRatio: 1,
          overlayText: {
            text: finalTargetText,
            subtext: 'A Lifetime of Beautiful Memories • 2026',
            position: 'below',
            fontFamily: 'Cinzel, serif',
            color: '#C8A96B',
            fontSize: 24,
          },
        }
      );
      mosaic.id = projectId;
      await saveProject(mosaic as any);

      router.push(
        `/mosaic/editor/${projectId}?type=${targetType}&text=${encodeURIComponent(finalTargetText)}&shape=${shapeId}`
      );
    } catch (e) {
      console.error('Failed to launch demo:', e);
      setIsDemoLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#FAF8F5] flex flex-col selection:bg-[#C8A96B] selection:text-[#141414]">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'HowTo',
                name: 'How to Make a Photo Mosaic Online with Free Photo Mosaic Maker',
                description:
                  'Step-by-step guide to turning hundreds of photos into a high-resolution custom photo mosaic online for free with no watermark.',
                step: [
                  {
                    '@type': 'HowToStep',
                    position: 1,
                    name: 'Upload Your Source Photos',
                    text: 'Select 50 to 1,000+ pictures from your phone, computer, or camera roll.',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 2,
                    name: 'Select Target Subject or Shape',
                    text: 'Choose a heart shape, custom name text, milestone number, or upload your own main portrait photograph.',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 3,
                    name: 'Generate AI Photo Mosaic',
                    text: 'Our browser-based engine calculates CIE-LAB color matching and irregular masonry tile placement.',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 4,
                    name: 'Export 4K/8K or 300 DPI Print PDF',
                    text: 'Download high-resolution image files or 300 DPI print-ready PDFs without any watermarks.',
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: faqData.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.answer,
                  },
                })),
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://mosaic.hanorastudio.in',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Online Photo Mosaic Maker',
                    item: 'https://mosaic.hanorastudio.in/mosaic',
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <header className="h-20 border-b border-[#2C2C34]/80 bg-[#141417]/80 backdrop-blur-lg px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] flex items-center justify-center text-[#141414] font-bold shadow-lg shadow-[#C8A96B]/25">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-lg font-bold font-heading tracking-wide text-white">
              AURA <span className="text-[#C8A96B] font-light">MOSAIC</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-[#9E9E9E] border-l border-[#2C2C34] pl-2">
              Shape Art Studio
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#9E9E9E]">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            My Projects
          </Link>
          <button onClick={() => handleLaunchDemo('heart')} className="hover:text-white transition-colors">
            Heart Mosaic
          </button>
          <button onClick={() => handleLaunchDemo('name', 'SAKSHI')} className="hover:text-white transition-colors">
            Name Art
          </button>
          <button onClick={() => handleLaunchDemo('number', '25')} className="hover:text-white transition-colors">
            Number Art
          </button>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/feature-request" className="text-[#E5C158] hover:text-white transition-colors">
            Feature Request
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLaunchDemo('heart')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/20 transition-all transform hover:scale-[1.02]"
          >
            <span>{isDemoLoading ? 'Launching Studio...' : '✨ Create Photo Mosaic Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1E] border border-[#C8A96B]/30 text-xs font-semibold text-[#C8A96B] mb-6 shadow-md backdrop-blur">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>100% Free Online Photo Mosaic Maker • Zero Watermark • 100% Private</span>
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
          Free Photo Mosaic Maker Online — Turn Pictures into One{' '}
          <span className="text-[#C8A96B]">Mosaic Art</span>
        </h1>

        <p className="max-w-3xl text-base sm:text-lg text-[#9E9E9E] mt-6 leading-relaxed">
          The best automatic, browser-based photo mosaic creator. Convert hundreds of your favorite photos into
          a stunning custom photo mosaic, heart art, personalized name art, or anniversary wall poster in seconds.
          Enjoy 4K/8K resolution, 300 DPI print-ready PDF export, and 100% private offline processing on Mac, Windows, iPhone, & Android.
        </p>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            onClick={() => handleLaunchDemo('heart')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-7 py-4 text-sm font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-2xl shadow-xl shadow-[#C8A96B]/25 transition-all transform hover:scale-[1.03]"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Create Heart Photo Mosaic</span>
          </button>

          <button
            onClick={() => handleLaunchDemo('name', 'SAKSHI')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#C8A96B]/40 rounded-2xl transition-all shadow-lg"
          >
            <Type className="w-4 h-4 text-[#C8A96B]" />
            <span>Personalized Name Art (&quot;SAKSHI&quot;)</span>
          </button>

          <button
            onClick={() => handleLaunchDemo('number', '25')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#C8A96B]/40 rounded-2xl transition-all shadow-lg"
          >
            <Hash className="w-4 h-4 text-[#E5C158]" />
            <span>Anniversary Number Art (&quot;25&quot;)</span>
          </button>
        </div>

        {/* Interactive Macro vs Micro Deep-Zoom Visualizer Demo */}
        <div className="mt-16 max-w-4xl w-full p-6 rounded-3xl bg-[#141417] border border-[#C8A96B]/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <span>Interactive Dual-Layer Macro vs Micro Zoom Visualizer</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Drag the zoom slider below to inspect the high-resolution tesserae tiles in real-time.
              </p>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 w-72 max-w-full">
              <ZoomOut className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={interactiveZoom}
                onChange={(e) => setInteractiveZoom(parseFloat(e.target.value))}
                className="w-full accent-[#C8A96B] cursor-pointer"
                aria-label="Interactive zoom control"
              />
              <ZoomIn className="w-4 h-4 text-[#C8A96B]" />
              <span className="font-mono text-xs text-[#C8A96B] font-bold w-12 text-right">
                {Math.round(interactiveZoom * 100)}%
              </span>
            </div>
          </div>

          {/* Scaled Preview Box */}
          <div className="h-80 w-full rounded-2xl overflow-hidden bg-[#0A0A0C] border border-white/10 relative flex items-center justify-center shadow-inner select-none">
            <div
              className="transition-transform duration-100 ease-out origin-center w-72 h-72 rounded-2xl relative flex items-center justify-center p-2"
              style={{
                transform: `scale(${interactiveZoom * 1.3})`,
              }}
            >
              {/* Heart Shape Mosaic Matrix with Color Gradients */}
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 relative">
                {Array.from({ length: 64 }).map((_, i) => {
                  const r = Math.floor(i / 8);
                  const c = i % 8;
                  const inHeart =
                    (r === 1 && (c === 1 || c === 2 || c === 5 || c === 6)) ||
                    (r === 2 && c >= 0 && c <= 7) ||
                    (r === 3 && c >= 0 && c <= 7) ||
                    (r === 4 && c >= 1 && c <= 6) ||
                    (r === 5 && c >= 2 && c <= 5) ||
                    (r === 6 && (c === 3 || c === 4));

                  if (!inHeart) return <div key={i} className="opacity-0" />;

                  const hue = (i * 47) % 360;

                  return (
                    <div
                      key={i}
                      className="rounded-[2px] overflow-hidden relative border border-white/15 shadow-sm flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue}, 70%, 45%), hsl(${(hue + 30) % 360}, 60%, 25%))`,
                      }}
                    >
                      <span className="text-[7px] font-mono font-bold text-white/90 drop-shadow">
                        {interactiveZoom > 1.2 ? `📷 #${i + 1}` : '❤️'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-zinc-400 bg-black/80 px-3 py-1 rounded-lg backdrop-blur border border-white/10">
              {interactiveZoom <= 0.6
                ? '🔍 Far Away: Recognizable Target Image'
                : '🔍 Close Up: Crystal Clear Micro Photographs'}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step How-To Section */}
      <section className="py-20 px-6 md:px-12 bg-[#141417] border-y border-[#2C2C34]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Step-by-Step Guide
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              How to Make a Photo Mosaic Online in 4 Easy Steps
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              The easiest way to make a photo mosaic and turn multiple pictures into one picture mosaic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Add Your Own Photos',
                desc: 'Upload 50 to 1,000+ pictures from your phone, wedding gallery, vacation, or computer.',
                icon: Upload,
              },
              {
                step: '02',
                title: 'Choose Target Subject',
                desc: 'Pick from 25+ shapes (Heart, Star, Butterfly), custom name art ("SAKSHI"), numbers, or upload a custom portrait.',
                icon: Shapes,
              },
              {
                step: '03',
                title: 'AI Color & Masonry Assembly',
                desc: 'Our engine applies CIE-LAB color matching and irregular masonry tile distribution (6x6 to 1x1) instantly.',
                icon: Zap,
              },
              {
                step: '04',
                title: 'Export 4K/8K & 300 DPI PDF',
                desc: 'Download instant high-resolution digital art or 300 DPI print-ready PDFs with zero watermarks.',
                icon: Download,
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] hover:border-[#C8A96B]/40 transition-all space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold font-mono text-[#C8A96B]/30 group-hover:text-[#C8A96B] transition-colors">
                    {st.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#C8A96B]/10 text-[#C8A96B] flex items-center justify-center">
                    <st.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white font-heading">{st.title}</h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features & Tech Grid */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Advanced AI Technology
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Next-Gen AI Photo Mosaic Generator Features
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              Engineered with scientific color theory and irregular tesserae grid architecture for breathtaking visual clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Palette,
                title: 'CIE-LAB Delta E Color Matching',
                desc: 'Scientific perceptual color matching algorithms analyze both tile luminosity and chrominance without washing out your photos.',
              },
              {
                icon: Layers,
                title: 'Multi-Scale Irregular Masonry Grid',
                desc: 'Combines 6x6, 6x3, 4x4, 4x2, 2x2, 2x1, and 1x1 micro/macro tiles for an organic, handcrafted collage effect.',
              },
              {
                icon: Shield,
                title: '100% Private Browser Processing',
                desc: 'All photo processing and rendering occurs client-side in your browser. Zero cloud uploads, 100% security for private photos.',
              },
              {
                icon: Printer,
                title: '300 DPI Print-Ready PDF Export',
                desc: 'Export high-definition 4K, 8K, and 300 DPI vector PDFs with standard bleed margins for professional canvas wall printing.',
              },
              {
                icon: Video,
                title: 'Cinematic 4K MP4 Video Maker',
                desc: 'Render smooth deep-zoom video transitions flying from macro artwork into individual micro photos for social media sharing.',
              },
              {
                icon: Award,
                title: 'No Watermark & Uncapped Freedom',
                desc: 'Create unlimited photo mosaics with zero watermarks, zero subscription fees, and no forced signup walls.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-[#141417] border border-[#2C2C34] hover:border-[#C8A96B]/50 transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C8A96B]/15 text-[#C8A96B] group-hover:scale-110 flex items-center justify-center transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-heading">{f.title}</h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Platform Compatibility Section */}
      <section className="py-20 px-6 md:px-12 bg-[#141417] border-y border-[#2C2C34]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Universal Compatibility
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Photo Mosaic Software for Mac, Windows, iPhone & Android
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              Zero downloads or app store installs required. Instant browser-based performance across all devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Photo Mosaic Software for Mac
              </h3>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Optimized for Apple Silicon (M1/M2/M3/M4) and Safari / Chrome browsers with GPU-accelerated HTML5 Canvas rendering.
              </p>
              <ul className="text-xs text-zinc-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Retina display high-DPI support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Native Mac file system drag & drop</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Best Mosaic Maker for Windows 10/11
              </h3>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                High-performance multi-threaded Web Workers processing large photo libraries on Microsoft Edge, Google Chrome, and Firefox.
              </p>
              <ul className="text-xs text-zinc-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Offline mosaic generator support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>8K multi-monitor preview rendering</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Mosaic Picture App for iPhone & Android
              </h3>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Responsive touch-optimized UI allowing you to pick photos directly from iOS Photos, Google Photos, or your camera gallery.
              </p>
              <ul className="text-xs text-zinc-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct camera roll photo selection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PWA installable app on mobile homescreen</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases & Print Gift Ideas */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Endless Inspiration
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Custom Photo Mosaic Wall Art & Personalized Gifts
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              Create memorable keepsakes for life's most meaningful moments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Wedding Photo Mosaic Creator',
                desc: 'Stitch 500+ candid moments from your pre-wedding shoot, ceremony, and reception into one iconic couple portrait.',
                tag: 'Weddings',
              },
              {
                title: 'Anniversary Photo Mosaic Gift',
                desc: 'Celebrate 10th, 25th (Silver), or 50th (Golden) anniversaries with milestone number mosaics or double hearts.',
                tag: 'Anniversaries',
              },
              {
                title: 'Custom Wall Art & Canvas Prints',
                desc: 'Print museum-quality 300 DPI canvas posters to hang as centerpiece artwork in your living room or studio.',
                tag: 'Home Decor',
              },
              {
                title: 'Memorial & Family Compilation Art',
                desc: 'Honor loved ones with a heritage photo mosaic compiling generations of cherished family photographs.',
                tag: 'Family Heritage',
              },
            ].map((u, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-[#141417] border border-[#2C2C34] hover:border-[#C8A96B]/50 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md bg-[#C8A96B]/15 text-[#C8A96B] inline-block font-semibold">
                    {u.tag}
                  </span>
                  <h3 className="text-base font-bold text-white font-heading">{u.title}</h3>
                  <p className="text-xs text-[#9E9E9E] leading-relaxed">{u.desc}</p>
                </div>
                <button
                  onClick={() => handleLaunchDemo('heart')}
                  className="text-xs font-semibold text-[#C8A96B] hover:text-[#E5C158] flex items-center gap-1.5 pt-3 transition-colors"
                >
                  <span>Create This Art</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section className="py-20 px-6 md:px-12 bg-[#141417] border-y border-[#2C2C34]/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Why Choose Aura Studio
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Aura Mosaic Studio vs. Traditional Mosaic Software
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              See why creators worldwide choose Aura Mosaic Studio over outdated paid tools.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#2C2C34] bg-[#1A1A1E]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2C2C34] bg-[#141417]">
                  <th className="p-4 sm:p-5 font-bold text-white">Feature / Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-[#C8A96B] bg-[#C8A96B]/10">
                    Aura Mosaic Studio (Free)
                  </th>
                  <th className="p-4 sm:p-5 font-medium text-zinc-400">Other Online Tools</th>
                  <th className="p-4 sm:p-5 font-medium text-zinc-400">Desktop Software</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C34]">
                {[
                  {
                    feature: '100% Free with No Watermarks',
                    aura: 'Always Free, Zero Watermarks',
                    other: 'Large Watermark / Paid removal',
                    desktop: '$49 - $199 license required',
                  },
                  {
                    feature: 'Photo Privacy & Local Processing',
                    aura: '100% Local (0 Cloud Uploads)',
                    other: 'Photos uploaded to cloud servers',
                    desktop: 'Local only',
                  },
                  {
                    feature: 'Irregular Masonry Grid (6x6 to 1x1)',
                    aura: 'Dynamic Multi-Scale Tiles',
                    other: 'Rigid identical square tiles only',
                    desktop: 'Limited or complex setup',
                  },
                  {
                    feature: '4K / 8K & 300 DPI Print PDF Export',
                    aura: 'Included Free (Instant)',
                    other: 'Low resolution free / Paid 4K',
                    desktop: 'Manual vector/PDF configuration',
                  },
                  {
                    feature: 'Cinematic 4K MP4 Video Zoom Render',
                    aura: 'Built-in 4K Video Creator',
                    other: 'Not Available',
                    desktop: 'Requires third-party video editor',
                  },
                  {
                    feature: 'Device Compatibility',
                    aura: 'Mac, Windows, iPhone, Android',
                    other: 'Web browser only',
                    desktop: 'Windows or Mac only',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-4 sm:p-5 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-[#C8A96B]/5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{row.aura}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-zinc-400">{row.other}</td>
                    <td className="p-4 sm:p-5 text-zinc-400">{row.desktop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              Everything you need to know about creating custom photo mosaics online.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#141417] border border-[#2C2C34] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-white font-heading">
                      {faq.question}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#1A1A1E] text-[#C8A96B] flex items-center justify-center shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-[#9E9E9E] leading-relaxed border-t border-[#2C2C34]/60 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-[#141417] to-[#0C0C0E] border-t border-[#2C2C34]/80 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] mx-auto flex items-center justify-center text-[#141414] shadow-2xl shadow-[#C8A96B]/30">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Ready to Create Your Custom Photo Mosaic?
          </h2>
          <p className="text-sm text-[#9E9E9E] max-w-xl mx-auto">
            Transform hundreds of memories into a timeless masterpiece today. Free forever, no watermark, 100% private.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleLaunchDemo('heart')}
              disabled={isDemoLoading}
              className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-2xl shadow-2xl shadow-[#C8A96B]/30 transition-all transform hover:scale-[1.03]"
            >
              <Sparkles className="w-4 h-4 fill-current text-black" />
              <span>Start Free Photo Mosaic Maker</span>
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-4 text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#2C2C34] rounded-2xl transition-all shadow-md"
            >
              Open Studio Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
