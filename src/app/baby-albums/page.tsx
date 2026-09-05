'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Baby, Heart, Star, Printer, Gift } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { savePhotosBatch } from '@/lib/db';
import { generateId } from '@/lib/utils';

export default function BabyAlbumsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLaunchBabyMosaic = async () => {
    setIsLoading(true);
    try {
      const projectId = generateId('baby-mosaic');
      const sample = await createSampleMosaicPhotoCollection(projectId, 120);
      await savePhotosBatch(sample.photos, sample.blobsMap);

      const mosaic = await createPhotoMosaic(
        sample.analyzedPhotos,
        {
          type: 'name',
          targetText: 'LITTLE AARAV',
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
            text: 'WELCOME LITTLE ANGEL 🍼',
            subtext: 'First Year Memories • Pure Love & Wonder',
            position: 'below',
            fontFamily: 'Cinzel, serif',
            color: '#34D399',
            fontSize: 26,
          },
        }
      );
      mosaic.id = projectId;
      router.push(`/mosaic/editor/${projectId}`);
    } catch (e) {
      console.error('Failed to launch baby demo:', e);
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
              Baby & Family Edition
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/mosaic" className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:inline-block mr-3">
            All Mosaics
          </Link>
          <button
            onClick={handleLaunchBabyMosaic}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-emerald-400 to-[#E5C158] hover:brightness-110 rounded-xl transition-all shadow-md shadow-emerald-400/20"
          >
            <span>{isLoading ? 'Synthesizing...' : '🍼 Create Baby Mosaic'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-xs text-emerald-400 font-semibold border border-emerald-500/30">
            <Baby className="w-3.5 h-3.5" />
            <span>Baby First Year & Family Mosaic Studio</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.12]">
            Baby First Year & Family Heritage Photo Mosaics
          </h1>
          <p className="text-sm sm:text-base text-[#9E9E9E] leading-relaxed">
            Compile 12-month baby growth milestones, tender newborn portraits, baby showers, and family heritage snapshots into an iconic centerpiece baby silhouette or personalized name mosaic.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={handleLaunchBabyMosaic}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold text-[#141414] bg-gradient-to-r from-emerald-400 to-[#E5C158] rounded-2xl shadow-xl shadow-emerald-400/25 hover:scale-105 transition-all"
            >
              <Baby className="w-4 h-4 text-black" />
              <span>Create Baby Name Mosaic Art</span>
            </button>
            <Link
              href="/mosaic"
              className="inline-flex items-center gap-2 px-6 py-4 text-xs font-semibold text-white bg-[#1A1A1E] hover:bg-[#25252C] border border-emerald-400/40 rounded-2xl transition-all shadow-md"
            >
              <span>Explore All Shapes</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '12-Month Growth Timeline',
              desc: 'Organize month-by-month pictures from birth to age 1 into a single adorable baby face or baby footprint mosaic.',
              icon: Baby,
            },
            {
              title: 'Nursery Room Canvas Print',
              desc: 'Export high-definition 300 DPI vector PDFs designed for large nursery wall frames and personalized newborn gifts.',
              icon: Printer,
            },
            {
              title: 'Family Heritage Compilation',
              desc: 'Blend generations of family love—grandparents, parents, and baby—into one timeless heritage mosaic artwork.',
              icon: Heart,
            },
          ].map((feat) => (
            <div key={feat.title} className="p-7 rounded-2xl bg-[#141417] border border-[#2C2C34] hover:border-emerald-400/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">{feat.title}</h3>
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
