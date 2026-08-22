'use client';

import { ArrowRight, Compass } from 'lucide-react';
import GradualBlur from '@/components/ui/GradualBlur';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function ParallaxHero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20 text-center">
      {/* 1. BACKGROUND MEDIA */}
      {/* Desktop & Tablet Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Mobile Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bgmobile.png"
        alt="Background Hero"
        className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. REFINED DARK OVERLAY FOR MAXIMUM TEXT CONTRAST */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80 z-1 pointer-events-none" />

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
