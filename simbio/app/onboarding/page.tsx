'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { UsernameStep } from '@/components/onboarding/UsernameStep';
import { LocationStep } from '@/components/onboarding/LocationStep';
import { ArrowRight, ArrowLeft, Rocket, X, BookOpen, Award } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category?: { name: string };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userFullName, setUserFullName] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  // Multi-skill selection arrays (Max 5 items each)
  const [teachSkillIds, setTeachSkillIds] = useState<string[]>([]);
  const [teachLevel] = useState('INTERMEDIATE');

  const [learnSkillIds, setLearnSkillIds] = useState<string[]>([]);
  const [learnLevel] = useState('BEGINNER');

  const [goalTitle, setGoalTitle] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customSkillNames, setCustomSkillNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Read local cache for immediate display
    try {
      const storedUser = localStorage.getItem('simbioly_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserFullName(parsed.name || '');
        setCurrentUsername(parsed.username || '');
      }
    } catch {
      // ignore
    }

    // Fetch user profile & skills list
    apiFetch<{ user: { name: string; username?: string | null } }>('/users/me')
      .then((res) => {
        if (res.user.name) setUserFullName(res.user.name);
        if (res.user.username) setCurrentUsername(res.user.username);
      })
      .catch(() => {});

    apiFetch<{ skills: Skill[] }>('/skills')
      .then((res) => setSkills(res.skills))
      .catch((err) => setError(err.message));
  }, [router]);

  // Synchronize any newly created skill IDs against the DB catalog
  useEffect(() => {
    const missing = [...teachSkillIds, ...learnSkillIds].some(
      (id) => id && id !== 'OTHER' && !skills.some((s) => s.id === id)
    );
    if (missing) {
      apiFetch<{ skills: Skill[] }>('/skills')
        .then((res) => setSkills(res.skills))
        .catch(() => {});
    }
  }, [teachSkillIds, learnSkillIds, skills]);

  const getSkillDisplayName = (id: string) => {
    const found = skills.find((s) => s.id === id);
    if (found) return found.name;
    if (customSkillNames[id]) return customSkillNames[id];
    return id;
  };

  const handleAddTeachSkill = (skillId: string, _customName?: string, skillObj?: Skill) => {
    if (!skillId || skillId === 'OTHER') return;
    if (skillObj) {
      setSkills((prev) => (prev.some((s) => s.id === skillObj.id) ? prev : [...prev, skillObj]));
      setCustomSkillNames((prev) => ({ ...prev, [skillObj.id]: skillObj.name }));
    } else if (_customName && _customName !== 'OTHER') {
      setCustomSkillNames((prev) => ({ ...prev, [skillId]: _customName }));
    }
    if (teachSkillIds.includes(skillId)) return;
    if (teachSkillIds.length >= 5) {
      setError('Maximum 5 teaching skills allowed.');
      return;
    }
    setError(null);
    setTeachSkillIds((prev) => [...prev, skillId]);
  };

  const handleRemoveTeachSkill = (skillId: string) => {
    setTeachSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleAddLearnSkill = (skillId: string, _customName?: string, skillObj?: Skill) => {
    if (!skillId || skillId === 'OTHER') return;
    if (skillObj) {
      setSkills((prev) => (prev.some((s) => s.id === skillObj.id) ? prev : [...prev, skillObj]));
      setCustomSkillNames((prev) => ({ ...prev, [skillObj.id]: skillObj.name }));
    } else if (_customName && _customName !== 'OTHER') {
      setCustomSkillNames((prev) => ({ ...prev, [skillId]: _customName }));
    }
    if (learnSkillIds.includes(skillId)) return;
    if (learnSkillIds.length >= 5) {
      setError('Maximum 5 target learning skills allowed.');
      return;
    }
    setError(null);
    setLearnSkillIds((prev) => [...prev, skillId]);
  };

  const handleRemoveLearnSkill = (skillId: string) => {
    setLearnSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // 1. Save all Teach Skills (Max 5)
      for (const skillId of teachSkillIds) {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId, type: 'TEACH', level: teachLevel }),
          });
        } catch {
          // Gracefully skip duplicates
        }
      }

      // 2. Save all Learn Skills (Max 5)
      for (const skillId of learnSkillIds) {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId, type: 'LEARN', level: learnLevel }),
          });
        } catch {
          // Gracefully skip duplicates
        }
      }

      // 3. Create Learning Goal
      if (learnSkillIds.length > 0 && goalTitle) {
        await apiFetch<{ goal: { id: string } }>('/goals', {
          method: 'POST',
          body: JSON.stringify({
            skillId: learnSkillIds[0],
            title: goalTitle,
            targetOutcome,
          }),
        });
      }

      router.push('/explore');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration process failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      {/* Top Focused Header */}
      <header className="w-full max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="font-black text-2xl tracking-tight text-slate-950 group-hover:text-[#FF6B30] transition">
            simbioly<span className="text-[#FF6B30]">.</span>
          </span>
        </Link>
        <span className="text-xs font-bold text-slate-500">Welcome Onboarding</span>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 flex flex-col justify-center my-4">
        <div className="soft-card p-6 sm:p-10 space-y-6 bg-white border border-slate-200/80 shadow-xs rounded-3xl">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>STEP {step} OF 5</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-6 h-2 rounded-full transition-all ${
                    s <= step ? 'bg-[#FF6B30]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-bold">
              {error}
            </div>
          )}

          {/* STEP 1: Unique Username Selection */}
          {step === 1 && (
            <UsernameStep
              initialUsername={currentUsername}
              userFullName={userFullName || 'Learner'}
              onSuccess={(saved) => {
                setCurrentUsername(saved);
                setStep(2);
              }}
            />
          )}

          {/* STEP 2: Skills You Can Teach (Max 5) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                  Step 2: Reciprocal Teach Skills
                </span>
                <h2 className="text-2xl font-black text-slate-900">What Skills Can You Teach?</h2>
                <p className="text-xs text-slate-500 font-medium">Select up to 5 skills you are comfortable sharing or mentoring others in.</p>
              </div>

              <SimbiAvatar state="happy" message="Select skills you have mastered! You can add up to 5 teaching skills." />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">Select Teaching Skill</label>
                    <span className="text-[11px] font-bold text-[#FF6B30]">{teachSkillIds.length}/5 Skills Selected</span>
                  </div>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId=""
                    onSelectSkill={(id, customName, skillObj) => handleAddTeachSkill(id, customName, skillObj)}
                    placeholder="Search or pick skill to teach..."
                  />
                </div>

                {/* Selected Teach Skill Badges List */}
                {teachSkillIds.length > 0 && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Selected Teaching Skills ({teachSkillIds.length}/5):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {teachSkillIds.map((id) => (
                        <span
                          key={id}
                          className="soft-badge bg-white text-emerald-900 border-emerald-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{getSkillDisplayName(id)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeachSkill(id)}
                            className="text-emerald-500 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Back</span>
                </button>
                <button
                  disabled={teachSkillIds.length === 0}
                  onClick={() => setStep(3)}
                  className={`w-2/3 soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer ${
                    teachSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Next: Skills You Want to Learn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skills You Want to Learn (Max 5) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                  Step 3: Reciprocal Learn Skills
                </span>
                <h2 className="text-2xl font-black text-slate-900">What Skills Do You Want to Learn?</h2>
                <p className="text-xs text-slate-500 font-medium">Pick up to 5 priority skills you want to learn from reciprocal partners.</p>
              </div>

              <SimbiAvatar state="thinking" message="Awesome! Now select up to 5 skills you want to learn." />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">Select Learning Skill</label>
                    <span className="text-[11px] font-bold text-[#FF6B30]">{learnSkillIds.length}/5 Skills Selected</span>
                  </div>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId=""
                    onSelectSkill={(id, customName, skillObj) => handleAddLearnSkill(id, customName, skillObj)}
                    placeholder="Search or pick skill to learn..."
                  />
                </div>

                {/* Selected Learn Skill Badges List */}
                {learnSkillIds.length > 0 && (
                  <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#FF6B30] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#FF6B30]" />
                      <span>Selected Learning Targets ({learnSkillIds.length}/5):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {learnSkillIds.map((id) => (
                        <span
                          key={id}
                          className="soft-badge bg-white text-orange-900 border-orange-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{getSkillDisplayName(id)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLearnSkill(id)}
                            className="text-orange-500 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Back</span>
                </button>
                <button
                  disabled={learnSkillIds.length === 0}
                  onClick={() => setStep(4)}
                  className={`w-2/3 soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer ${
                    learnSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Next: Enable Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Location Consent */}
          {step === 4 && (
            <LocationStep
              locationEnabled={locationEnabled}
              onLocationChange={(val) => setLocationEnabled(val)}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          )}

          {/* STEP 5: Define Goal & Finish */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                  Step 5: Define Target Goal
                </span>
                <h2 className="text-2xl font-black text-slate-900">Define Your Learning Goal</h2>
                <p className="text-xs text-slate-500 font-medium">What specific milestone or outcome do you want to achieve?</p>
              </div>

              <SimbiAvatar state="working" message="A clear goal helps potential partners understand how best to collaborate with you!" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Master React fundamentals and build 3 fullstack portfolio projects"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Outcome (Optional)</label>
                  <textarea
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    rows={3}
                    placeholder="e.g. Ready to apply for junior frontend roles or launch an independent SaaS product"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-[#FF6B30] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Back</span>
                </button>
                <button
                  disabled={submitting}
                  onClick={handleCompleteOnboarding}
                  className="w-2/3 soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer disabled:opacity-60"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{submitting ? 'Setting up Profile...' : 'Complete & Enter Simbioly'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full max-w-2xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
        <p>Mutual Skill Exchange & Learning</p>
        <p className="font-medium">© Simbioly 2026</p>
      </footer>
    </div>
  );
}
