'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { SkillSwapDeck } from '@/components/dashboard/SkillSwapDeck';
import { Sparkles } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat Skill Swap Deck...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden">
      <Navbar />
      {/* flex-1 + flex flex-col means this fills all remaining height below navbar with safe clearance for mobile bottom navbar */}
      <main className="flex-1 flex flex-col overflow-hidden px-3 sm:px-4 pt-2 pb-20 md:pb-3">
        <SkillSwapDeck />
      </main>
      <SimbiAvatar
        state="happy"
        message="Swipe atau klik Hubungkan Exchange pada kartu kandidat untuk memulai pertukaran skill reciprocal! 🍊"
      />
    </div>
  );
}
