'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { ProposalModal } from '@/components/discovery/ProposalModal';
import { MapView } from '@/components/discovery/MapView';
import { DiscoveryCandidateCard, type DiscoveryCandidate } from '@/components/discovery/DiscoveryCandidateCard';
import { DiscoveryFilterSidebar } from '@/components/discovery/DiscoveryFilterSidebar';
import { DiscoveryPagination } from '@/components/discovery/DiscoveryPagination';
import {
  Sparkles,
  List,
  Map as MapIcon,
  Handshake,
  SlidersHorizontal,
  X,
  Compass,
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category?: { id: string; name: string };
}

const ITEMS_PER_PAGE = 12;

const COUNTRIES = [
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

export default function DiscoveryPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategorySkills, setSelectedCategorySkills] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [proposalCandidate, setProposalCandidate] = useState<DiscoveryCandidate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // 300ms debounce for search keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // Load candidates and skills
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [candRes, skillRes] = await Promise.all([
          apiFetch<{ candidates: DiscoveryCandidate[] }>('/discovery/people'),
          apiFetch<{ skills: Skill[] }>('/skills'),
        ]);
        setCandidates(candRes.candidates || []);
        setSkills(skillRes.skills || []);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Popular skills calculated by frequency
  const popularSkills = useMemo(() => {
    const map: Record<string, { id: string; name: string; count: number }> = {};
    candidates.forEach((c) => {
      [...c.teachSkills, ...c.learnSkills].forEach((s) => {
        const key = s.name.trim();
        if (key) {
          if (!map[key]) map[key] = { id: s.id || key, name: key, count: 0 };
          map[key].count += 1;
        }
      });
    });
    skills.forEach((s) => {
      const key = s.name.trim();
      if (key && !map[key]) map[key] = { id: s.id, name: key, count: 0 };
    });
    return Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [candidates, skills]);

  const handleToggleCategorySkill = (skillName: string) => {
    setSelectedCategorySkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setDebouncedKeyword('');
    setSelectedCountry('');
    setSelectedCategorySkills([]);
    setCurrentPage(1);
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (selectedCountry && c.user.country?.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (selectedCategorySkills.length > 0) {
        const allSkillNames = [...c.teachSkills, ...c.learnSkills].map((s) => s.name.toLowerCase());
        const hasMatch = selectedCategorySkills.some((cat) => allSkillNames.includes(cat.toLowerCase()));
        if (!hasMatch) return false;
      }
      if (debouncedKeyword.trim()) {
        const q = debouncedKeyword.toLowerCase();
        const inName = c.user.name.toLowerCase().includes(q);
        const inSkills = [...c.teachSkills, ...c.learnSkills].some((s) => s.name.toLowerCase().includes(q));
        const inCountry = c.user.country?.toLowerCase().includes(q);
        if (!inName && !inSkills && !inCountry) return false;
      }
      return true;
    });
  }, [candidates, selectedCountry, selectedCategorySkills, debouncedKeyword]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0A0A0A] text-white overflow-hidden relative">
      <Navbar />

      <main className="flex-1 min-h-0 flex flex-col w-full max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-[74px] md:pb-3.5 gap-3 overflow-hidden">
        {/* Top Control Bar: View Switcher (List vs Map) & Shortcuts */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-[#121214] border border-neutral-800/80 p-2.5 sm:p-3 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setView('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                view === 'list'
                  ? 'bg-[#FF6B30] text-white shadow-md shadow-[#FF6B30]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                view === 'map'
                  ? 'bg-[#FF6B30] text-white shadow-md shadow-[#FF6B30]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {view === 'list' && (
              <button
                onClick={() => setIsFilterOpenMobile(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-[#18181B] border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B30]" />
                <span>Filters</span>
              </button>
            )}

            <Link
              href="/partnerships"
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#FF6B30]/20"
            >
              <Handshake className="w-4 h-4" />
              <span>My Partnerships</span>
            </Link>
          </div>
        </div>

        {/* Main Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-9 h-9 text-[#FF6B30] animate-spin mb-3" />
            <p className="text-sm font-bold text-neutral-300">Discovering study partners...</p>
          </div>
        ) : view === 'map' ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <MapView />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
            {/* Desktop Filters Sidebar: Scrolls internally if needed */}
            <div className="hidden lg:block w-72 xl:w-80 shrink-0 h-full overflow-y-auto scrollbar-thin pr-1">
              <DiscoveryFilterSidebar
                searchKeyword={searchKeyword}
                onSearchChange={setSearchKeyword}
                selectedCountry={selectedCountry}
                onCountryChange={(c) => {
                  setSelectedCountry(c);
                  setCurrentPage(1);
                }}
                countries={COUNTRIES}
                popularSkills={popularSkills}
                selectedCategorySkills={selectedCategorySkills}
                onToggleCategorySkill={handleToggleCategorySkill}
                resultsCount={filteredCandidates.length}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Candidate Cards Column: Scrollable Grid + Fixed Bottom Pagination */}
            <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
              {paginatedCandidates.length === 0 ? (
                <div className="flex-1 bg-[#121214] border border-neutral-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                  <Compass className="w-10 h-10 text-neutral-600 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No Study Partners Found</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mb-5">
                    We couldn&apos;t find any candidates matching your active filters. Try clearing your filters or search keywords.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#FF6B30] hover:bg-[#E0531A] text-white text-xs font-bold transition shadow-md shadow-[#FF6B30]/25 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Dedicated Scrollable Grid for Cards Only */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 scrollbar-orange">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 pb-3">
                      {paginatedCandidates.map((candidate) => (
                        <DiscoveryCandidateCard
                          key={candidate.user.id}
                          candidate={candidate}
                          onConnect={(cand) => setProposalCandidate(cand)}
                        />
                      ))}
                    </div>

                    {/* On Mobile: Pagination sits naturally at the end of the card list */}
                    <div className="md:hidden pt-3 pb-8 border-t border-neutral-800/60">
                      <DiscoveryPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        totalItems={filteredCandidates.length}
                        startIndex={startIndex}
                        endIndex={endIndex}
                      />
                    </div>
                  </div>

                  {/* On Desktop/Tablet: Fixed Bottom Pagination Bar */}
                  <div className="hidden md:block shrink-0 pt-1.5 pb-0.5 border-t border-neutral-800/60 bg-[#0A0A0A]">
                    <DiscoveryPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(p) => setCurrentPage(p)}
                      totalItems={filteredCandidates.length}
                      startIndex={startIndex}
                      endIndex={endIndex}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Filters Modal Drawer */}
      {isFilterOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-[#0E0E10] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white">Search & Filter</h3>
              <button
                onClick={() => setIsFilterOpenMobile(false)}
                className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DiscoveryFilterSidebar
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
              selectedCountry={selectedCountry}
              onCountryChange={(c) => {
                setSelectedCountry(c);
                setCurrentPage(1);
              }}
              countries={COUNTRIES}
              popularSkills={popularSkills}
              selectedCategorySkills={selectedCategorySkills}
              onToggleCategorySkill={handleToggleCategorySkill}
              resultsCount={filteredCandidates.length}
              onClearFilters={handleClearFilters}
            />

            <button
              onClick={() => setIsFilterOpenMobile(false)}
              className="w-full py-3 rounded-xl bg-[#FF6B30] text-white text-xs font-bold transition shadow-md shadow-[#FF6B30]/25 cursor-pointer"
            >
              Apply Filters ({filteredCandidates.length} Results)
            </button>
          </div>
        </div>
      )}

      {/* Match Proposal Modal */}
      {proposalCandidate && (
        <ProposalModal
          candidate={proposalCandidate}
          onClose={() => setProposalCandidate(null)}
          onSuccess={() => setProposalCandidate(null)}
        />
      )}
    </div>
  );
}
