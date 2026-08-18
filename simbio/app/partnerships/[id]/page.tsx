'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { RoomHeader } from '@/components/partnerships/RoomHeader';
import { AudioCallModal } from '@/components/partnerships/AudioCallModal';
import { ReportPartnerModal } from '@/components/partnerships/ReportPartnerModal';
import { ReciprocalRoadmapCard } from '@/components/partnerships/ReciprocalRoadmapCard';
import { ChatMessageItem, type Message } from '@/components/partnerships/ChatMessageItem';
import { MentionDropdown } from '@/components/partnerships/MentionDropdown';
import { TypingIndicatorBubble } from '@/components/partnerships/TypingIndicatorBubble';
import { PeerReviewModal } from '@/components/partnerships/PeerReviewModal';
import { FocusTimerCard } from '@/components/partnerships/FocusTimerCard';
import {
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  Star,
  CheckCircle2,
  Code,
  Handshake,
  Phone,
  CornerDownRight,
  X,
  BookOpen,
  Zap,
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

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function DedicatedPartnershipRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const partnershipId = resolvedParams.id;
  const router = useRouter();

  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [myUserId, setMyUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Real-Time Chat States
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isSimbiAiTyping, setIsSimbiAiTyping] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Right Panel Active Tab State ('ROADMAP' | 'FOCUS')
  const [sidebarTab, setSidebarTab] = useState<'ROADMAP' | 'FOCUS'>('ROADMAP');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFocusModeActive) {
        e.preventDefault();
        e.returnValue = 'Mode Fokus sedang aktif! Apakah Anda yakin ingin keluar?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFocusModeActive]);

  // Audio Call & Review Modal States
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [incomingAudioSession, setIncomingAudioSession] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

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

        const pRes = await apiFetch<{ partnership: Partnership }>(`/partnerships/${partnershipId}`);
        setPartnership(pRes.partnership);

        const mRes = await apiFetch<{ messages: Message[] }>(`/partnerships/${partnershipId}/messages`);
        setMessages(mRes.messages);

        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
          setIsSocketConnected(true);
          socket.emit('join_room', partnershipId);
        });

        socket.on('receive_message', (msg: Message) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) {
              return prev.map((m) => (m.id === msg.id ? msg : m));
            }
            return [...prev, msg];
          });
        });

        socket.on('message_updated', (updatedMsg: Message) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        });

        socket.on('partner_typing', () => setIsPartnerTyping(true));
        socket.on('partner_stop_typing', () => setIsPartnerTyping(false));
        socket.on('simbi_ai_typing', (data: { isTyping: boolean }) => {
          setIsSimbiAiTyping(data.isTyping);
        });

        socket.on('incoming_audio_call', (sess: any) => {
          if (sess && sess.requesterId !== myUserId) {
            setIncomingAudioSession(sess);
            setShowAudioCallModal(true);
          }
        });

        socket.on('disconnect', () => {
          setIsSocketConnected(false);
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', partnershipId);
        socketRef.current.disconnect();
      }
    };
  }, [partnershipId, router]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (val: string) => {
    setNewMessageText(val);

    if (val.endsWith('@') || /@\w*$/.test(val)) {
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }

    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('typing', { partnershipId, userId: myUserId, userName: 'Saya' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { partnershipId, userId: myUserId });
      }, 2000);
    }
  };

  const handleSelectMention = (mentionLabel: string) => {
    setNewMessageText((prev) => prev.replace(/@\w*$/, mentionLabel + ' '));
    setShowMentionDropdown(false);
  };

  const handleSendMessage = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const content = (customContent || newMessageText).trim();
    if (!content) return;

    const currentReplyToId = replyingTo?.id || null;
    setNewMessageText('');
    setReplyingTo(null);
    setShowMentionDropdown(false);

    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('stop_typing', { partnershipId, userId: myUserId });
      socketRef.current.emit('send_message', {
        partnershipId,
        senderId: myUserId,
        content,
        replyToId: currentReplyToId,
      });
    } else {
      try {
        const res = await apiFetch<{ message: Message }>(`/partnerships/${partnershipId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content, replyToId: currentReplyToId }),
        });
        setMessages((prev) => [...prev, res.message]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || !partnership) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat Room Belajar Bareng...</span>
          </div>
        </div>
      </div>
    );
  }

  const partner = partnership.requesterId === myUserId ? partnership.recipient : partnership.requester;

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-[#FF6B30] overflow-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col h-[calc(100vh-70px)] overflow-hidden gap-3">
        {/* Full-Width Compact Top Room Command Header */}
        <RoomHeader
          partner={partner}
          isFocusModeActive={isFocusModeActive}
          isSocketConnected={isSocketConnected}
          onOpenAudioCall={() => setShowAudioCallModal(true)}
          onOpenReview={() => setShowReviewModal(true)}
          onOpenReport={() => setShowReportModal(true)}
        />

        {reviewMsg && (
          <div className="p-2.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-2xs shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{reviewMsg}</span>
          </div>
        )}

        {/* WhatsApp Web Style Full-Height Workspace Canvas */}
        <div className="grid lg:grid-cols-12 gap-4 flex-1 h-full min-h-0 overflow-hidden">
          {/* LEFT PANEL (7 Cols): WhatsApp Web Style Full-Height Live Chat Studio */}
          <div className="lg:col-span-7 soft-card bg-white border border-slate-200/80 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
            {/* Chat Stream Header Bar */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <MessageSquare className="w-4 h-4 text-[#FF6B30]" />
                <span>WebSocket Chat Canvas</span>
              </div>
              <span className="soft-badge bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5">
                {messages.length} Messages
              </span>
            </div>

            {/* Smart Quick Action Prompts Bar */}
            <div className="px-4 py-2 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto text-xs font-bold shrink-0 scrollbar-none">
              <button
                onClick={() => setShowAudioCallModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Mulai Audio Call</span>
              </button>
              <button
                onClick={() => {
                  setSidebarTab('FOCUS');
                  handleSendMessage(undefined, "Ayo kita mulai sesi Belajar Bareng focus 25 menit!");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-[#FF6B30] border border-orange-200 hover:bg-orange-100 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Clock className="w-4 h-4" />
                <span>Focus Session 25m</span>
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "Ini repository kodingan / tautan materi belajar kita!")}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Code className="w-4 h-4" />
                <span>Bagikan Kode</span>
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Star className="w-4 h-4" />
                <span>Review Partner</span>
              </button>
            </div>

            {/* Full-Height Scrollable Chat Messages Container (High Readability text-sm) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Handshake className="w-12 h-12 text-[#FF6B30] mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">WebSocket Room Active!</p>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                      Kirim pesan atau pilih aksi cepat untuk mulai bertukar ilmu dengan {partner.name}!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <ChatMessageItem
                    key={m.id}
                    message={m}
                    myUserId={myUserId}
                    partnerName={partner.name}
                    partnershipId={partnershipId}
                    socket={socketRef.current}
                    onReply={(targetMsg) => setReplyingTo(targetMsg)}
                    onApprovedProposal={() => {
                      apiFetch<{ messages: Message[] }>(`/partnerships/${partnershipId}/messages`).then((res) => {
                        setMessages(res.messages);
                      });
                    }}
                  />
                ))
              )}
              <TypingIndicatorBubble
                isSimbiAiTyping={isSimbiAiTyping}
                isPartnerTyping={isPartnerTyping}
                partnerName={partner.name}
              />
              <div ref={chatBottomRef} />
            </div>

            {/* Replying Preview Bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-sky-50 border-t border-sky-200 flex items-center justify-between text-xs font-bold text-slate-900 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CornerDownRight className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-sky-700 font-bold">
                      Membalas {replyingTo.senderType === 'SIMBI_AI' ? 'Simbi AI' : replyingTo.senderId === myUserId ? 'Saya' : partner.name}:
                    </span>{' '}
                    <span className="text-slate-600 truncate font-medium">{replyingTo.content}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-sky-100 rounded-lg text-slate-400 hover:text-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Anchored Bottom Input Form (High Readability text-sm) */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2.5 relative shrink-0">
              <div className="flex-1 relative">
                {showMentionDropdown && !isFocusModeActive && (
                  <MentionDropdown
                    partnerName={partner.name}
                    partnerUsername={partner.username}
                    onSelectMention={handleSelectMention}
                  />
                )}
                <input
                  type="text"
                  required
                  disabled={isFocusModeActive}
                  value={newMessageText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={
                    isFocusModeActive
                      ? '🔒 Mode Fokus Aktif (Distraction-Free Mode). Chat dikunci hingga fokus selesai...'
                      : 'Tulis pesan atau ketik @ untuk mention @SimbiAI...'
                  }
                  className="w-full px-4 py-3 text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={isFocusModeActive || !newMessageText.trim()}
                className="soft-button px-7 text-sm font-bold flex items-center gap-2 h-[46px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-2xs"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Kirim</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL (5 Cols): Instant Access Tabbed Collaboration Hub (No Scroll Required!) */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0 space-y-3">
            {/* Header Tab Switcher (Instant 1-Click Access for Focus & Roadmap) */}
            <div className="p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-2 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarTab('ROADMAP')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  sidebarTab === 'ROADMAP'
                    ? 'bg-[#FF6B30] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Roadmap & Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('FOCUS')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 relative ${
                  sidebarTab === 'FOCUS'
                    ? 'bg-[#FF6B30] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Focus Session (Sync)</span>
                {isFocusModeActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute right-3 top-3" />
                )}
              </button>
            </div>

            {/* Tabbed Content Container (Fills Full Height, Zero Scroll Needed) */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
              {sidebarTab === 'ROADMAP' ? (
                <ReciprocalRoadmapCard
                  partnershipId={partnershipId}
                  myUserId={myUserId}
                  partnerName={partner?.name || 'Partner'}
                  socket={socketRef.current}
                />
              ) : (
                <FocusTimerCard
                  partnershipId={partnershipId}
                  myUserId={myUserId}
                  partnerName={partner?.name || 'Partner'}
                  socket={socketRef.current}
                  onFocusStateChange={(isActive) => setIsFocusModeActive(isActive)}
                />
              )}

              {/* Simbi Mascot Advice Bubble */}
              <SimbiAvatar
                state="happy"
                message="Gunakan tab di atas untuk berganti antara Checklist Topik & Pomodoro Focus Timer tanpa perlu scroll!"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAudioCallModal && (
        <AudioCallModal
          partnershipId={partnershipId}
          partner={{ id: partner.id, name: partner.name, avatarUrl: partner.avatarUrl }}
          myUserId={myUserId}
          socket={socketRef.current}
          incomingSession={incomingAudioSession}
          onClose={() => {
            setShowAudioCallModal(false);
            setIncomingAudioSession(null);
          }}
        />
      )}

      {showReviewModal && partner && (
        <PeerReviewModal
          partnershipId={partnershipId}
          partnerName={partner.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={(msg) => setReviewMsg(msg)}
        />
      )}

      {showReportModal && partner && (
        <ReportPartnerModal
          partnershipId={partnershipId}
          partnerId={partner.id}
          partnerName={partner.name}
          onClose={() => setShowReportModal(false)}
          onSuccess={(msg) => setReviewMsg(msg)}
        />
      )}
    </div>
  );
}
