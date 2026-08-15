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
    <header className="sticky top-0 z-50 bg-[#FFFDF7] border-b-3 border-[#0F172A] px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={token ? '/dashboard' : '/'} className="flex items-center gap-2.5 font-black text-xl text-[#0F172A] group">
          <div className="w-10 h-10 rounded-2xl bg-[#FF7A30] border-2.5 border-[#0F172A] shadow-[3px_3px_0px_0px_#0F172A] flex items-center justify-center text-white text-sm font-black group-hover:-translate-y-0.5 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-lg tracking-tight font-black text-[#0F172A]">Simbioly</span>
            <span className="text-[10px] font-black text-[#FF7A30] uppercase tracking-wider">Skill Exchange</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-black text-[#0F172A]">
          {token ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#0F172A] transition ${
                  pathname === '/dashboard' ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]' : 'bg-white hover:bg-[#FACC15]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/roadmaps"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#0F172A] transition ${
                  pathname.startsWith('/roadmaps') ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]' : 'bg-white hover:bg-[#FACC15]'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Roadmaps</span>
              </Link>
              <Link
                href="/discovery"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#0F172A] transition ${
                  pathname === '/discovery' ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]' : 'bg-white hover:bg-[#FACC15]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Discovery</span>
              </Link>
              <Link
                href="/partnerships"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#0F172A] transition ${
                  pathname.startsWith('/partnerships') ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]' : 'bg-white hover:bg-[#FACC15]'
                }`}
              >
                <Handshake className="w-4 h-4" />
                <span>Partnerships</span>
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#0F172A] transition ${
                  pathname === '/profile' ? 'bg-[#FF7A30] text-white shadow-[3px_3px_0px_0px_#0F172A]' : 'bg-white hover:bg-[#FACC15]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className="px-4 py-2 rounded-xl bg-white border-2 border-[#0F172A] hover:bg-[#FACC15] transition">
                How It Works
              </Link>
              <Link href="/#skills" className="px-4 py-2 rounded-xl bg-white border-2 border-[#0F172A] hover:bg-[#FACC15] transition">
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
              className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-white border-2 border-[#0F172A] px-3.5 py-2 rounded-xl hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-black text-[#0F172A] bg-white border-2.5 border-[#0F172A] px-4 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="neo-button text-xs px-5 py-2.5 flex items-center gap-1.5"
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
