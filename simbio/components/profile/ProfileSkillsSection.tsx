'use client';

import { Award, BookOpen, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

interface UserSkill {
  id: string;
  type: 'TEACH' | 'LEARN';
  level: string;
  skill: { id: string; name: string; category?: { name: string } };
}

interface ProfileSkillsSectionProps {
  userSkills: UserSkill[];
  onOpenAddSkill: (type: 'TEACH' | 'LEARN') => void;
  onRemoveSkill: (userSkillId: string) => void;
  deletingSkillId: string | null;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  INTERMEDIATE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ADVANCED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  EXPERT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export function ProfileSkillsSection({
  userSkills,
  onOpenAddSkill,
  onRemoveSkill,
  deletingSkillId,
}: ProfileSkillsSectionProps) {
  const teachSkills = userSkills.filter((s) => s.type === 'TEACH');
  const learnSkills = userSkills.filter((s) => s.type === 'LEARN');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. TEACH SKILLS CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Skill yang Bisa Diajarkan</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Keahlian yang Anda tawarkan untuk pertukaran ilmu.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {teachSkills.length} Skill
            </span>
          </div>

          {/* List of Teach Skills */}
          {teachSkills.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">Belum Ada Skill Mengajar</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Tambahkan minimal 1 skill yang Anda kuasai agar profil Anda dapat dicocokkan dengan reciprocal partner.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {teachSkills.map((item) => {
                const badge = LEVEL_COLORS[item.level] || LEVEL_COLORS.INTERMEDIATE;
                const isDeleting = deletingSkillId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{item.skill.name}</h4>
                        {item.skill.category && (
                          <span className="text-[10px] text-slate-400 font-bold block truncate">
                            {item.skill.category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {item.level}
                      </span>
                      <button
                        onClick={() => onRemoveSkill(item.id)}
                        disabled={isDeleting}
                        className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition disabled:opacity-50"
                        title="Hapus skill ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => onOpenAddSkill('TEACH')}
          className="w-full py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Skill Mengajar</span>
        </button>
      </div>

      {/* 2. LEARN SKILLS CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B30] flex items-center justify-center border border-orange-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Skill yang Ingin Dipelajari</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Keahlian yang ingin Anda pelajari dari partner reciprocal.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-[#FF6B30] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              {learnSkills.length} Skill
            </span>
          </div>

          {/* List of Learn Skills */}
          {learnSkills.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">Belum Ada Skill Belajar</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Tambahkan target skill yang ingin Anda kuasai untuk memudahkan sistem menemukan partner yang tepat.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {learnSkills.map((item) => {
                const badge = LEVEL_COLORS[item.level] || LEVEL_COLORS.INTERMEDIATE;
                const isDeleting = deletingSkillId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B30] shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{item.skill.name}</h4>
                        {item.skill.category && (
                          <span className="text-[10px] text-slate-400 font-bold block truncate">
                            {item.skill.category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {item.level}
                      </span>
                      <button
                        onClick={() => onRemoveSkill(item.id)}
                        disabled={isDeleting}
                        className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition disabled:opacity-50"
                        title="Hapus skill ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => onOpenAddSkill('LEARN')}
          className="w-full py-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B30] hover:bg-orange-100 text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Skill Belajar</span>
        </button>
      </div>
    </div>
  );
}
