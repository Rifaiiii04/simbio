'use client';

import { Sparkles } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 py-12 bg-white text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B30]" />
            <div>
              <span className="font-black text-base text-slate-900 tracking-tight block">
                Simbioly
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Reciprocal Skill Exchange Platform
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <a href="#about" className="hover:text-[#FF6B30] transition">
              About
            </a>
            <a href="#features" className="hover:text-[#FF6B30] transition">
              Key Features
            </a>
            <a href="#platforms" className="hover:text-[#FF6B30] transition">
              Platforms
            </a>
            <a href={`${APP_URL}/login`} className="hover:text-[#FF6B30] transition">
              Sign In
            </a>
            <a href={`${APP_URL}/register`} className="hover:text-[#FF6B30] transition">
              Early Access
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>© {new Date().getFullYear()} Simbioly. All rights reserved.</p>
          <p className="font-medium">Every skill has a place. Every learner has a partner.</p>
        </div>
      </div>
    </footer>
  );
}
