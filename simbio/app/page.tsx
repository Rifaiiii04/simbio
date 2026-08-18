'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import { ParallaxScrollSection } from '@/components/ui/ParallaxScrollSection';
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      {/* 1. Asymmetrical Dynamic Hero Section */}
      <ParallaxHero />

      {/* 2. Asymmetrical Skill Catalog Section */}
      <section id="skills" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200">
              Global Skill Exchange Catalog
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Tukar Ilmu di Berbagai <span className="text-[#FF6B30]">Disiplin Skill</span>
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Dari web engineering dan acoustic guitar hingga UI/UX design dan bahasa asing.
            </p>
          </div>

          {/* Category Pill Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#FF6B30] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetrical Offset Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="soft-card p-6 space-y-4 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center font-bold shadow-xs`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="soft-badge bg-slate-100 text-slate-700 text-[10px]">
                    {item.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Reciprocal Skill Exchange Pair</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-[#FF6B30]">Teacher: {item.teacher}</span>
                  <span className="text-slate-400">⇄</span>
                  <span className="text-sky-600">Learner: {item.learner}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Scroll-Triggered Parallax Feature Showcase */}
      <ParallaxScrollSection />

      {/* 4. Asymmetrical Reciprocity & Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Cols: Asymmetrical Text Section */}
            <div className="lg:col-span-7 space-y-6">
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                Guaranteed Reciprocity
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                Dirancang untuk Pembelajar Serius, Bukan Sekadar Browsing.
              </h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Simbioly menggantikan biaya kursus dengan komitmen dua arah. Setiap pertukaran ilmu dilengkapi roadmap milestone dari AI Companion, Pomodoro focus session terintegrasi, dan penilaian peer review yang terverifikasi.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B30]" />
                  <span>Algoritma Matching Deterministik (0% Keberuntungan)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B30]" />
                  <span>Pomodoro Focus Session Synchronized & Roadmap AI</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B30]" />
                  <span>Skor Reputasi & Review Peer Transparan</span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Asymmetrical Cards Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="soft-card p-6 space-y-2 hover:-translate-y-1 transition-transform">
                <Users className="w-8 h-8 text-[#FF6B30]" />
                <div className="text-3xl font-black text-slate-900">100%</div>
                <p className="text-xs font-semibold text-slate-500">Reciprocal Exchange</p>
              </div>

              <div className="soft-card p-6 space-y-2 translate-y-3 hover:translate-y-2 transition-transform">
                <Zap className="w-8 h-8 text-amber-500" />
                <div className="text-3xl font-black text-slate-900">&lt; 1 sec</div>
                <p className="text-xs font-semibold text-slate-500">AI Roadmap Speed</p>
              </div>

              <div className="soft-card p-6 space-y-2 -translate-y-2 hover:-translate-y-3 transition-transform">
                <Award className="w-8 h-8 text-sky-600" />
                <div className="text-3xl font-black text-slate-900">12+</div>
                <p className="text-xs font-semibold text-slate-500">Global Skill Domains</p>
              </div>

              <div className="soft-card p-6 space-y-2 hover:-translate-y-1 transition-transform">
                <Sparkles className="w-8 h-8 text-emerald-600" />
                <div className="text-3xl font-black text-slate-900">Free</div>
                <p className="text-xs font-semibold text-slate-500">Zero Monetary Fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Asymmetrical CTA Banner with Simbi Capybara */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200/80 p-8 sm:p-14 text-center space-y-8 shadow-md">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Siap Meningkatkan <span className="text-[#FF6B30]">Keterampilan Skill</span> Kamu?
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Bergabunglah dengan komunitas pembelajar 1-on-1 di seluruh dunia sekarang secara gratis.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <SimbiAvatar
              state="cheering"
              message="Buat akun gratis dalam waktu kurang dari 2 menit dan mari susun roadmap AI pertama kamu! 🍊"
            />
          </div>

          <div className="pt-2">
            <Link
              href="/register"
              className="soft-button text-base px-9 py-4 inline-flex items-center gap-2 shadow-md"
            >
              <span>Mulai Belajar Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <div className="w-7 h-7 rounded-xl bg-[#FF6B30] flex items-center justify-center text-xs font-black">
              Sb
            </div>
            <span>Simbioly Inc.</span>
          </div>
          <p className="text-slate-400">© 2026 Simbioly. Reciprocal Skill Exchange Engine.</p>
        </div>
      </footer>
    </div>
  );
}
