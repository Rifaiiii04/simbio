'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface CategorySkill {
  id: string;
  name: string;
  count?: number;
}

interface CategorySkillFilterBarProps {
  skills: CategorySkill[];
  selectedSkills: string[];
  onToggleSkill: (skillName: string) => void;
  onClearAll: () => void;
}

const INITIAL_VISIBLE = 10;

export function CategorySkillFilterBar({
  skills,
  selectedSkills,
  onToggleSkill,
  onClearAll,
}: CategorySkillFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (skills.length === 0) return null;

  const remainingCount = Math.max(0, skills.length - INITIAL_VISIBLE);

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="block text-xs font-bold text-slate-700">Category</label>
          {selectedSkills.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-orange-50 text-[#FF6B30] text-[10px] font-bold border border-orange-200 leading-none">
              {selectedSkills.length}
            </span>
          )}
        </div>

        {selectedSkills.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-bold text-[#FF6B30] hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Unified Pills Container with Slightly Larger Text & Clean Linear Height Transition */}
      <div
        className={`flex flex-wrap gap-1.5 pr-0.5 scrollbar-thin transition-[max-height] duration-250 ease-in-out ${
          isExpanded ? 'max-h-56 overflow-y-auto' : 'max-h-[92px] overflow-hidden'
        }`}
      >
        {skills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.name);
          return (
            <button
              key={skill.id || skill.name}
              type="button"
              onClick={() => onToggleSkill(skill.name)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium leading-tight transition-colors flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap ${
                isSelected
                  ? 'border-[#FF6B30] bg-orange-50/70 text-[#FF6B30] font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B30] fill-[#FF6B30] stroke-white shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white shrink-0" />
              )}
              <span>{skill.name}</span>
            </button>
          );
        })}
      </div>

      {/* View More / Show Less Toggle Button */}
      {skills.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-[11px] font-bold text-[#FF6B30] hover:text-[#E0531A] flex items-center gap-0.5 cursor-pointer transition pt-0.5"
        >
          <span>{isExpanded ? 'Show less' : `View more (${remainingCount})`}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
