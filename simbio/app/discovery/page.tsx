'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import { MapView } from '@/components/discovery/MapView';
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
  BookOpen,
  Award,
  Zap,
  ShieldCheck,
  Map,
  List,
} from 'lucide-react';

interface Candidate {
  user: { id: string; name: string; username: string | null; avatarUrl: string | null; bio: string | null; country: string | null };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
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
  const [view, setView] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [proposalCandidate, setProposalCandidate] = useState<Candidate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const countries = ['All Countries', 'Indonesia', 'United States', 'Japan', 'Germany', 'United Kingdom', 'Singapore', 'Australia', 'Canada'];

  // 300ms debounce for text search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) { router.push('/login'); return; }

    async function loadData() {
      try {
        const [skillsRes, candidatesRes] = await Promise.all([
          apiFetch<{ skills: Skill[] }>('/skills'),
          apiFetch<{ candidates: Candidate[] }>('/discovery/people'),
        ]);
        setSkills(skillsRes.skills);
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

  const handleFilter = async (skillId?: string, country?: string) => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) { router.push('/login'); return; }

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

  const filteredCandidates = candidates.filter((c) => {
    if (!debouncedKeyword.trim()) return true;
    const q = debouncedKeyword.toLowerCase();
    return (
      c.user.name.toLowerCase().includes(q) ||
      c.user.country?.toLowerCase().includes(q) ||
      c.teachSkills.some((s) => s.name.toLowerCase().includes(q)) ||
      c.learnSkills.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-24 md:pb-6 space-y-3">
        {/* Header */}
        <div className="soft-card p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px] font-bold">
              Global Skill Exchange Network
            </span>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Skill Discovery & Partner Matching
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-2xl">
              Cari partner reciprocal ideal kamu melalui pencocokan deterministik berbasis skill atau temukan mereka langsung di peta sekitarmu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setView('list')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  view === 'list' ? 'bg-[#FF6B30] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
              <button
                onClick={() => setView('map')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  view === 'map' ? 'bg-[#FF6B30] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Peta Terdekat</span>
              </button>
            </div>

            <Link
              href="/partnerships"
              className="soft-button text-xs px-4 py-2 flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>Kemitraan Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {message && (
          <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* MAP VIEW */}
        {view === 'map' && (
          <div className="w-full">
            <MapView />
          </div>
        )}

        {/* LIST VIEW (SIDEBAR FILTER + CANDIDATE GRID) */}
        {view === 'list' && (
          <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
            {/* 1. NON-STICKY FILTER SIDEBAR (LEFT) */}
            <aside className="w-full lg:w-72 shrink-0 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF6B30]" />
                  <span>Filter Pencarian</span>
                </div>
                {(selectedSkillId || selectedCountry || searchKeyword) && (
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      handleFilter('', 'All Countries');
                    }}
                    className="text-xs font-bold text-[#FF6B30] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Pencarian Cepat</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Nama / skill..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 rounded-2xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Negara Domisili</label>
                <select
                  value={selectedCountry || 'All Countries'}
                  onChange={(e) => handleFilter(undefined, e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-2xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                >
                  <option value="All Countries">Semua Negara (Global)</option>
                  {countries.slice(1).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Spesifik Skill</label>
                <SearchableSkillSelect
                  skills={skills}
                  selectedSkillId={selectedSkillId}
                  onSelectSkill={(id) => handleFilter(id, undefined)}
                  placeholder="Pilih skill..."
                />
              </div>

              {/* Result Counter */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Ditemukan:</span>
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs px-2.5 py-0.5 font-black">
                  {filteredCandidates.length} Kandidat
                </span>
              </div>
            </aside>

            {/* 2. CANDIDATE GRID (RIGHT) */}
            <div className="flex-1 w-full space-y-4">
              {loading ? (
                <div className="text-center py-16 text-xs text-slate-500 font-bold animate-pulse flex flex-col items-center gap-3">
                  <Sparkles className="w-8 h-8 text-[#FF6B30] animate-spin" />
                  <span>Mencari kandidat partner...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="soft-card p-10 text-center space-y-4 bg-white border border-slate-200/80">
                  <Compass className="w-12 h-12 text-[#FF6B30] mx-auto animate-spin" style={{ animationDuration: '10s' }} />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">Tidak ada kandidat yang cocok untuk filter ini.</p>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                      Coba cari negara lain atau reset filter untuk melihat seluruh kandidat aktif.
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCandidates.map((c) => (
                    <div
                      key={c.user.id}
                      className="soft-card p-5 bg-white border border-slate-200/80 space-y-4 shadow-xs hover:border-[#FF6B30]/50 hover:shadow-md transition group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-base shadow-2xs shrink-0 overflow-hidden">
                              {c.user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.user.avatarUrl} alt={c.user.name} className="w-full h-full object-cover" />
                              ) : (
                                c.user.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-black text-slate-900 text-base group-hover:text-[#FF6B30] transition truncate">
                                  {c.user.name}
                                </h3>
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                                {c.user.username && <span>@{c.user.username}</span>}
                                {c.user.country && (
                                  <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 px-1.5 py-0.2 text-[9px] flex items-center gap-1">
                                    <Globe className="w-2.5 h-2.5" />
                                    <span>{c.user.country}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5 font-bold flex items-center gap-1 shrink-0">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>{c.matchScore} pts</span>
                          </span>
                        </div>

                        {c.user.bio && (
                          <p className="text-xs text-slate-600 font-medium italic line-clamp-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                            &quot;{c.user.bio}&quot;
                          </p>
                        )}

                        {c.distanceKm != null && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3 h-3 text-[#FF6B30]" />
                            <span>{c.distanceKm} km dari lokasimu</span>
                          </div>
                        )}

                        {/* Skill Matrix */}
                        <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs">
                          <div>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 mb-1">
                              <BookOpen className="w-3 h-3 text-emerald-600" />
                              <span>Bisa Mengajar:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {c.teachSkills.length === 0 ? (
                                <span className="text-slate-400 italic text-[10px]">Belum dicantumkan</span>
                              ) : (
                                c.teachSkills.map((s) => (
                                  <span
                                    key={s.id}
                                    className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] px-2 py-0.5 font-bold"
                                  >
                                    {s.name} ({s.level})
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-slate-200/60">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#FF6B30] mb-1">
                              <Award className="w-3 h-3 text-[#FF6B30]" />
                              <span>Ingin Belajar:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {c.learnSkills.length === 0 ? (
                                <span className="text-slate-400 italic text-[10px]">Belum dicantumkan</span>
                              ) : (
                                c.learnSkills.map((s) => (
                                  <span
                                    key={s.id}
                                    className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px] px-2 py-0.5 font-bold"
                                  >
                                    {s.name} ({s.level})
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setProposalCandidate(c)}
                          className="w-full soft-button py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-2xs font-bold"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          <span>⚡ Hubungkan Exchange</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
