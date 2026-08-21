'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Plus, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

export interface SkillItem {
  id: string;
  name: string;
  category?: { name: string };
}

interface SearchableSkillSelectProps {
  skills: SkillItem[];
  selectedSkillId: string;
  customSkillName?: string;
  onSelectSkill: (skillId: string, customName?: string, skillObj?: SkillItem) => void;
  placeholder?: string;
}

export function SearchableSkillSelect({
  skills,
  selectedSkillId,
  customSkillName = '',
  onSelectSkill,
  placeholder = 'Search or select skill...',
}: SearchableSkillSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(selectedSkillId === 'OTHER');
  const [otherInput, setOtherInput] = useState(customSkillName);
  const [creatingCustom, setCreatingCustom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query input (300ms) for high performance UX
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSkills = skills.filter((s) => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(q);
    const catMatch = s.category?.name.toLowerCase().includes(q);
    return nameMatch || catMatch;
  });

  const selectedSkill = skills.find((s) => s.id === selectedSkillId);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (s: SkillItem) => {
    setIsOtherSelected(false);
    onSelectSkill(s.id, s.name, s);
    setIsOpen(false);
  };

  const handleSelectOther = () => {
    setIsOtherSelected(true);
    setIsOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOtherInput(val);
  };

  const handleCreateCustomSkillOnFly = async () => {
    const trimmed = otherInput.trim();
    if (!trimmed || creatingCustom) return;
    setCreatingCustom(true);
    try {
      const created = await apiFetch<{ skill: SkillItem }>('/skills', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmed,
        }),
      });

      setIsOtherSelected(false);
      setOtherInput('');
      onSelectSkill(created.skill.id, created.skill.name, created.skill);
    } catch (err) {
      console.error('Failed to create/deduplicate custom skill:', err);
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2 font-sans">
      {/* Dropdown Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 font-medium text-xs rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs hover:bg-white hover:border-[#FF6B30] transition cursor-pointer"
      >
        <span className="truncate">
          {isOtherSelected
            ? `Custom: ${otherInput || 'Custom Skill'}`
            : selectedSkill
            ? `${selectedSkill.name} ${selectedSkill.category ? `(${selectedSkill.category.name})` : ''}`
            : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#FF6B30]' : ''}`} />
      </button>

      {/* Custom Skill Input when 'OTHER' is selected */}
      {isOtherSelected && (
        <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/80 space-y-2 shadow-2xs">
          <label className="block text-[10px] font-bold text-[#FF6B30] uppercase tracking-wider">
            Enter Custom Skill Name
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={otherInput}
              onChange={handleOtherInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCustomSkillOnFly();
                }
              }}
              placeholder="e.g. Quantum Computing, Sound Design..."
              className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30]"
            />
            <button
              type="button"
              disabled={creatingCustom || !otherInput.trim()}
              onClick={handleCreateCustomSkillOnFly}
              className="soft-button text-xs px-3 py-2 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingCustom ? 'Adding...' : '+ Add'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Dropdown Panel with Debounced Search */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 space-y-3 max-h-72 flex flex-col">
          {/* Search Box with Debounce */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search skills..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white"
            />
          </div>

          {/* Options Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredSkills.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                No matching skills found.
              </div>
            ) : (
              filteredSkills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    selectedSkillId === s.id
                      ? 'bg-[#FF6B30] text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <span>{s.name}</span>
                    {s.category && (
                      <span className="text-[10px] opacity-75 font-normal ml-1.5">
                        ({s.category.name})
                      </span>
                    )}
                  </div>
                  {selectedSkillId === s.id && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>

          {/* "Others" Custom Skill Option at bottom of dropdown */}
          <button
            type="button"
            onClick={handleSelectOther}
            className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              isOtherSelected
                ? 'bg-[#FF6B30] text-white border-[#FF6B30]'
                : 'bg-orange-50/70 border-orange-200 text-[#FF6B30] hover:bg-orange-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Other / Custom Skill (Type Your Own)</span>
          </button>
        </div>
      )}
    </div>
  );
}
