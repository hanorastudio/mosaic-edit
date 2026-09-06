'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, HelpCircle, Shield, Printer, Layers, Video, Menu, X, Upload } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { savePhotosBatch, saveProject } from '@/lib/db';
import { generateId } from '@/lib/utils';

export default function FaqPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleLaunchMosaic = async (typeOrShape: string = 'shape', targetText?: string) => {
    setIsDemoLoading(true);
    try {
      const projectId = generateId('mosaic');
      const sample = await createSampleMosaicPhotoCollection(projectId, 120);
      await savePhotosBatch(sample.photos, sample.blobsMap);

      const isCustom = typeOrShape === 'custom-image' || typeOrShape === 'custom';
      const isText = typeOrShape === 'name' || typeOrShape === 'letter' || (targetText && isNaN(Number(targetText)));
      const isNumber =
        typeOrShape === 'number' ||
        (targetText && !isNaN(Number(targetText)) && typeOrShape !== 'heart' && typeOrShape !== 'star' && typeOrShape !== 'crown');

      const targetType: 'shape' | 'name' | 'number' | 'custom-image' = isCustom
        ? 'custom-image'
        : isNumber
        ? 'number'
        : isText
        ? 'name'
        : 'shape';
      const shapeId =
        typeOrShape === 'heart' || typeOrShape === 'star' || typeOrShape === 'crown'
          ? typeOrShape
          : 'heart';
      const finalTargetText = isCustom ? '' : targetText || (targetType === 'number' ? '25' : 'ANANYA');
      const isTextOrNum = targetType === 'name' || targetType === 'number';

      const customSampleUrl = isCustom ? '/default-custom-pic.png' : undefined;

      const mosaic = await createPhotoMosaic(
        sample.analyzedPhotos,
        {
          type: targetType,
          shapeId: shapeId as any,
          targetText: finalTargetText,
          customImageUrl: customSampleUrl,
          customImageMode: isCustom ? 'full-color' : undefined,
          fontFamily: 'Montserrat, sans-serif',
          textOrientation: 'horizontal',
          centerDividerEmoji: 'none',
          centerEmojiScale: 0.70,
        },
        {
          density: isTextOrNum ? 'ultra' : isCustom ? 'high' : 'medium',
          gridCols: isTextOrNum ? 96 : isCustom ? 60 : 40,
          gridRows: isTextOrNum ? 96 : isCustom ? 60 : 40,
          tileGap: 0,
          borderRadius: 2,
          colorMatchingMode: 'color-match',
          colorTintBlend: isCustom ? 0.35 : 0.0,
          customImageBlendMode: 'studio-hdr',
          useAllPhotosOnce: true,
          allowSmartRepetition: true,
          heroScale: 2,
          background: { type: 'color', value: '#0C0C0E' },
          canvasPreset: '1:1',
          aspectRatio: 1,
          overlayText: isCustom
            ? {
                text: 'CUSTOM PICTURE ART',
                subtext: 'A Lifetime of Beautiful Memories • 2026',
                position: 'below',
                fontFamily: 'Cinzel, serif',
                color: '#C8A96B',
                fontSize: 24,
              }
            : {
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

  const faqs = [
    {
      q: 'Is Aura Mosaic Studio 100% free with no watermarks?',
      a: 'Yes! Aura Mosaic Studio is completely free to use with zero watermarks, no subscription requirements, and no hidden export fees. You can download high-resolution 4K/8K images and 300 DPI print-ready PDFs without any branding.',
    },
    {
      q: 'Do my personal photos get uploaded to an external server?',
      a: 'No. Aura Mosaic Studio operates 100% client-side inside your web browser using HTML5 Canvas, Web Workers, and WebAssembly. Your photos never leave your device or get uploaded to any cloud server, providing maximum privacy for personal, wedding, and family pictures.',
    },
    {
      q: 'How many photos should I upload for the best photo mosaic quality?',
      a: 'We recommend uploading between 50 to 500+ photos. The more photos you provide, the richer and more accurate our CIE-LAB color matching engine can make the macro subject while preserving micro image sharpness.',
    },
    {
      q: 'What is the difference between CIE-LAB color matching and color tinting?',
      a: 'Unlike inferior mosaic makers that place a colored tint over photos (which washes them out), our engine uses CIE-LAB Delta E color science to match photos that naturally have the correct hue, luminosity, and contrast, keeping every photo recognizable upon deep zoom.',
    },
    {
      q: 'Can I create mosaics in custom shapes, names, or milestone numbers?',
      a: 'Yes! You can choose from over 25+ shapes (Hearts, Stars, Crowns, Butterflies), write any name or text ("SAKSHI", "RADHIKA & KABIR"), create milestone numbers ("18", "21", "25", "50"), or upload your own custom silhouette mask.',
    },
    {
      q: 'Can I export 300 DPI files for large canvas prints and posters?',
      a: 'Yes! Aura Mosaic Studio generates ultra-sharp 300 DPI vector PDF files and 8K raster images formatted with professional bleed margins suitable for large-format canvas and poster printing labs.',
    },
    {
      q: 'Can I generate a video animation of my photo mosaic?',
      a: 'Yes. Our built-in Video Maker exports smooth 4K MP4 zoom-in and zoom-out animations showing micro photos assembling into the macro artwork—perfect for Instagram, TikTok, and wedding presentations.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#FAF8F5] flex flex-col selection:bg-[#C8A96B] selection:text-[#141414]">
      {/* Top Navbar */}
      <header className="h-20 border-b border-[#2C2C34]/80 bg-[#141417]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] flex items-center justify-center text-black font-bold shadow-lg shadow-[#C8A96B]/25 shrink-0 transition-transform hover:scale-105">
            <Sparkles className="w-5 h-5 text-[#141414]" />
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
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <button onClick={() => handleLaunchMosaic('heart')} className="hover:text-white transition-colors cursor-pointer">
            Heart Mosaic
          </button>
          <button onClick={() => handleLaunchMosaic('custom-image')} className="hover:text-[#E5C158] text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
            <Upload className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Custom Pic</span>
          </button>
          <button onClick={() => handleLaunchMosaic('name', 'ANANYA')} className="hover:text-white transition-colors cursor-pointer">
            Name Art
          </button>
          <button onClick={() => handleLaunchMosaic('number', '25')} className="hover:text-white transition-colors cursor-pointer">
            Number Art
          </button>
          <Link href="/faq" className="text-[#C8A96B] font-bold hover:text-white transition-colors">
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
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
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
                handleLaunchMosaic('custom-image');
              }}
              className="text-left text-sm font-semibold text-[#E5C158] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#C8A96B]" />
              <span>Custom Pic Mosaic</span>
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
              className="text-sm font-semibold text-[#C8A96B] py-2.5 px-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/20 transition-all active:scale-[0.98]"
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

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-10">
        <div className="text-center space-y-3 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/15 text-xs text-[#C8A96B] font-semibold border border-[#C8A96B]/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & Knowledgebase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Photo Mosaic FAQ & Knowledgebase
          </h1>
          <p className="text-xs sm:text-sm text-[#9E9E9E]">Everything you need to know about creating professional photo mosaics with Aura Mosaic Studio.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="p-6 rounded-2xl bg-[#141417] border border-[#2C2C34] hover:border-[#C8A96B]/40 transition-all space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#FAF8F5] font-heading">{f.q}</h3>
              <p className="text-xs sm:text-sm text-[#9E9E9E] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
