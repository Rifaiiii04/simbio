'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch, getAvatarUrl } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { EndExchangeModal } from '@/components/partnerships/EndExchangeModal';
import {
  Handshake,
  MessageSquare,
  UserCheck,
  UserX,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';

interface UserSummary {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  country?: string | null;
}

interface Partnership {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ENDED';
  createdAt: string;
  requester: UserSummary;
  recipient: UserSummary;
  unreadCount?: number;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string | null;
    isRead: boolean;
    createdAt: string;
  } | null;
}

export default function PartnershipsPage() {
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [myUserId, setMyUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [endingPartnership, setEndingPartnership] = useState<{ id: string; partnerName: string } | null>(null);
  const [isEndingExchange, setIsEndingExchange] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem('simbioly_token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const meRes = await apiFetch<{ user: { id: string } }>('/users/me');
        setMyUserId(meRes.user.id);

        const res = await apiFetch<{ partnerships: Partnership[] }>('/partnerships');
        setPartnerships(res.partnerships);
      } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication required'))) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'leave') => {
    try {
      await apiFetch(`/partnerships/${id}/${action}`, { method: 'POST' });
      const res = await apiFetch<{ partnerships: Partnership[] }>('/partnerships');
      setPartnerships(res.partnerships);
      setStatusMessage(
        action === 'accept'
          ? 'Partnership accepted successfully! Happy learning together.'
          : action === 'reject'
          ? 'Partnership invitation declined.'
          : 'Partnership ended.'
      );
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleEndExchangeConfirm = async (departureMessage: string) => {
    if (!endingPartnership) return;
    setIsEndingExchange(true);
    try {
      await apiFetch(`/partnerships/${endingPartnership.id}/leave`, {
        method: 'POST',
        body: JSON.stringify({ messageText: departureMessage }),
      });
      const res = await apiFetch<{ partnerships: Partnership[] }>('/partnerships');
      setPartnerships(res.partnerships);
      setStatusMessage('Partnership ended. Your departure message was delivered.');
      setEndingPartnership(null);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsEndingExchange(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading study partnerships...</span>
          </div>
        </div>
      </div>
    );
  }

  const rawPendingRequests = partnerships.filter((p) => p.status === 'PENDING');
  const rawActivePartnerships = partnerships.filter((p) => p.status === 'ACCEPTED');

  const filterByPartner = (list: Partnership[]) => {
    if (!debouncedSearch.trim()) return list;
    const q = debouncedSearch.toLowerCase().trim();
    return list.filter((p) => {
      const partner = p.requesterId === myUserId ? p.recipient : p.requester;
      const nameMatch = partner.name.toLowerCase().includes(q);
      const usernameMatch = partner.username?.toLowerCase().includes(q) ?? false;
      const countryMatch = partner.country?.toLowerCase().includes(q) ?? false;
      return nameMatch || usernameMatch || countryMatch;
    });
  };

  const activePartnerships = filterByPartner(rawActivePartnerships);
  const pendingRequests = filterByPartner(rawPendingRequests);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-20 md:pb-6 space-y-3.5 sm:space-y-4">
        {/* Simple Top Action Bar with Search */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-orange-50 text-[#FF6B30] border border-orange-200 flex items-center justify-center shrink-0">
                <Handshake className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Partnerships</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  {rawActivePartnerships.length} Active
                </span>
              </h1>
            </div>

            <Link
              href="/discovery"
              className="sm:hidden soft-button text-[11px] px-2.5 py-1.5 flex items-center gap-1 shadow-2xs whitespace-nowrap rounded-xl font-bold"
            >
              <Compass className="w-3 h-3" />
              <span>Find Partner</span>
            </Link>
          </div>

          {/* Search Partner Input (Debounced) */}
          <div className="flex-1 max-w-md relative w-full">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner by name or username..."
              className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Compact Stats */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-[11px] sm:text-xs font-bold">
              <span className="text-slate-600 font-semibold">{rawActivePartnerships.length} Active</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#FF6B30]">{rawPendingRequests.length} Pending</span>
            </div>

            <Link
              href="/discovery"
              className="soft-button text-[11px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 shadow-2xs whitespace-nowrap rounded-xl font-bold"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Find New Partner</span>
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 text-[11px] sm:text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT CANVAS (8 Columns): Active Partnerships */}
          <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Handshake className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#FF6B30] shrink-0" />
                <h2 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                  Active Partnerships ({activePartnerships.length})
                </h2>
              </div>
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] sm:text-xs px-2 py-0.5 shrink-0">
                Ready for Learning Rooms
              </span>
            </div>

            {rawActivePartnerships.length === 0 ? (
              <div className="soft-card p-8 sm:p-10 text-center space-y-3 sm:space-y-4 bg-white border border-slate-200/80">
                <Handshake className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900">No Active Partnerships Connected</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Explore global peers on the Discovery page and propose a reciprocal skill exchange!
                  </p>
                </div>
                <Link href="/discovery" className="soft-button text-[11px] sm:text-xs px-5 py-2 sm:px-6 sm:py-2.5 inline-flex items-center gap-1.5 shadow-xs">
                  <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Explore Skill Discovery</span>
                </Link>
              </div>
            ) : activePartnerships.length === 0 ? (
              <div className="soft-card p-6 sm:p-8 text-center space-y-2.5 sm:space-y-3 bg-white border border-slate-200/80">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-900">No active partners found for &ldquo;{debouncedSearch}&rdquo;</p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Try searching with a different name or clear the search query.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="soft-button text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
                {activePartnerships.map((p) => {
                  const partner = p.requesterId === myUserId ? p.recipient : p.requester;
                  const hasUnread = Boolean(p.unreadCount && p.unreadCount > 0);

                  return (
                    <div
                      key={p.id}
                      className={`soft-card p-3.5 sm:p-4 md:p-5 bg-white space-y-3 shadow-xs transition group ${
                        hasUnread
                          ? 'border border-red-200 shadow-md shadow-red-500/5 hover:border-red-300'
                          : 'border border-slate-200/80 hover:border-[#FF6B30]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-50 border border-orange-200/80 overflow-hidden shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getAvatarUrl(partner.avatarUrl, partner.username || partner.name)}
                                alt={partner.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                                    partner.username || partner.name
                                  )}`;
                                }}
                              />
                            </div>
                            {hasUnread && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E41E3F] border-2 border-white rounded-full shadow-2xs" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#FF6B30] transition truncate">
                                {partner.name}
                              </h3>
                              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                              {partner.username ? `@${partner.username}` : `Connected since ${new Date(p.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {hasUnread ? (
                            <span className="soft-badge bg-red-50 text-[#E41E3F] border-red-200 text-[9px] sm:text-[10px] px-2 py-0.5 font-bold shrink-0 flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E41E3F] shrink-0" />
                              <span>{p.unreadCount} new</span>
                            </span>
                          ) : (
                            <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] sm:text-[10px] px-2 py-0.5 shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <Link
                          href={`/partnerships/${p.id}`}
                          className={`soft-button text-[11px] sm:text-xs py-1.5 sm:py-2 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs font-bold rounded-xl ${
                            hasUnread ? 'bg-[#FF6B30] ring-2 ring-orange-400/40' : ''
                          }`}
                        >
                          <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          <span>Study Room</span>
                        </Link>
                        <button
                          onClick={() => setEndingPartnership({ id: p.id, partnerName: partner.name })}
                          className="py-1.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold hover:bg-red-50 hover:text-red-600 transition shadow-2xs cursor-pointer"
                        >
                          End Exchange
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (4 Columns): Pending Invitations */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5">
            {pendingRequests.length > 0 && (
              <div className="soft-card bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border border-amber-200/80 p-3.5 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B30] shrink-0" />
                    <h3 className="text-[11px] sm:text-xs font-bold text-amber-950 truncate">
                      Partnership Requests ({pendingRequests.length})
                    </h3>
                  </div>
                  <span className="soft-badge bg-white text-amber-800 border-amber-200 text-[8.5px] sm:text-[10px] px-1.5 py-0.5 font-bold shrink-0">
                    Action Required
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pendingRequests.map((p) => {
                    const partner = p.requesterId === myUserId ? p.recipient : p.requester;
                    const isIncoming = p.recipientId === myUserId;

                    return (
                      <div
                        key={p.id}
                        className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 border border-orange-200/80 overflow-hidden shadow-2xs shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getAvatarUrl(partner.avatarUrl, partner.username || partner.name)}
                              alt={partner.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                                  partner.username || partner.name
                                )}`;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-[11px] sm:text-xs truncate">{partner.name}</h3>
                            <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate">
                              {isIncoming ? 'Sent you a skill swap proposal' : 'Waiting for partner response'}
                            </p>
                          </div>
                        </div>

                        {isIncoming ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleAction(p.id, 'accept')}
                              className="py-1.5 sm:py-2 rounded-xl bg-[#10B981] text-white text-[10px] sm:text-[11px] font-bold hover:bg-emerald-600 transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleAction(p.id, 'reject')}
                              className="py-1.5 sm:py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-[10px] sm:text-[11px] font-bold hover:bg-red-50 hover:text-red-600 transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 text-[9.5px] sm:text-[10px] px-2 py-0.5 w-full text-center block">
                            Waiting for Partner Approval
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simbi Companion Mascot Advice */}
            <SimbiAvatar
              state="happy"
              message="Enter your study room to collaborate in real-time, build AI learning roadmaps together, and track milestones!"
            />

            {/* Quick Discovery Banner */}
            <div className="soft-card p-4 sm:p-5 bg-white space-y-2.5 sm:space-y-3 shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF6B30]" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Find New Learning Partners</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                Use deterministic matching or browse nearby members on the interactive map.
              </p>
              <Link
                href="/discovery"
                className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs"
              >
                <span>Go to Discovery</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* End Exchange Apology / Departure Message Modal */}
      {endingPartnership && (
        <EndExchangeModal
          isOpen={!!endingPartnership}
          onClose={() => setEndingPartnership(null)}
          partnerName={endingPartnership.partnerName}
          onConfirm={handleEndExchangeConfirm}
          loading={isEndingExchange}
        />
      )}
    </div>
  );
}
