'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { ArrowRight, ArrowLeft, Rocket, X, BookOpen, Award, CheckCircle2, MapPin, Loader2 } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category?: { name: string };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Multi-skill selection arrays (Max 5 items each)
  const [teachSkillIds, setTeachSkillIds] = useState<string[]>([]);
  const [teachLevel] = useState('INTERMEDIATE');

  const [learnSkillIds, setLearnSkillIds] = useState<string[]>([]);
  const [learnLevel] = useState('BEGINNER');

  const [goalTitle, setGoalTitle] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    apiFetch<{ skills: Skill[] }>('/skills')
      .then((res) => setSkills(res.skills))
      .catch((err) => setError(err.message));
  }, [router]);

  const handleAddTeachSkill = (skillId: string) => {
    if (!skillId || skillId === 'OTHER') return;
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

  const handleAddLearnSkill = (skillId: string) => {
    if (!skillId || skillId === 'OTHER') return;
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

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration process failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col justify-center my-6">
        <div className="soft-card p-6 sm:p-10 space-y-6 bg-white border border-slate-200/80 shadow-xs">
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

          {/* STEP 1: Skills You Can Teach (Max 5) */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                  Reciprocal Teach Skills (Max 5)
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
                    onSelectSkill={(id) => handleAddTeachSkill(id)}
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
                      {teachSkillIds.map((id) => {
                        const s = skills.find((item) => item.id === id);
                        return (
                          <span
                            key={id}
                            className="soft-badge bg-white text-emerald-900 border-emerald-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{s?.name || id}</span>
                            <button onClick={() => handleRemoveTeachSkill(id)} className="text-emerald-500 hover:text-red-600 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={teachSkillIds.length === 0}
                onClick={() => setStep(2)}
                className={`w-full soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer ${
                  teachSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>Next: Skills You Want to Learn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Skills You Want to Learn (Max 5) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                  Reciprocal Learn Skills (Max 5)
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
                    onSelectSkill={(id) => handleAddLearnSkill(id)}
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
                      {learnSkillIds.map((id) => {
                        const s = skills.find((item) => item.id === id);
                        return (
                          <span
                            key={id}
                            className="soft-badge bg-white text-orange-900 border-orange-300 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{s?.name || id}</span>
                            <button onClick={() => handleRemoveLearnSkill(id)} className="text-orange-500 hover:text-red-600 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
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
                  disabled={learnSkillIds.length === 0}
                  onClick={() => setStep(3)}
                  className={`w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold cursor-pointer ${
                    learnSkillIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Next: Enable Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Location Consent */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="soft-badge bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                  Nearby Map Feature
                </span>
                <h2 className="text-2xl font-black text-slate-900">Be Discovered on the Map?</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enable location to appear on the discovery map and connect with partners near you. You can turn this off anytime in Settings.
                </p>
              </div>

              <SimbiAvatar state="happy" message="Enable location so nearby learning partners can easily find you on the map!" />

              <div className="space-y-3">
                {/* Location benefit cards */}
                <div className="grid gap-3">
                  {[
                    { title: 'Appear on Discovery Map', desc: 'Partners in your city can view your profile directly on the map.' },
                    { title: 'Local Priority', desc: 'Your profile appears earlier for searches in your local area.' },
                    { title: 'Privacy Protected', desc: 'Coordinates are stored securely with zero continuous tracking.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <MapPin className="w-5 h-5 text-[#FF6B30] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {locationEnabled && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-700">Location enabled! You will now appear on the map.</span>
                  </div>
                )}

                {locationError && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs font-bold text-red-700">{locationError}</p>
                  </div>
                )}

                {!locationEnabled && (
                  <button
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setLocationError('Browser does not support geolocation.');
                        return;
                      }
                      setLocationLoading(true);
                      setLocationError(null);
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          try {
                            await apiFetch('/users/me/location', {
                              method: 'PUT',
                              body: JSON.stringify({
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                                locationEnabled: true,
                              }),
                            });
                            setLocationEnabled(true);
                          } catch {
                            setLocationError('Failed to save location. Please try again.');
                          } finally {
                            setLocationLoading(false);
                          }
                        },
                        (err) => {
                          setLocationLoading(false);
                          setLocationError(
                            err.code === 1
                              ? 'Location permission denied. Please allow GPS access in your browser.'
                              : 'Failed to retrieve location.',
                          );
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                      );
                    }}
                    disabled={locationLoading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-600 transition shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    {locationLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Detecting Location...</span></>
                      : <><MapPin className="w-4 h-4" /><span>Enable Location Now</span></>}
                  </button>
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
                  onClick={() => setStep(4)}
                  className="w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold cursor-pointer"
                >
                  <span>{locationEnabled ? 'Next: Learning Goal' : 'Skip for Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Define Goal */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
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
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!goalTitle}
                  onClick={() => setStep(5)}
                  className={`w-2/3 soft-button py-3 text-xs flex items-center justify-center gap-2 font-bold cursor-pointer ${
                    !goalTitle ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Next: Review & Finish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Summary Confirmation */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Ready to Start Swapping!</h2>
                <p className="text-xs text-slate-500 font-medium">Review your registered skills before entering the discovery hub.</p>
              </div>

              <SimbiAvatar state="cheering" message="Click complete below to jump straight into your reciprocal swap deck!" />

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs font-bold">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Primary Goal:</span>
                  <p className="text-slate-900 text-sm font-black">{goalTitle}</p>
                </div>

                <div>
                  <span className="text-emerald-700 uppercase text-[10px]">Can Teach ({teachSkillIds.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teachSkillIds.map((id) => (
                      <span key={id} className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                        {skills.find((s) => s.id === id)?.name || id}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#FF6B30] uppercase text-[10px]">Want to Learn ({learnSkillIds.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {learnSkillIds.map((id) => (
                      <span key={id} className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-[10px]">
                        {skills.find((s) => s.id === id)?.name || id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={submitting}
                onClick={handleCompleteOnboarding}
                className="w-full soft-button py-4 text-sm flex items-center justify-center gap-2 font-bold shadow-md cursor-pointer"
              >
                {submitting ? (
                  <span>Saving your profile...</span>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 text-white" />
                    <span>Complete & Enter Swap Dashboard</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
