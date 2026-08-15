'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  order: number;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
}

interface RoadmapDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  milestones: Milestone[];
}

export default function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await apiFetch<{ roadmap: RoadmapDetail }>(`/roadmaps/${resolvedParams.id}`);
        setRoadmap(res.roadmap);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [resolvedParams.id, router]);

  const handleToggleMilestone = async (m: Milestone) => {
    if (!roadmap) return;
    const action = m.status === 'COMPLETED' ? 'uncomplete' : 'complete';

    try {
      await apiFetch(`/milestones/${m.id}/${action}`, { method: 'POST' });

      // Refresh roadmap
      const res = await apiFetch<{ roadmap: RoadmapDetail }>(`/roadmaps/${roadmap.id}`);
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmap || !newTitle.trim()) return;

    try {
      await apiFetch('/milestones', {
        method: 'POST',
        body: JSON.stringify({
          roadmapId: roadmap.id,
          title: newTitle,
          order: (roadmap.milestones.length || 0) + 1,
        }),
      });

      setNewTitle('');
      const res = await apiFetch<{ roadmap: RoadmapDetail }>(`/roadmaps/${roadmap.id}`);
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFEFE]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF7A30] font-semibold text-xs animate-pulse">Loading roadmap detail...</div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFEFE]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-500">Roadmap not found.</div>
      </div>
    );
  }

  const completed = roadmap.milestones.filter((m) => m.status === 'COMPLETED').length;
  const total = roadmap.milestones.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFEFE]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <Link href="/roadmaps" className="text-xs font-semibold text-gray-500 hover:text-[#FF7A30]">
          ← Back to Roadmaps
        </Link>

        {/* Roadmap Title Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#FFD6B8] shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#FF7A30] bg-[#FFD6B8]/30 px-2.5 py-0.5 rounded-full">
                {roadmap.status}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{roadmap.title}</h1>
              {roadmap.description && <p className="text-xs text-gray-500 mt-1">{roadmap.description}</p>}
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-gray-600 font-semibold">
              <span>Deterministic Progress</span>
              <span>{completed}/{total} Completed ({percent}%)</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full brand-gradient transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        <SimbiAvatar
          state={percent === 100 ? 'cheering' : 'working'}
          message={
            percent === 100
              ? 'Congratulations! You have completed all milestones in this roadmap!'
              : 'Click checkmarks to complete milestones as you learn. You own and can edit this roadmap anytime.'
          }
        />

        {/* Milestones List */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">Milestones Checklist</h2>

          <div className="space-y-3">
            {roadmap.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(m)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  m.status === 'COMPLETED'
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-white border-gray-100 hover:border-[#FF7A30]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                    m.status === 'COMPLETED' ? 'bg-green-500 text-white' : 'border-2 border-gray-300 text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${m.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {m.title}
                    </h3>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-gray-400">Order #{m.order}</span>
              </div>
            ))}
          </div>

          {/* Add Milestone Form */}
          <form onSubmit={handleAddMilestone} className="flex gap-2 pt-4 border-t border-gray-100">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add custom milestone..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FF7A30]"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2.5 rounded-xl brand-gradient text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              + Add Milestone
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
