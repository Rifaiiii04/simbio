'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/client';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import { X, Sparkles, RotateCcw, Heart, Bot, ShieldCheck, MapPin } from 'lucide-react';

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

export function SkillSwapDeck({ onActiveCandidateChange, onToggleMobileSidebar }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proposalCandidate, setProposalCandidate] = useState<Candidate | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const cardOpacity = useTransform(x, [-200, -120, 0, 120, 200], [0.5, 1, 1, 1, 0.5]);
  const dragControls = useAnimation();

  useEffect(() => {
    loadCandidates();
  }, []);

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

  const totalQueue = candidates.length;
  const activeCandidate = candidates[currentIndex] || null;

  useEffect(() => {
    onActiveCandidateChange?.(activeCandidate ?? null);
  }, [activeCandidate, onActiveCandidateChange]);

  const handleAction = async (direction: 'left' | 'right') => {
    if (direction === 'left') {
      // User skips this candidate -> advance queue immediately
      await dragControls.start({
        x: -300,
        opacity: 0,
        transition: { duration: 0.25 },
      });
      setCurrentIndex((prev) => prev + 1);
      x.set(0);
      dragControls.set({ x: 0, opacity: 1 });
    } else if (direction === 'right') {
      // User is interested -> open proposal modal and keep candidate visible behind modal
      if (activeCandidate) {
        setProposalCandidate(activeCandidate);
        dragControls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } });
        x.set(0);
      }
    }
  };

  const handleProposalSuccess = async (message: string) => {
    setProposalCandidate(null);
    toast.success(message || 'Proposal connection sent!');

    // Animate card out to the right and advance queue only after successful submission
    await dragControls.start({
      x: 300,
      opacity: 0,
      transition: { duration: 0.25 },
    });
    setCurrentIndex((prev) => prev + 1);
    x.set(0);
    dragControls.set({ x: 0, opacity: 1 });
  };

  const handleProposalClose = () => {
    // User cancelled: keep current candidate card right here
    setProposalCandidate(null);
    dragControls.set({ x: 0, opacity: 1 });
    x.set(0);
  };

  /* ------------------------------------------------------------------ */
  /* Loading State                                                       */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="w-full h-full rounded-3xl bg-[#121214] border border-neutral-800/80 flex flex-col items-center justify-center">
        <Sparkles className="w-9 h-9 text-[#FF6B30] mb-3 animate-pulse" />
        <p className="text-neutral-400 font-medium text-xs sm:text-sm">Finding your matches...</p>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Empty State                                                         */
  /* ------------------------------------------------------------------ */
  if (!activeCandidate || currentIndex >= totalQueue) {
    return (
      <div className="w-full h-full rounded-3xl bg-[#121214] border border-neutral-800/80 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#FF6B30]/15 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-[#FF6B30] fill-current" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1.5">You&apos;ve seen them all!</h2>
        <p className="text-neutral-400 mb-6 max-w-xs text-xs">
          No more candidates right now. Check back later or reset.
        </p>
        <button
          onClick={loadCandidates}
          className="bg-[#FF6B30] text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#E0531A] transition shadow-lg shadow-[#FF6B30]/25 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Discovery</span>
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Main Card (Strictly No-Scroll / Mobile-Responsive Proportions)      */
  /* ------------------------------------------------------------------ */
  return (
    <div className="relative w-full h-full flex flex-col min-h-0">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeCandidate.user.id}
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-[#121214] text-white flex flex-col justify-between touch-none cursor-grab active:cursor-grabbing border border-neutral-800/80 shadow-2xl select-none"
          style={{ x, rotate, opacity: cardOpacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) handleAction('right');
            else if (info.offset.x < -100) handleAction('left');
            else dragControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
          }}
          animate={dragControls}
        >
          {/* ── 1. Card Header ── */}
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 shrink-0 border-b border-neutral-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={getCandidateAvatar(activeCandidate, currentIndex)}
                alt="Avatar"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-neutral-700 pointer-events-none shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1 leading-tight truncate text-white">
                  {activeCandidate.user.name}
                  {activeCandidate.reputation.overall && activeCandidate.reputation.overall >= 4 && (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B30] shrink-0" />
                  )}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-neutral-500" />
                  {activeCandidate.user.country || 'Global'}
                </p>
              </div>
            </div>

            {onToggleMobileSidebar && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMobileSidebar(); }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-800/90 flex items-center justify-center text-neutral-400 hover:text-[#FF6B30] hover:bg-neutral-700 transition pointer-events-auto shrink-0 lg:hidden cursor-pointer border border-neutral-700/60"
                title="Open AI Advisor"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ── 2. Candidate Photo (Flexibly sized & shrinks smoothly on mobile) ── */}
          <div className="px-2.5 sm:px-3 pt-2 pb-0.5 shrink-1 flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900 shadow-inner flex items-center justify-center">
              <img
                src={getCandidateAvatar(activeCandidate, currentIndex)}
                alt={activeCandidate.user.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>
          </div>

          {/* ── 3. Candidate Bio & Skills ── */}
          <div className="px-3.5 sm:px-4 py-1.5 sm:py-2 shrink-0 space-y-1 sm:space-y-1.5">
            {/* About */}
            <div className="pointer-events-none">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">About</h4>
              <p className="text-xs text-neutral-300 leading-snug font-normal line-clamp-2 break-words">
                {(() => {
                  const bio = activeCandidate.user.bio?.trim();
                  if (!bio) return "Hello! Let's connect and share good energy.";
                  const MAX_CHARS = 100;
                  return bio.length > MAX_CHARS ? `${bio.slice(0, MAX_CHARS).trim()}...` : bio;
                })()}
              </p>
            </div>

            {/* Skills & Interests */}
            <div className="pointer-events-none">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Skills & Interests</h4>
              <div className="flex flex-wrap gap-1">
                {activeCandidate.teachSkills.slice(0, 3).map((s) => (
                  <span
                    key={'t-' + s.id}
                    className="px-2 py-0.5 rounded-lg bg-[#FF6B30]/15 border border-[#FF6B30]/30 text-[10px] sm:text-[11px] font-medium text-[#FF8F60] truncate max-w-[150px]"
                  >
                    Can teach: {s.name}
                  </span>
                ))}
                {activeCandidate.learnSkills.slice(0, 2).map((s) => (
                  <span
                    key={'l-' + s.id}
                    className="px-2 py-0.5 rounded-lg bg-neutral-800/90 border border-neutral-700/80 text-[10px] sm:text-[11px] font-medium text-neutral-300 truncate max-w-[150px]"
                  >
                    Wants: {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── 4. Action Buttons Bar ── */}
          <div className="flex justify-center items-center gap-5 sm:gap-6 py-2 sm:py-2.5 px-4 shrink-0 bg-[#121214] border-t border-neutral-800/60 pointer-events-auto">
            <button
              onClick={() => handleAction('left')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18181B] border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md"
              title="Pass / Skip"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => handleAction('right')}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FF6B30] text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-[#FF6B30]/30 hover:bg-[#E0531A] cursor-pointer border-2 border-[#121214]"
              title="Connect / Match"
            >
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Match Proposal Modal */}
      {proposalCandidate && (
        <ProposalModal
          candidate={proposalCandidate}
          onClose={handleProposalClose}
          onSuccess={handleProposalSuccess}
        />
      )}
    </div>
  );
}
