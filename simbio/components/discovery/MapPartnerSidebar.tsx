'use client';

import Link from 'next/link';
import { getAvatarUrl } from '@/lib/api/client';
import { Search, ShieldCheck, MapPin, MessageCircle, ExternalLink, X, Users, Sparkles } from 'lucide-react';

export interface MapUser {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio?: string | null;
  latitude: number;
  longitude: number;
  teachSkills: Array<{ id: string; name: string }>;
  distanceKm: number | null;
  isConnected?: boolean;
  isPending?: boolean;
  partnershipId?: string | null;
}

interface Props {
  users: MapUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectUser: (u: MapUser) => void;
  selectedUserId?: string;
}

export function MapPartnerSidebar({
  users,
  searchQuery,
  onSearchChange,
  onSelectUser,
  selectedUserId,
}: Props) {
  const connectedUsers = users.filter((u) => u.isConnected);
  const otherUsers = users.filter((u) => !u.isConnected);

  const filterFn = (u: MapUser) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.teachSkills.some((s) => s.name.toLowerCase().includes(q))
    );
  };

  const filteredConnected = connectedUsers.filter(filterFn);
  const filteredOther = otherUsers.filter(filterFn);

  return (
    <div className="bg-[#121214] border border-neutral-800/80 rounded-3xl p-4 sm:p-5 flex flex-col h-full shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Connected Partners</h3>
            <p className="text-[10px] text-neutral-400 font-medium">
              {connectedUsers.length} connected in your network
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          {connectedUsers.length} Connected
        </span>
      </div>

      {/* Search Bar */}
      <div className="py-3 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search partners, skills..."
            className="w-full pl-8 pr-7 py-2 text-xs bg-[#18181B] text-white placeholder-neutral-500 rounded-xl border border-neutral-800 focus:border-[#FF6B30] focus:outline-none transition font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Partners List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
        {filteredConnected.length === 0 && filteredOther.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 text-center p-4">
            <Sparkles className="w-6 h-6 text-neutral-600 mb-2" />
            <p className="text-xs font-bold text-neutral-300">No partners found</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Try a different search term or connect with nearby study candidates.
            </p>
          </div>
        ) : (
          <>
            {/* Section 1: Connected Partners */}
            {filteredConnected.length > 0 && (
              <div className="space-y-2">
                {filteredConnected.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  const avatarSrc = getAvatarUrl(u.avatarUrl, u.name);

                  return (
                    <div
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#18181B] border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                          : 'bg-[#18181B]/70 hover:bg-[#18181B] border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={avatarSrc}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.name}`;
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121214]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1 leading-tight truncate">
                            {u.name}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-medium truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-neutral-500" />
                            <span>{u.country || 'Global'}</span>
                            {u.distanceKm !== null && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span>{Math.round(u.distanceKm)} km away</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Teach skill chips */}
                      {u.teachSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.teachSkills.slice(0, 2).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-300 truncate"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-neutral-800/60">
                        {u.partnershipId ? (
                          <Link
                            href={`/partnerships/${u.partnershipId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Open Chat</span>
                          </Link>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectUser(u);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section 2: Nearby Candidates */}
            {filteredOther.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  Nearby Study Candidates ({filteredOther.length})
                </p>
                {filteredOther.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  const avatarSrc = getAvatarUrl(u.avatarUrl, u.name);

                  return (
                    <div
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#18181B] border-[#FF6B30]/60 shadow-lg shadow-[#FF6B30]/10'
                          : 'bg-[#18181B]/50 hover:bg-[#18181B] border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarSrc}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#FF6B30]/30 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.name}`;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1 leading-tight truncate">
                            {u.name}
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-medium truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-neutral-500" />
                            <span>{u.country || 'Global'}</span>
                            {u.distanceKm !== null && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span>{Math.round(u.distanceKm)} km away</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {u.teachSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.teachSkills.slice(0, 2).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-lg bg-[#FF6B30]/15 border border-[#FF6B30]/30 text-[10px] font-medium text-[#FF8F60] truncate"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
