'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { ArrowRight, Globe, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import WarpText from '@/components/ui/WarpText';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: { id: string; name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailOrUsername.trim(),
          password,
        }),
      });

      localStorage.setItem('simbioly_token', res.token);
      localStorage.setItem('simbioly_user', JSON.stringify(res.user));
      router.push('/explore');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Cannot connect to the server. Please ensure the Backend API is running on http://localhost:3001.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] text-slate-900 antialiased selection:bg-orange-100 selection:text-[#FF6B30] overflow-x-hidden">
      {/* Toast Notification for Social Sign-In */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 border border-slate-700">
            <AlertCircle className="w-4 h-4 text-[#FF6B30] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. TOP MINIMAL HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between"
      >
        {/* Logo & Support Email */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="font-black text-2xl tracking-tight text-slate-950 group-hover:text-[#FF6B30] transition">
              simbioly<span className="text-[#FF6B30]">.</span>
            </span>
          </Link>
          <span className="text-slate-300 font-light">/</span>
          <a
            href="mailto:support@simbioly.com"
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 transition font-medium hidden sm:inline"
          >
            support@simbioly.com
          </a>
        </div>

        {/* Right Navigation & CTA Button */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => showToast('Language selection will be available soon.')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 font-medium px-2 py-1 transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>En ▾</span>
          </button>

          <span className="text-slate-400 hidden md:inline">|</span>

          <Link
            href="/register"
            className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6B30] transition"
          >
            Sign Up
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Get Started</span>
          </Link>
        </div>
      </motion.header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full max-w-5xl mx-auto px-6 py-8 sm:py-14 flex flex-col items-center">
        {/* WarpText Interactive Headline (1 Single Line) */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14"
        >
          <WarpText
            text="Login To Your Account"
            color="#0F172A"
            warpStrength={0.08}
            warpScale={1.7}
            speed={0.55}
            pointerInfluence={0.42}
            pointerStrength={0.38}
            refraction={0.018}
            ripple
            fontSize="clamp(2.2rem, 5.2vw, 3.8rem)"
            fontWeight={900}
            fontFamily="var(--font-poppins), sans-serif"
            letterSpacing="-0.04em"
            lineHeight={1.0}
            style={{ height: '85px', width: '100%' }}
          />
          <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium max-w-lg mx-auto">
            Uncover the Untapped Potential of Your Growth to Connect with Peers
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-4xl mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Split: 50% Form Input (Left: 3 Rows) / 50% Social Sign-In (Right: 3 Rows) */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 items-center relative">
          {/* LEFT 50%: 3 rows (Email, Password, Submit Button) */}
          <motion.form
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="space-y-4 w-full"
          >
            <div>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Phone / Email / Username"
                className="w-full h-14 sm:h-[60px] px-6 rounded-full bg-white border border-slate-200 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B30] focus:ring-2 focus:ring-orange-500/10 shadow-xs transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passcode / Password"
                className="w-full h-14 sm:h-[60px] pl-6 pr-14 rounded-full bg-white border border-slate-200 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B30] focus:ring-2 focus:ring-orange-500/10 shadow-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 focus:outline-hidden"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 sm:h-[60px] px-6 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-sm sm:text-base font-semibold flex items-center justify-between shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Logging in...' : 'Login to Your Account'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.form>

          {/* RIGHT 50%: 3 rows (Gmail, Facebook, Apple) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full space-y-4 relative"
          >
            {/* Minimal vertical slash divider for desktop */}
            <div className="hidden md:flex absolute -left-4 lg:-left-7 top-1/2 -translate-y-1/2 text-slate-300 font-light text-xl select-none pointer-events-none">
              /
            </div>

            <button
              type="button"
              onClick={() => showToast('Google sign-in is coming soon. Please use email & password.')}
              className="w-full h-14 sm:h-[60px] px-6 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition cursor-pointer text-left"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.2-1.9.4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
              <span className="truncate">Sign in with Gmail Account</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Facebook sign-in is coming soon. Please use email & password.')}
              className="w-full h-14 sm:h-[60px] px-6 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition cursor-pointer text-left"
            >
              <svg className="w-5 h-5 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="truncate">Sign in Facebook Account</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Apple sign-in is coming soon. Please use email & password.')}
              className="w-full h-14 sm:h-[60px] px-6 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition cursor-pointer text-left"
            >
              <svg className="w-5 h-5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.06-.51 2.68-1.26" />
              </svg>
              <span className="truncate">Sign in Apple Secure ID</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom Actions: Register & Forgot Passcode */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm"
        >
          <p className="text-slate-600 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-[#FF6B30] hover:underline underline-offset-4">
              Register free here →
            </Link>
          </p>

          <span className="hidden sm:inline text-slate-300">|</span>

          <button
            type="button"
            onClick={() => showToast('Password reset is coming soon. Please contact support@simbioly.com')}
            className="font-semibold text-slate-700 hover:text-[#FF6B30] transition cursor-pointer"
          >
            Forgot Passcode?
          </button>
        </motion.div>
      </main>

      {/* 3. BOTTOM CLEAN FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 border-t border-slate-100"
      >
        <div className="flex items-center gap-4">
          <Link href="/#how-it-works" className="hover:text-slate-600 transition">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/#how-it-works" className="hover:text-slate-600 transition">
            Terms & Conditions
          </Link>
        </div>

        <p className="font-medium">Copyrights @simbioly.group 2026</p>
      </motion.footer>
    </div>
  );
}
