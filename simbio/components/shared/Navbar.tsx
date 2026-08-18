'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Compass, Map, Handshake, User, LogOut, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('simbioly_token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('simbioly_token');
    setToken(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
      <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={token ? '/dashboard' : '/'} className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6B30] shadow-sm flex items-center justify-center text-white text-sm font-black group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-lg tracking-tight font-black text-slate-900">Simbioly</span>
            <span className="text-[10px] font-bold text-[#FF6B30] uppercase tracking-wider">Skill Exchange</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600">
          {token ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  pathname === '/dashboard' ? 'bg-[#FF6B30] text-white font-black shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/roadmaps"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  pathname.startsWith('/roadmaps') ? 'bg-[#FF6B30] text-white font-black shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Roadmaps</span>
              </Link>
              <Link
                href="/discovery"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  pathname === '/discovery' ? 'bg-[#FF6B30] text-white font-black shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Discovery</span>
              </Link>
              <Link
                href="/partnerships"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  pathname.startsWith('/partnerships') ? 'bg-[#FF6B30] text-white font-black shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Handshake className="w-4 h-4" />
                <span>Partnerships</span>
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  pathname === '/profile' ? 'bg-[#FF6B30] text-white font-black shadow-xs' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition">
                How It Works
              </Link>
              <Link href="/#skills" className="px-4 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition">
                Skill Catalog
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3.5 py-2 rounded-xl hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="soft-button text-xs px-5 py-2.5 flex items-center gap-1.5"
              >
                <span>Start Exchange Free</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
