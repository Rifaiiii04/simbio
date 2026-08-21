'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import {
  UserCheck,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  BookOpen,
  Award,
  RotateCcw,
  Heart,
  Star,
  Bot,
  PanelRight,
} from 'lucide-react';

export interface CandidateReputation {
  count: number;
  overall: number | null;
  averages: {
    consistency: number;
    communication: number;
    knowledgeSharing: number;
    collaboration: number;
  } | null;
}

export interface Candidate {
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
  };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
  reputation: CandidateReputation;
}

const PORTRAIT_FALLBACKS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
];

function getCandidateAvatar(candidate: Candidate, index: number): string {
  const raw = candidate?.user?.avatarUrl?.trim();
  if (raw && raw !== 'null' && raw !== 'undefined') {
    if (raw.startsWith('/uploads')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      return `${baseUrl}${raw}`;
    }
    return raw;
  }
  return PORTRAIT_FALLBACKS[index % PORTRAIT_FALLBACKS.length];
}

interface Props {
  onActiveCandidateChange?: (candidate: Candidate | null) => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function SkillSwapDeck({ onActiveCandidateChange, onToggleMobileSidebar, isMobileSidebarOpen }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proposalCandidate, setProposalCandidate] = useState<Candidate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const loadCandidates = async () => {
    setLoading(true);
    setCurrentIndex(0);
    try {
      const res = await apiFetch<{ candidates: Candidate[] }>('/discovery/people');
      setCandidates(res.candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const totalQueue = candidates.length;
  const activeCandidate = candidates[currentIndex] || null;

  const handleNextCandidate = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 200);
  };

  // Notify parent when active candidate changes
  useEffect(() => {
    onActiveCandidateChange?.(activeCandidate ?? null);
  }, [activeCandidate, onActiveCandidateChange]);

  return (
    <div className="flex-1 flex flex-col w-full">
      {toastMessage && (
        <div className="mb-2 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold shadow-2xs flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      {!loading && activeCandidate && currentIndex < totalQueue && (
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2 px-0.5 shrink-0 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-[#FF6B30] text-xs font-black shrink-0">
            <Heart className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Skill Match Swap Hub</span>
          </div>

          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className={`md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                isMobileSidebarOpen
                  ? 'bg-orange-100 text-[#FF6B30] border-orange-300'
                  : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#FF6B30] border-slate-200'
              }`}
              title="Toggle Advisor & Stats"
            >
              <PanelRight className="w-3.5 h-3.5 text-[#FF6B30]" />
              <span className="text-[11px]">Advisor & Stats</span>
            </button>
          )}
        </div>
      )}

      <div className="flex-1 flex justify-center items-center lg:items-stretch min-h-0">
        <div className="w-full max-w-md h-full md:max-h-[720px] lg:max-h-none flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center space-y-3 animate-pulse shadow-sm">
              <Sparkles className="w-8 h-8 text-[#FF6B30] animate-spin" />
              <p className="text-xs text-slate-500 font-bold">Searching reciprocal partner recommendations...</p>
            </div>
          ) : !activeCandidate || currentIndex >= totalQueue ? (
            <div className="flex-1 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center space-y-4 p-8 shadow-sm text-center">
              <Heart className="w-10 h-10 text-[#FF6B30] fill-current" />
              <div className="space-y-1 max-w-xs">
                <h4 className="text-lg font-black text-slate-900">All Recommendations Reviewed</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  No remaining candidates in this batch. Reset the queue to explore available partners again.
                </p>
              </div>
              <button
                onClick={() => setCurrentIndex(0)}
                className="soft-button text-xs px-6 py-3 inline-flex items-center gap-2 shadow-sm font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Swap Queue</span>
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCandidate.user.id}
                initial={{ scale: 0.96, opacity: 0, y: 8 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: swipeDirection === 'left' ? -280 : swipeDirection === 'right' ? 280 : 0,
                  rotate: swipeDirection === 'left' ? -10 : swipeDirection === 'right' ? 10 : 0,
                }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.2 }}
                className="flex-1 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950 group select-none flex flex-col justify-between min-h-0"
              >
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={getCandidateAvatar(activeCandidate, currentIndex)}
                    alt={activeCandidate.user.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PORTRAIT_FALLBACKS[currentIndex % PORTRAIT_FALLBACKS.length];
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/15" />
                </div>

                <div className="relative p-3 sm:p-5 flex items-center justify-between z-10 shrink-0">
                  <span className="soft-badge bg-black/60 backdrop-blur-md text-white border-white/20 text-xs sm:text-sm px-3 sm:px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B30]" />
                    <span>
                      {activeCandidate.distanceKm
                        ? `${activeCandidate.distanceKm} km`
                        : activeCandidate.user.country || 'Global'}
                    </span>
                  </span>
                  {activeCandidate.reputation.overall != null ? (
                    <span className="soft-badge bg-amber-500/90 backdrop-blur-md text-white border-amber-300/30 text-xs sm:text-sm px-3 sm:px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                      <span>{activeCandidate.reputation.overall} / 5</span>
                    </span>
                  ) : (
                    <span className="soft-badge bg-slate-700/70 backdrop-blur-md text-white border-white/20 text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                      <span>New</span>
                    </span>
                  )}
                </div>

                <div className="relative p-3 sm:p-6 lg:p-8 space-y-2 sm:space-y-4 z-10 text-white shrink-0">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h3 className="font-black text-white text-xl sm:text-3xl lg:text-4xl tracking-tight drop-shadow-md">
                        {activeCandidate.user.name}
                      </h3>
                      <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-md shrink-0" />
                    </div>
                    {activeCandidate.user.username && (
                      <p className="text-[11px] sm:text-sm font-semibold text-slate-300">
                        @{activeCandidate.user.username}
                      </p>
                    )}
                    {activeCandidate.user.bio && (
                      <p className="text-[11px] sm:text-sm text-slate-200 italic line-clamp-1 opacity-90 mt-0.5 sm:mt-1">
                        &quot;{activeCandidate.user.bio}&quot;
                      </p>
                    )}
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-slate-950/70 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-white/15 shadow-inner">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                        <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Teaches</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCandidate.teachSkills.length === 0 ? (
                          <span className="text-slate-400 text-[10px] italic">None listed</span>
                        ) : (
                          activeCandidate.teachSkills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[10px] sm:text-[11px] font-medium leading-tight inline-flex items-center"
                            >
                              {s.name}
                            </span>
                          ))
                        )}
                        {activeCandidate.teachSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[9px] font-medium">
                            +{activeCandidate.teachSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-1.5">
                        <Sparkles className="w-3 h-3 text-orange-400 shrink-0" />
                        <span>Learns</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCandidate.learnSkills.length === 0 ? (
                          <span className="text-slate-400 text-[10px] italic">None listed</span>
                        ) : (
                          activeCandidate.learnSkills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-400/30 text-orange-200 text-[10px] sm:text-[11px] font-medium leading-tight inline-flex items-center"
                            >
                              {s.name}
                            </span>
                          ))
                        )}
                        {activeCandidate.learnSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[9px] font-medium">
                            +{activeCandidate.learnSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 pt-1">
                    <button
                      onClick={() => handleNextCandidate('left')}
                      className="p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer shrink-0"
                      title="Skip candidate"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" />
                    </button>
                    <button
                      onClick={() => setProposalCandidate(activeCandidate)}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-[#FF6B30] text-white font-black text-xs sm:text-base flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/30 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                      <span>Connect Exchange</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {proposalCandidate && (
        <ProposalModal
          candidate={proposalCandidate}
          onClose={() => setProposalCandidate(null)}
          onSuccess={(msg) => {
            setToastMessage(msg);
            handleNextCandidate('right');
          }}
        />
      )}
    </div>
  );
}
