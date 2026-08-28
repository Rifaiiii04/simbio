'use client';

import { Search, SlidersHorizontal, X, Globe, Sparkles } from 'lucide-react';

interface PopularSkill {
  id: string;
  name: string;
  count: number;
}

interface Props {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  countries: string[];
  popularSkills: PopularSkill[];
  selectedCategorySkills: string[];
  onToggleCategorySkill: (skillName: string) => void;
  resultsCount: number;
  onClearFilters: () => void;
}

export function DiscoveryFilterSidebar({
  searchKeyword,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  countries,
  popularSkills,
  selectedCategorySkills,
  onToggleCategorySkill,
  resultsCount,
  onClearFilters,
}: Props) {
  const hasActiveFilters =
    searchKeyword.trim() !== '' ||
    (selectedCountry !== '' && selectedCountry !== 'All Countries') ||
    selectedCategorySkills.length > 0;

  return (
    <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-5 space-y-5 shadow-xl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B30]/15 flex items-center justify-center text-[#FF6B30]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Search Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-[11px] font-bold text-[#FF6B30] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Quick Search */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Quick Search</label>
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, skill..."
            className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#18181B] text-white placeholder-neutral-500 rounded-xl border border-neutral-800 focus:border-[#FF6B30] focus:bg-[#202024] focus:outline-none transition font-medium"
          />
          {searchKeyword && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Country Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-neutral-500" />
          <span>Country</span>
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs bg-[#18181B] text-white rounded-xl border border-neutral-800 focus:border-[#FF6B30] focus:outline-none transition font-medium cursor-pointer"
        >
          {countries.map((c) => (
            <option key={c} value={c === 'All Countries' ? '' : c} className="bg-[#18181B] text-white">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Category / Popular Skills (Fixed Height with Internal Scrollbar) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B30]" />
          <span>Filter by Skill</span>
        </label>

        <div className="h-[185px] overflow-y-auto pr-1.5 scrollbar-orange rounded-xl">
          <div className="flex flex-wrap gap-1.5 py-0.5">
            {popularSkills.map((skill) => {
              const isSelected = selectedCategorySkills.includes(skill.name);
              return (
                <button
                  key={skill.id}
                  onClick={() => onToggleCategorySkill(skill.name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#FF6B30] text-white shadow-sm shadow-[#FF6B30]/30'
                      : 'bg-[#18181B] border border-neutral-800 text-neutral-300 hover:bg-[#252528] hover:text-white'
                  }`}
                >
                  <span>{skill.name}</span>
                  {isSelected && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count Badge */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-400">Results Found:</span>
        <span className="font-bold text-[#FF6B30] bg-[#FF6B30]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B30]/30">
          {resultsCount} Candidate{resultsCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
