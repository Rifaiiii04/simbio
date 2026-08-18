'use client';

import { Sparkles, User } from 'lucide-react';

interface MentionDropdownProps {
  partnerName: string;
  partnerUsername?: string | null;
  onSelectMention: (mentionText: string) => void;
}

export function MentionDropdown({
  partnerName,
  partnerUsername,
  onSelectMention,
}: MentionDropdownProps) {
  const options = [
    {
      id: 'simbi_ai',
      label: '@SimbiAI',
      description: 'Tanyakan sesuatu ke AI Companion Simbi',
      icon: Sparkles,
      color: 'bg-sky-600 text-white',
    },
    {
      id: 'partner',
      label: `@${partnerUsername || partnerName.toLowerCase().replace(/\s+/g, '')}`,
      description: `Mention partner ${partnerName}`,
      icon: User,
      color: 'bg-[#FF6B30] text-white',
    },
  ];

  return (
    <div className="absolute bottom-full mb-2 left-0 w-72 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg z-50 animate-fadeIn">
      <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1 tracking-wider border-b border-slate-100">
        Pilih Mention:
      </div>
      <div className="space-y-1 pt-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectMention(opt.label)}
              className="w-full p-2 rounded-xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center gap-2.5 group"
            >
              <div className={`w-8 h-8 rounded-xl ${opt.color} flex items-center justify-center font-bold flex-shrink-0 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF6B30] transition truncate">
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
