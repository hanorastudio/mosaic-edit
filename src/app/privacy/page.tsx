'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#121214] text-[#FAF8F5] flex flex-col">
      <header className="h-20 border-b border-[#2C2C34] bg-[#141417]/80 backdrop-blur-lg px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C8A96B] to-[#8B6B38] flex items-center justify-center text-black font-bold">
            <Sparkles className="w-5 h-5 text-[#141414]" />
          </div>
          <span className="text-base font-bold font-heading text-white">
            AURA <span className="text-[#C8A96B] font-light">STUDIO</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#141414] bg-[#C8A96B] hover:bg-[#E5C158] rounded-xl transition-all"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 space-y-6 text-xs text-[#9E9E9E] leading-relaxed">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              Privacy Policy — 100% Local Guarantee
            </h1>
            <p className="text-[11px] text-[#C8A96B]">Your photos stay strictly on your device.</p>
          </div>
        </div>

        <p>
          At Aura Mosaic Studio, we believe personal family photographs, intimate wedding moments, and
          cherished milestone memories should remain strictly private.
        </p>

        <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">
          1. Zero Cloud Uploads
        </h3>
        <p>
          All image analysis (orientation, sharpness heuristics, perceptual duplicate hashing, face
          focal point estimation), layout synthesis, canvas rendering, and PDF compilation take
          place entirely within your web browser using HTML5 Canvas, Web Workers, and IndexedDB.
        </p>

        <h3 className="text-sm font-bold text-white uppercase tracking-wider pt-4">
          2. Local Storage Persistence
        </h3>
        <p>
          Your project files and images are persisted locally in your browser’s IndexedDB database.
          They are never transmitted to external cloud databases.
        </p>
      </main>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
