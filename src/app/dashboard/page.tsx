'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Search,
  FolderUp,
  Layers,
  Heart,
  Crown,
  Type,
  Hash,
  Upload,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Menu,
  Loader2,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { getAllProjects, deleteProject, duplicateProject, savePhotosBatch, saveProject } from '@/lib/db';
import { createSampleMosaicPhotoCollection } from '@/lib/mosaic/sampleMosaicData';
import { createPhotoMosaic } from '@/lib/mosaic/mosaicEngine';
import { batchProcessPhotos } from '@/lib/engine/smartAnalysis';
import { generateId } from '@/lib/utils';
import { MosaicProject } from '@/types/mosaic';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // New Mosaic Creation Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetType, setTargetType] = useState<'shape' | 'name' | 'number' | 'custom'>('shape');
  const [selectedShape, setSelectedShape] = useState<string>('heart');
  const [targetText, setTargetText] = useState<string>('ANANYA');
  const [projectName, setProjectName] = useState<string>('My Heart Photo Art');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      const projs = await getAllProjects();
      setProjects(projs);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mosaic project?')) {
      await deleteProject(id);
      await refreshProjects();
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProject(id);
      await refreshProjects();
    } catch (e) {
      console.error('Failed to duplicate:', e);
    }
  };

  // Launch 1-Click Demo
  const handleLaunchQuickMosaic = async (shape: string, text?: string) => {
    setIsLoading(true);
    try {
      const projectId = generateId('mosaic');
      const sample = await createSampleMosaicPhotoCollection(projectId, 120);
      await savePhotosBatch(sample.photos, sample.blobsMap);

      const isCustom = shape === 'custom-image' || shape === 'custom';
      const isText = shape === 'name' || shape === 'letter' || (text && isNaN(Number(text)));
      const isNumber =
        shape === 'number' ||
        (text && !isNaN(Number(text)) && shape !== 'heart' && shape !== 'star' && shape !== 'crown');

      const targetType: 'shape' | 'name' | 'number' | 'custom-image' = isCustom
        ? 'custom-image'
        : isNumber
        ? 'number'
        : isText
        ? 'name'
        : 'shape';
      const shapeId = shape === 'heart' || shape === 'star' || shape === 'crown' ? shape : 'heart';
      const finalTargetText = isCustom ? '' : text || (targetType === 'number' ? '25' : 'BUNTY BABLI');
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
          colorMatchingMode: isCustom ? 'full-tonal' : 'color-match',
          colorTintBlend: isCustom ? 0.56 : 0.0,
          contrastBoost: isCustom ? 1.32 : undefined,
          vibrancyBoost: isCustom ? 1.28 : undefined,
          eyeCatchingPreset: isCustom ? 'romantic-glow' : undefined,
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
      console.error('Failed to create demo:', e);
      setIsLoading(false);
    }
  };

  // Handle Create from Modal
  const handleCreateCustomMosaic = async () => {
    setIsCreating(true);
    try {
      const projectId = generateId('mosaic');

      if (uploadedFiles.length > 0) {
        const processed = await batchProcessPhotos(uploadedFiles, projectId);
        await savePhotosBatch(processed.photos, processed.blobsMap);
      } else {
        // Only load sample photography if user uploaded zero photos
        const photosData = await createSampleMosaicPhotoCollection(projectId, 120);
        await savePhotosBatch(photosData.photos, photosData.blobsMap);
      }

      const modalTargetType = targetType === 'custom' ? 'custom-image' : targetType;
      router.push(
        `/mosaic/editor/${projectId}?type=${modalTargetType}&text=${encodeURIComponent(targetText || 'ANANYA')}&shape=${selectedShape}`
      );
    } catch (e) {
      console.error('Creation error:', e);
      alert('Error creating mosaic.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

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
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <button
            onClick={() => handleLaunchQuickMosaic('heart')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Heart Mosaic
          </button>
          <button
            onClick={() => handleLaunchQuickMosaic('custom-image')}
            className="hover:text-[#E5C158] text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
          >
            <Upload className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Custom Pic</span>
          </button>
          <button
            onClick={() => handleLaunchQuickMosaic('name', 'ANANYA')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Name Art
          </button>
          <button
            onClick={() => handleLaunchQuickMosaic('number', '25')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Number Art
          </button>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/dashboard" className="text-[#C8A96B] font-bold hover:text-white transition-colors">
            My Creations
          </Link>
          <Link
            href="/feature-request"
            className="text-[#E5C158] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Feature Request</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-[#141414] bg-gradient-to-r from-[#C8A96B] via-[#E5C158] to-[#C8A96B] hover:brightness-110 rounded-xl shadow-lg shadow-[#C8A96B]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">✨ Create New Photo Art</span>
            <span className="sm:hidden">✨ Create</span>
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
                handleLaunchQuickMosaic('heart');
              }}
              className="text-left text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Heart Mosaic
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchQuickMosaic('custom-image');
              }}
              className="text-left text-sm font-semibold text-[#E5C158] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#C8A96B]" />
              <span>Custom Pic Mosaic</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchQuickMosaic('name', 'ANANYA');
              }}
              className="text-left text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Name Art
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLaunchQuickMosaic('number', '25');
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
              className="text-sm font-semibold text-[#C8A96B] py-2.5 px-3 rounded-xl bg-[#C8A96B]/10 border border-[#C8A96B]/20 transition-all active:scale-[0.98]"
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden bg-gradient-to-r from-[#1E1924] via-[#1A1A1E] to-[#121214] border border-[#C8A96B]/25 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#C8A96B]/15 border border-[#C8A96B]/30 text-[10px] sm:text-[11px] font-semibold text-[#C8A96B] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>100% Client-Side Local Processing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-heading text-white leading-tight">
              Transform Memories into Stunning Shape Art
            </h1>
            <p className="text-xs sm:text-sm text-[#9E9E9E] leading-relaxed">
              Add hundreds of photos. Our AI mosaic engine matches colors and calculates placements to form
              Hearts, Names, Letters, and custom silhouettes with deep zoom.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => handleLaunchQuickMosaic('heart')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#2C2C34] hover:bg-[#383842] border border-[#C8A96B]/40 text-xs font-semibold text-white transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Try Heart Mosaic</span>
              </button>
              <button
                onClick={() => handleLaunchQuickMosaic('shape', 'BUNTY BABLI')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#2C2C34] hover:bg-[#383842] border border-[#C8A96B]/40 text-xs font-semibold text-white transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Try Name Art</span>
              </button>
              <button
                onClick={() => handleLaunchQuickMosaic('shape', '25')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#2C2C34] hover:bg-[#383842] border border-[#C8A96B]/40 text-xs font-semibold text-white transition-colors"
              >
                <Hash className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Try Number Art (&quot;25&quot;)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">My Photo Art Creations</h2>
            <p className="text-xs text-[#9E9E9E]">Stored privately inside your browser.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creations..."
              className="w-full pl-9 pr-4 py-2 bg-[#1A1A1E] border border-[#2C2C34] rounded-xl text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C8A96B]"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#C8A96B] animate-spin" />
            <p className="text-xs text-[#9E9E9E]">Loading your creations...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 border border-dashed border-[#2C2C34] rounded-3xl flex flex-col items-center justify-center text-center space-y-4 p-8 bg-[#141417]/50">
            <div className="w-16 h-16 rounded-2xl bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No creations yet</h3>
              <p className="text-xs text-[#9E9E9E] max-w-sm">
                Create your first photo mosaic art with your photos or launch a 1-click sample demo.
              </p>
            </div>
            <button
              onClick={() => handleLaunchQuickMosaic('heart')}
              className="px-5 py-2.5 bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold rounded-xl shadow-lg transition-colors"
            >
              Launch Heart Mosaic Demo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl bg-[#1A1A1E] border border-[#2C2C34] hover:border-[#C8A96B]/50 overflow-hidden transition-all shadow-lg flex flex-col"
              >
                <div className="h-44 bg-[#121214] relative flex items-center justify-center p-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C8A96B]/20 to-transparent border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                    <Sparkles className="w-10 h-10" />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{p.name || 'Photo Art'}</h4>
                    <div className="text-[11px] text-[#9E9E9E] mt-0.5">
                      {new Date(p.updatedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link
                      href={`/mosaic/editor/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#C8A96B] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors"
                    >
                      Open Studio
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(p.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />

      {/* Create New Mosaic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#1A1A1E] border border-[#C8A96B]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C34] bg-[#141417]">
              <h3 className="text-base font-bold font-heading">Create Photo Mosaic Art</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase mb-1">
                  Creation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'shape', name: 'Shape (Heart/Star)', icon: Heart },
                    { id: 'name', name: 'Name / Word', icon: Type },
                    { id: 'number', name: 'Number / Age', icon: Hash },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTargetType(t.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        targetType === t.id
                          ? 'border-[#C8A96B] bg-[#C8A96B]/15 text-white font-bold'
                          : 'border-[#2C2C34] bg-[#141417] text-zinc-400'
                      }`}
                    >
                      <t.icon className="w-4 h-4 mx-auto mb-1 text-[#C8A96B]" />
                      <span className="text-[11px]">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {targetType === 'name' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase mb-1">
                    Custom Name or Word
                  </label>
                  <input
                    type="text"
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value.toUpperCase())}
                    placeholder="e.g. ANANYA or BUNTY BABLI"
                    className="w-full px-3 py-2 bg-[#141417] border border-[#2C2C34] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              )}

              {targetType === 'number' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase mb-1">
                    Number / Date
                  </label>
                  <input
                    type="text"
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    placeholder="e.g. 25 or 2026"
                    className="w-full px-3 py-2 bg-[#141417] border border-[#2C2C34] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#C8A96B] uppercase mb-1">
                  Upload Photos (Optional - Sample Pack provided if empty)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#C8A96B] file:text-black hover:file:bg-[#E5C158] cursor-pointer"
                />
                {uploadedFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    ✓ {uploadedFiles.length} photos selected
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C34] bg-[#141417]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomMosaic}
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#C8A96B] hover:bg-[#E5C158] rounded-xl shadow-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCreating ? 'Synthesizing...' : '✨ Create Photo Art'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
