'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  ExternalLink,
  ShieldCheck,
  Printer,
  Layers,
  Crown,
  Lock,
  Phone,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0E0E10] border-t border-[#232328] text-[#FAF8F5] select-none">
      {/* Top Banner / Studio Identity Callout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#232328]">
          {/* Main Brand Column (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C8A96B] to-[#8B6B38] flex items-center justify-center text-black font-bold shadow-md shadow-[#C8A96B]/20">
                <Sparkles className="w-5 h-5 text-[#141414]" />
              </div>
              <div>
                <span className="text-lg font-extrabold font-heading text-white tracking-wide">
                  AURA <span className="text-[#C8A96B] font-light">STUDIO</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A0A0AB] leading-relaxed max-w-sm">
              AI-driven photographic shape art & mosaic synthesis platform.
              Crafting stunning photographic mosaics with deep-zoom micro details, anti-clustering
              intelligence, and 100% private client-side rendering.
            </p>

            {/* Owned by Hanora Studio Highlight Badge with Reflection Loop Animation */}
            <div className="pt-2">
              <a
                href="https://www.hanorastudio.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1A1A20] via-[#22222B] to-[#1A1A20] border border-[#C8A96B]/40 hover:border-[#E5C158] text-xs font-semibold text-white shadow-lg hover:shadow-[#C8A96B]/25 transition-all group animate-gold-pulse"
              >
                {/* Reflection Sweep Light Beam Loop */}
                <div
                  className="absolute inset-0 -top-1 -bottom-1 w-[45%] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-reflection-loop z-0"
                  aria-hidden="true"
                />
                {/* Secondary Warm Gold Sheen Accent */}
                <div
                  className="absolute inset-0 -top-1 -bottom-1 w-[25%] bg-gradient-to-r from-transparent via-[#E5C158]/40 to-transparent pointer-events-none animate-reflection-loop z-0"
                  style={{ animationDelay: '0.12s' }}
                  aria-hidden="true"
                />

                <Crown className="w-4 h-4 text-[#C8A96B] group-hover:scale-110 group-hover:text-[#E5C158] transition-all relative z-10 shrink-0" />
                <span className="text-zinc-300 relative z-10">
                  Owned & Crafted by{' '}
                  <strong className="text-[#E5C158] font-bold group-hover:underline">
                    Hanora Studio
                  </strong>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C8A96B] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-[#E5C158] transition-all relative z-10 shrink-0" />
              </a>
            </div>
          </div>

          {/* Column 1: Photo Art & Mosaics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#C8A96B]">
              Photo Art & Shapes
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link
                  href="/mosaic"
                  className="hover:text-white hover:text-[#C8A96B] transition-colors flex items-center gap-1.5"
                >
                  <Heart className="w-3 h-3 text-[#C8A96B]/70" />
                  <span>Heart Photo Mosaic</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/mosaic"
                  className="hover:text-white hover:text-[#C8A96B] transition-colors"
                >
                  Name & Word Photo Art
                </Link>
              </li>
              <li>
                <Link
                  href="/mosaic"
                  className="hover:text-white hover:text-[#C8A96B] transition-colors"
                >
                  Number & Date Art
                </Link>
              </li>
              <li>
                <Link
                  href="/mosaic"
                  className="hover:text-white hover:text-[#C8A96B] transition-colors"
                >
                  Custom Silhouette Masks
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white hover:text-[#C8A96B] transition-colors font-semibold text-zinc-300"
                >
                  Open Studio Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Studio Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#C8A96B]">
              Studio Features
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/mosaic" className="hover:text-white transition-colors">
                  Interactive Deep-Zoom Loupe
                </Link>
              </li>
              <li>
                <Link href="/mosaic" className="hover:text-white transition-colors">
                  Anti-Adjacency Engine
                </Link>
              </li>
              <li>
                <Link href="/mosaic" className="hover:text-white transition-colors">
                  4K / 8K Ultra Export
                </Link>
              </li>
              <li>
                <Link href="/mosaic" className="hover:text-white transition-colors">
                  Print-Ready 300 DPI PDF
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Mosaic Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio & Hanora Studio Link */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#C8A96B]">
              Hanora Studio & Support
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a
                  href="https://www.hanorastudio.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E5C158] hover:text-white font-semibold transition-colors flex items-center gap-1 group"
                >
                  <span>Hanora Studio Official</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/feature-request"
                  className="text-[#E5C158] hover:text-white font-bold transition-colors flex items-center gap-1"
                >
                  <span>✨ Feature Request & Issues</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/918482961442?text=Hi%20Hanora%20Studio%2C%20I%20have%20a%20feature%20request%20%2F%20inquiry%20for%20Aura%20Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:text-white font-semibold transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 fill-current" />
                  <span>WhatsApp: +91 8482961442</span>
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy (100% Local)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ & Support
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Zero Cloud Uploads</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-b border-[#232328]/60 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141417] border border-[#232328]">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">100% Private & In-Browser</div>
              <div className="text-[10px] text-zinc-400">Photos never leave your device</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141417] border border-[#232328]">
            <Printer className="w-5 h-5 text-[#C8A96B] shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Print-Ready 300 DPI PDF</div>
              <div className="text-[10px] text-zinc-400">Ultra-sharp 4K & 8K canvas output</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141417] border border-[#232328]">
            <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Anti-Adjacency Engine</div>
              <div className="text-[10px] text-zinc-400">No duplicate touching photos</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141417] border border-[#232328]">
            <Crown className="w-5 h-5 text-[#E5C158] shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px]">Hanora Studio Technology</div>
              <div className="text-[10px] text-zinc-400">Premium creative synthesis</div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Ownership Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()}{' '}
            <span className="text-zinc-300 font-semibold">Aura Mosaic Studio</span> by{' '}
            <a
              href="https://www.hanorastudio.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E5C158] hover:text-white font-bold hover:underline transition-colors"
            >
              Hanora Studio
            </a>
            . All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-center sm:text-right">
            <span>Owned & Developed by</span>
            <a
              href="https://www.hanorastudio.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E5C158] hover:text-white font-bold hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Hanora Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-zinc-600 hidden xs:inline">•</span>
            <span className="text-zinc-400 hidden xs:inline">www.hanorastudio.in</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
