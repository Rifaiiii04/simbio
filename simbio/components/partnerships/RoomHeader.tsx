'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Globe, Zap, Phone, Star, ShieldAlert } from 'lucide-react';

interface RoomHeaderProps {
  partner: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    country?: string | null;
  };
  isFocusModeActive: boolean;
  isSocketConnected: boolean;
  onOpenAudioCall: () => void;
  onOpenReview: () => void;
  onOpenReport: () => void;
}

export function RoomHeader({
  partner,
  isFocusModeActive,
  isSocketConnected,
  onOpenAudioCall,
  onOpenReview,
  onOpenReport,
}: RoomHeaderProps) {
  return (
    <div className="soft-card p-4 sm:p-6 space-y-4 bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/partnerships"
            onClick={(e) => {
              if (isFocusModeActive) {
                e.preventDefault();
                alert('🔒 Mode Fokus Sedang Berjalan! Anda tidak dapat keluar dari room chat ini hingga sesi fokus selesai atau jeda disetujui kedua belah pihak.');
              }
            }}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-lg shadow-xs flex-shrink-0">
              {partner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                partner.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{partner.name}</h1>
                <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2.5 py-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Partner</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                {partner.username && <span className="text-[#FF6B30] font-bold">@{partner.username}</span>}
                {partner.country && (
                  <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 px-2 py-0.5 text-[9px] flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{partner.country}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Socket Badge & Quick Action Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`soft-badge text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 ${
              isSocketConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isSocketConnected ? 'Real-Time WebSocket Stream' : 'Connecting WebSocket...'}</span>
          </span>

          <button
            onClick={onOpenAudioCall}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Phone className="w-4 h-4" />
            <span>Audio Call</span>
          </button>

          <button
            onClick={onOpenReview}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1 shadow-2xs"
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Give Review</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-1 shadow-2xs"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Report Partner</span>
          </button>
        </div>
      </div>
    </div>
  );
}
