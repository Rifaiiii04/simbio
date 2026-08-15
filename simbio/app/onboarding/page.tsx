'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { SearchableSkillSelect } from '@/components/ui/SearchableSkillSelect';
import { ArrowRight, ArrowLeft, Rocket, Sparkles } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: { name: string };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [skills, setSkills] = useState<Skill[]>([]);

  const [teachSkillId, setTeachSkillId] = useState('');
  const [customTeachSkillName, setCustomTeachSkillName] = useState('');
  const [teachLevel, setTeachLevel] = useState('INTERMEDIATE');

  const [learnSkillId, setLearnSkillId] = useState('');
  const [customLearnSkillName, setCustomLearnSkillName] = useState('');
  const [learnLevel, setLearnLevel] = useState('BEGINNER');

  const [goalTitle, setGoalTitle] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');

  const [generating, setGenerating] = useState(false);
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

  const handleCompleteOnboarding = async () => {
    setGenerating(true);
    setError(null);

    try {
      let finalTeachSkillId = teachSkillId;
      let finalLearnSkillId = learnSkillId;

      // Handle Custom "Other" Skill Creation if selected
      if (teachSkillId === 'OTHER' && customTeachSkillName.trim()) {
        try {
          const catRes = await apiFetch<{ categories: Array<{ id: string }> }>('/skills/categories');
          const catId = catRes.categories[0]?.id;
          if (catId) {
            const slug = customTeachSkillName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            const created = await apiFetch<{ skill: Skill }>('/skills', {
              method: 'POST',
              body: JSON.stringify({
                categoryId: catId,
                name: customTeachSkillName.trim(),
                slug: `${slug}-${Date.now().toString().slice(-4)}`,
              }),
            });
            finalTeachSkillId = created.skill.id;
          }
        } catch {
          // fallback
        }
      }

      if (learnSkillId === 'OTHER' && customLearnSkillName.trim()) {
        try {
          const catRes = await apiFetch<{ categories: Array<{ id: string }> }>('/skills/categories');
          const catId = catRes.categories[0]?.id;
          if (catId) {
            const slug = customLearnSkillName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            const created = await apiFetch<{ skill: Skill }>('/skills', {
              method: 'POST',
              body: JSON.stringify({
                categoryId: catId,
                name: customLearnSkillName.trim(),
                slug: `${slug}-${Date.now().toString().slice(-4)}`,
              }),
            });
            finalLearnSkillId = created.skill.id;
          }
        } catch {
          // fallback
        }
      }

      // 1. Add teach skill if selected
      if (finalTeachSkillId && finalTeachSkillId !== 'OTHER') {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId: finalTeachSkillId, type: 'TEACH', level: teachLevel }),
          });
        } catch {
          // Gracefully handle duplicate skill registration
        }
      }

      // 2. Add learn skill if selected
      if (finalLearnSkillId && finalLearnSkillId !== 'OTHER') {
        try {
          await apiFetch('/skills/me/skills', {
            method: 'POST',
            body: JSON.stringify({ skillId: finalLearnSkillId, type: 'LEARN', level: learnLevel }),
          });
        } catch {
          // Gracefully handle duplicate skill registration
        }
      }

      // 3. Create Learning Goal & Trigger AI Roadmap Generation Draft
      if (finalLearnSkillId && finalLearnSkillId !== 'OTHER' && goalTitle) {
        const goalRes = await apiFetch<{ goal: { id: string } }>('/goals', {
          method: 'POST',
          body: JSON.stringify({
            skillId: finalLearnSkillId,
            title: goalTitle,
            targetOutcome,
          }),
        });

        // 4. Trigger AI Roadmap Generation Draft
        await apiFetch('/ai/roadmaps/generate', {
          method: 'POST',
          body: JSON.stringify({ goalId: goalRes.goal.id }),
        });
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Onboarding failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col justify-center my-6">
        <div className="neo-box p-6 sm:p-10 space-y-6 shadow-[8px_8px_0px_0px_#0F172A]">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-black text-gray-500">
            <span>STEP {step} OF 4</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-2 rounded-full border-2 border-[#0F172A] transition-all ${
                    s <= step ? 'bg-[#FF7A30]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-red-700 bg-red-100 rounded-xl border-2 border-[#0F172A] font-black">
              {error}
            </div>
          )}

          {/* Step 1: What can you teach? */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0F172A]">What can you teach?</h2>
                <p className="text-xs text-gray-700 font-bold">Search or type a skill you know well and feel confident sharing.</p>
              </div>

              <SimbiAvatar state="happy" message="Skill exchange is reciprocal! What's a skill you can help someone learn?" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Select Skill to Teach</label>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId={teachSkillId}
                    customSkillName={customTeachSkillName}
                    onSelectSkill={(id, customName) => {
                      setTeachSkillId(id);
                      if (customName !== undefined) setCustomTeachSkillName(customName);
                    }}
                    placeholder="Type to search skill to teach (or choose Other)..."
                  />
                </div>

                {teachSkillId && (
                  <div>
                    <label className="block text-xs font-black text-[#0F172A] mb-1">Your Proficiency Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setTeachLevel(lvl)}
                          className={`p-3 rounded-xl text-xs font-black border-2 border-[#0F172A] text-center transition ${
                            teachLevel === lvl
                              ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]'
                              : 'bg-white text-[#0F172A] hover:bg-[#FACC15]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full neo-button py-3.5 text-xs flex items-center justify-center gap-2"
              >
                <span>Next: What do you want to learn?</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: What do you want to learn? */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0F172A]">What do you want to learn?</h2>
                <p className="text-xs text-gray-700 font-bold">Pick or type a primary skill you wish to master.</p>
              </div>

              <SimbiAvatar state="thinking" message="Awesome! Now select or type the skill you'd love to learn." />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Select Skill to Learn</label>
                  <SearchableSkillSelect
                    skills={skills}
                    selectedSkillId={learnSkillId}
                    customSkillName={customLearnSkillName}
                    onSelectSkill={(id, customName) => {
                      setLearnSkillId(id);
                      if (customName !== undefined) setCustomLearnSkillName(customName);
                    }}
                    placeholder="Type to search skill to learn (or choose Other)..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] font-black text-xs hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_#0F172A] flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!learnSkillId}
                  onClick={() => setStep(3)}
                  className={`w-2/3 py-3.5 rounded-xl border-2 border-[#0F172A] font-black text-xs flex items-center justify-center gap-2 transition ${
                    !learnSkillId
                      ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                      : 'neo-button text-white'
                  }`}
                >
                  <span>Next: Define Learning Goal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Define Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0F172A]">Define Your Learning Goal</h2>
                <p className="text-xs text-gray-700 font-bold">What specific outcome do you want to achieve?</p>
              </div>

              <SimbiAvatar state="working" message="Having a clear goal helps AI craft your personalized learning roadmap!" />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Master React fundamentals and build a portfolio project"
                    className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0F172A] mb-1">Target Outcome (Optional)</label>
                  <textarea
                    value={targetOutcome}
                    onChange={(e) => setTargetOutcome(e.target.value)}
                    rows={3}
                    placeholder="e.g., Be ready to apply for junior frontend developer roles or build my own SaaS"
                    className="w-full px-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] font-black text-xs hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_#0F172A] flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!goalTitle}
                  onClick={() => setStep(4)}
                  className={`w-2/3 py-3.5 rounded-xl border-2 border-[#0F172A] font-black text-xs flex items-center justify-center gap-2 transition ${
                    !goalTitle
                      ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                      : 'neo-button text-white'
                  }`}
                >
                  <span>Generate AI Roadmap Draft</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary & AI Generation */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0F172A]">Ready to Launch!</h2>
                <p className="text-xs text-gray-700 font-bold">Simbi will now generate your personalized AI learning roadmap draft.</p>
              </div>

              <SimbiAvatar state="cheering" message="Click finish below and I'll build your step-by-step milestone roadmap draft!" />

              <div className="p-4 rounded-xl bg-[#FFF5EF] border-2 border-[#0F172A] text-left space-y-2 text-xs font-bold shadow-[3px_3px_0px_0px_#0F172A]">
                <div><span className="text-gray-500 uppercase text-[10px]">Learning Goal:</span> <span className="text-[#0F172A] font-black">{goalTitle}</span></div>
                {teachSkillId && (
                  <div>
                    <span className="text-gray-500 uppercase text-[10px]">Can Teach:</span>{' '}
                    <span className="text-[#FF7A30] font-black">
                      {teachSkillId === 'OTHER' ? customTeachSkillName : skills.find((s) => s.id === teachSkillId)?.name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 uppercase text-[10px]">Learning:</span>{' '}
                  <span className="text-[#FF7A30] font-black">
                    {learnSkillId === 'OTHER' ? customLearnSkillName : skills.find((s) => s.id === learnSkillId)?.name}
                  </span>
                </div>
              </div>

              <button
                disabled={generating}
                onClick={handleCompleteOnboarding}
                className="w-full neo-button py-4 text-sm flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Generating AI Roadmap Draft...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Finish & Build AI Roadmap</span>
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
