'use client';

import { LandingNavbar } from '@/components/LandingNavbar';
import { ParallaxHero } from '@/components/ParallaxHero';
import { AboutSection } from '@/components/AboutSection';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { CrossPlatformBanner } from '@/components/CrossPlatformBanner';
import { EarlyAccessCTA } from '@/components/EarlyAccessCTA';
import { LandingFooter } from '@/components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-[#FF6B30]">
      {/* Floating Modern Pill Navbar */}
      <LandingNavbar />

      {/* Hero Section with Video Background & High-Contrast Typography */}
      <ParallaxHero />

      {/* About Section: Story, Philosophy & Value Pillars */}
      <AboutSection />

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
