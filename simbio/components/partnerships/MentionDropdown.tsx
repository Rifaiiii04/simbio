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
      color: 'bg-[#06B6D4] text-white',
    },
    {
      id: 'partner',
      label: `@${partnerUsername || partnerName.toLowerCase().replace(/\s+/g, '')}`,
      description: `Mention partner ${partnerName}`,
      icon: User,
      color: 'bg-[#FF7A30] text-white',
    },
  ];

  return (
    <div className="absolute bottom-full mb-2 left-0 w-72 bg-white border-2 border-[#0F172A] rounded-2xl p-2 shadow-[6px_6px_0px_0px_#0F172A] z-50 animate-fadeIn">
      <div className="text-[10px] font-black uppercase text-gray-400 px-2 py-1 tracking-wider border-b border-gray-100">
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
              className="w-full p-2 rounded-xl text-left hover:bg-[#FFFDF7] border-2 border-transparent hover:border-[#0F172A] transition flex items-center gap-2.5 group"
            >
              <div className={`w-8 h-8 rounded-xl ${opt.color} border-2 border-[#0F172A] flex items-center justify-center font-black flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#0F172A]`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-[#0F172A] group-hover:text-[#FF7A30] transition truncate">
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-500 font-bold truncate">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
