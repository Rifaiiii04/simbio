'use client';

import { User as UserIcon, Globe, FileText, AtSign } from 'lucide-react';

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
          <h3 className="text-sm sm:text-base font-black text-slate-900">Informasi Pribadi & Akun</h3>
          <p className="text-xs text-slate-500 font-medium">
            Kelola data identitas profil Anda yang akan ditampilkan ke partner reciprocal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Contoh: Muhammad Rifai"
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
              placeholder="username_kamu"
              className="w-full pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Negara / Wilayah */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700">Negara / Wilayah Domisili</label>
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

        {/* Bio / Ringkasan Kolaborasi */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">Bio & Minat Kolaborasi</label>
            <span className="text-[10px] text-slate-400 font-medium">{bio.length}/500 karakter</span>
          </div>
          <div className="relative">
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => onChangeBio(e.target.value.slice(0, 500))}
              placeholder="Ceritakan latar belakang skill, keahlian yang ingin dibagikan, atau target skill yang ingin dipelajari bersama partner..."
              className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-900 bg-slate-50/70 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
