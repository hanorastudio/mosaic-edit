'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Crown, CheckCircle2, Shield, Printer, Heart, Layers, Sparkle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { savePhotosBatch } from '@/lib/db';
import { generateId } from '@/lib/utils';

export default function KarizmaAlbumsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLaunchKarizmaMosaic = async () => {
    setIsLoading(true);
    try {
      const projectId = generateId('karizma-mosaic');
      const sample = await createSampleMosaicPhotoCollection(projectId, 120);
      await savePhotosBatch(sample.photos, sample.blobsMap);

      const mosaic = await createPhotoMosaic(
        sample.analyzedPhotos,
        {
          type: 'shape',
          shapeId: 'crown' as any,
          fontFamily: 'Montserrat, sans-serif',
        },
        {
          density: 'high',
          gridCols: 48,
          gridRows: 48,
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
            text: 'ROYAL HERITAGE 👑 2026',
            subtext: 'A Timeless Karizma Photo Mosaic Celebration',
            position: 'below',
            fontFamily: 'Cinzel, serif',
            color: '#D4AF37',
            fontSize: 26,
          },
        }
      );
      mosaic.id = projectId;
      router.push(`/mosaic/editor/${projectId}`);
    } catch (e) {
      console.error('Failed to launch karizma demo:', e);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#FAF8F5] flex flex-col selection:bg-[#C8A96B] selection:text-[#141414]">
      {/* Header */}
      <header className="h-20 border-b border-[#2C2C34]/80 bg-[#141417]/80 backdrop-blur-lg px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] flex items-center justify-center text-black font-bold shadow-lg shadow-[#C8A96B]/25">
            <Sparkles className="w-5 h-5 text-[#141414]" />
          </div>
          <div>
            <span className="text-lg font-bold font-heading tracking-wide text-white">
              AURA <span className="text-[#C8A96B] font-light">MOSAIC</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-[#9E9E9E] border-l border-[#2C2C34] pl-2">
              Royal Karizma Edition
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/mosaic" className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:inline-block mr-3">
            All Mosaics
          </Link>
          <button
            onClick={handleLaunchKarizmaMosaic}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#D4AF37] to-[#F39C12] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#D4AF37]/20"
          >
            <span>{isLoading ? 'Synthesizing...' : '👑 Create Royal Mosaic'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-xs text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
            <Crown className="w-3.5 h-3.5" />
            <span>Royal Karizma Indian Photo Mosaic Aesthetics</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
            Authentic Karizma Indian Photo Mosaic Art
          </h1>
          <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
            Inspired by India’s most celebrated royal wedding traditions. Transform hundreds of gold-toned celebration photographs into a magnificent couple mosaic with obsidian black backdrops, rich CIE-LAB color matching, and 300 DPI print export.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleLaunchKarizmaMosaic}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#D4AF37] to-[#F39C12] rounded-2xl shadow-xl shadow-[#D4AF37]/25 hover:scale-105 transition-all"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>Create Karizma Royal Mosaic</span>
            </button>
            <Link
              href="/mosaic"
              className="inline-flex items-center gap-2 px-6 py-4 text-xs font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-[#D4AF37]/40 rounded-2xl transition-all shadow-md"
            >
              <span>Explore All Shapes</span>
            </Link>
          </div>
        </div>

        {/* Karizma Unique Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Royal Gold Palette Calibration',
              desc: 'Specialized color engine tuned for Indian wedding photography: golden zari, marigold florals, and royal red sherwanis.',
            },
            {
              title: 'Mandap & Varmala Insets',
              desc: 'High-density micro tiles ensuring every family blessing and sacred ritual is clearly visible on deep zoom.',
            },
            {
              title: '300 DPI Luxury Canvas Ready',
              desc: 'Export in ultra-sharp 4K/8K and 300 DPI PDF ready for gold-framed centerpiece wall printing.',
            },
          ].map((feat) => (
            <div key={feat.title} className="p-7 rounded-2xl bg-[#141417] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all space-y-3">
              <h3 className="text-base font-bold text-[#D4AF37] font-heading">{feat.title}</h3>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
