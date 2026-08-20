'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
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
}

export default function PartnershipsPage() {
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [myUserId, setMyUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const pendingRequests = partnerships.filter((p) => p.status === 'PENDING');
  const activePartnerships = partnerships.filter((p) => p.status === 'ACCEPTED');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 space-y-6">
        {/* Top Combined Command Header Card */}
        <div className="soft-card p-6 sm:p-7 bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="soft-badge bg-orange-50 text-[#FF6B30] border-orange-200 text-xs font-bold">
                Reciprocal Exchange Hub
              </span>
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                Real-Time Collaboration Rooms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Skill Exchange Partnerships
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Connect 1-on-1 with learning peers, enter collaborative study rooms, run structured focus sessions, and achieve your milestones together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Integrated Stats */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
              <div className="px-3 text-center">
                <p className="text-lg font-black text-slate-900">{activePartnerships.length}</p>
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Active</p>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div className="px-3 text-center">
                <p className="text-lg font-black text-[#FF6B30]">{pendingRequests.length}</p>
                <p className="text-[10px] font-bold text-amber-700 uppercase">Pending</p>
              </div>
            </div>

            <Link
              href="/discovery"
              className="soft-button text-xs sm:text-sm px-6 py-3 flex items-center gap-2 shadow-xs whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              <span>Find New Partner</span>
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT CANVAS (8 Columns): Active Partnerships */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#FF6B30]" />
                <h2 className="text-xl font-bold text-slate-900">Active Partnerships ({activePartnerships.length})</h2>
              </div>
              <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Ready for Learning Rooms
              </span>
            </div>

            {activePartnerships.length === 0 ? (
              <div className="soft-card p-10 text-center space-y-4 bg-white border border-slate-200/80">
                <Handshake className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">No Active Partnerships Connected</p>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Explore global peers on the Discovery page and propose a reciprocal skill exchange!
                  </p>
                </div>
                <Link href="/discovery" className="soft-button text-xs px-6 py-3 inline-flex items-center gap-2 shadow-xs">
                  <Compass className="w-4 h-4" />
                  <span>Explore Skill Discovery</span>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {activePartnerships.map((p) => {
                  const partner = p.requesterId === myUserId ? p.recipient : p.requester;

                  return (
                    <div
                      key={p.id}
                      className="soft-card p-5 bg-white border border-slate-200/80 space-y-4 shadow-xs hover:border-[#FF6B30]/40 transition group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-base shadow-2xs flex-shrink-0">
                            {partner.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              partner.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-base group-hover:text-[#FF6B30] transition">
                                {partner.name}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {partner.username ? `@${partner.username}` : `Connected since ${new Date(p.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        <span className="soft-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2.5 py-0.5 shrink-0">
                          Active Exchange
                        </span>
                      </div>

                      {/* Action Controls */}
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                        <Link
                          href={`/partnerships/${p.id}`}
                          className="soft-button text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <MessageSquare className="w-4 h-4 text-white" />
                          <span>Study Room</span>
                        </Link>
                        <button
                          onClick={() => handleAction(p.id, 'leave')}
                          className="py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition shadow-2xs cursor-pointer"
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
          <div className="lg:col-span-4 space-y-5">
            {pendingRequests.length > 0 && (
              <div className="soft-card bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border border-amber-200/80 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-[#FF6B30]" />
                    <span>Partnership Requests ({pendingRequests.length})</span>
                  </div>
                  <span className="soft-badge bg-white text-amber-800 border-amber-200 text-[10px] font-bold">
                    Action Required
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingRequests.map((p) => {
                    const partner = p.requesterId === myUserId ? p.recipient : p.requester;
                    const isIncoming = p.recipientId === myUserId;

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                            {partner.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              partner.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs">{partner.name}</h3>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {isIncoming ? 'Sent you a 1-on-1 skill swap proposal' : 'Waiting for partner response'}
                            </p>
                          </div>
                        </div>

                        {isIncoming ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleAction(p.id, 'accept')}
                              className="py-2 rounded-xl bg-[#10B981] text-white text-[11px] font-bold hover:bg-emerald-600 transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleAction(p.id, 'reject')}
                              className="py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold hover:bg-red-50 hover:text-red-600 transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5 text-slate-500" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <span className="soft-badge bg-sky-50 text-sky-700 border-sky-200 text-[10px] px-2.5 py-0.5 w-full text-center block">
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
            <div className="soft-card p-5 bg-white space-y-3 shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-[#FF6B30]" />
                <h3 className="text-sm font-bold text-slate-900">Find New Learning Partners</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Use deterministic matching or browse nearby members on the interactive map.
              </p>
              <Link
                href="/discovery"
                className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Go to Discovery</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
