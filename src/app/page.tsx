'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Shield,
  ShieldCheck,
  Lock,
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
  Menu,
  X,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { savePhotosBatch, saveProject } from '@/lib/db';
import { generateId } from '@/lib/utils';

const HERO_BADGE_PHRASES = [
  { text: 'Hundreds of Photos. One Incredible Picture.', icon: Shield, color: 'text-emerald-400' },
  { text: 'Zero Cloud Upload • 100% In-Browser', icon: ShieldCheck, color: 'text-emerald-400' },
  { text: '100% Secure & Private Processing', icon: Lock, color: 'text-cyan-400' },
  { text: '100% Free Forever • No Watermark', icon: Sparkles, color: 'text-[#E5C158]' },
];

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [interactiveZoom, setInteractiveZoom] = useState<number>(0.4);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [badgeIndex, setBadgeIndex] = useState<number>(0);
  const [isBadgeFading, setIsBadgeFading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsBadgeFading(true);
      setTimeout(() => {
        setBadgeIndex((prev) => (prev + 1) % HERO_BADGE_PHRASES.length);
        setIsBadgeFading(false);
      }, 300);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchMosaic = async (typeOrShape: string = 'shape', targetText?: string) => {
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
      const finalTargetText = targetText || (targetType === 'number' ? '25' : 'ANANYA');
      const isTextOrNum = targetType === 'name' || targetType === 'number';

      const mosaic = await createPhotoMosaic(
        sample.analyzedPhotos,
        {
          type: targetType,
          shapeId: shapeId as any,
          targetText: finalTargetText,
          fontFamily: 'Montserrat, sans-serif',
          textOrientation: 'horizontal',
          centerDividerEmoji: '❤️',
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

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#FAF8F5] flex flex-col selection:bg-[#C8A96B] selection:text-[#141414]">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#2C2C34]/80 bg-[#141417]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] flex items-center justify-center text-[#141414] font-bold shadow-lg shadow-[#C8A96B]/25 shrink-0 transition-transform hover:scale-105">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-semibold text-[#9E9E9E]">
          <Link href="/" className="text-[#C8A96B] font-bold hover:text-white transition-colors">
            Home
          </Link>
          <button onClick={() => handleLaunchMosaic('heart')} className="hover:text-white transition-colors cursor-pointer">
            Heart Mosaic
          </button>
          <button onClick={() => handleLaunchMosaic('name', 'ANANYA')} className="hover:text-white transition-colors cursor-pointer">
            Name Art
          </button>
          <button onClick={() => handleLaunchMosaic('number', '25')} className="hover:text-white transition-colors cursor-pointer">
            Number Art
          </button>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            My Creations
          </Link>
          <Link href="/feature-request" className="text-[#E5C158] hover:text-white transition-colors flex items-center gap-1">
            <span>Feature Request</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleLaunchMosaic('heart')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{isDemoLoading ? 'Synthesizing Art...' : '✨ Create Photo Art'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#1E1E24] border border-[#2C2C34] text-[#9E9E9E] hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          />
          <div className="lg:hidden border-b border-[#2C2C34] bg-[#141417]/98 backdrop-blur-2xl px-6 py-5 flex flex-col gap-2 sticky top-20 z-40 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#C8A96B] py-2.5 px-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/20 transition-all active:scale-[0.98]"
            >
              Home
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchMosaic('heart');
              }}
              className="text-left text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Heart Mosaic
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchMosaic('name', 'ANANYA');
              }}
              className="text-left text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Name Art
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchMosaic('number', '25');
              }}
              className="text-left text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Number Art
            </button>
            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              FAQ
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              My Creations
            </Link>
            <Link
              href="/feature-request"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#E5C158] hover:text-white py-2.5 px-3 rounded-xl bg-[#E5C158]/10 border border-[#E5C158]/20 transition-all active:scale-[0.98]"
            >
              ✨ Feature Request
            </Link>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />

        {(() => {
          const currentBadge = HERO_BADGE_PHRASES[badgeIndex];
          const BadgeIcon = currentBadge.icon;
          return (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1E] border border-[#C8A96B]/30 text-xs font-semibold text-[#C8A96B] mb-6 shadow-md backdrop-blur transition-all duration-300">
              <BadgeIcon className={`w-4 h-4 shrink-0 transition-colors duration-300 ${currentBadge.color}`} />
              <span
                className={`transition-all duration-300 transform inline-block ${
                  isBadgeFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              >
                {currentBadge.text}
              </span>
            </div>
          );
        })()}

        <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
          Turn Hundreds of Photos into a Heart, Name, or Shape —{' '}
          <span className="text-[#C8A96B]">Automatically.</span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-[#9E9E9E] mt-6 leading-relaxed">
          From far away, see a stunning Heart, Name, or Silhouette. Zoom in, and every single photograph is
          crystal clear. 100% private client-side processing with 4K/8K and 300 DPI print export.
        </p>

        {/* 1-Click Launch Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            onClick={() => handleLaunchMosaic('heart')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-7 py-4 text-sm font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-2xl shadow-xl shadow-[#C8A96B]/25 transition-all transform hover:scale-[1.03]"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Create Heart Photo Art</span>
          </button>

          <button
            onClick={() => handleLaunchMosaic('name', 'ANANYA')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#C8A96B]/40 rounded-2xl transition-all shadow-lg"
          >
            <Type className="w-4 h-4 text-[#C8A96B]" />
            <span>Create Name Art (&quot;ANANYA&quot;)</span>
          </button>

          <button
            onClick={() => handleLaunchMosaic('number', '25')}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#C8A96B]/40 rounded-2xl transition-all shadow-lg"
          >
            <Hash className="w-4 h-4 text-[#E5C158]" />
            <span>Anniversary / Birthday (&quot;25&quot;)</span>
          </button>
        </div>

        {/* Interactive Macro vs Micro Deep-Zoom Visualizer Demo */}
        <div className="mt-16 max-w-4xl w-full p-6 rounded-3xl bg-[#141417] border border-[#C8A96B]/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <span>Interactive Macro vs Micro Zoom Experience</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Drag the zoom slider below to inspect the dual-layer effect in real-time.
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
              {/* Heart Shape Mosaic Matrix with Real Photography Styling */}
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 relative">
                {Array.from({ length: 64 }).map((_, i) => {
                  const r = Math.floor(i / 8);
                  const c = i % 8;
                  // Heart mask
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
                ? '🔍 Far Away: Recognizable Heart'
                : '🔍 Close Up: Individual Photographs'}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="py-20 px-6 md:px-12 bg-[#141417] border-y border-[#2C2C34]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              3 Simple Steps
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">How Photo Art is Created</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Add Your Photos',
                desc: 'Select 100 to 1000+ local photos from your wedding, birthday, or vacation.',
              },
              {
                step: '02',
                title: 'Pick Shape, Name or Number',
                desc: 'Choose from 25+ shapes, letters, names ("SAKSHI"), or upload a custom silhouette.',
              },
              {
                step: '03',
                title: 'Watch the Magic & Export',
                desc: 'Our AI engine organizes, color-matches and outputs 4K/8K art and 300 DPI print PDFs.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] space-y-3 relative"
              >
                <span className="text-3xl font-bold font-mono text-[#C8A96B]/30">{st.step}</span>
                <h4 className="text-base font-bold text-white font-heading">{st.title}</h4>
                <p className="text-xs text-[#9E9E9E]">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Gallery Showcase */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Limitless Possibilities
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">
              Create Any Shape, Name, Letter or Number
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'Heart Art', icon: Heart, shapeId: 'heart' },
              { name: 'Name Art', icon: Type, shapeId: 'name', text: 'ANANYA' },
              { name: 'Number Art', icon: Hash, shapeId: 'number', text: '25' },
              { name: 'Star Art', icon: Star, shapeId: 'star' },
              { name: 'Crown Art', icon: Crown, shapeId: 'crown' },
              { name: 'Custom Silhouette', icon: Upload, shapeId: 'custom-image' },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => handleLaunchMosaic(item.shapeId, item.text)}
                className="p-5 rounded-2xl bg-[#141417] hover:bg-[#1A1A1E] border border-[#2C2C34] hover:border-[#C8A96B]/50 flex flex-col items-center gap-3 text-center transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C8A96B]/15 text-[#C8A96B] group-hover:scale-110 flex items-center justify-center transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Photo Mosaic Studios Explore Showcase */}
      <section className="py-20 px-6 md:px-12 bg-[#141417] border-y border-[#2C2C34]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
              Specialized Mosaic Studios
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">
              Professional Photo Mosaics for Every Occasion
            </h2>
            <p className="text-xs text-[#9E9E9E]">
              From wedding couple portraits to milestone birthday numbers, personalized name art, and irregular masonry collages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/mosaic"
              className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#C8A96B]/30 hover:border-[#C8A96B] transition-all group space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Free Photo Mosaic Maker Online
                </h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Turn hundreds of photos into a heart, name, custom portrait, or irregular masonry collage with no watermark, 4K/8K resolution, and 300 DPI print PDF export.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#C8A96B] group-hover:text-[#E5C158]">
                <span>Launch Mosaic Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/wedding-albums"
              className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] hover:border-[#C8A96B]/50 transition-all group space-y-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Wedding Photo Mosaic Creator
                </h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Stitch 500+ candid moments from your pre-wedding shoot, ceremony, and reception into one iconic couple portrait, royal mandap, or monogram mosaic.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-[#C8A96B]">
                <span>Create Wedding Mosaic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/birthday-albums"
              className="p-8 rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] hover:border-[#C8A96B]/50 transition-all group space-y-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Birthday & Milestone Photo Mosaics
                </h3>
                <p className="text-xs text-[#9E9E9E] leading-relaxed">
                  Create personalized milestone number mosaics (&quot;1&quot;, &quot;18&quot;, &quot;21&quot;, &quot;25&quot;, &quot;50&quot;) compiling hundreds of cherished birthday and anniversary party memories.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-[#C8A96B]">
                <span>Create Birthday Mosaic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
