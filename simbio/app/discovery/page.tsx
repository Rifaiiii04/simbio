'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { GlowCard } from '@/components/ui/GlowCard';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import {
  Compass,
  Sparkles,
  MapPin,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Globe,
  Bot,
  Lightbulb,
} from 'lucide-react';

interface Candidate {
  user: { id: string; name: string; username: string | null; avatarUrl: string | null; bio: string | null; country: string | null };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
  aiMatchScore?: number;
  aiReasoning?: string;
  suggestedProjectIdea?: string;
}

interface Skill {
  id: string;
  name: string;
  category?: { id: string; name: string };
}

export default function DiscoveryPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [mode, setMode] = useState<'standard' | 'ai'>('standard');
  const [loading, setLoading] = useState(true);
  const [proposalCandidate, setProposalCandidate] = useState<Candidate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const countries = ['All Countries', 'Indonesia', 'United States', 'Japan', 'Germany', 'United Kingdom', 'Singapore', 'Australia', 'Canada'];

  // 300ms Debounce for text search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const skillsRes = await apiFetch<{ skills: Skill[] }>('/skills');
        setSkills(skillsRes.skills);

        const candidatesRes = await apiFetch<{ candidates: Candidate[] }>('/discovery/people');
        setCandidates(candidatesRes.candidates);
      } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication required'))) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleFetchAiRecommendations = async () => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setMode('ai');
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch<{ recommendations: Candidate[] }>('/ai/discovery/recommendations');
      setCandidates(res.recommendations);
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication required'))) {
        router.push('/login');
      } else {
        setMessage('Simbi AI matchmaker loaded skill synergy recommendations!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (skillId?: string, country?: string) => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setMode('standard');
    const targetSkill = skillId !== undefined ? (skillId === 'OTHER' ? '' : skillId) : selectedSkillId;
    const targetCountry = country !== undefined ? (country === 'All Countries' ? '' : country) : selectedCountry;

    setSelectedSkillId(targetSkill);
    setSelectedCountry(targetCountry);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (targetSkill) params.append('skillId', targetSkill);
      if (targetCountry) params.append('country', targetCountry);

      const endpoint = params.toString() ? `/discovery/people?${params.toString()}` : '/discovery/people';
      const res = await apiFetch<{ candidates: Candidate[] }>(endpoint);
      setCandidates(res.candidates);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication required'))) {
        router.push('/login');
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };



  // Filter candidates by debounced text query
  const filteredCandidates = candidates.filter((c) => {
    if (!debouncedKeyword.trim()) return true;
    const q = debouncedKeyword.toLowerCase();
    const nameMatch = c.user.name.toLowerCase().includes(q);
    const countryMatch = c.user.country?.toLowerCase().includes(q);
    const teachMatch = c.teachSkills.some((s) => s.name.toLowerCase().includes(q));
    const learnMatch = c.learnSkills.some((s) => s.name.toLowerCase().includes(q));
    return nameMatch || countryMatch || teachMatch || learnMatch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Skill Discovery & Matching</h1>
            <p className="text-xs text-gray-700 font-bold mt-1">
              Switch between deterministic DB matching and AI smart partner recommendations.
            </p>
          </div>
          <Link
            href="/partnerships"
            className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] text-xs font-black hover:bg-[#FACC15] transition flex items-center gap-1.5 w-fit shadow-[3px_3px_0px_0px_#0F172A]"
          >
            <span>My Partnerships</span>
            <ArrowRight className="w-4 h-4 text-[#FF7A30]" />
          </Link>
        </div>

        {/* Mode Selector Toggle: Standard DB vs AI Smart Synergy */}
        <div className="flex gap-3">
          <button
            onClick={() => handleFilter(selectedSkillId, selectedCountry)}
            className={`flex-1 py-3.5 px-4 rounded-2xl border-3 border-[#0F172A] font-black text-xs flex items-center justify-center gap-2 transition ${
              mode === 'standard'
                ? 'bg-[#FF7A30] text-white shadow-[4px_4px_0px_0px_#0F172A]'
                : 'bg-white text-[#0F172A] hover:bg-[#FACC15]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Deterministic DB Search</span>
          </button>

          <button
            onClick={handleFetchAiRecommendations}
            className={`flex-1 py-3.5 px-4 rounded-2xl border-3 border-[#0F172A] font-black text-xs flex items-center justify-center gap-2 transition ${
              mode === 'ai'
                ? 'bg-[#06B6D4] text-white shadow-[4px_4px_0px_0px_#0F172A]'
                : 'bg-white text-[#0F172A] hover:bg-[#FACC15]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Smart Synergy Matcher ✨</span>
          </button>
        </div>

        {/* Simbi Companion Speech Bubble */}
        <SimbiAvatar
          state={mode === 'ai' ? 'thinking' : 'happy'}
          message={
            mode === 'ai'
              ? 'Simbi AI is analyzing reciprocal skill synergies, goals, and co-creation project potential to find your best partners!'
              : 'Simbioly uses deterministic skill-matching formulas to find your ideal skill exchange partner worldwide!'
          }
        />

        {message && (
          <div className="p-3 text-xs text-[#0F172A] bg-[#84CC16] rounded-xl border-2 border-[#0F172A] flex items-center gap-2 font-black shadow-[3px_3px_0px_0px_#0F172A]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="neo-box p-4 sm:p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
          <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-wider">
              {mode === 'ai' ? <Bot className="w-4 h-4 text-[#06B6D4]" /> : <SlidersHorizontal className="w-4 h-4 text-[#FF7A30]" />}
              <span>{mode === 'ai' ? 'AI Recommendation Engine Results' : 'Smart DB Filter System'}</span>
            </div>
            {(selectedSkillId || selectedCountry || searchKeyword) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  handleFilter('', 'All Countries');
                }}
                className="text-[11px] font-black text-[#FF7A30] hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {/* 1. Search Bar with 300ms Debounce */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search partner name or skill..."
                className="w-full pl-10 pr-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
              />
            </div>

            {/* 2. Country Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedCountry || 'All Countries'}
                onChange={(e) => handleFilter(undefined, e.target.value)}
                className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold text-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] shadow-[3px_3px_0px_0px_#0F172A]"
              >
                <option value="All Countries">Global (All Countries)</option>
                {countries.slice(1).map((c) => (
                  <option key={c} value={c}>
                    Country: {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Compact Searchable Skill Select Dropdown */}
            <div>
              <SearchableSkillSelect
                skills={skills}
                selectedSkillId={selectedSkillId}
                onSelectSkill={(id) => handleFilter(id, undefined)}
                placeholder="Filter by specific skill..."
              />
            </div>
          </div>
        </div>

        {/* Candidates Grid Display */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 font-black animate-pulse flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#FF7A30] animate-spin" />
            <span>{mode === 'ai' ? 'Simbi AI is analyzing reciprocal partner synergies...' : 'Searching matching candidates...'}</span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="neo-box p-10 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
            <Compass className="w-12 h-12 text-[#FF7A30] mx-auto animate-spin" style={{ animationDuration: '10s' }} />
            <div className="space-y-1">
              <p className="text-base font-black text-[#0F172A]">No matching learners found for this filter.</p>
              <p className="text-xs text-gray-600 font-bold max-w-md mx-auto">
                Try searching for another country or reset your filters to see all active skill exchange candidates!
              </p>
            </div>
            <button
              onClick={() => {
                setSearchKeyword('');
                handleFilter('', 'All Countries');
              }}
              className="neo-button text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredCandidates.map((c) => (
              <GlowCard key={c.user.id}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FF7A30] border-2.5 border-[#0F172A] text-white font-black flex items-center justify-center text-sm shadow-[2.5px_2.5px_0px_0px_#0F172A]">
                        {c.user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-[#0F172A] text-base">{c.user.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                          {c.user.username && <span>@{c.user.username}</span>}
                          {c.user.country && (
                            <span className="neo-badge bg-[#06B6D4] text-white px-2 py-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>{c.user.country}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="neo-badge bg-[#FACC15] text-[#0F172A] text-[10px] px-3 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0F172A]" />
                      <span>{c.aiMatchScore ? `${c.aiMatchScore}% AI Synergy` : `${c.matchScore} pts`}</span>
                    </span>
                  </div>

                  {c.user.bio && <p className="text-xs text-gray-700 font-bold italic line-clamp-2">&quot;{c.user.bio}&quot;</p>}

                  {/* AI Smart Rationale & Project Idea Card (When in AI Mode) */}
                  {mode === 'ai' && (c.aiReasoning || c.suggestedProjectIdea) && (
                    <div className="p-3.5 rounded-xl bg-[#FFF5EF] border-2 border-[#0F172A] space-y-2 text-xs font-bold shadow-[2px_2px_0px_0px_#0F172A]">
                      {c.aiReasoning && (
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#FF7A30] flex items-center gap-1">
                            <Bot className="w-3 h-3 text-[#FF7A30]" />
                            <span>Why AI Matched You:</span>
                          </span>
                          <p className="text-gray-800 text-[11px] mt-0.5">{c.aiReasoning}</p>
                        </div>
                      )}
                      {c.suggestedProjectIdea && (
                        <div className="pt-1 border-t border-orange-200">
                          <span className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-indigo-600" />
                            <span>Suggested Co-Creation Project:</span>
                          </span>
                          <p className="text-indigo-900 text-[11px] mt-0.5">{c.suggestedProjectIdea}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teach & Learn Skills */}
                  <div className="space-y-2 text-xs bg-[#FFFDF7] p-3.5 rounded-xl border-2 border-[#0F172A]">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 mr-1.5">Can Teach:</span>
                      <span className="font-black text-[#0F172A]">
                        {c.teachSkills.map((s) => `${s.name} (${s.level})`).join(', ') || 'None listed'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#FF7A30] mr-1.5">Wants to Learn:</span>
                      <span className="font-black text-[#0F172A]">
                        {c.learnSkills.map((s) => `${s.name} (${s.level})`).join(', ') || 'None listed'}
                      </span>
                    </div>
                  </div>

                  {c.distanceKm != null && (
                    <p className="text-[10px] text-gray-600 font-black flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF7A30]" />
                      <span>Distance: {c.distanceKm} km away</span>
                    </p>
                  )}

                  <button
                    onClick={() => setProposalCandidate(c)}
                    className="w-full neo-button py-3 text-xs flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Connect for Exchange</span>
                  </button>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </main>

      {proposalCandidate && (
        <ProposalModal
          candidate={proposalCandidate}
          onClose={() => setProposalCandidate(null)}
          onSuccess={(msg) => {
            setMessage(msg);
            setCandidates((prev) => prev.filter((c) => c.user.id !== proposalCandidate.user.id));
          }}
        />
      )}
    </div>
  );
}
