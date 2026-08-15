'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { GlowCard } from '@/components/ui/GlowCard';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Handshake,
  User as UserIcon,
  Globe,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  username?: string | null;
  country?: string | null;
}

interface Goal {
  id: string;
  title: string;
  status: string;
  skill: { name: string };
}

interface Roadmap {
  id: string;
  title: string;
  status: string;
  milestones: Array<{ id: string; title: string; status: string }>;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  // Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userRes = await apiFetch<{ user: UserProfile }>('/users/me');
        setUser(userRes.user);

        const goalsRes = await apiFetch<{ goals: Goal[] }>('/goals');
        setGoals(goalsRes.goals);

        if (goalsRes.goals.length > 0) {
          const roadmapsRes = await apiFetch<{ roadmaps: Roadmap[] }>(`/roadmaps?goalId=${goalsRes.goals[0].id}`);
          setRoadmaps(roadmapsRes.roadmaps);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF7A30] font-black text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading user dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const activeRoadmap = roadmaps[0];
  const completedMilestones = activeRoadmap?.milestones.filter((m) => m.status === 'COMPLETED').length || 0;
  const totalMilestones = activeRoadmap?.milestones.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Unified Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-box bg-[#FFFDF7] p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#0F172A]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0F172A] pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Welcome back, <span className="bg-[#FF7A30] text-white px-2.5 py-0.5 rounded-xl border-2 border-[#0F172A]">{user?.name}</span>!
              </h1>
              <p className="text-xs text-gray-700 font-bold mt-1">Your personal growth progress and focus command center.</p>
            </div>
            <div className="flex gap-2.5">
              <Link
                href="/discovery"
                className="neo-button text-xs px-4 py-2.5 flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Find Partner</span>
              </Link>
              <Link
                href="/onboarding"
                className="neo-button-yellow text-xs px-4 py-2.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#0F172A]" />
                <span>New Goal</span>
              </Link>
            </div>
          </div>

          {/* Integrated Simbi Mascot Speech Bubble */}
          <SimbiAvatar
            state={timerActive ? 'working' : 'happy'}
            message={
              timerActive
                ? `Stay focused! You're in an active 25-minute Pomodoro focus session.`
                : activeRoadmap
                ? `You've completed ${completedMilestones} of ${totalMilestones} milestones in "${activeRoadmap.title}". Keep up the momentum!`
                : `Welcome! Start by setting a learning goal or exploring skills.`
            }
          />
        </motion.div>

        {/* Compact & High-Contrast Profile Reminder Alert */}
        {(!user?.bio || !user?.country) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-[#0F172A] text-white border-3 border-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#FF7A30]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF7A30] text-white flex items-center justify-center font-black flex-shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Action Needed: Complete Your Profile (60%)</p>
                <p className="text-[11px] text-gray-300 font-bold">Add your country location & bio to boost your global skill match score!</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="neo-button-yellow text-xs px-4 py-2 self-start sm:self-auto flex items-center gap-1.5 text-[#0F172A] whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F172A]" />
            </Link>
          </motion.div>
        )}

        {/* Dashboard Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Active Roadmap & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {activeRoadmap ? (
              <GlowCard>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-3">
                    <div>
                      <span className="neo-badge bg-[#FACC15] text-[#0F172A] px-3 py-1 text-[10px] uppercase font-black">
                        Active Roadmap ({activeRoadmap.status})
                      </span>
                      <h2 className="text-xl font-black text-[#0F172A] mt-2">{activeRoadmap.title}</h2>
                    </div>
                    <Link
                      href={`/roadmaps/${activeRoadmap.id}`}
                      className="text-xs font-black text-[#FF7A30] hover:underline flex items-center gap-1 bg-[#FFF5EF] px-3 py-1.5 rounded-xl border-2 border-[#0F172A]"
                    >
                      <span>Roadmap View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Deterministic Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-[#0F172A]">
                      <span>Deterministic Progress Score</span>
                      <span className="text-[#FF7A30]">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-4 bg-white rounded-xl border-2 border-[#0F172A] overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_#0F172A]">
                      <div
                        className="h-full bg-[#FF7A30] rounded-lg transition-all duration-500 border border-[#0F172A]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500">
                      <BookOpen className="w-4 h-4 text-[#FF7A30]" />
                      <span>Milestone Progress Checklist</span>
                    </div>
                    <div className="grid gap-2.5">
                      {activeRoadmap.milestones.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border-2 border-[#0F172A] bg-white text-xs shadow-[2px_2px_0px_0px_#0F172A]"
                        >
                          <span className={`font-black ${m.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-[#0F172A]'}`}>
                            {m.title}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border-2 border-[#0F172A] ${
                            m.status === 'COMPLETED' ? 'bg-[#84CC16] text-[#0F172A]' : 'bg-[#FACC15] text-[#0F172A]'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlowCard>
            ) : (
              <div className="neo-box p-8 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
                <p className="text-sm font-black text-gray-700">No active learning roadmap created yet.</p>
                <Link
                  href="/onboarding"
                  className="neo-button text-xs px-6 py-3 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Learning Roadmap</span>
                </Link>
              </div>
            )}

            {/* Learning Goals List */}
            <div className="neo-box p-6 sm:p-8 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-3">
                <h3 className="text-base font-black text-[#0F172A]">Your Learning Goals</h3>
                <span className="neo-badge bg-[#FACC15] text-[#0F172A] text-[10px] px-2.5 py-0.5">
                  {goals.length} Goals Active
                </span>
              </div>
              {goals.length === 0 ? (
                <p className="text-xs text-gray-500 font-bold">No goals set yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {goals.map((g) => (
                    <div key={g.id} className="p-4 rounded-xl bg-white border-2 border-[#0F172A] space-y-2 shadow-[3px_3px_0px_0px_#0F172A]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#FF7A30] uppercase tracking-wider">{g.skill.name}</span>
                        <span className="neo-badge bg-[#84CC16] text-[#0F172A] text-[9px] px-2 py-0.5">
                          {g.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#0F172A] line-clamp-2">{g.title}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col): Focus Pomodoro Timer & Quick Nav */}
          <div className="space-y-6">
            {/* Pomodoro Focus Timer Widget */}
            <div className="neo-box bg-[#FACC15] p-6 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A] uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#0F172A]" />
                  <span>Pomodoro Timer</span>
                </div>
                <span className="neo-badge bg-white text-[#0F172A] text-[10px] px-2 py-0.5">25 min</span>
              </div>

              <div className="text-4xl font-mono font-black text-[#0F172A] py-4 bg-white rounded-xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">
                {formatTimer(timerSeconds)}
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`neo-button text-xs px-5 py-2.5 flex items-center gap-1.5 ${
                    timerActive ? 'bg-[#0F172A] text-white' : ''
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerActive ? 'Pause' : 'Start Focus'}</span>
                </button>
                <button
                  onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] font-black text-xs hover:bg-gray-100 transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="neo-box p-6 space-y-3 shadow-[6px_6px_0px_0px_#0F172A]">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b-2 border-[#0F172A] pb-2">Quick Navigation</h3>
              <div className="grid gap-2">
                <Link href="/discovery" className="p-3.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black text-[#0F172A] hover:bg-[#FACC15] transition flex justify-between items-center shadow-[2px_2px_0px_0px_#0F172A]">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#FF7A30]" />
                    <span>Skill Discovery & Matching</span>
                  </div>
                  <span>→</span>
                </Link>
                <Link href="/partnerships" className="p-3.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black text-[#0F172A] hover:bg-[#FACC15] transition flex justify-between items-center shadow-[2px_2px_0px_0px_#0F172A]">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-indigo-600" />
                    <span>Partnerships & Projects</span>
                  </div>
                  <span>→</span>
                </Link>
                <Link href="/profile" className="p-3.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black text-[#0F172A] hover:bg-[#FACC15] transition flex justify-between items-center shadow-[2px_2px_0px_0px_#0F172A]">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>Profile & Skills Portfolio</span>
                  </div>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
