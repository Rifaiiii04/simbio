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
  BookOpen,
  Award,
  Zap,
  ShieldCheck,
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
        setMessage('Simbi AI matchmaker berhasil memuat rekomendasi sinergi skill!');
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Command Banner */}
        <div className="soft-card p-6 sm:p-7 bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                Global Skill Exchange Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Skill Discovery & Partner Matching
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Cari partner reciprocal ideal kamu menggunakan pencocokan DB deterministik atau rekomendasi sinergi AI Smart Synergy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Selector Pills */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => handleFilter(selectedSkillId, selectedCountry)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  mode === 'standard'
                    ? 'bg-[#FF6B30] text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>DB Matcher</span>
              </button>
              <button
                onClick={handleFetchAiRecommendations}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  mode === 'ai'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Smart Synergy ✨</span>
              </button>
            </div>

            <Link
              href="/partnerships"
              className="soft-button text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 shadow-xs whitespace-nowrap"
            >
              <span>Kemitraan Saya</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {message && (
          <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Asymmetrical 2-Column Split Canvas (8 Cols Main Stream | 4 Cols AI Matchmaker Panel) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT MAIN DISCOVERY CANVAS (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter Toolbar Card */}
            <div className="soft-card p-4 sm:p-5 bg-white space-y-3 shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {mode === 'ai' ? <Bot className="w-4 h-4 text-sky-600" /> : <SlidersHorizontal className="w-4 h-4 text-[#FF6B30]" />}
                  <span>{mode === 'ai' ? 'Hasil Rekomendasi AI Synergy Engine' : 'Sistem Filter DB Deterministik'}</span>
                </div>
                {(selectedSkillId || selectedCountry || searchKeyword) && (
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      handleFilter('', 'All Countries');
                    }}
                    className="text-xs font-bold text-[#FF6B30] hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Cari nama partner atau skill..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                  />
                </div>

                {/* Country Filter */}
                <div className="relative">
                  <select
                    value={selectedCountry || 'All Countries'}
                    onChange={(e) => handleFilter(undefined, e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                  >
                    <option value="All Countries">Semua Negara (Global)</option>
                    {countries.slice(1).map((c) => (
                      <option key={c} value={c}>
                        Negara: {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Filter */}
                <div>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId={selectedSkillId}
                    onSelectSkill={(id) => handleFilter(id, undefined)}
                    placeholder="Filter spesifik skill..."
                  />
                </div>
              </div>
            </div>

            {/* Overhauled Candidate Cards Grid (2 Columns inside 8-col canvas) */}
            {loading ? (
              <div className="text-center py-16 text-xs text-slate-500 font-bold animate-pulse flex flex-col items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#FF6B30] animate-spin" />
                <span>{mode === 'ai' ? 'Simbi AI sedang menganalisis sinergi reciprocal skill...' : 'Mencari kandidat partner...'}</span>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="soft-card p-10 text-center space-y-4 bg-white border border-slate-200/80">
                <Compass className="w-12 h-12 text-[#FF6B30] mx-auto animate-spin" style={{ animationDuration: '10s' }} />
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">Tidak ada pembelajar yang cocok untuk filter ini.</p>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Coba cari nama negara lain atau reset filter untuk melihat seluruh kandidat aktif.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    handleFilter('', 'All Countries');
                  }}
                  className="soft-button text-xs px-6 py-2.5 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredCandidates.map((c) => (
                  <div
                    key={c.user.id}
                    className="soft-card p-6 bg-white border border-slate-200/80 space-y-5 shadow-xs hover:border-[#FF6B30]/50 transition group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Header Partner Info & Match Score Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-13 h-13 rounded-2xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-lg shadow-2xs flex-shrink-0">
                            {c.user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.user.avatarUrl} alt={c.user.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              c.user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-black text-slate-900 text-lg group-hover:text-[#FF6B30] transition">
                                {c.user.name}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              {c.user.username && <span>@{c.user.username}</span>}
                              {c.user.country && (
                                <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 px-2 py-0.5 text-[10px] flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{c.user.country}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-1 font-bold flex items-center gap-1 shrink-0">
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{c.aiMatchScore ? `${c.aiMatchScore}% Match` : `${c.matchScore} pts`}</span>
                        </span>
                      </div>

                      {c.user.bio && (
                        <p className="text-xs text-slate-600 font-medium italic line-clamp-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          &quot;{c.user.bio}&quot;
                        </p>
                      )}

                      {/* AI Reasoning & Project Idea Box (When in AI Mode) */}
                      {mode === 'ai' && (c.aiReasoning || c.suggestedProjectIdea) && (
                        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 space-y-2 text-xs font-medium shadow-2xs">
                          {c.aiReasoning && (
                            <div>
                              <span className="text-[10px] font-bold uppercase text-sky-800 flex items-center gap-1">
                                <Bot className="w-3.5 h-3.5 text-sky-600" />
                                <span>Alasan Pencocokan AI:</span>
                              </span>
                              <p className="text-slate-700 text-[11px] mt-0.5">{c.aiReasoning}</p>
                            </div>
                          )}
                          {c.suggestedProjectIdea && (
                            <div className="pt-1.5 border-t border-sky-200/60">
                              <span className="text-[10px] font-bold uppercase text-indigo-700 flex items-center gap-1">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Ide Proyek Kolaborasi:</span>
                              </span>
                              <p className="text-indigo-950 text-[11px] mt-0.5">{c.suggestedProjectIdea}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reciprocal Skills Visual Matrix */}
                      <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-700 mb-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bisa Mengajar (Teach):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {c.teachSkills.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">Belum dicantumkan</span>
                            ) : (
                              c.teachSkills.map((s) => (
                                <span key={s.id} className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] px-2.5 py-0.5 font-bold">
                                  {s.name} ({s.level})
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#FF6B30] mb-1.5">
                            <Award className="w-3.5 h-3.5 text-[#FF6B30]" />
                            <span>Ingin Dipelajari (Learn):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {c.learnSkills.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">Belum dicantumkan</span>
                            ) : (
                              c.learnSkills.map((s) => (
                                <span key={s.id} className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px] px-2.5 py-0.5 font-bold">
                                  {s.name} ({s.level})
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Connect Button */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setProposalCandidate(c)}
                        className="w-full soft-button py-3 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold"
                      >
                        <UserCheck className="w-4 h-4 text-white" />
                        <span>⚡ Hubungkan Exchange</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR PANEL (4 Columns - AI Matchmaker & Insight Panel) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Simbi Companion Mascot Advice */}
            <SimbiAvatar
              state={mode === 'ai' ? 'thinking' : 'happy'}
              message={
                mode === 'ai'
                  ? 'Simbi AI sedang menganalisis sinergi skill, goal belajar, dan potensi ide proyek bersama!'
                  : 'Gunakan mode AI Smart Synergy untuk mendapatkan rekomendasi pasangan pertukaran skill berakurasi tinggi!'
              }
            />

            {/* Match Formula Info Card */}
            <div className="soft-card p-6 bg-white space-y-4 shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-[#FF6B30]" />
                <h3 className="text-sm font-bold text-slate-900">Algoritma Matching Simbioly</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
                <p>
                  Sistem Simbioly menggunakan kalkulasi deterministik 2-arah (reciprocal exchange). Skor dihitung bila skill yang kamu ajarkan dicari oleh partner, dan sebaliknya.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] font-mono text-slate-700">
                  ⚡ Match Score = Teach(A) ∩ Learn(B) + Teach(B) ∩ Learn(A)
                </div>
              </div>
            </div>

            {/* Proximity Location Info Card */}
            <div className="soft-card p-6 bg-slate-900 text-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B30]" />
                <h3 className="text-sm font-bold text-white">Proximity Distance Matcher</h3>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Aktifkan fitur lokasi di halaman Profil kamu untuk menemukan partner belajar yang berjarak dekat dengan lokasi domisili kamu!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Connection Proposal Modal */}
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
