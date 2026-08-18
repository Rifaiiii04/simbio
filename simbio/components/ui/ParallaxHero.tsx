'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Code, Globe, Compass, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SimbiCapybaraHero } from '@/components/shared/SimbiCapybaraHero';

export function ParallaxHero() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10 w-full">
        {/* Left Column: Asymmetrical Typography & Content (7 Cols) */}
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
          {/* Soft Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-[#FF6B30] px-4 py-2 rounded-full text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FF6B30]" />
            <span>Reciprocal Skill Exchange Engine</span>
          </div>

          {/* Asymmetrical Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Pelajari skill yang kamu <span className="text-[#FF6B30] relative inline-block">idamkan<span className="absolute bottom-1 left-0 w-full h-3 bg-orange-100 -z-10 rounded-sm" /></span>.<br />
            Bagikan skill yang kamu <span className="text-sky-600 relative inline-block">kuasai<span className="absolute bottom-1 left-0 w-full h-3 bg-sky-100 -z-10 rounded-sm" /></span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            Tanpa uang sepeser pun. Dapatkan partner belajar 1-on-1, rancang roadmap belajar otomatis dari AI Companion, dan selesaikan tantangan bersama!
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/register"
              className="soft-button text-sm sm:text-base px-8 py-3.5 flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-md"
            >
              <span>Mulai Belajar Gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/discovery"
              className="px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold hover:bg-slate-50 transition shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Compass className="w-5 h-5 text-slate-600" />
              <span>Jelajahi Skill Map</span>
            </Link>
          </div>

          {/* Micro Trust Stats */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30]" />
              <span>100% Reciprocal Swap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30]" />
              <span>AI Companion Assistant</span>
            </div>
          </div>
        </div>

        {/* Right Column: Asymmetrical Overlapping Floating Cards (5 Cols) */}
        <div className="lg:col-span-5 relative flex justify-center py-6">
          {/* Card 1: Simbi AI Chat Card (Top Offset & Slightly Tilted) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm p-4 rounded-2xl bg-sky-50/90 border border-sky-200/90 shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-300 space-y-3 z-20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Simbi AI Companion</p>
                  <p className="text-[10px] font-semibold text-sky-700">AI Study Buddy</p>
                </div>
              </div>
              <span className="soft-badge bg-sky-100 text-sky-800 border-sky-300 text-[9px]">Active AI</span>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-sky-100">
              &quot;Halo Alex & Faifai! 🐾 Roadmap UI/UX Design & React TS kalian sudah siap! Yuk bahas modul pertamanya 🚀&quot;
            </p>
          </motion.div>

          {/* Card 2: Skill Swap Preview Card (Bottom Offset Overlapping) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -bottom-6 right-2 sm:right-6 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300 space-y-3 z-30"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <span>React TS ⇄ UI/UX</span>
              </div>
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Matched!</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex justify-between border-t border-slate-100 pt-2">
              <span>Alex M. (Frontend)</span>
              <span className="text-[#FF6B30] font-bold">⇄</span>
              <span>Faifai (UI/UX)</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
