'use client';

import { Sparkles } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-4 pointer-events-none">
      <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-full px-3 sm:px-6 py-2 sm:py-2.5 shadow-lg shadow-black/10 border border-slate-200/80 flex items-center justify-between pointer-events-auto">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-1.5 sm:gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B30]" />
          <span className="font-bold text-sm sm:text-lg text-slate-900 tracking-tight">
            Simbioly
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="#about" className="hover:text-[#FF6B30] transition-colors">
            About
          </a>
          <a href="#features" className="hover:text-[#FF6B30] transition-colors">
            Key Features
          </a>
          <a href="#platforms" className="hover:text-[#FF6B30] transition-colors">
            Platforms
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="#waitlist"
            className="px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-[#FF6B30] hover:bg-[#E0531A] text-white text-[11px] sm:text-xs font-semibold transition-all shadow-[0_4px_14px_0_rgb(255,107,48,39%)] hover:shadow-[0_6px_20px_rgba(255,107,48,23%)] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </header>
  );
}
