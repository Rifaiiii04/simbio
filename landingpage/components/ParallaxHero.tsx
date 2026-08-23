'use client';

import React, { useState, useEffect } from 'react';
import Lightfall from './ui/Lightfall';
import { motion } from 'framer-motion';
import { HeroCards } from './HeroCards';
import GradualBlur from '@/components/ui/GradualBlur';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function ParallaxHero() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <section className="relative min-h-[100vh] flex flex-col pt-48 sm:pt-60 pb-20 overflow-hidden px-4 sm:px-6 lg:px-8 text-center bg-[#FAF9F6]">

      {/* 1. BACKGROUND MEDIA - LIGHTFALL */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#FAF9F6]">
        <Lightfall
          colors={['#FF6B30', '#F59E0B', '#FB923C']}
          backgroundColor="#FAF9F6"
          speed={0.6}
          streakCount={1}
          streakWidth={1.5}
          streakLength={1.5}
          glow={0.8}
          density={0.7}
          twinkle={1.2}
          zoom={2.5}
          backgroundGlow={0.2}
          opacity={0.7}
          mouseInteraction={true}
          mouseStrength={1.5}
          mouseRadius={0.8}
        />
        {/* Extra gradient to ensure text remains readable */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,249,246,0.85)_15%,rgba(250,249,246,0)_60%)] pointer-events-none" />
      </div>

      {/* Bottom Soft Transition to White */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FAF9F6] to-transparent pointer-events-none z-10" />

      {/* 3. CENTERED CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">


        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-slate-900 leading-[1.1] sm:leading-[1.1] mt-8">
          Everyone has something to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">teach,</span>
          <br className="hidden sm:block" />{' '}
          <span className="text-slate-800">Everyone has something to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">learn</span></span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-lg mx-auto mt-6">
          Zero-cost 1-on-1 skill exchange. Find your ideal study partner, create mutual study agreements, and master new capabilities together with Simbi AI.
        </p>

        {/* Clean Minimalist CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto">
          <a
            href={`${APP_URL}/register`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1E1E1E] text-white hover:bg-black font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center cursor-pointer active:scale-95"
          >
            Start Here
          </a>
          <a
            href={`${APP_URL}/discovery`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm flex items-center justify-center cursor-pointer border border-slate-100"
          >
            Explore
          </a>
        </div>

        {/* Staggered Cards with Capybara */}
        <HeroCards />

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
