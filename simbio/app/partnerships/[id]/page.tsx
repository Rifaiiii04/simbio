'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
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
  ArrowLeft,
  Sparkles,
  Zap,
  Clock,
  Star,
  CheckCircle2,
  Globe,
  Code,
  Handshake,
  ShieldCheck,
  Phone,
  ShieldAlert,
  CornerDownRight,
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
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Call Modal State
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [incomingAudioSession, setIncomingAudioSession] = useState<any>(null);

  // Shared Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);

  // Report Partner Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  // Peer Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewConsistency, setReviewConsistency] = useState(5);
  const [reviewCommunication, setReviewCommunication] = useState(5);
  const [reviewKnowledge, setReviewKnowledge] = useState(5);
  const [reviewCollaboration, setReviewCollaboration] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
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

        // Load initial chat messages
        const mRes = await apiFetch<{ messages: Message[] }>(`/partnerships/${partnershipId}/messages`);
        setMessages(mRes.messages);

        // Initialize Real-Time WebSocket connection
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

  // Pomodoro Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      setSessionCompletedMsg('25-Minute Focus Session Completed! Logged to DB.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

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

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !partnership) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF7]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#FF7A30] font-black text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading Belajar Bareng workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  const partner = partnership.requesterId === myUserId ? partnership.recipient : partnership.requester;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#0F172A] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col">
        {/* Top Room Command Header */}
        <div className="neo-box bg-[#FFFDF7] p-4 sm:p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/partnerships"
                className="w-10 h-10 rounded-xl bg-white border-2 border-[#0F172A] flex items-center justify-center text-[#0F172A] hover:bg-[#FACC15] transition shadow-[2.5px_2.5px_0px_0px_#0F172A]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF7A30] border-3 border-[#0F172A] text-white font-black flex items-center justify-center text-lg shadow-[3px_3px_0px_0px_#0F172A]">
                  {partner.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    partner.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{partner.name}</h1>
                    <span className="neo-badge bg-[#84CC16] text-[#0F172A] text-[10px] px-2.5 py-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Partner</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    {partner.username && <span className="text-[#FF7A30] font-black">@{partner.username}</span>}
                    {partner.country && (
                      <span className="neo-badge bg-[#06B6D4] text-white px-2 py-0.5 text-[9px] flex items-center gap-1">
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
                className={`neo-badge text-xs px-3 py-1.5 font-black flex items-center gap-1.5 ${
                  isSocketConnected ? 'bg-[#84CC16] text-[#0F172A]' : 'bg-[#FACC15] text-[#0F172A]'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isSocketConnected ? 'Real-Time WebSocket Stream' : 'Connecting WebSocket...'}</span>
              </span>

              <button
                onClick={() => setShowAudioCallModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#84CC16] text-[#0F172A] border-2 border-[#0F172A] text-xs font-black hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Phone className="w-4 h-4" />
                <span>Audio Call</span>
              </button>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black hover:bg-[#FACC15] transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Star className="w-4 h-4 text-[#FACC15]" />
                <span>Give Review</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black text-red-600 hover:bg-red-500 hover:text-white transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Report Partner</span>
              </button>
            </div>
          </div>
        </div>

        {reviewMsg && (
          <div className="p-3.5 text-xs text-[#0F172A] bg-[#84CC16] rounded-xl border-2 border-[#0F172A] flex items-center gap-2 font-black shadow-[3px_3px_0px_0px_#0F172A]">
            <CheckCircle2 className="w-4 h-4" />
            <span>{reviewMsg}</span>
          </div>
        )}

        {/* Split Screen Workspace Layout: Left (Chat Stream) vs Right (Collaboration Hub) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL (7 Cols): Primary Real-Time Live Chat Stream */}
          <div className="lg:col-span-7 neo-box bg-white p-6 space-y-4 shadow-[8px_8px_0px_0px_#0F172A] flex flex-col min-h-[620px]">
            {/* Chat Stream Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0F172A]">
                <MessageSquare className="w-4.5 h-4.5 text-[#FF7A30]" />
                <span>Real-Time WebSocket Obrolan Belajar</span>
              </div>
              <span className="neo-badge bg-[#FACC15] text-[#0F172A] text-[10px] px-2.5 py-0.5">
                {messages.length} Messages
              </span>
            </div>

            {/* Smart Action Quick Prompts */}
            <div className="flex flex-wrap gap-2 text-[11px] font-black">
              <button
                onClick={() => setShowAudioCallModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#F7FEE7] text-emerald-800 border-2 border-[#0F172A] hover:bg-[#FACC15] transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Start Audio Call</span>
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "Ayo kita mulai sesi Belajar Bareng focus 25 menit!")}
                className="px-3 py-1.5 rounded-xl bg-[#FFF5EF] text-[#FF7A30] border-2 border-[#0F172A] hover:bg-[#FACC15] transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Focus Session</span>
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "Ini repository kodingan / tautan materi belajar kita!")}
                className="px-3 py-1.5 rounded-xl bg-[#F0F9FF] text-[#06B6D4] border-2 border-[#0F172A] hover:bg-[#FACC15] transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Share Code</span>
              </button>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border-2 border-[#0F172A] hover:bg-[#FACC15] transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Give Review</span>
              </button>
            </div>

            {/* Message Log Box */}
            <div className="flex-1 overflow-y-auto space-y-3.5 p-4 bg-[#FFFDF7] rounded-2xl border-2 border-[#0F172A] min-h-[380px] max-h-[480px]">
              {messages.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Handshake className="w-12 h-12 text-[#FF7A30] mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
                  <div className="space-y-1">
                    <p className="text-base font-black text-[#0F172A]">Real-Time Chat Stream Initialized!</p>
                    <p className="text-xs text-gray-600 font-bold max-w-xs mx-auto">
                      Send a message or click one of the quick action buttons above to start exchanging knowledge with {partner.name}!
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
              <div className="flex items-center justify-between p-2.5 bg-[#ECFEFF] border-2 border-[#06B6D4] rounded-xl text-xs font-bold text-[#0F172A] shadow-[2px_2px_0px_0px_#06B6D4]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CornerDownRight className="w-4 h-4 text-[#06B6D4] shrink-0" />
                  <div className="truncate">
                    <span className="text-[#06B6D4] font-black">
                      Membalas {replyingTo.senderType === 'SIMBI_AI' ? 'Simbi AI' : replyingTo.senderId === myUserId ? 'Saya' : partner.name}:
                    </span>{' '}
                    <span className="text-gray-600 truncate">{replyingTo.content}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-cyan-100 rounded-lg text-gray-500 hover:text-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Form Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 relative">
              <div className="flex-1 relative">
                {showMentionDropdown && (
                  <MentionDropdown
                    partnerName={partner.name}
                    partnerUsername={partner.username}
                    onSelectMention={handleSelectMention}
                  />
                )}
                <input
                  type="text"
                  required
                  value={newMessageText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Tulis pesan atau ketik @ untuk mention @SimbiAI..."
                  className="w-full px-4 py-3.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
                />
              </div>
              <button type="submit" disabled={!newMessageText.trim()} className="neo-button px-7 text-xs flex items-center gap-1.5 h-[48px]">
                <Send className="w-4 h-4 text-white" />
                <span className="font-black">Send</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL (5 Cols): Belajar Bareng Collaboration Hub */}
          <div className="lg:col-span-5 space-y-6">
            {/* Widget: Reciprocal Learning Topics Roadmap & Checklist */}
            <ReciprocalRoadmapCard
              partnershipId={partnershipId}
              myUserId={myUserId}
              partnerName={partner?.name || 'Partner'}
              socket={socketRef.current}
            />

            {/* Widget: Shared Pomodoro Focus Session */}
            <FocusTimerCard />

            <SimbiAvatar state="happy" message="Start an Audio Call session or AI Topic Exchange to elevate your reciprocal skill growth!" />
          </div>
        </div>
      </main>

      {/* Audio Call Modal */}
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

      {/* Peer Review Modal */}
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
