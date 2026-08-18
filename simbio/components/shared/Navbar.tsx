'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Compass,
  Handshake,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/api/client';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  matchPrefix?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discovery', href: '/discovery', icon: Compass },
  { name: 'Partnerships', href: '/partnerships', icon: Handshake, matchPrefix: true },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('simbioly_token');
    setToken(storedToken);

    if (storedToken) {
      // Optional quick profile cache
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

  const isNavActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (DESKTOP, TABLET & MOBILE TOP BAR)                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all duration-300">
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between">
          {/* Brand Logo with Interactive Glow */}
          <Link
            href={token ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group"
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B30] to-orange-600 shadow-md shadow-orange-500/20 flex items-center justify-center text-white text-sm font-black"
            >
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </motion.div>
            <div className="flex flex-col">
              <span className="leading-none text-lg tracking-tight font-black text-slate-900">Simbioly</span>
              <span className="text-[10px] font-extrabold text-[#FF6B30] tracking-wider uppercase">
                Skill Exchange
              </span>
            </div>
          </Link>

          {/* DESKTOP & TABLET ANIMATED NAV LINKS (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs relative">
            {token ? (
              NAV_ITEMS.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-xl text-xs font-black transition-colors duration-200 flex items-center gap-2 z-10 ${
                      active ? 'text-white' : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-gradient-to-r from-[#FF6B30] to-orange-500 rounded-xl shadow-md shadow-orange-500/30 -z-10"
                      />
                    )}
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/#how-it-works"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition"
                >
                  Cara Kerja
                </Link>
                <Link
                  href="/#skills"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition"
                >
                  Katalog Skill
                </Link>
              </div>
            )}
          </nav>

          {/* RIGHT ACTION BUTTONS & USER AVATAR */}
          <div className="flex items-center gap-2.5">
            {token ? (
              <div className="flex items-center gap-2">
                {/* User quick avatar preview on tablet/desktop */}
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200 transition group"
                  title="Buka profil saya"
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-orange-100 border border-orange-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAvatarUrl(userAvatar, 'me')}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-[#FF6B30] max-w-[100px] truncate">
                    {userName || 'Profil'}
                  </span>
                </Link>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50/90 border border-red-200/80 px-3.5 py-2 rounded-xl hover:bg-red-100/90 hover:border-red-300 transition shadow-2xs cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-black text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B30] to-orange-500 hover:from-[#E0531A] hover:to-orange-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Gratis</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (ONLY ON SCREENS < md)                     */}
      {/* ========================================================================= */}
      {token && (
        <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200"
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-active-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-orange-50 border border-orange-200/80 rounded-2xl -z-10"
                    />
                  )}

                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-0.5 rounded-xl ${
                      active ? 'text-[#FF6B30]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  <span
                    className={`text-[10px] tracking-tight font-black transition-colors ${
                      active ? 'text-[#FF6B30]' : 'text-slate-500'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
