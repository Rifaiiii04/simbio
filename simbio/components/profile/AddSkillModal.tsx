'use client';

import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';

interface Skill {
  id: string;
  name: string;
  category?: { name: string };
}

interface AddSkillModalProps {
  type: 'TEACH' | 'LEARN';
  allSkills: Skill[];
  newSkillId: string;
  customSkillName: string;
  newSkillLevel: string;
  addingSkill: boolean;
  onSelectSkill: (id: string, customName?: string) => void;
  onSelectLevel: (level: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function AddSkillModal({
  type,
  allSkills,
  newSkillId,
  customSkillName,
  newSkillLevel,
  addingSkill,
  onSelectSkill,
  onSelectLevel,
  onClose,
  onSave,
}: AddSkillModalProps) {
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md soft-card p-6 space-y-5 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Tambah Skill untuk {type === 'TEACH' ? 'Diajarkan (Teach)' : 'Dipakai (Learn)'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Pilih Kategori Skill</label>
            <SearchableSkillSelect
              skills={allSkills}
              selectedSkillId={newSkillId}
              customSkillName={customSkillName}
              onSelectSkill={onSelectSkill}
              placeholder="Ketik untuk mencari skill..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Tingkat Kemampuan (Proficiency Level)</label>
            <div className="grid grid-cols-2 gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectLevel(lvl)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                    newSkillLevel === lvl
                      ? 'bg-[#FF6B30] text-white border-[#FF6B30] shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            disabled={addingSkill || !newSkillId}
            onClick={onSave}
            className="w-2/3 soft-button py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <span>{addingSkill ? 'Menyimpan...' : 'Simpan Skill'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
