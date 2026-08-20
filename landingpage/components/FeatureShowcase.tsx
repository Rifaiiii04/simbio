'use client';

import { motion } from 'framer-motion';
import { Sparkles, MapPin, Zap, MessageSquare, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function FeatureShowcase() {
  return (
    <section id="features" className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-36 overflow-hidden">
      {/* SECTION HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 text-[#FF6B30] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Core Platform Features</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Engineered for <span className="text-[#FF6B30]">Purposeful Skill Exchanges</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Explore a modern interface that unifies reciprocal matchmaking, AI consultation, live proximity maps, and structured collaborative study rooms.
        </p>
      </motion.div>

      {/* FEATURE 1: SWAP DECK & AI SIMBI (3D DESKTOP + FLOATING 3D MOBILE) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-12 gap-14 lg:gap-16 items-center"
      >
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-[#FF6B30] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Matchmaking & AI Copilot</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Swipe Candidates & Consult Compatibility with Simbi AI
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Discover ideal study partners through an intuitive swap deck with star-rated peer reviews. Unsure about synergy? Ask <strong>Simbi AI</strong> to analyze mutual exchange potential and roadmap ideas before sending a proposal.
          </p>

          <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30] shrink-0" />
              <span>Two-way skill matching based on teaching and learning goals</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30] shrink-0" />
              <span>Simbi AI Consultant with quick evaluation prompts</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B30] shrink-0" />
              <span>4-dimension reputation stats (Consistency, Communication, Knowledge, Collaboration)</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF6B30] hover:text-[#E0531A] transition group"
            >
              <span>Explore Swap Matchmaking</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* 3D Visual Showcase Area */}
        <div className="lg:col-span-7 relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/15 to-sky-400/15 rounded-full blur-3xl -z-10" />

          {/* Desktop Browser with 3D Tilt */}
          <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-2xl shadow-slate-900/10 -rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/90 rounded-t-xl mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold ml-2">Simbioly Dashboard — Swap & AI Consultation</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/swap-desktop.png"
              alt="Dashboard Swap & Simbi AI Desktop"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

          {/* Slow Floating 3D Phone Mockup */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [4, 6, 4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-12 -right-2 sm:-right-6 w-44 sm:w-64 z-20 hidden md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/swap-mobile.png"
              alt="Dashboard Swap Mobile"
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* FEATURE 2: INTERACTIVE LIVE LOCATION MAP (3D FLOATING MOBILE ON LEFT + DESKTOP) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-12 gap-14 lg:gap-16 items-center"
      >
        {/* 3D Visual Showcase Area */}
        <div className="lg:col-span-7 order-2 lg:order-1 relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/15 to-emerald-400/15 rounded-full blur-3xl -z-10" />

          {/* Desktop Browser with 3D Tilt */}
          <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-2xl shadow-slate-900/10 rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/90 rounded-t-xl mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold ml-2">Simbioly Discovery — Live Map</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/maps-desktop.png"
              alt="Live Location Map Desktop"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

          {/* Slow Floating 3D Phone Mockup */}
          <motion.div
            animate={{
              y: [-12, 4, -12],
              rotate: [-5, -7, -5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-12 -left-2 sm:-left-6 w-44 sm:w-64 z-20 hidden md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/maps-mobile.png"
              alt="Live Location Map Mobile"
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Interactive Nearby Map</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Find Nearby Learning Partners in Real-Time
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Prefer meeting in person for pair programming, language exchange, or hands-on practice? The <strong>Live Location Map</strong> visualizes reciprocal peers in your city with complete privacy control via a simple <em>Toggle Switch</em>.
          </p>

          <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Deterministic Haversine distance calculations (km)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant privacy toggle: enable or disable your live radar anytime</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Interactive pin preview to inspect profiles and send proposals directly</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition group"
            >
              <span>Explore Nearby Radar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* FEATURE 3: DETERMINISTIC DISCOVERY & FILTERING */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-12 gap-14 lg:gap-16 items-center"
      >
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Precision Discovery</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Filter Exact Skills Without Random Guesswork
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            No black-box algorithms. The discovery engine filters prospective peers strictly based on the skills you offer to teach and the skills you wish to learn, paired with proficiency tiers (Beginner to Expert).
          </p>

          <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-category filtering: Tech, Languages, Music, Design, Science</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Clean and responsive deterministic filter sidebar</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct partnership proposals with tailored introductory notes</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition group"
            >
              <span>Browse Skill Directory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* 3D Visual Showcase Area with Slow Float */}
        <div className="lg:col-span-7 relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl -z-10" />

          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-2xl shadow-slate-900/10 -rotate-1 hover:rotate-0 transition-transform duration-500"
          >
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/90 rounded-t-xl mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold ml-2">Simbioly Discovery — Candidate Search</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/discovery-desktop.png"
              alt="Discovery Search Desktop"
              className="w-full h-auto rounded-xl object-cover"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* FEATURE 4: COLLABORATIVE PARTNERSHIP ROOM */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="grid lg:grid-cols-12 gap-14 lg:gap-16 items-center"
      >
        {/* 3D Visual Showcase Area with Slow Float */}
        <div className="lg:col-span-7 order-2 lg:order-1 relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/15 to-indigo-400/15 rounded-full blur-3xl -z-10" />

          <motion.div
            animate={{
              y: [-8, 6, -8],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-2xl shadow-slate-900/10 rotate-1 hover:rotate-0 transition-transform duration-500"
          >
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/90 rounded-t-xl mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold ml-2">Simbioly Collaboration — Partnership Room</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mockup/chatroom-desktop-.png"
              alt="Partnership Collaboration Room"
              className="w-full h-auto rounded-xl object-cover"
            />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Dedicated Study Room</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Collaborative Rooms for Focused Exchange Sessions
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Once matched, you and your partner enter a private <strong>Partnership Room</strong>: an all-in-one workspace to align schedules, direct message, run focus check-ins, and leave mutual feedback upon session completion.
          </p>

          <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Mutual commitment tracking & progress milestones</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Focused discussions inside private collaborative spaces</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>4-dimension rating system to cultivate authentic credibility</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`${APP_URL}/register`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 transition group"
            >
              <span>Start a Learning Partnership</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
