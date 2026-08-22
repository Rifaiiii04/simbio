'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Compass,
  MessageSquare,
  ArrowRight,
  Check,
  Sparkles,
  Target,
} from 'lucide-react';
import ScrollStack, { ScrollStackItem } from './ui/ScrollStack';

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
  desktopImg,
  desktopAlt,
  mobileImg,
  mobileAlt,
  reversed,
}: FeatureBlockProps) {
  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center h-full w-full gap-6 sm:gap-8 lg:gap-10 pt-4 lg:pt-0 px-2 sm:px-6`}>
      
      {/* Text Column */}
      <div className="text-center lg:text-left w-full lg:w-[45%] shrink-0 px-2 flex flex-col items-center lg:items-start z-20">
        <h3 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-white tracking-tight leading-tight mb-3 lg:mb-5 w-full">
          {title}
        </h3>
        <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-lg">
          {description}
        </p>
      </div>

      {/* Mockups Column (Universal Hero Overlap) */}
      <div className="w-full lg:w-[55%] flex-1 min-h-0 relative flex items-center justify-center pt-2 sm:pt-4 lg:pt-0">
        <div className="relative w-full h-full max-w-xl lg:max-w-2xl flex items-center justify-center">
             
             {/* Desktop Mockup (Background) */}
             <div className={`w-[85%] sm:w-[85%] lg:w-[90%] max-h-[85%] rounded-xl sm:rounded-2xl border border-white/20 bg-white shadow-2xl overflow-hidden flex flex-col z-10 mr-auto lg:mr-0 ${reversed ? 'lg:translate-x-4' : 'lg:-translate-x-4'} mb-8 sm:mb-10 lg:mb-8`}>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-slate-100 bg-slate-50/90 shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-200" />
                </div>
                <div className="w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={desktopImg} alt={desktopAlt} className="w-full h-auto object-contain bg-white" loading="lazy" />
                </div>
             </div>

             {/* Mobile Mockup (Foreground Floating) */}
             <motion.div 
               animate={{ y: [0, -8, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
               className={`absolute bottom-4 sm:bottom-6 lg:bottom-4 right-2 sm:right-6 ${reversed ? 'lg:left-4' : 'lg:right-4'} w-[35%] sm:w-[35%] max-h-[95%] z-20 flex justify-end`}
             >
                <div className="rounded-[1.25rem] sm:rounded-[2rem] border border-white/30 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] p-1 sm:p-1.5 overflow-hidden flex flex-col h-full">
                  <img src={mobileImg} alt={mobileAlt} className="w-full h-full object-contain rounded-[1rem] sm:rounded-[1.75rem]" loading="lazy" />
                </div>
             </motion.div>

        </div>
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="pt-8 pb-24 sm:pt-12 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="w-full">
        <ScrollStack>
          <ScrollStackItem itemClassName="aspect-[3/4] sm:aspect-square lg:aspect-[16/7] w-full max-h-[85vh]">
            {/* Feature 1: Swap & AI */}
            <FeatureBlock
              tag="Matchmaking & AI Copilot"
              tagIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
              title="Find matches with Simbi AI"
              description="Discover study partners and let Simbi AI analyze your exchange potential before connecting."
              bullets={[
                'Two-way skill matching',
                'AI-powered evaluations',
                '4-dimension reputation stats',
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
          </ScrollStackItem>

          <ScrollStackItem itemClassName="aspect-[3/4] sm:aspect-square lg:aspect-[16/7] w-full max-h-[85vh]">
            {/* Feature 2: Discovery & Map */}
            <FeatureBlock
              tag="Discovery & Proximity Radar"
              tagIcon={<Compass className="w-3.5 h-3.5 text-white" />}
              title="Locate nearby study partners"
              description="Filter peers by skills or use the Interactive Proximity Map to find local partners in real-time."
              bullets={[
                'Multi-category skill filters',
                'Distance radar with privacy controls',
                'Send direct partnership proposals',
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
          </ScrollStackItem>

          <ScrollStackItem itemClassName="aspect-[3/4] sm:aspect-square lg:aspect-[16/7] w-full max-h-[85vh]">
            {/* Feature 3: Partnership Room */}
            <FeatureBlock
              tag="Collaboration Room"
              tagIcon={<Target className="w-3.5 h-3.5 text-white" />}
              title="Track goals & conquer sessions"
              description="Manage your learning lifecycle, track milestones, and grow together in a dedicated room."
              bullets={[
                'Shared progress roadmaps',
                'Real-time focus rooms (Soon)',
                'Anti-ghosting commitment scores',
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
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </section>
  );
}
