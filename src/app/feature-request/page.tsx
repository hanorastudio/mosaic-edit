'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  Phone,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Crown,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function FeatureRequestPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestType, setRequestType] = useState<'feature' | 'issue' | 'suggestion' | 'custom'>('feature');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = '918482961442';

  const typeLabels = {
    feature: '✨ Feature Request',
    issue: '🐛 Report an Issue / Bug',
    suggestion: '💡 UX / Design Suggestion',
    custom: '🤝 Custom Studio Inquiry',
  };

  const generateWhatsAppMessage = () => {
    const formatted = `*Aura Studio — ${typeLabels[requestType]}*
━━━━━━━━━━━━━━━━━━━━
📌 *Title:* ${title || 'General Request'}
📝 *Details:* ${details || 'No additional details provided.'}
⚡ *Priority:* ${urgency.toUpperCase()}
👤 *From:* ${name || 'Studio User'} ${contact ? `(${contact})` : ''}
🌐 *Source:* Aura Mosaic Studio
━━━━━━━━━━━━━━━━━━━━`;
    return encodeURIComponent(formatted);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !details.trim()) {
      alert('Please provide a brief title or description of your request.');
      return;
    }

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  const handleDirectChat = () => {
    const quickMsg = encodeURIComponent(
      'Hi Hanora Studio Team! I am using Aura Mosaic Studio and would like to connect.'
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${quickMsg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-[#FAF8F5] flex flex-col selection:bg-[#C8A96B] selection:text-[#141414]">
      {/* Header */}
      <header className="h-20 border-b border-[#2C2C34]/80 bg-[#141417]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8A96B] via-[#E5C158] to-[#8B6B38] flex items-center justify-center text-black font-bold shadow-lg shadow-[#C8A96B]/20 shrink-0 transition-transform hover:scale-105">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-lg font-bold font-heading tracking-wide text-white">
              AURA <span className="text-[#C8A96B] font-light">STUDIO</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-[#9E9E9E] border-l border-[#2C2C34] pl-2">
              Feature & Issue Center
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-semibold text-[#9E9E9E]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/mosaic" className="hover:text-white transition-colors">
            Heart Mosaic
          </Link>
          <Link href="/mosaic" className="hover:text-white transition-colors">
            Name Art
          </Link>
          <Link href="/mosaic" className="hover:text-white transition-colors">
            Number Art
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            My Creations
          </Link>
          <Link href="/feature-request" className="text-[#E5C158] font-bold">
            Feature Request
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleDirectChat}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-black bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp Support</span>
            <span className="sm:hidden">WhatsApp</span>
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
            <Link
              href="/mosaic"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Heart Mosaic
            </Link>
            <Link
              href="/mosaic"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Name Art
            </Link>
            <Link
              href="/mosaic"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#9E9E9E] hover:text-white py-2.5 px-3 rounded-xl hover:bg-[#1E1E24] transition-all active:scale-[0.98]"
            >
              Number Art
            </Link>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-10">
        {/* Title Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8A96B]/15 border border-[#C8A96B]/30 text-xs font-semibold text-[#C8A96B]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Studio Feedback & WhatsApp Helpline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Feature Requests & Issue Support
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Have a brilliant idea for Aura Mosaic Studio or encountered a bug? Submit your request
            below — our engineering team at <strong className="text-white">Hanora Studio</strong>{' '}
            will review it directly on WhatsApp.
          </p>
        </div>

        {/* WhatsApp Direct Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#141417] to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/40">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Official WhatsApp Support Desk</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  +91 8482961442
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Immediate responses for custom shapes, high-volume exports, bug fixes, or new features.
              </p>
            </div>
          </div>

          <button
            onClick={handleDirectChat}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs flex items-center justify-center gap-2 shrink-0 shadow-md transition-all"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141417] border border-[#2C2C34] space-y-6 shadow-2xl">
          {/* Form Type Tabs */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-[#C8A96B] tracking-wider mb-2">
              Select Request Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'feature', label: '✨ Feature Request', icon: Lightbulb },
                { id: 'issue', label: '🐛 Report Bug', icon: Bug },
                { id: 'suggestion', label: '💡 UX Suggestion', icon: MessageSquare },
                { id: 'custom', label: '🤝 Custom Inquiry', icon: Crown },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRequestType(t.id as any)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    requestType === t.id
                      ? 'border-[#C8A96B] bg-[#C8A96B]/20 text-white font-bold shadow-sm'
                      : 'border-[#2C2C34] bg-[#1A1A1E] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shubham Jaiswal"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Contact Phone / Email (Optional)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. +91 9876543210 or shubham@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                Subject / Title <span className="text-[#C8A96B]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  requestType === 'feature'
                    ? 'e.g. Add custom font family support or animated video reveal export'
                    : requestType === 'issue'
                    ? 'e.g. Image drag cursor stuck on mobile Safari'
                    : 'e.g. Bulk studio license inquiry'
                }
                className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white font-medium placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                Detailed Description / Steps to Reproduce <span className="text-[#C8A96B]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what feature you would love to see, or provide steps to reproduce an issue you encountered..."
                className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2C2C34] focus:border-[#C8A96B] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                Priority / Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal / General', color: 'text-zinc-300' },
                  { id: 'high', label: 'High Priority', color: 'text-[#E5C158]' },
                  { id: 'urgent', label: '🚨 Urgent Bug', color: 'text-red-400' },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id as any)}
                    className={`p-2 rounded-xl border text-[11px] transition-all ${
                      urgency === u.id
                        ? 'border-[#C8A96B] bg-[#C8A96B]/15 font-bold text-white'
                        : 'border-[#2C2C34] bg-[#1A1A1E] text-zinc-400'
                    }`}
                  >
                    <span className={u.color}>{u.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2C2C34]">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Redirects straight to Hanora Studio WhatsApp (+91 8482961442)</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all transform hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>Submit to WhatsApp (+91 8482961442)</span>
              </button>
            </div>
          </form>

          {/* Success Banner */}
          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Opening WhatsApp chat with Hanora Studio!</span>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Thank you for your feedback. We review every feature request and bug report actively.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Luxury Footer with Hanora Studio Embed */}
      <Footer />
    </div>
  );
}
