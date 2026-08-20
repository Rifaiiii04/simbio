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
];

interface Props {
  onActiveCandidateChange?: (candidate: Candidate | null) => void;
}

export function SkillSwapDeck({ onActiveCandidateChange }: Props) {
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

  const handleNextCandidate = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 200);
  };

  const activeCandidate = candidates[currentIndex] ?? null;
  const totalQueue = candidates.length;

  // Notify parent when active candidate changes
  useEffect(() => {
    onActiveCandidateChange?.(activeCandidate ?? null);
  }, [activeCandidate, onActiveCandidateChange]);

  /*
   * Layout strategy:
   *   - This component is rendered inside a `flex-1 flex flex-col` main container.
   *   - The outer wrapper uses `flex-1 flex flex-col` so it stretches to fill all remaining height.
   *   - The card itself also uses `flex-1` so it fills the remaining height inside the wrapper.
   *   - `max-w-md` keeps portrait width on large screens; on mobile it fills full width.
   *   - No fixed pixel heights — fully dynamic on every viewport.
   */
  return (
    <div className="flex-1 flex flex-col w-full">
      {toastMessage && (
        <div className="mb-2 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold shadow-2xs flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Queue counter header */}
      {!loading && activeCandidate && currentIndex < totalQueue && (
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2 px-1 shrink-0">
          <span className="flex items-center gap-1.5 text-[#FF6B30]">
            <Heart className="w-4 h-4 fill-current" />
            <span>Skill Match Swap Hub</span>
          </span>
          <span className="soft-badge bg-slate-100 text-slate-800 border-slate-200 text-xs">
            Kandidat {currentIndex + 1} dari {totalQueue}
          </span>
        </div>
      )}

      {/* Card area — flex-1 fills all remaining height */}
      <div className="flex-1 flex justify-center items-stretch min-h-0">
        <div className="w-full max-w-md flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center space-y-3 animate-pulse shadow-sm">
              <Sparkles className="w-8 h-8 text-[#FF6B30] animate-spin" />
              <p className="text-xs text-slate-500 font-bold">Mencari rekomendasi partner reciprocal...</p>
            </div>
          ) : !activeCandidate || currentIndex >= totalQueue ? (
            <div className="flex-1 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center space-y-4 p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B30] flex items-center justify-center shadow-2xs">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-lg font-black text-slate-900">Semua Rekomendasi Telah Dilihat! 🎉</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Tidak ada kandidat tersisa. Muat ulang antrean untuk menjelajahi kembali partner yang tersedia.
                </p>
              </div>
              <button
                onClick={() => setCurrentIndex(0)}
                className="soft-button text-xs px-6 py-3 inline-flex items-center gap-2 shadow-sm font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulang Antrean Swap</span>
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
                {/* Full-Bleed Photo Background */}
                <div className="absolute inset-0 w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCandidate.user.avatarUrl || PORTRAIT_FALLBACKS[currentIndex % PORTRAIT_FALLBACKS.length]}
                    alt={activeCandidate.user.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/15" />
                </div>

                {/* Top Badges — Rating instead of raw match score */}
                <div className="relative p-3 sm:p-5 flex items-center justify-between z-10 shrink-0">
                  <span className="soft-badge bg-black/60 backdrop-blur-md text-white border-white/20 text-xs sm:text-sm px-3 sm:px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B30]" />
                    <span>
                      {activeCandidate.distanceKm
                        ? `${activeCandidate.distanceKm} km`
                        : activeCandidate.user.country || 'Indonesia'}
                    </span>
                  </span>
                  {/* Star Rating Badge */}
                  {activeCandidate.reputation.overall != null ? (
                    <span className="soft-badge bg-amber-500/90 backdrop-blur-md text-white border-amber-300/30 text-xs sm:text-sm px-3 sm:px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                      <span>{activeCandidate.reputation.overall} / 5</span>
                    </span>
                  ) : (
                    <span className="soft-badge bg-slate-700/70 backdrop-blur-md text-white border-white/20 text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                      <span>Baru</span>
                    </span>
                  )}
                </div>

                {/* Bottom Info + Skills + Buttons */}
                <div className="relative p-3 sm:p-6 lg:p-8 space-y-2 sm:space-y-4 z-10 text-white shrink-0">
                  {/* User name & username */}
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

                  {/* Reciprocal Skill Matrix */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-3 bg-black/55 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border border-white/15">
                    <div>
                      <span className="text-[9px] sm:text-xs font-bold uppercase text-emerald-300 flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        Mengajar:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeCandidate.teachSkills.length === 0 ? (
                          <span className="text-slate-400 text-[9px] sm:text-xs italic">Belum dicantumkan</span>
                        ) : (
                          activeCandidate.teachSkills.slice(0, 3).map((s) => (
                            <span key={s.id} className="soft-badge bg-emerald-500/30 text-emerald-100 border-emerald-400/40 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold">
                              {s.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-xs font-bold uppercase text-orange-300 flex items-center gap-1 mb-1">
                        <Award className="w-3 h-3 text-orange-400" />
                        Mau Belajar:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeCandidate.learnSkills.length === 0 ? (
                          <span className="text-slate-400 text-[9px] sm:text-xs italic">Belum dicantumkan</span>
                        ) : (
                          activeCandidate.learnSkills.slice(0, 3).map((s) => (
                            <span key={s.id} className="soft-badge bg-orange-500/30 text-orange-100 border-orange-400/40 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold">
                              {s.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleNextCandidate('left')}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
                      title="Skip"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                    <button
                      onClick={() => setProposalCandidate(activeCandidate)}
                      className="flex-1 h-10 sm:h-14 rounded-2xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                      <span>Hubungkan Exchange</span>
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
