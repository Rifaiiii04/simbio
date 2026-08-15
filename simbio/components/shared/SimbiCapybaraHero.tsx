'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Award, Flame } from 'lucide-react';

export function SimbiCapybaraHero() {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square flex items-center justify-center p-2 sm:p-4">
      {/* Floating Sticker 1 - Top Left */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-2 left-0 z-20 neo-badge bg-[#FACC15] text-[#0F172A] px-3 py-1.5 text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
      >
        <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
        <span>Match Score 98%</span>
      </motion.div>

      {/* Floating Sticker 2 - Top Right */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-4 right-0 z-20 neo-badge bg-[#06B6D4] text-white px-3 py-1.5 text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
      >
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Capy Approved!</span>
      </motion.div>

      {/* Floating Sticker 3 - Bottom Left */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-4 left-0 z-20 neo-badge bg-[#EC4899] text-white px-3 py-1.5 text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
      >
        <Heart className="w-3.5 h-3.5 text-white fill-white" />
        <span>Zero Tuition</span>
      </motion.div>

      {/* Floating Sticker 4 - Bottom Right */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-2 right-0 z-20 neo-badge bg-[#84CC16] text-[#0F172A] px-3 py-1.5 text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
      >
        <Award className="w-3.5 h-3.5 text-[#0F172A]" />
        <span>Verifiable Reputation</span>
      </motion.div>

      {/* Main Neo-Brutalist Capybara Mascot Character Container */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#FFD6B8] border-3.5 border-[#0F172A] shadow-[6px_6px_0px_0px_#0F172A] relative flex items-center justify-center overflow-hidden"
      >
        {/* Capybara SVG Character */}
        <svg className="w-44 h-44 sm:w-52 sm:h-52 text-[#FF7A30]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Capybara Body */}
          <ellipse cx="50" cy="62" rx="36" ry="28" fill="#C87D46" stroke="#0F172A" strokeWidth="3.5" />

          {/* Ears */}
          <circle cx="22" cy="30" r="8" fill="#8C4D20" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="78" cy="30" r="8" fill="#8C4D20" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="22" cy="30" r="4" fill="#FACC15" />
          <circle cx="78" cy="30" r="4" fill="#FACC15" />

          {/* Capybara Head */}
          <path d="M22 45C22 28 34 20 50 20C66 20 78 28 78 45C78 60 66 66 50 66C34 66 22 60 22 45Z" fill="#C87D46" stroke="#0F172A" strokeWidth="3.5" />
          <path d="M28 36C28 28 38 24 50 24C62 24 72 28 72 36V48C72 56 62 60 50 60C38 60 28 56 28 48V36Z" fill="#B36A36" stroke="#0F172A" strokeWidth="2.5" />

          {/* Snout */}
          <rect x="36" y="44" width="28" height="16" rx="8" fill="#8C4D20" stroke="#0F172A" strokeWidth="3" />
          <circle cx="44" cy="50" r="2.5" fill="#0F172A" />
          <circle cx="56" cy="50" r="2.5" fill="#0F172A" />

          {/* Cute Eyes */}
          <circle cx="34" cy="38" r="4" fill="#0F172A" />
          <circle cx="66" cy="38" r="4" fill="#0F172A" />
          <circle cx="36" cy="36" r="1.5" fill="#FFFFFF" />
          <circle cx="68" cy="36" r="1.5" fill="#FFFFFF" />

          {/* Signature Yuzu Citrus Orange on Capybara's Head! */}
          <circle cx="50" cy="14" r="9" fill="#FF7A30" stroke="#0F172A" strokeWidth="3" />
          <path d="M50 5 Q54 8 52 11" stroke="#84CC16" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="47" cy="12" r="1.5" fill="#FFFFFF" />
        </svg>

        {/* Sparkle Accent */}
        <Sparkles className="absolute top-5 right-5 w-5 h-5 text-[#0F172A]" />
      </motion.div>
    </div>
  );
}
