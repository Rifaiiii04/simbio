'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { ArrowRight, Check, X, Loader2, Sparkles, AtSign } from 'lucide-react';

interface UsernameStepProps {
  initialUsername?: string;
  userFullName: string;
  onSuccess: (savedUsername: string) => void;
}

export function UsernameStep({ initialUsername = '', userFullName, onSuccess }: UsernameStepProps) {
  const [username, setUsername] = useState(initialUsername);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate smart suggestions based on user's name
  useEffect(() => {
    const raw = userFullName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const parts = raw.split(/\s+/).filter(Boolean);
    const generated: string[] = [];

    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      generated.push(`${first}${last}`);
      generated.push(`${first}_${last}`);
      generated.push(`${first.charAt(0)}_${last}`);
      generated.push(`${last}_${first}`);
      generated.push(`${first}_dev`);
    } else if (parts.length === 1 && parts[0]) {
      const single = parts[0];
      generated.push(`${single}`);
      generated.push(`${single}_dev`);
      generated.push(`${single}_pro`);
      generated.push(`${single}_learn`);
      generated.push(`${single}_${Math.floor(10 + Math.random() * 90)}`);
    } else {
      generated.push('learner_pro', 'peer_dev', 'study_mate');
    }

    const uniqueSuggestions = Array.from(new Set(generated)).slice(0, 5);
    setSuggestions(uniqueSuggestions);

    if (!username && uniqueSuggestions[0]) {
      setUsername(uniqueSuggestions[0]);
    }
  }, [userFullName]);

  // Debounced check username availability
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) {
      setAvailability(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<{ available: boolean; message: string }>(
          `/users/check-username?username=${encodeURIComponent(trimmed)}`
        );
        setAvailability(res);
      } catch {
        setAvailability({ available: false, message: 'Failed to verify username availability' });
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return;

    if (availability && !availability.available) {
      setError(availability.message);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ username: cleanUsername }),
      });

      // Update local storage user record
      try {
        const stored = localStorage.getItem('simbioly_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.username = cleanUsername;
          localStorage.setItem('simbioly_user', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }

      onSuccess(cleanUsername);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save username');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
          Step 1: Profile Identity
        </span>
        <h2 className="text-2xl font-black text-slate-900">Create Your Username</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Every learner and mentor in Simbioly has a unique handle. Choose one of our smart suggestions or type your custom username.
        </p>
      </div>

      <SimbiAvatar
        state="happy"
        message="Pick a cool username so study partners can easily tag and connect with you!"
      />

      {error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-bold flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Your Unique Username <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setError(null);
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
              }}
              placeholder="e.g. alex_rivera"
              className={`w-full pl-9 pr-10 py-3 text-xs sm:text-sm bg-white rounded-xl border font-bold transition focus:outline-hidden focus:ring-2 ${
                availability?.available
                  ? 'border-emerald-400 focus:ring-emerald-500/20 text-emerald-950'
                  : availability && !availability.available
                  ? 'border-red-400 focus:ring-red-500/20 text-red-950'
                  : 'border-slate-200 focus:border-[#FF6B30] focus:ring-orange-500/10 text-slate-900'
              }`}
            />

            {/* Right Status Icon */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {checking ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : availability?.available ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : availability && !availability.available ? (
                <X className="w-4 h-4 text-red-500" />
              ) : null}
            </div>
          </div>

          {/* Validation Feedback Message */}
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            {checking ? (
              <span className="text-slate-400 font-medium">Checking username availability...</span>
            ) : availability?.available ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>@{username} is available!</span>
              </span>
            ) : availability && !availability.available ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                <span>{availability.message}</span>
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Letters, numbers, and underscores only (3–30 characters)</span>
            )}
          </div>
        </div>

        {/* Smart Suggestions Chips */}
        {suggestions.length > 0 && (
          <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B30]" />
              <span>Smart Suggestions for You:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug) => {
                const isSelected = username === sug;
                return (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setUsername(sug)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-[#FF6B30] text-white ring-2 ring-orange-400/40'
                        : 'bg-white hover:bg-orange-100/80 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>@{sug}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          type="submit"
          disabled={saving || checking || !username || (availability !== null && !availability.available)}
          className="w-full soft-button py-3.5 text-xs flex items-center justify-center gap-2 shadow-2xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{saving ? 'Saving Username...' : 'Next: Skills You Can Teach'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
