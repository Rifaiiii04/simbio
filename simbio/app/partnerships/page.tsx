'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { GlowCard } from '@/components/ui/GlowCard';
import {
  Handshake,
  MessageSquare,
  UserCheck,
  UserX,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface UserSummary {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
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
        action === 'accept' ? 'Partnership accepted!' : action === 'reject' ? 'Request declined.' : 'Partnership ended.'
      );
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF7A30] font-black text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading active exchange partnerships...</span>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = partnerships.filter((p) => p.status === 'PENDING');
  const activePartnerships = partnerships.filter((p) => p.status === 'ACCEPTED');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Title & Discovery Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Your Skill Exchange Partnerships</h1>
            <p className="text-xs text-gray-700 font-bold mt-1">
              Connect, enter dedicated Belajar Bareng collaboration rooms, chat via WebSockets, and track joint progress.
            </p>
          </div>
          <Link
            href="/discovery"
            className="neo-button text-xs px-5 py-2.5 flex items-center gap-2 w-fit"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>+ Find New Partner</span>
          </Link>
        </div>

        {/* Simbi Companion Speech Bubble */}
        <SimbiAvatar
          state="happy"
          message="Enter your dedicated Belajar Bareng Room to chat in real-time, build co-creation projects, and hold focus sessions!"
        />

        {statusMessage && (
          <div className="p-3 text-xs text-[#0F172A] bg-[#84CC16] rounded-xl border-2 border-[#0F172A] flex items-center gap-2 font-black shadow-[3px_3px_0px_0px_#0F172A]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="neo-box bg-[#FACC15] p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
            <div className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-wider border-b-2 border-[#0F172A] pb-2">
              <Clock className="w-4 h-4 text-[#0F172A]" />
              <span>Pending Connection Requests ({pendingRequests.length})</span>
            </div>
            <div className="grid gap-3">
              {pendingRequests.map((p) => {
                const partner = p.requesterId === myUserId ? p.recipient : p.requester;
                const isIncoming = p.recipientId === myUserId;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white border-2 border-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#0F172A]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF7A30] border-2 border-[#0F172A] text-white font-black flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_#0F172A]">
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-[#0F172A] text-sm">{partner.name}</h3>
                        <p className="text-[11px] text-gray-600 font-bold">
                          {isIncoming ? 'Sent you a partnership invitation' : 'Waiting for partner response'}
                        </p>
                      </div>
                    </div>

                    {isIncoming ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(p.id, 'accept')}
                          className="px-4 py-2 rounded-xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-emerald-400 transition shadow-[2px_2px_0px_0px_#0F172A] flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          className="px-3.5 py-2 rounded-xl bg-white text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_#0F172A] flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5 text-red-600" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="neo-badge bg-[#06B6D4] text-white text-[10px] px-3 py-1">
                        Pending Partner Acceptance
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Partnerships Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#0F172A] pb-3">
            <Handshake className="w-5 h-5 text-[#FF7A30]" />
            <h2 className="text-xl font-black text-[#0F172A]">Active Exchange Partnerships ({activePartnerships.length})</h2>
          </div>

          {activePartnerships.length === 0 ? (
            <div className="neo-box p-10 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <p className="text-sm font-black text-[#0F172A]">No active partnerships connected yet.</p>
              <p className="text-xs text-gray-600 font-bold max-w-md mx-auto">
                Explore global learners in Discovery and connect for reciprocal skill exchange!
              </p>
              <Link href="/discovery" className="neo-button text-xs px-5 py-2.5 inline-flex items-center gap-1.5">
                <span>Explore Skill Discovery</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {activePartnerships.map((p) => {
                const partner = p.requesterId === myUserId ? p.recipient : p.requester;

                return (
                  <GlowCard key={p.id}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#FF7A30] border-2.5 border-[#0F172A] text-white font-black flex items-center justify-center text-base shadow-[3px_3px_0px_0px_#0F172A]">
                            {partner.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              partner.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-black text-[#0F172A] text-base">{partner.name}</h3>
                            <p className="text-[10px] text-gray-600 font-bold">
                              Partner since {new Date(p.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className="neo-badge bg-[#84CC16] text-[#0F172A] text-[10px] px-2.5 py-0.5">
                          Active Exchange
                        </span>
                      </div>

                      {/* Action Controls: Enter Dedicated Room Page + End Exchange */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-[#0F172A]">
                        <Link
                          href={`/partnerships/${p.id}`}
                          className="neo-button text-xs py-2.5 flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4 text-white" />
                          <span>Room Belajar Bareng →</span>
                        </Link>
                        <button
                          onClick={() => handleAction(p.id, 'leave')}
                          className="py-2.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] text-xs font-black hover:bg-red-50 hover:text-red-600 transition shadow-[2px_2px_0px_0px_#0F172A]"
                        >
                          End Exchange
                        </button>
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
