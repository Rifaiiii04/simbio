'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Sparkles,
  Compass,
  Handshake,
  LayoutDashboard,
} from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { NavUserProfile } from './NavUserProfile';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  matchPrefix?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Explore', href: '/explore', icon: LayoutDashboard },
  { name: 'Discovery', href: '/discovery', icon: Compass },
  { name: 'Partnerships', href: '/partnerships', icon: Handshake, matchPrefix: true },
];

/** Pages that use a dark background */
const DARK_PAGES = ['/explore', '/discovery'];

interface NavbarProps {
  hideBottomNav?: boolean;
}

export function Navbar({ hideBottomNav }: NavbarProps = {}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  const isDarkPage = DARK_PAGES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('simbioly_token');
    setToken(storedToken);

    if (storedToken) {
      let currentUserId = '';
      try {
        const storedUser = localStorage.getItem('simbioly_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUserId = parsed.id || '';
        }
      } catch {
        // ignore
      }

      // Fetch notification summary
      async function loadNotificationCount() {
        try {
          const res = await apiFetch<{ totalCount: number }>('/partnerships/notifications/summary');
          setNotificationCount(res.totalCount || 0);
        } catch {
          // ignore
        }
      }
      loadNotificationCount();

      // Connect global socket for real-time notification badges
      if (!socketRef.current) {
        const socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          if (currentUserId) {
            socket.emit('join_user', currentUserId);
          }
        });

        socket.on('notification_badge_update', () => {
          loadNotificationCount();
        });

        socket.on('messages_read', () => {
          loadNotificationCount();
        });
      }
    }
  }, [pathname]);

  const isNavActive = (item: NavItem) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  const brandHref = mounted && token ? '/explore' : '/';

  /* ------------------------------------------------------------------ */
  /* Color tokens based on page theme                                    */
  /* ------------------------------------------------------------------ */
  const headerBg = isDarkPage
    ? 'bg-[#0A0A0A]/95 border-neutral-800/60'
    : 'bg-white/85 border-slate-200/80';
  const brandText = isDarkPage ? 'text-white' : 'text-slate-900';
  const subtitleColor = 'text-[#FF6B30]'; // always orange
  const navPillBg = isDarkPage
    ? 'bg-neutral-800/80 border-neutral-700/60'
    : 'bg-slate-100/90 border-slate-200/80';
  const navActiveClass = 'bg-[#FF6B30] text-white shadow-sm shadow-[#FF6B30]/25';
  const navInactiveClass = isDarkPage
    ? 'text-neutral-400 hover:text-white hover:bg-neutral-700/60'
    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60';

  const bottomNavBg = isDarkPage
    ? 'bg-[#0A0A0A]/95 border-neutral-800/60'
    : 'bg-white/95 border-slate-200/90';
  const bottomNavActive = isDarkPage
    ? 'bg-[#FF6B30]/10 text-[#FF6B30]'
    : 'bg-orange-50/90 text-[#FF6B30]';
  const bottomNavInactive = isDarkPage
    ? 'text-neutral-500 hover:text-neutral-300'
    : 'text-slate-500 hover:text-slate-700';
  const bottomNavIconInactive = isDarkPage
    ? 'text-neutral-500 hover:text-neutral-300'
    : 'text-slate-400 hover:text-slate-600';
  const bottomNavTextInactive = isDarkPage
    ? 'text-neutral-500'
    : 'text-slate-500';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                              */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-3 sm:px-5 lg:px-8 py-2 transition-all duration-300 ${headerBg}`}>
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link
            href={brandHref}
            className={`flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl group shrink-0 ${brandText}`}
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF6B30] shadow-md shadow-[#FF6B30]/20 flex items-center justify-center text-white text-sm font-black shrink-0"
            >
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-pulse" />
            </motion.div>
            <div className="flex flex-col">
              <span className="leading-none text-base sm:text-lg tracking-tight font-black">Simbioly</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase leading-tight mt-0.5 ${subtitleColor}`}>
                Skill Exchange
              </span>
            </div>
          </Link>

          {/* DESKTOP & TABLET NAV LINKS */}
          <nav className={`hidden md:flex items-center backdrop-blur-md p-1 rounded-2xl border shadow-2xs relative ${navPillBg}`}>
            {mounted && token ? (
              NAV_ITEMS.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;
                const hasBadge = item.name === 'Partnerships' && notificationCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 lg:gap-2 ${
                      active ? navActiveClass : navInactiveClass
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`} />
                    <span>{item.name}</span>
                    {hasBadge && (
                      <span className="ml-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E41E3F] text-white text-[9.5px] font-black flex items-center justify-center leading-none shadow-2xs">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/#how-it-works"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${navInactiveClass}`}
                >
                  How It Works
                </Link>
                <Link
                  href="/#skills"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${navInactiveClass}`}
                >
                  Skill Matrix
                </Link>
              </div>
            )}
          </nav>

          {/* User Profile / Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <NavUserProfile />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAV                                                       */}
      {/* ========================================================================= */}
      {mounted && token && !hideBottomNav && (
        <nav aria-label="Mobile Navigation" className={`md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl border-t shadow-2xl px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] ${bottomNavBg}`}>
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              const hasBadge = item.name === 'Partnerships' && notificationCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 ${
                    active ? bottomNavActive : bottomNavInactive
                  }`}
                >
                  <div
                    className={`relative p-0.5 rounded-xl ${
                      active ? 'text-[#FF6B30]' : bottomNavIconInactive
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {hasBadge && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#E41E3F] text-white text-[8.5px] font-black flex items-center justify-center leading-none border-2 border-white shadow-2xs">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] tracking-tight font-bold transition-colors ${
                      active ? 'text-[#FF6B30]' : bottomNavTextInactive
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
