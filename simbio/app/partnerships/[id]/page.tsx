'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { RoomHeader } from '@/components/partnerships/RoomHeader';
import { ChatMessageItem, Message } from '@/components/partnerships/ChatMessageItem';
import { TypingIndicatorBubble } from '@/components/partnerships/TypingIndicatorBubble';
import { MentionDropdown } from '@/components/partnerships/MentionDropdown';
import { ReciprocalRoadmapCard } from '@/components/partnerships/ReciprocalRoadmapCard';
import { FocusTimerCard } from '@/components/partnerships/FocusTimerCard';
import { MobileRoomSidebarModal } from '@/components/partnerships/MobileRoomSidebarModal';
import { AudioCallModal, AudioSessionData } from '@/components/partnerships/AudioCallModal';
import { PeerReviewModal } from '@/components/partnerships/PeerReviewModal';
import { ReportPartnerModal } from '@/components/partnerships/ReportPartnerModal';
import {
  Send,
  Sparkles,
  BookOpen,
  Clock,
  Handshake,
  CheckCircle2,
  CornerDownRight,
  X,
} from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

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
  status: string;
  requester: UserSummary;
  recipient: UserSummary;
}

export default function PartnershipRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partnershipId } = use(params);
  const router = useRouter();

  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [newMessageText, setNewMessageText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [isSimbiAiTyping, setIsSimbiAiTyping] = useState<boolean>(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState<boolean>(false);

  const [sidebarTab, setSidebarTab] = useState<'ROADMAP' | 'FOCUS'>('ROADMAP');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState<boolean>(false);

  const [showAudioCallModal, setShowAudioCallModal] = useState<boolean>(false);
  const [incomingAudioSession, setIncomingAudioSession] = useState<AudioSessionData | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

        const [partRes, msgRes] = await Promise.all([
          apiFetch<{ partnership: Partnership }>(`/partnerships/${partnershipId}`),
          apiFetch<{ messages: Message[] }>(`/partnerships/${partnershipId}/messages`),
        ]);

        setPartnership(partRes.partnership);
        setMessages(msgRes.messages);

        // Mark messages as read upon entering study room
        try {
          apiFetch(`/partnerships/${partnershipId}/read`, { method: 'POST' });
        } catch {
          // ignore
        }

        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          setIsSocketConnected(true);
          socket.emit('join_room', partnershipId);
          socket.emit('mark_read', { partnershipId, readerId: meRes.user.id });
        });

        socket.on('receive_message', (msg: Message) => {
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.senderId !== meRes.user.id) {
            try {
              apiFetch(`/partnerships/${partnershipId}/read`, { method: 'POST' });
              socket.emit('mark_read', { partnershipId, readerId: meRes.user.id });
            } catch {
              // ignore
            }
          }
        });

        socket.on('new_message', (msg: Message) => {
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.senderId !== meRes.user.id) {
            try {
              apiFetch(`/partnerships/${partnershipId}/read`, { method: 'POST' });
              socket.emit('mark_read', { partnershipId, readerId: meRes.user.id });
            } catch {
              // ignore
            }
          }
        });

        socket.on('messages_read', (data: { partnershipId: string; readerId: string; readAt: string }) => {
          if (data.partnershipId === partnershipId && data.readerId !== meRes.user.id) {
            setMessages((prev) =>
              prev.map((m) => (m.senderId === meRes.user.id ? { ...m, isRead: true, readAt: data.readAt } : m))
            );
          }
        });

        socket.on('user_typing', (data: { userId: string }) => {
          if (data.userId !== meRes.user.id) setIsPartnerTyping(true);
        });

        socket.on('user_stopped_typing', (data: { userId: string }) => {
          if (data.userId !== meRes.user.id) setIsPartnerTyping(false);
        });

        socket.on('partner_typing', (data: { userId: string }) => {
          if (data.userId !== meRes.user.id) setIsPartnerTyping(true);
        });

        socket.on('partner_stop_typing', (data: { userId: string }) => {
          if (data.userId !== meRes.user.id) setIsPartnerTyping(false);
        });

        socket.on('simbi_thinking', (data: { partnershipId: string; status: boolean }) => {
          if (data.partnershipId === partnershipId) setIsSimbiAiTyping(data.status);
        });

        socket.on('incoming_audio_call', (data: { session: AudioSessionData }) => {
          setIncomingAudioSession(data.session);
          setShowAudioCallModal(true);
        });

        socket.on('disconnect', () => setIsSocketConnected(false));
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) router.push('/login');
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
    setShowMentionDropdown(val.endsWith('@') || /@\w*$/.test(val));

    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('typing', { partnershipId, userId: myUserId, userName: 'Me' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { partnershipId, userId: myUserId });
      }, 2000);
    }
  };

  const handleSelectMention = (mentionLabel: string) => {
    setNewMessageText((prev) => prev.replace(/@\w*$/, mentionLabel + ' '));
    setShowMentionDropdown(false);
    inputRef.current?.focus();
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
      <div className="h-[100dvh] flex flex-col bg-[#F8FAFC]">
        <Navbar hideBottomNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#FF6B30] font-bold text-sm animate-pulse flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Loading Study Room...</span>
          </div>
        </div>
      </div>
    );
  }

  const partner = partnership.requesterId === myUserId ? partnership.recipient : partnership.requester;

  return (
    <div className="h-[100dvh] w-full max-w-full flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* Global Top Navbar with Bottom Nav Hidden in Chat Room */}
      <Navbar hideBottomNav />

      {/* Compact Room Header Bar */}
      <RoomHeader
        partner={partner}
        isFocusModeActive={isFocusModeActive}
        isSocketConnected={isSocketConnected}
        onOpenAudioCall={() => setShowAudioCallModal(true)}
        onOpenReview={() => setShowReviewModal(true)}
        onOpenReport={() => setShowReportModal(true)}
        onToggleSidebar={() => setIsMobileSidebarOpen((p) => !p)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Review Success Banner */}
      {reviewMsg && (
        <div className="mx-3 mt-1.5 p-2 text-[11px] text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold shadow-2xs shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{reviewMsg}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* MAIN WORKSPACE CANVAS (Full screen on mobile, 65/35 on desktop)   */}
      {/* ================================================================ */}
      <div className="flex-1 min-h-0 w-full max-w-full flex flex-col lg:flex-row gap-4 overflow-hidden lg:p-4 lg:max-w-[1700px] lg:mx-auto">
        {/* ============================================================== */}
        {/* CHAT CANVAS (Full screen on mobile, 65% on desktop)             */}
        {/* ============================================================== */}
        <div className="w-full lg:w-[65%] flex flex-col min-w-0 min-h-0 overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200/80 lg:shadow-xs bg-white">
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 sm:px-3 py-2 space-y-1 bg-slate-50/30 min-h-0 w-full">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Handshake className="w-9 h-9 text-[#FF6B30] mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
                <p className="text-xs font-bold text-slate-900">Room Active</p>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                  Say hi to {partner.name} to start exchanging skills!
                </p>
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
            <div className="px-3 py-1 bg-sky-50 border-t border-sky-200 flex items-center gap-2 shrink-0">
              <CornerDownRight className="w-3 h-3 text-sky-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-sky-700">
                  {replyingTo.senderType === 'SIMBI_AI' ? 'Simbi AI' : replyingTo.senderId === myUserId ? 'Me' : partner.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium ml-1 truncate block">{replyingTo.content}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Mention Dropdown */}
          <div className="relative shrink-0 w-full">
            {showMentionDropdown && !isFocusModeActive && (
              <div className="absolute bottom-full left-0 w-full px-2 pb-1 z-30">
                <MentionDropdown
                  partnerName={partner.name}
                  partnerUsername={partner.username}
                  onSelectMention={handleSelectMention}
                />
              </div>
            )}
          </div>

          {/* Anchored Bottom Chat Input Form with Safe Area Padding */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-3 bg-white border-t border-slate-200/90 flex items-center gap-1.5 shrink-0 shadow-xs z-10 w-full pb-[max(0.6rem,env(safe-area-inset-bottom))]"
          >
            <input
              ref={inputRef}
              type="text"
              disabled={isFocusModeActive}
              value={newMessageText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                isFocusModeActive
                  ? 'Focus mode active — chat locked...'
                  : `Message ${partner.name} or type @...`
              }
              className="flex-1 min-w-0 h-9 sm:h-10 px-3 text-xs sm:text-sm bg-slate-100 rounded-xl border border-transparent font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isFocusModeActive || !newMessageText.trim()}
              className="h-9 sm:h-10 w-9 sm:w-10 rounded-xl bg-[#FF6B30] text-white flex items-center justify-center shadow-2xs hover:bg-[#E0531A] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP RIGHT PANEL (35% on desktop): Roadmap & Focus           */}
        {/* ============================================================== */}
        <div className="hidden lg:flex lg:w-[35%] flex-col min-w-0 min-h-0 h-full space-y-2.5 overflow-hidden">
          {/* Tab Switcher */}
          <div className="p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-2 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarTab('ROADMAP')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${sidebarTab === 'ROADMAP' ? 'bg-[#FF6B30] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Roadmap & Checklist</span>
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('FOCUS')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 relative cursor-pointer ${sidebarTab === 'FOCUS' ? 'bg-[#FF6B30] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Focus Session</span>
              {isFocusModeActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute right-2 top-2" />
              )}
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {sidebarTab === 'ROADMAP' ? (
              <ReciprocalRoadmapCard
                partnershipId={partnershipId}
                myUserId={myUserId}
                partnerName={partner?.name || 'Partner'}
                socket={socketRef.current}
              />
            ) : (
              <div className="h-full overflow-y-auto space-y-3">
                <FocusTimerCard
                  partnershipId={partnershipId}
                  myUserId={myUserId}
                  partnerName={partner?.name || 'Partner'}
                  socket={socketRef.current}
                  onFocusStateChange={(isActive) => setIsFocusModeActive(isActive)}
                />
                <SimbiAvatar state="happy" message="Pomodoro focus session helps you and your partner stay synchronized!" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal (Gesture Draggable & Expandable) */}
      <MobileRoomSidebarModal
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        isFocusModeActive={isFocusModeActive}
        partnershipId={partnershipId}
        myUserId={myUserId}
        partnerName={partner?.name || 'Partner'}
        socket={socketRef.current}
        onFocusStateChange={(isActive) => setIsFocusModeActive(isActive)}
      />

      {/* Dialog Modals */}
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
          partnerId={partner.id}
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
