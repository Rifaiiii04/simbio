'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
} from 'lucide-react';

interface Candidate {
  user: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
  };
  teachSkills: Array<{ id: string; name: string; level: string; isMatch?: boolean; isRelated?: boolean }>;
  learnSkills: Array<{ id: string; name: string; level: string; isMatch?: boolean; isRelated?: boolean }>;
  matchScore: number;
  distanceKm: number | null;
  reputation?: {
    count: number;
    overall: number | null;
    averages?: { consistency: number; communication: number; knowledgeSharing: number; collaboration: number } | null;
  };
}

interface Skill {
  id: string;
  name: string;
  category?: { id: string; name: string };
}

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, { teach?: boolean; learn?: boolean }>>({});

  const toggleTeach = (userId: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], teach: !prev[userId]?.teach },
    }));
  };

  const toggleLearn = (userId: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], learn: !prev[userId]?.learn },
    }));
  };

  const countries = [
    'All Countries',
    'Indonesia',
    'United States',
    'Japan',
    'Germany',
    'United Kingdom',
    'Singapore',
    'Australia',
    'Canada',
  ];

  // 300ms debounce for text search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 300);
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
        const [skillsRes, candidatesRes] = await Promise.all([
          apiFetch<{ skills: Skill[] }>('/skills'),
          apiFetch<{ candidates: Candidate[] }>('/discovery/people'),
        ]);
        setSkills(skillsRes.skills);
        setCandidates(candidatesRes.candidates);
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          (err.message.includes('401') || err.message.includes('Authentication required'))
        ) {
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
    if (!token) {
      router.push('/login');
      return;
    }

    const targetSkill = skillId !== undefined ? (skillId === 'OTHER' ? '' : skillId) : selectedSkillId;
    const targetCountry =
      country !== undefined ? (country === 'All Countries' ? '' : country) : selectedCountry;

    setSelectedSkillId(targetSkill);
    setSelectedCountry(targetCountry);
    setCurrentPage(1);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (targetSkill) params.append('skillId', targetSkill);
      if (targetCountry) params.append('country', targetCountry);

      const endpoint = params.toString() ? `/discovery/people?${params.toString()}` : '/discovery/people';
      const res = await apiFetch<{ candidates: Candidate[] }>(endpoint);
      setCandidates(res.candidates);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes('401') || err.message.includes('Authentication required'))
      ) {
        router.push('/login');
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort candidates: highest matchScore first (top recommendations)
  const filteredCandidates = candidates
    .filter((c) => {
      if (!debouncedKeyword.trim()) return true;
      const q = debouncedKeyword.toLowerCase();
      return (
        c.user.name.toLowerCase().includes(q) ||
        c.user.country?.toLowerCase().includes(q) ||
        c.teachSkills.some((s) => s.name.toLowerCase().includes(q)) ||
        c.learnSkills.some((s) => s.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Pagination calculation (6 items per page)
  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-20 md:pb-6 space-y-3">
        {/* Simple Top Action Bar */}
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
          {/* View Tab Switcher */}
          <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200">
            <button
              onClick={() => setView('list')}
              className={`py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                view === 'list' ? 'bg-[#FF6B30] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <List className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                view === 'map' ? 'bg-[#FF6B30] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <Link
            href="/partnerships"
            className="soft-button text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1 sm:gap-1.5 shadow-xs whitespace-nowrap font-bold rounded-lg sm:rounded-xl"
          >
            <span>My Partnerships</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
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

        {/* LIST VIEW (SIDEBAR FILTER + CANDIDATE GRID WITH PAGINATION) */}
        {view === 'list' && (
          <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
            {/* 1. FILTER SIDEBAR (LEFT) - COLLAPSIBLE WITH SMOOTH ANIMATION ON MOBILE & TABLET */}
            <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4 transition-all duration-300">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFilterOpenMobile((prev) => !prev)}
                  className="flex items-center justify-between w-full lg:w-auto gap-2 text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer lg:cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#FF6B30]" />
                    <span>Search Filters</span>
                    {(selectedSkillId || selectedCountry || searchKeyword) && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B30]" />
                    )}
                  </div>

                  {/* Mobile/Tablet dropdown toggle button with rotating chevron */}
                  <div className="flex items-center gap-1.5 lg:hidden text-slate-500 font-bold">
                    <span className="text-[11px] normal-case text-slate-600">
                      {isFilterOpenMobile ? 'Hide Filters' : 'Show Filters'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-600 transition-transform duration-300 ease-in-out ${
                        isFilterOpenMobile ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Reset button on desktop */}
                {(selectedSkillId || selectedCountry || searchKeyword) && (
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      handleFilter('', 'All Countries');
                    }}
                    className="hidden lg:block text-xs font-bold text-[#FF6B30] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Smooth Animated Accordion Container */}
              <div
                className={`grid transition-all duration-300 ease-in-out lg:grid-rows-[1fr] lg:opacity-100 ${
                  isFilterOpenMobile
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 lg:opacity-100'
                }`}
              >
                <div className="overflow-hidden space-y-3.5 pt-2 border-t border-slate-100">
                  {/* Reset button inside mobile dropdown */}
                  {(selectedSkillId || selectedCountry || searchKeyword) && (
                    <div className="flex justify-end lg:hidden">
                      <button
                        onClick={() => {
                          setSearchKeyword('');
                          handleFilter('', 'All Countries');
                        }}
                        className="text-xs font-bold text-[#FF6B30] hover:underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}

                  {/* Search */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Quick Search</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Name / skill..."
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Country</label>
                    <select
                      value={selectedCountry || 'All Countries'}
                      onChange={(e) => handleFilter(undefined, e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
                    >
                      <option value="All Countries">All Countries (Global)</option>
                      {countries.slice(1).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skill Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Specific Skill</label>
                    <SearchableSkillSelect
                      skills={skills}
                      selectedSkillId={selectedSkillId}
                      onSelectSkill={(id) => handleFilter(id, undefined)}
                      placeholder="Select a skill..."
                    />
                  </div>

                  {/* Result Counter */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Results Found:</span>
                    <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs px-2.5 py-0.5 font-black">
                      {totalItems} Candidates
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 2. CANDIDATE GRID & PAGINATION (RIGHT) */}
            <div className="flex-1 w-full space-y-4">
              {loading ? (
                <div className="text-center py-16 text-xs text-slate-500 font-bold animate-pulse flex flex-col items-center gap-3">
                  <Sparkles className="w-8 h-8 text-[#FF6B30] animate-spin" />
                  <span>Searching for partner candidates...</span>
                </div>
              ) : totalItems === 0 ? (
                <div className="soft-card p-10 text-center space-y-4 bg-white border border-slate-200/80">
                  <Compass
                    className="w-12 h-12 text-[#FF6B30] mx-auto animate-spin"
                    style={{ animationDuration: '10s' }}
                  />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">No candidates match this filter.</p>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                      Try adjusting your search criteria or reset filters to view all active candidates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      handleFilter('', 'All Countries');
                    }}
                    className="soft-button text-xs px-6 py-2.5 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginatedCandidates.map((c) => {
                      const isTopMatch = c.matchScore >= 15;
                      const ratingValue = c.reputation?.overall != null ? c.reputation.overall.toFixed(1) : '5.0';

                      return (
                        <div
                          key={c.user.id}
                          className={`soft-card p-4 sm:p-5 bg-white border space-y-3.5 shadow-xs hover:border-[#FF6B30]/50 hover:shadow-md transition-all duration-200 group flex flex-col justify-between relative rounded-2xl ${
                            isTopMatch
                              ? 'border-orange-200/90 ring-1 ring-orange-400/20'
                              : 'border-slate-200/80'
                          }`}
                        >
                          {/* Top Match Tag */}
                          {isTopMatch && (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FF6B30] to-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 text-yellow-200 fill-current" />
                              <span>Top Match</span>
                            </div>
                          )}

                          <div className="space-y-3">
                            {/* Card Header: Avatar, Name & Rating */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {/* Profile Picture Photo */}
                                <div className="relative shrink-0">
                                  <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/80 overflow-hidden shadow-2xs">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getAvatarUrl(c.user.avatarUrl, c.user.username || c.user.name)}
                                      alt={c.user.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                                          c.user.username || c.user.name
                                        )}`;
                                      }}
                                    />
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#FF6B30] transition truncate">
                                      {c.user.name}
                                    </h3>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  </div>
                                  {c.user.username && (
                                    <p className="text-[#FF6B30] font-semibold text-[11px] truncate leading-tight">
                                      @{c.user.username}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Star Rating Badge (1/5 - 5/5) */}
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shrink-0 shadow-2xs">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>{ratingValue} / 5</span>
                              </div>
                            </div>

                            {/* Location & Country Info */}
                            {(c.user.country || c.distanceKm != null) && (
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                                {c.user.country && (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                    <Globe className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                    <span>{c.user.country}</span>
                                  </span>
                                )}
                                {c.distanceKm != null && (
                                  <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                                    <MapPin className="w-2.5 h-2.5 text-[#FF6B30] shrink-0" />
                                    <span>{c.distanceKm} km away</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bio Preview */}
                            {c.user.bio && (
                              <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 italic">
                                &ldquo;{c.user.bio}&rdquo;
                              </p>
                            )}

                            {/* Skills Section: Compact 2 Items initially + Interactive "+X more" expand toggle */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                              {/* Can Teach */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 tracking-wider">
                                  <BookOpen className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Can Teach:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {c.teachSkills.length === 0 ? (
                                    <span className="text-slate-400 italic text-[10px]">None listed</span>
                                  ) : (
                                    <>
                                      {(expandedSkills[c.user.id]?.teach ? c.teachSkills : c.teachSkills.slice(0, 2)).map((s) => (
                                        <span
                                          key={s.id}
                                          className={`text-[10px] leading-normal px-2 py-0.5 rounded-md font-semibold border transition ${
                                            s.isMatch
                                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400/40 font-bold'
                                              : s.isRelated
                                              ? 'bg-teal-50 text-teal-800 border-teal-200/80'
                                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                          }`}
                                        >
                                          {s.name}{' '}
                                          <span className="opacity-60 text-[8.5px] font-normal">({s.level.toLowerCase()})</span>
                                        </span>
                                      ))}
                                      {c.teachSkills.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => toggleTeach(c.user.id)}
                                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[9px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer transition shadow-2xs"
                                        >
                                          {expandedSkills[c.user.id]?.teach
                                            ? 'Show less'
                                            : `+${c.teachSkills.length - 2} more`}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Wants to Learn */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#FF6B30] tracking-wider">
                                  <Award className="w-2.5 h-2.5 text-[#FF6B30]" />
                                  <span>Wants to Learn:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {c.learnSkills.length === 0 ? (
                                    <span className="text-slate-400 italic text-[10px]">None listed</span>
                                  ) : (
                                    <>
                                      {(expandedSkills[c.user.id]?.learn ? c.learnSkills : c.learnSkills.slice(0, 2)).map((s) => (
                                        <span
                                          key={s.id}
                                          className={`text-[10px] leading-normal px-2 py-0.5 rounded-md font-semibold border transition ${
                                            s.isMatch
                                              ? 'bg-orange-100 text-orange-900 border-orange-300 ring-1 ring-orange-400/40 font-bold'
                                              : s.isRelated
                                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                              : 'bg-orange-50 text-[#FF6B30] border-orange-200/80'
                                          }`}
                                        >
                                          {s.name}{' '}
                                          <span className="opacity-60 text-[8.5px] font-normal">({s.level.toLowerCase()})</span>
                                        </span>
                                      ))}
                                      {c.learnSkills.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => toggleLearn(c.user.id)}
                                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[9px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer transition shadow-2xs"
                                        >
                                          {expandedSkills[c.user.id]?.learn
                                            ? 'Show less'
                                            : `+${c.learnSkills.length - 2} more`}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer Connect Button */}
                          <div className="pt-2.5 border-t border-slate-100">
                            <button
                              onClick={() => setProposalCandidate(c)}
                              className="w-full soft-button py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-2xs font-bold rounded-xl cursor-pointer hover:bg-[#E0531A] transition"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-white" />
                              <span>Connect Exchange</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Bar (6 Users per Page) */}
                  {totalPages > 1 && (
                    <div className="soft-card p-3 sm:p-4 bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs rounded-2xl">
                      <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                        Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
                        <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
                        <span className="font-bold text-[#FF6B30]">{totalItems}</span> Candidates
                      </p>

                      <div className="flex items-center gap-1.5">
                        {/* Prev Button */}
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={validCurrentPage === 1}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                pageNum === validCurrentPage
                                  ? 'bg-[#FF6B30] text-white shadow-xs'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={validCurrentPage === totalPages}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
