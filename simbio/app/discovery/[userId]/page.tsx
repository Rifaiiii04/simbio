'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Heart,
  MapPin,
  Sparkles,
  BookOpen,
  Compass,
  MessageSquare,
  Award,
  Zap,
  Share2,
  Clock,
  ThumbsUp,
  Users,
  Target,
  Layers,
} from 'lucide-react';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import { toast } from 'sonner';

interface CandidateSkill {
  id: string;
  name: string;
  level: string;
  isMatch?: boolean;
  isRelated?: boolean;
}

interface DiscoveryCandidate {
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
  };
  teachSkills: CandidateSkill[];
  learnSkills: CandidateSkill[];
  matchScore: number;
  distanceKm: number | null;
  reputation?: {
    count: number;
    overall: number | null;
    averages?: { consistency: number; communication: number; knowledgeSharing: number; collaboration: number } | null;
  };
}

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [candidate, setCandidate] = useState<DiscoveryCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);

  useEffect(() => {
    async function fetchCandidate() {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await apiFetch<{ candidate: DiscoveryCandidate }>(`/discovery/people/${userId}`);
        setCandidate(res.candidate);
      } catch (err) {
        console.error('Failed to load candidate detail:', err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [userId]);

  if (loading) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
        <Navbar hideBottomNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF6B30] border-t-transparent animate-spin" />
            <p className="text-xs text-neutral-400 font-medium">Loading candidate profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
        <Navbar hideBottomNav />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            This user profile could not be found or may be currently inactive.
          </p>
          <Link
            href="/discovery"
            className="px-6 py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition shadow-lg shadow-[#FF6B30]/30 cursor-pointer"
          >
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const avatarSrc = getAvatarUrl(candidate.user.avatarUrl, candidate.user.name);
  const ratingValue = candidate.reputation?.overall ?? 5.0;
  const reviewCount = candidate.reputation?.count ?? 0;

  const averages = candidate.reputation?.averages ?? {
    knowledgeSharing: 5.0,
    communication: 5.0,
    consistency: 5.0,
    collaboration: 5.0,
  };

  return (
    <div className="h-screen bg-[#0A0A0A] text-white flex flex-col overflow-hidden">
      {/* ── 1. Global Navigation Bar ── */}
      <Navbar hideBottomNav />

      {/* ── 2. Top Sub-Header Breadcrumb ── */}
      <div className="shrink-0 border-b border-neutral-800/80 bg-[#0E0E10]/90 backdrop-blur-md z-10">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition group cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#18181B] group-hover:bg-[#27272A] border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse" />
              <span>Available for Exchange</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Profile link copied to clipboard!');
              }}
              className="w-8 h-8 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Main Split View Layout (Desktop: Fixed Height, Mobile: Scrollable) ── */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 overflow-hidden">
        {/* Mobile View Container (Vertical scroll) */}
        <div className="lg:hidden h-full overflow-y-auto pb-24 space-y-4 pr-1 scrollbar-orange">
          {/* Mobile Photo Card */}
          <div className="relative w-full aspect-[3/3.6] rounded-3xl overflow-hidden bg-[#121214] border border-neutral-800 shadow-2xl">
            <img
              src={avatarSrc}
              alt={candidate.user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${candidate.user.name}`;
              }}
            />
          </div>

          {/* Identity Card */}
          <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white leading-tight truncate">{candidate.user.name}</h2>
                  <ShieldCheck className="w-5 h-5 text-[#FF6B30] shrink-0" />
                </div>
                <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5 mt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B30] shrink-0" />
                  <span className="truncate">
                    {candidate.user.country || 'Global'}
                    {candidate.distanceKm !== null ? ` • ${Math.round(candidate.distanceKm)} km away` : ''}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="bg-[#FF6B30]/15 border border-[#FF6B30]/30 text-[#FF9E75] text-xs font-bold px-2.5 py-1 rounded-2xl flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF6B30]" />
                  <span>{candidate.matchScore}%</span>
                </div>
                <div className="bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-2xl flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{ratingValue.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Me Card */}
          <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-neutral-800/80">
              <MessageSquare className="w-3.5 h-3.5 text-[#FF6B30]" />
              <span>About Me</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {candidate.user.bio && candidate.user.bio.trim().length > 0
                ? candidate.user.bio
                : "Hello! I am excited to connect with like-minded learners, exchange expertise, and share good energy."}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                <Users className="w-3 h-3 text-[#FF6B30]" />
                <span>Active Mentor</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Open for Exchange</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                <Target className="w-3 h-3 text-emerald-400" />
                <span>Goal-Oriented</span>
              </span>
            </div>
          </div>

          {/* Skill Portfolio */}
          <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#FF6B30]" />
                <span>Skill Portfolio</span>
              </h3>
              <span className="text-[11px] font-semibold text-neutral-400">
                {candidate.teachSkills.length + candidate.learnSkills.length} Skills
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8F60] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#FF6B30]" />
                <span>Skills Can Teach ({candidate.teachSkills.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {candidate.teachSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-2xl bg-[#18181B] border border-[#FF6B30]/30 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-white truncate">{s.name}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#FF6B30]/20 text-[9.5px] font-extrabold text-[#FF9E75] uppercase tracking-wider shrink-0">
                      {s.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-neutral-400" />
                <span>Skills Wants to Learn ({candidate.learnSkills.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {candidate.learnSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-2xl bg-[#18181B] border border-neutral-800 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-neutral-200 truncate">{s.name}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">
                      {s.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reputation Card */}
          <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Reputation & Stats</span>
              </h3>
              <span className="text-xs font-bold text-amber-400">{ratingValue.toFixed(1)} Rating</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18181B] border border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  {ratingValue.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Top-tier partner rating</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-white block">{reviewCount} Reviews</span>
                <span className="text-[10px] text-emerald-400 font-medium">100% Positive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Split View Container (Photo sticky on Left, Info scrolling on Right) */}
        <div className="hidden lg:flex h-full gap-8 overflow-hidden items-stretch">
          {/* ════ LEFT COLUMN: Fixed Sticky Hero Photo & CTA Button ════ */}
          <div className="w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 h-full flex flex-col justify-between overflow-hidden gap-3.5">
            {/* Full-Height Hero Photo Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 w-full rounded-3xl overflow-hidden bg-[#121214] border border-neutral-800 shadow-2xl relative select-none"
            >
              <img
                src={avatarSrc}
                alt={candidate.user.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${candidate.user.name}`;
                }}
              />
            </motion.div>

            {/* Sticky Action CTA Card */}
            <div className="shrink-0 bg-[#121214] border border-neutral-800/80 rounded-3xl p-4 space-y-3 shadow-xl">
              <div>
                <h4 className="text-sm font-bold text-white">Ready to exchange knowledge?</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Propose a mutual skill session with {candidate.user.name}.
                </p>
              </div>

              <button
                onClick={() => setShowProposalModal(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-[#FF8F60] hover:from-[#E0531A] hover:to-[#FF6B30] text-white font-black text-sm tracking-wide shadow-xl shadow-[#FF6B30]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Connect & Send Proposal</span>
              </button>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: Smooth Internally Scrollable Details ════ */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto pr-3 space-y-4 scrollbar-orange pb-4">
            {/* 1. Candidate Primary Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl xl:text-3xl font-black text-white leading-tight truncate">
                      {candidate.user.name}
                    </h2>
                    <ShieldCheck className="w-5 h-5 text-[#FF6B30] shrink-0" />
                  </div>

                  <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B30] shrink-0" />
                    <span className="truncate">
                      {candidate.user.country || 'Global'}
                      {candidate.distanceKm !== null ? ` • ${Math.round(candidate.distanceKm)} km away` : ''}
                    </span>
                  </p>
                </div>

                {/* Compatibility & Star Rating Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-[#FF6B30]/15 border border-[#FF6B30]/30 text-[#FF9E75] text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B30]" />
                    <span>{candidate.matchScore}% Match</span>
                  </div>

                  <div className="bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ratingValue.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. About Me Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF6B30]" />
                  <span>About Me</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                {candidate.user.bio && candidate.user.bio.trim().length > 0
                  ? candidate.user.bio
                  : "Hello! I am excited to connect with like-minded learners, exchange expertise, and share good energy."}
              </p>

              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                  <Users className="w-3 h-3 text-[#FF6B30]" />
                  <span>Active Mentor</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Open for Exchange</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18181B] border border-neutral-800 text-[11px] font-medium text-neutral-300">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span>Goal-Oriented</span>
                </span>
              </div>
            </motion.div>

            {/* 3. Skill Exchange Portfolio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#FF6B30]" />
                  <span>Skill Portfolio</span>
                </h3>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {candidate.teachSkills.length + candidate.learnSkills.length} Total Skills
                </span>
              </div>

              {/* Can Teach Subsection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8F60] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF6B30]" />
                  <span>Skills Can Teach ({candidate.teachSkills.length})</span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {candidate.teachSkills.length > 0 ? (
                    candidate.teachSkills.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-[#18181B] border border-[#FF6B30]/30 hover:border-[#FF6B30]/60 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B30] shrink-0" />
                          <span className="text-xs font-bold text-white truncate">{s.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-[#FF6B30]/20 text-[9.5px] font-extrabold text-[#FF9E75] uppercase tracking-wider shrink-0">
                          {s.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 italic xl:col-span-2">No teaching skills specified yet.</p>
                  )}
                </div>
              </div>

              {/* Wants to Learn Subsection */}
              <div className="space-y-2 pt-3 border-t border-neutral-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Skills Wants to Learn ({candidate.learnSkills.length})</span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  {candidate.learnSkills.length > 0 ? (
                    candidate.learnSkills.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-[#18181B] border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                          <span className="text-xs font-medium text-neutral-200 truncate">{s.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">
                          {s.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 italic xl:col-span-2">Open to learning any interesting skill.</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 4. Reputation & Performance Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reputation & Stats</span>
                </h3>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{ratingValue.toFixed(1)} Rating</span>
                </span>
              </div>

              {/* Overall Score Highlight Banner */}
              <div className="p-4 rounded-2xl bg-[#18181B] border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xl">
                    {ratingValue.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">Top-tier partner rating</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-white block">{reviewCount} Reviews</span>
                  <span className="text-[11px] text-emerald-400 font-medium">100% Positive</span>
                </div>
              </div>

              {/* Detailed Performance Metric Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                {/* Knowledge Sharing */}
                <div className="p-3.5 rounded-2xl bg-[#18181B] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-[#FF6B30]" />
                      <span>Knowledge Sharing</span>
                    </span>
                    <span className="font-bold text-white">{averages.knowledgeSharing.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B30] to-[#FF8F60] rounded-full"
                      style={{ width: `${(averages.knowledgeSharing / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Communication */}
                <div className="p-3.5 rounded-2xl bg-[#18181B] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>Communication</span>
                    </span>
                    <span className="font-bold text-white">{averages.communication.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${(averages.communication / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Consistency & Punctuality */}
                <div className="p-3.5 rounded-2xl bg-[#18181B] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>Consistency</span>
                    </span>
                    <span className="font-bold text-white">{averages.consistency.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(averages.consistency / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Collaboration & Teamwork */}
                <div className="p-3.5 rounded-2xl bg-[#18181B] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <ThumbsUp className="w-3 h-3 text-purple-400" />
                      <span>Collaboration</span>
                    </span>
                    <span className="font-bold text-white">{averages.collaboration.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${(averages.collaboration / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── 4. Mobile Fixed Bottom Sticky Action Bar ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-neutral-800/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowProposalModal(true)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-[#FF8F60] hover:from-[#E0531A] hover:to-[#FF6B30] text-white font-black text-sm tracking-wide shadow-xl shadow-[#FF6B30]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Connect & Send Proposal</span>
          </button>
        </div>
      </div>

      {/* ── 5. Proposal Modal ── */}
      {showProposalModal && (
        <ProposalModal
          candidate={candidate}
          onClose={() => setShowProposalModal(false)}
          onSuccess={(msg) => {
            toast.success(msg);
            setShowProposalModal(false);
          }}
        />
      )}
    </div>
  );
}
