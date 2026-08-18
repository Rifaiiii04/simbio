'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2, ShieldCheck, Mail, MapPin, Award, BookOpen, Sparkles } from 'lucide-react';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
    country: string | null;
    createdAt?: string;
  };
  teachCount: number;
  learnCount: number;
  onAvatarUpdated: (newUrl: string) => void;
}

export function ProfileHeader({ user, teachCount, learnCount, onAvatarUpdated }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await apiFetch<{ user: { avatarUrl: string }; avatarUrl: string }>('/users/me/avatar', {
        method: 'POST',
        body: formData,
      });
      const newAvatarUrl = res.avatarUrl || res.user.avatarUrl;
      onAvatarUpdated(newAvatarUrl);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah foto profil');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarSrc = getAvatarUrl(user.avatarUrl, user.id);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
      {/* Decorative Cover Gradient Banner */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-orange-500 via-[#FF6B30] to-amber-500 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profil Pengguna Simbioly</span>
        </div>
      </div>

      {/* Main Profile Info Header */}
      <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-20">
        {/* Left: Avatar with Camera Trigger + User Name */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={user.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Upload Overlay */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-100"
              title="Klik untuk mengganti foto profil"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-bold">Mengunggah...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1 drop-shadow-md" />
                  <span className="text-[10px] font-black uppercase tracking-wider drop-shadow-md">Ganti Foto</span>
                </>
              )}
            </button>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User Details */}
          <div className="space-y-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
              <span className="soft-badge bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-bold">
              {user.username && <span className="text-[#FF6B30]">@{user.username}</span>}
              <span className="flex items-center gap-1 text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B30]" />
                <span>{user.country || 'Indonesia'}</span>
              </span>
            </div>

            {errorMsg && <p className="text-xs font-bold text-red-600 pt-1">{errorMsg}</p>}
          </div>
        </div>

        {/* Right: Quick Stats Counter */}
        <div className="flex items-center gap-3 self-start sm:self-end pt-2 sm:pt-0">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center min-w-[90px]">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">Mengajar</span>
            <span className="text-xl font-black text-emerald-900">{teachCount} Skill</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-orange-50/80 border border-orange-200 text-center min-w-[90px]">
            <span className="text-xs font-black text-[#FF6B30] uppercase tracking-wider block">Belajar</span>
            <span className="text-xl font-black text-orange-900">{learnCount} Skill</span>
          </div>
        </div>
      </div>
    </div>
  );
}
