'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Target, ShieldCheck, Zap, Layers, RefreshCw, Bot } from 'lucide-react';

export function ParallaxScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const card1Y = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);
  const card2Y = useTransform(scrollYProgress, [0, 1], ['80px', '-80px']);
  const card3Y = useTransform(scrollYProgress, [0, 1], ['120px', '-120px']);

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="neo-badge bg-[#FF6B30] text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest inline-block">
            Engineered Reciprocity Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Pertukaran Skill yang Adil Didukung <span className="text-[#FF6B30]">AI & Algoritma</span>
          </h2>
          <p className="text-base text-gray-300 font-medium max-w-xl mx-auto">
            Tukar keahlianmu untuk menguasai skill baru dengan pencocokan deterministik 100% dan asisten AI Simbi.
          </p>
        </div>

        {/* 3 Parallax Floating Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div style={{ y: card1Y }}>
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 space-y-4 h-full flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B30] flex items-center justify-center text-white font-black shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">1. Pencocokan Deterministik</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Algoritma backend menghitung kecocokan komplementer dua arah secara presisi: User A mengajarkan X dan butuh Y, sementara User B mengajarkan Y dan butuh X.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-black text-[#FF6B30]">
                <RefreshCw className="w-4 h-4" />
                <span>Zero Randomness Matching</span>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: card2Y }}>
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 space-y-4 h-full flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">2. Simbi Match Advisor</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Konsultasikan kecocokan kandidat partner langsung dengan Simbi AI. Simbi menganalisis kekuatan, kelemahan, dan potensi barter ilmu sebelum kamu terhubung.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-black text-amber-400">
                <Zap className="w-4 h-4" />
                <span>Simbi Matchmaking Copilot</span>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: card3Y }}>
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 space-y-4 h-full flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">3. Reputasi Peer Review</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Setiap sesi barter ilmu dinilai secara transparan melalui 4 metrik reputasi (Konsistensi, Komunikasi, Berbagi Ilmu, Kolaborasi) untuk ekosistem belajar yang terpercaya.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-black text-emerald-400">
                <Layers className="w-4 h-4" />
                <span>Verifiable Peer Reputation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
