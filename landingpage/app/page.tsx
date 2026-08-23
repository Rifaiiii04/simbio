'use client';

import { LandingNavbar } from '@/components/LandingNavbar';
import { motion } from 'framer-motion';
import { ParallaxHero } from '@/components/ParallaxHero';
import { UsecaseSection } from '@/components/UsecaseSection';
import { CommunitySection } from '@/components/CommunitySection';
import TextLoop from '@/components/ui/TextLoop';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { CrossPlatformBanner } from '@/components/CrossPlatformBanner';
import { EarlyAccessCTA } from '@/components/EarlyAccessCTA';
import { LandingFooter } from '@/components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-orange-100 selection:text-[#FF6B30]">
      {/* Floating Modern Pill Navbar */}
      <LandingNavbar />

      {/* Hero Section with Video Background & High-Contrast Typography */}
      <ParallaxHero />

      {/* Usecase Section: Problems falling away */}
      <UsecaseSection />

      {/* Community Section: Join Member Circle CTA */}
      <CommunitySection />

      {/* Decorative Text Loop Separator */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: '-50px' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full -my-8 sm:-my-16 relative z-10 pointer-events-none"
      >
        <TextLoop
          text="Simbioly"
          shape="wave"
          speed={100}
          direction="forward"
          separator="✦"
          curviness={90}
          fontSize={46}
          fontWeight={800}
          letterSpacing={2}
          uppercase
          color="#FF6B30"
          ribbon
          ribbonColor="rgba(255, 107, 48, 0.08)"
          ribbonWidth={86}
          pauseOnHover={false}
        />
      </motion.div>

      {/* Core Feature Showcase with Real Product Mockups (Web & Mobile 3D Floating) */}
      <FeatureShowcase />

      {/* Cross-Platform Section (Web & Mobile Coming Soon) */}
      <CrossPlatformBanner />

      {/* Pre-launch / Early Access CTA */}
      <EarlyAccessCTA />

      {/* Clean Minimalist Footer */}
      <LandingFooter />
    </div>
  );
}
