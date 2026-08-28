'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, LogIn, UserPlus } from 'lucide-react';
import { getAvatarUrl } from '@/lib/api/client';

const DARK_PAGES = ['/explore'];

export function NavUserProfile() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const isDarkPage = DARK_PAGES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('simbioly_token');
    setToken(storedToken);

    if (storedToken) {
      try {
        const storedUser = localStorage.getItem('simbioly_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserAvatar(parsed.avatarUrl || null);
          setUserName(parsed.name || null);
        }
      } catch {
        // ignore
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('simbioly_token');
    localStorage.removeItem('simbioly_user');
    setToken(null);
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl animate-pulse ${isDarkPage ? 'bg-neutral-800' : 'bg-slate-100'}`} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/login"
          className={`text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
            isDarkPage
              ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Log In</span>
        </Link>
        <Link
          href="/register"
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-orange-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign Up</span>
        </Link>
      </div>
    );
  }

  const isProfileActive = pathname === '/profile';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/profile"
        className={`flex items-center gap-2 p-1 pr-2.5 sm:pr-3 rounded-2xl transition-all shadow-2xs group border ${
          isProfileActive
            ? 'bg-[#FF6B30]/15 border-[#FF6B30]/40 text-[#FF6B30]'
            : isDarkPage
            ? 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-neutral-200 hover:text-white'
            : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 text-slate-800 hover:text-[#FF6B30]'
        }`}
        title="View My Profile"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#FF6B30] to-orange-500 text-white font-bold flex items-center justify-center text-xs overflow-hidden shadow-2xs shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAvatarUrl(userAvatar, 'me')}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/thumbs/svg?seed=me';
            }}
          />
        </div>
        <span className="text-xs font-bold transition hidden sm:inline max-w-[90px] md:max-w-[110px] lg:max-w-[140px] truncate">
          {userName || 'My Profile'}
        </span>
      </Link>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleLogout}
        className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer border ${
          isDarkPage
            ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
            : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
        }`}
        title="Sign out of Simbioly"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden lg:inline text-xs">Log Out</span>
      </motion.button>
    </div>
  );
}
