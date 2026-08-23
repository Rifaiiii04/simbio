'use client';

import React, { useState, useEffect } from 'react';
import Lightfall from './ui/Lightfall';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HeroCards } from './HeroCards';
import GradualBlur from '@/components/ui/GradualBlur';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function ParallaxHero() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        {/* Waitlist Form */}
        <div id="waitlist" className="w-full max-w-4xl mt-8 px-4 sm:px-0">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              
              setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name');
              const profession = formData.get('profession');
              const email = formData.get('email');
              
              try {
                // Submit to backend Waitlist API
                const res = await fetch('http://127.0.0.1:3001/api/v1/waitlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, profession, email })
                });
                
                if (res.ok) {
                  toast.success('Thank you for joining our waitlist! We will notify you when Simbioly is ready.');
                  (e.target as HTMLFormElement).reset();
                } else {
                  const err = await res.json();
                  toast.error(err.error || 'Something went wrong, please try again.');
                }
              } catch (err) {
                toast.error('Failed to connect to the server. Please try again later.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="flex flex-col gap-3 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-lg border border-slate-200/60"
          >
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input 
                type="text" 
                name="name" 
                required 
                disabled={isSubmitting}
                placeholder="Your Name" 
                className="w-full sm:w-[22%] px-4 py-2.5 sm:py-3.5 rounded-xl bg-white/90 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              />
              <input 
                type="text" 
                name="profession" 
                required 
                disabled={isSubmitting}
                placeholder="Profession" 
                className="w-full sm:w-[22%] px-4 py-2.5 sm:py-3.5 rounded-xl bg-white/90 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              />
              <input 
                type="email" 
                name="email" 
                required 
                disabled={isSubmitting}
                placeholder="Email Address" 
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3.5 rounded-xl bg-white/90 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-2.5 sm:py-3.5 rounded-xl bg-[#1E1E1E] text-white font-semibold text-sm hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Notifying...' : 'Notify Me'}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-1">
              Be the first to know when our app launches. No spam, ever.
            </p>
          </form>
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
