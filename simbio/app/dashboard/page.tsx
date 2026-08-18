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
  Target,
  Award,
  Zap,
  TrendingUp,
  ChevronRight,
  MapPin,
  Flame,
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
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat dashboard belajar...</span>
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Full-Width Wide Command Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card p-6 sm:p-8 bg-white shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs">
                Reciprocal Growth Workspace
              </span>
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Verified Exchange Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Selamat datang kembali, <span className="text-[#FF6B30]">{user?.name}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Pantau progres reciprocal exchange, kelola milestone AI roadmap, dan jalankan sesi fokus Pomodoro 1-on-1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link
              href="/discovery"
              className="soft-button text-xs sm:text-sm px-6 py-3 flex items-center gap-2 shadow-sm flex-1 sm:flex-initial justify-center"
            >
              <Compass className="w-4 h-4" />
              <span>Cari Partner Belajar</span>
            </Link>
            <Link
              href="/onboarding"
              className="px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-200 transition shadow-2xs flex items-center gap-2 flex-1 sm:flex-initial justify-center"
            >
              <Plus className="w-4 h-4 text-slate-700" />
              <span>Target Skill Baru</span>
            </Link>
          </div>
        </motion.div>

        {/* 3-Column Modern Wide Dashboard Grid Layout (3 Cols | 6 Cols | 3 Cols) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR (3 Cols): Profile Status, Skill Goals & Quick Nav */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Needed Profile Card */}
            {(!user?.bio || !user?.country) && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6B30] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Lengkapi Profil (60%)</p>
                    <p className="text-[11px] text-slate-400 font-medium">Tambah negara & bio</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="w-full py-2.5 rounded-xl bg-[#FF6B30] text-white text-xs font-bold hover:bg-[#E0531A] transition shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Lengkapi Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Target Skill Goals List Card */}
            <div className="soft-card p-5 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF6B30]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Target Skill Kamu</h3>
                </div>
                <span className="soft-badge bg-slate-100 text-slate-700 text-[10px]">
                  {goals.length} Skill
                </span>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Belum ada target skill.</p>
                  <Link href="/onboarding" className="text-xs font-bold text-[#FF6B30] hover:underline inline-block">
                    + Tambah Target Baru
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {goals.map((g) => (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 hover:bg-white transition shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FF6B30] uppercase tracking-wider">{g.skill.name}</span>
                        <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">
                          {g.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{g.title}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation Menu */}
            <div className="soft-card p-5 bg-white space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Navigasi Cepat App
              </h3>
              <div className="space-y-2">
                <Link
                  href="/discovery"
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold text-slate-800 hover:bg-white hover:border-slate-300 transition flex justify-between items-center shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-[#FF6B30]" />
                    <span>Cari Partner Belajar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/partnerships"
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold text-slate-800 hover:bg-white hover:border-slate-300 transition flex justify-between items-center shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Handshake className="w-4 h-4 text-indigo-600" />
                    <span>Room Belajar Bareng</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/profile"
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-bold text-slate-800 hover:bg-white hover:border-slate-300 transition flex justify-between items-center shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>Profil & Portofolio Skill</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* CENTER MAIN PANEL (6 Cols): Active Roadmap & Simbi Companion Advice */}
          <div className="lg:col-span-6 space-y-6">
            {/* Active Learning Roadmap Workspace Card */}
            {activeRoadmap ? (
              <GlowCard className="bg-white">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="soft-badge bg-amber-50 text-amber-800 border-amber-200 text-[10px] uppercase font-bold">
                        Active Roadmap ({activeRoadmap.status})
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1.5">{activeRoadmap.title}</h2>
                    </div>
                    <Link
                      href={`/roadmaps/${activeRoadmap.id}`}
                      className="text-xs font-bold text-[#FF6B30] hover:text-[#E0531A] flex items-center gap-1 bg-orange-50/80 px-3.5 py-2 rounded-xl border border-orange-200/80 transition"
                    >
                      <span>Lihat Detail Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Progres Belajar Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>Progres Belajar Terverifikasi</span>
                      <span className="text-[#FF6B30]">{progressPercent}% Selesai</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B30] to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Daftar Milestone Progress Checklist */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <BookOpen className="w-4 h-4 text-[#FF6B30]" />
                      <span>Daftar Milestone Pembelajaran</span>
                    </div>
                    <div className="grid gap-2.5">
                      {activeRoadmap.milestones.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white text-xs transition shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className={`w-4 h-4 ${m.status === 'COMPLETED' ? 'text-[#10B981]' : 'text-slate-300'}`} />
                            <span className={`font-bold ${m.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {m.title}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                            m.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
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
              <div className="soft-card p-10 text-center space-y-4 bg-white border border-slate-200/80">
                <Target className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">Belum Ada Roadmap Aktif</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Buat target belajar baru dan biarkan Simbi AI merancang rincian milestone secara otomatis!
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="soft-button text-xs px-6 py-3 inline-flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Rancang Roadmap AI Baru</span>
                </Link>
              </div>
            )}

            {/* Simbi Capybara Mascot Assistant Box */}
            <SimbiAvatar
              state={timerActive ? 'working' : 'happy'}
              message={
                timerActive
                  ? `Sesi fokus 25 menit aktif! Hapus semua gangguan dan fokus belajar bersama partner 🎯`
                  : activeRoadmap
                  ? `Kamu sudah menyelesaikan ${completedMilestones} dari ${totalMilestones} milestone di "${activeRoadmap.title}". Teruskan konsistensinya! 🚀`
                  : `Mulai perjalanan belajar kamu hari ini dengan membuat target skill baru atau mencari partner exchange!`
              }
            />
          </div>

          {/* RIGHT SIDEBAR (3 Cols): Pomodoro Timer & Growth Stats */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pomodoro Focus Timer Widget */}
            <div className="soft-card p-5 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 border border-amber-200/80 text-center space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#FF6B30]" />
                  <span>Pomodoro Focus Timer</span>
                </div>
                <span className="soft-badge bg-white text-slate-800 border-amber-200 text-[10px] font-mono">
                  25 Min Sesi
                </span>
              </div>

              <div className="text-4xl font-mono font-bold text-slate-900 py-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                {formatTimer(timerSeconds)}
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`soft-button text-xs px-5 py-2.5 flex items-center gap-1.5 ${
                    timerActive ? 'bg-slate-900 text-white' : ''
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{timerActive ? 'Jeda' : 'Start Focus'}</span>
                </button>
                <button
                  onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Quick Skill Stats Card */}
            <div className="soft-card p-5 bg-slate-900 text-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Progres</span>
                <TrendingUp className="w-4 h-4 text-[#FF6B30]" />
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <p className="text-2xl font-black text-white">{goals.length}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Target Skill</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <p className="text-2xl font-black text-[#10B981]">{completedMilestones}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Milestone Selesai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
