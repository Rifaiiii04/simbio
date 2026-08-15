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
  onSelectSkill: (skillId: string, customName?: string) => void;
  placeholder?: string;
}

export function SearchableSkillSelect({
  skills,
  selectedSkillId,
  customSkillName = '',
  onSelectSkill,
  placeholder = 'Search or choose a skill...',
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

  const handleSelect = (s: SkillItem) => {
    setIsOtherSelected(false);
    onSelectSkill(s.id, '');
    setIsOpen(false);
  };

  const handleSelectOther = () => {
    setIsOtherSelected(true);
    onSelectSkill('OTHER', otherInput);
    setIsOpen(false);
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOtherInput(val);
    onSelectSkill('OTHER', val);
  };

  const handleCreateCustomSkillOnFly = async () => {
    if (!otherInput.trim()) return;
    setCreatingCustom(true);
    try {
      // Find default category ID or create under first category
      const categoriesRes = await apiFetch<{ categories: Array<{ id: string }> }>('/skills/categories');
      const categoryId = categoriesRes.categories[0]?.id;

      if (categoryId) {
        const slug = otherInput
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');

        const created = await apiFetch<{ skill: SkillItem }>('/skills', {
          method: 'POST',
          body: JSON.stringify({
            categoryId,
            name: otherInput.trim(),
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            description: 'User added custom skill',
          }),
        });

        setIsOtherSelected(false);
        onSelectSkill(created.skill.id, '');
      }
    } catch {
      // If custom creation fails, fallback to 'OTHER' custom name
      onSelectSkill('OTHER', otherInput.trim());
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Dropdown Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white text-[#0F172A] font-bold text-xs rounded-xl border-2 border-[#0F172A] flex items-center justify-between shadow-[3px_3px_0px_0px_#0F172A] hover:bg-gray-50 transition"
      >
        <span className="truncate">
          {isOtherSelected
            ? `Other: ${otherInput || 'Custom Skill'}`
            : selectedSkill
            ? `${selectedSkill.name} ${selectedSkill.category ? `(${selectedSkill.category.name})` : ''}`
            : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#FF7A30] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Skill Input when 'OTHER' is selected */}
      {isOtherSelected && (
        <div className="p-3 bg-[#FFF5EF] rounded-xl border-2 border-[#0F172A] space-y-2 shadow-[3px_3px_0px_0px_#0F172A]">
          <label className="block text-[11px] font-black text-[#FF7A30] uppercase tracking-wider">
            Enter Custom Skill Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={otherInput}
              onChange={handleOtherInputChange}
              placeholder="e.g. Quantum Computing, Pottery, Biohacking..."
              className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border-2 border-[#0F172A] font-bold focus:outline-hidden"
            />
            <button
              type="button"
              disabled={creatingCustom || !otherInput.trim()}
              onClick={handleCreateCustomSkillOnFly}
              className="neo-button text-xs px-3 py-2 flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{creatingCustom ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Dropdown Panel with Debounced Search */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-3 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_0px_#0F172A] p-3 space-y-3 max-h-72 flex flex-col">
          {/* Search Box with Debounce */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search (300ms debounced)..."
              className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30]"
            />
          </div>

          {/* Options Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredSkills.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-500 font-bold">
                No matching skill found.
              </div>
            ) : (
              filteredSkills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition ${
                    selectedSkillId === s.id
                      ? 'bg-[#FF7A30] text-white'
                      : 'hover:bg-[#FACC15] text-[#0F172A]'
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
            className={`w-full text-left p-2.5 rounded-xl border-2 border-[#0F172A] text-xs font-black flex items-center gap-2 transition ${
              isOtherSelected ? 'bg-[#FF7A30] text-white' : 'bg-[#FFF5EF] text-[#FF7A30] hover:bg-[#FACC15]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Other / Custom Skill (Type your own)</span>
          </button>
        </div>
      )}
    </div>
  );
}
