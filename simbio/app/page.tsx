'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import { ParallaxScrollSection } from '@/components/ui/ParallaxScrollSection';
import { GlowCard } from '@/components/ui/GlowCard';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import {
  Code,
  Music,
  Globe,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Technology', 'Design', 'Languages', 'Music', 'Science'];

  const showcaseSkills = [
    { name: 'React & TypeScript', category: 'Technology', teacher: 'Alex Morgan', learner: 'Jordan Lee', icon: Code, color: 'bg-blue-500 text-white' },
    { name: 'Acoustic Fingerstyle', category: 'Music', teacher: 'Maya Lin', learner: 'Alex Morgan', icon: Music, color: 'bg-amber-500 text-white' },
    { name: 'Conversational Spanish', category: 'Languages', teacher: 'Carlos Ruiz', learner: 'Siti Rahma', icon: Globe, color: 'bg-indigo-500 text-white' },
    { name: 'UI/UX & Figma', category: 'Design', teacher: 'Elena Rostova', learner: 'Kenji Sato', icon: Sparkles, color: 'bg-rose-500 text-white' },
    { name: 'Quantum Mechanics', category: 'Science', teacher: 'Dr. Hans Muller', learner: 'Emma Watson', icon: BookOpen, color: 'bg-emerald-500 text-white' },
  ];

  const filteredSkills = showcaseSkills.filter(
    (s) => activeCategory === 'All' || s.category === activeCategory,
  );

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#0F172A] font-sans selection:bg-[#FACC15] selection:text-[#0F172A]">
      <Navbar />

      {/* 1. 3D Parallax Neo-Brutalist Hero Section */}
      <ParallaxHero />

      {/* 2. Interactive Skill Exchange Taxonomy Showcase */}
      <section id="skills" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="neo-badge bg-[#FACC15] text-[#0F172A] px-4 py-1.5 text-xs font-black uppercase tracking-wider inline-block">
            Global Skill Exchange Catalog
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A]">
            Trade Knowledge Across <span className="bg-[#FF7A30] text-white px-3 py-1 rounded-xl inline-block -rotate-1">Every Discipline</span>
          </h2>
          <p className="text-sm font-bold text-gray-700">
            From web engineering and fingerstyle guitar to quantum mechanics and French pastry baking.
          </p>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2.5 border-[#0F172A] ${
                activeCategory === cat
                  ? 'bg-[#FF7A30] text-white shadow-[4px_4px_0px_0px_#0F172A] -translate-y-0.5'
                  : 'bg-white text-[#0F172A] hover:bg-[#FACC15]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <GlowCard key={idx}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl border-2 border-[#0F172A] ${item.color} flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0F172A]`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="neo-badge bg-gray-100 text-[#0F172A] text-[10px] px-3 py-1 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-[#0F172A]">{item.name}</h3>
                    <p className="text-xs text-gray-600 font-bold mt-1">Reciprocal Skill Exchange Pair</p>
                  </div>

                  <div className="pt-3 border-t-2 border-[#0F172A] flex items-center justify-between text-xs font-black">
                    <span className="text-[#FF7A30]">Teacher: {item.teacher}</span>
                    <span className="text-[#0F172A]">⇄</span>
                    <span className="text-indigo-600">Learner: {item.learner}</span>
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </section>

      {/* 3. Scroll-Triggered Parallax Feature Showcase */}
      <ParallaxScrollSection />

      {/* 4. Guaranteed Reciprocity & Community Stats */}
      <section className="py-20 bg-white border-y-4 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="neo-badge bg-[#84CC16] text-[#0F172A] px-4 py-1.5 text-xs font-black uppercase tracking-wider inline-block">
                Guaranteed Reciprocity
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-snug">
                Built for Dedicated Learners, Not Casual Browsers.
              </h2>
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                Simbioly replaces tuition fees with mutual dedication. Every partner exchange is backed by AI-generated milestones, scheduled focus check-ins, and peer review verification.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-black text-[#0F172A]">
                  <CheckCircle2 className="w-5 h-5 text-[#FF7A30]" />
                  <span>Deterministic Matching Algorithms (0% Luck)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-[#0F172A]">
                  <CheckCircle2 className="w-5 h-5 text-[#FF7A30]" />
                  <span>Pomodoro Focus Sessions & Milestone Tracking</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-[#0F172A]">
                  <CheckCircle2 className="w-5 h-5 text-[#FF7A30]" />
                  <span>Verifiable Peer Reputation & Review Score</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="neo-box p-6 space-y-2 shadow-[6px_6px_0px_0px_#FF7A30]">
                <Users className="w-8 h-8 text-[#FF7A30]" />
                <div className="text-3xl font-black text-[#0F172A]">100%</div>
                <p className="text-xs font-bold text-gray-600">Reciprocal Exchanges</p>
              </div>

              <div className="neo-box p-6 space-y-2 shadow-[6px_6px_0px_0px_#FACC15]">
                <Zap className="w-8 h-8 text-amber-500 fill-amber-400" />
                <div className="text-3xl font-black text-[#0F172A]">&lt; 1 sec</div>
                <p className="text-xs font-bold text-gray-600">AI Roadmap Speed</p>
              </div>

              <div className="neo-box p-6 space-y-2 shadow-[6px_6px_0px_0px_#06B6D4]">
                <Award className="w-8 h-8 text-cyan-600" />
                <div className="text-3xl font-black text-[#0F172A]">12+</div>
                <p className="text-xs font-bold text-gray-600">Global Skill Domains</p>
              </div>

              <div className="neo-box p-6 space-y-2 shadow-[6px_6px_0px_0px_#EC4899]">
                <Sparkles className="w-8 h-8 text-pink-500" />
                <div className="text-3xl font-black text-[#0F172A]">Free</div>
                <p className="text-xs font-bold text-gray-600">Zero Monetary Fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section with Simbi Capybara Avatar */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="neo-box bg-[#FACC15] p-8 sm:p-12 text-center space-y-8 shadow-[10px_10px_0px_0px_#0F172A]">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
              Ready to Upgrade Your <span className="bg-[#FF7A30] text-white px-3 py-1 rounded-xl inline-block -rotate-1">Skill Set</span>?
            </h2>
            <p className="text-sm font-bold text-[#0F172A]">
              Join lifelong learners trading knowledge worldwide today.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <SimbiAvatar
              state="cheering"
              message="Create your free account in under 2 minutes and let's craft your first AI learning roadmap! 🍊"
            />
          </div>

          <div className="pt-2">
            <Link
              href="/register"
              className="neo-button text-base px-8 py-4 inline-flex items-center gap-2"
            >
              <span>Get Started Free Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-10 border-t-4 border-[#0F172A] text-xs font-bold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-black text-base">
            <div className="w-7 h-7 rounded-xl bg-[#FF7A30] border-2 border-white flex items-center justify-center text-xs font-black">
              Sb
            </div>
            <span>Simbioly Inc.</span>
          </div>
          <p>© 2026 Simbioly. Reciprocal Skill Exchange Engine.</p>
        </div>
      </footer>
    </div>
  );
}
