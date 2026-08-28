'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { Sparkles, UserCheck, X, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';

interface CandidateSkill {
  id: string;
  name: string;
  level: string;
}

interface ProposalCandidate {
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
  };
  teachSkills: CandidateSkill[];
  learnSkills: CandidateSkill[];
}

interface MyUserSkill {
  id: string;
  type: 'TEACH' | 'LEARN';
  level: string;
  skill: {
    id: string;
    name: string;
  };
}

interface ProposalModalProps {
  candidate: ProposalCandidate;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const LEVEL_WEIGHT: Record<string, number> = {
  EXPERT: 4,
  ADVANCED: 3,
  INTERMEDIATE: 2,
  BEGINNER: 1,
};

export function ProposalModal({ candidate, onClose, onSuccess }: ProposalModalProps) {
  const [myTeachSkills, setMyTeachSkills] = useState<{ name: string; level: string }[]>([]);
  const [selectedPartnerSkill, setSelectedPartnerSkill] = useState<string>('');
  const [selectedMySkill, setSelectedMySkill] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isCustomEdited, setIsCustomEdited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Candidate B teach skills sorted by most expert first
  const sortedPartnerTeachSkills = [...candidate.teachSkills].sort(
    (a, b) => (LEVEL_WEIGHT[b.level.toUpperCase()] || 0) - (LEVEL_WEIGHT[a.level.toUpperCase()] || 0)
  );

  // Load User A's (My) skills
  useEffect(() => {
    async function loadMySkills() {
      try {
        const res = await apiFetch<{ skills: MyUserSkill[] }>('/skills/me/skills');
        const teachOnly = res.skills
          .filter((s) => s.type === 'TEACH')
          .map((s) => ({ name: s.skill.name, level: s.level }))
          .sort((a, b) => (LEVEL_WEIGHT[b.level.toUpperCase()] || 0) - (LEVEL_WEIGHT[a.level.toUpperCase()] || 0));

        setMyTeachSkills(teachOnly);

        // Set default selected skills (most expert first)
        const defaultPartnerSkill = sortedPartnerTeachSkills[0]?.name || 'Skill Exchange';
        const defaultMySkill = teachOnly[0]?.name || 'Skill Exchange';

        setSelectedPartnerSkill(defaultPartnerSkill);
        setSelectedMySkill(defaultMySkill);

        // Initial proposal template
        setMessageText(
          `Hi ${candidate.user.name}, I am interested in your skill in ${defaultPartnerSkill}. Would you like to exchange knowledge with me? I have experience in ${defaultMySkill} that I would love to share with you!`
        );
      } catch (err) {
        console.error('Failed to load user skills:', err);
        const defaultPartnerSkill = sortedPartnerTeachSkills[0]?.name || 'Skill Exchange';
        setSelectedPartnerSkill(defaultPartnerSkill);
        setSelectedMySkill('Skill Exchange');
        setMessageText(
          `Hi ${candidate.user.name}, I am interested in your skill in ${defaultPartnerSkill}. Would you like to connect and study together?`
        );
      } finally {
        setLoading(false);
      }
    }

    loadMySkills();
  }, [candidate.user.name]);

  // Update proposal message dynamically when dropdown options change (unless user custom edited)
  const handlePartnerSkillChange = (skillName: string) => {
    setSelectedPartnerSkill(skillName);
    if (!isCustomEdited) {
      setMessageText(
        `Hi ${candidate.user.name}, I am interested in your skill in ${skillName}. Would you like to exchange knowledge with me? I have experience in ${selectedMySkill || 'Skill Exchange'} that I would love to share with you!`
      );
    }
  };

  const handleMySkillChange = (skillName: string) => {
    setSelectedMySkill(skillName);
    if (!isCustomEdited) {
      setMessageText(
        `Hi ${candidate.user.name}, I am interested in your skill in ${selectedPartnerSkill || 'Skill Exchange'}. Would you like to exchange knowledge with me? I have experience in ${skillName} that I would love to share with you!`
      );
    }
  };

  const handleSubmitProposal = async () => {
    setSubmitting(true);
    try {
      await apiFetch('/partnerships', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: candidate.user.id,
          messageText: messageText.trim(),
          offeredSkillName: selectedMySkill,
          requestedSkillName: selectedPartnerSkill,
        }),
      });

      onSuccess(`Proposal connection sent to ${candidate.user.name}!`);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to send proposal:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send proposal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || typeof document === 'undefined') return null;

  const avatarSrc = getAvatarUrl(candidate.user.avatarUrl, candidate.user.name || 'partner');

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#121214] border border-neutral-800 text-white p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center justify-center text-base shadow-md shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={candidate.user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${candidate.user.name}`;
                }}
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Study Partnership Proposal</h2>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">Connect with {candidate.user.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#FF6B30] mx-auto animate-spin" />
            <p className="text-xs font-bold text-neutral-300">Loading user skills & preparing proposal...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Skill Selector Controls */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              {/* Dropdown 1: Partner Skill to learn */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FF6B30]" />
                  <span>{candidate.user.name}&apos;s Skill:</span>
                </label>
                <select
                  value={selectedPartnerSkill}
                  onChange={(e) => handlePartnerSkillChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#18181B] hover:bg-[#202024] focus:bg-[#202024] rounded-xl border border-neutral-800 focus:border-[#FF6B30] font-medium text-white focus:outline-none transition shadow-2xs cursor-pointer"
                >
                  {sortedPartnerTeachSkills.length > 0 ? (
                    sortedPartnerTeachSkills.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#18181B] text-white">
                        {s.name} ({s.level})
                      </option>
                    ))
                  ) : (
                    <option value="Skill Exchange" className="bg-[#18181B] text-white">
                      General Skill Exchange
                    </option>
                  )}
                </select>
              </div>

              {/* Dropdown 2: My Offered Skill */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Offered Skill:</span>
                </label>
                <select
                  value={selectedMySkill}
                  onChange={(e) => handleMySkillChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#18181B] hover:bg-[#202024] focus:bg-[#202024] rounded-xl border border-neutral-800 focus:border-[#FF6B30] font-medium text-white focus:outline-none transition shadow-2xs cursor-pointer"
                >
                  {myTeachSkills.length > 0 ? (
                    myTeachSkills.map((s) => (
                      <option key={s.name} value={s.name} className="bg-[#18181B] text-white">
                        {s.name} ({s.level})
                      </option>
                    ))
                  ) : (
                    <option value="General Skill Exchange" className="bg-[#18181B] text-white">
                      General Skill Exchange
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Proposal Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Partnership Message:</span>
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setIsCustomEdited(true);
                }}
                className="w-full p-3.5 text-xs bg-[#18181B] focus:bg-[#202024] rounded-2xl border border-neutral-800 focus:border-[#FF6B30] font-medium text-white placeholder-neutral-500 focus:outline-none transition shadow-2xs leading-relaxed"
                placeholder="Write a greeting or learning proposal..."
              />
              <p className="text-[10px] text-neutral-500 font-medium">
                *This message will be sent as your introductory greeting in the collaboration room.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitProposal}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF6B30]/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="w-4 h-4 text-white" />
                <span>{submitting ? 'Sending...' : 'Send Proposal & Connect'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
