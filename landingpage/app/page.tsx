'use client';

import { LandingNavbar } from '@/components/LandingNavbar';
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-[#FF6B30]">
      {/* Floating Modern Pill Navbar */}
      <LandingNavbar />

      {/* Hero Section with Video Background & High-Contrast Typography */}
      <ParallaxHero />

      {/* Usecase Section: Problems falling away */}
      <UsecaseSection />

      {/* Community Section: Join Member Circle CTA */}
      <CommunitySection />

      {/* Decorative Text Loop Separator */}
      <div className="w-full -my-8 sm:-my-16 relative z-10 pointer-events-none">
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
          color="#ffffff"
          ribbon
          ribbonColor="#FF5A00"
          ribbonWidth={86}
          pauseOnHover={false}
        />
      </div>

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
