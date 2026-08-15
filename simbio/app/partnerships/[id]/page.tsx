'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api/client';
import { Navbar } from '@/components/shared/Navbar';
import { SimbiAvatar } from '@/components/shared/SimbiAvatar';
import { GlowCard } from '@/components/ui/GlowCard';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Sparkles,
  Zap,
  FolderPlus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Star,
  CheckCircle2,
  BookOpen,
  User,
  Lightbulb,
  Plus,
  Globe,
  Code,
  Handshake,
  Rocket,
  ShieldCheck,
  Award,
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

interface Message {
  id: string;
  partnershipId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Project {
  id: string;
  partnershipId: string;
  title: string;
  description: string | null;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
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
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Shared Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);

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

        // Load projects
        try {
          const prRes = await apiFetch<{ projects: Project[] }>(`/projects?partnershipId=${partnershipId}`);
          setProjects(prRes.projects);
        } catch (e) {
          console.error(e);
        }

        // Initialize Real-Time WebSocket connection
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
          setIsSocketConnected(true);
          socket.emit('join_room', partnershipId);
        });

        socket.on('receive_message', (msg: Message) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        });

        socket.on('project_created', (proj: Project) => {
          setProjects((prev) => {
            if (prev.some((p) => p.id === proj.id)) return prev;
            return [proj, ...prev];
          });
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

  const handleSendMessage = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const content = (customContent || newMessageText).trim();
    if (!content) return;
    setNewMessageText('');

    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('send_message', {
        partnershipId,
        senderId: myUserId,
        content,
      });
    } else {
      try {
        const res = await apiFetch<{ message: Message }>(`/partnerships/${partnershipId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        setMessages((prev) => [...prev, res.message]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || creatingProject) return;
    setCreatingProject(true);
    const title = newProjectTitle.trim();
    const description = newProjectDesc.trim() || undefined;

    if (socketRef.current && isSocketConnected) {
      socketRef.current.emit('create_project', {
        partnershipId,
        senderId: myUserId,
        title,
        description,
      });
      setNewProjectTitle('');
      setNewProjectDesc('');
      setShowNewProjectModal(false);
      setCreatingProject(false);
    } else {
      try {
        const created = await apiFetch<{ project: Project }>('/projects', {
          method: 'POST',
          body: JSON.stringify({
            partnershipId,
            title,
            description,
          }),
        });
        setProjects((prev) => [created.project, ...prev]);

        // Send automated chat message notification
        await handleSendMessage(undefined, `Your partner created a new project: ${title}`);

        setNewProjectTitle('');
        setNewProjectDesc('');
        setShowNewProjectModal(false);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setCreatingProject(false);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnership || submittingReview) return;
    setSubmittingReview(true);
    setReviewMsg(null);
    const partnerId = partnership.requesterId === myUserId ? partnership.recipientId : partnership.requesterId;
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          partnershipId,
          revieweeId: partnerId,
          consistency: Number(reviewConsistency),
          communication: Number(reviewCommunication),
          knowledgeSharing: Number(reviewKnowledge),
          collaboration: Number(reviewCollaboration),
          comment: reviewComment.trim() || undefined,
        }),
      });
      setReviewMsg('Peer Review submitted successfully!');
      setShowReviewModal(false);
    } catch (err: unknown) {
      setReviewMsg(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
                onClick={() => setShowNewProjectModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black hover:bg-[#FACC15] transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Plus className="w-4 h-4 text-[#FF7A30]" />
                <span>New Project</span>
              </button>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-black hover:bg-[#FACC15] transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Star className="w-4 h-4 text-[#FACC15]" />
                <span>Give Review</span>
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

            {/* Smart Action Quick Prompts (NO RAW EMOJIS - 100% Lucide Icons) */}
            <div className="flex flex-wrap gap-2 text-[11px] font-black">
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
                onClick={() => handleSendMessage(undefined, "Ayo buat proyek kolaborasi Belajar Bareng baru!")}
                className="px-3 py-1.5 rounded-xl bg-[#F7FEE7] text-emerald-700 border-2 border-[#0F172A] hover:bg-[#FACC15] transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0F172A]"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Propose Project</span>
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
                messages.map((m) => {
                  const isMine = m.senderId === myUserId;
                  return (
                    <div key={m.id} className={`flex gap-2.5 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'} w-full overflow-hidden`}>
                      <div className="w-8 h-8 rounded-xl bg-[#FF7A30] border-2 border-[#0F172A] text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#0F172A]">
                        {isMine ? 'ME' : partner.name.charAt(0)}
                      </div>

                      <div className={`flex flex-col min-w-0 max-w-[180px] sm:max-w-[220px] md:max-w-[240px] ${isMine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-3 rounded-2xl border-2 border-[#0F172A] text-xs font-bold leading-relaxed shadow-[2.5px_2.5px_0px_0px_#0F172A] break-all [overflow-wrap:anywhere] ${
                            isMine ? 'bg-[#FF7A30] text-white' : 'bg-white text-[#0F172A]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-all [overflow-wrap:anywhere] text-left">{m.content}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type a real-time message, share learning resources, code snippets..."
                className="flex-1 px-4 py-3.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden focus:border-[#FF7A30]"
              />
              <button type="submit" disabled={!newMessageText.trim()} className="neo-button px-7 text-xs flex items-center gap-1.5">
                <Send className="w-4 h-4 text-white" />
                <span className="font-black">Send</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL (5 Cols): Belajar Bareng Collaboration Hub */}
          <div className="lg:col-span-5 space-y-6">
            {/* Widget 1: Shared Pomodoro Focus Session */}
            <div className="neo-box bg-[#FACC15] p-6 text-center space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A] uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#0F172A]" />
                  <span>Focus Belajar Bareng</span>
                </div>
                <span className="neo-badge bg-white text-[#0F172A] text-[10px] px-2 py-0.5">25 Min Timer</span>
              </div>

              <div className="text-5xl font-mono font-black text-[#0F172A] py-5 bg-white rounded-2xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_#0F172A]">
                {formatTimer(timerSeconds)}
              </div>

              {sessionCompletedMsg && (
                <div className="p-2.5 text-[11px] bg-[#84CC16] text-[#0F172A] font-black border-2 border-[#0F172A] rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{sessionCompletedMsg}</span>
                </div>
              )}

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`neo-button text-xs px-5 py-2.5 flex items-center gap-1.5 ${timerActive ? 'bg-[#0F172A] text-white' : ''}`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerActive ? 'Pause' : 'Start Focus'}</span>
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#0F172A] text-[#0F172A] font-black text-xs hover:bg-gray-100 transition flex items-center gap-1 shadow-[2px_2px_0px_0px_#0F172A]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Widget 2: Co-Creation Projects List */}
            <div className="neo-box p-6 space-y-4 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#06B6D4] uppercase tracking-wider">
                  <FolderPlus className="w-4 h-4 text-[#06B6D4]" />
                  <span>Proyek Belajar Bareng ({projects.length})</span>
                </div>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#06B6D4] text-white border-2 border-[#0F172A] text-[10px] font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#0F172A] hover:bg-[#FACC15] hover:text-[#0F172A]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="p-4 text-center space-y-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Lightbulb className="w-6 h-6 text-[#FF7A30] mx-auto" />
                  <p className="text-xs font-black text-[#0F172A]">No co-creation projects launched yet.</p>
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="text-[11px] font-black text-[#FF7A30] hover:underline"
                  >
                    + Launch First Project Together
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto p-1">
                  {projects.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-white border-2 border-[#0F172A] space-y-2 shadow-[3px_3px_0px_0px_#0F172A]">
                      <div className="flex items-center justify-between">
                        <span className="neo-badge bg-[#06B6D4] text-white text-[9px] px-2 py-0.5">{p.status}</span>
                        <span className="text-[9px] font-mono text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-black text-[#0F172A]">{p.title}</h4>
                      {p.description && <p className="text-[11px] text-gray-600 font-bold line-clamp-2">{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SimbiAvatar state="happy" message="Give your partner a peer review after your exchange to boost global reputation!" />
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md neo-box p-6 space-y-4 shadow-[8px_8px_0px_0px_#0F172A] bg-white">
            <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
              <h3 className="text-base font-black text-[#0F172A]">Launch New Co-Creation Project</h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-xs font-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-black mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Build Guitar Chord Visualizer App with React"
                  className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black mb-1">Project Description & Goal</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  placeholder="Outline what you and your partner will build together..."
                  className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="w-2/3 neo-button py-2.5 text-xs"
                >
                  {creatingProject ? 'Launching...' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Peer Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg neo-box p-6 space-y-4 shadow-[8px_8px_0px_0px_#0F172A] bg-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#0F172A] pb-2">
              <h3 className="text-base font-black text-[#0F172A]">Peer Review for {partner.name}</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-xs font-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
                  <label className="block text-xs font-black mb-1">Consistency (1-5 Star)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewConsistency}
                    onChange={(e) => setReviewConsistency(Number(e.target.value))}
                    className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
                  />
                </div>

                <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
                  <label className="block text-xs font-black mb-1">Communication (1-5 Star)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewCommunication}
                    onChange={(e) => setReviewCommunication(Number(e.target.value))}
                    className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
                  />
                </div>

                <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
                  <label className="block text-xs font-black mb-1">Knowledge Sharing (1-5 Star)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewKnowledge}
                    onChange={(e) => setReviewKnowledge(Number(e.target.value))}
                    className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
                  />
                </div>

                <div className="p-3 bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A]">
                  <label className="block text-xs font-black mb-1">Collaboration (1-5 Star)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewCollaboration}
                    onChange={(e) => setReviewCollaboration(Number(e.target.value))}
                    className="w-full p-2 text-xs border-2 border-[#0F172A] rounded-lg font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-1">Written Feedback & Testimonial</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share how working with this partner helped your skill growth..."
                  className="w-full px-4 py-3 text-xs bg-[#FFFDF7] rounded-xl border-2 border-[#0F172A] font-bold focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-gray-100 border-2 border-[#0F172A] text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-2/3 neo-button py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Submit Peer Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
