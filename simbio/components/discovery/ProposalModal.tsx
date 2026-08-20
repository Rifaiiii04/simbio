'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '@/lib/api/client';
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
      alert(err instanceof Error ? err.message : 'Failed to send proposal request');
    } finally {
      setSubmitting(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg neo-box p-6 sm:p-8 space-y-6 bg-white shadow-[10px_10px_0px_0px_#0F172A] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A30] border-2.5 border-[#0F172A] text-white font-black flex items-center justify-center text-lg shadow-[3px_3px_0px_0px_#0F172A]">
              {candidate.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.user.avatarUrl} alt={candidate.user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                candidate.user.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">Study Partnership Proposal</h2>
              <p className="text-xs text-gray-600 font-bold">Connect with {candidate.user.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border-2 border-[#0F172A] font-black text-sm flex items-center justify-center text-[#0F172A] hover:bg-red-500 hover:text-white transition shadow-[2px_2px_0px_0px_#0F172A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#FF7A30] mx-auto animate-spin" />
            <p className="text-xs font-black text-[#0F172A]">Loading user skills & preparing proposal...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Skill Selector Controls */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Dropdown 1: Partner Skill to learn */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#0F172A] uppercase flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FF7A30]" />
                  <span>{candidate.user.name}&apos;s Skill:</span>
                </label>
                <select
                  value={selectedPartnerSkill}
                  onChange={(e) => handlePartnerSkillChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] shadow-[2px_2px_0px_0px_#0F172A]"
                >
                  {sortedPartnerTeachSkills.length > 0 ? (
                    sortedPartnerTeachSkills.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.level})
                      </option>
                    ))
                  ) : (
                    <option value="Skill Exchange">General Skill Exchange</option>
                  )}
                </select>
              </div>

              {/* Dropdown 2: My Offered Skill */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#0F172A] uppercase flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>My Offered Skill:</span>
                </label>
                <select
                  value={selectedMySkill}
                  onChange={(e) => handleMySkillChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-[#84CC16] shadow-[2px_2px_0px_0px_#0F172A]"
                >
                  {myTeachSkills.length > 0 ? (
                    myTeachSkills.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.level})
                      </option>
                    ))
                  ) : (
                    <option value="General Skill Exchange">General Skill Exchange</option>
                  )}
                </select>
              </div>
            </div>

            {/* Proposal Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#0F172A] uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Partnership Message:</span>
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setIsCustomEdited(true);
                }}
                className="w-full p-3 text-xs bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-[#06B6D4] shadow-[3px_3px_0px_0px_#0F172A]"
                placeholder="Write a greeting or learning proposal..."
              />
              <p className="text-[10px] text-gray-500 font-bold">
                *This message will be sent as your introductory greeting in the collaboration room.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#0F172A]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black hover:bg-gray-200 transition shadow-[2px_2px_0px_0px_#0F172A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitProposal}
                className="px-6 py-2.5 rounded-xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-emerald-400 transition flex items-center gap-2 shadow-[3px_3px_0px_0px_#0F172A] cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
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
