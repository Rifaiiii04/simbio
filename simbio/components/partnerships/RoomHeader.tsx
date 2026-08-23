'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  Star,
  ShieldAlert,
  BookOpen,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

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
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function RoomHeader({
  partner,
  isFocusModeActive,
  isSocketConnected,
  onOpenAudioCall,
  onOpenReview,
  onOpenReport,
  onToggleSidebar,
  isSidebarOpen = false,
}: RoomHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
      {/* Left: Back Arrow + Avatar + Partner Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link
          href="/partnerships"
          onClick={(e) => {
            if (isFocusModeActive) {
              e.preventDefault();
              toast.warning('Focus Mode is active. You cannot leave until the session ends.');
            }
          }}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition shrink-0 cursor-pointer"
          title="Back to partnerships"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-sm overflow-hidden shadow-2xs">
            {partner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              partner.name.charAt(0).toUpperCase()
            )}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isSocketConnected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">{partner.name}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className={isSocketConnected ? 'text-emerald-600' : 'text-amber-600'}>
              {isSocketConnected ? 'Active' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons (Call, Review, Report, and Sidebar Toggle Icon) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Audio Call */}
        <button
          onClick={onOpenAudioCall}
          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
          title="Audio Call"
        >
          <Phone className="w-4 h-4" />
        </button>

        {/* Review */}
        <button
          onClick={onOpenReview}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          title="Review"
        >
          <Star className="w-4 h-4" />
        </button>

        {/* Report */}
        <button
          onClick={onOpenReport}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 flex items-center justify-center transition cursor-pointer"
          title="Report"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Mobile Roadmap/Focus Drawer Toggle — Icon only */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`lg:hidden w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
              isSidebarOpen
                ? 'bg-[#FF6B30] text-white shadow-2xs'
                : 'bg-orange-50 text-[#FF6B30] border border-orange-200 hover:bg-orange-100'
            }`}
            title="Learning Roadmap & Focus Session"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
