'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe, CheckCircle2, Clock } from 'lucide-react';

export function CrossPlatformBanner() {
  return (
    <section id="platforms" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header with reveal animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>Coming Soon on All Platforms</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Cross-Platform Learning <span className="text-[#FF6B30]">Experience</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Simbioly is intentionally architected to deliver seamless skill exchanges, whether you are on a full desktop workstation or carrying your phone on the go.
          </p>
        </motion.div>

        {/* 2 Platform Cards with Scroll Reveal */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Web / Desktop App Card (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 hover:border-orange-500/50 transition-all duration-300 shadow-2xl relative group"
          >
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 text-[#FF6B30] group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Simbio Web & Desktop</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Responsive fullscreen workspace optimized for laptops and desktop browsers with radar proximity maps, Simbi AI copilot, and partnership rooms.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Accessible across all modern desktop & tablet browsers</span>
            </div>
          </motion.div>

          {/* Mobile Native App Card (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 hover:border-sky-500/50 transition-all duration-300 shadow-2xl relative group"
          >
            <div className="flex items-center justify-between">
              <Smartphone className="w-8 h-8 text-sky-400 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Mobile Native App</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Lightning-fast candidate card swiping, instant push notifications for partner messages, and real-time GPS radar navigation in your pocket.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Optimized for iOS & Android devices</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
