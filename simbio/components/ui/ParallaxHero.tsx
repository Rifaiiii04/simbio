'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Code, Music, Globe, BookOpen, Compass } from 'lucide-react';
import { SimbiCapybaraHero } from '@/components/shared/SimbiCapybaraHero';

export function ParallaxHero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 w-full">
        {/* Left Column (Content & CTAs) */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Neo Badge */}
          <div className="inline-flex items-center gap-2 neo-badge bg-[#FACC15] text-[#0F172A] px-4 py-2 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#0F172A]" />
            <span>Reciprocal Skill Exchange Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
            Learn what you <span className="bg-[#FF7A30] text-white px-3 py-1 rounded-xl inline-block -rotate-1 border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">desire</span>.<br />
            Teach what you <span className="bg-[#FACC15] text-[#0F172A] px-3 py-1 rounded-xl inline-block rotate-1 border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">master</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
            No money required. Trade coding for acoustic guitar, Spanish fluency for astrophysics, and build verifiable skill reputation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/register"
              className="neo-button text-sm sm:text-base px-7 py-3.5 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Start Free Exchange</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="/discovery"
              className="neo-button-yellow text-sm sm:text-base px-7 py-3.5 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A]" />
              <span>Explore Skill Map</span>
            </Link>
          </div>

          {/* Contained Featured Skill Exchange Badges (Non-overlapping & 100% Responsive) */}
          <div className="pt-4 grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
            <div className="neo-box-yellow p-3 rounded-xl text-left flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#0F172A]">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center flex-shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#0F172A] truncate">React & TS</p>
                <p className="text-[10px] text-gray-800 font-bold truncate">Teaches: Alex M.</p>
              </div>
            </div>

            <div className="neo-box-cyan p-3 rounded-xl text-left flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#0F172A]">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">Spanish</p>
                <p className="text-[10px] text-cyan-100 font-bold truncate">Teaches: Elena R.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Capybara Mascot Character Container) */}
        <div className="lg:col-span-5 flex justify-center">
          <SimbiCapybaraHero />
        </div>
      </div>
    </div>
  );
}
