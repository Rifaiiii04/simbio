'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SkillSwapDeck, type Candidate } from '@/components/dashboard/SkillSwapDeck';
import { SimbiConsultPanel } from '@/components/dashboard/SimbiConsultPanel';
import { CandidateStatsPanel } from '@/components/dashboard/CandidateStatsPanel';
import { Sparkles, Bot, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
            <span>Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      <Navbar />

      {/* Desktop Split Layout: 60% Swap Deck | 40% Right Panel (Simbi + Stats) */}
      <main className="flex-1 flex overflow-hidden px-3 sm:px-4 pt-2 pb-20 md:pb-2 gap-3">

        {/* LEFT 60% — Swap Deck */}
        <div className="flex flex-col w-full md:w-[60%] lg:w-[58%] shrink-0 min-h-0">
          <SkillSwapDeck
            onActiveCandidateChange={handleActiveCandidateChange}
            onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
            isMobileSidebarOpen={showMobileSidebar}
          />
        </div>

        {/* RIGHT 40% — Stats Chart (top) + Simbi Chat (bottom) — hidden on mobile */}
        <div className="hidden md:flex flex-col gap-3 flex-1 min-h-0 min-w-0">

          {/* Candidate Stats Panel (top ~45%) */}
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
                <p className="text-xs font-bold text-slate-500">Select a candidate to view statistics</p>
              </div>
            )}
          </div>

          {/* Simbi Consult Panel (bottom ~55%) */}
          <div className="flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 min-h-0 overflow-hidden" style={{ flex: '55 1 0%' }}>
            <SimbiConsultPanel candidate={activeCandidate} />
          </div>
        </div>
      </main>

      {/* Mobile Slide-in Drawer for Simbi & Stats (75% width, above bottom navbar) */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Backdrop (does not block bottom navbar) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="md:hidden fixed inset-0 bottom-16 sm:bottom-0 bg-black/45 backdrop-blur-xs z-50"
            />

            {/* Slide-over Panel (75% width, stops above bottom navbar) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-0 bottom-16 sm:bottom-0 right-0 w-[78%] max-w-[320px] bg-[#F8FAFC] z-50 shadow-2xl flex flex-col p-3.5 overflow-hidden border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B30] flex items-center justify-center font-black">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 leading-tight">Simbi AI & Stats</h3>
                    <p className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">
                      {activeCandidate ? activeCandidate.user.name : 'No candidate'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 rounded-lg bg-slate-200/80 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-0.5">
                {/* 1. Candidate Stats Panel */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-2.5 shrink-0">
                  {activeCandidate ? (
                    <CandidateStatsPanel
                      reputation={activeCandidate.reputation}
                      candidateName={activeCandidate.user.name}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Sparkles className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="text-[11px] font-bold text-slate-500">Select a candidate to view statistics</p>
                    </div>
                  )}
                </div>

                {/* 2. Simbi Consult Panel */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-2.5 flex-1 min-h-[320px] flex flex-col overflow-hidden">
                  <SimbiConsultPanel candidate={activeCandidate} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
