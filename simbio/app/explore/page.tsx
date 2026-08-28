'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SkillSwapDeck, type Candidate } from '@/components/explore/SkillSwapDeck';
import { SimbiConsultPanel } from '@/components/explore/SimbiConsultPanel';
import { CandidateStatsPanel } from '@/components/explore/CandidateStatsPanel';
import { Sparkles, Bot, X, BarChart3 } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'advisor' | 'stats'>('advisor');

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
      <div className="h-[100dvh] flex flex-col bg-[#0A0A0A]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Discovering matches...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0A0A0A] text-white overflow-hidden relative">
      <Navbar />

      {/* Main Content: includes bottom padding on mobile to stay above fixed mobile bottom navbar */}
      <main className="flex-1 flex overflow-hidden w-full max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-[74px] md:py-3.5 gap-4 sm:gap-5 min-h-0">

        {/* LEFT: Card Deck */}
        <div className="flex flex-col w-full lg:w-[44%] xl:w-[40%] shrink-0 min-h-0 h-full relative z-10">
          <SkillSwapDeck
            onActiveCandidateChange={handleActiveCandidateChange}
            onToggleMobileSidebar={() => setShowMobileSidebar((prev) => !prev)}
            isMobileSidebarOpen={showMobileSidebar}
          />
        </div>

        {/* RIGHT: Desktop Panels */}
        <div className="hidden lg:flex flex-col gap-4 flex-1 min-h-0 min-w-0">

          {/* Partner Analysis */}
          <div className="bg-[#121214] rounded-3xl border border-neutral-800/80 p-4 sm:p-5 overflow-hidden shrink-0 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#FF6B30]/15 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#FF6B30]" />
              </div>
              <h3 className="font-bold text-white text-sm">Partner Analysis</h3>
            </div>
            {activeCandidate ? (
              <CandidateStatsPanel
                reputation={activeCandidate.reputation}
                candidateName={activeCandidate.user.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-28 text-center">
                <Sparkles className="w-5 h-5 text-neutral-600 mb-2" />
                <p className="text-xs font-medium text-neutral-500">Select a candidate to view stats</p>
              </div>
            )}
          </div>

          {/* Simbi AI Consult */}
          <div className="flex-1 bg-[#121214] rounded-3xl border border-neutral-800/80 p-4 sm:p-5 min-h-0 overflow-hidden flex flex-col shadow-xl">
            <SimbiConsultPanel candidate={activeCandidate} />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sheet Drawer (Optimized Single-Scroll with Tab Control) */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 h-[88dvh] bg-[#0E0E10] z-[70] shadow-2xl flex flex-col overflow-hidden rounded-t-[2rem] border-t border-neutral-800 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto my-2.5 shrink-0" />

              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between px-5 pb-2.5 border-b border-neutral-800/80 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B30]/15 text-[#FF6B30] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {activeCandidate ? activeCandidate.user.name : 'Candidate Assistant'}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                      {activeCandidate ? `Skill Partner Consultation` : 'Select a partner on card'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Switcher: Eliminates nested scrolling conflicts */}
              <div className="px-5 py-2 shrink-0 border-b border-neutral-800/50 bg-[#0A0A0A]">
                <div className="flex items-center bg-[#18181B] p-1 rounded-xl border border-neutral-800 gap-1">
                  <button
                    onClick={() => setMobileDrawerTab('advisor')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobileDrawerTab === 'advisor'
                        ? 'bg-[#FF6B30] text-white shadow-md shadow-[#FF6B30]/25'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Advisor</span>
                  </button>
                  <button
                    onClick={() => setMobileDrawerTab('stats')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobileDrawerTab === 'stats'
                        ? 'bg-[#FF6B30] text-white shadow-md shadow-[#FF6B30]/25'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Partner Stats</span>
                  </button>
                </div>
              </div>

              {/* Tab Content: Dedicated full-height single scroll area */}
              {mobileDrawerTab === 'advisor' ? (
                <div className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
                  <SimbiConsultPanel candidate={activeCandidate} />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  <div className="bg-[#121214] rounded-2xl border border-neutral-800 p-4 shadow-md">
                    {activeCandidate ? (
                      <CandidateStatsPanel
                        reputation={activeCandidate.reputation}
                        candidateName={activeCandidate.user.name}
                      />
                    ) : (
                      <div className="text-center py-6">
                        <Sparkles className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-neutral-500">Select a candidate on swap card to view reputation stats</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
