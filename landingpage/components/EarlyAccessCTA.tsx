'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Clock } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function EarlyAccessCTA() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-16 border border-slate-800 shadow-2xl overflow-hidden text-center space-y-8"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Pioneer the Future of Skill Barter?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
            Reserve your early access spot on Simbioly today to establish your skill profile, exchange knowledge you have mastered, and connect with complementary study peers at zero cost.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={`${APP_URL}/register`}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF6B30] hover:bg-[#E0531A] text-white text-sm font-black transition-all shadow-lg shadow-orange-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Early Access Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={`${APP_URL}/login`}
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Account</span>
          </a>
        </div>

        {/* Micro Trust Points */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free & Reciprocal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-orange-400" />
            <span>Collaborative Community</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Powered by Simbi AI Copilot</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
