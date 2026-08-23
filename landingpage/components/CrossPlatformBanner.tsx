'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe, CheckCircle2, Clock } from 'lucide-react';

export function CrossPlatformBanner() {
  return (
    <section id="platforms" className="py-24 bg-[#FAF9F6] text-slate-900 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-100 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header with reveal animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Cross-Platform Learning <span className="text-orange-500">Experience</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Simbioly is intentionally architected to deliver seamless skill exchanges, whether you are on a full desktop workstation or carrying your phone on the go.
          </p>
        </motion.div>

        {/* 2 Platform Cards with Scroll Reveal */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Web / Desktop App Card (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-8 space-y-6 hover:border-orange-300 transition-all duration-300 shadow-xl relative group"
          >
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 text-[#FF6B30] group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-500 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Simbio Web & Desktop</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Responsive fullscreen workspace optimized for laptops and desktop browsers with radar proximity maps, Simbi AI copilot, and partnership rooms.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30] shrink-0" />
              <span>Accessible across all modern desktop & tablet browsers</span>
            </div>
          </motion.div>

          {/* Mobile Native App Card (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-8 space-y-6 hover:border-sky-300 transition-all duration-300 shadow-xl relative group"
          >
            <div className="flex items-center justify-between">
              <Smartphone className="w-8 h-8 text-sky-500 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-500 border border-sky-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Coming Soon
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Mobile Native App</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Lightning-fast candidate card swiping, instant push notifications for partner messages, and real-time GPS radar navigation in your pocket.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Optimized for iOS & Android devices</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
