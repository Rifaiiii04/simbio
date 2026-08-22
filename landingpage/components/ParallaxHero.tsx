'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import GradualBlur from '@/components/ui/GradualBlur';

import artsImg from '@/assets/drift_wall/arts.webp';
import businessImg from '@/assets/drift_wall/business.webp';
import connectImg from '@/assets/drift_wall/connect.webp';
import designImg from '@/assets/drift_wall/design.webp';
import languageImg from '@/assets/drift_wall/language.webp';
import musicImg from '@/assets/drift_wall/music.webp';
import skillsImg from '@/assets/drift_wall/skills.webp';
import techImg from '@/assets/drift_wall/tech.webp';
import writingImg from '@/assets/drift_wall/writing.webp';
import DriftWall from './ui/DriftWall';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const BASE_IMAGES = [
  { image: artsImg.src, title: 'Arts' },
  { image: businessImg.src, title: 'Business' },
  { image: connectImg.src, title: 'Connect' },
  { image: designImg.src, title: 'Design' },
  { image: languageImg.src, title: 'Language' },
  { image: musicImg.src, title: 'Music' },
  { image: skillsImg.src, title: 'Skills' },
  { image: techImg.src, title: 'Tech' },
  { image: writingImg.src, title: 'Writing' },
];

// Pre-shuffled array of 64 indices (0-8) to guarantee perfectly random-looking 
// distribution across both rows and columns, while remaining 100% deterministic 
// to avoid React hydration mismatches between Server and Client.
const SHUFFLED_INDICES = [
  3, 7, 1, 8, 4, 0, 5, 2, 6,
  1, 5, 8, 2, 7, 3, 6, 0, 4,
  8, 2, 4, 1, 6, 5, 0, 7, 3,
  0, 6, 3, 5, 2, 8, 4, 1, 7,
  5, 1, 7, 0, 3, 4, 8, 6, 2,
  4, 8, 2, 6, 1, 7, 3, 5, 0,
  7, 0, 6, 3, 8, 1, 2, 4, 5,
  2, 4, 5, 7, 0, 6, 1, 8, 3
];

const DRIFT_ITEMS = SHUFFLED_INDICES.map(idx => BASE_IMAGES[idx]);

export function ParallaxHero() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20 text-center bg-[#060010]">
      {/* 1. BACKGROUND MEDIA - DRIFT WALL */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <DriftWall
          items={DRIFT_ITEMS}
          columns={isMobile ? 4 : 8}
          tileWidth={isMobile ? 180 : 300}
          tileHeight={isMobile ? 120 : 200}
          gap={isMobile ? 12 : 18}
          tilt={12}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={isMobile ? 20 : 30}
          direction="up"
          variance={0.45}
          parallax={isMobile ? 0 : 0.6}
          lift={isMobile ? 32 : 64}
          fade={0.6}
          dim={isMobile ? 0.45 : 0.35}
          overlayColor="#060010"
        />
        {/* Extra gradient to ensure text remains readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* 3. MINIMALIST CENTERED CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-5 sm:space-y-6">
        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight sm:leading-tight">
          Everyone has something to teach.
          <br className="hidden sm:inline" />{' '}
          <span className="text-slate-100">Everyone has something to learn.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto pt-1">
          Zero-cost 1-on-1 skill exchange. Find your ideal study partner, create mutual study agreements, and master new capabilities together with Simbi AI.
        </p>

        {/* Clean Minimalist CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <a
            href={`${APP_URL}/register`}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Get Early Access</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </a>
          <a
            href={`${APP_URL}/login`}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-300" />
            <span>Sign In</span>
          </a>
        </div>
      </div>

      {/* 4. GRADUAL BLUR TRANSITION (Strictly scoped to parent container, zero impact on footer) */}
      <GradualBlur
        target="parent"
        position="bottom"
        height="8rem"
        strength={2.5}
        divCount={6}
        curve="bezier"
        exponential={true}
        opacity={1}
      />
    </section>
  );
}
