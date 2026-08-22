'use client';

import { motion } from 'framer-motion';
import { HeartHandshake, Sparkles, ShieldCheck, Users } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Concise Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-[#FF6B30] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>About Simbioly</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Learning is No Longer a Solo Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Simbioly is a 1-on-1 reciprocal skill exchange platform without tuition fees or money. You teach what you know, your partner teaches what you want to learn—growing together powered by Simbi AI copilot.
          </p>
        </motion.div>

        {/* 3 Concise Value Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:border-orange-300 transition-all space-y-3"
          >
            <Users className="w-7 h-7 text-[#FF6B30]" />
            <h3 className="text-base font-bold text-slate-900">
              100% Reciprocal Exchange
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every connection is purely based on mutual time commitment and two-way knowledge transfer with zero financial barrier.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 transition-all space-y-3"
          >
            <Sparkles className="w-7 h-7 text-sky-500" />
            <h3 className="text-base font-bold text-slate-900">
              Powered by Simbi AI Copilot
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Instant candidate synergy analysis and balanced milestone suggestions tailored to both learning goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3"
          >
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">
              Verified Peer Reputation
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Transparent 4-dimension ratings (Consistency, Communication, Knowledge, Collaboration) to build authentic community trust.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
