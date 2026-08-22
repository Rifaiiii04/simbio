'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Compass,
  MessageSquare,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface FeatureBlockProps {
  tag: string;
  tagIcon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
  desktopImg: string;
  desktopAlt: string;
  desktopLabel: string;
  mobileImg: string;
  mobileAlt: string;
  reversed?: boolean;
  mobilePosition?: 'right' | 'left';
}

function FeatureBlock({
  tag,
  tagIcon,
  title,
  description,
  bullets,
  ctaText,
  ctaHref,
  desktopImg,
  desktopAlt,
  desktopLabel,
  mobileImg,
  mobileAlt,
  reversed = false,
  mobilePosition = 'right',
}: FeatureBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
    >
      {/* Text Content */}
      <div className={`space-y-6 ${reversed ? 'order-1 lg:order-2' : ''}`}>
        <div className="inline-flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          {tagIcon}
          <span>{tag}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          {title}
        </h3>

        <p className="text-[15px] text-slate-500 leading-relaxed max-w-lg">
          {description}
        </p>

        <ul className="space-y-3 pt-1">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0">
                <Check className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
              </span>
              <span className="font-medium">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-[#FF6B30] transition-colors group"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Visual Showcase */}
      <div className={`relative ${reversed ? 'order-2 lg:order-1' : ''}`}>
        {/* Desktop Browser Frame */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="text-[10px] text-slate-400 font-medium ml-3 truncate">
              {desktopLabel}
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktopImg}
            alt={desktopAlt}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {/* Floating Mobile Mockup */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -bottom-6 ${
            mobilePosition === 'left' ? '-left-4 sm:-left-8' : '-right-4 sm:-right-8'
          } w-36 sm:w-48 z-20 hidden md:block`}
        >
          <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.06] overflow-hidden p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobileImg}
              alt={mobileAlt}
              className="w-full h-auto rounded-[1.25rem] object-contain"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 sm:space-y-40 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Overview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Built for purposeful<br className="hidden sm:block" /> skill exchanges
        </h2>
        <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl mx-auto">
          A modern platform that combines reciprocal matchmaking, AI-powered consultation, proximity discovery, and structured collaboration rooms.
        </p>
      </motion.div>

      {/* Feature 1: Swap & AI */}
      <FeatureBlock
        tag="Matchmaking & AI Copilot"
        tagIcon={<Zap className="w-3.5 h-3.5" />}
        title="Swipe candidates & consult compatibility with Simbi AI"
        description={
          <>
            Discover ideal study partners through an intuitive swap deck with
            peer reviews. Ask <strong className="text-slate-700">Simbi AI</strong> to
            analyze mutual exchange potential before sending a proposal.
          </>
        }
        bullets={[
          'Two-way skill matching based on teaching and learning goals',
          'AI Consultant with quick evaluation prompts',
          '4-dimension reputation stats across consistency, communication, knowledge, and collaboration',
        ]}
        ctaText="Explore Swap Matchmaking"
        ctaHref={`${APP_URL}/register`}
        desktopImg="/mockup/swap-desktop.png"
        desktopAlt="Swap matchmaking desktop interface"
        desktopLabel="simbioly.com/discovery"
        mobileImg="/mockup/swap-mobile.png"
        mobileAlt="Swap matchmaking mobile interface"
        mobilePosition="right"
      />

      {/* Feature 2: Discovery & Map */}
      <FeatureBlock
        tag="Discovery & Proximity Radar"
        tagIcon={<Compass className="w-3.5 h-3.5" />}
        title="Filter exact skills & locate nearby study partners"
        description={
          <>
            No black-box algorithms. Filter peers based on the skills you teach
            and want to learn, or switch to the{' '}
            <strong className="text-slate-700">Interactive Proximity Map</strong> to
            locate nearby partners in real-time.
          </>
        }
        bullets={[
          'Multi-category filtering: Tech, Languages, Music, Design, Science',
          'Haversine distance calculations with instant privacy toggle',
          'Direct partnership proposals with tailored introductory notes',
        ]}
        ctaText="Browse Skill Directory & Radar"
        ctaHref={`${APP_URL}/register`}
        desktopImg="/mockup/discoveryList-desktop.png"
        desktopAlt="Discovery candidate search desktop"
        desktopLabel="simbioly.com/discovery"
        mobileImg="/mockup/discoveryMaps-mobile.png"
        mobileAlt="Proximity map mobile interface"
        reversed
        mobilePosition="left"
      />

      {/* Feature 3: Partnership Room */}
      <FeatureBlock
        tag="Collaboration Room"
        tagIcon={<MessageSquare className="w-3.5 h-3.5" />}
        title="Collaborative rooms for focused exchange sessions"
        description={
          <>
            Once matched, you and your partner enter a private{' '}
            <strong className="text-slate-700">Partnership Room</strong> — an
            all-in-one workspace with real-time messaging, synchronized study
            roadmaps, focus timers, and peer feedback reviews.
          </>
        }
        bullets={[
          'Real-time chat with typing indicators and quote replies',
          'Reciprocal roadmap milestones generated with AI',
          '4-dimension rating system to build authentic credibility',
        ]}
        ctaText="Start a Learning Partnership"
        ctaHref={`${APP_URL}/register`}
        desktopImg="/mockup/chatroom-desktop.png"
        desktopAlt="Partnership collaboration room desktop"
        desktopLabel="simbioly.com/partnerships"
        mobileImg="/mockup/chatroom-mobile.png"
        mobileAlt="Partnership room mobile interface"
        mobilePosition="right"
      />
    </section>
  );
}
