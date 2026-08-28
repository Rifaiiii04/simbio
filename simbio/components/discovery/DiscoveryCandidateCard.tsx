'use client';

import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/lib/api/client';
import { ShieldCheck, Star, Heart, MapPin, Sparkles } from 'lucide-react';

export interface CandidateSkill {
  id: string;
  name: string;
  level: string;
  isMatch?: boolean;
  isRelated?: boolean;
}

export interface DiscoveryCandidate {
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

interface Props {
  candidate: DiscoveryCandidate;
  onConnect: (candidate: DiscoveryCandidate) => void;
}

export function DiscoveryCandidateCard({ candidate, onConnect }: Props) {
  const avatarSrc = getAvatarUrl(candidate.user.avatarUrl, candidate.user.name);
  const ratingValue = candidate.reputation?.overall ?? 5.0;
  const isTopMatch = candidate.matchScore >= 80;

  const teachSkills = candidate.teachSkills.slice(0, 2);
  const learnSkills = candidate.learnSkills.slice(0, 2);
  const remainingSkills = Math.max(
    0,
    candidate.teachSkills.length + candidate.learnSkills.length - (teachSkills.length + learnSkills.length)
  );

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onConnect(candidate)}
      className="group relative w-full aspect-[3/4.6] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#121214] border border-neutral-800/80 hover:border-[#FF6B30]/60 transition-all shadow-md hover:shadow-xl hover:shadow-[#FF6B30]/15 flex flex-col justify-between p-3 sm:p-3.5 select-none cursor-pointer"
    >
      {/* 1. Full-Bleed Background Photo */}
      <img
        src={avatarSrc}
        alt={candidate.user.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${candidate.user.name}`;
        }}
      />

      {/* 2. Seamless Gradient (No Extra Sub-Boxes) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 via-60% to-transparent pointer-events-none" />

      {/* 3. Top Badges Row */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 pointer-events-none">
        {isTopMatch ? (
          <div className="bg-[#FF6B30] text-white text-[8.5px] sm:text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-md shadow-[#FF6B30]/30">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>{candidate.matchScore}% Match</span>
          </div>
        ) : (
          <div className="bg-black/60 backdrop-blur-md border border-white/15 text-white text-[8.5px] sm:text-[9.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <MapPin className="w-2.5 h-2.5 text-[#FF6B30]" />
            <span className="truncate max-w-[75px] sm:max-w-[100px]">{candidate.user.country || 'Global'}</span>
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-2 py-0.5 flex items-center gap-0.5 shadow-xs">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[9px] sm:text-[10px] font-bold text-white">{ratingValue.toFixed(1)}</span>
        </div>
      </div>

      {/* 4. Bottom Info: Complete & Clear Can Teach & Wants to Learn */}
      <div className="relative z-10 space-y-2 pt-8">
        {/* User Identity Row */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1 leading-tight drop-shadow-md truncate">
                <span>{candidate.user.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B30] shrink-0" />
              </h3>
              <p className="text-[9.5px] sm:text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 shrink-0" />
                <span>
                  {candidate.distanceKm !== null
                    ? `${Math.round(candidate.distanceKm)} km away`
                    : 'Recently Active'}
                </span>
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onConnect(candidate);
              }}
              className="w-8 h-8 rounded-full bg-[#FF6B30] hover:bg-[#E0531A] text-white flex items-center justify-center shadow-lg shadow-[#FF6B30]/35 transition-transform active:scale-90 hover:scale-110 shrink-0 cursor-pointer border border-white/20"
              title="Connect Proposal"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Section 1: CAN TEACH */}
        <div className="space-y-1">
          <span className="text-[8.5px] sm:text-[9px] font-black text-[#FF8F60] uppercase tracking-wider block">
            Can Teach:
          </span>
          <div className="flex flex-wrap gap-1">
            {teachSkills.length > 0 ? (
              teachSkills.map((s) => (
                <span
                  key={'t-' + s.id}
                  className="px-2 py-0.5 rounded-lg bg-[#FF6B30]/20 border border-[#FF6B30]/35 text-[9.5px] font-semibold text-[#FF9E75] truncate max-w-[130px] backdrop-blur-md"
                >
                  {s.name} <span className="opacity-75 text-[8.5px]">({s.level.toLowerCase()})</span>
                </span>
              ))
            ) : (
              <span className="text-[9px] text-neutral-400 italic">None specified</span>
            )}
          </div>
        </div>

        {/* Section 2: WANTS TO LEARN */}
        <div className="space-y-1">
          <span className="text-[8.5px] sm:text-[9px] font-black text-neutral-400 uppercase tracking-wider block">
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1">
            {learnSkills.length > 0 ? (
              <>
                {learnSkills.map((s) => (
                  <span
                    key={'l-' + s.id}
                    className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/15 text-[9.5px] font-medium text-neutral-200 truncate max-w-[130px] backdrop-blur-md"
                  >
                    {s.name} <span className="opacity-65 text-[8.5px]">({s.level.toLowerCase()})</span>
                  </span>
                ))}
                {remainingSkills > 0 && (
                  <span className="px-1.5 py-0.5 rounded-lg bg-black/60 border border-white/15 text-[8.5px] font-bold text-neutral-400">
                    +{remainingSkills}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[9px] text-neutral-400 italic">Open to learn</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
