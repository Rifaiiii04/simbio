'use client';

import { User as UserIcon, Globe, AtSign } from 'lucide-react';

interface ProfileIdentityFormProps {
  name: string;
  username: string;
  bio: string;
  country: string;
  onChangeName: (val: string) => void;
  onChangeUsername: (val: string) => void;
  onChangeBio: (val: string) => void;
  onChangeCountry: (val: string) => void;
}

const COUNTRIES = [
  'Indonesia',
  'Malaysia',
  'Singapore',
  'United States',
  'United Kingdom',
  'Japan',
  'Germany',
  'Australia',
  'Canada',
  'France',
  'Netherlands',
];

export function ProfileIdentityForm({
  name,
  username,
  bio,
  country,
  onChangeName,
  onChangeUsername,
  onChangeBio,
  onChangeCountry,
}: ProfileIdentityFormProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B30] flex items-center justify-center border border-orange-200">
          <UserIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">Personal & Account Information</h3>
          <p className="text-xs text-slate-500 font-medium">
            Manage your profile identity details visible to reciprocal learning partners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Full Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <AtSign className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => onChangeUsername(e.target.value)}
              placeholder="your_username"
              className="w-full pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Country / Region */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700">Country / Region</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-3.5 h-3.5 text-[#FF6B30]" />
            </div>
            <select
              value={country}
              onChange={(e) => onChangeCountry(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition appearance-none cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">Bio & Collaboration Interests</label>
            <span className="text-[10px] text-slate-400 font-medium">{bio.length}/500 characters</span>
          </div>
          <div className="relative">
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => onChangeBio(e.target.value.slice(0, 500))}
              placeholder="Tell others about your background, the skills you love teaching, or what you are excited to learn together..."
              className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
