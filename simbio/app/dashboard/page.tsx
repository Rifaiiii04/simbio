'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SkillSwapDeck, type Candidate } from '@/components/dashboard/SkillSwapDeck';
import { SimbiConsultPanel } from '@/components/dashboard/SimbiConsultPanel';
import { CandidateStatsPanel } from '@/components/dashboard/CandidateStatsPanel';
import { Sparkles } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        await apiFetch<{ user: UserProfile }>('/users/me');
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleActiveCandidateChange = useCallback((candidate: Candidate | null) => {
    setActiveCandidate(candidate);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden">
      <Navbar />

      {/* Desktop Split Layout: 60% Swap Deck | 40% Right Panel (Simbi + Stats) */}
      <main className="flex-1 flex overflow-hidden px-3 sm:px-4 pt-2 pb-20 md:pb-2 gap-3">

        {/* LEFT 60% — Swap Deck */}
        <div className="flex flex-col w-full md:w-[60%] lg:w-[58%] shrink-0 min-h-0">
          <SkillSwapDeck onActiveCandidateChange={handleActiveCandidateChange} />
        </div>

        {/* RIGHT 40% — Simbi Chat (top) + Stats Chart (bottom) — hidden on mobile */}
        <div className="hidden md:flex flex-col gap-3 flex-1 min-h-0 min-w-0">

          {/* Simbi Consult Panel (top ~55%) */}
          <div className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 overflow-hidden" style={{ flex: '55 1 0%' }}>
            <SimbiConsultPanel candidate={activeCandidate} />
          </div>

          {/* Candidate Stats Panel (bottom ~45%) */}
          <div className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 overflow-hidden" style={{ flex: '45 1 0%' }}>
            {activeCandidate ? (
              <CandidateStatsPanel
                reputation={activeCandidate.reputation}
                candidateName={activeCandidate.user.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-500">Pilih kandidat untuk melihat statistik</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
