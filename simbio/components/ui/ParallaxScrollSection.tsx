'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Target, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

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
    <section ref={sectionRef} className="py-24 bg-[#0F172A] text-white relative overflow-hidden border-y-4 border-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="neo-badge bg-[#FACC15] text-[#0F172A] px-4 py-1.5 text-xs font-black uppercase tracking-widest inline-block">
            Engineered Reciprocity Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Reciprocal Growth Powered by <span className="bg-[#FF7A30] text-white px-3 py-1 rounded-xl inline-block -rotate-1">AI & Algorithms</span>
          </h2>
          <p className="text-base text-gray-300 font-bold max-w-xl mx-auto">
            Trade your existing expertise to acquire new skills with 100% deterministic matching and server-side OpenRouter AI guidance.
          </p>
        </div>

        {/* 3 Parallax Floating Neo-Brutalist Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div style={{ y: card1Y }}>
            <div className="neo-box bg-white text-[#0F172A] p-8 space-y-4 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_#FACC15]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF7A30] border-2 border-[#0F172A] flex items-center justify-center text-white font-black shadow-[3px_3px_0px_0px_#0F172A]">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A]">1. Deterministic Matching</h3>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  Backend calculates Haversine proximity & exact complement scores: User A teaches X and wants Y, while User B teaches Y and wants X.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#0F172A] flex items-center gap-2 text-xs font-black text-[#FF7A30]">
                <RefreshCw className="w-4 h-4" />
                <span>Zero Randomness Matching</span>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: card2Y }}>
            <div className="neo-box bg-white text-[#0F172A] p-8 space-y-4 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_#84CC16]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FACC15] border-2 border-[#0F172A] flex items-center justify-center text-[#0F172A] font-black shadow-[3px_3px_0px_0px_#0F172A]">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A]">2. AI Gateway Roadmaps</h3>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  Isolated OpenRouter gateway creates tailored step-by-step milestones. Progress is tracked deterministically by milestone completion ratios.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#0F172A] flex items-center gap-2 text-xs font-black text-amber-600">
                <Zap className="w-4 h-4" />
                <span>OpenRouter Gateway</span>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: card3Y }}>
            <div className="neo-box bg-white text-[#0F172A] p-8 space-y-4 h-full flex flex-col justify-between shadow-[8px_8px_0px_0px_#06B6D4]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#06B6D4] border-2 border-[#0F172A] flex items-center justify-center text-white font-black shadow-[3px_3px_0px_0px_#0F172A]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A]">3. Verifiable Reputation</h3>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  Each completed partnership unlocks mutual reviews, commitment check-ins, and focus session logs, building an immutable skill profile.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#0F172A] flex items-center gap-2 text-xs font-black text-cyan-600">
                <Layers className="w-4 h-4" />
                <span>Immutable Skill Credit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
