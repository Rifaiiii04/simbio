'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: { id: string; name: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem('simbioly_token', res.token);
      localStorage.setItem('simbioly_user', JSON.stringify(res.user));
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md neo-box p-8 sm:p-10 space-y-6 shadow-[8px_8px_0px_0px_#0F172A]">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Create Free Account</h1>
            <p className="text-xs text-gray-700 font-bold">Join the reciprocal skill exchange community</p>
          </div>

          <SimbiAvatar state="cheering" message="Create your profile to start trading your expertise for new skills!" />

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-100 rounded-xl border-2 border-[#0F172A] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#0F172A] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0F172A] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0F172A] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-white rounded-xl border-2 border-[#0F172A] focus:outline-hidden focus:border-[#FF7A30] font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-button py-3.5 text-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
            </button>
          </form>

          <div className="text-center text-xs font-bold text-gray-600 pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF7A30] font-black underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
