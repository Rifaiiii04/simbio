'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';

interface Goal {
  id: string;
  title: string;
  skill: { name: string };
}

interface Roadmap {
  id: string;
  goalId: string;
  title: string;
  description: string;
  status: string;
  milestones: Array<{ id: string; title: string; status: string }>;
}

export default function RoadmapsListPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const goalsRes = await apiFetch<{ goals: Goal[] }>('/goals');
        setGoals(goalsRes.goals);

        if (goalsRes.goals.length > 0) {
          const firstGoalId = goalsRes.goals[0].id;
          setSelectedGoalId(firstGoalId);
          const roadmapsRes = await apiFetch<{ roadmaps: Roadmap[] }>(`/roadmaps?goalId=${firstGoalId}`);
          setRoadmaps(roadmapsRes.roadmaps);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSelectGoal = async (goalId: string) => {
    setSelectedGoalId(goalId);
    try {
      const roadmapsRes = await apiFetch<{ roadmaps: Roadmap[] }>(`/roadmaps?goalId=${goalId}`);
      setRoadmaps(roadmapsRes.roadmaps);
    } catch {
      setRoadmaps([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEFE]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Roadmaps</h1>
            <p className="text-xs text-gray-500 mt-1">Review, edit, and track your step-by-step milestone progress.</p>
          </div>
          <Link
            href="/onboarding"
            className="px-4 py-2.5 rounded-xl brand-gradient text-white text-xs font-semibold shadow-sm w-fit"
          >
            + Create New Roadmap
          </Link>
        </div>

        <SimbiAvatar
          state="happy"
          message="Your roadmaps are your personal learning guides! You can add, edit, or mark milestones completed at any time."
        />

        {/* Goal Selector Tabs */}
        {goals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {goals.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGoal(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                  selectedGoalId === g.id
                    ? 'brand-gradient text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {g.title} ({g.skill.name})
              </button>
            ))}
          </div>
        )}

        {/* Roadmaps Cards */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading roadmaps...</div>
        ) : roadmaps.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
            <p className="text-sm text-gray-500">No roadmaps generated for this goal yet.</p>
            <Link href="/onboarding" className="inline-block text-xs font-bold text-[#FF7A30] hover:underline">
              Generate AI Roadmap Draft →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {roadmaps.map((r) => {
              const completed = r.milestones.filter((m) => m.status === 'COMPLETED').length;
              const total = r.milestones.length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#FF7A30] bg-[#FFD6B8]/30 px-2.5 py-0.5 rounded-full">
                        {r.status}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 mt-1">{r.title}</h2>
                      {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                    </div>

                    <Link
                      href={`/roadmaps/${r.id}`}
                      className="px-4 py-2 rounded-xl bg-[#FFF5EF] border border-[#FFD6B8] text-[#FF7A30] text-xs font-semibold hover:bg-[#FFD6B8]/30 transition text-center"
                    >
                      Manage Milestones →
                    </Link>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Milestones: {completed}/{total}</span>
                      <span>{percent}% Completed</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full brand-gradient transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
